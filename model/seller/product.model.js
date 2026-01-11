// models/Product.js
import { ref } from "joi";
import mongoose from "mongoose";

const MediaSchema = new mongoose.Schema(
  {
    url: String,
    type: { type: String, enum: ["image", "video"] },
    isFeatured: { type: Boolean, default: false },
    alt: String,
  },
  { _id: false }
);

const VariantSchema = new mongoose.Schema(
  {
    sku: String,
    price: { type: Number, required: true },
    comparePrice: Number,
    stock: { type: Number, default: 0 },
    attrs: mongoose.Schema.Types.Mixed, // { size: "M", color: "red" } keys match Category field.key
    media: [MediaSchema],
    weightKg: Number,
    dimensionsCm: { length: Number, width: Number, height: Number },
    active: { type: Boolean, default: true },
  },
  { _id: true }
);

const ProductSchema = new mongoose.Schema(
  {
    seller: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    title: { type: String, required: true, text: true },
    slug: { type: String, lowercase: true, index: true },
    description: String,
    shortDescription: String,
    category: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "Category",
    }, // category slug
    subcategory: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    }, // subcategory slug
    // ✅ Dynamic attributes based on category fields
    attributes: {
      type: Map,
      of: mongoose.Schema.Types.Mixed, // can hold string, number, select option
      default: {},
    },
    images: {
      type: [String],
      validate: [arrayLimit, "You can upload max 4 images"],
    },

    basePrice: Number, // optional base price
    baseComparePrice: Number,
    active: { type: Boolean, default: true },
    published: { type: Boolean, default: false },
    supportsVariants: { type: Boolean, default: false },
    variants: [VariantSchema],
    shipping: {
      weightKg: Number,
      dimensionsCm: { length: Number, width: Number, height: Number },
      shippingOptions: [String], // names or ids of shipping methods allowed
    },
    location: {
      country: String,
      region: String,
      city: String,
    },
    tags: [String],
    seo: { metaTitle: String, metaDescription: String },
    stats: {
      views: { type: Number, default: 0 },
      sold: { type: Number, default: 0 },
      rating: { type: Number, default: 0 },
      reviewsCount: { type: Number, default: 0 },
    },
    deletedAt: Date, // soft delete
  },
  { timestamps: true }
);

// ProductSchema.index({ title: "text", "dynamic.brand": "text", });
ProductSchema.index({ seller: 1, category: 1, subcategory: 1 });

const Product = mongoose.model("Product", ProductSchema);
export default Product;
