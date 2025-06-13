// =============================================
// 🎛️ src/controllers/auth.controller.ts
// =============================================

import { Request, Response } from "express";
import { AuthService } from "../services/auth.service";
import { LoginCredentials, RegisterData } from "../types/auth.types";

export class AuthController {
  // POST /auth/register
  static async register(req: Request, res: Response) {
    try {
      const userData: RegisterData = req.body;

      const result = await AuthService.register(userData);

      res.status(201).json({
        success: true,
        message: "User registered successfully",
        data: {
          user: result.user,
          tokens: result.tokens,
        },
      });
    } catch (error: any) {
      console.error("Registration error:", error);

      res.status(400).json({
        success: false,
        error: error.message || "Registration failed",
        code: "REGISTRATION_FAILED",
      });
    }
  }

  // POST /auth/login
  static async login(req: Request, res: Response) {
    try {
      const credentials: LoginCredentials = req.body;
      const ipAddress = req.ip;
      const userAgent = req.get("User-Agent");

      const result = await AuthService.login(credentials, ipAddress, userAgent);

      res.json({
        success: true,
        message: "Login successful",
        data: {
          user: result.user,
          tokens: result.tokens,
        },
      });
    } catch (error: any) {
      console.error("Login error:", error);

      res.status(401).json({
        success: false,
        error: error.message || "Login failed",
        code: "LOGIN_FAILED",
      });
    }
  }

  // POST /auth/refresh
  static async refresh(req: Request, res: Response) {
    try {
      const { refreshToken } = req.body;

      if (!refreshToken) {
        return res.status(400).json({
          success: false,
          error: "Refresh token required",
          code: "REFRESH_TOKEN_REQUIRED",
        });
      }

      const tokens = await AuthService.refreshTokens(refreshToken);

      res.json({
        success: true,
        message: "Tokens refreshed successfully",
        data: { tokens },
      });
    } catch (error: any) {
      console.error("Token refresh error:", error);

      res.status(401).json({
        success: false,
        error: error.message || "Token refresh failed",
        code: "REFRESH_FAILED",
      });
    }
  }

  // POST /auth/logout
  static async logout(req: Request, res: Response) {
    try {
      const authHeader = req.headers.authorization;
      const { refreshToken } = req.body;

      if (authHeader && authHeader.startsWith("Bearer ")) {
        const accessToken = authHeader.substring(7);
        await AuthService.logout(accessToken, refreshToken);
      }

      res.json({
        success: true,
        message: "Logout successful",
      });
    } catch (error: any) {
      console.error("Logout error:", error);

      // Always return success for logout
      res.json({
        success: true,
        message: "Logout successful",
      });
    }
  }

  // POST /auth/logout-all
  static async logoutAll(req: Request, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          error: "Authentication required",
          code: "AUTH_REQUIRED",
        });
      }

      await AuthService.logoutAll(req.user.id);

      res.json({
        success: true,
        message: "Logged out from all devices",
      });
    } catch (error: any) {
      console.error("Logout all error:", error);

      res.status(500).json({
        success: false,
        error: "Logout failed",
        code: "LOGOUT_ALL_FAILED",
      });
    }
  }

  // GET /auth/me
  static async getCurrentUser(req: Request, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          error: "Authentication required",
          code: "AUTH_REQUIRED",
        });
      }

      res.json({
        success: true,
        data: { user: req.user },
      });
    } catch (error: any) {
      console.error("Get current user error:", error);

      res.status(500).json({
        success: false,
        error: "Failed to get user data",
        code: "USER_FETCH_FAILED",
      });
    }
  }
}
