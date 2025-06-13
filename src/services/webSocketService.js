// =============================================
// 📱 src/services/websocketService.js
// =============================================

import io from "socket.io-client";
import FightTrackerAPI from "./api";

class WebSocketService {
  constructor(api = null) {
    this.api = api || new FightTrackerAPI();
    this.socket = null;
    this.isConnected = false;
    this.listeners = new Map();
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.reconnectInterval = null;
  }

  // =============================================
  // 🔗 Connection Management
  // =============================================

  async connect() {
    try {
      console.log("🔗 Connecting to WebSocket server...");

      const tokens = await this.api.getStoredTokens();

      if (!tokens.accessToken) {
        throw new Error("No access token available for WebSocket connection");
      }

      // Disconnect existing socket if any
      if (this.socket) {
        this.socket.disconnect();
      }

      // Create new socket connection
      this.socket = io(this.api.baseURL, {
        auth: { token: tokens.accessToken },
        transports: ["websocket", "polling"],
        forceNew: true,
        timeout: 20000,
        reconnection: false, // We'll handle reconnection manually
      });

      this.setupEventListeners();

      return new Promise((resolve, reject) => {
        const timeout = setTimeout(() => {
          reject(new Error("WebSocket connection timeout"));
        }, 20000);

        this.socket.on("connect", () => {
          clearTimeout(timeout);
          console.log("✅ Connected to WebSocket server");
          this.isConnected = true;
          this.reconnectAttempts = 0;
          this.emit("socket:connected");
          resolve(true);
        });

        this.socket.on("connect_error", (error) => {
          clearTimeout(timeout);
          console.error("❌ WebSocket connection error:", error);
          this.isConnected = false;
          this.emit("socket:connection_error", error);
          reject(error);
        });
      });
    } catch (error) {
      console.error("❌ Failed to connect to WebSocket:", error);
      throw error;
    }
  }

  disconnect() {
    console.log("🔌 Disconnecting from WebSocket...");

    if (this.reconnectInterval) {
      clearInterval(this.reconnectInterval);
      this.reconnectInterval = null;
    }

    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }

