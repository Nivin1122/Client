import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";

const Slider = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [direction, setDirection] = useState("right"); // Track slide direction

  useEffect(() => {
    const fetchBanners = async () => {
      try {
        const response = await axios.get(
          "https://client-1-6rax.onrender.com/api/banners"
        );
        setBanners(response.data);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching banners:", error);
        setLoading(false);
      }
    };
    fetchBanners();
  }, []);

  const nextSlide = useCallback(() => {
    if (banners.length > 0 && !isTransitioning) {
      setDirection("right");
      setIsTransitioning(true);
      setCurrentSlide((prev) => (prev + 1) % banners.length);
      setTimeout(() => setIsTransitioning(false), 700); // Match this with CSS transition duration
    }
  }, [banners.length, isTransitioning]);

  const prevSlide = useCallback(() => {
    if (banners.length > 0 && !isTransitioning) {
      setDirection("left");
      setIsTransitioning(true);
      setCurrentSlide((prev) => (prev - 1 + banners.length) % banners.length);
      setTimeout(() => setIsTransitioning(false), 700); // Match this with CSS transition duration
    }
  }, [banners.length, isTransitioning]);

  const goToSlide = (index) => {
    if (!isTransitioning && index !== currentSlide) {
      setDirection(index > currentSlide ? "right" : "left");
      setIsTransitioning(true);
      setCurrentSlide(index);
      setTimeout(() => setIsTransitioning(false), 700);
    }
  };

  // Auto-slide functionality with proper cleanup
  useEffect(() => {
    if (banners.length > 1) {
      const timer = setInterval(nextSlide, 5000);
      return () => clearInterval(timer);
    }
  }, [nextSlide, banners.length]);

  // Reset slide when banners change
  useEffect(() => {
    if (banners.length > 0 && currentSlide >= banners.length) {
      setCurrentSlide(0);
    }
  }, [banners.length, currentSlide]);

  if (loading) {
    return (
      <div className="w-full h-screen flex items-center justify-center bg-gray-100">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
          <p className="text-gray-600">Loading banners...</p>
        </div>
      </div>
    );
  }

  if (!banners.length) {
    return (
      <div className="w-full h-screen flex items-center justify-center bg-gray-100">
        <p className="text-gray-600">No banners available</p>
      </div>
    );
  }

  return (
    <div className="relative w-full h-[50vh] sm:h-[60vh] md:h-[75vh] lg:h-screen overflow-hidden mt-24 mt-[8rem]">
      {/* Slider Container */}
      <div className="relative h-full overflow-hidden">
        {banners.map((banner, index) => {
          // Calculate slide position
          let translateX = "0%";
          if (index === currentSlide) {
            translateX = "0%";
          } else if (
            (direction === "right" &&
              index === (currentSlide - 1 + banners.length) % banners.length) ||
            (direction === "left" &&
              index === (currentSlide + 1) % banners.length)
          ) {
            translateX = direction === "right" ? "-100%" : "100%";
          } else {
            translateX = index < currentSlide ? "-100%" : "100%";
          }

          return (
            <div
              key={index}
              className={`absolute inset-0 w-full h-full transition-transform duration-700 ease-in-out`}
              style={{
                transform: `translateX(${translateX})`,
                zIndex: index === currentSlide ? 10 : 0,
              }}
            >
              {/* Background Image */}
              <div className="absolute inset-0">
                <img
                  src={banner.image}
                  alt={`Banner ${index + 1}`}
                  className="w-full h-full object-cover"
                  loading={index === 0 ? "eager" : "lazy"}
                />
              </div>

              {/* Content positioned at bottom right */}
              <div className="absolute inset-0 flex items-end justify-end p-4 sm:p-6 md:p-8 lg:p-12">
                <div className="max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg text-white space-y-2 sm:space-y-3 md:space-y-4 text-right">
                  <h2 className="text-xs sm:text-sm font-light tracking-wider opacity-90">
                    {banner.title}
                  </h2>
                  <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold leading-tight">
                    {banner.heading}
                  </h1>
                  <p className="text-xs sm:text-sm md:text-base font-light leading-relaxed opacity-90 max-w-xs sm:max-w-sm">
                    {banner.description}
                  </p>
                  <button className="bg-[#010135] text-[#FFF5CC] px-4 sm:px-6 md:px-8 py-2 sm:py-3 text-xs sm:text-sm font-medium tracking-wider hover:bg-gray-100 transition-colors duration-300 mt-3 sm:mt-4">
                    SHOP NOW
                  </button>
                </div>
              </div>
            </div>
          );
        })}

        {/* Navigation Arrows - Only show if more than 1 banner */}
        {banners.length > 1 && (
          <>
            <button
              onClick={prevSlide}
              disabled={isTransitioning}
              className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 text-white p-2 sm:p-3 rounded-full bg-black bg-opacity-30 hover:bg-opacity-50 transition-all duration-300 z-30 disabled:opacity-50"
              aria-label="Previous slide"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
                className="w-4 h-4 sm:w-5 sm:h-5"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15.75 19.5L8.25 12l7.5-7.5"
                />
              </svg>
            </button>

            <button
              onClick={nextSlide}
              disabled={isTransitioning}
              className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 text-white p-2 sm:p-3 rounded-full bg-black bg-opacity-30 hover:bg-opacity-50 transition-all duration-300 z-30 disabled:opacity-50"
              aria-label="Next slide"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
                className="w-4 h-4 sm:w-5 sm:h-5"
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
      </div>
    </div>
  );
};

export default Slider;
