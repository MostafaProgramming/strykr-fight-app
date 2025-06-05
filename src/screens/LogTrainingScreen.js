// src/screens/LogTrainingScreen.js - WITH MEDIA UPLOAD
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
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { colors } from "../constants/colors";
import { screenStyles } from "../styles/screenStyles";
import trainingService from "../services/trainingService";
import socialFeedService from "../services/socialFeedService";
import mediaService from "../services/mediaService";
import achievementsService from "../services/achievementsService";

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

  // NEW: Media state
  const [selectedMedia, setSelectedMedia] = useState([]);
  const [uploadingMedia, setUploadingMedia] = useState(false);

  const trainingTypes = [
    {
      id: "bag work",
      label: "Bag Work",
      icon: "fitness",
      color: colors.bagWork,
    },
    {
      id: "pad work",
      label: "Pad Work",
      icon: "hand-left-outline",
      color: colors.padWork,
    },
    {
      id: "sparring",
      label: "Sparring",
      icon: "people",
      color: colors.sparring,
    },
    { id: "drills", label: "Drills", icon: "repeat", color: colors.drills },
    {
      id: "strength",
      label: "Strength",
      icon: "barbell-outline",
      color: colors.strength,
    },
    {
      id: "recovery",
      label: "Recovery",
      icon: "leaf-outline",
      color: colors.recovery,
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

  // NEW: Request camera/media permissions
  const requestPermissions = async () => {
    const { status: cameraStatus } =
      await ImagePicker.requestCameraPermissionsAsync();
    const { status: mediaStatus } =
      await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (cameraStatus !== "granted" || mediaStatus !== "granted") {
      Alert.alert(
        "Permissions Required",
        "Please enable camera and photo library permissions to add photos and videos to your training posts.",
      );
      return false;
    }
    return true;
  };

  // NEW: Add photo from camera or library
  const addPhoto = async () => {
    const hasPermissions = await requestPermissions();
    if (!hasPermissions) return;

    Alert.alert(
      "Add Photo",
      "Choose how you'd like to add a photo to your training session",
      [
        {
          text: "Camera",
          onPress: async () => {
            const result = await ImagePicker.launchCameraAsync({
              mediaTypes: ImagePicker.MediaTypeOptions.Images,
              allowsEditing: true,
              aspect: [4, 3],
              quality: 0.8,
            });

            if (!result.canceled) {
              const newMedia = {
                id: Date.now().toString(),
                type: "image",
                uri: result.assets[0].uri,
                isLocal: true,
              };
              setSelectedMedia([...selectedMedia, newMedia]);
            }
          },
        },
        {
          text: "Photo Library",
          onPress: async () => {
            const result = await ImagePicker.launchImageLibraryAsync({
              mediaTypes: ImagePicker.MediaTypeOptions.Images,
              allowsEditing: true,
              aspect: [4, 3],
              quality: 0.8,
            });

            if (!result.canceled) {
              const newMedia = {
                id: Date.now().toString(),
                type: "image",
                uri: result.assets[0].uri,
                isLocal: true,
              };
              setSelectedMedia([...selectedMedia, newMedia]);
            }
          },
        },
        { text: "Cancel", style: "cancel" },
      ],
    );
  };

  // NEW: Add video
  const addVideo = async () => {
    const hasPermissions = await requestPermissions();
    if (!hasPermissions) return;

    Alert.alert(
      "Add Video",
      "Record or select a technique video (max 30 seconds)",
      [
        {
          text: "Record Video",
          onPress: async () => {
            const result = await ImagePicker.launchCameraAsync({
              mediaTypes: ImagePicker.MediaTypeOptions.Videos,
              allowsEditing: true,
              videoMaxDuration: 30,
              videoQuality: ImagePicker.VideoQuality.Medium,
            });

            if (!result.canceled) {
              const newMedia = {
                id: Date.now().toString(),
                type: "video",
                uri: result.assets[0].uri,
                duration: result.assets[0].duration,
                isLocal: true,
              };
              setSelectedMedia([...selectedMedia, newMedia]);
            }
          },
        },
        {
          text: "Video Library",
          onPress: async () => {
            const result = await ImagePicker.launchImageLibraryAsync({
              mediaTypes: ImagePicker.MediaTypeOptions.Videos,
              allowsEditing: true,
              videoMaxDuration: 30,
              videoQuality: ImagePicker.VideoQuality.Medium,
            });

            if (!result.canceled) {
              const newMedia = {
                id: Date.now().toString(),
                type: "video",
                uri: result.assets[0].uri,
                duration: result.assets[0].duration,
                isLocal: true,
              };
              setSelectedMedia([...selectedMedia, newMedia]);
            }
          },
        },
        { text: "Cancel", style: "cancel" },
      ],
    );
  };

  // NEW: Remove media
  const removeMedia = (mediaId) => {
    setSelectedMedia(selectedMedia.filter((media) => media.id !== mediaId));
  };

  // NEW: Upload media to Firebase Storage (simplified for now)
  const uploadMediaFiles = async (sessionId) => {
    if (selectedMedia.length === 0) return [];

    setUploadingMedia(true);
    const uploadedMedia = [];

    try {
      for (const media of selectedMedia) {
        // In a real app, you'd upload to Firebase Storage here
        // For now, we'll simulate with local URIs
        const uploadedItem = {
          id: media.id,
          type: media.type,
          downloadURL: media.uri, // In production, this would be the Firebase Storage URL
          fileName: `${sessionId}_${media.id}`,
          uploadedAt: new Date(),
          uploadedBy: member.uid,
        };
        uploadedMedia.push(uploadedItem);
      }
    } catch (error) {
      console.error("Error uploading media:", error);
      Alert.alert("Error", "Failed to upload some media files");
    } finally {
      setUploadingMedia(false);
    }

    return uploadedMedia;
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

            // NEW: Media
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
          selectedMedia.length > 0
            ? ` with ${selectedMedia.length} ${selectedMedia.length === 1 ? "photo/video" : "photos/videos"}`
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
    setSelectedMedia([]); // NEW: Reset media
  };

  // NEW: Media Preview Component
  const MediaPreview = () => {
    if (selectedMedia.length === 0) return null;

    return (
      <View style={styles.mediaPreview}>
        <Text style={styles.mediaPreviewTitle}>
          Media ({selectedMedia.length}/5)
        </Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {selectedMedia.map((media) => (
            <View key={media.id} style={styles.mediaItem}>
              {media.type === "image" ? (
                <Image source={{ uri: media.uri }} style={styles.mediaImage} />
              ) : (
                <View style={styles.videoPlaceholder}>
                  <Ionicons name="play-circle" size={32} color={colors.text} />
                  <Text style={styles.videoDuration}>
                    {Math.round(media.duration / 1000)}s
                  </Text>
                </View>
              )}
              <TouchableOpacity
                style={styles.removeMediaButton}
                onPress={() => removeMedia(media.id)}
              >
                <Ionicons name="close-circle" size={20} color={colors.error} />
              </TouchableOpacity>
            </View>
          ))}
        </ScrollView>
      </View>
    );
  };

  // NEW: Media Upload Section
  const MediaUploadSection = () => (
    <View style={screenStyles.section}>
      <Text style={screenStyles.sectionTitle}>
        Add Photos & Videos (Optional)
      </Text>
      <Text style={styles.mediaSubtitle}>
        Share your technique, form, or training environment
      </Text>

      <View style={styles.mediaButtons}>
        <TouchableOpacity
          style={[
            styles.mediaButton,
            selectedMedia.length >= 5 && styles.disabledButton,
          ]}
          onPress={addPhoto}
          disabled={selectedMedia.length >= 5}
        >
          <Ionicons name="camera" size={20} color={colors.primary} />
          <Text style={styles.mediaButtonText}>Add Photo</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.mediaButton,
            selectedMedia.length >= 5 && styles.disabledButton,
          ]}
          onPress={addVideo}
          disabled={selectedMedia.length >= 5}
        >
          <Ionicons name="videocam" size={20} color={colors.secondary} />
          <Text style={styles.mediaButtonText}>Add Video</Text>
        </TouchableOpacity>
      </View>

      <MediaPreview />

      {selectedMedia.length > 0 && (
        <View style={styles.mediaInfo}>
          <Ionicons
            name="information-circle"
            size={16}
            color={colors.textSecondary}
          />
          <Text style={styles.mediaInfoText}>
            {selectedMedia.length}/5 media files • Videos max 30s
          </Text>
        </View>
      )}
    </View>
  );

  const SocialSharingToggle = () => (
    <View style={styles.sharingContainer}>
      <View style={styles.sharingHeader}>
        <View style={styles.sharingInfo}>
          <Text style={styles.sharingTitle}>Share to Community Feed</Text>
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
            Your session will appear in the community feed with your training
            stats
            {selectedMedia.length > 0 && " and media"}
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
        <Ionicons name={type.icon} size={24} color={type.color} />
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
              Achievement Unlocked!
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

        {/* NEW: Media Upload Section */}
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
          <Text style={screenStyles.primaryButtonText}>
            {isLogging
              ? "Logging Session..."
              : uploadingMedia
                ? "Uploading Media..."
                : shareToFeed
                  ? "Log & Share Training"
                  : "Log Training Session"}
          </Text>
        </TouchableOpacity>
      </ScrollView>

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

  // NEW: Media Upload Styles
  mediaSubtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 15,
  },
  mediaButtons: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 20,
  },
  mediaButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.cardBackground,
    borderRadius: 12,
    padding: 15,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    gap: 8,
  },
  disabledButton: {
    opacity: 0.5,
  },
  mediaButtonText: {
    fontSize: 14,
    color: colors.text,
    fontWeight: "500",
  },
  mediaPreview: {
    marginBottom: 15,
  },
  mediaPreviewTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.text,
    marginBottom: 10,
  },
  mediaItem: {
    position: "relative",
    marginRight: 12,
    borderRadius: 8,
    overflow: "hidden",
  },
  mediaImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
  },
  videoPlaceholder: {
    width: 80,
    height: 80,
    backgroundColor: colors.backgroundLight,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  videoDuration: {
    fontSize: 10,
    color: colors.text,
    marginTop: 4,
  },
  removeMediaButton: {
    position: "absolute",
    top: -8,
    right: -8,
    backgroundColor: colors.cardBackground,
    borderRadius: 10,
  },
  mediaInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 10,
  },
  mediaInfoText: {
    fontSize: 12,
    color: colors.textSecondary,
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
