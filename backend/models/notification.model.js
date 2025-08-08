import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
  {
    from: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    to: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    type: {
      type: String,
      required: true,
      enum: [
        "follow",
        "like",
        "community_message",
        "direct_message",
        "comment",
        "repost",
      ],
    },
    read: {
      type: Boolean,
      default: false,
    },
    communityId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Community",
    },
    message: String, // optional, for chat preview
    postId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Post",
    },
  },
  { timestamps: true }
);

const Notification = mongoose.model("Notification", notificationSchema);

export default Notification;
