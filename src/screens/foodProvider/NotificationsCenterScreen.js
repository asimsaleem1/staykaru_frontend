import React, { useEffect, useState } from 'react';
import { View, Text, Button, ScrollView, StyleSheet, RefreshControl, TouchableOpacity } from 'react-native';
import foodProviderApiService from '../../services/foodProviderApiService.js';

export default function NotificationsCenterScreen() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  const fetchNotifications = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await foodProviderApiService.getNotifications();
      setNotifications(data.notifications || data);
    } catch (e) {
      setError(e.message);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchNotifications();
    setRefreshing(false);
  };

  const markAsRead = async (notificationId) => {
    try {
      await foodProviderApiService.markNotificationRead(notificationId);
      fetchNotifications();
    } catch (e) {
      setError(e.message);
    }
  };

  return (
    <ScrollView style={styles.container} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}>
      <Text style={styles.title}>Notifications Center</Text>
      {loading && <Text style={styles.loading}>Loading...</Text>}
      {error && <Text style={styles.error}>{error}</Text>}
      {notifications.length === 0 && <Text>No notifications</Text>}
      {notifications.map((notif, idx) => (
        <View key={notif._id || notif.id || idx} style={[styles.notificationCard, notif.read && styles.readNotification]}>
          <Text style={styles.notificationTitle}>{notif.title || notif.message}</Text>
          <Text style={styles.notificationTime}>{notif.createdAt ? new Date(notif.createdAt).toLocaleString() : ''}</Text>
          {!notif.read && (
            <TouchableOpacity onPress={() => markAsRead(notif._id || notif.id)} style={styles.markReadBtn}>
              <Text style={{ color: 'white' }}>Mark as Read</Text>
            </TouchableOpacity>
          )}
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', padding: 16 },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 16 },
  loading: { fontSize: 16, color: '#888' },
  error: { color: 'red', marginBottom: 8 },
  notificationCard: { backgroundColor: '#e9f7ef', padding: 12, borderRadius: 8, marginBottom: 10 },
  readNotification: { backgroundColor: '#f4f4f4' },
  notificationTitle: { fontWeight: 'bold', fontSize: 16 },
  notificationTime: { color: '#888', fontSize: 12, marginBottom: 6 },
  markReadBtn: { backgroundColor: '#3498db', padding: 6, borderRadius: 6, alignSelf: 'flex-start' },
}); 