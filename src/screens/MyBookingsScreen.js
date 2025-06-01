import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "../constants/colors";
import { screenStyles } from "../styles/screenStyles";
import classService from "../services/classService";
import authService from "../services/authService";

const MyBookingsScreen = ({
  bookedClasses,
  onCancelBooking,
  onBack,
  member,
}) => {
  const [activeTab, setActiveTab] = useState("upcoming");
  const [userBookings, setUserBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  // Fetch user's bookings from Firebase
  const fetchUserBookings = async () => {
    try {
      setError(null);

      if (!member || !member.uid) {
        setError("Please log in to view bookings");
        return;
      }

      const result = await classService.getUserBookings(member.uid);

      if (result.success) {
        // Transform booking data to include class details
        const bookingsWithDetails = result.bookings.map((booking) => ({
          ...booking,
          // Use class details from the booking
          name: booking.classDetails?.name || "Unknown Class",
          instructor: booking.classDetails?.instructor || "TBD",
          time: booking.classDetails?.datetime
            ? booking.classDetails.datetime.toLocaleTimeString("en-US", {
                hour: "2-digit",
                minute: "2-digit",
                hour12: false,
              }) +
              " - " +
              new Date(
                booking.classDetails.datetime.getTime() + 60 * 60 * 1000,
              ).toLocaleTimeString("en-US", {
                hour: "2-digit",
                minute: "2-digit",
                hour12: false,
              })
            : "TBD",
          date: booking.classDetails?.datetime
            ? booking.classDetails.datetime.toLocaleDateString("en-US", {
                weekday: "long",
                year: "numeric",
                month: "short",
                day: "numeric",
              })
            : "TBD",
          price: booking.classDetails?.price || booking.price || 0,
          difficulty: booking.classDetails?.difficulty || "Unknown",
          ageGroup: booking.classDetails?.ageGroup || "Adult",
          classDateTime: booking.classDetails?.datetime,
          bookingDate: booking.bookedAt?.toDate
            ? booking.bookedAt.toDate()
            : new Date(booking.bookedAt),
          status: booking.status || "confirmed",
        }));

        setUserBookings(bookingsWithDetails);
      } else {
        setError(result.error);
        console.error("Error fetching user bookings:", result.error);
      }
    } catch (err) {
      setError("Failed to load bookings");
      console.error("Error fetching user bookings:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Separate upcoming and past bookings
  const getUpcomingBookings = () => {
    const now = new Date();
    return userBookings
      .filter((booking) => {
        return (
          booking.classDateTime &&
          booking.classDateTime > now &&
          (booking.status === "confirmed" || booking.status === "attended")
        );
      })
      .sort((a, b) => a.classDateTime - b.classDateTime);
  };

  const getPastBookings = () => {
    const now = new Date();
    return userBookings
      .filter((booking) => {
        return (
          (booking.classDateTime &&
            booking.classDateTime <= now &&
            booking.status === "confirmed") ||
          booking.status === "attended"
        ); // Include attended classes regardless of time
      })
      .sort((a, b) => b.classDateTime - a.classDateTime);
  };

  // Calculate stats for history tab (only count attended classes)
  const getBookingStats = () => {
    const attendedBookings = userBookings.filter(
      (booking) => booking.status === "attended",
    );
    const now = new Date();
    const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const totalClasses = attendedBookings.length;
    const totalSpent = attendedBookings.reduce(
      (sum, booking) => sum + (booking.price || 0),
      0,
    );
    const thisMonthClasses = attendedBookings.filter(
      (booking) => booking.classDateTime && booking.classDateTime >= thisMonth,
    ).length;

    return {
      totalClasses,
      totalSpent,
      thisMonthClasses,
    };
  };

  // Handle check-in with QR code scanning
  const handleCheckIn = async (booking) => {
    // Check if class time has started (can only check in during class time or after)
    const now = new Date();
    const classTime = booking.classDateTime;
    const classEndTime = new Date(classTime.getTime() + 60 * 60 * 1000); // Assume 1 hour class

    if (now < classTime) {
      const timeUntilClass = Math.round(
        (classTime.getTime() - now.getTime()) / (1000 * 60),
      );
      Alert.alert(
        "Check-in Not Available",
        `Class hasn't started yet. You can check in starting ${timeUntilClass} minutes from now.`,
        [{ text: "OK" }],
      );
      return;
    }

    if (now > classEndTime) {
      Alert.alert(
        "Check-in Expired",
        "Check-in period has ended for this class.",
        [{ text: "OK" }],
      );
      return;
    }

    // Show QR scanner alert (simulate for now)
    Alert.alert(
      "Check In to Class",
      `Ready to check in to "${booking.name}"?\n\nIn a real gym, you would scan the QR code at the front desk.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Simulate Check In",
          onPress: () => processCheckIn(booking),
        },
      ],
    );
  };

  // Process the check-in after QR code is scanned
  const processCheckIn = async (booking) => {
    try {
      // Call check-in service
      const result = await classService.checkInToClass(
        booking.classId,
        member.uid,
        booking.id,
      );

      if (result.success) {
        // Update user's classes attended count
        await authService.incrementClassesAttended(member.uid);

        Alert.alert(
          "Check-in Successful! 🥊",
          `Welcome to ${booking.name}!\n\nEnjoy your training session. Your attendance has been recorded.`,
          [{ text: "Let's Train!", style: "default" }],
        );

        // Refresh bookings to show updated status
        await fetchUserBookings();
      } else {
        Alert.alert(
          "Check-in Failed",
          result.error || "Unable to check in at this time.",
        );
      }
    } catch (error) {
      console.error("Check-in error:", error);
      Alert.alert(
        "Error",
        "Failed to check in. Please try again or contact staff.",
      );
    }
  };
  const handleCancelBooking = async (booking) => {
    Alert.alert(
      "Cancel Booking",
      `Are you sure you want to cancel "${booking.name}"?\n\nThis will free up the spot for other members.`,
      [
        { text: "Keep Booking", style: "cancel" },
        {
          text: "Cancel Booking",
          style: "destructive",
          onPress: async () => {
            try {
              // Find the class ID from the booking
              const classId = booking.classId;

              if (!classId) {
                Alert.alert(
                  "Error",
                  "Unable to cancel booking. Class ID not found.",
                );
                return;
              }

              const result = await classService.cancelBooking(
                classId,
                member.uid,
              );

              if (result.success) {
                Alert.alert(
                  "Booking Cancelled",
                  "Your class booking has been successfully cancelled.",
                  [{ text: "OK", style: "default" }],
                );

                // Refresh bookings
                await fetchUserBookings();

                // Call parent handler if provided
                if (onCancelBooking) {
                  onCancelBooking(classId);
                }
              } else {
                Alert.alert(
                  "Error",
                  result.error || "Failed to cancel booking",
                );
              }
            } catch (error) {
              console.error("Error cancelling booking:", error);
              Alert.alert(
                "Error",
                "Failed to cancel booking. Please try again.",
              );
            }
          },
        },
      ],
    );
  };

  // Load bookings on component mount
  useEffect(() => {
    fetchUserBookings();
  }, [member]);

  // Handle refresh
  const onRefresh = () => {
    setRefreshing(true);
    fetchUserBookings();
  };

  const BookingCard = ({ booking, isPast = false }) => {
    const isUpcoming = !isPast;
    const canCancel =
      isUpcoming &&
      booking.classDateTime &&
      booking.classDateTime.getTime() - new Date().getTime() >
        2 * 60 * 60 * 1000; // 2 hours before class

    return (
      <View style={[screenStyles.classCard, isPast && { opacity: 0.7 }]}>
        <View style={screenStyles.classHeader}>
          <View style={{ flex: 1 }}>
            <Text style={screenStyles.className}>{booking.name}</Text>
            <Text style={screenStyles.classInstructor}>
              with {booking.instructor}
            </Text>
            {booking.ageGroup && booking.difficulty && (
              <Text
                style={{
                  fontSize: 12,
                  color: colors.textSecondary,
                  marginTop: 2,
                }}
              >
                {booking.ageGroup} • {booking.difficulty}
              </Text>
            )}
          </View>
          <View style={screenStyles.bookingStatus}>
            <Ionicons
              name={
                booking.status === "attended"
                  ? "checkmark-circle"
                  : isPast
                    ? "time-outline"
                    : "calendar"
              }
              size={16}
              color={
                booking.status === "attended"
                  ? colors.success
                  : isPast
                    ? colors.textSecondary
                    : colors.primary
              }
            />
            <Text
              style={[
                screenStyles.statusText,
                {
                  color:
                    booking.status === "attended"
                      ? colors.success
                      : isPast
                        ? colors.textSecondary
                        : colors.primary,
                },
              ]}
            >
              {booking.status === "attended"
                ? "Attended"
                : isPast
                  ? "Missed"
                  : "Booked"}
            </Text>
          </View>
        </View>

        <View style={screenStyles.classDetails}>
          <View style={screenStyles.classInfo}>
            <Ionicons name="time" size={16} color={colors.textSecondary} />
            <Text style={screenStyles.classTime}>{booking.time}</Text>
          </View>
          <View style={screenStyles.classInfo}>
            <Ionicons name="calendar" size={16} color={colors.textSecondary} />
            <Text style={screenStyles.classDate}>{booking.date}</Text>
          </View>
          <View style={screenStyles.classInfo}>
            <Ionicons name="card" size={16} color={colors.textSecondary} />
            <Text style={screenStyles.classPrice}>£{booking.price}</Text>
          </View>
        </View>

        {/* Booking date info */}
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            marginTop: 10,
            paddingTop: 10,
            borderTopWidth: 1,
            borderTopColor: colors.cardBorder,
            gap: 6,
          }}
        >
          <Ionicons name="bookmark" size={14} color={colors.textSecondary} />
          <Text
            style={{
              fontSize: 12,
              color: colors.textSecondary,
            }}
          >
            Booked on{" "}
            {booking.bookingDate.toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </Text>
        </View>

        {/* Action buttons for upcoming bookings */}
        {isUpcoming && (
          <View style={screenStyles.bookingActions}>
            {canCancel ? (
              <>
                <TouchableOpacity
                  style={screenStyles.secondaryActionButton}
                  onPress={() => handleCheckIn(booking)}
                >
                  <Ionicons
                    name="qr-code-outline"
                    size={16}
                    color={colors.primary}
                  />
                  <Text style={screenStyles.secondaryActionText}>Check In</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={screenStyles.cancelButton}
                  onPress={() => handleCancelBooking(booking)}
                >
                  <Ionicons name="close-circle" size={16} color={colors.text} />
                  <Text style={screenStyles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
              </>
            ) : (
              <View
                style={{
                  backgroundColor: colors.warning + "20",
                  borderRadius: 8,
                  padding: 10,
                  marginTop: 10,
                }}
              >
                <Text
                  style={{
                    fontSize: 12,
                    color: colors.warning,
                    textAlign: "center",
                  }}
                >
                  ⚠️ Cannot cancel within 2 hours of class time
                </Text>
              </View>
            )}
          </View>
        )}

        {/* Review button for past bookings */}
        {isPast && (
          <TouchableOpacity style={screenStyles.reviewButton}>
            <Ionicons name="star-outline" size={16} color={colors.primary} />
            <Text style={screenStyles.reviewButtonText}>Leave Review</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  // Loading state
  if (loading) {
    return (
      <View style={screenStyles.container}>
        <View style={screenStyles.screenHeader}>
          <TouchableOpacity onPress={onBack}>
            <Ionicons name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={screenStyles.screenTitle}>My Bookings</Text>
          <View style={{ width: 24 }} />
        </View>

        <View
          style={[
            screenStyles.content,
            { justifyContent: "center", alignItems: "center" },
          ]}
        >
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={{ color: colors.text, marginTop: 10 }}>
            Loading your bookings...
          </Text>
        </View>
      </View>
    );
  }

  const upcomingBookings = getUpcomingBookings();
  const pastBookings = getPastBookings();
  const stats = getBookingStats();

  return (
    <View style={screenStyles.container}>
      {/* Header */}
      <View style={screenStyles.screenHeader}>
        <TouchableOpacity onPress={onBack}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={screenStyles.screenTitle}>My Bookings</Text>
        <TouchableOpacity
          style={screenStyles.headerAction}
          onPress={() =>
            Alert.alert("Quick Book", "Browse classes to make new bookings!")
          }
        >
          <Ionicons name="add" size={24} color={colors.primary} />
        </TouchableOpacity>
      </View>

      {/* Tab Navigation */}
      <View style={screenStyles.tabContainer}>
        <TouchableOpacity
          style={[
            screenStyles.tab,
            activeTab === "upcoming" && screenStyles.activeTab,
          ]}
          onPress={() => setActiveTab("upcoming")}
        >
          <Text
            style={[
              screenStyles.tabText,
              activeTab === "upcoming" && screenStyles.activeTabText,
            ]}
          >
            Upcoming ({upcomingBookings.length})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            screenStyles.tab,
            activeTab === "history" && screenStyles.activeTab,
          ]}
          onPress={() => setActiveTab("history")}
        >
          <Text
            style={[
              screenStyles.tabText,
              activeTab === "history" && screenStyles.activeTabText,
            ]}
          >
            History ({pastBookings.length})
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={screenStyles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.primary}
            colors={[colors.primary]}
          />
        }
      >
        {error && (
          <View
            style={{
              backgroundColor: colors.primary + "20",
              borderRadius: 12,
              padding: 15,
              marginBottom: 20,
              borderWidth: 1,
              borderColor: colors.primary + "40",
            }}
          >
            <Text style={{ color: colors.primary, textAlign: "center" }}>
              ⚠️ {error}
            </Text>
          </View>
        )}

        {activeTab === "upcoming" ? (
          <>
            {upcomingBookings.length > 0 ? (
              <>
                {/* Booking Summary */}
                <View style={screenStyles.summaryCard}>
                  <Text style={screenStyles.summaryTitle}>
                    Upcoming Classes
                  </Text>
                  <View style={screenStyles.summaryRow}>
                    <Text style={screenStyles.summaryLabel}>
                      Total Bookings:
                    </Text>
                    <Text style={screenStyles.summaryValue}>
                      {upcomingBookings.length}
                    </Text>
                  </View>
                  <View style={screenStyles.summaryRow}>
                    <Text style={screenStyles.summaryLabel}>Total Value:</Text>
                    <Text style={screenStyles.summaryValue}>
                      £
                      {upcomingBookings
                        .reduce((sum, booking) => sum + (booking.price || 0), 0)
                        .toFixed(2)}
                    </Text>
                  </View>
                  <View style={screenStyles.summaryRow}>
                    <Text style={screenStyles.summaryLabel}>Next Class:</Text>
                    <Text style={screenStyles.summaryValue}>
                      {upcomingBookings[0]?.date.split(",")[0] || "None"}
                    </Text>
                  </View>
                </View>

                {upcomingBookings.map((booking) => (
                  <BookingCard
                    key={booking.id}
                    booking={booking}
                    isPast={false}
                  />
                ))}
              </>
            ) : (
              <View style={screenStyles.emptyState}>
                <Ionicons
                  name="calendar-outline"
                  size={64}
                  color={colors.textSecondary}
                />
                <Text style={screenStyles.emptyTitle}>
                  No Upcoming Bookings
                </Text>
                <Text style={screenStyles.emptyDesc}>
                  Book your next class to continue your Muay Thai journey!
                </Text>
                <TouchableOpacity
                  style={screenStyles.primaryButton}
                  onPress={onBack}
                >
                  <Text style={screenStyles.primaryButtonText}>
                    Browse Classes
                  </Text>
                </TouchableOpacity>
              </View>
            )}
          </>
        ) : (
          <>
            {/* History Stats */}
            <View style={screenStyles.historyStats}>
              <View style={screenStyles.historyStatItem}>
                <Text style={screenStyles.historyStatNumber}>
                  {stats.totalClasses}
                </Text>
                <Text style={screenStyles.historyStatLabel}>Total Classes</Text>
              </View>
              <View style={screenStyles.historyStatItem}>
                <Text style={screenStyles.historyStatNumber}>
                  £{stats.totalSpent.toFixed(0)}
                </Text>
                <Text style={screenStyles.historyStatLabel}>Total Spent</Text>
              </View>
              <View style={screenStyles.historyStatItem}>
                <Text style={screenStyles.historyStatNumber}>
                  {stats.thisMonthClasses}
                </Text>
                <Text style={screenStyles.historyStatLabel}>This Month</Text>
              </View>
            </View>

            {/* Past Bookings */}
            {pastBookings.length > 0 ? (
              pastBookings.map((booking) => (
                <BookingCard key={booking.id} booking={booking} isPast={true} />
              ))
            ) : (
              <View style={screenStyles.emptyState}>
                <Ionicons
                  name="trophy-outline"
                  size={64}
                  color={colors.textSecondary}
                />
                <Text style={screenStyles.emptyTitle}>No Training History</Text>
                <Text style={screenStyles.emptyDesc}>
                  Your completed classes will appear here. Start training to
                  build your history!
                </Text>
              </View>
            )}
          </>
        )}
      </ScrollView>
    </View>
  );
};

export default MyBookingsScreen;
