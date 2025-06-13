// =============================================
// 📄 src/types/media.types.ts
// =============================================

export interface MediaFile {
  id: string;
  postId?: string;
  userId: string;
  type: "image" | "video" | "audio";
  filename: string;
  originalFilename: string;
  fileSize: number;
  mimeType: string;
  s3Bucket: string;
  s3Key: string;
  s3Region: string;
  cdnUrl?: string;
  width?: number;
  height?: number;
  durationSeconds?: number;
  metadata?: any;
  processingStatus: "pending" | "processing" | "completed" | "failed";
  variants?: MediaVariants;
  createdAt: Date;
}

export interface MediaVariants {
  thumbnail?: string;
  small?: string;
  medium?: string;
  large?: string;
  compressed?: string;
}

export interface UploadRequest {
  filename: string;
  contentType: string;
  fileSize: number;
  postId?: string;
}

export interface PresignedUploadResponse {
  uploadUrl: string;
  fileKey: string;
  mediaId: string;
  expiresIn: number;
}

export interface MediaProcessingJob {
  mediaId: string;
  type: "image" | "video";
  operations: string[];
}
