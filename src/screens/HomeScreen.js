import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, RefreshControl, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../constants/colors';
import { mockClasses } from '../data/mockData';
import ClassCard from '../components/ClassCard';
import { screenStyles } from '../styles/screenStyles';

const HomeScreen = ({ member, bookedClasses, onBookClass, onNavigate }) => {
  const [refreshing, setRefreshing] = useState(false);
  const [greeting, setGreeting] = useState('');
  const fadeAnim = React.useRef(new Animated.Value(0)).current;

  // Set greeting based on time of day
  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) {
      setGreeting('Good Morning');
    } else if (hour < 17) {
      setGreeting('Good Afternoon');
    } else {
      setGreeting('Good Evening');
    }

    // Fade in animation
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();
  }, [fadeAnim]);

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    // Simulate refresh
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  }, []);

  const todaysClasses = mockClasses.filter(c => c.date === 'Today');
  const upcomingClass = todaysClasses.find(c => !bookedClasses.includes(c.id));
  const myBookedClasses = todaysClasses.filter(c => bookedClasses.includes(c.id));

  return (
    <ScrollView 
      style={screenStyles.content} 
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
      }
    >
      <Animated.View style={{ opacity: fadeAnim }}>
        {/* Personalized Welcome Card */}
        <View style={screenStyles.welcomeCard}>
          <Text style={screenStyles.welcomeTitle}>
            {greeting}, {member.name.split(' ')[0]}! 🥊
          </Text>
          <Text style={screenStyles.welcomeText}>
            {myBookedClasses.length > 0 
              ? `You have ${myBookedClasses.length} class${myBookedClasses.length > 1 ? 'es' : ''} booked today. Ready to train?`
              : 'Ready for your next training session? Let\'s keep building that warrior spirit.'
            }
          </Text>
        </View>

        {/* Quick Stats */}
        <View style={screenStyles.statsContainer}>
          <TouchableOpacity style={screenStyles.statCard}>
            <Text style={screenStyles.statNumber}>{member.classesAttended}</Text>
            <Text style={screenStyles.statLabel}>Classes Attended</Text>
          </TouchableOpacity>
          <TouchableOpacity style={screenStyles.statCard}>
            <Text style={screenStyles.statNumber}>{member.currentStreak}</Text>
            <Text style={screenStyles.statLabel}>Day Streak</Text>
          </TouchableOpacity>
          <TouchableOpacity style={screenStyles.statCard}>
            <Text style={screenStyles.statNumber}>{myBookedClasses.length + 2}</Text>
            <Text style={screenStyles.statLabel}>This Week</Text>
          </TouchableOpacity>
        </View>

        {/* Quick Actions */}
        <View style={screenStyles.section}>
          <Text style={screenStyles.sectionTitle}>Quick Actions</Text>
          <View style={screenStyles.quickActionsGrid}>
            <TouchableOpacity 
              style={screenStyles.actionCard}
              onPress={() => onNavigate('checkin')}
            >
              <Ionicons name="qr-code" size={28} color={colors.primary} />
              <Text style={screenStyles.actionText}>Check In</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={screenStyles.actionCard}
              onPress={() => onNavigate('mybookings')}
            >
              <Ionicons name="calendar-outline" size={28} color={colors.primary} />
              <Text style={screenStyles.actionText}>My Classes</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={screenStyles.actionCard}
              onPress={() => onNavigate('progress')}
            >
              <Ionicons name="trophy-outline" size={28} color={colors.primary} />
              <Text style={screenStyles.actionText}>Progress</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={screenStyles.actionCard}
              onPress={() => onNavigate('classes')}
            >
              <Ionicons name="people-outline" size={28} color={colors.primary} />
              <Text style={screenStyles.actionText}>All Classes</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* My Bookings Today */}
        {myBookedClasses.length > 0 && (
          <View style={screenStyles.section}>
            <Text style={screenStyles.sectionTitle}>My Classes Today</Text>
            {myBookedClasses.map((classItem) => (
              <ClassCard
                key={classItem.id}
                classItem={classItem}
                isBooked={true}
                onBook={() => onBookClass(classItem)}
                showBookedState={true}
              />
            ))}
          </View>
        )}

        {/* Next Recommended Class */}
        {upcomingClass && (
          <View style={screenStyles.section}>
            <Text style={screenStyles.sectionTitle}>Recommended for You</Text>
            <View style={screenStyles.recommendedCard}>
              <View style={screenStyles.recommendedHeader}>
                <Ionicons name="star" size={20} color={colors.primary} />
                <Text style={screenStyles.recommendedLabel}>Perfect Match</Text>
              </View>
              <ClassCard
                classItem={upcomingClass}
                isBooked={bookedClasses.includes(upcomingClass.id)}
                onBook={() => onBookClass(upcomingClass)}
                showFullDetails={true}
              />
            </View>
          </View>
        )}

        {/* Today's Remaining Classes */}
        <View style={screenStyles.section}>
          <View style={screenStyles.sectionHeader}>
            <Text style={screenStyles.sectionTitle}>Today's Classes</Text>
            <TouchableOpacity>
              <Text style={screenStyles.seeAllText}>See All</Text>
            </TouchableOpacity>
          </View>
          {todaysClasses
            .filter(c => !bookedClasses.includes(c.id))
            .slice(0, 2)
            .map((classItem) => (
              <ClassCard
                key={classItem.id}
                classItem={classItem}
                isBooked={false}
                onBook={() => onBookClass(classItem)}
              />
            ))}
        </View>

        {/* Current Goal */}
        <View style={screenStyles.goalCard}>
          <View style={screenStyles.goalHeader}>
            <Ionicons name="target" size={24} color={colors.primary} />
            <Text style={screenStyles.goalTitle}>Weekly Goal</Text>
          </View>
          <Text style={screenStyles.goalText}>{member.nextGoal}</Text>
          <View style={screenStyles.progressBar}>
            <View style={[screenStyles.progressFill, { width: '60%' }]} />
          </View>
          <Text style={screenStyles.progressText}>3 of 5 sessions completed this week</Text>
          
          <TouchableOpacity 
            style={screenStyles.goalButton}
            onPress={() => onNavigate('goalmanagement')}
          >
            <Text style={screenStyles.goalButtonText}>Update Goal</Text>
          </TouchableOpacity>
        </View>

        {/* Weekly Schedule Preview */}
        <View style={screenStyles.section}>
          <Text style={screenStyles.sectionTitle}>This Week's Highlights</Text>
          <View style={screenStyles.weeklyHighlights}>
            <View style={screenStyles.highlightItem}>
              <View style={screenStyles.highlightIcon}>
                <Ionicons name="flash" size={16} color={colors.primary} />
              </View>
              <View style={screenStyles.highlightContent}>
                <Text style={screenStyles.highlightTitle}>Sparring Workshop</Text>
                <Text style={screenStyles.highlightDesc}>Saturday 2PM - Advanced techniques</Text>
              </View>
            </View>
            
            <View style={screenStyles.highlightItem}>
              <View style={screenStyles.highlightIcon}>
                <Ionicons name="people" size={16} color={colors.primary} />
              </View>
              <View style={screenStyles.highlightContent}>
                <Text style={screenStyles.highlightTitle}>Open Training</Text>
                <Text style={screenStyles.highlightDesc}>Sunday 10AM - All levels welcome</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Motivational Quote */}
        <View style={screenStyles.quoteCard}>
          <Ionicons name="quote-outline" size={24} color={colors.primary} style={{ marginBottom: 10 }} />
          <Text style={screenStyles.quoteText}>
            "The art of eight limbs teaches us that strength comes not from the body alone, but from the harmony of mind, body, and spirit."
          </Text>
          <Text style={screenStyles.quoteAuthor}>- Traditional Muay Thai Wisdom</Text>
        </View>
      </Animated.View>
    </ScrollView>
  );
};

export default HomeScreen;