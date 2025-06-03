import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Dimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "../constants/colors";
import { screenStyles } from "../styles/screenStyles";

const { width } = Dimensions.get("window");

const ProgressScreen = ({ member, onNavigate }) => {
  const [selectedPeriod, setSelectedPeriod] = useState("week");
  const [achievements, setAchievements] = useState([]);
  const [stats, setStats] = useState({});

  useEffect(() => {
    // Mock achievements data
    setAchievements([
      {
        id: 1,
        title: "First Session",
        description: "Completed your first training session",
        icon: "trophy",
        earned: true,
        earnedDate: "2025-05-15",
        points: 100,
      },
      {
        id: 2,
        title: "Week Warrior",
        description: "Trained 5 times in a week",
        icon: "calendar",
        earned: true,
        earnedDate: "2025-05-28",
        points: 200,
      },
      {
        id: 3,
        title: "Sparring Ready",
        description: "Complete 10 sparring sessions",
        icon: "people",
        earned: false,
        progress: 7,
        target: 10,
        points: 500,
      },
      {
        id: 4,
        title: "Iron Will",
        description: "Train 30 days in a row",
        icon: "flame",
        earned: false,
        progress: 12,
        target: 30,
        points: 1000,
      },
      {
        id: 5,
        title: "Technique Master",
        description: "Complete 50 pad work sessions",
        icon: "hand-left",
        earned: false,
        progress: 23,
        target: 50,
        points: 750,
      },
    ]);

    // Mock stats data
    setStats({
      week: {
        sessions: 4,
        totalTime: 180,
        avgIntensity: 7.2,
        calories: 1240,
        streak: 7,
      },
      month: {
        sessions: 16,
        totalTime: 720,
        avgIntensity: 7.4,
        calories: 4980,
        streak: 7,
      },
      year: {
        sessions: 142,
        totalTime: 6240,
        avgIntensity: 7.1,
        calories: 42800,
        streak: 7,
      },
    });
  }, []);

  const periods = [
    { id: "week", label: "Week" },
    { id: "month", label: "Month" },
    { id: "year", label: "Year" },
  ];

  const currentStats = stats[selectedPeriod] || {};

  const formatTime = (minutes) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins}m`;
  };

  const StatsCard = ({ icon, label, value, unit, color = colors.primary }) => (
    <View style={styles.statsCard}>
      <View style={[styles.statsIcon, { backgroundColor: color + "20" }]}>
        <Ionicons name={icon} size={24} color={color} />
      </View>
      <Text style={styles.statsValue}>
        {value}
        {unit && <Text style={styles.statsUnit}>{unit}</Text>}
      </Text>
      <Text style={styles.statsLabel}>{label}</Text>
    </View>
  );

  const AchievementCard = ({ achievement }) => (
    <View
      style={[
        styles.achievementCard,
        !achievement.earned && styles.lockedAchievement,
      ]}
    >
      <View style={styles.achievementHeader}>
        <View
          style={[
            styles.achievementIcon,
            {
              backgroundColor: achievement.earned
                ? colors.secondary + "20"
                : colors.cardBorder,
            },
          ]}
        >
          <Ionicons
            name={achievement.icon}
            size={24}
            color={achievement.earned ? colors.secondary : colors.textSecondary}
          />
        </View>
        <View style={styles.achievementInfo}>
          <Text
            style={[
              styles.achievementTitle,
              !achievement.earned && styles.lockedText,
            ]}
          >
            {achievement.title}
          </Text>
          <Text
            style={[
              styles.achievementDesc,
              !achievement.earned && styles.lockedText,
            ]}
          >
            {achievement.description}
          </Text>
        </View>
        <View style={styles.achievementPoints}>
          <Text style={styles.pointsValue}>{achievement.points}</Text>
          <Text style={styles.pointsLabel}>pts</Text>
        </View>
      </View>

      {achievement.earned ? (
        <View style={styles.earnedBadge}>
          <Ionicons name="checkmark-circle" size={16} color={colors.success} />
          <Text style={styles.earnedText}>
            Earned {new Date(achievement.earnedDate).toLocaleDateString()}
          </Text>
        </View>
      ) : achievement.progress !== undefined ? (
        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <View
              style={[
                styles.progressFill,
                {
                  width: `${(achievement.progress / achievement.target) * 100}%`,
                },
              ]}
            />
          </View>
          <Text style={styles.progressText}>
            {achievement.progress} / {achievement.target}
          </Text>
        </View>
      ) : null}
    </View>
  );

  const TrainingTypeBreakdown = () => {
    const trainingTypes = [
      { type: "Bag Work", sessions: 45, color: colors.bagWork },
      { type: "Pad Work", sessions: 38, color: colors.padWork },
      { type: "Sparring", sessions: 25, color: colors.sparring },
      { type: "Drills", sessions: 20, color: colors.drills },
      { type: "Strength", sessions: 14, color: colors.strength },
    ];

    const totalSessions = trainingTypes.reduce(
      (sum, type) => sum + type.sessions,
      0,
    );

    return (
      <View style={styles.breakdownContainer}>
        <Text style={styles.breakdownTitle}>Training Distribution</Text>
        {trainingTypes.map((type) => (
          <View key={type.type} style={styles.breakdownItem}>
            <View style={styles.breakdownHeader}>
              <View
                style={[
                  styles.breakdownIcon,
                  { backgroundColor: type.color + "20" },
                ]}
              >
                <View
                  style={[styles.breakdownDot, { backgroundColor: type.color }]}
                />
              </View>
              <Text style={styles.breakdownType}>{type.type}</Text>
              <Text style={styles.breakdownSessions}>{type.sessions}</Text>
            </View>
            <View style={styles.breakdownProgress}>
              <View
                style={[
                  styles.breakdownProgressFill,
                  {
                    width: `${(type.sessions / totalSessions) * 100}%`,
                    backgroundColor: type.color,
                  },
                ]}
              />
            </View>
          </View>
        ))}
      </View>
    );
  };

  return (
    <ScrollView
      style={screenStyles.content}
      showsVerticalScrollIndicator={false}
    >
      {/* Period Selector */}
      <View style={screenStyles.tabContainer}>
        {periods.map((period) => (
          <TouchableOpacity
            key={period.id}
            style={[
              screenStyles.tab,
              selectedPeriod === period.id && screenStyles.activeTab,
            ]}
            onPress={() => setSelectedPeriod(period.id)}
          >
            <Text
              style={[
                screenStyles.tabText,
                selectedPeriod === period.id && screenStyles.activeTabText,
              ]}
            >
              {period.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Stats Overview */}
      <View style={screenStyles.section}>
        <Text style={screenStyles.sectionTitle}>
          {selectedPeriod === "week"
            ? "This Week"
            : selectedPeriod === "month"
              ? "This Month"
              : "This Year"}
        </Text>

        <View style={styles.statsGrid}>
          <StatsCard
            icon="fitness"
            label="Sessions"
            value={currentStats.sessions}
            color={colors.primary}
          />
          <StatsCard
            icon="timer"
            label="Total Time"
            value={formatTime(currentStats.totalTime)}
            color={colors.secondary}
          />
          <StatsCard
            icon="speedometer"
            label="Avg Intensity"
            value={currentStats.avgIntensity}
            unit="/10"
            color={colors.intensityHigh}
          />
          <StatsCard
            icon="flame"
            label="Calories"
            value={currentStats.calories?.toLocaleString()}
            color={colors.error}
          />
        </View>
      </View>

      {/* Current Streak */}
      <View style={styles.streakCard}>
        <View style={styles.streakHeader}>
          <Ionicons name="flame" size={32} color={colors.secondary} />
          <View style={styles.streakInfo}>
            <Text style={styles.streakNumber}>{currentStats.streak}</Text>
            <Text style={styles.streakLabel}>Day Streak</Text>
          </View>
        </View>
        <Text style={styles.streakDesc}>Keep it up! You're on fire 🔥</Text>
      </View>

      {/* Training Breakdown */}
      <View style={screenStyles.section}>
        <TrainingTypeBreakdown />
      </View>

      {/* Achievements */}
      <View style={screenStyles.section}>
        <View style={screenStyles.sectionHeader}>
          <Text style={screenStyles.sectionTitle}>Achievements</Text>
          <TouchableOpacity onPress={() => onNavigate("challenges")}>
            <Text style={screenStyles.seeAllText}>See All</Text>
          </TouchableOpacity>
        </View>

        {achievements.map((achievement) => (
          <AchievementCard key={achievement.id} achievement={achievement} />
        ))}
      </View>

      {/* Quick Actions */}
      <View style={screenStyles.section}>
        <Text style={screenStyles.sectionTitle}>Analytics</Text>
        <TouchableOpacity
          style={styles.analyticsButton}
          onPress={() => onNavigate("stats")}
        >
          <View style={styles.analyticsIcon}>
            <Ionicons name="analytics" size={24} color={colors.primary} />
          </View>
          <View style={styles.analyticsInfo}>
            <Text style={styles.analyticsTitle}>Detailed Statistics</Text>
            <Text style={styles.analyticsDesc}>
              View charts, trends, and detailed breakdowns
            </Text>
          </View>
          <Ionicons
            name="chevron-forward"
            size={20}
            color={colors.textSecondary}
          />
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = {
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 15,
  },
  statsCard: {
    width: (width - 60) / 2,
    backgroundColor: colors.cardBackground,
    borderRadius: 15,
    padding: 20,
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  statsIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  statsValue: {
    fontSize: 20,
    fontWeight: "bold",
    color: colors.text,
    marginBottom: 4,
  },
  statsUnit: {
    fontSize: 14,
    fontWeight: "normal",
    color: colors.textSecondary,
  },
  statsLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    textAlign: "center",
  },
  streakCard: {
    backgroundColor: colors.cardBackground,
    borderRadius: 15,
    padding: 20,
    marginHorizontal: 20,
    marginTop: 20,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  streakHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  streakInfo: {
    marginLeft: 15,
  },
  streakNumber: {
    fontSize: 24,
    fontWeight: "bold",
    color: colors.text,
  },
  streakLabel: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  streakDesc: {
    fontSize: 14,
    color: colors.text,
    fontStyle: "italic",
  },
  breakdownContainer: {
    backgroundColor: colors.cardBackground,
    borderRadius: 15,
    padding: 20,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  breakdownTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: colors.text,
    marginBottom: 20,
  },
  breakdownItem: {
    marginBottom: 15,
  },
  breakdownHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  breakdownIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  breakdownDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  breakdownType: {
    flex: 1,
    fontSize: 14,
    fontWeight: "500",
    color: colors.text,
  },
  breakdownSessions: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.primary,
  },
  breakdownProgress: {
    height: 4,
    backgroundColor: colors.backgroundLight,
    borderRadius: 2,
    marginLeft: 44,
  },
  breakdownProgressFill: {
    height: "100%",
    borderRadius: 2,
  },
  achievementCard: {
    backgroundColor: colors.cardBackground,
    borderRadius: 15,
    padding: 20,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  lockedAchievement: {
    opacity: 0.6,
  },
  achievementHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  achievementIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 15,
  },
  achievementInfo: {
    flex: 1,
  },
  achievementTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: colors.text,
    marginBottom: 4,
  },
  achievementDesc: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  lockedText: {
    opacity: 0.7,
  },
  achievementPoints: {
    alignItems: "center",
  },
  pointsValue: {
    fontSize: 16,
    fontWeight: "bold",
    color: colors.secondary,
  },
  pointsLabel: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  earnedBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.success + "20",
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 6,
    alignSelf: "flex-start",
    gap: 6,
  },
  earnedText: {
    fontSize: 12,
    fontWeight: "500",
    color: colors.success,
  },
  progressContainer: {
    marginTop: 10,
  },
  progressBar: {
    height: 6,
    backgroundColor: colors.backgroundLight,
    borderRadius: 3,
    marginBottom: 6,
  },
  progressFill: {
    height: "100%",
    backgroundColor: colors.primary,
    borderRadius: 3,
  },
  progressText: {
    fontSize: 12,
    color: colors.textSecondary,
    textAlign: "right",
  },
  analyticsButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.cardBackground,
    borderRadius: 15,
    padding: 20,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  analyticsIcon: {
    width: 50,
    height: 50,
    backgroundColor: colors.primary + "20",
    borderRadius: 25,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 15,
  },
  analyticsInfo: {
    flex: 1,
  },
  analyticsTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: colors.text,
    marginBottom: 4,
  },
  analyticsDesc: {
    fontSize: 14,
    color: colors.textSecondary,
  },
};

export default ProgressScreen;
