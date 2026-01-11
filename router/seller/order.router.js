import express from 'express';
import authenticateJWT from '../../utils/authMiddleware.js';
import { createOrder, getOrderById, getOrders, updateOrderStatus } from '../../controllers/seller/order.controller.js';
import { authorize } from '../../utils/roleCheck.js';


const router = express.Router();

router.get("/my", authenticateJWT, getOrders)
router.get("/:id", authenticateJWT, getOrderById)
router.post("/create", authenticateJWT, createOrder)
router.patch("/:id/status", authenticateJWT, authorize("seller"), updateOrderStatus);

export default router;