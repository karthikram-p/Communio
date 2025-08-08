// Utility for emitting notifications via socket.io
import { io } from "socket.io-client";

export const emitNotification = (to, notification, token) => {
  const socket = io("/", { auth: { token } });
  socket.emit("notify", { to, notification });
  socket.disconnect();
};
