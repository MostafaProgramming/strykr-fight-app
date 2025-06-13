// =============================================
// 📄 src/app.ts - Express Application Setup
// =============================================

import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import compression from "compression";
import morgan from "morgan";

// Import routes
import authRoutes from "./routes/auth.routes";
import userRoutes from "./routes/users.routes";
import postRoutes from "./routes/posts.routes";
import mediaRoutes from "./routes/media.routes";
import socialRoutes from "./routes/social.routes";
import gymRoutes from "./routes/gyms.routes";

// Import middleware
import { AuthMiddleware } from "./middleware/auth.middleware";
import { errorHandler } from "./middleware/error.middleware";
import { requestLogger } from "./middleware/logger.middleware";

const app = express();

// =============================================
// 🛡️ Security & Performance Middleware
// =============================================

// Security headers
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        imgSrc: ["'self'", "data:", "https:"],
        mediaSrc: ["'self'", "https:"],
      },
    },
  }),
);

// CORS for React Native
app.use(
  cors({
    origin: [
      "http://localhost:3000",
      "http://localhost:19006", // Expo dev
      "exp://localhost:19000", // Expo LAN
      // Add your production mobile app URLs
      "https://your-app.com",
    ],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
  }),
);

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: {
    error: "Too many requests from this IP, please try again later.",
    code: "RATE_LIMIT_EXCEEDED",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Apply rate limiting to API routes
app.use("/api/", limiter);

// Stricter rate limiting for auth routes
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // limit each IP to 5 auth requests per windowMs
  skipSuccessfulRequests: true,
});

app.use("/api/auth/login", authLimiter);
app.use("/api/auth/register", authLimiter);

// Body parsing
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Compression
app.use(compression());

// Logging
app.use(morgan("combined"));
app.use(requestLogger);

// =============================================
// 🛣️ API Routes
// =============================================

// Health check
app.get("/health", (req, res) => {
  res.json({
    status: "ok",
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version || "1.0.0",
    environment: process.env.NODE_ENV || "development",
  });
});

// API routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/posts", postRoutes);
app.use("/api/media", mediaRoutes);
app.use("/api/social", socialRoutes);
app.use("/api/gyms", gymRoutes);

// 404 handler
app.use("*", (req, res) => {
  res.status(404).json({
    success: false,
    error: "Route not found",
    code: "ROUTE_NOT_FOUND",
  });
});

// Error handling middleware (must be last)
app.use(errorHandler);

export default app;
