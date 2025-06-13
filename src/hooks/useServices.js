// =============================================
// 📱 src/hooks/useServices.js - React Context & Hooks
// =============================================

import React, {
  useState,
  useEffect,
  useContext,
  createContext,
  useCallback,
} from "react";
import fightTrackerServices from "../services/servicesProvider";

// =============================================
// 🏗️ Services Context
// =============================================

const ServicesContext = createContext(null);

// =============================================
// 🎯 Services Provider Component
// =============================================

export const ServicesProvider = ({ children }) => {
  const [initialized, setInitialized] = useState(false);
  const [user, setUser] = useState(null);
  const [connectionStatus, setConnectionStatus] = useState({
    api: false,
    websocket: false,
    authenticated: false,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // =============================================
  // 🚀 Initialization Effect
  // =============================================

  useEffect(() => {
    const initializeServices = async () => {
      try {
        setLoading(true);
        setError(null);

        console.log("🚀 Initializing services in React context...");
        const success = await fightTrackerServices.initialize();

        if (success) {
          const currentUser = await fightTrackerServices.getCurrentUser();
          const status = fightTrackerServices.getConnectionStatus();

          setUser(currentUser);
          setConnectionStatus(status);
          setInitialized(true);

          console.log("✅ Services initialized in React context");
        } else {
          throw new Error("Failed to initialize services");
        }
      } catch (err) {
        console.error("❌ Services initialization failed:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    initializeServices();
  }, []);

  // =============================================
  // 📡 Event Listeners
  // =============================================

  useEffect(() => {
    if (!initialized) return;

    // Authentication events
    const handleLoginSuccess = (data) => {
      setUser(data.user);
      setConnectionStatus((prev) => ({
        ...prev,
        authenticated: true,
        websocket: data.websocket,
      }));
    };

    const handleLogoutSuccess = () => {
      setUser(null);
      setConnectionStatus((prev) => ({
        ...prev,
        authenticated: false,
        websocket: false,
      }));
    };

    const handleProfileUpdated = (updatedUser) => {
      setUser(updatedUser);
    };

    // WebSocket events
    const handleWebSocketConnected = () => {
      setConnectionStatus((prev) => ({ ...prev, websocket: true }));
    };

    const handleWebSocketDisconnected = () => {
      setConnectionStatus((prev) => ({ ...prev, websocket: false }));
    };

    // Register event listeners
    fightTrackerServices.on("auth:login_success", handleLoginSuccess);
    fightTrackerServices.on("auth:logout_success", handleLogoutSuccess);
    fightTrackerServices.on("user:profile_updated", handleProfileUpdated);
    fightTrackerServices.on("websocket:connected", handleWebSocketConnected);
    fightTrackerServices.on(
      "websocket:disconnected",
      handleWebSocketDisconnected,
    );

    // Cleanup function
    return () => {
      fightTrackerServices.off("auth:login_success", handleLoginSuccess);
      fightTrackerServices.off("auth:logout_success", handleLogoutSuccess);
      fightTrackerServices.off("user:profile_updated", handleProfileUpdated);
      fightTrackerServices.off("websocket:connected", handleWebSocketConnected);
      fightTrackerServices.off(
        "websocket:disconnected",
        handleWebSocketDisconnected,
      );
    };
  }, [initialized]);

  // =============================================
  // 🔐 Authentication Methods
  // =============================================

  const login = useCallback(async (email, password) => {
    try {
      setLoading(true);
      setError(null);

      const result = await fightTrackerServices.login(email, password);

      if (!result.success) {
        setError(result.error);
      }

      return result;
    } catch (err) {
      const errorMsg = err.message || "Login failed";
      setError(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setLoading(false);
    }
  }, []);

  const register = useCallback(async (userData) => {
    try {
      setLoading(true);
      setError(null);

      const result = await fightTrackerServices.register(userData);

      if (!result.success) {
        setError(result.error);
      }

      return result;
    } catch (err) {
      const errorMsg = err.message || "Registration failed";
      setError(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      setLoading(true);
      const result = await fightTrackerServices.logout();
      return result;
    } catch (err) {
      console.error("Logout error:", err);
      // Always succeed logout to clear state
      return { success: true };
    } finally {
      setLoading(false);
    }
  }, []);

  // =============================================
  // 🥊 Training Methods
  // =============================================

  const createTrainingSession = useCallback(
    async (sessionData, mediaFiles = []) => {
      try {
        setError(null);
        return await fightTrackerServices.createTrainingSession(
          sessionData,
          mediaFiles,
        );
      } catch (err) {
        const errorMsg = err.message || "Failed to create training session";
        setError(errorMsg);
        return { success: false, error: errorMsg };
      }
    },
    [],
  );

  const getTrainingSessions = useCallback(async (params = {}) => {
    try {
      return await fightTrackerServices.getTrainingSessions(params);
    } catch (err) {
      const errorMsg = err.message || "Failed to get training sessions";
      setError(errorMsg);
      return { success: false, error: errorMsg, sessions: [] };
    }
  }, []);

  const getTrainingStats = useCallback(async () => {
    try {
      return await fightTrackerServices.getTrainingStats();
    } catch (err) {
      const errorMsg = err.message || "Failed to get training stats";
      setError(errorMsg);
      return { success: false, error: errorMsg, stats: null };
    }
  }, []);

  // =============================================
  // 📸 Media Methods
  // =============================================

  const pickMedia = useCallback(async (options = {}) => {
    try {
      return await fightTrackerServices.pickMedia(options);
    } catch (err) {
      const errorMsg = err.message || "Failed to pick media";
      setError(errorMsg);
      return { success: false, error: errorMsg };
    }
  }, []);

  const takePhoto = useCallback(async () => {
    try {
      return await fightTrackerServices.takePhoto();
    } catch (err) {
      const errorMsg = err.message || "Failed to take photo";
      setError(errorMsg);
      return { success: false, error: errorMsg };
    }
  }, []);

  const takeVideo = useCallback(async () => {
    try {
      return await fightTrackerServices.takeVideo();
    } catch (err) {
      const errorMsg = err.message || "Failed to take video";
      setError(errorMsg);
      return { success: false, error: errorMsg };
    }
  }, []);

  // =============================================
  // 📱 Social Feed Methods
  // =============================================

  const getFeed = useCallback(async (params = {}) => {
    try {
      return await fightTrackerServices.getFeed(params);
    } catch (err) {
      const errorMsg = err.message || "Failed to get feed";
      setError(errorMsg);
      return { success: false, error: errorMsg };
    }
  }, []);

  const likePost = useCallback(async (postId) => {
    try {
      return await fightTrackerServices.likePost(postId);
    } catch (err) {
      const errorMsg = err.message || "Failed to like post";
      setError(errorMsg);
      return { success: false, error: errorMsg };
    }
  }, []);

  const addComment = useCallback(async (postId, content, parentId = null) => {
    try {
      return await fightTrackerServices.addComment(postId, content, parentId);
    } catch (err) {
      const errorMsg = err.message || "Failed to add comment";
      setError(errorMsg);
      return { success: false, error: errorMsg };
    }
  }, []);

  // =============================================
  // 🔗 WebSocket Methods
  // =============================================

  const connectWebSocket = useCallback(async () => {
    try {
      return await fightTrackerServices.connectWebSocket();
    } catch (err) {
      const errorMsg = err.message || "Failed to connect WebSocket";
      setError(errorMsg);
      return { success: false, error: errorMsg };
    }
  }, []);

  const sendMessage = useCallback((roomId, content, type = "text") => {
    return fightTrackerServices.sendMessage(roomId, content, type);
  }, []);

  const joinRoom = useCallback((roomId) => {
    return fightTrackerServices.joinRoom(roomId);
  }, []);

  // =============================================
  // 🔧 Utility Methods
  // =============================================

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const refreshConnectionStatus = useCallback(() => {
    const status = fightTrackerServices.getConnectionStatus();
    setConnectionStatus(status);
  }, []);

  // =============================================
  // 📦 Context Value
  // =============================================

  const value = {
    // State
    services: fightTrackerServices,
    initialized,
    loading,
    error,
    user,
    connectionStatus,

    // Computed values
    isAuthenticated: !!user,
    isConnected: connectionStatus.api,
    isWebSocketConnected: connectionStatus.websocket,

    // Authentication methods
    login,
    register,
    logout,

    // Training methods
    createTrainingSession,
    getTrainingSessions,
    getTrainingStats,

    // Media methods
    pickMedia,
    takePhoto,
    takeVideo,

    // Social methods
    getFeed,
    likePost,
    addComment,

    // WebSocket methods
    connectWebSocket,
    sendMessage,
    joinRoom,

    // Utility methods
    clearError,
    refreshConnectionStatus,
  };

  return (
    <ServicesContext.Provider value={value}>
      {children}
    </ServicesContext.Provider>
  );
};

// =============================================
// 🪝 Main Hook
// =============================================

export const useServices = () => {
  const context = useContext(ServicesContext);
  if (!context) {
    throw new Error("useServices must be used within a ServicesProvider");
  }
  return context;
};

// =============================================
// 🔐 Authentication Hook
// =============================================

export const useAuth = () => {
  const { user, isAuthenticated, login, register, logout, loading, error } =
    useServices();

  return {
    user,
    isAuthenticated,
    login,
    register,
    logout,
    loading,
    error,
  };
};

// =============================================
// 🥊 Training Hook
// =============================================

export const useTraining = () => {
  const {
    createTrainingSession,
    getTrainingSessions,
    getTrainingStats,
    pickMedia,
    takePhoto,
    takeVideo,
    loading,
    error,
  } = useServices();

  return {
    createTrainingSession,
    getTrainingSessions,
    getTrainingStats,
    pickMedia,
    takePhoto,
    takeVideo,
    loading,
    error,
  };
};

// =============================================
// 📱 Social Hook
// =============================================

export const useSocial = () => {
  const { getFeed, likePost, addComment, loading, error } = useServices();

  const [feed, setFeed] = useState([]);
  const [feedLoading, setFeedLoading] = useState(false);

  const loadFeed = useCallback(
    async (params = {}) => {
      setFeedLoading(true);
      try {
        const result = await getFeed(params);
        if (result.success) {
          setFeed(result.data.posts || []);
        }
        return result;
      } finally {
        setFeedLoading(false);
      }
    },
    [getFeed],
  );

  const refreshFeed = useCallback(() => {
    return loadFeed({ limit: 20, offset: 0 });
  }, [loadFeed]);

  return {
    feed,
    feedLoading,
    loadFeed,
    refreshFeed,
    likePost,
    addComment,
    loading,
    error,
  };
};

// =============================================
// 🔗 WebSocket Hook
// =============================================

export const useWebSocket = () => {
  const {
    services,
    isWebSocketConnected,
    connectWebSocket,
    sendMessage,
    joinRoom,
  } = useServices();

  const [messages, setMessages] = useState([]);
  const [notifications, setNotifications] = useState([]);

  // Setup WebSocket event listeners
  useEffect(() => {
    if (!isWebSocketConnected) return;

    const handleNewMessage = (message) => {
      setMessages((prev) => [message, ...prev]);
    };

    const handleNewNotification = (notification) => {
      setNotifications((prev) => [notification, ...prev]);
    };

    services.on("chat:new_message", handleNewMessage);
    services.on("notification:new", handleNewNotification);

    return () => {
      services.off("chat:new_message", handleNewMessage);
      services.off("notification:new", handleNewNotification);
    };
  }, [isWebSocketConnected, services]);

  const clearMessages = useCallback(() => {
    setMessages([]);
  }, []);

  const clearNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  return {
    isConnected: isWebSocketConnected,
    messages,
    notifications,
    connectWebSocket,
    sendMessage,
    joinRoom,
    clearMessages,
    clearNotifications,
  };
};

// =============================================
// 📊 Connection Status Hook
// =============================================

export const useConnectionStatus = () => {
  const { connectionStatus, refreshConnectionStatus } = useServices();

  useEffect(() => {
    // Refresh connection status every 30 seconds
    const interval = setInterval(refreshConnectionStatus, 30000);
    return () => clearInterval(interval);
  }, [refreshConnectionStatus]);

  return {
    ...connectionStatus,
    refresh: refreshConnectionStatus,
  };
};
