// =============================================
// 🛡️ src/services/auth.service.ts
// =============================================

import { Pool } from "pg";
import {
  User,
  LoginCredentials,
  RegisterData,
  TokenPair,
} from "../types/auth.types";
import { JWTUtils } from "../utils/jwt.utils";
import { PasswordUtils } from "../utils/password.utils";
import { redis } from "../config/redis";
import { db } from "../config/database";

export class AuthService {
  private static SESSION_PREFIX = "session:";
  private static USER_PREFIX = "user:";
  private static REFRESH_TOKEN_PREFIX = "refresh:";

  // Register new user
  static async register(
    data: RegisterData,
  ): Promise<{ user: User; tokens: TokenPair }> {
    const {
      email,
      password,
      username,
      firstName,
      lastName,
      fighterLevel,
      gymId,
    } = data;

    // Validate password
    const passwordValidation = PasswordUtils.validatePassword(password);
    if (!passwordValidation.isValid) {
      throw new Error(
        `Password validation failed: ${passwordValidation.errors.join(", ")}`,
      );
    }

    // Check if user exists
    const existingUser = await db.query(
      "SELECT id FROM users WHERE email = $1 OR username = $2",
      [email, username],
    );

    if (existingUser.rows.length > 0) {
      throw new Error("User with this email or username already exists");
    }

    // Hash password
    const passwordHash = await PasswordUtils.hashPassword(password);

    // Create user
    const userResult = await db.query(
      `INSERT INTO users 
       (email, password_hash, username, first_name, last_name, fighter_level, gym_id)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING id, email, username, first_name, last_name, role, fighter_level, 
                 gym_id, is_verified, status, created_at`,
      [
        email,
        passwordHash,
        username,
        firstName,
        lastName,
        fighterLevel || "beginner",
        gymId,
      ],
    );

    const userData = userResult.rows[0];
    const user: User = {
      id: userData.id,
      email: userData.email,
      username: userData.username,
      firstName: userData.first_name,
      lastName: userData.last_name,
      role: userData.role,
      fighterLevel: userData.fighter_level,
      gymId: userData.gym_id,
      isVerified: userData.is_verified,
      status: userData.status,
      createdAt: userData.created_at,
    };

    // Generate tokens
    const tokens = await this.generateTokens(user);

    return { user, tokens };
  }

  // Login user
  static async login(
    credentials: LoginCredentials,
    ipAddress?: string,
    userAgent?: string,
  ): Promise<{ user: User; tokens: TokenPair }> {
    const { email, password, deviceInfo } = credentials;

    // Get user with password
    const userResult = await db.query(
      `SELECT id, email, password_hash, username, first_name, last_name, role, 
              fighter_level, gym_id, is_verified, status, avatar_url, created_at
       FROM users WHERE email = $1`,
      [email],
    );

    if (userResult.rows.length === 0) {
      throw new Error("Invalid email or password");
    }

    const userData = userResult.rows[0];

    // Check account status
    if (userData.status !== "active") {
      throw new Error(`Account is ${userData.status}. Please contact support.`);
    }

    // Verify password
    const isValidPassword = await PasswordUtils.verifyPassword(
      password,
      userData.password_hash,
    );
    if (!isValidPassword) {
      throw new Error("Invalid email or password");
    }

    const user: User = {
      id: userData.id,
      email: userData.email,
      username: userData.username,
      firstName: userData.first_name,
      lastName: userData.last_name,
      role: userData.role,
      fighterLevel: userData.fighter_level,
      gymId: userData.gym_id,
      isVerified: userData.is_verified,
      status: userData.status,
      avatarUrl: userData.avatar_url,
      createdAt: userData.created_at,
    };

    // Update login stats
    await db.query(
      "UPDATE users SET last_login_at = CURRENT_TIMESTAMP, login_count = login_count + 1 WHERE id = $1",
      [user.id],
    );

    // Generate tokens
    const tokens = await this.generateTokens(
      user,
      deviceInfo,
      ipAddress,
      userAgent,
    );

    return { user, tokens };
  }

