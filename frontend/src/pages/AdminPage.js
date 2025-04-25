import React, { useEffect, useState } from "react";
import { QRCodeCanvas } from "qrcode.react";
import toast, { Toaster } from "react-hot-toast";

const AdminPage = () => {
  const [orders, setOrders] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [tableNumber, setTableNumber] = useState("");
  const [qrCodeData, setQrCodeData] = useState("");

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/orders");
      if (!res.ok) throw new Error("Failed to fetch orders");
      const data = await res.json();
      setOrders(data);
    } catch (error) {
      console.error("Error fetching orders:", error);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "Unknown Date";
    return new Date(dateString).toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      const res = await fetch(`http://localhost:5000/api/orders/${orderId}/status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      if (res.ok) {
        toast.success("Order status updated successfully!");
        fetchOrders();
      } else {
        toast.error("Failed to update order status.");
      }
    } catch (error) {
      console.error("Error updating order:", error);
    }
  };

  const deleteOrder = async (orderId) => {
    if (!window.confirm("Are you sure you want to delete this order?")) return;
    try {
      const res = await fetch(`http://localhost:5000/api/orders/${orderId}`, {
        method: "DELETE",
      });

      if (res.ok) {
        toast.success("Order deleted successfully!");
        fetchOrders();
      } else {
        toast.error("Failed to delete order.");
      }
    } catch (error) {
      console.error("Error deleting order:", error);
    }
  };

  const generateQRCode = () => {
    const tableNum = parseInt(tableNumber, 10);
    if (!tableNum || tableNum <= 0 || tableNum > 30) {
      toast.error("Enter a valid table number (1-30)");
      return;
    }
    setQrCodeData(`http://localhost:3000/?table=${tableNum}`);
  };

  const filteredOrders = orders
    .filter(
      (order) =>
        (statusFilter === "All" || order.status === statusFilter) &&
        (searchQuery === "" || order.tableNumber.toString().includes(searchQuery))
    )
    .reduce((acc, order) => {
      if (!acc[order.tableNumber]) acc[order.tableNumber] = [];
      acc[order.tableNumber].push(order);
      return acc;
    }, {});

  return (
    <div className="p-6 bg-gray-100 min-h-screen flex flex-col items-center">
      <Toaster />

      {/* 🔹 Page Title */}
      <h1 className="text-3xl font-bold mb-6 text-gray-700">Admin Panel</h1>

      {/* 🔹 QR Code Section */}
      <div className="mb-6 p-6 rounded bg-white shadow-lg w-full max-w-md text-center">
        <h2 className="text-lg font-semibold mb-3">Generate QR Code for Table</h2>
        <div className="flex gap-2">
          <input
            type="number"
            placeholder="Table Number"
            value={tableNumber}
            onChange={(e) => setTableNumber(e.target.value)}
            className="border p-2 rounded w-full"
          />
          <button
            onClick={generateQRCode}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Generate
          </button>
        </div>
        {qrCodeData && (
          <div className="mt-4 flex justify-center">
            <QRCodeCanvas value={qrCodeData} size={160} className="shadow-lg" />
          </div>
        )}
      </div>

      {/* 🔹 Search & Filter */}
      <div className="flex gap-4 mb-4 w-full max-w-lg">
        <input
          type="text"
          placeholder="Search by Table Number..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="border p-2 rounded w-full"
        />
        <select
          className="border p-2 rounded w-1/3"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="All">All Orders</option>
          <option value="Pending">Pending</option>
          <option value="Preparing">Preparing</option>
          <option value="Ready">Ready</option>
          <option value="Delivered">Delivered</option>
        </select>
      </div>

      {/* 🔹 Orders */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-4xl">
        {Object.entries(filteredOrders).map(([tableNumber, tableOrders]) => (
          <div key={tableNumber} className="border p-4 rounded shadow bg-white">
            <h3 className="font-bold text-lg text-gray-800">Table {tableNumber}</h3>
            {tableOrders.map((order) => (
              <div key={order._id} className="mb-3 border-b pb-2">
                <p className="text-gray-500 text-sm">Ordered At: {formatDate(order.createdAt)}</p>
                <h4 className="text-lg font-semibold mt-2">Items:</h4>
                <ul className="list-disc pl-5 text-gray-700">
                  {order.items.map((item, index) => (
                    <li key={index}>
                      {item.name} x{item.quantity} - ₹
                      {item.price ? (item.price * item.quantity).toFixed(2) : "0"}
                    </li>
                  ))}
                </ul>
                {/* 🔹 Order Status Dropdown */}
                <select
                  className="border p-2 rounded mt-2"
                  value={order.status}
                  onChange={(e) => updateOrderStatus(order._id, e.target.value)}
                >
                  <option value="Pending">Pending</option>
                  <option value="Preparing">Preparing</option>
                  <option value="Ready">Ready</option>
                  <option value="Delivered">Delivered</option>
                </select>
                {/* 🔹 Delete Order Button */}
                <button
                  onClick={() => deleteOrder(order._id)}
                  className="bg-red-600 text-white px-2 py-1 rounded ml-2 hover:bg-red-700"
                >
                  Delete
                </button>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminPage;
