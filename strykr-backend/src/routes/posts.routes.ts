// =============================================
// 📝 src/routes/posts.routes.ts
// =============================================

import { Router } from "express";
import { PostController } from "../controllers/post.controller";
import { AuthMiddleware } from "../middleware/auth.middleware";
import { validateRequest } from "../middleware/validation.middleware";
import { z } from "zod";

const router = Router();

// Validation schemas
const createPostSchema = z.object({
  body: z.object({
    type: z.enum(["training_session", "achievement", "photo", "video", "text"]),
    caption: z.string().max(2000).optional(),

    // Training session specific fields
    trainingType: z
      .enum([
        "bag_work",
        "pad_work",
        "sparring",
        "drills",
        "strength",
        "cardio",
        "recovery",
        "technique",
      ])
      .optional(),
    durationMinutes: z.number().min(1).max(600).optional(),
    rounds: z.number().min(0).max(50).optional(),
    intensityRpe: z.number().min(1).max(10).optional(),
    caloriesBurned: z.number().min(0).optional(),
    mood: z.string().max(50).optional(),
    notes: z.string().max(1000).optional(),

    // Location
    locationName: z.string().max(255).optional(),
    latitude: z.number().min(-90).max(90).optional(),
    longitude: z.number().min(-180).max(180).optional(),
    gymId: z.string().uuid().optional(),

    // Privacy
    isPublic: z.boolean().default(true),

    // Media
    mediaIds: z.array(z.string().uuid()).max(10).optional(),
  }),
});

const getFeedSchema = z.object({
  query: z.object({
    limit: z
      .string()
      .transform(Number)
      .pipe(z.number().min(1).max(50))
      .default("20"),
    offset: z.string().transform(Number).pipe(z.number().min(0)).default("0"),
    filter: z
      .enum(["following", "discover", "gym", "trending"])
      .default("discover"),
  }),
});

const addCommentSchema = z.object({
  body: z.object({
    content: z.string().min(1).max(1000),
    parentId: z.string().uuid().optional(),
  }),
});

// Routes
router.post(
  "/",
  AuthMiddleware.authenticate,
  validateRequest(createPostSchema),
  PostController.createPost,
);
router.get(
  "/feed",
  AuthMiddleware.optionalAuth,
  validateRequest(getFeedSchema),
  PostController.getFeed,
);
router.get("/:postId", AuthMiddleware.optionalAuth, PostController.getPost);
router.patch(
  "/:postId",
  AuthMiddleware.authenticate,
  PostController.updatePost,
);
router.delete(
  "/:postId",
  AuthMiddleware.authenticate,
  PostController.deletePost,
);

// Interactions
router.post(
  "/:postId/like",
  AuthMiddleware.authenticate,
  PostController.likePost,
);
router.delete(
  "/:postId/like",
  AuthMiddleware.authenticate,
  PostController.unlikePost,
);
router.post(
  "/:postId/comments",
  AuthMiddleware.authenticate,
  validateRequest(addCommentSchema),
  PostController.addComment,
);
router.get(
  "/:postId/comments",
  AuthMiddleware.optionalAuth,
  PostController.getComments,
);
router.patch(
  "/comments/:commentId",
  AuthMiddleware.authenticate,
  PostController.updateComment,
);
router.delete(
  "/comments/:commentId",
  AuthMiddleware.authenticate,
  PostController.deleteComment,
);
router.post(
  "/comments/:commentId/like",
  AuthMiddleware.authenticate,
  PostController.likeComment,
);

export default router;
