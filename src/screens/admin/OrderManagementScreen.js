import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, Modal, RefreshControl, ScrollView
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../utils/constants';

const API_BASE = 'https://staykaru-backend-60ed08adb2a7.herokuapp.com/api/admin';

const OrderManagementScreen = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [selected, setSelected] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [analytics, setAnalytics] = useState(null);
  const [statusFilter, setStatusFilter] = useState('all');

  const fetchOrders = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/orders?status=${statusFilter}`);
      const data = await res.json();
      setOrders(data?.orders || []);
    } catch (e) {
      setError('Failed to load orders.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const fetchAnalytics = async () => {
    try {
      const res = await fetch(`${API_BASE}/analytics/orders`);
      const data = await res.json();
      setAnalytics(data);
    } catch {}
  };

  useEffect(() => {
    fetchOrders();
    fetchAnalytics();
  }, [statusFilter]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchOrders();
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

  const renderOrder = ({ item }) => (
    <TouchableOpacity style={styles.row} onPress={() => openModal(item)}>
      <Ionicons name="fast-food" size={28} color={COLORS.primary} />
      <View style={{ flex: 1, marginLeft: 12 }}>
        <Text style={styles.name}>Order #{item.orderNumber}</Text>
        <Text style={styles.status}>{item.status}</Text>
        <Text style={styles.customer}>{item.customerName}</Text>
        <Text style={styles.amount}>${item.totalAmount}</Text>
      </View>
      <Ionicons name="chevron-forward" size={20} color="#888" />
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Loading Orders...</Text>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity onPress={fetchOrders} style={styles.retryBtn}>
          <Text style={styles.retryText}>Retry</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Order Management</Text>
        <View style={styles.filterRow}>
          {['all', 'pending', 'confirmed', 'preparing', 'out_for_delivery', 'delivered', 'cancelled'].map(status => (
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
        data={orders}
        keyExtractor={item => item._id}
        renderItem={renderOrder}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        ListEmptyComponent={<Text style={styles.emptyText}>No orders found.</Text>}
      />
      {/* Modal for details and actions */}
      <Modal visible={modalVisible} animationType="slide" onRequestClose={closeModal}>
        <SafeAreaView style={styles.modalContainer}>
          <TouchableOpacity onPress={closeModal} style={styles.closeBtn}>
            <Ionicons name="close" size={28} color="#333" />
          </TouchableOpacity>
          {selected && (
            <ScrollView style={styles.details}>
              <Text style={styles.detailTitle}>Order #{selected.orderNumber}</Text>
              <Text style={styles.detailText}>Customer: {selected.customerName}</Text>
              <Text style={styles.detailText}>Status: {selected.status}</Text>
              <Text style={styles.detailText}>Total: ${selected.totalAmount}</Text>
              <Text style={styles.detailText}>Created: {selected.createdAt}</Text>
              <Text style={styles.detailText}>Provider: {selected.providerName}</Text>
              {/* Order Items */}
              <View style={styles.itemsSection}>
                <Text style={styles.sectionTitle}>Order Items</Text>
                {selected.items?.map((item, index) => (
                  <View key={index} style={styles.itemRow}>
                    <Text style={styles.itemName}>{item.name}</Text>
                    <Text style={styles.itemQty}>x{item.quantity}</Text>
                    <Text style={styles.itemPrice}>${item.price}</Text>
                  </View>
                ))}
              </View>
              {/* Delivery Tracking */}
              <View style={styles.trackingSection}>
                <Text style={styles.sectionTitle}>Delivery Tracking</Text>
                <View style={styles.trackingItem}>
                  <Ionicons name="checkmark-circle" size={20} color="#34C759" />
                  <Text style={styles.trackingText}>Order placed</Text>
                </View>
                <View style={styles.trackingItem}>
                  <Ionicons name="checkmark-circle" size={20} color="#34C759" />
                  <Text style={styles.trackingText}>Payment confirmed</Text>
                </View>
                <View style={styles.trackingItem}>
                  <Ionicons name="time" size={20} color="#FF9500" />
                  <Text style={styles.trackingText}>Preparing order</Text>
                </View>
                <View style={styles.trackingItem}>
                  <Ionicons name="car" size={20} color="#007AFF" />
                  <Text style={styles.trackingText}>Out for delivery</Text>
                </View>
              </View>
            </ScrollView>
          )}
        </SafeAreaView>
      </Modal>
      {/* Analytics */}
      <View style={styles.statsSection}>
        <Text style={styles.sectionTitle}>Order Analytics</Text>
        <Text>Total Orders: {analytics?.totalOrders || 0}</Text>
        <Text>Pending: {analytics?.pending || 0}</Text>
        <Text>Delivered: {analytics?.delivered || 0}</Text>
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
  customer: { color: '#888', fontSize: 13 },
  amount: { color: '#34C759', fontSize: 13, fontWeight: 'bold' },
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
  itemsSection: { marginTop: 16 },
  sectionTitle: { fontWeight: 'bold', fontSize: 16, marginBottom: 8 },
  itemRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  itemName: { flex: 1 },
  itemQty: { marginHorizontal: 8 },
  itemPrice: { fontWeight: 'bold' },
  trackingSection: { marginTop: 16 },
  trackingItem: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  trackingText: { marginLeft: 8, color: '#333' },
  statsSection: { backgroundColor: '#fff', margin: 12, borderRadius: 10, padding: 12, elevation: 1 },
});

export default OrderManagementScreen; 