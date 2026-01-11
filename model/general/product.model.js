import mongoose from "mongoose";

function arrayLimit(val) {
  return val.length <= 4;
}

const productSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true, maxlength: 150 },
    description: { type: String, required: true, maxlength: 3000 },
    price: { type: Number, required: true, min: 0 },
    discountPrice: { type: Number, min: 0 },
    stock: { type: Number, default: 0, min: 0 },
    sku: { type: String, unique: true, sparse: true },

    // ✅ Category selection
    category: { type: String, required: true }, // e.g. "electronics"
    subcategory: { type: String, required: true }, // e.g. "phones"

    // ✅ Dynamic attributes based on category fields
    attributes: {
      type: Map,
      of: mongoose.Schema.Types.Mixed, // can hold string, number, select option
      default: {},
    },

    recommended: {
      type: Boolean,
      default: false,
    },

    views: {
      type: Number,
      default: 0, // increment when user opens product detail
    },

    condition: {
      type: String,
      enum: ["new", "used", "refurbished"],
      default: "new",
    },
    images: {
      type: [
        {
          url: { type: String, required: true },
          public_id: { type: String, required: true },
        },
      ],
      validate: [(val) => val.length <= 4, "Max 4 images allowed"],
    },

    tags: { type: [String], default: [] },
    shippingFree: { type: Boolean, default: true },
    shippings: {
      estimatedDays: String,
      shippingLocation: String,
    },
    deliveryOptions: { type: String },
    features: { type: [String], default: [] },

    location: {
      city: String,
      region: String,
      country: { type: String, default: "Sierra Leone" },
    },

    seller: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // ✅ New fields for Seller Dashboard
    unitsSold: {
      type: Number,
      default: 0,
      min: 0,
    },
    revenue: {
      type: Number,
      default: 0,
      min: 0,
    },

    sales: {
      type: Number,
      default: 0, // increment when product is purchased
    },

    featured: {
      type: Boolean,
      default: false, // use this for banners or homepage campaigns
    },

    status: {
      type: String,
      enum: ["active", "inactive", "pending"],
      default: "pending",
    },

    isApprovedSeller: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
    views: { type: Number, default: 0 },
    inStock: { type: Boolean, default: true },
    isFeatured: { type: Boolean, default: false },
    postedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

// Index for search and filter
productSchema.index({ title: "text", category: 1, price: 1 });

const Product = mongoose.model("Product", productSchema);
export default Product;
