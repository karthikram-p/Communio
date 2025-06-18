import express from "express";
import { protectRoute } from "../middleware/protectRoute.js";
import * as communityController from "../controllers/community.controller.js";

const router = express.Router();

router.get("/", protectRoute, communityController.getAllCommunities);
router.post("/create", protectRoute, communityController.createCommunity);
router.get("/:id", protectRoute, communityController.getCommunity);
router.post("/:id/join", protectRoute, communityController.joinCommunity);
router.post(
  "/:id/remove",
  protectRoute,
  communityController.removeUserFromCommunity
);
router.get("/:id/messages", protectRoute, communityController.getMessages);
router.post("/:id/message", protectRoute, communityController.sendMessage);

export default router;
