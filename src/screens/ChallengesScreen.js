import React, { useState, useEffect } from "react";
import { View, Text, ScrollView, TouchableOpacity, Alert } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "../constants/colors";
import { screenStyles } from "../styles/screenStyles";

const ChallengesScreen = ({ member, onBack }) => {
  const [selectedTab, setSelectedTab] = useState("active");
  const [challenges, setChallenges] = useState([]);
  const [achievements, setAchievements] = useState([]);

  useEffect(() => {
    // Mock challenges data
    setChallenges([
      {
        id: 1,
        title: "Week Warrior",
        description: "Train 5 times this week",
        type: "weekly",
        progress: 3,
        target: 5,
        reward: 200,
        deadline: "2025-06-08",
        status: "active",
        icon: "calendar",
        color: colors.primary,
      },
      {
        id: 2,
        title: "Intensity Beast",
        description: "Complete 3 high-intensity sessions (RPE 8+)",
        type: "weekly",
        progress: 1,
        target: 3,
        reward: 150,
        deadline: "2025-06-08",
        status: "active",
        icon: "flame",
        color: colors.intensityMax,
      },
      {
        id: 3,
        title: "Sparring Champion",
        description: "Complete 10 sparring sessions",
        type: "monthly",
        progress: 7,
        target: 10,
        reward: 500,
        deadline: "2025-06-30",
        status: "active",
        icon: "people",
        color: colors.sparring,
      },
      {
        id: 4,
        title: "Bag Destroyer",
        description: "Complete 100 rounds on the heavy bag",
        type: "monthly",
        progress: 67,
        target: 100,
        reward: 300,
        deadline: "2025-06-30",
        status: "active",
        icon: "fitness",
        color: colors.bagWork,
      },
      {
        id: 5,
        title: "Early Bird",
        description: "Train before 9 AM for 7 days",
        type: "challenge",
        progress: 2,
        target: 7,
        reward: 250,
        deadline: "2025-06-15",
        status: "active",
        icon: "sunny-outline",
        color: colors.secondary,
      },
    ]);

    // Mock achievements data
    setAchievements([
      {
        id: 1,
        title: "First Steps",
        description: "Completed your first training session",
        icon: "trophy",
        earnedDate: "2025-05-15",
        points: 100,
        rarity: "common",
      },
      {
        id: 2,
        title: "Dedication",
        description: "Trained 5 times in a week",
        icon: "calendar",
        earnedDate: "2025-05-28",
        points: 200,
        rarity: "uncommon",
      },
      {
        id: 3,
        title: "Iron Will",
        description: "Maintained a 10-day training streak",
        icon: "flame",
        earnedDate: "2025-06-01",
        points: 350,
        rarity: "rare",
      },
      {
        id: 4,
        title: "Technique Master",
        description: "Completed 25 pad work sessions",
        icon: "hand-left",
        earnedDate: "2025-06-02",
        points: 400,
        rarity: "rare",
      },
    ]);
  }, []);

  const getRarityColor = (rarity) => {
    switch (rarity) {
      case "common":
        return colors.intensityLow;
      case "uncommon":
        return colors.intensityMedium;
      case "rare":
        return colors.intensityHigh;
      case "epic":
        return colors.primary;
      case "legendary":
        return colors.secondary;
      default:
        return colors.textSecondary;
    }
  };

  const getTimeRemaining = (deadline) => {
    const now = new Date();
    const end = new Date(deadline);
    const diff = end - now;

    if (diff <= 0) return "Expired";

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

    if (days > 0) {
      return `${days}d ${hours}h left`;
    }
    return `${hours}h left`;
  };

  const handleJoinChallenge = (challengeId) => {
    Alert.alert("Join Challenge", "Are you ready to take on this challenge?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Join",
        onPress: () => {
          Alert.alert("Success!", "You've joined the challenge. Good luck! 💪");
        },
      },
    ]);
  };

  const ChallengeCard = ({ challenge }) => (
    <View style={styles.challengeCard}>
      <View style={styles.challengeHeader}>
        <View
          style={[
            styles.challengeIcon,
            { backgroundColor: challenge.color + "20" },
          ]}
        >
          <Ionicons name={challenge.icon} size={24} color={challenge.color} />
        </View>
        <View style={styles.challengeInfo}>
          <Text style={styles.challengeTitle}>{challenge.title}</Text>
          <Text style={styles.challengeDescription}>
            {challenge.description}
          </Text>
        </View>
        <View style={styles.challengeReward}>
          <Text style={styles.rewardPoints}>{challenge.reward}</Text>
          <Text style={styles.rewardLabel}>pts</Text>
        </View>
      </View>

      <View style={styles.progressSection}>
        <View style={styles.progressHeader}>
          <Text style={styles.progressText}>
            {challenge.progress} / {challenge.target}
          </Text>
          <Text style={styles.timeRemaining}>
            {getTimeRemaining(challenge.deadline)}
          </Text>
        </View>
        <View style={styles.progressBar}>
          <View
            style={[
              styles.progressFill,
              {
                width: `${(challenge.progress / challenge.target) * 100}%`,
                backgroundColor: challenge.color,
              },
            ]}
          />
        </View>
      </View>

      <View style={styles.challengeFooter}>
        <View style={styles.challengeType}>
          <Text style={styles.challengeTypeText}>
            {challenge.type.charAt(0).toUpperCase() + challenge.type.slice(1)}
          </Text>
        </View>
        {challenge.progress >= challenge.target ? (
          <View style={styles.completedBadge}>
            <Ionicons
              name="checkmark-circle"
              size={16}
              color={colors.success}
            />
            <Text style={styles.completedText}>Completed</Text>
          </View>
        ) : (
          <TouchableOpacity
            style={styles.joinButton}
            onPress={() => handleJoinChallenge(challenge.id)}
          >
            <Text style={styles.joinButtonText}>View Details</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );

  const AchievementCard = ({ achievement }) => (
    <View style={styles.achievementCard}>
      <View style={styles.achievementHeader}>
        <View
          style={[
            styles.achievementIcon,
            {
              backgroundColor: getRarityColor(achievement.rarity) + "20",
            },
          ]}
        >
          <Ionicons
            name={achievement.icon}
            size={24}
            color={getRarityColor(achievement.rarity)}
          />
        </View>
        <View style={styles.achievementInfo}>
          <Text style={styles.achievementTitle}>{achievement.title}</Text>
          <Text style={styles.achievementDescription}>
            {achievement.description}
          </Text>
        </View>
        <View style={styles.achievementPoints}>
          <Text style={styles.pointsValue}>{achievement.points}</Text>
          <Text style={styles.pointsLabel}>pts</Text>
        </View>
      </View>

      <View style={styles.achievementFooter}>
        <View
          style={[
            styles.rarityBadge,
            { backgroundColor: getRarityColor(achievement.rarity) + "20" },
          ]}
        >
          <Text
            style={[
              styles.rarityText,
              { color: getRarityColor(achievement.rarity) },
            ]}
          >
            {achievement.rarity.charAt(0).toUpperCase() +
              achievement.rarity.slice(1)}
          </Text>
        </View>
        <Text style={styles.earnedDate}>
          Earned {new Date(achievement.earnedDate).toLocaleDateString()}
        </Text>
      </View>
    </View>
  );

  const activeChallenges = challenges.filter((c) => c.status === "active");
  const completedChallenges = challenges.filter((c) => c.progress >= c.target);

  return (
    <View style={screenStyles.container}>
      {/* Header */}
      <View style={screenStyles.screenHeader}>
        <TouchableOpacity onPress={onBack}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={screenStyles.screenTitle}>Challenges</Text>
        <View style={{ width: 24 }} />
      </View>

      {/* Tab Navigation */}
      <View style={screenStyles.tabContainer}>
        <TouchableOpacity
          style={[
            screenStyles.tab,
            selectedTab === "active" && screenStyles.activeTab,
          ]}
          onPress={() => setSelectedTab("active")}
        >
          <Text
            style={[
              screenStyles.tabText,
              selectedTab === "active" && screenStyles.activeTabText,
            ]}
          >
            Active ({activeChallenges.length})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            screenStyles.tab,
            selectedTab === "achievements" && screenStyles.activeTab,
          ]}
          onPress={() => setSelectedTab("achievements")}
        >
          <Text
            style={[
              screenStyles.tabText,
              selectedTab === "achievements" && screenStyles.activeTabText,
            ]}
          >
            Achievements ({achievements.length})
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={screenStyles.content}
        showsVerticalScrollIndicator={false}
      >
        {selectedTab === "active" ? (
          <>
            {/* Weekly Challenges */}
            <View style={screenStyles.section}>
              <Text style={screenStyles.sectionTitle}>Weekly Challenges</Text>
              {activeChallenges
                .filter((c) => c.type === "weekly")
                .map((challenge) => (
                  <ChallengeCard key={challenge.id} challenge={challenge} />
                ))}
            </View>

            {/* Monthly Challenges */}
            <View style={screenStyles.section}>
              <Text style={screenStyles.sectionTitle}>Monthly Challenges</Text>
              {activeChallenges
                .filter((c) => c.type === "monthly")
                .map((challenge) => (
                  <ChallengeCard key={challenge.id} challenge={challenge} />
                ))}
            </View>

            {/* Special Challenges */}
            <View style={screenStyles.section}>
              <Text style={screenStyles.sectionTitle}>Special Challenges</Text>
              {activeChallenges
                .filter((c) => c.type === "challenge")
                .map((challenge) => (
                  <ChallengeCard key={challenge.id} challenge={challenge} />
                ))}
            </View>
          </>
        ) : (
          <>
            {/* Achievement Summary */}
            <View style={styles.summaryCard}>
              <Text style={styles.summaryTitle}>Your Achievements</Text>
              <View style={styles.summaryStats}>
                <View style={styles.summaryStat}>
                  <Text style={styles.summaryNumber}>
                    {achievements.length}
                  </Text>
                  <Text style={styles.summaryLabel}>Earned</Text>
                </View>
                <View style={styles.summaryStat}>
                  <Text style={styles.summaryNumber}>
                    {achievements.reduce((sum, a) => sum + a.points, 0)}
                  </Text>
                  <Text style={styles.summaryLabel}>Total Points</Text>
                </View>
                <View style={styles.summaryStat}>
                  <Text style={styles.summaryNumber}>
                    {
                      achievements.filter(
                        (a) => a.rarity === "rare" || a.rarity === "epic",
                      ).length
                    }
                  </Text>
                  <Text style={styles.summaryLabel}>Rare+</Text>
                </View>
              </View>
            </View>

            {/* Achievements List */}
            <View style={screenStyles.section}>
              <Text style={screenStyles.sectionTitle}>Recent Achievements</Text>
              {achievements.map((achievement) => (
                <AchievementCard
                  key={achievement.id}
                  achievement={achievement}
                />
              ))}
            </View>
          </>
        )}
      </ScrollView>
    </View>
  );
};

