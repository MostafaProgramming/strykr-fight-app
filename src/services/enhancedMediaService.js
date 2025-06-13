// src/services/enhancedMediaService.js - OPTIMIZED FOR SOCIAL MEDIA
import {
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject,
  uploadBytesResumable,
  getMetadata,
} from "firebase/storage";
import { storage, db } from "../config/firebase";
import {
  doc,
  updateDoc,
  arrayUnion,
  arrayRemove,
  addDoc,
  collection,
} from "firebase/firestore";
import * as ImagePicker from "expo-image-picker";
import { Alert } from "react-native";
import * as VideoThumbnails from "expo-video-thumbnails";
import * as FileSystem from "expo-file-system";

class EnhancedMediaService {
  constructor() {
    this.maxFileSize = 10 * 1024 * 1024; // 10MB for images
    this.maxVideoSize = 100 * 1024 * 1024; // 100MB for videos
    this.maxVideoDuration = 60; // 60 seconds max
    this.allowedImageTypes = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/heic",
    ];
    this.allowedVideoTypes = ["video/mp4", "video/mov", "video/quicktime"];
  }

  // IMPROVED: Request permissions with better error handling
  async requestPermissions() {
    try {
      const [cameraPermission, mediaPermission] = await Promise.all([
        ImagePicker.requestCameraPermissionsAsync(),
        ImagePicker.requestMediaLibraryPermissionsAsync(),
      ]);

      return {
        success: true,
        hasCamera: cameraPermission.status === "granted",
        hasMediaLibrary: mediaPermission.status === "granted",
        permissions: {
          camera: cameraPermission,
          media: mediaPermission,
        },
      };
    } catch (error) {
      console.error("Error requesting permissions:", error);
      return {
        success: false,
        error: error.message,
        hasCamera: false,
        hasMediaLibrary: false,
      };
    }
  }

  // ENHANCED: Instagram-style media picker
  async pickMedia(options = {}) {
    const {
      allowsEditing = true,
      quality = 0.8,
      aspect = [1, 1], // Square by default like Instagram
      mediaTypes = "mixed", // "photo", "video", "mixed"
    } = options;

    try {
      // Check permissions first
      const permissions = await this.requestPermissions();
      if (!permissions.hasMediaLibrary) {
        throw new Error("Media library permission required");
      }

      let pickerOptions = {
        allowsEditing,
        quality,
        aspect,
      };

      // Set media type
      switch (mediaTypes) {
        case "photo":
          pickerOptions.mediaTypes = ImagePicker.MediaTypeOptions.Images;
          break;
        case "video":
          pickerOptions.mediaTypes = ImagePicker.MediaTypeOptions.Videos;
          pickerOptions.videoMaxDuration = this.maxVideoDuration;
          pickerOptions.videoQuality = ImagePicker.VideoQuality.High;
          break;
        default:
          pickerOptions.mediaTypes = ImagePicker.MediaTypeOptions.All;
          pickerOptions.videoMaxDuration = this.maxVideoDuration;
          pickerOptions.videoQuality = ImagePicker.VideoQuality.High;
      }

      const result = await ImagePicker.launchImageLibraryAsync(pickerOptions);

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const asset = result.assets[0];

        // Validate the selected media
        const validation = await this.validateMedia(asset);
        if (!validation.valid) {
          throw new Error(validation.error);
        }

        return {
          success: true,
          media: {
            ...asset,
            id: Date.now().toString(),
            type: asset.type === "video" ? "video" : "image",
          },
        };
      }

      return { success: false, error: "Selection cancelled" };
    } catch (error) {
      console.error("Error picking media:", error);
      return { success: false, error: error.message };
    }
  }

  // ENHANCED: Camera with video support
  async takeMediaWithCamera(mediaType = "photo") {
    try {
      const permissions = await this.requestPermissions();
      if (!permissions.hasCamera) {
        throw new Error("Camera permission required");
      }

      let cameraOptions = {
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      };

      if (mediaType === "video") {
        cameraOptions.mediaTypes = ImagePicker.MediaTypeOptions.Videos;
        cameraOptions.videoMaxDuration = this.maxVideoDuration;
        cameraOptions.videoQuality = ImagePicker.VideoQuality.High;
      } else {
        cameraOptions.mediaTypes = ImagePicker.MediaTypeOptions.Images;
      }

      const result = await ImagePicker.launchCameraAsync(cameraOptions);

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const asset = result.assets[0];

        const validation = await this.validateMedia(asset);
        if (!validation.valid) {
          throw new Error(validation.error);
        }

        return {
          success: true,
          media: {
            ...asset,
            id: Date.now().toString(),
            type: asset.type === "video" ? "video" : "image",
          },
        };
      }

      return { success: false, error: "Capture cancelled" };
    } catch (error) {
      console.error("Error taking media:", error);
      return { success: false, error: error.message };
    }
  }

  // NEW: Validate media with detailed checks
  async validateMedia(asset) {
    try {
      const { uri, type, fileSize, duration, width, height } = asset;

      // Get file info if size not provided
      let actualFileSize = fileSize;
      if (!actualFileSize) {
        const fileInfo = await FileSystem.getInfoAsync(uri);
        actualFileSize = fileInfo.size;
      }

      // Check file size
      if (type === "video") {
        if (actualFileSize > this.maxVideoSize) {
          return {
            valid: false,
            error: `Video too large. Maximum size is ${this.maxVideoSize / (1024 * 1024)}MB`,
          };
        }

        // Check duration
        if (duration && duration > this.maxVideoDuration * 1000) {
          return {
            valid: false,
            error: `Video too long. Maximum duration is ${this.maxVideoDuration} seconds`,
          };
        }
      } else {
        if (actualFileSize > this.maxFileSize) {
          return {
            valid: false,
            error: `Image too large. Maximum size is ${this.maxFileSize / (1024 * 1024)}MB`,
          };
        }
      }

      // Check dimensions (optional - for very large images)
      if (width > 4096 || height > 4096) {
        return {
          valid: false,
          error: "Image dimensions too large. Maximum 4096x4096 pixels",
        };
      }

      return { valid: true };
    } catch (error) {
      return { valid: false, error: error.message };
    }
  }

  // ENHANCED: Upload to Firebase Storage with progress
  async uploadMedia(media, userId, sessionId, onProgress = null) {
    try {
      const { uri, type, mimeType } = media;

      // Create unique filename
      const timestamp = Date.now();
      const fileExtension = this.getFileExtension(mimeType || type);
      const folder = type === "video" ? "videos" : "images";
      const fileName = `training-media/${folder}/${userId}/${sessionId}/${timestamp}.${fileExtension}`;

      // Create storage reference
      const storageRef = ref(storage, fileName);

      // Convert URI to blob
      const response = await fetch(uri);
      const blob = await response.blob();

      // Create upload task for progress tracking
      const uploadTask = uploadBytesResumable(storageRef, blob);

      return new Promise((resolve, reject) => {
        uploadTask.on(
          "state_changed",
          (snapshot) => {
            // Progress callback
            const progress =
              (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
            if (onProgress) {
              onProgress(progress);
            }
          },
          (error) => {
            console.error("Upload error:", error);
            reject({ success: false, error: error.message });
          },
          async () => {
            try {
              // Get download URL
              const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);

              // Generate thumbnail for videos
              let thumbnailURL = null;
              if (type === "video") {
                thumbnailURL = await this.generateVideoThumbnail(
                  uri,
                  userId,
                  sessionId,
                );
              }

              // Get metadata
              const metadata = await getMetadata(uploadTask.snapshot.ref);

              resolve({
                success: true,
                mediaData: {
                  id: media.id,
                  type,
                  downloadURL,
                  thumbnailURL,
                  fileName,
                  fileSize: metadata.size,
                  mimeType: metadata.contentType,
                  uploadedAt: new Date(),
                  uploadedBy: userId,
                  width: media.width,
                  height: media.height,
                  duration: media.duration,
                },
              });
            } catch (error) {
              reject({ success: false, error: error.message });
            }
          },
        );
      });
    } catch (error) {
      console.error("Error uploading media:", error);
      return { success: false, error: error.message };
    }
  }

  // NEW: Generate video thumbnail
  async generateVideoThumbnail(videoUri, userId, sessionId) {
    try {
      const { uri: thumbnailUri } = await VideoThumbnails.getThumbnailAsync(
        videoUri,
        {
          time: 1000, // 1 second into video
          quality: 0.8,
        },
      );

      // Upload thumbnail to storage
      const timestamp = Date.now();
      const thumbnailFileName = `training-media/thumbnails/${userId}/${sessionId}/${timestamp}.jpg`;
      const thumbnailRef = ref(storage, thumbnailFileName);

      const response = await fetch(thumbnailUri);
      const blob = await response.blob();

      await uploadBytes(thumbnailRef, blob);
      const thumbnailURL = await getDownloadURL(thumbnailRef);

      return thumbnailURL;
    } catch (error) {
      console.error("Error generating thumbnail:", error);
      return null;
    }
  }

  // ENHANCED: Delete media with cleanup
  async deleteMedia(mediaData) {
    try {
      const { fileName, thumbnailURL } = mediaData;

      // Delete main file
      if (fileName) {
        const fileRef = ref(storage, fileName);
        await deleteObject(fileRef);
      }

      // Delete thumbnail if exists
      if (thumbnailURL) {
        try {
          const thumbnailPath = this.extractStoragePathFromURL(thumbnailURL);
          if (thumbnailPath) {
            const thumbnailRef = ref(storage, thumbnailPath);
            await deleteObject(thumbnailRef);
          }
        } catch (error) {
          console.warn("Could not delete thumbnail:", error);
        }
      }

      return { success: true };
    } catch (error) {
      console.error("Error deleting media:", error);
      return { success: false, error: error.message };
    }
  }

  // Helper: Get file extension
  getFileExtension(mimeType) {
    const extensions = {
      "image/jpeg": "jpg",
      "image/jpg": "jpg",
      "image/png": "png",
      "image/heic": "heic",
      "video/mp4": "mp4",
      "video/mov": "mov",
      "video/quicktime": "mov",
    };
    return extensions[mimeType] || "unknown";
  }

  // Helper: Extract storage path from download URL
  extractStoragePathFromURL(downloadURL) {
    try {
      const url = new URL(downloadURL);
      const pathMatch = url.pathname.match(/\/o\/(.*?)\?/);
      return pathMatch ? decodeURIComponent(pathMatch[1]) : null;
    } catch (error) {
      return null;
    }
  }

  // NEW: Compress image for better performance
  async compressImage(uri, quality = 0.8) {
    try {
      // This would use a compression library in a real app
      // For now, we'll use ImagePicker's built-in compression
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: false,
        quality,
      });

      if (!result.canceled) {
        return { success: true, compressedUri: result.assets[0].uri };
      }

      return { success: false, error: "Compression cancelled" };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // NEW: Create media for social feed
  async processMediaForFeed(mediaArray, userId, sessionId, onProgress = null) {
    try {
      const processedMedia = [];
      let totalProgress = 0;

      for (let i = 0; i < mediaArray.length; i++) {
        const media = mediaArray[i];

        const uploadResult = await this.uploadMedia(
          media,
          userId,
          sessionId,
          (progress) => {
            const overallProgress =
              (i / mediaArray.length) * 100 + progress / mediaArray.length;
            if (onProgress) onProgress(overallProgress);
          },
        );

        if (uploadResult.success) {
          processedMedia.push(uploadResult.mediaData);
        } else {
          console.warn(`Failed to upload media ${i}:`, uploadResult.error);
        }

        totalProgress = ((i + 1) / mediaArray.length) * 100;
        if (onProgress) onProgress(totalProgress);
      }

      return {
        success: true,
        processedMedia,
        uploadedCount: processedMedia.length,
        totalCount: mediaArray.length,
      };
    } catch (error) {
      console.error("Error processing media for feed:", error);
      return { success: false, error: error.message };
    }
  }

  // NEW: Get optimized media URL
  getOptimizedMediaURL(originalURL, size = "medium") {
    // Firebase Storage doesn't have built-in optimization
    // In production, you'd use a service like Cloudinary or ImageKit
    const sizeParams = {
      small: "w_300,h_300,c_fill",
      medium: "w_600,h_600,c_fill",
      large: "w_1200,h_1200,c_fill",
    };

    // For now, return original URL
    // TODO: Implement image optimization service
    return originalURL;
  }

  // NEW: Batch upload with retry logic
  async batchUploadWithRetry(mediaArray, userId, sessionId, maxRetries = 3) {
    const results = [];

    for (const media of mediaArray) {
      let attempt = 0;
      let success = false;

      while (attempt < maxRetries && !success) {
        try {
          const result = await this.uploadMedia(media, userId, sessionId);
          if (result.success) {
            results.push(result.mediaData);
            success = true;
          } else {
            attempt++;
            if (attempt < maxRetries) {
              // Wait before retry
              await new Promise((resolve) =>
                setTimeout(resolve, 1000 * attempt),
              );
            }
          }
        } catch (error) {
          attempt++;
          if (attempt >= maxRetries) {
            console.error(
              `Failed to upload media after ${maxRetries} attempts:`,
              error,
            );
          }
        }
      }
    }

    return {
      success: results.length > 0,
      uploadedMedia: results,
      uploadedCount: results.length,
      totalCount: mediaArray.length,
    };
  }
}

export default new EnhancedMediaService();
