import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Animated,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "../constants/colors";
import { screenStyles } from "../styles/screenStyles";

const HomeScreen = ({ member, onNavigate }) => {
  const [refreshing, setRefreshing] = useState(false);
  const [greeting, setGreeting] = useState("");
  const [recentSessions, setRecentSessions] = useState([]);
  const fadeAnim = React.useRef(new Animated.Value(0)).current;

  // Set greeting based on time of day
  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) {
      setGreeting("Good Morning");
    } else if (hour < 17) {
      setGreeting("Good Afternoon");
    } else {
      setGreeting("Good Evening");
    }

    // Mock recent sessions
    setRecentSessions([
      {
        id: 1,
        type: "Bag Work",
        rounds: 6,
        intensity: 8,
        date: "Today",
        duration: 30,
      },
      {
        id: 2,
        type: "Sparring",
        rounds: 5,
        intensity: 9,
        date: "Yesterday",
        duration: 25,
      },
    ]);

    // Fade in animation
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();
  }, [fadeAnim]);

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1000);
  }, []);

  const getTrainingTypeColor = (type) => {
    switch (type.toLowerCase()) {
      case "bag work":
        return colors.bagWork;
      case "pad work":
        return colors.padWork;
      case "sparring":
        return colors.sparring;
      case "drills":
        return colors.drills;
      case "strength":
        return colors.strength;
      case "recovery":
        return colors.recovery;
      default:
        return colors.primary;
    }
  };

  const getIntensityColor = (intensity) => {
    if (intensity <= 3) return colors.intensityLow;
    if (intensity <= 6) return colors.intensityMedium;
    if (intensity <= 8) return colors.intensityHigh;
    return colors.intensityMax;
  };

  return (
    <ScrollView
      style={screenStyles.content}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          tintColor={colors.primary}
        />
      }
    >
      <Animated.View style={{ opacity: fadeAnim }}>
        {/* Welcome Card */}
        <View style={screenStyles.welcomeCard}>
          <Text style={screenStyles.welcomeTitle}>
            {greeting}, {member.name ? member.name.split(" ")[0] : "Fighter"}!
            🥊
          </Text>
          <Text style={screenStyles.welcomeText}>
            Ready for another training session? Your consistency is paying off!
          </Text>
        </View>

        {/* Quick Stats */}
        <View style={screenStyles.statsContainer}>
          <TouchableOpacity
            style={screenStyles.statCard}
            onPress={() => onNavigate("progress")}
          >
            <Text style={screenStyles.statNumber}>
              {member.totalSessions || 142}
            </Text>
            <Text style={screenStyles.statLabel}>Total Sessions</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={screenStyles.statCard}
            onPress={() => onNavigate("progress")}
          >
            <Text style={screenStyles.statNumber}>
              {member.currentStreak || 7}
            </Text>
            <Text style={screenStyles.statLabel}>Day Streak</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={screenStyles.statCard}
            onPress={() => onNavigate("progress")}
          >
            <Text style={screenStyles.statNumber}>
              {member.thisWeekSessions || 4}
            </Text>
            <Text style={screenStyles.statLabel}>This Week</Text>
          </TouchableOpacity>
        </View>

        {/* Quick Actions */}
        <View style={screenStyles.section}>
          <Text style={screenStyles.sectionTitle}>Quick Actions</Text>
          <View style={screenStyles.quickActionsGrid}>
            <TouchableOpacity
              style={[
                screenStyles.actionCard,
                { backgroundColor: colors.bagWork + "20" },
              ]}
              onPress={() => onNavigate("logtraining")}
            >
              <Ionicons name="fitness" size={28} color={colors.bagWork} />
              <Text style={screenStyles.actionText}>Log Training</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                screenStyles.actionCard,
                { backgroundColor: colors.secondary + "20" },
              ]}
              onPress={() => onNavigate("challenges")}
            >
              <Ionicons name="trophy" size={28} color={colors.secondary} />
              <Text style={screenStyles.actionText}>Challenges</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                screenStyles.actionCard,
                { backgroundColor: colors.padWork + "20" },
              ]}
              onPress={() => onNavigate("feed")}
            >
              <Ionicons name="people" size={28} color={colors.padWork} />
              <Text style={screenStyles.actionText}>Training Feed</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                screenStyles.actionCard,
                { backgroundColor: colors.drills + "20" },
              ]}
              onPress={() => onNavigate("stats")}
            >
              <Ionicons name="analytics" size={28} color={colors.drills} />
              <Text style={screenStyles.actionText}>My Stats</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Recent Training */}
        <View style={screenStyles.section}>
          <View style={screenStyles.sectionHeader}>
            <Text style={screenStyles.sectionTitle}>Recent Training</Text>
            <TouchableOpacity onPress={() => onNavigate("training")}>
              <Text style={screenStyles.seeAllText}>See All</Text>
            </TouchableOpacity>
          </View>

          {recentSessions.map((session) => (
            <View key={session.id} style={styles.sessionCard}>
              <View style={styles.sessionHeader}>
                <View
                  style={[
                    styles.sessionTypeIcon,
                    {
                      backgroundColor:
                        getTrainingTypeColor(session.type) + "20",
                    },
                  ]}
                >
                  <Ionicons
                    name="fitness"
                    size={20}
                    color={getTrainingTypeColor(session.type)}
                  />
                </View>
                <View style={styles.sessionInfo}>
                  <Text style={styles.sessionType}>{session.type}</Text>
                  <Text style={styles.sessionDate}>{session.date}</Text>
                </View>
                <View style={styles.sessionStats}>
                  <View
                    style={[
                      styles.intensityBadge,
                      {
                        backgroundColor:
                          getIntensityColor(session.intensity) + "20",
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.intensityText,
                        { color: getIntensityColor(session.intensity) },
                      ]}
                    >
                      RPE {session.intensity}
                    </Text>
                  </View>
                </View>
              </View>

              <View style={styles.sessionDetails}>
                <View style={styles.sessionDetail}>
                  <Ionicons
                    name="timer"
                    size={16}
                    color={colors.textSecondary}
                  />
                  <Text style={styles.sessionDetailText}>
                    {session.duration} min
                  </Text>
                </View>
                <View style={styles.sessionDetail}>
                  <Ionicons
                    name="repeat"
                    size={16}
                    color={colors.textSecondary}
                  />
                  <Text style={styles.sessionDetailText}>
                    {session.rounds} rounds
                  </Text>
                </View>
              </View>
            </View>
          ))}
        </View>

        {/* Current Goals */}
        <View style={screenStyles.goalCard}>
          <View style={screenStyles.goalHeader}>
            <Ionicons name="radio-button-on" size={24} color={colors.primary} />
            <Text style={screenStyles.goalTitle}>Weekly Goal</Text>
          </View>
          <Text style={screenStyles.goalText}>Train 5 times this week</Text>
          <View style={screenStyles.progressBar}>
            <View
              style={[
                screenStyles.progressFill,
                { width: `${((member.thisWeekSessions || 4) / 5) * 100}%` },
              ]}
            />
          </View>
          <Text style={screenStyles.progressText}>
            {member.thisWeekSessions || 4} of 5 sessions completed
          </Text>

          <TouchableOpacity
            style={screenStyles.goalButton}
            onPress={() => onNavigate("challenges")}
          >
            <Text style={screenStyles.goalButtonText}>View Challenges</Text>
          </TouchableOpacity>
        </View>

        {/* Training Tip */}
        <View style={screenStyles.quoteCard}>
          <Ionicons
            name="bulb"
            size={24}
            color={colors.secondary}
            style={{ marginBottom: 10 }}
          />
          <Text style={screenStyles.quoteText}>
            "Technique beats strength, timing beats speed, but consistency beats
            everything."
          </Text>
          <Text style={screenStyles.quoteAuthor}>- Training Wisdom</Text>
        </View>
      </Animated.View>
    </ScrollView>
  );
};

const styles = {
  sessionCard: {
    backgroundColor: colors.cardBackground,
    borderRadius: 15,
    padding: 20,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  sessionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
  },
  sessionTypeIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 15,
  },
  sessionInfo: {
    flex: 1,
  },
  sessionType: {
    fontSize: 16,
    fontWeight: "bold",
    color: colors.text,
    marginBottom: 4,
  },
  sessionDate: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  sessionStats: {
    alignItems: "flex-end",
  },
  intensityBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  intensityText: {
    fontSize: 12,
    fontWeight: "600",
  },
  sessionDetails: {
    flexDirection: "row",
    gap: 20,
  },
  sessionDetail: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  sessionDetailText: {
    fontSize: 14,
    color: colors.textSecondary,
  },
};

export default HomeScreen;
