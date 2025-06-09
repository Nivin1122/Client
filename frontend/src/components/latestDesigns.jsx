import React from "react";
import latestdesigner from "../assets/latestdesigner.png";

const LatestDesigns = () => {
  return (
    <div className="mx-auto py-10 md:py-10">
      <div className="flex flex-col items-center justify-center text-center mb-8 md:mb-5">
        <h2 className="text-2xl md:text-3xl font-medium">Fabrice</h2>
        <a
          href="https://client-1-6rax.onrender.com/products?page=1&limit=8&sortBy=newest"
          className="text-red-500 text-sm uppercase mt-2 underline"
        >
          VIEW ALL
        </a>
      </div>

      <div className="w-full relative overflow-hidden min-h-[400px] lg:min-h-[500px]">
        {/* Background Image without Overlay */}
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: `url(${latestdesigner})`,
          }}
        ></div>

        <div className="container mx-auto px-4 py-12 md:py-16 relative flex flex-col justify-between h-full min-h-[400px] lg:min-h-[500px]">
          <button
            className="absolute right-6 bottom-6 md:right-10 md:bottom-10 bg-white text-black px-8 py-3 rounded-sm hover:bg-gray-100 transition-colors text-sm tracking-wider font-medium shadow-md"
            onClick={() => {
              window.location.href =
                "https://client-1-6rax.onrender.com/products?page=1&limit=8&category=684110580fa10b2d72ec25c8&sortBy=newest";
            }}
          >
            SHOP NOW
          </button>
        </div>
      </div>
    </div>
  );
};

export default LatestDesigns;
