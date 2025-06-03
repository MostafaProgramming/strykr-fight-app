import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Alert,
  ActivityIndicator,
} from "react-native";
import { colors } from "../constants/colors";
import { loginStyles } from "../styles/loginStyles";
import Logo from "../components/Logo";
import authService from "../services/authService";

const LoginScreen = ({ onLogin }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [gym, setGym] = useState("");
  const [fighterLevel, setFighterLevel] = useState("Beginner");
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);

  const fighterLevels = [
    "Beginner",
    "Intermediate",
    "Amateur",
    "Semi-Pro",
    "Professional",
  ];

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }

    if (isSignUp && (!firstName || !lastName)) {
      Alert.alert("Error", "Please enter your full name");
      return;
    }

    setLoading(true);

    try {
      let result;

      if (isSignUp) {
        // Register new user with fighter-specific fields
        result = await authService.register(
          email,
          password,
          firstName,
          lastName,
          {
            gym,
            fighterLevel,
          },
        );
      } else {
        // Login existing user
        result = await authService.login(email, password);
      }

      if (result.success) {
        Alert.alert(
          "Success!",
          isSignUp
            ? "Welcome to FightTracker! Ready to start your training journey?"
            : "Welcome back, fighter!",
          [
            {
              text: "Let's Train!",
              onPress: () => {
                // Transform Firebase user to match app structure
                const userData = {
                  name:
                    result.user.name ||
                    result.user.displayName ||
                    `${firstName} ${lastName}` ||
                    "Fighter",
                  email: result.user.email,
                  uid: result.user.uid,
                  memberSince: result.user.memberSince || "Just now",
                  totalSessions: result.user.totalSessions || 0,
                  currentStreak: result.user.currentStreak || 0,
                  fighterLevel:
                    result.user.fighterLevel || fighterLevel || "Beginner",
                  gym: result.user.gym || gym || "",
                  followers: result.user.followers || 0,
                  following: result.user.following || 0,
                  avatar:
                    result.user.avatar ||
                    email.charAt(0).toUpperCase() +
                      (email.charAt(1) || "").toUpperCase(),
                };
                onLogin(userData);
              },
            },
          ],
        );
      } else {
        Alert.alert("Error", result.error);
      }
    } catch (error) {
      Alert.alert("Error", "Something went wrong. Please try again.");
      console.error("Login error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!email) {
      Alert.alert("Error", "Please enter your email address first");
      return;
    }

    setLoading(true);
    const result = await authService.resetPassword(email);
    setLoading(false);

    if (result.success) {
      Alert.alert(
        "Password Reset",
        "Check your email for password reset instructions.",
      );
    } else {
      Alert.alert("Error", result.error);
    }
  };

  return (
    <SafeAreaView style={loginStyles.container}>
      <StatusBar barStyle="light-content" backgroundColor={colors.background} />

      <ScrollView contentContainerStyle={loginStyles.scrollContainer}>
        <View style={loginStyles.logoSection}>
          {/* FightTracker Logo */}
          <Logo size="xlarge" showBackground={false} />

          <Text style={loginStyles.logoText}>STRYKR App</Text>
          <Text style={loginStyles.logoSubtext}>TRAIN • TRACK • DOMINATE</Text>
          <Text style={loginStyles.tagline}>
            Your training journey starts here
          </Text>
        </View>

        <View style={loginStyles.formSection}>
          <Text style={loginStyles.formTitle}>
            {isSignUp ? "Join the Fight Community" : "Welcome Back, Fighter"}
          </Text>

          {isSignUp && (
            <>
              <View style={styles.nameRow}>
                <TextInput
                  style={[loginStyles.input, styles.nameInput]}
                  placeholder="First Name"
                  placeholderTextColor={colors.textSecondary}
                  value={firstName}
                  onChangeText={setFirstName}
                  autoCapitalize="words"
                />

                <TextInput
                  style={[loginStyles.input, styles.nameInput]}
                  placeholder="Last Name"
                  placeholderTextColor={colors.textSecondary}
                  value={lastName}
                  onChangeText={setLastName}
                  autoCapitalize="words"
                />
              </View>

              <TextInput
                style={loginStyles.input}
                placeholder="Gym Name (Optional)"
                placeholderTextColor={colors.textSecondary}
                value={gym}
                onChangeText={setGym}
                autoCapitalize="words"
              />

              <View style={styles.pickerContainer}>
                <Text style={styles.pickerLabel}>Fighter Level</Text>
                <View style={styles.pickerWrapper}>
                  <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    style={styles.levelSelector}
                  >
                    {fighterLevels.map((level) => (
                      <TouchableOpacity
                        key={level}
                        style={[
                          styles.levelButton,
                          fighterLevel === level && styles.selectedLevelButton,
                        ]}
                        onPress={() => setFighterLevel(level)}
                      >
                        <Text
                          style={[
                            styles.levelButtonText,
                            fighterLevel === level && styles.selectedLevelText,
                          ]}
                        >
                          {level}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>
              </View>
            </>
          )}

          <TextInput
            style={loginStyles.input}
            placeholder="Email"
            placeholderTextColor={colors.textSecondary}
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />

          <TextInput
            style={loginStyles.input}
            placeholder="Password"
            placeholderTextColor={colors.textSecondary}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />

          <TouchableOpacity
            style={[loginStyles.primaryButton, loading && { opacity: 0.7 }]}
            onPress={handleLogin}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color={colors.text} />
            ) : (
              <Text style={loginStyles.primaryButtonText}>
                {isSignUp ? "START TRAINING" : "ENTER THE GYM"}
              </Text>
            )}
          </TouchableOpacity>

          {!isSignUp && (
            <TouchableOpacity
              style={loginStyles.forgotPasswordButton}
              onPress={handleForgotPassword}
            >
              <Text style={loginStyles.forgotPasswordText}>
                Forgot Password?
              </Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity
            style={loginStyles.switchButton}
            onPress={() => {
              setIsSignUp(!isSignUp);
              setFirstName("");
              setLastName("");
              setGym("");
              setFighterLevel("Beginner");
            }}
          >
            <Text style={loginStyles.switchText}>
              {isSignUp
                ? "Already a fighter? Sign In"
                : "New to training? Join Us"}
            </Text>
          </TouchableOpacity>

          {isSignUp && (
            <Text style={styles.disclaimer}>
              By signing up, you agree to track your training journey and
              connect with fellow fighters.
            </Text>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = {
  nameRow: {
    flexDirection: "row",
    gap: 10,
  },
  nameInput: {
    flex: 1,
    marginBottom: 15,
  },
  pickerContainer: {
    marginBottom: 15,
  },
  pickerLabel: {
    fontSize: 14,
    color: colors.text,
    marginBottom: 8,
    fontWeight: "500",
  },
  pickerWrapper: {
    backgroundColor: colors.cardBackground,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    borderRadius: 12,
    padding: 4,
  },
  levelSelector: {
    flexDirection: "row",
  },
  levelButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    marginHorizontal: 4,
    backgroundColor: colors.backgroundLight,
  },
  selectedLevelButton: {
    backgroundColor: colors.primary,
  },
  levelButtonText: {
    fontSize: 14,
    color: colors.textSecondary,
    fontWeight: "500",
  },
  selectedLevelText: {
    color: colors.text,
    fontWeight: "600",
  },
  disclaimer: {
    fontSize: 12,
    color: colors.textSecondary,
    textAlign: "center",
    marginTop: 20,
    lineHeight: 16,
  },
};

export default LoginScreen;
