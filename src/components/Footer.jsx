import React from 'react';
import { FaFacebook, FaYoutube, FaInstagram, FaTiktok } from "react-icons/fa";
import { FaThreads } from "react-icons/fa6";
import { BsTwitterX } from "react-icons/bs";

const Footer = () => {
  return (
    <footer className="bg-gray-300 text-black mt-10">
      {/* Social Icons Floating Box */}
      <div className="max-w-7xl mx-auto px-4 py-10 grid sm:grid-cols-1 md:grid-cols-2 gap-8 relative justify-items-center">
        
        <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 bg-white text-black sm:px-3 sm:py-1.5 md:px-6 md:py-3 rounded-md flex items-center sm:gap-1.5 md:gap-3 shadow border border-gray-400 z-10">
          <span className="font-semibold text-sm">Follow us:</span>
          <FaFacebook className="text-black hover:text-black sm:w-3.5 sm:h-3.5 md:w-6 md:h-6" />
          <FaYoutube className="text-black hover:text-black sm:w-3.5 sm:h-3.5 md:w-6 md:h-6" />
          <FaInstagram className="text-black hover:text-black sm:w-3.5 sm:h-3.5 md:w-6 md:h-6" />
          <FaTiktok className="text-black hover:text-black sm:w-3.5 sm:h-3.5 md:w-6 md:h-6" />
          <BsTwitterX className="text-black hover:text-black sm:w-3.5 sm:h-3.5 md:w-6 md:h-6" />
          <FaThreads className="text-black hover:text-black sm:w-3.5 sm:h-3.5 md:w-6 md:h-6" />
        </div>

        {/* About Section */}
        <div className="w-full px-4">
          <img
            src="/src/assets/images/logo.png"
            alt="CineSewa Logo"
            className="w-28 sm:w-24 md:w-32 mb-2 mx-auto md:mx-0"
          />
          <h4 className="font-bold sm:text-sm md:text-base text-center md:text-left">About PropBox</h4>
          <p className="text-[11px] md:text-sm mt-2 leading-relaxed text-center md:text-left">
            PropBox is an online platform designed for theatre and film enthusiasts to rent or purchase unique props for the productions.
          </p>
        </div>

        {/* Quick Links and Support Section */}
        <div className="w-full px-4 grid sm:grid-cols-1 md:grid-cols-2 gap-8 mt-[2.25rem]">
          {/* Quick Links */}
          <div>
            <h4 className="font-bold sm:text-sm md:text-base mb-3 text-center md:text-left">Quick Links</h4>
            <ul className="space-y-2 text-[11px] md:text-sm text-center md:text-left">
              <li><a href="/" className="text-black hover:underline hover:text-black">Home</a></li>
              <li><a href="/category" className="text-black hover:underline hover:text-black">Explore All</a></li>
              <li><a href="/newArrivals" className="text-black hover:underline hover:text-black">New Arrivals</a></li>
              <li><a href="/bestSeller" className="text-black hover:underline hover:text-black">Top Rated</a></li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="font-bold sm:text-sm md:text-base mb-3 text-center md:text-left">Support</h4>
            <ul className="space-y-2 text-[11px] md:text-sm text-center md:text-left">
              <li><a href="/contact" className="text-black hover:underline hover:text-black">Help/Contact Us</a></li>
              <li>Email: <a href="mailto:support@cinesewa.com" className="text-black underline hover:text-black">support@propbox.com</a></li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Notice */}
      <div className="max-w-lg mx-auto text-center text-[11px] md:text-sm text-black py-6 border-t border-gray-400">
        © 2025 PropBox All Rights Reserved | <a href="#" className="text-black underline hover:text-black">Privacy Policy</a> | <a href="#" className="text-black underline hover:text-black">Terms of Service</a>
      </div>
    </footer>
  );
};

export default Footer;