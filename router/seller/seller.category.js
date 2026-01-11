import express from "express"


import { getAllCategory } from "../../controllers/seller/category.controller.js";

const router = express.Router()

router.get("/", getAllCategory)

export default router