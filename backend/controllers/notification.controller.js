import Notification from "../models/notification.model.js";

export const getNotifications = async (req, res) => {
  try {
    const userId = req.user._id;

    const notifications = await Notification.find({ to: userId })
      .populate({
        path: "from",
        select: "username profileImg",
      })
      .sort({ createdAt: -1 }); // Most recent first

    // Mark only unread notifications as read
    await Notification.updateMany({ to: userId, read: false }, { read: true });

    res.status(200).json(notifications);
  } catch (error) {
    console.log("Error in getNotifications function", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const deleteNotifications = async (req, res) => {
  try {
    const userId = req.user._id;

    const result = await Notification.deleteMany({ to: userId });

    res.status(200).json({
      message: "Notifications deleted successfully",
      deletedCount: result.deletedCount,
    });
  } catch (error) {
    console.log("Error in deleteNotifications function", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const markCommunityMessagesAsRead = async (req, res) => {
  try {
    const userId = req.user._id;
    const { communityId } = req.body;
    await Notification.updateMany(
      { to: userId, communityId, type: "community_message", read: false },
      { read: true }
    );
    res.status(200).json({ message: "Marked as read" });
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
};
