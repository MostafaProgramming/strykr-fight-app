import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Modal, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../constants/colors';
import { screenStyles } from '../styles/screenStyles';

const CheckInScreen = () => {
  const [showScanner, setShowScanner] = useState(false);

  const handleCheckIn = () => {
    Alert.alert(
      'Checked In! 🥊',
      'Welcome to 8 Limbs Muay Thai! Have a great training session.',
      [{ text: 'Start Training!', style: 'default' }]
    );
    setShowScanner(false);
  };

  return (
    <View style={screenStyles.centerContent}>
      <View style={screenStyles.checkInCard}>
        <Ionicons name="qr-code" size={80} color={colors.primary} />
        <Text style={screenStyles.checkInTitle}>Quick Check-In</Text>
        <Text style={screenStyles.checkInText}>
          Scan your QR code at the gym entrance or tap the button below to check in manually.
        </Text>
        
        <TouchableOpacity
          style={screenStyles.primaryButton}
          onPress={() => setShowScanner(true)}
        >
          <Text style={screenStyles.primaryButtonText}>SCAN QR CODE</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={screenStyles.secondaryButton}
          onPress={handleCheckIn}
        >
          <Text style={screenStyles.secondaryButtonText}>Manual Check-In</Text>
        </TouchableOpacity>
      </View>

      {/* Mock QR Scanner Modal */}
      <Modal visible={showScanner} animationType="slide">
        <View style={screenStyles.scannerModal}>
          <View style={screenStyles.scannerHeader}>
            <Text style={screenStyles.scannerTitle}>Scan QR Code</Text>
            <TouchableOpacity onPress={() => setShowScanner(false)}>
              <Ionicons name="close" size={24} color={colors.text} />
            </TouchableOpacity>
          </View>
          
          <View style={screenStyles.scannerContent}>
            <View style={screenStyles.scannerFrame}>
              <Text style={screenStyles.scannerText}>Position QR code within the frame</Text>
            </View>
            
            <TouchableOpacity
              style={screenStyles.primaryButton}
              onPress={handleCheckIn}
            >
              <Text style={screenStyles.primaryButtonText}>SIMULATE SCAN</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default CheckInScreen;