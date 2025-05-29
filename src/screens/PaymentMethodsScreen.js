import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../constants/colors';
import { screenStyles } from '../styles/screenStyles';

const PaymentMethodsScreen = ({ onBack }) => {
  const [paymentMethods] = useState([
    {
      id: 1,
      type: 'card',
      brand: 'visa',
      last4: '4242',
      expiryMonth: '12',
      expiryYear: '25',
      isDefault: true,
    },
    {
      id: 2,
      type: 'card',
      brand: 'mastercard',
      last4: '8888',
      expiryMonth: '08',
      expiryYear: '26',
      isDefault: false,
    },
  ]);

  const [billingHistory] = useState([
    {
      id: 1,
      date: '15 Mar 2024',
      description: 'Advanced Training Class',
      amount: 20.00,
      status: 'paid',
    },
    {
      id: 2,
      date: '12 Mar 2024',
      description: 'Beginner Muay Thai Class',
      amount: 15.00,
      status: 'paid',
    },
    {
      id: 3,
      date: '08 Mar 2024',
      description: 'Monthly Membership',
      amount: 89.99,
      status: 'paid',
    },
  ]);

  const getCardIcon = (brand) => {
    switch (brand) {
      case 'visa': return 'card';
      case 'mastercard': return 'card';
      case 'amex': return 'card';
      default: return 'card-outline';
    }
  };

  const handleAddPaymentMethod = () => {
    Alert.alert(
      'Add Payment Method',
      'This will redirect to a secure payment form.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Continue', onPress: () => Alert.alert('Coming Soon', 'Payment integration will be available soon!') }
      ]
    );
  };

  const handleSetDefault = (id) => {
    Alert.alert('Success', 'Default payment method updated!');
  };

  const handleDeletePaymentMethod = (id) => {
    Alert.alert(
      'Delete Payment Method',
      'Are you sure you want to remove this payment method?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: () => Alert.alert('Deleted', 'Payment method removed') }
      ]
    );
  };

  const PaymentMethodCard = ({ method }) => (
    <View style={screenStyles.paymentCard}>
      <View style={screenStyles.paymentCardHeader}>
        <View style={screenStyles.paymentCardLeft}>
          <View style={screenStyles.cardIconContainer}>
            <Ionicons name={getCardIcon(method.brand)} size={24} color={colors.primary} />
          </View>
          <View style={screenStyles.cardDetails}>
            <Text style={screenStyles.cardBrand}>
              {method.brand.charAt(0).toUpperCase() + method.brand.slice(1)}
            </Text>
            <Text style={screenStyles.cardNumber}>•••• •••• •••• {method.last4}</Text>
            <Text style={screenStyles.cardExpiry}>Expires {method.expiryMonth}/{method.expiryYear}</Text>
          </View>
        </View>
        
        {method.isDefault && (
          <View style={screenStyles.defaultBadge}>
            <Text style={screenStyles.defaultText}>Default</Text>
          </View>
        )}
      </View>
      
      <View style={screenStyles.paymentCardActions}>
        {!method.isDefault && (
          <TouchableOpacity 
            style={screenStyles.setDefaultButton}
            onPress={() => handleSetDefault(method.id)}
          >
            <Text style={screenStyles.setDefaultText}>Set as Default</Text>
          </TouchableOpacity>
        )}
        
        <TouchableOpacity 
          style={screenStyles.deletePaymentButton}
          onPress={() => handleDeletePaymentMethod(method.id)}
        >
          <Ionicons name="trash-outline" size={16} color={colors.primary} />
          <Text style={screenStyles.deletePaymentText}>Remove</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const BillingHistoryItem = ({ item }) => (
    <View style={screenStyles.billingItem}>
      <View style={screenStyles.billingLeft}>
        <Text style={screenStyles.billingDescription}>{item.description}</Text>
        <Text style={screenStyles.billingDate}>{item.date}</Text>
      </View>
      
      <View style={screenStyles.billingRight}>
        <Text style={screenStyles.billingAmount}>£{item.amount.toFixed(2)}</Text>
        <View style={[
          screenStyles.statusBadge, 
          { backgroundColor: item.status === 'paid' ? colors.success + '20' : colors.warning + '20' }
        ]}>
          <Text style={[
            screenStyles.billingStatusText,
            { color: item.status === 'paid' ? colors.success : colors.warning }
          ]}>
            {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
          </Text>
        </View>
      </View>
    </View>
  );

  return (
    <View style={screenStyles.container}>
      {/* Header */}
      <View style={screenStyles.screenHeader}>
        <TouchableOpacity onPress={onBack}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={screenStyles.screenTitle}>Payment Methods</Text>
        <TouchableOpacity onPress={handleAddPaymentMethod}>
          <Ionicons name="add" size={24} color={colors.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView style={screenStyles.content} showsVerticalScrollIndicator={false}>
        
        {/* Payment Methods */}
        <View style={screenStyles.settingsSection}>
          <Text style={screenStyles.sectionTitle}>Saved Payment Methods</Text>
          
          {paymentMethods.map((method) => (
            <PaymentMethodCard key={method.id} method={method} />
          ))}
          
          <TouchableOpacity 
            style={screenStyles.addPaymentButton}
            onPress={handleAddPaymentMethod}
          >
            <Ionicons name="add-circle-outline" size={24} color={colors.primary} />
            <Text style={screenStyles.addPaymentText}>Add New Payment Method</Text>
          </TouchableOpacity>
        </View>

        {/* Billing Information */}
        <View style={screenStyles.settingsSection}>
          <Text style={screenStyles.sectionTitle}>Billing Information</Text>
          
          <View style={screenStyles.billingInfo}>
            <View style={screenStyles.billingRow}>
              <Text style={screenStyles.billingLabel}>Next Payment:</Text>
              <Text style={screenStyles.billingValue}>15 Apr 2024</Text>
            </View>
            <View style={screenStyles.billingRow}>
              <Text style={screenStyles.billingLabel}>Monthly Amount:</Text>
              <Text style={screenStyles.billingValue}>£89.99</Text>
            </View>
            <View style={screenStyles.billingRow}>
              <Text style={screenStyles.billingLabel}>Payment Method:</Text>
              <Text style={screenStyles.billingValue}>Visa •••• 4242</Text>
            </View>
          </View>
        </View>

        {/* Recent Transactions */}
        <View style={screenStyles.settingsSection}>
          <View style={screenStyles.sectionHeader}>
            <Text style={screenStyles.sectionTitle}>Recent Transactions</Text>
            <TouchableOpacity>
              <Text style={screenStyles.seeAllText}>See All</Text>
            </TouchableOpacity>
          </View>
          
          {billingHistory.map((item) => (
            <BillingHistoryItem key={item.id} item={item} />
          ))}
        </View>

        {/* Subscription Management */}
        <View style={screenStyles.settingsSection}>
          <Text style={screenStyles.sectionTitle}>Subscription</Text>
          
          <View style={screenStyles.subscriptionCard}>
            <View style={screenStyles.subscriptionHeader}>
              <Text style={screenStyles.subscriptionTitle}>Premium Membership</Text>
              <View style={screenStyles.activeBadge}>
                <Text style={screenStyles.activeText}>Active</Text>
              </View>
            </View>
            
            <Text style={screenStyles.subscriptionDescription}>
              Unlimited classes, priority booking, and exclusive member benefits
            </Text>
            
            <View style={screenStyles.subscriptionDetails}>
              <Text style={screenStyles.subscriptionPrice}>£89.99/month</Text>
              <Text style={screenStyles.subscriptionRenewal}>Renews on 15 Apr 2024</Text>
            </View>
            
            <View style={screenStyles.subscriptionActions}>
              <TouchableOpacity style={screenStyles.manageSubscriptionButton}>
                <Text style={screenStyles.manageSubscriptionText}>Manage Subscription</Text>
              </TouchableOpacity>
              
              <TouchableOpacity style={screenStyles.cancelSubscriptionButton}>
                <Text style={screenStyles.cancelSubscriptionText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Payment Security */}
        <View style={screenStyles.settingsSection}>
          <Text style={screenStyles.sectionTitle}>Security</Text>
          
          <View style={screenStyles.securityInfo}>
            <Ionicons name="shield-checkmark" size={24} color={colors.success} />
            <View style={screenStyles.securityText}>
              <Text style={screenStyles.securityTitle}>Your payments are secure</Text>
              <Text style={screenStyles.securityDescription}>
                We use industry-standard encryption to protect your payment information
              </Text>
            </View>
          </View>
        </View>

      </ScrollView>
    </View>
  );
};

export default PaymentMethodsScreen;