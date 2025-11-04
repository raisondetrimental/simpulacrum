import React from 'react';
import { Link } from 'react-router-dom';

const Footer: React.FC = () => {
  return (
    <footer className="bg-black text-white mt-auto">
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex flex-col md:flex-row justify-between items-center">
          {/* Logo */}
          <div className="mb-4 md:mb-0">
            <Link to="/" className="cursor-pointer hover:opacity-80 transition-opacity">
              <img
                src="/assets/logo-1.jpg"
                alt="Meridian Universal"
                className="h-24 w-auto"
              />
            </Link>
          </div>

          {/* Links */}
          <div className="flex space-x-6">
            <Link
              to="/meridian"
              className="text-sm hover:text-gray-300 transition-colors"
            >
              Meridian
            </Link>
            <Link
              to="/the-firm"
              className="text-sm hover:text-gray-300 transition-colors"
            >
              Firm Philosophy
            </Link>
            <Link
              to="/this-website"
              className="text-sm hover:text-gray-300 transition-colors"
            >
              This Website
            </Link>
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-6 text-center text-sm text-gray-400">
          © {new Date().getFullYear()} Meridian Universal. All rights reserved.
        </div>
      </div>
    </footer>
  );
};

export default Footer;