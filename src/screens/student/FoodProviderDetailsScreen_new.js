import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    ScrollView,
    StyleSheet,
    TouchableOpacity,
    Image,
    ActivityIndicator,
    Alert,
    FlatList,
    Modal,
    Dimensions
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { studentApiService } from '../../services/studentApiService_new';

const { width } = Dimensions.get('window');

const FoodProviderDetailsScreen = ({ navigation, route }) => {
    const { providerId, provider: initialProvider } = route.params;
    const [provider, setProvider] = useState(initialProvider || null);
    const [menu, setMenu] = useState([]);
    const [loading, setLoading] = useState(!initialProvider);
    const [menuLoading, setMenuLoading] = useState(true);
    const [cart, setCart] = useState([]);
    const [cartVisible, setCartVisible] = useState(false);
    const [activeCategory, setActiveCategory] = useState('all');
    const [categories, setCategories] = useState(['all']);

    useEffect(() => {
        if (!initialProvider) {
            loadProviderDetails();
        }
        loadMenu();
    }, [providerId]);

    useEffect(() => {
        // Extract unique categories from menu
        if (menu.length > 0) {
            const uniqueCategories = ['all', ...new Set(menu.map(item => item.category).filter(Boolean))];
            setCategories(uniqueCategories);
        }
    }, [menu]);

    const loadProviderDetails = async () => {
        try {
            setLoading(true);
            const data = await studentApiService.getFoodProviderDetails(providerId);
            setProvider(data);
        } catch (error) {
            console.error('Error loading provider details:', error);
            Alert.alert('Error', 'Failed to load restaurant details');
            navigation.goBack();
        } finally {
            setLoading(false);
        }
    };

    const loadMenu = async () => {
        try {
            setMenuLoading(true);
            const menuData = await studentApiService.getFoodProviderMenu(providerId);
            setMenu(menuData);
        } catch (error) {
            console.error('Error loading menu:', error);
            // Create sample menu if API fails
            setMenu([
                {
                    _id: '1',
                    name: 'Chicken Biryani',
                    description: 'Delicious aromatic chicken biryani with basmati rice',
                    price: 450,
                    category: 'Main Course',
                    image: 'https://via.placeholder.com/300x200?text=Chicken+Biryani',
                    available: true
                },
                {
                    _id: '2',
                    name: 'Beef Burger',
                    description: 'Juicy beef burger with fresh vegetables',
                    price: 350,
                    category: 'Fast Food',
                    image: 'https://via.placeholder.com/300x200?text=Beef+Burger',
                    available: true
                },
                {
                    _id: '3',
                    name: 'Chicken Karahi',
                    description: 'Traditional Pakistani chicken karahi',
                    price: 650,
                    category: 'Main Course',
                    image: 'https://via.placeholder.com/300x200?text=Chicken+Karahi',
                    available: true
                }
            ]);
        } finally {
            setMenuLoading(false);
        }
    };

    const addToCart = (item) => {
        const existingItem = cart.find(cartItem => cartItem._id === item._id);
        if (existingItem) {
            setCart(cart.map(cartItem => 
                cartItem._id === item._id 
                    ? { ...cartItem, quantity: cartItem.quantity + 1 }
                    : cartItem
            ));
        } else {
            setCart([...cart, { ...item, quantity: 1 }]);
        }
    };

    const removeFromCart = (itemId) => {
        const existingItem = cart.find(cartItem => cartItem._id === itemId);
        if (existingItem && existingItem.quantity > 1) {
            setCart(cart.map(cartItem => 
                cartItem._id === itemId 
                    ? { ...cartItem, quantity: cartItem.quantity - 1 }
                    : cartItem
            ));
        } else {
            setCart(cart.filter(cartItem => cartItem._id !== itemId));
        }
    };

    const getCartItemQuantity = (itemId) => {
        const item = cart.find(cartItem => cartItem._id === itemId);
        return item ? item.quantity : 0;
    };

    const getTotalPrice = () => {
        return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
    };

    const proceedToCheckout = () => {
        if (cart.length === 0) {
            Alert.alert('Empty Cart', 'Please add items to cart before proceeding');
            return;
        }

        navigation.navigate('FoodOrderCheckout', {
            cart,
            provider,
            totalAmount: getTotalPrice()
        });
    };

    const filteredMenu = activeCategory === 'all' 
        ? menu 
        : menu.filter(item => item.category === activeCategory);

    const renderProviderHeader = () => (
        <View style={styles.providerHeader}>
            <Image
                source={{ 
                    uri: provider?.image || provider?.images?.[0] || 'https://via.placeholder.com/400x200?text=Restaurant'
                }}
                style={styles.providerImage}
                resizeMode="cover"
            />
            
            <View style={styles.providerOverlay}>
                <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
                    <Ionicons name="arrow-back" size={24} color="white" />
                </TouchableOpacity>
                
                <TouchableOpacity style={styles.shareButton}>
                    <Ionicons name="share-outline" size={24} color="white" />
                </TouchableOpacity>
            </View>
            
            <View style={styles.providerInfo}>
                <Text style={styles.providerName}>{provider?.name || 'Restaurant'}</Text>
                <View style={styles.providerMeta}>
                    <View style={styles.ratingContainer}>
                        <Ionicons name="star" size={16} color="#ffc107" />
                        <Text style={styles.rating}>
                            {provider?.rating?.toFixed(1) || '4.0'}
                        </Text>
                    </View>
                    
                    <View style={styles.cuisineContainer}>
                        <Text style={styles.cuisine}>{provider?.cuisine || 'Various Cuisines'}</Text>
                    </View>
                </View>
                
                <View style={styles.providerDetails}>
                    <View style={styles.detailItem}>
                        <Ionicons name="location" size={14} color="#6c757d" />
                        <Text style={styles.detailText}>
                            {provider?.location || provider?.address || 'Location'}
                        </Text>
                    </View>
                    
                    <View style={styles.detailItem}>
                        <Ionicons name="time" size={14} color="#6c757d" />
                        <Text style={styles.detailText}>
                            {provider?.deliveryTime || '20-30'} min delivery
                        </Text>
                    </View>
                    
                    <View style={styles.detailItem}>
                        <Ionicons name="pricetag" size={14} color="#6c757d" />
                        <Text style={styles.detailText}>
                            PKR {provider?.minOrder || '200'} min order
                        </Text>
                    </View>
                </View>
            </View>
        </View>
    );

    const renderCategories = () => (
        <View style={styles.categoriesSection}>
            <ScrollView 
                horizontal 
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.categoriesContainer}
            >
                {categories.map(category => (
                    <TouchableOpacity
                        key={category}
                        style={[
                            styles.categoryChip,
                            activeCategory === category && styles.activeCategoryChip
                        ]}
                        onPress={() => setActiveCategory(category)}
                    >
                        <Text style={[
                            styles.categoryText,
                            activeCategory === category && styles.activeCategoryText
                        ]}>
                            {category === 'all' ? 'All Items' : category}
                        </Text>
                    </TouchableOpacity>
                ))}
            </ScrollView>
        </View>
    );

    const renderMenuItem = ({ item }) => {
        const quantity = getCartItemQuantity(item._id);
        
        return (
            <View style={styles.menuItem}>
                <Image
                    source={{ 
                        uri: item.image || 'https://via.placeholder.com/120x120?text=Food'
                    }}
                    style={styles.menuItemImage}
                    resizeMode="cover"
                />
                
                <View style={styles.menuItemInfo}>
                    <Text style={styles.menuItemName}>{item.name}</Text>
                    
                    {item.description && (
                        <Text style={styles.menuItemDescription} numberOfLines={2}>
                            {item.description}
                        </Text>
                    )}
                    
                    <View style={styles.menuItemFooter}>
                        <Text style={styles.menuItemPrice}>
                            PKR {item.price?.toLocaleString() || 'N/A'}
                        </Text>
                        
                        {item.available !== false ? (
                            <View style={styles.quantityControls}>
                                {quantity > 0 && (
                                    <TouchableOpacity 
                                        style={styles.quantityButton}
                                        onPress={() => removeFromCart(item._id)}
                                    >
                                        <Ionicons name="remove" size={16} color="#007bff" />
                                    </TouchableOpacity>
                                )}
                                
                                {quantity > 0 && (
                                    <Text style={styles.quantityText}>{quantity}</Text>
                                )}
                                
                                <TouchableOpacity 
                                    style={styles.quantityButton}
                                    onPress={() => addToCart(item)}
                                >
                                    <Ionicons name="add" size={16} color="#007bff" />
                                </TouchableOpacity>
                            </View>
                        ) : (
                            <Text style={styles.unavailableText}>Unavailable</Text>
                        )}
                    </View>
                </View>
            </View>
        );
    };

    const renderCart = () => (
        <Modal
            visible={cartVisible}
            animationType="slide"
            onRequestClose={() => setCartVisible(false)}
        >
            <SafeAreaView style={styles.cartModal}>
                <View style={styles.cartHeader}>
                    <Text style={styles.cartTitle}>Your Order</Text>
                    <TouchableOpacity onPress={() => setCartVisible(false)}>
                        <Ionicons name="close" size={24} color="#333" />
                    </TouchableOpacity>
                </View>
                
                <FlatList
                    data={cart}
                    keyExtractor={(item) => item._id}
                    renderItem={({ item }) => (
                        <View style={styles.cartItem}>
                            <Image
                                source={{ uri: item.image }}
                                style={styles.cartItemImage}
                                resizeMode="cover"
                            />
                            
                            <View style={styles.cartItemInfo}>
                                <Text style={styles.cartItemName}>{item.name}</Text>
                                <Text style={styles.cartItemPrice}>
                                    PKR {item.price} × {item.quantity}
                                </Text>
                            </View>
                            
                            <View style={styles.cartQuantityControls}>
                                <TouchableOpacity 
                                    style={styles.cartQuantityButton}
                                    onPress={() => removeFromCart(item._id)}
                                >
                                    <Ionicons name="remove" size={16} color="#007bff" />
                                </TouchableOpacity>
                                
                                <Text style={styles.cartQuantityText}>{item.quantity}</Text>
                                
                                <TouchableOpacity 
                                    style={styles.cartQuantityButton}
                                    onPress={() => addToCart(item)}
                                >
                                    <Ionicons name="add" size={16} color="#007bff" />
                                </TouchableOpacity>
                            </View>
                        </View>
                    )}
                    style={styles.cartList}
                />
                
                <View style={styles.cartFooter}>
                    <View style={styles.totalContainer}>
                        <Text style={styles.totalText}>
                            Total: PKR {getTotalPrice().toLocaleString()}
                        </Text>
                    </View>
                    
                    <TouchableOpacity 
                        style={styles.checkoutButton}
                        onPress={proceedToCheckout}
                    >
                        <Text style={styles.checkoutButtonText}>Proceed to Checkout</Text>
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        </Modal>
    );

    if (loading) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#007bff" />
                    <Text style={styles.loadingText}>Loading restaurant details...</Text>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
                {renderProviderHeader()}
                {renderCategories()}
                
                {menuLoading ? (
                    <View style={styles.menuLoadingContainer}>
                        <ActivityIndicator size="large" color="#007bff" />
                        <Text style={styles.loadingText}>Loading menu...</Text>
                    </View>
                ) : (
                    <FlatList
                        data={filteredMenu}
                        renderItem={renderMenuItem}
                        keyExtractor={(item) => item._id || item.id || Math.random().toString()}
                        scrollEnabled={false}
                        style={styles.menuList}
                    />
                )}
                
                <View style={styles.bottomSpacing} />
            </ScrollView>
            
            {/* Floating Cart Button */}
            {cart.length > 0 && (
                <TouchableOpacity 
                    style={styles.floatingCartButton}
                    onPress={() => setCartVisible(true)}
                >
                    <View style={styles.cartBadge}>
                        <Text style={styles.cartBadgeText}>{cart.length}</Text>
                    </View>
                    <Ionicons name="bag" size={24} color="white" />
                    <Text style={styles.floatingCartText}>
                        View Cart • PKR {getTotalPrice().toLocaleString()}
                    </Text>
                </TouchableOpacity>
            )}
            
            {renderCart()}
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        marginTop: 10,
        fontSize: 16,
        color: '#6c757d',
    },
    scrollView: {
        flex: 1,
    },
    providerHeader: {
        position: 'relative',
    },
    providerImage: {
        width: '100%',
        height: 200,
    },
    providerOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingTop: 40,
    },
    backButton: {
        backgroundColor: 'rgba(0,0,0,0.5)',
        borderRadius: 20,
        padding: 8,
    },
    shareButton: {
        backgroundColor: 'rgba(0,0,0,0.5)',
        borderRadius: 20,
        padding: 8,
    },
    providerInfo: {
        backgroundColor: 'white',
        padding: 20,
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        marginTop: -20,
    },
    providerName: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 10,
    },
    providerMeta: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 15,
    },
    ratingContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff3cd',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
        marginRight: 15,
    },
    rating: {
        marginLeft: 4,
        fontSize: 14,
        fontWeight: '500',
        color: '#856404',
    },
    cuisineContainer: {
        backgroundColor: '#e3f2fd',
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 12,
    },
    cuisine: {
        fontSize: 14,
        color: '#1565c0',
        fontWeight: '500',
    },
    providerDetails: {
        gap: 8,
    },
    detailItem: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    detailText: {
        marginLeft: 8,
        fontSize: 14,
        color: '#6c757d',
    },
    categoriesSection: {
        backgroundColor: 'white',
        paddingVertical: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#e9ecef',
    },
    categoriesContainer: {
        paddingHorizontal: 20,
    },
    categoryChip: {
        backgroundColor: '#f8f9fa',
        borderWidth: 1,
        borderColor: '#dee2e6',
        borderRadius: 20,
        paddingHorizontal: 15,
        paddingVertical: 8,
        marginRight: 10,
    },
    activeCategoryChip: {
        backgroundColor: '#007bff',
        borderColor: '#007bff',
    },
    categoryText: {
        fontSize: 14,
        color: '#6c757d',
        fontWeight: '500',
    },
    activeCategoryText: {
        color: 'white',
    },
    menuLoadingContainer: {
        padding: 40,
        alignItems: 'center',
    },
    menuList: {
        paddingHorizontal: 20,
    },
    menuItem: {
        flexDirection: 'row',
        backgroundColor: 'white',
        borderRadius: 12,
        marginVertical: 6,
        padding: 15,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
    },
    menuItemImage: {
        width: 80,
        height: 80,
        borderRadius: 8,
    },
    menuItemInfo: {
        flex: 1,
        marginLeft: 15,
    },
    menuItemName: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 5,
    },
    menuItemDescription: {
        fontSize: 12,
        color: '#6c757d',
        lineHeight: 16,
        marginBottom: 8,
    },
    menuItemFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    menuItemPrice: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#0F5257',
    },
    quantityControls: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    quantityButton: {
        backgroundColor: '#e3f2fd',
        borderRadius: 15,
        padding: 6,
    },
    quantityText: {
        marginHorizontal: 12,
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
    },
    unavailableText: {
        fontSize: 12,
        color: '#dc3545',
        fontStyle: 'italic',
    },
    bottomSpacing: {
        height: 100,
    },
    floatingCartButton: {
        position: 'absolute',
        bottom: 20,
        left: 20,
        right: 20,
        backgroundColor: '#0F5257',
        borderRadius: 25,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 15,
        paddingHorizontal: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 6,
        elevation: 8,
    },
    cartBadge: {
        backgroundColor: '#dc3545',
        borderRadius: 10,
        minWidth: 20,
        height: 20,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 10,
    },
    cartBadgeText: {
        color: 'white',
        fontSize: 12,
        fontWeight: 'bold',
    },
    floatingCartText: {
        color: 'white',
        fontSize: 16,
        fontWeight: '500',
        marginLeft: 10,
    },
    cartModal: {
        flex: 1,
        backgroundColor: '#f8f9fa',
    },
    cartHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 20,
        backgroundColor: 'white',
        borderBottomWidth: 1,
        borderBottomColor: '#e9ecef',
    },
    cartTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#333',
    },
    cartList: {
        flex: 1,
    },
    cartItem: {
        flexDirection: 'row',
        backgroundColor: 'white',
        marginHorizontal: 20,
        marginVertical: 5,
        padding: 15,
        borderRadius: 12,
        alignItems: 'center',
    },
    cartItemImage: {
        width: 60,
        height: 60,
        borderRadius: 8,
    },
    cartItemInfo: {
        flex: 1,
        marginLeft: 15,
    },
    cartItemName: {
        fontSize: 16,
        fontWeight: '500',
        color: '#333',
        marginBottom: 5,
    },
    cartItemPrice: {
        fontSize: 14,
        color: '#6c757d',
    },
    cartQuantityControls: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    cartQuantityButton: {
        backgroundColor: '#e3f2fd',
        borderRadius: 15,
        padding: 6,
    },
    cartQuantityText: {
        marginHorizontal: 12,
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
    },
    cartFooter: {
        backgroundColor: 'white',
        padding: 20,
        borderTopWidth: 1,
        borderTopColor: '#e9ecef',
    },
    totalContainer: {
        marginBottom: 15,
    },
    totalText: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#333',
        textAlign: 'center',
    },
    checkoutButton: {
        backgroundColor: '#0F5257',
        borderRadius: 25,
        paddingVertical: 15,
        alignItems: 'center',
    },
    checkoutButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
    },
});

export default FoodProviderDetailsScreen;
