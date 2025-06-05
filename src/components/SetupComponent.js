// src/components/SetupComponent.js - ENHANCED WITH SOCIAL FEED
import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from "react-native";
import { collection, addDoc, getDocs } from "firebase/firestore";
import { db } from "../config/firebase";
import { colors } from "../constants/colors";

const SetupComponent = () => {
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState("");

  const sampleTrainingSessions = [
    {
      type: "Bag Work",
      rounds: 6,
      intensity: 8,
      duration: 30,
      date: new Date().toISOString().split("T")[0],
      notes: "Focused on power combinations",
      calories: 280,
      userId: "sample_user_1",
    },
    {
      type: "Sparring",
      rounds: 5,
      intensity: 9,
      duration: 25,
      date: new Date(Date.now() - 24 * 60 * 60 * 1000)
        .toISOString()
        .split("T")[0],
      notes: "Great defensive work",
      calories: 350,
      userId: "sample_user_1",
    },
    {
      type: "Pad Work",
      rounds: 8,
      intensity: 7,
      duration: 40,
      date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
        .toISOString()
        .split("T")[0],
      notes: "Working on timing",
      calories: 320,
      userId: "sample_user_2",
    },
  ];

  const sampleAchievements = [
    {
      title: "First Blood",
      description: "Completed your first training session",
      icon: "trophy",
      points: 100,
      rarity: "common",
      category: "milestone",
    },
    {
      title: "Week Warrior",
      description: "Train 5 times in a week",
      icon: "calendar",
      points: 200,
      rarity: "uncommon",
      category: "consistency",
    },
    {
      title: "Sparring Legend",
      description: "Complete 25 sparring sessions",
      icon: "people",
      points: 500,
      rarity: "rare",
      category: "skill",
    },
    {
      title: "Iron Will",
      description: "Maintain a 30-day streak",
      icon: "flame",
      points: 1000,
      rarity: "legendary",
      category: "dedication",
    },
  ];

  const sampleChallenges = [
    {
      title: "Weekly Warrior",
      description: "Complete 5 training sessions this week",
      type: "weekly",
      target: 5,
      reward: 200,
      deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      status: "active",
    },
    {
      title: "Intensity Beast",
      description: "Complete 3 high-intensity sessions (RPE 8+)",
      type: "weekly",
      target: 3,
      reward: 150,
      deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      status: "active",
    },
    {
      title: "Sparring Master",
      description: "Complete 10 sparring sessions this month",
      type: "monthly",
      target: 10,
      reward: 500,
      deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      status: "active",
    },
  ];

  // NEW: Sample Social Feed Posts
  const sampleSocialFeedPosts = [
    {
      // User info
      userId: "sample_user_1",
      userName: "Mike 'Thunder' Rodriguez",
      userAvatar: "MR",
      userGym: "Iron Fist Gym",
      userLevel: "Amateur",

      // Session details
      sessionType: "Sparring",
      sessionDuration: 45,
      sessionRounds: 8,
      sessionIntensity: 9,
      sessionNotes: "Epic sparring session! Really pushed my limits today 💪",
      sessionCalories: 420,

      // Post metadata
      timestamp: new Date(),
      likes: [],
      likeCount: 12,
      respects: [], // NEW: Respect badges
      respectCount: 5, // NEW
      comments: [],
      commentCount: 3,
      shares: 1,
      isPublic: true,
      postType: "training_session",

      // NEW: Engagement features
      engagementScore: 23, // Calculated: likes + respects*2 + comments*3
      isTrending: false,
      isViral: false,
    },
    {
      userId: "sample_user_2",
      userName: "Sarah 'Lightning' Chen",
      userAvatar: "SC",
      userGym: "Warriors Academy",
      userLevel: "Pro",

      sessionType: "Pad Work",
      sessionDuration: 60,
      sessionRounds: 12,
      sessionIntensity: 8,
      sessionNotes:
        "Perfect technique session. Left hook is getting deadly! 🔥",
      sessionCalories: 480,

      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
      likes: [],
      likeCount: 24,
      respects: [],
      respectCount: 8,
      comments: [],
      commentCount: 7,
      shares: 3,
      isPublic: true,
      postType: "training_session",

      engagementScore: 64, // High engagement
      isTrending: true,
      isViral: false,
    },
    {
      userId: "sample_user_3",
      userName: "Jake 'The Beast' Wilson",
      userAvatar: "JW",
      userGym: "Iron Fist Gym",
      userLevel: "Intermediate",

      sessionType: "Bag Work",
      sessionDuration: 40,
      sessionRounds: 10,
      sessionIntensity: 8,
      sessionNotes: "New personal best! Feeling unstoppable 🥊",
      sessionCalories: 380,

      timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000), // 4 hours ago
      likes: [],
      likeCount: 18,
      respects: [],
      respectCount: 6,
      comments: [],
      commentCount: 4,
      shares: 2,
      isPublic: true,
      postType: "training_session",

      engagementScore: 42,
      isTrending: false,
      isViral: false,
    },
    {
      userId: "sample_user_4",
      userName: "Emma 'Fury' Rodriguez",
      userAvatar: "ER",
      userGym: "Warriors Academy",
      userLevel: "Beginner",

      sessionType: "Drills",
      sessionDuration: 30,
      sessionRounds: 6,
      sessionIntensity: 6,
      sessionNotes: "First week of training! Loving every minute of it 😊",
      sessionCalories: 210,

      timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000), // 6 hours ago
      likes: [],
      likeCount: 15,
      respects: [],
      respectCount: 12, // Lots of respect for beginners!
      comments: [],
      commentCount: 8,
      shares: 1,
      isPublic: true,
      postType: "training_session",

      engagementScore: 63, // High engagement for supportive community
      isTrending: false,
      isViral: false,
    },
    {
      userId: "sample_user_5",
      userName: "Coach Marcus 'Steel' Thompson",
      userAvatar: "MT",
      userGym: "Iron Fist Gym",
      userLevel: "Pro",

      sessionType: "Strength",
      sessionDuration: 60,
      sessionRounds: 0,
      sessionIntensity: 7,
      sessionNotes:
        "Conditioning day - the foundation of all great fighters! 💪",
      sessionCalories: 450,

      timestamp: new Date(Date.now() - 8 * 60 * 60 * 1000), // 8 hours ago
      likes: [],
      likeCount: 31,
      respects: [],
      respectCount: 15,
      comments: [],
      commentCount: 12,
      shares: 5,
      isPublic: true,
      postType: "training_session",

      engagementScore: 102, // Very high engagement - coach wisdom
      isTrending: true,
      isViral: true, // Over 100 engagement score
    },
  ];

  const setupTrainingSessions = async () => {
    try {
      setLoading(true);
      setStatus("Setting up training sessions...");

      const sessionsRef = collection(db, "trainingSessions");

      for (const session of sampleTrainingSessions) {
        const docRef = await addDoc(sessionsRef, {
          ...session,
          createdAt: new Date(),
        });
        console.log(
          `Added training session: ${session.type} with ID: ${docRef.id}`,
        );
      }

      setStatus("Training sessions added successfully!");
      Alert.alert(
        "Success",
        "Sample training sessions have been added to Firebase!",
      );
    } catch (error) {
      console.error("Error adding training sessions:", error);
      setStatus("Error adding training sessions");
      Alert.alert("Error", error.message);
    } finally {
      setLoading(false);
    }
  };

  const setupAchievements = async () => {
    try {
      setLoading(true);
      setStatus("Setting up achievements...");

      const achievementsRef = collection(db, "achievements");

      for (const achievement of sampleAchievements) {
        const docRef = await addDoc(achievementsRef, achievement);
        console.log(
          `Added achievement: ${achievement.title} with ID: ${docRef.id}`,
        );
      }

      setStatus("Achievements added successfully!");
      Alert.alert(
        "Success",
        "Sample achievements have been added to Firebase!",
      );
    } catch (error) {
      console.error("Error adding achievements:", error);
      setStatus("Error adding achievements");
      Alert.alert("Error", error.message);
    } finally {
      setLoading(false);
    }
  };

  const setupChallenges = async () => {
    try {
      setLoading(true);
      setStatus("Setting up challenges...");

      const challengesRef = collection(db, "challenges");

      for (const challenge of sampleChallenges) {
        const docRef = await addDoc(challengesRef, challenge);
        console.log(
          `Added challenge: ${challenge.title} with ID: ${docRef.id}`,
        );
      }

      setStatus("Challenges added successfully!");
      Alert.alert("Success", "Sample challenges have been added to Firebase!");
    } catch (error) {
      console.error("Error adding challenges:", error);
      setStatus("Error adding challenges");
      Alert.alert("Error", error.message);
    } finally {
      setLoading(false);
    }
  };

  // NEW: Setup Social Feed Posts
  const setupSocialFeed = async () => {
    try {
      setLoading(true);
      setStatus("Setting up social feed...");

      const feedRef = collection(db, "socialFeed");

      for (const post of sampleSocialFeedPosts) {
        const docRef = await addDoc(feedRef, post);
        console.log(
          `Added feed post by: ${post.userName} with ID: ${docRef.id}`,
        );
      }

      setStatus("Social feed added successfully!");
      Alert.alert(
        "Success! 🔥",
        "Sample social feed posts have been added to Firebase! Your feed is now ready!",
      );
    } catch (error) {
      console.error("Error adding social feed:", error);
      setStatus("Error adding social feed");
      Alert.alert("Error", error.message);
    } finally {
      setLoading(false);
    }
  };

  const setupAllData = async () => {
    try {
      setLoading(true);
      setStatus("Setting up complete FightTracker database...");

      // Setup everything in sequence
      await setupTrainingSessions();
      await setupAchievements();
      await setupChallenges();
      await setupSocialFeed(); // NEW

      setStatus("Complete setup finished!");
      Alert.alert(
        "Setup Complete! 🥊🔥",
        "FightTracker database has been fully configured with:\n\n" +
          "✅ Training sessions\n" +
          "✅ Achievements system\n" +
          "✅ Challenges\n" +
          "✅ Social feed posts\n" +
          "✅ Community features\n\n" +
          "Your app is now ready for the revolutionary social training experience!",
        [{ text: "Let's Fight!", style: "default" }],
      );
    } catch (error) {
      console.error("Error in complete setup:", error);
      setStatus("Error in complete setup");
      Alert.alert("Error", error.message);
    } finally {
      setLoading(false);
    }
  };

  const checkData = async () => {
    try {
      setLoading(true);
      setStatus("Checking data...");

      // Check training sessions
      const sessionsSnapshot = await getDocs(
        collection(db, "trainingSessions"),
      );
      const sessionCount = sessionsSnapshot.size;

      // Check achievements
      const achievementsSnapshot = await getDocs(
        collection(db, "achievements"),
      );
      const achievementCount = achievementsSnapshot.size;

      // Check challenges
      const challengesSnapshot = await getDocs(collection(db, "challenges"));
      const challengeCount = challengesSnapshot.size;

      // Check social feed
      const feedSnapshot = await getDocs(collection(db, "socialFeed"));
      const feedCount = feedSnapshot.size;

      setStatus(
        `Found ${sessionCount} sessions, ${achievementCount} achievements, ${challengeCount} challenges, ${feedCount} posts`,
      );
      Alert.alert(
        "Data Check 📊",
        `FightTracker Database Status:\n\n` +
          `🥊 Training Sessions: ${sessionCount}\n` +
          `🏆 Achievements: ${achievementCount}\n` +
          `🎯 Challenges: ${challengeCount}\n` +
          `🔥 Social Feed Posts: ${feedCount}\n\n` +
          `${feedCount > 0 ? "✅ Your feed is ready!" : "❌ No feed posts yet"}`,
        [{ text: "OK", style: "default" }],
      );
    } catch (error) {
      console.error("Error checking data:", error);
      Alert.alert("Error", error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>FightTracker Complete Setup</Text>
      <Text style={styles.subtitle}>
        Setup your FightTracker database with sample training data,
        achievements, challenges, and the revolutionary social feed
      </Text>

      {status ? <Text style={styles.status}>{status}</Text> : null}

      {/* Complete Setup */}
      <TouchableOpacity
        style={[styles.button, styles.primaryButton]}
        onPress={setupAllData}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color={colors.text} />
        ) : (
          <Text style={styles.buttonText}>🥊 Complete FightTracker Setup</Text>
        )}
      </TouchableOpacity>

      {/* Individual Setup Options */}
      <TouchableOpacity
        style={styles.button}
        onPress={setupTrainingSessions}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color={colors.text} />
        ) : (
          <Text style={styles.buttonText}>💪 Setup Training Sessions</Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.button}
        onPress={setupAchievements}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color={colors.text} />
        ) : (
          <Text style={styles.buttonText}>🏆 Setup Achievements</Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.button}
        onPress={setupChallenges}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color={colors.text} />
        ) : (
          <Text style={styles.buttonText}>🎯 Setup Challenges</Text>
        )}
      </TouchableOpacity>

      {/* NEW: Social Feed Setup */}
      <TouchableOpacity
        style={[styles.button, styles.feedButton]}
        onPress={setupSocialFeed}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color={colors.text} />
        ) : (
          <Text style={styles.buttonText}>🔥 Setup Social Feed</Text>
        )}
      </TouchableOpacity>

      {/* Data Check */}
      <TouchableOpacity
        style={[styles.button, styles.secondaryButton]}
        onPress={checkData}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color={colors.primary} />
        ) : (
          <Text style={[styles.buttonText, styles.secondaryButtonText]}>
            📊 Check Current Data
          </Text>
        )}
      </TouchableOpacity>

      {/* Info */}
      <View style={styles.infoBox}>
        <Text style={styles.infoTitle}>🥊 FightTracker Setup:</Text>
        <Text style={styles.infoText}>
          • Sample training sessions (Bag Work, Sparring, Pad Work){"\n"}•
          Achievement system with rarity levels{"\n"}• Weekly and monthly
          challenges{"\n"}• 🔥 REVOLUTIONARY social feed posts{"\n"}• Fire
          reactions 🔥 and Respect badges 💪{"\n"}• Community engagement
          features{"\n"}• Ready for the Instagram of fighting sports!
        </Text>
      </View>

      <Text style={styles.note}>
        ⚠️ Note: This setup creates sample data for development and testing.
        Remove this component before production deployment.
      </Text>
    </View>
  );
};

