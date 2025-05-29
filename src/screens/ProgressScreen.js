import React from 'react';
import { View, Text, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../constants/colors';
import { mockAchievements } from '../data/mockData';
import { screenStyles } from '../styles/screenStyles';

const ProgressScreen = ({ member }) => {
  return (
    <ScrollView style={screenStyles.content} showsVerticalScrollIndicator={false}>
      {/* Progress Overview */}
      <View style={screenStyles.progressOverview}>
        <Text style={screenStyles.sectionTitle}>Your Progress</Text>
        
        <View style={screenStyles.progressCard}>
          <Text style={screenStyles.progressCardTitle}>Training Journey</Text>
          <View style={screenStyles.progressStats}>
            <View style={screenStyles.progressStat}>
              <Text style={screenStyles.progressNumber}>{member.classesAttended}</Text>
              <Text style={screenStyles.progressLabel}>Total Classes</Text>
            </View>
            <View style={screenStyles.progressStat}>
              <Text style={screenStyles.progressNumber}>{member.currentStreak}</Text>
              <Text style={screenStyles.progressLabel}>Current Streak</Text>
            </View>
            <View style={screenStyles.progressStat}>
              <Text style={screenStyles.progressNumber}>3</Text>
              <Text style={screenStyles.progressLabel}>Months Active</Text>
            </View>
          </View>
        </View>
      </View>

      {/* Achievements */}
      <View style={screenStyles.section}>
        <Text style={screenStyles.sectionTitle}>Achievements</Text>
        {mockAchievements.map((achievement) => (
          <View key={achievement.id} style={[
            screenStyles.achievementCard,
            !achievement.earned && screenStyles.lockedAchievement
          ]}>
            <Ionicons
              name={achievement.earned ? "trophy" : "lock-closed"}
              size={24}
              color={achievement.earned ? colors.primary : colors.textSecondary}
            />
            <View style={screenStyles.achievementContent}>
              <Text style={[
                screenStyles.achievementTitle,
                !achievement.earned && screenStyles.lockedText
              ]}>
                {achievement.title}
              </Text>
              <Text style={[
                screenStyles.achievementDesc,
                !achievement.earned && screenStyles.lockedText
              ]}>
                {achievement.desc}
              </Text>
            </View>
          </View>
        ))}
      </View>
    </ScrollView>
  );
};

export default ProgressScreen;