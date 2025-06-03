import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "../constants/colors";
import { screenStyles } from "../styles/screenStyles";

const LogTrainingScreen = ({ member, onBack }) => {
  const [selectedType, setSelectedType] = useState("bag work");
  const [duration, setDuration] = useState("30");
  const [rounds, setRounds] = useState("6");
  const [intensity, setIntensity] = useState(7);
  const [notes, setNotes] = useState("");
  const [isLogging, setIsLogging] = useState(false);

  const trainingTypes = [
    {
      id: "bag work",
      label: "Bag Work",
      icon: "fitness",
      color: colors.bagWork,
    },
    {
      id: "pad work",
      label: "Pad Work",
      icon: "hand-left-outline",
      color: colors.padWork,
    },
    {
      id: "sparring",
      label: "Sparring",
      icon: "people",
      color: colors.sparring,
    },
    { id: "drills", label: "Drills", icon: "repeat", color: colors.drills },
    {
      id: "strength",
      label: "Strength",
      icon: "barbell-outline",
      color: colors.strength,
    },
    {
      id: "recovery",
      label: "Recovery",
      icon: "leaf-outline",
      color: colors.recovery,
    },
  ];

  const intensityLabels = {
    1: "Very Light",
    2: "Light",
    3: "Light",
    4: "Moderate",
    5: "Moderate",
    6: "Somewhat Hard",
    7: "Hard",
    8: "Hard",
    9: "Very Hard",
    10: "Maximum",
  };

  const getIntensityColor = (intensity) => {
    if (intensity <= 3) return colors.intensityLow;
    if (intensity <= 6) return colors.intensityMedium;
    if (intensity <= 8) return colors.intensityHigh;
    return colors.intensityMax;
  };

  const handleLogSession = async () => {
    if (!duration || duration === "0") {
      Alert.alert("Error", "Please enter a valid duration");
      return;
    }

    setIsLogging(true);

    // Simulate API call
    setTimeout(() => {
      setIsLogging(false);
      Alert.alert(
        "Session Logged! 🥊",
        `Your ${selectedType} session has been recorded successfully.`,
        [
          {
            text: "View Progress",
            onPress: () => {
              // Navigate to progress or training screen
              onBack();
            },
          },
          {
            text: "Log Another",
            onPress: () => {
              // Reset form
              setDuration("30");
              setRounds("6");
              setIntensity(7);
              setNotes("");
            },
          },
        ],
      );
    }, 1500);
  };

  const TrainingTypeButton = ({ type }) => (
    <TouchableOpacity
      style={[
        styles.typeButton,
        selectedType === type.id && styles.selectedTypeButton,
        { borderColor: type.color + "40" },
        selectedType === type.id && { backgroundColor: type.color + "20" },
      ]}
      onPress={() => setSelectedType(type.id)}
    >
      <View style={[styles.typeIcon, { backgroundColor: type.color + "20" }]}>
        <Ionicons name={type.icon} size={24} color={type.color} />
      </View>
      <Text
        style={[
          styles.typeLabel,
          selectedType === type.id && styles.selectedTypeLabel,
        ]}
      >
        {type.label}
      </Text>
    </TouchableOpacity>
  );

  return (
    <View style={screenStyles.container}>
      {/* Header */}
      <View style={screenStyles.screenHeader}>
        <TouchableOpacity onPress={onBack}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={screenStyles.screenTitle}>Log Training</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView
        style={screenStyles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Training Type Selection */}
        <View style={screenStyles.section}>
          <Text style={screenStyles.sectionTitle}>Training Type</Text>
          <View style={styles.typeGrid}>
            {trainingTypes.map((type) => (
              <TrainingTypeButton key={type.id} type={type} />
            ))}
          </View>
        </View>

        {/* Duration and Rounds */}
        <View style={screenStyles.section}>
          <Text style={screenStyles.sectionTitle}>Session Details</Text>

          <View style={styles.inputRow}>
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Duration (minutes)</Text>
              <TextInput
                style={styles.numberInput}
                value={duration}
                onChangeText={setDuration}
                keyboardType="numeric"
                placeholder="30"
                placeholderTextColor={colors.textSecondary}
              />
            </View>

            {selectedType !== "recovery" && selectedType !== "strength" && (
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Rounds</Text>
                <TextInput
                  style={styles.numberInput}
                  value={rounds}
                  onChangeText={setRounds}
                  keyboardType="numeric"
                  placeholder="6"
                  placeholderTextColor={colors.textSecondary}
                />
              </View>
            )}
          </View>
        </View>

        {/* Intensity (RPE) */}
        <View style={screenStyles.section}>
          <Text style={screenStyles.sectionTitle}>
            Intensity (RPE - Rate of Perceived Exertion)
          </Text>

          <View style={styles.intensityContainer}>
            <View style={styles.intensityHeader}>
              <Text style={styles.intensityValue}>{intensity}</Text>
              <Text
                style={[
                  styles.intensityLabel,
                  { color: getIntensityColor(intensity) },
                ]}
              >
                {intensityLabels[intensity]}
              </Text>
            </View>

            <View style={styles.intensitySelector}>
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((value) => (
                <TouchableOpacity
                  key={value}
                  style={[
                    styles.intensityButton,
                    intensity === value && styles.selectedIntensityButton,
                    {
                      backgroundColor:
                        getIntensityColor(value) +
                        (intensity === value ? "40" : "10"),
                    },
                  ]}
                  onPress={() => setIntensity(value)}
                >
                  <Text
                    style={[
                      styles.intensityButtonText,
                      intensity === value && styles.selectedIntensityButtonText,
                      {
                        color:
                          intensity === value
                            ? colors.text
                            : getIntensityColor(value),
                      },
                    ]}
                  >
                    {value}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.rpeScale}>
              <Text style={styles.rpeScaleText}>1 - Very Light</Text>
              <Text style={styles.rpeScaleText}>10 - Maximum</Text>
            </View>
          </View>
        </View>

        {/* Notes */}
        <View style={screenStyles.section}>
          <Text style={screenStyles.sectionTitle}>Notes (Optional)</Text>
          <TextInput
            style={styles.notesInput}
            value={notes}
            onChangeText={setNotes}
            placeholder="How did the session go? Any technique focus, achievements, or observations..."
            placeholderTextColor={colors.textSecondary}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />
        </View>

        {/* Session Preview */}
        <View style={styles.previewContainer}>
          <Text style={styles.previewTitle}>Session Preview</Text>
          <View style={styles.previewCard}>
            <View style={styles.previewHeader}>
              <View
                style={[
                  styles.previewIcon,
                  {
                    backgroundColor:
                      trainingTypes.find((t) => t.id === selectedType)?.color +
                      "20",
                  },
                ]}
              >
                <Ionicons
                  name={
                    trainingTypes.find((t) => t.id === selectedType)?.icon ||
                    "fitness"
                  }
                  size={20}
                  color={
                    trainingTypes.find((t) => t.id === selectedType)?.color ||
                    colors.primary
                  }
                />
              </View>
              <View style={styles.previewInfo}>
                <Text style={styles.previewType}>
                  {trainingTypes.find((t) => t.id === selectedType)?.label}
                </Text>
                <Text style={styles.previewDate}>
                  {new Date().toLocaleDateString("en-US", {
                    weekday: "long",
                    month: "short",
                    day: "numeric",
                  })}
                </Text>
              </View>
              <View
                style={[
                  styles.previewIntensity,
                  { backgroundColor: getIntensityColor(intensity) + "20" },
                ]}
              >
                <Text
                  style={[
                    styles.previewIntensityText,
                    { color: getIntensityColor(intensity) },
                  ]}
                >
                  RPE {intensity}
                </Text>
              </View>
            </View>

            <View style={styles.previewDetails}>
              <View style={styles.previewDetail}>
                <Ionicons name="timer" size={16} color={colors.textSecondary} />
                <Text style={styles.previewDetailText}>{duration} min</Text>
              </View>
              {rounds &&
                selectedType !== "recovery" &&
                selectedType !== "strength" && (
                  <View style={styles.previewDetail}>
                    <Ionicons
                      name="repeat"
                      size={16}
                      color={colors.textSecondary}
                    />
                    <Text style={styles.previewDetailText}>
                      {rounds} rounds
                    </Text>
                  </View>
                )}
            </View>

            {notes && <Text style={styles.previewNotes}>{notes}</Text>}
          </View>
        </View>

        {/* Log Button */}
        <TouchableOpacity
          style={[
            screenStyles.primaryButton,
            { marginTop: 30, marginBottom: 30 },
            isLogging && { opacity: 0.7 },
          ]}
          onPress={handleLogSession}
          disabled={isLogging}
        >
          <Text style={screenStyles.primaryButtonText}>
            {isLogging ? "Logging Session..." : "Log Training Session"}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

const styles = {
  typeGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  typeButton: {
    width: "48%",
    backgroundColor: colors.cardBackground,
    borderRadius: 15,
    padding: 20,
    alignItems: "center",
    borderWidth: 2,
    borderColor: colors.cardBorder,
  },
  selectedTypeButton: {
    borderWidth: 2,
  },
  typeIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
  },
  typeLabel: {
    fontSize: 14,
    fontWeight: "500",
    color: colors.textSecondary,
    textAlign: "center",
  },
  selectedTypeLabel: {
    color: colors.text,
    fontWeight: "600",
  },
  inputRow: {
    flexDirection: "row",
    gap: 15,
  },
  inputContainer: {
    flex: 1,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: "500",
    color: colors.text,
    marginBottom: 8,
  },
  numberInput: {
    backgroundColor: colors.cardBackground,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    borderRadius: 12,
    padding: 15,
    color: colors.text,
    fontSize: 16,
    textAlign: "center",
  },
  intensityContainer: {
    backgroundColor: colors.cardBackground,
    borderRadius: 15,
    padding: 20,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  intensityHeader: {
    alignItems: "center",
    marginBottom: 20,
  },
  intensityValue: {
    fontSize: 36,
    fontWeight: "bold",
    color: colors.text,
  },
  intensityLabel: {
    fontSize: 16,
    fontWeight: "500",
    marginTop: 5,
  },
  slider: {
    width: "100%",
    height: 40,
    marginBottom: 15,
  },
  intensitySelector: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 15,
    justifyContent: "center",
  },
  intensityButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "transparent",
  },
  selectedIntensityButton: {
    borderColor: colors.text,
  },
  intensityButtonText: {
    fontSize: 16,
    fontWeight: "600",
  },
  selectedIntensityButtonText: {
    fontWeight: "bold",
  },
  rpeScale: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  rpeScaleText: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  notesInput: {
    backgroundColor: colors.cardBackground,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    borderRadius: 12,
    padding: 15,
    color: colors.text,
    fontSize: 16,
    minHeight: 100,
  },
  previewContainer: {
    marginTop: 20,
  },
  previewTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: colors.text,
    marginBottom: 15,
  },
  previewCard: {
    backgroundColor: colors.cardBackground,
    borderRadius: 15,
    padding: 20,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  previewHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
  },
  previewIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 15,
  },
  previewInfo: {
    flex: 1,
  },
  previewType: {
    fontSize: 16,
    fontWeight: "bold",
    color: colors.text,
    marginBottom: 4,
  },
  previewDate: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  previewIntensity: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  previewIntensityText: {
    fontSize: 12,
    fontWeight: "600",
  },
  previewDetails: {
    flexDirection: "row",
    gap: 20,
    marginBottom: 10,
  },
  previewDetail: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  previewDetailText: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  previewNotes: {
    fontSize: 14,
    color: colors.text,
    fontStyle: "italic",
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: colors.cardBorder,
  },
};

export default LogTrainingScreen;
