// =============================================
// 🔐 src/routes/auth.routes.ts
// =============================================

import { Router } from "express";
import { AuthController } from "../controllers/auth.controller";
import { AuthMiddleware } from "../middleware/auth.middleware";
import { validateRequest } from "../middleware/validation.middleware";
import { z } from "zod";

const router = Router();

// Validation schemas
const registerSchema = z.object({
  body: z.object({
    email: z.string().email("Invalid email format"),
    password: z.string().min(8, "Password must be at least 8 characters"),
    username: z
      .string()
      .min(3, "Username must be at least 3 characters")
      .max(50),
    firstName: z.string().min(1, "First name is required").max(100),
    lastName: z.string().min(1, "Last name is required").max(100),
    fighterLevel: z
      .enum(["beginner", "intermediate", "amateur", "semi_pro", "professional"])
      .optional(),
    gymId: z.string().uuid().optional(),
  }),
});

const loginSchema = z.object({
  body: z.object({
    email: z.string().email("Invalid email format"),
    password: z.string().min(1, "Password is required"),
    deviceInfo: z
      .object({
        deviceId: z.string(),
        platform: z.enum(["ios", "android"]),
        appVersion: z.string(),
      })
      .optional(),
  }),
});

const refreshSchema = z.object({
  body: z.object({
    refreshToken: z.string().min(1, "Refresh token is required"),
  }),
});

// Routes
router.post(
  "/register",
  validateRequest(registerSchema),
  AuthController.register,
);
router.post("/login", validateRequest(loginSchema), AuthController.login);
router.post("/refresh", validateRequest(refreshSchema), AuthController.refresh);
router.post("/logout", AuthController.logout);
router.post(
  "/logout-all",
  AuthMiddleware.authenticate,
  AuthController.logoutAll,
);
router.get("/me", AuthMiddleware.authenticate, AuthController.getCurrentUser);

export default router;
