// models/Category.js
import mongoose from "mongoose";

const CategoryFieldSchema = new mongoose.Schema({
  name: { type: String, required: true },
  type: { type: String, enum: ["text", "number", "select"], required: true },
  options: [String],
  required: { type: Boolean, default: false },
  variantField: { type: Boolean, default: false },
});

const SubcategorySchema = new mongoose.Schema({
  name: { type: String, required: true },
  fields: [CategoryFieldSchema],
  supportsVariants: { type: Boolean, default: false },
});

const CategorySchema = new mongoose.Schema({
  name: { type: String, required: true },
  subcategories: [SubcategorySchema],
});

const Category = mongoose.model("Category", CategorySchema);
export default Category;





// [
//   {
//     name: "Electronics",
//     subcategories: [
//       {
//         name: "Phones",
//         fields: [
//           { name: "Brand", type: "text", required: true },
//           { name: "Model", type: "text", required: true },
//           {
//             name: "Storage",
//             type: "select",
//             options: ["64GB", "128GB", "256GB"],
//             required: true,
//           },
//           {
//             name: "Condition",
//             type: "select",
//             options: ["New", "Used"],
//             required: true,
//           },
//         ],
//       },
//       {
//         name: "Laptops",
//         fields: [
//           { name: "Brand", type: "text", required: true },
//           {
//             name: "RAM",
//             type: "select",
//             options: ["4GB", "8GB", "16GB", "32GB"],
//             required: true,
//           },
//           { name: "Processor", type: "text", required: true },
//           {
//             name: "Operating System",
//             type: "select",
//             options: ["Windows", "MacOS", "Linux"],
//             required: true,
//           },
//         ],
//       },
//     ],
//   },
//   {
//     name: "Vehicles",
//     subcategories: [
//       {
//         name: "Cars",
//         fields: [
//           { name: "Brand", type: "text", required: true },
//           { name: "Model", type: "text", required: true },
//           { name: "Year", type: "number", required: true },
//           {
//             name: "Transmission",
//             type: "select",
//             options: ["Automatic", "Manual"],
//             required: true,
//           },
//           { name: "Mileage", type: "number", required: true },
//           {
//             name: "Fuel Type",
//             type: "select",
//             options: ["Petrol", "Diesel", "Electric", "Hybrid"],
//             required: true,
//           },
//         ],
//       },
//       {
//         name: "Motorbikes",
//         fields: [
//           { name: "Brand", type: "text", required: true },
//           { name: "Engine Capacity", type: "number", required: true },
//         ],
//       },
//     ],
//   },
//   {
//     name: "Fashion",
//     subcategories: [
//       {
//         name: "Clothes",
//         fields: [
//           {
//             name: "Gender",
//             type: "select",
//             options: ["Male", "Female", "Unisex"],
//             required: true,
//           },
//           {
//             name: "Size",
//             type: "select",
//             options: ["XS", "S", "M", "L", "XL", "XXL"],
//             required: true,
//           },
//           { name: "Material", type: "text", required: true },
//           { name: "Color", type: "text", required: true },
//         ],
//       },
//       {
//         name: "Shoes",
//         fields: [
//           {
//             name: "Gender",
//             type: "select",
//             options: ["Male", "Female", "Unisex"],
//             required: true,
//           },
//           {
//             name: "Size",
//             type: "select",
//             options: ["38", "39", "40", "41", "42", "43", "44"],
//             required: true,
//           },
//         ],
//       },
//     ],
//   },
// ];
