// src/services/mediaService.js - FIXED PERMISSION HANDLING
import {
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject,
} from "firebase/storage";
import { storage, db } from "../config/firebase";
import { doc, updateDoc, arrayUnion, arrayRemove } from "firebase/firestore";
import * as ImagePicker from "expo-image-picker";
import { Alert } from "react-native";

class MediaService {
  constructor() {
    this.maxFileSize = 10 * 1024 * 1024; // 10MB limit
    this.maxVideoSize = 50 * 1024 * 1024; // 50MB for videos
    this.allowedImageTypes = ["image/jpeg", "image/jpg", "image/png"];
    this.allowedVideoTypes = ["video/mp4", "video/mov"];
  }

  // IMPROVED: More reliable permission checking
  async requestPermissions() {
    try {
      console.log("Requesting permissions...");

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
        cameraStatus: cameraPermission.status,
        mediaStatus: mediaPermission.status,
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

  // FIXED: Better permission handling for image picker
  async pickImage(allowsEditing = true) {
    try {
      console.log("Starting image picker...");

      // First check current permissions
      const cameraPermission = await ImagePicker.getCameraPermissionsAsync();
      const mediaPermission =
        await ImagePicker.getMediaLibraryPermissionsAsync();

      console.log("Current camera permission:", cameraPermission.status);
      console.log("Current media permission:", mediaPermission.status);

      return new Promise((resolve) => {
        Alert.alert(
          "Add Photo",
          "Choose how you'd like to add a photo to your training session",
          [
            {
              text: "Camera",
              onPress: async () => {
                try {
                  console.log("Camera option selected");

                  // Request camera permission if needed
                  let permission =
                    await ImagePicker.getCameraPermissionsAsync();
                  if (permission.status !== "granted") {
                    console.log("Requesting camera permission...");
                    permission =
                      await ImagePicker.requestCameraPermissionsAsync();
                  }

                  if (permission.status !== "granted") {
                    Alert.alert(
                      "Camera Permission Required",
                      "Please enable camera access in your device settings to take photos.",
                      [
                        { text: "Cancel", style: "cancel" },
                        {
                          text: "Settings",
                          onPress: () => {
                            // In a real app, you'd open device settings
                            console.log("Open settings");
                          },
                        },
                      ],
                    );
                    resolve({
                      success: false,
                      error: "Camera permission denied",
                    });
                    return;
                  }

                  console.log("Launching camera...");
                  const result = await ImagePicker.launchCameraAsync({
                    mediaTypes: ImagePicker.MediaTypeOptions.Images,
                    allowsEditing,
                    aspect: [4, 3],
                    quality: 0.8,
                  });

                  console.log("Camera result:", result);

                  if (
                    !result.canceled &&
                    result.assets &&
                    result.assets.length > 0
                  ) {
                    resolve({ success: true, image: result.assets[0] });
                  } else {
                    resolve({ success: false, error: "Cancelled" });
                  }
                } catch (error) {
                  console.error("Camera error:", error);
                  resolve({ success: false, error: error.message });
                }
              },
            },
            {
              text: "Photo Library",
              onPress: async () => {
                try {
                  console.log("Photo library option selected");

                  // Request media library permission if needed
                  let permission =
                    await ImagePicker.getMediaLibraryPermissionsAsync();
                  if (permission.status !== "granted") {
                    console.log("Requesting media library permission...");
                    permission =
                      await ImagePicker.requestMediaLibraryPermissionsAsync();
                  }

                  if (permission.status !== "granted") {
                    Alert.alert(
                      "Photo Library Permission Required",
                      "Please enable photo library access in your device settings to select photos.",
                      [
                        { text: "Cancel", style: "cancel" },
                        {
                          text: "Settings",
                          onPress: () => {
                            // In a real app, you'd open device settings
                            console.log("Open settings");
                          },
                        },
                      ],
                    );
                    resolve({
                      success: false,
                      error: "Photo library permission denied",
                    });
                    return;
                  }

                  console.log("Launching image library...");
                  const result = await ImagePicker.launchImageLibraryAsync({
                    mediaTypes: ImagePicker.MediaTypeOptions.Images,
                    allowsEditing,
                    aspect: [4, 3],
                    quality: 0.8,
                  });

                  console.log("Library result:", result);

                  if (
                    !result.canceled &&
                    result.assets &&
                    result.assets.length > 0
                  ) {
                    resolve({ success: true, image: result.assets[0] });
                  } else {
                    resolve({ success: false, error: "Cancelled" });
                  }
                } catch (error) {
                  console.error("Library error:", error);
                  resolve({ success: false, error: error.message });
                }
              },
            },
            {
              text: "Cancel",
              style: "cancel",
              onPress: () => resolve({ success: false, error: "Cancelled" }),
            },
          ],
          {
            cancelable: true,
            onDismiss: () => resolve({ success: false, error: "Cancelled" }),
          },
        );
      });
    } catch (error) {
      console.error("Error in pickImage:", error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  // FIXED: Better permission handling for video picker
  async pickVideo() {
    try {
      console.log("Starting video picker...");

      return new Promise((resolve) => {
        Alert.alert(
          "Add Video",
          "Record or select a video (max 30 seconds)",
          [
            {
              text: "Record Video",
              onPress: async () => {
                try {
                  console.log("Record video option selected");

                  // Request camera permission
                  let permission =
                    await ImagePicker.getCameraPermissionsAsync();
                  if (permission.status !== "granted") {
                    permission =
                      await ImagePicker.requestCameraPermissionsAsync();
                  }

                  if (permission.status !== "granted") {
                    Alert.alert(
                      "Error",
                      "Camera permission is required to record videos",
                    );
                    resolve({
                      success: false,
                      error: "Camera permission denied",
                    });
                    return;
                  }

                  const result = await ImagePicker.launchCameraAsync({
                    mediaTypes: ImagePicker.MediaTypeOptions.Videos,
                    allowsEditing: true,
                    videoMaxDuration: 30,
                    videoQuality: ImagePicker.VideoQuality.Medium,
                  });

                  if (
                    !result.canceled &&
                    result.assets &&
                    result.assets.length > 0
                  ) {
                    resolve({ success: true, video: result.assets[0] });
                  } else {
                    resolve({ success: false, error: "Cancelled" });
                  }
                } catch (error) {
                  console.error("Record video error:", error);
                  resolve({ success: false, error: error.message });
                }
              },
            },
            {
              text: "Video Library",
              onPress: async () => {
                try {
                  console.log("Video library option selected");

                  // Request media library permission
                  let permission =
                    await ImagePicker.getMediaLibraryPermissionsAsync();
                  if (permission.status !== "granted") {
                    permission =
                      await ImagePicker.requestMediaLibraryPermissionsAsync();
                  }

                  if (permission.status !== "granted") {
                    Alert.alert(
                      "Error",
                      "Photo library permission is required to select videos",
                    );
                    resolve({
                      success: false,
                      error: "Media library permission denied",
                    });
                    return;
                  }

                  const result = await ImagePicker.launchImageLibraryAsync({
                    mediaTypes: ImagePicker.MediaTypeOptions.Videos,
                    allowsEditing: true,
                    videoMaxDuration: 30,
                    videoQuality: ImagePicker.VideoQuality.Medium,
                  });

                  if (
                    !result.canceled &&
                    result.assets &&
                    result.assets.length > 0
                  ) {
                    resolve({ success: true, video: result.assets[0] });
                  } else {
                    resolve({ success: false, error: "Cancelled" });
                  }
                } catch (error) {
                  console.error("Video library error:", error);
                  resolve({ success: false, error: error.message });
                }
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
    } catch (error) {
      console.error("Error in pickVideo:", error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  // SIMPLIFIED: Direct picker methods without permission pre-checks
  async pickImageDirect(allowsEditing = true) {
    try {
      console.log("Direct image picker");

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        return { success: true, image: result.assets[0] };
      } else {
        return { success: false, error: "Cancelled" };
      }
    } catch (error) {
      console.error("Direct image picker error:", error);
      return { success: false, error: error.message };
    }
  }

  async takeCameraDirect(allowsEditing = true) {
    try {
      console.log("Direct camera");

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        return { success: true, image: result.assets[0] };
      } else {
        return { success: false, error: "Cancelled" };
      }
    } catch (error) {
      console.error("Direct camera error:", error);
      return { success: false, error: error.message };
    }
  }

  // Validate file before upload
  validateFile(fileUri, fileType, fileSize) {
    // Check file size
    if (fileType.startsWith("image/") && fileSize > this.maxFileSize) {
      return {
        valid: false,
        error: `Image too large. Maximum size is ${this.maxFileSize / (1024 * 1024)}MB`,
      };
    }

    if (fileType.startsWith("video/") && fileSize > this.maxVideoSize) {
      return {
        valid: false,
        error: `Video too large. Maximum size is ${this.maxVideoSize / (1024 * 1024)}MB`,
      };
    }

    // Check file type
    if (
      fileType.startsWith("image/") &&
      !this.allowedImageTypes.includes(fileType)
    ) {
      return {
        valid: false,
        error: "Invalid image format. Please use JPEG or PNG",
      };
    }

    if (
      fileType.startsWith("video/") &&
      !this.allowedVideoTypes.includes(fileType)
    ) {
      return {
        valid: false,
        error: "Invalid video format. Please use MP4 or MOV",
      };
    }

    return { valid: true };
  }

  // Upload file to Firebase Storage
  async uploadFile(fileUri, userId, sessionId, fileType) {
    try {
      const response = await fetch(fileUri);
      const blob = await response.blob();

      // Validate file
      const validation = this.validateFile(fileUri, blob.type, blob.size);
      if (!validation.valid) {
        return {
          success: false,
          error: validation.error,
        };
      }

      // Create unique filename
      const timestamp = Date.now();
      const fileExtension = blob.type.split("/")[1];
      const fileName = `${userId}/${sessionId}/${timestamp}.${fileExtension}`;

      // Create storage reference
      const storageRef = ref(storage, `training-media/${fileName}`);

      // Upload file
      const snapshot = await uploadBytes(storageRef, blob);

      // Get download URL
      const downloadURL = await getDownloadURL(snapshot.ref);

      return {
        success: true,
        downloadURL,
        fileName,
        fileType: blob.type,
        fileSize: blob.size,
      };
    } catch (error) {
      console.error("Error uploading file:", error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  // Delete file from Firebase Storage
  async deleteFile(fileName) {
    try {
      const storageRef = ref(storage, `training-media/${fileName}`);
      await deleteObject(storageRef);

      return {
        success: true,
        message: "File deleted successfully",
      };
    } catch (error) {
      console.error("Error deleting file:", error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  // Add media to training session
  async addMediaToSession(sessionId, mediaData) {
    try {
      const sessionRef = doc(db, "trainingSessions", sessionId);

      await updateDoc(sessionRef, {
        media: arrayUnion(mediaData),
        updatedAt: new Date(),
      });

      return {
        success: true,
        message: "Media added to session",
      };
    } catch (error) {
      console.error("Error adding media to session:", error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  // Remove media from training session
  async removeMediaFromSession(sessionId, mediaData) {
    try {
      const sessionRef = doc(db, "trainingSessions", sessionId);

      await updateDoc(sessionRef, {
        media: arrayRemove(mediaData),
        updatedAt: new Date(),
      });

      // Also delete the file from storage
      if (mediaData.fileName) {
        await this.deleteFile(mediaData.fileName);
      }

      return {
        success: true,
        message: "Media removed from session",
      };
    } catch (error) {
      console.error("Error removing media from session:", error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  // Get optimized image URL for thumbnails
  getOptimizedImageUrl(originalUrl, size = "medium") {
    // Firebase Storage doesn't have built-in image optimization
    // For now, return original URL
    // In production, you might want to use a service like Cloudinary
    return originalUrl;
  }

  // Generate video thumbnail (placeholder - would need additional setup)
  generateVideoThumbnail(videoUrl) {
    // This would require additional video processing
    // For now, return a placeholder
    return "https://via.placeholder.com/300x200?text=Video";
  }

  // Get media statistics for a user
  async getUserMediaStats(userId) {
    try {
      // This would require querying sessions with media
      // For now, return placeholder stats
      return {
        success: true,
        stats: {
          totalPhotos: 0,
          totalVideos: 0,
          totalStorageUsed: 0, // in bytes
          recentMedia: [],
        },
      };
    } catch (error) {
      console.error("Error getting media stats:", error);
      return {
        success: false,
        error: error.message,
      };
    }
  }
}

export default new MediaService();
