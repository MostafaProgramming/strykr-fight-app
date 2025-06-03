// src/screens/ProgressScreen.js - Enhanced with Grading System
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "../constants/colors";
import { mockAchievements } from "../data/mockData";
import { screenStyles } from "../styles/screenStyles";
import {
  getGradingBand,
  getNextGradingBand,
  getGradingProgress,
} from "../constants/gradingSystem";
import gradingService from "../services/gradingService";

const ProgressScreen = ({ member, onNavigate }) => {
  const [gradingApplications, setGradingApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  // Calculate user's training duration in months
  const getMonthsTraining = () => {
    const memberSinceDate = new Date(member.memberSince || "2024-01-01");
    const now = new Date();
    const monthsDiff =
      (now.getFullYear() - memberSinceDate.getFullYear()) * 12 +
      (now.getMonth() - memberSinceDate.getMonth());
    return Math.max(monthsDiff, 0);
  };

  const userStats = {
    classesAttended: member.classesAttended || 0,
    monthsTraining: getMonthsTraining(),
  };

  const currentBandId = member.currentBand || 1;
  const currentBand = getGradingBand(currentBandId);
  const nextBand = getNextGradingBand(currentBandId);
  const progress = getGradingProgress(userStats, currentBandId);

  useEffect(() => {
    const fetchGradingData = async () => {
      try {
        const result = await gradingService.getUserGradingApplications(
          member.uid,
        );
        if (result.success) {
          setGradingApplications(result.applications);
        }
      } catch (error) {
        console.error("Error fetching grading data:", error);
      } finally {
        setLoading(false);
      }
    };

    if (member.uid) {
      fetchGradingData();
    } else {
      setLoading(false);
    }
  }, [member.uid]);

  const GradingProgressCard = () => (
    <TouchableOpacity
      style={styles.gradingCard}
      onPress={() => onNavigate && onNavigate("grading")}
    >
      <View style={styles.gradingHeader}>
        <View style={styles.gradingIconContainer}>
          <View
            style={[styles.gradingRope, { backgroundColor: currentBand.color }]}
          />
          <Ionicons name="trophy" size={20} color={colors.primary} />
        </View>
        <View style={styles.gradingInfo}>
          <Text style={styles.gradingTitle}>Muay Thai Grading</Text>
          <Text style={styles.currentGrade}>Current: {currentBand.name}</Text>
        </View>
        <Ionicons
          name="chevron-forward"
          size={20}
          color={colors.textSecondary}
        />
      </View>

      {!progress.isMaxLevel ? (
        <>
          <View style={styles.gradingProgressContainer}>
            <Text style={styles.nextGradeText}>Next: {nextBand.name}</Text>
            <View style={styles.gradingProgressBar}>
              <View
                style={[
                  styles.gradingProgressFill,
                  { width: `${progress.overallProgress}%` },
                ]}
              />
            </View>
            <Text style={styles.gradingProgressText}>
              {Math.round(progress.overallProgress)}% complete
            </Text>
          </View>

          <View style={styles.gradingRequirements}>
            <View style={styles.requirementRow}>
              <Ionicons
                name={
                  userStats.classesAttended >= (nextBand?.minimumClasses || 0)
                    ? "checkmark-circle"
                    : "ellipse-outline"
                }
                size={16}
                color={
                  userStats.classesAttended >= (nextBand?.minimumClasses || 0)
                    ? colors.success
                    : colors.textSecondary
                }
              />
              <Text style={styles.requirementText}>
                Classes: {userStats.classesAttended}/
                {nextBand?.minimumClasses || 0}
              </Text>
            </View>
            <View style={styles.requirementRow}>
              <Ionicons
                name={
                  userStats.monthsTraining >= (nextBand?.minimumTimeMonths || 0)
                    ? "checkmark-circle"
                    : "ellipse-outline"
                }
                size={16}
                color={
                  userStats.monthsTraining >= (nextBand?.minimumTimeMonths || 0)
                    ? colors.success
                    : colors.textSecondary
                }
              />
              <Text style={styles.requirementText}>
                Training: {userStats.monthsTraining}/
                {nextBand?.minimumTimeMonths || 0} months
              </Text>
            </View>
          </View>

          {progress.canGrade && (
            <View style={styles.readyToGradeIndicator}>
              <Ionicons name="star" size={16} color={colors.warning} />
              <Text style={styles.readyToGradeText}>
                Ready for next grading!
              </Text>
            </View>
          )}
        </>
      ) : (
        <View style={styles.maxLevelIndicator}>
          <Ionicons name="trophy" size={24} color={colors.primary} />
          <Text style={styles.maxLevelText}>Maximum Level Achieved!</Text>
          <Text style={styles.maxLevelSubtext}>
            You are a Master of Muay Thai
          </Text>
        </View>
      )}

      {/* Recent Application Status */}
      {gradingApplications.length > 0 && (
        <View style={styles.recentApplicationContainer}>
          <Text style={styles.recentApplicationTitle}>Latest Application:</Text>
          <View style={styles.recentApplication}>
            <Text style={styles.applicationGrade}>
              {getGradingBand(gradingApplications[0].targetBandId).name}
            </Text>
            <View
              style={[
                styles.applicationStatusBadge,
                {
                  backgroundColor:
                    getStatusColor(gradingApplications[0].status) + "20",
                },
              ]}
            >
              <Text
                style={[
                  styles.applicationStatusText,
                  { color: getStatusColor(gradingApplications[0].status) },
                ]}
              >
                {gradingApplications[0].status.toUpperCase()}
              </Text>
            </View>
          </View>
        </View>
      )}
    </TouchableOpacity>
  );

  const getStatusColor = (status) => {
    switch (status) {
      case "pending":
        return colors.warning;
      case "approved":
        return colors.success;
      case "rejected":
        return "#FF5722";
      case "completed":
        return colors.success;
      default:
        return colors.textSecondary;
    }
  };

  if (loading && member.uid) {
    return (
      <ScrollView
        style={screenStyles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Keep the basic progress overview while loading grading data */}
        <View style={screenStyles.progressOverview}>
          <Text style={screenStyles.sectionTitle}>Your Progress</Text>

          <View style={screenStyles.progressCard}>
            <Text style={screenStyles.progressCardTitle}>Training Journey</Text>
            <View style={screenStyles.progressStats}>
              <View style={screenStyles.progressStat}>
                <Text style={screenStyles.progressNumber}>
                  {member.classesAttended}
                </Text>
                <Text style={screenStyles.progressLabel}>Total Classes</Text>
              </View>
              <View style={screenStyles.progressStat}>
                <Text style={screenStyles.progressNumber}>
                  {member.currentStreak}
                </Text>
                <Text style={screenStyles.progressLabel}>Current Streak</Text>
              </View>
              <View style={screenStyles.progressStat}>
                <Text style={screenStyles.progressNumber}>
                  {userStats.monthsTraining}
                </Text>
                <Text style={screenStyles.progressLabel}>Months Training</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Loading indicator for grading data */}
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color={colors.primary} />
          <Text style={styles.loadingText}>Loading grading progress...</Text>
        </View>
      </ScrollView>
    );
  }

  return (
    <ScrollView
      style={screenStyles.content}
      showsVerticalScrollIndicator={false}
    >
      {/* Enhanced Progress Overview */}
      <View style={screenStyles.progressOverview}>
        <Text style={screenStyles.sectionTitle}>Your Progress</Text>

        <View style={screenStyles.progressCard}>
          <Text style={screenStyles.progressCardTitle}>Training Journey</Text>
          <View style={screenStyles.progressStats}>
            <View style={screenStyles.progressStat}>
              <Text style={screenStyles.progressNumber}>
                {member.classesAttended}
              </Text>
              <Text style={screenStyles.progressLabel}>Total Classes</Text>
            </View>
            <View style={screenStyles.progressStat}>
              <Text style={screenStyles.progressNumber}>
                {member.currentStreak}
              </Text>
              <Text style={screenStyles.progressLabel}>Current Streak</Text>
            </View>
            <View style={screenStyles.progressStat}>
              <Text style={screenStyles.progressNumber}>
                {userStats.monthsTraining}
              </Text>
              <Text style={screenStyles.progressLabel}>Months Training</Text>
            </View>
          </View>
        </View>
      </View>

      {/* Grading Progress Section */}
      <View style={screenStyles.section}>
        <Text style={screenStyles.sectionTitle}>Grading Progress</Text>
        <GradingProgressCard />
      </View>

      {/* Quick Stats Grid */}
      <View style={screenStyles.section}>
        <Text style={screenStyles.sectionTitle}>Training Statistics</Text>
        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <View style={styles.statIcon}>
              <Ionicons name="calendar" size={24} color={colors.primary} />
            </View>
            <Text style={styles.statValue}>{member.memberSince}</Text>
            <Text style={styles.statLabel}>Member Since</Text>
          </View>

          <View style={styles.statCard}>
            <View style={styles.statIcon}>
              <Ionicons name="trophy" size={24} color={colors.primary} />
            </View>
            <Text style={styles.statValue}>{currentBand.level}</Text>
            <Text style={styles.statLabel}>Current Level</Text>
          </View>

          <View style={styles.statCard}>
            <View style={styles.statIcon}>
              <Ionicons name="trending-up" size={24} color={colors.primary} />
            </View>
            <Text style={styles.statValue}>
              {Math.ceil(
                (member.classesAttended || 0) /
                  Math.max(userStats.monthsTraining, 1),
              )}
            </Text>
            <Text style={styles.statLabel}>Classes/Month</Text>
          </View>
        </View>
      </View>

      {/* Training Milestones */}
      <View style={screenStyles.section}>
        <Text style={screenStyles.sectionTitle}>Training Milestones</Text>
        <View style={styles.milestonesContainer}>
          <View
            style={[
              styles.milestoneItem,
              member.classesAttended >= 10 && styles.completedMilestone,
            ]}
          >
            <Ionicons
              name={
                member.classesAttended >= 10
                  ? "checkmark-circle"
                  : "ellipse-outline"
              }
              size={20}
              color={
                member.classesAttended >= 10
                  ? colors.success
                  : colors.textSecondary
              }
            />
            <Text style={styles.milestoneText}>First 10 Classes</Text>
            <Text style={styles.milestoneProgress}>
              {Math.min(member.classesAttended, 10)}/10
            </Text>
          </View>

          <View
            style={[
              styles.milestoneItem,
              member.classesAttended >= 50 && styles.completedMilestone,
            ]}
          >
            <Ionicons
              name={
                member.classesAttended >= 50
                  ? "checkmark-circle"
                  : "ellipse-outline"
              }
              size={20}
              color={
                member.classesAttended >= 50
                  ? colors.success
                  : colors.textSecondary
              }
            />
            <Text style={styles.milestoneText}>Dedicated Warrior</Text>
            <Text style={styles.milestoneProgress}>
              {Math.min(member.classesAttended, 50)}/50
            </Text>
          </View>

          <View
            style={[
              styles.milestoneItem,
              member.classesAttended >= 100 && styles.completedMilestone,
            ]}
          >
            <Ionicons
              name={
                member.classesAttended >= 100
                  ? "checkmark-circle"
                  : "ellipse-outline"
              }
              size={20}
              color={
                member.classesAttended >= 100
                  ? colors.success
                  : colors.textSecondary
              }
            />
            <Text style={styles.milestoneText}>Century Club</Text>
            <Text style={styles.milestoneProgress}>
              {Math.min(member.classesAttended, 100)}/100
            </Text>
          </View>

          <View
            style={[
              styles.milestoneItem,
              userStats.monthsTraining >= 12 && styles.completedMilestone,
            ]}
          >
            <Ionicons
              name={
                userStats.monthsTraining >= 12
                  ? "checkmark-circle"
                  : "ellipse-outline"
              }
              size={20}
              color={
                userStats.monthsTraining >= 12
                  ? colors.success
                  : colors.textSecondary
              }
            />
            <Text style={styles.milestoneText}>One Year Journey</Text>
            <Text style={styles.milestoneProgress}>
              {Math.min(userStats.monthsTraining, 12)}/12 months
            </Text>
          </View>
        </View>
      </View>

      {/* Achievements */}
      <View style={screenStyles.section}>
        <Text style={screenStyles.sectionTitle}>Achievements</Text>
        {mockAchievements.map((achievement) => (
          <View
            key={achievement.id}
            style={[
              screenStyles.achievementCard,
              !achievement.earned && screenStyles.lockedAchievement,
            ]}
          >
            <Ionicons
              name={achievement.earned ? "trophy" : "lock-closed"}
              size={24}
              color={achievement.earned ? colors.primary : colors.textSecondary}
            />
            <View style={screenStyles.achievementContent}>
              <Text
                style={[
                  screenStyles.achievementTitle,
                  !achievement.earned && screenStyles.lockedText,
                ]}
              >
                {achievement.title}
              </Text>
              <Text
                style={[
                  screenStyles.achievementDesc,
                  !achievement.earned && screenStyles.lockedText,
                ]}
              >
                {achievement.desc}
              </Text>
            </View>
            {achievement.earned && (
              <View style={styles.achievementDate}>
                <Text style={styles.achievementDateText}>Earned</Text>
              </View>
            )}
          </View>
        ))}
      </View>

      {/* Training Insights */}
      <View style={screenStyles.section}>
        <Text style={screenStyles.sectionTitle}>Training Insights</Text>
        <View style={styles.insightsCard}>
          <View style={styles.insightItem}>
            <Ionicons name="analytics" size={20} color={colors.primary} />
            <View style={styles.insightContent}>
              <Text style={styles.insightTitle}>Training Consistency</Text>
              <Text style={styles.insightDescription}>
                {member.currentStreak > 7
                  ? "Excellent consistency! Keep up the great work."
                  : member.currentStreak > 3
                    ? "Good training rhythm. Try to build longer streaks."
                    : "Focus on building consistent training habits."}
              </Text>
            </View>
          </View>

          <View style={styles.insightItem}>
            <Ionicons name="trending-up" size={20} color={colors.primary} />
            <View style={styles.insightContent}>
              <Text style={styles.insightTitle}>Progress Rate</Text>
              <Text style={styles.insightDescription}>
                {!progress.isMaxLevel
                  ? `You're ${Math.round(progress.overallProgress)}% ready for ${nextBand.name} grading.`
                  : "You've mastered all grading levels - amazing dedication!"}
              </Text>
            </View>
          </View>

          <View style={styles.insightItem}>
            <Ionicons name="target" size={20} color={colors.primary} />
            <View style={styles.insightContent}>
              <Text style={styles.insightTitle}>Next Focus</Text>
              <Text style={styles.insightDescription}>
                {!progress.isMaxLevel && progress.classesNeeded > 0
                  ? `Complete ${progress.classesNeeded} more classes to meet grading requirements.`
                  : !progress.isMaxLevel && progress.monthsNeeded > 0
                    ? `Continue training for ${progress.monthsNeeded} more months.`
                    : progress.canGrade
                      ? "You're ready to apply for your next grading!"
                      : "Keep training consistently to build your skills."}
              </Text>
            </View>
          </View>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = {
  gradingCard: {
    backgroundColor: colors.cardBackground,
    borderRadius: 15,
    padding: 20,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  gradingHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
  },
  gradingIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: colors.accent,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 15,
    position: "relative",
  },
  gradingRope: {
    position: "absolute",
    top: 10,
    width: 30,
    height: 4,
    borderRadius: 2,
  },
  gradingInfo: {
    flex: 1,
  },
  gradingTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: colors.text,
    marginBottom: 4,
  },
  currentGrade: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  gradingProgressContainer: {
    marginBottom: 15,
  },
  nextGradeText: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.text,
    marginBottom: 8,
  },
  gradingProgressBar: {
    height: 8,
    backgroundColor: colors.backgroundLight,
    borderRadius: 4,
    marginBottom: 6,
  },
  gradingProgressFill: {
    height: "100%",
    backgroundColor: colors.primary,
    borderRadius: 4,
  },
  gradingProgressText: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  gradingRequirements: {
    marginBottom: 15,
  },
  requirementRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
    gap: 8,
  },
  requirementText: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  readyToGradeIndicator: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.warning + "20",
    borderRadius: 8,
    padding: 10,
    gap: 8,
  },
  readyToGradeText: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.warning,
  },
  maxLevelIndicator: {
    alignItems: "center",
    paddingVertical: 20,
  },
  maxLevelText: {
    fontSize: 18,
    fontWeight: "bold",
    color: colors.primary,
    marginTop: 10,
    marginBottom: 5,
  },
  maxLevelSubtext: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  recentApplicationContainer: {
    borderTopWidth: 1,
    borderTopColor: colors.cardBorder,
    paddingTop: 15,
    marginTop: 15,
  },
  recentApplicationTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.text,
    marginBottom: 8,
  },
  recentApplication: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  applicationGrade: {
    fontSize: 14,
    color: colors.text,
  },
  applicationStatusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  applicationStatusText: {
    fontSize: 12,
    fontWeight: "600",
  },
  loadingContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 20,
    gap: 10,
  },
  loadingText: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  statsGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 10,
  },
  statCard: {
    flex: 1,
    backgroundColor: colors.cardBackground,
    borderRadius: 12,
    padding: 15,
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  statIcon: {
    width: 40,
    height: 40,
    backgroundColor: colors.accent,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
  },
  statValue: {
    fontSize: 16,
    fontWeight: "bold",
    color: colors.text,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    textAlign: "center",
  },
  milestonesContainer: {
    gap: 10,
  },
  milestoneItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.cardBackground,
    borderRadius: 12,
    padding: 15,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  completedMilestone: {
    borderColor: colors.success + "40",
    backgroundColor: colors.success + "05",
  },
  milestoneText: {
    flex: 1,
    fontSize: 14,
    fontWeight: "500",
    color: colors.text,
    marginLeft: 12,
  },
  milestoneProgress: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.primary,
  },
  achievementDate: {
    backgroundColor: colors.success + "20",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  achievementDateText: {
    fontSize: 12,
    fontWeight: "600",
    color: colors.success,
  },
  insightsCard: {
    backgroundColor: colors.cardBackground,
    borderRadius: 15,
    padding: 20,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    gap: 20,
  },
  insightItem: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  insightContent: {
    flex: 1,
    marginLeft: 12,
  },
  insightTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.text,
    marginBottom: 4,
  },
  insightDescription: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
  },
};

export default ProgressScreen;
