import express from "express";
import { protectRoute } from "../middleware/protectRoute.js";
import {
  getOrCreateChat,
  sendMessage,
  getUserChats,
} from "../controllers/chat.controller.js";

const router = express.Router();

router.post("/get-or-create", protectRoute, getOrCreateChat);
router.post("/send", protectRoute, sendMessage);
router.get("/my-chats", protectRoute, getUserChats);

export default router;
