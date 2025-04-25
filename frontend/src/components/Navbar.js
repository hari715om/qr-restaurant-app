import React from "react";
import { Link } from "react-router-dom";

const Navbar = ({ onScanNewQR }) => {
  return (
    <nav className="bg-blue-600 text-white py-4 px-6 flex justify-between items-center shadow-md">
      {/* Project Name */}
      <h1 className="text-xl font-bold">QR Restaurant</h1>

      {/* Navigation Links */}
      <div className="flex items-center space-x-6">
        <Link to="/" className="hover:underline">Menu</Link>
        <Link to="/admin" className="hover:underline">Admin</Link>

        {/* Scan QR Code Button (only if function is provided) */}
        {onScanNewQR && (
          <button 
            onClick={onScanNewQR} 
            className="bg-gray-700 px-3 py-2 rounded hover:bg-gray-800"
          >
            Scan QR Code
          </button>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
