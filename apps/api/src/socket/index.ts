import { Server as SocketIOServer, Socket } from "socket.io";
import { verifyToken } from "../lib/auth.js";
import { redis } from "../lib/redis.js";

interface AuthenticatedSocket extends Socket {
  userId?: string;
}

export function setupSocketHandlers(io: SocketIOServer) {
  // Authentication middleware
  io.use((socket: AuthenticatedSocket, next) => {
    const token = socket.handshake.auth.token;
    if (!token) {
      return next(new Error("Authentication required"));
    }

    const payload = verifyToken(token);
    if (!payload) {
      return next(new Error("Invalid token"));
    }

    socket.userId = payload.userId;
    next();
  });

  io.on("connection", (socket: AuthenticatedSocket) => {
    console.log(`🔌 User connected: ${socket.userId}`);

    // Join organization rooms
    socket.on("join:organization", async (organizationId: string) => {
      socket.join(`org:${organizationId}`);
      
      // Track user presence
      if (socket.userId) {
        await redis.hset(`presence:${organizationId}`, socket.userId, JSON.stringify({
          status: "online",
          lastSeen: new Date().toISOString(),
        }));
        
        io.to(`org:${organizationId}`).emit("presence:update", {
          userId: socket.userId,
          status: "online",
          lastSeen: new Date().toISOString(),
        });
      }
    });

    socket.on("leave:organization", async (organizationId: string) => {
      socket.leave(`org:${organizationId}`);
      
      if (socket.userId) {
        await redis.hset(`presence:${organizationId}`, socket.userId, JSON.stringify({
          status: "offline",
          lastSeen: new Date().toISOString(),
        }));
        
        io.to(`org:${organizationId}`).emit("presence:update", {
          userId: socket.userId,
          status: "offline",
          lastSeen: new Date().toISOString(),
        });
      }
    });

    // Join board for real-time updates
    socket.on("join:board", (boardId: string) => {
      socket.join(`board:${boardId}`);
    });

    socket.on("leave:board", (boardId: string) => {
      socket.leave(`board:${boardId}`);
    });

    // Task updates
    socket.on("task:update", (data: { boardId: string; task: unknown }) => {
      socket.to(`board:${data.boardId}`).emit("task:updated", data.task);
    });

    socket.on("task:move", (data: { boardId: string; taskId: string; columnId: string; position: number }) => {
      socket.to(`board:${data.boardId}`).emit("task:moved", data);
    });

    socket.on("task:create", (data: { boardId: string; task: unknown }) => {
      socket.to(`board:${data.boardId}`).emit("task:created", data.task);
    });

    socket.on("task:delete", (data: { boardId: string; taskId: string }) => {
      socket.to(`board:${data.boardId}`).emit("task:deleted", data.taskId);
    });

    // Typing indicators
    socket.on("typing:start", (data: { taskId: string }) => {
      socket.to(`task:${data.taskId}`).emit("typing:started", {
        userId: socket.userId,
        taskId: data.taskId,
      });
    });

    socket.on("typing:stop", (data: { taskId: string }) => {
      socket.to(`task:${data.taskId}`).emit("typing:stopped", {
        userId: socket.userId,
        taskId: data.taskId,
      });
    });

    // Comments
    socket.on("join:task", (taskId: string) => {
      socket.join(`task:${taskId}`);
    });

    socket.on("leave:task", (taskId: string) => {
      socket.leave(`task:${taskId}`);
    });

    socket.on("comment:create", (data: { taskId: string; comment: unknown }) => {
      socket.to(`task:${data.taskId}`).emit("comment:created", data.comment);
    });

    // Disconnect handling
    socket.on("disconnect", async () => {
      console.log(`🔌 User disconnected: ${socket.userId}`);
      
      // Update presence for all organizations the user was in
      const rooms = Array.from(socket.rooms);
      for (const room of rooms) {
        if (room.startsWith("org:") && socket.userId) {
          const organizationId = room.replace("org:", "");
          await redis.hset(`presence:${organizationId}`, socket.userId, JSON.stringify({
            status: "offline",
            lastSeen: new Date().toISOString(),
          }));
          
          io.to(room).emit("presence:update", {
            userId: socket.userId,
            status: "offline",
            lastSeen: new Date().toISOString(),
          });
        }
      }
    });
  });
}
