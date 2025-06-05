// src/components/FeedCard.js - REVOLUTIONARY UPGRADE
import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  Dimensions,
  Animated,
  PanGestureHandler,
  State,
} from "react-native";
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
  onRespectBadge, // NEW
  onTechniqueRequest, // NEW
  onChallengeResponse, // NEW
}) => {
  const [isLiked, setIsLiked] = useState(post.isLiked || false);
  const [likeCount, setLikeCount] = useState(post.likeCount || 0);
  const [respectCount, setRespectCount] = useState(post.respectCount || 0);
  const [hasRespected, setHasRespected] = useState(post.hasRespected || false);
  const [showQuickActions, setShowQuickActions] = useState(false);

  // Animation values
  const fireScale = useState(new Animated.Value(1))[0];
  const respectScale = useState(new Animated.Value(1))[0];
  const cardShake = useState(new Animated.Value(0))[0];

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

  // NEW: Fire reaction with animation
  const handleFireReaction = () => {
    const newIsLiked = !isLiked;
    const newLikeCount = newIsLiked ? likeCount + 1 : likeCount - 1;

    setIsLiked(newIsLiked);
    setLikeCount(newLikeCount);

    // Fire animation
    Animated.sequence([
      Animated.timing(fireScale, {
        toValue: 1.5,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.timing(fireScale, {
        toValue: 1,
        duration: 150,
        useNativeDriver: true,
      }),
    ]).start();

    // Shake card on fire reaction
    if (newIsLiked) {
      Animated.sequence([
        Animated.timing(cardShake, {
          toValue: 10,
          duration: 50,
          useNativeDriver: true,
        }),
        Animated.timing(cardShake, {
          toValue: -10,
          duration: 50,
          useNativeDriver: true,
        }),
        Animated.timing(cardShake, {
          toValue: 10,
          duration: 50,
          useNativeDriver: true,
        }),
        Animated.timing(cardShake, {
          toValue: 0,
          duration: 50,
          useNativeDriver: true,
        }),
      ]).start();
    }

    if (onLike) {
      onLike(post.id, newIsLiked);
    }
  };

  // NEW: Respect badge reaction
  const handleRespectBadge = () => {
    const newHasRespected = !hasRespected;
    const newRespectCount = newHasRespected
      ? respectCount + 1
      : respectCount - 1;

    setHasRespected(newHasRespected);
    setRespectCount(newRespectCount);

    // Respect animation
    Animated.sequence([
      Animated.timing(respectScale, {
        toValue: 1.3,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(respectScale, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start();

    if (onRespectBadge) {
      onRespectBadge(post.id, newHasRespected);
    }
  };

  // NEW: Double tap for fire reaction
  const handleDoubleTap = () => {
    if (!isLiked) {
      handleFireReaction();
    }
  };

  const formatTimeAgo = (timestamp) => {
    if (typeof timestamp === "string") {
      return timestamp;
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
      case "determined":
        return "😤";
      default:
        return null;
    }
  };

  // NEW: Quick action buttons
  const QuickActions = () => (
    <View style={styles.quickActionsContainer}>
      <TouchableOpacity
        style={styles.quickActionButton}
        onPress={() => onTechniqueRequest && onTechniqueRequest(post.id)}
      >
        <Ionicons name="help-circle" size={20} color={colors.warning} />
        <Text style={styles.quickActionText}>Show me that!</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.quickActionButton}
        onPress={() => onChallengeResponse && onChallengeResponse(post.id)}
      >
        <Ionicons name="flash" size={20} color={colors.primary} />
        <Text style={styles.quickActionText}>I'll match this!</Text>
      </TouchableOpacity>
    </View>
  );

  // NEW: Achievement badge for special sessions
  const AchievementBadge = () => {
    if (post.sessionIntensity >= 9) {
      return (
        <View style={styles.achievementBadge}>
          <Ionicons name="trophy" size={14} color={colors.secondary} />
          <Text style={styles.achievementText}>Beast Mode</Text>
        </View>
      );
    }
    if (post.sessionDuration >= 90) {
      return (
        <View style={styles.achievementBadge}>
          <Ionicons name="time" size={14} color={colors.secondary} />
          <Text style={styles.achievementText}>Endurance</Text>
        </View>
      );
    }
    return null;
  };

  return (
    <Animated.View
      style={[
        styles.card,
        {
          transform: [{ translateX: cardShake }],
        },
      ]}
    >
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
              <AchievementBadge />
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
        <View style={styles.headerRight}>
          <Text style={styles.timestamp}>{formatTimeAgo(post.timestamp)}</Text>
          <TouchableOpacity
            style={styles.moreButton}
            onPress={() => setShowQuickActions(!showQuickActions)}
          >
            <Ionicons
              name="ellipsis-horizontal"
              size={20}
              color={colors.textSecondary}
            />
          </TouchableOpacity>
        </View>
      </View>

      {/* Quick Actions (NEW) */}
      {showQuickActions && <QuickActions />}

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
        {/* NEW: Live indicator */}
        {post.isLive && (
          <View style={styles.liveIndicator}>
            <View style={styles.liveDot} />
            <Text style={styles.liveText}>LIVE</Text>
          </View>
        )}
      </View>

      {/* Intensity Bar */}
      {getIntensityBar(post.sessionIntensity)}

      {/* Media Section */}
      {post.media && post.media.length > 0 && (
        <TouchableOpacity
          style={styles.mediaContainer}
          onPress={() => onMediaPress && onMediaPress(post.media)}
          onDoublePress={handleDoubleTap}
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
              name={post.media[0].type === "video" ? "play-circle" : "image"}
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
        {/* NEW: Streak indicator */}
        {post.userStreak && post.userStreak > 1 && (
          <View style={styles.statItem}>
            <Ionicons name="trending-up" size={16} color={colors.secondary} />
            <Text style={[styles.statText, { color: colors.secondary }]}>
              {post.userStreak} day streak
            </Text>
          </View>
        )}
      </View>

      {/* Session Notes */}
      {post.sessionNotes && (
        <Text style={styles.sessionNotes}>{post.sessionNotes}</Text>
      )}

      {/* REVOLUTIONARY Action Bar */}
      <View style={styles.actionBar}>
        {/* Fire Reaction */}
        <TouchableOpacity
          style={styles.actionButton}
          onPress={handleFireReaction}
        >
          <Animated.View style={{ transform: [{ scale: fireScale }] }}>
            <Ionicons
              name={isLiked ? "flame" : "flame-outline"}
              size={24}
              color={isLiked ? colors.primary : colors.textSecondary}
            />
          </Animated.View>
          <Text
            style={[styles.actionText, isLiked && { color: colors.primary }]}
          >
            {likeCount}
          </Text>
        </TouchableOpacity>

        {/* Respect Badge */}
        <TouchableOpacity
          style={styles.actionButton}
          onPress={handleRespectBadge}
        >
          <Animated.View style={{ transform: [{ scale: respectScale }] }}>
            <Ionicons
              name={hasRespected ? "fitness" : "fitness-outline"}
              size={22}
              color={hasRespected ? colors.success : colors.textSecondary}
            />
          </Animated.View>
          <Text
            style={[
              styles.actionText,
              hasRespected && { color: colors.success },
            ]}
          >
            {respectCount}
          </Text>
        </TouchableOpacity>

        {/* Comment */}
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

        {/* Share */}
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

        {/* NEW: Technique Request */}
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => onTechniqueRequest && onTechniqueRequest(post.id)}
        >
          <Ionicons
            name="help-circle-outline"
            size={22}
            color={colors.warning}
          />
        </TouchableOpacity>
      </View>

      {/* Enhanced Engagement Indicators */}
      {(likeCount > 0 || post.commentCount > 0 || respectCount > 0) && (
        <View style={styles.engagementBar}>
          {likeCount > 0 && (
            <View style={styles.engagementItem}>
              <Text style={styles.engagementText}>
                🔥 {likeCount} {likeCount === 1 ? "fire" : "fires"}
              </Text>
            </View>
          )}
          {respectCount > 0 && (
            <View style={styles.engagementItem}>
              <Text style={styles.engagementText}>
                💪 {respectCount} respect
              </Text>
            </View>
          )}
          {post.commentCount > 0 && (
            <View style={styles.engagementItem}>
              <Text style={styles.engagementText}>
                💬 {post.commentCount}{" "}
                {post.commentCount === 1 ? "comment" : "comments"}
              </Text>
            </View>
          )}
        </View>
      )}

      {/* NEW: Trending indicator for viral posts */}
      {likeCount + respectCount + (post.commentCount || 0) > 50 && (
        <View style={styles.trendingBadge}>
          <Ionicons name="trending-up" size={16} color={colors.secondary} />
          <Text style={styles.trendingText}>Trending in your gym</Text>
        </View>
      )}
    </Animated.View>
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
    gap: 8,
  },
  userName: {
    fontSize: 16,
    fontWeight: "bold",
    color: colors.text,
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
  headerRight: {
    alignItems: "flex-end",
    gap: 4,
  },
  timestamp: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  moreButton: {
    padding: 4,
  },

  // NEW: Achievement Badge
  achievementBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.secondary + "20",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    gap: 2,
  },
  achievementText: {
    fontSize: 10,
    fontWeight: "600",
    color: colors.secondary,
  },

  // NEW: Quick Actions
  quickActionsContainer: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 15,
    paddingHorizontal: 10,
  },
  quickActionButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.backgroundLight,
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 12,
    gap: 6,
  },
  quickActionText: {
    fontSize: 12,
    color: colors.text,
    fontWeight: "500",
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

  // NEW: Live Indicator
  liveIndicator: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.error + "20",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  liveDot: {
    width: 6,
    height: 6,
    backgroundColor: colors.error,
    borderRadius: 3,
  },
  liveText: {
    fontSize: 10,
    fontWeight: "bold",
    color: colors.error,
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

  // REVOLUTIONARY Action Bar
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

  // Enhanced Engagement Bar
  engagementBar: {
    flexDirection: "row",
    alignItems: "center",
    gap: 15,
    marginTop: 10,
    paddingTop: 8,
    flexWrap: "wrap",
  },
  engagementItem: {
    flexDirection: "row",
    alignItems: "center",
  },
  engagementText: {
    fontSize: 12,
    color: colors.textSecondary,
    fontWeight: "500",
  },

  // NEW: Trending Badge
  trendingBadge: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.secondary + "20",
    borderRadius: 15,
    paddingVertical: 6,
    paddingHorizontal: 12,
    marginTop: 10,
    gap: 4,
  },
  trendingText: {
    fontSize: 12,
    fontWeight: "600",
    color: colors.secondary,
  },
};

export default FeedCard;
