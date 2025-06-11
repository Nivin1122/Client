import React from "react";
import { FaFacebook, FaYoutube, FaInstagram } from "react-icons/fa";
import logo from "../assets/logo.webp";

const Footer = () => {
  return (
    <footer className="bg-[#010135] py-12 px-4 md:px-8 lg:px-16 text-[#FFF5CC]">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {/* Reach out Section */}
        <div className="space-y-4">
          <img src={logo} alt="logo" className="w-32" />
          <h3 className="text-lg font-semibold mb-4 text-[#E7C873]">Reach out to us at</h3>
          <div className="space-y-2 text-sm">
            <p>Address: TC 25/3347 , Marian Enclave, Trivandrum,</p>
            <p>Kerala - 695003</p>
            <p>Email: info@emirah.in</p>
            <p>Phone: 9947066664</p>
          </div>
          
          <div className="space-y-2">
            <h4 className="text-sm font-semibold mt-4 text-[#E7C873]">Follow Us On</h4>
            <div className="flex space-x-4 text-[#FFF5CC]">
              <a href="#" className="hover:text-[#E7C873]">
                <FaFacebook size={20} />
              </a>
              <a href="#" className="hover:text-[#E7C873]">
                <FaYoutube size={20} />
              </a>
              <a href="#" className="hover:text-[#E7C873]">
                <FaInstagram size={20} />
              </a>
            </div>
          </div>
        </div>

        {/* Help Links */}
        <div className="space-y-2">
          <h3 className="text-lg font-semibold mb-4 text-[#E7C873]">Help</h3>
          <ul className="space-y-2 text-sm">
            <li><a href="/privacypolicy" className="hover:text-[#E7C873]">Privacy Policy</a></li>
            <li><a href="/returnandrefunds" className="hover:text-[#E7C873]">Returns & Refunds</a></li>
            <li><a href="/shiping" className="hover:text-[#E7C873]">Shipping</a></li>
            <li><a href="/termsandcondition" className="hover:text-[#E7C873]">Terms & Conditions</a></li>
            <li><a href="#" className="hover:text-[#E7C873]">FAQ</a></li>
          </ul>
        </div>

        {/* About Us Links */}
        <div className="space-y-2">
          <h3 className="text-lg font-semibold mb-4 text-[#E7C873]">About Us</h3>
          <ul className="space-y-2 text-sm">
            <li><a href="/about" className="hover:text-[#E7C873]">About Us</a></li>
            <li><a href="#" className="hover:text-[#E7C873]">Visit Our Store</a></li>
            <li><a href="/contact" className="hover:text-[#E7C873]">Contact Us</a></li>
            <li><a href="/account" className="hover:text-[#E7C873]">My Account</a></li>
          </ul>
        </div>

        {/* Useful Product Links */}
        <div className="space-y-2">
          <h3 className="text-lg font-semibold mb-4 text-[#E7C873]">Useful Links</h3>
          <ul className="space-y-2 text-sm">
            <li><a href="/products?page=1&limit=8&category=68410ecb0fa10b2d72ec2515&sortBy=newest" className="hover:text-[#E7C873]">New Arrivals</a></li>
            <li><a href="/products?page=1&limit=8&category=684110490fa10b2d72ec25c5&sortBy=newest" className="hover:text-[#E7C873]">Bestseller</a></li>
            <li><a href="/products?page=1&limit=8&category=684110580fa10b2d72ec25c8&sortBy=newest" className="hover:text-[#E7C873]">Fabrics</a></li>
            <li><a href="/products?page=1&limit=8&category=684110670fa10b2d72ec25cb&sortBy=newest" className="hover:text-[#E7C873]">Ready to Wear</a></li>
          </ul>
        </div>
      </div>

      {/* Copyright */}
      <div className="mt-8 text-center text-sm text-[#E7C873]">
        <p>© 2024 Emirah. All Rights Reserved | Powered by crioweb</p>
      </div>
    </footer>
  );
};

export default Footer;
