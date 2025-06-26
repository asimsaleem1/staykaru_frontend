import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Linking,
  SafeAreaView,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const SafetyEmergencyScreen_new = ({ navigation }) => {
  const [emergencyContacts, setEmergencyContacts] = useState([]);
  const [safetyTips, setSafetyTips] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadEmergencyData();
  }, []);

  const loadEmergencyData = () => {
    const defaultEmergencyContacts = [
      {
        id: '1',
        name: 'Police Emergency',
        number: '15',
        category: 'Police',
        description: 'For immediate police assistance',
        icon: 'shield',
        color: '#e74c3c'
      },
      {
        id: '2',
        name: 'Medical Emergency',
        number: '1122',
        category: 'Medical',
        description: 'For medical emergencies and ambulance',
        icon: 'medical',
        color: '#27ae60'
      },
      {
        id: '3',
        name: 'Fire Brigade',
        number: '16',
        category: 'Fire',
        description: 'For fire emergencies',
        icon: 'flame',
        color: '#f39c12'
      },
      {
        id: '4',
        name: 'Women Helpline',
        number: '1091',
        category: 'Support',
        description: 'For women in distress',
        icon: 'people',
        color: '#9b59b6'
      },
      {
        id: '5',
        name: 'Child Helpline',
        number: '1098',
        category: 'Support',
        description: 'For child protection and assistance',
        icon: 'happy',
        color: '#3498db'
      },
      {
        id: '6',
        name: 'Tourist Helpline',
        number: '1363',
        category: 'Support',
        description: 'For tourist assistance and information',
        icon: 'map',
        color: '#1abc9c'
      },
      {
        id: '7',
        name: 'StayKaru Emergency',
        number: '+92-300-1234567',
        category: 'Support',
        description: 'StayKaru 24/7 emergency support',
        icon: 'home',
        color: '#e67e22'
      }
    ];

    const defaultSafetyTips = [
      {
        id: '1',
        title: 'Accommodation Safety',
        tips: [
          'Always verify the property and landlord credentials',
          'Share your accommodation details with family/friends',
          'Check for emergency exits and safety equipment',
          'Keep important documents in a safe place',
          'Install safety apps on your phone'
        ],
        icon: 'home',
        color: '#3498db'
      },
      {
        id: '2',
        title: 'Food Safety',
        tips: [
          'Order from verified and rated restaurants',
          'Check food expiry dates and freshness',
          'Avoid street food from unhygienic places',
          'Keep emergency medicines handy',
          'Report food poisoning incidents immediately'
        ],
        icon: 'restaurant',
        color: '#27ae60'
      },
      {
        id: '3',
        title: 'Travel Safety',
        tips: [
          'Share your travel plans with someone trusted',
          'Use verified transportation services',
          'Keep emergency contacts easily accessible',
          'Avoid traveling alone late at night',
          'Keep your phone charged and carry a power bank'
        ],
        icon: 'car',
        color: '#f39c12'
      },
      {
        id: '4',
        title: 'Personal Safety',
        tips: [
          'Trust your instincts if something feels wrong',
          'Keep your personal information private',
          'Meet new people in public places',
          'Inform someone about your whereabouts',
          'Learn basic self-defense techniques'
        ],
        icon: 'person',
        color: '#9b59b6'
      }
    ];

    setEmergencyContacts(defaultEmergencyContacts);
    setSafetyTips(defaultSafetyTips);
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadEmergencyData();
    setTimeout(() => setRefreshing(false), 1000);
  };

  const handleEmergencyCall = (contact) => {
    Alert.alert(
      'Emergency Call',
      `Do you want to call ${contact.name} (${contact.number})?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Call Now',
          style: 'default',
          onPress: () => {
            Linking.openURL(`tel:${contact.number}`).catch(() => {
              Alert.alert('Error', 'Unable to make phone call');
            });
          }
        }
      ]
    );
  };

  const handleSOSAlert = () => {
    Alert.alert(
      'SOS Alert',
      'This will send your location and emergency alert to your emergency contacts and local authorities.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Send SOS',
          style: 'destructive',
          onPress: () => {
            Alert.alert('SOS Sent', 'Emergency alert has been sent to your contacts and authorities.');
          }
        }
      ]
    );
  };

  const renderEmergencyContact = (contact) => (
    <TouchableOpacity
      key={contact.id}
      style={styles.contactCard}
      onPress={() => handleEmergencyCall(contact)}
    >
      <View style={[styles.contactIcon, { backgroundColor: contact.color }]}>
        <Ionicons name={contact.icon} size={24} color="#fff" />
      </View>
      <View style={styles.contactInfo}>
        <Text style={styles.contactName}>{contact.name}</Text>
        <Text style={styles.contactNumber}>{contact.number}</Text>
        <Text style={styles.contactDescription}>{contact.description}</Text>
      </View>
      <Ionicons name="call" size={24} color={contact.color} />
    </TouchableOpacity>
  );

  const renderSafetyTip = (tip) => (
    <View key={tip.id} style={styles.tipCard}>
      <View style={styles.tipHeader}>
        <View style={[styles.tipIcon, { backgroundColor: tip.color }]}>
          <Ionicons name={tip.icon} size={20} color="#fff" />
        </View>
        <Text style={styles.tipTitle}>{tip.title}</Text>
      </View>
      <View style={styles.tipContent}>
        {tip.tips.map((tipText, index) => (
          <View key={index} style={styles.tipItem}>
            <Text style={styles.tipBullet}>•</Text>
            <Text style={styles.tipText}>{tipText}</Text>
          </View>
        ))}
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Safety & Emergency</Text>
      </View>

      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* SOS Button */}
        <View style={styles.sosContainer}>
          <TouchableOpacity style={styles.sosButton} onPress={handleSOSAlert}>
            <Ionicons name="warning" size={32} color="#fff" />
            <Text style={styles.sosText}>SOS EMERGENCY</Text>
            <Text style={styles.sosSubtext}>Tap to send emergency alert</Text>
          </TouchableOpacity>
        </View>

        {/* Emergency Contacts */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Emergency Contacts</Text>
          <Text style={styles.sectionSubtitle}>Tap to call immediately</Text>
          {emergencyContacts.map(renderEmergencyContact)}
        </View>

        {/* Safety Tips */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Safety Tips</Text>
          <Text style={styles.sectionSubtitle}>Stay safe with these guidelines</Text>
          {safetyTips.map(renderSafetyTip)}
        </View>

        {/* Additional Resources */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Additional Resources</Text>
          <View style={styles.resourceCard}>
            <Ionicons name="location" size={24} color="#3498db" />
            <View style={styles.resourceInfo}>
              <Text style={styles.resourceTitle}>Share Location</Text>
              <Text style={styles.resourceDescription}>
                Share your real-time location with trusted contacts
              </Text>
            </View>
            <TouchableOpacity style={styles.resourceButton}>
              <Text style={styles.resourceButtonText}>Share</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.resourceCard}>
            <Ionicons name="download" size={24} color="#27ae60" />
            <View style={styles.resourceInfo}>
              <Text style={styles.resourceTitle}>Safety Apps</Text>
              <Text style={styles.resourceDescription}>
                Download recommended safety and emergency apps
              </Text>
            </View>
            <TouchableOpacity style={styles.resourceButton}>
              <Text style={styles.resourceButtonText}>Download</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.resourceCard}>
            <Ionicons name="school" size={24} color="#f39c12" />
            <View style={styles.resourceInfo}>
              <Text style={styles.resourceTitle}>Safety Training</Text>
              <Text style={styles.resourceDescription}>
                Learn basic safety and self-defense techniques
              </Text>
            </View>
            <TouchableOpacity style={styles.resourceButton}>
              <Text style={styles.resourceButtonText}>Learn</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    backgroundColor: '#fff',
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    paddingTop: 50,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  backButton: {
    marginRight: 16,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  scrollView: {
    flex: 1,
  },
  sosContainer: {
    padding: 20,
    alignItems: 'center',
  },
  sosButton: {
    backgroundColor: '#e74c3c',
    borderRadius: 80,
    width: 160,
    height: 160,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#e74c3c',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  sosText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 8,
  },
  sosSubtext: {
    color: '#fff',
    fontSize: 12,
    marginTop: 4,
    textAlign: 'center',
  },
  section: {
    paddingHorizontal: 20,
    paddingBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
  },
  contactCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  contactIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  contactInfo: {
    flex: 1,
  },
  contactName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 2,
  },
  contactNumber: {
    fontSize: 16,
    fontWeight: '600',
    color: '#3498db',
    marginBottom: 4,
  },
  contactDescription: {
    fontSize: 13,
    color: '#666',
  },
  tipCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  tipHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  tipIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  tipTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  tipContent: {
    paddingLeft: 8,
  },
  tipItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  tipBullet: {
    fontSize: 16,
    color: '#3498db',
    marginRight: 8,
    marginTop: 2,
  },
  tipText: {
    flex: 1,
    fontSize: 14,
    color: '#555',
    lineHeight: 20,
  },
  resourceCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  resourceInfo: {
    flex: 1,
    marginLeft: 16,
  },
  resourceTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  resourceDescription: {
    fontSize: 13,
    color: '#666',
  },
  resourceButton: {
    backgroundColor: '#3498db',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
  },
  resourceButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
  },
});

export default SafetyEmergencyScreen_new;
