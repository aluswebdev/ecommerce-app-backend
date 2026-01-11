import mongoose from "mongoose";

const sellerProfileSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },

    storeName: {
      type: String,
      required: true,
    },

    storeDescription: String,
    coverImage: String,

    // 👥 Followers
    followers: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    followersCount: { type: Number, default: 0 },

    // ⭐ Ratings (aggregated)
    rating: {
      average: { type: Number, default: 0 },
      count: { type: Number, default: 0 },
    },

    // 🧠 Trust system
    trustScore: {
      type: Number,
      default: 50,
      min: 0,
      max: 100,
    },

    // 📊 Business metrics
    totalSales: { type: Number, default: 0 },
    totalRevenue: { type: Number, default: 0 },

    products: [{ type: mongoose.Schema.Types.ObjectId, ref: "Product" }],

    // ✅ Admin verification
    verified: { type: Boolean, default: false },
  },
  { timestamps: true }
);


const SellerProfile = mongoose.model("SellerProfile", sellerProfileSchema);

export default SellerProfile;