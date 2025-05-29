import React from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../constants/colors';
import { screenStyles } from '../styles/screenStyles';

const ProfileOption = ({ icon, title, onPress }) => (
  <TouchableOpacity style={screenStyles.profileOption} onPress={onPress}>
    <Ionicons name={icon} size={20} color={colors.textSecondary} />
    <Text style={screenStyles.profileOptionText}>{title}</Text>
    <Ionicons name="chevron-forward" size={16} color={colors.textSecondary} />
  </TouchableOpacity>
);

const ProfileScreen = ({ member, onLogout, onNavigate }) => {
  return (
    <ScrollView style={screenStyles.content} showsVerticalScrollIndicator={false}>
      {/* Profile Header */}
      <View style={screenStyles.profileHeader}>
        <View style={screenStyles.avatarLarge}>
          <Text style={screenStyles.avatarText}>{member.avatar}</Text>
        </View>
        <Text style={screenStyles.profileName}>{member.name}</Text>
        <Text style={screenStyles.profileEmail}>{member.email}</Text>
        <View style={screenStyles.membershipBadge}>
          <Text style={screenStyles.membershipText}>{member.membership} Member</Text>
        </View>
      </View>

      {/* Profile Options */}
      <View style={screenStyles.section}>
        <ProfileOption 
          icon="person" 
          title="Edit Profile" 
          onPress={() => onNavigate('editprofile')} 
        />
        <ProfileOption 
          icon="calendar" 
          title="My Bookings" 
          onPress={() => onNavigate('mybookings')} 
        />
        <ProfileOption 
          icon="card" 
          title="Payment Methods" 
          onPress={() => onNavigate('paymentmethods')} 
        />
        <ProfileOption 
          icon="notifications" 
          title="Notifications" 
          onPress={() => onNavigate('settings')} 
        />
        <ProfileOption 
          icon="help-circle" 
          title="Help & Support" 
          onPress={() => onNavigate('helpsupport')} 
        />
        <ProfileOption 
          icon="settings" 
          title="Settings" 
          onPress={() => onNavigate('settings')} 
        />
        
        <TouchableOpacity style={screenStyles.logoutButton} onPress={onLogout}>
          <Ionicons name="log-out" size={20} color={colors.primary} />
          <Text style={screenStyles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

export default ProfileScreen;