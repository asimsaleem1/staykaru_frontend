import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  SafeAreaView,
  Alert,
  Switch,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const NotificationsScreen_new = ({ navigation }) => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [filterType, setFilterType] = useState('all');
  const [settings, setSettings] = useState({
    booking: true,
    order: true,
    promotional: true,
    push: true,
    email: true,
  });

  useEffect(() => {
    loadNotifications();
  }, []);

  const loadNotifications = () => {
    const mockNotifications = [
      {
        id: '1',
        type: 'booking',
        title: 'Booking Confirmed',
        message: 'Your booking at Green Valley Hostel has been confirmed for June 25-30.',
        timestamp: new Date(Date.now() - 3600000).toISOString(),
        read: false,
        priority: 'high',
        actionable: true,
        actions: [{ type: 'view', label: 'View Booking' }]
      },
      {
        id: '2',
        type: 'order',
        title: 'Food Order Delivered',
        message: 'Your order from Pizza Palace has been delivered successfully.',
        timestamp: new Date(Date.now() - 7200000).toISOString(),
        read: true,
        priority: 'medium',
        actionable: true,
        actions: [{ type: 'rate', label: 'Rate Order' }]
      },
      {
        id: '3',
        type: 'promotional',
        title: 'Special Offer!',
        message: 'Get 20% off on your next accommodation booking. Use code SAVE20.',
        timestamp: new Date(Date.now() - 86400000).toISOString(),
        read: false,
        priority: 'low',
        actionable: true,
        actions: [{ type: 'explore', label: 'View Offers' }]
      },
      {
        id: '4',
        type: 'booking',
        title: 'Payment Reminder',
        message: 'Your payment for Sunset Apartments is due in 2 days.',
        timestamp: new Date(Date.now() - 172800000).toISOString(),
        read: false,
        priority: 'high',
        actionable: true,
        actions: [{ type: 'pay', label: 'Pay Now' }]
      },
      {
        id: '5',
        type: 'order',
        title: 'Order Cancelled',
        message: 'Your food order from Burger King has been cancelled due to restaurant closure.',
        timestamp: new Date(Date.now() - 259200000).toISOString(),
        read: true,
        priority: 'medium',
        actionable: false,
        actions: []
      },
      {
        id: '6',
        type: 'system',
        title: 'App Update Available',
        message: 'A new version of StayKaru is available with improved features and bug fixes.',
        timestamp: new Date(Date.now() - 345600000).toISOString(),
        read: false,
        priority: 'low',
        actionable: true,
        actions: [{ type: 'update', label: 'Update Now' }]
      }
    ];
    
    setNotifications(mockNotifications);
    setUnreadCount(mockNotifications.filter(n => !n.read).length);
  };

  const filterOptions = [
    { id: 'all', label: 'All', icon: 'list' },
    { id: 'booking', label: 'Bookings', icon: 'calendar' },
    { id: 'order', label: 'Orders', icon: 'restaurant' },
    { id: 'promotional', label: 'Offers', icon: 'pricetag' },
    { id: 'system', label: 'System', icon: 'settings' },
  ];

  const filteredNotifications = notifications.filter(notification => 
    filterType === 'all' || notification.type === filterType
  );

  const markAsRead = (notificationId) => {
    setNotifications(prev => 
      prev.map(notification => 
        notification.id === notificationId 
          ? { ...notification, read: true }
          : notification
      )
    );
    setUnreadCount(prev => Math.max(0, prev - 1));
  };

  const markAllAsRead = () => {
    setNotifications(prev => 
      prev.map(notification => ({ ...notification, read: true }))
    );
    setUnreadCount(0);
  };

  const deleteNotification = (notificationId) => {
    Alert.alert(
      'Delete Notification',
      'Are you sure you want to delete this notification?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            const notification = notifications.find(n => n.id === notificationId);
            setNotifications(prev => prev.filter(n => n.id !== notificationId));
            if (!notification?.read) {
              setUnreadCount(prev => Math.max(0, prev - 1));
            }
          }
        }
      ]
    );
  };

  const handleNotificationAction = (notification, action) => {
    if (!notification.read) {
      markAsRead(notification.id);
    }

    switch (action.type) {
      case 'view':
        if (notification.type === 'booking') {
          navigation.navigate('MyBookings');
        }
        break;
      case 'rate':
        navigation.navigate('MyOrders');
        break;
      case 'explore':
        navigation.navigate('AccommodationsList');
        break;
      case 'pay':
        Alert.alert('Payment', 'Redirecting to payment gateway...');
        break;
      case 'update':
        Alert.alert('Update', 'Redirecting to app store...');
        break;
      default:
        Alert.alert('Action', `${action.label} functionality will be available soon.`);
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'booking': return 'calendar';
      case 'order': return 'restaurant';
      case 'promotional': return 'pricetag';
      case 'system': return 'settings';
      default: return 'notifications';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return '#e74c3c';
      case 'medium': return '#f39c12';
      case 'low': return '#3498db';
      default: return '#7f8c8d';
    }
  };

  const renderNotification = ({ item }) => (
    <TouchableOpacity
      style={[styles.notificationItem, !item.read && styles.unreadNotification]}
      onPress={() => !item.read && markAsRead(item.id)}
    >
      <View style={styles.notificationHeader}>
        <View style={styles.iconContainer}>
          <Ionicons 
            name={getNotificationIcon(item.type)} 
            size={24} 
            color={getPriorityColor(item.priority)} 
          />
          {!item.read && <View style={styles.unreadIndicator} />}
        </View>
        <View style={styles.notificationContent}>
          <Text style={[styles.notificationTitle, !item.read && styles.unreadTitle]}>
            {item.title}
          </Text>
          <Text style={styles.notificationMessage}>{item.message}</Text>
          <Text style={styles.timestamp}>
            {new Date(item.timestamp).toLocaleString()}
          </Text>
        </View>
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={() => deleteNotification(item.id)}
        >
          <Ionicons name="close" size={20} color="#7f8c8d" />
        </TouchableOpacity>
      </View>
      
      {item.actionable && item.actions.length > 0 && (
        <View style={styles.actionsContainer}>
          {item.actions.map((action, index) => (
            <TouchableOpacity
              key={index}
              style={styles.actionButton}
              onPress={() => handleNotificationAction(item, action)}
            >
              <Text style={styles.actionText}>{action.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </TouchableOpacity>
  );

  const renderFilterButton = (filter) => (
    <TouchableOpacity
      key={filter.id}
      style={[
        styles.filterButton,
        filterType === filter.id && styles.activeFilter
      ]}
      onPress={() => setFilterType(filter.id)}
    >
      <Ionicons 
        name={filter.icon} 
        size={16} 
        color={filterType === filter.id ? '#fff' : '#3498db'} 
      />
      <Text 
        style={[
          styles.filterText,
          filterType === filter.id && styles.activeFilterText
        ]}
      >
        {filter.label}
      </Text>
    </TouchableOpacity>
  );

  const toggleSetting = (key) => {
    setSettings(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
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
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Notifications</Text>
          {unreadCount > 0 && (
            <View style={styles.unreadBadge}>
              <Text style={styles.unreadBadgeText}>{unreadCount}</Text>
            </View>
          )}
        </View>
        <TouchableOpacity
          style={styles.markAllButton}
          onPress={markAllAsRead}
          disabled={unreadCount === 0}
        >
          <Text style={[
            styles.markAllText,
            unreadCount === 0 && styles.disabledText
          ]}>
            Mark All Read
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView 
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.filtersContainer}
        contentContainerStyle={styles.filtersContent}
      >
        {filterOptions.map(renderFilterButton)}
      </ScrollView>

      <FlatList
        data={filteredNotifications}
        keyExtractor={(item) => item.id}
        renderItem={renderNotification}
        style={styles.notificationsList}
        contentContainerStyle={styles.notificationsContent}
        ListEmptyComponent={() => (
          <View style={styles.emptyContainer}>
            <Ionicons name="notifications-off" size={64} color="#bdc3c7" />
            <Text style={styles.emptyText}>No notifications found</Text>
            <Text style={styles.emptySubtext}>
              {filterType === 'all' 
                ? "You're all caught up!" 
                : `No ${filterType} notifications`
              }
            </Text>
          </View>
        )}
      />

      {/* Notification Settings */}
      <View style={styles.settingsContainer}>
        <Text style={styles.settingsTitle}>Notification Settings</Text>
        <View style={styles.settingItem}>
          <Text style={styles.settingLabel}>Booking Updates</Text>
          <Switch
            value={settings.booking}
            onValueChange={() => toggleSetting('booking')}
            trackColor={{ false: '#767577', true: '#3498db' }}
            thumbColor={settings.booking ? '#fff' : '#f4f3f4'}
          />
        </View>
        <View style={styles.settingItem}>
          <Text style={styles.settingLabel}>Order Updates</Text>
          <Switch
            value={settings.order}
            onValueChange={() => toggleSetting('order')}
            trackColor={{ false: '#767577', true: '#3498db' }}
            thumbColor={settings.order ? '#fff' : '#f4f3f4'}
          />
        </View>
        <View style={styles.settingItem}>
          <Text style={styles.settingLabel}>Promotional Offers</Text>
          <Switch
            value={settings.promotional}
            onValueChange={() => toggleSetting('promotional')}
            trackColor={{ false: '#767577', true: '#3498db' }}
            thumbColor={settings.promotional ? '#fff' : '#f4f3f4'}
          />
        </View>
        <View style={styles.settingItem}>
          <Text style={styles.settingLabel}>Push Notifications</Text>
          <Switch
            value={settings.push}
            onValueChange={() => toggleSetting('push')}
            trackColor={{ false: '#767577', true: '#3498db' }}
            thumbColor={settings.push ? '#fff' : '#f4f3f4'}
          />
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    backgroundColor: '#fff',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
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
  headerContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  unreadBadge: {
    backgroundColor: '#e74c3c',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 2,
    marginLeft: 8,
  },
  unreadBadgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  markAllButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  markAllText: {
    color: '#3498db',
    fontSize: 14,
    fontWeight: '500',
  },
  disabledText: {
    color: '#bdc3c7',
  },
  filtersContainer: {
    backgroundColor: '#fff',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  filtersContent: {
    paddingHorizontal: 20,
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#3498db',
    marginRight: 8,
  },
  activeFilter: {
    backgroundColor: '#3498db',
  },
  filterText: {
    marginLeft: 6,
    fontSize: 14,
    fontWeight: '500',
    color: '#3498db',
  },
  activeFilterText: {
    color: '#fff',
  },
  notificationsList: {
    flex: 1,
  },
  notificationsContent: {
    padding: 16,
  },
  notificationItem: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  unreadNotification: {
    borderLeftWidth: 4,
    borderLeftColor: '#3498db',
  },
  notificationHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  iconContainer: {
    position: 'relative',
    marginRight: 12,
  },
  unreadIndicator: {
    position: 'absolute',
    top: -2,
    right: -2,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#e74c3c',
  },
  notificationContent: {
    flex: 1,
  },
  notificationTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginBottom: 4,
  },
  unreadTitle: {
    fontWeight: 'bold',
  },
  notificationMessage: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 8,
  },
  timestamp: {
    fontSize: 12,
    color: '#999',
  },
  deleteButton: {
    padding: 4,
  },
  actionsContainer: {
    flexDirection: 'row',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  actionButton: {
    backgroundColor: '#3498db',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
    marginRight: 8,
  },
  actionText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 80,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#7f8c8d',
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#bdc3c7',
    marginTop: 8,
    textAlign: 'center',
  },
  settingsContainer: {
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#e9ecef',
  },
  settingsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  settingLabel: {
    fontSize: 14,
    color: '#666',
  },
});

export default NotificationsScreen_new;
