import React, { useState, useEffect, useRef } from 'react';
import exclusive from '../assets/bestseller.png';


// Placeholder for images since we can't use actual images
const generatePlaceholder = () => `/api/placeholder/100/100`;

const CustomerReviewCarousel = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [visibleReviews, setVisibleReviews] = useState([]);
  const [windowWidth, setWindowWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 0);
  const carouselRef = useRef(null);
  const intervalRef = useRef(null);
  
  const reviews = [
    {
      name: 'Kavitha vijjeswarapu',
      title: 'Comfy',
      text: 'Very good fabric',
      image: exclusive,
    },
    {
      name: 'Cinderella Seth Joseph',
      title: "It's beautiful",
      text: '',
      image: exclusive,
    },
    {
      name: 'Darshana keny',
      title: 'Black With Mustard Chanderi Silk Ikat',
      text: 'Unstitched Suit Fabric Set With Chanderi Dupatta',
      image: exclusive,
    },
    {
      name: 'Lipika Garg',
      title: 'Best quality pure fabric',
      text: '',
      image: exclusive,
    },
    {
      name: 'Anjali Ranjit',
      title: 'Trusted brand',
      text: 'Excellent quality…good fitting',
      image: exclusive,
    },
    {
      name: 'Anjali Ranjit',
      title: 'Trusted brand',
      text: 'Unstitched Suit Fabric Set With Chanderi Dupatta',
      image: exclusive,
    },
    {
      name: 'Anjali Ranjit',
      title: 'Trusted brand',
      text: 'Unstitched Suit Fabric Set With Chanderi Dupatta',
      image: exclusive,
    },
    {
      name: 'Anjali Ranjit',
      title: 'Trusted brand',
      text: 'Unstitched Suit Fabric Set With Chanderi Dupatta',
      image: exclusive,
    },
    {
      name: 'Anjali Ranjit',
      title: 'Trusted brand',
      text: 'Unstitched Suit Fabric Set With Chanderi Dupatta',
      image: exclusive,
    },
    {
      name: 'Anjali Ranjit',
      title: 'Trusted brand',
      text: 'Unstitched Suit Fabric Set With Chanderi Dupatta',
      image: exclusive,
    },
    {
      name: 'Anjali Ranjit',
      title: 'Trusted brand',
      text: 'Uasa as ada dsa dsad sasd',
      image: exclusive,
    },
  ];

  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };

    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  useEffect(() => {
    let reviewsToShow = 5;
    if (windowWidth < 768) {
      reviewsToShow = 1;
    } else if (windowWidth < 1024) {
      reviewsToShow = 3;
    }

    // Create an array with the correct number of visible items
    const startIdx = currentIndex % reviews.length;
    let visible = [];
    
    for (let i = 0; i < reviewsToShow; i++) {
      const idx = (startIdx + i) % reviews.length;
      visible.push(reviews[idx]);
    }
    
    setVisibleReviews(visible);
  }, [currentIndex, windowWidth, reviews.length]);

  // Auto-play carousel
  useEffect(() => {
    intervalRef.current = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % reviews.length);
    }, 3000);
    
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [reviews.length]);

  const goToPrev = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    setCurrentIndex((prev) => (prev - 1 + reviews.length) % reviews.length);
    // Restart auto-play after user interaction
    intervalRef.current = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % reviews.length);
    }, 3000);
  };

  const goToNext = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    setCurrentIndex((prev) => (prev + 1) % reviews.length);
    // Restart auto-play after user interaction
    intervalRef.current = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % reviews.length);
    }, 3000);
  };

  const StarRating = () => (
    <div className="flex justify-center">
      {[...Array(5)].map((_, i) => (
        <svg key={i} className="w-5 h-5 text-red-500" fill="currentColor" viewBox="0 0 20 20">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  );

  return (
    <div className="w-full bg-white py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Title and Overall Rating */}
        <div className="text-center mb-8">
          <h2 className="text-3xl font-serif text-gray-800 mb-2">Words from our customers</h2>
          <div className="flex justify-center items-center">
            <StarRating />
            <span className="ml-2 text-gray-500 text-sm">from 603 reviews</span>
            <svg className="w-4 h-4 ml-1 text-green-500" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
          </div>
        </div>

        {/* Reviews Carousel */}
        <div className="relative overflow-hidden" ref={carouselRef}>
          <div className="flex transition-transform duration-500 ease-in-out" 
               style={{ transform: `translateX(-${currentIndex * (100 / (windowWidth < 768 ? 1 : windowWidth < 1024 ? 3 : 5))}%)` }}>
            {reviews.map((review, index) => (
              <div key={index} className={`${windowWidth < 768 ? 'w-full' : windowWidth < 1024 ? 'w-1/3' : 'w-1/5'} flex-shrink-0 px-2`}>
                <div className="flex flex-col items-center">
                  <StarRating />
                  <h3 className="text-center font-medium text-gray-800 mt-1">{review.title}</h3>
                  <p className="text-center text-sm text-gray-600 mb-4">{review.text}</p>
                  <div className="flex justify-center">
                    <img 
                      src={review.image} 
                      alt={`Review by ${review.name}`} 
                      className="w-20 h-20 object-cover rounded" 
                    />
                  </div>
                  <p className="text-center text-xs text-gray-500 mt-2">{review.name}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Navigation Buttons */}
          <button 
            onClick={goToPrev}
            className="absolute top-1/2 left-0 -translate-y-1/2 bg-white p-2 rounded-full shadow z-10"
            aria-label="Previous"
          >
            <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <button 
            onClick={goToNext}
            className="absolute top-1/2 right-0 -translate-y-1/2 bg-white p-2 rounded-full shadow z-10"
            aria-label="Next"
          >
            <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default CustomerReviewCarousel;  