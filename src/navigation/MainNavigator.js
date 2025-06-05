// src/navigation/MainNavigator.js - UPDATED WITH SOCIAL FEATURES
import React, { useState } from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "../constants/colors";
import { navigationStyles } from "../styles/navigationStyles";

// Import all screens
import HomeScreen from "../screens/HomeScreen";
import TrainingScreen from "../screens/TrainingScreen";
import FeedScreen from "../screens/FeedScreen";
import ProgressScreen from "../screens/ProgressScreen";
import ProfileScreen from "../screens/ProfileScreen";
import LogTrainingScreen from "../screens/LogTrainingScreen";
import StatsScreen from "../screens/StatsScreen";
import SettingsScreen from "../screens/SettingsScreen";
import EditProfileScreen from "../screens/EditProfileScreen";
import ChallengesScreen from "../screens/ChallengesScreen";
import DiscoverUsersScreen from "../screens/DiscoverUsersScreen"; // NEW

// Header Component with FightTracker branding
const Header = ({
  member,
  currentScreen,
  onBack,
  onProfilePress,
  onSetupAccess,
  onDiscoverPress, // NEW
}) => (
  <View style={navigationStyles.header}>
    {currentScreen !== "home" &&
    currentScreen !== "training" &&
    currentScreen !== "feed" &&
    currentScreen !== "progress" &&
    currentScreen !== "profile" ? (
      <TouchableOpacity onPress={onBack} style={navigationStyles.backButton}>
        <Ionicons name="arrow-back" size={24} color={colors.text} />
      </TouchableOpacity>
    ) : (
      <TouchableOpacity
        style={navigationStyles.headerBrand}
        onLongPress={onSetupAccess}
        delayLongPress={3000}
      >
        <View
          style={{
            width: 32,
            height: 32,
            backgroundColor: colors.primary,
            borderRadius: 16,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Text style={{ fontSize: 16, fontWeight: "bold" }}>🥊</Text>
        </View>
        <View>
          <Text style={navigationStyles.headerTitle}>FightTracker</Text>
          <Text style={navigationStyles.headerSubtitle}>
            Train. Track. Dominate.
          </Text>
        </View>
      </TouchableOpacity>
    )}

    {/* Header Actions */}
    <View style={navigationStyles.headerActions}>
      {/* Discover Users Button - NEW */}
      {(currentScreen === "feed" || currentScreen === "profile") && (
        <TouchableOpacity
          style={navigationStyles.headerActionButton}
          onPress={onDiscoverPress}
        >
          <Ionicons name="person-add" size={24} color={colors.text} />
        </TouchableOpacity>
      )}

      {/* Profile Button */}
      {(currentScreen === "home" ||
        currentScreen === "training" ||
        currentScreen === "feed" ||
        currentScreen === "progress" ||
        currentScreen === "profile") && (
        <TouchableOpacity
          style={navigationStyles.profileButton}
          onPress={onProfilePress}
        >
          <View style={navigationStyles.avatarSmall}>
            <Text style={navigationStyles.avatarTextSmall}>
              {member.avatar}
            </Text>
          </View>
        </TouchableOpacity>
      )}
    </View>
  </View>
);

// Bottom Navigation Component
const BottomNavigation = ({ activeTab, setActiveTab, currentScreen }) => {
  // Hide bottom nav on sub-screens
  if (
    currentScreen !== "home" &&
    currentScreen !== "training" &&
    currentScreen !== "feed" &&
    currentScreen !== "progress" &&
    currentScreen !== "profile"
  ) {
    return null;
  }

  const tabs = [
    { id: "home", icon: "home", label: "Home" },
    { id: "training", icon: "fitness", label: "Training" },
    { id: "feed", icon: "people", label: "Feed" },
    { id: "progress", icon: "analytics", label: "Progress" },
    { id: "profile", icon: "person", label: "Profile" },
  ];

  return (
    <View style={navigationStyles.bottomNav}>
      {tabs.map((tab) => (
        <TouchableOpacity
          key={tab.id}
          style={[
            navigationStyles.navTab,
            activeTab === tab.id && navigationStyles.activeTab,
          ]}
          onPress={() => setActiveTab(tab.id)}
        >
          <Ionicons
            name={tab.icon}
            size={24}
            color={activeTab === tab.id ? colors.primary : colors.textSecondary}
          />
          <Text
            style={[
              navigationStyles.navLabel,
              {
                color:
                  activeTab === tab.id ? colors.primary : colors.textSecondary,
              },
            ]}
          >
            {tab.label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};

// Main Navigator
const MainNavigator = ({ member, onLogout, onSetupAccess }) => {
  const [activeTab, setActiveTab] = useState("home");
  const [currentScreen, setCurrentScreen] = useState("home");
  const [memberData, setMemberData] = useState(member);

  const navigateToScreen = (screenName) => {
    setCurrentScreen(screenName);
  };

  const goBack = () => {
    setCurrentScreen(activeTab);
  };

  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
    setCurrentScreen(tabId);
  };

  const handleProfilePress = () => {
    if (currentScreen !== "profile") {
      setActiveTab("profile");
      setCurrentScreen("profile");
    }
  };

  // NEW: Handle discover users press
  const handleDiscoverPress = () => {
    setCurrentScreen("discover");
  };

  const renderScreen = () => {
    switch (currentScreen) {
      case "home":
        return <HomeScreen member={memberData} onNavigate={navigateToScreen} />;
      case "training":
        return (
          <TrainingScreen member={memberData} onNavigate={navigateToScreen} />
        );
      case "feed":
        return <FeedScreen member={memberData} onNavigate={navigateToScreen} />;
      case "progress":
        return (
          <ProgressScreen member={memberData} onNavigate={navigateToScreen} />
        );
      case "profile":
        return (
          <ProfileScreen
            member={memberData}
            onLogout={onLogout}
            onNavigate={navigateToScreen}
          />
        );
      case "logtraining":
        return <LogTrainingScreen member={memberData} onBack={goBack} />;
      case "stats":
        return <StatsScreen member={memberData} onBack={goBack} />;
      case "settings":
        return <SettingsScreen onBack={goBack} />;
      case "editprofile":
        return <EditProfileScreen member={memberData} onBack={goBack} />;
      case "challenges":
        return <ChallengesScreen member={memberData} onBack={goBack} />;

      // NEW: Discover Users Screen
      case "discover":
        return <DiscoverUsersScreen member={memberData} onBack={goBack} />;

      default:
        return <HomeScreen member={memberData} onNavigate={navigateToScreen} />;
    }
  };

  return (
    <View style={{ flex: 1 }}>
      <Header
        member={memberData}
        currentScreen={currentScreen}
        onBack={goBack}
        onProfilePress={handleProfilePress}
        onSetupAccess={onSetupAccess}
        onDiscoverPress={handleDiscoverPress} // NEW
      />
      {renderScreen()}
      <BottomNavigation
        activeTab={activeTab}
        setActiveTab={handleTabChange}
        currentScreen={currentScreen}
      />
    </View>
  );
};

export default MainNavigator;
