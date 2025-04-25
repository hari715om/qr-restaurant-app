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
          placeOrder(); // Only place order after successful payment
        } else {
          toast.error("Payment Verification Failed");
        }
      },
      theme: {
        color: "#3399cc",
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

  return (
    <div className="p-6">
      <Toaster />
      {showScanner && <QRScanner onScan={handleScan} />}

      <nav className="flex justify-between items-center mb-6 p-4 bg-gray-200 rounded">
        <h1 className="text-2xl font-bold text-gray-800">Table {tableNumber || "Unknown"}</h1>
        <button onClick={() => setShowScanner(true)} className="bg-blue-500 text-white px-4 py-2 rounded">
          Scan QR Again
        </button>
      </nav>

      {orderStatus && (
        <div className="p-4 bg-yellow-200 text-gray-800 font-bold rounded mb-4">
          Order Status: <span className="text-blue-600">{orderStatus}</span>
        </div>
      )}

      {order.length > 0 && (
        <div className="p-4 border rounded mb-4 bg-gray-100">
          <h2 className="font-bold text-lg mb-2">Your Order</h2>
          {order.map((item) => (
            <div key={item.id} className="flex justify-between items-center mb-2">
              <p>{item.name} (x{item.quantity})</p>
              <div>
                <button className="bg-red-500 text-white px-2 py-1 mr-2" onClick={() => removeFromOrder(item.id)}>
                  -
                </button>
                <button className="bg-green-500 text-white px-2 py-1" onClick={() => addToOrder(item)}>
                  +
                </button>
              </div>
            </div>
          ))}
          <button onClick={handlePayment} className="bg-blue-600 text-white px-4 py-2 rounded mt-2">
            Pay & Place Order
          </button>
        </div>
      )}

      {/* Category Filter */}
      <div className="mb-4">
        <button
          id="filter-all"
          className={`mr-2 px-4 py-2 rounded ${categoryFilter === 'All' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700'}`}
          onClick={() => handleCategoryFilter('All')}
        >
          All
        </button>
        {[...new Set(menuItems.map((item) => item.category))].map((category) => (
          <button
            key={category}
            id={`filter-${category.toLowerCase().replace(' ', '-')}`}
            className={`mr-2 px-4 py-2 rounded ${categoryFilter === category ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700'}`}
            onClick={() => handleCategoryFilter(category)}
          >
            {category}
          </button>
        ))}
      </div>

      {/* Sort Options */}
      <div className="mb-4">
        <label htmlFor="sort-options" className="mr-2">Sort By:</label>
        <select
          id="sort-options"
          className="border rounded p-2"
          value={sortOption}
          onChange={(e) => handleSortOptionChange(e.target.value)}
        >
          <option id="sort-default" value="Default">Default</option>
          <option id="sort-price-low-high" value="Price: Low to High">Price: Low to High</option>
          <option id="sort-price-high-low" value="Price: High to Low">Price: High to High</option>
        </select>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {filteredMenu.map((item) => (
          <MenuItem key={item.id} item={item} addToOrder={() => addToOrder(item)} />
        ))}
      </div>
    </div>
  );
};

export default MenuPage;