import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import axiosInstance from "../../utils/axiosInstance";
import Header from "../../components/header";
import Footer from "../../components/footer";
import FilterSidebar from "../../components/FilterSidebar";
import React from "react";

import { useDispatch } from "react-redux";
import { addToCart } from "../../redux/slices/cartSlice";
import { toast } from "react-toastify";

// Debounce function for search
const debounce = (func, delay) => {
  let timer;
  return function (...args) {
    clearTimeout(timer);
    timer = setTimeout(() => func(...args), delay);
  };
};

const Products = () => {
  const productGridRef = useRef(null);
  const [searchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [hoveredProductId, setHoveredProductId] = useState(null);
  const [selectedVariant, setSelectedVariant] = useState({});

  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [filters, setFilters] = useState(() => ({
    category: searchParams.get("category") || "",
    minPrice: Number(searchParams.get("minPrice")) || 0,
    maxPrice: Number(searchParams.get("maxPrice")) || 10000,
    sortBy: searchParams.get("sortBy") || "newest"
  }));

  const dispatch = useDispatch();

  const handleAddToCart = (product) => {
    try {
      const currentVariant = getSelectedVariant(product);

      // Get available sizes (handling both array and single object cases)
      const availableSizes = currentVariant?.sizes
        ? Array.isArray(currentVariant.sizes)
          ? currentVariant.sizes
          : [currentVariant.sizes]
        : [];

      // Find the first available size with stock
      const availableSize = availableSizes.find((size) => size.stockCount > 0);

      if (!availableSize) {
        toast.error("This product is currently out of stock");
        return;
      }

      dispatch(
        addToCart({
          productId: product._id,
          variantId: currentVariant._id,
          sizeVariantId: availableSize._id,
          quantity: 1,
        })
      );

      toast.success("Product added to cart!");
    } catch (error) {
      toast.error("Failed to add product to cart");
      console.error("Add to cart error:", error);
    }
  };

  // Debounced search function
  const debouncedSearch = useCallback(
    debounce((query) => {
      if (query.trim()) {
        setIsSearching(true);
        searchProducts(query);
      } else {
        setIsSearching(false);
        fetchProducts(); // Fetch regular products when search is cleared
      }
    }, 500),
    [filters, currentPage]
  );

  // Handle search input change
  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
    debouncedSearch(e.target.value);
  };

  // Search products API call
  const searchProducts = async (query) => {
    try {
      setLoading(true);
      const response = await axiosInstance.get(
        `/products/product/search?query=${query}`
      );
      setProducts(response.data.products);
      setTotalPages(1); // Search results typically don't have pagination
      setLoading(false);

      // Initialize selected variants
      const initialVariantSelection = {};
      response.data.products.forEach((product) => {
        if (product.variants && product.variants.length > 0) {
          initialVariantSelection[product._id] = product.variants[0]._id;
        }
      });
      setSelectedVariant(initialVariantSelection);
    } catch (err) {
      console.error("Error searching products:", err);
      setError("Failed to search products. Please try again later.");
      setLoading(false);
    }
  };

  // Handle filter updates from FilterSidebar
  const handleFilterChange = useCallback((newFilters) => {
    setFilters({
      category: newFilters.categories?.[0] || "",
      minPrice: newFilters.priceRange?.min || 0,
      maxPrice: newFilters.priceRange?.max || 10000,
      sortBy: newFilters.sortBy || "newest"
    });
    setCurrentPage(1); // Reset to first page when filters change
  }, []);

  // Fetch products from API based on filters and page
 const fetchProducts = useCallback(async () => {
  try {
    setLoading(true);
    
    // Build query parameters
    const queryParams = new URLSearchParams({
      page: currentPage.toString(),
      limit: "8",
    });

    // Add filters
    if (filters.category) {
      queryParams.append("category", filters.category);
    }

    // Always include price range parameters
    queryParams.append("minPrice", filters.minPrice.toString());
    queryParams.append("maxPrice", filters.maxPrice.toString());

    if (filters.sortBy) {
      queryParams.append("sortBy", filters.sortBy);
    }

    const response = await axiosInstance.get(
      `/products/get?${queryParams.toString()}`
    );

    setProducts(response.data.products);
    setTotalPages(response.data.totalPages);

    // Initialize selected variants
    const initialVariantSelection = {};
    response.data.products.forEach((product) => {
      if (product.variants && product.variants.length > 0) {
        initialVariantSelection[product._id] = product.variants[0]._id;
      }
    });
    setSelectedVariant(initialVariantSelection);

    setLoading(false);
  } catch (err) {
    console.error("Error fetching products:", err);
    setError("Failed to load products. Please try again later.");
    setLoading(false);
  }
}, [currentPage, filters]);

  useEffect(() => {
    if (!isSearching) {
      fetchProducts();
    }
  }, [fetchProducts, isSearching]);

  // Update filters from URL params when component mounts
  useEffect(() => {
    const urlFilters = {
      category: searchParams.get("category") || "",
      minPrice: Number(searchParams.get("minPrice")) || 0,
      maxPrice: Number(searchParams.get("maxPrice")) || 10000,
      sortBy: searchParams.get("sortBy") || "newest"
    };
    setFilters(urlFilters);

  }, [searchParams]);

  const handleApplyFilters = useCallback((newFilters) => {
  setFilters({
    category: newFilters.categories?.[0] || "",
    minPrice: newFilters.priceRange?.min || 0,
    maxPrice: newFilters.priceRange?.max || 10000,
    sortBy: newFilters.sortBy || "newest"
  });
  setCurrentPage(1);
  setIsSearching(false);
  setSearchQuery("");
  setShowMobileFilters(false);
}, []);

  const handlePageChange = useCallback((page) => {
    setCurrentPage(page);
    productGridRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  const handleProductMouseEnter = useCallback((id) => {
    setHoveredProductId(id);
  }, []);

  const handleProductMouseLeave = useCallback(() => {
    setHoveredProductId(null);
  }, []);

  const handleVariantChange = useCallback((productId, variantId) => {
    setSelectedVariant((prev) => ({
      ...prev,
      [productId]: variantId,
    }));
  }, []);

  // Get lowest price from all variants with sizes
  const getLowestPrice = useMemo(
    () => (variants) => {
      if (!variants || variants.length === 0) {
        return { price: "Price not available", discountPrice: null };
      }

      // Find the variant with the lowest price (considering discount if available)
      const variantWithLowestPrice = variants.reduce((lowest, variant) => {
        const currentPrice = variant.discountPrice || variant.price;
        const lowestPrice = lowest.discountPrice || lowest.price;
        return currentPrice < lowestPrice ? variant : lowest;
      }, variants[0]);

      const price = variantWithLowestPrice.price;
      const discountPrice = variantWithLowestPrice.discountPrice;

      return {
        price: price ? `Rs. ${price.toFixed(2)}` : "Price not available",
        discountPrice: discountPrice ? `Rs. ${discountPrice.toFixed(2)}` : null,
      };
    },
    []
  );

  // Get currently selected variant object
  const getSelectedVariant = useMemo(
    () => (product) => {
      const variantId = selectedVariant[product._id];
      return (
        product.variants.find((v) => v._id === variantId) || product.variants[0]
      );
    },
    [selectedVariant]
  );

  // Get sizes for selected variant
  const getAvailableSizes = useMemo(
    () => (product) => {
      const variant = getSelectedVariant(product);
      return variant?.sizes || [];
    },
    [getSelectedVariant]
  );

  const ProductGrid = useMemo(
    () =>
      React.memo(
        ({
          products,
          hoveredProductId,
          selectedVariant,
          handleProductMouseEnter,
          handleProductMouseLeave,
          handleVariantChange,
          getLowestPrice,
          getSelectedVariant,
          getAvailableSizes,
        }) => (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">

            {products.map((product) => {
              const currentVariant = getSelectedVariant(product);
              const priceInfo = getLowestPrice(product.variants);

              return (
                <div
                  key={product._id}
                  className="relative w-full aspect-[4/5] flex flex-col bg-white"
                  onMouseEnter={() => handleProductMouseEnter(product._id)}
                  onMouseLeave={handleProductMouseLeave}
                >
                  {new Date(product.createdAt) >
                    new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) && (
                    <span className="absolute top-2 left-2 bg-green-500 text-white px-3 py-1 text-xs z-10">
                      New in
                    </span>
                  )}

                  <div className="relative cursor-pointer group">
                    <a href={`/detail/${product._id}`}>
                      <img
                        src={
                          currentVariant?.mainImage ||
                          "/placeholder-product.jpg"
                        }
                        alt={product.name}
                        className="w-full h-[350px] md:h-[400px] lg:h-[420px] object-cover"
                      />
                    </a>

                    {hoveredProductId === product._id && (
                      <>
                        <button
                          className="absolute left-2 top-1/2 -translate-y-1/2 bg-white bg-opacity-80 rounded-full p-2 shadow-md z-20"
                          onClick={(e) => {
                            e.stopPropagation();
                            const currentIndex = product.variants.findIndex(
                              (v) => v._id === selectedVariant[product._id]
                            );
                            const prevIndex =
                              (currentIndex - 1 + product.variants.length) %
                              product.variants.length;
                            handleVariantChange(
                              product._id,
                              product.variants[prevIndex]._id
                            );
                          }}
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth={1.5}
                            stroke="currentColor"
                            className="w-5 h-5"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M15.75 19.5L8.25 12l7.5-7.5"
                            />
                          </svg>
                        </button>
                        <button
                          className="absolute right-2 top-1/2 -translate-y-1/2 bg-white bg-opacity-80 rounded-full p-2 shadow-md z-20"
                          onClick={(e) => {
                            e.stopPropagation();
                            const currentIndex = product.variants.findIndex(
                              (v) => v._id === selectedVariant[product._id]
                            );
                            const nextIndex =
                              (currentIndex + 1) % product.variants.length;
                            handleVariantChange(
                              product._id,
                              product.variants[nextIndex]._id
                            );
                          }}
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth={1.5}
                            stroke="currentColor"
                            className="w-5 h-5"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M8.25 4.5l7.5 7.5-7.5 7.5"
                            />
                          </svg>
                        </button>
                      </>
                    )}

                    {hoveredProductId === product._id &&
                      product.variants.length > 1 && (
                        <div className="absolute bottom-16 left-0 right-0 bg-white p-2 transition-opacity duration-300 opacity-100">
                          <div className="flex flex-wrap justify-center gap-2">
                            {product.variants.map((variant) => (
                              <button
                                key={variant._id}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleVariantChange(product._id, variant._id);
                                }}
                                className={`w-6 h-6 rounded-full border ${
                                  selectedVariant[product._id] === variant._id
                                    ? "border-black border-2"
                                    : "border-gray-300"
                                }`}
                                style={{
                                  backgroundImage: `url(${variant.colorImage})`,
                                  backgroundSize: "cover",
                                  backgroundPosition: "center",
                                }}
                                aria-label={`Select ${variant.color} color`}
                              />
                            ))}
                          </div>
                        </div>
                      )}

                    <div
                      className={`absolute bottom-0 left-0 right-0 bg-white p-2 transition-opacity duration-300 ${
                        hoveredProductId === product._id
                          ? "opacity-100"
                          : "opacity-0"
                      }`}
                    >
                      <button
                        className="w-full bg-white border border-gray-300 text-gray-700 py-3 font-medium uppercase hover:bg-gray-50"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          handleAddToCart(product);
                        }}
                      >
                        Add To Cart
                      </button>
                    </div>
                  </div>

                  <div className="mt-4 space-y-2">
                    <h3 className="text-sm font-medium line-clamp-2">
                      {product.name}
                    </h3>
                    <div className="flex items-center gap-2">
                      {priceInfo.discountPrice ? (
                        <>
                          <p className="text-sm text-gray-500 line-through">
                            {priceInfo.price}
                          </p>
                          <p className="text-sm font-medium text-red-600">
                            {priceInfo.discountPrice}
                          </p>
                        </>
                      ) : (
                        <p className="text-sm font-medium">{priceInfo.price}</p>
                      )}
                    </div>

                    <p className="text-sm text-gray-500">
                      {currentVariant?.color || "Various colors"}
                      {getAvailableSizes(product).length > 0 &&
                        ` • ${getAvailableSizes(product).length} sizes`}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )
      ),
    []
  );

  if (error)
    return (
      <div className="container mx-auto px-4 pt-32 pb-8 flex justify-center items-center min-h-screen">
        <div className="text-center">
          <p className="text-red-500">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 bg-black text-white px-4 py-2"
          >
            Try Again
          </button>
        </div>
      </div>
    );

  return (
    <>
      <Header />
      <div className="container max-w-screen mx-auto px-4 pt-32 pb-8 mt-10">
        {/* Mobile filter button */}
        <div className="lg:hidden mb-4">
          <button
            onClick={() => setShowMobileFilters(!showMobileFilters)}
            className="flex items-center gap-2 bg-black text-white px-4 py-2 rounded"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M3 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 15a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z"
                clipRule="evenodd"
              />
            </svg>
            Filters
          </button>
        </div>

        <div className="flex flex-col lg:flex-row">
          {/* Filter Sidebar - shown on desktop, toggleable on mobile */}
          <div
            className={`lg:block ${
              showMobileFilters ? "block" : "hidden"
            } w-full lg:w-1/4 lg:pr-6 mb-6 lg:mb-0`}
          >
            <FilterSidebar onApplyFilters={handleApplyFilters} />
          </div>

          {/* Main content area */}
          <div className="flex-1" ref={productGridRef}>
            {/* Search Input at the top right */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
              <h2 className="text-2xl font-bold">
                {isSearching
                  ? `Search Results for "${searchQuery}"`
                  : filters.category
                  ? `Products`
                  : "All Products"}
              </h2>

              <div className="relative w-full md:w-64">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={handleSearchChange}
                  placeholder="Search products..."
                  className="w-full p-2 pl-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                />
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 absolute left-3 top-2.5 text-gray-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </div>
            </div>

            {loading ? (
              <div className="flex justify-center items-center min-h-[50vh]">
                <div className="text-center">
                  <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"></div>
                  <p className="mt-2">Loading products...</p>
                </div>
              </div>
            ) : error ? (
              <div className="text-center py-16">
                <p className="text-red-500">{error}</p>
                <button
                  onClick={() => window.location.reload()}
                  className="mt-4 bg-black text-white px-4 py-2"
                >
                  Try Again
                </button>
              </div>
            ) : products.length === 0 ? (
              <div className="text-center py-16">
                <h2 className="text-xl font-medium">No products found</h2>
                <p className="text-gray-600 mt-2">
                  {isSearching
                    ? "Try different search terms."
                    : filters.category
                    ? "No products available in this category."
                    : "No products available."}
                </p>
              </div>
            ) : (
              <>
                <ProductGrid
                  products={products}
                  hoveredProductId={hoveredProductId}
                  selectedVariant={selectedVariant}
                  handleProductMouseEnter={handleProductMouseEnter}
                  handleProductMouseLeave={handleProductMouseLeave}
                  handleVariantChange={handleVariantChange}
                  getLowestPrice={getLowestPrice}
                  getSelectedVariant={getSelectedVariant}
                  getAvailableSizes={getAvailableSizes}
                />

                {/* Pagination - only show if not searching */}
                {!isSearching && totalPages > 1 && (
                  <div className="flex justify-center space-x-2 mt-8">
                    {Array.from({ length: totalPages }, (_, index) => (
                      <button
                        key={index + 1}
                        onClick={() => handlePageChange(index + 1)}
                        className={`w-10 h-10 flex items-center justify-center rounded-lg transition-colors ${
                          currentPage === index + 1
                            ? "bg-black text-white"
                            : "bg-gray-200 text-gray-600 hover:bg-gray-300"
                        }`}
                      >
                        {index + 1}
                      </button>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default Products;