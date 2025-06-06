// src/screens/DiscoverUsersScreen.js - USER DISCOVERY WITH FOLLOWING
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  FlatList,
  RefreshControl,
  Alert,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "../constants/colors";
import { screenStyles } from "../styles/screenStyles";
import followingService from "../services/followingService";

const DiscoverUsersScreen = ({ member, onBack }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTab, setSelectedTab] = useState("discover");
  const [users, setUsers] = useState([]);
  const [followers, setFollowers] = useState([]);
  const [following, setFollowing] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [followingUsers, setFollowingUsers] = useState(new Set());

  useEffect(() => {
    loadData();
  }, [selectedTab]);

  const loadData = async () => {
    setLoading(true);

    try {
      switch (selectedTab) {
        case "discover":
          await loadDiscoverUsers();
          break;
        case "followers":
          await loadFollowers();
          break;
        case "following":
          await loadFollowing();
          break;
      }
    } catch (error) {
      console.error("Error loading data:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadDiscoverUsers = async () => {
    try {
      const result = await followingService.discoverUsers(member.uid, 20);

      if (result.success) {
        setUsers(result.users);

        // Check which users are already being followed
        const followingIds = new Set();
        for (const user of result.users) {
          const isFollowingResult = await followingService.isFollowing(
            member.uid,
            user.id,
          );
          if (isFollowingResult.success && isFollowingResult.isFollowing) {
            followingIds.add(user.id);
          }
        }
        setFollowingUsers(followingIds);
      } else {
        Alert.alert("Error", "Failed to load users to discover");
      }
    } catch (error) {
      console.error("Error loading discover users:", error);
    }
  };

  const loadFollowers = async () => {
    try {
      const result = await followingService.getFollowers(member.uid, 50);

      if (result.success) {
        setFollowers(result.followers);
      } else {
        Alert.alert("Error", "Failed to load followers");
      }
    } catch (error) {
      console.error("Error loading followers:", error);
    }
  };

  const loadFollowing = async () => {
    try {
      const result = await followingService.getFollowing(member.uid, 50);

      if (result.success) {
        setFollowing(result.following);
      } else {
        Alert.alert("Error", "Failed to load following");
      }
    } catch (error) {
      console.error("Error loading following:", error);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      loadDiscoverUsers();
      return;
    }

    setLoading(true);
    try {
      const result = await followingService.searchUsers(
        searchQuery,
        member.uid,
        20,
      );

      if (result.success) {
        setUsers(result.users);

        // Check follow status for search results
        const followingIds = new Set();
        for (const user of result.users) {
          const isFollowingResult = await followingService.isFollowing(
            member.uid,
            user.id,
          );
          if (isFollowingResult.success && isFollowingResult.isFollowing) {
            followingIds.add(user.id);
          }
        }
        setFollowingUsers(followingIds);
      } else {
        Alert.alert("Search Error", result.error);
      }
    } catch (error) {
      console.error("Error searching users:", error);
      Alert.alert("Error", "Failed to search users");
    } finally {
      setLoading(false);
    }
  };

  const handleFollow = async (user) => {
    try {
      const userInfo = {
        name: user.name,
        avatar: user.avatar,
      };

      const result = await followingService.followUser(
        member.uid,
        user.id,
        {
          name: member.name,
          avatar: member.avatar,
        },
        userInfo,
      );

      if (result.success) {
        setFollowingUsers((prev) => new Set(prev).add(user.id));
        Alert.alert("Success", `You are now following ${user.name}! 🎉`);
      } else {
        Alert.alert("Error", result.error);
      }
    } catch (error) {
      console.error("Error following user:", error);
      Alert.alert("Error", "Failed to follow user");
    }
  };

  const handleUnfollow = async (user) => {
    Alert.alert("Unfollow", `Stop following ${user.name}?`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Unfollow",
        style: "destructive",
        onPress: async () => {
          try {
            const result = await followingService.unfollowUser(
              member.uid,
              user.id,
            );

            if (result.success) {
              setFollowingUsers((prev) => {
                const newSet = new Set(prev);
                newSet.delete(user.id);
                return newSet;
              });

              // Remove from following list if we're on that tab
              if (selectedTab === "following") {
                setFollowing((prev) =>
                  prev.filter((f) => f.userId !== user.id),
                );
              }
            } else {
              Alert.alert("Error", result.error);
            }
          } catch (error) {
            console.error("Error unfollowing user:", error);
            Alert.alert("Error", "Failed to unfollow user");
          }
        },
      },
    ]);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const UserCard = ({
    user,
    showFollowButton = true,
    isFollowingList = false,
  }) => {
    const isFollowing = followingUsers.has(user.id);
    const userId = isFollowingList ? user.userId : user.id;
    const isCurrentlyFollowing = isFollowingList || isFollowing;

    return (
      <View style={styles.userCard}>
        <TouchableOpacity
          style={styles.userInfo}
          onPress={() => {
            // TODO: Navigate to user profile
            Alert.alert(
              "User Profile",
              `View ${user.name}'s profile and training history`,
            );
          }}
        >
          <View style={styles.userAvatar}>
            <Text style={styles.userAvatarText}>{user.avatar}</Text>
          </View>
          <View style={styles.userDetails}>
            <Text style={styles.userName}>{user.name}</Text>
            <View style={styles.userMeta}>
              {user.gym && <Text style={styles.userGym}>{user.gym}</Text>}
              {user.fighterLevel && (
                <View style={styles.levelBadge}>
                  <Text style={styles.levelText}>{user.fighterLevel}</Text>
                </View>
              )}
            </View>
            <View style={styles.userStats}>
              <Text style={styles.userStat}>
                {user.followersCount || 0} followers
              </Text>
              <Text style={styles.userStat}>•</Text>
              <Text style={styles.userStat}>
                {user.totalSessions || 0} sessions
              </Text>
            </View>
          </View>
        </TouchableOpacity>

        {showFollowButton && (
          <TouchableOpacity
            style={[
              styles.followButton,
              isCurrentlyFollowing && styles.followingButton,
            ]}
            onPress={() => {
              if (isCurrentlyFollowing) {
                handleUnfollow(user);
              } else {
                handleFollow(user);
              }
            }}
          >
            <Text
              style={[
                styles.followButtonText,
                isCurrentlyFollowing && styles.followingButtonText,
              ]}
            >
              {isCurrentlyFollowing ? "Following" : "Follow"}
            </Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  const EmptyState = ({ type }) => (
    <View style={styles.emptyState}>
      <Ionicons
        name={
          type === "discover"
            ? "people-outline"
            : type === "followers"
              ? "person-add-outline"
              : "person-outline"
        }
        size={64}
        color={colors.textSecondary}
      />
      <Text style={styles.emptyTitle}>
        {type === "discover"
          ? "No Users Found"
          : type === "followers"
            ? "No Followers Yet"
            : "Not Following Anyone"}
      </Text>
      <Text style={styles.emptyDescription}>
        {type === "discover"
          ? searchQuery
            ? "Try a different search term"
            : "Check back later for new fighters to follow"
          : type === "followers"
            ? "Share your training journey to attract followers!"
            : "Discover amazing fighters and follow their training journey"}
      </Text>
      {type !== "discover" && (
        <TouchableOpacity
          style={styles.emptyAction}
          onPress={() => setSelectedTab("discover")}
        >
          <Text style={styles.emptyActionText}>Discover Users</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  const renderContent = () => {
    const data =
      selectedTab === "discover"
        ? users
        : selectedTab === "followers"
          ? followers
          : following;

    if (loading && data.length === 0) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>
            {selectedTab === "discover"
              ? "Discovering fighters..."
              : selectedTab === "followers"
                ? "Loading followers..."
                : "Loading following..."}
          </Text>
        </View>
      );
    }

    if (data.length === 0) {
      return <EmptyState type={selectedTab} />;
    }

    return (
      <FlatList
        data={data}
        keyExtractor={(item) => item.id || item.userId}
        renderItem={({ item }) => (
          <UserCard
            user={item}
            showFollowButton={selectedTab !== "followers"}
            isFollowingList={selectedTab === "following"}
          />
        )}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.primary}
          />
        }
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ padding: 20 }}
      />
    );
  };

  return (
    <View style={screenStyles.container}>
      {/* Header */}
      <View style={screenStyles.screenHeader}>
        <TouchableOpacity onPress={onBack}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={screenStyles.screenTitle}>Discover Fighters</Text>
        <View style={{ width: 24 }} />
      </View>

      {/* Search Bar (only on discover tab) */}
      {selectedTab === "discover" && (
        <View style={styles.searchContainer}>
          <View style={styles.searchInputContainer}>
            <Ionicons name="search" size={20} color={colors.textSecondary} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search fighters by name..."
              placeholderTextColor={colors.textSecondary}
              value={searchQuery}
              onChangeText={setSearchQuery}
              onSubmitEditing={handleSearch}
            />
          </View>
          <TouchableOpacity style={styles.searchButton} onPress={handleSearch}>
            <Text style={styles.searchButtonText}>Search</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Tab Navigation */}
      <View style={screenStyles.tabContainer}>
        <TouchableOpacity
          style={[
            screenStyles.tab,
            selectedTab === "discover" && screenStyles.activeTab,
          ]}
          onPress={() => setSelectedTab("discover")}
        >
          <Text
            style={[
              screenStyles.tabText,
              selectedTab === "discover" && screenStyles.activeTabText,
            ]}
          >
            Discover
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            screenStyles.tab,
            selectedTab === "followers" && screenStyles.activeTab,
          ]}
          onPress={() => setSelectedTab("followers")}
        >
          <Text
            style={[
              screenStyles.tabText,
              selectedTab === "followers" && screenStyles.activeTabText,
            ]}
          >
            Followers ({followers.length})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            screenStyles.tab,
            selectedTab === "following" && screenStyles.activeTab,
          ]}
          onPress={() => setSelectedTab("following")}
        >
          <Text
            style={[
              screenStyles.tabText,
              selectedTab === "following" && screenStyles.activeTabText,
            ]}
          >
            Following ({following.length})
          </Text>
        </TouchableOpacity>
      </View>

      {/* Content */}
      {renderContent()}
    </View>
  );
};

