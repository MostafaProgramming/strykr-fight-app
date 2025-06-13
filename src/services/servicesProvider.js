// =============================================
// 📱 src/services/servicesProvider.js - Main Services Manager
// =============================================

import FightTrackerAPI from './api';
import EnhancedTrainingService from './enhancedTrainingService';
import WebSocketService from './websocketService';

class FightTrackerServices {
  constructor() {
    // Initialize core services
    this.api = new FightTrackerAPI();
    this.training = new EnhancedTrainingService(this.api);
    this.websocket = new WebSocketService(this.api);

    // State management
    this.initialized = false;
    this.currentUser = null;
    this.connectionStatus = {
      api: false,
      websocket: false,
    };

    // Event listeners
    this.listeners = new Map();

    // Bind methods to preserve context
    this.initialize = this.initialize.bind(this);
    this.login = this.login.bind(this);
    this.logout = this.logout.bind(this);
  }

  // =============================================
  // 🚀 Initialization
  // =============================================

  async initialize() {
    try {
      console.log('🚀 Initializing FightTracker services...');

      // Load stored tokens
      const tokens = await this.api.getStoredTokens();
      if (tokens.accessToken) {
        this.api.accessToken = tokens.accessToken;
        this.api.refreshToken = tokens.refreshToken;
        console.log('🔑 Loaded stored authentication tokens');
      }

      // Check API connection
      const connectionCheck = await this.api.checkConnection();
      this.connectionStatus.api = connectionCheck.connected;

      if (connectionCheck.connected) {
        console.log('✅ API connection successful');

        // Try to get current user if we have tokens
        if (tokens.accessToken) {
          try {
            const userResponse = await this.api.getCurrentUser();
            if (userResponse.success) {
              this.currentUser = userResponse.data.user;
              console.log('👤 Current user loaded:', this.currentUser.username);
            }
          } catch (error) {
            console.warn('⚠️ Failed to load current user (token may be expired)');
            // Clear tokens if they're invalid
            await this.api.clearTokens();
          }
        }
      } else {
        console.warn('⚠️ API connection failed:', connectionCheck.error);
      }

      this.initialized = true;
      this.emit('services:initialized', {
        api: this.connectionStatus.api,
        user: this.currentUser,
      });

      console.log('✅ FightTracker services initialized successfully');
      return true;
    } catch (error) {
      console.error('❌ Failed to initialize services:', error);
      this.emit('services:initialization_failed', error);
      return false;
    }
  }

  // =============================================
  // 🔐 Authentication Management
  // =============================================

  async login(email, password) {
    try {
      console.log('🔐 Logging in user:', email);

      const response = await this.api.login(email, password);

      if (response.success) {
        this.currentUser = response.data.user;
        console.log('✅ Login successful for:', this.currentUser.username);

        // Initialize WebSocket connection after successful login
        try {
          await this.websocket.connect();
          this.connectionStatus.websocket = true;
          console.log('🔗 WebSocket connected after login');
        } catch (socketError) {
          console.warn('⚠️ WebSocket connection failed (continuing without real-time features):', socketError.message);
          this.connectionStatus.websocket = false;
        }

        this.emit('auth:login_success', {
          user: this.currentUser,
          websocket: this.connectionStatus.websocket,
        });
      } else {
        console.error('❌ Login failed:', response.error);
        this.emit('auth:login_failed', response.error);
      }

      return response;
    } catch (error) {
      console.error('❌ Login error:', error);
      const errorResponse = { success: false, error: error.message };
      this.emit('auth:login_failed', error.message);
      return errorResponse;
    }
  }

  async register(userData) {
    try {
      console.log('📝 Registering new user:', userData.email);

      const response = await this.api.register(userData);

      if (response.success) {
        this.currentUser = response.data.user;
        console.log('✅ Registration successful for:', this.currentUser.username);

        // Initialize WebSocket connection
        try {
          await this.websocket.connect();
          this.connectionStatus.websocket = true;
        } catch (socketError) {
          console.warn('⚠️ WebSocket connection failed:', socketError.message);
          this.connectionStatus.websocket = false;
        }

        this.emit('auth:register_success', {
          user: this.currentUser,
          websocket: this.connectionStatus.websocket,
        });
      } else {
        this.emit('auth:register_failed', response.error);
      }

      return response;
    } catch (error) {
      console.error('❌ Registration error:', error);
      const errorResponse = { success: false, error: error.message };
      this.emit('auth:register_failed', error.message);
      return errorResponse;
    }
  }

  async logout() {
    try {
      console.log('🚪 Logging out user...');

      // Disconnect WebSocket first
      if (this.websocket.isSocketConnected()) {
        this.websocket.disconnect();
        this.connectionStatus.websocket = false;
      }

      // Logout from API
      await this.api.logout();

      // Clear user state
      this.currentUser = null;

      console.log('✅ Logout successful');
      this.emit('auth:logout_success');

      return { success: true };
    } catch (error) {
      console.error('❌ Logout error:', error);

      // Clear state anyway
      this.currentUser = null;
      this.connectionStatus.websocket = false;

      this.emit('auth:logout_success'); // Still emit success
      return { success: true }; // Always return success for logout
    }
  }

  // =============================================
  // 👤 User Management
  // =============================================

  async getCurrentUser() {
    if (this.currentUser) {
      return this.currentUser;
    }

    try {
      const response = await this.api.getCurrentUser();
      if (response.success) {
        this.currentUser = response.data.user;
        return this.currentUser;
      }
      return null;
    } catch (error) {
      console.error('❌ Error getting current user:', error);
      return null;
    }
  }

