// =============================================
// 👥 src/routes/social.routes.ts
// =============================================

import { Router } from "express";
import { SocialController } from "../controllers/social.controller";
import { AuthMiddleware } from "../middleware/auth.middleware";
import { validateRequest } from "../middleware/validation.middleware";
import { z } from "zod";

const router = Router();

// Routes for social features
router.get(
  "/notifications",
  AuthMiddleware.authenticate,
  SocialController.getNotifications,
);
router.patch(
  "/notifications/:notificationId/read",
  AuthMiddleware.authenticate,
  SocialController.markNotificationRead,
);
router.patch(
  "/notifications/read-all",
  AuthMiddleware.authenticate,
  SocialController.markAllNotificationsRead,
);

// Follow suggestions
router.get(
  "/suggestions/users",
  AuthMiddleware.authenticate,
  SocialController.getUserSuggestions,
);
router.get(
  "/trending/hashtags",
  AuthMiddleware.optionalAuth,
  SocialController.getTrendingHashtags,
);
router.get(
  "/trending/posts",
  AuthMiddleware.optionalAuth,
  SocialController.getTrendingPosts,
);

// Activity feed
router.get(
  "/activity",
  AuthMiddleware.authenticate,
  SocialController.getActivity,
);

export default router;
