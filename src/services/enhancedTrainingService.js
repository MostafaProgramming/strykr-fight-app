// =============================================
// 📱 src/services/enhancedTrainingService.js
// =============================================

import * as FileSystem from "expo-file-system";
import * as ImagePicker from "expo-image-picker";
import FightTrackerAPI from "./api";

class EnhancedTrainingService {
  constructor(api = null) {
    this.api = api || new FightTrackerAPI();
  }

  // =============================================
  // 🥊 Training Session Management
  // =============================================

  // Create training session with media
  async createTrainingSession(sessionData, mediaFiles = []) {
    try {
      console.log("🥊 Creating training session with media...");

      // Upload media first if any
      const uploadedMedia = [];

      if (mediaFiles.length > 0) {
        console.log(`📸 Uploading ${mediaFiles.length} media files...`);

        for (let i = 0; i < mediaFiles.length; i++) {
          const media = mediaFiles[i];
          console.log(`Uploading media ${i + 1}/${mediaFiles.length}...`);

          const uploadResult = await this.uploadMedia(media);
          if (uploadResult.success) {
            uploadedMedia.push(uploadResult.data.mediaId);
            console.log(`✅ Media ${i + 1} uploaded successfully`);
          } else {
            console.warn(
              `❌ Failed to upload media ${i + 1}:`,
              uploadResult.error,
            );
          }
        }
      }

      // Create the post with media IDs
      const postData = {
        type: "training_session",
        trainingType: this.mapTrainingType(sessionData.type),
        durationMinutes: sessionData.duration,
        rounds: sessionData.rounds || 0,
        intensityRpe: sessionData.intensity,
        caloriesBurned: this.calculateCalories(sessionData),
        caption: sessionData.notes || "",
        mood: sessionData.mood || null,
        mediaIds: uploadedMedia,
        isPublic: sessionData.shareToFeed !== false,

        // Location data if available
        locationName: sessionData.locationName || null,
        latitude: sessionData.latitude || null,
        longitude: sessionData.longitude || null,
        gymId: sessionData.gymId || null,
      };

      console.log("📝 Creating post with data:", postData);
      const response = await this.api.createPost(postData);

      if (response.success) {
        console.log("🎉 Training session created successfully!");
        return {
          success: true,
          sessionId: response.data.post.id,
          message: `Training session logged! ${uploadedMedia.length > 0 ? `${uploadedMedia.length} media files uploaded.` : ""}`,
          mediaUploaded: uploadedMedia.length,
        };
      } else {
        throw new Error(response.error);
      }
    } catch (error) {
      console.error("❌ Error creating training session:", error);
      return {
        success: false,
        error: error.message,
        mediaUploaded: 0,
      };
    }
  }

  // =============================================
  // 📸 Media Upload Methods
  // =============================================

