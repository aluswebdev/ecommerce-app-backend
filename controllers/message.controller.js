import Message from "../model/general/message.model.js";
import Chat from "../model/general/chats.model.js";

export const sendMessage = async (req, res) => {
  try {
    const { chatId, senderId, receiverId, content } = req.body;

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

    res.status(201).json({ success: true, message });
  } catch (err) {
    console.error("Send Message Error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};


export const getChatMessages = async (req, res) => {
  try {
    const { chatId } = req.params;
    const { page = 1, limit = 20 } = req.query;

    const messages = await Message.find({ chatId })
      .sort({ createdAt: -1 }) // newest first
      .skip((page - 1) * limit)
      .limit(Number(limit));

    const total = await Message.countDocuments({ chatId });

    res.status(200).json({
      success: true,
      messages: messages.reverse(), // return in chronological order
      total,
      currentPage: Number(page),
      totalPages: Math.ceil(total / limit),
    });
  } catch (err) {
    console.error("Pagination Error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
