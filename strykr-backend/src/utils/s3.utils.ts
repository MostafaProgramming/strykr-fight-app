// =============================================
// 🛠️ src/utils/s3.utils.ts
// =============================================

import { s3, AWS_CONFIG } from "../config/aws";
import crypto from "crypto";
import path from "path";

export class S3Utils {
  // Generate unique S3 key
  static generateS3Key(
    userId: string,
    filename: string,
    type: "image" | "video" | "audio",
  ): string {
    const timestamp = Date.now();
    const randomString = crypto.randomBytes(8).toString("hex");
    const ext = path.extname(filename);
    const baseName = path.basename(filename, ext);

    return `media/${type}s/${userId}/${timestamp}-${randomString}-${baseName}${ext}`;
  }

  // Generate presigned upload URL
  static async generatePresignedUploadUrl(
    key: string,
    contentType: string,
    fileSize: number,
    expiresIn: number = AWS_CONFIG.UPLOAD_EXPIRY,
  ): Promise<string> {
    const params = {
      Bucket: AWS_CONFIG.BUCKET_NAME,
      Key: key,
      Expires: expiresIn,
      ContentType: contentType,
      ContentLength: fileSize,
      ServerSideEncryption: "AES256",
      Metadata: {
        "uploaded-by": "fighttracker-app",
        "upload-timestamp": Date.now().toString(),
      },
    };

    return s3.getSignedUrl("putObject", params);
  }

  // Generate presigned download URL
  static async generatePresignedDownloadUrl(
    key: string,
    expiresIn: number = 3600,
  ): Promise<string> {
    const params = {
      Bucket: AWS_CONFIG.BUCKET_NAME,
      Key: key,
      Expires: expiresIn,
    };

    return s3.getSignedUrl("getObject", params);
  }

  // Check if object exists
  static async objectExists(key: string): Promise<boolean> {
    try {
      await s3
        .headObject({
          Bucket: AWS_CONFIG.BUCKET_NAME,
          Key: key,
        })
        .promise();
      return true;
    } catch (error: any) {
      if (error.statusCode === 404) {
        return false;
      }
      throw error;
    }
  }

  // Get object metadata
  static async getObjectMetadata(
    key: string,
  ): Promise<AWS.S3.HeadObjectOutput> {
    return s3
      .headObject({
        Bucket: AWS_CONFIG.BUCKET_NAME,
        Key: key,
      })
      .promise();
  }

  // Delete object
  static async deleteObject(key: string): Promise<void> {
    await s3
      .deleteObject({
        Bucket: AWS_CONFIG.BUCKET_NAME,
        Key: key,
      })
      .promise();
  }

  // Copy object
  static async copyObject(
    sourceKey: string,
    destinationKey: string,
  ): Promise<void> {
    await s3
      .copyObject({
        Bucket: AWS_CONFIG.BUCKET_NAME,
        CopySource: `${AWS_CONFIG.BUCKET_NAME}/${sourceKey}`,
        Key: destinationKey,
      })
      .promise();
  }

  // Get CloudFront URL
  static getCloudFrontUrl(key: string): string {
    if (AWS_CONFIG.CLOUDFRONT_DOMAIN) {
      return `https://${AWS_CONFIG.CLOUDFRONT_DOMAIN}/${key}`;
    }
    return `https://${AWS_CONFIG.BUCKET_NAME}.s3.${AWS_CONFIG.REGION}.amazonaws.com/${key}`;
  }

  // Generate thumbnail key
  static generateThumbnailKey(originalKey: string): string {
    const pathParts = originalKey.split("/");
    const filename = pathParts.pop();
    const directory = pathParts.join("/");
    const ext = path.extname(filename!);
    const baseName = path.basename(filename!, ext);

    return `${directory}/thumbnails/${baseName}-thumb${ext}`;
  }
}
