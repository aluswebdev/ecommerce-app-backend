import mongoose from "mongoose"

const fieldSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    key: { type: String, required: true },
    type: {
      type: String,
      required: true,
      enum: ["text", "number", "select", "date", "multiselect"],
    },
    options: [String],
    variantField: { type: Boolean, default: false },
    required: { type: Boolean, default: false },
  },
  { _id: false }
);

const subcategorySchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    slug: { type: String, required: true, lowercase: true },
    fields: [fieldSchema],
    supportsVariants: { type: Boolean, default: false },
  },
  { _id: true }
);

const categorySchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  slug: { type: String, required: true, lowercase: true, unique: true },
  icon: String,
  description: String,
  supportsVariants: Boolean,
  subcategories: [subcategorySchema],
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
});

const Category = mongoose.model("Category", categorySchema);
export default Category