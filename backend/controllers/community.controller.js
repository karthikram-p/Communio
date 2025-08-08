import Community from "../models/community.model.js";
import CommunityMessage from "../models/communityMessage.model.js";
import Notification from "../models/notification.model.js";
import { v2 as cloudinary } from "cloudinary";

// Search communities by name (case-insensitive, partial match)
export const searchCommunities = async (req, res) => {
  try {
    const { name } = req.query;
    if (!name)
      return res.status(400).json({ error: "Community name is required" });
    const communities = await Community.find({
      name: { $regex: name, $options: "i" },
    }).select("_id name profilePhoto description");
    res.json(communities);
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
};

export const joinCommunity = async (req, res) => {
  const userId = req.user._id;
  const communityId = req.params.id;
  try {
    const community = await Community.findById(communityId);
    if (!community)
      return res.status(404).json({ error: "Community not found" });
    if (community.members.includes(userId)) {
      return res.status(400).json({ error: "Already a member" });
    }
    community.members.push(userId);
    await community.save();
    res.json({ message: "Joined community" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getAllCommunities = async (req, res) => {
  try {
    const communities = await Community.find();
    res.json(communities);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Create a community
export const createCommunity = async (req, res) => {
  const { name, description, profilePhoto } = req.body;
  const owner = req.user._id;
  try {
    let profilePhotoUrl = "";
    if (profilePhoto) {
      // If profilePhoto is a base64 string or data URL, upload to Cloudinary
      const uploadedResponse = await cloudinary.uploader.upload(profilePhoto, {
        folder: "communities",
      });
      profilePhotoUrl = uploadedResponse.secure_url;
    }

    const community = new Community({
      name,
      description,
      profilePhoto: profilePhotoUrl,
      owner,
      members: [owner],
    });
    await community.save();
    res.status(201).json(community);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get community info
export const getCommunity = async (req, res) => {
  try {
    const community = await Community.findById(req.params.id)
      .populate("owner", "username")
      .populate("members", "username profilePhoto");
    res.json(community);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get messages with sender info
export const getMessages = async (req, res) => {
  try {
    const messages = await CommunityMessage.find({ community: req.params.id })
      .populate("sender", "username profilePhoto")
      .sort({ createdAt: 1 });
    res.json(messages);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Send a message (only if user is a member) and create notifications
export const sendMessage = async (req, res) => {
  const { text } = req.body;
  const sender = req.user._id;
  const communityId = req.params.id;
  try {
    const community = await Community.findById(communityId);
    if (!community) {
      return res.status(404).json({ error: "Community not found" });
    }
    // Check if sender is a member
    if (
      !community.members.map((m) => m.toString()).includes(sender.toString())
    ) {
      return res.status(403).json({ error: "Join the community to chat" });
    }
    const message = new CommunityMessage({
      community: communityId,
      sender,
      text,
    });
    await message.save();
    const populatedMsg = await message.populate(
      "sender",
      "username profilePhoto"
    );

    // Create notifications for all other members
    const otherMembers = community.members.filter(
      (m) => m.toString() !== sender.toString()
    );

    if (otherMembers.length > 0) {
      const communityName = community.name;
      const notificationMsg = `New message in ${communityName}. Please check.`;
      await Notification.insertMany(
        otherMembers.map((userId) => ({
          from: sender,
          to: userId,
          type: "community_message",
          communityId,
          message: notificationMsg,
          read: false,
        }))
      );
      // Emit real-time notification to all other members
      if (global.io) {
        otherMembers.forEach((userId) => {
          global.io.to(userId.toString()).emit("community_notification", {
            from: sender,
            to: userId,
            type: "community_message",
            communityId,
            message: notificationMsg,
          });
        });
      }
    }

    res.status(201).json(populatedMsg);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const removeUserFromCommunity = async (req, res) => {
  const ownerId = req.user._id;
  const communityId = req.params.id;
  const { userId } = req.body;
  try {
    const community = await Community.findById(communityId);
    if (!community)
      return res.status(404).json({ error: "Community not found" });
    if (community.owner.toString() !== ownerId.toString())
      return res.status(403).json({ error: "Only the owner can remove users" });
    if (community.owner.toString() === userId)
      return res.status(400).json({ error: "Owner cannot remove themselves" });

    community.members = community.members.filter(
      (m) => m.toString() !== userId
    );
    await community.save();
    res.json({ message: "User removed" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
