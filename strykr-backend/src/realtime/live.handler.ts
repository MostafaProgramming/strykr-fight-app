// =============================================
// 🎥 src/realtime/live.handler.ts
// =============================================

import { Socket } from "socket.io";
import { SocketConfig } from "../config/socket";
import { LiveSessionService } from "../services/live-session.service";

export class LiveSessionHandler {
  private socketConfig: SocketConfig;

  constructor(socketConfig: SocketConfig) {
    this.socketConfig = socketConfig;
  }

  setupHandlers(socket: Socket): void {
    const user = socket.data.user;

    // Start live session
    socket.on(
      "live:start_session",
      async (data: {
        title: string;
        description?: string;
        type: "sparring" | "training" | "technique" | "q_and_a";
        maxParticipants?: number;
      }) => {
        try {
          const session = await LiveSessionService.startSession({
            hostId: user.id,
            hostUsername: user.username,
            title: data.title,
            description: data.description,
            gymId: user.gymId,
            type: data.type,
            maxParticipants: data.maxParticipants,
          });

          // Join host to session room
          await socket.join(`live:${session.id}`);

          // Notify gym members about new live session
          if (user.gymId) {
            this.socketConfig.emitToGym(
              user.gymId,
              "live:session_started",
              session,
            );
          }

          socket.emit("live:session_created", session);
        } catch (error) {
          socket.emit("live:error", {
            error: "Failed to start live session",
            code: "START_SESSION_FAILED",
          });
        }
      },
    );

    // Join live session
    socket.on("live:join_session", async (data: { sessionId: string }) => {
      try {
        const session = await LiveSessionService.joinSession(
          data.sessionId,
          user.id,
        );

        // Join user to session room
        await socket.join(`live:${data.sessionId}`);

        // Notify other participants
        socket.to(`live:${data.sessionId}`).emit("live:user_joined", {
          userId: user.id,
          username: user.username,
          avatar: user.avatarUrl,
          sessionId: data.sessionId,
        });

        socket.emit("live:session_joined", session);
      } catch (error) {
        socket.emit("live:error", {
          error: "Failed to join live session",
          code: "JOIN_SESSION_FAILED",
        });
      }
    });

    // Leave live session
    socket.on("live:leave_session", async (data: { sessionId: string }) => {
      try {
        await LiveSessionService.leaveSession(data.sessionId, user.id);

        // Leave session room
        await socket.leave(`live:${data.sessionId}`);

        // Notify other participants
        socket.to(`live:${data.sessionId}`).emit("live:user_left", {
          userId: user.id,
          username: user.username,
          sessionId: data.sessionId,
        });

        socket.emit("live:session_left", { sessionId: data.sessionId });
      } catch (error) {
        socket.emit("live:error", {
          error: "Failed to leave live session",
          code: "LEAVE_SESSION_FAILED",
        });
      }
    });

    // End live session (host only)
    socket.on("live:end_session", async (data: { sessionId: string }) => {
      try {
        await LiveSessionService.endSession(data.sessionId, user.id);

        // Notify all participants
        this.socketConfig.emitToRoom(
          `live:${data.sessionId}`,
          "live:session_ended",
          {
            sessionId: data.sessionId,
            endedBy: user.id,
            timestamp: new Date(),
          },
        );
      } catch (error) {
        socket.emit("live:error", {
          error: "Failed to end live session",
          code: "END_SESSION_FAILED",
        });
      }
    });

    // Live session chat
    socket.on(
      "live:send_message",
      async (data: { sessionId: string; content: string }) => {
        try {
          const message = {
            id: `live_msg_${Date.now()}`,
            sessionId: data.sessionId,
            senderId: user.id,
            senderUsername: user.username,
            senderAvatar: user.avatarUrl,
            content: data.content,
            timestamp: new Date(),
          };

          // Emit to all session participants
          this.socketConfig.emitToRoom(
            `live:${data.sessionId}`,
            "live:new_message",
            message,
          );
        } catch (error) {
          socket.emit("live:error", {
            error: "Failed to send live message",
            code: "LIVE_MESSAGE_FAILED",
          });
        }
      },
    );

    // WebRTC signaling for video/audio
    socket.on(
      "live:offer",
      (data: { sessionId: string; targetUserId: string; offer: any }) => {
        this.socketConfig.emitToUser(data.targetUserId, "live:offer", {
          sessionId: data.sessionId,
          fromUserId: user.id,
          offer: data.offer,
        });
      },
    );

    socket.on(
      "live:answer",
      (data: { sessionId: string; targetUserId: string; answer: any }) => {
        this.socketConfig.emitToUser(data.targetUserId, "live:answer", {
          sessionId: data.sessionId,
          fromUserId: user.id,
          answer: data.answer,
        });
      },
    );

    socket.on(
      "live:ice_candidate",
      (data: { sessionId: string; targetUserId: string; candidate: any }) => {
        this.socketConfig.emitToUser(data.targetUserId, "live:ice_candidate", {
          sessionId: data.sessionId,
          fromUserId: user.id,
          candidate: data.candidate,
        });
      },
    );
  }
}
