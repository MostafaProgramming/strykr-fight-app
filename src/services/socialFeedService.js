// src/services/socialFeedService.js
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
  // Get feed posts with real Firebase data
  async getFeedPosts(filterType = "foryou", userId = null, limitCount = 20) {
    try {
      const feedRef = collection(db, "socialFeed");
      let q;

      switch (filterType) {
        case "foryou":
          // Algorithm-based feed (for now, just recent + popular)
          q = query(
            feedRef,
            where("isPublic", "==", true),
            orderBy("timestamp", "desc"),
            limit(limitCount),
          );
          break;

        case "following":
          // TODO: Add following system later
          // For now, exclude user's own posts
          q = query(
            feedRef,
            where("isPublic", "==", true),
            where("userId", "!=", userId || "none"),
            orderBy("timestamp", "desc"),
            limit(limitCount),
          );
          break;

        case "gym":
          // TODO: Filter by user's gym when we have that data
          q = query(
            feedRef,
            where("isPublic", "==", true),
            orderBy("timestamp", "desc"),
            limit(limitCount),
          );
          break;

        case "trending":
          // Get posts from last week, sorted by engagement
          const weekAgo = new Date();
          weekAgo.setDate(weekAgo.getDate() - 7);

          q = query(
            feedRef,
            where("isPublic", "==", true),
            where("timestamp", ">=", Timestamp.fromDate(weekAgo)),
            orderBy("timestamp", "desc"),
            limit(limitCount * 2), // Get more to sort by engagement
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
          timestamp: data.timestamp?.toDate(),
          isLiked: userId ? (data.likes || []).includes(userId) : false,
          // Calculate engagement score for trending
          engagementScore: (data.likeCount || 0) + (data.commentCount || 0) * 2,
        });
      });

      // Sort trending by engagement
      if (filterType === "trending") {
        posts.sort((a, b) => b.engagementScore - a.engagementScore);
        return {
          success: true,
          posts: posts.slice(0, limitCount),
        };
      }

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

  // Like/unlike a post
  async toggleLike(postId, userId) {
    try {
      const postRef = doc(db, "socialFeed", postId);

      // Get current post to check likes
      const postSnapshot = await getDocs(
        query(collection(db, "socialFeed"), where("__name__", "==", postId)),
      );

      if (postSnapshot.empty) {
        return { success: false, error: "Post not found" };
      }

      const postData = postSnapshot.docs[0].data();
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

  // Get comments for a post
  async getPostComments(postId) {
    try {
      const postRef = doc(db, "socialFeed", postId);
      const postDoc = await postRef.get();

      if (!postDoc.exists()) {
        return { success: false, error: "Post not found" };
      }

      const comments = postDoc.data().comments || [];

      // Convert timestamps
      const processedComments = comments.map((comment) => ({
        ...comment,
        timestamp: comment.timestamp?.toDate(),
      }));

      return {
        success: true,
        comments: processedComments,
      };
    } catch (error) {
      console.error("Error fetching comments:", error);
      return {
        success: false,
        error: error.message,
        comments: [],
      };
    }
  }

  // Create a post when user shares training session
  async createTrainingPost(sessionData, userInfo) {
    try {
      const feedRef = collection(db, "socialFeed");

      const post = {
        sessionId: sessionData.sessionId || null,
        userId: userInfo.uid,
        userName: userInfo.name,
        userAvatar:
          userInfo.avatar || userInfo.name.substring(0, 2).toUpperCase(),
        userGym: userInfo.gym || "",
        userLevel: userInfo.fighterLevel || "Amateur",

        // Session details
        sessionType: sessionData.type,
        sessionDuration: sessionData.duration,
        sessionRounds: sessionData.rounds || 0,
        sessionIntensity: sessionData.intensity,
        sessionCalories: sessionData.calories || 0,
        sessionNotes: sessionData.notes || "",
        sessionMood: sessionData.mood || null,

        // Media (for future use)
        media: sessionData.media || [],

        // Post metadata
        timestamp: Timestamp.fromDate(new Date()),
        likes: [],
        likeCount: 0,
        comments: [],
        commentCount: 0,
        shares: 0,
        isPublic: true,
        postType: "training_session",
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
          timestamp: data.timestamp?.toDate(),
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

  // Format time for display (e.g., "2 hours ago")
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

  // Get feed statistics
  async getFeedStats(userId) {
    try {
      const userPosts = await this.getUserPosts(userId, 100);

      if (!userPosts.success) {
        return userPosts;
      }

      const posts = userPosts.posts;
      const totalPosts = posts.length;
      const totalLikes = posts.reduce(
        (sum, post) => sum + (post.likeCount || 0),
        0,
      );
      const totalComments = posts.reduce(
        (sum, post) => sum + (post.commentCount || 0),
        0,
      );

      // Most popular session type
      const sessionTypes = {};
      posts.forEach((post) => {
        const type = post.sessionType;
        if (type) {
          sessionTypes[type] = (sessionTypes[type] || 0) + 1;
        }
      });

      const mostSharedType =
        Object.keys(sessionTypes).length > 0
          ? Object.keys(sessionTypes).reduce((a, b) =>
              sessionTypes[a] > sessionTypes[b] ? a : b,
            )
          : "None";

      return {
        success: true,
        stats: {
          totalPosts,
          totalLikes,
          totalComments,
          mostSharedType,
          avgLikesPerPost:
            totalPosts > 0 ? Math.round(totalLikes / totalPosts) : 0,
          avgCommentsPerPost:
            totalPosts > 0 ? Math.round(totalComments / totalPosts) : 0,
        },
      };
    } catch (error) {
      console.error("Error getting feed stats:", error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  // Check if user can share (rate limiting)
  async canUserShare(userId) {
    try {
      // Limit to 10 posts per day
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
}

export default new SocialFeedService();
