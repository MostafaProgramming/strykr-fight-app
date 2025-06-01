// src/components/SetupComponent.js
// Complete, working setup component with proper JSX structure

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

  const sampleAchievements = [
    {
      title: "First Class",
      description: "Completed your first training session",
      icon: "trophy-outline",
      points: 10,
      category: "milestone",
    },
    {
      title: "Consistent Warrior",
      description: "Trained 10 days in a row",
      icon: "flame-outline",
      points: 50,
      category: "consistency",
    },
    {
      title: "Early Bird",
      description: "Attended 10 morning classes",
      icon: "sunny-outline",
      points: 30,
      category: "dedication",
    },
    {
      title: "Weekend Warrior",
      description: "Perfect weekend attendance for a month",
      icon: "calendar-outline",
      points: 40,
      category: "consistency",
    },
    {
      title: "Sparring Ready",
      description: "Completed 5 sparring sessions",
      icon: "shield-outline",
      points: 75,
      category: "skill",
    },
    {
      title: "Technique Master",
      description: "Attended 20 intermediate classes",
      icon: "star-outline",
      points: 60,
      category: "skill",
    },
  ];

  const setupRealisticClasses = async () => {
    try {
      setLoading(true);
      setStatus("Setting up continuous weekly recurring classes...");

      // Dynamic import to avoid import issues
      const {
        setupContinuousWeeklyClasses,
      } = require("../setup/WeeklyClassesSetup");
      const result = await setupContinuousWeeklyClasses(8); // Generate 8 weeks

      if (result.success) {
        setStatus(`Successfully created ${result.classCount} classes!`);
        Alert.alert(
          "Success! 🥊",
          `Created ${result.classCount} realistic classes for the next ${result.weeksGenerated} weeks.\n\nThis schedule will automatically maintain itself - old classes are cleaned up and new weeks are added as needed.`,
          [{ text: "Awesome!", style: "default" }],
        );
      } else {
        setStatus("Error setting up classes");
        Alert.alert("Error", result.error);
      }
    } catch (error) {
      console.error("Error setting up classes:", error);
      setStatus("Error setting up classes");
      Alert.alert("Error", error.message);
    } finally {
      setLoading(false);
    }
  };

  const maintainSchedule = async () => {
    try {
      setLoading(true);
      setStatus("Maintaining schedule...");

      const { maintainSchedule } = require("../setup/WeeklyClassesSetup");
      const result = await maintainSchedule();

      if (result.success) {
        setStatus("Schedule maintained successfully!");
        Alert.alert("Schedule Updated! 🔄", result.message, [
          { text: "Great!", style: "default" },
        ]);
      } else {
        setStatus("Error maintaining schedule");
        Alert.alert("Error", result.error);
      }
    } catch (error) {
      console.error("Error maintaining schedule:", error);
      setStatus("Error maintaining schedule");
      Alert.alert("Error", error.message);
    } finally {
      setLoading(false);
    }
  };

  const addNextWeek = async () => {
    try {
      setLoading(true);
      setStatus("Adding next week of classes...");

      const { addNextWeek } = require("../setup/WeeklyClassesSetup");
      const result = await addNextWeek();

      if (result.success) {
        setStatus(`Added ${result.classCount} classes!`);
        Alert.alert(
          "Week Added! 📅",
          `Successfully added ${result.classCount} classes for the week starting ${result.weekStart.toDateString()}`,
          [{ text: "Perfect!", style: "default" }],
        );
      } else {
        setStatus("Error adding next week");
        Alert.alert("Error", result.error);
      }
    } catch (error) {
      console.error("Error adding next week:", error);
      setStatus("Error adding next week");
      Alert.alert("Error", error.message);
    } finally {
      setLoading(false);
    }
  };

  const addSampleAchievements = async () => {
    try {
      setLoading(true);
      setStatus("Adding achievements...");

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

  const checkData = async () => {
    try {
      setLoading(true);
      setStatus("Checking data...");

      // Check classes
      const classesSnapshot = await getDocs(collection(db, "classes"));
      const classCount = classesSnapshot.size;

      // Check achievements
      const achievementsSnapshot = await getDocs(
        collection(db, "achievements"),
      );
      const achievementCount = achievementsSnapshot.size;

      // Get class breakdown by day
      const classesByDay = {};
      classesSnapshot.docs.forEach((doc) => {
        const data = doc.data();
        const date = data.datetime?.toDate();
        if (date) {
          const dayName = date.toLocaleDateString("en-US", { weekday: "long" });
          classesByDay[dayName] = (classesByDay[dayName] || 0) + 1;
        }
      });

      const breakdown = Object.entries(classesByDay)
        .map(([day, count]) => `${day}: ${count}`)
        .join("\n");

      setStatus(
        `Found ${classCount} classes and ${achievementCount} achievements`,
      );
      Alert.alert(
        "Data Check",
        `📊 Database Status:\n\n` +
          `Classes: ${classCount}\n` +
          `Achievements: ${achievementCount}\n\n` +
          `Classes by Day:\n${breakdown}`,
        [{ text: "OK", style: "default" }],
      );
    } catch (error) {
      console.error("Error checking data:", error);
      Alert.alert("Error", error.message);
    } finally {
      setLoading(false);
    }
  };

  const showScheduleSummary = () => {
    try {
      const { getScheduleSummary } = require("../setup/WeeklyClassesSetup");
      const summary = getScheduleSummary();
      const byDayText = Object.entries(summary.byDay)
        .map(([day, count]) => `${day}: ${count} classes`)
        .join("\n");

      const byLevelText = Object.entries(summary.byLevel)
        .map(([level, count]) => `${level}: ${count} classes`)
        .join("\n");

      Alert.alert(
        "Weekly Schedule Summary",
        `📅 Total Classes per Week: ${summary.totalClasses}\n\n` +
          `By Day:\n${byDayText}\n\n` +
          `By Level:\n${byLevelText}`,
        [{ text: "Got it!", style: "default" }],
      );
    } catch (error) {
      Alert.alert(
        "Error",
        "Could not load schedule summary. Make sure WeeklyClassesSetup.js is created.",
      );
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Realistic Schedule Setup</Text>
      <Text style={styles.subtitle}>
        Set up your gym's actual weekly timetable in Firebase
      </Text>

      {status ? <Text style={styles.status}>{status}</Text> : null}

      <TouchableOpacity
        style={styles.button}
        onPress={showScheduleSummary}
        disabled={loading}
      >
        <Text style={styles.buttonText}>📋 View Schedule Summary</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.button, styles.primaryButton]}
        onPress={setupRealisticClasses}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color={colors.text} />
        ) : (
          <Text style={styles.buttonText}>
            🗓️ Setup Continuous Schedule (8 weeks)
          </Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.button}
        onPress={addNextWeek}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color={colors.text} />
        ) : (
          <Text style={styles.buttonText}>➕ Add Next Week</Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.button}
        onPress={maintainSchedule}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color={colors.text} />
        ) : (
          <Text style={styles.buttonText}>🔄 Maintain Schedule</Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.button}
        onPress={addSampleAchievements}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color={colors.text} />
        ) : (
          <Text style={styles.buttonText}>🏆 Add Achievements</Text>
        )}
      </TouchableOpacity>

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

      <View style={styles.infoBox}>
        <Text style={styles.infoTitle}>🔄 Continuous Scheduling:</Text>
        <Text style={styles.infoText}>
          • Initial setup: 8 weeks of classes{"\n"}• Automatic maintenance
          available{"\n"}• Add individual weeks as needed{"\n"}• Old classes
          auto-cleanup{"\n"}• Always keeps 6+ weeks scheduled{"\n"}• Perfect for
          ongoing gym operations
        </Text>
      </View>

      <View style={styles.infoBox}>
        <Text style={styles.infoTitle}>📋 What this creates per week:</Text>
        <Text style={styles.infoText}>
          • 17 different class types per week{"\n"}• Junior & Adult categories
          {"\n"}• Beginner to Advanced levels{"\n"}• Realistic pricing &
          capacity{"\n"}• Proper time slots & instructors{"\n"}• Special classes
          (Fighters, Sparring)
        </Text>
      </View>

      <Text style={styles.note}>
        ⚠️ Note: The continuous schedule maintains itself. Use "Maintain
        Schedule" weekly to clean old classes and ensure 6+ weeks are always
        scheduled ahead. Remove this component before production.
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
