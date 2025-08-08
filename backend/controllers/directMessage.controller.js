import DirectMessage from "../models/directMessage.model.js";
import Notification from "../models/notification.model.js";

// Get all direct chats for the user (list of users they've chatted with)
export const getDirectChats = async (req, res) => {
  try {
    const userId = req.user._id;
    // Find all unique participants the user has chatted with
    const chats = await DirectMessage.aggregate([
      { $match: { participants: userId } },
      { $unwind: "$participants" },
      { $match: { participants: { $ne: userId } } },
      {
        $group: {
          _id: "$participants",
          lastMessage: { $last: "$text" },
          lastAt: { $last: "$createdAt" },
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "_id",
          foreignField: "_id",
          as: "userInfo",
        },
      },
      { $unwind: "$userInfo" },
      {
        $project: {
          _id: 1,
          lastMessage: 1,
          lastAt: 1,
          userInfo: { username: 1, fullName: 1, profileImg: 1 },
        },
      },
      { $sort: { lastAt: -1 } },
    ]);
    res.json(chats);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get all messages between the user and another user
export const getDirectMessages = async (req, res) => {
  try {
    const userId = req.user._id;
    const otherUserId = req.params.userId;
    const messages = await DirectMessage.find({
      participants: { $all: [userId, otherUserId] },
    })
      .sort({ createdAt: 1 })
      .populate("sender", "username profileImg");
    res.json(messages);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Send a direct message
export const sendDirectMessage = async (req, res) => {
  try {
    const sender = req.user._id;
    const recipient = req.params.userId;
    const { text } = req.body;
    if (!text) return res.status(400).json({ error: "Message text required" });
    const message = new DirectMessage({
      participants: [sender, recipient],
      sender,
      text,
      readBy: [sender],
    });
    await message.save();
    const populatedMsg = await message.populate(
      "sender",
      "username profileImg"
    );
    // Get sender's username for notification message
    const senderUser = await message.populate("sender", "username");
    const notificationMsg = `You have a new message from @${senderUser.sender.username}`;
    await Notification.create({
      from: sender,
      to: recipient,
      type: "direct_message",
      message: notificationMsg,
      read: false,
    });
    // Emit real-time notification if using socket.io
    if (global.io) {
      global.io.to(recipient.toString()).emit("direct_message_notification", {
        from: sender,
        to: recipient,
        type: "direct_message",
        message: notificationMsg,
      });
    }
    res.status(201).json(populatedMsg);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
