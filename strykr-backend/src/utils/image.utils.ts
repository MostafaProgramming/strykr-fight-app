// =============================================
// 🖼️ src/utils/image.utils.ts
// =============================================

import sharp from "sharp";
import { S3Utils, AWS_CONFIG } from "./s3.utils";
import { s3 } from "../config/aws";

export class ImageUtils {
  private static THUMBNAIL_SIZE = 300;
  private static SMALL_SIZE = 600;
  private static MEDIUM_SIZE = 1200;
  private static LARGE_SIZE = 1920;
  private static QUALITY = 85;

  // Process uploaded image
  static async processImage(s3Key: string): Promise<MediaVariants> {
    try {
      // Download original image from S3
      const originalObject = await s3
        .getObject({
          Bucket: AWS_CONFIG.BUCKET_NAME,
          Key: s3Key,
        })
        .promise();

      const imageBuffer = originalObject.Body as Buffer;
      const image = sharp(imageBuffer);
      const metadata = await image.metadata();

      const variants: MediaVariants = {};

      // Generate thumbnail (300px)
      const thumbnailBuffer = await image
        .resize(this.THUMBNAIL_SIZE, this.THUMBNAIL_SIZE, {
          fit: "cover",
          position: "center",
        })
        .jpeg({ quality: this.QUALITY })
        .toBuffer();

      const thumbnailKey = this.generateVariantKey(s3Key, "thumbnail");
      await this.uploadVariant(thumbnailBuffer, thumbnailKey);
      variants.thumbnail = S3Utils.getCloudFrontUrl(thumbnailKey);

      // Generate small size (600px) - for mobile feeds
      if (metadata.width! > this.SMALL_SIZE) {
        const smallBuffer = await image
          .resize(this.SMALL_SIZE, null, {
            fit: "inside",
            withoutEnlargement: true,
          })
          .jpeg({ quality: this.QUALITY })
          .toBuffer();

        const smallKey = this.generateVariantKey(s3Key, "small");
        await this.uploadVariant(smallBuffer, smallKey);
        variants.small = S3Utils.getCloudFrontUrl(smallKey);
      }

      // Generate medium size (1200px) - for tablet/desktop
      if (metadata.width! > this.MEDIUM_SIZE) {
        const mediumBuffer = await image
          .resize(this.MEDIUM_SIZE, null, {
            fit: "inside",
            withoutEnlargement: true,
          })
          .jpeg({ quality: this.QUALITY })
          .toBuffer();

        const mediumKey = this.generateVariantKey(s3Key, "medium");
        await this.uploadVariant(mediumBuffer, mediumKey);
        variants.medium = S3Utils.getCloudFrontUrl(mediumKey);
      }

      // Generate compressed version for original size
      const compressedBuffer = await image
        .jpeg({ quality: this.QUALITY })
        .toBuffer();

      const compressedKey = this.generateVariantKey(s3Key, "compressed");
      await this.uploadVariant(compressedBuffer, compressedKey);
      variants.compressed = S3Utils.getCloudFrontUrl(compressedKey);

      return variants;
    } catch (error) {
      console.error("Image processing error:", error);
      throw new Error("Failed to process image");
    }
  }

  private static generateVariantKey(
    originalKey: string,
    variant: string,
  ): string {
    const pathParts = originalKey.split("/");
    const filename = pathParts.pop()!;
    const directory = pathParts.join("/");
    const ext = path.extname(filename);
    const baseName = path.basename(filename, ext);

    return `${directory}/variants/${baseName}-${variant}${ext}`;
  }

  private static async uploadVariant(
    buffer: Buffer,
    key: string,
  ): Promise<void> {
    await s3
      .upload({
        Bucket: AWS_CONFIG.BUCKET_NAME,
        Key: key,
        Body: buffer,
        ContentType: "image/jpeg",
        ServerSideEncryption: "AES256",
        CacheControl: "max-age=31536000", // 1 year
      })
      .promise();
  }

  // Get image dimensions from S3
  static async getImageDimensions(
    s3Key: string,
  ): Promise<{ width: number; height: number }> {
    try {
      const object = await s3
        .getObject({
          Bucket: AWS_CONFIG.BUCKET_NAME,
          Key: s3Key,
        })
        .promise();

      const buffer = object.Body as Buffer;
      const metadata = await sharp(buffer).metadata();

      return {
        width: metadata.width || 0,
        height: metadata.height || 0,
      };
    } catch (error) {
      console.error("Error getting image dimensions:", error);
      return { width: 0, height: 0 };
    }
  }
}
