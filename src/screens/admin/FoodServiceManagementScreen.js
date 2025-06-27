import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  FlatList,
  Modal,
  Alert,
  ActivityIndicator,
  Animated,
  Dimensions,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS } from '../../utils/constants';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width } = Dimensions.get('window');

const FoodServiceManagementScreen = () => {
  const [foodProviders, setFoodProviders] = useState([]);
  const [filteredProviders, setFilteredProviders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedProvider, setSelectedProvider] = useState(null);
  const [showProviderModal, setShowProviderModal] = useState(false);
  const [activeTab, setActiveTab] = useState('providers'); // 'providers' or 'services'
  const [fadeAnim] = useState(new Animated.Value(0));

  const statuses = ['all', 'pending', 'approved', 'rejected', 'active', 'inactive'];

  useEffect(() => {
    fetchFoodProviders();
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: true,
    }).start();
  }, []);

  useEffect(() => {
    filterProviders();
  }, [foodProviders, searchQuery, selectedStatus]);

  const fetchFoodProviders = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      const response = await fetch('https://staykaru-backend-60ed08adb2a7.herokuapp.com/api/admin/food-providers', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        setFoodProviders(data.data || []);
      } else {
        console.error('Failed to fetch food providers');
      }
    } catch (error) {
      console.error('Error fetching food providers:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterProviders = () => {
    let filtered = foodProviders;

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(provider =>
        provider.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        provider.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        provider.cuisine?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Filter by status
    if (selectedStatus !== 'all') {
      filtered = filtered.filter(provider => provider.status === selectedStatus);
    }

    setFilteredProviders(filtered);
  };

  const handleProviderAction = async (providerId, action) => {
    try {
      const token = await AsyncStorage.getItem('token');
      const response = await fetch(`https://staykaru-backend-60ed08adb2a7.herokuapp.com/api/admin/food-providers/${providerId}/${action}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        Alert.alert('Success', `Food provider ${action} successfully`);
        fetchFoodProviders(); // Refresh the list
      } else {
        Alert.alert('Error', `Failed to ${action} food provider`);
      }
    } catch (error) {
      Alert.alert('Error', 'Network error occurred');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'approved': return '#34C759';
      case 'rejected': return '#FF3B30';
      case 'pending': return '#FF9500';
      case 'active': return '#007AFF';
      case 'inactive': return '#8E8E93';
      default: return '#8E8E93';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'approved': return 'checkmark-circle';
      case 'rejected': return 'close-circle';
      case 'pending': return 'time';
      case 'active': return 'play-circle';
      case 'inactive': return 'pause-circle';
      default: return 'help-circle';
    }
  };

  const renderProviderCard = ({ item, index }) => {
    return (
      <Animated.View 
        style={[
          styles.providerCard, 
          { 
            opacity: fadeAnim,
            transform: [{ 
              translateY: fadeAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [50, 0],
              })
            }]
          }
        ]}
      >
        <View style={styles.cardHeader}>
          <View style={styles.providerInfo}>
            <View style={styles.imageContainer}>
              {item.logo ? (
                <Image source={{ uri: item.logo }} style={styles.providerImage} />
              ) : (
                <View style={styles.placeholderImage}>
                  <Ionicons name="restaurant" size={32} color="#ccc" />
                </View>
              )}
            </View>
            <View style={styles.providerDetails}>
              <Text style={styles.providerName}>{item.name || 'Untitled Restaurant'}</Text>
              <Text style={styles.providerCuisine}>🍽️ {item.cuisine || 'Cuisine not specified'}</Text>
              <Text style={styles.providerRating}>⭐ {item.rating || 0}/5 ({item.reviewCount || 0} reviews)</Text>
              <View style={styles.providerMeta}>
                <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) + '20' }]}>
                  <Ionicons name={getStatusIcon(item.status)} size={16} color={getStatusColor(item.status)} />
                  <Text style={[styles.statusText, { color: getStatusColor(item.status) }]}>
                    {item.status || 'unknown'}
                  </Text>
                </View>
                <Text style={styles.ownerInfo}>👤 {item.owner?.name || 'Unknown Owner'}</Text>
              </View>
            </View>
          </View>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => {
              setSelectedProvider(item);
              setShowProviderModal(true);
            }}
          >
            <Ionicons name="ellipsis-vertical" size={20} color="#666" />
          </TouchableOpacity>
        </View>
        
        <View style={styles.cardFooter}>
          <View style={styles.providerDetails}>
            <Text style={styles.providerDetail}>📞 {item.phone || 'No phone'}</Text>
            <Text style={styles.providerDetail}>📍 {item.address || 'Address not specified'}</Text>
            <Text style={styles.providerDetail}>🕒 {item.deliveryTime || 'Unknown'} min delivery</Text>
          </View>
          <Text style={styles.createdDate}>📅 Joined: {new Date(item.createdAt || Date.now()).toLocaleDateString()}</Text>
        </View>
      </Animated.View>
    );
  };

  const renderFilterChip = ({ item }) => (
    <TouchableOpacity
      style={[
        styles.filterChip,
        selectedStatus === item && styles.filterChipActive,
      ]}
      onPress={() => setSelectedStatus(item)}
    >
      <Text style={[
        styles.filterChipText,
        selectedStatus === item && styles.filterChipTextActive,
      ]}>
        {item.charAt(0).toUpperCase() + item.slice(1)}
      </Text>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>Loading food providers...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
        {/* Header */}
        <LinearGradient colors={[COLORS.primary, COLORS.secondary]} style={styles.header}>
          <View style={styles.headerContent}>
            <View>
              <Text style={styles.headerTitle}>Food Service Management</Text>
              <Text style={styles.headerSubtitle}>{filteredProviders.length} providers found</Text>
            </View>
            <TouchableOpacity style={styles.refreshButton} onPress={fetchFoodProviders}>
              <Ionicons name="refresh" size={24} color="#fff" />
            </TouchableOpacity>
          </View>
        </LinearGradient>

        {/* Tab Navigation */}
        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'providers' && styles.activeTab]}
            onPress={() => setActiveTab('providers')}
          >
            <Ionicons 
              name={activeTab === 'providers' ? 'restaurant' : 'restaurant-outline'} 
              size={20} 
              color={activeTab === 'providers' ? COLORS.primary : '#666'} 
            />
            <Text style={[styles.tabText, activeTab === 'providers' && styles.activeTabText]}>
              Food Providers
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'services' && styles.activeTab]}
            onPress={() => setActiveTab('services')}
          >
            <Ionicons 
              name={activeTab === 'services' ? 'fast-food' : 'fast-food-outline'} 
              size={20} 
              color={activeTab === 'services' ? COLORS.primary : '#666'} 
            />
            <Text style={[styles.tabText, activeTab === 'services' && styles.activeTabText]}>
              Food Services
            </Text>
          </TouchableOpacity>
        </View>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <View style={styles.searchBar}>
            <Ionicons name="search" size={20} color="#666" />
            <TextInput
              style={styles.searchInput}
              placeholder={`Search ${activeTab === 'providers' ? 'providers' : 'services'} by name, cuisine, or description...`}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            {searchQuery ? (
              <TouchableOpacity onPress={() => setSearchQuery('')}>
                <Ionicons name="close-circle" size={20} color="#666" />
              </TouchableOpacity>
            ) : null}
          </View>
        </View>

        {/* Filters */}
        <View style={styles.filtersContainer}>
          <Text style={styles.filterTitle}>Filter by Status:</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll}>
            {statuses.map((status) => (
              <View key={status}>
                {renderFilterChip({ item: status })}
              </View>
            ))}
          </ScrollView>
        </View>

        {/* Providers List */}
        <FlatList
          data={filteredProviders}
          renderItem={renderProviderCard}
          keyExtractor={(item) => item.id || item._id}
          contentContainerStyle={styles.providersList}
          showsVerticalScrollIndicator={false}
        />
      </Animated.View>

      {/* Provider Details Modal */}
      <Modal
        visible={showProviderModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowProviderModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Provider Details</Text>
              <TouchableOpacity onPress={() => setShowProviderModal(false)}>
                <Ionicons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>
            
            {selectedProvider && (
              <ScrollView style={styles.modalBody}>
                {/* Provider Logo */}
                {selectedProvider.logo && (
                  <Image 
                    source={{ uri: selectedProvider.logo }} 
                    style={styles.modalImage}
                    resizeMode="cover"
                  />
                )}

                {/* Provider Details */}
                <View style={styles.providerDetailRow}>
                  <Text style={styles.detailLabel}>Name:</Text>
                  <Text style={styles.detailValue}>{selectedProvider.name}</Text>
                </View>
                <View style={styles.providerDetailRow}>
                  <Text style={styles.detailLabel}>Cuisine:</Text>
                  <Text style={styles.detailValue}>{selectedProvider.cuisine}</Text>
                </View>
                <View style={styles.providerDetailRow}>
                  <Text style={styles.detailLabel}>Rating:</Text>
                  <Text style={styles.detailValue}>{selectedProvider.rating}/5 ({selectedProvider.reviewCount} reviews)</Text>
                </View>
                <View style={styles.providerDetailRow}>
                  <Text style={styles.detailLabel}>Status:</Text>
                  <Text style={styles.detailValue}>{selectedProvider.status}</Text>
                </View>
                <View style={styles.providerDetailRow}>
                  <Text style={styles.detailLabel}>Owner:</Text>
                  <Text style={styles.detailValue}>{selectedProvider.owner?.name}</Text>
                </View>
                <View style={styles.providerDetailRow}>
                  <Text style={styles.detailLabel}>Phone:</Text>
                  <Text style={styles.detailValue}>{selectedProvider.phone}</Text>
                </View>
                <View style={styles.providerDetailRow}>
                  <Text style={styles.detailLabel}>Address:</Text>
                  <Text style={styles.detailValue}>{selectedProvider.address}</Text>
                </View>
                <View style={styles.providerDetailRow}>
                  <Text style={styles.detailLabel}>Delivery Time:</Text>
                  <Text style={styles.detailValue}>{selectedProvider.deliveryTime} minutes</Text>
                </View>
                
                {selectedProvider.description && (
                  <View style={styles.descriptionContainer}>
                    <Text style={styles.descriptionLabel}>Description:</Text>
                    <Text style={styles.descriptionText}>{selectedProvider.description}</Text>
                  </View>
                )}
                
                <View style={styles.modalActions}>
                  {selectedProvider.status === 'pending' && (
                    <>
                      <TouchableOpacity
                        style={[styles.actionBtn, styles.approveBtn]}
                        onPress={() => {
                          handleProviderAction(selectedProvider.id || selectedProvider._id, 'approve');
                          setShowProviderModal(false);
                        }}
                      >
                        <Ionicons name="checkmark-circle" size={20} color="#fff" />
                        <Text style={styles.actionBtnText}>Approve</Text>
                      </TouchableOpacity>
                      
                      <TouchableOpacity
                        style={[styles.actionBtn, styles.rejectBtn]}
                        onPress={() => {
                          handleProviderAction(selectedProvider.id || selectedProvider._id, 'reject');
                          setShowProviderModal(false);
                        }}
                      >
                        <Ionicons name="close-circle" size={20} color="#fff" />
                        <Text style={styles.actionBtnText}>Reject</Text>
                      </TouchableOpacity>
                    </>
                  )}
                  
                  <TouchableOpacity
                    style={[styles.actionBtn, styles.deleteBtn]}
                    onPress={() => {
                      Alert.alert(
                        'Delete Provider',
                        'Are you sure you want to delete this food provider?',
                        [
                          { text: 'Cancel', style: 'cancel' },
                          {
                            text: 'Delete',
                            style: 'destructive',
                            onPress: () => {
                              handleProviderAction(selectedProvider.id || selectedProvider._id, 'delete');
                              setShowProviderModal(false);
                            },
                          },
                        ]
                      );
                    }}
                  >
                    <Ionicons name="trash" size={20} color="#fff" />
                    <Text style={styles.actionBtnText}>Delete</Text>
                  </TouchableOpacity>
                </View>
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FB',
  },
  content: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: COLORS.primary,
  },
  header: {
    paddingTop: 20,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  headerSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 4,
  },
  refreshButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginHorizontal: 4,
    gap: 8,
  },
  activeTab: {
    backgroundColor: COLORS.primary + '20',
  },
  tabText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#666',
  },
  activeTabText: {
    color: COLORS.primary,
    fontWeight: '600',
  },
  searchContainer: {
    padding: 20,
    backgroundColor: '#fff',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  searchInput: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
    color: '#333',
  },
  filtersContainer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  filterTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  filterScroll: {
    marginBottom: 8,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f8f9fa',
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  filterChipActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  filterChipText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  filterChipTextActive: {
    color: '#fff',
  },
  providersList: {
    padding: 20,
  },
  providerCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  providerInfo: {
    flexDirection: 'row',
    flex: 1,
  },
  imageContainer: {
    marginRight: 12,
  },
  providerImage: {
    width: 80,
    height: 80,
    borderRadius: 12,
  },
  placeholderImage: {
    width: 80,
    height: 80,
    borderRadius: 12,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  providerDetails: {
    flex: 1,
  },
  providerName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  providerCuisine: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  providerRating: {
    fontSize: 14,
    color: '#FF9500',
    marginBottom: 8,
  },
  providerMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  ownerInfo: {
    fontSize: 12,
    color: '#666',
  },
  actionButton: {
    padding: 8,
  },
  cardFooter: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  providerDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  providerDetail: {
    fontSize: 14,
    color: '#666',
  },
  createdDate: {
    fontSize: 12,
    color: '#999',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 16,
    width: width * 0.9,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  modalBody: {
    padding: 20,
  },
  modalImage: {
    width: '100%',
    height: 200,
    borderRadius: 12,
    marginBottom: 16,
  },
  providerDetailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  detailLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  detailValue: {
    fontSize: 16,
    color: '#666',
  },
  descriptionContainer: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  descriptionLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  descriptionText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  modalActions: {
    marginTop: 20,
    gap: 12,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    gap: 8,
  },
  approveBtn: {
    backgroundColor: '#34C759',
  },
  rejectBtn: {
    backgroundColor: '#FF9500',
  },
  deleteBtn: {
    backgroundColor: '#FF3B30',
  },
  actionBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default FoodServiceManagementScreen; 