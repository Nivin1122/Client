const mongoose = require('mongoose');
const Product = require("../../models/product/productModel");
const Variant = require("../../models/product/variantModel");
const Review = require("../../models/review/reviewModel")
const SizeVariant = require("../../models/product/sizesVariantModel");
const asyncHandler = require("express-async-handler");
const { checkActiveOffers } = require("../../admin/helper/offerHelpers");

const getAllProducts = asyncHandler(async (req, res) => {
  try {
    const {
      page = 1,
      limit = 12,
      search = "",
      categories = "",
      minPrice = 0,
      maxPrice = 10000,
      sortBy = 'newest'
    } = req.query;
    
    const skip = (page - 1) * limit;

    // Build the base match query
    let matchQuery = {
      isDeleted: false,
    };

    // Add search filter
    if (search && search.trim()) {
      matchQuery.$or = [
        { name: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
        { material: { $regex: search, $options: "i" } },
        { pattern: { $regex: search, $options: "i" } },
        { gender: { $regex: search, $options: "i" } }
      ];
    }

    // Add category filter from URL params or categories filter
    if (req.query.category && mongoose.Types.ObjectId.isValid(req.query.category)) {
      matchQuery.category = new mongoose.Types.ObjectId(req.query.category);
    } else if (categories && categories.length > 0) {
      const categoryIds = categories.split(',')
        .map(id => mongoose.Types.ObjectId.isValid(id) ? new mongoose.Types.ObjectId(id) : null)
        .filter(id => id !== null);
      if (categoryIds.length > 0) {
        matchQuery.category = { $in: categoryIds };
      }
    }

    // Build aggregation pipeline
    const pipeline = [
      { $match: matchQuery },
      {
        $lookup: {
          from: "variants",
          localField: "variants",
          foreignField: "_id",
          as: "variants"
        }
      },
      {
        $lookup: {
          from: "categories",
          localField: "category",
          foreignField: "_id",
          as: "category"
        }
      },
      { $unwind: "$category" },
      {
        $lookup: {
          from: "sizevariants",
          let: { variantSizes: "$variants.sizes" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $in: ["$_id", { $reduce: {
                    input: "$$variantSizes",
                    initialValue: [],
                    in: { $concatArrays: ["$$value", "$$this"] }
                  }}]
                }
              }
            }
          ],
          as: "allSizes"
        }
      },
      {
        $addFields: {
          variants: {
            $map: {
              input: "$variants",
              as: "variant",
              in: {
                $mergeObjects: [
                  "$$variant",
                  {
                    sizes: {
                      $map: {
                        input: "$$variant.sizes",
                        as: "sizeId",
                        in: {
                          $arrayElemAt: [
                            {
                              $filter: {
                                input: "$allSizes",
                                cond: { $eq: ["$$this._id", "$$sizeId"] }
                              }
                            },
                            0
                          ]
                        }
                      }
                    }
                  }
                ]
              }
            }
          }
        }
      }
    ];

    // Apply price filter - FIXED LOGIC
    const minPriceNum = Number(minPrice);
    const maxPriceNum = Number(maxPrice);
    
    // Only apply price filter if it's not the default range (0-10000)
    if (minPriceNum > 0 || maxPriceNum < 10000) {
      pipeline.push({
        $addFields: {
          hasValidPriceVariant: {
            $anyElementTrue: {
              $map: {
                input: "$variants",
                as: "variant",
                in: {
                  $let: {
                    vars: {
                      effectivePrice: {
                        $cond: {
                          if: { $and: [
                            { $ne: ["$$variant.discountPrice", null] },
                            { $gt: ["$$variant.discountPrice", 0] }
                          ]},
                          then: "$$variant.discountPrice",
                          else: "$$variant.price"
                        }
                      }
                    },
                    in: {
                      $and: [
                        { $gte: ["$$effectivePrice", minPriceNum] },
                        { $lte: ["$$effectivePrice", maxPriceNum] }
                      ]
                    }
                  }
                }
              }
            }
          }
        }
      });
      
      pipeline.push({
        $match: {
          hasValidPriceVariant: true
        }
      });
    }

    // Add sorting with proper price calculation
    let sortStage = {};
    switch (sortBy) {
      case 'price_low_high':
        pipeline.push({
          $addFields: {
            minPrice: {
              $min: {
                $map: {
                  input: "$variants",
                  as: "variant",
                  in: {
                    $cond: {
                      if: { $and: [
                        { $ne: ["$$variant.discountPrice", null] },
                        { $gt: ["$$variant.discountPrice", 0] }
                      ]},
                      then: "$$variant.discountPrice",
                      else: "$$variant.price"
                    }
                  }
                }
              }
            }
          }
        });
        pipeline.push({ $sort: { minPrice: 1 } });
        break;
        
      case 'price_high_low':
        pipeline.push({
          $addFields: {
            maxPrice: {
              $max: {
                $map: {
                  input: "$variants",
                  as: "variant",
                  in: {
                    $cond: {
                      if: { $and: [
                        { $ne: ["$$variant.discountPrice", null] },
                        { $gt: ["$$variant.discountPrice", 0] }
                      ]},
                      then: "$$variant.discountPrice",
                      else: "$$variant.price"
                    }
                  }
                }
              }
            }
          }
        });
        pipeline.push({ $sort: { maxPrice: -1 } });
        break;
        
      default:
        pipeline.push({ $sort: { createdAt: -1 } });
    }

    // Clean up temporary fields
    pipeline.push({
      $project: {
        allSizes: 0,
        hasValidPriceVariant: 0,
        minPrice: 0,
        maxPrice: 0
      }
    });

    // Get total count for pagination
    const countPipeline = [...pipeline];
    countPipeline.push({ $count: "total" });
    const countResult = await Product.aggregate(countPipeline);
    const totalProducts = countResult.length > 0 ? countResult[0].total : 0;

    // Add pagination
    pipeline.push(
      { $skip: skip },
      { $limit: parseInt(limit) }
    );

    // Execute the pipeline
    const products = await Product.aggregate(pipeline);

    // Process products to include reviews and ratings
    const productsWithStatusAndReviews = await Promise.all(products.map(async (product) => {
      if (product.variants && product.variants.length > 0) {
        product.variants = await Promise.all(product.variants.map(async (variant) => {
          const variantReviews = await Review.find({ variant: variant._id });
          const averageRating = variantReviews.length > 0
            ? variantReviews.reduce((sum, review) => sum + review.rating, 0) / variantReviews.length
            : 0;
          
          return {
            ...variant,
            reviewCount: variantReviews.length,
            averageRating: parseFloat(averageRating.toFixed(1))
          };
        }));
      }
      
      return {
        ...product,
        availability: product.isDeleted ? "Coming Soon" : "Available",
        activeOffer: product.activeOffer ? { _id: product.activeOffer } : null
      };
    }));

    res.status(200).json({
      products: productsWithStatusAndReviews,
      totalPages: Math.ceil(totalProducts / limit),
      currentPage: parseInt(page)
    });

  } catch (error) {
    console.error("Error in getAllProducts:", error);
    res.status(500).json({
      message: "Error fetching products",
      error: error.message
    });
  }
});
const getProductDetail = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;

    const product = await Product.findById(id)
      .populate("category", "name")
      .populate({
        path: "variants",
        populate: {
          path: "sizes",
          model: "SizeVariant",
        },
      });

    if (!product) {
      return res.status(404).json({ message: "Product not found." });
    }

    // Get variant-specific reviews and ratings
    const productObj = product.toObject();
    if (productObj.variants && productObj.variants.length > 0) {
      productObj.variants = await Promise.all(productObj.variants.map(async (variant) => {
        const variantReviews = await Review.find({ variant: variant._id }).populate("user", "name email");
        let averageRating = 0;
        
        if (variantReviews.length > 0) {
          const totalRating = variantReviews.reduce((sum, review) => sum + review.rating, 0);
          averageRating = totalRating / variantReviews.length;
        }
        
        return {
          ...variant,
          reviews: variantReviews,
          reviewCount: variantReviews.length,
          averageRating: parseFloat(averageRating.toFixed(1))
        };
      }));
    }

    // Get active offer for this product if any
    const activeOffer = await checkActiveOffers(product);
    const productWithOffer = {
      ...productObj,
      activeOffer: activeOffer
        ? {
            discountPercentage: activeOffer.discountPercentage,
            offerName: activeOffer.offerName,
          }
        : null,
    };

    res.status(200).json({
      message: "Product details retrieved successfully",
      product: productWithOffer,
    });
  } catch (error) {
    res.status(500).json({ message: "Error fetching product details", error });
  }
});

