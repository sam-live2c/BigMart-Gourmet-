import React from "react";
import { Link } from "react-router-dom";
import {
  Facebook,
  Twitter,
  Instagram,
  Youtube,
  Mail,
  Phone,
  MapPin,
} from "lucide-react";

const Footer: React.FC = () => {
  return (
    <footer className="hidden md:block bg-gray-900 text-white pt-16 pb-8 px-8 lg:px-16 mt-auto">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
        <div>
          <h2 className="text-2xl font-black mb-6 relative inline-block text-white">
            <span className="text-green-500">BIG</span> MART
          </h2>
          <p className="text-gray-400 text-sm mb-6 leading-relaxed">
            Your local destination for the finest, freshest ginger and garlic products. Sourced directly from local farms.
          </p>
          <div className="flex items-center gap-4">
            <a
              href="#"
              className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center text-white hover:bg-green-600 transition-colors"
            >
              <Facebook size={18} />
            </a>
            <a
              href="#"
              className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center text-white hover:bg-green-600 transition-colors"
            >
              <Twitter size={18} />
            </a>
            <a
              href="#"
              className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center text-white hover:bg-green-600 transition-colors"
            >
              <Instagram size={18} />
            </a>
            <a
              href="#"
              className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center text-white hover:bg-green-600 transition-colors"
            >
              <Youtube size={18} />
            </a>
          </div>
        </div>

        <div>
          <h3 className="text-lg font-bold mb-6 text-white uppercase tracking-wider relative after:content-[''] after:absolute after:bottom-[-8px] after:left-0 after:w-12 after:h-1 after:bg-green-500">
            Quick Links
          </h3>
          <ul className="space-y-3">
            <li>
              <Link
                to="/about"
                className="text-gray-400 hover:text-green-500 transition-colors text-sm"
              >
                About Us
              </Link>
            </li>
            <li>
              <Link
                to="/contact"
                className="text-gray-400 hover:text-green-500 transition-colors text-sm"
              >
                Contact Us
              </Link>
            </li>
            <li>
              <Link
                to="/blog"
                className="text-gray-400 hover:text-green-500 transition-colors text-sm"
              >
                Tips & Recipes
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h3 className="text-lg font-bold mb-6 text-white uppercase tracking-wider relative after:content-[''] after:absolute after:bottom-[-8px] after:left-0 after:w-12 after:h-1 after:bg-green-500">
            Customer Service
          </h3>
          <ul className="space-y-3">
            <li>
              <Link
                to="/help"
                className="text-gray-400 hover:text-green-500 transition-colors text-sm"
              >
                Help Center
              </Link>
            </li>
            <li>
              <Link
                to="/returns"
                className="text-gray-400 hover:text-green-500 transition-colors text-sm"
              >
                Refunds & Cancellations
              </Link>
            </li>
            <li>
              <Link
                to="/shipping"
                className="text-gray-400 hover:text-green-500 transition-colors text-sm"
              >
                Delivery Info
              </Link>
            </li>
            <li>
              <Link
                to="/tracking/1"
                className="text-gray-400 hover:text-green-500 transition-colors text-sm"
              >
                Order Tracking
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h3 className="text-lg font-bold mb-6 text-white uppercase tracking-wider relative after:content-[''] after:absolute after:bottom-[-8px] after:left-0 after:w-12 after:h-1 after:bg-green-500">
            Contact Info
          </h3>
          <ul className="space-y-4">
            <li className="flex items-start gap-3">
              <MapPin size={20} className="text-green-500 shrink-0 mt-0.5" />
              <span className="text-gray-400 text-sm">
                12 Market Street, Local Bazaar,
                <br />
                Downtown
              </span>
            </li>
            <li className="flex items-center gap-3">
              <Phone size={20} className="text-green-500 shrink-0" />
              <span className="text-gray-400 text-sm">+1 (800) GINGER</span>
            </li>
            <li className="flex items-center gap-3">
              <Mail size={20} className="text-green-500 shrink-0" />
              <span className="text-gray-400 text-sm">
                hello@ggmarket.com
              </span>
            </li>
          </ul>
        </div>
      </div>

      <div className="max-w-7xl mx-auto border-t border-gray-800 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
        <p className="text-gray-500 text-sm font-medium">
          &copy; {new Date().getFullYear()} BigMart Gourmet. All rights reserved.
        </p>
        <div className="flex items-center gap-6">
          <Link
            to="/privacy"
            className="text-gray-500 hover:text-white transition-colors text-sm"
          >
            Privacy Policy
          </Link>
          <Link
            to="/terms"
            className="text-gray-500 hover:text-white transition-colors text-sm"
          >
            Terms of Service
          </Link>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
