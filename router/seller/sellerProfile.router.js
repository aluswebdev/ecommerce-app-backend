import express from "express";
import {
  createSellerProfile,
  getMySellerProfile,
  toggleFollowSeller,
  updateSellerProfile,
} from "../../controllers/seller/sellerProfile.controller.js";
import authMiddleware from "../../utils/authMiddleware.js";
import sellerOnly from "../../utils/roleCheck.js";

const router = express.Router();

router.post("/create", authMiddleware, sellerOnly, createSellerProfile);
router.put("/update", authMiddleware, sellerOnly, updateSellerProfile);
router.get("/profile", authMiddleware, sellerOnly, getMySellerProfile);
router.post("/:sellerId/follow", authMiddleware, toggleFollowSeller);

export default router;
