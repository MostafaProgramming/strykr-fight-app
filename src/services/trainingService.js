import {
  collection,
  addDoc,
  getDocs,
  doc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  Timestamp,
  getDoc,
} from "firebase/firestore";
import { db } from "../config/firebase";

class TrainingService {
  // ENHANCED: Add a new training session with media support
  async addTrainingSession(sessionData) {
    try {
      const sessionsRef = collection(db, "trainingSessions");

      const session = {
        type: sessionData.type,
        rounds: parseInt(sessionData.rounds) || 0,
        intensity: parseInt(sessionData.intensity),
        duration: parseInt(sessionData.duration),
        notes: sessionData.notes || "",
        calories: this.calculateCalories(sessionData),
        userId: sessionData.userId || "demo_user",
        createdAt: Timestamp.fromDate(new Date()),
        date: sessionData.date || new Date().toISOString().split("T")[0],
        time:
          sessionData.time ||
          new Date().toLocaleTimeString("en-US", {
            hour: "2-digit",
            minute: "2-digit",
          }),

        // NEW: Enhanced features (backward compatible)
        media: sessionData.media || [],
        isSharedToFeed: sessionData.shareToFeed || false,
        mood: sessionData.mood || null,
        location: sessionData.location || null,
        trainingPartners: sessionData.trainingPartners || [],

        // Social features
        likes: 0,
        comments: 0,
        shares: 0,
      };

      const docRef = await addDoc(sessionsRef, session);

      // If sharing to feed, also create a feed post
      if (sessionData.shareToFeed && sessionData.userInfo) {
        await this.shareToSocialFeed(docRef.id, session, sessionData.userInfo);
      }

      return {
        success: true,
        sessionId: docRef.id,
        message: "Training session logged successfully!",
      };
    } catch (error) {
      console.error("Error adding training session:", error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  // NEW: Share training session to social feed
  async shareToSocialFeed(sessionId, sessionData, userInfo) {
    try {
      const feedRef = collection(db, "socialFeed");

      const feedPost = {
        sessionId,
        userId: sessionData.userId,
        userName: userInfo.name,
        userAvatar: userInfo.avatar,
        userGym: userInfo.gym || "",
        userLevel: userInfo.fighterLevel || "Amateur",

        // Session details
        sessionType: sessionData.type,
        sessionDuration: sessionData.duration,
        sessionRounds: sessionData.rounds,
        sessionIntensity: sessionData.intensity,
        sessionNotes: sessionData.notes,
        sessionCalories: sessionData.calories,
        sessionDate: sessionData.date,
        sessionMood: sessionData.mood,

        // Media
        media: sessionData.media || [],

        // Post metadata
        timestamp: sessionData.createdAt,
        likes: [],
        likeCount: 0,
        comments: [],
        commentCount: 0,
        shares: 0,
        isPublic: true,
        postType: "training_session",
        engagement: 0,
      };

      await addDoc(feedRef, feedPost);
      return { success: true };
    } catch (error) {
      console.error("Error sharing to feed:", error);
      return { success: false, error: error.message };
    }
  }

  // EXISTING: Get all training sessions for a user (enhanced)
  async getUserTrainingSessions(userId = "demo_user") {
    try {
      const sessionsRef = collection(db, "trainingSessions");
      const q = query(
        sessionsRef,
        where("userId", "==", userId),
        orderBy("createdAt", "desc"),
      );

      const querySnapshot = await getDocs(q);
      const sessions = [];

      querySnapshot.forEach((doc) => {
        const data = doc.data();
        sessions.push({
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate(),
          // NEW: Calculate engagement score
          engagementScore:
            (data.likes || 0) +
            (data.comments || 0) * 2 +
            (data.shares || 0) * 3,
        });
      });

      return {
        success: true,
        sessions,
      };
    } catch (error) {
      console.error("Error fetching training sessions:", error);
      return {
        success: false,
        error: error.message,
        sessions: [],
      };
    }
  }

  // EXISTING: Get sessions by type
  async getSessionsByType(type, userId = "demo_user") {
    try {
      const sessionsRef = collection(db, "trainingSessions");
      const q = query(
        sessionsRef,
        where("userId", "==", userId),
        where("type", "==", type),
        orderBy("createdAt", "desc"),
      );

      const querySnapshot = await getDocs(q);
      const sessions = [];

      querySnapshot.forEach((doc) => {
        const data = doc.data();
        sessions.push({
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate(),
        });
      });

      return {
        success: true,
        sessions,
      };
    } catch (error) {
      console.error("Error fetching sessions by type:", error);
      return {
        success: false,
        error: error.message,
        sessions: [],
      };
    }
  }

  // EXISTING: Get recent sessions
  async getRecentSessions(userId = "demo_user", limitCount = 10) {
    try {
      const sessionsRef = collection(db, "trainingSessions");
      const q = query(
        sessionsRef,
        where("userId", "==", userId),
        orderBy("createdAt", "desc"),
        limit(limitCount),
      );

      const querySnapshot = await getDocs(q);
      const sessions = [];

      querySnapshot.forEach((doc) => {
        const data = doc.data();
        sessions.push({
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate(),
        });
      });

      return {
        success: true,
        sessions,
      };
    } catch (error) {
      console.error("Error fetching recent sessions:", error);
      return {
        success: false,
        error: error.message,
        sessions: [],
      };
    }
  }

  // EXISTING: Update a training session
  async updateTrainingSession(sessionId, updates) {
    try {
      const sessionRef = doc(db, "trainingSessions", sessionId);
      await updateDoc(sessionRef, {
        ...updates,
        updatedAt: Timestamp.fromDate(new Date()),
      });

      return {
        success: true,
        message: "Training session updated successfully!",
      };
    } catch (error) {
      console.error("Error updating training session:", error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  // EXISTING: Delete a training session
  async deleteTrainingSession(sessionId) {
    try {
      const sessionRef = doc(db, "trainingSessions", sessionId);
      await deleteDoc(sessionRef);

      return {
        success: true,
        message: "Training session deleted successfully!",
      };
    } catch (error) {
      console.error("Error deleting training session:", error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  // ENHANCED: Calculate calories with more factors
  calculateCalories(sessionData) {
    const { type, duration, intensity, userWeight } = sessionData;

    // Enhanced base calories per minute by training type
    const baseCaloriesPerMinute = {
      "bag work": 9,
      "pad work": 11,
      sparring: 14,
      drills: 7,
      strength: 8,
      recovery: 4,
    };

    const baseRate = baseCaloriesPerMinute[type.toLowerCase()] || 9;
    const intensityMultiplier = 0.6 + intensity * 0.05; // 0.65 to 1.1
    const weightMultiplier = userWeight ? userWeight / 70 : 1; // Adjust for weight

    return Math.round(
      duration * baseRate * intensityMultiplier * weightMultiplier,
    );
  }

  // NEW: Add media to existing session
  async addMediaToSession(sessionId, mediaData) {
    try {
      const sessionRef = doc(db, "trainingSessions", sessionId);

      // Get current session
      const sessionDoc = await getDoc(sessionRef);
      if (!sessionDoc.exists()) {
        return { success: false, error: "Session not found" };
      }

      const currentMedia = sessionDoc.data().media || [];
      const updatedMedia = [...currentMedia, mediaData];

      await updateDoc(sessionRef, {
        media: updatedMedia,
        updatedAt: Timestamp.fromDate(new Date()),
      });

      return {
        success: true,
        message: "Media added to session",
      };
    } catch (error) {
      console.error("Error adding media:", error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  // ENHANCED: Get training statistics
  async getTrainingStats(userId = "demo_user") {
    try {
      const sessions = await this.getUserTrainingSessions(userId);

      if (!sessions.success) {
        return sessions;
      }

      const sessionData = sessions.sessions;

      // Calculate basic stats
      const totalSessions = sessionData.length;
      const totalDuration = sessionData.reduce((sum, s) => sum + s.duration, 0);
      const totalCalories = sessionData.reduce(
        (sum, s) => sum + (s.calories || 0),
        0,
      );
      const avgIntensity =
        totalSessions > 0
          ? sessionData.reduce((sum, s) => sum + s.intensity, 0) / totalSessions
          : 0;

      // NEW: Enhanced stats
      const sessionsWithMedia = sessionData.filter(
        (s) => s.media && s.media.length > 0,
      );
      const totalPhotos = sessionData.reduce(
        (sum, s) =>
          sum + (s.media?.filter((m) => m.type === "image").length || 0),
        0,
      );
      const totalVideos = sessionData.reduce(
        (sum, s) =>
          sum + (s.media?.filter((m) => m.type === "video").length || 0),
        0,
      );
      const sharedSessions = sessionData.filter((s) => s.isSharedToFeed);
      const totalLikes = sessionData.reduce(
        (sum, s) => sum + (s.likes || 0),
        0,
      );

      // Training type breakdown
      const typeBreakdown = {};
      sessionData.forEach((session) => {
        const type = session.type;
        if (!typeBreakdown[type]) {
          typeBreakdown[type] = {
            count: 0,
            totalDuration: 0,
            avgIntensity: 0,
            withMedia: 0,
          };
        }
        typeBreakdown[type].count++;
        typeBreakdown[type].totalDuration += session.duration;
        typeBreakdown[type].avgIntensity += session.intensity;
        if (session.media && session.media.length > 0) {
          typeBreakdown[type].withMedia++;
        }
      });

      // Calculate averages for each type
      Object.keys(typeBreakdown).forEach((type) => {
        typeBreakdown[type].avgIntensity =
          typeBreakdown[type].avgIntensity / typeBreakdown[type].count;
      });

      return {
        success: true,
        stats: {
          // Basic stats (backward compatible)
          totalSessions,
          totalDuration,
          totalCalories,
          avgIntensity: Math.round(avgIntensity * 10) / 10,
          typeBreakdown,
          sessionsThisWeek: this.getSessionsThisWeek(sessionData),
          currentStreak: this.calculateStreak(sessionData),

          // NEW: Enhanced stats
          mediaStats: {
            sessionsWithMedia: sessionsWithMedia.length,
            totalPhotos,
            totalVideos,
            mediaPercentage:
              totalSessions > 0
                ? Math.round((sessionsWithMedia.length / totalSessions) * 100)
                : 0,
          },

          socialStats: {
            sharedSessions: sharedSessions.length,
            totalLikes,
            avgLikesPerPost:
              sharedSessions.length > 0
                ? Math.round(totalLikes / sharedSessions.length)
                : 0,
            sharePercentage:
              totalSessions > 0
                ? Math.round((sharedSessions.length / totalSessions) * 100)
                : 0,
          },
        },
      };
    } catch (error) {
      console.error("Error calculating training stats:", error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  // EXISTING: Helper functions
  getSessionsThisWeek(sessions) {
    const now = new Date();
    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() - now.getDay());
    weekStart.setHours(0, 0, 0, 0);

    return sessions.filter((session) => {
      const sessionDate = new Date(session.date);
      return sessionDate >= weekStart;
    }).length;
  }

  calculateStreak(sessions) {
    if (sessions.length === 0) return 0;

    const sortedSessions = sessions.sort(
      (a, b) => new Date(b.date) - new Date(a.date),
    );
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let streak = 0;
    let currentDate = new Date(today);
    const sessionDates = new Set(sortedSessions.map((s) => s.date));

    const todayStr = currentDate.toISOString().split("T")[0];
    const yesterday = new Date(currentDate);
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split("T")[0];

    if (!sessionDates.has(todayStr) && !sessionDates.has(yesterdayStr)) {
      return 0;
    }

    while (true) {
      const dateStr = currentDate.toISOString().split("T")[0];
      if (sessionDates.has(dateStr)) {
        streak++;
        currentDate.setDate(currentDate.getDate() - 1);
      } else {
        break;
      }
    }

    return streak;
  }
}

export default new TrainingService();
