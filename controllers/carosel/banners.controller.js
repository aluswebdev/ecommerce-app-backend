
import Banner from "../../model/carosel/banner.model.js";

// Create a new banner
export const createBanner = async (req, res) => {
  try {
    const { title, image, link, isActive } = req.body;
    const newBanner = new Banner({ title, image, link, isActive });
    await newBanner.save();
    res.status(201).json(newBanner);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// Get all banners
export const getActiveBanners = async (req, res) => {
  try {
    const banners = await Banner.find({ isActive: true }).sort({ createdAt: -1 });
    res.status(200).json({success: true, data: banners});
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// Update a banner by ID
export const updateBanner = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    const updatedBanner = await Banner.findByIdAndUpdate(id, updates, {
      new: true,
    });
    if (!updatedBanner) {
      return res.status(404).json({ message: "Banner not found" });
    }
    res.status(200).json(updatedBanner);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// Delete a banner by ID
export const deleteBanner = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedBanner = await Banner.findByIdAndDelete(id);
    if (!deletedBanner) {
      return res.status(404).json({ message: "Banner not found" });
    }
    res.status(200).json({ message: "Banner deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};