import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    Image,
    TouchableOpacity,
    Alert,
    FlatList,
    Modal,
    SafeAreaView,
    ActivityIndicator
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import authService from '../../services/authService';

const FoodProviderDetailScreen = ({ route, navigation }) => {
    const { providerId } = route.params;
    const [provider, setProvider] = useState(null);
    const [menuItems, setMenuItems] = useState([]);
    const [cart, setCart] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [cartVisible, setCartVisible] = useState(false);

    useEffect(() => {
        loadProviderData();
    }, [providerId]);

    const loadProviderData = async () => {
        try {
            setLoading(true);
            const [providerRes, menuRes] = await Promise.all([
                authService.makeAuthenticatedRequest(`/food-providers/${providerId}`),
                authService.makeAuthenticatedRequest(`/menu-items?foodProvider=${providerId}`)
            ]);

            setProvider(providerRes.data);
            setMenuItems(menuRes.data || []);
        } catch (error) {
            console.error('Load provider data error:', error);
            Alert.alert('Error', 'Failed to load restaurant details');
        } finally {
            setLoading(false);
        }
    };

    const addToCart = (item, quantity = 1, customizations = []) => {
        const cartItem = {
            id: item.id + '_' + Date.now(),
            menuItem: item,
            quantity,
            customizations,
            totalPrice: item.price * quantity
        };

        setCart(prev => [...prev, cartItem]);
        Alert.alert('Added to Cart', `${item?.name || 'Item'} added to cart`);
    };

    const updateCartQuantity = (itemId, quantity) => {
        if (quantity === 0) {
            setCart(prev => prev.filter(item => item.id !== itemId));
        } else {
            setCart(prev => prev.map(item => 
                item.id === itemId 
                    ? { ...item, quantity, totalPrice: item.menuItem.price * quantity }
                    : item
            ));
        }
    };

    const getCartTotal = () => {
        return cart.reduce((total, item) => total + item.totalPrice, 0);
    };

    const getCartItemCount = () => {
        return cart.reduce((total, item) => total + item.quantity, 0);
    };

    const categories = ['All', ...new Set(menuItems.map(item => item.category))];
    const filteredItems = selectedCategory === 'All' 
        ? menuItems 
        : menuItems.filter(item => item.category === selectedCategory);

    const renderMenuItem = ({ item }) => (
        <View style={styles.menuItem}>
            <Image 
                source={{ uri: item.image || 'https://via.placeholder.com/80x80' }} 
                style={styles.menuItemImage} 
            />
            <View style={styles.menuItemContent}>
                <Text style={styles.menuItemName}>{item?.name || 'Unknown Item'}</Text>
                <Text style={styles.menuItemDescription}>{item.description}</Text>
                <View style={styles.menuItemFooter}>
                    <Text style={styles.menuItemPrice}>${item.price}</Text>
                    <TouchableOpacity 
                        style={styles.addToCartButton}
                        onPress={() => addToCart(item)}
                    >
                        <Ionicons name="add" size={20} color="white" />
                    </TouchableOpacity>
                </View>
                {item.dietary_info && (
                    <View style={styles.dietaryInfo}>
                        {item.dietary_info.includes('vegetarian') && (
                            <Text style={styles.dietaryTag}>🥗 Veg</Text>
                        )}
                        {item.dietary_info.includes('vegan') && (
                            <Text style={styles.dietaryTag}>🌱 Vegan</Text>
                        )}
                    </View>
                )}
            </View>
        </View>
    );

    const renderCartItem = ({ item }) => (
        <View style={styles.cartItem}>
            <View style={styles.cartItemInfo}>
                <Text style={styles.cartItemName}>{item?.menuItem?.name || 'Unknown Item'}</Text>
                <Text style={styles.cartItemPrice}>${item.totalPrice.toFixed(2)}</Text>
            </View>
            <View style={styles.quantityControls}>
                <TouchableOpacity 
                    onPress={() => updateCartQuantity(item.id, item.quantity - 1)}
                    style={styles.quantityButton}
                >
                    <Text style={styles.quantityButtonText}>-</Text>
                </TouchableOpacity>
                <Text style={styles.quantity}>{item.quantity}</Text>
                <TouchableOpacity 
                    onPress={() => updateCartQuantity(item.id, item.quantity + 1)}
                    style={styles.quantityButton}
                >
                    <Text style={styles.quantityButtonText}>+</Text>
                </TouchableOpacity>
            </View>
        </View>
    );

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#3498db" />
                <Text style={styles.loadingText}>Loading restaurant...</Text>
            </View>
        );
    }

    if (!provider) {
        return (
            <View style={styles.errorContainer}>
                <Text style={styles.errorText}>Restaurant not found</Text>
                <TouchableOpacity 
                    style={styles.backButton}
                    onPress={() => navigation.goBack()}
                >
                    <Text style={styles.backButtonText}>Go Back</Text>
                </TouchableOpacity>
            </View>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity 
                    onPress={() => navigation.goBack()}
                    style={styles.headerButton}
                >
                    <Ionicons name="arrow-back" size={24} color="#2c3e50" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>{provider?.name || 'Unknown Provider'}</Text>
                <TouchableOpacity 
                    onPress={() => setCartVisible(true)}
                    style={styles.cartButton}
                >
                    <Ionicons name="cart" size={24} color="#2c3e50" />
                    {getCartItemCount() > 0 && (
                        <View style={styles.cartBadge}>
                            <Text style={styles.cartBadgeText}>{getCartItemCount()}</Text>
                        </View>
                    )}
                </TouchableOpacity>
            </View>

            <ScrollView style={styles.content}>
                {/* Restaurant Info */}
                <LinearGradient colors={['#3498db', '#2980b9']} style={styles.restaurantHeader}>
                    <Image 
                        source={{ uri: provider.image || 'https://via.placeholder.com/100x100' }} 
                        style={styles.restaurantImage} 
                    />
                    <View style={styles.restaurantInfo}>
                        <Text style={styles.restaurantName}>{provider?.name || 'Unknown Provider'}</Text>
                        <Text style={styles.restaurantCuisine}>{provider.cuisine_type}</Text>
                        <View style={styles.restaurantMeta}>
                            <Text style={styles.rating}>⭐ {provider.rating || '4.0'}</Text>
                            <Text style={styles.deliveryTime}>🕒 {provider.delivery_time || '30-45'} min</Text>
                            <Text style={styles.distance}>📍 {provider.distance || '2.5'} km</Text>
                        </View>
                        <Text style={styles.restaurantAddress}>{provider.address}</Text>
                    </View>
                </LinearGradient>

                {/* Category Filter */}
                <ScrollView 
                    horizontal 
                    showsHorizontalScrollIndicator={false}
                    style={styles.categoryFilter}
                >
                    {categories.map((category) => (
                        <TouchableOpacity
                            key={category}
                            style={[
                                styles.categoryButton,
                                selectedCategory === category && styles.categoryButtonActive
                            ]}
                            onPress={() => setSelectedCategory(category)}
                        >
                            <Text style={[
                                styles.categoryButtonText,
                                selectedCategory === category && styles.categoryButtonTextActive
                            ]}>
                                {category}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>

                {/* Menu Items */}
                <View style={styles.menuSection}>
                    <Text style={styles.sectionTitle}>Menu</Text>
                    <FlatList
                        data={filteredItems}
                        renderItem={renderMenuItem}
                        keyExtractor={(item, index) => item.id ? item.id.toString() : index.toString()}
                        scrollEnabled={false}
                        showsVerticalScrollIndicator={false}
                    />
                </View>
            </ScrollView>

            {/* Sticky Cart Preview */}
            {cart.length > 0 && (
                <TouchableOpacity 
                    style={styles.cartPreview}
                    onPress={() => setCartVisible(true)}
                >
                    <View style={styles.cartPreviewContent}>
                        <Text style={styles.cartPreviewText}>
                            {getCartItemCount()} items • ${getCartTotal().toFixed(2)}
                        </Text>
                        <Text style={styles.cartPreviewAction}>View Cart</Text>
                    </View>
                </TouchableOpacity>
            )}

            {/* Cart Modal */}
            <Modal
                visible={cartVisible}
                animationType="slide"
                transparent={true}
                onRequestClose={() => setCartVisible(false)}
            >
                <View style={styles.modalContainer}>
                    <View style={styles.cartModal}>
                        <View style={styles.cartHeader}>
                            <Text style={styles.cartTitle}>Your Order</Text>
                            <TouchableOpacity onPress={() => setCartVisible(false)}>
                                <Ionicons name="close" size={24} color="#2c3e50" />
                            </TouchableOpacity>
                        </View>
                        <FlatList
                            data={cart}
                            renderItem={renderCartItem}
                            keyExtractor={(item, index) => item.id ? item.id.toString() : index.toString()}
                            style={styles.cartList}
                        />

                        <View style={styles.cartFooter}>
                            <Text style={styles.cartTotal}>
                                Total: ${getCartTotal().toFixed(2)}
                            </Text>
                            <TouchableOpacity 
                                style={styles.checkoutButton}
                                onPress={() => {
                                    setCartVisible(false);
                                    navigation.navigate('FoodCheckout', { 
                                        cart, 
                                        provider,
                                        total: getCartTotal()
                                    });
                                }}
                            >
                                <Text style={styles.checkoutButtonText}>Proceed to Checkout</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f9f9f9'
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f9f9f9'
    },
    loadingText: {
        marginTop: 10,
        fontSize: 16,
        color: '#7f8c8d'
    },
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f9f9f9'
    },
    errorText: {
        fontSize: 18,
        color: '#e74c3c',
        marginBottom: 20
    },
    backButton: {
        backgroundColor: '#3498db',
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 5
    },
    backButtonText: {
        color: 'white',
        fontSize: 16
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 12,
        backgroundColor: 'white',
        borderBottomWidth: 1,
        borderBottomColor: '#ecf0f1'
    },
    headerButton: {
        padding: 8
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#2c3e50'
    },
    cartButton: {
        padding: 8,
        position: 'relative'
    },
    cartBadge: {
        position: 'absolute',
        top: 0,
        right: 0,
        backgroundColor: '#e74c3c',
        borderRadius: 10,
        minWidth: 20,
        height: 20,
        justifyContent: 'center',
        alignItems: 'center'
    },
    cartBadgeText: {
        color: 'white',
        fontSize: 12,
        fontWeight: 'bold'
    },
    content: {
        flex: 1
    },
    restaurantHeader: {
        padding: 20,
        flexDirection: 'row'
    },
    restaurantImage: {
        width: 80,
        height: 80,
        borderRadius: 40,
        borderWidth: 3,
        borderColor: 'white'
    },
    restaurantInfo: {
        flex: 1,
        marginLeft: 16
    },
    restaurantName: {
        fontSize: 24,
        fontWeight: 'bold',
        color: 'white',
        marginBottom: 4
    },
    restaurantCuisine: {
        fontSize: 16,
        color: 'white',
        opacity: 0.9,
        marginBottom: 8
    },
    restaurantMeta: {
        flexDirection: 'row',
        marginBottom: 8
    },
    rating: {
        color: 'white',
        marginRight: 12,
        fontSize: 14
    },
    deliveryTime: {
        color: 'white',
        marginRight: 12,
        fontSize: 14
    },
    distance: {
        color: 'white',
        fontSize: 14
    },
    restaurantAddress: {
        color: 'white',
        opacity: 0.8,
        fontSize: 14
    },
    categoryFilter: {
        paddingVertical: 16,
        paddingHorizontal: 16
    },
    categoryButton: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        backgroundColor: 'white',
        marginRight: 8,
        borderWidth: 1,
        borderColor: '#ecf0f1'
    },
    categoryButtonActive: {
        backgroundColor: '#3498db',
        borderColor: '#3498db'
    },
    categoryButtonText: {
        fontSize: 14,
        color: '#7f8c8d'
    },
    categoryButtonTextActive: {
        color: 'white',
        fontWeight: '600'
    },
    menuSection: {
        paddingHorizontal: 16,
        paddingBottom: 100
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#2c3e50',
        marginBottom: 16
    },
    menuItem: {
        backgroundColor: 'white',
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        flexDirection: 'row',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3
    },
    menuItemImage: {
        width: 80,
        height: 80,
        borderRadius: 8
    },
    menuItemContent: {
        flex: 1,
        marginLeft: 12
    },
    menuItemName: {
        fontSize: 16,
        fontWeight: '600',
        color: '#2c3e50',
        marginBottom: 4
    },
    menuItemDescription: {
        fontSize: 14,
        color: '#7f8c8d',
        marginBottom: 8
    },
    menuItemFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center'
    },
    menuItemPrice: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#2ecc71'
    },
    addToCartButton: {
        backgroundColor: '#3498db',
        width: 32,
        height: 32,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center'
    },
    dietaryInfo: {
        flexDirection: 'row',
        marginTop: 4
    },
    dietaryTag: {
        fontSize: 12,
        marginRight: 8
    },
    cartPreview: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: '#3498db',
        padding: 16
    },
    cartPreviewContent: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center'
    },
    cartPreviewText: {
        color: 'white',
        fontSize: 16,
        fontWeight: '600'
    },
    cartPreviewAction: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold'
    },
    modalContainer: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'flex-end'
    },
    cartModal: {
        backgroundColor: 'white',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        maxHeight: '80%'
    },
    cartHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#ecf0f1'
    },
    cartTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#2c3e50'
    },
    cartList: {
        maxHeight: 300
    },
    cartItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#ecf0f1'
    },
    cartItemInfo: {
        flex: 1
    },
    cartItemName: {
        fontSize: 16,
        fontWeight: '600',
        color: '#2c3e50'
    },
    cartItemPrice: {
        fontSize: 14,
        color: '#2ecc71',
        marginTop: 4
    },
    quantityControls: {
        flexDirection: 'row',
        alignItems: 'center'
    },
    quantityButton: {
        backgroundColor: '#ecf0f1',
        width: 32,
        height: 32,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center'
    },
    quantityButtonText: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#2c3e50'
    },
    quantity: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#2c3e50',
        marginHorizontal: 16
    },
    cartFooter: {
        padding: 16,
        borderTopWidth: 1,
        borderTopColor: '#ecf0f1'
    },
    cartTotal: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#2c3e50',
        textAlign: 'center',
        marginBottom: 16
    },
    checkoutButton: {
        backgroundColor: '#2ecc71',
        padding: 16,
        borderRadius: 8,
        alignItems: 'center'
    },
    checkoutButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold'
    }
});

export default FoodProviderDetailScreen;
