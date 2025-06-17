import express from "express";
import { protectRoute } from "../middleware/protectRoute.js";
import {
  commentOnPost,
  createPost,
  deletePost,
  getAllPosts,
  getFollowingPosts,
  getLikedPosts,
  getUserPosts,
  likeUnlikePost,
  repostPost,
  savePost,
  unsavePost,
  getSavedPosts,
} from "../controllers/post.controller.js";

const router = express.Router();

router.get("/all", protectRoute, getAllPosts);
router.get("/following", protectRoute, getFollowingPosts);
router.get("/likes/:id", protectRoute, getLikedPosts);
router.get("/user/:username", protectRoute, getUserPosts);
router.get("/saved", protectRoute, getSavedPosts);

router.post("/create", protectRoute, createPost);
router.post("/like/:id", protectRoute, likeUnlikePost);
router.post("/comment/:id", protectRoute, commentOnPost);
router.post("/repost/:postId", protectRoute, repostPost);
router.post("/save/:postId", protectRoute, savePost);
router.post("/unsave/:postId", protectRoute, unsavePost);

router.delete("/:id", protectRoute, deletePost);

export default router;
