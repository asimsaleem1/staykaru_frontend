import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    Image,
    Alert,
    SafeAreaView,
    ActivityIndicator,
    RefreshControl
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import authService from '../../services/authService';
import { testBackendConnection, getMockData } from '../../utils/networkUtils';

const MyOrdersScreen = ({ navigation }) => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [activeTab, setActiveTab] = useState('active'); // active, past

    useEffect(() => {
        loadOrders();
    }, [activeTab]);    const loadOrders = async () => {
        try {
            setLoading(true);
            
            // Test backend connection first
            const connectionTest = await testBackendConnection();
            
            let allOrders = [];
            
            if (connectionTest.success) {
                // Backend is available - fetch real data
                const response = await authService.makeAuthenticatedRequest('/orders/my-orders');
                allOrders = response.data || [];
            } else {
                console.log('Backend not available, using mock orders data');
                // Backend not available - use mock data
                allOrders = getMockData('orders');
            }
            
            // Filter orders based on active tab
            const filteredOrders = allOrders.filter(order => {
                if (activeTab === 'active') {
                    return ['confirmed', 'preparing', 'ready', 'out_for_delivery'].includes(order.status);
                } else {
                    return ['delivered', 'cancelled'].includes(order.status);
                }
            });
            
            setOrders(filteredOrders);
        } catch (error) {
            console.error('Load orders error:', error);
            // Fallback to mock data on error
            console.log('Error loading orders, using mock data as fallback');
            const mockOrders = getMockData('orders');
            const filteredOrders = mockOrders.filter(order => {
                if (activeTab === 'active') {
                    return ['confirmed', 'preparing', 'ready', 'out_for_delivery'].includes(order.status);
                } else {
                    return ['delivered', 'cancelled'].includes(order.status);
                }
            });
            setOrders(filteredOrders);
        } finally {
            setLoading(false);
        }
    };

    const handleRefresh = async () => {
        setRefreshing(true);
        await loadOrders();
        setRefreshing(false);
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'confirmed':
                return '#3498db';
            case 'preparing':
                return '#f39c12';
            case 'ready':
                return '#9b59b6';
            case 'out_for_delivery':
                return '#e67e22';
            case 'delivered':
                return '#2ecc71';
            case 'cancelled':
                return '#e74c3c';
            default:
                return '#95a5a6';
        }
    };

    const getStatusText = (status) => {
        switch (status) {
            case 'confirmed':
                return 'Confirmed';
            case 'preparing':
                return 'Preparing';
            case 'ready':
                return 'Ready';
            case 'out_for_delivery':
                return 'Out for Delivery';
            case 'delivered':
                return 'Delivered';
            case 'cancelled':
                return 'Cancelled';
            default:
                return 'Unknown';
        }
    };

    const canTrackOrder = (status) => {
        return ['confirmed', 'preparing', 'ready', 'out_for_delivery'].includes(status);
    };

    const canReorder = (status) => {
        return ['delivered', 'cancelled'].includes(status);
    };

    const handleReorder = async (order) => {
        // Navigate to restaurant with pre-filled cart
        const cartItems = order.items.map(item => ({
            id: item.menu_item.id + '_' + Date.now(),
            menuItem: item.menu_item,
            quantity: item.quantity,
            customizations: [],
            totalPrice: item.menu_item.price * item.quantity
        }));

        navigation.navigate('FoodProviderDetail', {
            providerId: order.food_provider.id,
            prefilledCart: cartItems
        });
    };

    const renderOrderItem = ({ item: order }) => (
        <TouchableOpacity 
            style={styles.orderCard}
            onPress={() => {
                if (canTrackOrder(order.status)) {
                    navigation.navigate('OrderTracking', { orderId: order.id });
                }
            }}
        >
            <View style={styles.orderHeader}>
                <View style={styles.restaurantInfo}>
                    <Image 
                        source={{ uri: order.food_provider.image || 'https://via.placeholder.com/50x50' }} 
                        style={styles.restaurantImage} 
                    />
                    <View style={styles.restaurantDetails}>
                        <Text style={styles.restaurantName}>{order?.food_provider?.name || 'Unknown Provider'}</Text>
                        <Text style={styles.orderDate}>
                            {new Date(order.created_at).toLocaleDateString()} • 
                            {new Date(order.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </Text>
                    </View>
                </View>
                <View style={[styles.statusBadge, { backgroundColor: getStatusColor(order.status) }]}>
                    <Text style={styles.statusText}>{getStatusText(order.status)}</Text>
                </View>
            </View>

            <View style={styles.orderContent}>
                <Text style={styles.orderNumber}>Order #{order.id}</Text>
                <View style={styles.orderItems}>
                    {order.items.slice(0, 2).map((item, index) => (
                        <Text key={index} style={styles.orderItem}>
                            {item?.quantity || 0}x {item?.menu_item?.name || 'Unknown Item'}
                        </Text>
                    ))}
                    {order.items.length > 2 && (
                        <Text style={styles.moreItems}>
                            +{order.items.length - 2} more items
                        </Text>
                    )}
                </View>
                <Text style={styles.orderTotal}>${order.total_amount.toFixed(2)}</Text>
            </View>

            <View style={styles.orderActions}>
                {canTrackOrder(order.status) && (
                    <TouchableOpacity 
                        style={styles.trackButton}
                        onPress={() => navigation.navigate('OrderTracking', { orderId: order.id })}
                    >
                        <Ionicons name="location" size={16} color="#3498db" />
                        <Text style={styles.trackButtonText}>Track Order</Text>
                    </TouchableOpacity>
                )}
                
                {canReorder(order.status) && (
                    <TouchableOpacity 
                        style={styles.reorderButton}
                        onPress={() => handleReorder(order)}
                    >
                        <Ionicons name="refresh" size={16} color="#2ecc71" />
                        <Text style={styles.reorderButtonText}>Reorder</Text>
                    </TouchableOpacity>
                )}

                {order.status === 'delivered' && !order.rating && (
                    <TouchableOpacity style={styles.rateButton}>
                        <Ionicons name="star" size={16} color="#f39c12" />
                        <Text style={styles.rateButtonText}>Rate</Text>
                    </TouchableOpacity>
                )}
            </View>
        </TouchableOpacity>
    );

    const renderEmptyState = () => (
        <View style={styles.emptyContainer}>
            <Ionicons 
                name={activeTab === 'active' ? 'restaurant' : 'time'} 
                size={64} 
                color="#bdc3c7" 
            />
            <Text style={styles.emptyTitle}>
                {activeTab === 'active' ? 'No Active Orders' : 'No Past Orders'}
            </Text>
            <Text style={styles.emptyDescription}>
                {activeTab === 'active' 
                    ? 'You don\'t have any active orders right now.' 
                    : 'You haven\'t made any orders yet.'
                }
            </Text>
            {activeTab === 'past' && (
                <TouchableOpacity 
                    style={styles.exploreButton}
                    onPress={() => navigation.navigate('FoodProvidersList')}
                >
                    <Text style={styles.exploreButtonText}>Explore Restaurants</Text>
                </TouchableOpacity>
            )}
        </View>
    );

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
                <Text style={styles.headerTitle}>My Orders</Text>
                <View style={styles.headerButton} />
            </View>

            {/* Tab Navigation */}
            <View style={styles.tabContainer}>
                <TouchableOpacity
                    style={[styles.tab, activeTab === 'active' && styles.activeTab]}
                    onPress={() => setActiveTab('active')}
                >
                    <Text style={[styles.tabText, activeTab === 'active' && styles.activeTabText]}>
                        Active Orders
                    </Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.tab, activeTab === 'past' && styles.activeTab]}
                    onPress={() => setActiveTab('past')}
                >
                    <Text style={[styles.tabText, activeTab === 'past' && styles.activeTabText]}>
                        Past Orders
                    </Text>
                </TouchableOpacity>
            </View>

            {/* Orders List */}
            {loading ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#3498db" />
                    <Text style={styles.loadingText}>Loading orders...</Text>
                </View>
            ) : (                <FlatList
                    data={orders}
                    renderItem={renderOrderItem}
                    keyExtractor={(item, index) => item.id ? item.id.toString() : index.toString()}
                    contentContainerStyle={styles.listContainer}
                    showsVerticalScrollIndicator={false}
                    refreshControl={
                        <RefreshControl
                            refreshing={refreshing}
                            onRefresh={handleRefresh}
                            colors={['#3498db']}
                        />
                    }
                    ListEmptyComponent={renderEmptyState}
                />
            )}

            {/* Floating Action Button */}
            <TouchableOpacity 
                style={styles.fab}
                onPress={() => navigation.navigate('FoodProvidersList')}
            >
                <LinearGradient colors={['#2ecc71', '#27ae60']} style={styles.fabGradient}>
                    <Ionicons name="add" size={24} color="white" />
                </LinearGradient>
            </TouchableOpacity>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f9f9f9'
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
        width: 40,
        alignItems: 'center'
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#2c3e50'
    },
    tabContainer: {
        flexDirection: 'row',
        backgroundColor: 'white',
        paddingHorizontal: 16,
        paddingTop: 16
    },
    tab: {
        flex: 1,
        paddingVertical: 12,
        alignItems: 'center',
        borderBottomWidth: 2,
        borderBottomColor: 'transparent'
    },
    activeTab: {
        borderBottomColor: '#3498db'
    },
    tabText: {
        fontSize: 16,
        color: '#7f8c8d'
    },
    activeTabText: {
        color: '#3498db',
        fontWeight: '600'
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center'
    },
    loadingText: {
        marginTop: 10,
        fontSize: 16,
        color: '#7f8c8d'
    },
    listContainer: {
        paddingHorizontal: 16,
        paddingTop: 16,
        paddingBottom: 100
    },
    orderCard: {
        backgroundColor: 'white',
        borderRadius: 12,
        padding: 16,
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3
    },
    orderHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12
    },
    restaurantInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1
    },
    restaurantImage: {
        width: 50,
        height: 50,
        borderRadius: 25,
        marginRight: 12
    },
    restaurantDetails: {
        flex: 1
    },
    restaurantName: {
        fontSize: 16,
        fontWeight: '600',
        color: '#2c3e50',
        marginBottom: 4
    },
    orderDate: {
        fontSize: 14,
        color: '#7f8c8d'
    },
    statusBadge: {
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 12
    },
    statusText: {
        color: 'white',
        fontSize: 12,
        fontWeight: '600'
    },
    orderContent: {
        marginBottom: 12
    },
    orderNumber: {
        fontSize: 14,
        color: '#7f8c8d',
        marginBottom: 8
    },
    orderItems: {
        marginBottom: 8
    },
    orderItem: {
        fontSize: 14,
        color: '#2c3e50',
        marginBottom: 2
    },
    moreItems: {
        fontSize: 14,
        color: '#7f8c8d',
        fontStyle: 'italic'
    },
    orderTotal: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#2ecc71'
    },
    orderActions: {
        flexDirection: 'row',
        justifyContent: 'space-between'
    },
    trackButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#e3f2fd',
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 8
    },
    trackButtonText: {
        color: '#3498db',
        fontSize: 14,
        fontWeight: '600',
        marginLeft: 4
    },
    reorderButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#e8f5e8',
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 8
    },
    reorderButtonText: {
        color: '#2ecc71',
        fontSize: 14,
        fontWeight: '600',
        marginLeft: 4
    },
    rateButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff8e1',
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 8
    },
    rateButtonText: {
        color: '#f39c12',
        fontSize: 14,
        fontWeight: '600',
        marginLeft: 4
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 32,
        paddingTop: 80
    },
    emptyTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#2c3e50',
        marginTop: 16,
        marginBottom: 8
    },
    emptyDescription: {
        fontSize: 16,
        color: '#7f8c8d',
        textAlign: 'center',
        lineHeight: 24,
        marginBottom: 24
    },
    exploreButton: {
        backgroundColor: '#3498db',
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 8
    },
    exploreButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: '600'
    },
    fab: {
        position: 'absolute',
        bottom: 20,
        right: 20,
        borderRadius: 28,
        elevation: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 4
    },
    fabGradient: {
        width: 56,
        height: 56,
        borderRadius: 28,
        justifyContent: 'center',
        alignItems: 'center'
    }
});

export default MyOrdersScreen;
