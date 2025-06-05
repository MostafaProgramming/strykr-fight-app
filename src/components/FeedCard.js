import React, { useState } from "react";
import { View, Text, TouchableOpacity, Image, Dimensions } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "../constants/colors";

const { width } = Dimensions.get("window");

const FeedCard = ({
  post,
  onLike,
  onComment,
  onShare,
  onUserPress,
  onMediaPress,
}) => {
  const [isLiked, setIsLiked] = useState(post.isLiked || false);
  const [likeCount, setLikeCount] = useState(post.likeCount || 0);

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

  const handleLike = () => {
    const newIsLiked = !isLiked;
    const newLikeCount = newIsLiked ? likeCount + 1 : likeCount - 1;

    setIsLiked(newIsLiked);
    setLikeCount(newLikeCount);

    if (onLike) {
      onLike(post.id, newIsLiked);
    }
  };

  const formatTimeAgo = (timestamp) => {
    // Simple time ago formatting
    if (typeof timestamp === "string") {
      return timestamp; // Use provided string for mock data
    }

    const now = new Date();
    const diffMs = now - timestamp;
    const diffMinutes = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMinutes < 1) return "Just now";
    if (diffMinutes < 60) return `${diffMinutes}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return timestamp.toLocaleDateString();
  };

  const getIntensityBar = (intensity) => {
    const barWidth = (intensity / 10) * 100;
    return (
      <View style={styles.intensityBarContainer}>
        <View style={styles.intensityBarBackground}>
          <View
            style={[
              styles.intensityBarFill,
              {
                width: `${barWidth}%`,
                backgroundColor: getIntensityColor(intensity),
              },
            ]}
          />
        </View>
        <Text style={styles.intensityBarText}>RPE {intensity}/10</Text>
      </View>
    );
  };

  const getMoodEmoji = (mood) => {
    switch (mood?.toLowerCase()) {
      case "motivated":
        return "🔥";
      case "tired":
        return "😴";
      case "strong":
        return "💪";
      case "focused":
        return "🎯";
      case "pumped":
        return "⚡";
      default:
        return null;
    }
  };

  return (
    <View style={styles.card}>
      {/* User Header */}
      <View style={styles.userHeader}>
        <TouchableOpacity
          style={styles.userInfo}
          onPress={() => onUserPress && onUserPress(post.userId)}
        >
          <View style={styles.userAvatar}>
            <Text style={styles.userAvatarText}>{post.userAvatar}</Text>
          </View>
          <View style={styles.userDetails}>
            <View style={styles.userNameRow}>
              <Text style={styles.userName}>{post.userName}</Text>
              {getMoodEmoji(post.sessionMood) && (
                <Text style={styles.moodEmoji}>
                  {getMoodEmoji(post.sessionMood)}
                </Text>
              )}
            </View>
            <View style={styles.userMeta}>
              <Text style={styles.userGym}>{post.userGym}</Text>
              <View
                style={[
                  styles.levelBadge,
                  { backgroundColor: getLevelColor(post.userLevel) + "20" },
                ]}
              >
                <Text
                  style={[
                    styles.levelText,
                    { color: getLevelColor(post.userLevel) },
                  ]}
                >
                  {post.userLevel}
                </Text>
              </View>
            </View>
          </View>
        </TouchableOpacity>
        <Text style={styles.timestamp}>{formatTimeAgo(post.timestamp)}</Text>
      </View>

      {/* Training Session Header */}
      <View style={styles.sessionHeader}>
        <View
          style={[
            styles.sessionTypeIcon,
            { backgroundColor: getTrainingTypeColor(post.sessionType) + "20" },
          ]}
        >
          <Ionicons
            name="fitness"
            size={24}
            color={getTrainingTypeColor(post.sessionType)}
          />
        </View>
        <View style={styles.sessionHeaderText}>
          <Text style={styles.sessionType}>
            {post.sessionType.toUpperCase()}
          </Text>
          <Text style={styles.sessionSubtitle}>Training Session</Text>
        </View>
      </View>

      {/* Intensity Bar */}
      {getIntensityBar(post.sessionIntensity)}

      {/* Media Section */}
      {post.media && post.media.length > 0 && (
        <TouchableOpacity
          style={styles.mediaContainer}
          onPress={() => onMediaPress && onMediaPress(post.media)}
        >
          <Image
            source={{ uri: post.media[0].downloadURL }}
            style={styles.mediaImage}
            resizeMode="cover"
          />
          {post.media.length > 1 && (
            <View style={styles.mediaCountBadge}>
              <Text style={styles.mediaCountText}>
                +{post.media.length - 1}
              </Text>
            </View>
          )}
          <View style={styles.mediaOverlay}>
            <Ionicons
              name="play-circle"
              size={48}
              color="rgba(255,255,255,0.8)"
            />
          </View>
        </TouchableOpacity>
      )}

      {/* Session Stats */}
      <View style={styles.sessionStats}>
        <View style={styles.statItem}>
          <Ionicons name="timer" size={16} color={colors.textSecondary} />
          <Text style={styles.statText}>{post.sessionDuration}min</Text>
        </View>
        {post.sessionRounds > 0 && (
          <View style={styles.statItem}>
            <Ionicons name="repeat" size={16} color={colors.textSecondary} />
            <Text style={styles.statText}>{post.sessionRounds} rounds</Text>
          </View>
        )}
        <View style={styles.statItem}>
          <Ionicons name="flame" size={16} color={colors.textSecondary} />
          <Text style={styles.statText}>{post.sessionCalories || 0} cal</Text>
        </View>
      </View>

      {/* Session Notes */}
      {post.sessionNotes && (
        <Text style={styles.sessionNotes}>{post.sessionNotes}</Text>
      )}

      {/* Action Bar */}
      <View style={styles.actionBar}>
        <TouchableOpacity style={styles.actionButton} onPress={handleLike}>
          <Ionicons
            name={isLiked ? "flame" : "flame-outline"}
            size={24}
            color={isLiked ? colors.primary : colors.textSecondary}
          />
          <Text
            style={[styles.actionText, isLiked && { color: colors.primary }]}
          >
            {likeCount}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => onComment && onComment(post.id)}
        >
          <Ionicons
            name="chatbubble-outline"
            size={22}
            color={colors.textSecondary}
          />
          <Text style={styles.actionText}>{post.commentCount || 0}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => onShare && onShare(post.id)}
        >
          <Ionicons
            name="share-outline"
            size={22}
            color={colors.textSecondary}
          />
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionButton}>
          <Ionicons
            name="bookmark-outline"
            size={22}
            color={colors.textSecondary}
          />
        </TouchableOpacity>
      </View>

      {/* Engagement Indicators */}
      {(likeCount > 0 || post.commentCount > 0) && (
        <View style={styles.engagementBar}>
          {likeCount > 0 && (
            <Text style={styles.engagementText}>
              🔥 {likeCount} {likeCount === 1 ? "fire" : "fires"}
            </Text>
          )}
          {post.commentCount > 0 && (
            <Text style={styles.engagementText}>
              💬 {post.commentCount}{" "}
              {post.commentCount === 1 ? "comment" : "comments"}
            </Text>
          )}
        </View>
      )}
    </View>
  );
};

const styles = {
  card: {
    backgroundColor: colors.cardBackground,
    marginBottom: 1,
    paddingTop: 20,
    paddingHorizontal: 20,
    paddingBottom: 15,
  },

  // User Header
  userHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
  },
  userInfo: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  userAvatar: {
    width: 48,
    height: 48,
    backgroundColor: colors.primary,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  userAvatarText: {
    color: colors.text,
    fontWeight: "bold",
    fontSize: 18,
  },
  userDetails: {
    flex: 1,
  },
  userNameRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 2,
  },
  userName: {
    fontSize: 16,
    fontWeight: "bold",
    color: colors.text,
    marginRight: 8,
  },
  moodEmoji: {
    fontSize: 16,
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

  // Session Header
  sessionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  sessionTypeIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  sessionHeaderText: {
    flex: 1,
  },
  sessionType: {
    fontSize: 18,
    fontWeight: "bold",
    color: colors.text,
    letterSpacing: 0.5,
  },
  sessionSubtitle: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },

  // Intensity Bar
  intensityBarContainer: {
    marginBottom: 15,
  },
  intensityBarBackground: {
    height: 8,
    backgroundColor: colors.backgroundLight,
    borderRadius: 4,
    marginBottom: 6,
  },
  intensityBarFill: {
    height: "100%",
    borderRadius: 4,
  },
  intensityBarText: {
    fontSize: 12,
    color: colors.textSecondary,
    textAlign: "right",
    fontWeight: "500",
  },

  // Media
  mediaContainer: {
    borderRadius: 12,
    marginBottom: 15,
    overflow: "hidden",
    position: "relative",
  },
  mediaImage: {
    width: "100%",
    height: 200,
    backgroundColor: colors.backgroundLight,
  },
  mediaCountBadge: {
    position: "absolute",
    top: 10,
    right: 10,
    backgroundColor: "rgba(0,0,0,0.7)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  mediaCountText: {
    color: colors.text,
    fontSize: 12,
    fontWeight: "600",
  },
  mediaOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: "center",
    justifyContent: "center",
  },

  // Session Stats
  sessionStats: {
    flexDirection: "row",
    justifyContent: "space-around",
    backgroundColor: colors.backgroundLight,
    borderRadius: 12,
    paddingVertical: 12,
    marginBottom: 15,
  },
  statItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  statText: {
    fontSize: 14,
    color: colors.text,
    fontWeight: "500",
  },

  // Session Notes
  sessionNotes: {
    fontSize: 15,
    color: colors.text,
    lineHeight: 22,
    marginBottom: 15,
  },

  // Action Bar
  actionBar: {
    flexDirection: "row",
    alignItems: "center",
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: colors.cardBorder,
    gap: 25,
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

  // Engagement Bar
  engagementBar: {
    flexDirection: "row",
    alignItems: "center",
    gap: 15,
    marginTop: 10,
    paddingTop: 8,
  },
  engagementText: {
    fontSize: 12,
    color: colors.textSecondary,
    fontWeight: "500",
  },
};

export default FeedCard;
