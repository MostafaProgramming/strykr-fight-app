import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  FlatList,
  RefreshControl,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "../constants/colors";
import { screenStyles } from "../styles/screenStyles";
import trainingService from "../services/trainingService";
import achievementsService from "../services/achievementsService";

const TrainingScreen = ({ member, onNavigate }) => {
  const [selectedView, setSelectedView] = useState("list");
  const [trainingSessions, setTrainingSessions] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTrainingSessions();
  }, []);

  const loadTrainingSessions = async () => {
    try {
      setLoading(true);
      const result = await trainingService.getUserTrainingSessions(member.uid);

      if (result.success) {
        setTrainingSessions(result.sessions);
      } else {
        Alert.alert("Error", "Failed to load training sessions");
      }
    } catch (error) {
      console.error("Error loading sessions:", error);
      Alert.alert("Error", "Something went wrong loading your training data");
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = React.useCallback(async () => {
    setRefreshing(true);
    await loadTrainingSessions();
    setRefreshing(false);
  }, []);

  const handleSessionPress = (session) => {
    // Navigate to session detail view (to be implemented)
    Alert.alert(
      session.type,
      `${session.duration} minutes • RPE ${session.intensity}${session.notes ? "\n\n" + session.notes : ""}`,
      [
        { text: "Edit", onPress: () => editSession(session) },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => deleteSession(session),
        },
        { text: "Cancel", style: "cancel" },
      ],
    );
  };

  const editSession = (session) => {
    // TODO: Navigate to edit session screen
    Alert.alert("Coming Soon", "Session editing will be available soon!");
  };

  const deleteSession = async (session) => {
    Alert.alert(
      "Delete Session",
      "Are you sure you want to delete this training session?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            const result = await trainingService.deleteTrainingSession(
              session.id,
            );
            if (result.success) {
              Alert.alert("Success", "Session deleted successfully");
              loadTrainingSessions(); // Refresh the list
            } else {
              Alert.alert("Error", "Failed to delete session");
            }
          },
        },
      ],
    );
  };

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

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return "Today";
    } else if (date.toDateString() === yesterday.toDateString()) {
      return "Yesterday";
    } else {
      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      });
    }
  };

  const getFilteredSessions = () => {
    if (selectedFilter === "all") return trainingSessions;
    return trainingSessions.filter(
      (session) => session.type.toLowerCase() === selectedFilter.toLowerCase(),
    );
  };

  const TrainingCard = ({ session }) => (
    <TouchableOpacity
      style={styles.sessionCard}
      onPress={() => handleSessionPress(session)}
    >
      <View style={styles.sessionHeader}>
        <View
          style={[
            styles.sessionTypeIcon,
            { backgroundColor: getTrainingTypeColor(session.type) + "20" },
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
          <Text style={styles.sessionDateTime}>
            {formatDate(session.date)} • {session.time}
          </Text>
        </View>
        <View style={styles.sessionStats}>
          <View
            style={[
              styles.intensityBadge,
              { backgroundColor: getIntensityColor(session.intensity) + "20" },
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
          <Ionicons name="timer" size={16} color={colors.textSecondary} />
          <Text style={styles.sessionDetailText}>{session.duration} min</Text>
        </View>
        {session.rounds > 0 && (
          <View style={styles.sessionDetail}>
            <Ionicons name="repeat" size={16} color={colors.textSecondary} />
            <Text style={styles.sessionDetailText}>
              {session.rounds} rounds
            </Text>
          </View>
        )}
        <View style={styles.sessionDetail}>
          <Ionicons name="flame" size={16} color={colors.textSecondary} />
          <Text style={styles.sessionDetailText}>{session.calories} cal</Text>
        </View>
      </View>

      {session.notes && (
        <Text style={styles.sessionNotes}>{session.notes}</Text>
      )}

      {/* New indicators */}
      <View style={styles.sessionFooter}>
        <Text style={styles.sessionAge}>
          {new Date(session.createdAt).toLocaleDateString()}
        </Text>
        <TouchableOpacity
          style={styles.shareButton}
          onPress={() => shareToFeed(session)}
        >
          <Ionicons name="share-outline" size={16} color={colors.primary} />
          <Text style={styles.shareText}>Share</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  const shareToFeed = async (session) => {
    // TODO: Implement sharing to social feed
    Alert.alert("Share to Feed", "Share this session with the community?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Share",
        onPress: () => {
          // Implement feed sharing
          Alert.alert(
            "Shared!",
            "Your training session has been shared to the community feed.",
          );
        },
      },
    ]);
  };

  const filters = [
    { id: "all", label: "All", icon: "list" },
    { id: "bag work", label: "Bag", icon: "fitness" },
    { id: "pad work", label: "Pads", icon: "hand-left-outline" },
    { id: "sparring", label: "Spar", icon: "people" },
    { id: "drills", label: "Drills", icon: "repeat" },
    { id: "strength", label: "Strength", icon: "barbell-outline" },
  ];

  if (loading) {
    return (
      <View style={screenStyles.centerContent}>
        <Ionicons name="fitness" size={48} color={colors.primary} />
        <Text style={styles.loadingText}>
          Loading your training sessions...
        </Text>
      </View>
    );
  }

  return (
    <View style={screenStyles.container}>
      {/* View Toggle */}
      <View style={screenStyles.tabContainer}>
        <TouchableOpacity
          style={[
            screenStyles.tab,
            selectedView === "list" && screenStyles.activeTab,
          ]}
          onPress={() => setSelectedView("list")}
        >
          <Text
            style={[
              screenStyles.tabText,
              selectedView === "list" && screenStyles.activeTabText,
            ]}
          >
            List View
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            screenStyles.tab,
            selectedView === "calendar" && screenStyles.activeTab,
          ]}
          onPress={() => setSelectedView("calendar")}
        >
          <Text
            style={[
              screenStyles.tabText,
              selectedView === "calendar" && screenStyles.activeTabText,
            ]}
          >
            Calendar
          </Text>
        </TouchableOpacity>
      </View>

      {/* Quick Stats - Now with real data */}
      <View style={styles.quickStatsContainer}>
        <View style={styles.quickStat}>
          <Text style={styles.quickStatNumber}>{trainingSessions.length}</Text>
          <Text style={styles.quickStatLabel}>Total Sessions</Text>
        </View>
        <View style={styles.quickStat}>
          <Text style={styles.quickStatNumber}>
            {trainingSessions.reduce((sum, s) => sum + s.duration, 0)}
          </Text>
          <Text style={styles.quickStatLabel}>Total Minutes</Text>
        </View>
        <View style={styles.quickStat}>
          <Text style={styles.quickStatNumber}>
            {trainingSessions.length > 0
              ? Math.round(
                  trainingSessions.reduce((sum, s) => sum + s.intensity, 0) /
                    trainingSessions.length,
                )
              : 0}
          </Text>
          <Text style={styles.quickStatLabel}>Avg Intensity</Text>
        </View>
      </View>

      {/* Filters - FIXED */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.filtersContainer}
        contentContainerStyle={styles.filtersContentContainer}
      >
        {filters.map((filter) => (
          <TouchableOpacity
            key={filter.id}
            style={[
              styles.filterButton,
              selectedFilter === filter.id && styles.activeFilterButton,
            ]}
            onPress={() => setSelectedFilter(filter.id)}
          >
            <Ionicons
              name={filter.icon}
              size={16}
              color={
                selectedFilter === filter.id
                  ? colors.text
                  : colors.textSecondary
              }
            />
            <Text
              style={[
                styles.filterText,
                selectedFilter === filter.id && styles.activeFilterText,
              ]}
              numberOfLines={1}
            >
              {filter.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Training Sessions */}
      <FlatList
        data={getFilteredSessions()}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => <TrainingCard session={item} />}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 20 }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.primary}
            colors={[colors.primary]}
          />
        }
        ListEmptyComponent={
          <View style={screenStyles.emptyState}>
            <Ionicons
              name="fitness-outline"
              size={64}
              color={colors.textSecondary}
            />
            <Text style={screenStyles.emptyTitle}>No Training Sessions</Text>
            <Text style={screenStyles.emptyDesc}>
              Start logging your training to see your progress!
            </Text>
            <TouchableOpacity
              style={screenStyles.primaryButton}
              onPress={() => onNavigate("logtraining")}
            >
              <Text style={screenStyles.primaryButtonText}>Log Training</Text>
            </TouchableOpacity>
          </View>
        }
      />

      {/* Floating Action Button */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => onNavigate("logtraining")}
      >
        <Ionicons name="add" size={24} color={colors.text} />
      </TouchableOpacity>
    </View>
  );
};

