// =============================================
// 🎛️ src/controllers/media.controller.ts
// =============================================

import { Request, Response } from "express";
import { MediaService } from "../services/media.service";
import { UploadRequest } from "../types/media.types";

export class MediaController {
  // POST /media/upload-url
  static async generateUploadUrl(req: Request, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          error: "Authentication required",
          code: "AUTH_REQUIRED",
        });
      }

      const uploadRequest: UploadRequest = req.body;

      // Validate request
      if (
        !uploadRequest.filename ||
        !uploadRequest.contentType ||
        !uploadRequest.fileSize
      ) {
        return res.status(400).json({
          success: false,
          error: "Missing required fields: filename, contentType, fileSize",
          code: "MISSING_FIELDS",
        });
      }

      const result = await MediaService.generateUploadUrl(
        req.user.id,
        uploadRequest,
      );

      res.json({
        success: true,
        message: "Upload URL generated successfully",
        data: result,
      });
    } catch (error: any) {
      console.error("Generate upload URL error:", error);

      res.status(400).json({
        success: false,
        error: error.message || "Failed to generate upload URL",
        code: "UPLOAD_URL_FAILED",
      });
    }
  }

  // POST /media/:mediaId/confirm
  static async confirmUpload(req: Request, res: Response) {
    try {
      const { mediaId } = req.params;

      const media = await MediaService.confirmUpload(mediaId);

      res.json({
        success: true,
        message: "Upload confirmed, processing started",
        data: { media },
      });
    } catch (error: any) {
      console.error("Confirm upload error:", error);

      res.status(400).json({
        success: false,
        error: error.message || "Failed to confirm upload",
        code: "CONFIRM_UPLOAD_FAILED",
      });
    }
  }

  // GET /media/:mediaId
  static async getMedia(req: Request, res: Response) {
    try {
      const { mediaId } = req.params;

      const media = await MediaService.getMediaById(mediaId);

      res.json({
        success: true,
        data: { media },
      });
    } catch (error: any) {
      console.error("Get media error:", error);

      res.status(404).json({
        success: false,
        error: error.message || "Media not found",
        code: "MEDIA_NOT_FOUND",
      });
    }
  }

  // DELETE /media/:mediaId
  static async deleteMedia(req: Request, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          error: "Authentication required",
          code: "AUTH_REQUIRED",
        });
      }

      const { mediaId } = req.params;

      await MediaService.deleteMedia(mediaId, req.user.id);

      res.json({
        success: true,
        message: "Media deleted successfully",
      });
    } catch (error: any) {
      console.error("Delete media error:", error);

      res.status(400).json({
        success: false,
        error: error.message || "Failed to delete media",
        code: "DELETE_MEDIA_FAILED",
      });
    }
  }

  // GET /posts/:postId/media
  static async getPostMedia(req: Request, res: Response) {
    try {
      const { postId } = req.params;

      const media = await MediaService.getMediaByPostId(postId);

      res.json({
        success: true,
        data: { media },
      });
    } catch (error: any) {
      console.error("Get post media error:", error);

      res.status(400).json({
        success: false,
        error: error.message || "Failed to get post media",
        code: "GET_POST_MEDIA_FAILED",
      });
    }
  }
}
