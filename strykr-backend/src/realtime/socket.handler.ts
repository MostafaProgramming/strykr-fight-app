// =============================================
// 🔄 src/realtime/socket.handler.ts
// =============================================

import { Socket } from "socket.io";
import { SocketConfig } from "../config/socket";
import { ChatHandler } from "./chat.handler";
import { LiveSessionHandler } from "./live.handler";
import { NotificationHandler } from "./notification.handler";
import { PresenceService } from "../services/presence.service";

export class SocketHandler {
  private socketConfig: SocketConfig;
  private chatHandler: ChatHandler;
  private liveSessionHandler: LiveSessionHandler;
  private notificationHandler: NotificationHandler;

  constructor(socketConfig: SocketConfig) {
    this.socketConfig = socketConfig;
    this.chatHandler = new ChatHandler(socketConfig);
    this.liveSessionHandler = new LiveSessionHandler(socketConfig);
    this.notificationHandler = new NotificationHandler(socketConfig);

    this.initialize();
  }

  private initialize(): void {
    const io = this.socketConfig.getIO();

    io.on("connection", async (socket: Socket) => {
      const user = socket.data.user;
      console.log(`🔗 User ${user.username} connected (${socket.id})`);

      // Join user-specific room
      await socket.join(`user:${user.id}`);

      // Join gym room if user has a gym
      if (user.gymId) {
        await socket.join(`gym:${user.gymId}`);
      }

      // Update user presence
      await PresenceService.updateUserPresence(user.id, "online", socket.id);

      // Setup event handlers
      this.setupBaseHandlers(socket);
      this.chatHandler.setupHandlers(socket);
      this.liveSessionHandler.setupHandlers(socket);
      this.notificationHandler.setupHandlers(socket);

      // Handle disconnection
      socket.on("disconnect", async (reason) => {
        console.log(`🔌 User ${user.username} disconnected: ${reason}`);
        await PresenceService.updateUserPresence(user.id, "offline");

        // Notify friends about offline status
        await this.notifyFriendsStatusChange(user.id, "offline");
      });

      // Notify friends about online status
      await this.notifyFriendsStatusChange(user.id, "online");
    });
  }

  private setupBaseHandlers(socket: Socket): void {
    const user = socket.data.user;

    // Handle status updates
    socket.on(
      "status:update",
      async (data: { status: "online" | "away" | "busy" }) => {
        await PresenceService.updateUserPresence(
          user.id,
          data.status,
          socket.id,
        );
        await this.notifyFriendsStatusChange(user.id, data.status);
      },
    );

    // Handle typing indicators
    socket.on("typing:start", (data: { roomId: string }) => {
      socket.to(`room:${data.roomId}`).emit("typing:user_start", {
        userId: user.id,
        username: user.username,
        roomId: data.roomId,
      });
    });

    socket.on("typing:stop", (data: { roomId: string }) => {
      socket.to(`room:${data.roomId}`).emit("typing:user_stop", {
        userId: user.id,
        roomId: data.roomId,
      });
    });

    // Handle ping/pong for connection health
    socket.on("ping", () => {
      socket.emit("pong", { timestamp: Date.now() });
    });

    // Handle room joining/leaving
    socket.on("room:join", async (data: { roomId: string }) => {
      await socket.join(`room:${data.roomId}`);
      socket.to(`room:${data.roomId}`).emit("room:user_joined", {
        userId: user.id,
        username: user.username,
        avatar: user.avatarUrl,
      });
    });

    socket.on("room:leave", async (data: { roomId: string }) => {
      await socket.leave(`room:${data.roomId}`);
      socket.to(`room:${data.roomId}`).emit("room:user_left", {
        userId: user.id,
        username: user.username,
      });
    });
  }

  private async notifyFriendsStatusChange(
    userId: string,
    status: string,
  ): Promise<void> {
    // Get user's followers/friends and notify them
    // This would integrate with your social system
    const io = this.socketConfig.getIO();

    // For now, broadcast to gym members
    const user = await PresenceService.getUserPresence(userId);
    if (user?.gymId) {
      io.to(`gym:${user.gymId}`).emit("user:status_changed", {
        userId,
        status,
        timestamp: new Date(),
      });
    }
  }
}
