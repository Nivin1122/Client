import Footer from "@/components/footer";
import Header from "@/components/header";
import React from "react";

const Contact = () => {
  return (
    <>
      <Header />
      <div className="pt-10 mt-20">
        {/* Google Map */}
        <div className="w-full h-[400px]">
          <iframe
            className="w-full h-full border-0"
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3931.199469718836!2d76.96147477491188!3d8.520604797319763!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3b05bbb499f33ae3%3A0x8a937d79c29b3b44!2sEmirah%20Fashion%20Store!5e0!3m2!1sen!2sin!4v1717765563261!5m2!1sen!2sin"
            allowFullScreen=""
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            title="Emirah Fashion Store Location"
          ></iframe>
        </div>

        {/* Contact Info and Form */}
        <div className="max-w-7xl mx-auto px-6 py-16 grid grid-cols-1 md:grid-cols-2 gap-12">
          {/* Visit Our Store */}
          <div>
            <h2 className="text-2xl font-semibold mb-4">Visit Our Store</h2>
            <div className="text-gray-700 space-y-4">
              <div>
                <strong>Address:</strong>
                <p>TC 25/3347, Marian Enclave, Trivandrum, Kerala - 695003</p>
              </div>
              <div>
                <strong>Phone:</strong>
                <p>9947066664</p>
              </div>
              <div>
                <strong>Email:</strong>
                <p className="text-blue-600 underline">info@emirah.in</p>
              </div>
              <div>
                <strong>Open Time:</strong>
                <p>Every day 10am to 8.30pm</p>
              </div>
              {/* Social Links */}
              <div className="flex space-x-4 pt-4 text-xl">
                <a href="#" className="hover:text-black">
                  <i className="fab fa-facebook-f"></i>
                </a>
                <a href="#" className="hover:text-black">
                  <i className="fab fa-instagram"></i>
                </a>
                <a href="#" className="hover:text-black">
                  <i className="fab fa-pinterest-p"></i>
                </a>
                <a href="#" className="hover:text-black">
                  <i className="fab fa-tiktok"></i>
                </a>
              </div>
            </div>
          </div>

          {/* Get in Touch Form */}
          <div>
            <h2 className="text-2xl font-semibold mb-2">Get in Touch</h2>
            <p className="text-gray-600 mb-6">
              If you've got great products you're making or looking to work with
              us, drop us a line.
            </p>
            <form className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <input
                  type="text"
                  placeholder="Name *"
                  className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
                />
                <input
                  type="email"
                  placeholder="Email *"
                  className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
                />
              </div>
              <textarea
                placeholder="Message"
                rows="5"
                className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
              ></textarea>
              <button
                type="submit"
                className="w-full bg-black text-white py-3 rounded-md hover:bg-gray-800 transition"
              >
                Send
              </button>
            </form>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default Contact;
