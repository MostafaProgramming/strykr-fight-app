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
  Image,
  ActivityIndicator,
} from "react-native";
import { colors } from "../constants/colors";
import { loginStyles } from "../styles/loginStyles";
import authService from "../services/authService";

const LoginScreen = ({ onLogin }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);

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
        // Sign up new user
        result = await authService.signUp(email, password, {
          firstName,
          lastName,
          name: `${firstName} ${lastName}`,
        });
      } else {
        // Sign in existing user
        result = await authService.signIn(email, password);
      }

      if (result.success) {
        Alert.alert(
          "Success!",
          isSignUp
            ? "Welcome to 8 Limbs Muay Thai! Your account has been created."
            : "Welcome back, warrior!",
          [
            {
              text: "Continue",
              onPress: () => {
                // Transform Firebase user to match your existing app structure
                const userData = {
                  name:
                    result.user.name ||
                    result.user.displayName ||
                    `${firstName} ${lastName}` ||
                    "Member",
                  email: result.user.email,
                  uid: result.user.uid,
                  memberSince: result.user.memberSince || "Just now",
                  classesAttended: result.user.classesAttended || 0,
                  currentStreak: result.user.currentStreak || 0,
                  nextGoal: result.user.nextGoal || "Complete your first class",
                  membership: result.user.membership || "Basic",
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
          {/* 8 Limbs Logo */}
          <Image
            source={require("../../assets/8-limbs-logo.png")}
            style={loginStyles.logo}
            resizeMode="contain"
          />

          <Text style={loginStyles.logoText}>8 LIMBS</Text>
          <Text style={loginStyles.logoSubtext}>MUAY THAI</Text>
          <Text style={loginStyles.tagline}>Unleash Your Warrior Spirit</Text>
        </View>

        <View style={loginStyles.formSection}>
          <Text style={loginStyles.formTitle}>
            {isSignUp ? "Join Our Community" : "Welcome Back, Warrior"}
          </Text>

          {isSignUp && (
            <>
              <TextInput
                style={loginStyles.input}
                placeholder="First Name"
                placeholderTextColor={colors.textSecondary}
                value={firstName}
                onChangeText={setFirstName}
                autoCapitalize="words"
              />

              <TextInput
                style={loginStyles.input}
                placeholder="Last Name"
                placeholderTextColor={colors.textSecondary}
                value={lastName}
                onChangeText={setLastName}
                autoCapitalize="words"
              />
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
                {isSignUp ? "START YOUR JOURNEY" : "ENTER THE DOJO"}
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
            }}
          >
            <Text style={loginStyles.switchText}>
              {isSignUp ? "Already a member? Sign In" : "New warrior? Join Us"}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default LoginScreen;
