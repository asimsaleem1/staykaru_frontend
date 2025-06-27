import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput, Modal, FlatList
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../utils/constants';

const API_BASE = 'https://staykaru-backend-60ed08adb2a7.herokuapp.com/api/admin';

const NotificationManagementScreen = () => {
  const [composerVisible, setComposerVisible] = useState(false);
  const [historyVisible, setHistoryVisible] = useState(false);
  const [notification, setNotification] = useState({
    title: '',
    message: '',
    type: 'broadcast',
    targetUsers: 'all'
  });
  const [notificationHistory, setNotificationHistory] = useState([]);
  const [templates, setTemplates] = useState([
    { id: 1, name: 'Welcome Message', title: 'Welcome to StayKaru!', message: 'Thank you for joining our platform.' },
    { id: 2, name: 'Maintenance Notice', title: 'Scheduled Maintenance', message: 'We will be performing maintenance on our platform.' },
    { id: 3, name: 'Promotion', title: 'Special Offer!', message: 'Get 20% off your next booking!' },
  ]);

  const sendNotification = async () => {
    try {
      const endpoint = notification.type === 'broadcast' 
        ? `${API_BASE}/notifications/broadcast`
        : `${API_BASE}/notifications/targeted`;
      
      await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(notification)
      });
      
      setComposerVisible(false);
      setNotification({ title: '', message: '', type: 'broadcast', targetUsers: 'all' });
    } catch (e) {
      console.error('Failed to send notification:', e);
    }
  };

  const useTemplate = (template) => {
    setNotification({
      ...notification,
      title: template.title,
      message: template.message
    });
  };

  const targetOptions = [
    { id: 'all', name: 'All Users', icon: 'people' },
    { id: 'students', name: 'Students Only', icon: 'school' },
    { id: 'landlords', name: 'Landlords Only', icon: 'home' },
    { id: 'food_providers', name: 'Food Providers Only', icon: 'restaurant' },
  ];

  const notificationTypes = [
    { id: 'broadcast', name: 'Broadcast', icon: 'megaphone' },
    { id: 'targeted', name: 'Targeted', icon: 'person' },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.title}>Notification Management</Text>
        </View>

        {/* Quick Actions */}
        <View style={styles.actionsCard}>
          <Text style={styles.cardTitle}>Quick Actions</Text>
          <View style={styles.actionRow}>
            <TouchableOpacity style={styles.actionBtn} onPress={() => setComposerVisible(true)}>
              <Ionicons name="add-circle" size={24} color="#fff" />
              <Text style={styles.actionText}>Send Notification</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionBtn} onPress={() => setHistoryVisible(true)}>
              <Ionicons name="time" size={24} color="#fff" />
              <Text style={styles.actionText}>View History</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Templates */}
        <View style={styles.templatesCard}>
          <Text style={styles.cardTitle}>Notification Templates</Text>
          {templates.map(template => (
            <TouchableOpacity
              key={template.id}
              style={styles.templateItem}
              onPress={() => useTemplate(template)}
            >
              <Ionicons name="document-text" size={24} color={COLORS.primary} />
              <View style={styles.templateInfo}>
                <Text style={styles.templateName}>{template.name}</Text>
                <Text style={styles.templatePreview}>{template.title}</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#888" />
            </TouchableOpacity>
          ))}
        </View>

        {/* Statistics */}
        <View style={styles.statsCard}>
          <Text style={styles.cardTitle}>Notification Statistics</Text>
          <View style={styles.statRow}>
            <View style={styles.stat}>
              <Text style={styles.statValue}>1,234</Text>
              <Text style={styles.statLabel}>Sent Today</Text>
            </View>
            <View style={styles.stat}>
              <Text style={styles.statValue}>98%</Text>
              <Text style={styles.statLabel}>Delivery Rate</Text>
            </View>
            <View style={styles.stat}>
              <Text style={styles.statValue}>45%</Text>
              <Text style={styles.statLabel}>Open Rate</Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Notification Composer Modal */}
      <Modal visible={composerVisible} animationType="slide">
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Send Notification</Text>
            <TouchableOpacity onPress={() => setComposerVisible(false)}>
              <Ionicons name="close" size={28} color="#333" />
            </TouchableOpacity>
          </View>
          <ScrollView style={styles.modalContent}>
            {/* Notification Type */}
            <View style={styles.inputSection}>
              <Text style={styles.inputLabel}>Notification Type</Text>
              <View style={styles.typeRow}>
                {notificationTypes.map(type => (
                  <TouchableOpacity
                    key={type.id}
                    style={[styles.typeBtn, notification.type === type.id && styles.typeBtnActive]}
                    onPress={() => setNotification({ ...notification, type: type.id })}
                  >
                    <Ionicons name={type.icon} size={20} color={notification.type === type.id ? '#fff' : COLORS.primary} />
                    <Text style={[styles.typeText, notification.type === type.id && styles.typeTextActive]}>
                      {type.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Target Users */}
            {notification.type === 'targeted' && (
              <View style={styles.inputSection}>
                <Text style={styles.inputLabel}>Target Users</Text>
                <View style={styles.targetGrid}>
                  {targetOptions.map(option => (
                    <TouchableOpacity
                      key={option.id}
                      style={[styles.targetBtn, notification.targetUsers === option.id && styles.targetBtnActive]}
                      onPress={() => setNotification({ ...notification, targetUsers: option.id })}
                    >
                      <Ionicons name={option.icon} size={20} color={notification.targetUsers === option.id ? '#fff' : COLORS.primary} />
                      <Text style={[styles.targetText, notification.targetUsers === option.id && styles.targetTextActive]}>
                        {option.name}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            )}

            {/* Title */}
            <View style={styles.inputSection}>
              <Text style={styles.inputLabel}>Title</Text>
              <TextInput
                style={styles.textInput}
                value={notification.title}
                onChangeText={(text) => setNotification({ ...notification, title: text })}
                placeholder="Enter notification title"
              />
            </View>

            {/* Message */}
            <View style={styles.inputSection}>
              <Text style={styles.inputLabel}>Message</Text>
              <TextInput
                style={[styles.textInput, styles.messageInput]}
                value={notification.message}
                onChangeText={(text) => setNotification({ ...notification, message: text })}
                placeholder="Enter notification message"
                multiline
                numberOfLines={4}
              />
            </View>

            {/* Send Button */}
            <TouchableOpacity style={styles.sendBtn} onPress={sendNotification}>
              <Ionicons name="send" size={20} color="#fff" />
              <Text style={styles.sendText}>Send Notification</Text>
            </TouchableOpacity>
          </ScrollView>
        </SafeAreaView>
      </Modal>

      {/* History Modal */}
      <Modal visible={historyVisible} animationType="slide">
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Notification History</Text>
            <TouchableOpacity onPress={() => setHistoryVisible(false)}>
              <Ionicons name="close" size={28} color="#333" />
            </TouchableOpacity>
          </View>
          <FlatList
            data={notificationHistory}
            keyExtractor={(_, i) => i.toString()}
            renderItem={({ item }) => (
              <View style={styles.historyItem}>
                <Text style={styles.historyTitle}>{item.title}</Text>
                <Text style={styles.historyDate}>{item.date}</Text>
                <Text style={styles.historyStatus}>{item.status}</Text>
              </View>
            )}
            ListEmptyComponent={<Text style={styles.emptyText}>No notification history</Text>}
          />
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F9FB' },
  scrollContent: { padding: 16 },
  header: { padding: 16, backgroundColor: COLORS.primary, borderRadius: 16, marginBottom: 16 },
  title: { fontSize: 24, fontWeight: 'bold', color: '#fff' },
  actionsCard: { backgroundColor: '#fff', borderRadius: 12, padding: 16, marginBottom: 12, elevation: 2 },
  cardTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 12 },
  actionRow: { flexDirection: 'row', justifyContent: 'space-between' },
  actionBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.primary, padding: 12, borderRadius: 8, marginHorizontal: 4, justifyContent: 'center' },
  actionText: { color: '#fff', fontWeight: 'bold', marginLeft: 8 },
  templatesCard: { backgroundColor: '#fff', borderRadius: 12, padding: 16, marginBottom: 12, elevation: 2 },
  templateItem: { flexDirection: 'row', alignItems: 'center', padding: 12, borderRadius: 8, backgroundColor: '#F8F9FB', marginBottom: 8 },
  templateInfo: { flex: 1, marginLeft: 12 },
  templateName: { fontWeight: 'bold', fontSize: 16 },
  templatePreview: { color: '#888', fontSize: 14 },
  statsCard: { backgroundColor: '#fff', borderRadius: 12, padding: 16, marginBottom: 12, elevation: 2 },
  statRow: { flexDirection: 'row', justifyContent: 'space-between' },
  stat: { alignItems: 'center' },
  statValue: { fontSize: 20, fontWeight: 'bold', color: COLORS.primary },
  statLabel: { color: '#888', fontSize: 12 },
  modalContainer: { flex: 1, backgroundColor: '#fff' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, borderBottomWidth: 1, borderBottomColor: '#E0E0E0' },
  modalTitle: { fontSize: 20, fontWeight: 'bold' },
  modalContent: { padding: 16 },
  inputSection: { marginBottom: 16 },
  inputLabel: { fontSize: 16, fontWeight: 'bold', marginBottom: 8 },
  typeRow: { flexDirection: 'row', justifyContent: 'space-between' },
  typeBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', backgroundColor: '#F1F1F1', padding: 12, borderRadius: 8, marginHorizontal: 4, justifyContent: 'center' },
  typeBtnActive: { backgroundColor: COLORS.primary },
  typeText: { marginLeft: 6, color: COLORS.primary, fontWeight: 'bold' },
  typeTextActive: { color: '#fff' },
  targetGrid: { flexDirection: 'row', flexWrap: 'wrap' },
  targetBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F1F1F1', padding: 8, borderRadius: 6, margin: 4 },
  targetBtnActive: { backgroundColor: COLORS.primary },
  targetText: { marginLeft: 4, color: COLORS.primary, fontSize: 12 },
  targetTextActive: { color: '#fff' },
  textInput: { borderWidth: 1, borderColor: '#E0E0E0', borderRadius: 8, padding: 12, fontSize: 16 },
  messageInput: { height: 100, textAlignVertical: 'top' },
  sendBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.primary, padding: 16, borderRadius: 8, justifyContent: 'center', marginTop: 16 },
  sendText: { color: '#fff', fontWeight: 'bold', marginLeft: 8 },
  historyItem: { padding: 12, borderBottomWidth: 1, borderBottomColor: '#E0E0E0' },
  historyTitle: { fontWeight: 'bold', fontSize: 16 },
  historyDate: { color: '#888', fontSize: 12 },
  historyStatus: { color: COLORS.primary, fontSize: 12 },
  emptyText: { textAlign: 'center', color: '#888', marginTop: 32 },
});

export default NotificationManagementScreen; 