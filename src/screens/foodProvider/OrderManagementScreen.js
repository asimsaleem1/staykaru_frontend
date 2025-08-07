import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  RefreshControl,
  StatusBar,
  Dimensions,
  ScrollView,
  ActivityIndicator
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import foodProviderApiService from '../../services/foodProviderApiService.js';

const { width } = Dimensions.get('window');

export default function OrderManagementScreen() {
  const navigation = useNavigation();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [selectedFilter, setSelectedFilter] = useState('all');

  const filters = [
    { key: 'all', label: 'All Orders', icon: 'list-outline' },
    { key: 'pending', label: 'Pending', icon: 'time-outline' },
    { key: 'confirmed', label: 'Confirmed', icon: 'checkmark-circle-outline' },
    { key: 'preparing', label: 'Preparing', icon: 'restaurant-outline' },
    { key: 'ready', label: 'Ready', icon: 'checkmark-done-circle-outline' },
    { key: 'delivered', label: 'Delivered', icon: 'car-outline' },
    { key: 'cancelled', label: 'Cancelled', icon: 'close-circle-outline' }
  ];

  const fetchOrders = useCallback(async () => {
    try {
      setError(null);
      const params = selectedFilter !== 'all' ? { status: selectedFilter } : {};
      const response = await foodProviderApiService.getOrders(params);
      setOrders(response.orders || response || []);
    } catch (error) {
      console.error('Failed to fetch orders:', error);
      setError('Unable to load orders. Please try again.');
      setOrders([]);
    } finally {
      setLoading(false);
    }
  }, [selectedFilter]);

  useFocusEffect(
    React.useCallback(() => {
      fetchOrders();
    }, [fetchOrders])
  );

  // Set up real-time updates
  useEffect(() => {
    const interval = setInterval(fetchOrders, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, [fetchOrders]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchOrders();
    setRefreshing(false);
  }, [fetchOrders]);

  const handleStatusUpdate = useCallback(async (orderId, newStatus, orderNumber) => {
    try {
      await foodProviderApiService.updateOrderStatus(orderId, newStatus);
      Alert.alert('Success', `Order #${orderNumber} status updated to ${newStatus}`);
      fetchOrders(); // Refresh the list
    } catch (error) {
      console.error('Failed to update order status:', error);
      Alert.alert('Error', 'Failed to update order status. Please try again.');
    }
  }, [fetchOrders]);

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'pending': return '#FFA500';
      case 'confirmed': return '#007AFF';
      case 'preparing': return '#FF9500';
      case 'ready': return '#34C759';
      case 'delivered': return '#30D158';
      case 'cancelled': return '#FF3B30';
      default: return '#8E8E93';
    }
  };

  const getStatusIcon = (status) => {
    switch (status?.toLowerCase()) {
      case 'pending': return 'time-outline';
      case 'confirmed': return 'checkmark-circle-outline';
      case 'preparing': return 'restaurant-outline';
      case 'ready': return 'checkmark-done-circle-outline';
      case 'delivered': return 'car-outline';
      case 'cancelled': return 'close-circle-outline';
      default: return 'help-circle-outline';
    }
  };

  const getNextStatus = (currentStatus) => {
    switch (currentStatus?.toLowerCase()) {
      case 'pending': return 'confirmed';
      case 'confirmed': return 'preparing';
      case 'preparing': return 'ready';
      case 'ready': return 'delivered';
      default: return null;
    }
  };

  const renderOrderItem = ({ item, index }) => {
    const nextStatus = getNextStatus(item.status);
    const orderNumber = item.orderNumber || item._id?.slice(-6) || item.id;
    
    return (
      <TouchableOpacity 
        style={styles.orderCard}
        onPress={() => navigation.navigate('OrderDetails', { orderId: item._id || item.id })}
      >
        <View style={styles.orderHeader}>
          <View style={styles.orderInfo}>
            <Text style={styles.orderNumber}>Order #{orderNumber}</Text>
            <Text style={styles.orderTime}>
              {item.createdAt ? new Date(item.createdAt).toLocaleString() : 'N/A'}
            </Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) + '20' }]}>
            <Ionicons name={getStatusIcon(item.status)} size={16} color={getStatusColor(item.status)} />
            <Text style={[styles.statusText, { color: getStatusColor(item.status) }]}>
              {item.status || 'Unknown'}
            </Text>
          </View>
        </View>

        <View style={styles.orderDetails}>
          <View style={styles.customerInfo}>
            <Ionicons name="person-outline" size={16} color="#8E8E93" />
            <Text style={styles.customerName}>
              {item.customer?.name || item.customerName || 'Customer'}
            </Text>
          </View>
          
          <View style={styles.itemsInfo}>
            <Ionicons name="restaurant-outline" size={16} color="#8E8E93" />
            <Text style={styles.itemsText}>
              {item.items?.length || 0} item{(item.items?.length || 0) !== 1 ? 's' : ''}
            </Text>
          </View>
        </View>

        <View style={styles.orderFooter}>
          <Text style={styles.orderAmount}>${item.totalAmount || item.total || '0.00'}</Text>
          
          {nextStatus && (
            <TouchableOpacity 
              style={[styles.updateButton, { backgroundColor: getStatusColor(nextStatus) }]}
              onPress={() => handleStatusUpdate(item._id || item.id, nextStatus, orderNumber)}
            >
              <Ionicons name="arrow-forward" size={16} color="#FFFFFF" />
              <Text style={styles.updateButtonText}>
                Mark as {nextStatus.charAt(0).toUpperCase() + nextStatus.slice(1)}
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  const renderFilterButton = (filter) => (
    <TouchableOpacity
      key={filter.key}
      style={[
        styles.filterButton,
        selectedFilter === filter.key && styles.filterButtonActive
      ]}
      onPress={() => setSelectedFilter(filter.key)}
    >
      <Ionicons 
        name={filter.icon} 
        size={16} 
        color={selectedFilter === filter.key ? '#FFFFFF' : '#8E8E93'} 
      />
      <Text style={[
        styles.filterButtonText,
        selectedFilter === filter.key && styles.filterButtonTextActive
      ]}>
        {filter.label}
      </Text>
    </TouchableOpacity>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Ionicons name="receipt-outline" size={64} color="#C7C7CC" />
      <Text style={styles.emptyStateTitle}>No Orders Found</Text>
      <Text style={styles.emptyStateSubtitle}>
        {selectedFilter === 'all' 
          ? 'Orders will appear here when customers place them'
          : `No ${selectedFilter} orders at the moment`
        }
      </Text>
    </View>
  );

  const renderErrorState = () => (
    <View style={styles.errorState}>
      <Ionicons name="warning-outline" size={64} color="#FF3B30" />
      <Text style={styles.errorStateTitle}>Unable to Load Orders</Text>
      <Text style={styles.errorStateSubtitle}>{error}</Text>
      <TouchableOpacity 
        style={styles.retryButton}
        onPress={fetchOrders}
      >
        <Ionicons name="reload" size={20} color="#FFFFFF" />
        <Text style={styles.retryButtonText}>Try Again</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#F8F9FA" />
      
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color="#007AFF" />
          </TouchableOpacity>
          <View>
            <Text style={styles.headerTitle}>Order Management</Text>
            <Text style={styles.headerSubtitle}>
              {orders.length} order{orders.length !== 1 ? 's' : ''} found
            </Text>
          </View>
        </View>
      </View>

      {/* Filters */}
      <View style={styles.filtersContainer}>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filtersScroll}
        >
          {filters.map(renderFilterButton)}
        </ScrollView>
      </View>

      {/* Content */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <Ionicons name="receipt" size={48} color="#007AFF" style={styles.loadingIcon} />
          <Text style={styles.loadingText}>Loading orders...</Text>
        </View>
      ) : error ? (
        renderErrorState()
      ) : (
        <FlatList
          data={orders}
          renderItem={renderOrderItem}
          keyExtractor={(item) => item._id || item.id || Math.random().toString()}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          ListEmptyComponent={renderEmptyState}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  backButton: {
    padding: 8,
    marginRight: 12,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1C1C1E',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#8E8E93',
    marginTop: 2,
  },
  filtersContainer: {
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  filtersScroll: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F2F2F7',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
  },
  filterButtonActive: {
    backgroundColor: '#007AFF',
  },
  filterButtonText: {
    fontSize: 14,
    color: '#8E8E93',
    marginLeft: 4,
    fontWeight: '500',
  },
  filterButtonTextActive: {
    color: '#FFFFFF',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingIcon: {
    marginBottom: 16,
  },
  loadingText: {
    fontSize: 16,
    color: '#8E8E93',
  },
  listContainer: {
    padding: 16,
    paddingBottom: 32,
  },
  orderCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  orderInfo: {
    flex: 1,
  },
  orderNumber: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1C1C1E',
  },
  orderTime: {
    fontSize: 12,
    color: '#8E8E93',
    marginTop: 2,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500',
    marginLeft: 4,
  },
  orderDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  customerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  customerName: {
    fontSize: 14,
    color: '#1C1C1E',
    marginLeft: 4,
  },
  itemsInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  itemsText: {
    fontSize: 14,
    color: '#8E8E93',
    marginLeft: 4,
  },
  orderFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  orderAmount: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#34C759',
  },
  updateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  updateButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },
  separator: {
    height: 12,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyStateTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#8E8E93',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateSubtitle: {
    fontSize: 16,
    color: '#C7C7CC',
    textAlign: 'center',
    lineHeight: 24,
  },
  errorState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  errorStateTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#FF3B30',
    marginTop: 16,
    marginBottom: 8,
  },
  errorStateSubtitle: {
    fontSize: 16,
    color: '#8E8E93',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
  },
  retryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#007AFF',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 24,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
}); 