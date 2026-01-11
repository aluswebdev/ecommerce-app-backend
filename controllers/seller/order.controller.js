// import Order from "../../model/seller/order.model.js";
import OrderEvent from "../../model/seller/orderEvent.model.js";
import Product from "../../model/general/product.model.js"; // <-- Missing import
import { createOrderDto } from "../../validator/order.validation.js";
import logger from "../../libs/logger.js";
import z from "zod";

// --- Create Order ---
export const createOrder = async (req, res) => {
  try {
    const dto = createOrderDto.parse(req.body);

    // Validate product existence and stock
    for (const item of dto.items) {
      const product = await Product.findById(item.productId);
      if (!product) {
        return res
          .status(404)
          .json({ error: `Product ${item.productId} not found` });
      }
      if (product.stock < item.quantity) {
        return res
          .status(400)
          .json({ error: `Insufficient stock for ${product.title}` });
      }
      // decrement stock
      // product.stock -= item.quantity;
      await product.save();
    }

    // Create order
    const order = await Order.create({
      buyerId: dto.buyerId,
      sellerId: dto.sellerId,
      items: dto.items,
      total: dto.total,
      currency: dto.currency ?? "SLE",
      status: "PLACED",
    });

    // Log event
    await OrderEvent.create({
      orderId: order._id,
      type: "STATUS_CHANGED",
      payload: { from: null, to: "PLACED" },
      actorId: req.user._id,
    });

    // Emit to buyer and seller safely
    if (req.io) {
      if (order.buyerId) {
        req.io.to(`user:${order.buyerId}`).emit("order:created", order);
      }
      if (order.sellerId) {
        req.io.to(`user:${order.sellerId}`).emit("order:created", order);
      }
    }

    res.status(201).json(order);
  } catch (error) {
    logger.error("Order creation failed", error);
    res.status(400).json({ error: error?.message || "Order creation failed" });
  }
};

// --- Update Order Status ---
const statusDto = z.object({
  status: z.enum([
    "PLACED",
    "CONFIRMED",
    "PACKED",
    "SHIPPED",
    "OUT_FOR_DELIVERY",
    "DELIVERED",
    "CANCELLED",
  ]),
});

export const updateOrderStatus = async (req, res) => {
  try {
    const { status } = statusDto.parse(req.body);
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ error: "Order not found" });

    const from = order.status;
    order.status = status;
    await order.save();

    await OrderEvent.create({
      orderId: order._id,
      type: "STATUS_CHANGED",
      payload: { from, to: status },
      actorId: req.user?._id,
    });

    // realtime broadcast
    req.io
      .to(`order:${order._id}`)
      .emit("order:status", { orderId: String(order._id), status });
    req.io
      .to(`user:${order.buyerId}`)
      .emit("order:status", { orderId: String(order._id), status });
    req.io
      .to(`user:${order.sellerId}`)
      .emit("order:status", { orderId: String(order._id), status });

    res.json({ ok: true });
  } catch (error) {
    logger.error("Order status update failed", error);
    res
      .status(400)
      .json({ error: error?.message || "Order status update failed" });
  }
};

/**
 * Fetch a single order with product + buyer/seller details
 */
export const getOrderById = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: "Invalid order id" });
    }

    const order = await Order.findById(id)
      .populate("buyerId", "name email") // buyer basic info
      .populate("sellerId", "name email") // seller basic info
      .populate("items.productId", "title price images"); // product info

    if (!order) return res.status(404).json({ error: "Order not found" });

    res.json(order);
  } catch (error) {
    logger.error("Fetch order by ID failed", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

/**
 * Fetch all orders for a buyer or seller
 */
export const getOrders = async (req, res) => {
  try {
    const role = req.user.role;
    const filter =
      role === "buyer"
        ? { buyerId: req.user._id }
        : role === "seller"
        ? { sellerId: req.user._id }
        : {};

    const orders = await Order.find(filter)
      .sort({ createdAt: -1 })
      .populate("items.productId", "title price images");

    res.json(orders);
  } catch (error) {
    logger.error("Fetch orders failed", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
