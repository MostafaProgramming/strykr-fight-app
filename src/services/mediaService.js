// src/services/mediaService.js
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

  // Request camera and media library permissions
  async requestPermissions() {
    try {
      const cameraPermission =
        await ImagePicker.requestCameraPermissionsAsync();
      const mediaPermission =
        await ImagePicker.requestMediaLibraryPermissionsAsync();

      return {
        success: true,
        hasCamera: cameraPermission.status === "granted",
        hasMediaLibrary: mediaPermission.status === "granted",
      };
    } catch (error) {
      console.error("Error requesting permissions:", error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  // Show image picker options
  async pickImage(allowsEditing = true) {
    try {
      const permissions = await this.requestPermissions();

      if (!permissions.hasMediaLibrary && !permissions.hasCamera) {
        Alert.alert(
          "Permissions Required",
          "Please enable camera and photo library permissions in your device settings to upload photos.",
        );
        return { success: false, error: "Permissions not granted" };
      }

      return new Promise((resolve) => {
        Alert.alert(
          "Add Photo",
          "Choose how you'd like to add a photo to your training session",
          [
            {
              text: "Camera",
              onPress: async () => {
                if (!permissions.hasCamera) {
                  Alert.alert("Error", "Camera permission not granted");
                  resolve({
                    success: false,
                    error: "Camera permission denied",
                  });
                  return;
                }

                const result = await ImagePicker.launchCameraAsync({
                  mediaTypes: ImagePicker.MediaTypeOptions.Images,
                  allowsEditing,
                  aspect: [4, 3],
                  quality: 0.8,
                });

                if (!result.canceled) {
                  resolve({ success: true, image: result.assets[0] });
                } else {
                  resolve({ success: false, error: "Cancelled" });
                }
              },
            },
            {
              text: "Photo Library",
              onPress: async () => {
                if (!permissions.hasMediaLibrary) {
                  Alert.alert("Error", "Photo library permission not granted");
                  resolve({
                    success: false,
                    error: "Photo library permission denied",
                  });
                  return;
                }

                const result = await ImagePicker.launchImageLibraryAsync({
                  mediaTypes: ImagePicker.MediaTypeOptions.Images,
                  allowsEditing,
                  aspect: [4, 3],
                  quality: 0.8,
                });

                if (!result.canceled) {
                  resolve({ success: true, image: result.assets[0] });
                } else {
                  resolve({ success: false, error: "Cancelled" });
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
      console.error("Error picking image:", error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  // Show video picker options
  async pickVideo() {
    try {
      const permissions = await this.requestPermissions();

      if (!permissions.hasMediaLibrary && !permissions.hasCamera) {
        Alert.alert(
          "Permissions Required",
          "Please enable camera and photo library permissions in your device settings.",
        );
        return { success: false, error: "Permissions not granted" };
      }

      return new Promise((resolve) => {
        Alert.alert(
          "Add Video",
          "Record or select a video (max 30 seconds)",
          [
            {
              text: "Record Video",
              onPress: async () => {
                if (!permissions.hasCamera) {
                  Alert.alert("Error", "Camera permission not granted");
                  resolve({
                    success: false,
                    error: "Camera permission denied",
                  });
                  return;
                }

                const result = await ImagePicker.launchCameraAsync({
                  mediaTypes: ImagePicker.MediaTypeOptions.Videos,
                  allowsEditing: true,
                  videoMaxDuration: 30, // 30 seconds max
                  videoQuality: ImagePicker.VideoQuality.Medium,
                });

                if (!result.canceled) {
                  resolve({ success: true, video: result.assets[0] });
                } else {
                  resolve({ success: false, error: "Cancelled" });
                }
              },
            },
            {
              text: "Video Library",
              onPress: async () => {
                if (!permissions.hasMediaLibrary) {
                  Alert.alert("Error", "Photo library permission not granted");
                  resolve({
                    success: false,
                    error: "Photo library permission denied",
                  });
                  return;
                }

                const result = await ImagePicker.launchImageLibraryAsync({
                  mediaTypes: ImagePicker.MediaTypeOptions.Videos,
                  allowsEditing: true,
                  videoMaxDuration: 30,
                  videoQuality: ImagePicker.VideoQuality.Medium,
                });

                if (!result.canceled) {
                  resolve({ success: true, video: result.assets[0] });
                } else {
                  resolve({ success: false, error: "Cancelled" });
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
      console.error("Error picking video:", error);
      return {
        success: false,
        error: error.message,
      };
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

  // Complete flow: Pick and upload media for a session
  async addMediaToTrainingSession(sessionId, userId, mediaType = "image") {
    try {
      let pickerResult;

      if (mediaType === "image") {
        pickerResult = await this.pickImage();
      } else if (mediaType === "video") {
        pickerResult = await this.pickVideo();
      } else {
        return {
          success: false,
          error: "Invalid media type",
        };
      }

      if (!pickerResult.success) {
        return pickerResult;
      }

      const fileUri = pickerResult.image?.uri || pickerResult.video?.uri;
      const fileType =
        pickerResult.image?.type ||
        pickerResult.video?.type ||
        (mediaType === "image" ? "image/jpeg" : "video/mp4");

      // Upload the file
      const uploadResult = await this.uploadFile(
        fileUri,
        userId,
        sessionId,
        fileType,
      );

      if (!uploadResult.success) {
        return uploadResult;
      }

      // Create media data object
      const mediaData = {
        id: Date.now().toString(),
        type: mediaType,
        downloadURL: uploadResult.downloadURL,
        fileName: uploadResult.fileName,
        fileType: uploadResult.fileType,
        fileSize: uploadResult.fileSize,
        uploadedAt: new Date(),
        uploadedBy: userId,
      };

      // Add to session
      const sessionResult = await this.addMediaToSession(sessionId, mediaData);

      if (!sessionResult.success) {
        // If adding to session fails, delete the uploaded file
        await this.deleteFile(uploadResult.fileName);
        return sessionResult;
      }

      return {
        success: true,
        mediaData,
        message: `${mediaType === "image" ? "Photo" : "Video"} added successfully!`,
      };
    } catch (error) {
      console.error("Error in complete media flow:", error);
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
