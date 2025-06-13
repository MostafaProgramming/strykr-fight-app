// =============================================
// 🔧 src/utils/jwt.utils.ts
// =============================================

import jwt from "jsonwebtoken";
import crypto from "crypto";
import { JWTPayload } from "../types/auth.types";

export class JWTUtils {
  private static ACCESS_TOKEN_SECRET = process.env.JWT_ACCESS_SECRET!;
  private static REFRESH_TOKEN_SECRET = process.env.JWT_REFRESH_SECRET!;
  private static ACCESS_TOKEN_EXPIRY = "15m";
  private static REFRESH_TOKEN_EXPIRY = "7d";

  static generateAccessToken(payload: Omit<JWTPayload, "iat" | "exp">): string {
    return jwt.sign(payload, this.ACCESS_TOKEN_SECRET, {
      expiresIn: this.ACCESS_TOKEN_EXPIRY,
      issuer: "fighttracker-api",
      audience: "fighttracker-mobile",
    });
  }

  static generateRefreshToken(payload: {
    userId: string;
    sessionId: string;
  }): string {
    return jwt.sign(payload, this.REFRESH_TOKEN_SECRET, {
      expiresIn: this.REFRESH_TOKEN_EXPIRY,
      issuer: "fighttracker-api",
      audience: "fighttracker-mobile",
    });
  }

  static verifyAccessToken(token: string): JWTPayload {
    try {
      return jwt.verify(token, this.ACCESS_TOKEN_SECRET) as JWTPayload;
    } catch (error) {
      throw new Error("Invalid access token");
    }
  }

  static verifyRefreshToken(token: string): {
    userId: string;
    sessionId: string;
  } {
    try {
      return jwt.verify(token, this.REFRESH_TOKEN_SECRET) as any;
    } catch (error) {
      throw new Error("Invalid refresh token");
    }
  }

  static generateSessionId(): string {
    return crypto.randomBytes(32).toString("hex");
  }

  static hashToken(token: string): string {
    return crypto.createHash("sha256").update(token).digest("hex");
  }
}
