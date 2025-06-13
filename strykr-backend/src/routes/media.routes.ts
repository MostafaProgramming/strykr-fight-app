// =============================================
// 📸 src/routes/media.routes.ts
// =============================================

import { Router } from "express";
import { MediaController } from "../controllers/media.controller";
import { AuthMiddleware } from "../middleware/auth.middleware";
import { validateRequest } from "../middleware/validation.middleware";
import { z } from "zod";

const router = Router();

// Validation schemas
const uploadUrlSchema = z.object({
  body: z.object({
    filename: z.string().min(1).max(255),
    contentType: z.string().min(1),
    fileSize: z
      .number()
      .min(1)
      .max(100 * 1024 * 1024), // 100MB max
    postId: z.string().uuid().optional(),
  }),
});

// Routes
router.post(
  "/upload-url",
  AuthMiddleware.authenticate,
  validateRequest(uploadUrlSchema),
  MediaController.generateUploadUrl,
);
router.post(
  "/:mediaId/confirm",
  AuthMiddleware.authenticate,
  MediaController.confirmUpload,
);
router.get("/:mediaId", AuthMiddleware.optionalAuth, MediaController.getMedia);
router.delete(
  "/:mediaId",
  AuthMiddleware.authenticate,
  MediaController.deleteMedia,
);
router.get(
  "/posts/:postId/media",
  AuthMiddleware.optionalAuth,
  MediaController.getPostMedia,
);

export default router;
