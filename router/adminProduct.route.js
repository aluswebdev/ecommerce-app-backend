import express from "express";
import {
  getAllProducts,
  verifyProduct,
  markProductFeatured,
  deleteProduct,
} from "../controllers/adminProductController.js";
import { protect, isAdmin } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.use(protect, isAdmin);
router.get("/", getAllProducts);
router.put("/verify/:productId", verifyProduct);
router.put("/feature/:productId", markProductFeatured);
router.delete("/:productId", deleteProduct);

export default router;
