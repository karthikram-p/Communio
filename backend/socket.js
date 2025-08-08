import { Server } from "socket.io";
import http from "http";
import { app } from "./server.js";
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

export default server;
