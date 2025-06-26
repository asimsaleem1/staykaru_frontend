import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    ScrollView,
    StyleSheet,
    TouchableOpacity,
    Dimensions,
    RefreshControl,
    Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import LandlordNavigation from '../../components/landlord/LandlordNavigation';
import { fetchFromBackend } from '../../utils/networkUtils';

const { width } = Dimensions.get('window');

const AnalyticsScreen = ({ navigation }) => {
    const [analyticsData, setAnalyticsData] = useState({
        bookingStats: {
            totalBookings: 0,
            occupancyRate: 0,
            averageStayDuration: 0,
            cancellationRate: 0,
        },
        revenueStats: {
            totalRevenue: 0,
            monthlyRevenue: 0,
            averageBookingValue: 0,
            revenueGrowth: 0,
        },
        performanceStats: {
            averageRating: 0,
            totalReviews: 0,
            responseRate: 0,
            acceptanceRate: 0,
        },
        trends: {
            bookingTrends: [],
            revenueTrends: [],
            occupancyTrends: [],
        }
    });
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [selectedPeriod, setSelectedPeriod] = useState('monthly');

    const periodOptions = [
        { key: 'daily', label: 'Daily' },
        { key: 'weekly', label: 'Weekly' },
        { key: 'monthly', label: 'Monthly' },
        { key: 'yearly', label: 'Yearly' }
    ];

    useEffect(() => {
        loadAnalyticsData();
    }, [selectedPeriod]);

    const loadAnalyticsData = async () => {
        try {
            setLoading(true);
            
            const [bookingStatsRes, revenueStatsRes, performanceStatsRes] = await Promise.all([
                fetchFromBackend(`/users/landlord/statistics?period=${selectedPeriod}`),
                fetchFromBackend(`/bookings/landlord/revenue?period=${selectedPeriod}`),
                fetchFromBackend(`/accommodations/landlord/performance?period=${selectedPeriod}`)
            ]);

            if (bookingStatsRes.success && revenueStatsRes.success && performanceStatsRes.success) {
                setAnalyticsData({
                    bookingStats: bookingStatsRes.data,
                    revenueStats: revenueStatsRes.data,
                    performanceStats: performanceStatsRes.data,
                    trends: {
                        bookingTrends: bookingStatsRes.data.trends || [],
                        revenueTrends: revenueStatsRes.data.trends || [],
                        occupancyTrends: performanceStatsRes.data.trends || [],
                    }
                });
                console.log('✅ Analytics data loaded successfully');
            } else {
                Alert.alert('Error', 'Failed to load analytics data');
            }
        } catch (error) {
            console.error('❌ Error loading analytics:', error);
            Alert.alert('Error', 'Failed to load analytics data');
        } finally {
            setLoading(false);
        }
    };

    const onRefresh = async () => {
        setRefreshing(true);
        await loadAnalyticsData();
        setRefreshing(false);
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-PK', {
            style: 'currency',
            currency: 'PKR',
            minimumFractionDigits: 0,
        }).format(amount);
    };

    const formatPercentage = (value) => {
        return `${value?.toFixed(1) || 0}%`;
    };

    const renderMetricCard = (title, value, icon, color, subtitle = null, trend = null) => (
        <View style={[styles.metricCard, { width: (width - 60) / 2 }]}>
            <View style={styles.metricHeader}>
                <View style={[styles.metricIcon, { backgroundColor: color }]}>
                    <Ionicons name={icon} size={24} color="#fff" />
                </View>
                {trend && (
                    <View style={[styles.trendIndicator, { backgroundColor: trend > 0 ? '#4CAF50' : '#F44336' }]}>
                        <Ionicons 
                            name={trend > 0 ? 'trending-up' : 'trending-down'} 
                            size={16} 
                            color="#fff" 
                        />
                        <Text style={styles.trendText}>{Math.abs(trend).toFixed(1)}%</Text>
                    </View>
                )}
            </View>
            <Text style={styles.metricValue}>{value}</Text>
            <Text style={styles.metricTitle}>{title}</Text>
            {subtitle && <Text style={styles.metricSubtitle}>{subtitle}</Text>}
        </View>
    );

    const renderPeriodSelector = () => (
        <View style={styles.periodSelector}>
            <Text style={styles.sectionTitle}>Analytics Period</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View style={styles.periodOptions}>
                    {periodOptions.map((option) => (
                        <TouchableOpacity
                            key={option.key}
                            style={[
                                styles.periodOption,
                                selectedPeriod === option.key && styles.selectedPeriodOption
                            ]}
                            onPress={() => setSelectedPeriod(option.key)}
                        >
                            <Text style={[
                                styles.periodOptionText,
                                selectedPeriod === option.key && styles.selectedPeriodOptionText
                            ]}>
                                {option.label}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>
            </ScrollView>
        </View>
    );

    const renderBookingAnalytics = () => (
        <View style={styles.analyticsSection}>
            <Text style={styles.sectionTitle}>Booking Analytics</Text>
            <View style={styles.metricsRow}>
                {renderMetricCard(
                    'Total Bookings',
                    analyticsData.bookingStats.totalBookings?.toString() || '0',
                    'calendar-outline',
                    '#2196F3',
                    `${selectedPeriod} bookings`,
                    analyticsData.bookingStats.bookingGrowth
                )}
                {renderMetricCard(
                    'Occupancy Rate',
                    formatPercentage(analyticsData.bookingStats.occupancyRate),
                    'home-outline',
                    '#4CAF50',
                    'Average occupancy',
                    analyticsData.bookingStats.occupancyGrowth
                )}
            </View>
            <View style={styles.metricsRow}>
                {renderMetricCard(
                    'Avg Stay Duration',
                    `${analyticsData.bookingStats.averageStayDuration?.toFixed(1) || '0'} days`,
                    'time-outline',
                    '#FF9800',
                    'Average nights',
                    analyticsData.bookingStats.durationTrend
                )}
                {renderMetricCard(
                    'Cancellation Rate',
                    formatPercentage(analyticsData.bookingStats.cancellationRate),
                    'close-circle-outline',
                    '#F44336',
                    'Booking cancellations',
                    analyticsData.bookingStats.cancellationTrend
                )}
            </View>
        </View>
    );

    const renderRevenueAnalytics = () => (
        <View style={styles.analyticsSection}>
            <Text style={styles.sectionTitle}>Revenue Analytics</Text>
            <View style={styles.metricsRow}>
                {renderMetricCard(
                    'Total Revenue',
                    formatCurrency(analyticsData.revenueStats.totalRevenue),
                    'cash-outline',
                    '#9C27B0',
                    `${selectedPeriod} earnings`,
                    analyticsData.revenueStats.revenueGrowth
                )}
                {renderMetricCard(
                    'Avg Booking Value',
                    formatCurrency(analyticsData.revenueStats.averageBookingValue),
                    'card-outline',
                    '#00BCD4',
                    'Per booking',
                    analyticsData.revenueStats.bookingValueTrend
                )}
            </View>
            <View style={styles.metricsRow}>
                {renderMetricCard(
                    'Revenue per Room',
                    formatCurrency(analyticsData.revenueStats.revenuePerRoom),
                    'bed-outline',
                    '#607D8B',
                    'Per available room',
                    analyticsData.revenueStats.roomRevenueTrend
                )}
                {renderMetricCard(
                    'Revenue Growth',
                    formatPercentage(analyticsData.revenueStats.revenueGrowth),
                    'trending-up-outline',
                    '#8BC34A',
                    'vs previous period',
                    analyticsData.revenueStats.revenueGrowth
                )}
            </View>
        </View>
    );

    const renderPerformanceAnalytics = () => (
        <View style={styles.analyticsSection}>
            <Text style={styles.sectionTitle}>Performance Analytics</Text>
            <View style={styles.metricsRow}>
                {renderMetricCard(
                    'Average Rating',
                    analyticsData.performanceStats.averageRating?.toFixed(1) || '0.0',
                    'star-outline',
                    '#FFD700',
                    `From ${analyticsData.performanceStats.totalReviews || 0} reviews`,
                    analyticsData.performanceStats.ratingTrend
                )}
                {renderMetricCard(
                    'Response Rate',
                    formatPercentage(analyticsData.performanceStats.responseRate),
                    'chatbubble-outline',
                    '#3F51B5',
                    'Message responses',
                    analyticsData.performanceStats.responseRateTrend
                )}
            </View>
            <View style={styles.metricsRow}>
                {renderMetricCard(
                    'Acceptance Rate',
                    formatPercentage(analyticsData.performanceStats.acceptanceRate),
                    'checkmark-circle-outline',
                    '#4CAF50',
                    'Booking acceptance',
                    analyticsData.performanceStats.acceptanceRateTrend
                )}
                {renderMetricCard(
                    'Profile Views',
                    analyticsData.performanceStats.profileViews?.toString() || '0',
                    'eye-outline',
                    '#FF5722',
                    `${selectedPeriod} views`,
                    analyticsData.performanceStats.viewsTrend
                )}
            </View>
        </View>
    );

    const renderInsights = () => (
        <View style={styles.analyticsSection}>
            <Text style={styles.sectionTitle}>Key Insights</Text>
            <View style={styles.insightsContainer}>
                <View style={styles.insightCard}>
                    <Ionicons name="bulb-outline" size={24} color="#FF9800" />
                    <Text style={styles.insightText}>
                        Your occupancy rate is {formatPercentage(analyticsData.bookingStats.occupancyRate)}. 
                        Consider adjusting pricing for better performance.
                    </Text>
                </View>
                
                <View style={styles.insightCard}>
                    <Ionicons name="trending-up-outline" size={24} color="#4CAF50" />
                    <Text style={styles.insightText}>
                        Revenue has {analyticsData.revenueStats.revenueGrowth > 0 ? 'increased' : 'decreased'} by{' '}
                        {formatPercentage(Math.abs(analyticsData.revenueStats.revenueGrowth))} this {selectedPeriod}.
                    </Text>
                </View>
                
                <View style={styles.insightCard}>
                    <Ionicons name="star-outline" size={24} color="#FFD700" />
                    <Text style={styles.insightText}>
                        Your average rating is {analyticsData.performanceStats.averageRating?.toFixed(1) || '0.0'}/5.0. 
                        {analyticsData.performanceStats.averageRating >= 4.5 
                            ? ' Excellent performance!' 
                            : ' Focus on guest satisfaction to improve ratings.'
                        }
                    </Text>
                </View>
            </View>
        </View>
    );

    return (
        <SafeAreaView style={styles.container}>
            {/* Header */}
            <LinearGradient
                colors={['#6B73FF', '#9575CD']}
                style={styles.header}
            >
                <View style={styles.headerContent}>
                    <TouchableOpacity
                        onPress={() => navigation.goBack()}
                        style={styles.backButton}
                    >
                        <Ionicons name="arrow-back" size={24} color="#fff" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Analytics</Text>
                    <TouchableOpacity
                        style={styles.exportButton}
                        onPress={() => {
                            // TODO: Implement export functionality
                            Alert.alert('Export', 'Export functionality will be implemented');
                        }}
                    >
                        <Ionicons name="download-outline" size={24} color="#fff" />
                    </TouchableOpacity>
                </View>
            </LinearGradient>

            <ScrollView 
                style={styles.content}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
            >
                {/* Period Selector */}
                {renderPeriodSelector()}

                {/* Booking Analytics */}
                {renderBookingAnalytics()}

                {/* Revenue Analytics */}
                {renderRevenueAnalytics()}

                {/* Performance Analytics */}
                {renderPerformanceAnalytics()}

                {/* Insights */}
                {renderInsights()}
            </ScrollView>

            {/* Bottom Navigation */}
            <LandlordNavigation navigation={navigation} activeRoute="analytics" />
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    header: {
        paddingHorizontal: 20,
        paddingVertical: 15,
    },
    headerContent: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    backButton: {
        padding: 8,
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#fff',
        flex: 1,
        textAlign: 'center',
        marginHorizontal: 20,
    },
    exportButton: {
        padding: 8,
    },
    content: {
        flex: 1,
        padding: 20,
    },
    periodSelector: {
        marginBottom: 25,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 15,
    },
    periodOptions: {
        flexDirection: 'row',
    },
    periodOption: {
        backgroundColor: '#f0f0f0',
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 20,
        marginRight: 10,
        borderWidth: 1,
        borderColor: '#ddd',
    },
    selectedPeriodOption: {
        backgroundColor: '#6B73FF',
        borderColor: '#6B73FF',
    },
    periodOptionText: {
        fontSize: 14,
        color: '#333',
        fontWeight: '500',
    },
    selectedPeriodOptionText: {
        color: '#fff',
    },
    analyticsSection: {
        marginBottom: 25,
    },
    metricsRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 15,
    },
    metricCard: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 15,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
    },
    metricHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 10,
    },
    metricIcon: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },
    trendIndicator: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 10,
    },
    trendText: {
        color: '#fff',
        fontSize: 10,
        fontWeight: '600',
        marginLeft: 2,
    },
    metricValue: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 5,
    },
    metricTitle: {
        fontSize: 14,
        color: '#666',
        fontWeight: '600',
    },
    metricSubtitle: {
        fontSize: 12,
        color: '#999',
        marginTop: 2,
    },
    insightsContainer: {
        marginTop: 10,
    },
    insightCard: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 15,
        marginBottom: 12,
        flexDirection: 'row',
        alignItems: 'flex-start',
        elevation: 1,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 1,
    },
    insightText: {
        fontSize: 14,
        color: '#333',
        lineHeight: 20,
        marginLeft: 12,
        flex: 1,
    },
});

export default AnalyticsScreen;
