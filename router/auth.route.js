import express from "express";
import { signUp, logIn, logOut, changePassword,  } from "../controllers/auth.controller.js";
import upload from "../utils/upload.js"
import authenticateJWT from "../utils/authMiddleware.js";



const router = express.Router();

// Route to handle user signup
// router.get("/users/me", authenticateJWT, getMyProfile)
router.put("/change-password", authenticateJWT, changePassword)
router.post("/signup", signUp);
router.post("/login", logIn)
router.post("/logout", logOut)

export  default router