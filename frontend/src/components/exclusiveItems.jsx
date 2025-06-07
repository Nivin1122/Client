import React from "react";
import exclusive from "../assets/bestseller.png";

const ExclusiveItems = () => {
  return (
    <div className="relative w-full h-[90vh] overflow-hidden">
      {/* Background Image with Overlay */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage: `url(${exclusive})`,
        }}
      ></div>

      {/* Content */}
      <div className="relative h-full flex flex-col items-center justify-center text-white text-center px-4">
        <h1 className="text-5xl md:text-6xl lg:text-7xl font-playfair mb-6">
          Ready-to-Wear
        </h1>
        <p className="text-lg md:text-xl mb-10 tracking-wider">
          New Exclusive Collection
        </p>
        <button
          className="bg-white text-black px-10 py-4 hover:bg-opacity-90 transition-all uppercase text-sm tracking-[0.2em] font-medium"
          onClick={() => {
            window.location.href =
              "http://localhost:5173/products?page=1&limit=8&category=684110670fa10b2d72ec25cb&sortBy=newest";
          }}
        >
          SHOP NOW
        </button>
      </div>
    </div>
  );
};

export default ExclusiveItems;
