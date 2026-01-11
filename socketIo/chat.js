import Chat from "../model/general/chats.model.js";
import Message from "../model/general/message.model.js";

export default function registerSocketHandlers(io) {
  io.on("connection", (socket) => {
    console.log("🟢 Client connected");

    socket.on("join_chat", ({ chatId }) => {
      socket.join(chatId);
    });

    socket.on("typing", ({ chatId, userId }) => {
      socket.to(chatId).emit("typing", { userId });
    });

      socket.on("typing", ({ chatId, userId }) => {
        socket.to(chatId).emit("typing", { chatId, userId });
      });


    socket.on(
      "send_message",
      async ({ chatId, senderId, receiverId, content }) => {
        const message = await Message.create({
          chatId,
          senderId,
          receiverId,
          content,
        });
        await Chat.findByIdAndUpdate(chatId, {
          lastMessage: message._id,
          updatedAt: new Date(),
        });

        io.to(chatId).emit("receive_message", { ...message._doc });
      }
    );

    socket.on("seen_message", async ({ chatId, userId }) => {
      await Message.updateMany(
        { chatId, receiverId: userId, seen: false },
        { seen: true }
      );
      io.to(chatId).emit("messages_seen", { chatId, userId });
    });

    socket.on("mark_all_read", async ({ userId }) => {
      await Message.updateMany(
        { receiverId: userId, seen: false },
        { seen: true }
      );
      io.to(userId).emit("all_messages_read");
    });

    socket.on("disconnect", () => {
      console.log("🔴 Client disconnected");
    });
  });
}