const styles = {
  searchContainer: {
    flexDirection: "row",
    paddingHorizontal: 20,
    paddingVertical: 15,
    gap: 10,
  },
  searchInputContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.cardBackground,
    borderRadius: 12,
    paddingHorizontal: 15,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    gap: 10,
  },
  searchInput: {
    flex: 1,
    color: colors.text,
    fontSize: 16,
  },
  searchButton: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  searchButtonText: {
    color: colors.text,
    fontWeight: "600",
    fontSize: 14,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 60,
  },
  loadingText: {
    fontSize: 16,
    color: colors.textSecondary,
    marginTop: 15,
    textAlign: "center",
  },
  userCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.cardBackground,
    borderRadius: 15,
    padding: 20,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  userInfo: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
  },
  userAvatar: {
    width: 50,
    height: 50,
    backgroundColor: colors.primary,
    borderRadius: 25,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 15,
  },
  userAvatarText: {
    color: colors.text,
    fontWeight: "bold",
    fontSize: 16,
  },
  userDetails: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: "bold",
    color: colors.text,
    marginBottom: 4,
  },
  userMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 6,
  },
  userGym: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  levelBadge: {
    backgroundColor: colors.primary + "20",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  levelText: {
    fontSize: 10,
    fontWeight: "600",
    color: colors.primary,
  },
  userStats: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  userStat: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  followButton: {
    backgroundColor: colors.primary,
    borderRadius: 20,
    paddingHorizontal: 20,
    paddingVertical: 8,
  },
  followingButton: {
    backgroundColor: colors.backgroundLight,
    borderWidth: 1,
    borderColor: colors.primary,
  },
  followButtonText: {
    color: colors.text,
    fontSize: 14,
    fontWeight: "600",
  },
  followingButtonText: {
    color: colors.primary,
  },
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 40,
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: colors.text,
    marginTop: 20,
    marginBottom: 10,
    textAlign: "center",
  },
  emptyDescription: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: "center",
    lineHeight: 24,
    marginBottom: 30,
  },
  emptyAction: {
    backgroundColor: colors.primary,
    borderRadius: 25,
    paddingHorizontal: 30,
    paddingVertical: 12,
  },
  emptyActionText: {
    color: colors.text,
    fontSize: 16,
    fontWeight: "600",
  },
};

export default DiscoverUsersScreen;
