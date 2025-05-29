import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../constants/colors';
import { screenStyles } from '../styles/screenStyles';

const GoalManagementScreen = ({ member, onBack, onSaveGoal }) => {
  const [selectedGoalType, setSelectedGoalType] = useState('weekly');
  const [customGoal, setCustomGoal] = useState('');
  const [selectedTarget, setSelectedTarget] = useState(5);

  const predefinedGoals = {
    weekly: [
      { id: 1, text: 'Train 3 times this week', target: 3 },
      { id: 2, text: 'Train 5 times this week', target: 5 },
      { id: 3, text: 'Train 7 times this week', target: 7 },
      { id: 4, text: 'Complete 2 advanced classes', target: 2 },
      { id: 5, text: 'Try a new class type', target: 1 },
    ],
    monthly: [
      { id: 6, text: 'Train 20 times this month', target: 20 },
      { id: 7, text: 'Master 3 new techniques', target: 3 },
      { id: 8, text: 'Attend sparring sessions', target: 4 },
      { id: 9, text: 'Improve flexibility routine', target: 12 },
      { id: 10, text: 'Complete conditioning classes', target: 8 },
    ],
    fitness: [
      { id: 11, text: 'Lose 5 pounds', target: 5 },
      { id: 12, text: 'Increase stamina', target: 1 },
      { id: 13, text: 'Perfect my form', target: 1 },
      { id: 14, text: 'Build core strength', target: 1 },
      { id: 15, text: 'Improve balance', target: 1 },
    ]
  };

  const handleSaveGoal = (goalText, target) => {
    const goalData = {
      text: goalText,
      target: target,
      current: 0,
      type: selectedGoalType,
      dateSet: new Date().toISOString(),
    };
    
    onSaveGoal(goalData);
    Alert.alert(
      'Goal Set! 🎯',
      `Your ${selectedGoalType} goal has been set: "${goalText}"`,
      [{ text: 'OK', onPress: () => onBack() }]
    );
  };

  const GoalCard = ({ goal }) => (
    <TouchableOpacity
      style={styles.goalCard}
      onPress={() => handleSaveGoal(goal.text, goal.target)}
    >
      <View style={styles.goalContent}>
        <Text style={styles.goalText}>{goal.text}</Text>
        <View style={styles.goalMeta}>
          <Ionicons name="target" size={16} color={colors.primary} />
          <Text style={styles.goalTarget}>Target: {goal.target}</Text>
        </View>
      </View>
      <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
    </TouchableOpacity>
  );

  const GoalTypeTab = ({ type, label, isActive, onPress }) => (
    <TouchableOpacity
      style={[styles.goalTypeTab, isActive && styles.activeGoalTypeTab]}
      onPress={onPress}
    >
      <Text style={[styles.goalTypeText, isActive && styles.activeGoalTypeText]}>
        {label}
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
        <Text style={screenStyles.screenTitle}>Goal Management</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={screenStyles.content} showsVerticalScrollIndicator={false}>
        
        {/* Current Goal Display */}
        <View style={screenStyles.settingsSection}>
          <Text style={screenStyles.sectionTitle}>Current Goal</Text>
          
          <View style={styles.currentGoalCard}>
            <View style={styles.currentGoalHeader}>
              <Ionicons name="target" size={24} color={colors.primary} />
              <Text style={styles.currentGoalTitle}>Weekly Goal</Text>
            </View>
            <Text style={styles.currentGoalText}>{member.nextGoal}</Text>
            <View style={styles.goalProgress}>
              <View style={styles.progressBar}>
                <View style={[styles.progressFill, { width: '60%' }]} />
              </View>
              <Text style={styles.goalProgressText}>3 of 5 sessions completed</Text>
            </View>
          </View>
        </View>

        {/* Goal Type Selection */}
        <View style={screenStyles.settingsSection}>
          <Text style={screenStyles.sectionTitle}>Set New Goal</Text>
          
          <View style={styles.goalTypeTabs}>
            <GoalTypeTab
              type="weekly"
              label="Weekly"
              isActive={selectedGoalType === 'weekly'}
              onPress={() => setSelectedGoalType('weekly')}
            />
            <GoalTypeTab
              type="monthly"
              label="Monthly"
              isActive={selectedGoalType === 'monthly'}
              onPress={() => setSelectedGoalType('monthly')}
            />
            <GoalTypeTab
              type="fitness"
              label="Fitness"
              isActive={selectedGoalType === 'fitness'}
              onPress={() => setSelectedGoalType('fitness')}
            />
          </View>
        </View>

        {/* Predefined Goals */}
        <View style={screenStyles.settingsSection}>
          <Text style={screenStyles.sectionTitle}>
            {selectedGoalType.charAt(0).toUpperCase() + selectedGoalType.slice(1)} Goals
          </Text>
          
          {predefinedGoals[selectedGoalType].map((goal) => (
            <GoalCard key={goal.id} goal={goal} />
          ))}
        </View>

        {/* Custom Goal */}
        <View style={screenStyles.settingsSection}>
          <Text style={screenStyles.sectionTitle}>Create Custom Goal</Text>
          
          <View style={styles.customGoalCard}>
            <Text style={screenStyles.fieldLabel}>Goal Description</Text>
            <TextInput
              style={screenStyles.profileInput}
              value={customGoal}
              onChangeText={setCustomGoal}
              placeholder="Enter your custom goal..."
              placeholderTextColor={colors.textSecondary}
              multiline
            />
            
            <Text style={screenStyles.fieldLabel}>Target Number</Text>
            <View style={styles.targetSelector}>
              {[1, 3, 5, 7, 10, 15, 20].map((num) => (
                <TouchableOpacity
                  key={num}
                  style={[
                    styles.targetButton,
                    selectedTarget === num && styles.selectedTargetButton
                  ]}
                  onPress={() => setSelectedTarget(num)}
                >
                  <Text style={[
                    styles.targetButtonText,
                    selectedTarget === num && styles.selectedTargetButtonText
                  ]}>
                    {num}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            
            <TouchableOpacity
              style={[
                screenStyles.primaryButton,
                (!customGoal.trim()) && styles.disabledButton
              ]}
              onPress={() => customGoal.trim() && handleSaveGoal(customGoal, selectedTarget)}
              disabled={!customGoal.trim()}
            >
              <Text style={screenStyles.primaryButtonText}>Set Custom Goal</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Goal History */}
        <View style={screenStyles.settingsSection}>
          <Text style={screenStyles.sectionTitle}>Recent Goals</Text>
          
          <View style={styles.goalHistoryItem}>
            <View style={styles.goalHistoryContent}>
              <Text style={styles.goalHistoryText}>Train 3 times this week</Text>
              <Text style={styles.goalHistoryDate}>Completed • Last week</Text>
            </View>
            <View style={styles.completedBadge}>
              <Ionicons name="checkmark-circle" size={20} color={colors.success} />
            </View>
          </View>
          
          <View style={styles.goalHistoryItem}>
            <View style={styles.goalHistoryContent}>
              <Text style={styles.goalHistoryText}>Master pad work combinations</Text>
              <Text style={styles.goalHistoryDate}>Completed • 2 weeks ago</Text>
            </View>
            <View style={styles.completedBadge}>
              <Ionicons name="checkmark-circle" size={20} color={colors.success} />
            </View>
          </View>
          
          <View style={styles.goalHistoryItem}>
            <View style={styles.goalHistoryContent}>
              <Text style={styles.goalHistoryText}>Attend sparring class</Text>
              <Text style={styles.goalHistoryDate}>Not completed • 3 weeks ago</Text>
            </View>
            <View style={styles.incompleteBadge}>
              <Ionicons name="close-circle" size={20} color={colors.textSecondary} />
            </View>
          </View>
        </View>

      </ScrollView>
    </View>
  );
};

const styles = {
  goalCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.cardBackground,
    borderRadius: 12,
    padding: 15,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  goalContent: {
    flex: 1,
  },
  goalText: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.text,
    marginBottom: 5,
  },
  goalMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  goalTarget: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  goalTypeTabs: {
    flexDirection: 'row',
    backgroundColor: colors.backgroundLight,
    borderRadius: 12,
    padding: 4,
  },
  goalTypeTab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 8,
  },
  activeGoalTypeTab: {
    backgroundColor: colors.primary,
  },
  goalTypeText: {
    fontSize: 14,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  activeGoalTypeText: {
    color: colors.text,
    fontWeight: '600',
  },
  currentGoalCard: {
    backgroundColor: colors.cardBackground,
    borderRadius: 15,
    padding: 20,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  currentGoalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    gap: 10,
  },
  currentGoalTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text,
  },
  currentGoalText: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 15,
  },
  goalProgress: {
    marginTop: 10,
  },
  progressBar: {
    height: 6,
    backgroundColor: colors.backgroundLight,
    borderRadius: 3,
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: 3,
  },
  goalProgressText: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  customGoalCard: {
    backgroundColor: colors.cardBackground,
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  targetSelector: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 20,
  },
  targetButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.backgroundLight,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  selectedTargetButton: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  targetButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  selectedTargetButtonText: {
    color: colors.text,
  },
  disabledButton: {
    opacity: 0.5,
  },
  goalHistoryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.cardBackground,
    borderRadius: 12,
    padding: 15,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  goalHistoryContent: {
    flex: 1,
  },
  goalHistoryText: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.text,
    marginBottom: 4,
  },
  goalHistoryDate: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  completedBadge: {
    padding: 5,
  },
  incompleteBadge: {
    padding: 5,
  },
};

export default GoalManagementScreen;