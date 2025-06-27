import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, RefreshControl, TouchableOpacity, ActivityIndicator, Alert, Dimensions
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS } from '../../utils/constants';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';

const { width } = Dimensions.get('window');

const AdminDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState({});
  const [error, setError] = useState(null);
  const [userData, setUserData] = useState(null);
  const [systemStatus, setSystemStatus] = useState('healthy');
  const navigation = useNavigation();

  const fetchDashboard = async () => {
    setLoading(true);
    setError(null);
    try {
      const storedToken = await AsyncStorage.getItem('token');
      const storedUser = await AsyncStorage.getItem('user');
      
      setUserData(storedUser ? JSON.parse(storedUser) : null);
      
      const headers = {
        'Authorization': storedToken ? `Bearer ${storedToken}` : '',
        'Content-Type': 'application/json'
      };
      
      const res = await fetch('https://staykaru-backend-60ed08adb2a7.herokuapp.com/api/admin/dashboard', { headers });
      const data = await res.json();
      
      if (res.ok) {
        let dashboardStats = {};
        
        if (data.stats) {
          dashboardStats = data.stats;
        } else if (data.totalUsers !== undefined) {
          dashboardStats = data;
        } else if (data.data && data.data.stats) {
          dashboardStats = data.data.stats;
        } else if (data.users !== undefined) {
          dashboardStats = {
            totalUsers: Array.isArray(data.users) ? data.users.length : 0,
            totalAccommodations: Array.isArray(data.accommodations) ? data.accommodations.length : 0,
            totalBookings: Array.isArray(data.bookings) ? data.bookings.length : 0,
            totalOrders: Array.isArray(data.orders) ? data.orders.length : 0,
          };
        }
        
        setStats(dashboardStats);
        setSystemStatus('healthy');
      } else {
        setStats({});
        setSystemStatus('error');
        if (data.message) {
          setError(`Backend Error: ${data.message}`);
        } else {
          setError(`HTTP ${res.status}: Failed to load dashboard data`);
        }
      }
    } catch (e) {
      setError('Failed to load dashboard data.');
      setSystemStatus('error');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchDashboard();
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
            await AsyncStorage.clear();
            navigation.reset({
              index: 0,
              routes: [{ name: 'Login' }],
            });
          }
        }
      ]
    );
  };

  const handleModulePress = (moduleId) => {
    navigation.navigate(moduleId);
  };

  const adminModules = [
    {
      id: 'UserManagement',
      title: 'User Management',
      subtitle: 'Manage all platform users',
      icon: 'people',
      color: '#4F8EF7',
      gradient: ['#4F8EF7', '#5B9BFF'],
      count: stats.totalUsers || 0,
      description: 'Students, Landlords, Food Providers'
    },
    {
      id: 'AccommodationManagement',
      title: 'Accommodation Management',
      subtitle: 'Manage property listings',
      icon: 'home',
      color: '#34C759',
      gradient: ['#34C759', '#40D867'],
      count: stats.totalAccommodations || 0,
      description: 'Approve, reject, and manage properties'
    },
    {
      id: 'FoodServiceManagement',
      title: 'Food Service Management',
      subtitle: 'Manage food providers & services',
      icon: 'restaurant',
      color: '#FF2D55',
      gradient: ['#FF2D55', '#FF3B69'],
      count: 'Active',
      description: 'Restaurants, menus, and delivery'
    },
    {
      id: 'BookingManagement',
      title: 'Booking Management',
      subtitle: 'Monitor all bookings',
      icon: 'calendar',
      color: '#FF9500',
      gradient: ['#FF9500', '#FFA726'],
      count: stats.totalBookings || 0,
      description: 'Track and manage reservations'
    },
    {
      id: 'OrderManagement',
      title: 'Order Management',
      subtitle: 'Manage food orders',
      icon: 'fast-food',
      color: '#AF52DE',
      gradient: ['#AF52DE', '#BA68C8'],
      count: stats.totalOrders || 0,
      description: 'Order tracking and delivery'
    },
    {
      id: 'FinancialManagement',
      title: 'Financial Management',
      subtitle: 'Revenue & transactions',
      icon: 'card',
      color: '#30D158',
      gradient: ['#30D158', '#4CAF50'],
      count: 'Revenue',
      description: 'Payments, commissions, analytics'
    },
    {
      id: 'ContentModeration',
      title: 'Content Moderation',
      subtitle: 'Moderate platform content',
      icon: 'shield-checkmark',
      color: '#FF9F0A',
      gradient: ['#FF9F0A', '#FFB74D'],
      count: 'Reports',
      description: 'Reviews, reports, and guidelines'
    },
    {
      id: 'SystemAdministration',
      title: 'System Administration',
      subtitle: 'System configuration',
      icon: 'settings',
      color: '#007AFF',
      gradient: ['#007AFF', '#2196F3'],
      count: 'Config',
      description: 'Performance, logs, and settings'
    },
    {
      id: 'ExportReports',
      title: 'Export & Reports',
      subtitle: 'Generate reports',
      icon: 'document-text',
      color: '#5856D6',
      gradient: ['#5856D6', '#673AB7'],
      count: 'Export',
      description: 'CSV, Excel, PDF exports'
    },
    {
      id: 'NotificationManagement',
      title: 'Notification Management',
      subtitle: 'Send notifications',
      icon: 'notifications',
      color: '#FF3B30',
      gradient: ['#FF3B30', '#F44336'],
      count: 'Send',
      description: 'Broadcast and targeted messages'
    },
    {
      id: 'AdminProfile',
      title: 'Admin Profile',
      subtitle: 'Profile & settings',
      icon: 'person',
      color: '#5AC8FA',
      gradient: ['#5AC8FA', '#03DAC6'],
      count: 'Profile',
      description: 'Account settings and preferences'
    },
    {
      id: 'AdminTestRunner',
      title: 'Test Runner',
      subtitle: 'System diagnostics',
      icon: 'bug',
      color: '#FF6B6B',
      gradient: ['#FF6B6B', '#E57373'],
      count: 'Test',
      description: 'API testing and diagnostics'
    }
  ];

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>Loading Admin Dashboard...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <LinearGradient colors={[COLORS.primary, COLORS.secondary]} style={styles.header}>
            <Text style={styles.title}>Admin Dashboard</Text>
          </LinearGradient>
          
          <View style={styles.errorContainer}>
            <Ionicons name="alert-circle" size={48} color="#FF3B30" />
            <Text style={styles.errorText}>{error}</Text>
            
            <TouchableOpacity onPress={fetchDashboard} style={styles.retryBtn}>
              <Text style={styles.retryText}>Retry</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
              <Ionicons name="log-out-outline" size={22} color="#fff" />
              <Text style={styles.logoutText}>Logout</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <LinearGradient colors={[COLORS.primary, COLORS.secondary]} style={styles.header}>
          <View style={styles.headerContent}>
            <View>
              <Text style={styles.title}>StayKaru Admin</Text>
              <Text style={styles.subtitle}>Welcome back, {userData?.name || 'Administrator'}</Text>
            </View>
            <TouchableOpacity style={styles.logoutBtnSmall} onPress={handleLogout}>
              <Ionicons name="log-out-outline" size={20} color="#fff" />
            </TouchableOpacity>
          </View>
        </LinearGradient>

        {/* System Status */}
        <View style={styles.statusContainer}>
          <View style={[styles.statusIndicator, { backgroundColor: systemStatus === 'healthy' ? '#34C759' : '#FF3B30' }]} />
          <Text style={styles.statusText}>
            System Status: {systemStatus === 'healthy' ? 'Healthy' : 'Error'}
          </Text>
        </View>

        {/* Quick Stats */}
        <View style={styles.statsContainer}>
          <Text style={styles.sectionTitle}>Platform Overview</Text>
          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <Ionicons name="people" size={24} color="#4F8EF7" />
              <Text style={styles.statValue}>{stats.totalUsers || 0}</Text>
              <Text style={styles.statLabel}>Total Users</Text>
            </View>
            <View style={styles.statCard}>
              <Ionicons name="home" size={24} color="#34C759" />
              <Text style={styles.statValue}>{stats.totalAccommodations || 0}</Text>
              <Text style={styles.statLabel}>Properties</Text>
            </View>
            <View style={styles.statCard}>
              <Ionicons name="calendar" size={24} color="#FF9500" />
              <Text style={styles.statValue}>{stats.totalBookings || 0}</Text>
              <Text style={styles.statLabel}>Bookings</Text>
            </View>
            <View style={styles.statCard}>
              <Ionicons name="fast-food" size={24} color="#FF2D55" />
              <Text style={styles.statValue}>{stats.totalOrders || 0}</Text>
              <Text style={styles.statLabel}>Orders</Text>
            </View>
          </View>
        </View>

        {/* Admin Modules Grid */}
        <View style={styles.modulesContainer}>
          <Text style={styles.sectionTitle}>Admin Modules</Text>
          <View style={styles.modulesGrid}>
            {adminModules.map((module) => (
              <TouchableOpacity
                key={module.id}
                style={styles.moduleCard}
                onPress={() => handleModulePress(module.id)}
                activeOpacity={0.8}
              >
                <LinearGradient colors={module.gradient} style={styles.moduleGradient}>
                  <View style={styles.moduleHeader}>
                    <Ionicons name={module.icon} size={28} color="#fff" />
                    <Text style={styles.moduleCount}>{module.count}</Text>
                  </View>
                  <View style={styles.moduleContent}>
                    <Text style={styles.moduleTitle}>{module.title}</Text>
                    <Text style={styles.moduleSubtitle}>{module.subtitle}</Text>
                    <Text style={styles.moduleDescription}>{module.description}</Text>
                  </View>
                </LinearGradient>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Debug Stats */}
        <View style={styles.debugSection}>
          <Text style={styles.debugTitle}>Current Stats (Debug):</Text>
          <Text style={styles.debugText}>Users: {stats.totalUsers ?? 0}</Text>
          <Text style={styles.debugText}>Accommodations: {stats.totalAccommodations ?? 0}</Text>
          <Text style={styles.debugText}>Bookings: {stats.totalBookings ?? 0}</Text>
          <Text style={styles.debugText}>Orders: {stats.totalOrders ?? 0}</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#F8F9FB' 
  },
  scrollContent: { 
    paddingBottom: 20 
  },
  loadingContainer: { 
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center' 
  },
  loadingText: { 
    marginTop: 16, 
    color: COLORS.primary, 
    fontSize: 16 
  },
  header: { 
    padding: 24, 
    borderBottomLeftRadius: 20, 
    borderBottomRightRadius: 20 
  },
  headerContent: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center' 
  },
  title: { 
    fontSize: 32, 
    fontWeight: 'bold', 
    color: '#fff' 
  },
  subtitle: { 
    fontSize: 16, 
    color: '#fff', 
    opacity: 0.9, 
    marginTop: 4 
  },
  logoutBtnSmall: { 
    padding: 8 
  },
  statusContainer: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    backgroundColor: '#fff', 
    padding: 12, 
    borderRadius: 8, 
    margin: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  statusIndicator: { 
    width: 8, 
    height: 8, 
    borderRadius: 4, 
    marginRight: 8 
  },
  statusText: { 
    fontSize: 14, 
    color: '#333' 
  },
  statsContainer: { 
    padding: 16 
  },
  sectionTitle: { 
    fontSize: 24, 
    fontWeight: 'bold', 
    color: '#333', 
    marginBottom: 16 
  },
  statsGrid: { 
    flexDirection: 'row', 
    flexWrap: 'wrap', 
    justifyContent: 'space-between' 
  },
  statCard: { 
    width: (width - 48) / 2, 
    backgroundColor: '#fff', 
    padding: 16, 
    borderRadius: 12, 
    marginBottom: 12,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  statValue: { 
    fontSize: 24, 
    fontWeight: 'bold', 
    color: '#333', 
    marginTop: 8 
  },
  statLabel: { 
    fontSize: 14, 
    color: '#666', 
    marginTop: 4 
  },
  modulesContainer: { 
    padding: 16 
  },
  modulesGrid: { 
    flexDirection: 'row', 
    flexWrap: 'wrap', 
    justifyContent: 'space-between' 
  },
  moduleCard: { 
    width: (width - 48) / 2, 
    marginBottom: 16,
    borderRadius: 16,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
  },
  moduleGradient: { 
    borderRadius: 16, 
    padding: 16, 
    minHeight: 120 
  },
  moduleHeader: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    marginBottom: 12 
  },
  moduleCount: { 
    fontSize: 16, 
    fontWeight: 'bold', 
    color: '#fff' 
  },
  moduleContent: { 
    flex: 1 
  },
  moduleTitle: { 
    fontSize: 16, 
    fontWeight: 'bold', 
    color: '#fff', 
    marginBottom: 4 
  },
  moduleSubtitle: { 
    fontSize: 12, 
    color: '#fff', 
    opacity: 0.9, 
    marginBottom: 8 
  },
  moduleDescription: { 
    fontSize: 10, 
    color: '#fff', 
    opacity: 0.8 
  },
  errorContainer: { 
    alignItems: 'center', 
    padding: 20 
  },
  errorText: { 
    color: '#FF3B30', 
    fontSize: 16, 
    textAlign: 'center', 
    marginTop: 16, 
    marginBottom: 20 
  },
  debugSection: { 
    backgroundColor: '#f0f0f0', 
    padding: 16, 
    borderRadius: 8, 
    margin: 16 
  },
  debugTitle: { 
    fontSize: 16, 
    fontWeight: 'bold', 
    marginBottom: 8, 
    color: '#333' 
  },
  debugText: { 
    fontSize: 14, 
    color: '#666', 
    marginBottom: 4 
  },
  retryBtn: { 
    marginTop: 16, 
    alignSelf: 'center', 
    backgroundColor: COLORS.primary, 
    padding: 10, 
    borderRadius: 8 
  },
  retryText: { 
    color: '#fff', 
    fontWeight: 'bold' 
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FF3B30',
    padding: 14,
    borderRadius: 10,
    justifyContent: 'center',
    marginTop: 24,
    marginHorizontal: 16,
  },
  logoutText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
    marginLeft: 8,
  },
});

export default AdminDashboard; 