  // Generate token pair
  private static async generateTokens(
    user: User,
    deviceInfo?: any,
    ipAddress?: string,
    userAgent?: string,
  ): Promise<TokenPair> {
    const sessionId = JWTUtils.generateSessionId();

    // Generate access token
    const accessToken = JWTUtils.generateAccessToken({
      userId: user.id,
      email: user.email,
      role: user.role,
      sessionId,
    });

    // Generate refresh token
    const refreshToken = JWTUtils.generateRefreshToken({
      userId: user.id,
      sessionId,
    });

    // Hash refresh token for storage
    const refreshTokenHash = JWTUtils.hashToken(refreshToken);

    // Store session in Redis (15 minutes for access token)
    await redis.setex(
      `${this.SESSION_PREFIX}${sessionId}`,
      900,
      JSON.stringify({
        userId: user.id,
        email: user.email,
        role: user.role,
        createdAt: new Date().toISOString(),
      }),
    );

    // Store refresh token in database
    await db.query(
      `INSERT INTO refresh_tokens 
       (user_id, token_hash, device_info, ip_address, user_agent, expires_at)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [
        user.id,
        refreshTokenHash,
        deviceInfo ? JSON.stringify(deviceInfo) : null,
        ipAddress,
        userAgent,
        new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
      ],
    );

    return {
      accessToken,
      refreshToken,
      expiresIn: 900, // 15 minutes
    };
  }

  // Refresh tokens
  static async refreshTokens(refreshToken: string): Promise<TokenPair> {
    // Verify refresh token
    const tokenPayload = JWTUtils.verifyRefreshToken(refreshToken);
    const refreshTokenHash = JWTUtils.hashToken(refreshToken);

    // Check if refresh token exists and is active
    const tokenResult = await db.query(
      "SELECT user_id, expires_at FROM refresh_tokens WHERE token_hash = $1 AND is_active = true",
      [refreshTokenHash],
    );

    if (tokenResult.rows.length === 0) {
      throw new Error("Invalid refresh token");
    }

    const tokenData = tokenResult.rows[0];

    // Check if token is expired
    if (new Date() > new Date(tokenData.expires_at)) {
      // Clean up expired token
      await db.query("DELETE FROM refresh_tokens WHERE token_hash = $1", [
        refreshTokenHash,
      ]);
      throw new Error("Refresh token expired");
    }

    // Get user data
    const userResult = await db.query(
      `SELECT id, email, username, first_name, last_name, role, fighter_level, 
              gym_id, is_verified, status, avatar_url, created_at
       FROM users WHERE id = $1 AND status = 'active'`,
      [tokenData.user_id],
    );

    if (userResult.rows.length === 0) {
      throw new Error("User not found or inactive");
    }

    const userData = userResult.rows[0];
    const user: User = {
      id: userData.id,
      email: userData.email,
      username: userData.username,
      firstName: userData.first_name,
      lastName: userData.last_name,
      role: userData.role,
      fighterLevel: userData.fighter_level,
      gymId: userData.gym_id,
      isVerified: userData.is_verified,
      status: userData.status,
      avatarUrl: userData.avatar_url,
      createdAt: userData.created_at,
    };

    // Revoke old refresh token
    await db.query(
      "UPDATE refresh_tokens SET is_active = false WHERE token_hash = $1",
      [refreshTokenHash],
    );

    // Generate new tokens
    return this.generateTokens(user);
  }

  // Logout user
  static async logout(
    accessToken: string,
    refreshToken?: string,
  ): Promise<void> {
    try {
      // Get session ID from access token
      const payload = JWTUtils.verifyAccessToken(accessToken);

      // Remove session from Redis
      await redis.del(`${this.SESSION_PREFIX}${payload.sessionId}`);

      // If refresh token provided, deactivate it
      if (refreshToken) {
        const refreshTokenHash = JWTUtils.hashToken(refreshToken);
        await db.query(
          "UPDATE refresh_tokens SET is_active = false WHERE token_hash = $1",
          [refreshTokenHash],
        );
      }
    } catch (error) {
      // Even if token is invalid, we consider logout successful
      console.warn("Logout with invalid token:", error);
    }
  }

  // Logout from all devices
  static async logoutAll(userId: string): Promise<void> {
    // Deactivate all refresh tokens
    await db.query(
      "UPDATE refresh_tokens SET is_active = false WHERE user_id = $1",
      [userId],
    );

    // Remove all sessions for user
    await redis.flushPattern(`${this.SESSION_PREFIX}*`);
  }

  // Validate session
  static async validateSession(sessionId: string): Promise<User | null> {
    const sessionData = await redis.get(`${this.SESSION_PREFIX}${sessionId}`);

    if (!sessionData) {
      return null;
    }

    const session = JSON.parse(sessionData);

    // Get fresh user data
    const userResult = await db.query(
      `SELECT id, email, username, first_name, last_name, role, fighter_level, 
              gym_id, is_verified, status, avatar_url, created_at
       FROM users WHERE id = $1 AND status = 'active'`,
      [session.userId],
    );

    if (userResult.rows.length === 0) {
      // Remove invalid session
      await redis.del(`${this.SESSION_PREFIX}${sessionId}`);
      return null;
    }

    const userData = userResult.rows[0];
    return {
      id: userData.id,
      email: userData.email,
      username: userData.username,
      firstName: userData.first_name,
      lastName: userData.last_name,
      role: userData.role,
      fighterLevel: userData.fighter_level,
      gymId: userData.gym_id,
      isVerified: userData.is_verified,
      status: userData.status,
      avatarUrl: userData.avatar_url,
      createdAt: userData.created_at,
    };
  }

  // Get user by ID (with caching)
  static async getUserById(userId: string): Promise<User | null> {
    // Try cache first
    const cached = await redis.get(`${this.USER_PREFIX}${userId}`);
    if (cached) {
      return JSON.parse(cached);
    }

    // Get from database
    const userResult = await db.query(
      `SELECT id, email, username, first_name, last_name, role, fighter_level, 
              gym_id, is_verified, status, avatar_url, created_at
       FROM users WHERE id = $1`,
      [userId],
    );

    if (userResult.rows.length === 0) {
      return null;
    }

    const userData = userResult.rows[0];
    const user: User = {
      id: userData.id,
      email: userData.email,
      username: userData.username,
      firstName: userData.first_name,
      lastName: userData.last_name,
      role: userData.role,
      fighterLevel: userData.fighter_level,
      gymId: userData.gym_id,
      isVerified: userData.is_verified,
      status: userData.status,
      avatarUrl: userData.avatar_url,
      createdAt: userData.created_at,
    };

    // Cache for 10 minutes
    await redis.setex(
      `${this.USER_PREFIX}${userId}`,
      600,
      JSON.stringify(user),
    );

    return user;
  }

  // Clean expired tokens
  static async cleanupExpiredTokens(): Promise<void> {
    await db.query(
      "DELETE FROM refresh_tokens WHERE expires_at < CURRENT_TIMESTAMP OR is_active = false",
    );
  }
}
