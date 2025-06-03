import React, { useState, useEffect } from "react";
import {
  SafeAreaView,
  StatusBar,
  Alert,
  Animated,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import LoginScreen from "./src/screens/LoginScreen";
import MainNavigator from "./src/navigation/MainNavigator";
import SetupComponent from "./src/components/SetupComponent";
import Logo from "./src/components/Logo";
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

        {/* FightTracker Logo */}
        {/* FightTracker Logo */}
        <Logo size="xlarge" showBackground={false} />

        <Text
          style={{
            fontSize: 28,
            fontWeight: "bold",
            color: colors.primary,
            letterSpacing: 2,
            marginBottom: 8,
          }}
        >
          FIGHTTRACKER
        </Text>

        <Text
          style={{
            fontSize: 14,
            color: colors.textSecondary,
            fontStyle: "italic",
          }}
        >
          Train. Track. Dominate.
        </Text>
      </Animated.View>
    </View>
  );
};

const App = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [member, setMember] = useState(null);
  const [showSetup, setShowSetup] = useState(false);

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
          setShowSetup(false);
        },
      },
    ]);
  };

  const toggleSetupView = () => {
    Alert.alert("Firebase Setup", "Show the Firebase data setup component?", [
      { text: "Cancel", style: "cancel" },
      { text: "Show Setup", onPress: () => setShowSetup(!showSetup) },
    ]);
  };

  if (isLoading) {
    return <LoadingScreen />;
  }

  if (!isLoggedIn) {
    return <LoginScreen onLogin={handleLogin} />;
  }

  // Add setup view option
  if (showSetup) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
        <StatusBar
          barStyle="light-content"
          backgroundColor={colors.background}
        />
        <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
          <View
            style={{
              flex: 1,
              paddingTop: 50,
              paddingHorizontal: 20,
            }}
          >
            <Text
              style={{
                fontSize: 24,
                fontWeight: "bold",
                color: colors.text,
                textAlign: "center",
                marginBottom: 10,
              }}
            >
              FightTracker Setup Mode
            </Text>
            <Text
              style={{
                fontSize: 14,
                color: colors.textSecondary,
                textAlign: "center",
                marginBottom: 20,
              }}
            >
              Use this to populate your Firebase database with sample data
            </Text>

            <SetupComponent />

            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-around",
                marginTop: 20,
                paddingHorizontal: 20,
              }}
            >
              <TouchableOpacity
                style={{
                  backgroundColor: colors.primary,
                  paddingHorizontal: 20,
                  paddingVertical: 10,
                  borderRadius: 8,
                }}
                onPress={() => setShowSetup(false)}
              >
                <Text style={{ color: colors.text, fontWeight: "600" }}>
                  Back to App
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={{
                  backgroundColor: colors.backgroundLight,
                  paddingHorizontal: 20,
                  paddingVertical: 10,
                  borderRadius: 8,
                  borderWidth: 1,
                  borderColor: colors.cardBorder,
                }}
                onPress={handleLogout}
              >
                <Text style={{ color: colors.text, fontWeight: "600" }}>
                  Logout
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <StatusBar barStyle="light-content" backgroundColor={colors.background} />

      <MainNavigator
        member={member}
        onLogout={handleLogout}
        onSetupAccess={toggleSetupView}
      />
    </SafeAreaView>
  );
};

export default App;
