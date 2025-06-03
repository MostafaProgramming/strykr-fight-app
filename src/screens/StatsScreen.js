import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Dimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "../constants/colors";
import { screenStyles } from "../styles/screenStyles";

const { width } = Dimensions.get("window");

const StatsScreen = ({ member, onBack }) => {
  const [selectedPeriod, setSelectedPeriod] = useState("month");
  const [selectedStat, setSelectedStat] = useState("overview");
  const [statsData, setStatsData] = useState({});

  useEffect(() => {
    // Mock detailed stats data
    setStatsData({
      overview: {
        totalSessions: 142,
        totalHours: 104,
        totalCalories: 42800,
        avgIntensity: 7.1,
        currentStreak: 7,
        longestStreak: 21,
        favoriteType: "Bag Work",
        totalRounds: 852,
      },
      monthly: {
        sessions: [12, 15, 18, 16, 14, 19],
        intensity: [6.8, 7.2, 7.5, 7.1, 6.9, 7.4],
        duration: [8.5, 10.2, 12.1, 9.8, 8.9, 11.5],
        calories: [3200, 3800, 4200, 3900, 3600, 4100],
      },
      breakdown: {
        bagWork: { sessions: 45, hours: 33.5, avgIntensity: 7.2 },
        padWork: { sessions: 38, hours: 28.5, avgIntensity: 7.8 },
        sparring: { sessions: 25, hours: 18.7, avgIntensity: 8.5 },
        drills: { sessions: 20, hours: 15.0, avgIntensity: 6.2 },
        strength: { sessions: 14, hours: 21.0, avgIntensity: 6.8 },
      },
      timeDistribution: {
        morning: 25, // 6-12
        afternoon: 45, // 12-18
        evening: 72, // 18-24
      },
      weeklyPattern: [
        { day: "Mon", sessions: 22 },
        { day: "Tue", sessions: 25 },
        { day: "Wed", sessions: 20 },
        { day: "Thu", sessions: 18 },
        { day: "Fri", sessions: 15 },
        { day: "Sat", sessions: 28 },
        { day: "Sun", sessions: 14 },
      ],
    });
  }, []);

  const periods = [
    { id: "week", label: "Week" },
    { id: "month", label: "Month" },
    { id: "year", label: "Year" },
    { id: "all", label: "All Time" },
  ];

  const statCategories = [
    { id: "overview", label: "Overview", icon: "stats-chart" },
    { id: "trends", label: "Trends", icon: "trending-up" },
    { id: "breakdown", label: "Breakdown", icon: "pie-chart" },
    { id: "patterns", label: "Patterns", icon: "calendar" },
  ];

  const getTrainingTypeColor = (type) => {
    switch (type.toLowerCase()) {
      case "bagwork":
        return colors.bagWork;
      case "padwork":
        return colors.padWork;
      case "sparring":
        return colors.sparring;
      case "drills":
        return colors.drills;
      case "strength":
        return colors.strength;
      default:
        return colors.primary;
    }
  };

  const StatCard = ({
    title,
    value,
    subtitle,
    icon,
    color = colors.primary,
  }) => (
    <View style={styles.statCard}>
      <View style={[styles.statIcon, { backgroundColor: color + "20" }]}>
        <Ionicons name={icon} size={20} color={color} />
      </View>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statTitle}>{title}</Text>
      {subtitle && <Text style={styles.statSubtitle}>{subtitle}</Text>}
    </View>
  );

  const OverviewStats = () => (
    <View style={styles.statsGrid}>
      <StatCard
        title="Total Sessions"
        value={statsData.overview?.totalSessions}
        icon="fitness"
        color={colors.primary}
      />
      <StatCard
        title="Total Hours"
        value={`${statsData.overview?.totalHours}h`}
        icon="timer"
        color={colors.secondary}
      />
      <StatCard
        title="Calories Burned"
        value={`${(statsData.overview?.totalCalories / 1000).toFixed(1)}k`}
        icon="flame"
        color={colors.error}
      />
      <StatCard
        title="Avg Intensity"
        value={`${statsData.overview?.avgIntensity}/10`}
        icon="speedometer"
        color={colors.intensityHigh}
      />
      <StatCard
        title="Current Streak"
        value={`${statsData.overview?.currentStreak} days`}
        icon="trending-up"
        color={colors.success}
      />
      <StatCard
        title="Longest Streak"
        value={`${statsData.overview?.longestStreak} days`}
        icon="trophy"
        color={colors.warning}
      />
    </View>
  );

  const TrendsChart = () => (
    <View style={styles.chartContainer}>
      <Text style={styles.chartTitle}>Training Trends (Last 6 Months)</Text>

      {/* Simple bar chart representation */}
      <View style={styles.chartGrid}>
        <View style={styles.chartLabels}>
          <Text style={styles.chartLabel}>Sessions</Text>
          <Text style={styles.chartLabel}>Intensity</Text>
          <Text style={styles.chartLabel}>Hours</Text>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={styles.chartBars}>
            {statsData.monthly?.sessions.map((value, index) => (
              <View key={index} style={styles.barGroup}>
                <View style={styles.barContainer}>
                  <View
                    style={[
                      styles.bar,
                      {
                        height: (value / 20) * 80,
                        backgroundColor: colors.primary,
                      },
                    ]}
                  />
                  <Text style={styles.barValue}>{value}</Text>
                </View>
                <Text style={styles.barLabel}>M{index + 1}</Text>
              </View>
            ))}
          </View>
        </ScrollView>
      </View>
    </View>
  );

  const BreakdownStats = () => (
    <View style={styles.breakdownContainer}>
      <Text style={styles.breakdownTitle}>Training Type Breakdown</Text>

      {Object.entries(statsData.breakdown || {}).map(([type, data]) => (
        <View key={type} style={styles.breakdownItem}>
          <View style={styles.breakdownHeader}>
            <View
              style={[
                styles.breakdownIcon,
                { backgroundColor: getTrainingTypeColor(type) + "20" },
              ]}
            >
              <Ionicons
                name="fitness"
                size={16}
                color={getTrainingTypeColor(type)}
              />
            </View>
            <Text style={styles.breakdownType}>
              {type
                .replace(/([A-Z])/g, " $1")
                .replace(/^./, (str) => str.toUpperCase())}
            </Text>
          </View>

          <View style={styles.breakdownStats}>
            <View style={styles.breakdownStat}>
              <Text style={styles.breakdownStatValue}>{data.sessions}</Text>
              <Text style={styles.breakdownStatLabel}>Sessions</Text>
            </View>
            <View style={styles.breakdownStat}>
              <Text style={styles.breakdownStatValue}>{data.hours}h</Text>
              <Text style={styles.breakdownStatLabel}>Hours</Text>
            </View>
            <View style={styles.breakdownStat}>
              <Text style={styles.breakdownStatValue}>{data.avgIntensity}</Text>
              <Text style={styles.breakdownStatLabel}>Avg RPE</Text>
            </View>
          </View>
        </View>
      ))}
    </View>
  );

  const PatternsStats = () => (
    <View style={styles.patternsContainer}>
      {/* Weekly Pattern */}
      <View style={styles.patternSection}>
        <Text style={styles.patternTitle}>Weekly Training Pattern</Text>
        <View style={styles.weeklyChart}>
          {statsData.weeklyPattern?.map((day, index) => (
            <View key={index} style={styles.dayColumn}>
              <View
                style={[
                  styles.dayBar,
                  {
                    height: (day.sessions / 30) * 60,
                    backgroundColor: colors.primary,
                  },
                ]}
              />
              <Text style={styles.dayValue}>{day.sessions}</Text>
              <Text style={styles.dayLabel}>{day.day}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* Time Distribution */}
      <View style={styles.patternSection}>
        <Text style={styles.patternTitle}>Training Time Distribution</Text>
        <View style={styles.timeDistribution}>
          {Object.entries(statsData.timeDistribution || {}).map(
            ([time, count]) => (
              <View key={time} style={styles.timeSlot}>
                <View
                  style={[
                    styles.timeBar,
                    {
                      width: (count / 72) * 120,
                      backgroundColor:
                        time === "morning"
                          ? colors.secondary
                          : time === "afternoon"
                            ? colors.primary
                            : colors.intensityHigh,
                    },
                  ]}
                />
                <Text style={styles.timeLabel}>
                  {time.charAt(0).toUpperCase() + time.slice(1)}
                </Text>
                <Text style={styles.timeValue}>{count}</Text>
              </View>
            ),
          )}
        </View>
      </View>
    </View>
  );

  const renderContent = () => {
    switch (selectedStat) {
      case "overview":
        return <OverviewStats />;
      case "trends":
        return <TrendsChart />;
      case "breakdown":
        return <BreakdownStats />;
      case "patterns":
        return <PatternsStats />;
      default:
        return <OverviewStats />;
    }
  };

  return (
    <View style={screenStyles.container}>
      {/* Header */}
      <View style={screenStyles.screenHeader}>
        <TouchableOpacity onPress={onBack}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={screenStyles.screenTitle}>Detailed Stats</Text>
        <View style={{ width: 24 }} />
      </View>

      {/* Period Selector */}
      <View style={styles.periodContainer}>
        {periods.map((period) => (
          <TouchableOpacity
            key={period.id}
            style={[
              styles.periodButton,
              selectedPeriod === period.id && styles.activePeriodButton,
            ]}
            onPress={() => setSelectedPeriod(period.id)}
          >
            <Text
              style={[
                styles.periodText,
                selectedPeriod === period.id && styles.activePeriodText,
              ]}
            >
              {period.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Category Selector */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.categoryContainer}
      >
        {statCategories.map((category) => (
          <TouchableOpacity
            key={category.id}
            style={[
              styles.categoryButton,
              selectedStat === category.id && styles.activeCategoryButton,
            ]}
            onPress={() => setSelectedStat(category.id)}
          >
            <Ionicons
              name={category.icon}
              size={16}
              color={
                selectedStat === category.id
                  ? colors.text
                  : colors.textSecondary
              }
            />
            <Text
              style={[
                styles.categoryText,
                selectedStat === category.id && styles.activeCategoryText,
              ]}
            >
              {category.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Content */}
      <ScrollView
        style={screenStyles.content}
        showsVerticalScrollIndicator={false}
      >
        {renderContent()}
      </ScrollView>
    </View>
  );
};

const styles = {
  periodContainer: {
    flexDirection: "row",
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: colors.cardBorder,
  },
  periodButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    marginHorizontal: 4,
    backgroundColor: colors.cardBackground,
    alignItems: "center",
  },
  activePeriodButton: {
    backgroundColor: colors.primary,
  },
  periodText: {
    fontSize: 14,
    color: colors.textSecondary,
    fontWeight: "500",
  },
  activePeriodText: {
    color: colors.text,
    fontWeight: "600",
  },
  categoryContainer: {
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  categoryButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.cardBackground,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 10,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    gap: 6,
  },
  activeCategoryButton: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  categoryText: {
    color: colors.textSecondary,
    fontSize: 14,
    fontWeight: "500",
  },
  activeCategoryText: {
    color: colors.text,
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 15,
    paddingTop: 20,
  },
  statCard: {
    width: (width - 60) / 2,
    backgroundColor: colors.cardBackground,
    borderRadius: 15,
    padding: 20,
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  statIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
  },
  statValue: {
    fontSize: 20,
    fontWeight: "bold",
    color: colors.text,
    marginBottom: 4,
  },
  statTitle: {
    fontSize: 12,
    color: colors.textSecondary,
    textAlign: "center",
  },
  statSubtitle: {
    fontSize: 10,
    color: colors.textSecondary,
    textAlign: "center",
    marginTop: 2,
  },
  chartContainer: {
    backgroundColor: colors.cardBackground,
    borderRadius: 15,
    padding: 20,
    marginTop: 20,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  chartTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: colors.text,
    marginBottom: 20,
    textAlign: "center",
  },
  chartGrid: {
    flexDirection: "row",
  },
  chartLabels: {
    marginRight: 15,
  },
  chartLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: 25,
  },
  chartBars: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 10,
  },
  barGroup: {
    alignItems: "center",
  },
  barContainer: {
    height: 100,
    justifyContent: "flex-end",
    alignItems: "center",
    marginBottom: 8,
  },
  bar: {
    width: 20,
    borderRadius: 2,
    marginBottom: 4,
  },
  barValue: {
    fontSize: 10,
    color: colors.text,
    fontWeight: "600",
  },
  barLabel: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  breakdownContainer: {
    backgroundColor: colors.cardBackground,
    borderRadius: 15,
    padding: 20,
    marginTop: 20,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  breakdownTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: colors.text,
    marginBottom: 20,
  },
  breakdownItem: {
    marginBottom: 20,
  },
  breakdownHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  breakdownIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  breakdownType: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.text,
  },
  breakdownStats: {
    flexDirection: "row",
    justifyContent: "space-around",
    backgroundColor: colors.backgroundLight,
    borderRadius: 12,
    padding: 15,
  },
  breakdownStat: {
    alignItems: "center",
  },
  breakdownStatValue: {
    fontSize: 16,
    fontWeight: "bold",
    color: colors.text,
    marginBottom: 4,
  },
  breakdownStatLabel: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  patternsContainer: {
    marginTop: 20,
  },
  patternSection: {
    backgroundColor: colors.cardBackground,
    borderRadius: 15,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  patternTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: colors.text,
    marginBottom: 20,
  },
  weeklyChart: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "flex-end",
    height: 100,
  },
  dayColumn: {
    alignItems: "center",
  },
  dayBar: {
    width: 20,
    backgroundColor: colors.primary,
    borderRadius: 2,
    marginBottom: 8,
  },
  dayValue: {
    fontSize: 12,
    fontWeight: "600",
    color: colors.text,
    marginBottom: 4,
  },
  dayLabel: {
    fontSize: 10,
    color: colors.textSecondary,
  },
  timeDistribution: {
    gap: 15,
  },
  timeSlot: {
    flexDirection: "row",
    alignItems: "center",
    gap: 15,
  },
  timeBar: {
    height: 8,
    borderRadius: 4,
  },
  timeLabel: {
    fontSize: 14,
    fontWeight: "500",
    color: colors.text,
    minWidth: 80,
  },
  timeValue: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.primary,
  },
};

export default StatsScreen;
