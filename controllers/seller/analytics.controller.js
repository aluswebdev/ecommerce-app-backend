// controllers/seller.analytics.controller.js
import mongoose from "mongoose";
import Order from "../../model/order/order.model.js";
import Product from "../../model/general/product.model.js";
import { calculateProductSales } from "./calculateUnitsold.controller.js";

export const getSellerAnalytics = async (req, res) => {
  try {
    // Convert sellerId to ObjectId
    const sellerId = new mongoose.Types.ObjectId(req.user.id);

    // =================== Stats ===================
    const revenueAgg = await Order.aggregate([
      { $match: { seller: sellerId, orderStatus: "Delivered" } },
      { $group: { _id: null, total: { $sum: "$totalPrice" } } },
    ]);

    const totalOrders = await Order.countDocuments({ seller: sellerId });
    const customers = await Order.distinct("buyer", { seller: sellerId });

    // =================== Monthly Sales ===================
    const monthlySalesAgg = await Order.aggregate([
      { $match: { seller: sellerId, orderStatus: "Delivered" } },
      {
        $group: {
          _id: { $month: "$createdAt" },
          total: { $sum: "$totalPrice" },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    // Convert to 12-month array
    const monthlySales = new Array(12).fill(0);
    monthlySalesAgg.forEach((item) => {
      monthlySales[item._id - 1] = item.total;
    });

    // =================== Weekly Sales ===================
    const weeklySalesAgg = await Order.aggregate([
      { $match: { seller: sellerId, orderStatus: "Delivered" } },
      {
        $group: {
          _id: { $isoWeek: "$createdAt" }, // safer than $week
          total: { $sum: "$totalPrice" },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    // For simplicity, let's assume last 7 weeks
    const weeklySales = weeklySalesAgg.map((item) => item.total);

    // =================== Order Status ===================
    const orderStatusAgg = await Order.aggregate([
      { $match: { seller: sellerId } },
      { $group: { _id: "$orderStatus", count: { $sum: 1 } } },
    ]);

    // Normalize all statuses
    const statusMap = {
      Pending: 0,
      Processing: 0,
      Shipped: 0,
      Delivered: 0,
      Cancelled: 0,
    };
    orderStatusAgg.forEach((item) => {
      statusMap[item._id] = item.count;
    });
    const orderStatus = Object.entries(statusMap).map(([name, count]) => ({
      name,
      count,
    }));

    console.log(orderStatus);

    // =================== Top Products ===================

    const productSales = await calculateProductSales(sellerId);
    const populatedProducts = await Product.find({
      _id: { $in: productSales.map((ps) => ps._id) },
    }).select("title unitsSold");

    console.log(populatedProducts);
    

    // =================== Response ===================
    res.json({
      revenue: revenueAgg[0]?.total || 0,
      orders: totalOrders,
      customers: customers.length,
      conversion: totalOrders
        ? ((totalOrders / customers.length) * 100).toFixed(2)
        : 0,
      monthlySales,
      weeklySales,
      orderStatus,
      topProducts: populatedProducts,
    });
  } catch (error) {
    console.error("Analytics error:", error);
    res.status(500).json({ message: "Analytics failed" });
  }
};




// controllers/seller.analytics.controller.js


// import Order from "../../model/order/order.model.js";
// import Product from "../../model/general/product.model.js";
// import SellerProfile from "../../model/seller/sellerProfile.model.js";
// import { calculateProductSales } from "./calculateUnitsold.controller.js";

// export const getSellerAnalytics = async (req, res) => {
//   try {
//     // 1️⃣ Get seller profile using logged-in user
//     const sellerProfile = await SellerProfile.findOne({
//       user: req.user.id,
//     });

//     if (!sellerProfile) {
//       return res.status(404).json({ message: "Seller profile not found" });
//     }

//     // 2️⃣ This is the REAL sellerId (store id)
//     const sellerId = sellerProfile._id;

//     // =================== Stats ===================
//     const revenueAgg = await Order.aggregate([
//       { $match: { seller: sellerId, orderStatus: "Delivered" } },
//       { $group: { _id: null, total: { $sum: "$totalPrice" } } },
//     ]);

//     const totalOrders = await Order.countDocuments({ seller: sellerId });
//     const customers = await Order.distinct("buyer", { seller: sellerId });

//     // =================== Monthly Sales ===================
//     const monthlySalesAgg = await Order.aggregate([
//       { $match: { seller: sellerId, orderStatus: "Delivered" } },
//       {
//         $group: {
//           _id: { $month: "$createdAt" },
//           total: { $sum: "$totalPrice" },
//         },
//       },
//       { $sort: { _id: 1 } },
//     ]);

//     const monthlySales = new Array(12).fill(0);
//     monthlySalesAgg.forEach((item) => {
//       monthlySales[item._id - 1] = item.total;
//     });

//     // =================== Weekly Sales (Last 7 Weeks) ===================
//     const weeklySalesAgg = await Order.aggregate([
//       { $match: { seller: sellerId, orderStatus: "Delivered" } },
//       {
//         $group: {
//           _id: { $isoWeek: "$createdAt" },
//           total: { $sum: "$totalPrice" },
//         },
//       },
//       { $sort: { _id: 1 } },
//     ]);

//     const weeklySales = weeklySalesAgg
//       .slice(-7)
//       .map((item) => item.total);

//     // =================== Order Status ===================
//     const orderStatusAgg = await Order.aggregate([
//       { $match: { seller: sellerId } },
//       { $group: { _id: "$orderStatus", count: { $sum: 1 } } },
//     ]);

//     const statusMap = {
//       Pending: 0,
//       Processing: 0,
//       Shipped: 0,
//       Delivered: 0,
//       Cancelled: 0,
//     };

//     orderStatusAgg.forEach((item) => {
//       statusMap[item._id] = item.count;
//     });

//     const orderStatus = Object.entries(statusMap).map(([name, count]) => ({
//       name,
//       count,
//     }));

//     // =================== Top Products ===================
//     const productSales = await calculateProductSales(sellerId);

//     const products = await Product.find({
//       _id: { $in: productSales.map(p => p._id) },
//     }).select("title price unitsSold");

//     const topProducts = productSales.map(ps => {
//       const product = products.find(p => p._id.equals(ps._id));
//       return {
//         _id: ps._id,
//         title: product?.title,
//         price: product?.price,
//         unitsSold: ps.unitsSold,
//       };
//     });

//     // =================== Response ===================
//     res.json({
//       stats: {
//         revenue: revenueAgg[0]?.total || 0,
//         orders: totalOrders,
//         customers: customers.length,
//         conversion:
//           customers.length > 0
//             ? ((totalOrders / customers.length) * 100).toFixed(2)
//             : 0,
//       },
//       charts: {
//         monthlySales,
//         weeklySales,
//         orderStatus,
//       },
//       topProducts,
//     });
//   } catch (error) {
//     console.error("Analytics error:", error);
//     res.status(500).json({ message: "Analytics failed" });
//   }
// };
