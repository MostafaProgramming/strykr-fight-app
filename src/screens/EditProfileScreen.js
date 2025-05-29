import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../constants/colors';
import { screenStyles } from '../styles/screenStyles';

const EditProfileScreen = ({ member, onBack }) => {
  const [formData, setFormData] = useState({
    firstName: member.name.split(' ')[0] || '',
    lastName: member.name.split(' ')[1] || '',
    email: member.email || '',
    phone: '+44 123 456 7890',
    dateOfBirth: '15/03/1990',
    emergencyContact: 'Jane Thompson',
    emergencyPhone: '+44 987 654 3210',
    medicalConditions: 'None',
    fitnessGoals: 'Improve fitness and learn self-defense',
  });

  const [isEditing, setIsEditing] = useState({});

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const toggleEdit = (field) => {
    setIsEditing(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  const handleSave = () => {
    Alert.alert(
      'Profile Updated',
      'Your profile has been successfully updated!',
      [{ text: 'OK', onPress: () => onBack() }]
    );
  };

  const ProfileField = ({ label, field, value, placeholder, multiline = false, keyboardType = 'default' }) => (
    <View style={screenStyles.profileField}>
      <View style={screenStyles.fieldHeader}>
        <Text style={screenStyles.fieldLabel}>{label}</Text>
        <TouchableOpacity 
          style={screenStyles.editButton}
          onPress={() => toggleEdit(field)}
        >
          <Ionicons 
            name={isEditing[field] ? "checkmark" : "pencil"} 
            size={16} 
            color={colors.primary} 
          />
        </TouchableOpacity>
      </View>
      
      {isEditing[field] ? (
        <TextInput
          style={[screenStyles.profileInput, multiline && { height: 80 }]}
          value={value}
          onChangeText={(text) => handleInputChange(field, text)}
          placeholder={placeholder}
          placeholderTextColor={colors.textSecondary}
          multiline={multiline}
          keyboardType={keyboardType}
          autoFocus
        />
      ) : (
        <Text style={screenStyles.fieldValue}>{value || placeholder}</Text>
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
        <Text style={screenStyles.screenTitle}>Edit Profile</Text>
        <TouchableOpacity onPress={handleSave}>
          <Text style={screenStyles.saveText}>Save</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={screenStyles.content} showsVerticalScrollIndicator={false}>
        {/* Profile Picture Section */}
        <View style={screenStyles.profilePictureSection}>
          <View style={screenStyles.avatarLarge}>
            <Text style={screenStyles.avatarText}>{member.avatar}</Text>
          </View>
          <TouchableOpacity style={screenStyles.changePhotoButton}>
            <Ionicons name="camera" size={20} color={colors.primary} />
            <Text style={screenStyles.changePhotoText}>Change Photo</Text>
          </TouchableOpacity>
        </View>

        {/* Personal Information */}
        <View style={screenStyles.settingsSection}>
          <Text style={screenStyles.sectionTitle}>Personal Information</Text>
          
          <ProfileField
            label="First Name"
            field="firstName"
            value={formData.firstName}
            placeholder="Enter first name"
          />
          
          <ProfileField
            label="Last Name"
            field="lastName"
            value={formData.lastName}
            placeholder="Enter last name"
          />
          
          <ProfileField
            label="Email"
            field="email"
            value={formData.email}
            placeholder="Enter email address"
            keyboardType="email-address"
          />
          
          <ProfileField
            label="Phone Number"
            field="phone"
            value={formData.phone}
            placeholder="Enter phone number"
            keyboardType="phone-pad"
          />
          
          <ProfileField
            label="Date of Birth"
            field="dateOfBirth"
            value={formData.dateOfBirth}
            placeholder="DD/MM/YYYY"
          />
        </View>

        {/* Emergency Contact */}
        <View style={screenStyles.settingsSection}>
          <Text style={screenStyles.sectionTitle}>Emergency Contact</Text>
          
          <ProfileField
            label="Contact Name"
            field="emergencyContact"
            value={formData.emergencyContact}
            placeholder="Emergency contact name"
          />
          
          <ProfileField
            label="Contact Phone"
            field="emergencyPhone"
            value={formData.emergencyPhone}
            placeholder="Emergency contact phone"
            keyboardType="phone-pad"
          />
        </View>

        {/* Fitness Information */}
        <View style={screenStyles.settingsSection}>
          <Text style={screenStyles.sectionTitle}>Fitness Information</Text>
          
          <ProfileField
            label="Medical Conditions"
            field="medicalConditions"
            value={formData.medicalConditions}
            placeholder="Any medical conditions or injuries"
            multiline
          />
          
          <ProfileField
            label="Fitness Goals"
            field="fitnessGoals"
            value={formData.fitnessGoals}
            placeholder="What are your fitness goals?"
            multiline
          />
        </View>

        {/* Membership Information */}
        <View style={screenStyles.settingsSection}>
          <Text style={screenStyles.sectionTitle}>Membership</Text>
          
          <View style={screenStyles.membershipInfo}>
            <View style={screenStyles.membershipRow}>
              <Text style={screenStyles.membershipLabel}>Plan:</Text>
              <Text style={screenStyles.membershipValue}>{member.membership}</Text>
            </View>
            <View style={screenStyles.membershipRow}>
              <Text style={screenStyles.membershipLabel}>Member Since:</Text>
              <Text style={screenStyles.membershipValue}>{member.memberSince}</Text>
            </View>
            <View style={screenStyles.membershipRow}>
              <Text style={screenStyles.membershipLabel}>Classes Attended:</Text>
              <Text style={screenStyles.membershipValue}>{member.classesAttended}</Text>
            </View>
          </View>
          
          <TouchableOpacity style={screenStyles.upgradeMembershipButton}>
            <Text style={screenStyles.upgradeMembershipText}>Upgrade Membership</Text>
          </TouchableOpacity>
        </View>

      </ScrollView>
    </View>
  );
};

export default EditProfileScreen;