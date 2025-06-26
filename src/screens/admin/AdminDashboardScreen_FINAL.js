import React, { useState, useEffect, useCallback } from 'react';
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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { COLORS, SIZES } from '../../utils/constants';
import authService from '../../services/authService';
import {
    getDashboardData,
    getSystemHealth,
    getAllUsers,
    getStudents,
    getLandlords,
    getFoodProviders,
    getUserAnalytics,
    getPerformanceMetrics,
    getRevenueAnalytics,
    getAllAccommodations,
    getPendingAccommodations,
    getTransactionHistory
} from '../../services/adminApiService';

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
            totalRevenue: 0,
            activeBookings: 0,
            pendingApprovals: 0,
            systemHealth: 'Loading...'
        },
        recentActivity: [],
        analytics: [],
        systemStatus: 'checking'
    });
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [selectedTimeframe, setSelectedTimeframe] = useState('30d');
    const [backendStatus, setBackendStatus] = useState('checking');
    const [errorMessages, setErrorMessages] = useState([]);

    // Load user data
    useEffect(() => {
        loadUserData();
    }, []);

    // Load dashboard data
    useEffect(() => {
        loadDashboardData();
    }, [selectedTimeframe]);

    const loadUserData = async () => {
        try {
            const userData = await authService.getCurrentUser();
            setUser(userData);
        } catch (error) {
            console.error('Failed to load user data:', error);
        }
    };

    const loadDashboardData = async () => {
        if (loading) {
            console.log('🔄 Loading admin dashboard data...');
        }
        
        try {
            setBackendStatus('loading');
            const errors = [];
            
            // Initialize stats object
            const newStats = {
                totalUsers: 0,
                totalStudents: 0,
                totalLandlords: 0,
                totalFoodProviders: 0,
                totalAccommodations: 0,
                totalRevenue: 0,
                activeBookings: 0,
                pendingApprovals: 0,
                systemHealth: 'Unknown'
            };

            // Load system health first
            try {
                const healthData = await getSystemHealth();
                newStats.systemHealth = healthData?.status || healthData?.health || 'Good';
                setBackendStatus('connected');
                console.log('✅ System health loaded successfully');
            } catch (error) {
                console.warn('⚠️ System health failed:', error.message);
                errors.push('System health check failed');
                newStats.systemHealth = 'Error';
            }

            // Load user counts
            try {
                const [allUsers, students, landlords, foodProviders] = await Promise.allSettled([
                    getAllUsers(),
                    getStudents(),
                    getLandlords(),
                    getFoodProviders()
                ]);

                if (allUsers.status === 'fulfilled') {
                    newStats.totalUsers = allUsers.value?.length || allUsers.value?.total || 0;
                    console.log(`✅ Total users: ${newStats.totalUsers}`);
                }

                if (students.status === 'fulfilled') {
                    newStats.totalStudents = students.value?.length || students.value?.total || 0;
                    console.log(`✅ Total students: ${newStats.totalStudents}`);
                }

                if (landlords.status === 'fulfilled') {
                    newStats.totalLandlords = landlords.value?.length || landlords.value?.total || 0;
                    console.log(`✅ Total landlords: ${newStats.totalLandlords}`);
                }

                if (foodProviders.status === 'fulfilled') {
                    newStats.totalFoodProviders = foodProviders.value?.length || foodProviders.value?.total || 0;
                    console.log(`✅ Total food providers: ${newStats.totalFoodProviders}`);
                }
            } catch (error) {
                console.warn('⚠️ User data loading failed:', error.message);
                errors.push('User data loading failed');
            }

            // Load accommodation counts
            try {
                const [allAccommodations, pendingAccommodations] = await Promise.allSettled([
                    getAllAccommodations(),
                    getPendingAccommodations()
                ]);

                if (allAccommodations.status === 'fulfilled') {
                    newStats.totalAccommodations = allAccommodations.value?.length || allAccommodations.value?.total || 0;
                    console.log(`✅ Total accommodations: ${newStats.totalAccommodations}`);
                }

                if (pendingAccommodations.status === 'fulfilled') {
                    newStats.pendingApprovals = pendingAccommodations.value?.length || pendingAccommodations.value?.total || 0;
                    console.log(`✅ Pending approvals: ${newStats.pendingApprovals}`);
                }
            } catch (error) {
                console.warn('⚠️ Accommodation data loading failed:', error.message);
                errors.push('Accommodation data loading failed');
            }

            // Load revenue data
            try {
                const revenueData = await getRevenueAnalytics(selectedTimeframe);
                newStats.totalRevenue = revenueData?.totalRevenue || revenueData?.total || 0;
                console.log(`✅ Total revenue: ${newStats.totalRevenue}`);
            } catch (error) {
                console.warn('⚠️ Revenue data loading failed:', error.message);
                errors.push('Revenue data loading failed');
            }

            // Load recent transactions for activity
            let recentActivity = [];
            try {
                const transactions = await getTransactionHistory('7d');
                recentActivity = (transactions?.transactions || transactions || [])
                    .slice(0, 5)
                    .map(transaction => ({
                        id: transaction.id,
                        type: 'transaction',
                        title: `Payment - ${transaction.type || 'Transaction'}`,
                        description: `Amount: $${transaction.amount || '0.00'}`,
                        time: transaction.createdAt || transaction.date || new Date().toISOString(),
                        icon: 'card-outline',
                        color: COLORS.success
                    }));
                console.log(`✅ Recent activity loaded: ${recentActivity.length} items`);
            } catch (error) {
                console.warn('⚠️ Transaction history loading failed:', error.message);
                errors.push('Recent activity loading failed');
            }

            // Update dashboard data
            setDashboardData(prevData => ({
                ...prevData,
                stats: newStats,
                recentActivity,
                systemStatus: backendStatus
            }));

            setErrorMessages(errors);

            if (errors.length === 0) {
                console.log('✅ All dashboard data loaded successfully');
                setBackendStatus('connected');
            } else {
                console.log(`⚠️ Dashboard loaded with ${errors.length} warnings`);
                setBackendStatus('partial');
            }

        } catch (error) {
            console.error('❌ Dashboard data loading failed:', error);
            setBackendStatus('error');
            setErrorMessages(['Failed to load dashboard data']);
            
            Alert.alert(
                'Connection Error',
                'Unable to load dashboard data. Please check your internet connection and try again.',
                [{ text: 'OK' }]
            );
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const onRefresh = useCallback(() => {
        setRefreshing(true);
        loadDashboardData();
    }, [selectedTimeframe]);

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
                            await authService.logout();
                            await AsyncStorage.clear();
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

    const getStatusColor = () => {
        switch (backendStatus) {
            case 'connected': return COLORS.success;
            case 'partial': return COLORS.warning;
            case 'error': return COLORS.error;
            default: return COLORS.gray;
        }
    };

    const getStatusIcon = () => {
        switch (backendStatus) {
            case 'connected': return 'checkmark-circle';
            case 'partial': return 'warning';
            case 'error': return 'close-circle';
            default: return 'time';
        }
    };

    const formatNumber = (num) => {
        if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
        if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
        return num?.toString() || '0';
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(amount || 0);
    };

    const MetricCard = ({ title, value, icon, color, subtitle, onPress }) => (
        <TouchableOpacity 
            style={[styles.metricCard, { borderLeftColor: color }]}
            onPress={onPress}
            activeOpacity={0.7}
        >
            <View style={styles.metricHeader}>
                <Ionicons name={icon} size={24} color={color} />
                <Text style={styles.metricValue}>{value}</Text>
            </View>
            <Text style={styles.metricTitle}>{title}</Text>
            {subtitle && <Text style={styles.metricSubtitle}>{subtitle}</Text>}
        </TouchableOpacity>
    );

    const ActivityItem = ({ item }) => (
        <View style={styles.activityItem}>
            <View style={[styles.activityIcon, { backgroundColor: item.color + '20' }]}>
                <Ionicons name={item.icon} size={16} color={item.color} />
            </View>
            <View style={styles.activityContent}>
                <Text style={styles.activityTitle}>{item.title}</Text>
                <Text style={styles.activityDescription}>{item.description}</Text>
                <Text style={styles.activityTime}>
                    {new Date(item.time).toLocaleDateString()}
                </Text>
            </View>
        </View>
    );

    if (loading) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={COLORS.primary} />
                    <Text style={styles.loadingText}>Loading Admin Dashboard...</Text>
                    <Text style={styles.loadingSubtext}>Connecting to backend services</Text>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <LinearGradient
                colors={[COLORS.primary, COLORS.primary + '90']}
                style={styles.header}
            >
                <View style={styles.headerContent}>
                    <View style={styles.headerLeft}>
                        <Text style={styles.welcomeText}>
                            Welcome back, {user?.name || 'Admin'}
                        </Text>
                        <Text style={styles.roleText}>Admin Dashboard</Text>
                    </View>
                    <View style={styles.headerRight}>
                        <TouchableOpacity 
                            style={styles.statusIndicator}
                            onPress={() => loadDashboardData()}
                        >
                            <Ionicons 
                                name={getStatusIcon()} 
                                size={20} 
                                color={getStatusColor()} 
                            />
                            <Text style={[styles.statusText, { color: getStatusColor() }]}>
                                {backendStatus}
                            </Text>
                        </TouchableOpacity>
                        <TouchableOpacity 
                            style={styles.logoutButton}
                            onPress={handleLogout}
                        >
                            <Ionicons name="log-out-outline" size={24} color="white" />
                        </TouchableOpacity>
                    </View>
                </View>
            </LinearGradient>

            <ScrollView
                style={styles.content}
                refreshControl={
                    <RefreshControl 
                        refreshing={refreshing} 
                        onRefresh={onRefresh}
                        colors={[COLORS.primary]}
                    />
                }
                showsVerticalScrollIndicator={false}
            >
                {/* Error Messages */}
                {errorMessages.length > 0 && (
                    <View style={styles.errorContainer}>
                        <Ionicons name="warning" size={20} color={COLORS.warning} />
                        <Text style={styles.errorText}>
                            Some features may be limited: {errorMessages.join(', ')}
                        </Text>
                    </View>
                )}

                {/* Time Frame Selector */}
                <View style={styles.timeframeContainer}>
                    <Text style={styles.sectionTitle}>Dashboard Overview</Text>
                    <View style={styles.timeframeSelector}>
                        {['7d', '30d', '90d'].map((period) => (
                            <TouchableOpacity
                                key={period}
                                style={[
                                    styles.timeframeButton,
                                    selectedTimeframe === period && styles.timeframeButtonActive
                                ]}
                                onPress={() => setSelectedTimeframe(period)}
                            >
                                <Text style={[
                                    styles.timeframeText,
                                    selectedTimeframe === period && styles.timeframeTextActive
                                ]}>
                                    {period}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>

                {/* Metrics Grid */}
                <View style={styles.metricsContainer}>
                    <View style={styles.metricsRow}>
                        <MetricCard
                            title="Total Users"
                            value={formatNumber(dashboardData.stats.totalUsers)}
                            icon="people"
                            color={COLORS.primary}
                            onPress={() => navigation.navigate('AdminUserManagement')}
                        />
                        <MetricCard
                            title="Students"
                            value={formatNumber(dashboardData.stats.totalStudents)}
                            icon="school"
                            color={COLORS.info}
                            onPress={() => navigation.navigate('AdminUserManagement', { tab: 'students' })}
                        />
                    </View>
                    <View style={styles.metricsRow}>
                        <MetricCard
                            title="Landlords"
                            value={formatNumber(dashboardData.stats.totalLandlords)}
                            icon="home"
                            color={COLORS.success}
                            onPress={() => navigation.navigate('AdminUserManagement', { tab: 'landlords' })}
                        />
                        <MetricCard
                            title="Food Providers"
                            value={formatNumber(dashboardData.stats.totalFoodProviders)}
                            icon="restaurant"
                            color={COLORS.warning}
                            onPress={() => navigation.navigate('AdminUserManagement', { tab: 'food_providers' })}
                        />
                    </View>
                    <View style={styles.metricsRow}>
                        <MetricCard
                            title="Accommodations"
                            value={formatNumber(dashboardData.stats.totalAccommodations)}
                            icon="bed"
                            color={COLORS.secondary}
                            onPress={() => navigation.navigate('AdminAccommodationManagement')}
                        />
                        <MetricCard
                            title="Pending Approvals"
                            value={formatNumber(dashboardData.stats.pendingApprovals)}
                            icon="time"
                            color={COLORS.error}
                            onPress={() => navigation.navigate('AdminAccommodationManagement', { tab: 'pending' })}
                        />
                    </View>
                    <View style={styles.metricsRow}>
                        <MetricCard
                            title="Total Revenue"
                            value={formatCurrency(dashboardData.stats.totalRevenue)}
                            icon="wallet"
                            color={COLORS.success}
                            subtitle={`Last ${selectedTimeframe}`}
                            onPress={() => navigation.navigate('AdminFinancialManagement')}
                        />
                        <MetricCard
                            title="System Health"
                            value={dashboardData.stats.systemHealth}
                            icon="pulse"
                            color={getStatusColor()}
                            onPress={() => loadDashboardData()}
                        />
                    </View>
                </View>

                {/* Recent Activity */}
                <View style={styles.activityContainer}>
                    <Text style={styles.sectionTitle}>Recent Activity</Text>
                    {dashboardData.recentActivity.length > 0 ? (
                        <FlatList
                            data={dashboardData.recentActivity}
                            renderItem={({ item }) => <ActivityItem item={item} />}
                            keyExtractor={(item) => item.id?.toString() || Math.random().toString()}
                            scrollEnabled={false}
                            showsVerticalScrollIndicator={false}
                        />
                    ) : (
                        <View style={styles.emptyStateContainer}>
                            <Ionicons name="list-outline" size={48} color={COLORS.gray} />
                            <Text style={styles.emptyStateText}>No recent activity</Text>
                            <Text style={styles.emptyStateSubtext}>
                                Recent transactions and activities will appear here
                            </Text>
                        </View>
                    )}
                </View>

                {/* Quick Actions */}
                <View style={styles.quickActionsContainer}>
                    <Text style={styles.sectionTitle}>Quick Actions</Text>
                    <View style={styles.quickActionsGrid}>
                        <TouchableOpacity 
                            style={styles.quickActionCard}
                            onPress={() => navigation.navigate('AdminUserManagement')}
                        >
                            <Ionicons name="people" size={32} color={COLORS.primary} />
                            <Text style={styles.quickActionText}>Manage Users</Text>
                        </TouchableOpacity>
                        <TouchableOpacity 
                            style={styles.quickActionCard}
                            onPress={() => navigation.navigate('AdminContentModeration')}
                        >
                            <Ionicons name="shield-checkmark" size={32} color={COLORS.warning} />
                            <Text style={styles.quickActionText}>Moderation</Text>
                        </TouchableOpacity>
                        <TouchableOpacity 
                            style={styles.quickActionCard}
                            onPress={() => navigation.navigate('AdminFinancialManagement')}
                        >
                            <Ionicons name="wallet" size={32} color={COLORS.success} />
                            <Text style={styles.quickActionText}>Financial</Text>
                        </TouchableOpacity>
                        <TouchableOpacity 
                            style={styles.quickActionCard}
                            onPress={() => navigation.navigate('AdminAnalytics')}
                        >
                            <Ionicons name="analytics" size={32} color={COLORS.info} />
                            <Text style={styles.quickActionText}>Analytics</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                <View style={styles.bottomSpacing} />
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: SIZES.padding,
    },
    loadingText: {
        fontSize: 18,
        fontWeight: '600',
        color: COLORS.text,
        marginTop: 16,
    },
    loadingSubtext: {
        fontSize: 14,
        color: COLORS.textSecondary,
        marginTop: 8,
    },
    header: {
        paddingTop: 20,
        paddingBottom: 30,
        paddingHorizontal: SIZES.padding,
    },
    headerContent: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    headerLeft: {
        flex: 1,
    },
    welcomeText: {
        fontSize: 24,
        fontWeight: 'bold',
        color: 'white',
        marginBottom: 4,
    },
    roleText: {
        fontSize: 16,
        color: 'rgba(255, 255, 255, 0.8)',
    },
    headerRight: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    statusIndicator: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
        gap: 6,
    },
    statusText: {
        fontSize: 12,
        fontWeight: '600',
        textTransform: 'capitalize',
    },
    logoutButton: {
        padding: 8,
    },
    content: {
        flex: 1,
        padding: SIZES.padding,
    },
    errorContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.warning + '20',
        padding: 12,
        borderRadius: 8,
        marginBottom: 16,
        gap: 8,
    },
    errorText: {
        flex: 1,
        fontSize: 14,
        color: COLORS.warning,
    },
    timeframeContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: COLORS.text,
    },
    timeframeSelector: {
        flexDirection: 'row',
        backgroundColor: COLORS.surface,
        borderRadius: 8,
        padding: 4,
    },
    timeframeButton: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 6,
    },
    timeframeButtonActive: {
        backgroundColor: COLORS.primary,
    },
    timeframeText: {
        fontSize: 14,
        color: COLORS.textSecondary,
        fontWeight: '500',
    },
    timeframeTextActive: {
        color: 'white',
    },
    metricsContainer: {
        marginBottom: 24,
    },
    metricsRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 12,
    },
    metricCard: {
        flex: 1,
        backgroundColor: COLORS.surface,
        padding: 16,
        borderRadius: 12,
        marginHorizontal: 6,
        borderLeftWidth: 4,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    metricHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    metricValue: {
        fontSize: 20,
        fontWeight: 'bold',
        color: COLORS.text,
    },
    metricTitle: {
        fontSize: 14,
        color: COLORS.textSecondary,
        fontWeight: '500',
    },
    metricSubtitle: {
        fontSize: 12,
        color: COLORS.textSecondary,
        marginTop: 4,
    },
    activityContainer: {
        marginBottom: 24,
    },
    activityItem: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.surface,
        padding: 16,
        borderRadius: 12,
        marginBottom: 8,
        elevation: 1,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
    },
    activityIcon: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    activityContent: {
        flex: 1,
    },
    activityTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: COLORS.text,
        marginBottom: 4,
    },
    activityDescription: {
        fontSize: 14,
        color: COLORS.textSecondary,
        marginBottom: 4,
    },
    activityTime: {
        fontSize: 12,
        color: COLORS.textSecondary,
    },
    emptyStateContainer: {
        alignItems: 'center',
        padding: 32,
        backgroundColor: COLORS.surface,
        borderRadius: 12,
    },
    emptyStateText: {
        fontSize: 16,
        fontWeight: '600',
        color: COLORS.textSecondary,
        marginTop: 12,
    },
    emptyStateSubtext: {
        fontSize: 14,
        color: COLORS.textSecondary,
        textAlign: 'center',
        marginTop: 8,
    },
    quickActionsContainer: {
        marginBottom: 24,
    },
    quickActionsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        marginTop: 16,
    },
    quickActionCard: {
        width: (width - (SIZES.padding * 2) - 12) / 2,
        backgroundColor: COLORS.surface,
        padding: 20,
        borderRadius: 12,
        alignItems: 'center',
        marginBottom: 12,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    quickActionText: {
        fontSize: 14,
        fontWeight: '600',
        color: COLORS.text,
        marginTop: 8,
        textAlign: 'center',
    },
    bottomSpacing: {
        height: 20,
    },
});

export default AdminDashboardScreen;
