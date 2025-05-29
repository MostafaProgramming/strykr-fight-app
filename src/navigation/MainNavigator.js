import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../constants/colors';
import { navigationStyles } from '../styles/navigationStyles';

// Import screens
import HomeScreen from '../screens/HomeScreen';
import ClassesScreen from '../screens/ClassesScreen';
import CheckInScreen from '../screens/CheckInScreen';
import ProgressScreen from '../screens/ProgressScreen';
import ProfileScreen from '../screens/ProfileScreen';
import MyBookingsScreen from '../screens/MyBookingsScreen';
import SettingsScreen from '../screens/SettingsScreen';
import EditProfileScreen from '../screens/EditProfileScreen';
import PaymentMethodsScreen from '../screens/PaymentMethodsScreen';
import HelpSupportScreen from '../screens/HelpSupportScreen';
import GoalManagementScreen from '../screens/GoalManagementScreen';

// Header Component
const Header = ({ member, currentScreen, onBack, onProfilePress }) => (
  <View style={navigationStyles.header}>
    {currentScreen !== 'home' && currentScreen !== 'classes' && currentScreen !== 'checkin' && currentScreen !== 'progress' && currentScreen !== 'profile' ? (
      <TouchableOpacity onPress={onBack} style={navigationStyles.backButton}>
        <Ionicons name="arrow-back" size={24} color={colors.text} />
      </TouchableOpacity>
    ) : (
      <View style={navigationStyles.headerBrand}>
        <Image 
          source={require('../../assets/8-limbs-logo.png')} 
          style={navigationStyles.headerLogo}
          resizeMode="contain"
        />
        <View>
          <Text style={navigationStyles.headerTitle}>8 Limbs Muay Thai</Text>
          <Text style={navigationStyles.headerSubtitle}>Unleash Your Warrior Spirit</Text>
        </View>
      </View>
    )}
    
    {(currentScreen === 'home' || currentScreen === 'classes' || currentScreen === 'checkin' || currentScreen === 'progress' || currentScreen === 'profile') && (
      <TouchableOpacity 
        style={navigationStyles.profileButton}
        onPress={onProfilePress}
      >
        <View style={navigationStyles.avatarSmall}>
          <Text style={navigationStyles.avatarTextSmall}>{member.avatar}</Text>
        </View>
      </TouchableOpacity>
    )}
  </View>
);

// Bottom Navigation Component
const BottomNavigation = ({ activeTab, setActiveTab, currentScreen }) => {
  // Hide bottom nav on sub-screens
  if (currentScreen !== 'home' && currentScreen !== 'classes' && currentScreen !== 'checkin' && currentScreen !== 'progress' && currentScreen !== 'profile') {
    return null;
  }

  const tabs = [
    { id: 'home', icon: 'home', label: 'Home' },
    { id: 'classes', icon: 'calendar', label: 'Classes' },
    { id: 'checkin', icon: 'qr-code', label: 'Check In' },
    { id: 'progress', icon: 'trophy', label: 'Progress' },
    { id: 'profile', icon: 'person', label: 'Profile' },
  ];

  return (
    <View style={navigationStyles.bottomNav}>
      {tabs.map((tab) => (
        <TouchableOpacity
          key={tab.id}
          style={[navigationStyles.navTab, activeTab === tab.id && navigationStyles.activeTab]}
          onPress={() => setActiveTab(tab.id)}
        >
          <Ionicons
            name={tab.icon}
            size={24}
            color={activeTab === tab.id ? colors.primary : colors.textSecondary}
          />
          <Text style={[
            navigationStyles.navLabel,
            { color: activeTab === tab.id ? colors.primary : colors.textSecondary }
          ]}>
            {tab.label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};

const MainNavigator = ({ member, bookedClasses, onBookClass, onCancelBooking, onLogout }) => {
  const [activeTab, setActiveTab] = useState('home');
  const [currentScreen, setCurrentScreen] = useState('home');
  const [memberData, setMemberData] = useState(member);

  const navigateToScreen = (screenName) => {
    setCurrentScreen(screenName);
  };

  const goBack = () => {
    // Go back to the main tab screen
    setCurrentScreen(activeTab);
  };

  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
    setCurrentScreen(tabId);
  };

  const handleGoalUpdate = (goalData) => {
    setMemberData(prev => ({
      ...prev,
      nextGoal: goalData.text,
      goalTarget: goalData.target,
      goalCurrent: goalData.current,
    }));
  };

  const handleProfilePress = () => {
    if (currentScreen !== 'profile') {
      setActiveTab('profile');
      setCurrentScreen('profile');
    }
  };

  const renderScreen = () => {
    switch (currentScreen) {
      case 'home':
        return (
          <HomeScreen 
            member={memberData}
            bookedClasses={bookedClasses}
            onBookClass={onBookClass}
            onNavigate={navigateToScreen}
          />
        );
      case 'classes':
        return (
          <ClassesScreen 
            bookedClasses={bookedClasses}
            onBookClass={onBookClass}
          />
        );
      case 'checkin':
        return <CheckInScreen />;
      case 'progress':
        return <ProgressScreen member={memberData} />;
      case 'profile':
        return (
          <ProfileScreen 
            member={memberData}
            onLogout={onLogout}
            onNavigate={navigateToScreen}
          />
        );
      case 'mybookings':
        return (
          <MyBookingsScreen 
            bookedClasses={bookedClasses}
            onCancelBooking={onCancelBooking}
            onBack={goBack}
          />
        );
      case 'settings':
        return <SettingsScreen onBack={goBack} />;
      case 'editprofile':
        return <EditProfileScreen member={memberData} onBack={goBack} />;
      case 'paymentmethods':
        return <PaymentMethodsScreen onBack={goBack} />;
      case 'helpsupport':
        return <HelpSupportScreen onBack={goBack} />;
      case 'goalmanagement':
        return (
          <GoalManagementScreen 
            member={memberData} 
            onBack={goBack}
            onSaveGoal={handleGoalUpdate}
          />
        );
      default:
        return (
          <HomeScreen 
            member={memberData}
            bookedClasses={bookedClasses}
            onBookClass={onBookClass}
            onNavigate={navigateToScreen}
          />
        );
    }
  };

  return (
    <View style={{ flex: 1 }}>
      <Header 
        member={memberData} 
        currentScreen={currentScreen} 
        onBack={goBack}
        onProfilePress={handleProfilePress}
      />
      {renderScreen()}
      <BottomNavigation activeTab={activeTab} setActiveTab={handleTabChange} currentScreen={currentScreen} />
    </View>
  );
};

export default MainNavigator;