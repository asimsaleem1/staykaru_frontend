import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    ScrollView,
    StyleSheet,
    TouchableOpacity,
    FlatList,
    Alert,
    RefreshControl,
    Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import LandlordNavigation from '../../components/landlord/LandlordNavigation';
import { fetchFromBackend } from '../../utils/networkUtils';

const FinancialManagementScreen = ({ navigation }) => {
    const [financialData, setFinancialData] = useState({
        overview: {
            totalRevenue: 0,
            thisMonthRevenue: 0,
            pendingPayouts: 0,
            availableBalance: 0,
        },
        transactions: [],
        payouts: [],
        reports: []
    });
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [selectedTab, setSelectedTab] = useState('overview');
    const [showTransactionModal, setShowTransactionModal] = useState(false);
    const [selectedTransaction, setSelectedTransaction] = useState(null);

    const tabs = [
        { key: 'overview', label: 'Overview', icon: 'pie-chart-outline' },
        { key: 'transactions', label: 'Transactions', icon: 'list-outline' },
        { key: 'payouts', label: 'Payouts', icon: 'card-outline' },
        { key: 'reports', label: 'Reports', icon: 'document-text-outline' }
    ];

    useEffect(() => {
        loadFinancialData();
    }, []);

    const loadFinancialData = async () => {
        try {
            setLoading(true);
            
            const [revenueRes, transactionsRes, payoutsRes] = await Promise.all([
                fetchFromBackend('/bookings/landlord/revenue'),
                fetchFromBackend('/landlord/transactions'),
                fetchFromBackend('/landlord/payouts')
            ]);

            if (revenueRes.success && transactionsRes.success && payoutsRes.success) {
                setFinancialData({
                    overview: revenueRes.data,
                    transactions: transactionsRes.data,
                    payouts: payoutsRes.data,
                    reports: [] // Will be loaded when reports tab is selected
                });
                console.log('✅ Financial data loaded successfully');
            } else {
                Alert.alert('Error', 'Failed to load financial data');
            }
        } catch (error) {
            console.error('❌ Error loading financial data:', error);
            Alert.alert('Error', 'Failed to load financial data');
        } finally {
            setLoading(false);
        }
    };

    const onRefresh = async () => {
        setRefreshing(true);
        await loadFinancialData();
        setRefreshing(false);
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-PK', {
            style: 'currency',
            currency: 'PKR',
            minimumFractionDigits: 0,
        }).format(amount);
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-PK', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    const getTransactionStatusColor = (status) => {
        switch (status?.toLowerCase()) {
            case 'completed': return '#4CAF50';
            case 'pending': return '#FF9800';
            case 'failed': return '#F44336';
            case 'refunded': return '#9C27B0';
            default: return '#757575';
        }
    };

    const renderOverviewCard = (title, amount, icon, color, subtitle = null) => (
        <View style={styles.overviewCard}>
            <View style={styles.cardHeader}>
                <View style={[styles.cardIcon, { backgroundColor: color }]}>
                    <Ionicons name={icon} size={24} color="#fff" />
                </View>
            </View>
            <Text style={styles.cardAmount}>{formatCurrency(amount)}</Text>
            <Text style={styles.cardTitle}>{title}</Text>
            {subtitle && <Text style={styles.cardSubtitle}>{subtitle}</Text>}
        </View>
    );

    const renderOverview = () => (
        <View style={styles.tabContent}>
            <View style={styles.overviewGrid}>
                {renderOverviewCard(
                    'Total Revenue',
                    financialData.overview.totalRevenue,
                    'cash-outline',
                    '#4CAF50',
                    'All time earnings'
                )}
                {renderOverviewCard(
                    'This Month',
                    financialData.overview.thisMonthRevenue,
                    'trending-up-outline',
                    '#2196F3',
                    'Current month'
                )}
                {renderOverviewCard(
                    'Pending Payouts',
                    financialData.overview.pendingPayouts,
                    'time-outline',
                    '#FF9800',
                    'Awaiting transfer'
                )}
                {renderOverviewCard(
                    'Available Balance',
                    financialData.overview.availableBalance,
                    'wallet-outline',
                    '#9C27B0',
                    'Ready for payout'
                )}
            </View>

            <View style={styles.quickActions}>
                <Text style={styles.sectionTitle}>Quick Actions</Text>
                <View style={styles.actionButtons}>
                    <TouchableOpacity
                        style={styles.actionButton}
                        onPress={() => navigation.navigate('PayoutSettings')}
                    >
                        <Ionicons name="card-outline" size={24} color="#6B73FF" />
                        <Text style={styles.actionButtonText}>Payout Settings</Text>
                    </TouchableOpacity>
                    
                    <TouchableOpacity
                        style={styles.actionButton}
                        onPress={() => setSelectedTab('reports')}
                    >
                        <Ionicons name="document-text-outline" size={24} color="#6B73FF" />
                        <Text style={styles.actionButtonText}>Generate Report</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );

    const renderTransactionItem = ({ item }) => (
        <TouchableOpacity 
            style={styles.transactionCard}
            onPress={() => {
                setSelectedTransaction(item);
                setShowTransactionModal(true);
            }}
        >
            <View style={styles.transactionHeader}>
                <View style={styles.transactionInfo}>
                    <Text style={styles.transactionTitle}>Booking #{item.bookingId}</Text>
                    <Text style={styles.transactionDate}>{formatDate(item.date)}</Text>
                </View>
                <View style={styles.transactionAmount}>
                    <Text style={[styles.amount, { color: item.type === 'credit' ? '#4CAF50' : '#F44336' }]}>
                        {item.type === 'credit' ? '+' : '-'}{formatCurrency(item.amount)}
                    </Text>
                    <View style={[styles.statusBadge, { backgroundColor: getTransactionStatusColor(item.status) }]}>
                        <Text style={styles.statusText}>{item.status}</Text>
                    </View>
                </View>
            </View>
            
            <View style={styles.transactionDetails}>
                <Text style={styles.propertyName}>{item.propertyName}</Text>
                <Text style={styles.guestName}>Guest: {item.guestName}</Text>
            </View>
        </TouchableOpacity>
    );

    const renderTransactions = () => (
        <View style={styles.tabContent}>
            <View style={styles.transactionFilters}>
                <TouchableOpacity style={styles.filterButton}>
                    <Ionicons name="filter-outline" size={20} color="#6B73FF" />
                    <Text style={styles.filterButtonText}>Filter</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.filterButton}>
                    <Ionicons name="download-outline" size={20} color="#6B73FF" />
                    <Text style={styles.filterButtonText}>Export</Text>
                </TouchableOpacity>
            </View>
            
            <FlatList
                data={financialData.transactions}
                renderItem={renderTransactionItem}
                keyExtractor={(item) => item.id.toString()}
                showsVerticalScrollIndicator={false}
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <Ionicons name="receipt-outline" size={64} color="#ccc" />
                        <Text style={styles.emptyText}>No transactions yet</Text>
                        <Text style={styles.emptySubText}>Transactions will appear here when you receive bookings</Text>
                    </View>
                }
            />
        </View>
    );

    const renderPayoutItem = ({ item }) => (
        <View style={styles.payoutCard}>
            <View style={styles.payoutHeader}>
                <View style={styles.payoutInfo}>
                    <Text style={styles.payoutAmount}>{formatCurrency(item.amount)}</Text>
                    <Text style={styles.payoutDate}>{formatDate(item.date)}</Text>
                </View>
                <View style={[styles.statusBadge, { backgroundColor: getTransactionStatusColor(item.status) }]}>
                    <Text style={styles.statusText}>{item.status}</Text>
                </View>
            </View>
            
            <View style={styles.payoutDetails}>
                <Text style={styles.payoutMethod}>
                    <Ionicons name="card-outline" size={16} color="#666" />
                    {' '}{item.payoutMethod}
                </Text>
                <Text style={styles.payoutReference}>Ref: {item.referenceId}</Text>
            </View>
        </View>
    );

    const renderPayouts = () => (
        <View style={styles.tabContent}>
            <View style={styles.payoutSummary}>
                <View style={styles.summaryCard}>
                    <Text style={styles.summaryTitle}>Next Payout</Text>
                    <Text style={styles.summaryAmount}>{formatCurrency(financialData.overview.availableBalance)}</Text>
                    <Text style={styles.summaryDate}>Expected: Next Friday</Text>
                </View>
            </View>
            
            <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Payout History</Text>
                <TouchableOpacity onPress={() => navigation.navigate('PayoutSettings')}>
                    <Text style={styles.settingsLink}>Settings</Text>
                </TouchableOpacity>
            </View>
            
            <FlatList
                data={financialData.payouts}
                renderItem={renderPayoutItem}
                keyExtractor={(item) => item.id.toString()}
                showsVerticalScrollIndicator={false}
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <Ionicons name="card-outline" size={64} color="#ccc" />
                        <Text style={styles.emptyText}>No payouts yet</Text>
                        <Text style={styles.emptySubText}>Set up your payout method to receive earnings</Text>
                        <TouchableOpacity 
                            style={styles.setupButton}
                            onPress={() => navigation.navigate('PayoutSettings')}
                        >
                            <Text style={styles.setupButtonText}>Setup Payout Method</Text>
                        </TouchableOpacity>
                    </View>
                }
            />
        </View>
    );

    const renderReports = () => (
        <View style={styles.tabContent}>
            <Text style={styles.sectionTitle}>Financial Reports</Text>
            
            <View style={styles.reportOptions}>
                <TouchableOpacity style={styles.reportCard}>
                    <Ionicons name="document-text-outline" size={32} color="#6B73FF" />
                    <Text style={styles.reportTitle}>Monthly Report</Text>
                    <Text style={styles.reportDescription}>Detailed monthly earnings breakdown</Text>
                    <TouchableOpacity style={styles.generateButton}>
                        <Text style={styles.generateButtonText}>Generate</Text>
                    </TouchableOpacity>
                </TouchableOpacity>
                
                <TouchableOpacity style={styles.reportCard}>
                    <Ionicons name="bar-chart-outline" size={32} color="#6B73FF" />
                    <Text style={styles.reportTitle}>Tax Report</Text>
                    <Text style={styles.reportDescription}>Tax filing ready report</Text>
                    <TouchableOpacity style={styles.generateButton}>
                        <Text style={styles.generateButtonText}>Generate</Text>
                    </TouchableOpacity>
                </TouchableOpacity>
                
                <TouchableOpacity style={styles.reportCard}>
                    <Ionicons name="analytics-outline" size={32} color="#6B73FF" />
                    <Text style={styles.reportTitle}>Annual Summary</Text>
                    <Text style={styles.reportDescription}>Complete yearly financial summary</Text>
                    <TouchableOpacity style={styles.generateButton}>
                        <Text style={styles.generateButtonText}>Generate</Text>
                    </TouchableOpacity>
                </TouchableOpacity>
            </View>
        </View>
    );

    const renderTransactionModal = () => (
        <Modal
            visible={showTransactionModal}
            animationType="slide"
            presentationStyle="pageSheet"
        >
            <SafeAreaView style={styles.modalContainer}>
                <View style={styles.modalHeader}>
                    <TouchableOpacity
                        onPress={() => setShowTransactionModal(false)}
                        style={styles.modalCloseButton}
                    >
                        <Ionicons name="close" size={24} color="#666" />
                    </TouchableOpacity>
                    <Text style={styles.modalTitle}>Transaction Details</Text>
                    <View style={{ width: 40 }} />
                </View>
                
                {selectedTransaction && (
                    <ScrollView style={styles.modalContent}>
                        <View style={styles.detailSection}>
                            <Text style={styles.detailTitle}>Transaction Information</Text>
                            <View style={styles.detailRow}>
                                <Text style={styles.detailLabel}>Transaction ID:</Text>
                                <Text style={styles.detailValue}>#{selectedTransaction.id}</Text>
                            </View>
                            <View style={styles.detailRow}>
                                <Text style={styles.detailLabel}>Amount:</Text>
                                <Text style={[styles.detailValue, { color: selectedTransaction.type === 'credit' ? '#4CAF50' : '#F44336' }]}>
                                    {selectedTransaction.type === 'credit' ? '+' : '-'}{formatCurrency(selectedTransaction.amount)}
                                </Text>
                            </View>
                            <View style={styles.detailRow}>
                                <Text style={styles.detailLabel}>Status:</Text>
                                <View style={[styles.statusBadge, { backgroundColor: getTransactionStatusColor(selectedTransaction.status) }]}>
                                    <Text style={styles.statusText}>{selectedTransaction.status}</Text>
                                </View>
                            </View>
                            <View style={styles.detailRow}>
                                <Text style={styles.detailLabel}>Date:</Text>
                                <Text style={styles.detailValue}>{formatDate(selectedTransaction.date)}</Text>
                            </View>
                        </View>
                    </ScrollView>
                )}
            </SafeAreaView>
        </Modal>
    );

    const renderTabContent = () => {
        switch (selectedTab) {
            case 'overview':
                return renderOverview();
            case 'transactions':
                return renderTransactions();
            case 'payouts':
                return renderPayouts();
            case 'reports':
                return renderReports();
            default:
                return renderOverview();
        }
    };

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
                    <Text style={styles.headerTitle}>Financial Management</Text>
                    <View style={{ width: 40 }} />
                </View>
            </LinearGradient>

            {/* Tab Navigation */}
            <View style={styles.tabNavigation}>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    <View style={styles.tabContainer}>
                        {tabs.map((tab) => (
                            <TouchableOpacity
                                key={tab.key}
                                style={[
                                    styles.tab,
                                    selectedTab === tab.key && styles.activeTab
                                ]}
                                onPress={() => setSelectedTab(tab.key)}
                            >
                                <Ionicons 
                                    name={tab.icon} 
                                    size={20} 
                                    color={selectedTab === tab.key ? '#6B73FF' : '#666'} 
                                />
                                <Text style={[
                                    styles.tabText,
                                    selectedTab === tab.key && styles.activeTabText
                                ]}>
                                    {tab.label}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </ScrollView>
            </View>

            {/* Tab Content */}
            <ScrollView 
                style={styles.content}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
            >
                {renderTabContent()}
            </ScrollView>

            {/* Transaction Details Modal */}
            {renderTransactionModal()}

            {/* Bottom Navigation */}
            <LandlordNavigation navigation={navigation} activeRoute="finance" />
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
        fontSize: 20,
        fontWeight: 'bold',
        color: '#fff',
        flex: 1,
        textAlign: 'center',
        marginHorizontal: 20,
    },
    tabNavigation: {
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#e0e0e0',
    },
    tabContainer: {
        flexDirection: 'row',
        paddingHorizontal: 10,
    },
    tab: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 12,
        marginHorizontal: 4,
        borderBottomWidth: 2,
        borderBottomColor: 'transparent',
    },
    activeTab: {
        borderBottomColor: '#6B73FF',
    },
    tabText: {
        fontSize: 14,
        color: '#666',
        marginLeft: 6,
        fontWeight: '500',
    },
    activeTabText: {
        color: '#6B73FF',
        fontWeight: '600',
    },
    content: {
        flex: 1,
    },
    tabContent: {
        padding: 20,
    },
    overviewGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        marginBottom: 25,
    },
    overviewCard: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 15,
        width: '48%',
        marginBottom: 15,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
    },
    cardHeader: {
        marginBottom: 10,
    },
    cardIcon: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },
    cardAmount: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 5,
    },
    cardTitle: {
        fontSize: 14,
        color: '#666',
        fontWeight: '600',
    },
    cardSubtitle: {
        fontSize: 12,
        color: '#999',
        marginTop: 2,
    },
    quickActions: {
        marginBottom: 20,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 15,
    },
    actionButtons: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    actionButton: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 20,
        alignItems: 'center',
        width: '48%',
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
    },
    actionButtonText: {
        fontSize: 14,
        color: '#333',
        fontWeight: '600',
        marginTop: 8,
        textAlign: 'center',
    },
    transactionFilters: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 15,
    },
    filterButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: '#6B73FF',
    },
    filterButtonText: {
        fontSize: 14,
        color: '#6B73FF',
        marginLeft: 5,
        fontWeight: '500',
    },
    transactionCard: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 15,
        marginBottom: 12,
        elevation: 1,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 1,
    },
    transactionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 10,
    },
    transactionInfo: {
        flex: 1,
    },
    transactionTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
    },
    transactionDate: {
        fontSize: 14,
        color: '#666',
        marginTop: 2,
    },
    transactionAmount: {
        alignItems: 'flex-end',
    },
    amount: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 5,
    },
    statusBadge: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
    },
    statusText: {
        color: '#fff',
        fontSize: 12,
        fontWeight: '600',
        textTransform: 'capitalize',
    },
    transactionDetails: {
        borderTopWidth: 1,
        borderTopColor: '#f0f0f0',
        paddingTop: 10,
    },
    propertyName: {
        fontSize: 14,
        color: '#6B73FF',
        fontWeight: '600',
    },
    guestName: {
        fontSize: 14,
        color: '#666',
        marginTop: 2,
    },
    payoutSummary: {
        marginBottom: 20,
    },
    summaryCard: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 20,
        alignItems: 'center',
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
    },
    summaryTitle: {
        fontSize: 16,
        color: '#666',
        fontWeight: '600',
    },
    summaryAmount: {
        fontSize: 32,
        fontWeight: 'bold',
        color: '#4CAF50',
        marginVertical: 10,
    },
    summaryDate: {
        fontSize: 14,
        color: '#999',
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 15,
    },
    settingsLink: {
        fontSize: 14,
        color: '#6B73FF',
        fontWeight: '600',
    },
    payoutCard: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 15,
        marginBottom: 12,
        elevation: 1,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 1,
    },
    payoutHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 10,
    },
    payoutInfo: {
        flex: 1,
    },
    payoutAmount: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
    },
    payoutDate: {
        fontSize: 14,
        color: '#666',
        marginTop: 2,
    },
    payoutDetails: {
        borderTopWidth: 1,
        borderTopColor: '#f0f0f0',
        paddingTop: 10,
    },
    payoutMethod: {
        fontSize: 14,
        color: '#666',
        marginBottom: 5,
    },
    payoutReference: {
        fontSize: 12,
        color: '#999',
    },
    reportOptions: {
        marginTop: 15,
    },
    reportCard: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 20,
        marginBottom: 15,
        alignItems: 'center',
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
    },
    reportTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
        marginTop: 10,
    },
    reportDescription: {
        fontSize: 14,
        color: '#666',
        textAlign: 'center',
        marginTop: 5,
        marginBottom: 15,
    },
    generateButton: {
        backgroundColor: '#6B73FF',
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 8,
    },
    generateButtonText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: '600',
    },
    emptyContainer: {
        alignItems: 'center',
        paddingVertical: 60,
    },
    emptyText: {
        fontSize: 18,
        color: '#666',
        marginTop: 15,
        fontWeight: '600',
    },
    emptySubText: {
        fontSize: 14,
        color: '#999',
        marginTop: 5,
        textAlign: 'center',
        marginBottom: 20,
    },
    setupButton: {
        backgroundColor: '#6B73FF',
        paddingHorizontal: 30,
        paddingVertical: 12,
        borderRadius: 25,
    },
    setupButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
    // Modal Styles
    modalContainer: {
        flex: 1,
        backgroundColor: '#fff',
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#e0e0e0',
    },
    modalCloseButton: {
        padding: 5,
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
    },
    modalContent: {
        flex: 1,
        padding: 20,
    },
    detailSection: {
        marginBottom: 25,
    },
    detailTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 15,
    },
    detailRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 8,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    detailLabel: {
        fontSize: 14,
        color: '#666',
        fontWeight: '500',
    },
    detailValue: {
        fontSize: 14,
        color: '#333',
        fontWeight: '600',
    },
});

export default FinancialManagementScreen;
