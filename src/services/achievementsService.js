import {
  collection,
  addDoc,
  getDocs,
  doc,
  updateDoc,
  query,
  where,
  orderBy,
  Timestamp,
} from "firebase/firestore";
import { db } from "../config/firebase";

class AchievementsService {
  // Get all available achievements
  async getAchievements() {
    try {
      const achievementsRef = collection(db, "achievements");
      const querySnapshot = await getDocs(achievementsRef);
      const achievements = [];

      querySnapshot.forEach((doc) => {
        achievements.push({
          id: doc.id,
          ...doc.data(),
        });
      });

      return {
        success: true,
        achievements,
      };
    } catch (error) {
      console.error("Error fetching achievements:", error);
      return {
        success: false,
        error: error.message,
        achievements: [],
      };
    }
  }

  // Get user's earned achievements
  async getUserAchievements(userId = "demo_user") {
    try {
      const userAchievementsRef = collection(db, "userAchievements");
      const q = query(
        userAchievementsRef,
        where("userId", "==", userId),
        orderBy("earnedAt", "desc"),
      );

      const querySnapshot = await getDocs(q);
      const userAchievements = [];

      querySnapshot.forEach((doc) => {
        const data = doc.data();
        userAchievements.push({
          id: doc.id,
          ...data,
          earnedAt: data.earnedAt?.toDate(),
        });
      });

      return {
        success: true,
        userAchievements,
      };
    } catch (error) {
      console.error("Error fetching user achievements:", error);
      return {
        success: false,
        error: error.message,
        userAchievements: [],
      };
    }
  }

  // Award achievement to user
  async awardAchievement(userId, achievementId) {
    try {
      // Check if user already has this achievement
      const userAchievementsRef = collection(db, "userAchievements");
      const existingQuery = query(
        userAchievementsRef,
        where("userId", "==", userId),
        where("achievementId", "==", achievementId),
      );

      const existingSnapshot = await getDocs(existingQuery);

      if (!existingSnapshot.empty) {
        return {
          success: false,
          error: "Achievement already earned",
        };
      }

      // Award the achievement
      await addDoc(userAchievementsRef, {
        userId,
        achievementId,
        earnedAt: Timestamp.fromDate(new Date()),
      });

      return {
        success: true,
        message: "Achievement awarded!",
      };
    } catch (error) {
      console.error("Error awarding achievement:", error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  // Check and award achievements based on training stats
  async checkAndAwardAchievements(userId, trainingStats) {
    try {
      const achievements = await this.getAchievements();
      const userAchievements = await this.getUserAchievements(userId);

      if (!achievements.success || !userAchievements.success) {
        return { success: false, error: "Failed to fetch achievements data" };
      }

      const earnedAchievementIds = new Set(
        userAchievements.userAchievements.map((ua) => ua.achievementId),
      );

      const newAchievements = [];

      // Check each achievement
      for (const achievement of achievements.achievements) {
        if (earnedAchievementIds.has(achievement.id)) {
          continue; // Already earned
        }

        const earned = this.checkAchievementCriteria(
          achievement,
          trainingStats,
        );

        if (earned) {
          const result = await this.awardAchievement(userId, achievement.id);
          if (result.success) {
            newAchievements.push(achievement);
          }
        }
      }

      return {
        success: true,
        newAchievements,
        message:
          newAchievements.length > 0
            ? `Earned ${newAchievements.length} new achievement(s)!`
            : "No new achievements",
      };
    } catch (error) {
      console.error("Error checking achievements:", error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  // Check if achievement criteria is met
  checkAchievementCriteria(achievement, stats) {
    const { title } = achievement;

    switch (title.toLowerCase()) {
      case "first blood":
        return stats.totalSessions >= 1;

      case "week warrior":
        return stats.sessionsThisWeek >= 5;

      case "century fighter":
        return stats.totalSessions >= 100;

      case "sparring legend":
        return (stats.typeBreakdown["Sparring"]?.count || 0) >= 50;

      case "iron will":
        return stats.currentStreak >= 30;

      case "early bird":
        // This would need more complex logic to track morning sessions
        return false; // Placeholder

      case "intensity beast":
        return stats.avgIntensity >= 8.5;

      case "endurance master":
        return stats.totalDuration >= 3000; // 50 hours

      case "bag destroyer":
        return (stats.typeBreakdown["Bag Work"]?.count || 0) >= 75;

      case "technique specialist":
        return (stats.typeBreakdown["Pad Work"]?.count || 0) >= 50;

      default:
        return false;
    }
  }

  // Get achievement progress for user
  async getAchievementProgress(userId, trainingStats) {
    try {
      const achievements = await this.getAchievements();
      const userAchievements = await this.getUserAchievements(userId);

      if (!achievements.success || !userAchievements.success) {
        return { success: false, error: "Failed to fetch achievements data" };
      }

      const earnedAchievementIds = new Set(
        userAchievements.userAchievements.map((ua) => ua.achievementId),
      );

      const progressData = achievements.achievements.map((achievement) => {
        const isEarned = earnedAchievementIds.has(achievement.id);
        const progress = isEarned
          ? 100
          : this.calculateProgress(achievement, trainingStats);

        return {
          ...achievement,
          earned: isEarned,
          progress,
          earnedAt: isEarned
            ? userAchievements.userAchievements.find(
                (ua) => ua.achievementId === achievement.id,
              )?.earnedAt
            : null,
        };
      });

      return {
        success: true,
        achievements: progressData,
      };
    } catch (error) {
      console.error("Error getting achievement progress:", error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  // Calculate progress towards achievement
  calculateProgress(achievement, stats) {
    const { title } = achievement;

    switch (title.toLowerCase()) {
      case "first blood":
        return Math.min((stats.totalSessions / 1) * 100, 100);

      case "week warrior":
        return Math.min((stats.sessionsThisWeek / 5) * 100, 100);

      case "century fighter":
        return Math.min((stats.totalSessions / 100) * 100, 100);

      case "sparring legend":
        const sparringCount = stats.typeBreakdown["Sparring"]?.count || 0;
        return Math.min((sparringCount / 50) * 100, 100);

      case "iron will":
        return Math.min((stats.currentStreak / 30) * 100, 100);

      case "intensity beast":
        return Math.min((stats.avgIntensity / 8.5) * 100, 100);

      case "endurance master":
        return Math.min((stats.totalDuration / 3000) * 100, 100);

      case "bag destroyer":
        const bagWorkCount = stats.typeBreakdown["Bag Work"]?.count || 0;
        return Math.min((bagWorkCount / 75) * 100, 100);

      case "technique specialist":
        const padWorkCount = stats.typeBreakdown["Pad Work"]?.count || 0;
        return Math.min((padWorkCount / 50) * 100, 100);

      default:
        return 0;
    }
  }

  // Get user's total achievement points
  async getUserPoints(userId) {
    try {
      const userAchievements = await this.getUserAchievements(userId);
      const achievements = await this.getAchievements();

      if (!achievements.success || !userAchievements.success) {
        return { success: false, error: "Failed to fetch data" };
      }

      let totalPoints = 0;

      userAchievements.userAchievements.forEach((userAchievement) => {
        const achievement = achievements.achievements.find(
          (a) => a.id === userAchievement.achievementId,
        );
        if (achievement) {
          totalPoints += achievement.points || 0;
        }
      });

      return {
        success: true,
        totalPoints,
        achievementsCount: userAchievements.userAchievements.length,
      };
    } catch (error) {
      console.error("Error calculating user points:", error);
      return {
        success: false,
        error: error.message,
      };
    }
  }
}

export default new AchievementsService();
