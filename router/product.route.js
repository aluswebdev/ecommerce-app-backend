import express from "express";
import checkTrustedSeller from "../utils/trustedSeller.js";
import authenticateJWT from "../utils/authMiddleware.js";
import {
  createProduct,
  getAllProducts,
  updateProduct,
  deleteProduct,
  browseProducts,
  autoComplete,
  getSearchSuggestions,
  getFeaturedProducts,
  getRecommendedProducts,
  getPopularProducts,
  getNewArrivalsProducts,
  getProductById,
} from "../controllers/product.controller.js";

const router = express.Router();

router.get("/", getAllProducts);
// routes/productRoutes.js
router.get("/suggest", getSearchSuggestions);

router.get("/autocomplete", autoComplete);
router.get("/browse", authenticateJWT, browseProducts);
router.post("/create", authenticateJWT, checkTrustedSeller, createProduct);
router.put("/update/:id", authenticateJWT, checkTrustedSeller, updateProduct);
router.delete(
  "/deleteproduct/:id",
  authenticateJWT,
  checkTrustedSeller,
  deleteProduct
);


// 🔹 Homepage APIs
router.get("/featured", getFeaturedProducts);
router.get("/recommended", getRecommendedProducts);
router.get("/popular", getPopularProducts);
router.get("/newarrivals", getNewArrivalsProducts);
// Single Product (auto-increment views)
router.get("/:id", getProductById);

export default router;
