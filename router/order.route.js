import express from "express";
import {
  createOrder,
  getMyOrders,
  cancelOrder,
  getSellerOrders,
  updateOrderStatus,
  getAllOrders,
} from "../controllers/orderController.js";
import { protect, isSeller, isAdmin } from "../middlewares/authMiddleware.js";

const router = express.Router();

// Buyer
router.use(protect);
router.post("/", createOrder);
router.get("/my", getMyOrders);
router.post("/cancel", cancelOrder);

// Seller
router.get("/seller", isSeller, getSellerOrders);
router.put("/seller/update-status", isSeller, updateOrderStatus);

// Admin
router.get("/admin", isAdmin, getAllOrders);

export default router;
