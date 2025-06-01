import React from "react";
import { View, Text, TouchableOpacity, ActivityIndicator } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "../constants/colors";
import { componentStyles } from "../styles/componentStyles";

const ClassCard = ({
  classItem,
  isBooked,
  onBook,
  showFullDetails = false,
  showBookedState = false,
  onCancel,
  isBookingInProgress = false,
}) => {
  const getDifficultyColor = (difficulty) => {
    switch (difficulty.toLowerCase()) {
      case "beginner":
        return colors.success;
      case "intermediate":
        return colors.warning;
      case "advanced":
        return colors.primary;
      case "all levels":
        return colors.textSecondary;
      default:
        return colors.textSecondary;
    }
  };

  const getAvailabilityStatus = () => {
    if (classItem.spotsLeft <= 0) {
      return { text: "Full", color: "#FF5722", icon: "close-circle" };
    } else if (classItem.spotsLeft <= 3) {
      return { text: "Almost Full", color: colors.warning, icon: "warning" };
    } else {
      return {
        text: "Available",
        color: colors.success,
        icon: "checkmark-circle",
      };
    }
  };

  const availability = getAvailabilityStatus();

  // Format the time display
  const formatTime = () => {
    if (classItem.startTime && classItem.endTime) {
      return `${classItem.startTime} - ${classItem.endTime}`;
    }
    return classItem.time || "TBD";
  };

  // Get booking count text
  const getBookingText = () => {
    const bookedCount = classItem.bookedMembers
      ? classItem.bookedMembers.length
      : 0;
    const spotsLeft = classItem.spotsLeft || 0;

    if (spotsLeft <= 0) {
      return "Class is full";
    }

    return `${spotsLeft} spots left • ${bookedCount}/${classItem.maxCapacity} booked`;
  };

  return (
    <View
      style={[
        componentStyles.classCard,
        isBooked && componentStyles.bookedClassCard,
        classItem.spotsLeft <= 0 && componentStyles.fullClassCard,
      ]}
    >
      {/* Header with class info and status */}
      <View style={componentStyles.classHeader}>
        <View style={{ flex: 1 }}>
          <Text style={componentStyles.className}>{classItem.name}</Text>
          <Text style={componentStyles.classInstructor}>
            with {classItem.instructor}
          </Text>
          {classItem.ageGroup && (
            <Text
              style={{
                fontSize: 12,
                color: colors.textSecondary,
                marginTop: 2,
              }}
            >
              {classItem.ageGroup} • {classItem.difficulty}
            </Text>
          )}
        </View>

        <View style={componentStyles.classStatusContainer}>
          {/* Difficulty Badge */}
          <View
            style={[
              componentStyles.difficultyBadge,
              {
                backgroundColor:
                  getDifficultyColor(classItem.difficulty) + "20",
              },
            ]}
          >
            <Text
              style={[
                componentStyles.difficultyText,
                { color: getDifficultyColor(classItem.difficulty) },
              ]}
            >
              {classItem.difficulty}
            </Text>
          </View>

          {/* Booked Status */}
          {isBooked && (
            <View style={componentStyles.bookedBadge}>
              <Ionicons
                name="checkmark-circle"
                size={16}
                color={colors.success}
              />
              <Text style={componentStyles.bookedText}>Booked</Text>
            </View>
          )}

          {/* Invite Only Badge */}
          {classItem.isInviteOnly && (
            <View
              style={{
                backgroundColor: colors.primary + "20",
                paddingHorizontal: 8,
                paddingVertical: 4,
                borderRadius: 12,
                marginTop: 4,
              }}
            >
              <Text
                style={{
                  fontSize: 10,
                  fontWeight: "600",
                  color: colors.primary,
                }}
              >
                Invite Only
              </Text>
            </View>
          )}
        </View>
      </View>

      {/* Description for full details */}
      {showFullDetails && (
        <Text style={componentStyles.classDescription}>
          {classItem.description}
        </Text>
      )}

      {/* Class Details */}
      <View style={componentStyles.classDetails}>
        <View style={componentStyles.classInfo}>
          <Ionicons name="time" size={16} color={colors.textSecondary} />
          <Text style={componentStyles.classTime}>{formatTime()}</Text>
        </View>

        <View style={componentStyles.classInfo}>
          <Ionicons name="calendar" size={16} color={colors.textSecondary} />
          <Text style={componentStyles.classDate}>{classItem.date}</Text>
        </View>

        <View style={componentStyles.classInfo}>
          <Ionicons name="card" size={16} color={colors.textSecondary} />
          <Text style={componentStyles.classPrice}>£{classItem.price}</Text>
        </View>
      </View>

      {/* Availability Status */}
      <View style={componentStyles.availabilityRow}>
        <View style={componentStyles.availabilityStatus}>
          <Ionicons
            name={availability.icon}
            size={16}
            color={availability.color}
          />
          <Text
            style={[
              componentStyles.availabilityText,
              { color: availability.color },
            ]}
          >
            {availability.text}
          </Text>
        </View>

        <View style={componentStyles.spotsInfo}>
          <Ionicons name="people" size={16} color={colors.textSecondary} />
          <Text style={componentStyles.spotsLeft}>{getBookingText()}</Text>
        </View>
      </View>

      {/* Action Buttons */}
      {isBooked && showBookedState ? (
        <View style={componentStyles.bookedActions}>
          <TouchableOpacity
            style={componentStyles.secondaryActionButton}
            onPress={() => console.log("Reschedule class")}
          >
            <Ionicons name="swap-horizontal" size={16} color={colors.primary} />
            <Text style={componentStyles.secondaryActionText}>Reschedule</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={componentStyles.cancelActionButton}
            onPress={() => onCancel && onCancel(classItem.id)}
          >
            <Ionicons name="close-circle" size={16} color={colors.text} />
            <Text style={componentStyles.cancelActionText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <TouchableOpacity
          style={[
            componentStyles.bookButton,
            isBooked && componentStyles.bookedButton,
            (classItem.spotsLeft <= 0 || isBookingInProgress) &&
              componentStyles.disabledButton,
          ]}
          onPress={onBook}
          disabled={isBooked || classItem.spotsLeft <= 0 || isBookingInProgress}
        >
          {isBookingInProgress ? (
            <View
              style={{ flexDirection: "row", alignItems: "center", gap: 8 }}
            >
              <ActivityIndicator size="small" color={colors.text} />
              <Text style={componentStyles.bookButtonText}>Booking...</Text>
            </View>
          ) : (
            <Text
              style={[
                componentStyles.bookButtonText,
                isBooked && componentStyles.bookedButtonText,
                classItem.spotsLeft <= 0 && componentStyles.disabledButtonText,
              ]}
            >
              {classItem.spotsLeft <= 0
                ? "Class Full"
                : isBooked
                  ? "Booked ✓"
                  : classItem.isInviteOnly
                    ? "Request Invite"
                    : "Book Class"}
            </Text>
          )}
        </TouchableOpacity>
      )}

      {/* Special Indicators */}
      {classItem.isPopular && (
        <View style={componentStyles.popularIndicator}>
          <Ionicons name="flame" size={12} color={colors.primary} />
          <Text style={componentStyles.popularText}>Popular Class</Text>
        </View>
      )}

      {classItem.isNew && (
        <View style={componentStyles.newIndicator}>
          <Ionicons name="star" size={12} color={colors.warning} />
          <Text style={componentStyles.newText}>New Class</Text>
        </View>
      )}
    </View>
  );
};

export default ClassCard;