const styles = {
  challengeCard: {
    backgroundColor: colors.cardBackground,
    borderRadius: 15,
    padding: 20,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  challengeHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
  },
  challengeIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 15,
  },
  challengeInfo: {
    flex: 1,
  },
  challengeTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: colors.text,
    marginBottom: 4,
  },
  challengeDescription: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  challengeReward: {
    alignItems: "center",
  },
  rewardPoints: {
    fontSize: 18,
    fontWeight: "bold",
    color: colors.secondary,
  },
  rewardLabel: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  progressSection: {
    marginBottom: 15,
  },
  progressHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  progressText: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.text,
  },
  timeRemaining: {
    fontSize: 12,
    color: colors.warning,
    fontWeight: "500",
  },
  progressBar: {
    height: 6,
    backgroundColor: colors.backgroundLight,
    borderRadius: 3,
  },
  progressFill: {
    height: "100%",
    borderRadius: 3,
  },
  challengeFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  challengeType: {
    backgroundColor: colors.backgroundLight,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  challengeTypeText: {
    fontSize: 12,
    color: colors.textSecondary,
    fontWeight: "500",
  },
  completedBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.success + "20",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    gap: 4,
  },
  completedText: {
    fontSize: 12,
    fontWeight: "600",
    color: colors.success,
  },
  joinButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 12,
  },
  joinButtonText: {
    fontSize: 12,
    fontWeight: "600",
    color: colors.text,
  },
  summaryCard: {
    backgroundColor: colors.cardBackground,
    borderRadius: 15,
    padding: 20,
    marginTop: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: colors.text,
    marginBottom: 15,
    textAlign: "center",
  },
  summaryStats: {
    flexDirection: "row",
    justifyContent: "space-around",
  },
  summaryStat: {
    alignItems: "center",
  },
  summaryNumber: {
    fontSize: 24,
    fontWeight: "bold",
    color: colors.primary,
    marginBottom: 4,
  },
  summaryLabel: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  achievementCard: {
    backgroundColor: colors.cardBackground,
    borderRadius: 15,
    padding: 20,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  achievementHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
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
  achievementDescription: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
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
  achievementFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  rarityBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  rarityText: {
    fontSize: 12,
    fontWeight: "600",
  },
  earnedDate: {
    fontSize: 12,
    color: colors.textSecondary,
  },
};

export default ChallengesScreen;
