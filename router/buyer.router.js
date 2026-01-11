import express from "express";
import {
  addDeliveryAddress,
  deleteDeliveryAddress,
  getBuyerProfile,
  getDeliveryAddresses,
  setDefaultAddress,
  updateBuyerProfile,
  updateDeliveryAddress,
} from "../controllers/buyer.controller.js";
import authMiddleware from "../utils/authMiddleware.js";

const router = express.Router();

router.put("/update", authMiddleware, updateBuyerProfile);
router.get("/profile", authMiddleware, getBuyerProfile);
router.get("/delivery-addresses", authMiddleware, getDeliveryAddresses);
router.post("/delivery-addresses", authMiddleware, addDeliveryAddress);

// ✅ Set default delivery address
router.put(
  "/addresses/:addressId/default",
  authMiddleware,
  setDefaultAddress
);

router.put(
  "/delivery-addresses/:addressId",
  authMiddleware,
  updateDeliveryAddress
);

// router.patch("/:addressId/default", authMiddleware, setDefaultAddress);

router.delete(
  "/delivery-addresses/:addressId",
  authMiddleware,
  deleteDeliveryAddress
);

export default router;
