import mongoose from "mongoose";
import SellerProfile from "./model//seller/sellerProfile.model.js";

import dotenv from "dotenv";
dotenv.config();

const migrateRatings = async () => {
  await mongoose.connect(process.env.MONGODB_URI);

  const sellers = await SellerProfile.find({
    rating: { $type: "number" },
  });

  for (const seller of sellers) {
    seller.rating = {
      average: seller.rating,
      count: 1,
    };
    seller.trustScore = seller.trustScore ?? 50;
    await seller.save();
  }

  console.log("Migration complete");
  process.exit();
};

migrateRatings();
