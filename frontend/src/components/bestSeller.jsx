import React, { useRef, useState } from "react";
import exclusive from '../assets/banner.png';

const BestSeller = () => {
  const scrollRef = useRef(null);
  const [hoveredProductId, setHoveredProductId] = useState(null);

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


  const products = [
    {
      id: 1,
      name: "Black Muslin Blend Printed With Embroidery Unstitched Suit Fabric Set With Georgette Printed With Embroidered Dupatta",
      price: "Rs. 3,760.00",
      color: "Black",
      image: exclusive,
      isNew: true,
    },
    {
      id: 2,
      name: "Green Linen Blend Embroidered Unstitched Suit Fabric Set With Kota Printed Dupatta",
      price: "Rs. 3,175.00",
      color: "Green",
      image: exclusive,
      isNew: true,
    },
    {
      id: 3,
      name: "Light Blue Linen Blend Embroidered Unstitched Suit Fabric Set With Kota Printed Dupatta",
      price: "Rs. 3,175.00",
      color: "Blue",
      image: exclusive,
      isNew: true,
    },
    {
      id: 4,
      name: "Beige Linen Blend Embroidered Unstitched Suit Fabric Set With Chanderi Printed Dupatta",
      price: "Rs. 3,175.00",
      color: "Beige",
      image: exclusive,
      isNew: true,
    },
    {
      id: 5,
      name: "Beige Linen Blend Embroidered Unstitched Suit Fabric Set With Chanderi Printed Dupatta",
      price: "Rs. 3,175.00",
      color: "Beige",
      image: exclusive,
      isNew: true,
    },
    {
      id: 6,
      name: "Beige Linen Blend Embroidered Unstitched Suit Fabric Set With Chanderi Printed Dupatta",
      price: "Rs. 3,175.00",
      color: "Beige",
      image: exclusive,
      isNew: true,
    },
  ];

  const handleProductMouseEnter = (id) => {
    setHoveredProductId(id);
  };

  const handleProductMouseLeave = () => {
    setHoveredProductId(null);
  };

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
              Best sellers
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
        <a href="#" className="text-red-500 text-sm uppercase">
          VIEW ALL
        </a>
      </div>

      <div className="overflow-x-auto scrollbar-hide" ref={scrollRef}>
        <div className="flex gap-4 md:gap-7 min-w-max pb-4">
          {products.map((product) => (
            <div 
              key={product.id} 
              className="relative w-[280px] md:w-[350px] lg:w-[400px]"
              onMouseEnter={() => handleProductMouseEnter(product.id)}
              onMouseLeave={handleProductMouseLeave}
            >
              {product.isNew && (
                <span className="absolute top-2 left-2 bg-green-500 text-white px-3 py-1 text-xs z-10">
                  New in
                </span>
              )}
              <div className="relative cursor-pointer group">
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-[350px] md:h-[450px] lg:h-[500px] object-cover"
                />
                
                {/* Navigation arrows on hover */}
                {hoveredProductId === product.id && (
                  <>
                    <button 
                      className="absolute left-2 top-1/2 -translate-y-1/2 bg-white bg-opacity-80 rounded-full p-2 shadow-md z-20"
                      onClick={(e) => {
                        e.stopPropagation();
                        // Navigate to previous product functionality would go here
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
                        // Navigate to next product functionality would go here
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
                <div className={`absolute bottom-0 left-0 right-0 bg-white p-2 transition-opacity duration-300 ${hoveredProductId === product.id ? 'opacity-100' : 'opacity-0'}`}>
                  <button className="w-full bg-white border border-gray-300 text-gray-700 py-3 font-medium uppercase">
                    QUICK BUY
                  </button>
                </div>
              </div>
              <div className="mt-4 space-y-2">
                <h3 className="text-sm font-medium line-clamp-2">
                  {product.name}
                </h3>
                <p className="text-sm">{product.price}</p>
                <p className="text-sm text-gray-500">{product.color}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <style jsx>{`
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