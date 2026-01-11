// socket.js
import { Server } from "socket.io";
import jwt from "jsonwebtoken";
import User from "../model/general/user.model.js";
import Message from "../model/general/message.model.js";

let io;

export function initSocket(server) {
  io = new Server(server, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
    },
    transports: ["websocket"],
  });

  // AUTH MIDDLEWARE
  io.use(async (socket, next) => {
    const token = socket.handshake.auth?.token;

    if (!token) return next(new Error("No token provided"));

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id);
      if (!user) return next(new Error("User not found"));

      socket.user = user;
      next();
    } catch (err) {
      next(new Error("Invalid token"));
    }
  });

  // MAIN CONNECTION BLOCK
  io.on("connection", (socket) => {
    const userId = socket.user._id.toString();

    console.log(`🔌 Socket connected → ${socket.id} (user: ${userId})`);

    socket.join(`user_${userId}`);

    // Join chat room
    socket.on("joinChat", (chatId) => {
      socket.join(`chat_${chatId}`);
    });

    // TYPING EVENTS
    socket.on("typing", ({ chatId }) => {
      socket.to(`chat_${chatId}`).emit("typing", {
        userId,
        chatId,
      });
    });

    socket.on("stopTyping", ({ chatId }) => {
      socket.to(`chat_${chatId}`).emit("stopTyping", {
        userId,
        chatId,
      });
    });

    // READ RECEIPTS
    socket.on("markRead", async ({ chatId }) => {
      await Message.updateMany(
        { chat: chatId, receiver: userId, status: { $ne: "read" } },
        { status: "read" }
      );

      io.to(`chat_${chatId}`).emit("messagesRead", {
        chatId,
        userId,
      });
    });

    // DISCONNECT
    socket.on("disconnect", () => {
      console.log(`❌ Socket disconnected → ${socket.id}`);
    });
  });

  console.log("✅ Socket.IO initialized");
}

export function getIO() {
  if (!io) throw new Error("Socket.io not initialized");
  return io;
}
