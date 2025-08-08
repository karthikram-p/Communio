import ProjectIdea from "../models/projectIdea.model.js";
import ProjectIdeaThread from "../models/projectIdeaThread.model.js";

// Create a new project idea
export const createIdea = async (req, res) => {
  try {
    const { title, description } = req.body;
    const idea = new ProjectIdea({
      title,
      description,
      author: req.user._id,
    });
    await idea.save();
    res.status(201).json(idea);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// List all project ideas (with search)
export const getIdeas = async (req, res) => {
  try {
    const { search } = req.query;
    let query = {};
    if (search) {
      query = { title: { $regex: search, $options: "i" } };
    }
    const ideas = await ProjectIdea.find(query)
      .populate("author", "username profileImg")
      .populate({
        path: "threads",
        populate: { path: "author", select: "username profileImg" },
      })
      .sort({ createdAt: -1 });
    res.json(ideas);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Star an idea
export const starIdea = async (req, res) => {
  try {
    const idea = await ProjectIdea.findById(req.params.id);
    if (!idea) return res.status(404).json({ error: "Idea not found" });
    if (!idea.stars.includes(req.user._id)) {
      idea.stars.push(req.user._id);
      await idea.save();
    }
    res.json(idea);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Unstar an idea
export const unstarIdea = async (req, res) => {
  try {
    const idea = await ProjectIdea.findById(req.params.id);
    if (!idea) return res.status(404).json({ error: "Idea not found" });
    idea.stars = idea.stars.filter(
      (uid) => uid.toString() !== req.user._id.toString()
    );
    await idea.save();
    res.json(idea);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Save an idea
export const saveIdea = async (req, res) => {
  try {
    const idea = await ProjectIdea.findById(req.params.id);
    if (!idea) return res.status(404).json({ error: "Idea not found" });
    if (!idea.saves.includes(req.user._id)) {
      idea.saves.push(req.user._id);
      await idea.save();
    }
    res.json(idea);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Unsave an idea
export const unsaveIdea = async (req, res) => {
  try {
    const idea = await ProjectIdea.findById(req.params.id);
    if (!idea) return res.status(404).json({ error: "Idea not found" });
    idea.saves = idea.saves.filter(
      (uid) => uid.toString() !== req.user._id.toString()
    );
    await idea.save();
    res.json(idea);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Add a thread message
export const addThreadMessage = async (req, res) => {
  try {
    const { message } = req.body;
    const idea = await ProjectIdea.findById(req.params.id);
    if (!idea) return res.status(404).json({ error: "Idea not found" });
    const thread = new ProjectIdeaThread({
      idea: idea._id,
      author: req.user._id,
      message,
    });
    await thread.save();
    idea.threads.push(thread._id);
    await idea.save();
    res.status(201).json(thread);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get an idea by ID
export const getIdeaById = async (req, res) => {
  try {
    const idea = await ProjectIdea.findById(req.params.id)
      .populate("author", "username fullName profileImg")
      .populate({
        path: "threads",
        populate: { path: "author", select: "username fullName profileImg" },
      });
    if (!idea) return res.status(404).json({ error: "Idea not found" });
    res.json(idea);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get idea thread
export const getIdeaThread = async (req, res) => {
  try {
    const threads = await ProjectIdeaThread.find({ idea: req.params.id })
      .populate("author", "username fullName profileImg")
      .sort({ createdAt: 1 });
    res.json(threads);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
