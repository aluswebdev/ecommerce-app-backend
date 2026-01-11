import express from "express";
import { getProductById } from "../../controllers/publicController/getProductById.controller.js";


const router = express.Router();

// GET /api/products/:id
router.get("/:id", getProductById);

export default router;
