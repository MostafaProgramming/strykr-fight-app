import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, Alert, Linking } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../constants/colors';
import { screenStyles } from '../styles/screenStyles';

const HelpSupportScreen = ({ onBack }) => {
  const [activeTab, setActiveTab] = useState('faq');
  const [contactForm, setContactForm] = useState({
    subject: '',
    message: '',
  });

  const faqData = [
    {
      id: 1,
      question: 'How do I book a class?',
      answer: 'You can book classes through the app by going to the Classes tab, selecting your desired class, and tapping "Book Class". Payment will be processed automatically.',
      category: 'booking'
    },
    {
      id: 2,
      question: 'Can I cancel my booking?',
      answer: 'Yes, you can cancel bookings up to 2 hours before the class starts. Go to My Bookings and select "Cancel" next to the class you want to cancel.',
      category: 'booking'
    },
    {
      id: 3,
      question: 'What should I bring to my first class?',
      answer: 'Bring comfortable workout clothes, a water bottle, and a towel. We provide all equipment including gloves and pads for beginners.',
      category: 'classes'
    },
    {
      id: 4,
      question: 'How do I change my membership plan?',
      answer: 'You can upgrade or change your membership plan by going to Profile > Payment Methods > Manage Subscription, or contact our support team.',
      category: 'membership'
    },
    {
      id: 5,
      question: 'What is the refund policy?',
      answer: 'Individual class bookings can be refunded if cancelled 24+ hours in advance. Monthly memberships have a 7-day cooling-off period.',
      category: 'payment'
    }
  ];

  const [expandedFaq, setExpandedFaq] = useState(null);

  const handleFaqToggle = (id) => {
    setExpandedFaq(expandedFaq === id ? null : id);
  };

  const handleContactSubmit = () => {
    if (!contactForm.subject || !contactForm.message) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }
    
    Alert.alert(
      'Message Sent!',
      'Thank you for contacting us. We\'ll get back to you within 24 hours.',
      [{ text: 'OK', onPress: () => setContactForm({ subject: '', message: '' }) }]
    );
  };

  const handleCall = () => {
    Linking.openURL('tel:+441234567890');
  };

  const handleEmail = () => {
    Linking.openURL('mailto:support@8limbsmuaythai.com');
  };

  const FAQItem = ({ item }) => (
    <TouchableOpacity
      style={screenStyles.faqItem}
      onPress={() => handleFaqToggle(item.id)}
    >
      <View style={screenStyles.faqHeader}>
        <Text style={screenStyles.faqQuestion}>{item.question}</Text>
        <Ionicons
          name={expandedFaq === item.id ? "chevron-up" : "chevron-down"}
          size={20}
          color={colors.textSecondary}
        />
      </View>
      
      {expandedFaq === item.id && (
        <Text style={screenStyles.faqAnswer}>{item.answer}</Text>
      )}
    </TouchableOpacity>
  );

  const ContactOption = ({ icon, title, subtitle, onPress, color = colors.primary }) => (
    <TouchableOpacity style={screenStyles.contactOption} onPress={onPress}>
      <View style={[screenStyles.contactIconContainer, { backgroundColor: color + '20' }]}>
        <Ionicons name={icon} size={24} color={color} />
      </View>
      <View style={screenStyles.contactContent}>
        <Text style={screenStyles.contactTitle}>{title}</Text>
        <Text style={screenStyles.contactSubtitle}>{subtitle}</Text>
      </View>
      <Ionicons name="chevron-forward" size={16} color={colors.textSecondary} />
    </TouchableOpacity>
  );

  return (
    <View style={screenStyles.container}>
      {/* Header */}
      <View style={screenStyles.screenHeader}>
        <TouchableOpacity onPress={onBack}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={screenStyles.screenTitle}>Help & Support</Text>
        <View style={{ width: 24 }} />
      </View>

      {/* Tab Navigation */}
      <View style={screenStyles.tabContainer}>
        <TouchableOpacity
          style={[screenStyles.tab, activeTab === 'faq' && screenStyles.activeTab]}
          onPress={() => setActiveTab('faq')}
        >
          <Text style={[
            screenStyles.tabText,
            activeTab === 'faq' && screenStyles.activeTabText
          ]}>
            FAQ
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[screenStyles.tab, activeTab === 'contact' && screenStyles.activeTab]}
          onPress={() => setActiveTab('contact')}
        >
          <Text style={[
            screenStyles.tabText,
            activeTab === 'contact' && screenStyles.activeTabText
          ]}>
            Contact Us
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={screenStyles.content} showsVerticalScrollIndicator={false}>
        
        {activeTab === 'faq' ? (
          <>
            {/* Search Bar */}
            <View style={screenStyles.searchContainer}>
              <Ionicons name="search" size={20} color={colors.textSecondary} />
              <TextInput
                style={screenStyles.searchInput}
                placeholder="Search help articles..."
                placeholderTextColor={colors.textSecondary}
              />
            </View>

            {/* FAQ Categories */}
            <View style={screenStyles.categoryContainer}>
              <Text style={screenStyles.sectionTitle}>Popular Topics</Text>
              <View style={screenStyles.categoryGrid}>
                <TouchableOpacity style={screenStyles.categoryCard}>
                  <Ionicons name="calendar" size={24} color={colors.primary} />
                  <Text style={screenStyles.categoryText}>Booking</Text>
                </TouchableOpacity>
                <TouchableOpacity style={screenStyles.categoryCard}>
                  <Ionicons name="fitness" size={24} color={colors.primary} />
                  <Text style={screenStyles.categoryText}>Classes</Text>
                </TouchableOpacity>
                <TouchableOpacity style={screenStyles.categoryCard}>
                  <Ionicons name="card" size={24} color={colors.primary} />
                  <Text style={screenStyles.categoryText}>Payment</Text>
                </TouchableOpacity>
                <TouchableOpacity style={screenStyles.categoryCard}>
                  <Ionicons name="person" size={24} color={colors.primary} />
                  <Text style={screenStyles.categoryText}>Account</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* FAQ List */}
            <View style={screenStyles.settingsSection}>
              <Text style={screenStyles.sectionTitle}>Frequently Asked Questions</Text>
              {faqData.map((item) => (
                <FAQItem key={item.id} item={item} />
              ))}
            </View>
          </>
        ) : (
          <>
            {/* Quick Contact Options */}
            <View style={screenStyles.settingsSection}>
              <Text style={screenStyles.sectionTitle}>Get in Touch</Text>
              
              <ContactOption
                icon="call"
                title="Phone Support"
                subtitle="Mon-Fri 9AM-6PM, Sat 9AM-2PM"
                onPress={handleCall}
                color={colors.success}
              />
              
              <ContactOption
                icon="mail"
                title="Email Support"
                subtitle="support@8limbsmuaythai.com"
                onPress={handleEmail}
                color={colors.primary}
              />
              
              <ContactOption
                icon="location"
                title="Visit Our Gym"
                subtitle="123 Warrior Street, Coventry CV1 2AB"
                onPress={() => Alert.alert('Directions', 'Opening maps...')}
                color={colors.warning}
              />
            </View>

            {/* Contact Form */}
            <View style={screenStyles.settingsSection}>
              <Text style={screenStyles.sectionTitle}>Send us a Message</Text>
              
              <View style={screenStyles.contactForm}>
                <Text style={screenStyles.fieldLabel}>Subject</Text>
                <TextInput
                  style={screenStyles.profileInput}
                  value={contactForm.subject}
                  onChangeText={(text) => setContactForm(prev => ({ ...prev, subject: text }))}
                  placeholder="How can we help you?"
                  placeholderTextColor={colors.textSecondary}
                />
                
                <Text style={screenStyles.fieldLabel}>Message</Text>
                <TextInput
                  style={[screenStyles.profileInput, { height: 100 }]}
                  value={contactForm.message}
                  onChangeText={(text) => setContactForm(prev => ({ ...prev, message: text }))}
                  placeholder="Describe your issue or question..."
                  placeholderTextColor={colors.textSecondary}
                  multiline
                  textAlignVertical="top"
                />
                
                <TouchableOpacity 
                  style={screenStyles.primaryButton}
                  onPress={handleContactSubmit}
                >
                  <Text style={screenStyles.primaryButtonText}>Send Message</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Emergency Contact */}
            <View style={screenStyles.settingsSection}>
              <Text style={screenStyles.sectionTitle}>Emergency</Text>
              
              <View style={screenStyles.emergencyCard}>
                <Ionicons name="warning" size={24} color={colors.primary} />
                <View style={screenStyles.emergencyContent}>
                  <Text style={screenStyles.emergencyTitle}>Medical Emergency</Text>
                  <Text style={screenStyles.emergencyText}>
                    If you have a medical emergency during training, notify staff immediately or call 999
                  </Text>
                </View>
              </View>
            </View>

            {/* Operating Hours */}
            <View style={screenStyles.settingsSection}>
              <Text style={screenStyles.sectionTitle}>Operating Hours</Text>
              
              <View style={screenStyles.hoursContainer}>
                <View style={screenStyles.hoursRow}>
                  <Text style={screenStyles.dayText}>Monday - Friday</Text>
                  <Text style={screenStyles.timeText}>6:00 AM - 10:00 PM</Text>
                </View>
                <View style={screenStyles.hoursRow}>
                  <Text style={screenStyles.dayText}>Saturday</Text>
                  <Text style={screenStyles.timeText}>8:00 AM - 8:00 PM</Text>
                </View>
                <View style={screenStyles.hoursRow}>
                  <Text style={screenStyles.dayText}>Sunday</Text>
                  <Text style={screenStyles.timeText}>10:00 AM - 6:00 PM</Text>
                </View>
              </View>
            </View>
          </>
        )}

      </ScrollView>
    </View>
  );
};

export default HelpSupportScreen;