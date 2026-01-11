import express from "express";
import { deleteProduct, getSellerProducts, toggleProductStatus, updateProduct } from "../../controllers/seller/sellerProducts.controller.js";
import authenticateJWT from "../../utils/authMiddleware.js";// JWT middleware

const router = express.Router();

// Fetch all products for the logged-in seller
router.get("/products", authenticateJWT, getSellerProducts);
// seller edit product
router.put("/:productId", authenticateJWT, updateProduct);

// seller delete product
router.delete("/:productId", authenticateJWT, deleteProduct);

router.patch("/:productId/toggle-status", authenticateJWT, toggleProductStatus);




export default router;
