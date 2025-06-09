import React, { useRef, useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../utils/axiosInstance";
import exclusive from "../assets/bestseller.png";

import { useDispatch } from "react-redux";
import { addToCart } from "../redux/slices/cartSlice";
import { toast } from "react-toastify";

const NewArrivals = () => {
  const scrollRef = useRef(null);
  const [hoveredProductId, setHoveredProductId] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [selectedVariant, setSelectedVariant] = useState({});

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

    const getSelectedVariant = useMemo(
        () => (product) => {
          const variantId = selectedVariant[product._id];
          return (
            product.variants.find((v) => v._id === variantId) || product.variants[0]
          );
        },
        [selectedVariant]
      );

  const scrollLeft = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: -320, behavior: "smooth" });
    }
  };

  const scrollRight = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: 320, behavior: "smooth" });
    }
  };

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const response = await axiosInstance.get(
          "/products/get?page=1&limit=15&sort=-createdAt"
        );
        setProducts(response.data.products);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching products:", err);
        setError("Failed to load products. Please try again later.");
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const handleProductMouseEnter = (id) => {
    setHoveredProductId(id);
  };

  const handleProductMouseLeave = () => {
    setHoveredProductId(null);
  };

  const handleProductClick = (productId) => {
    navigate(`/detail/${productId}`);
  };

  const getLowestPrice = (variants) => {
    if (!variants || variants.length === 0) return "Rs. 0.00";

    let lowestPrice = Infinity;
    variants.forEach((variant) => {
      if (variant.sizes && variant.sizes.length > 0) {
        variant.sizes.forEach((size) => {
          if (size.price < lowestPrice) {
            lowestPrice = size.price;
          }
        });
      }
    });

    if (lowestPrice === Infinity) return "Rs. 0.00";
    return `Rs. ${lowestPrice.toLocaleString("en-IN")}`;
  };

  if (loading) {
    return (
      <div className="mx-auto px-4 py-8">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-auto px-4 py-8">
        <div className="text-center text-red-500">{error}</div>
      </div>
    );
  }

  return (
    <div className="mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <div className="flex-1 flex justify-center">
          <div className="flex items-center gap-5">
            <button className="text-gray-400" onClick={scrollLeft}>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="w-6 h-6"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15.75 19.5L8.25 12l7.5-7.5"
                />
              </svg>
            </button>
            <h2 className="text-xl font-medium text-center">
              New Arrivals - Unstitched Suits
            </h2>
            <button className="text-gray-400" onClick={scrollRight}>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="w-6 h-6"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M8.25 4.5l7.5 7.5-7.5 7.5"
                />
              </svg>
            </button>
          </div>
        </div>
        <a href="https://client-1-6rax.onrender.com/products?page=1&limit=8&sortBy=newest" className="text-red-500 text-sm uppercase">
          VIEW ALL
        </a>
      </div>

      <div className="overflow-x-auto scrollbar-hide" ref={scrollRef}>
        <div className="flex gap-4 md:gap-7 min-w-max pb-4">
          {products.map((product) => {
            const mainVariant = product.variants?.[0] || {};
            const price = product.variants[0].sizes.discountPrice;
            const isNew =
              new Date(product.createdAt) >
              new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

            return (
              <div
                key={product._id}
                className="relative w-[280px] md:w-[350px] lg:w-[400px]"
                onMouseEnter={() => handleProductMouseEnter(product._id)}
                onMouseLeave={handleProductMouseLeave}
              >
                {isNew && (
                  <span className="absolute top-2 left-2 bg-green-500 text-white px-3 py-1 text-xs z-10">
                    New in
                  </span>
                )}
                <div className="relative cursor-pointer group">
                  <img
                    src={mainVariant.mainImage || exclusive}
                    alt={product.name}
                    className="w-full h-[350px] md:h-[450px] lg:h-[500px] object-cover"
                    onClick={() => handleProductClick(product._id)}
                  />

                  {/* Navigation arrows on hover */}
                  {hoveredProductId === product._id &&
                    product.variants?.length > 1 && (
                      <>
                        <button
                          className="absolute left-2 top-1/2 -translate-y-1/2 bg-white bg-opacity-80 rounded-full p-2 shadow-md z-20"
                          onClick={(e) => {
                            e.stopPropagation();
                            // Navigate to previous variant functionality would go here
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
                            // Navigate to next variant functionality would go here
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

                  {/* Quick Buy button */}
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
                  <p className="text-sm">{price}</p>
                  <p className="text-sm text-gray-500">
                    {mainVariant.color || "Various colors"}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <style>{`
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  );
};

export default NewArrivals;
