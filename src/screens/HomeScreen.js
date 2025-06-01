import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Animated,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "../constants/colors";
import ClassCard from "../components/ClassCard";
import classService from "../services/classService";
import authService from "../services/authService";
import { screenStyles } from "../styles/screenStyles";

const HomeScreen = ({ member, bookedClasses, onBookClass, onNavigate }) => {
  const [refreshing, setRefreshing] = useState(false);
  const [greeting, setGreeting] = useState("");
  const [todaysClasses, setTodaysClasses] = useState([]);
  const [userBookings, setUserBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [memberData, setMemberData] = useState(member);
  const fadeAnim = React.useRef(new Animated.Value(0)).current;

  // Set greeting based on time of day
  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) {
      setGreeting("Good Morning");
    } else if (hour < 17) {
      setGreeting("Good Afternoon");
    } else {
      setGreeting("Good Evening");
    }

    // Fade in animation
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();
  }, [fadeAnim]);

  // Fetch real Firebase data
  const fetchHomeData = async () => {
    try {
      // Get today's classes
      const classesResult = await classService.getTodaysClasses();
      if (classesResult.success) {
        setTodaysClasses(classesResult.classes);
      }

      // Get user's bookings if logged in
      if (member && member.uid) {
        const bookingsResult = await classService.getUserBookings(member.uid);
        if (bookingsResult.success) {
          setUserBookings(bookingsResult.bookings);
        }

        // Refresh user profile to get latest stats
        const profileResult = await authService.getCurrentUserProfile();
        if (profileResult.success) {
          setMemberData(profileResult.user);
        }
      }
    } catch (error) {
      console.error("Error fetching home data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHomeData();
  }, [member]);

  // Handle refresh
  const onRefresh = React.useCallback(async () => {
    setRefreshing(true);
    await fetchHomeData();
    setRefreshing(false);
  }, [member]);

  // Get user's bookings for today
  const getTodaysBookings = () => {
    const today = new Date();
    const todayStart = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate(),
    );
    const todayEnd = new Date(todayStart.getTime() + 24 * 60 * 60 * 1000);

    return userBookings.filter((booking) => {
      const classDate = booking.classDetails?.datetime;
      return (
        classDate &&
        classDate >= todayStart &&
        classDate < todayEnd &&
        booking.status === "confirmed"
      );
    });
  };

  // Get upcoming class recommendation
  const getRecommendedClass = () => {
    const myBookedClassIds = userBookings.map((b) => b.classId);
    return todaysClasses.find(
      (c) => !myBookedClassIds.includes(c.id) && c.spotsLeft > 0,
    );
  };

  // Get available classes for today (not booked by user)
  const getAvailableClasses = () => {
    const myBookedClassIds = userBookings.map((b) => b.classId);
    return todaysClasses.filter(
      (c) => !myBookedClassIds.includes(c.id) && c.spotsLeft > 0,
    );
  };

  // Calculate this week's classes for user
  const getThisWeekCount = () => {
    const now = new Date();
    const weekStart = new Date(now.setDate(now.getDate() - now.getDay()));
    const weekEnd = new Date(weekStart.getTime() + 7 * 24 * 60 * 60 * 1000);

    const thisWeekBookings = userBookings.filter((booking) => {
      const classDate = booking.classDetails?.datetime;
      return classDate && classDate >= weekStart && classDate < weekEnd;
    });

    return thisWeekBookings.length;
  };

  // Check if user has booked a specific class
  const isClassBooked = (classItem) => {
    return (
      classItem.bookedMembers &&
      member &&
      classItem.bookedMembers.includes(member.uid)
    );
  };

  if (loading) {
    return (
      <View
        style={[
          screenStyles.content,
          { justifyContent: "center", alignItems: "center", paddingTop: 100 },
        ]}
      >
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={{ color: colors.text, marginTop: 10 }}>
          Loading your dashboard...
        </Text>
      </View>
    );
  }

  const myTodaysBookings = getTodaysBookings();
  const recommendedClass = getRecommendedClass();
  const availableClasses = getAvailableClasses();
  const thisWeekCount = getThisWeekCount();

  return (
    <ScrollView
      style={screenStyles.content}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          tintColor={colors.primary}
        />
      }
    >
      <Animated.View style={{ opacity: fadeAnim }}>
        {/* Personalized Welcome Card */}
        <View style={screenStyles.welcomeCard}>
          <Text style={screenStyles.welcomeTitle}>
            {greeting},{" "}
            {memberData.name ? memberData.name.split(" ")[0] : "Warrior"}! 🥊
          </Text>
          <Text style={screenStyles.welcomeText}>
            {myTodaysBookings.length > 0
              ? `You have ${myTodaysBookings.length} class${myTodaysBookings.length > 1 ? "es" : ""} booked today. Ready to train?`
              : todaysClasses.length > 0
                ? "Ready for your next training session? Check out today's available classes below."
                : "No classes scheduled for today. Perfect time to plan your week ahead!"}
          </Text>
        </View>

        {/* Quick Stats */}
        <View style={screenStyles.statsContainer}>
          <TouchableOpacity
            style={screenStyles.statCard}
            onPress={() => onNavigate("progress")}
          >
            <Text style={screenStyles.statNumber}>
              {memberData.classesAttended || 0}
            </Text>
            <Text style={screenStyles.statLabel}>Classes Attended</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={screenStyles.statCard}
            onPress={() => onNavigate("progress")}
          >
            <Text style={screenStyles.statNumber}>
              {memberData.currentStreak || 0}
            </Text>
            <Text style={screenStyles.statLabel}>Day Streak</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={screenStyles.statCard}
            onPress={() => onNavigate("mybookings")}
          >
            <Text style={screenStyles.statNumber}>{thisWeekCount}</Text>
            <Text style={screenStyles.statLabel}>This Week</Text>
          </TouchableOpacity>
        </View>

        {/* Quick Actions */}
        <View style={screenStyles.section}>
          <Text style={screenStyles.sectionTitle}>Quick Actions</Text>
          <View style={screenStyles.quickActionsGrid}>
            <TouchableOpacity
              style={screenStyles.actionCard}
              onPress={() => onNavigate("checkin")}
            >
              <Ionicons name="qr-code" size={28} color={colors.primary} />
              <Text style={screenStyles.actionText}>Check In</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={screenStyles.actionCard}
              onPress={() => onNavigate("mybookings")}
            >
              <Ionicons
                name="calendar-outline"
                size={28}
                color={colors.primary}
              />
              <Text style={screenStyles.actionText}>My Classes</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={screenStyles.actionCard}
              onPress={() => onNavigate("progress")}
            >
              <Ionicons
                name="trophy-outline"
                size={28}
                color={colors.primary}
              />
              <Text style={screenStyles.actionText}>Progress</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={screenStyles.actionCard}
              onPress={() => onNavigate("classes")}
            >
              <Ionicons
                name="people-outline"
                size={28}
                color={colors.primary}
              />
              <Text style={screenStyles.actionText}>All Classes</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* My Classes Today */}
        {myTodaysBookings.length > 0 && (
          <View style={screenStyles.section}>
            <Text style={screenStyles.sectionTitle}>My Classes Today</Text>
            {myTodaysBookings.map((booking) => {
              // Transform booking to class-like object for ClassCard
              const classItem = {
                id: booking.classId,
                name: booking.classDetails?.name || booking.name,
                instructor:
                  booking.classDetails?.instructor || booking.instructor,
                time: booking.time,
                date: "Today",
                price: booking.price,
                difficulty: booking.classDetails?.difficulty || "Unknown",
                spotsLeft: booking.classDetails?.spotsLeft || 0,
                bookedMembers: booking.classDetails?.bookedMembers || [],
                description: booking.classDetails?.description || "",
              };

              return (
                <ClassCard
                  key={booking.id}
                  classItem={classItem}
                  isBooked={true}
                  onBook={() => onBookClass(classItem)}
                  showBookedState={true}
                />
              );
            })}
          </View>
        )}

        {/* Next Recommended Class */}
        {recommendedClass && (
          <View style={screenStyles.section}>
            <Text style={screenStyles.sectionTitle}>Recommended for You</Text>
            <View style={screenStyles.recommendedCard}>
              <View style={screenStyles.recommendedHeader}>
                <Ionicons name="star" size={20} color={colors.primary} />
                <Text style={screenStyles.recommendedLabel}>Perfect Match</Text>
              </View>
              <ClassCard
                classItem={{
                  ...recommendedClass,
                  time: recommendedClass.datetime.toLocaleTimeString("en-US", {
                    hour: "2-digit",
                    minute: "2-digit",
                    hour12: false,
                  }),
                  date: "Today",
                }}
                isBooked={isClassBooked(recommendedClass)}
                onBook={() => onBookClass(recommendedClass)}
                showFullDetails={true}
              />
            </View>
          </View>
        )}

        {/* Today's Available Classes */}
        {availableClasses.length > 0 && (
          <View style={screenStyles.section}>
            <View style={screenStyles.sectionHeader}>
              <Text style={screenStyles.sectionTitle}>Available Today</Text>
              <TouchableOpacity onPress={() => onNavigate("classes")}>
                <Text style={screenStyles.seeAllText}>See All</Text>
              </TouchableOpacity>
            </View>
            {availableClasses.slice(0, 2).map((classItem) => (
              <ClassCard
                key={classItem.id}
                classItem={{
                  ...classItem,
                  time: classItem.datetime.toLocaleTimeString("en-US", {
                    hour: "2-digit",
                    minute: "2-digit",
                    hour12: false,
                  }),
                  date: "Today",
                }}
                isBooked={isClassBooked(classItem)}
                onBook={() => onBookClass(classItem)}
              />
            ))}
          </View>
        )}

        {/* Empty state for no classes today */}
        {todaysClasses.length === 0 && (
          <View style={screenStyles.section}>
            <View
              style={{
                backgroundColor: colors.cardBackground,
                borderRadius: 15,
                padding: 30,
                alignItems: "center",
                borderWidth: 1,
                borderColor: colors.cardBorder,
              }}
            >
              <Ionicons
                name="calendar-outline"
                size={48}
                color={colors.textSecondary}
              />
              <Text
                style={{
                  fontSize: 18,
                  fontWeight: "bold",
                  color: colors.text,
                  marginTop: 15,
                  marginBottom: 8,
                }}
              >
                No Classes Today
              </Text>
              <Text
                style={{
                  fontSize: 14,
                  color: colors.textSecondary,
                  textAlign: "center",
                  marginBottom: 20,
                }}
              >
                Check tomorrow's schedule or browse all available classes.
              </Text>
              <TouchableOpacity
                style={screenStyles.primaryButton}
                onPress={() => onNavigate("classes")}
              >
                <Text style={screenStyles.primaryButtonText}>
                  Browse Classes
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Current Goal */}
        <View style={screenStyles.goalCard}>
          <View style={screenStyles.goalHeader}>
            <Ionicons name="radio-button-on" size={24} color={colors.primary} />
            <Text style={screenStyles.goalTitle}>Weekly Goal</Text>
          </View>
          <Text style={screenStyles.goalText}>
            {memberData.nextGoal || "Complete your first class"}
          </Text>
          <View style={screenStyles.progressBar}>
            <View
              style={[
                screenStyles.progressFill,
                { width: `${Math.min((thisWeekCount / 5) * 100, 100)}%` },
              ]}
            />
          </View>
          <Text style={screenStyles.progressText}>
            {thisWeekCount} of 5 sessions completed this week
          </Text>

          <TouchableOpacity
            style={screenStyles.goalButton}
            onPress={() => onNavigate("goalmanagement")}
          >
            <Text style={screenStyles.goalButtonText}>Update Goal</Text>
          </TouchableOpacity>
        </View>

        {/* Weekly Schedule Preview */}
        <View style={screenStyles.section}>
          <Text style={screenStyles.sectionTitle}>This Week's Highlights</Text>
          <View style={screenStyles.weeklyHighlights}>
            <View style={screenStyles.highlightItem}>
              <View style={screenStyles.highlightIcon}>
                <Ionicons name="flash" size={16} color={colors.primary} />
              </View>
              <View style={screenStyles.highlightContent}>
                <Text style={screenStyles.highlightTitle}>
                  Sparring Workshop
                </Text>
                <Text style={screenStyles.highlightDesc}>
                  Saturday 2PM - Advanced techniques
                </Text>
              </View>
            </View>

            <View style={screenStyles.highlightItem}>
              <View style={screenStyles.highlightIcon}>
                <Ionicons name="people" size={16} color={colors.primary} />
              </View>
              <View style={screenStyles.highlightContent}>
                <Text style={screenStyles.highlightTitle}>Open Training</Text>
                <Text style={screenStyles.highlightDesc}>
                  Sunday 10AM - All levels welcome
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Motivational Quote */}
        <View style={screenStyles.quoteCard}>
          <Ionicons
            name="chatbox-outline"
            size={24}
            color={colors.primary}
            style={{ marginBottom: 10 }}
          />
          <Text style={screenStyles.quoteText}>
            "The art of eight limbs teaches us that strength comes not from the
            body alone, but from the harmony of mind, body, and spirit."
          </Text>
          <Text style={screenStyles.quoteAuthor}>
            - Traditional Muay Thai Wisdom
          </Text>
        </View>
      </Animated.View>
    </ScrollView>
  );
};

export default HomeScreen;
