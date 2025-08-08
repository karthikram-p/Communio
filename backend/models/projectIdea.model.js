import mongoose from "mongoose";

const projectIdeaSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  author: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  stars: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  saves: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  threads: [{ type: mongoose.Schema.Types.ObjectId, ref: "ProjectIdeaThread" }],
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model("ProjectIdea", projectIdeaSchema);
