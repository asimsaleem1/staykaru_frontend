import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, Modal, RefreshControl, ScrollView
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../utils/constants';

const API_BASE = 'https://staykaru-backend-60ed08adb2a7.herokuapp.com/api/admin';

const BookingManagementScreen = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [selected, setSelected] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [analytics, setAnalytics] = useState(null);
  const [statusFilter, setStatusFilter] = useState('all');

  const fetchBookings = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/bookings?status=${statusFilter}`);
      const data = await res.json();
      setBookings(data?.bookings || []);
    } catch (e) {
      setError('Failed to load bookings.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const fetchAnalytics = async () => {
    try {
      const res = await fetch(`${API_BASE}/analytics/bookings`);
      const data = await res.json();
      setAnalytics(data);
    } catch {}
  };

  useEffect(() => {
    fetchBookings();
    fetchAnalytics();
  }, [statusFilter]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchBookings();
    fetchAnalytics();
  };

  const openModal = (item) => {
    setSelected(item);
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
    setSelected(null);
  };

  const cancelBooking = async (id) => {
    await fetch(`${API_BASE}/bookings/${id}/cancel`, { method: 'PUT' });
    fetchBookings();
    closeModal();
  };

  const renderBooking = ({ item }) => (
    <TouchableOpacity style={styles.row} onPress={() => openModal(item)}>
      <Ionicons name="calendar" size={28} color={COLORS.primary} />
      <View style={{ flex: 1, marginLeft: 12 }}>
        <Text style={styles.name}>{item.accommodationName || 'Accommodation'}</Text>
        <Text style={styles.status}>{item.status}</Text>
        <Text style={styles.dates}>{item.checkIn} - {item.checkOut}</Text>
        <Text style={styles.user}>{item.userName}</Text>
      </View>
      <Ionicons name="chevron-forward" size={20} color="#888" />
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Loading Bookings...</Text>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity onPress={fetchBookings} style={styles.retryBtn}>
          <Text style={styles.retryText}>Retry</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Booking Management</Text>
        <View style={styles.filterRow}>
          {['all', 'confirmed', 'pending', 'cancelled', 'completed'].map(status => (
            <TouchableOpacity
              key={status}
              style={[styles.filterBtn, statusFilter === status && styles.filterBtnActive]}
              onPress={() => setStatusFilter(status)}
            >
              <Text style={statusFilter === status ? styles.filterTextActive : styles.filterText}>{status}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
      <FlatList
        data={bookings}
        keyExtractor={item => item._id}
        renderItem={renderBooking}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        ListEmptyComponent={<Text style={styles.emptyText}>No bookings found.</Text>}
      />
      {/* Modal for details and actions */}
      <Modal visible={modalVisible} animationType="slide" onRequestClose={closeModal}>
        <SafeAreaView style={styles.modalContainer}>
          <TouchableOpacity onPress={closeModal} style={styles.closeBtn}>
            <Ionicons name="close" size={28} color="#333" />
          </TouchableOpacity>
          {selected && (
            <ScrollView style={styles.details}>
              <Text style={styles.detailTitle}>Booking Details</Text>
              <Text style={styles.detailText}>Accommodation: {selected.accommodationName}</Text>
              <Text style={styles.detailText}>User: {selected.userName}</Text>
              <Text style={styles.detailText}>Status: {selected.status}</Text>
              <Text style={styles.detailText}>Check-in: {selected.checkIn}</Text>
              <Text style={styles.detailText}>Check-out: {selected.checkOut}</Text>
              <Text style={styles.detailText}>Total: ${selected.totalAmount}</Text>
              <Text style={styles.detailText}>Created: {selected.createdAt}</Text>
              {/* Booking Timeline */}
              <View style={styles.timelineSection}>
                <Text style={styles.sectionTitle}>Booking Timeline</Text>
                <View style={styles.timelineItem}>
                  <Ionicons name="checkmark-circle" size={20} color="#34C759" />
                  <Text style={styles.timelineText}>Booking created</Text>
                </View>
                <View style={styles.timelineItem}>
                  <Ionicons name="checkmark-circle" size={20} color="#34C759" />
                  <Text style={styles.timelineText}>Payment confirmed</Text>
                </View>
                <View style={styles.timelineItem}>
                  <Ionicons name="time" size={20} color="#FF9500" />
                  <Text style={styles.timelineText}>Check-in pending</Text>
                </View>
              </View>
              {/* Actions */}
              {selected.status === 'confirmed' && (
                <TouchableOpacity style={styles.cancelBtn} onPress={() => cancelBooking(selected._id)}>
                  <Ionicons name="close-circle" size={22} color="#FF3B30" />
                  <Text style={styles.cancelText}>Cancel Booking</Text>
                </TouchableOpacity>
              )}
            </ScrollView>
          )}
        </SafeAreaView>
      </Modal>
      {/* Analytics */}
      <View style={styles.statsSection}>
        <Text style={styles.sectionTitle}>Booking Analytics</Text>
        <Text>Total Bookings: {analytics?.totalBookings || 0}</Text>
        <Text>Confirmed: {analytics?.confirmed || 0}</Text>
        <Text>Pending: {analytics?.pending || 0}</Text>
        <Text>Cancelled: {analytics?.cancelled || 0}</Text>
        <Text>Revenue: ${analytics?.totalRevenue || 0}</Text>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F9FB' },
  header: { padding: 16, backgroundColor: COLORS.primary, borderBottomLeftRadius: 16, borderBottomRightRadius: 16 },
  title: { fontSize: 24, fontWeight: 'bold', color: '#fff', marginBottom: 8 },
  filterRow: { flexDirection: 'row', marginTop: 8 },
  filterBtn: { padding: 8, borderRadius: 8, backgroundColor: '#fff', marginRight: 8 },
  filterBtnActive: { backgroundColor: COLORS.secondary },
  filterText: { color: COLORS.primary },
  filterTextActive: { color: '#fff', fontWeight: 'bold' },
  row: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', marginHorizontal: 8, marginVertical: 4, padding: 12, borderRadius: 10, elevation: 1 },
  name: { fontWeight: 'bold', fontSize: 16 },
  status: { color: COLORS.secondary, fontSize: 13 },
  dates: { color: '#888', fontSize: 13 },
  user: { color: '#888', fontSize: 13 },
  loadingText: { marginTop: 16, color: COLORS.primary, fontSize: 16 },
  errorText: { color: 'red', fontSize: 16, textAlign: 'center', marginTop: 32 },
  retryBtn: { marginTop: 16, alignSelf: 'center', backgroundColor: COLORS.primary, padding: 10, borderRadius: 8 },
  retryText: { color: '#fff', fontWeight: 'bold' },
  emptyText: { color: '#888', textAlign: 'center', marginTop: 12 },
  modalContainer: { flex: 1, backgroundColor: '#fff', padding: 16 },
  closeBtn: { alignSelf: 'flex-end' },
  details: { marginTop: 24 },
  detailTitle: { fontSize: 22, fontWeight: 'bold', marginBottom: 8 },
  detailText: { fontSize: 16, marginBottom: 4 },
  timelineSection: { marginTop: 16 },
  sectionTitle: { fontWeight: 'bold', fontSize: 16, marginBottom: 8 },
  timelineItem: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  timelineText: { marginLeft: 8, color: '#333' },
  cancelBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FF3B30', padding: 12, borderRadius: 8, marginTop: 16, justifyContent: 'center' },
  cancelText: { color: '#fff', fontWeight: 'bold', marginLeft: 8 },
  statsSection: { backgroundColor: '#fff', margin: 12, borderRadius: 10, padding: 12, elevation: 1 },
});

export default BookingManagementScreen; 