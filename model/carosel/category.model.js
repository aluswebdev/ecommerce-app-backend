// models/Category.js
import mongoose from "mongoose";

const categorySchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    image: { type: String }, // optional icon/banner for the category
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

const CategoryCarosel = mongoose.model("CategoryCarosel", categorySchema);
export default CategoryCarosel;
