import express from "express";

import { createBanner, deleteBanner, getActiveBanners, updateBanner } from "../../controllers/carosel/banners.controller.js";

const router = express.Router();

router.post("/", createBanner);
router.get("/", getActiveBanners);
router.put("/:id", updateBanner);
router.delete("/:id", deleteBanner);

export default router;