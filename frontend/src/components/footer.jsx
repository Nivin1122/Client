import React from 'react';
import { FaFacebook, FaYoutube, FaInstagram } from 'react-icons/fa';

const Footer = () => {
  return (
    <footer className="bg-[#FFE6E6] py-12 px-4 md:px-8 lg:px-16">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {/* News & Updates Section */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold mb-4">News & Updates</h3>
          <p className="text-sm text-gray-600 mb-4">
            Subscribe to our emailer list to get information about our New additions and Exclusive Offers.
          </p>
          <div className="flex flex-col space-y-2">
            <input
              type="email"
              placeholder="Enter email"
              className="p-2 border border-gray-300 rounded"
            />
            <button className="bg-[#1F2937] text-white px-4 py-2 rounded text-sm uppercase w-24">
              SIGN UP
            </button>
          </div>
        </div>

        {/* Reach out Section */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold mb-4">Reach out to us at</h3>
          <div className="space-y-2">
            <p className="text-sm">+91 7428211662</p>
            <p className="text-sm">Mon-Sat 10 am - 7 pm</p>
            <p className="text-sm">support@paulsonsonline.com</p>
          </div>
          <div className="space-y-2">
            <h4 className="text-sm font-semibold mt-4">Follow Us On</h4>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-600 hover:text-gray-900">
                <FaFacebook size={20} />
              </a>
              <a href="#" className="text-gray-600 hover:text-gray-900">
                <FaYoutube size={20} />
              </a>
              <a href="#" className="text-gray-600 hover:text-gray-900">
                <FaInstagram size={20} />
              </a>
            </div>
          </div>
        </div>

        {/* Useful links Section */}
        <div className="space-y-2">
          <h3 className="text-lg font-semibold mb-4">Useful links</h3>
          <ul className="space-y-2">
            <li><a href="#" className="text-sm text-gray-600 hover:text-gray-900">About Us</a></li>
            <li><a href="#" className="text-sm text-gray-600 hover:text-gray-900">Customer Reviews</a></li>
            <li><a href="#" className="text-sm text-gray-600 hover:text-gray-900">Shipping & Delivery</a></li>
            <li><a href="#" className="text-sm text-gray-600 hover:text-gray-900">Exchange & Return Policy</a></li>
            <li><a href="#" className="text-sm text-gray-600 hover:text-gray-900">Terms & Conditions</a></li>
            <li><a href="#" className="text-sm text-gray-600 hover:text-gray-900">Fabric Care & Wash Guidelines</a></li>
            <li><a href="#" className="text-sm text-gray-600 hover:text-gray-900">Privacy Policy</a></li>
            <li><a href="#" className="text-sm text-gray-600 hover:text-gray-900">Blogs</a></li>
          </ul>
        </div>

        {/* Quick links Section */}
        <div className="space-y-2">
          <h3 className="text-lg font-semibold mb-4">Quick links</h3>
          <ul className="space-y-2">
            <li><a href="#" className="text-sm text-gray-600 hover:text-gray-900">About Us</a></li>
            <li><a href="#" className="text-sm text-gray-600 hover:text-gray-900">Customer Reviews</a></li>
            <li><a href="#" className="text-sm text-gray-600 hover:text-gray-900">Shipping & Delivery</a></li>
            <li><a href="#" className="text-sm text-gray-600 hover:text-gray-900">Exchange & Return Policy</a></li>
            <li><a href="#" className="text-sm text-gray-600 hover:text-gray-900">Terms & Conditions</a></li>
            <li><a href="#" className="text-sm text-gray-600 hover:text-gray-900">Fabric Care & Wash Guidelines</a></li>
            <li><a href="#" className="text-sm text-gray-600 hover:text-gray-900">Privacy Policy</a></li>
            <li><a href="#" className="text-sm text-gray-600 hover:text-gray-900">Blogs</a></li>
          </ul>
        </div>
      </div>

      {/* Copyright Section */}
      <div className="mt-8 text-center text-sm text-gray-600">
        <p>© 2023 Paulsons. Celebrating Womanhood Since 1984</p>
      </div>
    </footer>
  );
};

export default Footer;