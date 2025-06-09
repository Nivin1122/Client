import React, { useRef, useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../utils/axiosInstance";
import fallbackImage from "../assets/banner.png"; 
import { useDispatch } from "react-redux";
import { addToCart } from "../redux/slices/cartSlice";
import { toast } from "react-toastify";

const BestSeller = () => {
  const scrollRef = useRef(null);
  const [hoveredProductId, setHoveredProductId] = useState(null);
  const [products, setProducts] = useState([]);
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
    const availableSize = availableSizes.find(size => size.stockCount > 0);

    if (!availableSize) {
      toast.error("This product is currently out of stock");
      return;
    }

    dispatch(addToCart({
      productId: product._id,
      variantId: currentVariant._id,
      sizeVariantId: availableSize._id,
      quantity: 1
    }));

    toast.success("Product added to cart!");
  } catch (error) {
    toast.error("Failed to add product to cart");
    console.error("Add to cart error:", error);
  }
};

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

  const shuffleArray = (array) => {
    return [...array].sort(() => Math.random() - 0.5);
  };

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await axiosInstance.get(
          "/products/get?page=1&limit=50&sort=-createdAt"
        );
        const shuffled = shuffleArray(response.data.products).slice(0, 10); // Show only 10 random
        setProducts(shuffled);
      } catch (err) {
        console.error("Error fetching products:", err);
      }
    };

    fetchProducts();
  }, []);

  const getLowestPrice = (variants) => {
    if (!Array.isArray(variants) || variants.length === 0) return "Rs. 0.00";

    let lowestPrice = Infinity;

    variants.forEach((variant) => {
      if (Array.isArray(variant.sizes)) {
        variant.sizes.forEach((size) => {
          if (typeof size.price === "number" && size.price < lowestPrice) {
            lowestPrice = size.price;
          }
        });
      }
    });

    if (lowestPrice === Infinity) return "Rs. 0.00";
    return `Rs. ${lowestPrice.toLocaleString("en-IN")}`;
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

  const handleProductClick = (id) => navigate(`/detail/${id}`);

  return (
    <div className="mx-auto px-4 py-4 sm:py-1 md:py-1">
      <div className="flex justify-between items-center mb-6">
        <div className="flex-1 flex justify-center">
          <div className="flex items-center gap-5">
            <button className="text-gray-400" onClick={scrollLeft}>
              {/* Left Arrow */}
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-6 h-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="1.5"
                  d="M15.75 19.5L8.25 12l7.5-7.5"
                />
              </svg>
            </button>
            <h2 className="text-xl font-medium text-center">Best Sellers</h2>
            <button className="text-gray-400" onClick={scrollRight}>
              {/* Right Arrow */}
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-6 h-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="1.5"
                  d="M8.25 4.5l7.5 7.5-7.5 7.5"
                />
              </svg>
            </button>
          </div>
        </div>
        <a href="https://client-1-6rax.onrender.com/products?page=1&limit=8&sortBy=newest" className="text-red-500 text-sm uppercase">
          View All
        </a>
      </div>

      <div className="overflow-x-auto scrollbar-hide" ref={scrollRef}>
        <div className="flex gap-4 md:gap-7 min-w-max pb-4">
          {products.map((product) => {
            const variant = product.variants?.[0] || {};
            const price = product.variants[0].sizes.discountPrice;
            return (
              <div
                key={product._id}
                className="relative w-[280px] md:w-[350px] lg:w-[400px]"
                onMouseEnter={() => setHoveredProductId(product._id)}
                onMouseLeave={() => setHoveredProductId(null)}
              >
                <span className="absolute top-2 left-2 bg-red-500 text-white px-3 py-1 text-xs z-10">
                  Best Seller
                </span>

                <div className="relative cursor-pointer group">
                  <img
                    src={variant.mainImage || fallbackImage}
                    alt={product.name}
                    className="w-full h-[350px] md:h-[450px] lg:h-[500px] object-cover"
                    onClick={() => handleProductClick(product._id)}
                  />

                  {/* Hover arrows */}
                  {hoveredProductId === product._id &&
                    product.variants?.length > 1 && (
                      <>
                        <button className="absolute left-2 top-1/2 -translate-y-1/2 bg-white bg-opacity-80 rounded-full p-2 shadow-md z-20">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="w-5 h-5"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="1.5"
                              d="M15.75 19.5L8.25 12l7.5-7.5"
                            />
                          </svg>
                        </button>
                        <button className="absolute right-2 top-1/2 -translate-y-1/2 bg-white bg-opacity-80 rounded-full p-2 shadow-md z-20">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="w-5 h-5"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="1.5"
                              d="M8.25 4.5l7.5 7.5-7.5 7.5"
                            />
                          </svg>
                        </button>
                      </>
                    )}

                  <div
                    className={`absolute bottom-0 left-0 right-0 bg-white p-2 transition-opacity duration-300 ${
                      hoveredProductId === product._id
                        ? "opacity-100"
                        : "opacity-0"
                    }`}
                  >
                    <button
                      className="w-full bg-white border border-gray-300 text-gray-700 py-3 font-medium uppercase hover:bg-[#010135] hover:text-[#FFF5CC]"
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
                    {variant.color || "Various colors"}
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

export default BestSeller;
