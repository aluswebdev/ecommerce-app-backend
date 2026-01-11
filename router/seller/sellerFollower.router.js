import express from "express";
import {
  followSeller,
  unfollowSeller,
} from "../../controllers/seller/sellerFollower.controller.js";

import authMiddleware from "../../utils/authMiddleware.js";

const router = express.Router();

router.post("/follow/:id", authMiddleware, followSeller);
router.post("/unfollow/:id", authMiddleware, unfollowSeller);

export default router;
