// src/components/InstagramMediaViewer.js - SOCIAL MEDIA STYLE VIEWER
import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Modal,
  Dimensions,
  TouchableOpacity,
  Image,
  Text,
  StyleSheet,
  PanGestureHandler,
  State,
  Animated,
  StatusBar,
  SafeAreaView,
  ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Video } from "expo-av";
import { colors } from "../constants/colors";

const { width: screenWidth, height: screenHeight } = Dimensions.get("window");

const InstagramMediaViewer = ({
  visible,
  media = [],
  initialIndex = 0,
  onClose,
  onShare,
  onLike,
  onComment,
  showActions = true,
  showInfo = true,
}) => {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [isPlaying, setIsPlaying] = useState(false);
  const [videoStatus, setVideoStatus] = useState({});
  const [showControls, setShowControls] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  const scrollViewRef = useRef(null);
  const videoRefs = useRef({});
  const pan = useRef(new Animated.ValueXY()).current;
  const opacity = useRef(new Animated.Value(1)).current;
  const scale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (visible) {
      setCurrentIndex(initialIndex);
      setImageLoaded(false);
      // Reset animations
      pan.setValue({ x: 0, y: 0 });
      opacity.setValue(1);
      scale.setValue(1);
    }
  }, [visible, initialIndex]);

  useEffect(() => {
    // Pause all videos except current
    Object.keys(videoRefs.current).forEach((key) => {
      const index = parseInt(key);
      if (index !== currentIndex && videoRefs.current[key]) {
        videoRefs.current[key].pauseAsync();
      }
    });
  }, [currentIndex]);

  const currentMedia = media[currentIndex];
  const isVideo = currentMedia?.type === "video";
  const isLastItem = currentIndex === media.length - 1;
  const isFirstItem = currentIndex === 0;

  // Gesture handling for swipe to dismiss
  const onGestureEvent = Animated.event(
    [{ nativeEvent: { translationX: pan.x, translationY: pan.y } }],
    { useNativeDriver: false },
  );

  const onHandlerStateChange = (event) => {
    if (event.nativeEvent.oldState === State.ACTIVE) {
      const { translationY, velocityY } = event.nativeEvent;

      // Check if swipe down to dismiss
      if (translationY > 100 || velocityY > 500) {
        dismissWithAnimation();
      } else {
        // Spring back to original position
        Animated.parallel([
          Animated.spring(pan, {
            toValue: { x: 0, y: 0 },
            useNativeDriver: false,
          }),
          Animated.spring(opacity, {
            toValue: 1,
            useNativeDriver: false,
          }),
          Animated.spring(scale, {
            toValue: 1,
            useNativeDriver: false,
          }),
        ]).start();
      }
    }
  };

  const dismissWithAnimation = () => {
    Animated.parallel([
      Animated.timing(pan.y, {
        toValue: screenHeight,
        duration: 300,
        useNativeDriver: false,
      }),
      Animated.timing(opacity, {
        toValue: 0,
        duration: 300,
        useNativeDriver: false,
      }),
      Animated.timing(scale, {
        toValue: 0.8,
        duration: 300,
        useNativeDriver: false,
      }),
    ]).start(() => {
      onClose();
    });
  };

  const handleNext = () => {
    if (!isLastItem) {
      setCurrentIndex(currentIndex + 1);
      setImageLoaded(false);
    }
  };

  const handlePrevious = () => {
    if (!isFirstItem) {
      setCurrentIndex(currentIndex - 1);
      setImageLoaded(false);
    }
  };

  const toggleVideoPlayback = async () => {
    const videoRef = videoRefs.current[currentIndex];
    if (videoRef) {
      if (isPlaying) {
        await videoRef.pauseAsync();
      } else {
        await videoRef.playAsync();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const formatDuration = (millis) => {
    const seconds = Math.floor(millis / 1000);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
  };

  const MediaContent = () => {
    if (!currentMedia) return null;

    if (isVideo) {
      return (
        <TouchableOpacity
          style={styles.mediaContainer}
          activeOpacity={1}
          onPress={() => setShowControls(!showControls)}
        >
          <Video
            ref={(ref) => (videoRefs.current[currentIndex] = ref)}
            source={{ uri: currentMedia.downloadURL }}
            style={styles.video}
            resizeMode="contain"
            shouldPlay={false}
            isLooping={false}
            onPlaybackStatusUpdate={(status) => {
              setVideoStatus(status);
              setIsPlaying(status.isPlaying);
            }}
            onLoad={() => setImageLoaded(true)}
          />

          {/* Video Controls Overlay */}
          {showControls && (
            <View style={styles.videoControls}>
              <TouchableOpacity
                style={styles.playButton}
                onPress={toggleVideoPlayback}
              >
                <Ionicons
                  name={isPlaying ? "pause" : "play"}
                  size={60}
                  color="rgba(255,255,255,0.9)"
                />
              </TouchableOpacity>
            </View>
          )}

          {/* Video Progress Bar */}
          {videoStatus.durationMillis && (
            <View style={styles.progressContainer}>
              <View style={styles.progressBar}>
                <View
                  style={[
                    styles.progressFill,
                    {
                      width: `${
                        (videoStatus.positionMillis /
                          videoStatus.durationMillis) *
                        100
                      }%`,
                    },
                  ]}
                />
              </View>
              <Text style={styles.durationText}>
                {formatDuration(videoStatus.positionMillis || 0)} /
                {formatDuration(videoStatus.durationMillis)}
              </Text>
            </View>
          )}

          {/* Video Thumbnail when not loaded */}
          {!imageLoaded && currentMedia.thumbnailURL && (
            <Image
              source={{ uri: currentMedia.thumbnailURL }}
              style={styles.videoThumbnail}
              resizeMode="cover"
            />
          )}
        </TouchableOpacity>
      );
    }

    return (
      <TouchableOpacity
        style={styles.mediaContainer}
        activeOpacity={1}
        onPress={() => setShowControls(!showControls)}
      >
        <Image
          source={{ uri: currentMedia.downloadURL }}
          style={styles.image}
          resizeMode="contain"
          onLoad={() => setImageLoaded(true)}
          onError={(error) => console.error("Image load error:", error)}
        />

        {!imageLoaded && (
          <View style={styles.imageLoader}>
            <Ionicons name="image" size={60} color={colors.textSecondary} />
            <Text style={styles.loadingText}>Loading...</Text>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  const ActionBar = () => {
    if (!showActions) return null;

    return (
      <View style={styles.actionBar}>
        <View style={styles.leftActions}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => onLike && onLike(currentMedia)}
          >
            <Ionicons name="heart-outline" size={28} color={colors.text} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => onComment && onComment(currentMedia)}
          >
            <Ionicons name="chatbubble-outline" size={26} color={colors.text} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => onShare && onShare(currentMedia)}
          >
            <Ionicons
              name="paper-plane-outline"
              size={26}
              color={colors.text}
            />
          </TouchableOpacity>
        </View>

        {/* Media Counter */}
        {media.length > 1 && (
          <View style={styles.counterContainer}>
            <Text style={styles.counterText}>
              {currentIndex + 1} / {media.length}
            </Text>
          </View>
        )}
      </View>
    );
  };

  const InfoPanel = () => {
    if (!showInfo || !currentMedia) return null;

    return (
      <View style={styles.infoPanel}>
        <Text style={styles.mediaInfo}>
          {isVideo ? "🎥 Video" : "📸 Photo"}
          {currentMedia.duration &&
            ` • ${formatDuration(currentMedia.duration)}`}
          {currentMedia.fileSize &&
            ` • ${(currentMedia.fileSize / (1024 * 1024)).toFixed(1)}MB`}
        </Text>

        {currentMedia.width && currentMedia.height && (
          <Text style={styles.dimensionsText}>
            {currentMedia.width} × {currentMedia.height}
          </Text>
        )}
      </View>
    );
  };

  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <StatusBar hidden />
      <SafeAreaView style={styles.modal}>
        <PanGestureHandler
          onGestureEvent={onGestureEvent}
          onHandlerStateChange={onHandlerStateChange}
        >
          <Animated.View
            style={[
              styles.container,
              {
                opacity,
                transform: [
                  { translateX: pan.x },
                  { translateY: pan.y },
                  { scale },
                ],
              },
            ]}
          >
            {/* Header */}
            <View style={styles.header}>
              <TouchableOpacity style={styles.closeButton} onPress={onClose}>
                <Ionicons name="close" size={30} color={colors.text} />
              </TouchableOpacity>

              <Text style={styles.headerTitle}>Media Viewer</Text>

              <TouchableOpacity
                style={styles.moreButton}
                onPress={() => console.log("More options")}
              >
                <Ionicons
                  name="ellipsis-horizontal"
                  size={24}
                  color={colors.text}
                />
              </TouchableOpacity>
            </View>

            {/* Media Content */}
            <View style={styles.mediaWrapper}>
              <MediaContent />

              {/* Navigation Arrows */}
              {media.length > 1 && (
                <>
                  {!isFirstItem && (
                    <TouchableOpacity
                      style={[styles.navButton, styles.prevButton]}
                      onPress={handlePrevious}
                    >
                      <Ionicons
                        name="chevron-back"
                        size={30}
                        color={colors.text}
                      />
                    </TouchableOpacity>
                  )}

                  {!isLastItem && (
                    <TouchableOpacity
                      style={[styles.navButton, styles.nextButton]}
                      onPress={handleNext}
                    >
                      <Ionicons
                        name="chevron-forward"
                        size={30}
                        color={colors.text}
                      />
                    </TouchableOpacity>
                  )}
                </>
              )}

              {/* Media Dots Indicator */}
              {media.length > 1 && (
                <View style={styles.dotsContainer}>
                  {media.map((_, index) => (
                    <TouchableOpacity
                      key={index}
                      style={[
                        styles.dot,
                        index === currentIndex && styles.activeDot,
                      ]}
                      onPress={() => setCurrentIndex(index)}
                    />
                  ))}
                </View>
              )}
            </View>

            {/* Action Bar */}
            <ActionBar />

            {/* Info Panel */}
            <InfoPanel />
          </Animated.View>
        </PanGestureHandler>
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modal: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.95)",
  },
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.1)",
  },
  closeButton: {
    padding: 5,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: colors.text,
  },
  moreButton: {
    padding: 5,
  },
  mediaWrapper: {
    flex: 1,
    position: "relative",
  },
  mediaContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  image: {
    width: screenWidth,
    height: "100%",
  },
  video: {
    width: screenWidth,
    height: "100%",
  },
  videoThumbnail: {
    position: "absolute",
    width: screenWidth,
    height: "100%",
  },
  imageLoader: {
    position: "absolute",
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    color: colors.textSecondary,
    marginTop: 10,
    fontSize: 16,
  },
  videoControls: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.3)",
  },
  playButton: {
    backgroundColor: "rgba(0,0,0,0.6)",
    borderRadius: 40,
    padding: 10,
  },
  progressContainer: {
    position: "absolute",
    bottom: 20,
    left: 20,
    right: 20,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  progressBar: {
    flex: 1,
    height: 3,
    backgroundColor: "rgba(255,255,255,0.3)",
    borderRadius: 1.5,
  },
  progressFill: {
    height: "100%",
    backgroundColor: colors.primary,
    borderRadius: 1.5,
  },
  durationText: {
    color: colors.text,
    fontSize: 12,
    fontWeight: "500",
    minWidth: 80,
    textAlign: "right",
  },
  navButton: {
    position: "absolute",
    top: "50%",
    backgroundColor: "rgba(0,0,0,0.5)",
    borderRadius: 25,
    padding: 10,
    zIndex: 10,
  },
  prevButton: {
    left: 20,
  },
  nextButton: {
    right: 20,
  },
  dotsContainer: {
    position: "absolute",
    bottom: 80,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "center",
    gap: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "rgba(255,255,255,0.5)",
  },
  activeDot: {
    backgroundColor: colors.primary,
    width: 20,
  },
  actionBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderTopWidth: 1,
    borderTopColor: "rgba(255,255,255,0.1)",
  },
  leftActions: {
    flexDirection: "row",
    gap: 20,
  },
  actionButton: {
    padding: 8,
  },
  counterContainer: {
    backgroundColor: "rgba(255,255,255,0.1)",
    borderRadius: 15,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  counterText: {
    color: colors.text,
    fontSize: 14,
    fontWeight: "500",
  },
  infoPanel: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: "rgba(255,255,255,0.1)",
  },
  mediaInfo: {
    color: colors.textSecondary,
    fontSize: 14,
    marginBottom: 5,
  },
  dimensionsText: {
    color: colors.textSecondary,
    fontSize: 12,
  },
});

export default InstagramMediaViewer;
