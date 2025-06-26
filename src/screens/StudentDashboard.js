import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    ScrollView,
    StyleSheet,
    TouchableOpacity,
    Image,
    Alert,
    RefreshControl,
    Dimensions
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { Ionicons } from '@expo/vector-icons';
import StudentNavigation from '../components/student/StudentNavigation';
import authService from '../services/authService';
import studentApiService from '../services/studentApiService';
import { notificationService } from '../services/notificationService';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

// Recent Activities Component
const RecentActivitiesSection = ({ navigation }) => {
    const [activities, setActivities] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        loadRecentActivities();
    }, []);

    const loadRecentActivities = async () => {
        try {
            setLoading(true);
            const recentActivities = await studentApiService.getRecentActivities();
            setActivities(recentActivities.slice(0, 5)); // Show only last 5 activities
        } catch (error) {
            console.warn('Failed to load recent activities:', error);
        } finally {
            setLoading(false);
        }
    };

    const getActivityIcon = (type) => {
        switch (type) {
            case 'booking_created':
                return { name: 'bed-outline', color: '#4A90E2' };
            case 'booking_cancelled':
                return { name: 'close-circle-outline', color: '#e74c3c' };
            case 'order_placed':
                return { name: 'restaurant-outline', color: '#FF6B35' };
            case 'order_cancelled':
                return { name: 'close-circle-outline', color: '#e74c3c' };
            case 'payment_success':
                return { name: 'checkmark-circle-outline', color: '#27ae60' };
            default:
                return { name: 'information-circle-outline', color: '#666' };
        }
    };

    const formatTimestamp = (timestamp) => {
        const date = new Date(timestamp);
        const now = new Date();
        const diffMs = now - date;
        const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
        const diffDays = Math.floor(diffHours / 24);

        if (diffHours < 1) return 'Just now';
        if (diffHours < 24) return `${diffHours}h ago`;
        if (diffDays < 7) return `${diffDays}d ago`;
        return date.toLocaleDateString();
    };

    if (activities.length === 0) return null;

    return (
        <View style={styles.section}>
            <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Recent Activity</Text>
                <TouchableOpacity onPress={() => navigation.navigate('ActivityHistory')}>
                    <Text style={styles.seeAllText}>See All</Text>
                </TouchableOpacity>
            </View>
            <View style={styles.activityContainer}>
                {activities.map((activity, index) => {
                    const icon = getActivityIcon(activity.type);
                    return (
                        <View key={activity.id || index} style={styles.activityItem}>
                            <View style={styles.activityIconContainer}>
                                <Ionicons 
                                    name={icon.name} 
                                    size={20} 
                                    color={icon.color} 
                                />
                            </View>
                            <View style={styles.activityContent}>
                                <Text style={styles.activityMessage} numberOfLines={2}>
                                    {activity.message}
                                </Text>
                                <Text style={styles.activityTime}>
                                    {formatTimestamp(activity.timestamp)}
                                </Text>
                            </View>
                        </View>
                    );
                })}
            </View>
        </View>
    );
};

