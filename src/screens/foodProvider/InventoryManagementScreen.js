import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    RefreshControl,
    Alert,
    Modal,
    TextInput,
    Switch,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SIZES } from '../../utils/constants';
import { fetchFromBackend } from '../../utils/networkUtils';

const InventoryManagementScreen = ({ navigation }) => {
    const [inventoryItems, setInventoryItems] = useState([]);
    const [loading, setLoading] = useState(false);
    const [refreshing, setRefreshing] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [addItemVisible, setAddItemVisible] = useState(false);
    const [editItemVisible, setEditItemVisible] = useState(false);
    const [selectedItem, setSelectedItem] = useState(null);
    const [newItem, setNewItem] = useState({
        name: '',
        category: '',
        current_stock: '',
        minimum_stock: '',
        unit: '',
        cost_price: '',
        selling_price: '',
        supplier: '',
        auto_reorder: false,
    });

    const categories = [
        { id: 'all', label: 'All Items' },
        { id: 'ingredients', label: 'Ingredients' },
        { id: 'beverages', label: 'Beverages' },
        { id: 'packaging', label: 'Packaging' },
        { id: 'condiments', label: 'Condiments' },
        { id: 'dairy', label: 'Dairy' },
        { id: 'meat', label: 'Meat & Poultry' },
        { id: 'vegetables', label: 'Vegetables' },
        { id: 'others', label: 'Others' },
    ];

    const units = ['kg', 'g', 'L', 'ml', 'pieces', 'packets', 'boxes', 'cans'];

    useEffect(() => {
        loadInventory();
    }, []);

    const loadInventory = async () => {
        setLoading(true);
        try {
            const response = await fetchFromBackend('/api/inventory');
            if (response?.success) {
                setInventoryItems(response.data || []);
            }
        } catch (error) {
            console.error('Error loading inventory:', error);
            Alert.alert('Error', 'Failed to load inventory');
        } finally {
            setLoading(false);
        }
    };

    const handleRefresh = async () => {
        setRefreshing(true);
        await loadInventory();
        setRefreshing(false);
    };

    const addInventoryItem = async () => {
        if (!newItem.name || !newItem.category || !newItem.current_stock) {
            Alert.alert('Error', 'Please fill in all required fields');
            return;
        }

        try {
            const response = await fetchFromBackend('/api/inventory', {
                method: 'POST',
                body: JSON.stringify({
                    ...newItem,
                    current_stock: parseFloat(newItem.current_stock),
                    minimum_stock: parseFloat(newItem.minimum_stock) || 0,
                    cost_price: parseFloat(newItem.cost_price) || 0,
                    selling_price: parseFloat(newItem.selling_price) || 0,
                })
            });

            if (response?.success) {
                Alert.alert('Success', 'Item added successfully');
                setAddItemVisible(false);
                setNewItem({
                    name: '',
                    category: '',
                    current_stock: '',
                    minimum_stock: '',
                    unit: '',
                    cost_price: '',
                    selling_price: '',
                    supplier: '',
                    auto_reorder: false,
                });
                await loadInventory();
            }
        } catch (error) {
            console.error('Error adding item:', error);
            Alert.alert('Error', 'Failed to add item');
        }
    };

    const updateInventoryItem = async () => {
        if (!selectedItem) return;

        try {
            const response = await fetchFromBackend(`/api/inventory/${selectedItem.id}`, {
                method: 'PUT',
                body: JSON.stringify({
                    ...selectedItem,
                    current_stock: parseFloat(selectedItem.current_stock),
                    minimum_stock: parseFloat(selectedItem.minimum_stock) || 0,
                    cost_price: parseFloat(selectedItem.cost_price) || 0,
                    selling_price: parseFloat(selectedItem.selling_price) || 0,
                })
            });

            if (response?.success) {
                Alert.alert('Success', 'Item updated successfully');
                setEditItemVisible(false);
                setSelectedItem(null);
                await loadInventory();
            }
        } catch (error) {
            console.error('Error updating item:', error);
            Alert.alert('Error', 'Failed to update item');
        }
    };

    const deleteInventoryItem = async (itemId) => {
        Alert.alert(
            'Delete Item',
            'Are you sure you want to delete this item?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            const response = await fetchFromBackend(`/api/inventory/${itemId}`, {
                                method: 'DELETE'
                            });

                            if (response?.success) {
                                Alert.alert('Success', 'Item deleted successfully');
                                await loadInventory();
                            }
                        } catch (error) {
                            console.error('Error deleting item:', error);
                            Alert.alert('Error', 'Failed to delete item');
                        }
                    }
                }
            ]
        );
    };

    const adjustStock = async (itemId, adjustment, reason) => {
        try {
            const response = await fetchFromBackend(`/api/inventory/${itemId}/adjust`, {
                method: 'POST',
                body: JSON.stringify({
                    adjustment: parseFloat(adjustment),
                    reason: reason
                })
            });

            if (response?.success) {
                Alert.alert('Success', 'Stock adjusted successfully');
                await loadInventory();
            }
        } catch (error) {
            console.error('Error adjusting stock:', error);
            Alert.alert('Error', 'Failed to adjust stock');
        }
    };

    const getStockStatus = (item) => {
        const stockLevel = item.current_stock / (item.minimum_stock || 1);
        if (stockLevel <= 0.5) return { status: 'critical', color: COLORS.error };
        if (stockLevel <= 1) return { status: 'low', color: COLORS.warning };
        return { status: 'good', color: COLORS.success };
    };

    const filteredItems = inventoryItems.filter(item => {
        const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
        const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            item.supplier?.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesCategory && matchesSearch;
    });

    const renderInventoryItem = (item) => {
        const stockStatus = getStockStatus(item);
        
        return (
            <View key={item.id} style={styles.itemCard}>
                <View style={styles.itemHeader}>
                    <View style={styles.itemInfo}>
                        <Text style={styles.itemName}>{item.name}</Text>
                        <Text style={styles.itemCategory}>
                            {categories.find(c => c.id === item.category)?.label || item.category}
                        </Text>
                    </View>
                    <View style={styles.itemActions}>
                        <TouchableOpacity
                            onPress={() => {
                                setSelectedItem(item);
                                setEditItemVisible(true);
                            }}
                            style={styles.actionIcon}
                        >
                            <Ionicons name="create-outline" size={20} color={COLORS.primary} />
                        </TouchableOpacity>
                        <TouchableOpacity
                            onPress={() => deleteInventoryItem(item.id)}
                            style={styles.actionIcon}
                        >
                            <Ionicons name="trash-outline" size={20} color={COLORS.error} />
                        </TouchableOpacity>
                    </View>
                </View>

                <View style={styles.stockInfo}>
                    <View style={styles.stockLevel}>
                        <Text style={styles.stockLabel}>Current Stock</Text>
                        <Text style={[styles.stockValue, { color: stockStatus.color }]}>
                            {item.current_stock} {item.unit}
                        </Text>
                    </View>
                    <View style={styles.stockLevel}>
                        <Text style={styles.stockLabel}>Minimum Stock</Text>
                        <Text style={styles.stockValue}>
                            {item.minimum_stock || 0} {item.unit}
                        </Text>
                    </View>
                </View>

                <View style={styles.priceInfo}>
                    <View style={styles.priceItem}>
                        <Text style={styles.priceLabel}>Cost Price</Text>
                        <Text style={styles.priceValue}>₨{item.cost_price || 0}</Text>
                    </View>
                    <View style={styles.priceItem}>
                        <Text style={styles.priceLabel}>Selling Price</Text>
                        <Text style={styles.priceValue}>₨{item.selling_price || 0}</Text>
                    </View>
                </View>

                {item.supplier && (
                    <View style={styles.supplierInfo}>
                        <Text style={styles.supplierLabel}>Supplier: </Text>
                        <Text style={styles.supplierValue}>{item.supplier}</Text>
                    </View>
                )}

                <View style={styles.stockActions}>
                    <TouchableOpacity
                        style={[styles.stockButton, { backgroundColor: COLORS.success }]}
                        onPress={() => {
                            Alert.prompt(
                                'Add Stock',
                                'Enter quantity to add:',
                                (text) => {
                                    if (text && !isNaN(text)) {
                                        adjustStock(item.id, text, 'Stock added');
                                    }
                                },
                                'plain-text',
                                '',
                                'numeric'
                            );
                        }}
                    >
                        <Ionicons name="add" size={16} color={COLORS.white} />
                        <Text style={styles.stockButtonText}>Add</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.stockButton, { backgroundColor: COLORS.error }]}
                        onPress={() => {
                            Alert.prompt(
                                'Remove Stock',
                                'Enter quantity to remove:',
                                (text) => {
                                    if (text && !isNaN(text)) {
                                        adjustStock(item.id, -parseFloat(text), 'Stock removed');
                                    }
                                },
                                'plain-text',
                                '',
                                'numeric'
                            );
                        }}
                    >
                        <Ionicons name="remove" size={16} color={COLORS.white} />
                        <Text style={styles.stockButtonText}>Remove</Text>
                    </TouchableOpacity>
                </View>

                <View style={[styles.statusIndicator, { backgroundColor: stockStatus.color }]}>
                    <Text style={styles.statusText}>{stockStatus.status.toUpperCase()}</Text>
                </View>
            </View>
        );
    };

    const renderItemForm = (isEdit = false) => {
        const item = isEdit ? selectedItem : newItem;
        const setItem = isEdit ? setSelectedItem : setNewItem;

        return (
            <ScrollView style={styles.formContainer}>
                <View style={styles.formField}>
                    <Text style={styles.formLabel}>Item Name *</Text>
                    <TextInput
                        style={styles.formInput}
                        value={item.name}
                        onChangeText={(text) => setItem({ ...item, name: text })}
                        placeholder="Enter item name"
                    />
                </View>

                <View style={styles.formField}>
                    <Text style={styles.formLabel}>Category *</Text>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                        <View style={styles.categoryOptions}>
                            {categories.slice(1).map((category) => (
                                <TouchableOpacity
                                    key={category.id}
                                    style={[
                                        styles.categoryOption,
                                        item.category === category.id && styles.selectedCategory
                                    ]}
                                    onPress={() => setItem({ ...item, category: category.id })}
                                >
                                    <Text style={[
                                        styles.categoryOptionText,
                                        item.category === category.id && styles.selectedCategoryText
                                    ]}>
                                        {category.label}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </ScrollView>
                </View>

                <View style={styles.formRow}>
                    <View style={[styles.formField, { flex: 2 }]}>
                        <Text style={styles.formLabel}>Current Stock *</Text>
                        <TextInput
                            style={styles.formInput}
                            value={item.current_stock.toString()}
                            onChangeText={(text) => setItem({ ...item, current_stock: text })}
                            placeholder="0"
                            keyboardType="numeric"
                        />
                    </View>
                    <View style={[styles.formField, { flex: 1, marginLeft: 10 }]}>
                        <Text style={styles.formLabel}>Unit</Text>
                        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                            <View style={styles.unitOptions}>
                                {units.map((unit) => (
                                    <TouchableOpacity
                                        key={unit}
                                        style={[
                                            styles.unitOption,
                                            item.unit === unit && styles.selectedUnit
                                        ]}
                                        onPress={() => setItem({ ...item, unit: unit })}
                                    >
                                        <Text style={[
                                            styles.unitOptionText,
                                            item.unit === unit && styles.selectedUnitText
                                        ]}>
                                            {unit}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </ScrollView>
                    </View>
                </View>

                <View style={styles.formField}>
                    <Text style={styles.formLabel}>Minimum Stock</Text>
                    <TextInput
                        style={styles.formInput}
                        value={item.minimum_stock.toString()}
                        onChangeText={(text) => setItem({ ...item, minimum_stock: text })}
                        placeholder="0"
                        keyboardType="numeric"
                    />
                </View>

                <View style={styles.formRow}>
                    <View style={[styles.formField, { flex: 1 }]}>
                        <Text style={styles.formLabel}>Cost Price</Text>
                        <TextInput
                            style={styles.formInput}
                            value={item.cost_price.toString()}
                            onChangeText={(text) => setItem({ ...item, cost_price: text })}
                            placeholder="0"
                            keyboardType="numeric"
                        />
                    </View>
                    <View style={[styles.formField, { flex: 1, marginLeft: 10 }]}>
                        <Text style={styles.formLabel}>Selling Price</Text>
                        <TextInput
                            style={styles.formInput}
                            value={item.selling_price.toString()}
                            onChangeText={(text) => setItem({ ...item, selling_price: text })}
                            placeholder="0"
                            keyboardType="numeric"
                        />
                    </View>
                </View>

                <View style={styles.formField}>
                    <Text style={styles.formLabel}>Supplier</Text>
                    <TextInput
                        style={styles.formInput}
                        value={item.supplier}
                        onChangeText={(text) => setItem({ ...item, supplier: text })}
                        placeholder="Supplier name"
                    />
                </View>

                <View style={styles.switchField}>
                    <Text style={styles.formLabel}>Auto Reorder</Text>
                    <Switch
                        value={item.auto_reorder}
                        onValueChange={(value) => setItem({ ...item, auto_reorder: value })}
                        trackColor={{ false: COLORS.lightGray, true: COLORS.primary }}
                        thumbColor={item.auto_reorder ? COLORS.white : COLORS.gray}
                    />
                </View>
            </ScrollView>
        );
    };

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity
                    onPress={() => navigation.goBack()}
                    style={styles.backButton}
                >
                    <Ionicons name="arrow-back" size={24} color={COLORS.white} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Inventory Management</Text>
                <TouchableOpacity
                    onPress={() => setAddItemVisible(true)}
                    style={styles.addButton}
                >
                    <Ionicons name="add" size={24} color={COLORS.white} />
                </TouchableOpacity>
            </View>

            <View style={styles.searchContainer}>
                <View style={styles.searchInput}>
                    <Ionicons name="search" size={20} color={COLORS.gray} />
                    <TextInput
                        style={styles.searchText}
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                        placeholder="Search items or suppliers..."
                        placeholderTextColor={COLORS.gray}
                    />
                </View>
            </View>

            <ScrollView 
                horizontal 
                showsHorizontalScrollIndicator={false}
                style={styles.categoriesContainer}
            >
                {categories.map((category) => (
                    <TouchableOpacity
                        key={category.id}
                        style={[
                            styles.categoryFilter,
                            selectedCategory === category.id && styles.activeCategoryFilter
                        ]}
                        onPress={() => setSelectedCategory(category.id)}
                    >
                        <Text style={[
                            styles.categoryFilterText,
                            selectedCategory === category.id && styles.activeCategoryFilterText
                        ]}>
                            {category.label}
                        </Text>
                    </TouchableOpacity>
                ))}
            </ScrollView>

            <ScrollView
                style={styles.content}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
                }
            >
                {filteredItems.length > 0 ? (
                    filteredItems.map(renderInventoryItem)
                ) : (
                    <View style={styles.emptyState}>
                        <Ionicons name="cube-outline" size={64} color={COLORS.gray} />
                        <Text style={styles.emptyTitle}>No Items Found</Text>
                        <Text style={styles.emptyDescription}>
                            {searchQuery ? 'No items match your search' : 'Add items to manage your inventory'}
                        </Text>
                    </View>
                )}
            </ScrollView>

            {/* Add Item Modal */}
            <Modal
                visible={addItemVisible}
                animationType="slide"
                presentationStyle="pageSheet"
            >
                <View style={styles.modalContainer}>
                    <View style={styles.modalHeader}>
                        <TouchableOpacity
                            onPress={() => setAddItemVisible(false)}
                            style={styles.modalCloseButton}
                        >
                            <Text style={styles.modalCloseText}>Cancel</Text>
                        </TouchableOpacity>
                        <Text style={styles.modalTitle}>Add Item</Text>
                        <TouchableOpacity
                            onPress={addInventoryItem}
                            style={styles.modalSaveButton}
                        >
                            <Text style={styles.modalSaveText}>Save</Text>
                        </TouchableOpacity>
                    </View>
                    {renderItemForm()}
                </View>
            </Modal>

            {/* Edit Item Modal */}
            <Modal
                visible={editItemVisible}
                animationType="slide"
                presentationStyle="pageSheet"
            >
                <View style={styles.modalContainer}>
                    <View style={styles.modalHeader}>
                        <TouchableOpacity
                            onPress={() => {
                                setEditItemVisible(false);
                                setSelectedItem(null);
                            }}
                            style={styles.modalCloseButton}
                        >
                            <Text style={styles.modalCloseText}>Cancel</Text>
                        </TouchableOpacity>
                        <Text style={styles.modalTitle}>Edit Item</Text>
                        <TouchableOpacity
                            onPress={updateInventoryItem}
                            style={styles.modalSaveButton}
                        >
                            <Text style={styles.modalSaveText}>Update</Text>
                        </TouchableOpacity>
                    </View>
                    {renderItemForm(true)}
                </View>
            </Modal>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    header: {
        backgroundColor: COLORS.primary,
        paddingTop: 50,
        paddingBottom: 20,
        paddingHorizontal: 20,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    backButton: {
        padding: 8,
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: COLORS.white,
        flex: 1,
        textAlign: 'center',
    },
    addButton: {
        padding: 8,
        backgroundColor: 'rgba(255,255,255,0.2)',
        borderRadius: 20,
    },
    searchContainer: {
        backgroundColor: COLORS.white,
        paddingHorizontal: 20,
        paddingVertical: 15,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    searchInput: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.lightGray,
        borderRadius: 25,
        paddingHorizontal: 15,
        paddingVertical: 12,
    },
    searchText: {
        flex: 1,
        marginLeft: 10,
        fontSize: 16,
        color: COLORS.dark,
    },
    categoriesContainer: {
        backgroundColor: COLORS.white,
        paddingVertical: 10,
        paddingHorizontal: 20,
        elevation: 1,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
    },
    categoryFilter: {
        paddingHorizontal: 15,
        paddingVertical: 8,
        borderRadius: 20,
        backgroundColor: COLORS.lightGray,
        marginRight: 10,
    },
    activeCategoryFilter: {
        backgroundColor: COLORS.primary,
    },
    categoryFilterText: {
        fontSize: 14,
        color: COLORS.gray,
        fontWeight: '500',
    },
    activeCategoryFilterText: {
        color: COLORS.white,
        fontWeight: 'bold',
    },
    content: {
        flex: 1,
        padding: 20,
    },
    itemCard: {
        backgroundColor: COLORS.white,
        borderRadius: 12,
        padding: 15,
        marginBottom: 15,
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        position: 'relative',
    },
    itemHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 15,
    },
    itemInfo: {
        flex: 1,
    },
    itemName: {
        fontSize: 16,
        fontWeight: 'bold',
        color: COLORS.dark,
        marginBottom: 5,
    },
    itemCategory: {
        fontSize: 14,
        color: COLORS.gray,
    },
    itemActions: {
        flexDirection: 'row',
    },
    actionIcon: {
        padding: 8,
        marginLeft: 5,
    },
    stockInfo: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 15,
    },
    stockLevel: {
        flex: 1,
    },
    stockLabel: {
        fontSize: 12,
        color: COLORS.gray,
        marginBottom: 5,
    },
    stockValue: {
        fontSize: 16,
        fontWeight: 'bold',
        color: COLORS.dark,
    },
    priceInfo: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 15,
    },
    priceItem: {
        flex: 1,
    },
    priceLabel: {
        fontSize: 12,
        color: COLORS.gray,
        marginBottom: 5,
    },
    priceValue: {
        fontSize: 14,
        fontWeight: 'bold',
        color: COLORS.primary,
    },
    supplierInfo: {
        flexDirection: 'row',
        marginBottom: 15,
    },
    supplierLabel: {
        fontSize: 14,
        color: COLORS.gray,
    },
    supplierValue: {
        fontSize: 14,
        color: COLORS.dark,
        fontWeight: '500',
    },
    stockActions: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 10,
    },
    stockButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 10,
        borderRadius: 8,
        marginHorizontal: 5,
    },
    stockButtonText: {
        color: COLORS.white,
        fontSize: 14,
        fontWeight: 'bold',
        marginLeft: 5,
    },
    statusIndicator: {
        position: 'absolute',
        top: 15,
        right: 15,
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 10,
    },
    statusText: {
        color: COLORS.white,
        fontSize: 10,
        fontWeight: 'bold',
    },
    emptyState: {
        alignItems: 'center',
        paddingVertical: 50,
    },
    emptyTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: COLORS.dark,
        marginTop: 15,
        marginBottom: 5,
    },
    emptyDescription: {
        fontSize: 14,
        color: COLORS.gray,
        textAlign: 'center',
    },
    modalContainer: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    modalHeader: {
        backgroundColor: COLORS.primary,
        paddingTop: 50,
        paddingBottom: 20,
        paddingHorizontal: 20,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    modalCloseButton: {
        paddingVertical: 8,
        paddingHorizontal: 12,
    },
    modalCloseText: {
        color: COLORS.white,
        fontSize: 16,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: COLORS.white,
        flex: 1,
        textAlign: 'center',
    },
    modalSaveButton: {
        paddingVertical: 8,
        paddingHorizontal: 12,
        backgroundColor: 'rgba(255,255,255,0.2)',
        borderRadius: 8,
    },
    modalSaveText: {
        color: COLORS.white,
        fontSize: 16,
        fontWeight: 'bold',
    },
    formContainer: {
        flex: 1,
        padding: 20,
    },
    formField: {
        marginBottom: 20,
    },
    formLabel: {
        fontSize: 16,
        fontWeight: '600',
        color: COLORS.dark,
        marginBottom: 8,
    },
    formInput: {
        borderWidth: 1,
        borderColor: COLORS.lightGray,
        borderRadius: 8,
        paddingHorizontal: 15,
        paddingVertical: 12,
        fontSize: 16,
        color: COLORS.dark,
        backgroundColor: COLORS.white,
    },
    formRow: {
        flexDirection: 'row',
        alignItems: 'flex-end',
    },
    categoryOptions: {
        flexDirection: 'row',
    },
    categoryOption: {
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 15,
        backgroundColor: COLORS.lightGray,
        marginRight: 8,
    },
    selectedCategory: {
        backgroundColor: COLORS.primary,
    },
    categoryOptionText: {
        fontSize: 14,
        color: COLORS.gray,
    },
    selectedCategoryText: {
        color: COLORS.white,
    },
    unitOptions: {
        flexDirection: 'row',
    },
    unitOption: {
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 12,
        backgroundColor: COLORS.lightGray,
        marginRight: 5,
    },
    selectedUnit: {
        backgroundColor: COLORS.primary,
    },
    unitOptionText: {
        fontSize: 12,
        color: COLORS.gray,
    },
    selectedUnitText: {
        color: COLORS.white,
    },
    switchField: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 10,
    },
});

export default InventoryManagementScreen;
