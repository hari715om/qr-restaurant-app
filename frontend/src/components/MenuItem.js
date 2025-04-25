import React from "react";

const MenuItem = ({ item, addToOrder }) => {
  return (
    <div className="bg-white shadow-md rounded-lg overflow-hidden transform transition-transform hover:scale-105 w-full max-w-xs md:max-w-sm">
      {/* Image Section */}
      <img
        src={item.image}
        alt={item.name}
        className="w-full h-40 object-cover"
      />

      {/* Item Details */}
      <div className="p-4 text-center">
        <h3 className="text-lg font-semibold text-gray-800">{item.name}</h3>
        <p className="text-gray-600 font-medium">₹{item.price}</p>

        {/* Add to Cart Button */}
        <button
          onClick={() => addToOrder(item)}
          className="bg-blue-600 text-white px-4 py-2 mt-3 rounded-lg hover:bg-blue-700 transition"
        >
          Add to Cart
        </button>
      </div>
    </div>
  );
};

export default MenuItem;