  // Upload single media file
  async uploadMedia(mediaFile, onProgress = null) {
    try {
      console.log("📤 Starting media upload...", {
        uri: mediaFile.uri,
        type: mediaFile.type,
        size: mediaFile.fileSize,
      });

      // Get file info
      const fileInfo = await FileSystem.getInfoAsync(mediaFile.uri);

      if (!fileInfo.exists) {
        throw new Error("File does not exist");
      }

      // Generate filename
      const timestamp = Date.now();
      const extension = this.getFileExtension(mediaFile);
      const filename = `training_${timestamp}.${extension}`;

      // Get upload URL from backend
      const uploadUrlResponse = await this.api.getUploadUrl({
        filename,
        contentType: this.getContentType(mediaFile),
        fileSize: fileInfo.size,
      });

      if (!uploadUrlResponse.success) {
        throw new Error(uploadUrlResponse.error);
      }

      const { uploadUrl, mediaId } = uploadUrlResponse.data;
      console.log("📡 Got upload URL, uploading to S3...");

      // Upload file to S3 using presigned URL
      const uploadResult = await FileSystem.uploadAsync(
        uploadUrl,
        mediaFile.uri,
        {
          httpMethod: "PUT",
          headers: {
            "Content-Type": this.getContentType(mediaFile),
          },
          uploadType: FileSystem.FileSystemUploadType.BINARY_CONTENT,
        },
      );

      if (uploadResult.status !== 200) {
        throw new Error(`Upload failed with status: ${uploadResult.status}`);
      }

      console.log("☁️ File uploaded to S3, confirming upload...");

      // Confirm upload with backend
      const confirmResponse = await this.api.confirmUpload(mediaId);

      if (!confirmResponse.success) {
        throw new Error("Failed to confirm upload");
      }

      console.log("✅ Media upload completed successfully");
      return {
        success: true,
        data: {
          mediaId,
          filename,
          contentType: this.getContentType(mediaFile),
          fileSize: fileInfo.size,
        },
      };
    } catch (error) {
      console.error("❌ Media upload error:", error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  // Upload multiple media files with progress
  async uploadMultipleMedia(mediaFiles, onProgress = null) {
    const results = [];
    let successCount = 0;

    for (let i = 0; i < mediaFiles.length; i++) {
      const media = mediaFiles[i];

      if (onProgress) {
        onProgress(
          i,
          mediaFiles.length,
          `Uploading ${i + 1}/${mediaFiles.length}...`,
        );
      }

      const result = await this.uploadMedia(media);
      results.push(result);

      if (result.success) {
        successCount++;
      }
    }

    if (onProgress) {
      onProgress(mediaFiles.length, mediaFiles.length, "Upload complete!");
    }

    return {
      success: successCount > 0,
      results,
      successCount,
      totalCount: mediaFiles.length,
    };
  }

  // =============================================
  // 📷 Media Picker Methods
  // =============================================

  // Pick media from library
  async pickMedia(options = {}) {
    try {
      console.log("📱 Opening media library...");

      const { status } =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== "granted") {
        throw new Error(
          "Media library permission is required to share training photos/videos",
        );
      }

      const defaultOptions = {
        mediaTypes: ImagePicker.MediaTypeOptions.All,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
        videoMaxDuration: 60,
      };

      const result = await ImagePicker.launchImageLibraryAsync({
        ...defaultOptions,
        ...options,
      });

      if (!result.canceled && result.assets.length > 0) {
        const asset = result.assets[0];
        return {
          success: true,
          media: {
            uri: asset.uri,
            type: asset.type === "video" ? "video" : "image",
            width: asset.width,
            height: asset.height,
            duration: asset.duration,
            fileSize: asset.fileSize,
            filename: `training_${Date.now()}.${this.getFileExtensionFromAsset(asset)}`,
          },
        };
      }

      return { success: false, error: "Selection cancelled" };
    } catch (error) {
      console.error("❌ Error picking media:", error);
      return { success: false, error: error.message };
    }
  }

  // Take photo/video with camera
  async takeMedia(mediaType = "photo") {
    try {
      console.log(`📸 Opening camera for ${mediaType}...`);

      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== "granted") {
        throw new Error(
          "Camera permission is required to capture training photos/videos",
        );
      }

      const options = {
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      };

      if (mediaType === "video") {
        options.mediaTypes = ImagePicker.MediaTypeOptions.Videos;
        options.videoMaxDuration = 60;
        options.videoQuality = ImagePicker.VideoQuality.High;
      } else {
        options.mediaTypes = ImagePicker.MediaTypeOptions.Images;
      }

      const result = await ImagePicker.launchCameraAsync(options);

      if (!result.canceled && result.assets.length > 0) {
        const asset = result.assets[0];
        return {
          success: true,
          media: {
            uri: asset.uri,
            type: asset.type === "video" ? "video" : "image",
            width: asset.width,
            height: asset.height,
            duration: asset.duration,
            fileSize: asset.fileSize,
            filename: `training_${Date.now()}.${this.getFileExtensionFromAsset(asset)}`,
          },
        };
      }

      return { success: false, error: "Capture cancelled" };
    } catch (error) {
      console.error("❌ Error capturing media:", error);
      return { success: false, error: error.message };
    }
  }

  // Show media picker options
  showMediaPicker() {
    return new Promise((resolve) => {
      // This would show an action sheet in a real implementation
      // For now, we'll just pick from library
      this.pickMedia().then(resolve);
    });
  }

  // =============================================
  // 🎯 Training Data Methods
  // =============================================

  // Get user's training sessions
  async getTrainingSessions(params = {}) {
    try {
      const defaultParams = {
        limit: 20,
        offset: 0,
        filter: "all",
      };

      const response = await this.api.getFeed({
        ...defaultParams,
        ...params,
      });

      if (response.success) {
        // Filter only training sessions
        const trainingSessions = response.data.posts.filter(
          (post) => post.type === "training_session",
        );

        return {
          success: true,
          sessions: trainingSessions,
          total: trainingSessions.length,
        };
      }

      throw new Error(response.error);
    } catch (error) {
      console.error("❌ Error getting training sessions:", error);
      return {
        success: false,
        error: error.message,
        sessions: [],
      };
    }
  }

  // Get training statistics
  async getTrainingStats() {
    try {
      const sessionsResult = await this.getTrainingSessions({ limit: 100 });

      if (!sessionsResult.success) {
        throw new Error(sessionsResult.error);
      }

      const sessions = sessionsResult.sessions;

      // Calculate statistics
      const totalSessions = sessions.length;
      const totalDuration = sessions.reduce(
        (sum, s) => sum + (s.durationMinutes || 0),
        0,
      );
      const totalCalories = sessions.reduce(
        (sum, s) => sum + (s.caloriesBurned || 0),
        0,
      );
      const avgIntensity =
        totalSessions > 0
          ? sessions.reduce((sum, s) => sum + (s.intensityRpe || 0), 0) /
            totalSessions
          : 0;

      // Training type breakdown
      const typeBreakdown = {};
      sessions.forEach((session) => {
        const type = session.trainingType || "unknown";
        if (!typeBreakdown[type]) {
          typeBreakdown[type] = { count: 0, totalDuration: 0 };
        }
        typeBreakdown[type].count++;
        typeBreakdown[type].totalDuration += session.durationMinutes || 0;
      });

      return {
        success: true,
        stats: {
          totalSessions,
          totalDuration,
          totalCalories,
          avgIntensity: Math.round(avgIntensity * 10) / 10,
          typeBreakdown,
          sessionsThisWeek: this.getSessionsThisWeek(sessions),
          currentStreak: this.calculateStreak(sessions),
        },
      };
    } catch (error) {
      console.error("❌ Error calculating training stats:", error);
      return {
        success: false,
        error: error.message,
        stats: null,
      };
    }
  }

  // =============================================
  // 🔧 Helper Methods
  // =============================================

  // Map training types to backend format
  mapTrainingType(type) {
    const typeMap = {
      "Bag Work": "bag_work",
      "Pad Work": "pad_work",
      Sparring: "sparring",
      Drills: "drills",
      Strength: "strength",
      Recovery: "recovery",
      Cardio: "cardio",
      Technique: "technique",
    };
    return typeMap[type] || type.toLowerCase().replace(" ", "_");
  }

  // Calculate calories burned
  calculateCalories(sessionData) {
    const { type, duration, intensity, userWeight = 70 } = sessionData;

    const baseCaloriesPerMinute = {
      "Bag Work": 9,
      "Pad Work": 11,
      Sparring: 14,
      Drills: 7,
      Strength: 8,
      Recovery: 4,
      Cardio: 10,
      Technique: 6,
    };

    const baseRate = baseCaloriesPerMinute[type] || 8;
    const intensityMultiplier = 0.6 + intensity * 0.05; // 0.65 to 1.1
    const weightMultiplier = userWeight / 70; // Adjust for weight

    return Math.round(
      duration * baseRate * intensityMultiplier * weightMultiplier,
    );
  }

  // Get file extension from media asset
  getFileExtensionFromAsset(asset) {
    if (asset.type === "video") {
      return "mp4";
    }
    return "jpg";
  }

  // Get file extension from media object
  getFileExtension(media) {
    if (media.type === "video") {
      return "mp4";
    }
    return "jpg";
  }

  // Get content type for upload
  getContentType(media) {
    if (media.type === "video") {
      return "video/mp4";
    }
    return "image/jpeg";
  }

  // Calculate sessions this week
  getSessionsThisWeek(sessions) {
    const now = new Date();
    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() - now.getDay());
    weekStart.setHours(0, 0, 0, 0);

    return sessions.filter((session) => {
      const sessionDate = new Date(session.createdAt);
      return sessionDate >= weekStart;
    }).length;
  }

