import React, { useState, useEffect, useCallback } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { fetchCartItems } from "../redux/slices/cartSlice";
import { fetchWishlistItems } from "../redux/slices/wishlistSlice";
import axiosInstance from "../utils/axiosInstance";
import logo from "../assets/headerlogo.webp";
import SearchResultsDropdown from "./searchDropdown"; // We'll create this component

const debounce = (func, delay) => {
  let timer;
  return function (...args) {
    clearTimeout(timer);
    timer = setTimeout(() => func(...args), delay);
  };
};

const Header = ({ onCategorySelect }) => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [expandedCategories, setExpandedCategories] = useState(new Set());
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showSearchResults, setShowSearchResults] = useState(false);

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

  // Check auth and navigate
  const checkAuthAndNavigate = (path) => {
    if (!isAuthenticated) {
      navigate("/login");
      return false;
    }
    navigate(path);
    return true;
  };

  // Debounced search function
  const debouncedSearch = useCallback(
    debounce((query) => {
      if (query.trim()) {
        searchProducts(query);
      } else {
        setSearchResults([]);
        setShowSearchResults(false);
      }
    }, 300),
    []
  );

  useEffect(() => {
    if (searchQuery.trim()) {
      debouncedSearch(searchQuery);
    } else {
      setSearchResults([]);
      setShowSearchResults(false);
    }
  }, [searchQuery, debouncedSearch]);

  const searchProducts = async (query) => {
    try {
      setIsSearching(true);
      const response = await axiosInstance.get(
        `/products/product/search?query=${query}`
      );
      setSearchResults(response.data.products);
      setShowSearchResults(true);
      setIsSearching(false);
    } catch (err) {
      console.error("Error searching products:", err);
      setIsSearching(false);
      setShowSearchResults(false);
    }
  };

  // Group categories into parent-child structure
  const groupCategories = (categoriesData) => {
    const parentMap = {};
    const childrenMap = {};

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
        const activeCategories = response.data.categories.filter(
          (cat) => !cat.isDeleted
        );
        const groupedCategories = groupCategories(activeCategories);

        const allCategories = [
          { _id: "home", name: "HOME", children: [] },
          { _id: "shop", name: "SHOP", children: [] },
          ...groupedCategories,
        ];

        setCategories(allCategories);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching categories:", err);
        setLoading(false);
        setCategories([
          { _id: "home", name: "HOME", children: [] },
          { _id: "shop", name: "SHOP", children: [] },
        ]);
      }
    };

    fetchCategories();
  }, [dispatch]);

  const handleCategoryClick = (category) => {
    setActiveTab(category._id);
    setActiveDropdown(null);
    setIsSidebarOpen(false);

    if (category._id === "home") {
      navigate("/");
    } else if (category._id === "shop") {
      navigate("/products");
    } else {
      navigate(`/products?category=${category._id}`);
      if (onCategorySelect) {
        onCategorySelect(category._id);
      }
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setShowSearchResults(false);
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

  // Close sidebar and search results when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        isSidebarOpen &&
        !event.target.closest(".sidebar") &&
        !event.target.closest(".menu-toggle")
      ) {
        setIsSidebarOpen(false);
      }

      if (showSearchResults && !event.target.closest(".search-container")) {
        setShowSearchResults(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isSidebarOpen, showSearchResults]);

  // Prevent body scroll when sidebar is open
  useEffect(() => {
    if (isSidebarOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isSidebarOpen]);

  const messages = [
    "TRUSTED BY 65,000+ CUSTOMERS",
    "NEW COLLECTIONS EVERY MONTH",
    "1 LAKH+ HAPPY DELIVERIES",
    "4.9 / 5 BASED ON 6,000+ REVIEWS",
  ];

  return (
    <>
      <header className="fixed top-0 left-0 right-0 bg-white shadow-sm z-50">
        <div className="bg-[#001F3F] text-[#FFF5CC] py-2 overflow-hidden whitespace-nowrap">
          <div className="animate-marquee inline-block min-w-full">
            {messages.map((msg, index) => (
              <span
                key={index}
                className="mx-8 text-sm sm:text-base font-semibold"
              >
                {msg}
              </span>
            ))}
          </div>
        </div>
        {/* Top Bar */}
        <div className="bg-gray-100 text-gray-600 text-sm py-2 px-4">
          <div className="container mx-auto flex justify-between items-center">
            <div className="hidden md:block">Welcome to Emirah Shop!</div>
            <div className="flex items-center space-x-4 ml-auto">
              {isAuthenticated ? (
                <>
                  <Link
                    to="/account"
                    className="hover:text-gray-800 flex items-center"
                  >
                    <svg
                      className="w-4 h-4 mr-1"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                      />
                    </svg>
                    My Account
                  </Link>
                  <button
                    onClick={() => checkAuthAndNavigate("/wishlist")}
                    className="relative hover:text-gray-600 transition-colors"
                  >
                    <div className="flex items-center space-x-2">
                      <svg
                        className="w-6 h-6"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                        />
                      </svg>
                      <div className="hidden md:block text-sm">
                        <div className="font-semibold">Wishlist</div>
                      </div>
                    </div>
                    {wishlistCount > 0 && (
                      <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                        {wishlistCount}
                      </span>
                    )}
                  </button>
                </>
              ) : (
                <Link
                  to="/login"
                  className="hover:text-gray-800 flex items-center"
                >
                  <svg
                    className="w-4 h-4 mr-1"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"
                    />
                  </svg>
                  Log in
                </Link>
              )}
            </div>
          </div>
        </div>

        {/* Main Header */}
        <div className="bg-white border-b border-gray-200">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between py-4">
              {/* Mobile Menu Toggle */}
              <div className="md:hidden">
                <button
                  onClick={() => setIsSidebarOpen(true)}
                  className="menu-toggle p-2 hover:bg-gray-100 rounded-md transition-colors"
                  aria-label="Open menu"
                >
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 6h16M4 12h16M4 18h16"
                    />
                  </svg>
                </button>
              </div>

              {/* Logo */}
              <div className="flex-shrink-0">
                <Link to="/">
                  <img src={logo} alt="Emirah" className="h-14" />
                </Link>
              </div>

              {/* Desktop Search */}
              <div className="hidden md:flex items-center flex-1 max-w-2xl mx-8">
                <div className="relative w-full search-container">
                  <form onSubmit={handleSearch} className="flex">
                    <input
                      type="text"
                      placeholder="Search products..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <button
                      type="submit"
                      className="px-4 bg-gray-800 text-white rounded-r-md hover:bg-gray-700 transition-colors"
                    >
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                        />
                      </svg>
                    </button>
                  </form>

                  {/* Search Results Dropdown */}
                  {showSearchResults && (
                    <SearchResultsDropdown
                      searchResults={searchResults}
                      isSearching={isSearching}
                      onClose={() => setShowSearchResults(false)}
                      searchQuery={searchQuery}
                    />
                  )}
                </div>
              </div>

              {/* Cart */}
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => checkAuthAndNavigate("/cart")}
                  className="relative hover:text-gray-600 transition-colors"
                >
                  <div className="flex items-center space-x-2">
                    <svg
                      className="w-6 h-6"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13l2.5 5m0 0L17 18m0 0l2.5-5M17 18l-2.5-5"
                      />
                    </svg>
                    <div className="hidden md:block text-sm">
                      <div className="text-gray-600">
                        ({totalItems} item{totalItems !== 1 ? "s" : ""})
                      </div>
                      <div className="font-semibold">₹369.99</div>
                    </div>
                  </div>
                  {totalItems > 0 && (
                    <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                      {totalItems}
                    </span>
                  )}
                </button>
              </div>
            </div>

            {/* Mobile Search - Below logo on mobile */}
            <div className="md:hidden mt-4 mb-2">
              <div className="relative search-container">
                <form onSubmit={handleSearch} className="flex">
                  <input
                    type="text"
                    placeholder="Search products..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <button
                    type="submit"
                    className="px-4 bg-gray-800 text-white rounded-r-md hover:bg-gray-700 transition-colors"
                  >
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                      />
                    </svg>
                  </button>
                </form>

                {/* Mobile Search Results Dropdown */}
                {showSearchResults && (
                  <div className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-b-md shadow-lg z-50 mt-1 max-h-80 overflow-y-auto">
                    {isSearching ? (
                      <div className="flex justify-center items-center py-8">
                        <div className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-solid border-gray-800 border-r-transparent"></div>
                      </div>
                    ) : searchResults.length === 0 ? (
                      <div className="text-center py-8 text-gray-500">
                        No products found
                      </div>
                    ) : (
                      <div className="p-2">
                        {searchResults.slice(0, 4).map((product) => {
                          const variant = product.variants?.[0] || {};
                          const priceInfo = variant.sizes?.[0] || {};

                          return (
                            <Link
                              key={product._id}
                              to={`/detail/${product._id}`}
                              className="flex items-center space-x-3 p-2 hover:bg-gray-50 rounded-md transition-colors border-b border-gray-100 last:border-b-0"
                              onClick={() => setShowSearchResults(false)}
                            >
                              <img
                                src={
                                  variant.mainImage ||
                                  "/placeholder-product.jpg"
                                }
                                alt={product.name}
                                className="w-12 h-12 object-cover rounded"
                              />
                              <div className="flex-1 min-w-0">
                                <h4 className="text-sm font-medium text-gray-900 truncate">
                                  {product.name}
                                </h4>
                                <div className="flex items-center gap-2">
                                  {priceInfo.discountPrice ? (
                                    <>
                                      <p className="text-sm font-medium text-red-600">
                                        Rs. {priceInfo.discountPrice.toFixed(2)}
                                      </p>
                                      <p className="text-sm text-gray-500 line-through">
                                        Rs. {priceInfo.price.toFixed(2)}
                                      </p>
                                    </>
                                  ) : (
                                    <p className="text-sm text-gray-900">
                                      Rs. {priceInfo.price?.toFixed(2) || "N/A"}
                                    </p>
                                  )}
                                </div>
                              </div>
                            </Link>
                          );
                        })}
                        {searchResults.length > 4 && (
                          <div className="mt-2 text-center">
                            <Link
                              to={`/search?q=${encodeURIComponent(
                                searchQuery
                              )}`}
                              className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                              onClick={() => setShowSearchResults(false)}
                            >
                              View all {searchResults.length} results
                            </Link>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Menu */}
        <nav className="bg-[#001F3F] text-white hidden md:block">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-center space-x-8 py-3">
              {loading ? (
                <div className="flex justify-center py-3">
                  <div className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-solid border-white border-r-transparent"></div>
                </div>
              ) : (
                categories.map((category) => {
                  const isActive = activeTab === category._id;
                  return (
                    <div
                      key={category._id}
                      className="relative"
                      onMouseEnter={() => handleMouseEnter(category._id)}
                      onMouseLeave={handleMouseLeave}
                    >
                      <button
                        onClick={() => handleCategoryClick(category)}
                        className={`${
                          isActive ? "text-yellow-400" : "text-white"
                        } hover:text-yellow-400 transition-colors duration-200 flex items-center space-x-1 py-2 px-3 rounded-md`}
                      >
                        <span className="font-medium">{category.name}</span>
                        {category.children && category.children.length > 0 && (
                          <svg
                            className="w-4 h-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M19 9l-7 7-7-7"
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
                                    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-blue-600 transition-colors duration-200"
                                  >
                                    {child.name}
                                  </button>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </nav>
      </header>

      {/* Mobile Sidebar */}
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
                  className="w-6 h-6 text-gray-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            {/* Categories */}
            <div className="py-2">
              {loading ? (
                <div className="flex justify-center py-8">
                  <div className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-solid border-gray-800 border-r-transparent"></div>
                </div>
              ) : (
                <ul className="space-y-1">
                  {categories.map((category) => (
                    <li key={category._id}>
                      <div className="flex items-center">
                        <button
                          onClick={() => handleCategoryClick(category)}
                          className="flex-1 text-left px-4 py-3 text-gray-700 hover:bg-gray-50 hover:text-blue-600 transition-colors font-medium"
                        >
                          {category.name}
                        </button>
                        {category.children && category.children.length > 0 && (
                          <button
                            onClick={() =>
                              toggleCategoryExpansion(category._id)
                            }
                            className="p-3 hover:bg-gray-50 transition-colors"
                            aria-label={`Toggle ${category.name} subcategories`}
                          >
                            <svg
                              className={`w-4 h-4 text-gray-400 transform transition-transform ${
                                expandedCategories.has(category._id)
                                  ? "rotate-180"
                                  : ""
                              }`}
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M19 9l-7 7-7-7"
                              />
                            </svg>
                          </button>
                        )}
                      </div>

                      {/* Subcategories */}
                      {category.children &&
                        category.children.length > 0 &&
                        expandedCategories.has(category._id) && (
                          <ul className="bg-gray-50 border-l-2 border-blue-100 ml-4">
                            {category.children.map((child) => (
                              <li key={child._id}>
                                <button
                                  onClick={() => handleCategoryClick(child)}
                                  className="w-full text-left px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 hover:text-blue-600 transition-colors"
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
              {!isAuthenticated ? (
                <Link
                  to="/login"
                  onClick={closeSidebar}
                  className="flex items-center space-x-3 text-gray-700 hover:text-blue-600 transition-colors"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"
                    />
                  </svg>
                  <span className="font-medium">Login</span>
                </Link>
              ) : (
                <>
                  <Link
                    to="/account"
                    onClick={closeSidebar}
                    className="flex items-center space-x-3 text-gray-700 hover:text-blue-600 transition-colors"
                  >
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                      />
                    </svg>
                    <span className="font-medium">Account</span>
                  </Link>
                  <button
                    onClick={() => {
                      closeSidebar();
                      checkAuthAndNavigate("/wishlist");
                    }}
                    className="flex items-center space-x-3 text-gray-700 hover:text-blue-600 transition-colors w-full"
                  >
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                      />
                    </svg>
                    <span className="font-medium">Wishlist</span>
                    {wishlistCount > 0 && (
                      <span className="ml-auto bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                        {wishlistCount}
                      </span>
                    )}
                  </button>
                </>
              )}
            </div>

            {/* Contact Information */}
            <div className="border-t border-gray-200 p-4 bg-gray-50">
              <h3 className="text-sm font-semibold text-gray-800 mb-3">
                Need help?
              </h3>
              <div className="space-y-2 text-sm text-gray-600">
                <p>
                  <span className="font-medium">Address:</span> TC 25/3347,
                  Marian Enclave, Trivandrum, Kerala - 695003
                </p>
                <p>
                  <span className="font-medium">Email:</span>{" "}
                  <a
                    href="mailto:info@emirah.in"
                    className="text-blue-600 hover:underline"
                  >
                    info@emirah.in
                  </a>
                </p>
                <p>
                  <span className="font-medium">Phone:</span>{" "}
                  <a
                    href="tel:9947066664"
                    className="text-blue-600 hover:underline"
                  >
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
