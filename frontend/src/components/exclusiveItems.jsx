import React from "react";
import exclusive from "../assets/exclusive.webp";

const ExclusiveItems = () => {
  return (
    <div className="relative w-full h-[60vh] sm:h-[70vh] md:h-[80vh] lg:h-[90vh] overflow-hidden">
      {/* Background Image with Overlay */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage: `url(${exclusive})`,
        }}
      ></div>

      {/* Content */}
      <div className="relative h-full flex flex-col items-center justify-center text-white text-center px-4">
        <h1 className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-playfair mb-4 sm:mb-6">
          Ready-to-Wear
        </h1>
        <p className="text-base sm:text-lg md:text-xl mb-6 sm:mb-10 tracking-wider">
          New Exclusive Collection
        </p>
        <button
          className="bg-[#010135] text-[#FFF5CC] px-8 sm:px-10 py-3 sm:py-4 hover:bg-opacity-90 transition-all uppercase text-xs sm:text-sm tracking-[0.2em] font-medium"
          onClick={() => {
            window.location.href =
              "/products?category=684110670fa10b2d72ec25cb&minPrice=0&maxPrice=10000&sortBy=newest";
          }}
        >
          SHOP NOW
        </button>
      </div>
    </div>
  );
};

export default ExclusiveItems;
