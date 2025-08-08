import Chat from "../models/chat.model.js";
import User from "../models/user.model.js";

// Create or get chat between two users
export const getOrCreateChat = async (req, res) => {
  const { userId } = req.body;
  const myId = req.user._id;
  if (!userId) return res.status(400).json({ error: "UserId required" });
  try {
    let chat = await Chat.findOne({
      members: { $all: [myId, userId] },
    });
    if (!chat) {
      chat = await Chat.create({ members: [myId, userId], messages: [] });
    }
    res.status(200).json(chat);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Send a message
export const sendMessage = async (req, res) => {
  const { chatId, text } = req.body;
  const sender = req.user._id;
  if (!chatId || !text)
    return res.status(400).json({ error: "chatId and text required" });
  try {
    const chat = await Chat.findById(chatId);
    if (!chat) return res.status(404).json({ error: "Chat not found" });
    const message = { sender, text };
    chat.messages.push(message);
    await chat.save();
    res.status(200).json(message);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get all chats for a user
export const getUserChats = async (req, res) => {
  const myId = req.user._id;
  try {
    const chats = await Chat.find({ members: myId }).populate(
      "members",
      "_id username fullName profileImg skills"
    );
    res.status(200).json(chats);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
