import mongoose from "mongoose";
import dotenv from "dotenv";
import Category from "./model/category.model.js";
// import User from "./models/User.js"; // if needed
// import Product from "./models/Product.js"; // if needed

dotenv.config();

const MONGO_URI = process.env.MONGODB_URI;

console.log("Connecting to:", process.env.MONGODB_URI);


const categories = [
  { name: "Phones" },
  { name: "Fashion" },
  { name: "Electronics" },
  { name: "Home" },
  { name: "Beauty" },
];

const seedCategories = async () => {
  const existing = await Category.find({});
  if (existing.length > 0) {
    console.log("✅ Categories already exist, skipping...");
    return;
  }

  await Category.insertMany(categories);
  console.log("✅ Categories seeded successfully.");
};

// Optional: extend this to seed users/products/sellers
const runSeeder = async () => {
  try {
    console.log("🔌 Connecting to MongoDB...");
    await mongoose.connect(MONGO_URI);

    console.log("🚀 Running Seeder...");
    await seedCategories();

    // You can add:
    // await seedUsers();
    // await seedProducts();

    console.log("✅ Seeding completed.");
    process.exit(0);
  } catch (err) {
    console.error("❌ Seeder Error:", err.message);
    process.exit(1);
  } finally {
    mongoose.connection.close();
  }
};

runSeeder();
