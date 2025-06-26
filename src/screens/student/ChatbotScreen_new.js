import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const ChatbotScreen_new = ({ navigation }) => {
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: "Hi! I'm StayKaru Assistant. How can I help you today?",
      isBot: true,
      timestamp: new Date(),
    },
  ]);
  const [inputText, setInputText] = useState('');

  const quickActions = [
    { id: 1, text: "Find Accommodations", action: "accommodation" },
    { id: 2, text: "Order Food", action: "food" },
    { id: 3, text: "Check Bookings", action: "bookings" },
    { id: 4, text: "Help & Support", action: "help" },
  ];

  const handleQuickAction = (action) => {
    let response = "";
    switch (action) {
      case "accommodation":
        response = "I'll help you find accommodations! You can browse our available properties, filter by price, location, and amenities. Would you like to see the accommodation list?";
        navigation.navigate('AccommodationsList');
        break;
      case "food":
        response = "Great! I can help you order food from nearby restaurants. You can browse menus, check ratings, and place orders. Would you like to see food providers?";
        navigation.navigate('FoodProvidersList');
        break;
      case "bookings":
        response = "Let me show you your current bookings and their status.";
        navigation.navigate('MyBookings');
        break;
      case "help":
        response = "I'm here to help! You can ask me about accommodations, food ordering, bookings, payments, or any other features of the app.";
        break;
    }

    const botMessage = {
      id: messages.length + 1,
      text: response,
      isBot: true,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, botMessage]);
  };

  const sendMessage = () => {
    if (!inputText.trim()) return;

    const userMessage = {
      id: messages.length + 1,
      text: inputText,
      isBot: false,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);

    // Simple bot response logic
    setTimeout(() => {
      const botResponse = generateBotResponse(inputText);
      const botMessage = {
        id: messages.length + 2,
        text: botResponse,
        isBot: true,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, botMessage]);
    }, 1000);

    setInputText('');
  };

  const generateBotResponse = (input) => {
    const lowerInput = input.toLowerCase();
    
    if (lowerInput.includes('accommodation') || lowerInput.includes('room') || lowerInput.includes('stay')) {
      return "I can help you find the perfect accommodation! We have various options including shared rooms, private rooms, and studios. Would you like me to show you available properties?";
    }
    
    if (lowerInput.includes('food') || lowerInput.includes('order') || lowerInput.includes('restaurant')) {
      return "Our food delivery service connects you with local restaurants! You can browse menus, read reviews, and order your favorite meals. Shall I show you nearby food providers?";
    }
    
    if (lowerInput.includes('booking') || lowerInput.includes('reservation')) {
      return "I can help you manage your bookings. You can view current bookings, check status, or make modifications. Would you like to see your booking history?";
    }
    
    if (lowerInput.includes('payment') || lowerInput.includes('pay')) {
      return "We support secure payments through various methods including cards and digital wallets. All transactions are encrypted and secure.";
    }
    
    if (lowerInput.includes('help') || lowerInput.includes('support')) {
      return "I'm here to assist you with any questions about accommodations, food ordering, bookings, or app features. What specific help do you need?";
    }
    
    return "I understand you're asking about: " + input + ". Could you please be more specific so I can better assist you? You can also use the quick action buttons below for common tasks.";
  };

  const renderMessage = (message) => (
    <View
      key={message.id}
      style={[
        styles.messageContainer,
        message.isBot ? styles.botMessage : styles.userMessage,
      ]}
    >
      <Text style={[
        styles.messageText,
        message.isBot ? styles.botText : styles.userText,
      ]}>
        {message.text}
      </Text>
      <Text style={styles.timestamp}>
        {message.timestamp.toLocaleTimeString()}
      </Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>StayKaru Assistant</Text>
          <Text style={styles.headerSubtitle}>Online</Text>
        </View>
      </View>

      <ScrollView 
        style={styles.messagesContainer} 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 20 }}
        ref={ref => { this.scrollView = ref; }}
        onContentSizeChange={() => this.scrollView.scrollToEnd({ animated: true })}
      >
        {messages.map(renderMessage)}
      </ScrollView>

      <View style={styles.quickActionsContainer}>
        <Text style={styles.quickActionsTitle}>Quick Actions</Text>
        <View style={styles.quickActions}>
          {quickActions.map((action) => (
            <TouchableOpacity
              key={action.id}
              style={styles.quickActionButton}
              onPress={() => handleQuickAction(action.action)}
            >
              <Text style={styles.quickActionText}>{action.text}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.textInput}
          value={inputText}
          onChangeText={setInputText}
          placeholder="Type your message..."
          multiline
          maxLength={500}
        />
        <TouchableOpacity
          style={styles.sendButton}
          onPress={sendMessage}
        >
          <Ionicons name="send" size={20} color="#FFF" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  header: {
    backgroundColor: '#FFF',
    paddingTop: 50,
    paddingHorizontal: 16,
    paddingBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#E9ECEF',
  },
  backButton: {
    marginRight: 16,
  },
  headerContent: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#28A745',
    marginTop: 2,
  },
  messagesContainer: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  messageContainer: {
    marginVertical: 4,
    maxWidth: '80%',
    padding: 12,
    borderRadius: 16,
  },
  botMessage: {
    backgroundColor: '#FFF',
    alignSelf: 'flex-start',
    borderBottomLeftRadius: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  userMessage: {
    backgroundColor: '#007BFF',
    alignSelf: 'flex-end',
    borderBottomRightRadius: 4,
  },
  messageText: {
    fontSize: 16,
    lineHeight: 20,
  },
  botText: {
    color: '#333',
  },
  userText: {
    color: '#FFF',
  },
  timestamp: {
    fontSize: 12,
    color: '#6C757D',
    marginTop: 4,
    alignSelf: 'flex-end',
  },
  quickActionsContainer: {
    backgroundColor: '#FFF',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#E9ECEF',
  },
  quickActionsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  quickActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  quickActionButton: {
    backgroundColor: '#F8F9FA',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#DEE2E6',
    margin: 4,
  },
  quickActionText: {
    fontSize: 12,
    color: '#495057',
    fontWeight: '500',
  },
  inputContainer: {
    backgroundColor: '#FFF',
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#E9ECEF',
  },
  textInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#DEE2E6',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 8,
    maxHeight: 100,
    fontSize: 16,
  },
  sendButton: {
    backgroundColor: '#007BFF',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default ChatbotScreen_new;
