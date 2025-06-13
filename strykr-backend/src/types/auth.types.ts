// =============================================
// 📄 src/types/auth.types.ts
// =============================================

export interface User {
  id: string;
  email: string;
  username: string;
  firstName: string;
  lastName: string;
  displayName?: string;
  avatarUrl?: string;
  role: "fighter" | "coach" | "admin" | "gym_owner";
  fighterLevel?:
    | "beginner"
    | "intermediate"
    | "amateur"
    | "semi_pro"
    | "professional";
  gymId?: string;
  isVerified: boolean;
  status: "active" | "suspended" | "deactivated";
  createdAt: Date;
}

export interface LoginCredentials {
  email: string;
  password: string;
  deviceInfo?: {
    deviceId: string;
    platform: "ios" | "android";
    appVersion: string;
  };
}

export interface RegisterData {
  email: string;
  password: string;
  username: string;
  firstName: string;
  lastName: string;
  fighterLevel?: string;
  gymId?: string;
}

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export interface JWTPayload {
  userId: string;
  email: string;
  role: string;
  sessionId: string;
  iat: number;
  exp: number;
}
