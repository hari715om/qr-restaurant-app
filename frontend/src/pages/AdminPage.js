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

  const getStatusColor = (status) => {
    const colors = {
      Pending: "bg-yellow-100 text-yellow-800 border-yellow-200",
      Preparing: "bg-blue-100 text-blue-800 border-blue-200",
      Ready: "bg-green-100 text-green-800 border-green-200",
      Delivered: "bg-gray-100 text-gray-800 border-gray-200"
    };
    return colors[status] || "bg-gray-100 text-gray-800 border-gray-200";
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

  const totalOrders = orders.length;
  const pendingOrders = orders.filter(order => order.status === "Pending").length;
  const readyOrders = orders.filter(order => order.status === "Ready").length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <Toaster position="top-right" />
      
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Restaurant Admin</h1>
              <p className="text-gray-600 mt-1">Manage orders and generate QR codes</p>
            </div>
            <div className="flex space-x-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{totalOrders}</div>
                <div className="text-sm text-gray-500">Total Orders</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-600">{pendingOrders}</div>
                <div className="text-sm text-gray-500">Pending</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{readyOrders}</div>
                <div className="text-sm text-gray-500">Ready</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* QR Code Section */}
        <div className="mb-8">
          <div className="bg-white rounded-xl shadow-lg p-8 max-w-lg mx-auto">
            <div className="text-center mb-6">
              <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m-2 0h-2m2-4v-4m6 0V9a2 2 0 00-2-2H9a2 2 0 00-2 2v8a2 2 0 002 2h8a2 2 0 002-2V9z" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">QR Code Generator</h2>
              <p className="text-gray-600">Generate QR codes for table ordering</p>
            </div>
            
            <div className="flex gap-3 mb-6">
              <div className="flex-1">
                <input
                  type="number"
                  placeholder="Enter table number (1-30)"
                  value={tableNumber}
                  onChange={(e) => setTableNumber(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />
              </div>
              <button
                onClick={generateQRCode}
                className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-200 font-medium shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              >
                Generate
              </button>
            </div>
            
            {qrCodeData && (
              <div className="text-center">
                <div className="bg-white p-4 rounded-lg border-2 border-dashed border-gray-300 inline-block">
                  <QRCodeCanvas value={qrCodeData} size={180} />
                </div>
                <p className="text-sm text-gray-500 mt-3">Table {tableNumber} QR Code</p>
              </div>
            )}
          </div>
        </div>

        {/* Search & Filter Section */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  type="text"
                  placeholder="Search by table number..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />
              </div>
            </div>
            <div className="sm:w-48">
              <select
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
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
          </div>
        </div>

        {/* Orders Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {Object.entries(filteredOrders).map(([tableNumber, tableOrders]) => (
            <div key={tableNumber} className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden">
              <div className="bg-gradient-to-r from-gray-800 to-gray-900 text-white p-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-bold">Table {tableNumber}</h3>
                  <span className="bg-white bg-opacity-20 px-3 py-1 rounded-full text-sm">
                    {tableOrders.length} order{tableOrders.length > 1 ? 's' : ''}
                  </span>
                </div>
              </div>
              
              <div className="p-6 space-y-4">
                {tableOrders.map((order) => (
                  <div key={order._id} className="border border-gray-200 rounded-lg p-4 hover:border-gray-300 transition-colors">
                    <div className="flex items-center justify-between mb-3">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(order.status)}`}>
                        {order.status}
                      </span>
                      <span className="text-sm text-gray-500">{formatDate(order.createdAt)}</span>
                    </div>
                    
                    <div className="mb-4">
                      <h4 className="font-semibold text-gray-900 mb-2">Order Items:</h4>
                      <div className="space-y-1">
                        {order.items.map((item, index) => (
                          <div key={index} className="flex justify-between text-sm">
                            <span className="text-gray-700">{item.name} x{item.quantity}</span>
                            <span className="font-medium text-gray-900">
                              ₹{item.price ? (item.price * item.quantity).toFixed(2) : "0"}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    <div className="flex gap-2">
                      <select
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        value={order.status}
                        onChange={(e) => updateOrderStatus(order._id, e.target.value)}
                      >
                        <option value="Pending">Pending</option>
                        <option value="Preparing">Preparing</option>
                        <option value="Ready">Ready</option>
                        <option value="Delivered">Delivered</option>
                      </select>
                      <button
                        onClick={() => deleteOrder(order._id)}
                        className="px-3 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors text-sm font-medium"
                        title="Delete Order"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {Object.keys(filteredOrders).length === 0 && (
          <div className="text-center py-12">
            <div className="bg-white rounded-xl shadow-lg p-8 max-w-md mx-auto">
              <div className="text-gray-400 mb-4">
                <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No Orders Found</h3>
              <p className="text-gray-600">No orders match your current filters.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminPage;