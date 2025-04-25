import React, { useState, useEffect } from "react";

const OrderList = () => {
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/orders");
      const data = await response.json();
      setOrders(data);
    } catch (error) {
      console.error("Error fetching orders:", error);
    }
  };

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      await fetch(`http://localhost:5000/api/orders/${orderId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      fetchOrders();
    } catch (error) {
      console.error("Error updating order status:", error);
    }
  };

  const handleCancel = async (orderId) => {
    try {
      await fetch(`http://localhost:5000/api/orders/${orderId}`, {
        method: "DELETE",
      });
      fetchOrders();
    } catch (error) {
      console.error("Error canceling order:", error);
    }
  };

  // ✅ Group orders by table
  const groupOrdersByTable = () => {
    return orders.reduce((acc, order) => {
      if (!acc[order.tableNumber]) {
        acc[order.tableNumber] = [];
      }
      acc[order.tableNumber].push(order);
      return acc;
    }, {});
  };

  const calculateTotal = (tableOrders) => {
    return tableOrders.reduce((total, order) => {
      if (!order.items || !Array.isArray(order.items)) return total;

      const orderTotal = order.items.reduce((sum, item) => sum + (item.price || 0), 0);
      return total + orderTotal;
    }, 0);
  };

  const groupedOrders = groupOrdersByTable();

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-center mb-4">Order List</h1>
      {Object.keys(groupedOrders).map((table) => {
        const tableOrders = groupedOrders[table];
        const totalPrice = calculateTotal(tableOrders);

        return (
          <div key={table} className="bg-white p-4 mb-4 rounded-lg shadow-lg">
            <h2 className="text-xl font-semibold">Table {table}</h2>
            {tableOrders.map((order) => (
              <div key={order._id} className="border-b py-2">
                {order.items.map((item, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div>
                      <p className="text-lg font-medium">
                        {item.name} - ₹{item.price}
                      </p>
                      <span className={`px-2 py-1 text-sm rounded-full ${order.status === "Ready" ? "bg-green-200" : order.status === "In Progress" ? "bg-yellow-200" : "bg-gray-200"}`}>
                        {order.status}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <select
                        className="border p-1 rounded"
                        value={order.status}
                        onChange={(e) => handleStatusChange(order._id, e.target.value)}
                      >
                        <option value="Pending">Pending</option>
                        <option value="In Progress">In Progress</option>
                        <option value="Ready">Ready</option>
                        <option value="Canceled">Canceled</option>
                      </select>
                      <button
                        className="bg-red-500 text-white px-3 py-1 rounded"
                        onClick={() => handleCancel(order._id)}
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ))}
            <p className="text-lg font-bold mt-2">Total: ₹{totalPrice}</p>
          </div>
        );
      })}
    </div>
  );
};

export default OrderList;
