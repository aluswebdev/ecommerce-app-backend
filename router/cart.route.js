// routes/cartRoutes.js
import express from "express";
import {
  addToCart,
  getCart,
  updateCartItemQuantity,
  removeFromCart,
  clearCart,
} from "../controllers/cart.controller.js";
import authMiddleware from "../utils/authMiddleware.js";
import { cartLimiter } from "../middleware/rateLimitingMiddleware.js";


const router = express.Router();

// Apply authentication + rate-limiting middleware
router.use(authMiddleware); // 🛡️ User must be logged in
router.use(cartLimiter); // 🛡️ Rate limiting for all cart routes

router.get("/", getCart);
router.post("/add", addToCart);
router.patch("/update", updateCartItemQuantity);
router.delete("/remove", removeFromCart);
router.delete("/clear", clearCart);

export default router;

