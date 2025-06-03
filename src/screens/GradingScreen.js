// src/screens/GradingScreen.js
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "../constants/colors";
import { screenStyles } from "../styles/screenStyles";
import {
  GRADING_BANDS,
  getGradingBand,
  getNextGradingBand,
  getGradingProgress,
  canUserGrade,
} from "../constants/gradingSystem";
import gradingService from "../services/gradingService";

const GradingScreen = ({ member, onBack }) => {
  const [applications, setApplications] = useState([]);
  const [nextSession, setNextSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

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

  const fetchData = async () => {
    try {
      // Get user's applications
      const applicationsResult =
        await gradingService.getUserGradingApplications(member.uid);
      if (applicationsResult.success) {
        setApplications(applicationsResult.applications);
      }

      // Get next grading session
      const sessionResult = await gradingService.getNextGradingSession();
      if (sessionResult.success) {
        setNextSession(sessionResult.session);
      }
    } catch (error) {
      console.error("Error fetching grading data:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [member.uid]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  const handleGradingApplication = async () => {
    if (!nextBand) {
      Alert.alert(
        "Maximum Level",
        "You have reached the highest grading level!",
      );
      return;
    }

    if (!progress.canGrade) {
      Alert.alert(
        "Requirements Not Met",
        `You need ${progress.classesNeeded} more classes and ${progress.monthsNeeded} more months of training to apply for ${nextBand.name}.`,
      );
      return;
    }

    // Check if already has pending application
    const pendingApp = applications.find((app) => app.status === "pending");
    if (pendingApp) {
      Alert.alert(
        "Application Pending",
        "You already have a pending grading application.",
      );
      return;
    }

    Alert.alert(
      "Submit Grading Application",
      `Apply for ${nextBand.name} grading?\n\nThis will notify the instructors that you're ready to be assessed.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Submit Application",
          onPress: async () => {
            try {
              const result = await gradingService.submitGradingApplication(
                member.uid,
                {
                  name: member.name,
                  email: member.email,
                  classesAttended: userStats.classesAttended,
                  monthsTraining: userStats.monthsTraining,
                },
                currentBandId,
                nextBand.id,
              );

              if (result.success) {
                Alert.alert("Success!", result.message);
                fetchData(); // Refresh data
              } else {
                Alert.alert("Error", result.error);
              }
            } catch (error) {
              Alert.alert("Error", "Failed to submit application");
            }
          },
        },
      ],
    );
  };

  const BandDisplay = ({
    band,
    isCurrent = false,
    isNext = false,
    isLocked = false,
  }) => (
    <View
      style={[
        styles.bandCard,
        isCurrent && styles.currentBandCard,
        isNext && styles.nextBandCard,
        isLocked && styles.lockedBandCard,
      ]}
    >
      <View style={styles.bandHeader}>
        <View style={[styles.bandIcon, { backgroundColor: band.color + "20" }]}>
          <View style={[styles.bandRope, { backgroundColor: band.color }]} />
        </View>
        <View style={styles.bandInfo}>
          <Text style={[styles.bandName, isCurrent && styles.currentBandText]}>
            {band.name}
          </Text>
          <Text style={styles.bandLevel}>{band.level}</Text>
          {isCurrent && (
            <View style={styles.currentBadge}>
              <Text style={styles.currentBadgeText}>Current</Text>
            </View>
          )}
          {isNext && (
            <View style={styles.nextBadge}>
              <Text style={styles.nextBadgeText}>Next Goal</Text>
            </View>
          )}
        </View>
        {isCurrent && !progress.isMaxLevel && (
          <Text style={styles.progressPercentage}>
            {Math.round(progress.overallProgress)}%
          </Text>
        )}
      </View>

      <Text style={styles.bandDescription}>{band.description}</Text>

      {!isLocked && (
        <View style={styles.requirements}>
          <Text style={styles.requirementsTitle}>Requirements:</Text>
          {band.requirements.map((req, index) => (
            <View key={index} style={styles.requirementItem}>
              <Text style={styles.requirementBullet}>•</Text>
              <Text style={styles.requirementText}>{req}</Text>
            </View>
          ))}
        </View>
      )}

      <View style={styles.bandStats}>
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>Min. Classes:</Text>
          <Text
            style={[
              styles.statValue,
              isCurrent &&
                userStats.classesAttended >= band.minimumClasses &&
                styles.completedStat,
            ]}
          >
            {band.minimumClasses}
          </Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>Min. Time:</Text>
          <Text
            style={[
              styles.statValue,
              isCurrent &&
                userStats.monthsTraining >= band.minimumTimeMonths &&
                styles.completedStat,
            ]}
          >
            {band.minimumTimeMonths} months
          </Text>
        </View>
      </View>
    </View>
  );

  const ApplicationCard = ({ application }) => {
    const targetBand = getGradingBand(application.targetBandId);
    const statusColor = {
      pending: colors.warning,
      approved: colors.success,
      rejected: "#FF5722",
      completed: colors.success,
    }[application.status];

    return (
      <View style={styles.applicationCard}>
        <View style={styles.applicationHeader}>
          <Text style={styles.applicationTitle}>
            Application for {targetBand.name}
          </Text>
          <View
            style={[
              styles.statusBadge,
              { backgroundColor: statusColor + "20" },
            ]}
          >
            <Text style={[styles.statusText, { color: statusColor }]}>
              {application.status.toUpperCase()}
            </Text>
          </View>
        </View>

        <Text style={styles.applicationDate}>
          Submitted: {application.submittedAt.toLocaleDateString()}
        </Text>

        {application.gradingDate && (
          <Text style={styles.applicationDate}>
            Grading Date: {application.gradingDate.toLocaleDateString()}
          </Text>
        )}

        {application.notes && (
          <Text style={styles.applicationNotes}>{application.notes}</Text>
        )}
      </View>
    );
  };

  if (loading) {
    return (
      <View style={screenStyles.container}>
        <View style={screenStyles.screenHeader}>
          <TouchableOpacity onPress={onBack}>
            <Ionicons name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={screenStyles.screenTitle}>Grading Progress</Text>
          <View style={{ width: 24 }} />
        </View>

        <View
          style={[
            screenStyles.content,
            { justifyContent: "center", alignItems: "center" },
          ]}
        >
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={{ color: colors.text, marginTop: 10 }}>
            Loading grading information...
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={screenStyles.container}>
      {/* Header */}
      <View style={screenStyles.screenHeader}>
        <TouchableOpacity onPress={onBack}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={screenStyles.screenTitle}>Grading Progress</Text>
        <View style={{ width: 24 }} />
      </View>

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
        {/* Current Progress Overview */}
        <View style={styles.progressOverview}>
          <Text style={screenStyles.sectionTitle}>Your Progress</Text>

          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>{userStats.classesAttended}</Text>
              <Text style={styles.statLabel}>Classes Attended</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>{userStats.monthsTraining}</Text>
              <Text style={styles.statLabel}>Months Training</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>{currentBand.id}/10</Text>
              <Text style={styles.statLabel}>Current Level</Text>
            </View>
          </View>

          {!progress.isMaxLevel && (
            <View style={styles.progressBarContainer}>
              <Text style={styles.progressTitle}>
                Progress to {nextBand.name}
              </Text>
              <View style={styles.progressBar}>
                <View
                  style={[
                    styles.progressFill,
                    { width: `${progress.overallProgress}%` },
                  ]}
                />
              </View>
              <Text style={styles.progressText}>
                {Math.round(progress.overallProgress)}% complete
              </Text>
            </View>
          )}
        </View>

        {/* Current Band */}
        <View style={screenStyles.settingsSection}>
          <Text style={screenStyles.sectionTitle}>Current Band</Text>
          <BandDisplay band={currentBand} isCurrent={true} />
        </View>

        {/* Next Band */}
        {nextBand && (
          <View style={screenStyles.settingsSection}>
            <Text style={screenStyles.sectionTitle}>Next Goal</Text>
            <BandDisplay band={nextBand} isNext={true} />

            {progress.canGrade ? (
              <TouchableOpacity
                style={styles.applyButton}
                onPress={handleGradingApplication}
              >
                <Ionicons name="trophy" size={20} color={colors.text} />
                <Text style={styles.applyButtonText}>
                  Apply for {nextBand.name} Grading
                </Text>
              </TouchableOpacity>
            ) : (
              <View style={styles.requirementsInfo}>
                <Text style={styles.requirementsInfoTitle}>
                  Requirements for Next Grading:
                </Text>
                {progress.classesNeeded > 0 && (
                  <Text style={styles.requirementNeeded}>
                    • {progress.classesNeeded} more classes needed
                  </Text>
                )}
                {progress.monthsNeeded > 0 && (
                  <Text style={styles.requirementNeeded}>
                    • {progress.monthsNeeded} more months of training needed
                  </Text>
                )}
              </View>
            )}
          </View>
        )}

        {/* Grading Applications */}
        {applications.length > 0 && (
          <View style={screenStyles.settingsSection}>
            <Text style={screenStyles.sectionTitle}>Grading Applications</Text>
            {applications.map((app) => (
              <ApplicationCard key={app.id} application={app} />
            ))}
          </View>
        )}

        {/* Next Grading Session */}
        {nextSession && (
          <View style={screenStyles.settingsSection}>
            <Text style={screenStyles.sectionTitle}>Next Grading Session</Text>
            <View style={styles.sessionCard}>
              <View style={styles.sessionHeader}>
                <Ionicons name="calendar" size={24} color={colors.primary} />
                <Text style={styles.sessionTitle}>Upcoming Grading</Text>
              </View>
              <Text style={styles.sessionDate}>
                {nextSession.date.toLocaleDateString("en-US", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </Text>
              <Text style={styles.sessionTime}>
                {nextSession.date.toLocaleTimeString("en-US", {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </Text>
              {nextSession.location && (
                <Text style={styles.sessionLocation}>
                  {nextSession.location}
                </Text>
              )}
            </View>
          </View>
        )}

        {/* All Bands Overview */}
        <View style={screenStyles.settingsSection}>
          <Text style={screenStyles.sectionTitle}>
            Muay Thai Grading System
          </Text>
          {GRADING_BANDS.map((band) => (
            <BandDisplay
              key={band.id}
              band={band}
              isCurrent={band.id === currentBandId}
              isNext={band.id === nextBand?.id}
              isLocked={band.id > (nextBand?.id || currentBandId)}
            />
          ))}
        </View>
      </ScrollView>
    </View>
  );
};

const styles = {
  progressOverview: {
    marginTop: 20,
    marginBottom: 30,
  },
  statsGrid: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 20,
  },
  statCard: {
    alignItems: "center",
    backgroundColor: colors.cardBackground,
    borderRadius: 12,
    padding: 15,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    minWidth: 80,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: "bold",
    color: colors.primary,
    marginBottom: 5,
  },
  statLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    textAlign: "center",
  },
  progressBarContainer: {
    backgroundColor: colors.cardBackground,
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  progressTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.text,
    marginBottom: 10,
  },
  progressBar: {
    height: 8,
    backgroundColor: colors.backgroundLight,
    borderRadius: 4,
    marginBottom: 8,
  },
  progressFill: {
    height: "100%",
    backgroundColor: colors.primary,
    borderRadius: 4,
  },
  progressText: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  bandCard: {
    backgroundColor: colors.cardBackground,
    borderRadius: 15,
    padding: 20,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  currentBandCard: {
    borderColor: colors.primary,
    borderWidth: 2,
  },
  nextBandCard: {
    borderColor: colors.warning,
    borderWidth: 2,
  },
  lockedBandCard: {
    opacity: 0.6,
  },
  bandHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
  },
  bandIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 15,
  },
  bandRope: {
    width: 30,
    height: 4,
    borderRadius: 2,
  },
  bandInfo: {
    flex: 1,
  },
  bandName: {
    fontSize: 18,
    fontWeight: "bold",
    color: colors.text,
    marginBottom: 4,
  },
  currentBandText: {
    color: colors.primary,
  },
  bandLevel: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 8,
  },
  currentBadge: {
    backgroundColor: colors.primary + "20",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: "flex-start",
  },
  currentBadgeText: {
    fontSize: 12,
    fontWeight: "600",
    color: colors.primary,
  },
  nextBadge: {
    backgroundColor: colors.warning + "20",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: "flex-start",
  },
  nextBadgeText: {
    fontSize: 12,
    fontWeight: "600",
    color: colors.warning,
  },
  progressPercentage: {
    fontSize: 20,
    fontWeight: "bold",
    color: colors.primary,
  },
  bandDescription: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
    marginBottom: 15,
  },
  requirements: {
    marginBottom: 15,
  },
  requirementsTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.text,
    marginBottom: 8,
  },
  requirementItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 4,
  },
  requirementBullet: {
    fontSize: 14,
    color: colors.primary,
    marginRight: 8,
    marginTop: 2,
  },
  requirementText: {
    fontSize: 14,
    color: colors.textSecondary,
    flex: 1,
    lineHeight: 20,
  },
  bandStats: {
    flexDirection: "row",
    justifyContent: "space-around",
    backgroundColor: colors.backgroundLight,
    borderRadius: 8,
    padding: 12,
  },
  statItem: {
    alignItems: "center",
  },
  statLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  statValue: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.text,
  },
  completedStat: {
    color: colors.success,
  },
  applyButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.primary,
    borderRadius: 12,
    paddingVertical: 15,
    marginTop: 15,
    gap: 8,
  },
  applyButtonText: {
    color: colors.text,
    fontWeight: "600",
    fontSize: 16,
  },
  requirementsInfo: {
    backgroundColor: colors.warning + "10",
    borderRadius: 12,
    padding: 15,
    marginTop: 15,
    borderWidth: 1,
    borderColor: colors.warning + "30",
  },
  requirementsInfoTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.text,
    marginBottom: 8,
  },
  requirementNeeded: {
    fontSize: 14,
    color: colors.warning,
    marginBottom: 4,
  },
  applicationCard: {
    backgroundColor: colors.cardBackground,
    borderRadius: 12,
    padding: 15,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  applicationHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  applicationTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.text,
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "600",
  },
  applicationDate: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  applicationNotes: {
    fontSize: 14,
    color: colors.text,
    fontStyle: "italic",
    marginTop: 8,
  },
  sessionCard: {
    backgroundColor: colors.cardBackground,
    borderRadius: 15,
    padding: 20,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  sessionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
    gap: 10,
  },
  sessionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: colors.text,
  },
  sessionDate: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.primary,
    marginBottom: 5,
  },
  sessionTime: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 5,
  },
  sessionLocation: {
    fontSize: 14,
    color: colors.textSecondary,
  },
};

export default GradingScreen;