    this.isConnected = false;
    this.listeners.clear();
    this.emit("socket:disconnected");
  }

  // =============================================
  // 📡 Event Handling
  // =============================================

  setupEventListeners() {
    if (!this.socket) return;

    // Connection events
    this.socket.on("disconnect", (reason) => {
      console.log("🔌 Disconnected from WebSocket:", reason);
      this.isConnected = false;
      this.emit("socket:disconnected", reason);

      // Auto-reconnect for network issues
      if (reason === "io server disconnect") {
        // Server disconnected us, don't reconnect
        return;
      }

      this.attemptReconnect();
    });

    this.socket.on("reconnect", () => {
      console.log("🔄 WebSocket reconnected");
      this.isConnected = true;
      this.reconnectAttempts = 0;
      this.emit("socket:reconnected");
    });

    // =============================================
    // 💬 Chat Events
    // =============================================

    this.socket.on("chat:new_message", (message) => {
      console.log("💬 New chat message received:", message);
      this.emit("chat:new_message", message);
    });

    this.socket.on("chat:message_edited", (message) => {
      console.log("✏️ Chat message edited:", message);
      this.emit("chat:message_edited", message);
    });

    this.socket.on("chat:message_deleted", (data) => {
      console.log("🗑️ Chat message deleted:", data);
      this.emit("chat:message_deleted", data);
    });

    this.socket.on("chat:messages_read", (data) => {
      this.emit("chat:messages_read", data);
    });

    this.socket.on("chat:history", (data) => {
      this.emit("chat:history", data);
    });

    this.socket.on("chat:room_created", (room) => {
      console.log("🏠 Chat room created:", room);
      this.emit("chat:room_created", room);
    });

    // =============================================
    // 🔔 Notification Events
    // =============================================

    this.socket.on("notification:new", (notification) => {
      console.log("🔔 New notification:", notification);
      this.emit("notification:new", notification);
    });

    this.socket.on("notification:marked_read", (data) => {
      this.emit("notification:marked_read", data);
    });

    this.socket.on("notification:all_marked_read", () => {
      this.emit("notification:all_marked_read");
    });

    this.socket.on("notification:unread_count", (data) => {
      this.emit("notification:unread_count", data);
    });

    // =============================================
    // 🎥 Live Session Events
    // =============================================

    this.socket.on("live:session_started", (session) => {
      console.log("🎥 Live session started:", session);
      this.emit("live:session_started", session);
    });

    this.socket.on("live:session_created", (session) => {
      console.log("🎬 Live session created:", session);
      this.emit("live:session_created", session);
    });

    this.socket.on("live:session_joined", (session) => {
      console.log("👥 Joined live session:", session);
      this.emit("live:session_joined", session);
    });

    this.socket.on("live:session_left", (data) => {
      console.log("👋 Left live session:", data);
      this.emit("live:session_left", data);
    });

    this.socket.on("live:session_ended", (data) => {
      console.log("🔚 Live session ended:", data);
      this.emit("live:session_ended", data);
    });

    this.socket.on("live:user_joined", (data) => {
      console.log("👤 User joined live session:", data);
      this.emit("live:user_joined", data);
    });

    this.socket.on("live:user_left", (data) => {
      console.log("👤 User left live session:", data);
      this.emit("live:user_left", data);
    });

    this.socket.on("live:new_message", (message) => {
      console.log("💬 Live session message:", message);
      this.emit("live:new_message", message);
    });

    // =============================================
    // 👥 Presence Events
    // =============================================

    this.socket.on("user:status_changed", (data) => {
      this.emit("user:status_changed", data);
    });

    this.socket.on("typing:user_start", (data) => {
      this.emit("typing:user_start", data);
    });

    this.socket.on("typing:user_stop", (data) => {
      this.emit("typing:user_stop", data);
    });

    this.socket.on("room:user_joined", (data) => {
      this.emit("room:user_joined", data);
    });

    this.socket.on("room:user_left", (data) => {
      this.emit("room:user_left", data);
    });

    // =============================================
    // ❌ Error Events
    // =============================================

    this.socket.on("chat:error", (error) => {
      console.error("💬 Chat error:", error);
      this.emit("chat:error", error);
    });

    this.socket.on("live:error", (error) => {
      console.error("🎥 Live session error:", error);
      this.emit("live:error", error);
    });

    this.socket.on("notification:error", (error) => {
      console.error("🔔 Notification error:", error);
      this.emit("notification:error", error);
    });

    // =============================================
    // 🏓 Connection Health
    // =============================================

    this.socket.on("pong", (data) => {
      // Handle pong response for connection health
      this.emit("socket:pong", data);
    });
  }

  // =============================================
  // 🔄 Reconnection Logic
  // =============================================

  attemptReconnect() {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.log("❌ Max reconnection attempts reached");
      this.emit("socket:max_reconnect_attempts");
      return;
    }

    this.reconnectAttempts++;
    const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts), 30000);

    console.log(
      `🔄 Attempting to reconnect in ${delay}ms (attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts})`,
    );

    setTimeout(async () => {
      try {
        await this.connect();
      } catch (error) {
        console.error("❌ Reconnection failed:", error);
        this.attemptReconnect();
      }
    }, delay);
  }

  // =============================================
  // 💬 Chat Methods
  // =============================================

  sendMessage(roomId, content, type = "text", mediaUrl = null, replyTo = null) {
    if (!this.isConnected) {
      console.warn("⚠️ Cannot send message: WebSocket not connected");
      return false;
    }

    this.socket.emit("chat:send_message", {
      roomId,
      content,
      type,
      mediaUrl,
      replyTo,
    });

    return true;
  }

  editMessage(messageId, content) {
    if (!this.isConnected) {
      console.warn("⚠️ Cannot edit message: WebSocket not connected");
      return false;
    }

    this.socket.emit("chat:edit_message", {
      messageId,
      content,
    });

    return true;
  }

  deleteMessage(messageId) {
    if (!this.isConnected) {
      console.warn("⚠️ Cannot delete message: WebSocket not connected");
      return false;
    }

    this.socket.emit("chat:delete_message", {
      messageId,
    });

    return true;
  }

  markMessagesAsRead(roomId, messageId) {
    if (!this.isConnected) return false;

    this.socket.emit("chat:mark_read", {
      roomId,
      messageId,
    });

    return true;
  }

  getChatHistory(roomId, limit = 50, before = null) {
    if (!this.isConnected) return false;

    this.socket.emit("chat:get_history", {
      roomId,
      limit,
      before,
    });

    return true;
  }

  createDirectChat(targetUserId) {
    if (!this.isConnected) return false;

    this.socket.emit("chat:create_direct", {
      targetUserId,
    });

    return true;
  }

  // =============================================
  // 🎥 Live Session Methods
  // =============================================

  startLiveSession(
    title,
    description,
    type = "training",
    maxParticipants = null,
  ) {
    if (!this.isConnected) return false;

    this.socket.emit("live:start_session", {
      title,
      description,
      type,
      maxParticipants,
    });

    return true;
  }

  joinLiveSession(sessionId) {
    if (!this.isConnected) return false;

    this.socket.emit("live:join_session", {
      sessionId,
    });

    return true;
  }

  leaveLiveSession(sessionId) {
    if (!this.isConnected) return false;

    this.socket.emit("live:leave_session", {
      sessionId,
    });

    return true;
  }

  endLiveSession(sessionId) {
    if (!this.isConnected) return false;

    this.socket.emit("live:end_session", {
      sessionId,
    });

    return true;
  }

  sendLiveMessage(sessionId, content) {
    if (!this.isConnected) return false;

    this.socket.emit("live:send_message", {
      sessionId,
      content,
    });

    return true;
  }

  // =============================================
  // 🔔 Notification Methods
  // =============================================

  markNotificationAsRead(notificationId) {
    if (!this.isConnected) return false;

    this.socket.emit("notification:mark_read", {
      notificationId,
    });

    return true;
  }

  markAllNotificationsAsRead() {
    if (!this.isConnected) return false;

    this.socket.emit("notification:mark_all_read");
    return true;
  }

  getUnreadNotificationCount() {
    if (!this.isConnected) return false;

    this.socket.emit("notification:get_unread_count");
    return true;
  }

  subscribeToPushNotifications(fcmToken, platform, deviceId) {
    if (!this.isConnected) return false;

    this.socket.emit("notification:subscribe_push", {
      fcmToken,
      platform,
      deviceId,
    });

    return true;
  }

  updateNotificationPreferences(preferences) {
    if (!this.isConnected) return false;

    this.socket.emit("notification:update_preferences", {
      preferences,
    });

    return true;
  }

  // =============================================
  // 🏠 Room Management
  // =============================================

  joinRoom(roomId) {
    if (!this.isConnected) return false;

    this.socket.emit("room:join", {
      roomId,
    });

    return true;
  }

  leaveRoom(roomId) {
    if (!this.isConnected) return false;

    this.socket.emit("room:leave", {
      roomId,
    });

    return true;
  }

  // =============================================
  // ⌨️ Typing Indicators
  // =============================================

  startTyping(roomId) {
    if (!this.isConnected) return false;

    this.socket.emit("typing:start", {
      roomId,
    });

    return true;
  }

  stopTyping(roomId) {
    if (!this.isConnected) return false;

    this.socket.emit("typing:stop", {
      roomId,
    });

    return true;
  }

  // =============================================
  // 👤 Presence Management
  // =============================================

  updateStatus(status) {
    if (!this.isConnected) return false;

    this.socket.emit("status:update", {
      status, // 'online', 'away', 'busy'
    });

    return true;
  }

  // =============================================
  // 🏓 Connection Health
  // =============================================

  ping() {
    if (!this.isConnected) return false;

    this.socket.emit("ping");
    return true;
  }

  // =============================================
  // 📡 Event Listener Management
  // =============================================

  on(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event).push(callback);
  }

  off(event, callback) {
    if (!callback) {
      this.listeners.delete(event);
    } else {
      const callbacks = this.listeners.get(event);
      if (callbacks) {
        const index = callbacks.indexOf(callback);
        if (index > -1) {
          callbacks.splice(index, 1);
        }
      }
    }
  }

  emit(event, ...args) {
    const callbacks = this.listeners.get(event) || [];
    callbacks.forEach((callback) => {
      try {
        callback(...args);
      } catch (error) {
        console.error(`❌ Error in ${event} callback:`, error);
      }
    });
  }

  // =============================================
  // 🔍 Status Checks
  // =============================================

  isSocketConnected() {
    return this.isConnected && this.socket?.connected === true;
  }

  getConnectionInfo() {
    return {
      isConnected: this.isConnected,
      reconnectAttempts: this.reconnectAttempts,
      socketId: this.socket?.id || null,
      connected: this.socket?.connected || false,
    };
  }
}

export default WebSocketService;
