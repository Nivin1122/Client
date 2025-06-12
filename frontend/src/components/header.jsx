import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { fetchCartItems } from "../redux/slices/cartSlice";
import { fetchWishlistItems } from "../redux/slices/wishlistSlice";
import axiosInstance from "../utils/axiosInstance";
import logo from "../assets/headerlogo.webp";
import Announcement from "./anouncement";

const Header = ({ onCategorySelect }) => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [expandedCategories, setExpandedCategories] = useState(new Set());
  
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
    setActiveDropdown(null);
    setIsSidebarOpen(false); // Close sidebar on category selection

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

  const toggleCategoryExpansion = (categoryId) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(categoryId)) {
      newExpanded.delete(categoryId);
    } else {
      newExpanded.add(categoryId);
    }
    setExpandedCategories(newExpanded);
  };

  let dropdownTimeout;

  const handleMouseEnter = (categoryId) => {
    clearTimeout(dropdownTimeout);
    setActiveDropdown(categoryId);
  };

  const handleMouseLeave = () => {
    dropdownTimeout = setTimeout(() => {
      setActiveDropdown(null);
    }, 200);
  };

  const closeSidebar = () => {
    setIsSidebarOpen(false);
  };

  // Close sidebar when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isSidebarOpen && !event.target.closest('.sidebar') && !event.target.closest('.menu-toggle')) {
        setIsSidebarOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isSidebarOpen]);

  // Prevent body scroll when sidebar is open
  useEffect(() => {
    if (isSidebarOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isSidebarOpen]);

  return (
    <>
      <header className="fixed top-0 left-0 right-0 text-[#FFF5CC] bg-[#010135] z-50 shadow-sm">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between py-4">
            {/* Mobile Menu Toggle & Search - visible on small screens */}
            <div className="flex items-center space-x-3 md:hidden">
              <button
                onClick={() => setIsSidebarOpen(true)}
                className="menu-toggle p-1 hover:text-red-400 transition-colors"
                aria-label="Open menu"
              >
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
                    d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
                  />
                </svg>
              </button>
              
              <Link
                to="/search"
                className="flex items-center hover:text-red-400"
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
              </Link>
            </div>

            {/* Desktop Search - hidden on small screens */}
            <div className="hidden md:flex items-center">
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

            {/* Logo */}
            <div className="flex-1 flex justify-center">
              <Link to="/">
                <img src={logo} alt="Logo" className="h-12" />
              </Link>
            </div>

            {/* Account & Cart */}
            <div className="flex items-center space-x-4">
              {isAuthenticated ? (
                <>
                  <Link to="/account" className="hover:text-red-400 hidden md:block">
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
                      <span className="absolute -top-2 -right-2 bg-[#FFF5CC] text-red-500 text-xs rounded-full h-5 w-5 flex items-center justify-center">
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
                      <span className="absolute -top-2 -right-2 bg-[#FFF5CC] text-red-500 text-xs rounded-full h-5 w-5 flex items-center justify-center">
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

          {/* Desktop Navigation */}
          <nav className="border-t border-gray-200 relative hidden md:block">
            {loading ? (
              <div className="flex justify-center py-3">
                <div className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-solid border-current border-r-transparent"></div>
              </div>
            ) : (
              <div className="w-full overflow-x-auto scrollbar-hide">
                <ul className="flex items-center justify-start md:justify-center space-x-4 py-3 whitespace-nowrap text-sm px-4">
                  {categories.map((category) => {
                    const isActive = activeTab === category._id;

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
                            isActive
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

      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 md:hidden">
          <div className="sidebar fixed left-0 top-0 h-full w-80 bg-white shadow-lg transform transition-transform duration-300 ease-in-out overflow-y-auto">
            {/* Sidebar Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-800">Menu</h2>
              <button
                onClick={closeSidebar}
                className="p-1 hover:bg-gray-100 rounded-full transition-colors"
                aria-label="Close menu"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="w-6 h-6 text-gray-600"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            {/* Search in Sidebar */}
            <div className="p-4 border-b border-gray-200">
              <Link
                to="/search"
                onClick={closeSidebar}
                className="flex items-center space-x-3 text-gray-700 hover:text-red-400 transition-colors"
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
                <span className="font-medium">Search</span>
              </Link>
            </div>

            {/* Categories */}
            <div className="py-2">
              {loading ? (
                <div className="flex justify-center py-8">
                  <div className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-solid border-red-400 border-r-transparent"></div>
                </div>
              ) : (
                <ul className="space-y-1">
                  {categories.map((category) => (
                    <li key={category._id}>
                      <div className="flex items-center">
                        <button
                          onClick={() => handleCategoryClick(category)}
                          className="flex-1 text-left px-4 py-3 text-gray-700 hover:bg-gray-50 hover:text-red-400 transition-colors font-medium"
                        >
                          {category.name}
                        </button>
                        {category.children && category.children.length > 0 && (
                          <button
                            onClick={() => toggleCategoryExpansion(category._id)}
                            className="p-3 hover:bg-gray-50 transition-colors"
                            aria-label={`Toggle ${category.name} subcategories`}
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              fill="none"
                              viewBox="0 0 24 24"
                              strokeWidth={1.5}
                              stroke="currentColor"
                              className={`w-4 h-4 text-gray-400 transform transition-transform ${
                                expandedCategories.has(category._id) ? 'rotate-180' : ''
                              }`}
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M19.5 8.25l-7.5 7.5-7.5-7.5"
                              />
                            </svg>
                          </button>
                        )}
                      </div>
                      
                      {/* Subcategories */}
                      {category.children &&
                        category.children.length > 0 &&
                        expandedCategories.has(category._id) && (
                          <ul className="bg-gray-50 border-l-2 border-red-100 ml-4">
                            {category.children.map((child) => (
                              <li key={child._id}>
                                <button
                                  onClick={() => handleCategoryClick(child)}
                                  className="w-full text-left px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 hover:text-red-400 transition-colors"
                                >
                                  {child.name}
                                </button>
                              </li>
                            ))} 
                          </ul>
                        )}
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* User Actions */}
            <div className="border-t border-gray-200 p-4 space-y-3">
              {!isAuthenticated && (
                <Link
                  to="/login"
                  onClick={closeSidebar}
                  className="flex items-center space-x-3 text-gray-700 hover:text-red-400 transition-colors"
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
                      d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z"
                    />
                  </svg>
                  <span className="font-medium">Login</span>
                </Link>
              )}

              {isAuthenticated && (
                <Link
                  to="/account"
                  onClick={closeSidebar}
                  className="flex items-center space-x-3 text-gray-700 hover:text-red-400 transition-colors"
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
                      d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z"
                    />
                  </svg>
                  <span className="font-medium">Account</span>
                </Link>
              )}
            </div>

            {/* Contact Information */}
            <div className="border-t border-gray-200 p-4 bg-gray-50">
              <h3 className="text-sm font-semibold text-gray-800 mb-3">Need help?</h3>
              <div className="space-y-2 text-sm text-gray-600">
                <p>
                  <span className="font-medium">Address:</span> TC 25/3347, Marian Enclave, Trivandrum, Kerala - 695003
                </p>
                <p>
                  <span className="font-medium">Email:</span>{" "}
                  <a href="mailto:info@emirah.in" className="text-red-400 hover:underline">
                    info@emirah.in
                  </a>
                </p>
                <p>
                  <span className="font-medium">Phone:</span>{" "}
                  <a href="tel:9947066664" className="text-red-400 hover:underline">
                    9947066664
                  </a>
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Header;