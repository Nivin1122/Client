import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import axiosInstance from '../../utils/axiosInstance';
import Header from '../../components/header';
import Footer from '../../components/footer';

const debounce = (func, delay) => {
  let timer;
  return function (...args) {
    clearTimeout(timer);
    timer = setTimeout(() => func(...args), delay);
  };
};

const SearchResults = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const initialQuery = searchParams.get('q') || '';
  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [hoveredProductId, setHoveredProductId] = useState(null);
  const [selectedVariant, setSelectedVariant] = useState({});

  // Debounced search function
  const debouncedSearch = useCallback(
    debounce((query) => {
      if (query.trim()) {
        setSearchParams({ q: query });
        searchProducts(query);
      } else {
        setProducts([]);
        setLoading(false);
      }
    }, 500),
    [] // ensure stable instance
  );

  useEffect(() => {
    if (initialQuery) {
      searchProducts(initialQuery);
    } else {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    debouncedSearch(searchQuery);
  }, [searchQuery, debouncedSearch]);

  const searchProducts = async (query) => {
    try {
      setLoading(true);
      const response = await axiosInstance.get(`/products/product/search?query=${query}`);
      setProducts(response.data.products);
      setLoading(false);

      const initialVariantSelection = {};
      response.data.products.forEach((product) => {
        if (product.variants && product.variants.length > 0) {
          initialVariantSelection[product._id] = product.variants[0]._id;
        }
      });
      setSelectedVariant(initialVariantSelection);
    } catch (err) {
      console.error('Error searching products:', err);
      setError('Failed to search products. Please try again.');
      setLoading(false);
    }
  };

  const handleProductMouseEnter = (id) => setHoveredProductId(id);
  const handleProductMouseLeave = () => setHoveredProductId(null);

  const handleVariantChange = (productId, variantId) => {
    setSelectedVariant((prev) => ({
      ...prev,
      [productId]: variantId,
    }));
  };

  const getLowestPrice = (variants) => {
    let lowestPrice = Infinity;
    let discountPrice = null;
    variants.forEach((variant) => {
      if (variant.sizes?.length) {
        variant.sizes.forEach((size) => {
          if (size.price < lowestPrice) {
            lowestPrice = size.price;
            discountPrice = size.discountPrice;
          }
        });
      }
    });

    if (lowestPrice === Infinity)
      return { price: 'Price not available', discountPrice: null };

    return {
      price: `Rs. ${lowestPrice.toFixed(2)}`,
      discountPrice: discountPrice ? `Rs. ${discountPrice.toFixed(2)}` : null,
    };
  };

  const getSelectedVariant = (product) => {
    const variantId = selectedVariant[product._id];
    return product.variants.find((v) => v._id === variantId) || product.variants[0];
  };

  const getAvailableSizes = (product) => {
    const variant = getSelectedVariant(product);
    return variant?.sizes || [];
  };

  return (
    <>
      <Header />
      <div className="container max-w-screen mx-auto px-4 pt-32 pb-8">
        {/* Real-time Search Input */}
        <div className="max-w-2xl mx-auto mb-8">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search products..."
            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
          />
        </div>

        {loading ? (
          <div className="flex justify-center items-center min-h-[400px]">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent"></div>
          </div>
        ) : error ? (
          <div className="text-center py-16">
            <p className="text-red-500">{error}</p>
            <button onClick={() => window.location.reload()} className="mt-4 bg-black text-white px-4 py-2 rounded">
              Try Again
            </button>
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-16">
            <h2 className="text-xl font-medium">No products found</h2>
            <p className="text-gray-600 mt-2">Try searching with different keywords</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {products.map((product) => {
              const currentVariant = getSelectedVariant(product);
              const priceInfo = getLowestPrice(product.variants);

              return (
                <div
                  key={product._id}
                  className="relative w-full"
                  onMouseEnter={() => handleProductMouseEnter(product._id)}
                  onMouseLeave={handleProductMouseLeave}
                >
                  {new Date(product.createdAt) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) && (
                    <span className="absolute top-2 left-2 bg-green-500 text-white px-3 py-1 text-xs z-10">
                      New in
                    </span>
                  )}

                  <div className="relative cursor-pointer group">
                    <a href={`/detail/${product._id}`}>
                      <img
                        src={currentVariant?.mainImage || '/placeholder-product.jpg'}
                        alt={product.name}
                        className="w-full h-[350px] md:h-[450px] lg:h-[500px] object-cover"
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
                            const prevIndex = (currentIndex - 1 + product.variants.length) % product.variants.length;
                            handleVariantChange(product._id, product.variants[prevIndex]._id);
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
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
                          </svg>
                        </button>
                        <button
                          className="absolute right-2 top-1/2 -translate-y-1/2 bg-white bg-opacity-80 rounded-full p-2 shadow-md z-20"
                          onClick={(e) => {
                            e.stopPropagation();
                            const currentIndex = product.variants.findIndex(
                              (v) => v._id === selectedVariant[product._id]
                            );
                            const nextIndex = (currentIndex + 1) % product.variants.length;
                            handleVariantChange(product._id, product.variants[nextIndex]._id);
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
                            <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                          </svg>
                        </button>
                      </>
                    )}

                    {hoveredProductId === product._id && product.variants.length > 1 && (
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
                                  ? 'border-black border-2'
                                  : 'border-gray-300'
                              }`}
                              style={{
                                backgroundImage: `url(${variant.colorImage})`,
                                backgroundSize: 'cover',
                                backgroundPosition: 'center',
                              }}
                              aria-label={`Select ${variant.color} color`}
                            />
                          ))}
                        </div>
                      </div>
                    )}

                    <div
                      className={`absolute bottom-0 left-0 right-0 bg-white p-2 transition-opacity duration-300 ${
                        hoveredProductId === product._id ? 'opacity-100' : 'opacity-0'
                      }`}
                    >
                      <button className="w-full bg-white border border-gray-300 text-gray-700 py-3 font-medium uppercase">
                        QUICK BUY
                      </button>
                    </div>
                  </div>

                  <div className="mt-4 space-y-2">
                    <h3 className="text-sm font-medium line-clamp-2">{product.name}</h3>
                    <div className="flex items-center gap-2">
                      {priceInfo.discountPrice ? (
                        <>
                          <p className="text-sm font-medium">{priceInfo.discountPrice}</p>
                          <p className="text-sm text-gray-500 line-through">{priceInfo.price}</p>
                        </>
                      ) : (
                        <p className="text-sm">{priceInfo.price}</p>
                      )}
                    </div>
                    <p className="text-sm text-gray-500">
                      {currentVariant?.color || 'Various colors'}
                      {getAvailableSizes(product).length > 0 &&
                        ` • ${getAvailableSizes(product).length} sizes`}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
      <Footer />
    </>
  );
};

export default SearchResults;
