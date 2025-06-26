import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    RefreshControl,
    TouchableOpacity,
    Alert,
    ActivityIndicator,
    Dimensions,
    FlatList,
    Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { COLORS, SIZES } from '../../utils/constants';
import { fetchFromBackend } from '../../utils/networkUtils';
import authService from '../../services/authService';
import adminApiService from '../../services/adminApiService';

const { width, height } = Dimensions.get('window');

const AdminDashboardScreen = ({ navigation }) => {
    const [user, setUser] = useState(null);
    const [dashboardData, setDashboardData] = useState({
        stats: {
            totalUsers: 0,
            totalStudents: 0,
            totalLandlords: 0,
            totalFoodProviders: 0,
            totalAccommodations: 0,
            totalOrders: 0,
            totalRevenue: 0,
            activeBookings: 0,
            pendingApprovals: 0,
            systemHealth: 'Good'
        },
        recentActivity: [],
        topPerformers: [],
        systemAlerts: []
    });
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [selectedTimeframe, setSelectedTimeframe] = useState('7d');
    const [autoRefresh, setAutoRefresh] = useState(true);

    useEffect(() => {
        loadDashboardData();
    }, [selectedTimeframe]);

    // Auto refresh every 30 seconds for real-time updates
    useEffect(() => {
        let interval;
        if (autoRefresh) {
            interval = setInterval(() => {
                loadDashboardData();
            }, 30000); // 30 seconds
        }
        return () => {
            if (interval) {
                clearInterval(interval);
            }
        };
    }, [autoRefresh, selectedTimeframe]);

    const loadDashboardData = async () => {
        try {
            setLoading(true);
            
            // Get current user
            const currentUser = await authService.getCurrentUser();
            setUser(currentUser);

            // Load real-time dashboard data from backend
            const [
                realTimeStats,
                recentActivityData,
                dashboardAnalytics,
                systemHealthData
            ] = await Promise.all([
                adminApiService.getRealTimeStats(),
                adminApiService.getRecentActivity(5),
                adminApiService.getDashboardAnalytics(selectedTimeframe),
                adminApiService.getSystemHealth()
            ]);

            // Merge real-time stats with analytics
            const stats = {
                totalUsers: realTimeStats.stats?.totalUsers || 0,
                totalStudents: realTimeStats.stats?.totalStudents || 0,
                totalLandlords: realTimeStats.stats?.totalLandlords || 0,
                totalFoodProviders: realTimeStats.stats?.totalFoodProviders || 0,
                totalAccommodations: realTimeStats.stats?.totalAccommodations || 0,
                totalOrders: realTimeStats.stats?.totalFoodItems || 0,
                totalRevenue: realTimeStats.stats?.totalRevenue || 0,
                activeBookings: realTimeStats.stats?.activeBookings || 0,
                pendingApprovals: realTimeStats.stats?.pendingApprovals || 0,
                systemHealth: systemHealthData.health?.status || 'Good',
                onlineUsers: realTimeStats.stats?.onlineUsers || 0,
                newRegistrationsToday: realTimeStats.stats?.newRegistrationsToday || 0,
                bookingsToday: realTimeStats.stats?.bookingsToday || 0,
                ordersToday: realTimeStats.stats?.ordersToday || 0
            };

            const recentActivity = recentActivityData.activities || [];

            // Get top performers from analytics
            const topPerformers = dashboardAnalytics.topPerformers || [
                {
                    id: '1',
                    name: 'University Heights',
                    type: 'accommodation',
                    revenue: 125000,
                    bookings: 45,
                    rating: 4.8,
                    image: 'https://via.placeholder.com/60'
                },
                {
                    id: '2',
                    name: 'Campus Delights',
                    type: 'food',
                    revenue: 89000,
                    orders: 234,
                    rating: 4.6,
                    image: 'https://via.placeholder.com/60'
                },
                {
                    id: '3',
                    name: 'Student Paradise',
                    type: 'accommodation',
                    revenue: 98000,
                    bookings: 38,
                    rating: 4.7,
                    image: 'https://via.placeholder.com/60'
                }
            ];

            // Get system alerts from health data
            const systemAlerts = [];
            if (systemHealthData.health?.components) {
                const components = systemHealthData.health.components;
                
                // Check for degraded services
                Object.keys(components).forEach(component => {
                    const service = components[component];
                    if (service.status === 'degraded') {
                        systemAlerts.push({
                            id: component,
                            type: 'warning',
                            title: `${component.charAt(0).toUpperCase() + component.slice(1)} Service Degraded`,
                            message: `${component} service is experiencing performance issues`,
                            time: service.lastCheck ? new Date(service.lastCheck).toLocaleString() : 'Unknown',
                            severity: 'medium'
                        });
                    } else if (service.status === 'unhealthy') {
                        systemAlerts.push({
                            id: component,
                            type: 'error',
                            title: `${component.charAt(0).toUpperCase() + component.slice(1)} Service Down`,
                            message: `${component} service is not responding`,
                            time: service.lastCheck ? new Date(service.lastCheck).toLocaleString() : 'Unknown',
                            severity: 'high'
                        });
                    }
                });
            }

            // Add performance alerts based on metrics
            if (systemHealthData.health?.metrics) {
                const metrics = systemHealthData.health.metrics;
                
                if (metrics.errorRate > 0.05) {
                    systemAlerts.push({
                        id: 'error_rate',
                        type: 'warning',
                        title: 'High Error Rate',
                        message: `Error rate is ${(metrics.errorRate * 100).toFixed(2)}%`,
                        time: 'Now',
                        severity: 'medium'
                    });
                }
                
                if (metrics.averageResponseTime > 1000) {
                    systemAlerts.push({
                        id: 'response_time',
                        type: 'warning',
                        title: 'Slow Response Time',
                        message: `Average response time is ${metrics.averageResponseTime}ms`,
                        time: 'Now',
                        severity: 'medium'
                    });
                }
            }

            // If no alerts, add a default success message
            if (systemAlerts.length === 0) {
                systemAlerts.push({
                    id: 'all_good',
                    type: 'info',
                    title: 'All Systems Operational',
                    message: 'All services are running normally',
                    time: 'Now',
                    severity: 'low'
                });
            }

            setDashboardData({
                stats,
                recentActivity,
                topPerformers,
                systemAlerts
            });

        } catch (error) {
            console.error('Error loading dashboard data:', error);
            Alert.alert('Error', 'Failed to load dashboard data');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const onRefresh = async () => {
        setRefreshing(true);
        await loadDashboardData();
    };

    const handleLogout = () => {
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
                            await authService.logout();
                            navigation.reset({
                                index: 0,
                                routes: [{ name: 'Login' }],
                            });
                        } catch (error) {
                            console.error('Logout error:', error);
                        }
                    },
                },
            ]
        );
    };

    const quickActions = [
        {
            id: '1',
            title: 'User Management',
            subtitle: 'Manage all users',
            icon: 'people',
            color: '#4CAF50',
            route: 'AdminUserManagement',
            count: dashboardData.stats.pendingApprovals
        },
        {
            id: '2',
            title: 'Accommodations',
            subtitle: 'Manage properties',
            icon: 'home',
            color: '#2196F3',
            route: 'AdminAccommodations',
            count: dashboardData.stats.totalAccommodations
        },
        {
            id: '3',
            title: 'Food Providers',
            subtitle: 'Manage restaurants',
            icon: 'restaurant',
            color: '#FF9800',
            route: 'AdminFoodProviders',
            count: dashboardData.stats.totalFoodProviders
        },
        {
            id: '4',
            title: 'Analytics',
            subtitle: 'View insights',
            icon: 'analytics',
            color: '#9C27B0',
            route: 'AdminAnalytics'
        },
        {
            id: '5',
            title: 'Bookings',
            subtitle: 'Manage bookings',
            icon: 'calendar',
            color: '#FF5722',
            route: 'AdminBookings',
            count: dashboardData.stats.activeBookings
        },
        {
            id: '6',
            title: 'Orders',
            subtitle: 'Food orders',
            icon: 'receipt',
            color: '#795548',
            route: 'AdminOrders',
            count: dashboardData.stats.totalOrders
        },
        {
            id: '7',
            title: 'Content Moderation',
            subtitle: 'Review content',
            icon: 'shield-checkmark',
            color: '#E91E63',
            route: 'AdminContentModeration'
        },
        {
            id: '8',
            title: 'System Settings',
            subtitle: 'App configuration',
            icon: 'settings',
            color: '#607D8B',
            route: 'AdminSystemSettings'
        }
    ];

    const timeframes = [
        { id: '7d', label: '7 Days' },
        { id: '30d', label: '30 Days' },
        { id: '90d', label: '90 Days' },
        { id: '1y', label: '1 Year' }
    ];

    const formatCurrency = (amount) => {
        return `PKR ${amount?.toLocaleString() || 0}`;
    };

    const getHealthColor = (health) => {
        switch (health) {
            case 'Excellent': return '#4CAF50';
            case 'Good': return '#8BC34A';
            case 'Fair': return '#FF9800';
            case 'Poor': return '#F44336';
            default: return '#9E9E9E';
        }
    };

    const getAlertColor = (severity) => {
        switch (severity) {
            case 'high': return '#F44336';
            case 'medium': return '#FF9800';
            case 'low': return '#4CAF50';
            default: return '#9E9E9E';
        }
    };

    const renderStatCard = ({ item, index }) => (
        <View style={[styles.statCard, { marginLeft: index === 0 ? 20 : 10 }]}>
            <View style={styles.statHeader}>
                <Text style={styles.statNumber}>{item.value}</Text>
                {item.isLive && (
                    <View style={styles.liveIndicatorSmall}>
                        <View style={styles.liveDotSmall} />
                    </View>
                )}
            </View>
            <Text style={styles.statLabel}>{item.label}</Text>
            {item.change && (
                <View style={[styles.changeIndicator, { backgroundColor: item.change > 0 ? '#4CAF50' : '#F44336' }]}>
                    <Ionicons 
                        name={item.change > 0 ? 'trending-up' : 'trending-down'} 
                        size={12} 
                        color="white" 
                    />
                    <Text style={styles.changeText}>{Math.abs(item.change)}%</Text>
                </View>
            )}
        </View>
    );

    const renderQuickAction = ({ item }) => (
        <TouchableOpacity
            style={styles.quickActionCard}
            onPress={() => navigation.navigate(item.route)}
        >
            <View style={[styles.quickActionIcon, { backgroundColor: item.color }]}>
                <Ionicons name={item.icon} size={24} color="white" />
                {item.count > 0 && (
                    <View style={styles.badge}>
                        <Text style={styles.badgeText}>{item.count > 99 ? '99+' : item.count}</Text>
                    </View>
                )}
            </View>
            <Text style={styles.quickActionTitle}>{item.title}</Text>
            <Text style={styles.quickActionSubtitle}>{item.subtitle}</Text>
        </TouchableOpacity>
    );

    const renderActivityItem = ({ item }) => (
        <View style={styles.activityItem}>
            <View style={[styles.activityIcon, { backgroundColor: item.color }]}>
                <Ionicons name={item.icon} size={16} color="white" />
            </View>
            <View style={styles.activityContent}>
                <Text style={styles.activityTitle}>{item.title}</Text>
                <Text style={styles.activityDescription}>{item.description}</Text>
                <Text style={styles.activityTime}>{item.time}</Text>
            </View>
        </View>
    );

    const renderTopPerformer = ({ item }) => (
        <View style={styles.performerCard}>
            <Image source={{ uri: item.image }} style={styles.performerImage} />
            <View style={styles.performerInfo}>
                <Text style={styles.performerName}>{item.name}</Text>
                <Text style={styles.performerType}>{item.type === 'accommodation' ? 'Accommodation' : 'Food Provider'}</Text>
                <View style={styles.performerStats}>
                    <Text style={styles.performerRevenue}>{formatCurrency(item.revenue)}</Text>
                    <View style={styles.performerRating}>
                        <Ionicons name="star" size={12} color="#FFD700" />
                        <Text style={styles.ratingText}>{item.rating}</Text>
                    </View>
                </View>
            </View>
        </View>
    );

    const renderAlert = ({ item }) => (
        <View style={[styles.alertItem, { borderLeftColor: getAlertColor(item.severity) }]}>
            <View style={styles.alertHeader}>
                <Text style={styles.alertTitle}>{item.title}</Text>
                <Text style={styles.alertTime}>{item.time}</Text>
            </View>
            <Text style={styles.alertMessage}>{item.message}</Text>
        </View>
    );

    if (loading) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={COLORS.primary} />
                    <Text style={styles.loadingText}>Loading Dashboard...</Text>
                </View>
            </SafeAreaView>
        );
    }

    const statsData = [
        { label: 'Total Users', value: dashboardData.stats.totalUsers.toLocaleString(), change: 12 },
        { label: 'Students', value: dashboardData.stats.totalStudents.toLocaleString(), change: 8 },
        { label: 'Landlords', value: dashboardData.stats.totalLandlords.toLocaleString(), change: 15 },
        { label: 'Food Providers', value: dashboardData.stats.totalFoodProviders.toLocaleString(), change: 22 },
        { label: 'Online Users', value: dashboardData.stats.onlineUsers?.toLocaleString() || '0', change: 5, isLive: true },
        { label: 'Today Bookings', value: dashboardData.stats.bookingsToday?.toLocaleString() || '0', change: 25 },
        { label: 'Today Orders', value: dashboardData.stats.ordersToday?.toLocaleString() || '0', change: 18 },
        { label: 'Revenue', value: formatCurrency(dashboardData.stats.totalRevenue), change: 18 },
    ];

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView
                style={styles.scrollView}
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                        colors={[COLORS.primary]}
                        tintColor={COLORS.primary}
                    />
                }
            >
                {/* Header */}
                <LinearGradient
                    colors={['#667eea', '#764ba2']}
                    style={styles.header}
                >
                    <View style={styles.headerContent}>
                        <View style={styles.headerLeft}>
                            <Text style={styles.welcomeText}>Welcome back,</Text>
                            <Text style={styles.adminName}>{user?.name || 'Admin'}</Text>
                            <Text style={styles.headerSubtitle}>System Status: {dashboardData.stats.systemHealth}</Text>
                        </View>
                        <View style={styles.headerRight}>
                            <TouchableOpacity
                                style={styles.notificationButton}
                                onPress={() => navigation.navigate('AdminNotifications')}
                            >
                                <Ionicons name="notifications-outline" size={24} color="white" />
                                {dashboardData.systemAlerts.length > 0 && (
                                    <View style={styles.notificationBadge}>
                                        <Text style={styles.notificationBadgeText}>
                                            {dashboardData.systemAlerts.length}
                                        </Text>
                                    </View>
                                )}
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={styles.logoutButton}
                                onPress={handleLogout}
                            >
                                <Ionicons name="log-out-outline" size={24} color="white" />
                            </TouchableOpacity>
                        </View>
                    </View>

                    {/* System Health Indicator */}
                    <View style={styles.healthIndicator}>
                        <View style={[styles.healthDot, { backgroundColor: getHealthColor(dashboardData.stats.systemHealth) }]} />
                        <Text style={styles.healthText}>All systems operational</Text>
                        {autoRefresh && (
                            <View style={styles.liveIndicator}>
                                <View style={styles.liveDot} />
                                <Text style={styles.liveText}>LIVE</Text>
                            </View>
                        )}
                    </View>
                </LinearGradient>

                {/* Time Filter */}
                <View style={styles.timeFilterContainer}>
                    <ScrollView 
                        horizontal 
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={styles.timeFilters}
                    >
                        {timeframes.map((timeframe) => (
                            <TouchableOpacity
                                key={timeframe.id}
                                style={[
                                    styles.timeFilterButton,
                                    selectedTimeframe === timeframe.id && styles.timeFilterButtonActive
                                ]}
                                onPress={() => setSelectedTimeframe(timeframe.id)}
                            >
                                <Text style={[
                                    styles.timeFilterText,
                                    selectedTimeframe === timeframe.id && styles.timeFilterTextActive
                                ]}>
                                    {timeframe.label}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                </View>

                {/* Stats Overview */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Overview</Text>
                    <FlatList
                        data={statsData}
                        renderItem={renderStatCard}
                        keyExtractor={(item, index) => index.toString()}
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={styles.statsContainer}
                    />
                </View>

                {/* Quick Actions */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Quick Actions</Text>
                    <FlatList
                        data={quickActions}
                        renderItem={renderQuickAction}
                        keyExtractor={(item) => item.id}
                        numColumns={2}
                        scrollEnabled={false}
                        contentContainerStyle={styles.quickActionsGrid}
                    />
                </View>

                {/* Recent Activity */}
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>Recent Activity</Text>
                        <TouchableOpacity onPress={() => navigation.navigate('AdminSystemLogs')}>
                            <Text style={styles.viewAllText}>View All</Text>
                        </TouchableOpacity>
                    </View>
                    <View style={styles.activityContainer}>
                        {dashboardData.recentActivity.slice(0, 5).map((item) => (
                            <View key={item.id}>
                                {renderActivityItem({ item })}
                            </View>
                        ))}
                    </View>
                </View>

                {/* Top Performers */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Top Performers</Text>
                    <FlatList
                        data={dashboardData.topPerformers}
                        renderItem={renderTopPerformer}
                        keyExtractor={(item) => item.id}
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={styles.performersContainer}
                    />
                </View>

                {/* System Alerts */}
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>System Alerts</Text>
                        <TouchableOpacity onPress={() => navigation.navigate('AdminSystemHealth')}>
                            <Text style={styles.viewAllText}>View All</Text>
                        </TouchableOpacity>
                    </View>
                    <View style={styles.alertsContainer}>
                        {dashboardData.systemAlerts.map((item) => (
                            <View key={item.id}>
                                {renderAlert({ item })}
                            </View>
                        ))}
                    </View>
                </View>

                <View style={{ height: 100 }} />
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8f9fa',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        marginTop: 10,
        fontSize: 16,
        color: COLORS.primary,
    },
    scrollView: {
        flex: 1,
    },
    header: {
        paddingTop: 20,
        paddingBottom: 30,
        paddingHorizontal: 20,
    },
    headerContent: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
    },
    headerLeft: {
        flex: 1,
    },
    welcomeText: {
        fontSize: 16,
        color: 'rgba(255, 255, 255, 0.8)',
        marginBottom: 4,
    },
    adminName: {
        fontSize: 24,
        fontWeight: 'bold',
        color: 'white',
        marginBottom: 4,
    },
    headerSubtitle: {
        fontSize: 14,
        color: 'rgba(255, 255, 255, 0.8)',
    },
    headerRight: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    notificationButton: {
        padding: 8,
        marginRight: 8,
        position: 'relative',
    },
    notificationBadge: {
        position: 'absolute',
        top: 4,
        right: 4,
        backgroundColor: '#FF4444',
        borderRadius: 10,
        width: 20,
        height: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },
    notificationBadgeText: {
        color: 'white',
        fontSize: 10,
        fontWeight: 'bold',
    },
    logoutButton: {
        padding: 8,
    },
    healthIndicator: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 15,
    },
    healthDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        marginRight: 8,
    },
    healthText: {
        color: 'rgba(255, 255, 255, 0.9)',
        fontSize: 14,
    },
    liveIndicator: {
        flexDirection: 'row',
        alignItems: 'center',
        marginLeft: 15,
        paddingHorizontal: 8,
        paddingVertical: 4,
        backgroundColor: 'rgba(76, 175, 80, 0.2)',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: 'rgba(76, 175, 80, 0.5)',
    },
    liveDot: {
        width: 6,
        height: 6,
        borderRadius: 3,
        backgroundColor: '#4CAF50',
        marginRight: 4,
        shadowColor: '#4CAF50',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.8,
        shadowRadius: 3,
        elevation: 3,
    },
    liveText: {
        color: '#4CAF50',
        fontSize: 10,
        fontWeight: 'bold',
    },
    timeFilterContainer: {
        paddingVertical: 15,
    },
    timeFilters: {
        paddingHorizontal: 20,
    },
    timeFilterButton: {
        paddingHorizontal: 20,
        paddingVertical: 8,
        marginRight: 10,
        borderRadius: 20,
        backgroundColor: 'white',
        borderWidth: 1,
        borderColor: '#e0e0e0',
    },
    timeFilterButtonActive: {
        backgroundColor: COLORS.primary,
        borderColor: COLORS.primary,
    },
    timeFilterText: {
        color: '#666',
        fontSize: 14,
        fontWeight: '500',
    },
    timeFilterTextActive: {
        color: 'white',
    },
    section: {
        marginBottom: 25,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        marginBottom: 15,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#333',
        paddingHorizontal: 20,
        marginBottom: 15,
    },
    viewAllText: {
        color: COLORS.primary,
        fontSize: 14,
        fontWeight: '600',
    },
    statsContainer: {
        paddingRight: 20,
    },
    statCard: {
        backgroundColor: 'white',
        padding: 20,
        borderRadius: 12,
        marginRight: 10,
        width: 140,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    statHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 4,
    },
    statNumber: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#333',
        flex: 1,
    },
    liveIndicatorSmall: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: '#4CAF50',
        shadowColor: '#4CAF50',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.8,
        shadowRadius: 2,
        elevation: 2,
    },
    liveDotSmall: {
        width: 4,
        height: 4,
        borderRadius: 2,
        backgroundColor: 'white',
        alignSelf: 'center',
        marginTop: 2,
    },
    statLabel: {
        fontSize: 12,
        color: '#666',
        marginBottom: 8,
    },
    changeIndicator: {
        flexDirection: 'row',
        alignItems: 'center',
        alignSelf: 'flex-start',
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 10,
    },
    changeText: {
        color: 'white',
        fontSize: 10,
        fontWeight: 'bold',
        marginLeft: 2,
    },
    quickActionsGrid: {
        paddingHorizontal: 20,
    },
    quickActionCard: {
        backgroundColor: 'white',
        padding: 20,
        borderRadius: 12,
        flex: 1,
        margin: 5,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    quickActionIcon: {
        width: 50,
        height: 50,
        borderRadius: 25,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 10,
        position: 'relative',
    },
    badge: {
        position: 'absolute',
        top: -5,
        right: -5,
        backgroundColor: '#FF4444',
        borderRadius: 10,
        minWidth: 20,
        height: 20,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 4,
    },
    badgeText: {
        color: 'white',
        fontSize: 10,
        fontWeight: 'bold',
    },
    quickActionTitle: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#333',
        textAlign: 'center',
        marginBottom: 4,
    },
    quickActionSubtitle: {
        fontSize: 12,
        color: '#666',
        textAlign: 'center',
    },
    activityContainer: {
        backgroundColor: 'white',
        marginHorizontal: 20,
        borderRadius: 12,
        padding: 15,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    activityItem: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    activityIcon: {
        width: 32,
        height: 32,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    activityContent: {
        flex: 1,
    },
    activityTitle: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 2,
    },
    activityDescription: {
        fontSize: 13,
        color: '#666',
        marginBottom: 4,
    },
    activityTime: {
        fontSize: 11,
        color: '#999',
    },
    performersContainer: {
        paddingHorizontal: 20,
    },
    performerCard: {
        backgroundColor: 'white',
        padding: 15,
        borderRadius: 12,
        marginRight: 15,
        width: 200,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    performerImage: {
        width: 60,
        height: 60,
        borderRadius: 30,
        marginBottom: 10,
        alignSelf: 'center',
    },
    performerInfo: {
        alignItems: 'center',
    },
    performerName: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 4,
        textAlign: 'center',
    },
    performerType: {
        fontSize: 12,
        color: '#666',
        marginBottom: 8,
        textTransform: 'capitalize',
    },
    performerStats: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        width: '100%',
    },
    performerRevenue: {
        fontSize: 14,
        fontWeight: 'bold',
        color: COLORS.primary,
    },
    performerRating: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    ratingText: {
        fontSize: 12,
        color: '#666',
        marginLeft: 4,
    },
    alertsContainer: {
        backgroundColor: 'white',
        marginHorizontal: 20,
        borderRadius: 12,
        padding: 15,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    alertItem: {
        paddingVertical: 12,
        paddingLeft: 15,
        borderLeftWidth: 4,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    alertHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 4,
    },
    alertTitle: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#333',
        flex: 1,
    },
    alertTime: {
        fontSize: 11,
        color: '#999',
    },
    alertMessage: {
        fontSize: 13,
        color: '#666',
    },
});

export default AdminDashboardScreen;
