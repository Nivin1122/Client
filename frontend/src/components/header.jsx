import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { fetchCartItems } from "../redux/slices/cartSlice";
import { fetchWishlistItems } from "../redux/slices/wishlistSlice";
import axiosInstance from "../utils/axiosInstance";
import logo from '../assets/headerlogo.webp'

const Header = ({ onCategorySelect }) => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeDropdown, setActiveDropdown] = useState(null);
  const dispatch = useDispatch();
  const { totalItems } = useSelector((state) => state.cart);
  const { totalItems: wishlistCount } = useSelector((state) => state.wishlist);

  const location = useLocation();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState(location.pathname);

  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    setIsAuthenticated(!!token);
  }, [location]);

  // Group categories into parent-child structure
  const groupCategories = (categoriesData) => {
    const parentMap = {};
    const childrenMap = {};

    // First pass: separate parents and children
    categoriesData.forEach((cat) => {
      if (!cat.parent) {
        parentMap[cat._id] = { ...cat, children: [] };
      } else {
        const parentId =
          typeof cat.parent === "object" ? cat.parent._id : cat.parent;
        if (!childrenMap[parentId]) {
          childrenMap[parentId] = [];
        }
        childrenMap[parentId].push(cat);
      }
    });

    // Second pass: attach children to parents
    Object.keys(childrenMap).forEach((parentId) => {
      if (parentMap[parentId]) {
        parentMap[parentId].children = childrenMap[parentId];
      }
    });

    return Object.values(parentMap);
  };

  // Fetch categories from API
  useEffect(() => {
    dispatch(fetchCartItems());
    dispatch(fetchWishlistItems());

    const fetchCategories = async () => {
      try {
        setLoading(true);
        const response = await axiosInstance.get("/categories");

        // Filter out deleted categories
        const activeCategories = response.data.categories.filter(
          (cat) => !cat.isDeleted
        );

        // Group categories and add static items
        const groupedCategories = groupCategories(activeCategories);

        const allCategories = [
          { _id: "home", name: "HOME", children: [] },
          { _id: "all", name: "All", children: [] },
          ...groupedCategories,
        ];

        setCategories(allCategories);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching categories:", err);
        setError("Failed to load categories");
        setLoading(false);

        // Fallback categories
        setCategories([
          { _id: "home", name: "HOME", children: [] },
          { _id: "all", name: "All", children: [] },
          { _id: "new-arrivals", name: "New Arrivals", children: [] },
          { _id: "bestsellers", name: "Bestsellers", children: [] },
        ]);
      }
    };

    fetchCategories();
  }, [dispatch]);

  const handleCategoryClick = (category) => {
    setActiveTab(category._id);
    setActiveDropdown(null); // Close dropdown

    if (category._id === "home") {
      navigate("/");
    } else if (category._id === "all") {
      navigate("/products");
    } else {
      navigate(`/products?category=${category._id}`);
      if (onCategorySelect) {
        onCategorySelect(category._id);
      }
    }
  };

  let dropdownTimeout;

  const handleMouseEnter = (categoryId) => {
    clearTimeout(dropdownTimeout);
    setActiveDropdown(categoryId);
  };

  const handleMouseLeave = () => {
    dropdownTimeout = setTimeout(() => {
      setActiveDropdown(null);
    }, 200); // 200ms delay before closing submenu
  };

  return (
    <header className="fixed top-0 left-0 right-0 text-[#FFF5CC] bg-[#010135] z-50 shadow-sm ">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between py-4">
          {/* Search */}
          <div className="flex items-center ">
            <Link
              to="/search"
              className="flex items-center space-x-1 hover:text-red-400"
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
                  d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
                />
              </svg>
              <span>Search</span>
            </Link>
          </div>

          {/* Logo - Uncomment when needed */}
          <div className="flex-1 flex justify-center">
            <Link to="/">
              <img
                src={logo}
                alt="Logo"
                className="h-12"
              />
            </Link>
          </div>

          {/* Account & Cart */}
          <div className="flex items-center space-x-4">
            {isAuthenticated ? (
              <>
                <Link to="/account" className="hover:text-red-400">
                  Account
                </Link>
                <Link to="/wishlist" className="hover:text-red-400 relative">
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
                      d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z"
                    />
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
              </>
            ) : (
              <Link to="/login" className="hover:text-red-400">
                Login
              </Link>
            )}
          </div>
        </div>

        {/* Navigation with Dropdown */}
        <nav className="border-t border-gray-200 overflow-visible relative ">
          {loading ? (
            <div className="flex justify-center py-3">
              <div className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-solid border-current border-r-transparent"></div>
            </div>
          ) : (
            <div className="w-max mx-auto"> 
              <ul className="flex items-center  justify-center space-x-4 py-3 whitespace-nowrap text-sm">
                {categories.map((category) => {
                  const isActive = activeTab === category._id;
                  const hasChildren =
                    category.children && category.children.length > 0;

                  return (
                    <li
                      key={category._id}
                      className="relative"
                      onMouseEnter={() => handleMouseEnter(category._id)}
                      onMouseLeave={handleMouseLeave}
                    >
                      <button
                        onClick={() => handleCategoryClick(category)}
                        className={`${
                          activeTab === category._id
                            ? "text-red-400 border-red-400"
                            : "text-[#FFF5CC] border-transparent"
                        } border-b-2 hover:text-red-400 hover:border-red-400 transition-colors duration-200 flex items-center gap-1`}
                      >
                        {category.name}
                        {category.children && category.children.length > 0 && (
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth={1.5}
                            stroke="currentColor"
                            className="w-3 h-3"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M19.5 8.25l-7.5 7.5-7.5-7.5"
                            />
                          </svg>
                        )}
                      </button>

                      {category.children &&
                        category.children.length > 0 &&
                        activeDropdown === category._id && (
                          <div className="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded-md shadow-lg min-w-[200px] z-50">
                            <ul className="py-2">
                              {category.children.map((child) => (
                                <li key={child._id}>
                                  <button
                                    onClick={() => handleCategoryClick(child)}
                                    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-red-400 transition-colors duration-200"
                                  >
                                    {child.name}
                                  </button>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
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
