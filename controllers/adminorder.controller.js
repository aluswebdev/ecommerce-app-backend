// import Order from "../model/seller/";

export const getAllOrders = async (req, res, next) => {
  try {
    const orders = await Order.find()
      .sort({ createdAt: -1 })
      .populate("buyer", "name email")
      .populate("items.product", "title");

    res.status(200).json(orders);
  } catch (error) {
    logger.error("Error in getAllOrders", {
      message: error.message,
      adminId: req.user._id,
      stack: error.stack,
    });
    next(error);
  }
};

