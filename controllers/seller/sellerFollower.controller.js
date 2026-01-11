import SellerFollow from "../../model/seller/sellerFollower.model.js";
import SellerProfile from "../../model/seller/sellerProfile.model.js";

export const followSeller = async (req, res) => {
  const sellerId = req.params.id;
  const userId = req.user.id;

  await SellerFollow.create({ seller: sellerId, user: userId });

  await SellerProfile.findByIdAndUpdate(sellerId, {
    $inc: { followersCount: 1 },
  });

  res.json({ message: "Followed seller" });
};

export const unfollowSeller = async (req, res) => {
  const sellerId = req.params.id;
  const userId = req.user.id;

  await SellerFollow.findOneAndDelete({ seller: sellerId, user: userId });

  await SellerProfile.findByIdAndUpdate(sellerId, {
    $inc: { followersCount: -1 },
  });

  res.json({ message: "Unfollowed seller" });
};
