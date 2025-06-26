import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import LoadingSpinner from '../../components/LoadingSpinner';
import { studentApiService } from '../../services/studentApiService_new';

const OrderDetailsScreen = ({ navigation, route }) => {
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const { orderId, order: orderData } = route.params || {};

  useEffect(() => {
    loadOrderDetails();
  }, [orderId]);

  const loadOrderDetails = async () => {
    try {
      setLoading(true);
      
      // Use passed order data if available, otherwise fetch from API
      if (orderData) {
        setOrder(orderData);
      } else if (orderId) {
        const data = await studentApiService.getOrderDetails(orderId);
        setOrder(data);
      }
    } catch (error) {
      console.error('Error loading order details:', error);
      Alert.alert('Error', 'Failed to load order details');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'placed':
      case 'confirmed':
        return '#FFA500';
      case 'preparing':
        return '#2196F3';
      case 'on_the_way':
      case 'out_for_delivery':
        return '#9C27B0';
      case 'delivered':
      case 'completed':
        return '#4CAF50';
      case 'cancelled':
        return '#F44336';
      default:
        return '#757575';
    }
  };

  const getStatusText = (status) => {
    switch (status?.toLowerCase()) {
      case 'placed':
        return 'Order Placed';
      case 'confirmed':
        return 'Confirmed';
      case 'preparing':
        return 'Preparing';
      case 'on_the_way':
      case 'out_for_delivery':
        return 'On the Way';
      case 'delivered':
      case 'completed':
        return 'Delivered';
      case 'cancelled':
        return 'Cancelled';
      default:
        return status || 'Unknown';
    }
  };

  const handleCancelOrder = () => {
    Alert.alert(
      'Cancel Order',
      'Are you sure you want to cancel this order?',
      [
        {
          text: 'No',
          style: 'cancel',
        },
        {
          text: 'Yes',
          style: 'destructive',
          onPress: async () => {
            try {
              await studentApiService.cancelOrder(order._id);
              Alert.alert('Success', 'Order cancelled successfully');
              navigation.goBack();
            } catch (error) {
              Alert.alert('Error', 'Failed to cancel order');
            }
          },
        },
      ]
    );
  };

  const handleReorder = () => {
    const cart = order.items?.map(item => ({
      _id: item.menu_item || item._id,
      name: item.name || 'Item',
      price: item.price || 0,
      quantity: item.quantity || 1,
      description: item.description || '',
      image: item.image || 'https://via.placeholder.com/100x100?text=Food'
    })) || [];

    navigation.navigate('FoodOrderCheckout', {
      cart,
      provider: order.food_provider,
      totalAmount: order.total_amount || 0
    });
  };

  const handleTrackOrder = () => {
    // Navigate to order tracking screen or show tracking modal
    Alert.alert('Order Tracking', 'Order tracking feature coming soon!');
  };

  const handleContactSupport = () => {
    navigation.navigate('Support', {
      orderId: order._id,
      issue: 'order_inquiry'
    });
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!order) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color="#333" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Order Details</Text>
        </View>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Order not found</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Order Details</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Order Status */}
        <View style={styles.statusCard}>
          <View style={styles.statusHeader}>
            <View style={[styles.statusDot, { backgroundColor: getStatusColor(order.status) }]} />
            <Text style={[styles.statusText, { color: getStatusColor(order.status) }]}>
              {getStatusText(order.status)}
            </Text>
          </View>
          <Text style={styles.orderNumber}>Order #{order._id?.slice(-8) || 'Unknown'}</Text>
          <Text style={styles.orderDate}>
            {order.createdAt ? new Date(order.createdAt).toLocaleString() : 'Unknown date'}
          </Text>
        </View>

        {/* Food Provider Info */}
        {order.food_provider && (
          <View style={styles.providerCard}>
            <Text style={styles.sectionTitle}>Restaurant</Text>
            <View style={styles.providerInfo}>
              <Image 
                source={{ 
                  uri: order.food_provider.images?.[0] || 'https://via.placeholder.com/80x80?text=Restaurant' 
                }}
                style={styles.providerImage}
              />
              <View style={styles.providerDetails}>
                <Text style={styles.providerName}>{order.food_provider.name || 'Unknown Restaurant'}</Text>
                <Text style={styles.providerAddress}>{order.food_provider.address || 'Address not available'}</Text>
                <Text style={styles.providerPhone}>{order.food_provider.phone || 'Phone not available'}</Text>
              </View>
            </View>
          </View>
        )}

        {/* Order Items */}
        <View style={styles.itemsCard}>
          <Text style={styles.sectionTitle}>Order Items</Text>
          {order.items?.map((item, index) => (
            <View key={index} style={styles.orderItem}>
              <Image 
                source={{ 
                  uri: item.image || 'https://via.placeholder.com/60x60?text=Food' 
                }}
                style={styles.itemImage}
              />
              <View style={styles.itemDetails}>
                <Text style={styles.itemName}>{item.name || 'Unknown Item'}</Text>
                <Text style={styles.itemQuantity}>Qty: {item.quantity || 1}</Text>
                {item.special_instructions && (
                  <Text style={styles.specialInstructions}>
                    Note: {item.special_instructions}
                  </Text>
                )}
              </View>
              <Text style={styles.itemPrice}>Rs. {item.price || 0}</Text>
            </View>
          ))}
        </View>

        {/* Delivery Information */}
        {order.delivery_location && (
          <View style={styles.deliveryCard}>
            <Text style={styles.sectionTitle}>Delivery Address</Text>
            <View style={styles.addressInfo}>
              <Ionicons name="location-outline" size={20} color="#666" />
              <View style={styles.addressDetails}>
                <Text style={styles.address}>{order.delivery_location.address || 'Address not available'}</Text>
                {order.delivery_location.landmark && (
                  <Text style={styles.landmark}>Landmark: {order.delivery_location.landmark}</Text>
                )}
              </View>
            </View>
          </View>
        )}

        {/* Payment Information */}
        <View style={styles.paymentCard}>
          <Text style={styles.sectionTitle}>Payment Details</Text>
          <View style={styles.paymentRow}>
            <Text style={styles.paymentLabel}>Payment Method:</Text>
            <Text style={styles.paymentValue}>
              {order.payment_method === 'cash_on_delivery' ? 'Cash on Delivery' : 
               order.payment_method === 'card' ? 'Credit/Debit Card' : 
               order.payment_method || 'Unknown'}
            </Text>
          </View>
          <View style={styles.paymentRow}>
            <Text style={styles.paymentLabel}>Payment Status:</Text>
            <Text style={[styles.paymentValue, {
              color: order.payment_status === 'paid' ? '#4CAF50' : 
                     order.payment_status === 'pending' ? '#FFA500' : '#F44336'
            }]}>
              {order.payment_status?.charAt(0).toUpperCase() + order.payment_status?.slice(1) || 'Unknown'}
            </Text>
          </View>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Total Amount:</Text>
            <Text style={styles.totalAmount}>Rs. {order.total_amount || 0}</Text>
          </View>
        </View>

        {/* Order Actions */}
        <View style={styles.actionsCard}>
          {order.status?.toLowerCase() === 'placed' || order.status?.toLowerCase() === 'confirmed' ? (
            <TouchableOpacity style={styles.cancelButton} onPress={handleCancelOrder}>
              <Ionicons name="close-circle-outline" size={20} color="#FFF" />
              <Text style={styles.cancelButtonText}>Cancel Order</Text>
            </TouchableOpacity>
          ) : null}
          
          {order.status?.toLowerCase() !== 'cancelled' && (
            <TouchableOpacity style={styles.trackButton} onPress={handleTrackOrder}>
              <Ionicons name="navigate-outline" size={20} color="#FFF" />
              <Text style={styles.trackButtonText}>Track Order</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity style={styles.reorderButton} onPress={handleReorder}>
            <Ionicons name="refresh-outline" size={20} color="#007BFF" />
            <Text style={styles.reorderButtonText}>Reorder</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.supportButton} onPress={handleContactSupport}>
            <Ionicons name="headset-outline" size={20} color="#666" />
            <Text style={styles.supportButtonText}>Contact Support</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
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
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  statusCard: {
    backgroundColor: '#FFF',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  statusHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  statusDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  statusText: {
    fontSize: 16,
    fontWeight: '600',
  },
  orderNumber: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  orderDate: {
    fontSize: 14,
    color: '#666',
  },
  providerCard: {
    backgroundColor: '#FFF',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  providerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  providerImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginRight: 12,
  },
  providerDetails: {
    flex: 1,
  },
  providerName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  providerAddress: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
  },
  providerPhone: {
    fontSize: 14,
    color: '#666',
  },
  itemsCard: {
    backgroundColor: '#FFF',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  orderItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  itemImage: {
    width: 50,
    height: 50,
    borderRadius: 8,
    marginRight: 12,
  },
  itemDetails: {
    flex: 1,
  },
  itemName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },
  itemQuantity: {
    fontSize: 12,
    color: '#666',
  },
  specialInstructions: {
    fontSize: 12,
    color: '#007BFF',
    fontStyle: 'italic',
  },
  itemPrice: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  deliveryCard: {
    backgroundColor: '#FFF',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  addressInfo: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  addressDetails: {
    marginLeft: 8,
    flex: 1,
  },
  address: {
    fontSize: 14,
    color: '#333',
    marginBottom: 4,
  },
  landmark: {
    fontSize: 12,
    color: '#666',
  },
  paymentCard: {
    backgroundColor: '#FFF',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  paymentRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  paymentLabel: {
    fontSize: 14,
    color: '#666',
  },
  paymentValue: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#E9ECEF',
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  totalAmount: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#007BFF',
  },
  actionsCard: {
    backgroundColor: '#FFF',
    padding: 16,
    borderRadius: 12,
    marginBottom: 32,
  },
  cancelButton: {
    backgroundColor: '#F44336',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  cancelButtonText: {
    color: '#FFF',
    fontWeight: '600',
    marginLeft: 8,
  },
  trackButton: {
    backgroundColor: '#007BFF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  trackButtonText: {
    color: '#FFF',
    fontWeight: '600',
    marginLeft: 8,
  },
  reorderButton: {
    backgroundColor: '#FFF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#007BFF',
    marginBottom: 12,
  },
  reorderButtonText: {
    color: '#007BFF',
    fontWeight: '600',
    marginLeft: 8,
  },
  supportButton: {
    backgroundColor: '#F8F9FA',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#DEE2E6',
  },
  supportButtonText: {
    color: '#666',
    fontWeight: '600',
    marginLeft: 8,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: 16,
    color: '#666',
  },
});

export default OrderDetailsScreen;
