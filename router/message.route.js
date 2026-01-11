import express from "express"
import authenticateJWT from "../utils/authMiddleware.js";
import {
  sendMessage,
  getChatMessages,
} from "../controllers/message.controller.js";

const router = express.Router()

router.get("/get/:chatId", authenticateJWT, getChatMessages)
router.post("/send", authenticateJWT, sendMessage)

export default router