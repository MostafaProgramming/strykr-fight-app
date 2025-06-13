// src/screens/EnhancedLogTrainingScreen.js - INSTAGRAM/TIKTOK STYLE MEDIA
import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  Modal,
  Switch,
  Image,
  Dimensions,
  ActivityIndicator,
  FlatList,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "../constants/colors";
import { screenStyles } from "../styles/screenStyles";
import trainingService from "../services/trainingService";
import socialFeedService from "../services/socialFeedService";
import mediaService from "../services/mediaService";
import achievementsService from "../services/achievementsService";
import InstagramMediaViewer from "../components/InstagramMediaViewer";

const { width } = Dimensions.get("window");

const LogTrainingScreen = ({ member, onBack }) => {
  const [selectedType, setSelectedType] = useState("bag work");
  const [duration, setDuration] = useState("30");
  const [rounds, setRounds] = useState("6");
  const [intensity, setIntensity] = useState(7);
  const [notes, setNotes] = useState("");
  const [shareToFeed, setShareToFeed] = useState(true);
  const [isLogging, setIsLogging] = useState(false);
  const [achievementModal, setAchievementModal] = useState(null);

  // ENHANCED: Media state with better management
  const [selectedMedia, setSelectedMedia] = useState([]);
  const [uploadingMedia, setUploadingMedia] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [mediaViewerVisible, setMediaViewerVisible] = useState(false);
  const [mediaViewerIndex, setMediaViewerIndex] = useState(0);

  const trainingTypes = [
    {
      id: "bag work",
      label: "Bag Work",
      icon: "fitness",
      color: colors.bagWork,
      emoji: "🥊",
    },
    {
      id: "pad work",
      label: "Pad Work",
      icon: "hand-left-outline",
      color: colors.padWork,
      emoji: "🥋",
    },
    {
      id: "sparring",
      label: "Sparring",
      icon: "people",
      color: colors.sparring,
      emoji: "🤼",
    },
    {
      id: "drills",
      label: "Drills",
      icon: "repeat",
      color: colors.drills,
      emoji: "⚡",
    },
    {
      id: "strength",
      label: "Strength",
      icon: "barbell-outline",
      color: colors.strength,
      emoji: "💪",
    },
    {
      id: "recovery",
      label: "Recovery",
      icon: "leaf-outline",
      color: colors.recovery,
      emoji: "🧘",
    },
  ];

  const intensityLabels = {
    1: "Very Light",
    2: "Light",
    3: "Light",
    4: "Moderate",
    5: "Moderate",
    6: "Somewhat Hard",
    7: "Hard",
    8: "Hard",
    9: "Very Hard",
    10: "Maximum",
  };

  const getIntensityColor = (intensity) => {
    if (intensity <= 3) return colors.intensityLow;
    if (intensity <= 6) return colors.intensityMedium;
    if (intensity <= 8) return colors.intensityHigh;
    return colors.intensityMax;
  };

  // ENHANCED: Add media with Instagram-style picker
  const addMedia = () => {
    if (selectedMedia.length >= 10) {
      Alert.alert(
        "Limit Reached",
        "You can add up to 10 photos/videos per session",
      );
      return;
    }

    Alert.alert("Add Media", "Choose how you'd like to capture your training", [
      {
        text: "📸 Take Photo",
        onPress: () => takePhoto(),
      },
      {
        text: "🎥 Record Video",
        onPress: () => recordVideo(),
      },
      {
        text: "📱 Choose from Library",
        onPress: () => pickFromLibrary(),
      },
      { text: "Cancel", style: "cancel" },
    ]);
  };

  const takePhoto = async () => {
    try {
      setUploadingMedia(true);
      const result = await mediaService.takeMediaWithCamera("photo");

      if (result.success) {
        setSelectedMedia([...selectedMedia, result.media]);
      } else if (result.error !== "Capture cancelled") {
        Alert.alert("Error", result.error);
      }
    } catch (error) {
      Alert.alert("Error", "Failed to take photo");
    } finally {
      setUploadingMedia(false);
    }
  };

  const recordVideo = async () => {
    try {
      setUploadingMedia(true);
      const result = await mediaService.takeMediaWithCamera("video");

      if (result.success) {
        setSelectedMedia([...selectedMedia, result.media]);
      } else if (result.error !== "Capture cancelled") {
        Alert.alert("Error", result.error);
      }
    } catch (error) {
      Alert.alert("Error", "Failed to record video");
    } finally {
      setUploadingMedia(false);
    }
  };

  const pickFromLibrary = async () => {
    try {
      setUploadingMedia(true);
      const result = await mediaService.pickMedia({
        allowsEditing: true,
        quality: 0.8,
        aspect: [1, 1],
        mediaTypes: "mixed",
      });

      if (result.success) {
        setSelectedMedia([...selectedMedia, result.media]);
      } else if (result.error !== "Selection cancelled") {
        Alert.alert("Error", result.error);
      }
    } catch (error) {
      Alert.alert("Error", "Failed to pick media");
    } finally {
      setUploadingMedia(false);
    }
  };

  // ENHANCED: Remove media with confirmation
  const removeMedia = (mediaId) => {
    Alert.alert("Remove Media", "Are you sure you want to remove this media?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Remove",
        style: "destructive",
        onPress: () => {
          setSelectedMedia(
            selectedMedia.filter((media) => media.id !== mediaId),
          );
        },
      },
    ]);
  };

  // ENHANCED: View media in full screen
  const viewMedia = (index) => {
    setMediaViewerIndex(index);
    setMediaViewerVisible(true);
  };

  // ENHANCED: Upload media to Firebase Storage
  const uploadMediaFiles = async (sessionId) => {
    if (selectedMedia.length === 0) return [];

    setUploadingMedia(true);
    setUploadProgress(0);

    try {
      const result = await mediaService.processMediaForFeed(
        selectedMedia,
        member.uid,
        sessionId,
        (progress) => setUploadProgress(progress),
      );

      if (result.success) {
        return result.processedMedia;
      } else {
        throw new Error("Failed to upload media");
      }
    } catch (error) {
      console.error("Error uploading media:", error);
      Alert.alert("Upload Error", "Some media files failed to upload");
      return [];
    } finally {
      setUploadingMedia(false);
      setUploadProgress(0);
    }
  };

  const handleLogSession = async () => {
    if (!duration || duration === "0") {
      Alert.alert("Error", "Please enter a valid duration");
      return;
    }

    setIsLogging(true);

    try {
      // 1. Log the training session
      const sessionData = {
        type: selectedType,
        duration: parseInt(duration),
        rounds:
          selectedType !== "recovery" && selectedType !== "strength"
            ? parseInt(rounds) || 0
            : 0,
        intensity: parseInt(intensity),
        notes: notes.trim(),
        userId: member.uid,
        date: new Date().toISOString().split("T")[0],
        time: new Date().toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
        }),
        shareToFeed,
        userInfo: member,
      };

      const result = await trainingService.addTrainingSession(sessionData);

      if (result.success) {
        // 2. Upload media if any
        let uploadedMedia = [];
        if (selectedMedia.length > 0) {
          uploadedMedia = await uploadMediaFiles(result.sessionId);
        }

        // 3. Share to feed if user wants to
        if (shareToFeed) {
          const feedData = {
            sessionId: result.sessionId,
            userId: member.uid,
            userName: member.name,
            userAvatar: member.avatar,
            userGym: member.gym || "FightTracker Gym",
            userLevel: member.fighterLevel || "Amateur",

            // Session details
            sessionType: selectedType,
            sessionDuration: parseInt(duration),
            sessionRounds: parseInt(rounds) || 0,
            sessionIntensity: parseInt(intensity),
            sessionNotes: notes.trim(),
            sessionCalories: calculateCalories(sessionData),

            // Media
            media: uploadedMedia,

            // Post metadata
            timestamp: new Date(),
            likes: [],
            likeCount: 0,
            respects: [],
            respectCount: 0,
            comments: [],
            commentCount: 0,
            shares: 0,
            isPublic: true,
            postType: "training_session",
          };

          const feedResult = await socialFeedService.createTrainingPost(
            feedData,
            member,
          );

          if (!feedResult.success) {
            console.warn("Failed to share to feed:", feedResult.error);
          }
        }

        // 4. Check for achievements
        const statsResult = await trainingService.getTrainingStats(member.uid);
        if (statsResult.success) {
          const achievementResult =
            await achievementsService.checkAndAwardAchievements(
              member.uid,
              statsResult.stats,
            );

          if (
            achievementResult.success &&
            achievementResult.newAchievements.length > 0
          ) {
            setAchievementModal(achievementResult.newAchievements[0]);
          }
        }

        const mediaText =
          uploadedMedia.length > 0
            ? ` with ${uploadedMedia.length} ${uploadedMedia.length === 1 ? "photo/video" : "photos/videos"}`
            : "";

        Alert.alert(
          "Session Logged! 🥊",
          shareToFeed
            ? `Your ${selectedType} session${mediaText} has been logged and shared to the community!`
            : `Your ${selectedType} session${mediaText} has been logged successfully.`,
          [
            {
              text: "View Feed",
              onPress: () => onBack(),
            },
            {
              text: "Log Another",
              onPress: () => resetForm(),
            },
          ],
        );
      } else {
        Alert.alert("Error", result.error || "Failed to log session");
      }
    } catch (error) {
      console.error("Error logging session:", error);
      Alert.alert("Error", "Something went wrong. Please try again.");
    } finally {
      setIsLogging(false);
    }
  };

  const calculateCalories = (sessionData) => {
    const baseCaloriesPerMinute = {
      "bag work": 9,
      "pad work": 11,
      sparring: 14,
      drills: 7,
      strength: 8,
      recovery: 4,
    };

    const baseRate = baseCaloriesPerMinute[sessionData.type.toLowerCase()] || 9;
    const intensityMultiplier = 0.6 + sessionData.intensity * 0.05;

    return Math.round(sessionData.duration * baseRate * intensityMultiplier);
  };

  const resetForm = () => {
    setDuration("30");
    setRounds("6");
    setIntensity(7);
    setNotes("");
    setShareToFeed(true);
    setSelectedMedia([]);
  };

  // ENHANCED: Instagram-style media preview grid
  const MediaPreview = () => {
    if (selectedMedia.length === 0) return null;

    const renderMediaItem = ({ item, index }) => (
      <TouchableOpacity
        style={styles.mediaPreviewItem}
        onPress={() => viewMedia(index)}
      >
        <Image
          source={{ uri: item.uri }}
          style={styles.mediaPreviewImage}
          resizeMode="cover"
        />

        {/* Video indicator */}
        {item.type === "video" && (
          <View style={styles.videoIndicator}>
            <Ionicons name="play-circle" size={24} color="white" />
            {item.duration && (
              <Text style={styles.videoDuration}>
                {Math.round(item.duration / 1000)}s
              </Text>
            )}
          </View>
        )}

        {/* Remove button */}
        <TouchableOpacity
          style={styles.removeMediaButton}
          onPress={() => removeMedia(item.id)}
        >
          <Ionicons name="close-circle" size={20} color={colors.error} />
        </TouchableOpacity>
      </TouchableOpacity>
    );

    return (
      <View style={styles.mediaPreview}>
        <View style={styles.mediaPreviewHeader}>
          <Text style={styles.mediaPreviewTitle}>
            Media ({selectedMedia.length}/10)
          </Text>
          <TouchableOpacity
            style={styles.addMediaButton}
            onPress={addMedia}
            disabled={selectedMedia.length >= 10}
          >
            <Ionicons name="add-circle" size={24} color={colors.primary} />
          </TouchableOpacity>
        </View>

        <FlatList
          data={selectedMedia}
          renderItem={renderMediaItem}
          keyExtractor={(item) => item.id}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.mediaPreviewList}
        />

        {/* Upload progress */}
        {uploadingMedia && (
          <View style={styles.uploadProgress}>
            <Text style={styles.uploadProgressText}>
              {uploadProgress > 0
                ? `Uploading... ${Math.round(uploadProgress)}%`
                : "Processing media..."}
            </Text>
            <View style={styles.progressBar}>
              <View
                style={[styles.progressFill, { width: `${uploadProgress}%` }]}
              />
            </View>
          </View>
        )}
      </View>
    );
  };

  // ENHANCED: Media upload section
  const MediaUploadSection = () => (
    <View style={screenStyles.section}>
      <Text style={screenStyles.sectionTitle}>
        📸 Share Your Training (Optional)
      </Text>
      <Text style={styles.mediaSubtitle}>
        Show your technique, progress, and training environment
      </Text>

      {selectedMedia.length === 0 ? (
        <TouchableOpacity style={styles.emptyMediaContainer} onPress={addMedia}>
          <Ionicons
            name="camera-outline"
            size={48}
            color={colors.textSecondary}
          />
          <Text style={styles.emptyMediaText}>Add photos & videos</Text>
          <Text style={styles.emptyMediaSubtext}>
            Tap to capture your training session
          </Text>
        </TouchableOpacity>
      ) : (
        <MediaPreview />
      )}

      <View style={styles.mediaTips}>
        <Ionicons
          name="information-circle"
          size={16}
          color={colors.textSecondary}
        />
        <Text style={styles.mediaTipsText}>
          • Max 10 media files • Videos up to 60s • Square format works best
        </Text>
      </View>
    </View>
  );

  const SocialSharingToggle = () => (
    <View style={styles.sharingContainer}>
      <View style={styles.sharingHeader}>
        <View style={styles.sharingInfo}>
          <Text style={styles.sharingTitle}>🌟 Share to Community Feed</Text>
          <Text style={styles.sharingSubtitle}>
            Inspire others with your training session
            {selectedMedia.length > 0 &&
              ` and ${selectedMedia.length} media file${selectedMedia.length > 1 ? "s" : ""}`}
          </Text>
        </View>
        <Switch
          value={shareToFeed}
          onValueChange={setShareToFeed}
          trackColor={{
            false: colors.backgroundLight,
            true: colors.primary + "40",
          }}
          thumbColor={shareToFeed ? colors.primary : colors.textSecondary}
        />
      </View>

      {shareToFeed && (
        <View style={styles.sharingPreview}>
          <Ionicons name="people" size={16} color={colors.primary} />
          <Text style={styles.sharingPreviewText}>
            Your session will appear in the community feed
            {selectedMedia.length > 0 && " with your media"}
          </Text>
        </View>
      )}
    </View>
  );

  const TrainingTypeButton = ({ type }) => (
    <TouchableOpacity
      style={[
        styles.typeButton,
        selectedType === type.id && styles.selectedTypeButton,
        { borderColor: type.color + "40" },
        selectedType === type.id && { backgroundColor: type.color + "20" },
      ]}
      onPress={() => setSelectedType(type.id)}
    >
      <View style={[styles.typeIcon, { backgroundColor: type.color + "20" }]}>
        <Text style={styles.typeEmoji}>{type.emoji}</Text>
      </View>
      <Text
        style={[
          styles.typeLabel,
          selectedType === type.id && styles.selectedTypeLabel,
        ]}
      >
        {type.label}
      </Text>
    </TouchableOpacity>
  );

  const AchievementModal = ({ achievement, visible, onClose }) => (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.achievementModalContainer}>
          <View style={styles.achievementModalContent}>
            <View style={styles.achievementModalIcon}>
              <Ionicons name="trophy" size={48} color={colors.secondary} />
            </View>

            <Text style={styles.achievementModalTitle}>
              🎉 Achievement Unlocked!
            </Text>
            <Text style={styles.achievementModalName}>
              {achievement?.title}
            </Text>
            <Text style={styles.achievementModalDesc}>
              {achievement?.description}
            </Text>

            <View style={styles.achievementModalPoints}>
              <Text style={styles.pointsText}>
                +{achievement?.points} points
              </Text>
            </View>

            <TouchableOpacity
              style={styles.achievementModalButton}
              onPress={onClose}
            >
              <Text style={styles.achievementModalButtonText}>Awesome!</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );

  return (
    <View style={screenStyles.container}>
      {/* Header */}
      <View style={screenStyles.screenHeader}>
        <TouchableOpacity onPress={onBack}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={screenStyles.screenTitle}>Log Training</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView
        style={screenStyles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Training Type Selection */}
        <View style={screenStyles.section}>
          <Text style={screenStyles.sectionTitle}>Training Type</Text>
          <View style={styles.typeGrid}>
            {trainingTypes.map((type) => (
              <TrainingTypeButton key={type.id} type={type} />
            ))}
          </View>
        </View>

        {/* Duration and Rounds */}
        <View style={screenStyles.section}>
          <Text style={screenStyles.sectionTitle}>Session Details</Text>
          <View style={styles.inputRow}>
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Duration (minutes)</Text>
              <TextInput
                style={styles.numberInput}
                value={duration}
                onChangeText={setDuration}
                keyboardType="numeric"
                placeholder="30"
                placeholderTextColor={colors.textSecondary}
              />
            </View>

            {selectedType !== "recovery" && selectedType !== "strength" && (
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Rounds</Text>
                <TextInput
                  style={styles.numberInput}
                  value={rounds}
                  onChangeText={setRounds}
                  keyboardType="numeric"
                  placeholder="6"
                  placeholderTextColor={colors.textSecondary}
                />
              </View>
            )}
          </View>
        </View>

        {/* Intensity (RPE) */}
        <View style={screenStyles.section}>
          <Text style={screenStyles.sectionTitle}>
            Intensity (RPE - Rate of Perceived Exertion)
          </Text>

          <View style={styles.intensityContainer}>
            <View style={styles.intensityHeader}>
              <Text style={styles.intensityValue}>{intensity}</Text>
              <Text
                style={[
                  styles.intensityLabel,
                  { color: getIntensityColor(intensity) },
                ]}
              >
                {intensityLabels[intensity]}
              </Text>
            </View>

            <View style={styles.intensitySelector}>
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((value) => (
                <TouchableOpacity
                  key={value}
                  style={[
                    styles.intensityButton,
                    intensity === value && styles.selectedIntensityButton,
                    {
                      backgroundColor:
                        getIntensityColor(value) +
                        (intensity === value ? "40" : "10"),
                    },
                  ]}
                  onPress={() => setIntensity(value)}
                >
                  <Text
                    style={[
                      styles.intensityButtonText,
                      intensity === value && styles.selectedIntensityButtonText,
                      {
                        color:
                          intensity === value
                            ? colors.text
                            : getIntensityColor(value),
                      },
                    ]}
                  >
                    {value}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>

        {/* ENHANCED: Media Upload Section */}
        <MediaUploadSection />

        {/* Notes */}
        <View style={screenStyles.section}>
          <Text style={screenStyles.sectionTitle}>Notes (Optional)</Text>
          <TextInput
            style={styles.notesInput}
            value={notes}
            onChangeText={setNotes}
            placeholder="How did the session go? Any technique focus, achievements, or observations..."
            placeholderTextColor={colors.textSecondary}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />
        </View>

        {/* Social Sharing Toggle */}
        <SocialSharingToggle />

        {/* Log Button */}
        <TouchableOpacity
          style={[
            screenStyles.primaryButton,
            { marginTop: 30, marginBottom: 30 },
            (isLogging || uploadingMedia) && { opacity: 0.7 },
          ]}
          onPress={handleLogSession}
          disabled={isLogging || uploadingMedia}
        >
          {isLogging || uploadingMedia ? (
            <View style={styles.loadingButton}>
              <ActivityIndicator color={colors.text} />
              <Text style={screenStyles.primaryButtonText}>
                {uploadingMedia ? "Uploading Media..." : "Logging Session..."}
              </Text>
            </View>
          ) : (
            <Text style={screenStyles.primaryButtonText}>
              {shareToFeed
                ? "🚀 Log & Share Training"
                : "📝 Log Training Session"}
            </Text>
          )}
        </TouchableOpacity>
      </ScrollView>

      {/* Media Viewer Modal */}
      <InstagramMediaViewer
        visible={mediaViewerVisible}
        media={selectedMedia}
        initialIndex={mediaViewerIndex}
        onClose={() => setMediaViewerVisible(false)}
        showActions={false}
        showInfo={true}
      />

      {/* Achievement Modal */}
      <AchievementModal
        achievement={achievementModal}
        visible={!!achievementModal}
        onClose={() => setAchievementModal(null)}
      />
    </View>
  );
};

const styles = {
  typeGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  typeButton: {
    width: "48%",
    backgroundColor: colors.cardBackground,
    borderRadius: 15,
    padding: 20,
    alignItems: "center",
    borderWidth: 2,
    borderColor: colors.cardBorder,
  },
  selectedTypeButton: {
    borderWidth: 2,
  },
  typeIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
  },
  typeEmoji: {
    fontSize: 24,
  },
  typeLabel: {
    fontSize: 14,
    fontWeight: "500",
    color: colors.textSecondary,
    textAlign: "center",
  },
  selectedTypeLabel: {
    color: colors.text,
    fontWeight: "600",
  },
  inputRow: {
    flexDirection: "row",
    gap: 15,
  },
  inputContainer: {
    flex: 1,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: "500",
    color: colors.text,
    marginBottom: 8,
  },
  numberInput: {
    backgroundColor: colors.cardBackground,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    borderRadius: 12,
    padding: 15,
    color: colors.text,
    fontSize: 16,
    textAlign: "center",
  },
  intensityContainer: {
    backgroundColor: colors.cardBackground,
    borderRadius: 15,
    padding: 20,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  intensityHeader: {
    alignItems: "center",
    marginBottom: 20,
  },
  intensityValue: {
    fontSize: 36,
    fontWeight: "bold",
    color: colors.text,
  },
  intensityLabel: {
    fontSize: 16,
    fontWeight: "500",
    marginTop: 5,
  },
  intensitySelector: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 15,
    justifyContent: "center",
  },
  intensityButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "transparent",
  },
  selectedIntensityButton: {
    borderColor: colors.text,
  },
  intensityButtonText: {
    fontSize: 16,
    fontWeight: "600",
  },
  selectedIntensityButtonText: {
    fontWeight: "bold",
  },

  // ENHANCED: Media Upload Styles
  mediaSubtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 15,
  },
  emptyMediaContainer: {
    backgroundColor: colors.cardBackground,
    borderRadius: 15,
    borderWidth: 2,
    borderColor: colors.cardBorder,
    borderStyle: "dashed",
    padding: 40,
    alignItems: "center",
    marginBottom: 15,
  },
  emptyMediaText: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.text,
    marginTop: 10,
  },
  emptyMediaSubtext: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 5,
    textAlign: "center",
  },
  mediaPreview: {
    marginBottom: 15,
  },
  mediaPreviewHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
  },
  mediaPreviewTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.text,
  },
  addMediaButton: {
    padding: 5,
  },
  mediaPreviewList: {
    paddingVertical: 5,
  },
  mediaPreviewItem: {
    position: "relative",
    marginRight: 12,
    borderRadius: 12,
    overflow: "hidden",
  },
  mediaPreviewImage: {
    width: 80,
    height: 80,
    borderRadius: 12,
  },
  videoIndicator: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.3)",
    alignItems: "center",
    justifyContent: "center",
  },
  videoDuration: {
    fontSize: 10,
    color: "white",
    fontWeight: "600",
    marginTop: 2,
  },
  removeMediaButton: {
    position: "absolute",
    top: -8,
    right: -8,
    backgroundColor: colors.cardBackground,
    borderRadius: 10,
    padding: 2,
  },
  uploadProgress: {
    marginTop: 10,
    padding: 15,
    backgroundColor: colors.cardBackground,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  uploadProgressText: {
    fontSize: 14,
    color: colors.text,
    textAlign: "center",
    marginBottom: 8,
  },
  progressBar: {
    height: 4,
    backgroundColor: colors.backgroundLight,
    borderRadius: 2,
  },
  progressFill: {
    height: "100%",
    backgroundColor: colors.primary,
    borderRadius: 2,
  },
  mediaTips: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 10,
    padding: 10,
    backgroundColor: colors.backgroundLight,
    borderRadius: 8,
  },
  mediaTipsText: {
    fontSize: 12,
    color: colors.textSecondary,
    flex: 1,
  },

  // Social Sharing Styles
  sharingContainer: {
    backgroundColor: colors.cardBackground,
    borderRadius: 15,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  sharingHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  sharingInfo: {
    flex: 1,
  },
  sharingTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.text,
    marginBottom: 4,
  },
  sharingSubtitle: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  sharingPreview: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 15,
    padding: 12,
    backgroundColor: colors.primary + "10",
    borderRadius: 10,
    gap: 8,
  },
  sharingPreviewText: {
    fontSize: 12,
    color: colors.text,
    flex: 1,
  },
  notesInput: {
    backgroundColor: colors.cardBackground,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    borderRadius: 12,
    padding: 15,
    color: colors.text,
    fontSize: 16,
    minHeight: 100,
  },
  loadingButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },

  // Achievement Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.8)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  achievementModalContainer: {
    backgroundColor: colors.cardBackground,
    borderRadius: 20,
    padding: 30,
    alignItems: "center",
    borderWidth: 2,
    borderColor: colors.secondary,
    maxWidth: 300,
    width: "100%",
  },
  achievementModalContent: {
    alignItems: "center",
  },
  achievementModalIcon: {
    width: 80,
    height: 80,
    backgroundColor: colors.secondary + "20",
    borderRadius: 40,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
  },
  achievementModalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: colors.secondary,
    marginBottom: 10,
    textAlign: "center",
  },
  achievementModalName: {
    fontSize: 18,
    fontWeight: "bold",
    color: colors.text,
    marginBottom: 8,
    textAlign: "center",
  },
  achievementModalDesc: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: "center",
    lineHeight: 20,
    marginBottom: 20,
  },
  achievementModalPoints: {
    backgroundColor: colors.secondary + "20",
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    marginBottom: 25,
  },
  pointsText: {
    fontSize: 16,
    fontWeight: "bold",
    color: colors.secondary,
  },
  achievementModalButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 30,
    paddingVertical: 12,
    borderRadius: 25,
    minWidth: 120,
  },
  achievementModalButtonText: {
    color: colors.text,
    fontSize: 16,
    fontWeight: "bold",
    textAlign: "center",
  },
};

export default LogTrainingScreen;
