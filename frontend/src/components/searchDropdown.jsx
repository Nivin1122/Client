import React from 'react';
import { Link } from 'react-router-dom';

const SearchResultsDropdown = ({ searchResults, isSearching, onClose, searchQuery }) => {
  const getLowestPrice = (variants) => {
    if (!variants || variants.length === 0) return { price: 'N/A', discountPrice: null };
    
    let lowestPrice = Infinity;
    let discountPrice = null;
    
    variants.forEach((variant) => {
      variant.sizes?.forEach((size) => {
        if (size.price < lowestPrice) {
          lowestPrice = size.price;
          discountPrice = size.discountPrice;
        }
      });
    });

    return {
      price: lowestPrice === Infinity ? 'N/A' : `Rs. ${lowestPrice.toFixed(2)}`,
      discountPrice: discountPrice ? `Rs. ${discountPrice.toFixed(2)}` : null,
    };
  };

  return (
    <div className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-b-md shadow-lg max-h-96 overflow-y-auto z-50 mt-1">
      {isSearching ? (
        <div className="flex justify-center items-center py-8">
          <div className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-solid border-gray-800 border-r-transparent"></div>
        </div>
      ) : searchResults.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          No products found
        </div>
      ) : (
        <div className="p-4">
          <div className="grid grid-cols-2 gap-4">
            {searchResults.slice(0, 6).map((product) => {
              const priceInfo = getLowestPrice(product.variants);
              const variant = product.variants?.[0] || {};

              return (
                <Link
                  key={product._id}
                  to={`/detail/${product._id}`}
                  className="flex items-center space-x-3 p-2 hover:bg-gray-50 rounded-md transition-colors"
                  onClick={onClose}
                >
                  <img
                    src={variant.mainImage || '/placeholder-product.jpg'}
                    alt={product.name}
                    className="w-16 h-16 object-cover rounded"
                  />
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-medium text-gray-900 truncate">
                      {product.name}
                    </h4>
                    <div className="flex items-center gap-2">
                      {priceInfo.discountPrice ? (
                        <>
                          <p className="text-sm font-medium text-red-600">{priceInfo.discountPrice}</p>
                          <p className="text-sm text-gray-500 line-through">{priceInfo.price}</p>
                        </>
                      ) : (
                        <p className="text-sm text-gray-900">{priceInfo.price}</p>
                      )}
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
          {searchResults.length > 6 && (
            <div className="mt-4 text-center">
              <Link
                to={`/search?q=${encodeURIComponent(searchQuery)}`}
                className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                onClick={onClose}
              >
                View all {searchResults.length} results
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SearchResultsDropdown;