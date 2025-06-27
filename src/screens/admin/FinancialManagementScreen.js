import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, RefreshControl, ScrollView
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../utils/constants';

const API_BASE = 'https://staykaru-backend-60ed08adb2a7.herokuapp.com/api/admin';

const FinancialManagementScreen = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [paymentStats, setPaymentStats] = useState(null);
  const [commissions, setCommissions] = useState(null);
  const [revenueAnalytics, setRevenueAnalytics] = useState(null);

  const fetchTransactions = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/transactions`);
      const data = await res.json();
      setTransactions(data?.transactions || []);
    } catch (e) {
      setError('Failed to load transactions.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const fetchPaymentStats = async () => {
    try {
      const res = await fetch(`${API_BASE}/payments/statistics`);
      const data = await res.json();
      setPaymentStats(data);
    } catch {}
  };

  const fetchCommissions = async () => {
    try {
      const res = await fetch(`${API_BASE}/commissions`);
      const data = await res.json();
      setCommissions(data);
    } catch {}
  };

  const fetchRevenueAnalytics = async () => {
    try {
      const res = await fetch(`${API_BASE}/analytics/revenue`);
      const data = await res.json();
      setRevenueAnalytics(data);
    } catch {}
  };

  useEffect(() => {
    fetchTransactions();
    fetchPaymentStats();
    fetchCommissions();
    fetchRevenueAnalytics();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchTransactions();
    fetchPaymentStats();
    fetchCommissions();
    fetchRevenueAnalytics();
  };

  const renderTransaction = ({ item }) => (
    <View style={styles.transactionRow}>
      <Ionicons name="card" size={24} color={COLORS.primary} />
      <View style={{ flex: 1, marginLeft: 12 }}>
        <Text style={styles.transactionId}>#{item.transactionId}</Text>
        <Text style={styles.transactionType}>{item.type}</Text>
        <Text style={styles.transactionDate}>{item.date}</Text>
      </View>
      <Text style={[styles.amount, { color: item.type === 'credit' ? '#34C759' : '#FF3B30' }]}>
        {item.type === 'credit' ? '+' : '-'}${item.amount}
      </Text>
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Loading Financial Data...</Text>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity onPress={fetchTransactions} style={styles.retryBtn}>
          <Text style={styles.retryText}>Retry</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.header}>
          <Text style={styles.title}>Financial Management</Text>
        </View>

        {/* Revenue Overview */}
        <View style={styles.revenueCard}>
          <Text style={styles.cardTitle}>Revenue Overview</Text>
          <View style={styles.revenueRow}>
            <View style={styles.revenueItem}>
              <Text style={styles.revenueLabel}>Total Revenue</Text>
              <Text style={styles.revenueValue}>${revenueAnalytics?.totalRevenue || 0}</Text>
            </View>
            <View style={styles.revenueItem}>
              <Text style={styles.revenueLabel}>This Month</Text>
              <Text style={styles.revenueValue}>${revenueAnalytics?.monthlyRevenue || 0}</Text>
            </View>
          </View>
        </View>

        {/* Payment Statistics */}
        <View style={styles.statsCard}>
          <Text style={styles.cardTitle}>Payment Statistics</Text>
          <Text>Total Payments: {paymentStats?.totalPayments || 0}</Text>
          <Text>Successful: {paymentStats?.successful || 0}</Text>
          <Text>Failed: {paymentStats?.failed || 0}</Text>
          <Text>Pending: {paymentStats?.pending || 0}</Text>
        </View>

        {/* Commission Tracking */}
        <View style={styles.commissionCard}>
          <Text style={styles.cardTitle}>Commission Tracking</Text>
          <Text>Total Commissions: ${commissions?.totalCommissions || 0}</Text>
          <Text>Paid: ${commissions?.paidCommissions || 0}</Text>
          <Text>Pending: ${commissions?.pendingCommissions || 0}</Text>
        </View>

        {/* Transaction History */}
        <View style={styles.transactionsCard}>
          <Text style={styles.cardTitle}>Recent Transactions</Text>
          <FlatList
            data={transactions.slice(0, 10)}
            keyExtractor={item => item._id}
            renderItem={renderTransaction}
            scrollEnabled={false}
            ListEmptyComponent={<Text style={styles.emptyText}>No transactions found.</Text>}
          />
        </View>

        {/* Financial Reports */}
        <View style={styles.reportsCard}>
          <Text style={styles.cardTitle}>Financial Reports</Text>
          <TouchableOpacity style={styles.reportBtn}>
            <Ionicons name="download" size={20} color="#fff" />
            <Text style={styles.reportText}>Download Monthly Report</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.reportBtn}>
            <Ionicons name="download" size={20} color="#fff" />
            <Text style={styles.reportText}>Download Commission Report</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F9FB' },
  scrollContent: { padding: 16 },
  header: { padding: 16, backgroundColor: COLORS.primary, borderRadius: 16, marginBottom: 16 },
  title: { fontSize: 24, fontWeight: 'bold', color: '#fff' },
  revenueCard: { backgroundColor: '#fff', borderRadius: 12, padding: 16, marginBottom: 12, elevation: 2 },
  cardTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 12 },
  revenueRow: { flexDirection: 'row', justifyContent: 'space-between' },
  revenueItem: { flex: 1 },
  revenueLabel: { color: '#888', fontSize: 14 },
  revenueValue: { fontSize: 20, fontWeight: 'bold', color: '#34C759' },
  statsCard: { backgroundColor: '#fff', borderRadius: 12, padding: 16, marginBottom: 12, elevation: 2 },
  commissionCard: { backgroundColor: '#fff', borderRadius: 12, padding: 16, marginBottom: 12, elevation: 2 },
  transactionsCard: { backgroundColor: '#fff', borderRadius: 12, padding: 16, marginBottom: 12, elevation: 2 },
  transactionRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  transactionId: { fontWeight: 'bold', fontSize: 14 },
  transactionType: { color: '#888', fontSize: 12 },
  transactionDate: { color: '#888', fontSize: 12 },
  amount: { fontWeight: 'bold', fontSize: 16 },
  reportsCard: { backgroundColor: '#fff', borderRadius: 12, padding: 16, marginBottom: 12, elevation: 2 },
  reportBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.primary, padding: 12, borderRadius: 8, marginBottom: 8, justifyContent: 'center' },
  reportText: { color: '#fff', fontWeight: 'bold', marginLeft: 8 },
  loadingText: { marginTop: 16, color: COLORS.primary, fontSize: 16 },
  errorText: { color: 'red', fontSize: 16, textAlign: 'center', marginTop: 32 },
  retryBtn: { marginTop: 16, alignSelf: 'center', backgroundColor: COLORS.primary, padding: 10, borderRadius: 8 },
  retryText: { color: '#fff', fontWeight: 'bold' },
  emptyText: { color: '#888', textAlign: 'center', marginTop: 12 },
});

export default FinancialManagementScreen; 