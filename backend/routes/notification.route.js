import express from "express";
import { protectRoute } from "../middleware/protectRoute.js";
import {
  deleteNotifications,
  getNotifications,
  markCommunityMessagesAsRead,
} from "../controllers/notification.controller.js";

const router = express.Router();

router.get("/", protectRoute, getNotifications);
router.delete("/", protectRoute, deleteNotifications);
router.post(
  "/mark-community-messages-read",
  protectRoute,
  markCommunityMessagesAsRead
);

export default router;
