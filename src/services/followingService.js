// src/services/followingService.js - COMPLETE FOLLOWING SYSTEM
import {
  collection,
  addDoc,
  deleteDoc,
  getDocs,
  doc,
  updateDoc,
  query,
  where,
  orderBy,
  limit,
  arrayUnion,
  arrayRemove,
  Timestamp,
  increment,
  getDoc,
} from "firebase/firestore";
import { db } from "../config/firebase";

class FollowingService {
  // Follow a user
  async followUser(followerId, followingId, followerInfo, followingInfo) {
    try {
      // Prevent self-follow
      if (followerId === followingId) {
        return {
          success: false,
          error: "Cannot follow yourself",
        };
      }

      // Check if already following
      const isFollowing = await this.isFollowing(followerId, followingId);
      if (isFollowing.success && isFollowing.isFollowing) {
        return {
          success: false,
          error: "Already following this user",
        };
      }

      // Create follow relationship
      const followsRef = collection(db, "follows");
      await addDoc(followsRef, {
        followerId,
        followingId,
        followerName: followerInfo.name,
        followerAvatar: followerInfo.avatar,
        followingName: followingInfo.name,
        followingAvatar: followingInfo.avatar,
        createdAt: Timestamp.fromDate(new Date()),
      });

      // Update user stats
      const followerRef = doc(db, "users", followerId);
      const followingRef = doc(db, "users", followingId);

      await updateDoc(followerRef, {
        followingCount: increment(1),
      });

      await updateDoc(followingRef, {
        followersCount: increment(1),
      });

      // Create notification for the followed user
      await this.createFollowNotification(
        followerId,
        followingId,
        followerInfo,
      );

      return {
        success: true,
        message: `You are now following ${followingInfo.name}`,
      };
    } catch (error) {
      console.error("Error following user:", error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  // Unfollow a user
  async unfollowUser(followerId, followingId) {
    try {
      // Find the follow relationship
      const followsRef = collection(db, "follows");
      const q = query(
        followsRef,
        where("followerId", "==", followerId),
        where("followingId", "==", followingId),
      );

      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        return {
          success: false,
          error: "Not following this user",
        };
      }

      // Delete the follow relationship
      const followDoc = querySnapshot.docs[0];
      await deleteDoc(doc(db, "follows", followDoc.id));

      // Update user stats
      const followerRef = doc(db, "users", followerId);
      const followingRef = doc(db, "users", followingId);

      await updateDoc(followerRef, {
        followingCount: increment(-1),
      });

      await updateDoc(followingRef, {
        followersCount: increment(-1),
      });

      return {
        success: true,
        message: "Unfollowed successfully",
      };
    } catch (error) {
      console.error("Error unfollowing user:", error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  // Check if user is following another user
  async isFollowing(followerId, followingId) {
    try {
      const followsRef = collection(db, "follows");
      const q = query(
        followsRef,
        where("followerId", "==", followerId),
        where("followingId", "==", followingId),
      );

      const querySnapshot = await getDocs(q);

      return {
        success: true,
        isFollowing: !querySnapshot.empty,
      };
    } catch (error) {
      console.error("Error checking follow status:", error);
      return {
        success: false,
        error: error.message,
        isFollowing: false,
      };
    }
  }

  // Get user's followers
  async getFollowers(userId, limitCount = 50) {
    try {
      const followsRef = collection(db, "follows");
      const q = query(
        followsRef,
        where("followingId", "==", userId),
        orderBy("createdAt", "desc"),
        limit(limitCount),
      );

      const querySnapshot = await getDocs(q);
      const followers = [];

      querySnapshot.forEach((doc) => {
        const data = doc.data();
        followers.push({
          id: doc.id,
          userId: data.followerId,
          name: data.followerName,
          avatar: data.followerAvatar,
          followedAt: data.createdAt?.toDate(),
        });
      });

      return {
        success: true,
        followers,
        count: followers.length,
      };
    } catch (error) {
      console.error("Error getting followers:", error);
      return {
        success: false,
        error: error.message,
        followers: [],
      };
    }
  }

  // Get user's following
  async getFollowing(userId, limitCount = 50) {
    try {
      const followsRef = collection(db, "follows");
      const q = query(
        followsRef,
        where("followerId", "==", userId),
        orderBy("createdAt", "desc"),
        limit(limitCount),
      );

      const querySnapshot = await getDocs(q);
      const following = [];

      querySnapshot.forEach((doc) => {
        const data = doc.data();
        following.push({
          id: doc.id,
          userId: data.followingId,
          name: data.followingName,
          avatar: data.followingAvatar,
          followedAt: data.createdAt?.toDate(),
        });
      });

      return {
        success: true,
        following,
        count: following.length,
      };
    } catch (error) {
      console.error("Error getting following:", error);
      return {
        success: false,
        error: error.message,
        following: [],
      };
    }
  }

  // Get user's following IDs only (for feed filtering)
  async getFollowingIds(userId) {
    try {
      const following = await this.getFollowing(userId, 100);

      if (following.success) {
        const followingIds = following.following.map((user) => user.userId);
        return {
          success: true,
          followingIds,
        };
      }

      return {
        success: false,
        error: following.error,
        followingIds: [],
      };
    } catch (error) {
      console.error("Error getting following IDs:", error);
      return {
        success: false,
        error: error.message,
        followingIds: [],
      };
    }
  }

  // Create follow notification
  async createFollowNotification(followerId, followingId, followerInfo) {
    try {
      const notificationsRef = collection(db, "notifications");

      await addDoc(notificationsRef, {
        userId: followingId, // Person receiving the notification
        type: "new_follower",
        actorId: followerId,
        actorName: followerInfo.name,
        actorAvatar: followerInfo.avatar,
        message: `${followerInfo.name} started following you`,
        isRead: false,
        createdAt: Timestamp.fromDate(new Date()),
      });

      return { success: true };
    } catch (error) {
      console.error("Error creating follow notification:", error);
      return { success: false, error: error.message };
    }
  }

  // Discover users to follow
  async discoverUsers(currentUserId, limitCount = 20) {
    try {
      // Get users from the same gym or similar activity level
      const usersRef = collection(db, "users");
      const q = query(
        usersRef,
        limit(limitCount * 2), // Get more to filter out current user and existing follows
      );

      const querySnapshot = await getDocs(q);
      const users = [];

      // Get current user's following list
      const followingResult = await this.getFollowingIds(currentUserId);
      const followingIds = followingResult.success
        ? followingResult.followingIds
        : [];

      querySnapshot.forEach((doc) => {
        const data = doc.data();
        const userId = doc.id;

        // Skip current user and users already followed
        if (userId !== currentUserId && !followingIds.includes(userId)) {
          users.push({
            id: userId,
            name: data.name,
            avatar: data.avatar,
            gym: data.gym,
            fighterLevel: data.fighterLevel,
            followersCount: data.followersCount || 0,
            totalSessions: data.totalSessions || 0,
            memberSince: data.memberSince,
          });
        }
      });

      // Sort by activity and followers
      users.sort((a, b) => {
        const scoreA = a.followersCount * 2 + (a.totalSessions || 0);
        const scoreB = b.followersCount * 2 + (b.totalSessions || 0);
        return scoreB - scoreA;
      });

      return {
        success: true,
        users: users.slice(0, limitCount),
      };
    } catch (error) {
      console.error("Error discovering users:", error);
      return {
        success: false,
        error: error.message,
        users: [],
      };
    }
  }

  // Get mutual followers
  async getMutualFollowers(userId1, userId2) {
    try {
      const user1Following = await this.getFollowingIds(userId1);
      const user2Following = await this.getFollowingIds(userId2);

      if (!user1Following.success || !user2Following.success) {
        return {
          success: false,
          error: "Failed to get following lists",
          mutualFollowers: [],
        };
      }

      const mutualIds = user1Following.followingIds.filter((id) =>
        user2Following.followingIds.includes(id),
      );

      // Get user details for mutual followers
      const mutualFollowers = [];
      for (const userId of mutualIds.slice(0, 10)) {
        // Limit to 10
        const userDoc = await getDoc(doc(db, "users", userId));
        if (userDoc.exists()) {
          const userData = userDoc.data();
          mutualFollowers.push({
            id: userId,
            name: userData.name,
            avatar: userData.avatar,
          });
        }
      }

      return {
        success: true,
        mutualFollowers,
        count: mutualIds.length,
      };
    } catch (error) {
      console.error("Error getting mutual followers:", error);
      return {
        success: false,
        error: error.message,
        mutualFollowers: [],
      };
    }
  }

  // Get follow stats for a user
  async getFollowStats(userId) {
    try {
      const followersResult = await this.getFollowers(userId, 1);
      const followingResult = await this.getFollowing(userId, 1);

      // Get actual counts from user document
      const userDoc = await getDoc(doc(db, "users", userId));
      const userData = userDoc.exists() ? userDoc.data() : {};

      return {
        success: true,
        stats: {
          followersCount: userData.followersCount || 0,
          followingCount: userData.followingCount || 0,
        },
      };
    } catch (error) {
      console.error("Error getting follow stats:", error);
      return {
        success: false,
        error: error.message,
        stats: { followersCount: 0, followingCount: 0 },
      };
    }
  }

  // Search users by name
  async searchUsers(searchQuery, currentUserId, limitCount = 20) {
    try {
      if (!searchQuery || searchQuery.trim().length < 2) {
        return {
          success: false,
          error: "Search query too short",
          users: [],
        };
      }

      // Simple search by name (in production, use Algolia or similar)
      const usersRef = collection(db, "users");
      const querySnapshot = await getDocs(usersRef);

      const users = [];
      const searchTerm = searchQuery.toLowerCase().trim();

      querySnapshot.forEach((doc) => {
        const data = doc.data();
        const userId = doc.id;

        // Skip current user
        if (userId === currentUserId) return;

        // Simple name matching
        if (data.name && data.name.toLowerCase().includes(searchTerm)) {
          users.push({
            id: userId,
            name: data.name,
            avatar: data.avatar,
            gym: data.gym,
            fighterLevel: data.fighterLevel,
            followersCount: data.followersCount || 0,
            totalSessions: data.totalSessions || 0,
          });
        }
      });

      // Sort by followers and activity
      users.sort((a, b) => {
        const scoreA = a.followersCount * 2 + (a.totalSessions || 0);
        const scoreB = b.followersCount * 2 + (b.totalSessions || 0);
        return scoreB - scoreA;
      });

      return {
        success: true,
        users: users.slice(0, limitCount),
      };
    } catch (error) {
      console.error("Error searching users:", error);
      return {
        success: false,
        error: error.message,
        users: [],
      };
    }
  }

  // Get recent follower activity (for notifications)
  async getRecentFollowerActivity(userId, limitCount = 10) {
    try {
      const followsRef = collection(db, "follows");
      const q = query(
        followsRef,
        where("followingId", "==", userId),
        orderBy("createdAt", "desc"),
        limit(limitCount),
      );

      const querySnapshot = await getDocs(q);
      const activities = [];

      querySnapshot.forEach((doc) => {
        const data = doc.data();
        activities.push({
          id: doc.id,
          type: "new_follower",
          actorId: data.followerId,
          actorName: data.followerName,
          actorAvatar: data.followerAvatar,
          createdAt: data.createdAt?.toDate(),
        });
      });

      return {
        success: true,
        activities,
      };
    } catch (error) {
      console.error("Error getting follower activity:", error);
      return {
        success: false,
        error: error.message,
        activities: [],
      };
    }
  }
}

export default new FollowingService();
