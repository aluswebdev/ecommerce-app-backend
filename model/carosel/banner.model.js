// models/Banner.js
import mongoose from "mongoose";

const bannerSchema = new mongoose.Schema(
  {
    title: { type: String },
    image: { type: String, required: true },
    link: { type: String }, // optional
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

const Banner = mongoose.model("Banner", bannerSchema);
export default Banner;
