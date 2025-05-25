import React from "react";
import { Link, useLocation } from "react-router-dom";

const Navbar = ({ onScanNewQR }) => {
  const location = useLocation();
  
  const isActive = (path) => {
    return location.pathname === path;
  };

  return (
    <nav className="bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-xl sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex justify-between items-center">
          {/* Project Name with Icon */}
          <div className="flex items-center space-x-3">
            <div className="bg-white bg-opacity-20 p-2 rounded-lg">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">QR Restaurant</h1>
              <p className="text-blue-100 text-xs">Smart Dining Experience</p>
            </div>
          </div>

          {/* Navigation Links */}
          <div className="flex items-center space-x-2">
            <Link 
              to="/" 
              className={`px-4 py-2 rounded-lg transition-all duration-200 font-medium ${
                isActive('/') 
                  ? 'bg-white bg-opacity-20 text-white shadow-lg' 
                  : 'text-blue-100 hover:text-white hover:bg-white hover:bg-opacity-10'
              }`}
            >
              <div className="flex items-center space-x-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
                <span>Menu</span>
              </div>
            </Link>

            <Link 
              to="/admin" 
              className={`px-4 py-2 rounded-lg transition-all duration-200 font-medium ${
                isActive('/admin') 
                  ? 'bg-white bg-opacity-20 text-white shadow-lg' 
                  : 'text-blue-100 hover:text-white hover:bg-white hover:bg-opacity-10'
              }`}
            >
              <div className="flex items-center space-x-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span>Admin</span>
              </div>
            </Link>

            {/* Scan QR Code Button */}
            {onScanNewQR && (
              <button
                onClick={onScanNewQR}
                className="ml-4 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 px-4 py-2 rounded-lg font-medium transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 flex items-center space-x-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m-2 0h-2m2-4v-4m6 0V9a2 2 0 00-2-2H9a2 2 0 00-2 2v8a2 2 0 002 2h8a2 2 0 002-2V9z" />
                </svg>
                <span>Scan QR</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Menu Toggle (for future mobile responsiveness) */}
      <div className="md:hidden px-6 pb-4">
        <div className="flex flex-col space-y-2">
          <Link 
            to="/" 
            className={`px-3 py-2 rounded-lg transition-all duration-200 ${
              isActive('/') 
                ? 'bg-white bg-opacity-20 text-white' 
                : 'text-blue-100 hover:text-white hover:bg-white hover:bg-opacity-10'
            }`}
          >
            Menu
          </Link>
          <Link 
            to="/admin" 
            className={`px-3 py-2 rounded-lg transition-all duration-200 ${
              isActive('/admin') 
                ? 'bg-white bg-opacity-20 text-white' 
                : 'text-blue-100 hover:text-white hover:bg-white hover:bg-opacity-10'
            }`}
          >
            Admin
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;