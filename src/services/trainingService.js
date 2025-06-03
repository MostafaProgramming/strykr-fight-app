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
} from "firebase/firestore";
import { db } from "../config/firebase";

class TrainingService {
  // Add a new training session
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
        userId: sessionData.userId || "demo_user", // Will be real user ID later
        createdAt: Timestamp.fromDate(new Date()),
        date: sessionData.date || new Date().toISOString().split("T")[0],
        time:
          sessionData.time ||
          new Date().toLocaleTimeString("en-US", {
            hour: "2-digit",
            minute: "2-digit",
          }),
      };

      const docRef = await addDoc(sessionsRef, session);

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

  // Get all training sessions for a user
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

  // Get sessions by type
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

  // Get recent sessions (last 10)
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

  // Update a training session
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

  // Delete a training session
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

  // Calculate calories burned (rough estimation)
  calculateCalories(sessionData) {
    const { type, duration, intensity } = sessionData;

    // Base calories per minute by training type
    const baseCaloriesPerMinute = {
      "bag work": 8,
      "pad work": 10,
      sparring: 12,
      drills: 6,
      strength: 7,
      recovery: 3,
    };

    const baseRate = baseCaloriesPerMinute[type.toLowerCase()] || 8;
    const intensityMultiplier = 0.7 + intensity * 0.04; // 0.74 to 1.1

    return Math.round(duration * baseRate * intensityMultiplier);
  }

  // Get training statistics
  async getTrainingStats(userId = "demo_user") {
    try {
      const sessions = await this.getUserTrainingSessions(userId);

      if (!sessions.success) {
        return sessions;
      }

      const sessionData = sessions.sessions;

      // Calculate stats
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

      // Training type breakdown
      const typeBreakdown = {};
      sessionData.forEach((session) => {
        const type = session.type;
        if (!typeBreakdown[type]) {
          typeBreakdown[type] = {
            count: 0,
            totalDuration: 0,
            avgIntensity: 0,
          };
        }
        typeBreakdown[type].count++;
        typeBreakdown[type].totalDuration += session.duration;
        typeBreakdown[type].avgIntensity += session.intensity;
      });

      // Calculate averages for each type
      Object.keys(typeBreakdown).forEach((type) => {
        typeBreakdown[type].avgIntensity =
          typeBreakdown[type].avgIntensity / typeBreakdown[type].count;
      });

      return {
        success: true,
        stats: {
          totalSessions,
          totalDuration,
          totalCalories,
          avgIntensity: Math.round(avgIntensity * 10) / 10,
          typeBreakdown,
          sessionsThisWeek: this.getSessionsThisWeek(sessionData),
          currentStreak: this.calculateStreak(sessionData),
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

  // Helper: Get sessions this week
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

  // Helper: Calculate current streak
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

    // Check if there's a session today or yesterday
    const todayStr = currentDate.toISOString().split("T")[0];
    const yesterday = new Date(currentDate);
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split("T")[0];

    if (!sessionDates.has(todayStr) && !sessionDates.has(yesterdayStr)) {
      return 0;
    }

    // Count consecutive days
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
