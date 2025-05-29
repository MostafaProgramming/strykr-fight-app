import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Switch, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../constants/colors';
import { screenStyles } from '../styles/screenStyles';

const SettingsScreen = ({ onBack }) => {
  const [notifications, setNotifications] = useState({
    classReminders: true,
    bookingConfirmations: true,
    weeklyProgress: false,
    promotions: true,
  });

  const [preferences, setPreferences] = useState({
    autoCheckIn: false,
    showDifficulty: true,
    darkMode: true,
  });

  const toggleNotification = (key) => {
    setNotifications(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const togglePreference = (key) => {
    setPreferences(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const handleDataExport = () => {
    Alert.alert(
      'Export Data',
      'Your training data will be exported as a PDF report.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Export', onPress: () => Alert.alert('Success', 'Data exported successfully!') }
      ]
    );
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'Delete Account',
      'This action cannot be undone. All your data will be permanently deleted.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: () => Alert.alert('Account Deleted', 'Your account has been deleted.')
        }
      ]
    );
  };

  const SettingItem = ({ icon, title, subtitle, onPress, rightComponent, hasArrow = false }) => (
    <TouchableOpacity 
      style={screenStyles.settingItem} 
      onPress={onPress}
      disabled={!onPress && !hasArrow}
    >
      <View style={screenStyles.settingLeft}>
        <View style={screenStyles.settingIcon}>
          <Ionicons name={icon} size={20} color={colors.primary} />
        </View>
        <View style={screenStyles.settingContent}>
          <Text style={screenStyles.settingTitle}>{title}</Text>
          {subtitle && <Text style={screenStyles.settingSubtitle}>{subtitle}</Text>}
        </View>
      </View>
      
      <View style={screenStyles.settingRight}>
        {rightComponent}
        {hasArrow && <Ionicons name="chevron-forward" size={16} color={colors.textSecondary} />}
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={screenStyles.container}>
      {/* Header */}
      <View style={screenStyles.screenHeader}>
        <TouchableOpacity onPress={onBack}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={screenStyles.screenTitle}>Settings</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={screenStyles.content} showsVerticalScrollIndicator={false}>
        
        {/* Account Section */}
        <View style={screenStyles.settingsSection}>
          <Text style={screenStyles.sectionTitle}>Account</Text>
          
          <SettingItem
            icon="person-outline"
            title="Edit Profile"
            subtitle="Update your personal information"
            hasArrow
            onPress={() => Alert.alert('Coming Soon', 'Profile editing will be available soon!')}
          />
          
          <SettingItem
            icon="card-outline"
            title="Payment Methods"
            subtitle="Manage your payment options"
            hasArrow
            onPress={() => Alert.alert('Coming Soon', 'Payment management will be available soon!')}
          />
          
          <SettingItem
            icon="shield-checkmark-outline"
            title="Privacy & Security"
            subtitle="Control your data and privacy"
            hasArrow
            onPress={() => Alert.alert('Coming Soon', 'Privacy settings will be available soon!')}
          />
        </View>

        {/* Notifications Section */}
        <View style={screenStyles.settingsSection}>
          <Text style={screenStyles.sectionTitle}>Notifications</Text>
          
          <SettingItem
            icon="notifications-outline"
            title="Class Reminders"
            subtitle="Get notified before your classes"
            rightComponent={
              <Switch
                value={notifications.classReminders}
                onValueChange={() => toggleNotification('classReminders')}
                trackColor={{ false: colors.backgroundLight, true: colors.primary + '40' }}
                thumbColor={notifications.classReminders ? colors.primary : colors.textSecondary}
              />
            }
          />
          
          <SettingItem
            icon="checkmark-circle-outline"
            title="Booking Confirmations"
            subtitle="Confirm successful bookings"
            rightComponent={
              <Switch
                value={notifications.bookingConfirmations}
                onValueChange={() => toggleNotification('bookingConfirmations')}
                trackColor={{ false: colors.backgroundLight, true: colors.primary + '40' }}
                thumbColor={notifications.bookingConfirmations ? colors.primary : colors.textSecondary}
              />
            }
          />
          
          <SettingItem
            icon="bar-chart-outline"
            title="Weekly Progress"
            subtitle="Weekly training summaries"
            rightComponent={
              <Switch
                value={notifications.weeklyProgress}
                onValueChange={() => toggleNotification('weeklyProgress')}
                trackColor={{ false: colors.backgroundLight, true: colors.primary + '40' }}
                thumbColor={notifications.weeklyProgress ? colors.primary : colors.textSecondary}
              />
            }
          />
          
          <SettingItem
            icon="megaphone-outline"
            title="Promotions & Events"
            subtitle="Special offers and gym events"
            rightComponent={
              <Switch
                value={notifications.promotions}
                onValueChange={() => toggleNotification('promotions')}
                trackColor={{ false: colors.backgroundLight, true: colors.primary + '40' }}
                thumbColor={notifications.promotions ? colors.primary : colors.textSecondary}
              />
            }
          />
        </View>

        {/* App Preferences */}
        <View style={screenStyles.settingsSection}>
          <Text style={screenStyles.sectionTitle}>App Preferences</Text>
          
          <SettingItem
            icon="qr-code-outline"
            title="Auto Check-in"
            subtitle="Automatically check in when near gym"
            rightComponent={
              <Switch
                value={preferences.autoCheckIn}
                onValueChange={() => togglePreference('autoCheckIn')}
                trackColor={{ false: colors.backgroundLight, true: colors.primary + '40' }}
                thumbColor={preferences.autoCheckIn ? colors.primary : colors.textSecondary}
              />
            }
          />
          
          <SettingItem
            icon="layers-outline"
            title="Show Class Difficulty"
            subtitle="Display difficulty badges on classes"
            rightComponent={
              <Switch
                value={preferences.showDifficulty}
                onValueChange={() => togglePreference('showDifficulty')}
                trackColor={{ false: colors.backgroundLight, true: colors.primary + '40' }}
                thumbColor={preferences.showDifficulty ? colors.primary : colors.textSecondary}
              />
            }
          />
          
          <SettingItem
            icon="moon-outline"
            title="Dark Mode"
            subtitle="Use dark theme throughout the app"
            rightComponent={
              <Switch
                value={preferences.darkMode}
                onValueChange={() => togglePreference('darkMode')}
                trackColor={{ false: colors.backgroundLight, true: colors.primary + '40' }}
                thumbColor={preferences.darkMode ? colors.primary : colors.textSecondary}
              />
            }
          />
        </View>

        {/* Support Section */}
        <View style={screenStyles.settingsSection}>
          <Text style={screenStyles.sectionTitle}>Support</Text>
          
          <SettingItem
            icon="help-circle-outline"
            title="Help Center"
            subtitle="Get help and find answers"
            hasArrow
            onPress={() => Alert.alert('Help', 'Contact us at help@8limbsmuaythai.com')}
          />
          
          <SettingItem
            icon="chatbubble-outline"
            title="Contact Support"
            subtitle="Get in touch with our team"
            hasArrow
            onPress={() => Alert.alert('Contact', 'Call us at +44 123 456 7890 or visit the gym!')}
          />
          
          <SettingItem
            icon="star-outline"
            title="Rate the App"
            subtitle="Help us improve with your feedback"
            hasArrow
            onPress={() => Alert.alert('Thank You!', 'We appreciate your feedback!')}
          />
          
          <SettingItem
            icon="information-circle-outline"
            title="About"
            subtitle="App version and information"
            hasArrow
            onPress={() => Alert.alert('8 Limbs Muay Thai', 'Version 1.0.0\nBuilt with ❤️ for warriors')}
          />
        </View>

        {/* Data & Privacy */}
        <View style={screenStyles.settingsSection}>
          <Text style={screenStyles.sectionTitle}>Data & Privacy</Text>
          
          <SettingItem
            icon="download-outline"
            title="Export My Data"
            subtitle="Download your training data"
            hasArrow
            onPress={handleDataExport}
          />
          
          <SettingItem
            icon="document-text-outline"
            title="Terms of Service"
            subtitle="Read our terms and conditions"
            hasArrow
            onPress={() => Alert.alert('Terms', 'Terms of Service will open in browser')}
          />
          
          <SettingItem
            icon="lock-closed-outline"
            title="Privacy Policy"
            subtitle="How we protect your data"
            hasArrow
            onPress={() => Alert.alert('Privacy', 'Privacy Policy will open in browser')}
          />
        </View>

        {/* Danger Zone */}
        <View style={screenStyles.settingsSection}>
          <Text style={[screenStyles.sectionTitle, { color: colors.primary }]}>Danger Zone</Text>
          
          <SettingItem
            icon="trash-outline"
            title="Delete Account"
            subtitle="Permanently delete your account and data"
            onPress={handleDeleteAccount}
            rightComponent={
              <Ionicons name="warning" size={20} color={colors.primary} />
            }
          />
        </View>

        {/* App Info */}
        <View style={screenStyles.appInfo}>
          <Text style={screenStyles.appInfoText}>8 Limbs Muay Thai</Text>
          <Text style={screenStyles.appVersionText}>Version 1.0.0</Text>
          <Text style={screenStyles.appCopyright}>© 2024 8 Limbs Muay Thai. All rights reserved.</Text>
        </View>

      </ScrollView>
    </View>
  );
};

export default SettingsScreen;