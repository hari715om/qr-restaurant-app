import React, { useState, useEffect, useCallback } from "react";
import QRScanner from "../components/QRScanner";
import MenuItem from "../components/MenuItem";
import toast, { Toaster } from "react-hot-toast";

const menuItems = [
  { id: 1, name: "Burger", price: 100, category: "Fast Food", image: "/images/burger.jpg" },
  { id: 2, name: "Pizza", price: 200, category: "Fast Food", image: "/images/pizza.jpg" },
  { id: 3, name: "Pasta", price: 150, category: "Italian", image: "/images/pasta.jpg" },
  { id: 4, name: "French Fries", price: 80, category: "Fast Food", image: "/images/fries.jpg" },
  { id: 5, name: "Cake", price: 180, category: "Snacks", image: "/images/cake.jpg" },
  { id: 6, name: "Coffee", price: 70, category: "Beverages", image: "/images/coffee.jpg" },
  { id: 7, name: "Veg Sandwich", price: 90, category: "Fast Food", image: "/images/sandwich.jpg" },
  { id: 8, name: "Paneer Tikka", price: 220, category: "Indian", image: "/images/paneer_tikka.jpg" },
  { id: 9, name: "Spring Rolls", price: 140, category: "Chinese", image: "/images/spring_rolls.jpg" },
  { id: 10, name: "Momos", price: 120, category: "Chinese", image: "/images/momos.jpg" },
  { id: 11, name: "Dosa", price: 180, category: "South Indian", image: "/images/dosa.jpg" },
  { id: 12, name: "Vegetable Biryani", price: 250, category: "Indian", image: "/images/veg_biryani.jpg" },
  { id: 13, name: "Chocolate", price: 10, category: "Snacks", image: "/images/chocolate.jpg" },
];

