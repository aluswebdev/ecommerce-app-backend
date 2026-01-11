import mongoose from "mongoose";
import Order from "../../model/order/order.model.js";
import Product from "../../model/general/product.model.js";

export const calculateProductSales = async (sellerId) => {
  const sellerObjectId = new mongoose.Types.ObjectId(sellerId);

  // Aggregate units sold and revenue for seller's products
  const productSales = await Order.aggregate([
    { $match: { seller: sellerObjectId, orderStatus: "Delivered" } },
    { $unwind: "$items" }, // flatten items array
    {
      $group: {
        _id: "$items.product",
        unitsSold: { $sum: "$items.quantity" },
        revenue: { $sum: { $multiply: ["$items.quantity", "$items.price"] } },
      },
    },
    { $sort: { unitsSold: -1 } },
  ]);

  // Optional: Update Product collection (if you want to store it)
  for (const ps of productSales) {
    await Product.findByIdAndUpdate(ps._id, {
      unitsSold: ps.unitsSold,
      revenue: ps.revenue,
    });
  }

  return productSales;
};
