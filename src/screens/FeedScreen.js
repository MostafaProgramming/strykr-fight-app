import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  FlatList,
  RefreshControl,
  Image,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "../constants/colors";
import { screenStyles } from "../styles/screenStyles";

const FeedScreen = ({ member }) => {
  const [feedData, setFeedData] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState("all");

  useEffect(() => {
    // Mock feed data
    setFeedData([
      {
        id: 1,
        user: {
          name: "Mike Rodriguez",
          avatar: "MR",
          gym: "Iron Fist Gym",
          level: "Amateur",
        },
        session: {
          type: "Sparring",
          duration: 45,
          rounds: 8,
          intensity: 9,
          notes:
            "Great sparring session today! Really worked on my defensive footwork and counter-punching.",
        },
        timestamp: "2 hours ago",
        likes: 12,
        comments: 3,
        isLiked: false,
      },
      {
        id: 2,
        user: {
          name: "Sarah Chen",
          avatar: "SC",
          gym: "Warriors Academy",
          level: "Pro",
        },
        session: {
          type: "Pad Work",
          duration: 60,
          rounds: 12,
          intensity: 8,
          notes:
            "Power combinations focused session. Coach says my left hook is getting scary! 💪",
        },
        timestamp: "4 hours ago",
        likes: 24,
        comments: 7,
        isLiked: true,
      },
      {
        id: 3,
        user: {
          name: "Tommy Nguyen",
          avatar: "TN",
          gym: "8 Limbs Muay Thai",
          level: "Beginner",
        },
        session: {
          type: "Bag Work",
          duration: 30,
          rounds: 6,
          intensity: 6,
          notes:
            "First week back after injury. Taking it slow but feels good to be training again!",
        },
        timestamp: "6 hours ago",
        likes: 18,
        comments: 5,
        isLiked: false,
      },
      {
        id: 4,
        user: {
          name: "Alex Johnson",
          avatar: "AJ",
          gym: "Fight Club Elite",
          level: "Intermediate",
        },
        session: {
          type: "Strength",
          duration: 90,
          rounds: 0,
          intensity: 7,
          notes:
            "Leg day + core work. Building that foundation for better kicks and stability.",
        },
        timestamp: "8 hours ago",
        likes: 15,
        comments: 2,
        isLiked: true,
      },
      {
        id: 5,
        user: {
          name: "Maria Santos",
          avatar: "MS",
          gym: "Phoenix Boxing",
          level: "Amateur",
        },
        session: {
          type: "Drills",
          duration: 40,
          rounds: 10,
          intensity: 5,
          notes:
            "Technical drilling session. Footwork patterns and head movement. Slow and steady!",
        },
        timestamp: "1 day ago",
        likes: 9,
        comments: 1,
        isLiked: false,
      },
    ]);
  }, []);

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

  const getLevelColor = (level) => {
    switch (level.toLowerCase()) {
      case "beginner":
        return colors.intensityLow;
      case "intermediate":
        return colors.intensityMedium;
      case "amateur":
        return colors.intensityHigh;
      case "pro":
        return colors.intensityMax;
      default:
        return colors.textSecondary;
    }
  };

  const handleLike = (postId) => {
    setFeedData((prevData) =>
      prevData.map((post) =>
        post.id === postId
          ? {
              ...post,
              likes: post.isLiked ? post.likes - 1 : post.likes + 1,
              isLiked: !post.isLiked,
            }
          : post,
      ),
    );
  };

  const FeedPost = ({ post }) => (
    <View style={styles.feedPost}>
      {/* User Header */}
      <View style={styles.userHeader}>
        <View style={styles.userAvatar}>
          <Text style={styles.userAvatarText}>{post.user.avatar}</Text>
        </View>
        <View style={styles.userInfo}>
          <Text style={styles.userName}>{post.user.name}</Text>
          <View style={styles.userMeta}>
            <Text style={styles.userGym}>{post.user.gym}</Text>
            <View
              style={[
                styles.levelBadge,
                { backgroundColor: getLevelColor(post.user.level) + "20" },
              ]}
            >
              <Text
                style={[
                  styles.levelText,
                  { color: getLevelColor(post.user.level) },
                ]}
              >
                {post.user.level}
              </Text>
            </View>
          </View>
        </View>
        <Text style={styles.timestamp}>{post.timestamp}</Text>
      </View>

      {/* Training Session */}
      <View style={styles.sessionContent}>
        <View style={styles.sessionHeader}>
          <View
            style={[
              styles.sessionTypeIcon,
              {
                backgroundColor: getTrainingTypeColor(post.session.type) + "20",
              },
            ]}
          >
            <Ionicons
              name="fitness"
              size={20}
              color={getTrainingTypeColor(post.session.type)}
            />
          </View>
          <Text style={styles.sessionType}>{post.session.type}</Text>
          <View
            style={[
              styles.intensityBadge,
              {
                backgroundColor:
                  getIntensityColor(post.session.intensity) + "20",
              },
            ]}
          >
            <Text
              style={[
                styles.intensityText,
                { color: getIntensityColor(post.session.intensity) },
              ]}
            >
              RPE {post.session.intensity}
            </Text>
          </View>
        </View>

        <View style={styles.sessionStats}>
          <View style={styles.sessionStat}>
            <Ionicons name="timer" size={16} color={colors.textSecondary} />
            <Text style={styles.sessionStatText}>
              {post.session.duration} min
            </Text>
          </View>
          {post.session.rounds > 0 && (
            <View style={styles.sessionStat}>
              <Ionicons name="repeat" size={16} color={colors.textSecondary} />
              <Text style={styles.sessionStatText}>
                {post.session.rounds} rounds
              </Text>
            </View>
          )}
        </View>

        {post.session.notes && (
          <Text style={styles.sessionNotes}>{post.session.notes}</Text>
        )}
      </View>

      {/* Actions */}
      <View style={styles.postActions}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => handleLike(post.id)}
        >
          <Ionicons
            name={post.isLiked ? "heart" : "heart-outline"}
            size={20}
            color={post.isLiked ? colors.primary : colors.textSecondary}
          />
          <Text
            style={[
              styles.actionText,
              post.isLiked && { color: colors.primary },
            ]}
          >
            {post.likes}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionButton}>
          <Ionicons
            name="chatbubble-outline"
            size={20}
            color={colors.textSecondary}
          />
          <Text style={styles.actionText}>{post.comments}</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionButton}>
          <Ionicons
            name="share-outline"
            size={20}
            color={colors.textSecondary}
          />
        </TouchableOpacity>
      </View>
    </View>
  );

  const filters = [
    { id: "all", label: "All", icon: "list" },
    { id: "following", label: "Following", icon: "people" },
    { id: "gym", label: "My Gym", icon: "business" },
    { id: "level", label: "My Level", icon: "trophy-outline" },
  ];

  return (
    <View style={screenStyles.container}>
      {/* Filters */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.filtersContainer}
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
            >
              {filter.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Feed */}
      <FlatList
        data={feedData}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => <FeedPost post={item} />}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 20 }}
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
              name="people-outline"
              size={64}
              color={colors.textSecondary}
            />
            <Text style={screenStyles.emptyTitle}>No Posts Yet</Text>
            <Text style={screenStyles.emptyDesc}>
              Follow other fighters to see their training updates!
            </Text>
          </View>
        }
      />
    </View>
  );
};

