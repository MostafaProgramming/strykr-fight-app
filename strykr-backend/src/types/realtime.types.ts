// =============================================
// 📄 src/types/realtime.types.ts
// =============================================

export interface SocketUser {
  userId: string;
  socketId: string;
  username: string;
  avatar?: string;
  status: "online" | "away" | "busy";
  lastActive: Date;
  roomIds: string[];
}

export interface ChatMessage {
  id: string;
  roomId: string;
  senderId: string;
  senderUsername: string;
  senderAvatar?: string;
  content: string;
  type: "text" | "image" | "video" | "system";
  mediaUrl?: string;
  timestamp: Date;
  edited?: boolean;
  replyTo?: string;
}

export interface ChatRoom {
  id: string;
  name?: string;
  type: "direct" | "group" | "gym" | "live_session";
  participants: string[];
  createdBy: string;
  createdAt: Date;
  lastActivity: Date;
  metadata?: any;
}

export interface LiveSession {
  id: string;
  hostId: string;
  hostUsername: string;
  title: string;
  description?: string;
  gymId?: string;
  type: "sparring" | "training" | "technique" | "q_and_a";
  status: "scheduled" | "live" | "ended";
  startTime: Date;
  endTime?: Date;
  maxParticipants?: number;
  participants: string[];
  viewers: string[];
}

export interface NotificationPayload {
  id: string;
  userId: string;
  type: "like" | "comment" | "follow" | "mention" | "live_session" | "chat";
  title: string;
  message: string;
  data?: any;
  timestamp: Date;
}
