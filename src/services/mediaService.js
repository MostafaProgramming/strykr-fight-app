// src/services/workingMediaService.js - HEAVY APP STYLE MEDIA HANDLING
import {
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject,
} from "firebase/storage";
import { storage } from "../config/firebase";
import * as ImagePicker from "expo-image-picker";
import { Alert } from "react-native";

class mediaService {
  constructor() {
    this.maxFileSize = 10 * 1024 * 1024; // 10MB for images
    this.maxVideoSize = 100 * 1024 * 1024; // 100MB for videos
    this.maxVideoDuration = 60; // 60 seconds max
  }

  // FIXED: Request permissions properly
  async requestPermissions() {
    try {
      console.log("Requesting media permissions...");

      const cameraPermission =
        await ImagePicker.requestCameraPermissionsAsync();
      const mediaPermission =
        await ImagePicker.requestMediaLibraryPermissionsAsync();

      console.log("Camera permission:", cameraPermission.status);
      console.log("Media permission:", mediaPermission.status);

      return {
        success: true,
        hasCamera: cameraPermission.status === "granted",
        hasMediaLibrary: mediaPermission.status === "granted",
      };
    } catch (error) {
      console.error("Permission request error:", error);
      return {
        success: false,
        error: error.message,
        hasCamera: false,
        hasMediaLibrary: false,
      };
    }
  }

  // HEAVY STYLE: Pick image from library
  async pickImageFromLibrary() {
    try {
      console.log("🖼️ Opening image library...");

      const permissions = await this.requestPermissions();
      if (!permissions.hasMediaLibrary) {
        Alert.alert(
          "Permission Required",
          "Please allow access to your photo library to share training photos",
          [
            { text: "Cancel", style: "cancel" },
            { text: "Settings", onPress: () => console.log("Open settings") },
          ],
        );
        return { success: false, error: "Media library permission denied" };
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1], // Square like Heavy app
        quality: 0.8,
        allowsMultipleSelection: false,
      });

