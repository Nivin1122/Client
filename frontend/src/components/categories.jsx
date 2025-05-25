import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../utils/axiosInstance";

const Categories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await axiosInstance.get("/categories");
        const firstFourCategories = response.data.categories.slice(0, 4);

        // Fetch first product for each category
        const categoriesWithImages = await Promise.all(
          firstFourCategories.map(async (category) => {
            try {
              const productsResponse = await axiosInstance.get(
                `/products/get?category=${category._id}&page=1&limit=1`
              );
              const firstProduct = productsResponse.data.products[0];
              const firstVariant = firstProduct?.variants[0];
              return {
                _id: category._id,
                title: category.name,
                image: firstVariant?.mainImage || "",
              };
            } catch (error) {
              console.error("Error fetching product for category:", error);
              return {
                _id: category._id,
                title: category.name,
                image: "",
              };
            }
          })
        );

        setCategories(categoriesWithImages);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching categories:", error);
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  return (
    <div className="mx-auto px-4 py-10 md:py-10">
      <div className="text-center mb-8 md:mb-12">
        <h3 className="text-sm font-normal italic mb-0.5">
          Celebrating Womanhood
        </h3>
        <h4 className="text-sm font-normal italic mb-5">Since 1984</h4>
        <h2 className="text-2xl md:text-3xl font-medium">Our Categories</h2>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 md:gap-5">
        {categories.map((category, index) => (
          <div
            key={index}
            className="relative group overflow-hidden cursor-pointer aspect-[3/4]"
          >
            <img
              src={category.image}
              alt={category.title}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
            <div className="absolute inset-0 flex flex-col items-center justify-end bg-black bg-opacity-25 transition-all duration-300 group-hover:bg-opacity-35 pb-6">
              <h3 className="text-white text-base md:text-lg font-medium mb-3 md:mb-4 text-center px-2">
                {category.title}
              </h3>
              <button 
                onClick={() => {
                  navigate(`/products?category=${category._id}`);
                }}
                className="bg-white text-black px-5 md:px-7 py-1.5 md:py-2 text-xs md:text-sm font-medium tracking-wide hover:bg-opacity-95 transition-colors duration-300">
                SHOP NOW
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Categories;