const styles = {
  filtersContainer: {
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: colors.cardBorder,
  },
  filterButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.cardBackground,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 10,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    gap: 6,
  },
  activeFilterButton: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  filterText: {
    color: colors.textSecondary,
    fontSize: 14,
    fontWeight: "500",
  },
  activeFilterText: {
    color: colors.text,
  },
  feedPost: {
    backgroundColor: colors.cardBackground,
    borderBottomWidth: 1,
    borderBottomColor: colors.cardBorder,
    padding: 20,
  },
  userHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
  },
  userAvatar: {
    width: 44,
    height: 44,
    backgroundColor: colors.primary,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  userAvatarText: {
    color: colors.text,
    fontWeight: "bold",
    fontSize: 16,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: "bold",
    color: colors.text,
    marginBottom: 2,
  },
  userMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  userGym: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  levelBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  levelText: {
    fontSize: 10,
    fontWeight: "600",
  },
  timestamp: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  sessionContent: {
    marginBottom: 15,
  },
  sessionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
    gap: 10,
  },
  sessionTypeIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  sessionType: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.text,
    flex: 1,
  },
  intensityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  intensityText: {
    fontSize: 12,
    fontWeight: "600",
  },
  sessionStats: {
    flexDirection: "row",
    gap: 20,
    marginBottom: 10,
  },
  sessionStat: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  sessionStatText: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  sessionNotes: {
    fontSize: 14,
    color: colors.text,
    lineHeight: 20,
    marginTop: 5,
  },
  postActions: {
    flexDirection: "row",
    alignItems: "center",
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: colors.cardBorder,
    gap: 20,
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  actionText: {
    fontSize: 14,
    color: colors.textSecondary,
    fontWeight: "500",
  },
};

export default FeedScreen;
