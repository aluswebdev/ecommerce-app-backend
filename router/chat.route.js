// routes/chat.routes.js
import express from "express";
import authMiddleware from "../utils/authMiddleware.js";
import {
  createOrOpenChat,
  getUserChats,
  getChatMessages,
  sendMessage,
} from "../controllers/chat.controller.js";

const router = express.Router();

router.post("/open", authMiddleware, createOrOpenChat); // Auto-create chat with product
router.get("/", authMiddleware, getUserChats); // List chats
router.get("/:chatId", authMiddleware, getChatMessages); // Get messages
router.post("/:chatId/send", authMiddleware, sendMessage); // Send message

export default router;
