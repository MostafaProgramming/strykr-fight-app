// =============================================
// 👥 src/services/presence.service.ts
// =============================================

import { redis } from "../config/redis";
import { SocketUser } from "../types/realtime.types";

export class PresenceService {
  private static PRESENCE_PREFIX = "presence:";
  private static PRESENCE_EXPIRY = 300; // 5 minutes

  // Update user presence
  static async updateUserPresence(
    userId: string,
    status: "online" | "away" | "busy" | "offline",
    socketId?: string,
  ): Promise<void> {
    const key = `${this.PRESENCE_PREFIX}${userId}`;

    if (status === "offline") {
      await redis.del(key);
    } else {
      const presence = {
        userId,
        socketId,
        status,
        lastActive: new Date().toISOString(),
        timestamp: Date.now(),
      };

      await redis.setex(key, this.PRESENCE_EXPIRY, JSON.stringify(presence));
    }
  }

  // Get user presence
  static async getUserPresence(userId: string): Promise<any | null> {
    const key = `${this.PRESENCE_PREFIX}${userId}`;
    const data = await redis.get(key);

    return data ? JSON.parse(data) : null;
  }

  // Get online users in gym
  static async getOnlineGymUsers(gymId: string): Promise<string[]> {
    // This would require additional indexing by gym
    // For now, return empty array
    return [];
  }

  // Get all online users
  static async getAllOnlineUsers(): Promise<string[]> {
    const keys = await redis.getClient().keys(`${this.PRESENCE_PREFIX}*`);
    return keys.map((key) => key.replace(this.PRESENCE_PREFIX, ""));
  }

  // Check if user is online
  static async isUserOnline(userId: string): Promise<boolean> {
    const presence = await this.getUserPresence(userId);
    return presence !== null;
  }

  // Clean up expired presence data
  static async cleanupExpiredPresence(): Promise<void> {
    const keys = await redis.getClient().keys(`${this.PRESENCE_PREFIX}*`);
    const now = Date.now();

    for (const key of keys) {
      const data = await redis.get(key);
      if (data) {
        const presence = JSON.parse(data);
        if (now - presence.timestamp > this.PRESENCE_EXPIRY * 1000) {
          await redis.del(key);
        }
      }
    }
  }
}
