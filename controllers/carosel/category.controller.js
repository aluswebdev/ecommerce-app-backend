
import Category from "../../model/carosel/category.model.js";

// Create a new category
export const createCategory = async (req, res, next) => {
  try {
    const { name, image } = req.body;
    const newCategory = new Category({ name, image });
    const savedCategory = await newCategory.save();
    res.status(201).json(savedCategory);
  } catch (error) {
    next(error);
  }
};

// Get all categories
export const getActiveCategories = async (req, res, next) => {
  try {
    const categories = await Category.find({ isActive: true }).sort({ name: 1 });
    res.status(200).json({ success: true, data: categories });
  } catch (error) {
    next(error);
  }
};

// Update a category
export const updateCategory = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, image } = req.body;

    const updatedCategory = await Category.findByIdAndUpdate(
      id,
      { name, image },
      { new: true }
    );

    if (!updatedCategory) {
      return res.status(404).json({ success: false, message: "Category not found" });
    }

    res.status(200).json({ success: true, data: updatedCategory });
  } catch (error) {
    next(error);
  }
};
// Delete (deactivate) a category
export const deleteCategory = async (req, res, next) => {
  try {
    const { id } = req.params;

    const deletedCategory = await Category.findByIdAndUpdate(
      id,
      { isActive: false },
      { new: true }
    );

    if (!deletedCategory) {
      return res.status(404).json({ success: false, message: "Category not found" });
    }

    res.status(200).json({ success: true, message: "Category deactivated successfully" });
  } catch (error) {
    next(error);
  }
};