// =============================================
// 👤 src/routes/users.routes.ts
// =============================================

import { Router } from "express";
import { UserController } from "../controllers/user.controller";
import { AuthMiddleware } from "../middleware/auth.middleware";
import { validateRequest } from "../middleware/validation.middleware";
import { z } from "zod";

const router = Router();

// Validation schemas
const updateProfileSchema = z.object({
  body: z.object({
    firstName: z.string().min(1).max(100).optional(),
    lastName: z.string().min(1).max(100).optional(),
    displayName: z.string().max(100).optional(),
    bio: z.string().max(500).optional(),
    fighterLevel: z
      .enum(["beginner", "intermediate", "amateur", "semi_pro", "professional"])
      .optional(),
    weightClass: z.string().max(50).optional(),
    stance: z.enum(["orthodox", "southpaw", "switch"]).optional(),
    city: z.string().max(100).optional(),
    country: z.string().max(100).optional(),
    isPrivate: z.boolean().optional(),
  }),
});

const searchUsersSchema = z.object({
  query: z.object({
    q: z.string().min(1, "Search query is required"),
    limit: z
      .string()
      .transform(Number)
      .pipe(z.number().min(1).max(50))
      .optional(),
    offset: z.string().transform(Number).pipe(z.number().min(0)).optional(),
    filter: z.enum(["all", "verified", "gym_members"]).optional(),
  }),
});

// Routes
router.get("/me", AuthMiddleware.authenticate, UserController.getCurrentUser);
router.patch(
  "/me",
  AuthMiddleware.authenticate,
  validateRequest(updateProfileSchema),
  UserController.updateProfile,
);
router.get(
  "/search",
  AuthMiddleware.optionalAuth,
  validateRequest(searchUsersSchema),
  UserController.searchUsers,
);
router.get("/:userId", AuthMiddleware.optionalAuth, UserController.getUserById);
router.get(
  "/:userId/posts",
  AuthMiddleware.optionalAuth,
  UserController.getUserPosts,
);
router.get(
  "/:userId/stats",
  AuthMiddleware.optionalAuth,
  UserController.getUserStats,
);
router.post(
  "/:userId/follow",
  AuthMiddleware.authenticate,
  UserController.followUser,
);
router.delete(
  "/:userId/follow",
  AuthMiddleware.authenticate,
  UserController.unfollowUser,
);
router.get(
  "/:userId/followers",
  AuthMiddleware.optionalAuth,
  UserController.getFollowers,
);
router.get(
  "/:userId/following",
  AuthMiddleware.optionalAuth,
  UserController.getFollowing,
);

export default router;
