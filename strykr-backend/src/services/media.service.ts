// =============================================
// 🛠️ src/services/media.service.ts
// =============================================

import { Pool } from "pg";
import {
  MediaFile,
  UploadRequest,
  PresignedUploadResponse,
  MediaVariants,
} from "../types/media.types";
import { S3Utils, AWS_CONFIG } from "../utils/s3.utils";
import { ImageUtils } from "../utils/image.utils";
import { VideoUtils } from "../utils/video.utils";
import { db } from "../config/database";
import { v4 as uuidv4 } from "uuid";

export class MediaService {
  // Generate presigned upload URL
  static async generateUploadUrl(
    userId: string,
    request: UploadRequest,
  ): Promise<PresignedUploadResponse> {
    const { filename, contentType, fileSize, postId } = request;

    // Validate file type and size
    this.validateUpload(contentType, fileSize);

    // Determine media type
    const mediaType = this.getMediaType(contentType);

    // Generate unique S3 key
    const s3Key = S3Utils.generateS3Key(userId, filename, mediaType);

    // Generate presigned URL
    const uploadUrl = await S3Utils.generatePresignedUploadUrl(
      s3Key,
      contentType,
      fileSize,
    );

    // Create media record in database
    const mediaId = uuidv4();
    await db.query(
      `INSERT INTO media 
       (id, user_id, post_id, type, filename, original_filename, file_size, mime_type, 
        s3_bucket, s3_key, s3_region, processing_status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)`,
      [
        mediaId,
        userId,
        postId || null,
        mediaType,
        s3Key.split("/").pop(), // Just the filename
        filename,
        fileSize,
        contentType,
        AWS_CONFIG.BUCKET_NAME,
        s3Key,
        AWS_CONFIG.REGION,
        "pending",
      ],
    );

    return {
      uploadUrl,
      fileKey: s3Key,
      mediaId,
      expiresIn: AWS_CONFIG.UPLOAD_EXPIRY,
    };
  }

  // Confirm upload and start processing
  static async confirmUpload(mediaId: string): Promise<MediaFile> {
    // Get media record
    const mediaResult = await db.query("SELECT * FROM media WHERE id = $1", [
      mediaId,
    ]);

    if (mediaResult.rows.length === 0) {
      throw new Error("Media not found");
    }

    const media = mediaResult.rows[0];

    // Verify file exists in S3
    const exists = await S3Utils.objectExists(media.s3_key);
    if (!exists) {
      throw new Error("File not found in storage");
    }

    // Update processing status
    await db.query("UPDATE media SET processing_status = $1 WHERE id = $2", [
      "processing",
      mediaId,
    ]);

    // Start background processing
    this.processMediaAsync(mediaId, media.type, media.s3_key);

    return this.getMediaById(mediaId);
  }

  // Background media processing
  private static async processMediaAsync(
    mediaId: string,
    type: string,
    s3Key: string,
  ): Promise<void> {
    try {
      let variants: MediaVariants = {};
      let width: number | undefined;
      let height: number | undefined;
      let duration: number | undefined;

      if (type === "image") {
        variants = await ImageUtils.processImage(s3Key);
        const dimensions = await ImageUtils.getImageDimensions(s3Key);
        width = dimensions.width;
        height = dimensions.height;
      } else if (type === "video") {
        variants = await VideoUtils.processVideo(s3Key);
        const metadata = await VideoUtils.getVideoMetadata(s3Key);
        width = metadata.width;
        height = metadata.height;
        duration = metadata.duration;
      }

      // Update media record with processing results
      await db.query(
        `UPDATE media 
         SET processing_status = $1, variants = $2, width = $3, height = $4, 
             duration_seconds = $5, cdn_url = $6, updated_at = CURRENT_TIMESTAMP
         WHERE id = $7`,
        [
          "completed",
          JSON.stringify(variants),
          width,
          height,
          duration,
          S3Utils.getCloudFrontUrl(s3Key),
          mediaId,
        ],
      );

      console.log(`Media processing completed for ${mediaId}`);
    } catch (error) {
      console.error(`Media processing failed for ${mediaId}:`, error);

      // Update status to failed
      await db.query(
        "UPDATE media SET processing_status = $1, processing_error = $2 WHERE id = $3",
        ["failed", error.message, mediaId],
      );
    }
  }

