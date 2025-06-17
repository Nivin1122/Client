import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const Slider = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [direction, setDirection] = useState(0); // 1 for right, -1 for left
  const navigate = useNavigate()

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

  const handleShopNow = () => {
    navigate("/products?minPrice=0&maxPrice=10000&sortBy=newest");
  };

  const slideVariants = {
    enter: (direction) => ({
      x: direction > 0 ? 1000 : -1000,
      opacity: 0,
    }),
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1,
    },
    exit: (direction) => ({
      zIndex: 0,
      x: direction < 0 ? 1000 : -1000,
      opacity: 0,
    }),
  };

  const slideTransition = {
    x: { type: "spring", stiffness: 300, damping: 30 },
    opacity: { duration: 0.2 },
  };

  const nextSlide = useCallback(() => {
    if (banners.length > 0 && !isTransitioning) {
      setIsTransitioning(true);
      setDirection(1);
      setCurrentSlide((prev) => (prev + 1) % banners.length);
      setTimeout(() => setIsTransitioning(false), 500);
    }
  }, [banners.length, isTransitioning]);

  const prevSlide = useCallback(() => {
    if (banners.length > 0 && !isTransitioning) {
      setIsTransitioning(true);
      setDirection(-1);
      setCurrentSlide((prev) => (prev - 1 + banners.length) % banners.length);
      setTimeout(() => setIsTransitioning(false), 500);
    }
  }, [banners.length, isTransitioning]);

  const goToSlide = (index) => {
    if (!isTransitioning && index !== currentSlide) {
      setIsTransitioning(true);
      setDirection(index > currentSlide ? 1 : -1);
      setCurrentSlide(index);
      setTimeout(() => setIsTransitioning(false), 500);
    }
  };

  // Auto-slide functionality
  useEffect(() => {
    if (banners.length > 1) {
      const timer = setInterval(nextSlide, 5000);
      return () => clearInterval(timer);
    }
  }, [nextSlide, banners.length]);

  if (loading) {
    return (
      <div className="w-full h-screen flex items-center justify-center bg-gray-100">
        <motion.div
          className="flex flex-col items-center space-y-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <motion.div
            className="rounded-full h-12 w-12 border-4 border-golden-400 border-t-transparent"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          />
          <motion.p
            className="text-gray-600 font-medium"
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            Loading banners...
          </motion.p>
        </motion.div>
      </div>
    );
  }

  if (!banners.length) {
    return (
      <div className="w-full h-screen flex items-center justify-center bg-gray-100">
        <motion.p
          className="text-gray-600 text-lg font-medium"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          No banners available
        </motion.p>
      </div>
    );
  }

  return (
    <div className="relative w-full h-[50vh] sm:h-[60vh] md:h-[75vh] lg:h-screen overflow-hidden mt-24 sm:mt-[11rem]">
      {/* Slider Container */}
      <div className="relative h-full overflow-hidden">
        <AnimatePresence initial={false} custom={direction}>
          <motion.div
            key={currentSlide}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={slideTransition}
            className="absolute inset-0 w-full h-full"
          >
            {/* Background Image */}
            <div className="absolute inset-0">
              <img
                src={banners[currentSlide]?.image}
                alt={`Banner ${currentSlide + 1}`}
                className="w-full h-full object-cover"
                loading={currentSlide === 0 ? "eager" : "lazy"}
              />
              {/* Overlay for better text readability */}
              <div className="absolute inset-0 bg-black bg-opacity-20" />
            </div>

            {/* Centered Content */}
            <div className="absolute inset-0 flex items-center justify-center p-4 sm:p-6 md:p-8 lg:p-12">
              <motion.div
                className="text-center space-y-3 sm:space-y-4 md:space-y-6 max-w-2xl mx-auto"
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.6 }}
              >
                <motion.h2
                  className="text-base sm:text-lg md:text-xl font-semibold tracking-widest text-[#FFF5CC] drop-shadow"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3, duration: 0.5 }}
                >
                  {banners[currentSlide]?.title}
                </motion.h2>

                <motion.h1
                  className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold leading-tight text-[#FFF5CC]"
                  style={{
                    textShadow:
                      "2px 2px 6px rgba(1, 1, 53, 0.95), 0 0 15px rgba(255,245,204,0.4)",
                  }}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4, duration: 0.6 }}
                >
                  {banners[currentSlide]?.heading}
                </motion.h1>

                <motion.p
                  className="text-lg sm:text-xl md:text-2xl font-semibold leading-relaxed text-[#FFF5CC]"
                  style={{
                    textShadow: "1px 1px 4px rgba(1, 1, 53, 0.85)",
                  }}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5, duration: 0.5 }}
                >
                  {banners[currentSlide]?.description}
                </motion.p>

                <motion.button
                  onClick={handleShopNow}
                  className="bg-[#FFF5CC] text-[#010135] px-8 sm:px-10 md:px-12 py-4 sm:py-5 text-base sm:text-lg font-extrabold tracking-widest rounded-full shadow-lg hover:shadow-xl transform transition-all duration-300 mt-5 sm:mt-8"
                  style={{
                    boxShadow: "0 4px 15px rgba(255, 245, 204, 0.4)",
                  }}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6, duration: 0.5 }}
                  whileHover={{
                    scale: 1.08,
                    boxShadow: "0 8px 24px rgba(255, 245, 204, 0.6)",
                  }}
                  whileTap={{ scale: 0.95 }}
                >
                  SHOP NOW
                </motion.button>
              </motion.div>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Navigation Arrows */}
        {banners.length > 1 && (
          <>
            <motion.button
              onClick={prevSlide}
              disabled={isTransitioning}
              className="absolute left-4 sm:left-6 top-1/2 -translate-y-1/2 text-white p-3 sm:p-4 rounded-full bg-black bg-opacity-40 hover:bg-opacity-60 transition-all duration-300 z-30 disabled:opacity-50"
              aria-label="Previous slide"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.8 }}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2.5}
                stroke="currentColor"
                className="w-5 h-5 sm:w-6 sm:h-6"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15.75 19.5L8.25 12l7.5-7.5"
                />
              </svg>
            </motion.button>

            <motion.button
              onClick={nextSlide}
              disabled={isTransitioning}
              className="absolute right-4 sm:right-6 top-1/2 -translate-y-1/2 text-white p-3 sm:p-4 rounded-full bg-black bg-opacity-40 hover:bg-opacity-60 transition-all duration-300 z-30 disabled:opacity-50"
              aria-label="Next slide"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.8 }}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2.5}
                stroke="currentColor"
                className="w-5 h-5 sm:w-6 sm:h-6"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M8.25 4.5l7.5 7.5-7.5 7.5"
                />
              </svg>
            </motion.button>
          </>
        )}

        {/* Slide Indicators */}
        {banners.length > 1 && (
          <motion.div
            className="absolute bottom-4 sm:bottom-6 left-1/2 -translate-x-1/2 flex space-x-2 z-30"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9 }}
          >
            {banners.map((_, index) => (
              <motion.button
                key={index}
                onClick={() => goToSlide(index)}
                className={`w-3 h-3 rounded-full transition-all duration-300 ${
                  index === currentSlide
                    ? "bg-yellow-400 shadow-lg scale-125"
                    : "bg-white bg-opacity-50 hover:bg-opacity-75"
                }`}
                whileHover={{ scale: 1.2 }}
                whileTap={{ scale: 0.9 }}
                style={{
                  boxShadow:
                    index === currentSlide
                      ? "0 0 15px rgba(255,215,0,0.6)"
                      : "none",
                }}
              />
            ))}
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default Slider;
