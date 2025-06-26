import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const UnifiedMapScreen = ({ navigation, route }) => {
  const [currentLocation, setCurrentLocation] = useState(null);
  const [accommodations, setAccommodations] = useState([]);
  const [foodProviders, setFoodProviders] = useState([]);
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  const { initialType } = route.params || {};

  useEffect(() => {
    loadMapData();
    if (initialType) {
      setSelectedFilter(initialType);
    }
  }, []);

  const loadMapData = async () => {
    try {
      // Mock data for accommodations
      const mockAccommodations = [
        {
          id: 1,
          name: 'Sunway Student Residence',
          latitude: 3.1390,
          longitude: 101.6869,
          price: 'RM 800/month',
          rating: 4.5,
          type: 'residence',
        },
        {
          id: 2,
          name: 'Campus View Apartments',
          latitude: 3.1420,
          longitude: 101.6890,
          price: 'RM 950/month',
          rating: 4.2,
          type: 'apartment',
        },
        {
          id: 3,
          name: 'Student Hub KL',
          latitude: 3.1360,
          longitude: 101.6850,
          price: 'RM 750/month',
          rating: 4.3,
          type: 'residence',
        },
      ];

      // Mock data for food providers
      const mockFoodProviders = [
        {
          id: 1,
          name: 'Mama\'s Kitchen',
          latitude: 3.1400,
          longitude: 101.6880,
          cuisine: 'Local',
          rating: 4.6,
          deliveryTime: '20-30 min',
        },
        {
          id: 2,
          name: 'Pizza Corner',
          latitude: 3.1380,
          longitude: 101.6870,
          cuisine: 'Italian',
          rating: 4.3,
          deliveryTime: '25-35 min',
        },
        {
          id: 3,
          name: 'Noodle House',
          latitude: 3.1410,
          longitude: 101.6860,
          cuisine: 'Chinese',
          rating: 4.4,
          deliveryTime: '15-25 min',
        },
      ];

      setAccommodations(mockAccommodations);
      setFoodProviders(mockFoodProviders);
    } catch (error) {
      console.error('Error loading map data:', error);
    }
  };

  const getFilteredItems = () => {
    let items = [];
    
    if (selectedFilter === 'all' || selectedFilter === 'accommodations') {
      items = [...items, ...accommodations.map(acc => ({
        ...acc,
        itemType: 'accommodation',
      }))];
    }
    
    if (selectedFilter === 'all' || selectedFilter === 'food') {
      items = [...items, ...foodProviders.map(food => ({
        ...food,
        itemType: 'food',
      }))];
    }

    if (searchQuery) {
      items = items.filter(item =>
        item.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    return items;
  };

  const handleItemPress = (item) => {
    if (item.itemType === 'accommodation') {
      Alert.alert(
        item.name,
        `Price: ${item.price}\nRating: ${item.rating}/5`,
        [
          { text: 'Cancel', style: 'cancel' },
          { 
            text: 'View Details', 
            onPress: () => navigation.navigate('AccommodationDetail', { id: item.id })
          },
        ]
      );
    } else {
      Alert.alert(
        item.name,
        `Cuisine: ${item.cuisine}\nDelivery: ${item.deliveryTime}\nRating: ${item.rating}/5`,
        [
          { text: 'Cancel', style: 'cancel' },
          { 
            text: 'View Menu', 
            onPress: () => navigation.navigate('FoodProviderDetail', { id: item.id })
          },
        ]
      );
    }
  };

  const filterOptions = [
    { id: 'all', name: 'All', icon: 'map-outline' },
    { id: 'accommodations', name: 'Housing', icon: 'home-outline' },
    { id: 'food', name: 'Food', icon: 'restaurant-outline' },
  ];

  const renderListItem = (item) => (
    <TouchableOpacity
      key={`${item.itemType}-${item.id}`}
      style={styles.listItem}
      onPress={() => handleItemPress(item)}
    >
      <View style={[
        styles.itemIcon,
        { backgroundColor: item.itemType === 'accommodation' ? '#007BFF20' : '#28A74520' }
      ]}>
        <Ionicons
          name={item.itemType === 'accommodation' ? 'home' : 'restaurant'}
          size={24}
          color={item.itemType === 'accommodation' ? '#007BFF' : '#28A745'}
        />
      </View>
      
      <View style={styles.itemContent}>
        <Text style={styles.itemName}>{item.name}</Text>
        <Text style={styles.itemDetails}>
          {item.itemType === 'accommodation' 
            ? `${item.price} • ${item.rating}⭐`
            : `${item.cuisine} • ${item.deliveryTime} • ${item.rating}⭐`
          }
        </Text>
      </View>

      <Ionicons name="chevron-forward" size={20} color="#666" />
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color="#6C757D" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search locations..."
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
        <TouchableOpacity
          style={styles.filterButton}
          onPress={() => setShowFilters(!showFilters)}
        >
          <Ionicons name="filter" size={24} color="#007BFF" />
        </TouchableOpacity>
      </View>

      {showFilters && (
        <View style={styles.filtersContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {filterOptions.map((option) => (
              <TouchableOpacity
                key={option.id}
                style={[
                  styles.filterChip,
                  selectedFilter === option.id && styles.activeFilterChip,
                ]}
                onPress={() => setSelectedFilter(option.id)}
              >
                <Ionicons
                  name={option.icon}
                  size={16}
                  color={selectedFilter === option.id ? '#FFF' : '#007BFF'}
                />
                <Text style={[
                  styles.filterText,
                  selectedFilter === option.id && styles.activeFilterText,
                ]}>
                  {option.name}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}

      <View style={styles.mapPlaceholder}>
        <Ionicons name="map" size={64} color="#CED4DA" />
        <Text style={styles.mapPlaceholderText}>
          Map functionality requires additional setup
        </Text>
        <Text style={styles.mapPlaceholderSubtext}>
          Install react-native-maps for full map integration
        </Text>
      </View>

      <ScrollView style={styles.listContainer} showsVerticalScrollIndicator={false}>
        <Text style={styles.listTitle}>
          {selectedFilter === 'all' ? 'All Locations' : 
           selectedFilter === 'accommodations' ? 'Accommodations' : 'Food Providers'}
        </Text>
        
        {getFilteredItems().length > 0 ? (
          getFilteredItems().map(renderListItem)
        ) : (
          <View style={styles.emptyState}>
            <Ionicons name="location-outline" size={48} color="#CED4DA" />
            <Text style={styles.emptyTitle}>No locations found</Text>
            <Text style={styles.emptyText}>
              Try adjusting your search or filter criteria
            </Text>
          </View>
        )}
      </ScrollView>

      <View style={styles.bottomControls}>
        <TouchableOpacity
          style={styles.controlButton}
          onPress={() => Alert.alert('Navigate', 'External navigation would open here')}
        >
          <Ionicons name="navigate-outline" size={20} color="#007BFF" />
          <Text style={styles.controlText}>Navigate</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.controlButton}
          onPress={() => Alert.alert('Directions', 'Directions feature would open here')}
        >
          <Ionicons name="map-outline" size={20} color="#007BFF" />
          <Text style={styles.controlText}>Directions</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  header: {
    backgroundColor: '#FFF',
    paddingTop: 50,
    paddingHorizontal: 16,
    paddingBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#E9ECEF',
  },
  backButton: {
    marginRight: 12,
  },
  searchContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 16,
    color: '#333',
  },
  filterButton: {
    padding: 4,
  },
  filtersContainer: {
    backgroundColor: '#FFF',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E9ECEF',
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#F8F9FA',
    borderRadius: 20,
    marginRight: 12,
    borderWidth: 1,
    borderColor: '#007BFF',
  },
  activeFilterChip: {
    backgroundColor: '#007BFF',
  },
  filterText: {
    marginLeft: 6,
    fontSize: 14,
    fontWeight: '500',
    color: '#007BFF',
  },
  activeFilterText: {
    color: '#FFF',
  },
  mapPlaceholder: {
    backgroundColor: '#FFF',
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#E9ECEF',
  },
  mapPlaceholderText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#6C757D',
    marginTop: 12,
  },
  mapPlaceholderSubtext: {
    fontSize: 12,
    color: '#ADB5BD',
    marginTop: 4,
  },
  listContainer: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  listTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    padding: 16,
    paddingBottom: 8,
  },
  listItem: {
    backgroundColor: '#FFF',
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    marginHorizontal: 16,
    marginVertical: 4,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  itemIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  itemContent: {
    flex: 1,
  },
  itemName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  itemDetails: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
    paddingHorizontal: 32,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 12,
  },
  emptyText: {
    fontSize: 14,
    color: '#6C757D',
    marginTop: 8,
    textAlign: 'center',
  },
  bottomControls: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    gap: 12,
  },
  controlButton: {
    backgroundColor: '#FFF',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  controlText: {
    fontSize: 12,
    color: '#007BFF',
    marginTop: 4,
    fontWeight: '500',
  },
});

export default UnifiedMapScreen;