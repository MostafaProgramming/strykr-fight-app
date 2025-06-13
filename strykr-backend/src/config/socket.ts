// =============================================
// 🔧 src/config/socket.ts
// =============================================

import { Server as SocketIOServer, Socket } from "socket.io";
import { Server as HTTPServer } from "http";
import { createAdapter } from "@socket.io/redis-adapter";
import { redis } from "./redis";
import { JWTUtils } from "../utils/jwt.utils";
import { AuthService } from "../services/auth.service";

export class SocketConfig {
  private io: SocketIOServer;
  private pubClient: any;
  private subClient: any;

  constructor(httpServer: HTTPServer) {
    // Initialize Socket.IO with CORS for mobile
    this.io = new SocketIOServer(httpServer, {
      cors: {
        origin: [
          "http://localhost:3000",
          "http://localhost:19006", // Expo dev
          "exp://localhost:19000", // Expo LAN
          // Add your production mobile app URLs
        ],
        credentials: true,
      },
      transports: ["websocket", "polling"],
      pingTimeout: 60000,
      pingInterval: 25000,
    });

    // Setup Redis adapter for scaling
    this.setupRedisAdapter();

    // Setup authentication middleware
    this.setupAuthentication();

    console.log("🔄 WebSocket server initialized");
  }

  private setupRedisAdapter(): void {
    // Create Redis clients for pub/sub
    this.pubClient = redis.getClient().duplicate();
    this.subClient = redis.getClient().duplicate();

    // Setup Redis adapter
    this.io.adapter(createAdapter(this.pubClient, this.subClient));
  }

  private setupAuthentication(): void {
    this.io.use(async (socket: Socket, next) => {
      try {
        const token =
          socket.handshake.auth?.token ||
          socket.handshake.headers?.authorization?.replace("Bearer ", "");

        if (!token) {
          return next(new Error("No authentication token provided"));
        }

        // Verify JWT token
        const payload = JWTUtils.verifyAccessToken(token);

        // Validate session
        const user = await AuthService.validateSession(payload.sessionId);

        if (!user) {
          return next(new Error("Invalid or expired session"));
        }

        // Attach user to socket
        socket.data.user = user;
        socket.data.sessionId = payload.sessionId;

        next();
      } catch (error) {
        console.error("Socket authentication error:", error);
        next(new Error("Authentication failed"));
      }
    });
  }

  getIO(): SocketIOServer {
    return this.io;
  }

  // Emit to specific user across all servers
  async emitToUser(userId: string, event: string, data: any): Promise<void> {
    this.io.to(`user:${userId}`).emit(event, data);
  }

  // Emit to room across all servers
  async emitToRoom(roomId: string, event: string, data: any): Promise<void> {
    this.io.to(`room:${roomId}`).emit(event, data);
  }

  // Emit to gym members
  async emitToGym(gymId: string, event: string, data: any): Promise<void> {
    this.io.to(`gym:${gymId}`).emit(event, data);
  }

  // Get online users count
  async getOnlineUsersCount(): Promise<number> {
    const sockets = await this.io.fetchSockets();
    return sockets.length;
  }

  // Get users in room
  async getRoomUsers(roomId: string): Promise<string[]> {
    const sockets = await this.io.in(`room:${roomId}`).fetchSockets();
    return sockets.map((socket) => socket.data.user.id);
  }
}
