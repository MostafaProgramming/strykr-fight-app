// =============================================
// 🛡️ src/middleware/auth.middleware.ts
// =============================================

import { Request, Response, NextFunction } from "express";
import { JWTUtils } from "../utils/jwt.utils";
import { AuthService } from "../services/auth.service";
import { User } from "../types/auth.types";

// Extend Request type to include user
declare global {
  namespace Express {
    interface Request {
      user?: User;
      sessionId?: string;
    }
  }
}

export class AuthMiddleware {
  // Verify JWT and attach user to request
  static async authenticate(req: Request, res: Response, next: NextFunction) {
    try {
      const authHeader = req.headers.authorization;

      if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({
          success: false,
          error: "No token provided",
          code: "NO_TOKEN",
        });
      }

      const token = authHeader.substring(7); // Remove 'Bearer '

      // Verify token
      const payload = JWTUtils.verifyAccessToken(token);

      // Validate session
      const user = await AuthService.validateSession(payload.sessionId);

      if (!user) {
        return res.status(401).json({
          success: false,
          error: "Invalid or expired session",
          code: "INVALID_SESSION",
        });
      }

      // Attach user and session to request
      req.user = user;
      req.sessionId = payload.sessionId;

      next();
    } catch (error) {
      console.error("Auth middleware error:", error);

      return res.status(401).json({
        success: false,
        error: "Invalid token",
        code: "INVALID_TOKEN",
      });
    }
  }

  // Optional authentication - doesn't fail if no token
  static async optionalAuth(req: Request, res: Response, next: NextFunction) {
    try {
      const authHeader = req.headers.authorization;

      if (authHeader && authHeader.startsWith("Bearer ")) {
        const token = authHeader.substring(7);
        const payload = JWTUtils.verifyAccessToken(token);
        const user = await AuthService.validateSession(payload.sessionId);

        if (user) {
          req.user = user;
          req.sessionId = payload.sessionId;
        }
      }

      next();
    } catch (error) {
      // Silently continue without auth
      next();
    }
  }

  // Require specific role
  static requireRole(...roles: string[]) {
    return (req: Request, res: Response, next: NextFunction) => {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          error: "Authentication required",
          code: "AUTH_REQUIRED",
        });
      }

      if (!roles.includes(req.user.role)) {
        return res.status(403).json({
          success: false,
          error: "Insufficient permissions",
          code: "INSUFFICIENT_PERMISSIONS",
        });
      }

      next();
    };
  }

  // Require verified account
  static requireVerified(req: Request, res: Response, next: NextFunction) {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: "Authentication required",
        code: "AUTH_REQUIRED",
      });
    }

    if (!req.user.isVerified) {
      return res.status(403).json({
        success: false,
        error: "Account verification required",
        code: "VERIFICATION_REQUIRED",
      });
    }

    next();
  }
}
