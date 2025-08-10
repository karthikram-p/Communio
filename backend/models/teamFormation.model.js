import mongoose from "mongoose";

const teamFormationSchema = new mongoose.Schema({
  competitionName: { type: String, required: true },
  description: { type: String, required: true },
  domain: [{ type: String, required: true }],
  teamSize: { type: Number, required: true },
  prizeMoney: { type: Number },
  deadline: { type: Date },
  platform: { type: String },
  link: { type: String },
  author: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  members: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  disabled: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model("TeamFormation", teamFormationSchema);