  async updateProfile(updates) {
    try {
      const response = await this.api.updateProfile(updates);

      if (response.success && this.currentUser) {
        // Update local user object
        this.currentUser = { ...this.currentUser, ...updates };
        this.emit('user:profile_updated', this.currentUser);
      }

      return response;
    } catch (error) {
      console.error('❌ Error updating profile:', error);
      return { success: false, error: error.message };
    }
  }

  // =============================================
  // 🥊 Training Methods
  // =============================================

  async createTrainingSession(sessionData, mediaFiles = []) {
    try {
      console.log('🥊 Creating training session...');

      const result = await this.training.createTrainingSession(sessionData, mediaFiles);

      if (result.success) {
        this.emit('training:session_created', {
          sessionId: result.sessionId,
          mediaUploaded: result.mediaUploaded,
        });
      } else {
        this.emit('training:session_failed', result.error);
      }

      return result;
    } catch (error) {
      console.error('❌ Error creating training session:', error);
      const errorResult = { success: false, error: error.message };
      this.emit('training:session_failed', error.message);
      return errorResult;
    }
  }

  async getTrainingSessions(params = {}) {
    return this.training.getTrainingSessions(params);
  }

  async getTrainingStats() {
    return this.training.getTrainingStats();
  }

  // =============================================
  // 📸 Media Methods
  // =============================================

  async pickMedia(options = {}) {
    return this.training.pickMedia(options);
  }

  async takePhoto() {
    return this.training.takeMedia('photo');
  }

  async takeVideo() {
    return this.training.takeMedia('video');
  }

  async uploadMedia(mediaFile, onProgress = null) {
    return this.training.uploadMedia(mediaFile, onProgress);
  }

  // =============================================
  // 📱 Social Feed Methods
  // =============================================

  async getFeed(params = {}) {
    try {
      const response = await this.api.getFeed(params);

      if (response.success) {
        this.emit('feed:loaded', response.data);
      }

      return response;
    } catch (error) {
      console.error('❌ Error getting feed:', error);
      return { success: false, error: error.message };
    }
  }

  async likePost(postId) {
    try {
      const response = await this.api.likePost(postId);

      if (response.success) {
        this.emit('post:liked', { postId, liked: response.data.liked });
      }

      return response;
    } catch (error) {
      console.error('❌ Error liking post:', error);
      return { success: false, error: error.message };
    }
  }

  async addComment(postId, content, parentId = null) {
    try {
      const response = await this.api.addComment(postId, content, parentId);

      if (response.success) {
        this.emit('comment:added', { postId, comment: response.data.comment });
      }

      return response;
    } catch (error) {
      console.error('❌ Error adding comment:', error);
      return { success: false, error: error.message };
    }
  }

  // =============================================
  // 🔗 WebSocket Methods
  // =============================================

  async connectWebSocket() {
    try {
      if (!this.currentUser) {
        throw new Error('User must be authenticated to connect WebSocket');
      }

      await this.websocket.connect();
      this.connectionStatus.websocket = true;
      this.emit('websocket:connected');

      return { success: true };
    } catch (error) {
      console.error('❌ WebSocket connection failed:', error);
      this.connectionStatus.websocket = false;
      this.emit('websocket:connection_failed', error.message);
      return { success: false, error: error.message };
    }
  }

  disconnectWebSocket() {
    this.websocket.disconnect();
    this.connectionStatus.websocket = false;
    this.emit('websocket:disconnected');
  }

  // Chat methods
  sendMessage(roomId, content, type = 'text') {
    return this.websocket.sendMessage(roomId, content, type);
  }

  joinRoom(roomId) {
    return this.websocket.joinRoom(roomId);
  }

  leaveRoom(roomId) {
    return this.websocket.leaveRoom(roomId);
  }

  // Live session methods
  startLiveSession(title, description, type = 'training') {
    return this.websocket.startLiveSession(title, description, type);
  }

  joinLiveSession(sessionId) {
    return this.websocket.joinLiveSession(sessionId);
  }

  // =============================================
  // 🔍 Status & Utilities
  // =============================================

  isAuthenticated() {
    return !!this.currentUser;
  }

  isConnected() {
    return this.connectionStatus.api;
  }

  isWebSocketConnected() {
    return this.connectionStatus.websocket;
  }

  getConnectionStatus() {
    return {
      ...this.connectionStatus,
      authenticated: this.isAuthenticated(),
      user: this.currentUser,
    };
  }

  // =============================================
  // 📡 Event Management
  // =============================================

  on(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event).push(callback);

    // Also listen to WebSocket events
    if (event.startsWith('chat:') || event.startsWith('live:') || event.startsWith('notification:')) {
      this.websocket.on(event, callback);
    }
  }

  off(event, callback) {
    if (!callback) {
      this.listeners.delete(event);
    } else {
      const callbacks = this.listeners.get(event);
      if (callbacks) {
        const index = callbacks.indexOf(callback);
        if (index > -1) {
          callbacks.splice(index, 1);
        }
      }
    }

    // Also remove from WebSocket
    this.websocket.off(event, callback);
  }

  emit(event, ...args) {
    const callbacks = this.listeners.get(event) || [];
    callbacks.forEach(callback => {
      try {
        callback(...args);
      } catch (error) {
        console.error(`❌ Error in ${event} callback:`, error);
      }
    });
  }

  // =============================================
  // 🧹 Cleanup
  // =============================================

  cleanup() {
    console.log('🧹 Cleaning up services...');

    this.disconnectWebSocket();
    this.listeners.clear();
    this.currentUser = null;
    this.initialized = false;
    this.connectionStatus = { api: false, websocket: false };
  }
}

// =============================================
// 📦 Singleton Export
// =============================================

const fightTrackerServices = new FightTrackerServices();

export default fightTrackerServices;

// Named exports for individual services
export { 
  FightTrackerAPI, 
  EnhancedTrainingService, 
  WebSocketService 
};