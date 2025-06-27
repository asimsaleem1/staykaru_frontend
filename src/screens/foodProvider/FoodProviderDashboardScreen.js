import React, { useEffect, useState, useCallback } from 'react';
import { 
  View, 
  Text, 
  ScrollView, 
  StyleSheet, 
  RefreshControl, 
  TouchableOpacity, 
  Alert,
  Dimensions,
  StatusBar
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import { Ionicons, MaterialIcons, FontAwesome5 } from '@expo/vector-icons';
import foodProviderApiService from '../../services/foodProviderApiService.js';
import useFoodProviderRealtime from './useFoodProviderRealtime.js';

const { width } = Dimensions.get('window');

export default function FoodProviderDashboardScreen() {
  const navigation = useNavigation();
  const [dashboard, setDashboard] = useState(null);
  const [orders, setOrders] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [ordersError, setOrdersError] = useState(null);
  const [analyticsError, setAnalyticsError] = useState(null);
  const [notificationsError, setNotificationsError] = useState(null);

  const fetchDashboard = useCallback(async () => {
    setLoading(true);
    setError(null);
    setOrdersError(null);
    setAnalyticsError(null);
    setNotificationsError(null);
    
    try {
      // Fetch dashboard stats
      try {
        const dashboardData = await foodProviderApiService.getDashboard();
        setDashboard(dashboardData);
        setError(null);
      } catch (dashboardError) {
        console.warn('Failed to fetch dashboard:', dashboardError.message);
        setDashboard({
          totalOrders: 0,
          activeOrders: 0,
          totalRevenue: 0,
          menuItems: 0
        });
        setError('Unable to load dashboard stats. Backend service may be temporarily unavailable.');
      }

      // Fetch analytics data
      try {
        const analyticsData = await foodProviderApiService.getAnalytics(30);
        setAnalytics(analyticsData);
        setAnalyticsError(null);
      } catch (analyticsError) {
        console.warn('Failed to fetch analytics:', analyticsError.message);
        setAnalytics(null);
        setAnalyticsError('Unable to load analytics data.');
      }
      
      // Fetch recent orders
      try {
        const ordersData = await foodProviderApiService.getOrders({ limit: 5, status: 'all' });
        setOrders(ordersData.orders || ordersData || []);
        setOrdersError(null);
      } catch (orderError) {
        console.warn('Failed to fetch orders:', orderError.message);
        setOrders([]);
        setOrdersError('Unable to load orders.');
      }
      
      // Fetch notifications
      try {
        const notificationsData = await foodProviderApiService.getNotifications();
        setNotifications(notificationsData.notifications || notificationsData || []);
        setNotificationsError(null);
      } catch (notificationError) {
        console.warn('Failed to fetch notifications:', notificationError.message);
        setNotifications([]);
        setNotificationsError('Unable to load notifications.');
      }
      
    } catch (e) {
      console.error('Dashboard fetch error:', e);
      setError('Unable to load dashboard data. Please try again later.');
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  // Real-time callbacks using useCallback to prevent infinite loops
  const handleRealtimeOrders = useCallback((newOrders) => {
    setOrders(newOrders);
  }, []);

  const handleRealtimeNotifications = useCallback((newNotifs) => {
    setNotifications(newNotifs);
  }, []);

  useFoodProviderRealtime({
    onOrder: handleRealtimeOrders,
    onNotification: handleRealtimeNotifications
  });

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchDashboard();
    setRefreshing(false);
  };

  const handleLogout = async () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            try {
              await foodProviderApiService.logout();
            } catch (error) {
              console.warn('Logout API call failed:', error);
            }
            navigation.reset({ index: 0, routes: [{ name: 'Login' }] });
          }
        }
      ]
    );
  };

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

  const QuickActionCard = ({ icon, title, subtitle, onPress, color = '#007AFF' }) => (
    <TouchableOpacity style={styles.quickActionCard} onPress={onPress}>
      <View style={[styles.quickActionIcon, { backgroundColor: color + '20' }]}>
        <Ionicons name={icon} size={24} color={color} />
      </View>
      <Text style={styles.quickActionTitle}>{title}</Text>
      <Text style={styles.quickActionSubtitle}>{subtitle}</Text>
    </TouchableOpacity>
  );

  const StatCard = ({ icon, title, value, color = '#007AFF', loading = false }) => (
    <View style={styles.statCard}>
      <View style={[styles.statIcon, { backgroundColor: color + '20' }]}>
        <Ionicons name={icon} size={20} color={color} />
      </View>
      <View style={styles.statContent}>
        <Text style={styles.statTitle}>{title}</Text>
        {loading ? (
          <View style={styles.loadingBar} />
        ) : (
          <Text style={[styles.statValue, { color }]}>{value}</Text>
        )}
      </View>
    </View>
  );

  const OrderCard = ({ order, index }) => (
    <TouchableOpacity 
      style={styles.orderCard}
      onPress={() => navigation.navigate('OrderDetails', { orderId: order._id || order.id })}
    >
      <View style={styles.orderHeader}>
        <View style={styles.orderInfo}>
          <Text style={styles.orderNumber}>Order #{order.orderNumber || order._id?.slice(-6) || order.id}</Text>
          <Text style={styles.orderTime}>
            {order.createdAt ? new Date(order.createdAt).toLocaleTimeString() : 'N/A'}
          </Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(order.status) + '20' }]}>
          <Ionicons name={getStatusIcon(order.status)} size={16} color={getStatusColor(order.status)} />
          <Text style={[styles.statusText, { color: getStatusColor(order.status) }]}>
            {order.status || 'Unknown'}
          </Text>
        </View>
      </View>
      <View style={styles.orderDetails}>
        <Text style={styles.orderAmount}>${order.totalAmount || order.total || '0.00'}</Text>
        <View style={styles.viewOrderButton}>
          <Text style={styles.viewOrderText}>View Details</Text>
          <Ionicons name="chevron-forward" size={16} color="#007AFF" />
        </View>
      </View>
    </TouchableOpacity>
  );

  const NotificationCard = ({ notification, index }) => (
    <TouchableOpacity style={styles.notificationCard}>
      <View style={styles.notificationIcon}>
        <Ionicons name="notifications-outline" size={20} color="#007AFF" />
      </View>
      <View style={styles.notificationContent}>
        <Text style={styles.notificationTitle}>
          {notification.title || notification.message || 'New Notification'}
        </Text>
        <Text style={styles.notificationTime}>
          {notification.createdAt ? new Date(notification.createdAt).toLocaleString() : 'Just now'}
        </Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#F8F9FA" />
      
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.headerTitle}>Food Provider Dashboard</Text>
          <Text style={styles.headerSubtitle}>Manage your food business</Text>
        </View>
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={24} color="#FF3B30" />
        </TouchableOpacity>
      </View>

      <ScrollView 
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Error Messages */}
        {error && (
          <View style={styles.errorContainer}>
            <Ionicons name="warning-outline" size={20} color="#FF3B30" />
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        {/* Stats Cards */}
        <View style={styles.statsContainer}>
          <StatCard
            icon="restaurant-outline"
            title="Total Orders"
            value={dashboard?.totalOrders || 0}
            color="#007AFF"
          />
          <StatCard
            icon="time-outline"
            title="Active Orders"
            value={dashboard?.activeOrders || 0}
            color="#FF9500"
          />
          <StatCard
            icon="card-outline"
            title="Total Revenue"
            value={`$${dashboard?.totalRevenue || 0}`}
            color="#34C759"
          />
          <StatCard
            icon="list-outline"
            title="Menu Items"
            value={dashboard?.menuItems || 0}
            color="#AF52DE"
          />
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.quickActionsGrid}>
            <QuickActionCard
              icon="add-circle-outline"
              title="Add Menu Item"
              subtitle="Create new menu item"
              onPress={() => navigation.navigate('AddMenuItem')}
              color="#34C759"
            />
            <QuickActionCard
              icon="list-outline"
              title="Manage Menu"
              subtitle="View and edit menu"
              onPress={() => navigation.navigate('MenuManagement')}
              color="#007AFF"
            />
            <QuickActionCard
              icon="receipt-outline"
              title="View Orders"
              subtitle="Check all orders"
              onPress={() => navigation.navigate('OrderManagement')}
              color="#FF9500"
            />
            <QuickActionCard
              icon="analytics-outline"
              title="Analytics"
              subtitle="View reports"
              onPress={() => navigation.navigate('AnalyticsDashboard')}
              color="#AF52DE"
            />
          </View>
        </View>

        {/* Recent Orders */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Orders</Text>
            <TouchableOpacity onPress={() => navigation.navigate('OrderManagement')}>
              <Text style={styles.viewAllText}>View All</Text>
            </TouchableOpacity>
          </View>
          
          {ordersError ? (
            <View style={styles.errorContainer}>
              <Ionicons name="warning-outline" size={16} color="#FF3B30" />
              <Text style={styles.errorText}>{ordersError}</Text>
            </View>
          ) : orders.length > 0 ? (
            <View style={styles.ordersContainer}>
              {orders.map((order, index) => (
                <OrderCard key={order._id || order.id || index} order={order} index={index} />
              ))}
            </View>
          ) : (
            <View style={styles.emptyState}>
              <Ionicons name="receipt-outline" size={48} color="#C7C7CC" />
              <Text style={styles.emptyStateText}>No orders yet</Text>
              <Text style={styles.emptyStateSubtext}>Orders will appear here when customers place them</Text>
            </View>
          )}
        </View>

        {/* Analytics Preview */}
        {analytics && !analyticsError && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Revenue Overview</Text>
              <TouchableOpacity onPress={() => navigation.navigate('AnalyticsDashboard')}>
                <Text style={styles.viewAllText}>View Details</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.analyticsPreview}>
              <View style={styles.analyticsCard}>
                <Text style={styles.analyticsLabel}>Today's Revenue</Text>
                <Text style={styles.analyticsValue}>${analytics.todayRevenue || 0}</Text>
              </View>
              <View style={styles.analyticsCard}>
                <Text style={styles.analyticsLabel}>This Week</Text>
                <Text style={styles.analyticsValue}>${analytics.weeklyRevenue || 0}</Text>
              </View>
              <View style={styles.analyticsCard}>
                <Text style={styles.analyticsLabel}>This Month</Text>
                <Text style={styles.analyticsValue}>${analytics.monthlyRevenue || 0}</Text>
              </View>
            </View>
          </View>
        )}

        {/* Notifications */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Notifications</Text>
            <TouchableOpacity onPress={() => navigation.navigate('NotificationsCenter')}>
              <Text style={styles.viewAllText}>View All</Text>
            </TouchableOpacity>
          </View>
          
          {notificationsError ? (
            <View style={styles.errorContainer}>
              <Ionicons name="warning-outline" size={16} color="#FF3B30" />
              <Text style={styles.errorText}>{notificationsError}</Text>
            </View>
          ) : notifications.length > 0 ? (
            <View style={styles.notificationsContainer}>
              {notifications.slice(0, 3).map((notification, index) => (
                <NotificationCard key={notification._id || index} notification={notification} index={index} />
              ))}
            </View>
          ) : (
            <View style={styles.emptyState}>
              <Ionicons name="notifications-outline" size={48} color="#C7C7CC" />
              <Text style={styles.emptyStateText}>No notifications</Text>
              <Text style={styles.emptyStateSubtext}>You're all caught up!</Text>
            </View>
          )}
        </View>

        {/* Bottom Spacing */}
        <View style={styles.bottomSpacing} />
      </ScrollView>
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
    flex: 1,
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
  logoutButton: {
    padding: 8,
  },
  scrollView: {
    flex: 1,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFE5E5',
    padding: 12,
    margin: 16,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#FF3B30',
  },
  errorText: {
    color: '#FF3B30',
    fontSize: 14,
    marginLeft: 8,
    flex: 1,
  },
  statsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 16,
    gap: 12,
  },
  statCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    flex: 1,
    minWidth: (width - 48) / 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  statContent: {
    flex: 1,
  },
  statTitle: {
    fontSize: 12,
    color: '#8E8E93',
    marginBottom: 4,
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  loadingBar: {
    height: 18,
    backgroundColor: '#E5E5EA',
    borderRadius: 4,
    width: '60%',
  },
  section: {
    marginTop: 24,
    paddingHorizontal: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1C1C1E',
  },
  viewAllText: {
    fontSize: 14,
    color: '#007AFF',
    fontWeight: '500',
  },
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  quickActionCard: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    flex: 1,
    minWidth: (width - 48) / 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  quickActionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  quickActionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1C1C1E',
    textAlign: 'center',
    marginBottom: 4,
  },
  quickActionSubtitle: {
    fontSize: 12,
    color: '#8E8E93',
    textAlign: 'center',
  },
  ordersContainer: {
    gap: 12,
  },
  orderCard: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
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
    alignItems: 'center',
  },
  orderAmount: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#34C759',
  },
  viewOrderButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  viewOrderText: {
    fontSize: 14,
    color: '#007AFF',
    fontWeight: '500',
    marginRight: 4,
  },
  analyticsPreview: {
    flexDirection: 'row',
    gap: 12,
  },
  analyticsCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  analyticsLabel: {
    fontSize: 12,
    color: '#8E8E93',
    marginBottom: 8,
  },
  analyticsValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#34C759',
  },
  notificationsContainer: {
    gap: 12,
  },
  notificationCard: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  notificationIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#007AFF20',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  notificationContent: {
    flex: 1,
  },
  notificationTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1C1C1E',
    marginBottom: 4,
  },
  notificationTime: {
    fontSize: 12,
    color: '#8E8E93',
  },
  emptyState: {
    alignItems: 'center',
    padding: 32,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  emptyStateText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#8E8E93',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: '#C7C7CC',
    textAlign: 'center',
  },
  bottomSpacing: {
    height: 32,
  },
}); 