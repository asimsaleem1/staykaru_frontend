import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  RefreshControl,
  StatusBar,
  Dimensions,
  ActivityIndicator
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import foodProviderApiService from '../../services/foodProviderApiService.js';

const { width } = Dimensions.get('window');

export default function MenuManagementScreen() {
  const navigation = useNavigation();
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  const fetchMenuItems = useCallback(async () => {
    try {
      setError(null);
      const response = await foodProviderApiService.getMenu();
      
      // Handle different response structures
      let items = [];
      if (response.menu?.categories) {
        // If menu has categories structure
        response.menu.categories.forEach(category => {
          if (category.items) {
            items = [...items, ...category.items];
          }
        });
      } else if (response.menuItems) {
        // Direct menu items array
        items = response.menuItems;
      } else if (Array.isArray(response)) {
        // Response is directly an array
        items = response;
      }
      
      setMenuItems(items);
    } catch (error) {
      console.error('Failed to fetch menu items:', error);
      setError('Unable to load menu items. Please try again.');
      setMenuItems([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      fetchMenuItems();
    }, [fetchMenuItems])
  );

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchMenuItems();
    setRefreshing(false);
  }, [fetchMenuItems]);

  const handleDeleteItem = (itemId, itemName) => {
    Alert.alert(
      'Delete Menu Item',
      `Are you sure you want to delete "${itemName}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await foodProviderApiService.deleteMenuItem(itemId);
              Alert.alert('Success', 'Menu item deleted successfully');
              fetchMenuItems(); // Refresh the list
            } catch (error) {
              console.error('Failed to delete menu item:', error);
              Alert.alert('Error', 'Failed to delete menu item. Please try again.');
            }
          }
        }
      ]
    );
  };

  const handleToggleAvailability = async (itemId, currentStatus, itemName) => {
    try {
      const newStatus = currentStatus === 'available' ? 'unavailable' : 'available';
      await foodProviderApiService.updateMenuItem(itemId, { 
        availability: newStatus 
      });
      Alert.alert('Success', `"${itemName}" is now ${newStatus}`);
      fetchMenuItems(); // Refresh the list
    } catch (error) {
      console.error('Failed to update menu item:', error);
      Alert.alert('Error', 'Failed to update menu item. Please try again.');
    }
  };

  const renderMenuItem = ({ item, index }) => (
    <View style={styles.menuItemCard}>
      <View style={styles.menuItemHeader}>
        <View style={styles.menuItemInfo}>
          <Text style={styles.menuItemName}>{item.name}</Text>
          <Text style={styles.menuItemDescription} numberOfLines={2}>
            {item.description || 'No description available'}
          </Text>
          <View style={styles.menuItemMeta}>
            <Text style={styles.menuItemPrice}>${item.price || '0.00'}</Text>
            <View style={[
              styles.availabilityBadge,
              { backgroundColor: (item.availability === 'available' ? '#34C759' : '#FF3B30') + '20' }
            ]}>
              <Ionicons 
                name={item.availability === 'available' ? 'checkmark-circle' : 'close-circle'} 
                size={12} 
                color={item.availability === 'available' ? '#34C759' : '#FF3B30'} 
              />
              <Text style={[
                styles.availabilityText,
                { color: item.availability === 'available' ? '#34C759' : '#FF3B30' }
              ]}>
                {item.availability === 'available' ? 'Available' : 'Unavailable'}
              </Text>
            </View>
          </View>
        </View>
        
        <View style={styles.menuItemActions}>
          <TouchableOpacity 
            style={[styles.actionButton, styles.editButton]}
            onPress={() => navigation.navigate('EditMenuItem', { menuItem: item })}
          >
            <Ionicons name="create-outline" size={20} color="#007AFF" />
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.actionButton, styles.toggleButton]}
            onPress={() => handleToggleAvailability(item._id || item.id, item.availability, item.name)}
          >
            <Ionicons 
              name={item.availability === 'available' ? 'eye-off-outline' : 'eye-outline'} 
              size={20} 
              color="#FF9500" 
            />
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.actionButton, styles.deleteButton]}
            onPress={() => handleDeleteItem(item._id || item.id, item.name)}
          >
            <Ionicons name="trash-outline" size={20} color="#FF3B30" />
          </TouchableOpacity>
        </View>
      </View>
      
      {item.category && (
        <View style={styles.categoryContainer}>
          <Ionicons name="restaurant-outline" size={14} color="#8E8E93" />
          <Text style={styles.categoryText}>{item.category}</Text>
        </View>
      )}
    </View>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Ionicons name="restaurant-outline" size={64} color="#C7C7CC" />
      <Text style={styles.emptyStateTitle}>No Menu Items</Text>
      <Text style={styles.emptyStateSubtitle}>
        Start by adding your first menu item to showcase your delicious food
      </Text>
      <TouchableOpacity 
        style={styles.addFirstItemButton}
        onPress={() => navigation.navigate('AddMenuItem')}
      >
        <Ionicons name="add" size={20} color="#FFFFFF" />
        <Text style={styles.addFirstItemText}>Add Your First Item</Text>
      </TouchableOpacity>
    </View>
  );

  const renderErrorState = () => (
    <View style={styles.errorState}>
      <Ionicons name="warning-outline" size={64} color="#FF3B30" />
      <Text style={styles.errorStateTitle}>Unable to Load Menu</Text>
      <Text style={styles.errorStateSubtitle}>{error}</Text>
      <TouchableOpacity 
        style={styles.retryButton}
        onPress={fetchMenuItems}
      >
        <Ionicons name="reload" size={20} color="#FFFFFF" />
        <Text style={styles.retryButtonText}>Try Again</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#F8F9FA" />
      
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color="#007AFF" />
          </TouchableOpacity>
          <View>
            <Text style={styles.headerTitle}>Menu Management</Text>
            <Text style={styles.headerSubtitle}>
              {menuItems.length} item{menuItems.length !== 1 ? 's' : ''} in your menu
            </Text>
          </View>
        </View>
        <TouchableOpacity 
          style={styles.addButton}
          onPress={() => navigation.navigate('AddMenuItem')}
        >
          <Ionicons name="add" size={24} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      {/* Content */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <Ionicons name="restaurant" size={48} color="#007AFF" style={styles.loadingIcon} />
          <Text style={styles.loadingText}>Loading your menu...</Text>
        </View>
      ) : error ? (
        renderErrorState()
      ) : (
        <FlatList
          data={menuItems}
          renderItem={renderMenuItem}
          keyExtractor={(item) => item._id || item.id || Math.random().toString()}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          ListEmptyComponent={renderEmptyState}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  backButton: {
    padding: 8,
    marginRight: 12,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1C1C1E',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#8E8E93',
    marginTop: 2,
  },
  addButton: {
    backgroundColor: '#007AFF',
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#007AFF',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingIcon: {
    marginBottom: 16,
  },
  loadingText: {
    fontSize: 16,
    color: '#8E8E93',
  },
  listContainer: {
    padding: 16,
    paddingBottom: 32,
  },
  menuItemCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  menuItemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  menuItemInfo: {
    flex: 1,
    marginRight: 16,
  },
  menuItemName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1C1C1E',
    marginBottom: 4,
  },
  menuItemDescription: {
    fontSize: 14,
    color: '#8E8E93',
    marginBottom: 12,
    lineHeight: 20,
  },
  menuItemMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  menuItemPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#34C759',
  },
  availabilityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  availabilityText: {
    fontSize: 12,
    fontWeight: '500',
    marginLeft: 4,
  },
  menuItemActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  editButton: {
    backgroundColor: '#007AFF20',
  },
  toggleButton: {
    backgroundColor: '#FF950020',
  },
  deleteButton: {
    backgroundColor: '#FF3B3020',
  },
  categoryContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F2F2F7',
  },
  categoryText: {
    fontSize: 12,
    color: '#8E8E93',
    marginLeft: 4,
  },
  separator: {
    height: 12,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyStateTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#8E8E93',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateSubtitle: {
    fontSize: 16,
    color: '#C7C7CC',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
  },
  addFirstItemButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#007AFF',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 24,
    shadowColor: '#007AFF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  addFirstItemText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  errorState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  errorStateTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#FF3B30',
    marginTop: 16,
    marginBottom: 8,
  },
  errorStateSubtitle: {
    fontSize: 16,
    color: '#8E8E93',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
  },
  retryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#007AFF',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 24,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
}); 