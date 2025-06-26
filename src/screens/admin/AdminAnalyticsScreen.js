import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    ActivityIndicator,
    Dimensions,
    RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SIZES } from '../../utils/constants';
import adminApiService from '../../services/adminApiService';
import SimpleChart from '../../components/admin/SimpleChart';

const { width } = Dimensions.get('window');

const AdminAnalyticsScreen = ({ navigation }) => {
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [selectedTab, setSelectedTab] = useState('users');
    const [analyticsData, setAnalyticsData] = useState({
        users: {},
        revenue: {},
        bookings: {},
        orders: {},
        accommodations: {},
        foodProviders: {}
    });
    const [timeRange, setTimeRange] = useState('30d');

    useEffect(() => {
        loadAnalyticsData();
    }, [selectedTab, timeRange]);

    const loadAnalyticsData = async () => {
        try {
            setLoading(true);
            const data = await adminApiService.getAnalytics(selectedTab, timeRange);
            setAnalyticsData(prev => ({
                ...prev,
                [selectedTab]: data
            }));
        } catch (error) {
            console.error('Error loading analytics:', error);
        } finally {
            setLoading(false);
        }
    };

    const onRefresh = async () => {
        setRefreshing(true);
        await loadAnalyticsData();
        setRefreshing(false);
    };

    const renderTimeRangeSelector = () => (
        <View style={styles.timeRangeContainer}>
            {['7d', '30d', '90d', '1y'].map((range) => (
                <TouchableOpacity
                    key={range}
                    style={[
                        styles.timeRangeButton,
                        timeRange === range && styles.timeRangeButtonActive
                    ]}
                    onPress={() => setTimeRange(range)}
                >
                    <Text style={[
                        styles.timeRangeText,
                        timeRange === range && styles.timeRangeTextActive
                    ]}>
                        {range}
                    </Text>
                </TouchableOpacity>
            ))}
        </View>
    );

    const renderUserAnalytics = () => {
        const data = analyticsData.users;
        if (!data || Object.keys(data).length === 0) return null;

        return (
            <ScrollView showsVerticalScrollIndicator={false}>
                {/* User Growth Chart */}
                <View style={styles.chartContainer}>
                    <SimpleChart
                        title="User Growth Trend"
                        data={data.growthData || []}
                        type="line"
                        height={250}
                        color={COLORS.primary}
                    />
                </View>

                {/* User Statistics Cards */}
                <View style={styles.statsGrid}>
                    {[
                        { title: 'Total Users', value: data.totalUsers || 0, icon: 'people', color: '#3498db' },
                        { title: 'Active Users', value: data.activeUsers || 0, icon: 'person-add', color: '#2ecc71' },
                        { title: 'New This Month', value: data.newThisMonth || 0, icon: 'trending-up', color: '#e74c3c' },
                        { title: 'User Retention', value: `${data.retentionRate || 0}%`, icon: 'repeat', color: '#f39c12' },
                    ].map((stat, index) => (
                        <View key={index} style={styles.statCard}>
                            <View style={[styles.statIcon, { backgroundColor: stat.color + '20' }]}>
                                <Ionicons name={stat.icon} size={24} color={stat.color} />
                            </View>
                            <Text style={styles.statValue}>{stat.value}</Text>
                            <Text style={styles.statTitle}>{stat.title}</Text>
                        </View>
                    ))}
                </View>

                {/* Demographics Chart */}
                <View style={styles.chartContainer}>
                    <SimpleChart
                        title="User Demographics"
                        data={data.demographics || []}
                        type="pie"
                        height={250}
                        color={COLORS.success}
                    />
                </View>
            </ScrollView>
        );
    };

    const renderRevenueAnalytics = () => {
        const data = analyticsData.revenue;
        if (!data || Object.keys(data).length === 0) return null;

        return (
            <ScrollView showsVerticalScrollIndicator={false}>
                {/* Revenue Chart */}
                <View style={styles.chartContainer}>
                    <SimpleChart
                        title="Revenue Trend (PKR)"
                        data={data.revenueData || []}
                        type="bar"
                        height={250}
                        color="#10B981"
                    />
                </View>

                {/* Revenue Statistics */}
                <View style={styles.statsGrid}>
                    {[
                        { title: 'Total Revenue', value: `₨${data.totalRevenue || 0}`, icon: 'cash', color: '#10B981' },
                        { title: 'Booking Revenue', value: `₨${data.bookingRevenue || 0}`, icon: 'home', color: '#3B82F6' },
                        { title: 'Order Revenue', value: `₨${data.orderRevenue || 0}`, icon: 'restaurant', color: '#F59E0B' },
                        { title: 'Commission', value: `₨${data.commission || 0}`, icon: 'trending-up', color: '#8B5CF6' },
                    ].map((stat, index) => (
                        <View key={index} style={styles.statCard}>
                            <View style={[styles.statIcon, { backgroundColor: stat.color + '20' }]}>
                                <Ionicons name={stat.icon} size={24} color={stat.color} />
                            </View>
                            <Text style={styles.statValue}>{stat.value}</Text>
                            <Text style={styles.statTitle}>{stat.title}</Text>
                        </View>
                    ))}
                </View>
            </ScrollView>
        );
    };

    const renderBookingAnalytics = () => {
        const data = analyticsData.bookings;
        if (!data || Object.keys(data).length === 0) return null;

        return (
            <ScrollView showsVerticalScrollIndicator={false}>
                {/* Booking Trends Chart */}
                <View style={styles.chartContainer}>
                    <SimpleChart
                        title="Booking Trends"
                        data={data.bookingTrends || []}
                        type="line"
                        height={250}
                        color={COLORS.warning}
                    />
                </View>

                {/* Booking Statistics */}
                <View style={styles.statsGrid}>
                    {[
                        { title: 'Total Bookings', value: data.totalBookings || 0, icon: 'calendar', color: '#3498db' },
                        { title: 'Active Bookings', value: data.activeBookings || 0, icon: 'checkmark-circle', color: '#2ecc71' },
                        { title: 'Completion Rate', value: `${data.completionRate || 0}%`, icon: 'stats-chart', color: '#e74c3c' },
                        { title: 'Avg Duration', value: `${data.avgDuration || 0} days`, icon: 'time', color: '#f39c12' },
                    ].map((stat, index) => (
                        <View key={index} style={styles.statCard}>
                            <View style={[styles.statIcon, { backgroundColor: stat.color + '20' }]}>
                                <Ionicons name={stat.icon} size={24} color={stat.color} />
                            </View>
                            <Text style={styles.statValue}>{stat.value}</Text>
                            <Text style={styles.statTitle}>{stat.title}</Text>
                        </View>
                    ))}
                </View>
            </ScrollView>
        );
    };

    const renderOrderAnalytics = () => {
        const data = analyticsData.orders;
        if (!data || Object.keys(data).length === 0) return null;

        return (
            <ScrollView showsVerticalScrollIndicator={false}>
                {/* Order Volume Chart */}
                <View style={styles.chartContainer}>
                    <SimpleChart
                        title="Order Volume"
                        data={data.orderVolume || []}
                        type="bar"
                        height={250}
                        color="#EF4444"
                    />
                </View>

                {/* Order Statistics */}
                <View style={styles.statsGrid}>
                    {[
                        { title: 'Total Orders', value: data.totalOrders || 0, icon: 'receipt', color: '#3498db' },
                        { title: 'Completed Orders', value: data.completedOrders || 0, icon: 'checkmark-done', color: '#2ecc71' },
                        { title: 'Avg Order Value', value: `₨${data.avgOrderValue || 0}`, icon: 'card', color: '#e74c3c' },
                        { title: 'Popular Items', value: data.popularItemsCount || 0, icon: 'star', color: '#f39c12' },
                    ].map((stat, index) => (
                        <View key={index} style={styles.statCard}>
                            <View style={[styles.statIcon, { backgroundColor: stat.color + '20' }]}>
                                <Ionicons name={stat.icon} size={24} color={stat.color} />
                            </View>
                            <Text style={styles.statValue}>{stat.value}</Text>
                            <Text style={styles.statTitle}>{stat.title}</Text>
                        </View>
                    ))}
                </View>
            </ScrollView>
        );
    };

    const renderTabContent = () => {
        if (loading) {
            return (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={COLORS.primary} />
                    <Text style={styles.loadingText}>Loading analytics...</Text>
                </View>
            );
        }

        switch (selectedTab) {
            case 'users':
                return renderUserAnalytics();
            case 'revenue':
                return renderRevenueAnalytics();
            case 'bookings':
                return renderBookingAnalytics();
            case 'orders':
                return renderOrderAnalytics();
            default:
                return renderUserAnalytics();
        }
    };

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity
                    style={styles.backButton}
                    onPress={() => navigation.goBack()}
                >
                    <Ionicons name="arrow-back" size={24} color={COLORS.dark} />
                </TouchableOpacity>
                <View style={styles.headerContent}>
                    <Text style={styles.headerTitle}>Analytics Center</Text>
                    <Text style={styles.headerSubtitle}>Detailed platform insights</Text>
                </View>
            </View>

            {/* Tab Navigation */}
            <View style={styles.tabNavigation}>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    {[
                        { key: 'users', label: 'Users', icon: 'people' },
                        { key: 'revenue', label: 'Revenue', icon: 'cash' },
                        { key: 'bookings', label: 'Bookings', icon: 'calendar' },
                        { key: 'orders', label: 'Orders', icon: 'receipt' },
                    ].map((tab) => (
                        <TouchableOpacity
                            key={tab.key}
                            style={[
                                styles.tabButton,
                                selectedTab === tab.key && styles.tabButtonActive
                            ]}
                            onPress={() => setSelectedTab(tab.key)}
                        >
                            <Ionicons
                                name={tab.icon}
                                size={18}
                                color={selectedTab === tab.key ? COLORS.primary : COLORS.gray[500]}
                            />
                            <Text style={[
                                styles.tabButtonText,
                                selectedTab === tab.key && styles.tabButtonTextActive
                            ]}>
                                {tab.label}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            </View>

            {/* Time Range Selector */}
            {renderTimeRangeSelector()}

            {/* Content */}
            <ScrollView
                style={styles.content}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                }
            >
                {renderTabContent()}
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.gray[50],
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingTop: 20,
        paddingBottom: 16,
        backgroundColor: COLORS.light,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.gray[200],
    },
    backButton: {
        marginRight: 16,
        padding: 8,
    },
    headerContent: {
        flex: 1,
    },
    headerTitle: {
        fontSize: SIZES.h3,
        fontWeight: 'bold',
        color: COLORS.dark,
    },
    headerSubtitle: {
        fontSize: SIZES.body2,
        color: COLORS.gray[600],
        marginTop: 2,
    },
    tabNavigation: {
        backgroundColor: COLORS.light,
        paddingHorizontal: 20,
        paddingBottom: 16,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.gray[200],
    },
    tabButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderRadius: 12,
        marginRight: 12,
        backgroundColor: COLORS.gray[100],
    },
    tabButtonActive: {
        backgroundColor: COLORS.primary + '20',
    },
    tabButtonText: {
        fontSize: SIZES.body2,
        color: COLORS.gray[500],
        fontWeight: '500',
        marginLeft: 8,
    },
    tabButtonTextActive: {
        color: COLORS.primary,
        fontWeight: '600',
    },
    timeRangeContainer: {
        flexDirection: 'row',
        paddingHorizontal: 20,
        paddingVertical: 16,
        backgroundColor: COLORS.light,
    },
    timeRangeButton: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 8,
        marginRight: 8,
        backgroundColor: COLORS.gray[100],
    },
    timeRangeButtonActive: {
        backgroundColor: COLORS.primary,
    },
    timeRangeText: {
        fontSize: SIZES.body2,
        color: COLORS.gray[600],
        fontWeight: '500',
    },
    timeRangeTextActive: {
        color: COLORS.light,
        fontWeight: '600',
    },
    content: {
        flex: 1,
        padding: 20,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 60,
    },
    loadingText: {
        fontSize: SIZES.body1,
        color: COLORS.gray[600],
        marginTop: 16,
    },
    chartContainer: {
        backgroundColor: COLORS.light,
        borderRadius: 12,
        padding: 16,
        marginBottom: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    statsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        marginBottom: 20,
    },
    statCard: {
        backgroundColor: COLORS.light,
        borderRadius: 12,
        padding: 16,
        width: (width - 60) / 2,
        marginBottom: 16,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    statIcon: {
        width: 48,
        height: 48,
        borderRadius: 24,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 12,
    },
    statValue: {
        fontSize: SIZES.h4,
        fontWeight: 'bold',
        color: COLORS.dark,
        marginBottom: 4,
    },
    statTitle: {
        fontSize: SIZES.body2,
        color: COLORS.gray[600],
        textAlign: 'center',
    },
});

export default AdminAnalyticsScreen;
