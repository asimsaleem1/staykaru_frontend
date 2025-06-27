import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, 
  Alert, ActivityIndicator, Dimensions, RefreshControl, Modal
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS } from '../../utils/constants';
import AdminApiService from '../../services/adminApiService';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width } = Dimensions.get('window');

const AccommodationManagementScreen = () => {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [accommodations, setAccommodations] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [stats, setStats] = useState({
    total: 0,
    approved: 0,
    pending: 0,
    rejected: 0
  });
  const [error, setError] = useState(null);

  useEffect(() => {
    loadAccommodations();
  }, []);

  const loadAccommodations = async () => {
    setLoading(true);
    setError(null);
    try {
      // Fetch accommodations from backend
      const api = new AdminApiService();
      const token = await AsyncStorage.getItem('token');
      api.setToken(token);
      const data = await api.getAccommodations();
      setAccommodations(data.data || data || []);
      // Fetch stats
      try {
        const statsData = await api.getAccommodationStatistics();
        setStats(statsData || { total: 0, approved: 0, pending: 0, rejected: 0 });
      } catch (statsErr) {
        setStats({ total: data.data?.length || data.length || 0, approved: 0, pending: 0, rejected: 0 });
      }
    } catch (error) {
      setError('Failed to load accommodations');
      setAccommodations([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadAccommodations();
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'approved': return '#34C759';
      case 'pending': return '#FF9500';
      case 'rejected': return '#FF3B30';
      default: return '#8E8E93';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'approved': return 'checkmark-circle';
      case 'pending': return 'time';
      case 'rejected': return 'close-circle';
      default: return 'help-circle';
    }
  };

  const StatCard = ({ title, value, icon, gradient }) => (
    <LinearGradient colors={gradient} style={styles.statCard}>
      <View style={styles.statContent}>
        <Ionicons name={icon} size={24} color="#fff" />
        <Text style={styles.statValue}>{value}</Text>
        <Text style={styles.statTitle}>{title}</Text>
      </View>
    </LinearGradient>
  );

  const FilterButton = ({ title, value, active }) => (
    <TouchableOpacity
      style={[styles.filterButton, active && styles.filterButtonActive]}
      onPress={() => setSelectedFilter(value)}
    >
      <Text style={[styles.filterButtonText, active && styles.filterButtonTextActive]}>
        {title}
      </Text>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>Loading Accommodations...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={[styles.loadingText, { color: 'red' }]}>{error}</Text>
          <TouchableOpacity onPress={loadAccommodations} style={{ marginTop: 16 }}>
            <Text style={{ color: COLORS.primary, fontWeight: 'bold' }}>Retry</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <LinearGradient colors={[COLORS.primary, COLORS.secondary]} style={styles.header}>
          <View style={styles.headerContent}>
            <View>
              <Text style={styles.headerTitle}>Accommodation Management</Text>
              <Text style={styles.headerSubtitle}>Manage and moderate property listings</Text>
            </View>
            <View style={styles.headerIcon}>
              <Ionicons name="home" size={32} color="#fff" />
            </View>
          </View>
        </LinearGradient>

        {/* Statistics */}
        <View style={styles.statsContainer}>
          <StatCard
            title="Total"
            value={stats.total}
            icon="home"
            gradient={['#4F8EF7', '#5B9BFF']}
          />
          <StatCard
            title="Approved"
            value={stats.approved}
            icon="checkmark-circle"
            gradient={['#34C759', '#40D867']}
          />
          <StatCard
            title="Pending"
            value={stats.pending}
            icon="time"
            gradient={['#FF9500', '#FFA726']}
          />
          <StatCard
            title="Rejected"
            value={stats.rejected}
            icon="close-circle"
            gradient={['#FF3B30', '#F44336']}
          />
        </View>

        {/* Search */}
        <View style={styles.searchContainer}>
          <View style={styles.searchBox}>
            <Ionicons name="search" size={20} color="#666" />
            <TextInput
              style={styles.searchInput}
              placeholder="Search accommodations..."
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>
        </View>

        {/* Filters */}
        <View style={styles.filtersContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <FilterButton title="All" value="all" active={selectedFilter === 'all'} />
            <FilterButton title="Approved" value="approved" active={selectedFilter === 'approved'} />
            <FilterButton title="Pending" value="pending" active={selectedFilter === 'pending'} />
            <FilterButton title="Rejected" value="rejected" active={selectedFilter === 'rejected'} />
          </ScrollView>
        </View>

        {/* Accommodations List */}
        <View style={styles.accommodationsContainer}>
          {accommodations.length === 0 ? (
            <View style={{ alignItems: 'center', marginTop: 40 }}>
              <Ionicons name="bed-outline" size={48} color="#ccc" />
              <Text style={{ color: '#888', fontSize: 18, marginTop: 12 }}>No accommodations found.</Text>
            </View>
          ) : (
            accommodations.map((accommodation) => (
              <View key={accommodation._id || accommodation.id} style={styles.accommodationCard}>
                <View style={styles.cardHeader}>
                  <View style={styles.cardTitleContainer}>
                    <Ionicons name="home" size={20} color={COLORS.primary} />
                    <Text style={styles.cardTitle}>{accommodation.title || accommodation.name || 'Untitled'}</Text>
                  </View>
                  <View style={[styles.statusBadge, { backgroundColor: getStatusColor(accommodation.status) + '20' }]}>
                    <Ionicons name={getStatusIcon(accommodation.status)} size={12} color={getStatusColor(accommodation.status)} />
                    <Text style={[styles.statusText, { color: getStatusColor(accommodation.status) }]}>
                      {(accommodation.status || 'unknown').charAt(0).toUpperCase() + (accommodation.status || 'unknown').slice(1)}
                    </Text>
                  </View>
                </View>

                <View style={styles.cardDetails}>
                  <View style={styles.detailRow}>
                    <Ionicons name="person" size={14} color="#666" />
                    <Text style={styles.detailText}>{accommodation.owner?.name || accommodation.landlord?.name || 'Unknown Owner'}</Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Ionicons name="location" size={14} color="#666" />
                    <Text style={styles.detailText}>{accommodation.location?.city || accommodation.city || accommodation.location || 'Unknown Location'}</Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Ionicons name="bed" size={14} color="#666" />
                    <Text style={styles.detailText}>{accommodation.bedrooms || accommodation.beds || 0} bed • {accommodation.bathrooms || 0} bath</Text>
                  </View>
                </View>

                <View style={styles.cardFooter}>
                  <View style={styles.priceContainer}>
                    <Text style={styles.price}>{accommodation.price ? `$${accommodation.price}` : 'N/A'}</Text>
                    <Text style={styles.pricePeriod}>/month</Text>
                  </View>
                  <View style={styles.ratingContainer}>
                    <Ionicons name="star" size={14} color="#FFD700" />
                    <Text style={styles.rating}>{accommodation.rating || '-'}</Text>
                    <Text style={styles.reviews}>({accommodation.reviews?.length || 0})</Text>
                  </View>
                </View>

                <View style={styles.cardActions}>
                  <TouchableOpacity style={[styles.actionButton, styles.viewButton]}>
                    <Ionicons name="eye" size={16} color="#007AFF" />
                    <Text style={styles.actionButtonText}>View</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={[styles.actionButton, styles.editButton]}>
                    <Ionicons name="create" size={16} color="#FF9500" />
                    <Text style={styles.actionButtonText}>Edit</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={[styles.actionButton, styles.approveButton]}
                    onPress={async () => {
                      try {
                        setLoading(true);
                        const api = new AdminApiService();
                        const token = await AsyncStorage.getItem('token');
                        api.setToken(token);
                        await api.approveAccommodation(accommodation._id || accommodation.id);
                        loadAccommodations();
                      } catch (e) {
                        Alert.alert('Error', 'Failed to approve accommodation');
                        setLoading(false);
                      }
                    }}>
                    <Ionicons name="checkmark-circle" size={16} color="#34C759" />
                    <Text style={styles.actionButtonText}>Approve</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={[styles.actionButton, styles.rejectButton]}
                    onPress={async () => {
                      try {
                        setLoading(true);
                        const api = new AdminApiService();
                        const token = await AsyncStorage.getItem('token');
                        api.setToken(token);
                        await api.rejectAccommodation(accommodation._id || accommodation.id, 'Rejected by admin');
                        loadAccommodations();
                      } catch (e) {
                        Alert.alert('Error', 'Failed to reject accommodation');
                        setLoading(false);
                      }
                    }}>
                    <Ionicons name="close-circle" size={16} color="#FF3B30" />
                    <Text style={styles.actionButtonText}>Reject</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={[styles.actionButton, styles.deleteButton]}
                    onPress={() => {
                      Alert.alert(
                        'Delete Accommodation',
                        'Are you sure you want to delete this accommodation? This action cannot be undone.',
                        [
                          { text: 'Cancel', style: 'cancel' },
                          {
                            text: 'Delete',
                            style: 'destructive',
                            onPress: async () => {
                              try {
                                setLoading(true);
                                const api = new AdminApiService();
                                const token = await AsyncStorage.getItem('token');
                                api.setToken(token);
                                await api.deleteAccommodation(accommodation._id || accommodation.id);
                                Alert.alert('Success', 'Accommodation deleted successfully');
                                loadAccommodations();
                              } catch (e) {
                                Alert.alert('Error', 'Failed to delete accommodation: ' + e.message);
                                setLoading(false);
                              }
                            }
                          }
                        ]
                      );
                    }}>
                    <Ionicons name="trash" size={16} color="#888" />
                    <Text style={styles.actionButtonText}>Delete</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FB',
  },
  scrollView: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    color: COLORS.primary,
    fontSize: 16,
  },
  header: {
    padding: 24,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#fff',
    opacity: 0.9,
  },
  headerIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  statsContainer: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
  },
  statCard: {
    flex: 1,
    borderRadius: 12,
    padding: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  statContent: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginTop: 8,
  },
  statTitle: {
    fontSize: 12,
    color: '#fff',
    opacity: 0.9,
    marginTop: 4,
  },
  searchContainer: {
    padding: 16,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  searchInput: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
    color: '#333',
  },
  filtersContainer: {
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#fff',
    marginRight: 8,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  filterButtonActive: {
    backgroundColor: COLORS.primary,
  },
  filterButtonText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  filterButtonTextActive: {
    color: '#fff',
  },
  accommodationsContainer: {
    padding: 16,
    gap: 16,
  },
  accommodationCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  cardTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginLeft: 8,
    flex: 1,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },
  cardDetails: {
    marginBottom: 12,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  detailText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 8,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  price: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  pricePeriod: {
    fontSize: 14,
    color: '#666',
    marginLeft: 4,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rating: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginLeft: 4,
  },
  reviews: {
    fontSize: 12,
    color: '#666',
    marginLeft: 4,
  },
  cardActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    flex: 1,
    justifyContent: 'center',
  },
  viewButton: {
    backgroundColor: '#E3F2FD',
  },
  editButton: {
    backgroundColor: '#FFF3E0',
  },
  approveButton: {
    backgroundColor: '#E3F2FD',
  },
  rejectButton: {
    backgroundColor: '#FFF3E0',
  },
  deleteButton: {
    backgroundColor: '#FFE3E3',
  },
  actionButtonText: {
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },
});

export default AccommodationManagementScreen; 