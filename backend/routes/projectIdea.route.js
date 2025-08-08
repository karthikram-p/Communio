import express from "express";
import { protectRoute } from "../middleware/protectRoute.js";
import {
  createIdea,
  getIdeas,
  starIdea,
  saveIdea,
  addThreadMessage,
  getIdeaById,
  getIdeaThread,
  unstarIdea,
  unsaveIdea,
} from "../controllers/projectIdea.controller.js";

const router = express.Router();

router.post("/", protectRoute, createIdea);
router.get("/", protectRoute, getIdeas);
router.post("/:id/star", protectRoute, starIdea);
router.post("/:id/unstar", protectRoute, unstarIdea);
router.post("/:id/save", protectRoute, saveIdea);
router.post("/:id/unsave", protectRoute, unsaveIdea);
router.post("/:id/thread", protectRoute, addThreadMessage);
router.get("/:id", protectRoute, getIdeaById);
router.get("/:id/thread", protectRoute, getIdeaThread);

export default router;
