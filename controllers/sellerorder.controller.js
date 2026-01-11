import Order from "../model/seller/order.model.js"

export const getSellerOrders = async (req, res, next) => {
  try {
    const orders = await Order.find({ "items.seller": req.user._id })
      .sort({ createdAt: -1 })
      .populate("buyer", "name email");

    res.status(200).json(orders);
  } catch (error) {
    logger.error("Error in getSellerOrders", {
      message: error.message,
      sellerId: req.user._id,
      stack: error.stack,
    });
    next(error);
  }
};

export const updateOrderStatus = async (req, res, next) => {
  try {
    const { orderId, newStatus } = req.body;

    const order = await Order.findById(orderId);
    if (!order) throw new NotFoundError("Order not found");

    const ownsItem = order.items.some(
      (item) => item.seller.toString() === req.user._id.toString()
    );

    if (!ownsItem) {
      throw new UnauthorizedError("Not your order to update");
    }

    order.status = newStatus;
    await order.save();

    res.status(200).json(order);
  } catch (error) {
    logger.error("Error in updateOrderStatus", {
      message: error.message,
      stack: error.stack,
      sellerId: req.user._id,
    });
    next(error);
  }
};


