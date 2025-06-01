import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  FlatList,
  RefreshControl,
  ActivityIndicator,
  Alert,
} from "react-native";
import ClassCard from "../components/ClassCard";
import classService from "../services/classService";
import { colors } from "../constants/colors";
import { screenStyles } from "../styles/screenStyles";

const ClassesScreen = ({ bookedClasses, onBookClass, member }) => {
  const [selectedDay, setSelectedDay] = useState("Today");
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [bookingInProgress, setBookingInProgress] = useState(null);

  const days = ["Today", "Tomorrow", "This Week"];

  // Helper function to determine relative date
  const getRelativeDate = (datetime) => {
    if (!datetime) return "This Week";

    const now = new Date();
    const classDate = new Date(datetime);
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const tomorrow = new Date(today.getTime() + 24 * 60 * 60 * 1000);
    const classDay = new Date(
      classDate.getFullYear(),
      classDate.getMonth(),
      classDate.getDate(),
    );

    if (classDay.getTime() === today.getTime()) {
      return "Today";
    } else if (classDay.getTime() === tomorrow.getTime()) {
      return "Tomorrow";
    } else {
      return "This Week";
    }
  };

  // Fetch classes from Firebase
  const fetchClasses = async () => {
    try {
      setError(null);
      const result = await classService.getClasses();

      if (result.success) {
        // Transform Firebase data to match your existing format
        const transformedClasses = result.classes.map((cls) => ({
          ...cls,
          // Convert datetime back to a readable format
          time: cls.datetime
            ? cls.datetime.toLocaleTimeString("en-US", {
                hour: "2-digit",
                minute: "2-digit",
                hour12: false,
              }) +
              " - " +
              new Date(
                cls.datetime.getTime() + 60 * 60 * 1000,
              ).toLocaleTimeString("en-US", {
                hour: "2-digit",
                minute: "2-digit",
                hour12: false,
              })
            : "TBD",
          // Determine if class is today, tomorrow, or this week
          date: getRelativeDate(cls.datetime),
          // Ensure spotsLeft is calculated correctly
          spotsLeft:
            cls.spotsLeft !== undefined
              ? cls.spotsLeft
              : cls.maxCapacity - (cls.bookedMembers?.length || 0),
        }));

        setClasses(transformedClasses);
      } else {
        setError(result.error);
        console.error("Error fetching classes:", result.error);
      }
    } catch (err) {
      setError("Failed to load classes");
      console.error("Error fetching classes:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Handle real Firebase booking
  const handleBookClass = async (classItem) => {
    if (!member || !member.uid) {
      Alert.alert("Error", "Please log in to book classes");
      return;
    }

    // Check if already booked
    if (
      classItem.bookedMembers &&
      classItem.bookedMembers.includes(member.uid)
    ) {
      Alert.alert("Already Booked", "You have already booked this class!");
      return;
    }

    // Check if class is full
    if (classItem.spotsLeft <= 0) {
      Alert.alert("Class Full", "Sorry, this class is fully booked.");
      return;
    }

    // Show confirmation dialog
    Alert.alert(
      "Confirm Booking",
      `Book "${classItem.name}" with ${classItem.instructor} for £${classItem.price}?\n\nDate: ${classItem.date}\nTime: ${classItem.time}`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Book & Pay",
          onPress: async () => {
            try {
              setBookingInProgress(classItem.id);

              // Call the real Firebase booking service
              const result = await classService.bookClass(
                classItem.id,
                member.uid,
                {
                  name: member.name,
                  email: member.email,
                },
              );

              if (result.success) {
                // Show success message
                Alert.alert(
                  "Class Booked! 🥊",
                  `Successfully booked ${classItem.name}. Payment of £${classItem.price} processed.\n\nSee you at ${classItem.time} on ${classItem.date}!`,
                  [{ text: "Awesome!", style: "default" }],
                );

                // Refresh the classes to show updated booking
                await fetchClasses();

                // Call the parent's booking handler for any additional logic
                if (onBookClass) {
                  onBookClass(classItem);
                }
              } else {
                Alert.alert("Booking Failed", result.error);
              }
            } catch (error) {
              console.error("Booking error:", error);
              Alert.alert("Error", "Failed to book class. Please try again.");
            } finally {
              setBookingInProgress(null);
            }
          },
        },
      ],
    );
  };

  // Check if user has booked a class
  const isClassBooked = (classItem) => {
    return (
      classItem.bookedMembers &&
      member &&
      classItem.bookedMembers.includes(member.uid)
    );
  };

  // Filter classes based on selected day
  const getFilteredClasses = () => {
    return classes.filter((c) => c.date === selectedDay);
  };

  // Load classes on component mount
  useEffect(() => {
    fetchClasses();
  }, []);

  // Handle refresh
  const onRefresh = () => {
    setRefreshing(true);
    fetchClasses();
  };

  // Loading state
  if (loading) {
    return (
      <View
        style={[
          screenStyles.content,
          { justifyContent: "center", alignItems: "center" },
        ]}
      >
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={{ color: colors.text, marginTop: 10 }}>
          Loading classes...
        </Text>
      </View>
    );
  }

  // Error state
  if (error) {
    return (
      <View
        style={[
          screenStyles.content,
          { justifyContent: "center", alignItems: "center" },
        ]}
      >
        <Text style={{ color: colors.primary, fontSize: 18, marginBottom: 10 }}>
          ⚠️ Error Loading Classes
        </Text>
        <Text
          style={{
            color: colors.textSecondary,
            textAlign: "center",
            marginBottom: 20,
          }}
        >
          {error}
        </Text>
        <TouchableOpacity
          style={screenStyles.primaryButton}
          onPress={fetchClasses}
        >
          <Text style={screenStyles.primaryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const filteredClasses = getFilteredClasses();

  return (
    <View style={screenStyles.content}>
      {/* Day Filter */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={screenStyles.dayFilter}
      >
        {days.map((day) => (
          <TouchableOpacity
            key={day}
            style={[
              screenStyles.dayButton,
              selectedDay === day && screenStyles.activeDayButton,
            ]}
            onPress={() => setSelectedDay(day)}
          >
            <Text
              style={[
                screenStyles.dayButtonText,
                selectedDay === day && screenStyles.activeDayButtonText,
              ]}
            >
              {day}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Classes List */}
      {filteredClasses.length > 0 ? (
        <FlatList
          data={filteredClasses}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <ClassCard
              classItem={item}
              isBooked={isClassBooked(item)}
              onBook={() => handleBookClass(item)}
              showFullDetails
              isBookingInProgress={bookingInProgress === item.id}
            />
          )}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 20 }}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={colors.primary}
              colors={[colors.primary]}
            />
          }
        />
      ) : (
        <View style={screenStyles.emptyState}>
          <Text style={screenStyles.emptyTitle}>No Classes {selectedDay}</Text>
          <Text style={screenStyles.emptyDesc}>
            {selectedDay === "Today"
              ? "No more classes scheduled for today. Check tomorrow's schedule!"
              : `No classes scheduled for ${selectedDay.toLowerCase()}.`}
          </Text>
          <TouchableOpacity
            style={screenStyles.primaryButton}
            onPress={onRefresh}
          >
            <Text style={screenStyles.primaryButtonText}>Refresh</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Classes count indicator */}
      <View
        style={{
          position: "absolute",
          bottom: 20,
          right: 20,
          backgroundColor: colors.primary + "20",
          paddingHorizontal: 12,
          paddingVertical: 6,
          borderRadius: 15,
          borderWidth: 1,
          borderColor: colors.primary + "40",
        }}
      >
        <Text
          style={{
            color: colors.primary,
            fontSize: 12,
            fontWeight: "600",
          }}
        >
          {filteredClasses.length} class
          {filteredClasses.length !== 1 ? "es" : ""} {selectedDay.toLowerCase()}
        </Text>
      </View>
    </View>
  );
};

export default ClassesScreen;
