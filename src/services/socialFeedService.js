// src/services/socialFeedService.js - ENHANCED WITH FOLLOWING SUPPORT
import {
  collection,
  addDoc,
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
} from "firebase/firestore";
import { db } from "../config/firebase";

class SocialFeedService {
  // Get feed posts - ENHANCED VERSION
  async getFeedPosts(filterType = "foryou", userId = null, limitCount = 20) {
    try {
      const feedRef = collection(db, "socialFeed");
      let q;

      switch (filterType) {
        case "foryou":
        case "trending":
          // Just get recent posts ordered by timestamp
          q = query(
            feedRef,
            where("isPublic", "==", true),
            orderBy("timestamp", "desc"),
            limit(limitCount),
          );
          break;

        case "gym":
          // Filter by gym if we have user info
          q = query(
            feedRef,
            where("isPublic", "==", true),
            orderBy("timestamp", "desc"),
            limit(limitCount),
          );
          break;

        default:
          q = query(
            feedRef,
            where("isPublic", "==", true),
            orderBy("timestamp", "desc"),
            limit(limitCount),
          );
      }

      const querySnapshot = await getDocs(q);
      const posts = [];

      querySnapshot.forEach((doc) => {
        const data = doc.data();
        posts.push({
          id: doc.id,
          ...data,
          timestamp: data.timestamp?.toDate
            ? data.timestamp.toDate()
            : new Date(data.timestamp),
          isLiked: userId ? (data.likes || []).includes(userId) : false,
          hasRespected: userId ? (data.respects || []).includes(userId) : false,
        });
      });

      return {
        success: true,
        posts,
      };
    } catch (error) {
      console.error("Error fetching feed posts:", error);
      return {
        success: false,
        error: error.message,
        posts: [],
      };
    }
  }

  // NEW: Get posts from followed users only
  async getFeedPostsFromFollowing(
    followingIds,
    userId = null,
    limitCount = 20,
  ) {
    try {
      if (!followingIds || followingIds.length === 0) {
        return {
          success: true,
          posts: [],
          message: "No following users",
        };
      }

      const feedRef = collection(db, "socialFeed");

      // Firestore has a limit of 10 items in 'in' queries, so we need to batch
      const batchSize = 10;
      const allPosts = [];

      for (let i = 0; i < followingIds.length; i += batchSize) {
        const batch = followingIds.slice(i, i + batchSize);

        const q = query(
          feedRef,
          where("userId", "in", batch),
          where("isPublic", "==", true),
          orderBy("timestamp", "desc"),
          limit(limitCount),
        );

        const querySnapshot = await getDocs(q);

        querySnapshot.forEach((doc) => {
          const data = doc.data();
          allPosts.push({
            id: doc.id,
            ...data,
            timestamp: data.timestamp?.toDate
              ? data.timestamp.toDate()
              : new Date(data.timestamp),
            isLiked: userId ? (data.likes || []).includes(userId) : false,
            hasRespected: userId
              ? (data.respects || []).includes(userId)
              : false,
          });
        });
      }

      // Sort all posts by timestamp and limit
      allPosts.sort((a, b) => b.timestamp - a.timestamp);
      const limitedPosts = allPosts.slice(0, limitCount);

      return {
        success: true,
        posts: limitedPosts,
      };
    } catch (error) {
      console.error("Error fetching following posts:", error);
      return {
        success: false,
        error: error.message,
        posts: [],
      };
    }
  }

