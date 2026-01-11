import Product from "../models/Product.js";
import Order from "../models/Order.js";

// 🔥 Top Selling Products
export const getTopSellingProducts = async (req, res) => {
  try {
    const products = await Product.find().sort({ sales: -1 }).limit(10);

    res.json({ success: true, products });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// 👀 Most Viewed Products
export const getMostViewedProducts = async (req, res) => {
  try {
    const products = await Product.find().sort({ views: -1 }).limit(10);

    res.json({ success: true, products });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// 📊 Category Sales Breakdown
export const getCategorySales = async (req, res) => {
  try {
    const categoryStats = await Product.aggregate([
      {
        $group: {
          _id: "$category",
          totalSales: { $sum: "$sales" },
          totalViews: { $sum: "$views" },
          productCount: { $sum: 1 },
        },
      },
      { $sort: { totalSales: -1 } },
    ]);

    res.json({ success: true, categoryStats });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// 📦 Order Summary (last 30 days)
export const getOrderSummary = async (req, res) => {
  try {
    const last30Days = new Date();
    last30Days.setDate(last30Days.getDate() - 30);

    const summary = await Order.aggregate([
      { $match: { createdAt: { $gte: last30Days } } },
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
          totalAmount: { $sum: "$totalAmount" },
        },
      },
    ]);

    res.json({ success: true, summary });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
