import React, { useState, useEffect } from "react";
import {
  SafeAreaView,
  StatusBar,
  Alert,
  Animated,
  View,
  Text,
  Image,
} from "react-native";
import LoginScreen from "./src/screens/LoginScreen";
import MainNavigator from "./src/navigation/MainNavigator";
import { colors } from "./src/constants/colors";
import { mockMember } from "./src/data/mockData";

// Loading Screen Component
const LoadingScreen = () => {
  const spinValue = React.useRef(new Animated.Value(0)).current;
  const fadeValue = React.useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Spinning animation
    Animated.loop(
      Animated.timing(spinValue, {
        toValue: 1,
        duration: 2000,
        useNativeDriver: true,
      }),
    ).start();

    // Fade in animation
    Animated.timing(fadeValue, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: true,
    }).start();
  }, [spinValue, fadeValue]);

  const spin = spinValue.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: colors.background,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <StatusBar barStyle="light-content" backgroundColor={colors.background} />

      <Animated.View
        style={{
          opacity: fadeValue,
          alignItems: "center",
        }}
      >
        <Animated.View
          style={{
            transform: [{ rotate: spin }],
            width: 80,
            height: 80,
            borderWidth: 4,
            borderColor: colors.primary,
            borderTopColor: "transparent",
            borderRadius: 40,
            marginBottom: 30,
          }}
        />

        {/* 8 Limbs Logo */}
        <Image
          source={require("./assets/8-limbs-logo.png")}
          style={{
            width: 120,
            height: 120,
            marginBottom: 20,
          }}
          resizeMode="contain"
        />

        <Text
          style={{
            fontSize: 28,
            fontWeight: "bold",
            color: colors.primary,
            letterSpacing: 2,
            marginBottom: 8,
          }}
        >
          8 LIMBS
        </Text>

        <Text
          style={{
            fontSize: 14,
            color: colors.text,
            letterSpacing: 3,
            marginBottom: 20,
          }}
        >
          MUAY THAI
        </Text>

        <Text
          style={{
            fontSize: 14,
            color: colors.textSecondary,
            fontStyle: "italic",
          }}
        >
          Unleash Your Warrior Spirit
        </Text>
      </Animated.View>
    </View>
  );
};

const App = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [member, setMember] = useState(null);
  const [bookedClasses, setBookedClasses] = useState([]);

  // Simulate app initialization
  useEffect(() => {
    const initializeApp = async () => {
      // Simulate loading time (checking for existing session, etc.)
      await new Promise((resolve) => setTimeout(resolve, 2500));
      setIsLoading(false);
    };

    initializeApp();
  }, []);

  const handleLogin = (memberData) => {
    setMember(memberData);
    setIsLoggedIn(true);
  };

  const handleLogout = () => {
    Alert.alert("Logout", "Are you sure you want to logout?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Logout",
        style: "destructive",
        onPress: () => {
          setIsLoggedIn(false);
          setMember(null);
          setBookedClasses([]);
        },
      },
    ]);
  };

  const handleBookClass = (classItem) => {
    if (bookedClasses.includes(classItem.id)) {
      Alert.alert("Already Booked", "You have already booked this class!");
      return;
    }

    Alert.alert(
      "Confirm Booking",
      `Book ${classItem.name} with ${classItem.instructor} for £${classItem.price}?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Book & Pay",
          onPress: () => {
            setBookedClasses([...bookedClasses, classItem.id]);
            Alert.alert(
              "Class Booked! 🥊",
              `Successfully booked ${classItem.name}. Payment of £${classItem.price} processed.`,
              [{ text: "OK", style: "default" }],
            );
          },
        },
      ],
    );
  };

  const handleCancelBooking = (classId) => {
    Alert.alert(
      "Cancel Booking",
      "Are you sure you want to cancel this booking?",
      [
        { text: "Keep Booking", style: "cancel" },
        {
          text: "Cancel Booking",
          style: "destructive",
          onPress: () => {
            setBookedClasses(bookedClasses.filter((id) => id !== classId));
            Alert.alert(
              "Booking Cancelled",
              "Your class booking has been cancelled.",
              [{ text: "OK", style: "default" }],
            );
          },
        },
      ],
    );
  };

  if (isLoading) {
    return <LoadingScreen />;
  }

  if (!isLoggedIn) {
    return <LoginScreen onLogin={handleLogin} />;
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <StatusBar barStyle="light-content" backgroundColor={colors.background} />
      <MainNavigator
        member={member}
        bookedClasses={bookedClasses}
        onBookClass={handleBookClass}
        onCancelBooking={handleCancelBooking}
        onLogout={handleLogout}
      />
    </SafeAreaView>
  );
};

export default App;
