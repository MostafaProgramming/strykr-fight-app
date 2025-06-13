// =============================================
// 📱 src/services/api.js - Main API Service
// =============================================

import AsyncStorage from "@react-native-async-storage/async-storage";
import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";

class FightTrackerAPI {
  constructor() {
    this.baseURL = __DEV__
      ? "http://localhost:3000"
      : "https://your-production-api.com";
    this.accessToken = null;
    this.refreshToken = null;
  }

  // =============================================
  // 🔐 Authentication Methods
  // =============================================

  async setTokens(accessToken, refreshToken) {
    this.accessToken = accessToken;
    this.refreshToken = refreshToken;

    // Store securely
    if (Platform.OS === "web") {
      await AsyncStorage.setItem("fighttracker_access_token", accessToken);
      await AsyncStorage.setItem("fighttracker_refresh_token", refreshToken);
    } else {
      await SecureStore.setItemAsync("fighttracker_access_token", accessToken);
      await SecureStore.setItemAsync(
        "fighttracker_refresh_token",
        refreshToken,
      );
    }
  }

  async getStoredTokens() {
    try {
      if (Platform.OS === "web") {
        const accessToken = await AsyncStorage.getItem(
          "fighttracker_access_token",
        );
        const refreshToken = await AsyncStorage.getItem(
          "fighttracker_refresh_token",
        );
        return { accessToken, refreshToken };
      } else {
        const accessToken = await SecureStore.getItemAsync(
          "fighttracker_access_token",
        );
        const refreshToken = await SecureStore.getItemAsync(
          "fighttracker_refresh_token",
        );
        return { accessToken, refreshToken };
      }
    } catch (error) {
      console.error("Error getting stored tokens:", error);
      return { accessToken: null, refreshToken: null };
    }
  }

  async clearTokens() {
    this.accessToken = null;
    this.refreshToken = null;

    if (Platform.OS === "web") {
      await AsyncStorage.removeItem("fighttracker_access_token");
      await AsyncStorage.removeItem("fighttracker_refresh_token");
    } else {
      await SecureStore.deleteItemAsync("fighttracker_access_token");
      await SecureStore.deleteItemAsync("fighttracker_refresh_token");
    }
  }

  // Make authenticated API request
  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;

    const headers = {
      "Content-Type": "application/json",
      ...options.headers,
    };

    if (this.accessToken) {
      headers.Authorization = `Bearer ${this.accessToken}`;
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });

      const data = await response.json();

      if (!response.ok) {
        // Handle token expiry
        if (response.status === 401 && this.refreshToken) {
          const refreshed = await this.refreshAccessToken();
          if (refreshed) {
            // Retry the original request
            headers.Authorization = `Bearer ${this.accessToken}`;
            const retryResponse = await fetch(url, { ...options, headers });
            return retryResponse.json();
          }
        }

        throw new Error(data.error || `Request failed: ${response.status}`);
      }

      return data;
    } catch (error) {
      console.error("API Request failed:", error);
      throw error;
    }
  }

  async refreshAccessToken() {
    try {
      const response = await fetch(`${this.baseURL}/api/auth/refresh`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refreshToken: this.refreshToken }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        await this.setTokens(
          data.data.tokens.accessToken,
          data.data.tokens.refreshToken,
        );
        return true;
      } else {
        await this.clearTokens();
        return false;
      }
    } catch (error) {
      console.error("Token refresh failed:", error);
      await this.clearTokens();
      return false;
    }
  }

  // =============================================
  // 🔑 Auth Endpoints
  // =============================================

  async register(userData) {
    const response = await this.request("/api/auth/register", {
      method: "POST",
      body: JSON.stringify(userData),
    });

    if (response.success) {
      await this.setTokens(
        response.data.tokens.accessToken,
        response.data.tokens.refreshToken,
      );
    }

    return response;
  }

  async login(email, password, deviceInfo = null) {
    const response = await this.request("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({
        email,
        password,
        deviceInfo: deviceInfo || {
          deviceId: await this.getDeviceId(),
          platform: Platform.OS,
          appVersion: "1.0.0",
        },
      }),
    });

    if (response.success) {
      await this.setTokens(
        response.data.tokens.accessToken,
        response.data.tokens.refreshToken,
      );
    }

    return response;
  }

  async logout() {
    const response = await this.request("/api/auth/logout", {
      method: "POST",
      body: JSON.stringify({ refreshToken: this.refreshToken }),
    });

    await this.clearTokens();
    return response;
  }

  async getCurrentUser() {
    return this.request("/api/auth/me");
  }

  // =============================================
  // 📝 Posts Endpoints
  // =============================================

  async createPost(postData) {
    return this.request("/api/posts", {
      method: "POST",
      body: JSON.stringify(postData),
    });
  }

  async getFeed(params = {}) {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        query.append(key, value.toString());
      }
    });

    return this.request(`/api/posts/feed?${query}`);
  }

  async getPost(postId) {
    return this.request(`/api/posts/${postId}`);
  }

  async likePost(postId) {
    return this.request(`/api/posts/${postId}/like`, {
      method: "POST",
    });
  }

  async addComment(postId, content, parentId = null) {
    return this.request(`/api/posts/${postId}/comments`, {
      method: "POST",
      body: JSON.stringify({ content, parentId }),
    });
  }

  // =============================================
  // 📸 Media Endpoints
  // =============================================

  async getUploadUrl(fileInfo) {
    return this.request("/api/media/upload-url", {
      method: "POST",
      body: JSON.stringify(fileInfo),
    });
  }

  async confirmUpload(mediaId) {
    return this.request(`/api/media/${mediaId}/confirm`, {
      method: "POST",
    });
  }

  // =============================================
  // 👤 User Endpoints
  // =============================================

  async updateProfile(updates) {
    return this.request("/api/users/me", {
      method: "PATCH",
      body: JSON.stringify(updates),
    });
  }

  async searchUsers(query, limit = 20) {
    const params = new URLSearchParams({ q: query, limit: limit.toString() });
    return this.request(`/api/users/search?${params}`);
  }

  async followUser(userId) {
    return this.request(`/api/users/${userId}/follow`, {
      method: "POST",
    });
  }

  async unfollowUser(userId) {
    return this.request(`/api/users/${userId}/follow`, {
      method: "DELETE",
    });
  }

  // =============================================
  // 🏢 Gym Endpoints
  // =============================================

  async searchGyms(params = {}) {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        query.append(key, value.toString());
      }
    });

    return this.request(`/api/gyms/search?${query}`);
  }

  async joinGym(gymId) {
    return this.request(`/api/gyms/${gymId}/join`, {
      method: "POST",
    });
  }

  // =============================================
  // 🔧 Helper Methods
  // =============================================

  async getDeviceId() {
    const deviceIdKey = "fighttracker_device_id";
    let deviceId = await AsyncStorage.getItem(deviceIdKey);

    if (!deviceId) {
      deviceId =
        Math.random().toString(36).substring(2, 15) +
        Math.random().toString(36).substring(2, 15);
      await AsyncStorage.setItem(deviceIdKey, deviceId);
    }

    return deviceId;
  }

  async checkConnection() {
    try {
      const response = await fetch(`${this.baseURL}/health`);
      const data = await response.json();
      return { connected: response.ok, status: data };
    } catch (error) {
      return { connected: false, error: error.message };
    }
  }
}

export default FightTrackerAPI;
