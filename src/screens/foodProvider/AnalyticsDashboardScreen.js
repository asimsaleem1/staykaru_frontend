import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, RefreshControl } from 'react-native';
import foodProviderApiService from '../../services/foodProviderApiService.js';

export default function AnalyticsDashboardScreen() {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  const fetchAnalytics = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await foodProviderApiService.getAnalytics('30d');
      setAnalytics(data.analytics || data);
    } catch (e) {
      setError(e.message);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchAnalytics();
    setRefreshing(false);
  };

  return (
    <ScrollView
      style={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      <Text style={styles.title}>Analytics Dashboard</Text>
      {loading && <Text style={styles.loading}>Loading...</Text>}
      {error && <Text style={styles.error}>{error}</Text>}
      {analytics && (
        <View>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Revenue</Text>
            <Text>Today: {analytics.todayRevenue || 0}</Text>
            <Text>This Month: {analytics.monthlyRevenue || 0}</Text>
            <Text>Average Order Value: {analytics.averageOrderValue || 0}</Text>
          </View>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Order Volume</Text>
            <Text>Today: {analytics.todayOrders || 0}</Text>
            <Text>This Month: {analytics.monthlyOrders || 0}</Text>
          </View>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Popular Menu Items</Text>
            {analytics.popularItems && analytics.popularItems.length > 0 ? (
              analytics.popularItems.map((item, idx) => (
                <Text key={idx}>{item.name}: {item.orders} orders, Revenue: {item.revenue}</Text>
              ))
            ) : (
              <Text>No data</Text>
            )}
          </View>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Customer Satisfaction</Text>
            <Text>Average Rating: {analytics.customerSatisfaction?.averageRating || 0}</Text>
            <Text>Total Reviews: {analytics.customerSatisfaction?.totalReviews || 0}</Text>
          </View>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Peak Hours</Text>
            {analytics.peakHours && analytics.peakHours.length > 0 ? (
              analytics.peakHours.map((h, idx) => (
                <Text key={idx}>{h.hour}: {h.orders} orders</Text>
              ))
            ) : (
              <Text>No data</Text>
            )}
          </View>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', padding: 16 },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 16 },
  loading: { fontSize: 16, color: '#888' },
  error: { color: 'red', marginBottom: 8 },
  section: { marginBottom: 24 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 8 },
}); 