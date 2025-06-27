import React, { useEffect, useState } from 'react';
import { View, Text, Button, ScrollView, StyleSheet, Alert } from 'react-native';
import foodProviderApiService from '../../services/foodProviderApiService.js';

export default function OrderDetailsScreen({ route, navigation }) {
  const { orderId } = route.params || {};
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchOrder = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await foodProviderApiService.getOrderDetails(orderId);
      setOrder(data.order || data);
    } catch (e) {
      setError(e.message);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (orderId) fetchOrder();
  }, [orderId]);

  const updateStatus = async (status) => {
    try {
      await foodProviderApiService.updateOrderStatus(orderId, status);
      fetchOrder();
      Alert.alert('Order status updated');
    } catch (e) {
      Alert.alert('Error', e.message);
    }
  };

  if (!orderId) return <View style={styles.container}><Text>No order selected</Text></View>;

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Order Details</Text>
      {loading && <Text style={styles.loading}>Loading...</Text>}
      {error && <Text style={styles.error}>{error}</Text>}
      {order && (
        <View>
          <Text style={styles.label}>Order #{order.orderNumber || order._id || order.id}</Text>
          <Text>Status: {order.status}</Text>
          <Text>Total: {order.totalAmount || order.total}</Text>
          <Text>Customer: {order.customer?.name || ''}</Text>
          <Text>Phone: {order.customer?.phone || ''}</Text>
          <Text>Address: {order.deliveryAddress?.address || ''}</Text>
          <Text style={styles.label}>Items:</Text>
          {(order.items || []).map((item, idx) => (
            <Text key={idx}>- {item.menuItem?.name || item.name} x{item.quantity} ({item.menuItem?.price || item.price})</Text>
          ))}
          <Text style={styles.label}>Status Timeline:</Text>
          {(order.statusHistory || []).map((s, idx) => (
            <Text key={idx}>{s.status} at {new Date(s.timestamp).toLocaleString()} {s.note ? `- ${s.note}` : ''}</Text>
          ))}
          <View style={{ flexDirection: 'row', marginTop: 16 }}>
            <Button title="Preparing" onPress={() => updateStatus('preparing')} />
            <View style={{ width: 8 }} />
            <Button title="Ready" onPress={() => updateStatus('ready')} />
            <View style={{ width: 8 }} />
            <Button title="Delivered" onPress={() => updateStatus('delivered')} />
          </View>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', padding: 16 },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 16 },
  loading: { fontSize: 16, color: '#888' },
  error: { color: 'red', marginBottom: 8 },
  label: { fontWeight: 'bold', marginTop: 12 },
}); 