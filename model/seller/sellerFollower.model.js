import mongoose from "mongoose";

const sellerFollowSchema = new mongoose.Schema(
  {
    seller: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "SellerProfile",
      required: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

sellerFollowSchema.index({ seller: 1, user: 1 }, { unique: true });

export default mongoose.model("SellerFollow", sellerFollowSchema);
