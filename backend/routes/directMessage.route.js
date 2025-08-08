import express from "express";
import { protectRoute } from "../middleware/protectRoute.js";
import * as directMessageController from "../controllers/directMessage.controller.js";

const router = express.Router();

// List all direct chats for the logged-in user
router.get("/chats", protectRoute, directMessageController.getDirectChats);
// Get all messages between the user and another user
router.get("/:userId", protectRoute, directMessageController.getDirectMessages);
// Send a direct message to a user
router.post(
  "/:userId",
  protectRoute,
  directMessageController.sendDirectMessage
);

export default router;