const styles = {
  container: {
    padding: 20,
    backgroundColor: colors.cardBackground,
    borderRadius: 15,
    margin: 20,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    color: colors.text,
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 20,
  },
  status: {
    fontSize: 14,
    color: colors.primary,
    marginBottom: 15,
    textAlign: "center",
  },
  button: {
    backgroundColor: colors.primary,
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 20,
    marginBottom: 10,
    alignItems: "center",
  },
  primaryButton: {
    backgroundColor: colors.primary,
    borderWidth: 2,
    borderColor: colors.primary + "80",
  },
  feedButton: {
    backgroundColor: colors.secondary,
    borderWidth: 2,
    borderColor: colors.secondary + "80",
  },
  secondaryButton: {
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: colors.primary,
  },
  buttonText: {
    color: colors.text,
    fontWeight: "600",
    fontSize: 16,
  },
  secondaryButtonText: {
    color: colors.primary,
  },
  infoBox: {
    backgroundColor: colors.backgroundLight,
    borderRadius: 8,
    padding: 15,
    marginTop: 15,
    marginBottom: 15,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.text,
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  note: {
    fontSize: 12,
    color: colors.textSecondary,
    textAlign: "center",
    marginTop: 15,
    fontStyle: "italic",
  },
};

export default SetupComponent;
