import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    ScrollView,
    StyleSheet,
    TouchableOpacity,
    FlatList,
    Image,
    Alert,
    RefreshControl,
    Switch,
    TextInput,
    Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import FoodProviderNavigation from '../../components/foodProvider/FoodProviderNavigation';
import { fetchFromBackend } from '../../utils/networkUtils';
import authService from '../../services/authService';
import * as ImagePicker from 'expo-image-picker';

const MenuManagementScreen = ({ navigation }) => {
    const [menuItems, setMenuItems] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [showAddModal, setShowAddModal] = useState(false);
    const [editingItem, setEditingItem] = useState(null);
    const [newItem, setNewItem] = useState({
        name: '',
        description: '',
        price: '',
        category: '',
        image: null,
        isAvailable: true,
        preparationTime: '',
        ingredients: '',
        isVegetarian: false,
        isSpicy: false,
    });

    const cuisineCategories = [
        'Pakistani',
        'Chinese',
        'Continental',
        'Fast Food',
        'Beverages',
        'Desserts',
        'Snacks',
        'Breakfast'
    ];

    useEffect(() => {
        loadMenuItems();
        loadCategories();
    }, []);

    const loadMenuItems = async () => {
        try {
            setLoading(true);
            const user = await authService.getCurrentUser();
            const response = await fetchFromBackend(`/food-providers/${user.id}/menu`);
            
            if (response.success) {
                setMenuItems(response.data);
                console.log('✅ Menu items loaded:', response.data.length);
            } else {
                Alert.alert('Error', 'Failed to load menu items');
            }
        } catch (error) {
            console.error('❌ Error loading menu items:', error);
            Alert.alert('Error', 'Failed to load menu items');
        } finally {
            setLoading(false);
        }
    };

    const loadCategories = async () => {
        try {
            const user = await authService.getCurrentUser();
            const response = await fetchFromBackend(`/food-providers/${user.id}/categories`);
            
            if (response.success) {
                setCategories(['All', ...response.data]);
            }
        } catch (error) {
            console.error('❌ Error loading categories:', error);
        }
    };

    const onRefresh = async () => {
        setRefreshing(true);
        await Promise.all([loadMenuItems(), loadCategories()]);
        setRefreshing(false);
    };

    const handleToggleAvailability = async (itemId, newAvailability) => {
        try {
            const response = await fetchFromBackend(`/food-items/${itemId}/availability`, {
                method: 'PUT',
                data: { isAvailable: newAvailability }
            });

            if (response.success) {
                await loadMenuItems();
            } else {
                Alert.alert('Error', 'Failed to update item availability');
            }
        } catch (error) {
            console.error('❌ Error updating availability:', error);
            Alert.alert('Error', 'Failed to update item availability');
        }
    };

    const handleDeleteItem = async (itemId) => {
        Alert.alert(
            'Delete Item',
            'Are you sure you want to delete this menu item?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            const response = await fetchFromBackend(`/food-items/${itemId}`, {
                                method: 'DELETE'
                            });

                            if (response.success) {
                                await loadMenuItems();
                                Alert.alert('Success', 'Menu item deleted successfully');
                            } else {
                                Alert.alert('Error', 'Failed to delete menu item');
                            }
                        } catch (error) {
                            console.error('❌ Error deleting item:', error);
                            Alert.alert('Error', 'Failed to delete menu item');
                        }
                    }
                }
            ]
        );
    };

    const handleSaveItem = async () => {
        if (!newItem.name || !newItem.price || !newItem.category) {
            Alert.alert('Error', 'Please fill in all required fields');
            return;
        }

        try {
            const itemData = {
                ...newItem,
                price: parseFloat(newItem.price),
                preparationTime: parseInt(newItem.preparationTime) || 15,
                ingredients: newItem.ingredients.split(',').map(i => i.trim()).filter(i => i),
            };

            const url = editingItem 
                ? `/food-items/${editingItem.id}` 
                : '/food-items';
            
            const method = editingItem ? 'PUT' : 'POST';

            const response = await fetchFromBackend(url, {
                method,
                data: itemData
            });

            if (response.success) {
                await loadMenuItems();
                setShowAddModal(false);
                setEditingItem(null);
                setNewItem({
                    name: '',
                    description: '',
                    price: '',
                    category: '',
                    image: null,
                    isAvailable: true,
                    preparationTime: '',
                    ingredients: '',
                    isVegetarian: false,
                    isSpicy: false,
                });
                Alert.alert('Success', `Menu item ${editingItem ? 'updated' : 'added'} successfully`);
            } else {
                Alert.alert('Error', `Failed to ${editingItem ? 'update' : 'add'} menu item`);
            }
        } catch (error) {
            console.error('❌ Error saving item:', error);
            Alert.alert('Error', `Failed to ${editingItem ? 'update' : 'add'} menu item`);
        }
    };

    const handleEditItem = (item) => {
        setEditingItem(item);
        setNewItem({
            name: item.name,
            description: item.description,
            price: item.price.toString(),
            category: item.category,
            image: item.image,
            isAvailable: item.isAvailable,
            preparationTime: item.preparationTime?.toString() || '',
            ingredients: item.ingredients?.join(', ') || '',
            isVegetarian: item.isVegetarian || false,
            isSpicy: item.isSpicy || false,
        });
        setShowAddModal(true);
    };

    const handleImagePicker = async () => {
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.8,
        });

        if (!result.canceled) {
            setNewItem({ ...newItem, image: result.assets[0].uri });
        }
    };

    const formatPrice = (price) => {
        return new Intl.NumberFormat('en-PK', {
            style: 'currency',
            currency: 'PKR',
            minimumFractionDigits: 0,
        }).format(price);
    };

    const getFilteredItems = () => {
        if (selectedCategory === 'all') return menuItems;
        return menuItems.filter(item => 
            item.category?.toLowerCase() === selectedCategory.toLowerCase()
        );
    };

    const renderCategoryTabs = () => (
        <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            style={styles.categoryTabs}
        >
            <TouchableOpacity
                style={[
                    styles.categoryTab,
                    selectedCategory === 'all' && styles.activeCategoryTab
                ]}
                onPress={() => setSelectedCategory('all')}
            >
                <Text style={[
                    styles.categoryTabText,
                    selectedCategory === 'all' && styles.activeCategoryTabText
                ]}>
                    All ({menuItems.length})
                </Text>
            </TouchableOpacity>
            
            {cuisineCategories.map((category) => {
                const count = menuItems.filter(item => 
                    item.category?.toLowerCase() === category.toLowerCase()
                ).length;
                
                return (
                    <TouchableOpacity
                        key={category}
                        style={[
                            styles.categoryTab,
                            selectedCategory === category.toLowerCase() && styles.activeCategoryTab
                        ]}
                        onPress={() => setSelectedCategory(category.toLowerCase())}
                    >
                        <Text style={[
                            styles.categoryTabText,
                            selectedCategory === category.toLowerCase() && styles.activeCategoryTabText
                        ]}>
                            {category} ({count})
                        </Text>
                    </TouchableOpacity>
                );
            })}
        </ScrollView>
    );

    const renderMenuItem = ({ item }) => (
        <View style={styles.menuItemCard}>
            <Image 
                source={{ uri: item.image || 'https://via.placeholder.com/100x100' }} 
                style={styles.itemImage}
            />
            
            <View style={styles.itemInfo}>
                <View style={styles.itemHeader}>
                    <Text style={styles.itemName}>{item.name}</Text>
                    <View style={styles.itemBadges}>
                        {item.isVegetarian && (
                            <View style={[styles.badge, styles.vegBadge]}>
                                <Text style={styles.badgeText}>Veg</Text>
                            </View>
                        )}
                        {item.isSpicy && (
                            <View style={[styles.badge, styles.spicyBadge]}>
                                <Text style={styles.badgeText}>🌶️</Text>
                            </View>
                        )}
                    </View>
                </View>
                
                <Text style={styles.itemDescription} numberOfLines={2}>
                    {item.description}
                </Text>
                
                <View style={styles.itemDetails}>
                    <Text style={styles.itemPrice}>{formatPrice(item.price)}</Text>
                    <Text style={styles.itemTime}>
                        <Ionicons name="time-outline" size={14} color="#666" />
                        {' '}{item.preparationTime || 15} min
                    </Text>
                </View>
                
                <View style={styles.itemActions}>
                    <View style={styles.availabilityToggle}>
                        <Text style={styles.toggleLabel}>Available</Text>
                        <Switch
                            value={item.isAvailable}
                            onValueChange={(value) => handleToggleAvailability(item.id, value)}
                            trackColor={{ false: '#ccc', true: '#FF6B35' }}
                            thumbColor="#fff"
                        />
                    </View>
                    
                    <View style={styles.actionButtons}>
                        <TouchableOpacity
                            style={styles.editButton}
                            onPress={() => handleEditItem(item)}
                        >
                            <Ionicons name="pencil-outline" size={16} color="#2196F3" />
                        </TouchableOpacity>
                        
                        <TouchableOpacity
                            style={styles.deleteButton}
                            onPress={() => handleDeleteItem(item.id)}
                        >
                            <Ionicons name="trash-outline" size={16} color="#F44336" />
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </View>
    );

    const renderAddModal = () => (
        <Modal
            visible={showAddModal}
            animationType="slide"
            presentationStyle="pageSheet"
        >
            <SafeAreaView style={styles.modalContainer}>
                <View style={styles.modalHeader}>
                    <TouchableOpacity
                        onPress={() => {
                            setShowAddModal(false);
                            setEditingItem(null);
                        }}
                        style={styles.modalCloseButton}
                    >
                        <Ionicons name="close" size={24} color="#666" />
                    </TouchableOpacity>
                    <Text style={styles.modalTitle}>
                        {editingItem ? 'Edit Menu Item' : 'Add Menu Item'}
                    </Text>
                    <TouchableOpacity
                        onPress={handleSaveItem}
                        style={styles.modalSaveButton}
                    >
                        <Text style={styles.modalSaveText}>Save</Text>
                    </TouchableOpacity>
                </View>
                
                <ScrollView style={styles.modalContent}>
                    {/* Image Picker */}
                    <TouchableOpacity style={styles.imagePicker} onPress={handleImagePicker}>
                        {newItem.image ? (
                            <Image source={{ uri: newItem.image }} style={styles.selectedImage} />
                        ) : (
                            <View style={styles.imagePlaceholder}>
                                <Ionicons name="camera" size={40} color="#ccc" />
                                <Text style={styles.imageText}>Add Photo</Text>
                            </View>
                        )}
                    </TouchableOpacity>
                    
                    {/* Name */}
                    <View style={styles.inputGroup}>
                        <Text style={styles.inputLabel}>Item Name *</Text>
                        <TextInput
                            style={styles.textInput}
                            value={newItem.name}
                            onChangeText={(text) => setNewItem({ ...newItem, name: text })}
                            placeholder="Enter item name"
                        />
                    </View>
                    
                    {/* Description */}
                    <View style={styles.inputGroup}>
                        <Text style={styles.inputLabel}>Description</Text>
                        <TextInput
                            style={[styles.textInput, styles.textArea]}
                            value={newItem.description}
                            onChangeText={(text) => setNewItem({ ...newItem, description: text })}
                            placeholder="Enter item description"
                            multiline
                            numberOfLines={3}
                        />
                    </View>
                    
                    {/* Price */}
                    <View style={styles.inputGroup}>
                        <Text style={styles.inputLabel}>Price (PKR) *</Text>
                        <TextInput
                            style={styles.textInput}
                            value={newItem.price}
                            onChangeText={(text) => setNewItem({ ...newItem, price: text })}
                            placeholder="Enter price"
                            keyboardType="numeric"
                        />
                    </View>
                    
                    {/* Category */}
                    <View style={styles.inputGroup}>
                        <Text style={styles.inputLabel}>Category *</Text>
                        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                            <View style={styles.categorySelector}>
                                {cuisineCategories.map((category) => (
                                    <TouchableOpacity
                                        key={category}
                                        style={[
                                            styles.categorySelectorItem,
                                            newItem.category === category && styles.selectedCategoryItem
                                        ]}
                                        onPress={() => setNewItem({ ...newItem, category })}
                                    >
                                        <Text style={[
                                            styles.categorySelectorText,
                                            newItem.category === category && styles.selectedCategoryText
                                        ]}>
                                            {category}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </ScrollView>
                    </View>
                    
                    {/* Preparation Time */}
                    <View style={styles.inputGroup}>
                        <Text style={styles.inputLabel}>Preparation Time (minutes)</Text>
                        <TextInput
                            style={styles.textInput}
                            value={newItem.preparationTime}
                            onChangeText={(text) => setNewItem({ ...newItem, preparationTime: text })}
                            placeholder="15"
                            keyboardType="numeric"
                        />
                    </View>
                    
                    {/* Ingredients */}
                    <View style={styles.inputGroup}>
                        <Text style={styles.inputLabel}>Ingredients (comma separated)</Text>
                        <TextInput
                            style={[styles.textInput, styles.textArea]}
                            value={newItem.ingredients}
                            onChangeText={(text) => setNewItem({ ...newItem, ingredients: text })}
                            placeholder="e.g. chicken, rice, spices"
                            multiline
                            numberOfLines={2}
                        />
                    </View>
                    
                    {/* Options */}
                    <View style={styles.switchRow}>
                        <Text style={styles.switchLabel}>Vegetarian</Text>
                        <Switch
                            value={newItem.isVegetarian}
                            onValueChange={(value) => setNewItem({ ...newItem, isVegetarian: value })}
                            trackColor={{ false: '#ccc', true: '#4CAF50' }}
                            thumbColor="#fff"
                        />
                    </View>
                    
                    <View style={styles.switchRow}>
                        <Text style={styles.switchLabel}>Spicy</Text>
                        <Switch
                            value={newItem.isSpicy}
                            onValueChange={(value) => setNewItem({ ...newItem, isSpicy: value })}
                            trackColor={{ false: '#ccc', true: '#FF5722' }}
                            thumbColor="#fff"
                        />
                    </View>
                    
                    <View style={styles.switchRow}>
                        <Text style={styles.switchLabel}>Available</Text>
                        <Switch
                            value={newItem.isAvailable}
                            onValueChange={(value) => setNewItem({ ...newItem, isAvailable: value })}
                            trackColor={{ false: '#ccc', true: '#FF6B35' }}
                            thumbColor="#fff"
                        />
                    </View>
                </ScrollView>
            </SafeAreaView>
        </Modal>
    );

    return (
        <SafeAreaView style={styles.container}>
            {/* Header */}
            <LinearGradient
                colors={['#FF6B35', '#F7931E']}
                style={styles.header}
            >
                <View style={styles.headerContent}>
                    <Text style={styles.headerTitle}>Menu Management</Text>
                    <TouchableOpacity
                        onPress={() => setShowAddModal(true)}
                        style={styles.addButton}
                    >
                        <Ionicons name="add" size={24} color="#fff" />
                    </TouchableOpacity>
                </View>
            </LinearGradient>

            {/* Category Tabs */}
            {renderCategoryTabs()}

            {/* Menu Items List */}
            <FlatList
                data={getFilteredItems()}
                renderItem={renderMenuItem}
                keyExtractor={(item) => item.id.toString()}
                contentContainerStyle={styles.listContainer}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                }
                showsVerticalScrollIndicator={false}
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <Ionicons name="restaurant-outline" size={64} color="#ccc" />
                        <Text style={styles.emptyText}>No menu items yet</Text>
                        <Text style={styles.emptySubText}>Add your first menu item to get started</Text>
                        <TouchableOpacity
                            style={styles.emptyButton}
                            onPress={() => setShowAddModal(true)}
                        >
                            <Text style={styles.emptyButtonText}>Add Menu Item</Text>
                        </TouchableOpacity>
                    </View>
                }
            />

            {/* Add/Edit Modal */}
            {renderAddModal()}

            {/* Bottom Navigation */}
            <FoodProviderNavigation navigation={navigation} activeRoute="menu" />
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
    headerTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#fff',
    },
    addButton: {
        backgroundColor: 'rgba(255,255,255,0.2)',
        borderRadius: 25,
        padding: 8,
    },
    categoryTabs: {
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#e0e0e0',
    },
    categoryTab: {
        paddingHorizontal: 16,
        paddingVertical: 12,
        marginHorizontal: 4,
        borderBottomWidth: 2,
        borderBottomColor: 'transparent',
    },
    activeCategoryTab: {
        borderBottomColor: '#FF6B35',
    },
    categoryTabText: {
        fontSize: 14,
        color: '#666',
        fontWeight: '500',
    },
    activeCategoryTabText: {
        color: '#FF6B35',
        fontWeight: '600',
    },
    listContainer: {
        padding: 20,
    },
    menuItemCard: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 15,
        marginBottom: 15,
        flexDirection: 'row',
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
    },
    itemImage: {
        width: 80,
        height: 80,
        borderRadius: 8,
        marginRight: 15,
    },
    itemInfo: {
        flex: 1,
    },
    itemHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 5,
    },
    itemName: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
        flex: 1,
        marginRight: 10,
    },
    itemBadges: {
        flexDirection: 'row',
    },
    badge: {
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 10,
        marginLeft: 4,
    },
    vegBadge: {
        backgroundColor: '#4CAF50',
    },
    spicyBadge: {
        backgroundColor: '#FF5722',
    },
    badgeText: {
        color: '#fff',
        fontSize: 10,
        fontWeight: '600',
    },
    itemDescription: {
        fontSize: 14,
        color: '#666',
        marginBottom: 8,
        lineHeight: 18,
    },
    itemDetails: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 10,
    },
    itemPrice: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#FF6B35',
    },
    itemTime: {
        fontSize: 12,
        color: '#666',
    },
    itemActions: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    availabilityToggle: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    toggleLabel: {
        fontSize: 14,
        color: '#333',
        marginRight: 8,
    },
    actionButtons: {
        flexDirection: 'row',
    },
    editButton: {
        backgroundColor: '#f0f8ff',
        padding: 8,
        borderRadius: 8,
        marginRight: 8,
    },
    deleteButton: {
        backgroundColor: '#fff0f0',
        padding: 8,
        borderRadius: 8,
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
        marginBottom: 20,
    },
    emptyButton: {
        backgroundColor: '#FF6B35',
        paddingHorizontal: 30,
        paddingVertical: 12,
        borderRadius: 25,
    },
    emptyButtonText: {
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
    modalSaveButton: {
        backgroundColor: '#FF6B35',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 8,
    },
    modalSaveText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
    modalContent: {
        flex: 1,
        padding: 20,
    },
    imagePicker: {
        alignItems: 'center',
        marginBottom: 20,
    },
    selectedImage: {
        width: 120,
        height: 120,
        borderRadius: 8,
    },
    imagePlaceholder: {
        width: 120,
        height: 120,
        borderRadius: 8,
        borderWidth: 2,
        borderColor: '#ddd',
        borderStyle: 'dashed',
        justifyContent: 'center',
        alignItems: 'center',
    },
    imageText: {
        fontSize: 14,
        color: '#ccc',
        marginTop: 8,
    },
    inputGroup: {
        marginBottom: 20,
    },
    inputLabel: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
        marginBottom: 8,
    },
    textInput: {
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 8,
        padding: 12,
        fontSize: 16,
        backgroundColor: '#fff',
    },
    textArea: {
        height: 80,
        textAlignVertical: 'top',
    },
    categorySelector: {
        flexDirection: 'row',
        paddingVertical: 5,
    },
    categorySelectorItem: {
        backgroundColor: '#f0f0f0',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        marginRight: 10,
        borderWidth: 1,
        borderColor: '#ddd',
    },
    selectedCategoryItem: {
        backgroundColor: '#FF6B35',
        borderColor: '#FF6B35',
    },
    categorySelectorText: {
        fontSize: 14,
        color: '#333',
        fontWeight: '500',
    },
    selectedCategoryText: {
        color: '#fff',
    },
    switchRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    switchLabel: {
        fontSize: 16,
        color: '#333',
    },
});

export default MenuManagementScreen;