  // Calculate training streak
  calculateStreak(sessions) {
    if (sessions.length === 0) return 0;

    const sortedSessions = sessions.sort(
      (a, b) => new Date(b.createdAt) - new Date(a.createdAt),
    );

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let streak = 0;
    let currentDate = new Date(today);

    // Get unique training dates
    const sessionDates = new Set();
    sortedSessions.forEach((session) => {
      const date = new Date(session.createdAt);
      date.setHours(0, 0, 0, 0);
      sessionDates.add(date.getTime());
    });

    // Check if today or yesterday has a session
    const todayTime = currentDate.getTime();
    const yesterday = new Date(currentDate);
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayTime = yesterday.getTime();

    if (!sessionDates.has(todayTime) && !sessionDates.has(yesterdayTime)) {
      return 0;
    }

    // Count consecutive days
    while (true) {
      if (sessionDates.has(currentDate.getTime())) {
        streak++;
        currentDate.setDate(currentDate.getDate() - 1);
      } else {
        break;
      }
    }

    return streak;
  }

  // Validate media file
  validateMedia(media) {
    const maxImageSize = 10 * 1024 * 1024; // 10MB
    const maxVideoSize = 100 * 1024 * 1024; // 100MB
    const maxVideoDuration = 60 * 1000; // 60 seconds

    if (!media || !media.uri) {
      return { valid: false, error: "No media selected" };
    }

    if (media.type === "image" && media.fileSize > maxImageSize) {
      return {
        valid: false,
        error: `Image too large (${(media.fileSize / (1024 * 1024)).toFixed(1)}MB). Max: 10MB`,
      };
    }

    if (media.type === "video") {
      if (media.fileSize > maxVideoSize) {
        return {
          valid: false,
          error: `Video too large (${(media.fileSize / (1024 * 1024)).toFixed(1)}MB). Max: 100MB`,
        };
      }

      if (media.duration > maxVideoDuration) {
        return {
          valid: false,
          error: `Video too long (${Math.round(media.duration / 1000)}s). Max: 60s`,
        };
      }
    }

    return { valid: true };
  }
}

export default EnhancedTrainingService;
