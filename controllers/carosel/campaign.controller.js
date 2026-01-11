import Campaign from "../../model/carosel/campaign.model.js";

export const createCampaign = async (req, res) => {
  try {
    const { title, image, link, startDate, endDate } = req.body;

    // Validate required fields
    if (!title || !image || !startDate || !endDate) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const newCampaign = new Campaign({
      title,
      image,
      link,
      startDate,
      endDate,
    });

    const savedCampaign = await newCampaign.save();
    res.status(201).json(savedCampaign);
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

export const getActiveCampaigns = async (req, res) => {
    try {const now = new Date();
        const campaigns = await Campaign.find({
            isActive: true,
            startDate: { $lte: now},
            endDate: {$gte: now}
        }).sort({ createdAt: -1});

        res.status(200).json({success: true, campaigns});
        
    } catch (err) {
        res.status(500).json({success: false, message: "Server error", error: err.message});
    }
}

export const deactivateCampaign = async (req, res) => {
  try {
    const { id } = req.params;
    const campaign = await Campaign.findById(id);
    if (!campaign) {
      return res.status(404).json({ message: "Campaign not found" });
    }

    campaign.isActive = false;
    await campaign.save();
    res.status(200).json({ message: "Campaign deactivated", campaign });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

export const deleteCampaign = async (req, res) => {
  try {
    const { id } = req.params;
    const campaign = await Campaign.findByIdAndDelete(id);
    if (!campaign) {
      return res.status(404).json({ message: "Campaign not found" });
    }
    res.status(200).json({ message: "Campaign deleted" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};