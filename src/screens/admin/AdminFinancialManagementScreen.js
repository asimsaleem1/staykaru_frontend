import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Alert,
    ActivityIndicator,
    Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SIZES } from '../../utils/constants';
import adminApiService from '../../services/adminApiService';
import MetricCard from '../../components/admin/MetricCard';
import SimpleChart from '../../components/admin/SimpleChart';
import DataTable from '../../components/admin/DataTable';

const { width } = Dimensions.get('window');

const AdminFinancialManagementScreen = ({ navigation }) => {
    const [loading, setLoading] = useState(true);
    const [selectedTab, setSelectedTab] = useState('overview');
    const [timeRange, setTimeRange] = useState('30d');
    
    // Financial data
    const [financialMetrics, setFinancialMetrics] = useState({});
    const [revenueData, setRevenueData] = useState([]);
    const [transactions, setTransactions] = useState([]);
    const [payouts, setPayouts] = useState([]);
    const [commissionData, setCommissionData] = useState([]);

    useEffect(() => {
        loadFinancialData();
    }, [timeRange]);

    const loadFinancialData = async () => {
        try {
            setLoading(true);
            
            const [metricsRes, revenueRes, transactionsRes, payoutsRes, commissionRes] = await Promise.all([
                adminApiService.getFinancialMetrics({ timeRange }),
                adminApiService.getRevenueData({ timeRange }),
                adminApiService.getTransactionHistory({ timeRange }),
                adminApiService.getPayoutHistory({ timeRange }),
                adminApiService.getCommissionData({ timeRange }),
            ]);

            if (metricsRes.success) setFinancialMetrics(metricsRes.data);
            if (revenueRes.success) setRevenueData(revenueRes.data.chartData || []);
            if (transactionsRes.success) setTransactions(transactionsRes.data.transactions || []);
            if (payoutsRes.success) setPayouts(payoutsRes.data.payouts || []);
            if (commissionRes.success) setCommissionData(commissionRes.data.chartData || []);

        } catch (error) {
            console.error('Error loading financial data:', error);
            Alert.alert('Error', 'Failed to load financial data');
        } finally {
            setLoading(false);
        }
    };

    const handleProcessPayout = async (payoutId) => {
        try {
            await adminApiService.processPayout(payoutId);
            Alert.alert('Success', 'Payout processed successfully');
            loadFinancialData();
        } catch (error) {
            Alert.alert('Error', 'Failed to process payout');
        }
    };

    const handleExportData = async (type) => {
        try {
            const response = await adminApiService.exportFinancialData({ 
                type, 
                timeRange,
                format: 'csv'
            });
            
            if (response.success) {
                Alert.alert('Success', 'Export completed successfully');
            }
        } catch (error) {
            Alert.alert('Error', 'Failed to export data');
        }
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
        }).format(amount || 0);
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString();
    };

    const getTransactionStatusColor = (status) => {
        const colors = {
            completed: '#10B981',
            pending: '#F59E0B',
            failed: '#EF4444',
            refunded: '#8B5CF6',
        };
        return colors[status] || '#6B7280';
    };

    const getPayoutStatusColor = (status) => {
        const colors = {
            pending: '#F59E0B',
            processing: '#3B82F6',
            completed: '#10B981',
            failed: '#EF4444',
        };
        return colors[status] || '#6B7280';
    };

    const renderOverviewTab = () => (
        <ScrollView style={styles.tabContent} showsVerticalScrollIndicator={false}>
            {/* Time Range Selector */}
            <View style={styles.timeRangeContainer}>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    {[
                        { key: '7d', label: '7 Days' },
                        { key: '30d', label: '30 Days' },
                        { key: '90d', label: '90 Days' },
                        { key: '1y', label: '1 Year' },
                    ].map((range) => (
                        <TouchableOpacity
                            key={range.key}
                            style={[
                                styles.timeRangeButton,
                                timeRange === range.key && styles.timeRangeButtonActive
                            ]}
                            onPress={() => setTimeRange(range.key)}
                        >
                            <Text style={[
                                styles.timeRangeText,
                                timeRange === range.key && styles.timeRangeTextActive
                            ]}>
                                {range.label}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            </View>

            {/* Financial Metrics */}
            <View style={styles.metricsGrid}>
                <MetricCard
                    title="Total Revenue"
                    value={formatCurrency(financialMetrics.totalRevenue)}
                    change={financialMetrics.revenueChange}
                    icon="trending-up"
                    color="#10B981"
                />
                <MetricCard
                    title="Total Payouts"
                    value={formatCurrency(financialMetrics.totalPayouts)}
                    change={financialMetrics.payoutChange}
                    icon="arrow-up-circle"
                    color="#3B82F6"
                />
                <MetricCard
                    title="Commission Earned"
                    value={formatCurrency(financialMetrics.totalCommission)}
                    change={financialMetrics.commissionChange}
                    icon="cash"
                    color="#F59E0B"
                />
                <MetricCard
                    title="Pending Payouts"
                    value={formatCurrency(financialMetrics.pendingPayouts)}
                    change={financialMetrics.pendingChange}
                    icon="time"
                    color="#8B5CF6"
                />
            </View>

            {/* Revenue Chart */}
            <View style={styles.chartContainer}>
                <View style={styles.chartHeader}>
                    <Text style={styles.chartTitle}>Revenue Over Time</Text>
                    <TouchableOpacity onPress={() => handleExportData('revenue')}>
                        <Ionicons name="download" size={20} color={COLORS.primary} />
                    </TouchableOpacity>
                </View>
                <SimpleChart
                    data={revenueData}
                    height={200}
                    color={COLORS.primary}
                    showGrid={true}
                />
            </View>

            {/* Commission Chart */}
            <View style={styles.chartContainer}>
                <View style={styles.chartHeader}>
                    <Text style={styles.chartTitle}>Commission Breakdown</Text>
                    <TouchableOpacity onPress={() => handleExportData('commission')}>
                        <Ionicons name="download" size={20} color={COLORS.primary} />
                    </TouchableOpacity>
                </View>
                <SimpleChart
                    data={commissionData}
                    height={200}
                    color="#F59E0B"
                    showGrid={true}
                />
            </View>

            {/* Quick Actions */}
            <View style={styles.quickActionsContainer}>
                <Text style={styles.sectionTitle}>Quick Actions</Text>
                <View style={styles.quickActions}>
                    <TouchableOpacity
                        style={styles.quickActionButton}
                        onPress={() => setSelectedTab('transactions')}
                    >
                        <Ionicons name="list" size={24} color={COLORS.primary} />
                        <Text style={styles.quickActionText}>View Transactions</Text>
                    </TouchableOpacity>
                    
                    <TouchableOpacity
                        style={styles.quickActionButton}
                        onPress={() => setSelectedTab('payouts')}
                    >
                        <Ionicons name="wallet" size={24} color={COLORS.primary} />
                        <Text style={styles.quickActionText}>Manage Payouts</Text>
                    </TouchableOpacity>
                    
                    <TouchableOpacity
                        style={styles.quickActionButton}
                        onPress={() => handleExportData('all')}
                    >
                        <Ionicons name="document-text" size={24} color={COLORS.primary} />
                        <Text style={styles.quickActionText}>Export Report</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </ScrollView>
    );

    const renderTransactionsTab = () => {
        const transactionColumns = [
            {
                key: 'id',
                title: 'Transaction ID',
                flex: 1.5,
                render: (id) => <Text style={styles.transactionId}>#{id}</Text>
            },
            {
                key: 'user',
                title: 'User',
                flex: 2,
                render: (_, transaction) => (
                    <View>
                        <Text style={styles.userName}>{transaction.user?.name}</Text>
                        <Text style={styles.userEmail}>{transaction.user?.email}</Text>
                    </View>
                )
            },
            {
                key: 'type',
                title: 'Type',
                flex: 1,
                render: (type) => (
                    <Text style={styles.transactionType}>{type?.toUpperCase()}</Text>
                )
            },
            {
                key: 'amount',
                title: 'Amount',
                flex: 1,
                render: (amount) => (
                    <Text style={styles.amount}>{formatCurrency(amount)}</Text>
                )
            },
            {
                key: 'status',
                title: 'Status',
                flex: 1,
                render: (status) => (
                    <View style={[styles.statusBadge, { backgroundColor: getTransactionStatusColor(status) + '20' }]}>
                        <Text style={[styles.statusText, { color: getTransactionStatusColor(status) }]}>
                            {status?.toUpperCase()}
                        </Text>
                    </View>
                )
            },
            {
                key: 'createdAt',
                title: 'Date',
                flex: 1,
                render: (date) => <Text style={styles.dateText}>{formatDate(date)}</Text>
            }
        ];

        return (
            <View style={styles.tabContent}>
                <DataTable
                    data={transactions}
                    columns={transactionColumns}
                    loading={loading}
                    emptyMessage="No transactions found"
                />
            </View>
        );
    };

    const renderPayoutsTab = () => {
        const payoutColumns = [
            {
                key: 'id',
                title: 'Payout ID',
                flex: 1.5,
                render: (id) => <Text style={styles.transactionId}>#{id}</Text>
            },
            {
                key: 'recipient',
                title: 'Recipient',
                flex: 2,
                render: (_, payout) => (
                    <View>
                        <Text style={styles.userName}>{payout.recipient?.name}</Text>
                        <Text style={styles.userEmail}>{payout.recipient?.email}</Text>
                    </View>
                )
            },
            {
                key: 'amount',
                title: 'Amount',
                flex: 1,
                render: (amount) => (
                    <Text style={styles.amount}>{formatCurrency(amount)}</Text>
                )
            },
            {
                key: 'status',
                title: 'Status',
                flex: 1,
                render: (status) => (
                    <View style={[styles.statusBadge, { backgroundColor: getPayoutStatusColor(status) + '20' }]}>
                        <Text style={[styles.statusText, { color: getPayoutStatusColor(status) }]}>
                            {status?.toUpperCase()}
                        </Text>
                    </View>
                )
            },
            {
                key: 'requestedAt',
                title: 'Requested',
                flex: 1,
                render: (date) => <Text style={styles.dateText}>{formatDate(date)}</Text>
            },
            {
                key: 'action',
                title: 'Action',
                flex: 1,
                render: (_, payout) => (
                    payout.status === 'pending' ? (
                        <TouchableOpacity
                            style={styles.processButton}
                            onPress={() => handleProcessPayout(payout.id)}
                        >
                            <Text style={styles.processButtonText}>Process</Text>
                        </TouchableOpacity>
                    ) : null
                )
            }
        ];

        return (
            <View style={styles.tabContent}>
                <DataTable
                    data={payouts}
                    columns={payoutColumns}
                    loading={loading}
                    emptyMessage="No payouts found"
                />
            </View>
        );
    };

    const renderReportsTab = () => (
        <ScrollView style={styles.tabContent} showsVerticalScrollIndicator={false}>
            <View style={styles.reportsContainer}>
                <Text style={styles.sectionTitle}>Financial Reports</Text>
                
                <View style={styles.reportsList}>
                    <TouchableOpacity
                        style={styles.reportItem}
                        onPress={() => handleExportData('revenue')}
                    >
                        <View style={styles.reportIcon}>
                            <Ionicons name="trending-up" size={24} color={COLORS.primary} />
                        </View>
                        <View style={styles.reportContent}>
                            <Text style={styles.reportTitle}>Revenue Report</Text>
                            <Text style={styles.reportDescription}>
                                Detailed revenue breakdown by period
                            </Text>
                        </View>
                        <Ionicons name="download" size={20} color={COLORS.gray[400]} />
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.reportItem}
                        onPress={() => handleExportData('transactions')}
                    >
                        <View style={styles.reportIcon}>
                            <Ionicons name="list" size={24} color={COLORS.primary} />
                        </View>
                        <View style={styles.reportContent}>
                            <Text style={styles.reportTitle}>Transaction Report</Text>
                            <Text style={styles.reportDescription}>
                                Complete transaction history
                            </Text>
                        </View>
                        <Ionicons name="download" size={20} color={COLORS.gray[400]} />
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.reportItem}
                        onPress={() => handleExportData('payouts')}
                    >
                        <View style={styles.reportIcon}>
                            <Ionicons name="wallet" size={24} color={COLORS.primary} />
                        </View>
                        <View style={styles.reportContent}>
                            <Text style={styles.reportTitle}>Payout Report</Text>
                            <Text style={styles.reportDescription}>
                                Payout history and status
                            </Text>
                        </View>
                        <Ionicons name="download" size={20} color={COLORS.gray[400]} />
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.reportItem}
                        onPress={() => handleExportData('commission')}
                    >
                        <View style={styles.reportIcon}>
                            <Ionicons name="cash" size={24} color={COLORS.primary} />
                        </View>
                        <View style={styles.reportContent}>
                            <Text style={styles.reportTitle}>Commission Report</Text>
                            <Text style={styles.reportDescription}>
                                Commission breakdown and analytics
                            </Text>
                        </View>
                        <Ionicons name="download" size={20} color={COLORS.gray[400]} />
                    </TouchableOpacity>
                </View>
            </View>
        </ScrollView>
    );

    const renderTabContent = () => {
        switch (selectedTab) {
            case 'overview':
                return renderOverviewTab();
            case 'transactions':
                return renderTransactionsTab();
            case 'payouts':
                return renderPayoutsTab();
            case 'reports':
                return renderReportsTab();
            default:
                return renderOverviewTab();
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
                    <Text style={styles.headerTitle}>Financial Management</Text>
                    <Text style={styles.headerSubtitle}>
                        {formatCurrency(financialMetrics.totalRevenue)} total revenue
                    </Text>
                </View>
            </View>

            {/* Tab Navigation */}
            <View style={styles.tabNavigation}>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    {[
                        { key: 'overview', label: 'Overview', icon: 'analytics' },
                        { key: 'transactions', label: 'Transactions', icon: 'list' },
                        { key: 'payouts', label: 'Payouts', icon: 'wallet' },
                        { key: 'reports', label: 'Reports', icon: 'document-text' },
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

            {/* Tab Content */}
            {loading ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={COLORS.primary} />
                    <Text style={styles.loadingText}>Loading financial data...</Text>
                </View>
            ) : (
                renderTabContent()
            )}
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
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        fontSize: SIZES.body1,
        color: COLORS.gray[600],
        marginTop: 16,
    },
    tabContent: {
        flex: 1,
        padding: 20,
    },
    timeRangeContainer: {
        marginBottom: 20,
    },
    timeRangeButton: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        backgroundColor: COLORS.gray[100],
        marginRight: 8,
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
    metricsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        marginBottom: 24,
    },
    chartContainer: {
        backgroundColor: COLORS.light,
        borderRadius: 16,
        padding: 16,
        marginBottom: 20,
        borderWidth: 1,
        borderColor: COLORS.gray[200],
    },
    chartHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    chartTitle: {
        fontSize: SIZES.h4,
        fontWeight: 'bold',
        color: COLORS.dark,
    },
    quickActionsContainer: {
        marginBottom: 20,
    },
    sectionTitle: {
        fontSize: SIZES.h4,
        fontWeight: 'bold',
        color: COLORS.dark,
        marginBottom: 16,
    },
    quickActions: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
    },
    quickActionButton: {
        flex: 1,
        minWidth: (width - 64) / 3,
        backgroundColor: COLORS.light,
        borderRadius: 12,
        padding: 16,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: COLORS.gray[200],
    },
    quickActionText: {
        fontSize: SIZES.body3,
        color: COLORS.gray[700],
        marginTop: 8,
        textAlign: 'center',
        fontWeight: '500',
    },
    transactionId: {
        fontSize: SIZES.body3,
        color: COLORS.primary,
        fontWeight: '600',
    },
    userName: {
        fontSize: SIZES.body2,
        fontWeight: '600',
        color: COLORS.dark,
    },
    userEmail: {
        fontSize: SIZES.body3,
        color: COLORS.gray[600],
        marginTop: 2,
    },
    transactionType: {
        fontSize: SIZES.body3,
        color: COLORS.gray[700],
        fontWeight: '500',
    },
    amount: {
        fontSize: SIZES.body2,
        fontWeight: '600',
        color: COLORS.dark,
    },
    statusBadge: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
        alignSelf: 'flex-start',
    },
    statusText: {
        fontSize: SIZES.body3,
        fontWeight: '600',
    },
    dateText: {
        fontSize: SIZES.body3,
        color: COLORS.gray[600],
    },
    processButton: {
        backgroundColor: COLORS.primary,
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 8,
    },
    processButtonText: {
        fontSize: SIZES.body3,
        color: COLORS.light,
        fontWeight: '600',
    },
    reportsContainer: {
        flex: 1,
    },
    reportsList: {
        gap: 16,
    },
    reportItem: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.light,
        borderRadius: 12,
        padding: 16,
        borderWidth: 1,
        borderColor: COLORS.gray[200],
    },
    reportIcon: {
        width: 48,
        height: 48,
        borderRadius: 12,
        backgroundColor: COLORS.primary + '20',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    reportContent: {
        flex: 1,
    },
    reportTitle: {
        fontSize: SIZES.body1,
        fontWeight: '600',
        color: COLORS.dark,
        marginBottom: 4,
    },
    reportDescription: {
        fontSize: SIZES.body2,
        color: COLORS.gray[600],
    },
});

export default AdminFinancialManagementScreen;
