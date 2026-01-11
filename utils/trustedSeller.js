// middleware/checkTrustedSeller.js
import User from "../model/general/user.model.js";

const checkTrustedSeller = async (req, res, next) => {
  try {
    const user = await User.findById(req.user);
    console.log(user)
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (!user || !user.isVerifiedSeller) {
      return res.status(403).json({
        message:
          "You are not authorized to post products. Apply to become a trusted seller.",
      });
    }

    next(); // Allow posting
  } catch (err) {
    console.error("Error checking trusted seller status:", err.message);
    return res
      .status(500)
      .json({ message: "Server error during seller check" });
  }
};

export default checkTrustedSeller;
