import express from "express";
import {
  getTopSellingProducts,
  getMostViewedProducts,
  getCategorySales,
  getOrderSummary,
} from "../controllers/analyticsController.js";

const router = express.Router();

router.get("/top-selling", getTopSellingProducts);
router.get("/most-viewed", getMostViewedProducts);
router.get("/category-sales", getCategorySales);
router.get("/orders-summary", getOrderSummary);

export default router;



// server setup code

// import analyticsRoutes from "./routes/analyticsRoutes.js";

// app.use("/api/analytics", analyticsRoutes);