  // Get media by ID
  static async getMediaById(mediaId: string): Promise<MediaFile> {
    const result = await db.query("SELECT * FROM media WHERE id = $1", [
      mediaId,
    ]);

    if (result.rows.length === 0) {
      throw new Error("Media not found");
    }

    return this.mapDatabaseRowToMediaFile(result.rows[0]);
  }

  // Get media by post ID
  static async getMediaByPostId(postId: string): Promise<MediaFile[]> {
    const result = await db.query(
      "SELECT * FROM media WHERE post_id = $1 ORDER BY sort_order, created_at",
      [postId],
    );

    return result.rows.map(this.mapDatabaseRowToMediaFile);
  }

  // Delete media
  static async deleteMedia(mediaId: string, userId: string): Promise<void> {
    // Get media record
    const mediaResult = await db.query(
      "SELECT * FROM media WHERE id = $1 AND user_id = $2",
      [mediaId, userId],
    );

    if (mediaResult.rows.length === 0) {
      throw new Error("Media not found or unauthorized");
    }

    const media = mediaResult.rows[0];

    // Delete from S3
    await S3Utils.deleteObject(media.s3_key);

    // Delete variants if they exist
    if (media.variants) {
      const variants = JSON.parse(media.variants);
      for (const variant of Object.values(variants) as string[]) {
        if (variant) {
          const variantKey = variant.split("/").pop(); // Extract key from URL
          if (variantKey) {
            try {
              await S3Utils.deleteObject(variantKey);
            } catch (error) {
              console.warn(`Failed to delete variant ${variantKey}:`, error);
            }
          }
        }
      }
    }

    // Delete from database
    await db.query("DELETE FROM media WHERE id = $1", [mediaId]);
  }

  // Validate upload request
  private static validateUpload(contentType: string, fileSize: number): void {
    const mediaType = this.getMediaType(contentType);

    // Check allowed MIME types
    const allowedTypes =
      AWS_CONFIG.ALLOWED_MIME_TYPES[
        mediaType.toUpperCase() as keyof typeof AWS_CONFIG.ALLOWED_MIME_TYPES
      ];
    if (!allowedTypes.includes(contentType)) {
      throw new Error(`File type ${contentType} not allowed`);
    }

    // Check file size
    const maxSize =
      AWS_CONFIG.MAX_FILE_SIZE[
        mediaType.toUpperCase() as keyof typeof AWS_CONFIG.MAX_FILE_SIZE
      ];
    if (fileSize > maxSize) {
      throw new Error(
        `File size ${fileSize} exceeds maximum allowed size ${maxSize}`,
      );
    }
  }

  // Get media type from content type
  private static getMediaType(
    contentType: string,
  ): "image" | "video" | "audio" {
    if (contentType.startsWith("image/")) return "image";
    if (contentType.startsWith("video/")) return "video";
    if (contentType.startsWith("audio/")) return "audio";
    throw new Error(`Unsupported content type: ${contentType}`);
  }

  // Map database row to MediaFile object
  private static mapDatabaseRowToMediaFile(row: any): MediaFile {
    return {
      id: row.id,
      postId: row.post_id,
      userId: row.user_id,
      type: row.type,
      filename: row.filename,
      originalFilename: row.original_filename,
      fileSize: row.file_size,
      mimeType: row.mime_type,
      s3Bucket: row.s3_bucket,
      s3Key: row.s3_key,
      s3Region: row.s3_region,
      cdnUrl: row.cdn_url,
      width: row.width,
      height: row.height,
      durationSeconds: row.duration_seconds,
      metadata: row.metadata,
      processingStatus: row.processing_status,
      variants: row.variants ? JSON.parse(row.variants) : undefined,
      createdAt: row.created_at,
    };
  }
}
