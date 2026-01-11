import express from "express";
import {
  getAllUsers,
  deleteUser,
  promoteToSeller,
} from "../controllers/adminUserController.js";
import { protect, isAdmin } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.use(protect, isAdmin);
router.get("/", getAllUsers);
router.delete("/:userId", deleteUser);
router.put("/promote/:userId", promoteToSeller);

export default router;
