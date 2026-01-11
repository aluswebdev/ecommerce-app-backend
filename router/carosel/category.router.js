import express from "express";

import { createCategory, deleteCategory, getActiveCategories, updateCategory } from "../../controllers/carosel/category.controller.js";

const router = express.Router();

router.post("/", createCategory);
router.get("/", getActiveCategories);
router.put("/:id", updateCategory);
router.delete("/:id", deleteCategory);

export default router;
