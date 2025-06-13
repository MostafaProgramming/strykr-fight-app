// src/components/SimpleMediaViewer.js - WORKING MEDIA VIEWER
import React, { useState } from "react";
import {
  View,
  Modal,
  Dimensions,
  TouchableOpacity,
  Image,
  Text,
  StyleSheet,
  SafeAreaView,
  FlatList,
  StatusBar,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "../constants/colors";

const { width: screenWidth, height: screenHeight } = Dimensions.get("window");

const SimpleMediaViewer = ({
  visible,
  media = [],
  initialIndex = 0,
  onClose,
}) => {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);

  React.useEffect(() => {
    if (visible) {
      setCurrentIndex(initialIndex);
    }
  }, [visible, initialIndex]);

  const currentMedia = media[currentIndex];

  const renderMediaItem = ({ item, index }) => (
    <View style={styles.mediaContainer}>
      <Image
        source={{ uri: item.downloadURL }}
        style={styles.image}
        resizeMode="contain"
        onError={(error) => {
          console.error("Image load error:", error.nativeEvent.error);
        }}
      />
    </View>
  );

  const onViewableItemsChanged = React.useCallback(({ viewableItems }) => {
    if (viewableItems.length > 0) {
      setCurrentIndex(viewableItems[0].index);
    }
  }, []);

  if (!visible || !media || media.length === 0) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <StatusBar hidden />
      <SafeAreaView style={styles.modal}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Ionicons name="close" size={30} color={colors.text} />
          </TouchableOpacity>

          <Text style={styles.headerTitle}>
            {currentIndex + 1} of {media.length}
          </Text>

          <View style={{ width: 30 }} />
        </View>

        {/* Media Content */}
        <View style={styles.content}>
          <FlatList
            data={media}
            renderItem={renderMediaItem}
            keyExtractor={(item) => item.id}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            initialScrollIndex={initialIndex}
            onViewableItemsChanged={onViewableItemsChanged}
            viewabilityConfig={{
              itemVisiblePercentThreshold: 50,
            }}
            getItemLayout={(data, index) => ({
              length: screenWidth,
              offset: screenWidth * index,
              index,
            })}
          />
        </View>

        {/* Info Panel */}
        <View style={styles.infoPanel}>
          {currentMedia && (
            <>
              <Text style={styles.mediaInfo}>
                📸 {currentMedia.type === "video" ? "Video" : "Photo"}
                {currentMedia.fileSize &&
                  ` • ${(currentMedia.fileSize / (1024 * 1024)).toFixed(1)}MB`}
              </Text>

              {currentMedia.width && currentMedia.height && (
                <Text style={styles.dimensionsText}>
                  {currentMedia.width} × {currentMedia.height}
                </Text>
              )}
            </>
          )}
        </View>

        {/* Navigation Dots */}
        {media.length > 1 && (
          <View style={styles.dotsContainer}>
            {media.map((_, index) => (
              <View
                key={index}
                style={[styles.dot, index === currentIndex && styles.activeDot]}
              />
            ))}
          </View>
        )}
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modal: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.95)",
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
    fontSize: 16,
    fontWeight: "600",
    color: colors.text,
  },
  content: {
    flex: 1,
  },
  mediaContainer: {
    width: screenWidth,
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  image: {
    width: screenWidth - 40,
    height: "80%",
  },
  infoPanel: {
    paddingHorizontal: 20,
    paddingVertical: 15,
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
  dotsContainer: {
    flexDirection: "row",
    justifyContent: "center",
    paddingVertical: 15,
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
});

export default SimpleMediaViewer;
