// controllers/sellerReview.controller.js
import SellerReview from "../../model/seller/sellerReview.model.js";
import SellerProfile from "../../model/seller/sellerProfile.model.js";
import Order from "../../model/order/order.model.js";

export const rateSeller = async (req, res) => {
  try {
    const buyerId = req.user.id;
    const { orderId, rating, review } = req.body;

    // 1️⃣ Validate order
    const order = await Order.findById(orderId);
    if (!order || order.orderStatus !== "Delivered") {
      return res.status(400).json({ message: "Order not eligible for review" });
    }

    // 🚫 Seller cannot rate themselves
    if (order.buyer.toString() === order.sellerUser.toString()) {
      return res.status(403).json({ message: "You cannot rate yourself" });
    }

    // 2️⃣ Prevent duplicate review
    const existing = await SellerReview.findOne({ order: orderId });
    if (existing) {
      return res.status(400).json({ message: "Order already reviewed" });
    }

    // 3️⃣ Create review
    const newReview = await SellerReview.create({
      seller: order.seller,
      buyer: buyerId,
      order: orderId,
      rating,
      review,
    });

    // 4️⃣ Update seller rating
    const seller = await SellerProfile.findById(order.seller);

    const totalRating = seller.rating.average * seller.rating.count + rating;

    seller.rating.count += 1;
    seller.rating.average = totalRating / seller.rating.count;

    // 5️⃣ Trust score impact
    if (rating >= 4) seller.trustScore += 2;
    if (rating <= 2) seller.trustScore -= 5;

    await seller.save();

    res.status(201).json({
      message: "Seller rated successfully",
      review: newReview,
      sellerRating: seller.rating,
      trustScore: seller.trustScore,
    });
  } catch (err) {
    console.error("Rate seller error:", err);
    res.status(500).json({ message: "Failed to rate seller" });
  }
};
