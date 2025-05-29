import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, FlatList } from 'react-native';
import { mockClasses } from '../data/mockData';
import ClassCard from '../components/ClassCard';
import { screenStyles } from '../styles/screenStyles';

const ClassesScreen = ({ bookedClasses, onBookClass }) => {
  const [selectedDay, setSelectedDay] = useState('Today');
  const days = ['Today', 'Tomorrow', 'This Week'];

  const getFilteredClasses = () => {
    return mockClasses.filter(c => c.date === selectedDay);
  };

  return (
    <View style={screenStyles.content}>
      {/* Day Filter */}
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false} 
        style={screenStyles.dayFilter}
      >
        {days.map((day) => (
          <TouchableOpacity
            key={day}
            style={[
              screenStyles.dayButton, 
              selectedDay === day && screenStyles.activeDayButton
            ]}
            onPress={() => setSelectedDay(day)}
          >
            <Text style={[
              screenStyles.dayButtonText,
              selectedDay === day && screenStyles.activeDayButtonText
            ]}>
              {day}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Classes List */}
      <FlatList
        data={getFilteredClasses()}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <ClassCard
            classItem={item}
            isBooked={bookedClasses.includes(item.id)}
            onBook={() => onBookClass(item)}
            showFullDetails
          />
        )}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 20 }}
      />
    </View>
  );
};

export default ClassesScreen;