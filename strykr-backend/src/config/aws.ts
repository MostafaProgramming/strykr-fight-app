// =============================================
// 🔧 src/config/aws.ts
// =============================================

import AWS from "aws-sdk";

// Configure AWS SDK
AWS.config.update({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION || "us-east-1",
});

export const s3 = new AWS.S3({
  signatureVersion: "v4",
});

export const mediaConvert = new AWS.MediaConvert({
  endpoint: process.env.AWS_MEDIACONVERT_ENDPOINT,
});

export const ses = new AWS.SES();

export const AWS_CONFIG = {
  BUCKET_NAME: process.env.AWS_S3_BUCKET || "fighttracker-media",
  CLOUDFRONT_DOMAIN: process.env.AWS_CLOUDFRONT_DOMAIN,
  REGION: process.env.AWS_REGION || "us-east-1",
  MAX_FILE_SIZE: {
    IMAGE: 10 * 1024 * 1024, // 10MB
    VIDEO: 100 * 1024 * 1024, // 100MB
    AUDIO: 20 * 1024 * 1024, // 20MB
  },
  ALLOWED_MIME_TYPES: {
    IMAGE: ["image/jpeg", "image/jpg", "image/png", "image/gif", "image/webp"],
    VIDEO: ["video/mp4", "video/mov", "video/avi", "video/quicktime"],
    AUDIO: ["audio/mpeg", "audio/wav", "audio/mp3"],
  },
  UPLOAD_EXPIRY: 300, // 5 minutes for presigned URLs
};
