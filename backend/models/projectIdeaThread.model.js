import mongoose from "mongoose";

const projectIdeaThreadSchema = new mongoose.Schema({
  idea: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "ProjectIdea",
    required: true,
  },
  author: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  message: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model("ProjectIdeaThread", projectIdeaThreadSchema);
