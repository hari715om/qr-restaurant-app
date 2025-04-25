import express from "express";
import mongoose from "mongoose";
import QRCode from "qrcode";
import Order from "../models/Order.js";

const router = express.Router();

router.post("/", async (req, res) => {
  const { tableNumber, items } = req.body;

  if (!tableNumber || !items || items.length === 0) {
    return res.status(400).json({ message: "Invalid order data" });
  }

  try {
    const order = new Order({
      tableNumber,
      items,
      status: "Pending", 
    });
    await order.save();
    res.status(201).json(order);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error });
  }
});

router.get("/", async (req, res) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 }); 
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: "Error fetching orders", error });
  }
});

router.get("/by-table/:tableNumber", async (req, res) => {
  try {
    const tableNumber = Number(req.params.tableNumber);
    if (isNaN(tableNumber)) return res.status(400).json({ message: "Invalid table number" });

    const orders = await Order.find({ tableNumber }).sort({ createdAt: -1 });

    if (!orders.length) {
      return res.status(404).json({ message: "No orders found for this table" });
    }

    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: "Error fetching orders", error });
  }
});

router.put("/:id/status", async (req, res) => {
  try {
    const { status } = req.body;
    const validStatuses = ["Pending", "Preparing", "Ready", "Delivered", "Canceled"];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: "Invalid order ID" });
    }

    const updatedOrder = await Order.findByIdAndUpdate(req.params.id, { status }, { new: true });

    if (!updatedOrder) return res.status(404).json({ message: "Order not found" });

    res.json(updatedOrder);
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: "Invalid order ID" });
    }

    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    await order.deleteOne();
    res.json({ message: "Order Cancelled Successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error });
  }
});

router.get("/status/:tableNumber", async (req, res) => {
  try {
    const tableNumber = Number(req.params.tableNumber); 
    if (isNaN(tableNumber)) return res.status(400).json({ message: "Invalid table number" });

    const order = await Order.findOne({ tableNumber }).sort({ createdAt: -1 });

    if (!order) {
      return res.status(404).json({ message: "No orders found for this table." });
    }

    res.json({ status: order.status });
  } catch (error) {
    console.error("Server error:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

export default router;