const getProductById = asyncHandler(async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).populate({
      path: "variants",
      populate: {
        path: "sizes",
        model: "SizeVariant",
      },
    });

    if (!product) return res.status(404).json({ message: "Product not found" });

    res.status(200).json(product);
  } catch (error) {
    res.status(500).json({ message: "Error fetching product", error });
  }
});

const searchProducts = asyncHandler(async (req, res) => {
  console.log("Hited");

  try {
    const { query } = req.query;

    if (!query) {
      return res.status(400).json({
        success: false,
        message: "Search query is required",
        products: [],
      });
    }

    const searchRegex = new RegExp(query, "i");

    const products = await Product.find({
      $or: [
        { name: searchRegex },
        { description: searchRegex },
        { material: searchRegex },
        { pattern: searchRegex },
        { gender: searchRegex },
      ],
    })
      .populate("category", "name")
      .populate({
        path: "variants",
        populate: {
          path: "sizes",
          model: "SizeVariant",
        },
      })
      .limit(10);
    res.status(200).json({
      success: true,
      count: products.length,
      products,
    });
  } catch (error) {
    console.error("Search error:", error);
    res.status(500).json({
      success: false,
      message: "Error searching products",
      error: error.message,
    });
  }
});

const fetchRelatedProducts = async (req, res) => {
  try {
    const { productId } = req.params;

    const currentProduct = await Product.findById(productId);
    if (!currentProduct) {
      return res.status(404).json({ message: "Product not found" });
    }

    const relatedProducts = await Product.find({
      category: currentProduct.category,
      _id: { $ne: productId },
    })
      .limit(2)
      .populate({
        path: "variants",
        options: { limit: 3 },
        populate: {
          path: "sizes",
          model: "SizeVariant",
        },
      });

    res.status(200).json({ relatedProducts });
  } catch (error) {
    res.status(500).json({ message: "Error fetching related products", error });
  }
};