const styles = {
  loadingText: {
    fontSize: 16,
    color: colors.textSecondary,
    marginTop: 15,
  },
  quickStatsContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    backgroundColor: colors.cardBackground,
    borderRadius: 15,
    padding: 20,
    marginHorizontal: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  quickStat: {
    alignItems: "center",
  },
  quickStatNumber: {
    fontSize: 20,
    fontWeight: "bold",
    color: colors.primary,
    marginBottom: 4,
  },
  quickStatLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    textAlign: "center",
  },
  // FIXED FILTER STYLES
  filtersContainer: {
    paddingHorizontal: 20,
    marginBottom: 20,
    minHeight: 65,
  },
  filtersContentContainer: {
    paddingHorizontal: 4,
    alignItems: "center",
    paddingVertical: 5,
  },
  filterButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.cardBackground,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginRight: 12,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    gap: 6,
    minWidth: 85,
    justifyContent: "center",
  },
  activeFilterButton: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  filterText: {
    color: colors.textSecondary,
    fontSize: 14,
    fontWeight: "500",
    textAlign: "center",
  },
  activeFilterText: {
    color: colors.text,
  },
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
  sessionDateTime: {
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
    marginBottom: 10,
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
  sessionNotes: {
    fontSize: 14,
    color: colors.text,
    fontStyle: "italic",
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: colors.cardBorder,
  },
  sessionFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: colors.cardBorder,
  },
  sessionAge: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  shareButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 5,
    backgroundColor: colors.primary + "20",
    borderRadius: 12,
  },
  shareText: {
    fontSize: 12,
    color: colors.primary,
    fontWeight: "500",
  },
  fab: {
    position: "absolute",
    bottom: 20,
    right: 20,
    width: 56,
    height: 56,
    backgroundColor: colors.primary,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
};

export default TrainingScreen;