const StudentDashboard = ({ navigation }) => {
    const [user, setUser] = useState(null);
    const [dashboardData, setDashboardData] = useState({
        bookings: [],
        orders: [],
        accommodations: [],
        foodProviders: [],
        notifications: []
    });
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [unreadNotifications, setUnreadNotifications] = useState(0);

    useEffect(() => {
        loadDashboardData();
        loadNotificationCount();
    }, []);

    // Load notification count
    const loadNotificationCount = async () => {
        try {
            const count = await notificationService.getUnreadCount();
            setUnreadNotifications(count);
        } catch (error) {
            console.warn('Failed to load notification count:', error);
        }
    };

    useEffect(() => {
        loadDashboardData();
    }, []);

    const loadDashboardData = async () => {
        try {
            setLoading(true);
            const currentUser = await authService.getCurrentUser();
            setUser(currentUser);

            // Use only confirmed working endpoints from studentApiService
            const [bookings, orders, accommodations, foodProviders, notifications] = await Promise.all([
                studentApiService.getStudentBookings().catch(() => []),
                studentApiService.getStudentOrders().catch(() => []),
                studentApiService.getAccommodations().catch(() => []),
                studentApiService.getFoodProviders().catch(() => []),
                studentApiService.getStudentNotifications().catch(() => [])
            ]);

            setDashboardData({
                bookings: bookings || [],
                orders: orders || [],
                accommodations: (accommodations || []).slice(0, 5), // Limit for dashboard
                foodProviders: (foodProviders || []).slice(0, 5), // Limit for dashboard
                notifications: notifications || []
            });
        } catch (error) {
            console.error('Dashboard load error:', error);
            Alert.alert('Error', 'Failed to load dashboard data');
        } finally {
            setLoading(false);
        }
    };

    const onRefresh = async () => {
        setRefreshing(true);
        await loadDashboardData();
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
                        await authService.logout();
                        navigation.replace('Login');
                    }
                }
            ]
        );
    };

    const QuickActionCard = ({ title, icon, onPress, color = '#4A90E2' }) => (
        <TouchableOpacity style={[styles.quickActionCard, { borderColor: color }]} onPress={onPress}>
            <LinearGradient
                colors={[color + '20', color + '10']}
                style={styles.quickActionGradient}
            >
                <Icon name={icon} size={32} color={color} />
                <Text style={[styles.quickActionText, { color }]}>{title}</Text>
            </LinearGradient>
        </TouchableOpacity>
    );

    const StatCard = ({ title, value, icon, color = '#4A90E2' }) => (
        <View style={[styles.statCard, { borderLeftColor: color }]}>
            <View style={styles.statContent}>
                <View>
                    <Text style={styles.statValue}>{value}</Text>
                    <Text style={styles.statTitle}>{title}</Text>
                </View>
                <Icon name={icon} size={24} color={color} />
            </View>
        </View>
    );

    const getStatusColor = (status) => {
        switch (status?.toLowerCase()) {
            case 'delivered':
                return '#28a745';
            case 'confirmed':
                return '#007bff';
            case 'preparing':
                return '#ffc107';
            case 'on_the_way':
            case 'out_for_delivery':
                return '#17a2b8';
            case 'cancelled':
                return '#dc3545';
            case 'pending':
                return '#6c757d';
            default:
                return '#6c757d';
        }
    };

    const formatOrderStatus = (status) => {
        switch (status?.toLowerCase()) {
            case 'on_the_way':
                return 'On the Way';
            case 'out_for_delivery':
                return 'Out for Delivery';
            default:
                return status?.charAt(0).toUpperCase() + status?.slice(1) || 'Unknown';
        }
    };

    if (loading) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.loadingContainer}>
                    <Text style={styles.loadingText}>Loading Dashboard...</Text>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView
                contentContainerStyle={styles.scrollContent}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                }
            >
                {/* Header */}
                <LinearGradient
                    colors={['#667eea', '#764ba2']}
                    style={styles.header}
                >
                    <View style={styles.headerContent}>
                        <View style={styles.welcomeSection}>
                            <Text style={styles.welcomeText}>Welcome back,</Text>
                            <Text style={styles.userName}>{user?.name || 'Student'}</Text>
                            <Text style={styles.userRole}>Student Dashboard</Text>
                        </View>
                        <View style={styles.headerActions}>
                            {/* Notification Icon */}
                            <TouchableOpacity 
                                onPress={() => navigation.navigate('Notifications')}
                                style={styles.notificationButton}
                            >
                                <Ionicons name="notifications" size={24} color="#fff" />
                                {unreadNotifications > 0 && (
                                    <View style={styles.notificationBadge}>
                                        <Text style={styles.notificationBadgeText}>
                                            {unreadNotifications > 99 ? '99+' : unreadNotifications}
                                        </Text>
                                    </View>
                                )}
                            </TouchableOpacity>
                            
                            {/* Profile/Logout */}
                            <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
                                <Icon name="logout" size={24} color="#fff" />
                            </TouchableOpacity>
                        </View>
                    </View>
                </LinearGradient>

                {/* Stats Overview */}
                <View style={styles.statsContainer}>
                    <Text style={styles.sectionTitle}>Overview</Text>
                    <View style={styles.statsGrid}>
                        <StatCard
                            title="Active Bookings"
                            value={dashboardData.bookings.filter(b => b.status === 'confirmed').length}
                            icon="hotel"
                            color="#4CAF50"
                        />
                        <StatCard
                            title="Recent Orders"
                            value={dashboardData.orders.length}
                            icon="restaurant"
                            color="#FF9800"
                        />
                        <StatCard
                            title="Saved Places"
                            value="0"
                            icon="favorite"
                            color="#E91E63"
                        />
                        <StatCard
                            title="Notifications"
                            value={dashboardData.notifications.length}
                            icon="notifications"
                            color="#9C27B0"
                        />
                    </View>
                </View>

                {/* Quick Actions */}
                <View style={styles.quickActionsContainer}>
                    <Text style={styles.sectionTitle}>Quick Actions</Text>
                    <View style={styles.quickActionsGrid}>
                        <QuickActionCard
                            title="Find Accommodation"
                            icon="search"
                            color="#4A90E2"
                            onPress={() => navigation.navigate('AccommodationsList')}
                        />
                        <QuickActionCard
                            title="Order Food"
                            icon="restaurant-menu"
                            color="#FF6B35"
                            onPress={() => navigation.navigate('FoodProvidersList')}
                        />
                        <QuickActionCard
                            title="My Bookings"
                            icon="calendar-today"
                            color="#28A745"
                            onPress={() => navigation.navigate('MyBookings')}
                        />
                        <QuickActionCard
                            title="My Orders"
                            icon="shopping-bag"
                            color="#FFC107"
                            onPress={() => navigation.navigate('MyOrders')}
                        />
                    </View>
                </View>

                {/* Booking & Order Tracking Section */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>My Bookings & Orders</Text>
                    
                    {/* Recent Bookings */}
                    <TouchableOpacity 
                        style={styles.trackingCard}
                        onPress={() => navigation.navigate('MyBookings')}
                    >
                        <View style={styles.trackingHeader}>
                            <View style={styles.trackingTitleSection}>
                                <Ionicons name="bed-outline" size={24} color="#4A90E2" />
                                <Text style={styles.trackingTitle}>Active Bookings</Text>
                            </View>
                            <View style={styles.trackingBadge}>
                                <Text style={styles.trackingBadgeText}>
                                    {dashboardData.bookings?.filter(b => b.status === 'confirmed' || b.status === 'pending').length || 0}
                                </Text>
                            </View>
                        </View>
                        <Text style={styles.trackingSubtitle}>
                            Manage your accommodation bookings
                        </Text>
                        <View style={styles.trackingActions}>
                            <Text style={styles.viewAllText}>View All</Text>
                            <Ionicons name="chevron-forward" size={16} color="#6c757d" />
                        </View>
                    </TouchableOpacity>

                    {/* Recent Orders */}
                    <TouchableOpacity 
                        style={styles.trackingCard}
                        onPress={() => navigation.navigate('MyOrders')}
                    >
                        <View style={styles.trackingHeader}>
                            <View style={styles.trackingTitleSection}>
                                <Ionicons name="restaurant-outline" size={24} color="#28a745" />
                                <Text style={styles.trackingTitle}>Recent Orders</Text>
                            </View>
                            <View style={[styles.trackingBadge, { backgroundColor: '#28a745' }]}>
                                <Text style={styles.trackingBadgeText}>
                                    {dashboardData.orders?.filter(o => o.status !== 'delivered' && o.status !== 'cancelled').length || 0}
                                </Text>
                            </View>
                        </View>
                        <Text style={styles.trackingSubtitle}>
                            Track your food orders in real-time
                        </Text>
                        <View style={styles.trackingActions}>
                            <Text style={styles.viewAllText}>View All</Text>
                            <Ionicons name="chevron-forward" size={16} color="#6c757d" />
                        </View>
                    </TouchableOpacity>

                    {/* Quick Order Tracking */}
                    {dashboardData.orders?.length > 0 && (
                        <View style={styles.quickTrackingSection}>
                            <Text style={styles.quickTrackingTitle}>Latest Order Status</Text>
                            {dashboardData.orders.slice(0, 1).map((order, index) => (
                                <View key={index} style={styles.quickOrderCard}>
                                    <View style={styles.quickOrderInfo}>
                                        <Text style={styles.quickOrderProvider}>
                                            {order.providerName || order.provider?.name || 'Food Provider'}
                                        </Text>
                                        <Text style={styles.quickOrderId}>
                                            Order #{order.orderNumber || order.id}
                                        </Text>
                                    </View>
                                    <View style={[styles.quickOrderStatus, { backgroundColor: getStatusColor(order.status) }]}>
                                        <Text style={styles.quickOrderStatusText}>
                                            {formatOrderStatus(order.status)}
                                        </Text>
                                    </View>
                                </View>
                            ))}
                        </View>
                    )}
                </View>

                {/* Recent Bookings */}
                {dashboardData.bookings.length > 0 && (
                    <View style={styles.recentSection}>
                        <View style={styles.sectionHeader}>
                            <Text style={styles.sectionTitle}>Recent Bookings</Text>
                            <TouchableOpacity onPress={() => navigation.navigate('MyBookings')}>
                                <Text style={styles.seeAllText}>See All</Text>
                            </TouchableOpacity>
                        </View>
                        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                            {dashboardData.bookings.slice(0, 3).map((booking) => (
                                <View key={booking._id || booking.id} style={styles.bookingCard}>
                                    <Text style={styles.bookingTitle}>{booking.accommodation?.title || booking.accommodation?.name || 'Accommodation'}</Text>
                                    <Text style={styles.bookingStatus}>{booking.status || 'Pending'}</Text>
                                    <Text style={styles.bookingDate}>
                                        {booking.start_date ? new Date(booking.start_date).toLocaleDateString() : 'Date not available'}
                                    </Text>
                                </View>
                            ))}
                        </ScrollView>
                    </View>
                )}

                {/* Featured Accommodations */}
                {dashboardData.accommodations.length > 0 && (
                    <View style={styles.recentSection}>
                        <View style={styles.sectionHeader}>
                            <Text style={styles.sectionTitle}>Featured Accommodations</Text>
                            <TouchableOpacity onPress={() => navigation.navigate('AccommodationsList')}>
                                <Text style={styles.seeAllText}>See All</Text>
                            </TouchableOpacity>
                        </View>
                        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                            {dashboardData.accommodations.slice(0, 3).map((accommodation) => (
                                <TouchableOpacity
                                    key={accommodation._id || accommodation.id}
                                    style={styles.accommodationCard}
                                    onPress={() => {
                                        // Show alert that details are not available
                                        Alert.alert('Notice', 'Accommodation details are temporarily unavailable. You can browse all accommodations from the list.');
                                    }}
                                >
                                    <Image
                                        source={{ uri: accommodation.images?.[0] || accommodation.image || 'https://via.placeholder.com/200' }}
                                        style={styles.accommodationImage}
                                    />
                                    <View style={styles.accommodationInfo}>
                                        <Text style={styles.accommodationTitle} numberOfLines={2}>
                                            {accommodation.title || accommodation.name || 'Accommodation'}
                                        </Text>
                                        <Text style={styles.accommodationPrice}>
                                            ${accommodation.price || accommodation.monthlyRent || 'N/A'}/night
                                        </Text>
                                        <View style={styles.accommodationRating}>
                                            <Icon name="star" size={16} color="#FFD700" />
                                            <Text style={styles.ratingText}>
                                                {accommodation.rating || '4.5'}
                                            </Text>
                                        </View>
                                    </View>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                    </View>
                )}

                {/* Featured Food Providers */}
                {dashboardData.foodProviders.length > 0 && (
                    <View style={styles.recentSection}>
                        <View style={styles.sectionHeader}>
                            <Text style={styles.sectionTitle}>Popular Food Providers</Text>
                            <TouchableOpacity onPress={() => navigation.navigate('FoodProvidersList')}>
                                <Text style={styles.seeAllText}>See All</Text>
                            </TouchableOpacity>
                        </View>
                        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                            {dashboardData.foodProviders.slice(0, 3).map((provider) => (
                                <TouchableOpacity
                                    key={provider._id || provider.id}
                                    style={styles.foodProviderCard}
                                    onPress={() => {
                                        // Show alert that details are not available
                                        Alert.alert('Notice', 'Food provider details are temporarily unavailable. You can browse all providers from the list.');
                                    }}
                                >
                                    <Image
                                        source={{ uri: provider.image || provider.logo || 'https://via.placeholder.com/150' }}
                                        style={styles.foodProviderImage}
                                    />
                                    <View style={styles.foodProviderInfo}>
                                        <Text style={styles.foodProviderName} numberOfLines={1}>
                                            {provider.name || provider.businessName || 'Food Provider'}
                                        </Text>
                                        <Text style={styles.foodProviderCuisine}>
                                            {provider.cuisine_type || provider.cuisineType || 'Various'}
                                        </Text>
                                        <View style={styles.foodProviderRating}>
                                            <Icon name="star" size={14} color="#FFD700" />
                                            <Text style={styles.ratingText}>
                                                {provider.rating || '4.0'}
                                            </Text>
                                        </View>
                                    </View>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                    </View>
                )}

                {/* Recent Activity Section */}
                <RecentActivitiesSection navigation={navigation} />
            </ScrollView>
            
            {/* Bottom Navigation */}
            <StudentNavigation navigation={navigation} activeRoute="dashboard" />
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8f9fa',
    },
    scrollContent: {
        flexGrow: 1,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        fontSize: 16,
        color: '#666',
    },
    header: {
        paddingHorizontal: 20,
        paddingVertical: 30,
        borderBottomLeftRadius: 30,
        borderBottomRightRadius: 30,
    },
    headerContent: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    welcomeSection: {
        flex: 1,
    },
    welcomeText: {
        color: '#fff',
        fontSize: 16,
        opacity: 0.9,
    },
    userName: {
        color: '#fff',
        fontSize: 24,
        fontWeight: 'bold',
        marginTop: 5,
    },
    userRole: {
        color: '#fff',
        fontSize: 14,
        opacity: 0.8,
        marginTop: 2,
    },
    headerActions: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    notificationButton: {
        padding: 10,
        borderRadius: 20,
        backgroundColor: 'rgba(255,255,255,0.2)',
        marginRight: 8,
        position: 'relative',
    },
    notificationBadge: {
        position: 'absolute',
        top: 5,
        right: 5,
        backgroundColor: '#ff4757',
        borderRadius: 10,
        minWidth: 20,
        height: 20,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: '#fff',
    },
    notificationBadgeText: {
        color: '#fff',
        fontSize: 10,
        fontWeight: 'bold',
    },
    logoutButton: {
        padding: 10,
        borderRadius: 20,
        backgroundColor: 'rgba(255,255,255,0.2)',
    },
    statsContainer: {
        padding: 20,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 15,
    },
    statsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
    },
    statCard: {
        backgroundColor: '#fff',
        borderRadius: 15,
        padding: 15,
        width: (width - 50) / 2,
        marginBottom: 15,
        borderLeftWidth: 4,
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
    },
    statContent: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    statValue: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#333',
    },
    statTitle: {
        fontSize: 12,
        color: '#666',
        marginTop: 5,
    },
    quickActionsContainer: {
        padding: 20,
        paddingTop: 0,
    },
    quickActionsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
    },
    quickActionCard: {
        width: (width - 50) / 2,
        marginBottom: 15,
        borderRadius: 15,
        borderWidth: 1,
        overflow: 'hidden',
    },
    quickActionGradient: {
        padding: 20,
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: 100,
    },
    quickActionText: {
        fontSize: 14,
        fontWeight: '600',
        textAlign: 'center',
        marginTop: 10,
    },
    recentSection: {
        padding: 20,
        paddingTop: 0,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 15,
    },
    seeAllText: {
        color: '#4A90E2',
        fontSize: 14,
        fontWeight: '600',
    },
    bookingCard: {
        backgroundColor: '#fff',
        borderRadius: 15,
        padding: 15,
        marginRight: 15,
        width: 200,
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
    },
    bookingTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 5,
    },
    bookingStatus: {
        fontSize: 12,
        color: '#4CAF50',
        textTransform: 'capitalize',
        marginBottom: 5,
    },
    bookingDate: {
        fontSize: 12,
        color: '#666',
    },
    accommodationCard: {
        backgroundColor: '#fff',
        borderRadius: 15,
        marginRight: 15,
        width: 180,
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
        overflow: 'hidden',
    },
    accommodationImage: {
        width: '100%',
        height: 120,
    },
    accommodationInfo: {
        padding: 12,
    },
    accommodationTitle: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 5,
    },
    accommodationPrice: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#4A90E2',
        marginBottom: 5,
    },
    accommodationRating: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    ratingText: {
        fontSize: 12,
        color: '#666',
        marginLeft: 4,
    },
    foodProviderCard: {
        backgroundColor: '#fff',
        borderRadius: 15,
        marginRight: 15,
        width: 140,
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
        overflow: 'hidden',
    },
    foodProviderImage: {
        width: '100%',
        height: 100,
    },
    foodProviderInfo: {
        padding: 10,
    },
    foodProviderName: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 3,
    },
    foodProviderCuisine: {
        fontSize: 12,
        color: '#666',
        marginBottom: 5,
    },
    foodProviderRating: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    trackingCard: {
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
    trackingHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    trackingTitleSection: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    trackingTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
        marginLeft: 8,
    },
    trackingBadge: {
        backgroundColor: '#4A90E2',
        borderRadius: 12,
        paddingHorizontal: 8,
        paddingVertical: 4,
        minWidth: 24,
        alignItems: 'center',
    },
    trackingBadgeText: {
        color: '#fff',
        fontSize: 12,
        fontWeight: 'bold',
    },
    trackingSubtitle: {
        fontSize: 14,
        color: '#6c757d',
        marginBottom: 12,
    },
    trackingActions: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-end',
    },
    viewAllText: {
        fontSize: 14,
        color: '#6c757d',
        marginRight: 4,
    },
    quickTrackingSection: {
        marginTop: 16,
        paddingTop: 16,
        borderTopWidth: 1,
        borderTopColor: '#f1f3f4',
    },
    quickTrackingTitle: {
        fontSize: 14,
        fontWeight: '600',
        color: '#333',
        marginBottom: 12,
    },
    quickOrderCard: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: '#f8f9fa',
        borderRadius: 8,
        padding: 12,
    },
    quickOrderInfo: {
        flex: 1,
    },
    quickOrderProvider: {
        fontSize: 14,
        fontWeight: '500',
        color: '#333',
    },
    quickOrderId: {
        fontSize: 12,
        color: '#6c757d',
        marginTop: 2,
    },
    quickOrderStatus: {
        borderRadius: 6,
        paddingHorizontal: 8,
        paddingVertical: 4,
    },
    quickOrderStatusText: {
        color: '#fff',
        fontSize: 11,
        fontWeight: 'bold',
        textAlign: 'center',
    },
    // Recent Activities Styles
    activityContainer: {
        backgroundColor: '#fff',
        borderRadius: 12,
        marginTop: 8,
    },
    activityItem: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#f1f3f4',
    },
    activityIconContainer: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#f8f9fa',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    activityContent: {
        flex: 1,
        justifyContent: 'center',
    },
    activityMessage: {
        fontSize: 14,
        color: '#333',
        fontWeight: '500',
        marginBottom: 4,
    },
    activityTime: {
        fontSize: 12,
        color: '#6c757d',
    },
});

export default StudentDashboard;
