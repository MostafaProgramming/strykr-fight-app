// =============================================
// 🎥 src/utils/video.utils.ts
// =============================================

import ffmpeg from "fluent-ffmpeg";
import ffmpegPath from "ffmpeg-static";
import { s3, mediaConvert, AWS_CONFIG } from "../config/aws";
import { S3Utils } from "./s3.utils";
import { v4 as uuidv4 } from "uuid";

// Set ffmpeg path
ffmpeg.setFfmpegPath(ffmpegPath!);

export class VideoUtils {
  private static THUMBNAIL_WIDTH = 480;
  private static COMPRESSED_BITRATE = "1000k";
  private static MAX_DURATION = 300; // 5 minutes

  // Process uploaded video
  static async processVideo(s3Key: string): Promise<MediaVariants> {
    try {
      const variants: MediaVariants = {};

      // Create MediaConvert job for video processing
      const jobId = await this.createMediaConvertJob(s3Key);

      // Generate thumbnail from video
      const thumbnailKey = await this.generateVideoThumbnail(s3Key);
      if (thumbnailKey) {
        variants.thumbnail = S3Utils.getCloudFrontUrl(thumbnailKey);
      }

      return variants;
    } catch (error) {
      console.error("Video processing error:", error);
      throw new Error("Failed to process video");
    }
  }

  // Create AWS MediaConvert job
  private static async createMediaConvertJob(
    inputKey: string,
  ): Promise<string> {
    const jobId = uuidv4();
    const inputS3Uri = `s3://${AWS_CONFIG.BUCKET_NAME}/${inputKey}`;
    const outputKeyPrefix = inputKey.replace(/\.[^/.]+$/, ""); // Remove extension

    const jobParams = {
      Role: process.env.AWS_MEDIACONVERT_ROLE!,
      Settings: {
        Inputs: [
          {
            FileInput: inputS3Uri,
            AudioSelectors: {
              "Audio Selector 1": {
                DefaultSelection: "DEFAULT",
              },
            },
            VideoSelector: {},
          },
        ],
        OutputGroups: [
          {
            Name: "File Group",
            OutputGroupSettings: {
              Type: "FILE_GROUP_SETTINGS",
              FileGroupSettings: {
                Destination: `s3://${AWS_CONFIG.BUCKET_NAME}/${outputKeyPrefix}-processed/`,
              },
            },
            Outputs: [
              {
                // Mobile quality (480p)
                NameModifier: "-mobile",
                VideoDescription: {
                  Width: 854,
                  Height: 480,
                  CodecSettings: {
                    Codec: "H_264",
                    H264Settings: {
                      Bitrate: 1000000,
                      RateControlMode: "CBR",
                    },
                  },
                },
                AudioDescriptions: [
                  {
                    CodecSettings: {
                      Codec: "AAC",
                      AacSettings: {
                        Bitrate: 128000,
                        SampleRate: 44100,
                      },
                    },
                  },
                ],
                ContainerSettings: {
                  Container: "MP4",
                  Mp4Settings: {},
                },
              },
              {
                // HD quality (720p)
                NameModifier: "-hd",
                VideoDescription: {
                  Width: 1280,
                  Height: 720,
                  CodecSettings: {
                    Codec: "H_264",
                    H264Settings: {
                      Bitrate: 2500000,
                      RateControlMode: "CBR",
                    },
                  },
                },
                AudioDescriptions: [
                  {
                    CodecSettings: {
                      Codec: "AAC",
                      AacSettings: {
                        Bitrate: 128000,
                        SampleRate: 44100,
                      },
                    },
                  },
                ],
                ContainerSettings: {
                  Container: "MP4",
                  Mp4Settings: {},
                },
              },
            ],
          },
        ],
      },
      Queue: process.env.AWS_MEDIACONVERT_QUEUE,
      UserMetadata: {
        jobId,
        originalKey: inputKey,
      },
    };

    const job = await mediaConvert.createJob(jobParams).promise();
    return job.Job!.Id!;
  }

  // Generate thumbnail from video
  private static async generateVideoThumbnail(
    s3Key: string,
  ): Promise<string | null> {
    try {
      // Download video from S3 to temp location
      const tempVideoPath = `/tmp/${Date.now()}-video.mp4`;
      const tempThumbnailPath = `/tmp/${Date.now()}-thumb.jpg`;

      // Download video
      const videoObject = await s3
        .getObject({
          Bucket: AWS_CONFIG.BUCKET_NAME,
          Key: s3Key,
        })
        .promise();

      const fs = require("fs");
      fs.writeFileSync(tempVideoPath, videoObject.Body);

      // Generate thumbnail using ffmpeg
      await new Promise((resolve, reject) => {
        ffmpeg(tempVideoPath)
          .screenshots({
            timestamps: ["00:00:01.000"],
            filename: "thumb.jpg",
            folder: "/tmp",
            size: `${this.THUMBNAIL_WIDTH}x?`,
          })
          .on("end", resolve)
          .on("error", reject);
      });

      // Upload thumbnail to S3
      const thumbnailBuffer = fs.readFileSync(tempThumbnailPath);
      const thumbnailKey = this.generateThumbnailKey(s3Key);

      await s3
        .upload({
          Bucket: AWS_CONFIG.BUCKET_NAME,
          Key: thumbnailKey,
          Body: thumbnailBuffer,
          ContentType: "image/jpeg",
          ServerSideEncryption: "AES256",
        })
        .promise();

      // Clean up temp files
      fs.unlinkSync(tempVideoPath);
      fs.unlinkSync(tempThumbnailPath);

      return thumbnailKey;
    } catch (error) {
      console.error("Thumbnail generation error:", error);
      return null;
    }
  }

  private static generateThumbnailKey(videoKey: string): string {
    const pathParts = videoKey.split("/");
    const filename = pathParts.pop()!;
    const directory = pathParts.join("/");
    const baseName = path.basename(filename, path.extname(filename));

    return `${directory}/thumbnails/${baseName}-thumb.jpg`;
  }

  // Get video metadata
  static async getVideoMetadata(
    s3Key: string,
  ): Promise<{ duration: number; width: number; height: number }> {
    try {
      const tempVideoPath = `/tmp/${Date.now()}-video.mp4`;

      const videoObject = await s3
        .getObject({
          Bucket: AWS_CONFIG.BUCKET_NAME,
          Key: s3Key,
        })
        .promise();

      const fs = require("fs");
      fs.writeFileSync(tempVideoPath, videoObject.Body);

      const metadata = await new Promise<any>((resolve, reject) => {
        ffmpeg.ffprobe(tempVideoPath, (err, metadata) => {
          if (err) reject(err);
          else resolve(metadata);
        });
      });

      const videoStream = metadata.streams.find(
        (s: any) => s.codec_type === "video",
      );

      // Clean up
      fs.unlinkSync(tempVideoPath);

      return {
        duration: parseFloat(metadata.format.duration) || 0,
        width: videoStream?.width || 0,
        height: videoStream?.height || 0,
      };
    } catch (error) {
      console.error("Error getting video metadata:", error);
      return { duration: 0, width: 0, height: 0 };
    }
  }
}
