// =============================================
// 💬 src/realtime/chat.handler.ts
// =============================================

import { Socket } from "socket.io";
import { SocketConfig } from "../config/socket";
import { ChatService } from "../services/chat.service";
import { ChatMessage } from "../types/realtime.types";

export class ChatHandler {
  private socketConfig: SocketConfig;

  constructor(socketConfig: SocketConfig) {
    this.socketConfig = socketConfig;
  }

  setupHandlers(socket: Socket): void {
    const user = socket.data.user;

    // Send message
    socket.on(
      "chat:send_message",
      async (data: {
        roomId: string;
        content: string;
        type?: "text" | "image" | "video";
        mediaUrl?: string;
        replyTo?: string;
      }) => {
        try {
          const message = await ChatService.sendMessage({
            roomId: data.roomId,
            senderId: user.id,
            senderUsername: user.username,
            senderAvatar: user.avatarUrl,
            content: data.content,
            type: data.type || "text",
            mediaUrl: data.mediaUrl,
            replyTo: data.replyTo,
          });

          // Emit to all room participants
          this.socketConfig.emitToRoom(
            data.roomId,
            "chat:new_message",
            message,
          );

          // Send push notifications to offline users
          await ChatService.sendMessageNotifications(message);
        } catch (error) {
          socket.emit("chat:error", {
            error: "Failed to send message",
            code: "SEND_MESSAGE_FAILED",
          });
        }
      },
    );

    // Edit message
    socket.on(
      "chat:edit_message",
      async (data: { messageId: string; content: string }) => {
        try {
          const message = await ChatService.editMessage(
            data.messageId,
            user.id,
            data.content,
          );

          // Emit to all room participants
          this.socketConfig.emitToRoom(
            message.roomId,
            "chat:message_edited",
            message,
          );
        } catch (error) {
          socket.emit("chat:error", {
            error: "Failed to edit message",
            code: "EDIT_MESSAGE_FAILED",
          });
        }
      },
    );

    // Delete message
    socket.on("chat:delete_message", async (data: { messageId: string }) => {
      try {
        const message = await ChatService.deleteMessage(
          data.messageId,
          user.id,
        );

        // Emit to all room participants
        this.socketConfig.emitToRoom(message.roomId, "chat:message_deleted", {
          messageId: data.messageId,
          roomId: message.roomId,
        });
      } catch (error) {
        socket.emit("chat:error", {
          error: "Failed to delete message",
          code: "DELETE_MESSAGE_FAILED",
        });
      }
    });

    // Mark messages as read
    socket.on(
      "chat:mark_read",
      async (data: { roomId: string; messageId: string }) => {
        try {
          await ChatService.markMessagesAsRead(
            data.roomId,
            user.id,
            data.messageId,
          );

          // Notify other participants about read status
          socket.to(`room:${data.roomId}`).emit("chat:messages_read", {
            userId: user.id,
            roomId: data.roomId,
            lastReadMessageId: data.messageId,
          });
        } catch (error) {
          console.error("Mark read error:", error);
        }
      },
    );

    // Get chat history
    socket.on(
      "chat:get_history",
      async (data: { roomId: string; limit?: number; before?: string }) => {
        try {
          const messages = await ChatService.getChatHistory(
            data.roomId,
            user.id,
            data.limit || 50,
            data.before,
          );

          socket.emit("chat:history", {
            roomId: data.roomId,
            messages,
          });
        } catch (error) {
          socket.emit("chat:error", {
            error: "Failed to get chat history",
            code: "GET_HISTORY_FAILED",
          });
        }
      },
    );

    // Create/join direct chat
    socket.on("chat:create_direct", async (data: { targetUserId: string }) => {
      try {
        const room = await ChatService.createDirectChat(
          user.id,
          data.targetUserId,
        );

        // Join both users to the room
        await socket.join(`room:${room.id}`);
        this.socketConfig.emitToUser(
          data.targetUserId,
          "chat:room_created",
          room,
        );

        socket.emit("chat:room_created", room);
      } catch (error) {
        socket.emit("chat:error", {
          error: "Failed to create direct chat",
          code: "CREATE_DIRECT_FAILED",
        });
      }
    });
  }
}
