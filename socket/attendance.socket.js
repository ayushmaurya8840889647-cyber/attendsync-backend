import { Server } from "socket.io";

let io;

export const initSocket = (httpServer) => {
  io = new Server(httpServer, {
    cors: {
      origin: "http://localhost:3000",
      credentials: true,
    },
  });

  io.on("connection", (socket) => {
    // Faculty client should call:
    // socket.emit("faculty:join", { facultyId })
    socket.on("faculty:join", ({ facultyId }) => {
      if (!facultyId) return;
      socket.join(`faculty:${facultyId}`);
    });

    // Optional: allow client to subscribe per-session too.
    // socket.emit("session:join", { sessionId })
    socket.on("session:join", ({ sessionId }) => {
      if (!sessionId) return;
      socket.join(`session:${sessionId}`);
    });
  });

  return io;
};

export const getIO = () => {
  if (!io) {
    throw new Error("Socket.io not initialized. Call initSocket(httpServer) first.");
  }
  return io;
};

