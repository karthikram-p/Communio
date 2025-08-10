import express from "express";
import {
  createTeam,
  getTeams,
  editTeamSize,
  disableTeam,
  joinTeam,
  removeMember,
  getTeamById,
  editTeamPost,
  deleteTeamPost,
} from "../controllers/teamFormation.controller.js";
import { protectRoute } from "../middleware/protectRoute.js";

const router = express.Router();

// Create a new team formation post
router.post("/", protectRoute, createTeam);

// Get all team formation posts
router.get("/", getTeams);

// Get team by id
router.get("/:id", getTeamById);

// Edit team size
router.patch("/:id/size", protectRoute, editTeamSize);
// Edit team post
router.patch("/:id/edit", protectRoute, editTeamPost);

// Disable post
router.patch("/:id/disable", protectRoute, disableTeam);

// Join team
router.patch("/:id/join", protectRoute, joinTeam);

// Remove member
router.patch("/:id/remove", protectRoute, removeMember);

// Delete team post
router.delete("/:id", protectRoute, deleteTeamPost);

export default router;
