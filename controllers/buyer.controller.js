import mongoose from "mongoose";
import User from "../model/general/user.model.js";
import cloudinary from "../utils/cloudinary.js";

import { validateSierraLeoneAddress } from "./validateCountry/validateCountry.controller.js";

import logger from "../libs/logger.js";
import { NotFoundError, UnauthorizedError } from "../libs/error.js";

export const getBuyerProfile = async (req, res, next) => {
  try {
    if (!req.user || !req.user._id) {
      throw new UnauthorizedError("Unauthorized access");
    }

    const buyer = await User.findById(req.user._id).select("-password");

    if (!buyer) {
      throw new NotFoundError("Buyer not found");
    }

    res.status(200).json(buyer);
  } catch (error) {
    logger.error("Error in getBuyerProfile", {
      message: error.message,
      stack: error.stack,
      userId: req.user?._id,
      route: req.originalUrl,
    });
    next(error); // Pass to centralized error handler
  }
};

// @desc    Update buyer profile
export const updateBuyerProfile = async (req, res, next) => {
  try {
    const userId = req.user?._id;
    if (!userId) throw new UnauthorizedError("Unauthorized");

    const buyer = await User.findById(userId);
    if (!buyer) throw new NotFoundError("Buyer not found");

    const updates = {};

    // ✅ Only update fields that exist
    if (req.body.fullName) updates.fullName = req.body.fullName;
    if (req.body.phoneNumber) updates.phoneNumber = req.body.phoneNumber;
    if (req.body.location) updates.location = req.body.location;

    const profilePhoto = req.body.profilePhoto;

    // ✅ Only process image if it's a valid base64 image
    if (
      profilePhoto &&
      typeof profilePhoto === "string" &&
      profilePhoto.startsWith("data:image/")
    ) {
      // Delete old image
      if (buyer.profilePhoto?.publicId) {
        await cloudinary.uploader.destroy(buyer.profilePhoto.publicId);
      }

      // Upload new image
      const result = await cloudinary.uploader.upload(profilePhoto, {
        folder: "marketProfilePhotos",
      });

      updates.profilePhoto = {
        url: result.secure_url,
        publicId: result.public_id,
      };
    }

    const updatedBuyer = await User.findByIdAndUpdate(
      userId,
      { $set: updates },
      { new: true, runValidators: true }
    ).select("-password");

    res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      user: updatedBuyer,
    });
  } catch (error) {
    console.error("❌ updateBuyerProfile error:", error.message);
    next(error);
  }
};

// @desc alusine: Add delivery address

export const getDeliveryAddresses = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).select("deliveryAddresses");

    res.status(200).json({
      success: true,
      addresses: user.deliveryAddresses || [],
    });
  } catch (error) {
    next(error);
  }
};

// @desc alusine: Add delivery address

export const addDeliveryAddress = async (req, res, next) => {
  try {
    const { label, details } = req.body;

    if (!validateSierraLeoneAddress(details)) {
      return res.status(400).json({
        message:
          "Invalid delivery address. Please include a valid district or city in Sierra Leone.",
      });
    }

    if (!label || !details) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const user = await User.findById(req.user._id);

    user.deliveryAddresses.push({
      label,
      details,
    });

    await user.save();

    res.status(201).json({
      success: true,
      message: "Address added",
      addresses: user.deliveryAddresses,
    });
  } catch (error) {
    next(error);
  }
};

// @desc alusine: update delivery address

export const updateDeliveryAddress = async (req, res, next) => {
  try {
    const { addressId } = req.params;
    const { label, details, isDefault } = req.body;

    if (!validateSierraLeoneAddress(details)) {
      return res.status(400).json({
        message:
          "Invalid delivery address. Please include a valid district or city in Sierra Leone.",
      });
    }

    // 1️⃣ Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(addressId)) {
      return res.status(400).json({ message: "Invalid address ID" });
    }

    // 2️⃣ Find user
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // 3️⃣ Find address INDEX (correct for plain objects)
    const addressIndex = user.deliveryAddresses.findIndex(
      (addr) => addr._id.toString() === addressId
    );

    if (addressIndex === -1) {
      return res.status(404).json({ message: "Address not found" });
    }

    // 4️⃣ Update allowed fields safely
    if (typeof label === "string" && label.trim()) {
      user.deliveryAddresses[addressIndex].label = label.trim();
    }

    if (typeof details === "string" && details.trim()) {
      user.deliveryAddresses[addressIndex].details = details.trim();
    }

    // 5️⃣ Handle default address logic (IMPORTANT)
    if (typeof isDefault === "boolean" && isDefault === true) {
      user.deliveryAddresses.forEach((addr) => {
        addr.isDefault = false;
      });
      user.deliveryAddresses[addressIndex].isDefault = true;
    }

    await user.save();

    res.status(200).json({
      success: true,
      message: "Address updated successfully",
      addresses: user.deliveryAddresses,
    });
  } catch (error) {
    console.error("Update address error:", error);
    next(error);
  }
};
// @desc alusine: delete delivery address

export const deleteDeliveryAddress = async (req, res, next) => {
  try {
    const { addressId } = req.params;

    // 1️⃣ Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(addressId)) {
      return res.status(400).json({ message: "Invalid address ID" });
    }

    // 2️⃣ Find user
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // 3️⃣ Ensure address exists
    const exists = user.deliveryAddresses.some(
      (addr) => addr._id.toString() === addressId
    );

    if (!exists) {
      return res.status(404).json({ message: "Address not found" });
    }

    // 4️⃣ Delete address
    user.deliveryAddresses.pull({ _id: addressId });

    // 5️⃣ Ensure one default remains (IMPORTANT)
    if (!user.deliveryAddresses.some((a) => a.isDefault)) {
      if (user.deliveryAddresses.length > 0) {
        user.deliveryAddresses[0].isDefault = true;
      }
    }

    await user.save();

    res.status(200).json({
      success: true,
      message: "Address deleted",
      addresses: user.deliveryAddresses,
    });
  } catch (error) {
    console.error("Delete address error:", error);
    next(error);
  }
};

export const setDefaultAddress = async (req, res, next) => {
  try {
    const { addressId } = req.params;
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const addressExists = user.deliveryAddresses.some(
      (addr) => addr._id.toString() === addressId
    );

    if (!addressExists) {
      return res.status(404).json({ message: "Address not found" });
    }

    user.deliveryAddresses.forEach((addr) => {
      addr.isDefault = addr._id.toString() === addressId;
    });

    await user.save();

    res.status(200).json({
      success: true,
      message: "Default address updated",
      addresses: user.deliveryAddresses,
    });
  } catch (error) {
    next(error);
  }
};


export const getDefaultAddress = (user) => {
  return user.deliveryAddresses.find((addr) => addr.isDefault);
};
