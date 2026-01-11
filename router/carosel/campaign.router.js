import express from "express";

import { createCampaign, deactivateCampaign, deleteCampaign, getActiveCampaigns } from "../../controllers/carosel/campaign.controller.js";

const router = express.Router();

router.post("/", createCampaign);
router.get("/active", getActiveCampaigns);
router.patch("/:id/deactivate", deactivateCampaign);
router.delete("/:id", deleteCampaign);

export default router;