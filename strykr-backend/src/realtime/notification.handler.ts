// =============================================
// 🔔 src/realtime/notification.handler.ts
// =============================================

import { Socket } from "socket.io";
import { SocketConfig } from "../config/socket";
import { NotificationService } from "../services/notification.service";

export class NotificationHandler {
  private socketConfig: SocketConfig;

  constructor(socketConfig: SocketConfig) {
    this.socketConfig = socketConfig;
  }

  setupHandlers(socket: Socket): void {
    const user = socket.data.user;

    // Mark notification as read
    socket.on(
      "notification:mark_read",
      async (data: { notificationId: string }) => {
        try {
          await NotificationService.markAsRead(data.notificationId, user.id);

          socket.emit("notification:marked_read", {
            notificationId: data.notificationId,
          });
        } catch (error) {
          socket.emit("notification:error", {
            error: "Failed to mark notification as read",
            code: "MARK_READ_FAILED",
          });
        }
      },
    );

    // Mark all notifications as read
    socket.on("notification:mark_all_read", async () => {
      try {
        await NotificationService.markAllAsRead(user.id);

        socket.emit("notification:all_marked_read");
      } catch (error) {
        socket.emit("notification:error", {
          error: "Failed to mark all notifications as read",
          code: "MARK_ALL_READ_FAILED",
        });
      }
    });

    // Get unread notifications count
    socket.on("notification:get_unread_count", async () => {
      try {
        const count = await NotificationService.getUnreadCount(user.id);

        socket.emit("notification:unread_count", { count });
      } catch (error) {
        socket.emit("notification:error", {
          error: "Failed to get unread count",
          code: "GET_UNREAD_COUNT_FAILED",
        });
      }
    });

    // Subscribe to push notifications
    socket.on(
      "notification:subscribe_push",
      async (data: {
        fcmToken: string;
        platform: "ios" | "android";
        deviceId: string;
      }) => {
        try {
          await NotificationService.subscribeToPush(user.id, {
            fcmToken: data.fcmToken,
            platform: data.platform,
            deviceId: data.deviceId,
          });

          socket.emit("notification:push_subscribed");
        } catch (error) {
          socket.emit("notification:error", {
            error: "Failed to subscribe to push notifications",
            code: "PUSH_SUBSCRIBE_FAILED",
          });
        }
      },
    );

    // Update notification preferences
    socket.on(
      "notification:update_preferences",
      async (data: {
        preferences: {
          likes: boolean;
          comments: boolean;
          follows: boolean;
          mentions: boolean;
          liveSessions: boolean;
          chat: boolean;
        };
      }) => {
        try {
          await NotificationService.updatePreferences(
            user.id,
            data.preferences,
          );

          socket.emit("notification:preferences_updated");
        } catch (error) {
          socket.emit("notification:error", {
            error: "Failed to update notification preferences",
            code: "UPDATE_PREFERENCES_FAILED",
          });
        }
      },
    );
  }
}