const MenuPage = () => {
  const [tableNumber, setTableNumber] = useState(null);
  const [order, setOrder] = useState([]);
  const [orderStatus, setOrderStatus] = useState(null);
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [sortOption, setSortOption] = useState("Default");
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [showScanner, setShowScanner] = useState(true);

  const fetchOrderStatus = useCallback(async () => {
    if (!tableNumber) return;
    try {
      const res = await fetch(`http://localhost:5000/api/orders/status/${tableNumber}`);
      const data = await res.json();
      if (res.ok) {
        setOrderStatus(data.status);
      } else {
        console.error("Error fetching order status:", data.message);
      }
    } catch (error) {
      console.error("Error fetching order status:", error);
    }
  }, [tableNumber]);

  useEffect(() => {
    if (orderPlaced) {
      const interval = setInterval(fetchOrderStatus, 5000);
      return () => clearInterval(interval);
    }
  }, [orderPlaced, fetchOrderStatus]);

  const handleScan = (data) => {
    try {
      const params = new URL(data).searchParams;
      const scannedTable = parseInt(params.get("table"), 10);
      if (scannedTable && scannedTable > 0 && scannedTable < 30) {
        setTableNumber(scannedTable);
        setShowScanner(false);
      } else {
        toast.error("Invalid Table Number! Please scan again.");
      }
    } catch (error) {
      toast.error("QR Code scanning failed. Try again!");
    }
  };

  const addToOrder = (item) => {
    setOrder((prevOrder) => {
      const existingItem = prevOrder.find((orderItem) => orderItem.id === item.id);
      if (existingItem) {
        return prevOrder.map((orderItem) =>
          orderItem.id === item.id ? { ...orderItem, quantity: orderItem.quantity + 1 } : orderItem
        );
      } else {
        return [...prevOrder, { ...item, quantity: 1 }];
      }
    });
  };

  const removeFromOrder = (itemId) => {
    setOrder((prevOrder) =>
      prevOrder
        .map((orderItem) =>
          orderItem.id === itemId
            ? orderItem.quantity > 1
              ? { ...orderItem, quantity: orderItem.quantity - 1 }
              : null
            : orderItem
        )
        .filter(Boolean)
    );
  };

  const placeOrder = async () => {
    if (!tableNumber) {
      toast.error("Scan QR Code to get a valid table number!");
      return;
    }

    if (order.length === 0) {
      toast.error("Please add at least one item to the order.");
      return;
    }

    const response = await fetch("http://localhost:5000/api/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tableNumber, items: order }),
    });

    if (response.ok) {
      toast.success("Order Placed Successfully!");
      setOrderPlaced(true);
      fetchOrderStatus();
    } else {
      toast.error("Order Failed!");
    }
  };

  const handlePayment = async () => {
    const totalAmount = order.reduce((acc, item) => acc + item.price * item.quantity, 0);

    const res = await fetch("http://localhost:5000/api/payment/create-order", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ amount: totalAmount }),
    });

    const data = await res.json();
    const options = {
      key: process.env.REACT_APP_RAZORPAY_KEY,
      amount: data.order.amount,
      currency: "INR",
      name: "QR Restaurant",
      description: "Order Payment",
      order_id: data.order.id,
      handler: async function (response) {
        const verifyRes = await fetch("http://localhost:5000/api/payment/verify", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(response),
        });

        const verifyData = await verifyRes.json();
        if (verifyData.success) {
          placeOrder();
        } else {
          toast.error("Payment Verification Failed");
        }
      },
      theme: {
        color: "#8B5CF6",
      },
    };

    const rzp = new window.Razorpay(options);
    rzp.open();
  };

  const handleCategoryFilter = (category) => {
    setCategoryFilter(category);
  };

  const handleSortOptionChange = (option) => {
    setSortOption(option);
  };

  const filteredMenu = menuItems
    .filter((item) => categoryFilter === "All" || item.category === categoryFilter)
    .sort((a, b) => {
      if (sortOption === "Price: Low to High") return a.price - b.price;
      if (sortOption === "Price: High to Low") return b.price - a.price;
      return 0;
    });

  const totalAmount = order.reduce((acc, item) => acc + item.price * item.quantity, 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <Toaster 
        position="top-center"
        toastOptions={{
          duration: 3000,
          style: {
            background: '#1F2937',
            color: '#F9FAFB',
            borderRadius: '12px',
          },
        }}
      />
      
      {showScanner && <QRScanner onScan={handleScan} />}

      {/* Header Navigation */}
      <nav className="sticky top-0 z-10 backdrop-blur-md bg-white/80 border-b border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-violet-500 to-purple-600 rounded-xl flex items-center justify-center">
                <span className="text-white font-bold text-lg">🍽️</span>
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent">
                  QR Restaurant
                </h1>
                <p className="text-slate-600 text-sm">
                  Table {tableNumber || "Unknown"}
                </p>
              </div>
            </div>
            <button 
              onClick={() => setShowScanner(true)} 
              className="bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700 text-white px-6 py-2.5 rounded-xl font-medium transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            >
              📱 Scan QR
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Order Status */}
        {orderStatus && (
          <div className="mb-8 p-6 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-2xl shadow-sm">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-amber-100 rounded-full flex items-center justify-center">
                <span className="text-amber-600 font-bold">📋</span>
              </div>
              <div>
                <p className="text-slate-700 font-medium">Order Status</p>
                <p className="text-amber-700 font-bold text-lg">{orderStatus}</p>
              </div>
            </div>
          </div>
        )}

        {/* Current Order */}
        {order.length > 0 && (
          <div className="mb-8 p-6 bg-white rounded-2xl shadow-lg border border-slate-200">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                <span className="text-green-600 font-bold">🛒</span>
              </div>
              <h2 className="text-xl font-bold text-slate-800">Your Order</h2>
            </div>
            
            <div className="space-y-3 mb-6">
              {order.map((item) => (
                <div key={item.id} className="flex justify-between items-center p-3 bg-slate-50 rounded-xl">
                  <div className="flex-1">
                    <p className="font-medium text-slate-800">{item.name}</p>
                    <p className="text-slate-600 text-sm">₹{item.price} × {item.quantity}</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button 
                      className="w-8 h-8 bg-red-100 hover:bg-red-200 text-red-600 rounded-lg font-bold transition-colors duration-200" 
                      onClick={() => removeFromOrder(item.id)}
                    >
                      −
                    </button>
                    <span className="w-8 text-center font-medium text-slate-700">{item.quantity}</span>
                    <button 
                      className="w-8 h-8 bg-green-100 hover:bg-green-200 text-green-600 rounded-lg font-bold transition-colors duration-200" 
                      onClick={() => addToOrder(item)}
                    >
                      +
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="border-t border-slate-200 pt-4">
              <div className="flex justify-between items-center mb-4">
                <span className="text-lg font-bold text-slate-800">Total</span>
                <span className="text-2xl font-bold text-violet-600">₹{totalAmount}</span>
              </div>
              <button 
                onClick={handlePayment} 
                className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white py-4 rounded-xl font-bold text-lg transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              >
                💳 Pay & Place Order
              </button>
            </div>
          </div>
        )}

        {/* Filters and Sort */}
        <div className="mb-8 space-y-4">
          {/* Category Filter */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
            <h3 className="text-lg font-semibold text-slate-800 mb-4">Categories</h3>
            <div className="flex flex-wrap gap-2">
              <button
                id="filter-all"
                className={`px-4 py-2 rounded-xl font-medium transition-all duration-200 ${
                  categoryFilter === 'All' 
                    ? 'bg-gradient-to-r from-violet-500 to-purple-600 text-white shadow-lg' 
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                }`}
                onClick={() => handleCategoryFilter('All')}
              >
                All
              </button>
              {[...new Set(menuItems.map((item) => item.category))].map((category) => (
                <button
                  key={category}
                  id={`filter-${category.toLowerCase().replace(' ', '-')}`}
                  className={`px-4 py-2 rounded-xl font-medium transition-all duration-200 ${
                    categoryFilter === category 
                      ? 'bg-gradient-to-r from-violet-500 to-purple-600 text-white shadow-lg' 
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                  }`}
                  onClick={() => handleCategoryFilter(category)}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>

          {/* Sort Options */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
            <label htmlFor="sort-options" className="block text-lg font-semibold text-slate-800 mb-3">
              Sort By
            </label>
            <select
              id="sort-options"
              className="w-full md:w-auto px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all duration-200"
              value={sortOption}
              onChange={(e) => handleSortOptionChange(e.target.value)}
            >
              <option id="sort-default" value="Default">Default Order</option>
              <option id="sort-price-low-high" value="Price: Low to High">Price: Low to High</option>
              <option id="sort-price-high-low" value="Price: High to Low">Price: High to Low</option>
            </select>
          </div>
        </div>

        {/* Menu Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredMenu.map((item) => (
            <MenuItem key={item.id} item={item} addToOrder={() => addToOrder(item)} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default MenuPage;