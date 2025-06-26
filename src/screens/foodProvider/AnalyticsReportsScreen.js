import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    RefreshControl,
    Alert,
    Modal,
    Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LineChart, BarChart, PieChart } from 'react-native-chart-kit';
import { COLORS, SIZES } from '../../utils/constants';
import { fetchFromBackend } from '../../utils/networkUtils';

const { width: screenWidth } = Dimensions.get('window');

const AnalyticsReportsScreen = ({ navigation }) => {
    const [analyticsData, setAnalyticsData] = useState({
        revenue: {
            daily: [],
            weekly: [],
            monthly: [],
            total: 0
        },
        orders: {
            completed: 0,
            pending: 0,
            cancelled: 0,
            total: 0
        },
        popularItems: [],
        customerStats: {
            newCustomers: 0,
            returningCustomers: 0,
            averageOrderValue: 0
        },
        ratings: {
            average: 0,
            breakdown: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
        }
    });
    const [loading, setLoading] = useState(false);
    const [refreshing, setRefreshing] = useState(false);
    const [selectedPeriod, setSelectedPeriod] = useState('weekly');
    const [selectedChart, setSelectedChart] = useState('revenue');
    const [reportModalVisible, setReportModalVisible] = useState(false);

    const periods = [
        { id: 'daily', label: 'Daily' },
        { id: 'weekly', label: 'Weekly' },
        { id: 'monthly', label: 'Monthly' },
    ];

    const chartTypes = [
        { id: 'revenue', label: 'Revenue', icon: 'cash-outline' },
        { id: 'orders', label: 'Orders', icon: 'receipt-outline' },
        { id: 'items', label: 'Popular Items', icon: 'restaurant-outline' },
        { id: 'ratings', label: 'Ratings', icon: 'star-outline' },
    ];

    useEffect(() => {
        loadAnalytics();
    }, [selectedPeriod]);

    const loadAnalytics = async () => {
        setLoading(true);
        try {
            const response = await fetchFromBackend(`/api/analytics/provider?period=${selectedPeriod}`);
            if (response?.success) {
                setAnalyticsData(response.data || analyticsData);
            }
        } catch (error) {
            console.error('Error loading analytics:', error);
            Alert.alert('Error', 'Failed to load analytics data');
        } finally {
            setLoading(false);
        }
    };

    const handleRefresh = async () => {
        setRefreshing(true);
        await loadAnalytics();
        setRefreshing(false);
    };

    const generateReport = async (type) => {
        try {
            const response = await fetchFromBackend(`/api/reports/generate`, {
                method: 'POST',
                body: JSON.stringify({
                    type: type,
                    period: selectedPeriod,
                    format: 'pdf'
                })
            });

            if (response?.success) {
                Alert.alert(
                    'Report Generated',
                    'Your report has been generated and will be sent to your email shortly.',
                    [{ text: 'OK' }]
                );
            }
        } catch (error) {
            console.error('Error generating report:', error);
            Alert.alert('Error', 'Failed to generate report');
        }
    };

    const formatCurrency = (amount) => {
        return `₨${amount?.toLocaleString() || 0}`;
    };

    const getRevenueChartData = () => {
        const revenueData = analyticsData.revenue[selectedPeriod] || [];
        
        if (revenueData.length === 0) {
            return {
                labels: ['No Data'],
                datasets: [{
                    data: [0],
                    color: (opacity = 1) => `rgba(81, 150, 244, ${opacity})`,
                    strokeWidth: 2
                }]
            };
        }

        return {
            labels: revenueData.map(item => {
                if (selectedPeriod === 'daily') {
                    return new Date(item.date).toLocaleDateString('en-US', { weekday: 'short' });
                } else if (selectedPeriod === 'weekly') {
                    return `Week ${item.week}`;
                } else {
                    return new Date(item.date).toLocaleDateString('en-US', { month: 'short' });
                }
            }),
            datasets: [{
                data: revenueData.map(item => item.revenue),
                color: (opacity = 1) => `rgba(81, 150, 244, ${opacity})`,
                strokeWidth: 2
            }]
        };
    };

    const getOrdersChartData = () => {
        const orders = analyticsData.orders;
        return [
            {
                name: 'Completed',
                count: orders.completed,
                color: COLORS.success,
                legendFontColor: COLORS.dark,
                legendFontSize: 12,
            },
            {
                name: 'Pending',
                count: orders.pending,
                color: COLORS.warning,
                legendFontColor: COLORS.dark,
                legendFontSize: 12,
            },
            {
                name: 'Cancelled',
                count: orders.cancelled,
                color: COLORS.error,
                legendFontColor: COLORS.dark,
                legendFontSize: 12,
            },
        ];
    };

    const getPopularItemsChartData = () => {
        const items = analyticsData.popularItems || [];
        
        if (items.length === 0) {
            return {
                labels: ['No Data'],
                datasets: [{
                    data: [0]
                }]
            };
        }

        return {
            labels: items.slice(0, 5).map(item => item.name.length > 10 ? 
                item.name.substring(0, 10) + '...' : item.name),
            datasets: [{
                data: items.slice(0, 5).map(item => item.orderCount)
            }]
        };
    };

    const getRatingsChartData = () => {
        const ratings = analyticsData.ratings.breakdown;
        return [
            { name: '5★', count: ratings[5], color: '#4CAF50', legendFontColor: COLORS.dark, legendFontSize: 12 },
            { name: '4★', count: ratings[4], color: '#8BC34A', legendFontColor: COLORS.dark, legendFontSize: 12 },
            { name: '3★', count: ratings[3], color: '#FFC107', legendFontColor: COLORS.dark, legendFontSize: 12 },
            { name: '2★', count: ratings[2], color: '#FF9800', legendFontColor: COLORS.dark, legendFontSize: 12 },
            { name: '1★', count: ratings[1], color: '#F44336', legendFontColor: COLORS.dark, legendFontSize: 12 },
        ];
    };

    const renderChart = () => {
        const chartConfig = {
            backgroundColor: COLORS.white,
            backgroundGradientFrom: COLORS.white,
            backgroundGradientTo: COLORS.white,
            decimalPlaces: 0,
            color: (opacity = 1) => `rgba(81, 150, 244, ${opacity})`,
            labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
            style: {
                borderRadius: 16
            },
            propsForDots: {
                r: "4",
                strokeWidth: "2",
                stroke: COLORS.primary
            }
        };

        switch (selectedChart) {
            case 'revenue':
                return (
                    <LineChart
                        data={getRevenueChartData()}
                        width={screenWidth - 40}
                        height={220}
                        chartConfig={chartConfig}
                        bezier
                        style={styles.chart}
                    />
                );
            
            case 'orders':
                return (
                    <PieChart
                        data={getOrdersChartData()}
                        width={screenWidth - 40}
                        height={220}
                        chartConfig={chartConfig}
                        accessor="count"
                        backgroundColor="transparent"
                        paddingLeft="15"
                        style={styles.chart}
                    />
                );
            
            case 'items':
                return (
                    <BarChart
                        data={getPopularItemsChartData()}
                        width={screenWidth - 40}
                        height={220}
                        chartConfig={chartConfig}
                        style={styles.chart}
                    />
                );
            
            case 'ratings':
                return (
                    <PieChart
                        data={getRatingsChartData()}
                        width={screenWidth - 40}
                        height={220}
                        chartConfig={chartConfig}
                        accessor="count"
                        backgroundColor="transparent"
                        paddingLeft="15"
                        style={styles.chart}
                    />
                );
            
            default:
                return null;
        }
    };

    const renderMetricCard = (title, value, subtitle, icon, color = COLORS.primary) => (
        <View style={[styles.metricCard, { borderLeftColor: color }]}>
            <View style={styles.metricIcon}>
                <Ionicons name={icon} size={24} color={color} />
            </View>
            <View style={styles.metricContent}>
                <Text style={styles.metricTitle}>{title}</Text>
                <Text style={[styles.metricValue, { color }]}>{value}</Text>
                {subtitle && <Text style={styles.metricSubtitle}>{subtitle}</Text>}
            </View>
        </View>
    );

    const renderReportModal = () => (
        <Modal
            visible={reportModalVisible}
            animationType="slide"
            transparent={true}
        >
            <View style={styles.modalOverlay}>
                <View style={styles.reportModal}>
                    <View style={styles.reportModalHeader}>
                        <Text style={styles.reportModalTitle}>Generate Report</Text>
                        <TouchableOpacity
                            onPress={() => setReportModalVisible(false)}
                            style={styles.modalCloseButton}
                        >
                            <Ionicons name="close" size={24} color={COLORS.dark} />
                        </TouchableOpacity>
                    </View>

                    <View style={styles.reportOptions}>
                        <TouchableOpacity
                            style={styles.reportOption}
                            onPress={() => {
                                generateReport('revenue');
                                setReportModalVisible(false);
                            }}
                        >
                            <Ionicons name="cash-outline" size={24} color={COLORS.primary} />
                            <Text style={styles.reportOptionText}>Revenue Report</Text>
                            <Ionicons name="chevron-forward" size={20} color={COLORS.gray} />
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.reportOption}
                            onPress={() => {
                                generateReport('orders');
                                setReportModalVisible(false);
                            }}
                        >
                            <Ionicons name="receipt-outline" size={24} color={COLORS.success} />
                            <Text style={styles.reportOptionText}>Orders Report</Text>
                            <Ionicons name="chevron-forward" size={20} color={COLORS.gray} />
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.reportOption}
                            onPress={() => {
                                generateReport('menu');
                                setReportModalVisible(false);
                            }}
                        >
                            <Ionicons name="restaurant-outline" size={24} color={COLORS.warning} />
                            <Text style={styles.reportOptionText}>Menu Performance</Text>
                            <Ionicons name="chevron-forward" size={20} color={COLORS.gray} />
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.reportOption}
                            onPress={() => {
                                generateReport('customer');
                                setReportModalVisible(false);
                            }}
                        >
                            <Ionicons name="people-outline" size={24} color={COLORS.info} />
                            <Text style={styles.reportOptionText}>Customer Analytics</Text>
                            <Ionicons name="chevron-forward" size={20} color={COLORS.gray} />
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.reportOption}
                            onPress={() => {
                                generateReport('comprehensive');
                                setReportModalVisible(false);
                            }}
                        >
                            <Ionicons name="document-text-outline" size={24} color={COLORS.dark} />
                            <Text style={styles.reportOptionText}>Comprehensive Report</Text>
                            <Ionicons name="chevron-forward" size={20} color={COLORS.gray} />
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity
                    onPress={() => navigation.goBack()}
                    style={styles.backButton}
                >
                    <Ionicons name="arrow-back" size={24} color={COLORS.white} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Analytics & Reports</Text>
                <TouchableOpacity
                    onPress={() => setReportModalVisible(true)}
                    style={styles.reportButton}
                >
                    <Ionicons name="document-text" size={24} color={COLORS.white} />
                </TouchableOpacity>
            </View>

            <ScrollView
                style={styles.content}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
                }
                showsVerticalScrollIndicator={false}
            >
                {/* Key Metrics */}
                <View style={styles.metricsSection}>
                    <Text style={styles.sectionTitle}>Key Metrics</Text>
                    <View style={styles.metricsGrid}>
                        {renderMetricCard(
                            'Total Revenue',
                            formatCurrency(analyticsData.revenue.total),
                            'This period',
                            'cash-outline',
                            COLORS.success
                        )}
                        {renderMetricCard(
                            'Total Orders',
                            analyticsData.orders.total.toString(),
                            `${analyticsData.orders.completed} completed`,
                            'receipt-outline',
                            COLORS.primary
                        )}
                        {renderMetricCard(
                            'Average Rating',
                            analyticsData.ratings.average.toFixed(1),
                            'Based on reviews',
                            'star-outline',
                            COLORS.warning
                        )}
                        {renderMetricCard(
                            'Avg Order Value',
                            formatCurrency(analyticsData.customerStats.averageOrderValue),
                            'Per customer',
                            'trending-up-outline',
                            COLORS.info
                        )}
                    </View>
                </View>

                {/* Period Selection */}
                <View style={styles.periodSection}>
                    <Text style={styles.sectionTitle}>Time Period</Text>
                    <ScrollView 
                        horizontal 
                        showsHorizontalScrollIndicator={false}
                        style={styles.periodSelector}
                    >
                        {periods.map((period) => (
                            <TouchableOpacity
                                key={period.id}
                                style={[
                                    styles.periodOption,
                                    selectedPeriod === period.id && styles.activePeriodOption
                                ]}
                                onPress={() => setSelectedPeriod(period.id)}
                            >
                                <Text style={[
                                    styles.periodOptionText,
                                    selectedPeriod === period.id && styles.activePeriodOptionText
                                ]}>
                                    {period.label}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                </View>

                {/* Chart Selection */}
                <View style={styles.chartSection}>
                    <Text style={styles.sectionTitle}>Charts</Text>
                    <ScrollView 
                        horizontal 
                        showsHorizontalScrollIndicator={false}
                        style={styles.chartSelector}
                    >
                        {chartTypes.map((chart) => (
                            <TouchableOpacity
                                key={chart.id}
                                style={[
                                    styles.chartOption,
                                    selectedChart === chart.id && styles.activeChartOption
                                ]}
                                onPress={() => setSelectedChart(chart.id)}
                            >
                                <Ionicons 
                                    name={chart.icon} 
                                    size={20} 
                                    color={selectedChart === chart.id ? COLORS.white : COLORS.gray} 
                                />
                                <Text style={[
                                    styles.chartOptionText,
                                    selectedChart === chart.id && styles.activeChartOptionText
                                ]}>
                                    {chart.label}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                </View>

                {/* Chart Display */}
                <View style={styles.chartContainer}>
                    {renderChart()}
                </View>

                {/* Popular Items */}
                <View style={styles.popularItemsSection}>
                    <Text style={styles.sectionTitle}>Popular Items</Text>
                    {analyticsData.popularItems.length > 0 ? (
                        analyticsData.popularItems.slice(0, 5).map((item, index) => (
                            <View key={item.id} style={styles.popularItem}>
                                <View style={styles.itemRank}>
                                    <Text style={styles.rankNumber}>{index + 1}</Text>
                                </View>
                                <View style={styles.itemInfo}>
                                    <Text style={styles.itemName}>{item.name}</Text>
                                    <Text style={styles.itemStats}>
                                        {item.orderCount} orders • {formatCurrency(item.totalRevenue)} revenue
                                    </Text>
                                </View>
                                <View style={styles.itemPercentage}>
                                    <Text style={styles.percentageText}>
                                        {((item.orderCount / analyticsData.orders.total) * 100).toFixed(1)}%
                                    </Text>
                                </View>
                            </View>
                        ))
                    ) : (
                        <View style={styles.emptyState}>
                            <Ionicons name="restaurant-outline" size={48} color={COLORS.gray} />
                            <Text style={styles.emptyText}>No popular items data available</Text>
                        </View>
                    )}
                </View>

                {/* Customer Insights */}
                <View style={styles.customerInsightsSection}>
                    <Text style={styles.sectionTitle}>Customer Insights</Text>
                    <View style={styles.insightsGrid}>
                        <View style={styles.insightCard}>
                            <Text style={styles.insightNumber}>{analyticsData.customerStats.newCustomers}</Text>
                            <Text style={styles.insightLabel}>New Customers</Text>
                        </View>
                        <View style={styles.insightCard}>
                            <Text style={styles.insightNumber}>{analyticsData.customerStats.returningCustomers}</Text>
                            <Text style={styles.insightLabel}>Returning Customers</Text>
                        </View>
                    </View>
                </View>
            </ScrollView>

            {renderReportModal()}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    header: {
        backgroundColor: COLORS.primary,
        paddingTop: 50,
        paddingBottom: 20,
        paddingHorizontal: 20,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    backButton: {
        padding: 8,
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: COLORS.white,
        flex: 1,
        textAlign: 'center',
    },
    reportButton: {
        padding: 8,
        backgroundColor: 'rgba(255,255,255,0.2)',
        borderRadius: 20,
    },
    content: {
        flex: 1,
        padding: 20,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: COLORS.dark,
        marginBottom: 15,
    },
    metricsSection: {
        marginBottom: 30,
    },
    metricsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
    },
    metricCard: {
        backgroundColor: COLORS.white,
        borderRadius: 12,
        padding: 15,
        marginBottom: 15,
        width: '48%',
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        borderLeftWidth: 4,
        flexDirection: 'row',
        alignItems: 'center',
    },
    metricIcon: {
        marginRight: 12,
    },
    metricContent: {
        flex: 1,
    },
    metricTitle: {
        fontSize: 12,
        color: COLORS.gray,
        marginBottom: 4,
    },
    metricValue: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 2,
    },
    metricSubtitle: {
        fontSize: 10,
        color: COLORS.gray,
    },
    periodSection: {
        marginBottom: 20,
    },
    periodSelector: {
        flexDirection: 'row',
    },
    periodOption: {
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 25,
        backgroundColor: COLORS.lightGray,
        marginRight: 10,
    },
    activePeriodOption: {
        backgroundColor: COLORS.primary,
    },
    periodOptionText: {
        fontSize: 14,
        color: COLORS.gray,
        fontWeight: '500',
    },
    activePeriodOptionText: {
        color: COLORS.white,
        fontWeight: 'bold',
    },
    chartSection: {
        marginBottom: 20,
    },
    chartSelector: {
        flexDirection: 'row',
    },
    chartOption: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 15,
        paddingVertical: 10,
        borderRadius: 20,
        backgroundColor: COLORS.lightGray,
        marginRight: 10,
    },
    activeChartOption: {
        backgroundColor: COLORS.primary,
    },
    chartOptionText: {
        fontSize: 12,
        color: COLORS.gray,
        marginLeft: 5,
        fontWeight: '500',
    },
    activeChartOptionText: {
        color: COLORS.white,
        fontWeight: 'bold',
    },
    chartContainer: {
        backgroundColor: COLORS.white,
        borderRadius: 12,
        padding: 15,
        marginBottom: 30,
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        alignItems: 'center',
    },
    chart: {
        marginVertical: 8,
        borderRadius: 16,
    },
    popularItemsSection: {
        marginBottom: 30,
    },
    popularItem: {
        backgroundColor: COLORS.white,
        borderRadius: 12,
        padding: 15,
        marginBottom: 10,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        flexDirection: 'row',
        alignItems: 'center',
    },
    itemRank: {
        width: 30,
        height: 30,
        borderRadius: 15,
        backgroundColor: COLORS.primary,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 15,
    },
    rankNumber: {
        color: COLORS.white,
        fontSize: 14,
        fontWeight: 'bold',
    },
    itemInfo: {
        flex: 1,
    },
    itemName: {
        fontSize: 16,
        fontWeight: 'bold',
        color: COLORS.dark,
        marginBottom: 2,
    },
    itemStats: {
        fontSize: 12,
        color: COLORS.gray,
    },
    itemPercentage: {
        alignItems: 'flex-end',
    },
    percentageText: {
        fontSize: 14,
        fontWeight: 'bold',
        color: COLORS.primary,
    },
    customerInsightsSection: {
        marginBottom: 30,
    },
    insightsGrid: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    insightCard: {
        backgroundColor: COLORS.white,
        borderRadius: 12,
        padding: 20,
        width: '48%',
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        alignItems: 'center',
    },
    insightNumber: {
        fontSize: 28,
        fontWeight: 'bold',
        color: COLORS.primary,
        marginBottom: 5,
    },
    insightLabel: {
        fontSize: 14,
        color: COLORS.gray,
        textAlign: 'center',
    },
    emptyState: {
        alignItems: 'center',
        paddingVertical: 30,
    },
    emptyText: {
        fontSize: 14,
        color: COLORS.gray,
        marginTop: 10,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    reportModal: {
        backgroundColor: COLORS.white,
        borderRadius: 12,
        padding: 20,
        margin: 20,
        width: '90%',
        maxHeight: '70%',
    },
    reportModalHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 20,
    },
    reportModalTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: COLORS.dark,
        flex: 1,
    },
    modalCloseButton: {
        padding: 4,
    },
    reportOptions: {
        marginTop: 10,
    },
    reportOption: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 15,
        paddingHorizontal: 10,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.lightGray,
    },
    reportOptionText: {
        fontSize: 16,
        color: COLORS.dark,
        flex: 1,
        marginLeft: 15,
    },
});

export default AnalyticsReportsScreen;
