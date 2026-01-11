import Order from "../../model/order/order.model.js";
import Product from "../../model/general/product.model.js";
import logger from "../../libs/logger.js";
import { getIO } from "../../socketIo/socket.js";
// import sendPushNotification from "../../utils/sendPushNotification.js";

// -------------------------------
// PLACE ORDER
// -------------------------------
export const placeOrder = async (req, res) => {

  const io = getIO()

  try {
    const buyerId = req.user._id;
    const { sellerId, items, deliveryAddress, paymentMethod } = req.body;

    if (!sellerId || !items?.length)
      return res.status(400).json({ message: "Invalid order data" });

    let subtotal = 0;
    const orderItems = [];

    // Validate stock & seller
    for (const item of items) {
      const product = await Product.findById(item.productId);
      if (!product)
        return res.status(404).json({ message: "Product not found" });
      if (product.seller.toString() !== sellerId)
        return res.status(400).json({ message: "Seller mismatch detected" });
      if (product.stock < item.quantity)
        return res
          .status(400)
          .json({ message: `Not enough stock for ${product.title}` });

      subtotal += product.price * item.quantity;
      orderItems.push({
        product: product._id,
        quantity: item.quantity,
        price: product.price,
      });
    }

    const deliveryFee = 20000;
    const totalPrice = subtotal + deliveryFee;

    const order = await Order.create({
      buyer: buyerId,
      seller: sellerId,
      items: orderItems,
      deliveryAddress,
      paymentMethod,
      subtotal,
      totalPrice,
      deliveryFee,
    });

    // Reduce product stock
    for (const item of items) {
      await Product.findByIdAndUpdate(item.productId, {
        $inc: { stock: -item.quantity },
      });
    }

    logger.info(`Order created: ${order._id}`);

    // Real-time notifications
    io.to(`user_${sellerId}`).emit("orderCreated", {
      orderId: order._id,
      buyer: buyerId,
      order,
    });
    io.to(`user_${buyerId}`).emit("orderCreated", {
      orderId: order._id,
      seller: sellerId,
      order,
    });

    // Optional: FCM Push Notification
    // if (req.user.fcmToken) {
    //   await sendPushNotification(
    //     req.user.fcmToken,
    //     "Order Placed",
    //     "Your order has been placed successfully."
    //   );
    // }

    res.status(201).json({ message: "Order placed successfully", order });
  } catch (error) {
    logger.error("Order Placement Error", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// -------------------------------
// GET BUYER ORDERS
// -------------------------------
export const getBuyerOrders = async (req, res) => {
  try {
    const id = req.user._id;
    console.log(id);
    
    const orders = await Order.find({ buyer: id })
      .populate("items.product", "title images price")
      .populate("seller", "name");
    res.status(200).json(orders);
  } catch (error) {
    logger.error("Get Buyer Orders Error", error);
    res.status(500).json({ message: "Server error" });
  }
};



// -------------------------------
// GET SELLER ORDERS
// -------------------------------
export const getSellerOrders = async (req, res) => {
  try {
    const sellerId = req.user._id;
    const orders = await Order.find({ seller: sellerId })
      .populate("items.product", "title images price")
      .populate("buyer", "name email");
    res.status(200).json(orders);
  } catch (error) {
    logger.error("Get Seller Orders Error", error);
    res.status(500).json({ message: "Server error" });
  }
};

// -------------------------------
// UPDATE ORDER STATUS
// -------------------------------
export const updateOrderStatus = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { status } = req.body;
    const validStatuses = [
      "Pending",
      "Processing",
      "Shipped",
      "Delivered",
      "Cancelled",
    ];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    const order = await Order.findById(orderId).populate("buyer seller");
    if (!order) return res.status(404).json({ message: "Order not found" });

    // Authorization: only seller or admin can update
    if (
      !["seller", "admin"].includes(req.user.role) ||
      (req.user.role === "seller" &&
        req.user._id !== order.seller._id.toString())
    ) {
      return res
        .status(403)
        .json({ message: "Unauthorized to update this order" });
    }

    order.orderStatus = status;
    await order.save();

    logger.info(`Order ${orderId} updated to ${status}`);

    // Real-time update via Socket.IO
    io.to(`user_${order.seller._id}`).emit("orderUpdated", {
      orderId,
      status,
      order,
    });
    io.to(`user_${order.buyer._id}`).emit("orderUpdated", {
      orderId,
      status,
      order,
    });

    // FCM Notifications
    if (order.buyer.fcmToken) {
      await sendPushNotification(
        order.buyer.fcmToken,
        "Order Update",
        `Your order is now: ${status}`
      );
    }

    res.status(200).json({ message: "Status updated", order });
  } catch (error) {
    logger.error("Order Status Update Error", error);
    res.status(500).json({ message: "Server error" });
  }
};

// -------------------------------
// GET ORDER BY ID
// -------------------------------
export const getOrderById = async (req, res) => {
  try {
    const { orderId } = req.params;
    const order = await Order.findById(orderId)
      .populate("items.product", "title images price")
      .populate("buyer seller", "name email storeName");

    if (!order) return res.status(404).json({ message: "Order not found" });
    res.status(200).json(order);
  } catch (err) {
    logger.error("Get Order By ID Error", err);
    res.status(500).json({ message: "Server error" });
  }
};
