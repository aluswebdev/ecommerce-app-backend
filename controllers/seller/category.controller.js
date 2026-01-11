import Category from "../../model/seller/category.model.js";
import logger from "../../libs/logger.js";

export const getAllCategory = async (req, res) => {
  try {
    const categories = await Category.find({}); // ✅ Await the query

    if (categories.length === 0) {
      return res.status(404).json({ message: "No categories found" }); // ✅ Better status code
    }

    return res.status(200).json({ categories });
  } catch (error) {
    logger.error("Get category failed", { error: error.message });
    return res
      .status(500)
      .json({ message: "Server error", error: error.message }); // ✅ Send response
  }
};
