import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { fetchCartItems } from "../redux/slices/cartSlice";
import { fetchWishlistItems } from "../redux/slices/wishlistSlice";
import axiosInstance from "../utils/axiosInstance";

const Header = ({ onCategorySelect }) => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const dispatch = useDispatch();
  const { totalItems } = useSelector((state) => state.cart);
  const { totalItems: wishlistCount } = useSelector((state) => state.wishlist);
  
  const location = useLocation();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState(location.pathname);

  // Fetch categories from API
  useEffect(() => {
    dispatch(fetchCartItems());
    dispatch(fetchWishlistItems());
    const fetchCategories = async () => {
      try {
        setLoading(true);
        const response = await axiosInstance.get("/categories");
        // Add HOME as first category
        const allCategories = [
          { _id: "home", name: "HOME" },
          { _id: "all", name: "All" },
          ...response.data.categories
        ];
        setCategories(allCategories);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching categories:", err);
        setError("Failed to load categories");
        setLoading(false);
        
        // Fallback to some default categories if API fails
        setCategories([
          { _id: "home", name: "HOME" },
          { _id: "all", name: "All" },
          { _id: "new-arrivals", name: "New Arrivals" },
          { _id: "bestsellers", name: "Bestsellers" }
        ]);
      }
    };

    fetchCategories();
  }, []);

  const handleCategoryClick = (category) => {
    setActiveTab(category._id);
  
    if (category._id === "home") {
      navigate("/");
    } else if (category._id === "all") {
      navigate("/products");
    } else {
      navigate(`/products?category=${category._id}`);
      if (onCategorySelect) {
        onCategorySelect(category._id, category.name);
      }
    }
  };
  

  return (
    <header className="fixed top-0 left-0 right-0 bg-white z-50 shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between py-4">
          {/* Search */}
          <div className="flex items-center">
            <Link to="/search" className="flex items-center space-x-1 hover:text-red-400">
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
                  d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
                />
              </svg>
              <span>Search</span>
            </Link>
          </div>

          {/* Logo */}
          <div className="flex-1 flex justify-center">
            <Link to="/">
              <img
                src="https://paulsonsonline.com/cdn/shop/files/logo3_2_360x.png?v=1737022438"
                alt="Logo"
                className="h-12"
              />
            </Link>
          </div>

          {/* Account & Cart */}
          <div className="flex items-center space-x-4">
            <Link to="/account" className="hover:text-red-400">
              Account
            </Link>
            <Link to="/wishlist" className="hover:text-red-400 relative">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
              </svg>
              {wishlistCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {wishlistCount}
                </span>
              )}
            </Link>
            <Link to="/cart" className="hover:text-red-400 relative">
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
                  d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z"
                />
              </svg>
              {totalItems > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {totalItems}
                </span>
              )}
            </Link>
          </div>
        </div>

        {/* Navigation */}
        <nav className="border-t border-gray-200 overflow-x-auto">
          {loading ? (
            <div className="flex justify-center py-3">
              <div className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-solid border-current border-r-transparent"></div>
            </div>
          ) : (
            <div className="w-max mx-auto">
              <ul className="flex items-center justify-center space-x-4 py-3 whitespace-nowrap text-sm">
                {categories.map((category) => {
                  const isActive = activeTab === category._id;

                  return (
                    <li key={category._id}>
                      <button
                        onClick={() => handleCategoryClick(category)}
                        className={`${
                          isActive
                            ? "text-red-400 border-red-400"
                            : "text-gray-600 border-transparent"
                        } border-b-2 hover:text-red-400 hover:border-red-400 transition-colors duration-200`}
                      >
                        {category.name}
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>
          )}
        </nav>
      </div>
    </header>
  );
};

export default Header;