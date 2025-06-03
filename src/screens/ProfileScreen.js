import React from "react";
import { View, Text, ScrollView, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "../constants/colors";
import { screenStyles } from "../styles/screenStyles";

const ProfileOption = ({ icon, title, onPress, badge }) => (
  <TouchableOpacity style={screenStyles.profileOption} onPress={onPress}>
    <Ionicons name={icon} size={20} color={colors.textSecondary} />
    <Text style={screenStyles.profileOptionText}>{title}</Text>
    {badge && (
      <View style={styles.badge}>
        <Text style={styles.badgeText}>{badge}</Text>
      </View>
    )}
    <Ionicons name="chevron-forward" size={16} color={colors.textSecondary} />
  </TouchableOpacity>
);

const ProfileScreen = ({ member, onLogout, onNavigate }) => {
  return (
    <ScrollView
      style={screenStyles.content}
      showsVerticalScrollIndicator={false}
    >
      {/* Profile Header */}
      <View style={screenStyles.profileHeader}>
        <View style={screenStyles.avatarLarge}>
          <Text style={screenStyles.avatarText}>{member.avatar}</Text>
        </View>
        <Text style={screenStyles.profileName}>{member.name}</Text>
        <Text style={screenStyles.profileEmail}>{member.email}</Text>

        {/* Fighter Level Badge */}
        <View
          style={[
            screenStyles.membershipBadge,
            { backgroundColor: colors.primary + "20" },
          ]}
        >
          <Text
            style={[screenStyles.membershipText, { color: colors.primary }]}
          >
            {member.fighterLevel || "Amateur"} Fighter
          </Text>
        </View>

        {/* Gym Info */}
        {member.gym && (
          <View style={styles.gymInfo}>
            <Ionicons name="business" size={16} color={colors.textSecondary} />
            <Text style={styles.gymText}>{member.gym}</Text>
          </View>
        )}
      </View>

      {/* Quick Stats */}
      <View style={styles.quickStats}>
        <View style={styles.quickStat}>
          <Text style={styles.quickStatNumber}>
            {member.totalSessions || 142}
          </Text>
          <Text style={styles.quickStatLabel}>Sessions</Text>
        </View>
        <View style={styles.quickStat}>
          <Text style={styles.quickStatNumber}>{member.followers || 24}</Text>
          <Text style={styles.quickStatLabel}>Followers</Text>
        </View>
        <View style={styles.quickStat}>
          <Text style={styles.quickStatNumber}>{member.following || 18}</Text>
          <Text style={styles.quickStatLabel}>Following</Text>
        </View>
      </View>

      {/* Profile Options */}
      <View style={screenStyles.section}>
        <ProfileOption
          icon="person"
          title="Edit Profile"
          onPress={() => onNavigate("editprofile")}
        />
        <ProfileOption
          icon="people"
          title="Friends & Following"
          onPress={() => console.log("Navigate to friends")}
          badge="New"
        />
        <ProfileOption
          icon="trophy"
          title="Achievements & Challenges"
          onPress={() => onNavigate("challenges")}
        />
        <ProfileOption
          icon="analytics"
          title="Detailed Statistics"
          onPress={() => onNavigate("stats")}
        />
        <ProfileOption
          icon="business"
          title="My Gym"
          onPress={() => console.log("Navigate to gym")}
        />
        <ProfileOption
          icon="shield"
          title="Privacy Settings"
          onPress={() => console.log("Navigate to privacy")}
        />
        <ProfileOption
          icon="notifications"
          title="Notifications"
          onPress={() => onNavigate("settings")}
        />
        <ProfileOption
          icon="help-circle"
          title="Help & Support"
          onPress={() => console.log("Navigate to help")}
        />
        <ProfileOption
          icon="settings"
          title="App Settings"
          onPress={() => onNavigate("settings")}
        />

        <TouchableOpacity style={screenStyles.logoutButton} onPress={onLogout}>
          <Ionicons name="log-out" size={20} color={colors.primary} />
          <Text style={screenStyles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View>

      {/* App Info */}
      <View style={styles.appInfo}>
        <Text style={styles.appInfoTitle}>FightTracker</Text>
        <Text style={styles.appInfoVersion}>Version 1.0.0</Text>
        <Text style={styles.appInfoTagline}>Train. Track. Dominate.</Text>
      </View>
    </ScrollView>
  );
};

const styles = {
  badge: {
    backgroundColor: colors.primary,
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 2,
    marginLeft: 8,
  },
  badgeText: {
    color: colors.text,
    fontSize: 10,
    fontWeight: "600",
  },
  gymInfo: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 10,
    gap: 6,
  },
  gymText: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  quickStats: {
    flexDirection: "row",
    justifyContent: "space-around",
    backgroundColor: colors.cardBackground,
    borderRadius: 15,
    padding: 20,
    marginHorizontal: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  quickStat: {
    alignItems: "center",
  },
  quickStatNumber: {
    fontSize: 20,
    fontWeight: "bold",
    color: colors.primary,
    marginBottom: 4,
  },
  quickStatLabel: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  appInfo: {
    alignItems: "center",
    paddingVertical: 30,
    paddingHorizontal: 20,
  },
  appInfoTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: colors.primary,
    marginBottom: 5,
  },
  appInfoVersion: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 5,
  },
  appInfoTagline: {
    fontSize: 12,
    color: colors.textSecondary,
    fontStyle: "italic",
  },
};

export default ProfileScreen;
