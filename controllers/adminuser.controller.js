import User from "../model/general/user.model.js";

export const getAllUsers = async (req, res, next) => {
  try {
    const users = await User.find().select("-password");
    res.json(users);
  } catch (err) {
    logger.error("Admin getAllUsers error", { message: err.message });
    next(err);
  }
};

export const deleteUser = async (req, res, next) => {
  try {
    const user = await User.findByIdAndDelete(req.params.userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    res.json({ message: "User deleted" });
  } catch (err) {
    logger.error("Admin deleteUser error", { message: err.message });
    next(err);
  }
};

export const promoteToSeller = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    user.role = "seller";
    await user.save();

    res.json({ message: "User promoted to seller" });
  } catch (err) {
    logger.error("Admin promoteToSeller error", { message: err.message });
    next(err);
  }
};
