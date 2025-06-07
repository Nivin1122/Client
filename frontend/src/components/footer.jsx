import React from "react";
import { FaFacebook, FaYoutube, FaInstagram } from "react-icons/fa";
import logo from "../assets/logo.webp";

const Footer = () => {
  return (
    <footer className="bg-[#FFE6E6] py-12 px-4 md:px-8 lg:px-16">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {/* Reach out Section */}
        <div className="space-y-4">
          <img src={logo} alt="logo" />
          <h3 className="text-lg font-semibold mb-4">Reach out to us at</h3>
          <div className="space-y-2">
            <p className="text-sm">
              Address: TC 25/3347 , Marian Enclave,Trivandrum,
            </p>
            <p className="text-sm">Kerala - 695003</p>
            <p className="text-sm">Email: info@emirah.in</p>
            <p className="text-sm">Phone: 9947066664</p>
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
          <h3 className="text-lg font-semibold mb-4">Help</h3>
          <ul className="space-y-2">
            <li>
              <a
                href="http://localhost:5173/privacypolicy"
                className="text-sm text-gray-600 hover:text-gray-900"
              >
                Privacy Policy
              </a>
            </li>
            <li>
              <a
                href="http://localhost:5173/refundsandreturn"
                className="text-sm text-gray-600 hover:text-gray-900"
              >
                Returns & Refunds
              </a>
            </li>
            <li>
              <a
                href="http://localhost:5173/shiping"
                className="text-sm text-gray-600 hover:text-gray-900"
              >
                Shipping
              </a>
            </li>
            <li>
              <a
                href="http://localhost:5173/termsandcondition"
                className="text-sm text-gray-600 hover:text-gray-900"
              >
                Terms & Conditions
              </a>
            </li>
            <li>
              <a
                href="http://localhost:5173/faq"
                className="text-sm text-gray-600 hover:text-gray-900"
              >
                FAQ
              </a>
            </li>
          </ul>
        </div>

        {/* Quick links Section */}
        <div className="space-y-2">
          <h3 className="text-lg font-semibold mb-4">About Us</h3>
          <ul className="space-y-2">
            <li>
              <a
                href="http://localhost:5173/about"
                className="text-sm text-gray-600 hover:text-gray-900"
              >
                About Us
              </a>
            </li>
            <li>
              <a href="#" className="text-sm text-gray-600 hover:text-gray-900">
                Visit Our Store
              </a>
            </li>
            <li>
              <a
                href="http://localhost:5173/contact"
                className="text-sm text-gray-600 hover:text-gray-900"
              >
                Contact Us
              </a>
            </li>
            <li>
              <a
                href="http://localhost:5173/account"
                className="text-sm text-gray-600 hover:text-gray-900"
              >
                My Account
              </a>
            </li>
          </ul>
        </div>

        <div className="space-y-2">
          <h3 className="text-lg font-semibold mb-4">Useful Link</h3>
          <ul className="space-y-2">
            <li>
              <a
                href="http://localhost:5173/products?page=1&limit=8&category=68410ecb0fa10b2d72ec2515&sortBy=newest"
                className="text-sm text-gray-600 hover:text-gray-900"
              >
                New Arrivals
              </a>
            </li>
            <li>
              <a
                href="http://localhost:5173/products?page=1&limit=8&category=684110490fa10b2d72ec25c5&sortBy=newest"
                className="text-sm text-gray-600 hover:text-gray-900"
              >
                Bestseller
              </a>
            </li>
            <li>
              <a
                href="http://localhost:5173/products?page=1&limit=8&category=684110580fa10b2d72ec25c8&sortBy=newest"
                className="text-sm text-gray-600 hover:text-gray-900"
              >
                Fabrics
              </a>
            </li>
            <li>
              <a
                href="http://localhost:5173/products?page=1&limit=8&category=684110670fa10b2d72ec25cb&sortBy=newest"
                className="text-sm text-gray-600 hover:text-gray-900"
              >
                Ready to Wear
              </a>
            </li>
          </ul>
        </div>
      </div>

      {/* Copyright Section */}
      <div className="mt-8 text-center text-sm text-gray-600">
        <p>© 2024 Emirah. All Rights Reserved | Powered by crioweb</p>
      </div>
    </footer>
  );
};

export default Footer;
