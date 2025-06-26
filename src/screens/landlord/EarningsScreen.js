import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    ScrollView,
    StyleSheet,
    TouchableOpacity,
    Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

const EarningsScreen = ({ navigation }) => {
    const [earnings, setEarnings] = useState({
        totalEarnings: 0,
        thisMonth: 0,
        pendingPayouts: 0,
        transactions: []
    });
    const [loading, setLoading] = useState(true);
    const [selectedPeriod, setSelectedPeriod] = useState('monthly');

    useEffect(() => {
        loadEarnings();
    }, [selectedPeriod]);

    const loadEarnings = async () => {
        try {
            // Mock data for now
            setEarnings({
                totalEarnings: 25800,
                thisMonth: 4200,
                pendingPayouts: 1200,
                transactions: [
                    {
                        id: '1',
                        amount: 1200,
                        date: '2025-06-20',
                        type: 'booking',
                        guest: 'John Smith',
                        property: 'Modern Studio Apartment',
                        status: 'paid'
                    },
                    {
                        id: '2',
                        amount: 600,
                        date: '2025-06-15',
                        type: 'booking',
                        guest: 'Sarah Johnson',
                        property: 'Shared Room in House',
                        status: 'pending'
                    }
                ]
            });
        } catch (error) {
            console.error('Error loading earnings:', error);
        } finally {
            setLoading(false);
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'paid': return '#2ecc71';
            case 'pending': return '#f39c12';
            case 'failed': return '#e74c3c';
            default: return '#7f8c8d';
        }
    };

    const renderTransaction = (transaction) => (
        <View key={transaction.id} style={styles.transactionCard}>
            <View style={styles.transactionHeader}>
                <View>
                    <Text style={styles.transactionAmount}>
                        ${transaction.amount}
                    </Text>
                    <Text style={styles.transactionDate}>
                        {transaction.date}
                    </Text>
                </View>
                <View style={[styles.statusBadge, { backgroundColor: getStatusColor(transaction.status) }]}>
                    <Text style={styles.statusText}>{transaction.status}</Text>
                </View>
            </View>
            <Text style={styles.transactionGuest}>{transaction.guest}</Text>
            <Text style={styles.transactionProperty}>{transaction.property}</Text>
        </View>
    );

    const periods = [
        { key: 'weekly', label: 'Weekly' },
        { key: 'monthly', label: 'Monthly' },
        { key: 'yearly', label: 'Yearly' }
    ];

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Ionicons name="arrow-back" size={24} color="#2c3e50" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Earnings</Text>
                <TouchableOpacity>
                    <Ionicons name="download-outline" size={24} color="#3498db" />
                </TouchableOpacity>
            </View>

            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                {/* Period Selector */}
                <View style={styles.periodSelector}>
                    {periods.map((period) => (
                        <TouchableOpacity
                            key={period.key}
                            style={[
                                styles.periodButton,
                                selectedPeriod === period.key && styles.activePeriodButton
                            ]}
                            onPress={() => setSelectedPeriod(period.key)}
                        >
                            <Text style={[
                                styles.periodText,
                                selectedPeriod === period.key && styles.activePeriodText
                            ]}>
                                {period.label}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>

                {/* Earnings Summary */}
                <View style={styles.summaryContainer}>
                    <View style={styles.summaryCard}>
                        <Text style={styles.summaryLabel}>Total Earnings</Text>
                        <Text style={styles.summaryValue}>${earnings.totalEarnings.toLocaleString()}</Text>
                    </View>
                    
                    <View style={styles.summaryRow}>
                        <View style={[styles.summaryCard, styles.halfCard]}>
                            <Text style={styles.summaryLabel}>This Month</Text>
                            <Text style={styles.summaryValue}>${earnings.thisMonth.toLocaleString()}</Text>
                        </View>
                        <View style={[styles.summaryCard, styles.halfCard]}>
                            <Text style={styles.summaryLabel}>Pending</Text>
                            <Text style={[styles.summaryValue, { color: '#f39c12' }]}>
                                ${earnings.pendingPayouts.toLocaleString()}
                            </Text>
                        </View>
                    </View>
                </View>

                {/* Recent Transactions */}
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>Recent Transactions</Text>
                        <TouchableOpacity>
                            <Text style={styles.viewAllText}>View All</Text>
                        </TouchableOpacity>
                    </View>
                    
                    {earnings.transactions.map(renderTransaction)}
                </View>

                {/* Payout Options */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Payout Options</Text>
                    
                    <TouchableOpacity style={styles.payoutCard}>
                        <View style={styles.payoutInfo}>
                            <Ionicons name="card-outline" size={24} color="#3498db" />
                            <View style={styles.payoutDetails}>
                                <Text style={styles.payoutTitle}>Bank Transfer</Text>
                                <Text style={styles.payoutSubtitle}>•••• •••• •••• 1234</Text>
                            </View>
                        </View>
                        <Ionicons name="chevron-forward" size={20} color="#7f8c8d" />
                    </TouchableOpacity>
                    
                    <TouchableOpacity style={styles.payoutCard}>
                        <View style={styles.payoutInfo}>
                            <Ionicons name="logo-paypal" size={24} color="#3498db" />
                            <View style={styles.payoutDetails}>
                                <Text style={styles.payoutTitle}>PayPal</Text>
                                <Text style={styles.payoutSubtitle}>john@example.com</Text>
                            </View>
                        </View>
                        <Ionicons name="chevron-forward" size={20} color="#7f8c8d" />
                    </TouchableOpacity>
                </View>

                {/* Request Payout Button */}
                <TouchableOpacity style={styles.requestPayoutButton}>
                    <Text style={styles.requestPayoutText}>Request Payout</Text>
                </TouchableOpacity>
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f9f9f9',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingVertical: 15,
        backgroundColor: '#ffffff',
        borderBottomWidth: 1,
        borderBottomColor: '#ecf0f1',
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#2c3e50',
    },
    content: {
        flex: 1,
        padding: 20,
    },
    periodSelector: {
        flexDirection: 'row',
        backgroundColor: '#ffffff',
        borderRadius: 12,
        padding: 4,
        marginBottom: 20,
    },
    periodButton: {
        flex: 1,
        paddingVertical: 10,
        alignItems: 'center',
        borderRadius: 8,
    },
    activePeriodButton: {
        backgroundColor: '#3498db',
    },
    periodText: {
        fontSize: 14,
        fontWeight: '500',
        color: '#7f8c8d',
    },
    activePeriodText: {
        color: '#ffffff',
    },
    summaryContainer: {
        marginBottom: 30,
    },
    summaryCard: {
        backgroundColor: '#ffffff',
        borderRadius: 12,
        padding: 20,
        marginBottom: 15,
        alignItems: 'center',
    },
    summaryRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    halfCard: {
        width: '48%',
        marginBottom: 0,
    },
    summaryLabel: {
        fontSize: 14,
        color: '#7f8c8d',
        marginBottom: 8,
    },
    summaryValue: {
        fontSize: 24,
        fontWeight: '700',
        color: '#2c3e50',
    },
    section: {
        marginBottom: 30,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 15,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#2c3e50',
    },
    viewAllText: {
        fontSize: 14,
        color: '#3498db',
        fontWeight: '500',
    },
    transactionCard: {
        backgroundColor: '#ffffff',
        borderRadius: 12,
        padding: 20,
        marginBottom: 10,
    },
    transactionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 8,
    },
    transactionAmount: {
        fontSize: 18,
        fontWeight: '700',
        color: '#2c3e50',
    },
    transactionDate: {
        fontSize: 12,
        color: '#7f8c8d',
        marginTop: 2,
    },
    statusBadge: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
    },
    statusText: {
        fontSize: 12,
        fontWeight: '500',
        color: '#ffffff',
        textTransform: 'capitalize',
    },
    transactionGuest: {
        fontSize: 14,
        fontWeight: '500',
        color: '#2c3e50',
        marginBottom: 4,
    },
    transactionProperty: {
        fontSize: 12,
        color: '#7f8c8d',
    },
    payoutCard: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: '#ffffff',
        borderRadius: 12,
        padding: 20,
        marginBottom: 10,
    },
    payoutInfo: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    payoutDetails: {
        marginLeft: 15,
    },
    payoutTitle: {
        fontSize: 16,
        fontWeight: '500',
        color: '#2c3e50',
    },
    payoutSubtitle: {
        fontSize: 14,
        color: '#7f8c8d',
        marginTop: 2,
    },
    requestPayoutButton: {
        backgroundColor: '#2ecc71',
        borderRadius: 12,
        paddingVertical: 15,
        alignItems: 'center',
        marginTop: 10,
        marginBottom: 40,
    },
    requestPayoutText: {
        color: '#ffffff',
        fontSize: 16,
        fontWeight: '600',
    },
});

export default EarningsScreen;
