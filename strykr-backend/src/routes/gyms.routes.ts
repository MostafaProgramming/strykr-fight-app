// =============================================
// 🏢 src/routes/gyms.routes.ts
// =============================================

import { Router } from "express";
import { GymController } from "../controllers/gym.controller";
import { AuthMiddleware } from "../middleware/auth.middleware";
import { validateRequest } from "../middleware/validation.middleware";
import { z } from "zod";

const router = Router();

// Validation schemas
const searchGymsSchema = z.object({
  query: z.object({
    q: z.string().optional(),
    city: z.string().optional(),
    country: z.string().optional(),
    limit: z
      .string()
      .transform(Number)
      .pipe(z.number().min(1).max(50))
      .default("20"),
    offset: z.string().transform(Number).pipe(z.number().min(0)).default("0"),
  }),
});

// Routes
router.get(
  "/search",
  validateRequest(searchGymsSchema),
  GymController.searchGyms,
);
router.get("/:gymId", AuthMiddleware.optionalAuth, GymController.getGym);
router.get(
  "/:gymId/members",
  AuthMiddleware.optionalAuth,
  GymController.getGymMembers,
);
router.get(
  "/:gymId/posts",
  AuthMiddleware.optionalAuth,
  GymController.getGymPosts,
);
router.post("/:gymId/join", AuthMiddleware.authenticate, GymController.joinGym);
router.delete(
  "/:gymId/leave",
  AuthMiddleware.authenticate,
  GymController.leaveGym,
);

export default router;
