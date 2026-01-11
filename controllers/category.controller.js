import Category from "../model/general/category.model.js";

// @desc Get all categories
// @route GET /api/categories
// @access Public
export const getAllCategories = async (req, res, next) => {
  try {
    const categories = await Category.find().sort({ name: 1 });
    return res.status(200).json({ categories });
  } catch (error) {
    console.error("Get categories error:", error);
    return res.status(500).json({ message: "Failed to fetch categories" });
  }
};
