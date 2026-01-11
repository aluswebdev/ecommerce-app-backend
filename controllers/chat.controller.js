// controllers/chat/chat.controller.js
import Chat from "../model/general/chats.model.js";
import Message from "../model/general/message.model.js";
import { getIO } from "../socketIo/socket.js";

export const createOrOpenChat = async (req, res) => {
  try {
    const { sellerId, productId } = req.body;
    const buyerId = req.user._id;

    // Check if chat already exists between buyer & seller for this product
    let chat = await Chat.findOne({
      participants: { $all: [buyerId, sellerId] },
      product: productId,
    });

    if (!chat) {
      chat = await Chat.create({
        participants: [buyerId, sellerId],
        product: productId,
      });
    }

    return res.status(200).json({ success: true, chat });
  } catch (err) {
    console.error("Create chat error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// get users chats

export const getUserChats = async (req, res) => {
  try {
    const chats = await Chat.find({
      participants: req.user._id,
    })
      .populate("product")
      .populate("participants", "fullName, profilePhoto")
      .sort({ updatedAt: -1 });

    res.status(200).json(chats);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};


// get messages

export const getChatMessages = async (req, res) => {
  try {
    const { chatId } = req.params;

    const messages = await Message.find({ chat: chatId })
      .populate("sender", "fullName profilePhoto")
      .sort({ createdAt: 1 });

    res.status(200).json(messages);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};


// send message

export const sendMessage = async (req, res) => {
  try {
    const { chatId } = req.params;
    const { text } = req.body;

    if (!text) {
      return res.status(400).json({ message: "Message text is required" });
    }

    // 1️⃣ Get chat to know the receiver
    const chat = await Chat.findById(chatId);

    if (!chat) {
      return res.status(404).json({ message: "Chat not found" });
    }

    // 2️⃣ Determine receiverId (the other user in the chat)
    const receiverId = chat.participants.find(
      (id) => id.toString() !== req.user._id.toString()
    );

    // 3️⃣ Create the message
    const message = await Message.create({
      chat: chatId,
      sender: req.user._id,
      receiver: receiverId,
      text,
      status: "sent",
    });

    // 4️⃣ Update last message in chat
    await Chat.findByIdAndUpdate(chatId, { lastMessage: text });

    // 5️⃣ Emit real-time updates
    const io = getIO();

    // Send message to both users listening on the chat room
    io.to(`chat_${chatId}`).emit("newMessage", message);

    // Notify receiver only
    io.to(`user_${receiverId}`).emit("messageDelivered", message);

    // 6️⃣ Update message to delivered
    await Message.findByIdAndUpdate(message._id, { status: "delivered" });

    // 7️⃣ Response
    res.status(201).json(message);
  } catch (err) {
    console.log("Send message error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