const searchAndFetchRelatedProducts = asyncHandler(async (req, res) => {
  try {
    const { query } = req.query;

    if (!query) {
      return res.status(400).json({
        success: false,
        message: "Search query is required",
        products: [],
      });
    }

    const searchRegex = new RegExp(query, "i");
    const products = await Product.find({
      $or: [
        { name: searchRegex },
        { description: searchRegex },
        { material: searchRegex },
        { pattern: searchRegex },
        { gender: searchRegex },
      ],
    })
      .populate("category", "name")
      .populate({
        path: "variants",
        populate: {
          path: "sizes",
          model: "SizeVariant",
        },
      })
      .limit(10);

    if (products.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No products found matching the query",
      });
    }

    const relatedProductsPromises = products.map(async (product) => {
      const relatedProducts = await Product.find({
        category: product.category._id,
        _id: { $ne: product._id },
      })
        .populate({
          path: "variants",
          populate: {
            path: "sizes",
            model: "SizeVariant",
          },
        })
        .limit(2);

      return {
        product,
        relatedProducts,
      };
    });

    const productsWithRelated = await Promise.all(relatedProductsPromises);

    res.status(200).json({
      success: true,
      count: products.length,
      productsWithRelated,
    });
  } catch (error) {
    console.error("Search and related products error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching search and related products",
      error: error.message,
    });
  }
});

// const getProductsByBrand = asyncHandler(async (req, res) => {
//   try {
//     const { brandId } = req.params;

//     // Check if brandId exists
//     if (!brandId) {
//       return res.status(200).json({
//         success: true,
//         count: 0,
//         products: []
//       });
//     }

//     const products = await Product.find({ brand: brandId })
//       .populate("category", "name")
//       .populate({
//         path: "variants",
//         populate: {
//           path: "sizes",
//           model: "SizeVariant",
//         },
//       });

//     // Always return 200 status code, even if no products found
//     return res.status(200).json({
//       success: true,
//       count: products.length,
//       products: products || [] // Ensure we always return an array
//     });

//   } catch (error) {
//     console.error("Error fetching brand products:", error);
//     // Return empty array even on error to prevent frontend crashes
//     return res.status(200).json({
//       success: true,
//       count: 0,
//       products: []
//     });
//   }
// });

const getProductsByCategory = asyncHandler(async (req, res) => {
  try {
    const { categoryId } = req.params;
    const { page = 1, limit = 8 } = req.query;
    const skip = (page - 1) * limit;

    const query = { 
      category: categoryId
    };

    const products = await Product.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .populate("category", "name")
      .populate({
        path: "variants",
        populate: {
          path: "sizes",
          model: "SizeVariant",
        },
      });

    const totalProducts = await Product.countDocuments(query);

    res.status(200).json({
      success: true,
      products,
      totalPages: Math.ceil(totalProducts / limit),
      currentPage: parseInt(page),
      totalProducts
    });

  } catch (error) {
    console.error("Error fetching category products:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching category products",
      error: error.message
    });
  }
});

const getProductsByGender = asyncHandler(async (req, res) => {
  try {
    const { gender } = req.params;
    const { page = 1, limit = 8 } = req.query;
    const skip = (page - 1) * limit;

    const query = { 
      gender: { $regex: new RegExp(gender, 'i') }
    };

    const products = await Product.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .populate("category", "name")
      .populate({
        path: "variants",
        populate: {
          path: "sizes",
          model: "SizeVariant",
        },
      });

    const totalProducts = await Product.countDocuments(query);

    res.status(200).json({
      success: true,
      products,
      totalPages: Math.ceil(totalProducts / limit),
      currentPage: parseInt(page),
      totalProducts
    });

  } catch (error) {
    console.error("Error fetching gender products:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching gender products",
      error: error.message
    });
  }
});

// Add new endpoint to get available filters
const getProductFilters = asyncHandler(async (req, res) => {
  try {
    // Get unique colors and sizes from variants
    const products = await Product.find({ isDeleted: false })
      .populate({
        path: 'variants',
        populate: {
          path: 'sizes',
          model: 'SizeVariant',
        },
      });

    const colors = new Set();
    const sizes = new Set();

    products.forEach(product => {
      product.variants.forEach(variant => {
        colors.add(variant.color);
        variant.sizes.forEach(size => {
          sizes.add(size.size);
        });
      });
    });

    res.status(200).json({
      colors: Array.from(colors),
      sizes: Array.from(sizes),
    });
  } catch (error) {
    res.status(500).json({ message: "Error fetching filters", error });
  }
});

module.exports = {
  getAllProducts,
  getProductById,
  getProductDetail,
  fetchRelatedProducts,
  searchProducts,
  searchAndFetchRelatedProducts,
  // getProductsByBrand,
  getProductsByCategory,
  getProductsByGender,
  getProductFilters,
};
