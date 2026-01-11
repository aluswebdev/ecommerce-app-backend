// routes/wishlist.routes.js
import express from "express";

import authenticateJWT from '../utils/authMiddleware.js';

import {
  // addToWishlist,
  removeFromWishlist,
  getUserWishlist,
  isInWishlist,
  toggleWishlist,
  addToWishlist,
  // toggleWishlist
} from "../controllers/wishlist.controller.js";


const router = express.Router();

router.use(authenticateJWT);
router.get("/wishlistproduct", getUserWishlist);
router.get("/check/:productId", isInWishlist)
router.post("/wishlist", addToWishlist)
router.post("/", toggleWishlist);
router.delete("/:productId", removeFromWishlist);

export default router;

