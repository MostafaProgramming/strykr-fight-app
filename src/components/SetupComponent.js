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
      date: new Date(),
      notes: "Focused on power combinations",
      calories: 280,
      userId: "sample_user_1",
    },
    {
      type: "Sparring",
      rounds: 5,
      intensity: 9,
      duration: 25,
      date: new Date(Date.now() - 24 * 60 * 60 * 1000),
      notes: "Great defensive work",
      calories: 350,
      userId: "sample_user_1",
    },
    {
      type: "Pad Work",
      rounds: 8,
      intensity: 7,
      duration: 40,
      date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      notes: "Working on timing",
      calories: 320,
      userId: "sample_user_1",
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

  const sampleFeedPosts = [
    {
      userId: "sample_user_1",
      userName: "Mike Rodriguez",
      userAvatar: "MR",
      userGym: "Iron Fist Gym",
      userLevel: "Amateur",
      sessionType: "Sparring",
      sessionDuration: 45,
      sessionRounds: 8,
      sessionIntensity: 9,
      sessionNotes: "Epic sparring session! Really pushed my limits today 💪",
      timestamp: new Date(),
      likes: [],
      comments: [],
    },
    {
      userId: "sample_user_2",
      userName: "Sarah Chen",
      userAvatar: "SC",
      userGym: "Warriors Academy",
      userLevel: "Pro",
      sessionType: "Pad Work",
      sessionDuration: 60,
      sessionRounds: 12,
      sessionIntensity: 8,
      sessionNotes:
        "Perfect technique session. Left hook is getting deadly! 🔥",
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
      likes: [],
      comments: [],
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

  const setupFeedPosts = async () => {
    try {
      setLoading(true);
      setStatus("Setting up social feed...");

      const feedRef = collection(db, "socialFeed");

      for (const post of sampleFeedPosts) {
        const docRef = await addDoc(feedRef, post);
        console.log(
          `Added feed post by: ${post.userName} with ID: ${docRef.id}`,
        );
      }

      setStatus("Social feed added successfully!");
      Alert.alert(
        "Success",
        "Sample social feed posts have been added to Firebase!",
      );
    } catch (error) {
      console.error("Error adding feed posts:", error);
      setStatus("Error adding feed posts");
      Alert.alert("Error", error.message);
    } finally {
      setLoading(false);
    }
  };

  const setupAllData = async () => {
    try {
      setLoading(true);
      setStatus("Setting up complete FightTracker database...");

      await setupTrainingSessions();
      await setupAchievements();
      await setupChallenges();
      await setupFeedPosts();

      setStatus("Complete setup finished!");
      Alert.alert(
        "Setup Complete! 🥊",
        "FightTracker database has been fully configured with sample data including training sessions, achievements, challenges, and social feed posts.",
        [{ text: "Awesome!", style: "default" }],
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
        "Data Check",
        `📊 FightTracker Database Status:\n\n` +
          `Training Sessions: ${sessionCount}\n` +
          `Achievements: ${achievementCount}\n` +
          `Challenges: ${challengeCount}\n` +
          `Social Feed Posts: ${feedCount}`,
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
        achievements, challenges, and social features
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

      <TouchableOpacity
        style={styles.button}
        onPress={setupFeedPosts}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color={colors.text} />
        ) : (
          <Text style={styles.buttonText}>📱 Setup Social Feed</Text>
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
          challenges{"\n"}• Social feed posts for community features{"\n"}•
          Complete fighter profile data{"\n"}• Ready for production use
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
