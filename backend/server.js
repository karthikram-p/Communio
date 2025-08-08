import path from "path";
import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import { v2 as cloudinary } from "cloudinary";

import authRoutes from "./routes/auth.route.js";
import userRoutes from "./routes/user.route.js";
import postRoutes from "./routes/post.route.js";
import notificationRoutes from "./routes/notification.route.js";
import communityRoutes from "./routes/community.route.js";

import chatRoutes from "./routes/chat.route.js";
import directMessageRoutes from "./routes/directMessage.route.js";

import projectIdeaRoutes from "./routes/projectIdea.route.js";

import connectMongoDB from "./db/connectMongoDB.js";

dotenv.config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export const app = express();
const PORT = process.env.PORT || 5000;
const __dirname = path.resolve();

app.use(express.json({ limit: "5mb" })); // to parse req.body
// limit shouldn't be too high to prevent DOS
app.use(express.urlencoded({ extended: true })); // to parse form data(urlencoded)

app.use(cookieParser());

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/posts", postRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/communities", communityRoutes);

app.use("/api/chats", chatRoutes);
app.use("/api/direct", directMessageRoutes);

app.use("/api/project-ideas", projectIdeaRoutes);

if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "frontend", "dist")));

  app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "frontend", "dist", "index.html"));
  });
}

import http from "http";
import { Server } from "socket.io";
import jwt from "jsonwebtoken";
import User from "./models/user.model.js";
import Notification from "./models/notification.model.js";

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

// Expose io globally for controllers
global.io = io;
io.use(async (socket, next) => {
  const token = socket.handshake.auth.token;
  if (!token) return next(new Error("Authentication error"));
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    socket.user = await User.findById(decoded.userId);
    next();
  } catch (err) {
    next(new Error("Authentication error"));
  }
});

io.on("connection", (socket) => {
  socket.join(socket.user._id.toString());

  socket.on("send_message", ({ chatId, text, to }) => {
    io.to(to).emit("receive_message", { chatId, text, from: socket.user._id });
  });

  socket.on("notify", ({ to, notification }) => {
    io.to(to).emit("receive_notification", notification);
  });
});

server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  connectMongoDB();
});
