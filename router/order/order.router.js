import express from "express";
import {
  placeOrder,
  getBuyerOrders,
  getSellerOrders,
  updateOrderStatus,
  getOrderById,
} from "../../controllers/order/order.controller.js";
import authMiddleware from "../../utils/authMiddleware.js";
import { authorize } from "../../utils/roleCheck.js";

const router = express.Router();

router.post("/place", authMiddleware, authorize("buyer"), placeOrder);

router.get("/buyer", authMiddleware, authorize("buyer"), getBuyerOrders);

router.get(
  "/seller",
  authMiddleware,
  authorize("seller", "admin"),
  getSellerOrders
);

router.put(
  "/status/:orderId",
  authMiddleware,
  authorize("seller", "admin"),
  updateOrderStatus
);

router.get(
  "/:orderId",
  authMiddleware,
  authorize("buyer", "seller", "admin"),
  getOrderById
);

export default router;
