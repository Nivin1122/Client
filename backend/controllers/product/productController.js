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
      colors = [],
      sizes = [],
      categories = [],
      minPrice = 0,
      maxPrice = 10000,
      sortBy = 'newest'
    } = req.query;
    const skip = (page - 1) * limit;

    // Build aggregation pipeline for efficient filtering
    const pipeline = [
      // Match initial criteria
      {
        $match: {
          isDeleted: false,
          ...(search && { name: { $regex: search, $options: "i" } }),
          ...(req.query.category && {
            category: mongoose.Types.ObjectId.isValid(req.query.category) 
              ? new mongoose.Types.ObjectId(req.query.category)
              : null
          }),
          // ...(brands.length > 0 && { brand: { $in: brands.split(',').map(id => mongoose.Types.ObjectId.isValid(id) ? new mongoose.Types.ObjectId(id) : null).filter(id => id !== null) } })
        }
      },
      // Lookup and unwind variants
      {
        $lookup: {
          from: "variants",
          localField: "variants",
          foreignField: "_id",
          as: "variants"
        }
      },
      { $unwind: "$variants" },
      // Apply color filter if needed
      ...(colors.length > 0 ? [{
        $match: {
          "variants.color": { $in: colors.split(',') }
        }
      }] : []),
      // Lookup and unwind sizes
      {
        $lookup: {
          from: "sizevariants",
          localField: "variants.sizes",
          foreignField: "_id",
          as: "variants.sizes"
        }
      },
      { $unwind: "$variants.sizes" },
      // Apply size and price filters
      {
        $match: {
          ...(sizes.length > 0 && { "variants.sizes.size": { $in: sizes.split(',') } }),
          "variants.sizes.price": { $gte: Number(minPrice), $lte: Number(maxPrice) }
        }
      },
      // Group back to product level
// Group back to product level
{
  $group: {
    _id: "$_id",
    name: { $first: "$name" },
    description: { $first: "$description" },
    category: { $first: "$category" },
    variants: { $push: "$variants" },
    createdAt: { $first: "$createdAt" }
  }
} // <-- THIS NEEDS TO BE FOLLOWED BY:
]; // <-- ADD THIS LINE TO CLOSE THE ARRAY

// Add sorting to pipeline
const sortStage = {
  $sort: sortBy === 'price_low_high' 
    ? { 'variants.sizes.price': 1 }
    : sortBy === 'price_high_low'
      ? { 'variants.sizes.price': -1 }
      : { createdAt: -1 }
};

    pipeline.push(sortStage);

    // Add lookups for brand and category
    pipeline.push(
      
      {
        $lookup: {
          from: 'categories',
          localField: 'category',
          foreignField: '_id',
          as: 'category'
        }
      },
      { $unwind: '$category' }
    );

    // Get total count before pagination
    const countPipeline = [...pipeline];
    const [{ count: totalProducts } = { count: 0 }] = await Product.aggregate([...countPipeline, { $count: 'count' }]);

    // Add pagination
    pipeline.push(
      { $skip: skip },
      { $limit: parseInt(limit) }
    );

    // Execute pipeline
    const products = await Product.aggregate(pipeline);

    // Process products to include availability and reviews
    const productsWithStatusAndReviews = await Promise.all(products.map(async (product) => {
      // Get variant-specific reviews and ratings
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
