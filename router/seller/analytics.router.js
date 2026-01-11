// routes/seller.analytics.routes.js
import express from "express";
import { getSellerAnalytics } from "../../controllers/seller/analytics.controller.js";
import authMiddleware from "../../utils/authMiddleware.js";

const router = express.Router();

router.get("/seller/analytics", authMiddleware, getSellerAnalytics);
export default router;
