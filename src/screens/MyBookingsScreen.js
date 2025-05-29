import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../constants/colors';
import { mockClasses } from '../data/mockData';
import { screenStyles } from '../styles/screenStyles';

const MyBookingsScreen = ({ bookedClasses, onCancelBooking, onBack }) => {
  const [activeTab, setActiveTab] = useState('upcoming');

  const myBookedClasses = mockClasses.filter(c => bookedClasses.includes(c.id));
  const upcomingBookings = myBookedClasses.filter(c => c.date !== 'Past');
  const pastBookings = myBookedClasses.slice(0, 3); // Mock past bookings

  const handleCancelBooking = (classItem) => {
    Alert.alert(
      'Cancel Booking',
      `Are you sure you want to cancel "${classItem.name}"? This action cannot be undone.`,
      [
        { text: 'Keep Booking', style: 'cancel' },
        {
          text: 'Cancel',
          style: 'destructive',
          onPress: () => onCancelBooking(classItem.id)
        }
      ]
    );
  };

  const BookingCard = ({ classItem, isPast = false }) => (
    <View style={[screenStyles.classCard, isPast && { opacity: 0.7 }]}>
      <View style={screenStyles.classHeader}>
        <View style={{ flex: 1 }}>
          <Text style={screenStyles.className}>{classItem.name}</Text>
          <Text style={screenStyles.classInstructor}>with {classItem.instructor}</Text>
        </View>
        <View style={screenStyles.bookingStatus}>
          <Ionicons 
            name={isPast ? "checkmark-circle" : "calendar"} 
            size={16} 
            color={isPast ? colors.success : colors.primary} 
          />
          <Text style={[
            screenStyles.statusText, 
            { color: isPast ? colors.success : colors.primary }
          ]}>
            {isPast ? 'Completed' : 'Booked'}
          </Text>
        </View>
      </View>
      
      <View style={screenStyles.classDetails}>
        <View style={screenStyles.classInfo}>
          <Ionicons name="time" size={16} color={colors.textSecondary} />
          <Text style={screenStyles.classTime}>{classItem.time}</Text>
        </View>
        <View style={screenStyles.classInfo}>
          <Ionicons name="calendar" size={16} color={colors.textSecondary} />
          <Text style={screenStyles.classDate}>{classItem.date}</Text>
        </View>
        <View style={screenStyles.classInfo}>
          <Ionicons name="card" size={16} color={colors.textSecondary} />
          <Text style={screenStyles.classPrice}>£{classItem.price}</Text>
        </View>
      </View>

      {!isPast && (
        <View style={screenStyles.bookingActions}>
          <TouchableOpacity 
            style={screenStyles.secondaryActionButton}
            onPress={() => Alert.alert('Reschedule', 'Reschedule feature coming soon!')}
          >
            <Ionicons name="swap-horizontal" size={16} color={colors.primary} />
            <Text style={screenStyles.secondaryActionText}>Reschedule</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={screenStyles.cancelButton}
            onPress={() => handleCancelBooking(classItem)}
          >
            <Ionicons name="close-circle" size={16} color={colors.text} />
            <Text style={screenStyles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      )}

      {isPast && (
        <TouchableOpacity style={screenStyles.reviewButton}>
          <Ionicons name="star-outline" size={16} color={colors.primary} />
          <Text style={screenStyles.reviewButtonText}>Leave Review</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  return (
    <View style={screenStyles.container}>
      {/* Header */}
      <View style={screenStyles.screenHeader}>
        <TouchableOpacity onPress={onBack}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={screenStyles.screenTitle}>My Bookings</Text>
        <TouchableOpacity style={screenStyles.headerAction}>
          <Ionicons name="add" size={24} color={colors.primary} />
        </TouchableOpacity>
      </View>

      {/* Tab Navigation */}
      <View style={screenStyles.tabContainer}>
        <TouchableOpacity
          style={[screenStyles.tab, activeTab === 'upcoming' && screenStyles.activeTab]}
          onPress={() => setActiveTab('upcoming')}
        >
          <Text style={[
            screenStyles.tabText,
            activeTab === 'upcoming' && screenStyles.activeTabText
          ]}>
            Upcoming ({upcomingBookings.length})
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[screenStyles.tab, activeTab === 'history' && screenStyles.activeTab]}
          onPress={() => setActiveTab('history')}
        >
          <Text style={[
            screenStyles.tabText,
            activeTab === 'history' && screenStyles.activeTabText
          ]}>
            History
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={screenStyles.content} showsVerticalScrollIndicator={false}>
        {activeTab === 'upcoming' ? (
          <>
            {upcomingBookings.length > 0 ? (
              <>
                {/* Booking Summary */}
                <View style={screenStyles.summaryCard}>
                  <Text style={screenStyles.summaryTitle}>Booking Summary</Text>
                  <View style={screenStyles.summaryRow}>
                    <Text style={screenStyles.summaryLabel}>Total Bookings:</Text>
                    <Text style={screenStyles.summaryValue}>{upcomingBookings.length}</Text>
                  </View>
                  <View style={screenStyles.summaryRow}>
                    <Text style={screenStyles.summaryLabel}>Total Value:</Text>
                    <Text style={screenStyles.summaryValue}>
                      £{upcomingBookings.reduce((sum, c) => sum + c.price, 0)}
                    </Text>
                  </View>
                </View>

                {upcomingBookings.map((classItem) => (
                  <BookingCard key={classItem.id} classItem={classItem} />
                ))}
              </>
            ) : (
              <View style={screenStyles.emptyState}>
                <Ionicons name="calendar-outline" size={64} color={colors.textSecondary} />
                <Text style={screenStyles.emptyTitle}>No Upcoming Bookings</Text>
                <Text style={screenStyles.emptyDesc}>
                  Book your next class to start your training journey!
                </Text>
                <TouchableOpacity style={screenStyles.primaryButton}>
                  <Text style={screenStyles.primaryButtonText}>Browse Classes</Text>
                </TouchableOpacity>
              </View>
            )}
          </>
        ) : (
          <>
            {/* History Tab */}
            <View style={screenStyles.historyStats}>
              <View style={screenStyles.historyStatItem}>
                <Text style={screenStyles.historyStatNumber}>47</Text>
                <Text style={screenStyles.historyStatLabel}>Total Classes</Text>
              </View>
              <View style={screenStyles.historyStatItem}>
                <Text style={screenStyles.historyStatNumber}>£940</Text>
                <Text style={screenStyles.historyStatLabel}>Total Spent</Text>
              </View>
              <View style={screenStyles.historyStatItem}>
                <Text style={screenStyles.historyStatNumber}>12</Text>
                <Text style={screenStyles.historyStatLabel}>This Month</Text>
              </View>
            </View>

            {/* Mock past bookings */}
            {[...pastBookings, ...mockClasses.slice(0, 2)].map((classItem, index) => (
              <BookingCard key={`past-${index}`} classItem={classItem} isPast={true} />
            ))}
          </>
        )}
      </ScrollView>
    </View>
  );
};

export default MyBookingsScreen;