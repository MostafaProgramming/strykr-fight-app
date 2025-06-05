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
import RevolutionaryFeedCard from "../components/FeedCard";
import socialFeedService from "../services/socialFeedService";

const FeedScreen = ({ member }) => {
  const [feedData, setFeedData] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState("foryou");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadFeedData();
  }, [selectedFilter]);

  const loadFeedData = async () => {
    try {
      setLoading(true);

      // Load real data from Firebase
      const result = await socialFeedService.getFeedPosts(
        selectedFilter,
        member?.uid,
        20,
      );

      if (result.success) {
        setFeedData(result.posts);
      } else {
        console.error("Failed to load feed:", result.error);
        // Fallback to empty array or show error
        setFeedData([]);
      }
    } catch (error) {
      console.error("Error loading feed:", error);
      Alert.alert("Error", "Failed to load feed");
      setFeedData([]);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = React.useCallback(async () => {
    setRefreshing(true);
    await loadFeedData();
    setRefreshing(false);
  }, [selectedFilter]);

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

      // Make API call
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
      // Revert on error
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
    }
  };

  const handleComment = (postId) => {
    // TODO: Navigate to comments screen or show comment modal
    Alert.alert(
      "Comments",
      "Comment feature coming soon! Will show a comment input and list of comments.",
      [{ text: "OK", style: "default" }],
    );
  };

  const handleShare = async (postId) => {
    try {
      // TODO: Implement sharing (copy link, share to social media, etc.)
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
    // TODO: Navigate to user profile
    Alert.alert("User Profile", `Navigate to profile for user: ${userId}`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "View Profile",
        onPress: () => console.log(`Navigate to user ${userId}`),
      },
    ]);
  };

  const handleMediaPress = (media) => {
    // TODO: Open media viewer/gallery
    Alert.alert("Media Viewer", `View ${media.length} media item(s)`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "View",
        onPress: () => console.log("Open media viewer", media),
      },
    ]);
  };

  const getFilteredData = () => {
    // Data is already filtered by the service based on selectedFilter
    return feedData;
  };

  const filters = [
    { id: "foryou", label: "For You", icon: "sparkles" },
    { id: "following", label: "Following", icon: "people" },
    { id: "gym", label: "My Gym", icon: "business" },
    { id: "trending", label: "Trending", icon: "trending-up" },
  ];

  const EmptyFeedComponent = () => (
    <View style={styles.emptyState}>
      <View style={styles.emptyIcon}>
        <Ionicons
          name="people-outline"
          size={64}
          color={colors.textSecondary}
        />
      </View>
      <Text style={styles.emptyTitle}>
        {selectedFilter === "following"
          ? "No Posts from Following"
          : "No Posts Yet"}
      </Text>
      <Text style={styles.emptyDescription}>
        {selectedFilter === "following"
          ? "Follow other fighters to see their training updates, or check out the 'For You' feed!"
          : selectedFilter === "trending"
            ? "No trending posts this week. Be the first to share an amazing training session!"
            : "Be the first to share your training session and inspire others!"}
      </Text>
      <TouchableOpacity
        style={styles.emptyAction}
        onPress={() => {
          if (selectedFilter === "following") {
            setSelectedFilter("foryou");
          } else {
            // TODO: Navigate to log training or explore users
            Alert.alert(
              "Coming Soon",
              "User discovery and training logging integration coming soon!",
            );
          }
        }}
      >
        <Text style={styles.emptyActionText}>
          {selectedFilter === "following"
            ? "Browse For You Feed"
            : "Log Your Training"}
        </Text>
      </TouchableOpacity>
    </View>
  );

  const LoadingComponent = () => (
    <View style={styles.loadingContainer}>
      <Ionicons name="fitness" size={48} color={colors.primary} />
      <Text style={styles.loadingText}>Loading your feed...</Text>
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
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Feed */}
      <FlatList
        data={getFilteredData()}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <RevolutionaryFeedCard
            post={item}
            onLike={(postId, isLiked) => handleLike(postId, !isLiked)} // Pass opposite of current state
            onComment={handleComment}
            onShare={handleShare}
            onUserPress={handleUserPress}
            onMediaPress={handleMediaPress}
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
          getFilteredData().length === 0 ? styles.emptyContainer : null
        }
        // Performance optimizations
        removeClippedSubviews={true}
        maxToRenderPerBatch={5}
        updateCellsBatchingPeriod={100}
        windowSize={10}
      />

      {/* Quick Action Button - Share Training */}
      <TouchableOpacity
        style={styles.quickActionButton}
        onPress={() => {
          // TODO: Quick share training or navigate to log training
          Alert.alert(
            "Share Training",
            "Quick share your current training session?",
            [
              { text: "Cancel", style: "cancel" },
              {
                text: "Log & Share",
                onPress: () =>
                  console.log("Navigate to log training with share enabled"),
              },
            ],
          );
        }}
      >
        <Ionicons name="add" size={24} color={colors.text} />
      </TouchableOpacity>
    </View>
  );
};

const styles = {
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },

  // Loading State
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
  },

  // Filter Bar
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

  // Empty State
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

  // Quick Action Button
  quickActionButton: {
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

export default FeedScreen;