      console.log("Library result:", result);

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const asset = result.assets[0];
        return {
          success: true,
          media: {
            id: Date.now().toString(),
            uri: asset.uri,
            type: "image",
            width: asset.width,
            height: asset.height,
            fileSize: asset.fileSize,
          },
        };
      }

      return { success: false, error: "Selection cancelled" };
    } catch (error) {
      console.error("Error picking image:", error);
      return { success: false, error: error.message };
    }
  }

  // HEAVY STYLE: Take photo with camera
  async takePhotoWithCamera() {
    try {
      console.log("📸 Opening camera...");

      const permissions = await this.requestPermissions();
      if (!permissions.hasCamera) {
        Alert.alert(
          "Permission Required",
          "Please allow camera access to take training photos",
          [
            { text: "Cancel", style: "cancel" },
            { text: "Settings", onPress: () => console.log("Open settings") },
          ],
        );
        return { success: false, error: "Camera permission denied" };
      }

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1], // Square format
        quality: 0.8,
      });

      console.log("Camera result:", result);

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const asset = result.assets[0];
        return {
          success: true,
          media: {
            id: Date.now().toString(),
            uri: asset.uri,
            type: "image",
            width: asset.width,
            height: asset.height,
            fileSize: asset.fileSize,
          },
        };
      }

      return { success: false, error: "Capture cancelled" };
    } catch (error) {
      console.error("Error taking photo:", error);
      return { success: false, error: error.message };
    }
  }

  // HEAVY STYLE: Record video
  async recordVideoWithCamera() {
    try {
      console.log("🎥 Opening camera for video...");

      const permissions = await this.requestPermissions();
      if (!permissions.hasCamera) {
        Alert.alert(
          "Permission Required",
          "Please allow camera access to record training videos",
        );
        return { success: false, error: "Camera permission denied" };
      }

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Videos,
        allowsEditing: true,
        videoMaxDuration: this.maxVideoDuration,
        videoQuality: ImagePicker.VideoQuality.High,
      });

      console.log("Video result:", result);

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const asset = result.assets[0];
        return {
          success: true,
          media: {
            id: Date.now().toString(),
            uri: asset.uri,
            type: "video",
            width: asset.width,
            height: asset.height,
            duration: asset.duration,
            fileSize: asset.fileSize,
          },
        };
      }

      return { success: false, error: "Recording cancelled" };
    } catch (error) {
      console.error("Error recording video:", error);
      return { success: false, error: error.message };
    }
  }

  // HEAVY STYLE: Show media picker options
  async showMediaPicker() {
    return new Promise((resolve) => {
      Alert.alert(
        "Add Media to Your Training",
        "Share your workout with the community",
        [
          {
            text: "📸 Take Photo",
            onPress: async () => {
              const result = await this.takePhotoWithCamera();
              resolve(result);
            },
          },
          {
            text: "🎥 Record Video",
            onPress: async () => {
              const result = await this.recordVideoWithCamera();
              resolve(result);
            },
          },
          {
            text: "📱 Choose from Library",
            onPress: async () => {
              const result = await this.pickImageFromLibrary();
              resolve(result);
            },
          },
          {
            text: "Cancel",
            style: "cancel",
            onPress: () => resolve({ success: false, error: "Cancelled" }),
          },
        ],
        { cancelable: true },
      );
    });
  }

  // FIXED: Firebase Storage upload with proper error handling
  async uploadToFirebaseStorage(media, userId, sessionId) {
    try {
      console.log("🔥 Starting Firebase Storage upload...");
      console.log("Media URI:", media.uri);
      console.log("User ID:", userId);
      console.log("Session ID:", sessionId);

      // Validate inputs
      if (!media.uri) {
        throw new Error("No media URI provided");
      }
      if (!userId) {
        throw new Error("No user ID provided");
      }
      if (!sessionId) {
        throw new Error("No session ID provided");
      }

      // Get the file as blob
      console.log("Fetching file from URI...");
      const response = await fetch(media.uri);
      if (!response.ok) {
        throw new Error(`Failed to fetch file: ${response.status}`);
      }

      const blob = await response.blob();
      console.log("Blob created:", {
        size: blob.size,
        type: blob.type,
      });

      // Validate file size
      if (media.type === "image" && blob.size > this.maxFileSize) {
        throw new Error(
          `Image too large: ${(blob.size / (1024 * 1024)).toFixed(1)}MB (max: ${this.maxFileSize / (1024 * 1024)}MB)`,
        );
      }
      if (media.type === "video" && blob.size > this.maxVideoSize) {
        throw new Error(
          `Video too large: ${(blob.size / (1024 * 1024)).toFixed(1)}MB (max: ${this.maxVideoSize / (1024 * 1024)}MB)`,
        );
      }

      // Create unique filename
      const timestamp = Date.now();
      const fileExtension = this.getFileExtension(blob.type);
      const mediaType = media.type === "video" ? "videos" : "images";
      const fileName = `training-media/${mediaType}/${userId}/${sessionId}/${timestamp}.${fileExtension}`;

      console.log("Upload path:", fileName);

      // Create storage reference
      const storageRef = ref(storage, fileName);

      // Upload file
      console.log("Uploading to Firebase Storage...");
      const uploadResult = await uploadBytes(storageRef, blob);
      console.log("Upload successful!");

      // Get download URL
      console.log("Getting download URL...");
      const downloadURL = await getDownloadURL(uploadResult.ref);
      console.log("Download URL obtained:", downloadURL);

      const mediaData = {
        id: media.id,
        type: media.type,
        downloadURL,
        fileName,
        fileSize: blob.size,
        mimeType: blob.type,
        uploadedAt: new Date(),
        uploadedBy: userId,
        width: media.width,
        height: media.height,
        duration: media.duration,
      };

      console.log("✅ Upload completed successfully!");
      return {
        success: true,
        mediaData,
      };
    } catch (error) {
      console.error("❌ Firebase upload error:", error);
      return {
        success: false,
        error: error.message,
        details: {
          code: error.code,
          message: error.message,
          stack: error.stack,
        },
      };
    }
  }

  // HEAVY STYLE: Process multiple media files for feed
  async processMediaForFeed(mediaArray, userId, sessionId, onProgress = null) {
    try {
      console.log(`🔄 Processing ${mediaArray.length} media files for feed...`);

      if (!mediaArray || mediaArray.length === 0) {
        return {
          success: true,
          processedMedia: [],
          uploadedCount: 0,
          totalCount: 0,
        };
      }

      const processedMedia = [];
      let successCount = 0;

      for (let i = 0; i < mediaArray.length; i++) {
        const media = mediaArray[i];
        console.log(`📤 Uploading media ${i + 1}/${mediaArray.length}...`);

        if (onProgress) {
          onProgress((i / mediaArray.length) * 100);
        }

        const uploadResult = await this.uploadToFirebaseStorage(
          media,
          userId,
          sessionId,
        );

        if (uploadResult.success) {
          processedMedia.push(uploadResult.mediaData);
          successCount++;
          console.log(`✅ Successfully uploaded media ${i + 1}`);
        } else {
          console.warn(
            `❌ Failed to upload media ${i + 1}:`,
            uploadResult.error,
          );
          // Continue with other files even if one fails
        }
      }

      if (onProgress) {
        onProgress(100);
      }

      console.log(
        `🎉 Processing complete: ${successCount}/${mediaArray.length} files uploaded`,
      );

      return {
        success: successCount > 0,
        processedMedia,
        uploadedCount: successCount,
        totalCount: mediaArray.length,
        errors:
          successCount < mediaArray.length
            ? `${mediaArray.length - successCount} files failed to upload`
            : null,
      };
    } catch (error) {
      console.error("Error processing media for feed:", error);
      return {
        success: false,
        error: error.message,
        processedMedia: [],
        uploadedCount: 0,
        totalCount: mediaArray.length,
      };
    }
  }

  // Helper: Get file extension from mime type
  getFileExtension(mimeType) {
    const extensions = {
      "image/jpeg": "jpg",
      "image/jpg": "jpg",
      "image/png": "png",
      "image/heic": "heic",
      "image/webp": "webp",
      "video/mp4": "mp4",
      "video/mov": "mov",
      "video/quicktime": "mov",
      "video/3gpp": "3gp",
    };
    return extensions[mimeType] || "jpg";
  }

  // Delete media from Firebase Storage
  async deleteMedia(fileName) {
    try {
      console.log("🗑️ Deleting media:", fileName);
      const storageRef = ref(storage, fileName);
      await deleteObject(storageRef);
      console.log("✅ Media deleted successfully");
      return { success: true };
    } catch (error) {
      console.error("❌ Error deleting media:", error);
      return { success: false, error: error.message };
    }
  }

  // HEAVY STYLE: Validate media before upload
  validateMedia(media) {
    if (!media || !media.uri) {
      return { valid: false, error: "No media selected" };
    }

    if (media.type === "image") {
      if (media.fileSize && media.fileSize > this.maxFileSize) {
        return {
          valid: false,
          error: `Image too large (${(media.fileSize / (1024 * 1024)).toFixed(1)}MB). Max size: ${this.maxFileSize / (1024 * 1024)}MB`,
        };
      }
    }

    if (media.type === "video") {
      if (media.fileSize && media.fileSize > this.maxVideoSize) {
        return {
          valid: false,
          error: `Video too large (${(media.fileSize / (1024 * 1024)).toFixed(1)}MB). Max size: ${this.maxVideoSize / (1024 * 1024)}MB`,
        };
      }

      if (media.duration && media.duration > this.maxVideoDuration * 1000) {
        return {
          valid: false,
          error: `Video too long (${Math.round(media.duration / 1000)}s). Max duration: ${this.maxVideoDuration}s`,
        };
      }
    }

    return { valid: true };
  }
}

export default new mediaService();
