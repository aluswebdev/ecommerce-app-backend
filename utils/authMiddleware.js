import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import User from "../model/general/user.model.js";
dotenv.config();


const authenticateJWT = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res
        .status(401)
        .json({ message: "Unauthorized: No token provided" });
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    

    if (!decoded) {
      return res.status(400).json({message: "Unauthorized Invalid token provided"})
     }

    const user = await User.findById(decoded.id).select("-password");
    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }
    

    req.user = user;
    req.user.isTrustedSeller = user.isTrustedSeller;
    next();
  } catch (err) {
    console.error("JWT verification error:", err.message);
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};

export default authenticateJWT;
