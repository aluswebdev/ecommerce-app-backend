import SellerProfile from "../../model/seller/sellerProfile.model.js";
import User from "../../model/general/user.model.js";


export const createSellerProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const { storeName, storeDescription } = req.body;

    const exists = await SellerProfile.findOne({ user: userId });
    if (exists) {
      return res.status(400).json({ message: "Seller profile already exists" });
    }

    const seller = await SellerProfile.create({
      user: userId,
      storeName,
      storeDescription,
    });

    await User.findByIdAndUpdate(userId, {
      isSeller: true,
      role: "seller",
    });

    res.status(201).json(seller);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const updateSellerProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const { storeName, storeDescription, coverImage } = req.body;

    const seller = await SellerProfile.findOneAndUpdate(
      { user: userId },
      { storeName, storeDescription, coverImage },
      { new: true }
    );

    if (!seller) {
      return res.status(404).json({ message: "Seller profile not found" });
    }

    res.json({message: "profile updated successfully", seller});
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


export const getMySellerProfile = async (req, res) => {
  try {
    const sellerProfile = await SellerProfile.findOne({
      user: req.user.id,
    }).populate("user", "fullName email profilePhoto location");

    if (!sellerProfile) {
      return res.status(404).json({ message: "Seller profile not found" });
    }

    res.json(sellerProfile);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch seller profile" });
  }
};


export const toggleFollowSeller = async (req, res) => {
  try {
    const buyerId = req.user.id; // logged-in user
    const { sellerId } = req.params; // SellerProfile ID

    const seller = await SellerProfile.findById(sellerId).populate("user");

    if (!seller) {
      return res.status(404).json({ message: "Seller not found" });
    }

    // ❌ Seller cannot follow himself
    if (seller.user._id.toString() === buyerId) {
      return res.status(403).json({
        message: "You cannot follow your own store",
      });
    }

    // ❌ Only buyers can follow sellers
    if (req.user.role !== "buyer") {
      return res.status(403).json({
        message: "Only buyers can follow sellers",
      });
    }

    const alreadyFollowing = seller.followers.includes(buyerId);

    if (alreadyFollowing) {
      seller.followers.pull(buyerId);
    } else {
      seller.followers.push(buyerId);
    }

    await seller.save();

    res.json({
      success: true,
      followersCount: seller.followers.length,
      following: !alreadyFollowing,
    });
  } catch (err) {
    console.error("Follow error:", err);
    res.status(500).json({ message: "Follow action failed" });
  }
};
