import { NotFoundError } from "../libs/error.js";
import logger from "../libs/logger.js";
import Wishlist from "../model/general/wishlist.model.js"; // or adjust path as needed

export const toggleWishlist = async (req, res) => {
  try {
    const { postId } = req.body;
    const userId = req.user._id;

    if (!postId) {
      return res.status(400).json({ message: "Product ID is required" });
    }

    const existing = await Wishlist.findOne({ user: userId, product: postId });

    if (existing) {
      await Wishlist.findByIdAndDelete(existing._id);
      return res.status(200).json({ message: "Removed from wishlist" });
    }

    const bookmark = new Wishlist({ user: userId, product: postId });
    await bookmark.save();
    return res.status(201).json({ message: "Bookmark added" });
  } catch (error) {
    logger.error("Toggle wishlist error:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

export const addToWishlist = async (req, res) => {
  try {
    const userId = req.user._id;
    const { product } = req.body;

    const existing = await Wishlist.findOne({ user: userId, product });
    if (existing) {
      return res.status(400).json({ message: "Product already in wishlist" });
    }

    let data = new Wishlist({ user: userId, product });
    await data.save();

    // 👇 populate product before sending back
    data = await data.populate({
      path: "product",
      select: "title price images description condition", // pick fields you need
    });

    return res
      .status(201)
      .json({ message: "Product added to wishlist successfully ✅", data });
  } catch (error) {
    logger.error("Add to wishlist error:", error);
    return res.status(500).json({ message: "Server error" });
  }
};


// ❌ Remove product from wishlist
export const removeFromWishlist = async (req, res) => {
  try {
    const userId = req.user._id;
    const { productId } = req.params;

    const result = await Wishlist.findOneAndDelete({
      user: userId,
      product: productId,
    });

    if (!result) {
      return res.status(404).json({ message: "Item not found in wishlist" });
    }

    return res.json({ message: "Removed from wishlist" });
  } catch (error) {
    logger.error("Remove from wishlist error:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

export const getUserWishlist = async (req, res) => {
  try {
    const userId = req.user._id;
    const bookmarks = await Wishlist.find({ user: userId })
      .populate("product")
      .sort({ createdAt: -1 });
    res.status(200).json(bookmarks);
  } catch (error) {
    logger.error("Fetch wishlist error:", error);
    return res.status(400).json({ message: "Error fetching wishlist" });
  }
};

// 🧠 Optional: check if a product is in wishlist
export const isInWishlist = async (req, res) => {
  try {
    const userId = req.user._id;
    const { productId } = req.params;

    const exists = await Wishlist.exists({ user: userId, product: productId });

    res.json({ inWishlist: !!exists });
  } catch (error) {
    console.error("Check wishlist error:", error);
    res.status(500).json({ message: "Server error" });
  }
};
