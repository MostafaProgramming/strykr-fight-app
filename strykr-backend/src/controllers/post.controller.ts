// =============================================
// 🎛️ src/controllers/post.controller.ts
// =============================================

import { Request, Response } from "express";
import { PostService } from "../services/post.service";
import { MediaService } from "../services/media.service";

export class PostController {
  // POST /posts
  static async createPost(req: Request, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          error: "Authentication required",
          code: "AUTH_REQUIRED",
        });
      }

      const postData = {
        ...req.body,
        userId: req.user.id,
      };

      const post = await PostService.createPost(postData);

      res.status(201).json({
        success: true,
        message: "Post created successfully",
        data: { post },
      });
    } catch (error: any) {
      console.error("Create post error:", error);
      res.status(400).json({
        success: false,
        error: error.message || "Failed to create post",
        code: "CREATE_POST_FAILED",
      });
    }
  }

  // GET /posts/feed
  static async getFeed(req: Request, res: Response) {
    try {
      const { limit, offset, filter } = req.query as any;
      const userId = req.user?.id;

      const result = await PostService.getFeed({
        userId,
        limit: parseInt(limit),
        offset: parseInt(offset),
        filter,
      });

      res.json({
        success: true,
        data: result,
      });
    } catch (error: any) {
      console.error("Get feed error:", error);
      res.status(400).json({
        success: false,
        error: error.message || "Failed to get feed",
        code: "GET_FEED_FAILED",
      });
    }
  }

  // GET /posts/:postId
  static async getPost(req: Request, res: Response) {
    try {
      const { postId } = req.params;
      const userId = req.user?.id;

      const post = await PostService.getPostById(postId, userId);

      res.json({
        success: true,
        data: { post },
      });
    } catch (error: any) {
      console.error("Get post error:", error);
      res.status(404).json({
        success: false,
        error: error.message || "Post not found",
        code: "POST_NOT_FOUND",
      });
    }
  }

  // PATCH /posts/:postId
  static async updatePost(req: Request, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          error: "Authentication required",
          code: "AUTH_REQUIRED",
        });
      }

      const { postId } = req.params;
      const updates = req.body;

      const post = await PostService.updatePost(postId, req.user.id, updates);

      res.json({
        success: true,
        message: "Post updated successfully",
        data: { post },
      });
    } catch (error: any) {
      console.error("Update post error:", error);
      res.status(400).json({
        success: false,
        error: error.message || "Failed to update post",
        code: "UPDATE_POST_FAILED",
      });
    }
  }

  // DELETE /posts/:postId
  static async deletePost(req: Request, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          error: "Authentication required",
          code: "AUTH_REQUIRED",
        });
      }

      const { postId } = req.params;

      await PostService.deletePost(postId, req.user.id);

      res.json({
        success: true,
        message: "Post deleted successfully",
      });
    } catch (error: any) {
      console.error("Delete post error:", error);
      res.status(400).json({
        success: false,
        error: error.message || "Failed to delete post",
        code: "DELETE_POST_FAILED",
      });
    }
  }

  // POST /posts/:postId/like
  static async likePost(req: Request, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          error: "Authentication required",
          code: "AUTH_REQUIRED",
        });
      }

      const { postId } = req.params;
      const result = await PostService.toggleLike(postId, req.user.id);

      res.json({
        success: true,
        message: result.liked ? "Post liked" : "Post unliked",
        data: result,
      });
    } catch (error: any) {
      console.error("Like post error:", error);
      res.status(400).json({
        success: false,
        error: error.message || "Failed to like post",
        code: "LIKE_POST_FAILED",
      });
    }
  }

  // DELETE /posts/:postId/like
  static async unlikePost(req: Request, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          error: "Authentication required",
          code: "AUTH_REQUIRED",
        });
      }

      const { postId } = req.params;
      await PostService.removeLike(postId, req.user.id);

      res.json({
        success: true,
        message: "Post unliked",
      });
    } catch (error: any) {
      console.error("Unlike post error:", error);
      res.status(400).json({
        success: false,
        error: error.message || "Failed to unlike post",
        code: "UNLIKE_POST_FAILED",
      });
    }
  }

  // POST /posts/:postId/comments
  static async addComment(req: Request, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          error: "Authentication required",
          code: "AUTH_REQUIRED",
        });
      }

      const { postId } = req.params;
      const { content, parentId } = req.body;

      const comment = await PostService.addComment({
        postId,
        userId: req.user.id,
        content,
        parentId,
      });

      res.status(201).json({
        success: true,
        message: "Comment added successfully",
        data: { comment },
      });
    } catch (error: any) {
      console.error("Add comment error:", error);
      res.status(400).json({
        success: false,
        error: error.message || "Failed to add comment",
        code: "ADD_COMMENT_FAILED",
      });
    }
  }

  // GET /posts/:postId/comments
  static async getComments(req: Request, res: Response) {
    try {
      const { postId } = req.params;
      const { limit = "20", offset = "0" } = req.query as any;

      const comments = await PostService.getComments(postId, {
        limit: parseInt(limit),
        offset: parseInt(offset),
      });

      res.json({
        success: true,
        data: { comments },
      });
    } catch (error: any) {
      console.error("Get comments error:", error);
      res.status(400).json({
        success: false,
        error: error.message || "Failed to get comments",
        code: "GET_COMMENTS_FAILED",
      });
    }
  }

  // PATCH /posts/comments/:commentId
  static async updateComment(req: Request, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          error: "Authentication required",
          code: "AUTH_REQUIRED",
        });
      }

      const { commentId } = req.params;
      const { content } = req.body;

      const comment = await PostService.updateComment(
        commentId,
        req.user.id,
        content,
      );

      res.json({
        success: true,
        message: "Comment updated successfully",
        data: { comment },
      });
    } catch (error: any) {
      console.error("Update comment error:", error);
      res.status(400).json({
        success: false,
        error: error.message || "Failed to update comment",
        code: "UPDATE_COMMENT_FAILED",
      });
    }
  }

  // DELETE /posts/comments/:commentId
  static async deleteComment(req: Request, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          error: "Authentication required",
          code: "AUTH_REQUIRED",
        });
      }

      const { commentId } = req.params;

      await PostService.deleteComment(commentId, req.user.id);

      res.json({
        success: true,
        message: "Comment deleted successfully",
      });
    } catch (error: any) {
      console.error("Delete comment error:", error);
      res.status(400).json({
        success: false,
        error: error.message || "Failed to delete comment",
        code: "DELETE_COMMENT_FAILED",
      });
    }
  }

  // POST /posts/comments/:commentId/like
  static async likeComment(req: Request, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          error: "Authentication required",
          code: "AUTH_REQUIRED",
        });
      }

      const { commentId } = req.params;
      const result = await PostService.toggleCommentLike(
        commentId,
        req.user.id,
      );

      res.json({
        success: true,
        message: result.liked ? "Comment liked" : "Comment unliked",
        data: result,
      });
    } catch (error: any) {
      console.error("Like comment error:", error);
      res.status(400).json({
        success: false,
        error: error.message || "Failed to like comment",
        code: "LIKE_COMMENT_FAILED",
      });
    }
  }
}
