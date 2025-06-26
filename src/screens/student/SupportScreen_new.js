import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  SafeAreaView,
  TextInput,
  Alert,
  Linking,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const SupportScreen_new = ({ navigation }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [faqData, setFaqData] = useState([]);
  const [supportTickets, setSupportTickets] = useState([]);
  const [expandedFAQs, setExpandedFAQs] = useState({});

  useEffect(() => {
    loadFAQData();
    loadSupportTickets();
  }, []);

  const loadFAQData = () => {
    const mockFAQ = [
      {
        id: '1',
        category: 'booking',
        question: 'How do I make a booking?',
        answer: 'To make a booking, browse accommodations, select your preferred property, choose dates, and complete the payment process.',
        helpful: 15,
        notHelpful: 2
      },
      {
        id: '2',
        category: 'payment',
        question: 'What payment methods are accepted?',
        answer: 'We accept credit/debit cards, mobile wallets (JazzCash, EasyPaisa), and bank transfers.',
        helpful: 22,
        notHelpful: 1
      },
      {
        id: '3',
        category: 'food',
        question: 'How do I track my food order?',
        answer: 'After placing an order, you\'ll receive real-time updates on your order status and can track delivery on the map.',
        helpful: 18,
        notHelpful: 3
      },
      {
        id: '4',
        category: 'cancellation',
        question: 'What is the cancellation policy?',
        answer: 'Cancellation policies vary by property. Check the specific policy on your booking confirmation.',
        helpful: 12,
        notHelpful: 5
      },
      {
        id: '5',
        category: 'booking',
        question: 'Can I modify my booking dates?',
        answer: 'Yes, you can modify your booking dates subject to the property\'s availability and modification policy. Go to My Bookings and select the booking you wish to modify.',
        helpful: 10,
        notHelpful: 1
      },
      {
        id: '6',
        category: 'payment',
        question: 'Is my payment information secure?',
        answer: 'Yes, we use industry-standard encryption and security protocols to protect your payment information. We never store your complete card details on our servers.',
        helpful: 25,
        notHelpful: 0
      },
    ];
    setFaqData(mockFAQ);
  };

  const loadSupportTickets = () => {
    const mockTickets = [
      {
        id: 'T001',
        subject: 'Booking payment issue',
        status: 'open',
        created: '2025-06-20T10:30:00Z',
        lastUpdate: '2025-06-21T14:20:00Z',
        priority: 'high'
      },
      {
        id: 'T002',
        subject: 'Food order not delivered',
        status: 'resolved',
        created: '2025-06-18T15:45:00Z',
        lastUpdate: '2025-06-19T09:15:00Z',
        priority: 'medium'
      }
    ];
    setSupportTickets(mockTickets);
  };

  const categories = [
    { id: 'all', name: 'All', icon: 'list' },
    { id: 'booking', name: 'Booking', icon: 'calendar' },
    { id: 'payment', name: 'Payment', icon: 'card' },
    { id: 'food', name: 'Food', icon: 'restaurant' },
    { id: 'cancellation', name: 'Cancellation', icon: 'close-circle' },
  ];

  const filteredFAQ = faqData.filter(item => {
    const matchesSearch = searchQuery === '' || 
      item.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.answer.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const toggleFAQ = (id) => {
    setExpandedFAQs(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const renderFAQItem = ({ item }) => {
    const isExpanded = expandedFAQs[item.id];

    return (
      <View style={styles.faqItem}>
        <TouchableOpacity 
          style={styles.faqHeader}
          onPress={() => toggleFAQ(item.id)}
        >
          <Text style={styles.faqQuestion}>{item.question}</Text>
          <Ionicons 
            name={isExpanded ? 'chevron-up' : 'chevron-down'} 
            size={20} 
            color="#7f8c8d" 
          />
        </TouchableOpacity>
        
        {isExpanded && (
          <View style={styles.faqContent}>
            <Text style={styles.faqAnswer}>{item.answer}</Text>
            <View style={styles.faqActions}>
              <Text style={styles.helpfulText}>Was this helpful?</Text>
              <TouchableOpacity style={styles.feedbackButton}>
                <Ionicons name="thumbs-up" size={16} color="#27ae60" />
                <Text style={styles.feedbackCount}>{item.helpful}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.feedbackButton}>
                <Ionicons name="thumbs-down" size={16} color="#e74c3c" />
                <Text style={styles.feedbackCount}>{item.notHelpful}</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </View>
    );
  };

  const renderTicket = ({ item }) => {
    const getStatusColor = (status) => {
      switch (status) {
        case 'open': return '#f39c12';
        case 'resolved': return '#27ae60';
        case 'closed': return '#7f8c8d';
        default: return '#3498db';
      }
    };

    const getPriorityIcon = (priority) => {
      switch (priority) {
        case 'high': return 'alert-circle';
        case 'medium': return 'alert';
        case 'low': return 'information-circle';
        default: return 'help-circle';
      }
    };

    return (
      <TouchableOpacity 
        style={styles.ticketItem}
        onPress={() => Alert.alert('Ticket Details', `Ticket ID: ${item.id}\nStatus: ${item.status}\nCreated: ${new Date(item.created).toLocaleDateString()}`)}
      >
        <View style={styles.ticketHeader}>
          <Text style={styles.ticketId}>{item.id}</Text>
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
            <Text style={styles.statusText}>{item.status}</Text>
          </View>
        </View>
        <Text style={styles.ticketSubject}>{item.subject}</Text>
        <View style={styles.ticketFooter}>
          <Text style={styles.ticketDate}>
            {new Date(item.created).toLocaleDateString()}
          </Text>
          <View style={styles.priorityContainer}>
            <Ionicons 
              name={getPriorityIcon(item.priority)} 
              size={16} 
              color={item.priority === 'high' ? '#e74c3c' : '#f39c12'} 
            />
            <Text style={styles.priorityText}>{item.priority}</Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const createTicket = () => {
    Alert.alert(
      'Create Support Ticket',
      'Would you like to create a new support ticket?',
      [
        {
          text: 'Cancel',
          style: 'cancel'
        },
        {
          text: 'Create',
          onPress: () => {
            // Navigate to ChatScreen_new instead of Chat
            try {
              navigation.navigate('ChatScreen_new', {
                chatType: 'support',
                recipientName: 'Customer Support'
              });
            } catch (error) {
              Alert.alert('Info', 'Support chat will be available soon. Please use call support option.');
            }
          }
        }
      ]
    );
  };

  const callSupport = () => {
    Alert.alert(
      'Call Support',
      'Would you like to call our support team?',
      [
        {
          text: 'Cancel',
          style: 'cancel'
        },
        {
          text: 'Call',
          onPress: () => Linking.openURL('tel:+923001234567')
        }
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Support Center</Text>
      </View>

      <View style={styles.actionButtons}>
        <TouchableOpacity style={styles.actionButton} onPress={createTicket}>
          <Ionicons name="create" size={24} color="#FFF" />
          <Text style={styles.actionText}>New Ticket</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionButton} onPress={callSupport}>
          <Ionicons name="call" size={24} color="#FFF" />
          <Text style={styles.actionText}>Call Support</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color="#7f8c8d" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search for help..."
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery !== '' && (
          <TouchableOpacity onPress={() => setSearchQuery('')}>
            <Ionicons name="close" size={20} color="#7f8c8d" />
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.categoriesContainer}>
        <ScrollView 
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoriesContent}
        >
          {categories.map(category => (
            <TouchableOpacity
              key={category.id}
              style={[
                styles.categoryButton,
                selectedCategory === category.id && styles.selectedCategory
              ]}
              onPress={() => setSelectedCategory(category.id)}
            >
              <Ionicons 
                name={category.icon} 
                size={20} 
                color={selectedCategory === category.id ? '#fff' : '#3498db'} 
              />
              <Text 
                style={[
                  styles.categoryText,
                  selectedCategory === category.id && styles.selectedCategoryText
                ]}
              >
                {category.name}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <ScrollView style={styles.contentContainer}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Frequently Asked Questions</Text>
          {filteredFAQ.length > 0 ? (
            filteredFAQ.map(item => renderFAQItem({item}))
          ) : (
            <Text style={styles.noResultsText}>No FAQs found for your search criteria</Text>
          )}
        </View>

        <View style={styles.section}>
          {/* Support Tickets */}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>My Support Tickets</Text>
          </View>
          {supportTickets.length > 0 ? (
            supportTickets.map(item => renderTicket({item}))
          ) : (
            <Text style={styles.noResultsText}>You have no active support tickets</Text>
          )}
        </View>

        <View style={styles.contactSection}>
          <Text style={styles.sectionTitle}>Contact Information</Text>
          <View style={styles.contactItem}>
            <Ionicons name="mail" size={24} color="#3498db" />
            <Text style={styles.contactText}>support@staykaru.com</Text>
          </View>
          <View style={styles.contactItem}>
            <Ionicons name="call" size={24} color="#3498db" />
            <Text style={styles.contactText}>+92 300 1234567</Text>
          </View>
          <View style={styles.contactItem}>
            <Ionicons name="time" size={24} color="#3498db" />
            <Text style={styles.contactText}>Available 24/7</Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
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
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#3498db',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
  },
  actionText: {
    color: '#fff',
    fontWeight: 'bold',
    marginLeft: 8,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 8,
    marginHorizontal: 20,
    marginTop: 16,
    paddingHorizontal: 12,
    paddingVertical: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#333',
    padding: 4,
  },
  categoriesContainer: {
    marginTop: 16,
    paddingHorizontal: 20,
  },
  categoriesContent: {
    paddingVertical: 8,
  },
  categoryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#3498db',
    marginRight: 8,
  },
  selectedCategory: {
    backgroundColor: '#3498db',
  },
  categoryText: {
    marginLeft: 8,
    fontWeight: '500',
    color: '#3498db',
  },
  selectedCategoryText: {
    color: '#fff',
  },
  contentContainer: {
    flex: 1,
    marginTop: 16,
    paddingHorizontal: 20,
  },
  section: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  noResultsText: {
    fontSize: 16,
    color: '#7f8c8d',
    textAlign: 'center',
    padding: 16,
  },
  faqItem: {
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    paddingBottom: 8,
    marginBottom: 8,
  },
  faqHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  faqQuestion: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    flex: 1,
  },
  faqContent: {
    paddingVertical: 8,
  },
  faqAnswer: {
    fontSize: 15,
    lineHeight: 22,
    color: '#555',
  },
  faqActions: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
  },
  helpfulText: {
    fontSize: 14,
    color: '#7f8c8d',
    marginRight: 12,
  },
  feedbackButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 8,
  },
  feedbackCount: {
    marginLeft: 4,
    fontSize: 14,
    color: '#7f8c8d',
  },
  ticketItem: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  ticketHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  ticketId: {
    fontSize: 14,
    fontWeight: '500',
    color: '#7f8c8d',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#fff',
    textTransform: 'uppercase',
  },
  ticketSubject: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  ticketFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  ticketDate: {
    fontSize: 13,
    color: '#7f8c8d',
  },
  priorityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  priorityText: {
    fontSize: 13,
    color: '#7f8c8d',
    marginLeft: 4,
    textTransform: 'capitalize',
  },
  contactSection: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 24,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  contactText: {
    marginLeft: 12,
    fontSize: 16,
    color: '#333',
  },
});

export default SupportScreen_new;