  // Create a training post - ENHANCED VERSION
  async createTrainingPost(feedData, userInfo) {
    try {
      const feedRef = collection(db, "socialFeed");

      const post = {
        // User info
        userId: feedData.userId,
        userName: feedData.userName || userInfo.name,
        userAvatar: feedData.userAvatar || userInfo.avatar,
        userGym: feedData.userGym || userInfo.gym || "FightTracker Gym",
        userLevel: feedData.userLevel || userInfo.fighterLevel || "Amateur",

        // Session details
        sessionType: feedData.sessionType,
        sessionDuration: feedData.sessionDuration,
        sessionRounds: feedData.sessionRounds || 0,
        sessionIntensity: feedData.sessionIntensity,
        sessionNotes: feedData.sessionNotes || "",
        sessionCalories: feedData.sessionCalories || 0,

        // NEW: Media support
        media: feedData.media || [],

        // Post metadata
        timestamp: Timestamp.fromDate(new Date()),
        likes: [],
        likeCount: 0,
        respects: [], // NEW
        respectCount: 0, // NEW
        comments: [],
        commentCount: 0,
        shares: 0,
        isPublic: true,
        postType: "training_session",

        // Enhanced engagement tracking
        engagementScore: 0,
        isTrending: false,
        isViral: false,

        // NEW: Hashtags and mentions
        hashtags: this.extractHashtags(feedData.sessionNotes || ""),
        mentions: this.extractMentions(feedData.sessionNotes || ""),
      };

      const docRef = await addDoc(feedRef, post);

      return {
        success: true,
        postId: docRef.id,
        message: "Training session shared to feed!",
      };
    } catch (error) {
      console.error("Error creating training post:", error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  // Like/unlike a post - IMPROVED
  async toggleLike(postId, userId) {
    try {
      const postRef = doc(db, "socialFeed", postId);

      // Get current post data first
      const postDoc = await getDocs(
        query(collection(db, "socialFeed"), where("__name__", "==", postId)),
      );

      if (postDoc.empty) {
        return { success: false, error: "Post not found" };
      }

      const postData = postDoc.docs[0].data();
      const currentLikes = postData.likes || [];
      const isLiked = currentLikes.includes(userId);

      // Toggle like
      if (isLiked) {
        await updateDoc(postRef, {
          likes: arrayRemove(userId),
          likeCount: increment(-1),
        });
      } else {
        await updateDoc(postRef, {
          likes: arrayUnion(userId),
          likeCount: increment(1),
        });
      }

      return {
        success: true,
        isLiked: !isLiked,
        newLikeCount: isLiked
          ? (postData.likeCount || 0) - 1
          : (postData.likeCount || 0) + 1,
      };
    } catch (error) {
      console.error("Error toggling like:", error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  // NEW: Respect badge toggle
  async toggleRespect(postId, userId) {
    try {
      const postRef = doc(db, "socialFeed", postId);

      // Get current post data first
      const postDoc = await getDocs(
        query(collection(db, "socialFeed"), where("__name__", "==", postId)),
      );

      if (postDoc.empty) {
        return { success: false, error: "Post not found" };
      }

      const postData = postDoc.docs[0].data();
      const currentRespects = postData.respects || [];
      const hasRespected = currentRespects.includes(userId);

      // Toggle respect
      if (hasRespected) {
        await updateDoc(postRef, {
          respects: arrayRemove(userId),
          respectCount: increment(-1),
        });
      } else {
        await updateDoc(postRef, {
          respects: arrayUnion(userId),
          respectCount: increment(1),
        });
      }

      return {
        success: true,
        hasRespected: !hasRespected,
        newRespectCount: hasRespected
          ? (postData.respectCount || 0) - 1
          : (postData.respectCount || 0) + 1,
      };
    } catch (error) {
      console.error("Error toggling respect:", error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  // Add a comment to a post
  async addComment(postId, userId, userInfo, commentText) {
    try {
      const postRef = doc(db, "socialFeed", postId);

      const comment = {
        id: Date.now().toString(),
        userId,
        userName: userInfo.name,
        userAvatar: userInfo.avatar,
        text: commentText.trim(),
        timestamp: Timestamp.fromDate(new Date()),
      };

      await updateDoc(postRef, {
        comments: arrayUnion(comment),
        commentCount: increment(1),
      });

      return {
        success: true,
        comment,
      };
    } catch (error) {
      console.error("Error adding comment:", error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  // Get user's own posts
  async getUserPosts(userId, limitCount = 10) {
    try {
      const feedRef = collection(db, "socialFeed");
      const q = query(
        feedRef,
        where("userId", "==", userId),
        orderBy("timestamp", "desc"),
        limit(limitCount),
      );

      const querySnapshot = await getDocs(q);
      const posts = [];

      querySnapshot.forEach((doc) => {
        const data = doc.data();
        posts.push({
          id: doc.id,
          ...data,
          timestamp: data.timestamp?.toDate
            ? data.timestamp.toDate()
            : new Date(data.timestamp),
        });
      });

      return {
        success: true,
        posts,
      };
    } catch (error) {
      console.error("Error fetching user posts:", error);
      return {
        success: false,
        error: error.message,
        posts: [],
      };
    }
  }

  // NEW: Extract hashtags from text
  extractHashtags(text) {
    if (!text) return [];
    const hashtagRegex = /#[\w]+/g;
    const hashtags = text.match(hashtagRegex) || [];
    return hashtags.map((tag) => tag.toLowerCase());
  }

  // NEW: Extract mentions from text
  extractMentions(text) {
    if (!text) return [];
    const mentionRegex = /@[\w]+/g;
    const mentions = text.match(mentionRegex) || [];
    return mentions.map((mention) => mention.toLowerCase());
  }

  // Format time for display
  getTimeAgo(timestamp) {
    const now = new Date();
    const diffMs = now - timestamp;
    const diffMinutes = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMinutes < 1) {
      return "Just now";
    } else if (diffMinutes < 60) {
      return `${diffMinutes}m ago`;
    } else if (diffHours < 24) {
      return `${diffHours}h ago`;
    } else if (diffDays < 7) {
      return `${diffDays}d ago`;
    } else {
      return timestamp.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      });
    }
  }

  // Check if user can share (simple rate limiting)
  async canUserShare(userId) {
    try {
      // Simple check - allow 10 posts per day
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const feedRef = collection(db, "socialFeed");
      const q = query(
        feedRef,
        where("userId", "==", userId),
        where("timestamp", ">=", Timestamp.fromDate(today)),
      );

      const querySnapshot = await getDocs(q);
      const todayPostCount = querySnapshot.size;

      return {
        success: true,
        canShare: todayPostCount < 10,
        remainingPosts: Math.max(0, 10 - todayPostCount),
        message:
          todayPostCount >= 10
            ? "Daily sharing limit reached (10 posts per day)"
            : null,
      };
    } catch (error) {
      console.error("Error checking share limit:", error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  // NEW: Get posts by hashtag
  async getPostsByHashtag(hashtag, limitCount = 20) {
    try {
      const feedRef = collection(db, "socialFeed");
      const q = query(
        feedRef,
        where("hashtags", "array-contains", hashtag.toLowerCase()),
        where("isPublic", "==", true),
        orderBy("timestamp", "desc"),
        limit(limitCount),
      );

      const querySnapshot = await getDocs(q);
      const posts = [];

      querySnapshot.forEach((doc) => {
        const data = doc.data();
        posts.push({
          id: doc.id,
          ...data,
          timestamp: data.timestamp?.toDate(),
        });
      });

      return {
        success: true,
        posts,
      };
    } catch (error) {
      console.error("Error fetching posts by hashtag:", error);
      return {
        success: false,
        error: error.message,
        posts: [],
      };
    }
  }

  // NEW: Get trending hashtags
  async getTrendingHashtags(limitCount = 10) {
    try {
      // This would require aggregation in a real app
      // For now, return some popular hashtags
      const trendingHashtags = [
        { tag: "#bagwork", count: 45 },
        { tag: "#sparring", count: 32 },
        { tag: "#padwork", count: 28 },
        { tag: "#muaythai", count: 67 },
        { tag: "#boxing", count: 54 },
        { tag: "#fitness", count: 89 },
        { tag: "#training", count: 123 },
      ];

      return {
        success: true,
        hashtags: trendingHashtags.slice(0, limitCount),
      };
    } catch (error) {
      console.error("Error getting trending hashtags:", error);
      return {
        success: false,
        error: error.message,
        hashtags: [],
      };
    }
  }
}

export default new SocialFeedService();
