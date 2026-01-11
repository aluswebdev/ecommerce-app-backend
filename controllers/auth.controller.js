import User from "../model/general/user.model.js";
import bcrypt from "bcryptjs";
import cloudinary from "../utils/cloudinary.js";
import jwt from "jsonwebtoken";
import SellerProfile from "../model/seller/sellerProfile.model.js";

export const signUp = async (req, res) => {
  try {
    const {
      fullName,
      phoneNumber,
      email,
      password,
      role,
      location,
      profilePhoto, // base64 (optional)
    } = req.body;

    // 1️⃣ Required fields (NO profilePhoto here)
    if (!fullName || !phoneNumber || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Please fill all required fields",
      });
    }

    // 2️⃣ Prevent role injection
    const allowedRoles = ["buyer", "seller"];
    const safeRole = allowedRoles.includes(role) ? role : "buyer";

    // 3️⃣ Existing user check
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "User already exists",
      });
    }

    // 4️⃣ Validate email
    const emailRegex =
      /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: "Invalid email address",
      });
    }

    // 5️⃣ Validate password
    const passwordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*])(?=.{8,})/;

    if (!passwordRegex.test(password)) {
      return res.status(400).json({
        success: false,
        message:
          "Password must be at least 8 characters and include uppercase, lowercase, number and special character",
      });
    }

    // 6️⃣ Upload profile photo ONLY if provided
    let profilePhotoData = {
      url: "",
      publicId: "",
    };

    if (profilePhoto) {
      if (!/^data:image\/[a-zA-Z]+;base64,/.test(profilePhoto)) {
        return res.status(400).json({
          success: false,
          message: "Invalid profile image format",
        });
      }

      const result = await cloudinary.uploader.upload(profilePhoto, {
        folder: "marketProfilePhotos",
      });

      profilePhotoData = {
        url: result.secure_url,
        publicId: result.public_id,
      };
    }

    // 7️⃣ Create user (password hashed in model)
    const newUser = await User.create({
      fullName,
      phoneNumber,
      email,
      password, // hashed in pre-save hook
      role: safeRole,
      location,
      profilePhoto: profilePhotoData,
    });

    // 8️⃣ Seller profile creation
    let sellerProfile = null;

    if (safeRole === "seller") {
      sellerProfile = await SellerProfile.create({
        user: newUser._id,
        storeName: `${newUser.fullName}'s Store`,
        bannerImage: profilePhotoData.url,
        rating: 0,
        followers: [],
        products: [],
      });
    }

    // 9️⃣ JWT
    const token = jwt.sign(
      { id: newUser._id, role: newUser.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.status(201).json({
      success: true,
      message: `🎉 Welcome aboard, ${
        newUser.fullName || "there"
      }! Thanks for joining SLEM.`,
      user: {
        id: newUser._id,
        fullName: newUser.fullName,
        email: newUser.email,
        role: newUser.role,
        location: newUser.location,
        profilePhoto: newUser.profilePhoto,
        sellerProfile,
      },
      token,
    });
  } catch (error) {
    console.error("Signup error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

export const logIn = async (req, res) => {
  const { email, password } = req.body;

  try {
    // 1️⃣ Find user by email
    const user = await User.findOne({ email }).select("+password");
    if (!user) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    console.log("User found for login:", user.password, password);

    // 2️⃣ Compare password
    const isMatch = await bcrypt.compare(password, user?.password);
    console.log("Password match result:", isMatch);

    if (!isMatch) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    // 3️⃣ Generate JWT with role included
    const token = jwt.sign(
      {
        id: user._id,
        // email: user.email,
        // role: user.role,
      },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    // 4️⃣ Return user details and token
    return res.status(200).json({
      success: true,
      message: `Welcome back, ${user.fullName}!`,
      token,
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        location: user.location,
        profilePhoto: user.profilePhoto,
        phoneNumber: user.phoneNumber,
      },
    });
  } catch (err) {
    console.error("Login error:", err.message);
    res.status(500).json({ message: "Server error during login" });
  }
};

export const logOut = async (req, res) => {
  try {
    res.cookie("token", "", { maxAge: 0 });
    return res.status(200).json({ message: "User logged out successfully" });
  } catch (err) {
    console.log("error in logout controller", err.message);
    return res.status(500).json({ message: "Server error" });
  }
};

export const savePushToken = async (req, res) => {
  try {
    const { pushToken } = req.body;
    const user = await User.findById(req.user._id);
    user.pushToken = pushToken;
    await user.save();
    res.status(200).json({ message: "Push token saved" });
  } catch (err) {
    logger.error("savePushToken error", { err });
    res.status(500).json({ message: "Server error" });
  }
};

// Change password
export const changePassword = async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  try {
    const user = await User.findById(req.user.id).select("+password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Current password is incorrect" });
    }

    if (currentPassword === newPassword) {
      return res.status(400).json({
        message: "New password must be different from current password.",
      });
    }

    const isPasswordValid =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*]).{8,}$/;

    if (!isPasswordValid.test(newPassword)) {
      return res.status(400).json({
        message:
          "Password must be at least 8 characters and include uppercase, lowercase, number & special character.",
      });
    }

    // ✅ KEY LINE
    user.password = newPassword;

    // 🔥 pre-save hook hashes it ONCE
    await user.save();

    res.json({ message: "Password updated successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};
