import React from "react";
import { FaFacebook, FaYoutube, FaInstagram } from "react-icons/fa";
import logo from "../assets/logo.webp";

const Footer = () => {
  return (
    <footer className="bg-gray-100 py-16 px-6 md:px-12 lg:px-20">
      <div className="max-w-7xl mx-auto">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-16">
          {/* Logo and Contact Section */}
          <div className="space-y-6">
            {/* Logo */}
            <div className="mb-8">
              <div className="flex items-center">
                <img src={logo} alt="" />
              </div>
            </div>
            
            {/* Contact Information */}
            <div className="space-y-3">
              <p className="text-gray-700 text-sm font-semibold leading-relaxed">
                <span className="font-semibold">Address:</span> TC 25/3347, Marian Enclave, Trivandrum,
              </p>
              <p className="text-gray-700 text-sm font-semibold">Kerala - 695003</p>
              <p className="text-gray-700 text-sm font-semibold">
                <span className="font-semibold">Email:</span> info@emirah.in
              </p>
              <p className="text-gray-700 text-sm font-semibold">
                <span className=" font-semibold">Phone:</span> 9947066664
              </p>
            </div>

            {/* Social Media Icons */}
            <div className="flex space-x-3 pt-4">
              <a href="#" className="w-10 h-10 border border-gray-300 rounded-full flex items-center justify-center hover:bg-gray-100 transition-colors">
                <svg className="w-5 h-5 text-gray-600" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
              </a>
              <a href="#" className="w-10 h-10 border border-gray-300 rounded-full flex items-center justify-center hover:bg-gray-100 transition-colors">
                <svg className="w-5 h-5 text-gray-600" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.174-.105-.949-.199-2.403.041-3.439.219-.937 1.406-5.957 1.406-5.957s-.359-.72-.359-1.781c0-1.663.967-2.911 2.168-2.911 1.024 0 1.518.769 1.518 1.688 0 1.029-.653 2.567-.992 3.992-.285 1.193.6 2.165 1.775 2.165 2.128 0 3.768-2.245 3.768-5.487 0-2.861-2.063-4.869-5.008-4.869-3.41 0-5.409 2.562-5.409 5.199 0 1.033.394 2.143.887 2.756.097.118.112.219.085.341-.09.381-.293 1.199-.334 1.363-.053.225-.172.271-.402.165-1.495-.69-2.433-2.878-2.433-4.646 0-3.776 2.748-7.252 7.92-7.252 4.158 0 7.392 2.967 7.392 6.923 0 4.135-2.607 7.462-6.233 7.462-1.214 0-2.357-.629-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24.009 12.017 24.009c6.624 0 11.99-5.367 11.99-11.986C24.007 5.367 18.641.001.012.001z"/>
                </svg>
              </a>
              <a href="#" className="w-10 h-10 border border-gray-300 rounded-full flex items-center justify-center hover:bg-gray-100 transition-colors">
                <svg className="w-5 h-5 text-gray-600" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.174-.105-.949-.199-2.403.041-3.439.219-.937 1.406-5.957 1.406-5.957s-.359-.72-.359-1.781c0-1.663.967-2.911 2.168-2.911 1.024 0 1.518.769 1.518 1.688 0 1.029-.653 2.567-.992 3.992-.285 1.193.6 2.165 1.775 2.165 2.128 0 3.768-2.245 3.768-5.487 0-2.861-2.063-4.869-5.008-4.869-3.41 0-5.409 2.562-5.409 5.199 0 1.033.394 2.143.887 2.756.097.118.112.219.085.341-.09.381-.293 1.199-.334 1.363-.053.225-.172.271-.402.165-1.495-.69-2.433-2.878-2.433-4.646 0-3.776 2.748-7.252 7.92-7.252 4.158 0 7.392 2.967 7.392 6.923 0 4.135-2.607 7.462-6.233 7.462-1.214 0-2.357-.629-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24.009 12.017 24.009c6.624 0 11.99-5.367 11.99-11.986C24.007 5.367 18.641.001.012.001z"/>
                </svg>
              </a>
              <a href="#" className="w-10 h-10 border border-gray-300 rounded-full flex items-center justify-center hover:bg-gray-100 transition-colors">
                <svg className="w-5 h-5 text-gray-600" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                </svg>
              </a>
              <a href="#" className="w-10 h-10 border border-gray-300 rounded-full flex items-center justify-center hover:bg-gray-100 transition-colors">
                <svg className="w-5 h-5 text-gray-600" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                </svg>
              </a>
            </div>
          </div>

          {/* Help Links */}
          <div>
            <h3 className="text-lg font-semibold mb-6 text-yellow-500">Help</h3>
            <ul className="space-y-3">
              <li><a href="/privacypolicy" className="text-[#001F3F] text-sm hover:text-gray-800 hover:underline transition-colors font-semibold">Privacy Policy</a></li>
              <li><a href="/returnandrefunds" className="text-[#001F3F] text-sm hover:text-gray-800 hover:underline transition-colors font-semibold">Returns & Refunds</a></li>
              <li><a href="/shipping" className="text-[#001F3F] text-sm hover:text-gray-800 hover:underline transition-colors font-semibold">Shipping</a></li>
              <li><a href="/termsandcondition" className="text-[#001F3F] text-sm hover:text-gray-800 hover:underline transition-colors font-semibold">Terms & Conditions</a></li>
              <li><a href="#" className="text-[#001F3F] text-sm hover:text-gray-800 hover:underline transition-colors font-semibold">FAQ's</a></li>
            </ul>
          </div>

          {/* About Us Links */}
          <div>
            <h3 className="text-lg font-semibold mb-6 text-yellow-500">About us</h3>
            <ul className="space-y-3">
              <li><a href="/about" className="text-[#001F3F] text-sm hover:text-gray-800 hover:underline transition-colors font-semibold">Our Story</a></li>
              <li><a href="#" className="text-[#001F3F] text-sm hover:text-gray-800 hover:underline transition-colors font-semibold">Visit Our Store</a></li>
              <li><a href="/contact" className="text-[#001F3F] text-sm hover:text-gray-800 hover:underline transition-colors font-semibold">Contact Us</a></li>
              <li><a href="/account" className="text-[#001F3F] text-sm hover:text-gray-800 hover:underline transition-colors font-semibold">My Account</a></li>
            </ul>
          </div>

          {/* Useful Links */}
          <div>
            <h3 className="text-lg font-semibold mb-6 text-yellow-500">Useful Link</h3>
            <ul className="space-y-3">
              <li><a href="/products?page=1&limit=8&category=68410ecb0fa10b2d72ec2515&sortBy=newest" className="text-[#001F3F] text-sm hover:text-gray-800 hover:underline transition-colors font-semibold">New Arrivals</a></li>
              <li><a href="/products?page=1&limit=8&category=684110490fa10b2d72ec25c5&sortBy=newest" className="text-[#001F3F] text-sm hover:text-gray-800 hover:underline transition-colors font-semibold">Bestseller</a></li>
              <li><a href="/products?page=1&limit=8&category=684110580fa10b2d72ec25c8&sortBy=newest" className="text-[#001F3F] text-sm hover:text-gray-800 hover:underline transition-colors font-semibold">Fabrics</a></li>
              <li><a href="/products?page=1&limit=8&category=684110670fa10b2d72ec25cb&sortBy=newest" className="text-[#001F3F] text-sm hover:text-gray-800 hover:underline transition-colors font-semibold">Ready to Wear</a></li>
            </ul>
            
            {/* Language Selector */}
            <div className="mt-6">
              <select className="text-gray-600 text-sm bg-transparent border-none outline-none cursor-pointer font-semibold">
                <option>English</option>
              </select>
            </div>
          </div>
        </div>

        {/* Bottom Section with Copyright and Payment Icons */}
        <div className="mt-16 pt-8 border-t border-gray-200 flex flex-col md:flex-row justify-between items-center">
          <div className="text-gray-500 text-sm mb-4 md:mb-0 font-semibold">
            © 2025 Emirah. All Rights Reserved | Powered by <span className="text-blue-600">BSN</span>
          </div>
          
          {/* Payment Icons */}
          <div className="flex items-center space-x-3">
            {/* Visa */}
            <div className="w-12 h-8 bg-blue-600 rounded-md flex items-center justify-center">
              <span className="text-white text-xs font-bold">VISA</span>
            </div>
            {/* Mastercard */}
            <div className="w-12 h-8 bg-gradient-to-r from-red-500 to-yellow-500 rounded-md flex items-center justify-center">
              <div className="flex space-x-0.5">
                <div className="w-2 h-2 bg-red-600 rounded-full opacity-80"></div>
                <div className="w-2 h-2 bg-yellow-500 rounded-full opacity-80"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};


export default Footer;
