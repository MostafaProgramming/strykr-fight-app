// src/screens/FeedScreen.js - ENHANCED WITH FOLLOWING SYSTEM
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  FlatList,
  RefreshControl,
  Alert,
  StatusBar,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "../constants/colors";
import { screenStyles } from "../styles/screenStyles";
import FeedCard from "../components/FeedCard";
import socialFeedService from "../services/socialFeedService";
import followingService from "../services/followingService";

const FeedScreen = ({ member, onNavigate }) => {
  const [feedData, setFeedData] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState("foryou");
  const [loading, setLoading] = useState(true);
  const [followingIds, setFollowingIds] = useState([]);

  useEffect(() => {
    loadFollowingIds();
  }, []);

  useEffect(() => {
    loadFeedData();
  }, [selectedFilter, followingIds]);

  const loadFollowingIds = async () => {
    try {
      const result = await followingService.getFollowingIds(member?.uid);
      if (result.success) {
        setFollowingIds(result.followingIds);
      }
    } catch (error) {
      console.error("Error loading following IDs:", error);
    }
  };

  const loadFeedData = async () => {
    try {
      setLoading(true);

      let result;

      if (selectedFilter === "following") {
        // Get posts only from followed users
        if (followingIds.length === 0) {
          setFeedData([]);
          setLoading(false);
          return;
        }

        result = await socialFeedService.getFeedPostsFromFollowing(
          followingIds,
          member?.uid,
          20,
        );
      } else {
        result = await socialFeedService.getFeedPosts(
          selectedFilter,
          member?.uid,
          20,
        );
      }

      if (result.success) {
        setFeedData(result.posts);
        console.log(
          `Loaded ${result.posts.length} posts for ${selectedFilter} feed`,
        );
      } else {
        console.error("Failed to load feed:", result.error);
        setFeedData([]);
      }
    } catch (error) {
      console.error("Error loading feed:", error);
      setFeedData([]);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = React.useCallback(async () => {
    setRefreshing(true);
    await loadFollowingIds();
    await loadFeedData();
    setRefreshing(false);
  }, [selectedFilter, followingIds]);

  const handleLike = async (postId, currentIsLiked) => {
    try {
      // Optimistically update UI
      setFeedData((prevData) =>
        prevData.map((post) =>
          post.id === postId
            ? {
                ...post,
                isLiked: !currentIsLiked,
                likeCount: currentIsLiked
                  ? post.likeCount - 1
                  : post.likeCount + 1,
              }
            : post,
        ),
      );

      const result = await socialFeedService.toggleLike(postId, member.uid);

      if (!result.success) {
        // Revert optimistic update on failure
        setFeedData((prevData) =>
          prevData.map((post) =>
            post.id === postId
              ? {
                  ...post,
                  isLiked: currentIsLiked,
                  likeCount: currentIsLiked
                    ? post.likeCount + 1
                    : post.likeCount - 1,
                }
              : post,
          ),
        );
        Alert.alert("Error", "Failed to like post");
      }
    } catch (error) {
      console.error("Error liking post:", error);
    }
  };

  const handleRespect = async (postId, currentHasRespected) => {
    try {
      // Optimistically update UI
      setFeedData((prevData) =>
        prevData.map((post) =>
          post.id === postId
            ? {
                ...post,
                hasRespected: !currentHasRespected,
                respectCount: currentHasRespected
                  ? post.respectCount - 1
                  : post.respectCount + 1,
              }
            : post,
        ),
      );

      const result = await socialFeedService.toggleRespect(postId, member.uid);

      if (!result.success) {
        // Revert on failure
        setFeedData((prevData) =>
          prevData.map((post) =>
            post.id === postId
              ? {
                  ...post,
                  hasRespected: currentHasRespected,
                  respectCount: currentHasRespected
                    ? post.respectCount + 1
                    : post.respectCount - 1,
                }
              : post,
          ),
        );
        Alert.alert("Error", "Failed to give respect");
      }
    } catch (error) {
      console.error("Error giving respect:", error);
    }
  };

  const handleComment = (postId) => {
    Alert.alert(
      "Comments",
      "Comment feature coming soon! Will show a comment input and list of comments.",
      [{ text: "OK", style: "default" }],
    );
  };

  const handleShare = async (postId) => {
    try {
      Alert.alert("Share", "Share this training session?", [
        { text: "Cancel", style: "cancel" },
        {
          text: "Copy Link",
          onPress: () => Alert.alert("Copied!", "Link copied to clipboard"),
        },
        {
          text: "Share",
          onPress: () => Alert.alert("Shared!", "Post shared successfully"),
        },
      ]);
    } catch (error) {
      console.error("Error sharing post:", error);
    }
  };

  const handleUserPress = (userId) => {
    Alert.alert("User Profile", `Navigate to profile for user: ${userId}`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "View Profile",
        onPress: () => console.log(`Navigate to user ${userId}`),
      },
      {
        text: "Follow/Unfollow",
        onPress: () => handleQuickFollow(userId),
      },
    ]);
  };

  // NEW: Quick follow/unfollow from feed
  const handleQuickFollow = async (userId) => {
    try {
      const isFollowingResult = await followingService.isFollowing(
        member.uid,
        userId,
      );

      if (isFollowingResult.success) {
        if (isFollowingResult.isFollowing) {
          // Unfollow
          const result = await followingService.unfollowUser(
            member.uid,
            userId,
          );
          if (result.success) {
            Alert.alert("Unfollowed", "You are no longer following this user");
            // Refresh following IDs
            await loadFollowingIds();
          }
        } else {
          // Follow - need user info
          const post = feedData.find((p) => p.userId === userId);
          if (post) {
            const result = await followingService.followUser(
              member.uid,
              userId,
              { name: member.name, avatar: member.avatar },
              { name: post.userName, avatar: post.userAvatar },
            );
            if (result.success) {
              Alert.alert(
                "Following!",
                `You are now following ${post.userName} 🎉`,
              );
              // Refresh following IDs
              await loadFollowingIds();
            }
          }
        }
      }
    } catch (error) {
      console.error("Error with follow/unfollow:", error);
      Alert.alert("Error", "Failed to update follow status");
    }
  };

  const handleMediaPress = (media) => {
    Alert.alert("Media Viewer", `View ${media.length} media item(s)`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "View",
        onPress: () => console.log("Open media viewer", media),
      },
    ]);
  };

  const handleTechniqueRequest = (postId) => {
    Alert.alert(
      "Technique Request",
      "Ask the poster to show you that technique?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Ask",
          onPress: () =>
            Alert.alert(
              "Request Sent!",
              "The fighter will be notified of your technique request.",
            ),
        },
      ],
    );
  };

  const handleChallengeResponse = (postId) => {
    Alert.alert(
      "Challenge Response",
      "Challenge yourself to match this training session?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Accept Challenge",
          onPress: () =>
            Alert.alert("Challenge Accepted!", "Time to prove yourself! 💪"),
        },
      ],
    );
  };

  const filters = [
    { id: "foryou", label: "For You", icon: "sparkles" },
    {
      id: "following",
      label: "Following",
      icon: "people",
      count: followingIds.length,
    },
    { id: "gym", label: "My Gym", icon: "business" },
    { id: "trending", label: "Trending", icon: "trending-up" },
  ];

  const EmptyFeedComponent = () => (
    <View style={styles.emptyState}>
      <View style={styles.emptyIcon}>
        <Ionicons
          name={
            selectedFilter === "following"
              ? "people-outline"
              : "fitness-outline"
          }
          size={64}
          color={colors.textSecondary}
        />
      </View>
      <Text style={styles.emptyTitle}>
        {selectedFilter === "following"
          ? followingIds.length === 0
            ? "Not Following Anyone Yet"
            : "No Posts from Following"
          : selectedFilter === "trending"
            ? "No Trending Posts"
            : "No Posts Yet"}
      </Text>
      <Text style={styles.emptyDescription}>
        {selectedFilter === "following"
          ? followingIds.length === 0
            ? "Discover amazing fighters and follow their training journey to see their posts here!"
            : "The people you follow haven't posted recently. Check back later or discover more fighters!"
          : selectedFilter === "trending"
            ? "No trending posts this week. Be the first to share an amazing training session!"
            : "Be the first to share your training session and inspire others!"}
      </Text>
      <TouchableOpacity
        style={styles.emptyAction}
        onPress={() => {
          if (selectedFilter === "following") {
            onNavigate && onNavigate("discover"); // Navigate to discover users
          } else {
            Alert.alert(
              "Start Training!",
              "Ready to log your first session and share it with the community?",
              [
                { text: "Later", style: "cancel" },
                {
                  text: "Let's Go!",
                  onPress: () => onNavigate && onNavigate("logtraining"),
                },
              ],
            );
          }
        }}
      >
        <Text style={styles.emptyActionText}>
          {selectedFilter === "following"
            ? "Discover Fighters"
            : "Log Your Training"}
        </Text>
      </TouchableOpacity>
    </View>
  );

  const LoadingComponent = () => (
    <View style={styles.loadingContainer}>
      <Ionicons name="fitness" size={48} color={colors.primary} />
      <Text style={styles.loadingText}>
        {selectedFilter === "following"
          ? "Loading posts from people you follow..."
          : "Loading your feed..."}
      </Text>
    </View>
  );

  if (loading) {
    return <LoadingComponent />;
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={colors.background} />

      {/* Enhanced Filter Bar */}
      <View style={styles.filterContainer}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterContent}
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
                size={18}
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
                {filter.count !== undefined && filter.count > 0 && (
                  <Text style={styles.filterCount}> ({filter.count})</Text>
                )}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Feed */}
      <FlatList
        data={feedData}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <FeedCard
            post={item}
            onLike={handleLike}
            onComment={handleComment}
            onShare={handleShare}
            onUserPress={handleUserPress}
            onMediaPress={handleMediaPress}
            onRespectBadge={handleRespect}
            onTechniqueRequest={handleTechniqueRequest}
            onChallengeResponse={handleChallengeResponse}
          />
        )}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.primary}
            colors={[colors.primary]}
          />
        }
        ListEmptyComponent={EmptyFeedComponent}
        contentContainerStyle={
          feedData.length === 0 ? styles.emptyContainer : null
        }
        removeClippedSubviews={true}
        maxToRenderPerBatch={5}
        updateCellsBatchingPeriod={100}
        windowSize={10}
      />

      {/* Quick Action Button - Share Training */}
      <TouchableOpacity
        style={styles.quickActionButton}
        onPress={() => {
          Alert.alert(
            "Share Training",
            "Ready to inspire the community with your training session?",
            [
              { text: "Cancel", style: "cancel" },
              {
                text: "Log & Share",
                onPress: () => onNavigate && onNavigate("logtraining"),
              },
            ],
          );
        }}
      >
        <Ionicons name="add" size={24} color={colors.text} />
      </TouchableOpacity>

      {/* Enhanced Feed Stats */}
      {feedData.length > 0 && (
        <View style={styles.feedStats}>
          <Text style={styles.feedStatsText}>
            🔥 {feedData.length} posts
            {selectedFilter === "following" &&
              followingIds.length > 0 &&
              ` • Following ${followingIds.length}`}
            {feedData.filter((p) => p.isTrending).length > 0 &&
              ` • ${feedData.filter((p) => p.isTrending).length} trending`}
          </Text>
        </View>
      )}

      {/* Discover Users Prompt */}
      {selectedFilter === "following" && followingIds.length < 3 && (
        <TouchableOpacity
          style={styles.discoverPrompt}
          onPress={() => onNavigate && onNavigate("discover")}
        >
          <Ionicons name="person-add" size={20} color={colors.primary} />
          <Text style={styles.discoverPromptText}>
            Discover more fighters to follow
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = {
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },

  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colors.background,
  },
  loadingText: {
    fontSize: 16,
    color: colors.textSecondary,
    marginTop: 15,
    textAlign: "center",
  },

  filterContainer: {
    backgroundColor: colors.backgroundLight,
    borderBottomWidth: 1,
    borderBottomColor: colors.cardBorder,
    paddingVertical: 12,
  },
  filterContent: {
    paddingHorizontal: 20,
    alignItems: "center",
  },
  filterButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.cardBackground,
    borderRadius: 25,
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginRight: 12,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    gap: 8,
    minWidth: 100,
    justifyContent: "center",
  },
  activeFilterButton: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  filterText: {
    color: colors.textSecondary,
    fontSize: 14,
    fontWeight: "600",
  },
  activeFilterText: {
    color: colors.text,
  },
  filterCount: {
    fontSize: 12,
    opacity: 0.8,
  },

  emptyContainer: {
    flexGrow: 1,
  },
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 40,
    paddingVertical: 60,
  },
  emptyIcon: {
    width: 120,
    height: 120,
    backgroundColor: colors.cardBackground,
    borderRadius: 60,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 24,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: colors.text,
    marginBottom: 12,
    textAlign: "center",
  },
  emptyDescription: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: "center",
    lineHeight: 24,
    marginBottom: 32,
  },
  emptyAction: {
    backgroundColor: colors.primary,
    borderRadius: 25,
    paddingHorizontal: 32,
    paddingVertical: 16,
  },
  emptyActionText: {
    color: colors.text,
    fontSize: 16,
    fontWeight: "600",
  },

  quickActionButton: {
    position: "absolute",
    bottom: 80,
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

  feedStats: {
    position: "absolute",
    bottom: 20,
    left: 20,
    backgroundColor: colors.cardBackground + "80",
    borderRadius: 15,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  feedStatsText: {
    fontSize: 12,
    color: colors.textSecondary,
    fontWeight: "500",
  },

  // NEW: Discover prompt
  discoverPrompt: {
    position: "absolute",
    bottom: 145,
    left: 20,
    right: 80,
    backgroundColor: colors.primary + "20",
    borderRadius: 15,
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: colors.primary + "40",
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  discoverPromptText: {
    fontSize: 14,
    color: colors.primary,
    fontWeight: "600",
    flex: 1,
  },
};

export default FeedScreen;
