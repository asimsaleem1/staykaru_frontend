import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    FlatList,
    StyleSheet,
    TouchableOpacity,
    ActivityIndicator,
    Alert,
    RefreshControl,
    Image
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import studentApiService from '../../services/studentApiService';

const MyOrdersScreen = ({ navigation, route }) => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [activeTab, setActiveTab] = useState('all');

    useEffect(() => {
        loadOrders();
    }, []);

    // Handle navigation params for refreshing
    useEffect(() => {
        if (route.params?.refresh) {
            console.log('Refreshing orders due to navigation param');
            loadOrders(true);
        }
    }, [route.params?.refresh]);

    // Add focus listener to refresh data when screen comes into focus
    useEffect(() => {
        const unsubscribe = navigation.addListener('focus', () => {
            console.log('MyOrders screen focused, refreshing data');
            loadOrders(true);
        });

        return unsubscribe;
    }, [navigation]);

    const loadOrders = async (isRefresh = false) => {
        try {
            if (isRefresh) {
                setRefreshing(true);
            } else {
                setLoading(true);
            }

            // Get user's actual orders including food orders from checkout
            const response = await studentApiService.getOrderHistory();
            console.log('Orders response:', response);
            
            // Extract orders from response, handling different possible structures
            let ordersData = [];
            if (response.orders && Array.isArray(response.orders)) {
                ordersData = response.orders;
            } else if (Array.isArray(response)) {
                ordersData = response;
            } else {
                console.warn('Unexpected orders response structure:', response);
                ordersData = [];
            }
            
            // Filter to show only the current user's orders (if user context is available)
            const currentUserId = await getCurrentUserId();
            if (currentUserId) {
                ordersData = ordersData.filter(order => 
                    order.userId === currentUserId || 
                    order.user_id === currentUserId ||
                    order.customerId === currentUserId
                );
            }
            
            // Sort orders by creation date (newest first)
            ordersData.sort((a, b) => {
                const dateA = new Date(a.createdAt || a.created_at || a.orderDate);
                const dateB = new Date(b.createdAt || b.created_at || b.orderDate);
                return dateB - dateA;
            });
            
            setOrders(ordersData);
        } catch (error) {
            console.error('Error loading orders:', error);
            Alert.alert('Error', 'Failed to load orders');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const getCurrentUserId = async () => {
        try {
            const profile = await studentApiService.getProfile();
            return profile._id || profile.id || profile.userId;
        } catch (error) {
            console.warn('Could not get current user ID:', error);
            return null;
        }
    };

    const onRefresh = () => {
        loadOrders(true);
    };

    const handleCancelOrder = (orderId) => {
        Alert.alert(
            'Cancel Order',
            'Are you sure you want to cancel this order?',
            [
                { text: 'No', style: 'cancel' },
                { 
                    text: 'Yes, Cancel',
                    style: 'destructive',
                    onPress: () => cancelOrder(orderId)
                }
            ]
        );
    };

    const cancelOrder = async (orderId) => {
        try {
            setLoading(true);
            await studentApiService.cancelOrder(orderId);
            
            // Update local state
            setOrders(orders.map(order => 
                order._id === orderId 
                    ? { ...order, status: 'cancelled' }
                    : order
            ));
            
            Alert.alert('Success', 'Order cancelled successfully');
        } catch (error) {
            console.error('Error cancelling order:', error);
            Alert.alert('Error', 'Failed to cancel order');
        } finally {
            setLoading(false);
        }
    };

    const getStatusColor = (status) => {
        switch (status?.toLowerCase()) {
            case 'delivered':
                return '#28a745';
            case 'confirmed':
                return '#007bff';
            case 'preparing':
                return '#ffc107';
            case 'on_the_way':
            case 'out_for_delivery':
                return '#17a2b8';
            case 'cancelled':
                return '#dc3545';
            case 'pending':
                return '#6c757d';
            default:
                return '#6c757d';
        }
    };

    const getStatusIcon = (status) => {
        switch (status?.toLowerCase()) {
            case 'delivered':
                return 'checkmark-circle';
            case 'confirmed':
                return 'checkmark';
            case 'preparing':
                return 'restaurant';
            case 'on_the_way':
            case 'out_for_delivery':
                return 'bicycle';
            case 'cancelled':
                return 'close-circle';
            case 'pending':
                return 'time';
            default:
                return 'help-circle';
        }
    };

    const filterOrders = () => {
        switch (activeTab) {
            case 'active':
                return orders.filter(order => 
                    ['confirmed', 'preparing', 'on_the_way', 'out_for_delivery'].includes(order.status?.toLowerCase())
                );
            case 'delivered':
                return orders.filter(order => 
                    order.status?.toLowerCase() === 'delivered'
                );
            case 'cancelled':
                return orders.filter(order => 
                    order.status?.toLowerCase() === 'cancelled'
                );
            default:
                return orders;
        }
    };

    const tabs = [
        { key: 'all', label: 'All', count: orders.length },
        { 
            key: 'active', 
            label: 'Active', 
            count: orders.filter(o => ['confirmed', 'preparing', 'on_the_way', 'out_for_delivery'].includes(o.status?.toLowerCase())).length 
        },
        { 
            key: 'delivered', 
            label: 'Delivered', 
            count: orders.filter(o => o.status?.toLowerCase() === 'delivered').length 
        },
        { 
            key: 'cancelled', 
            label: 'Cancelled', 
            count: orders.filter(o => o.status?.toLowerCase() === 'cancelled').length 
        }
    ];

    const renderTabBar = () => (
        <View style={styles.tabContainer}>
            {tabs.map(tab => (
                <TouchableOpacity
                    key={tab.key}
                    style={[
                        styles.tab,
                        activeTab === tab.key && styles.activeTab
                    ]}
                    onPress={() => setActiveTab(tab.key)}
                >
                    <Text style={[
                        styles.tabText,
                        activeTab === tab.key && styles.activeTabText
                    ]}>
                        {tab.label}
                    </Text>
                    {tab.count > 0 && (
                        <View style={[
                            styles.tabBadge,
                            activeTab === tab.key && styles.activeTabBadge
                        ]}>
                            <Text style={[
                                styles.tabBadgeText,
                                activeTab === tab.key && styles.activeTabBadgeText
                            ]}>
                                {tab.count}
                            </Text>
                        </View>
                    )}
                </TouchableOpacity>
            ))}
        </View>
    );

    const renderOrderCard = ({ item }) => (
        <TouchableOpacity 
            style={styles.orderCard}
            onPress={() => navigation.navigate('OrderDetails', { 
                orderId: item._id,
                order: item 
            })}
        >
            <View style={styles.orderHeader}>
                <View style={styles.providerInfo}>
                    <Image
                        source={{ 
                            uri: item.provider?.image || 
                                 item.provider?.images?.[0] ||
                                 'https://via.placeholder.com/60x60?text=Restaurant'
                        }}
                        style={styles.providerImage}
                        resizeMode="cover"
                    />
                    
                    <View style={styles.providerDetails}>
                        <Text style={styles.providerName} numberOfLines={1}>
                            {item.provider?.name || item.providerName || 'Restaurant'}
                        </Text>
                        <View style={styles.orderMeta}>
                            <Text style={styles.orderId}>
                                Order #{item._id?.slice(-6) || 'N/A'}
                            </Text>
                            <Text style={styles.orderDate}>
                                {item.createdAt ? new Date(item.createdAt).toLocaleDateString() : 'N/A'}
                            </Text>
                        </View>
                    </View>
                </View>

                <View style={[
                    styles.statusBadge,
                    { backgroundColor: getStatusColor(item.status) }
                ]}>
                    <Ionicons 
                        name={getStatusIcon(item.status)} 
                        size={12} 
                        color="white" 
                    />
                    <Text style={styles.statusText}>
                        {item.status?.replace('_', ' ') || 'Pending'}
                    </Text>
                </View>
            </View>

            <View style={styles.orderItems}>
                <Text style={styles.itemsTitle}>Items ({item.items?.length || 0}):</Text>
                {(item.items || []).slice(0, 3).map((orderItem, index) => (
                    <View key={index} style={styles.orderItem}>
                        <Text style={styles.itemName} numberOfLines={1}>
                            {orderItem.name} × {orderItem.quantity}
                        </Text>
                        <Text style={styles.itemPrice}>
                            PKR {(orderItem.price * orderItem.quantity).toLocaleString()}
                        </Text>
                    </View>
                ))}
                {(item.items?.length || 0) > 3 && (
                    <Text style={styles.moreItems}>
                        +{(item.items.length - 3)} more items
                    </Text>
                )}
            </View>

            <View style={styles.orderFooter}>
                <View style={styles.deliveryInfo}>
                    <View style={styles.deliveryRow}>
                        <Ionicons name="location" size={12} color="#6c757d" />
                        <Text style={styles.deliveryAddress} numberOfLines={1}>
                            {item.deliveryAddress || 'Delivery address'}
                        </Text>
                    </View>
                    {item.estimatedDelivery && (
                        <View style={styles.deliveryRow}>
                            <Ionicons name="time" size={12} color="#6c757d" />
                            <Text style={styles.deliveryTime}>
                                ETA: {item.estimatedDelivery}
                            </Text>
                        </View>
                    )}
                </View>

                <View style={styles.totalContainer}>
                    <Text style={styles.totalAmount}>
                        PKR {item.totalAmount?.toLocaleString() || 'N/A'}
                    </Text>
                </View>
            </View>

            <View style={styles.orderActions}>
                <TouchableOpacity 
                    style={styles.actionButton}
                    onPress={() => navigation.navigate('Chat', {
                        recipientId: item.provider?._id,
                        recipientName: item.provider?.name || 'Restaurant'
                    })}
                >
                    <Ionicons name="chatbubble-outline" size={16} color="#007bff" />
                    <Text style={styles.actionButtonText}>Contact</Text>
                </TouchableOpacity>

                {['confirmed', 'preparing'].includes(item.status?.toLowerCase()) && (
                    <TouchableOpacity 
                        style={[styles.actionButton, styles.cancelButton]}
                        onPress={() => handleCancelOrder(item._id)}
                    >
                        <Ionicons name="close-outline" size={16} color="#dc3545" />
                        <Text style={[styles.actionButtonText, { color: '#dc3545' }]}>
                            Cancel
                        </Text>
                    </TouchableOpacity>
                )}

                {item.status?.toLowerCase() === 'delivered' && (
                    <TouchableOpacity 
                        style={styles.actionButton}
                        onPress={() => navigation.navigate('WriteReview', {
                            itemId: item.provider?._id,
                            itemType: 'food_provider',
                            itemName: item.provider?.name
                        })}
                    >
                        <Ionicons name="star-outline" size={16} color="#ffc107" />
                        <Text style={[styles.actionButtonText, { color: '#ffc107' }]}>
                            Review
                        </Text>
                    </TouchableOpacity>
                )}

                <TouchableOpacity 
                    style={styles.actionButton}
                    onPress={() => navigation.navigate('OrderDetails', { 
                        orderId: item._id,
                        order: item 
                    })}
                >
                    <Ionicons name="eye-outline" size={16} color="#28a745" />
                    <Text style={[styles.actionButtonText, { color: '#28a745' }]}>
                        Details
                    </Text>
                </TouchableOpacity>
            </View>
        </TouchableOpacity>
    );

    const renderEmptyState = () => (
        <View style={styles.emptyContainer}>
            <Ionicons name="restaurant" size={80} color="#e9ecef" />
            <Text style={styles.emptyTitle}>No orders found</Text>
            <Text style={styles.emptySubtitle}>
                {activeTab === 'all' 
                    ? "You haven't placed any orders yet"
                    : `No ${activeTab} orders found`}
            </Text>
            <TouchableOpacity 
                style={styles.browseButton}
                onPress={() => navigation.navigate('FoodProviders')}
            >
                <Text style={styles.browseButtonText}>Browse Restaurants</Text>
            </TouchableOpacity>
        </View>
    );

    if (loading && orders.length === 0) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#007bff" />
                    <Text style={styles.loadingText}>Loading your orders...</Text>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Ionicons name="arrow-back" size={24} color="#333" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>My Orders</Text>
                <TouchableOpacity onPress={onRefresh}>
                    <Ionicons name="refresh" size={24} color="#007bff" />
                </TouchableOpacity>
            </View>

            {renderTabBar()}

            <FlatList
                data={filterOrders()}
                renderItem={renderOrderCard}
                keyExtractor={(item) => item._id || item.id || Math.random().toString()}
                ListEmptyComponent={renderEmptyState}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                        colors={['#007bff']}
                    />
                }
                showsVerticalScrollIndicator={false}
                contentContainerStyle={[
                    styles.listContainer,
                    filterOrders().length === 0 && styles.emptyListContainer
                ]}
            />
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8f9fa',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingVertical: 15,
        backgroundColor: 'white',
        borderBottomWidth: 1,
        borderBottomColor: '#e9ecef',
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#333',
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
    tabContainer: {
        flexDirection: 'row',
        backgroundColor: 'white',
        borderBottomWidth: 1,
        borderBottomColor: '#e9ecef',
    },
    tab: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 15,
        borderBottomWidth: 3,
        borderBottomColor: 'transparent',
    },
    activeTab: {
        borderBottomColor: '#007bff',
    },
    tabText: {
        fontSize: 14,
        fontWeight: '500',
        color: '#6c757d',
    },
    activeTabText: {
        color: '#007bff',
    },
    tabBadge: {
        backgroundColor: '#e9ecef',
        borderRadius: 10,
        minWidth: 20,
        height: 20,
        alignItems: 'center',
        justifyContent: 'center',
        marginLeft: 5,
    },
    activeTabBadge: {
        backgroundColor: '#007bff',
    },
    tabBadgeText: {
        fontSize: 12,
        fontWeight: 'bold',
        color: '#6c757d',
    },
    activeTabBadgeText: {
        color: 'white',
    },
    listContainer: {
        padding: 15,
    },
    emptyListContainer: {
        flex: 1,
    },
    orderCard: {
        backgroundColor: 'white',
        borderRadius: 12,
        marginBottom: 15,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    orderHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        padding: 15,
        paddingBottom: 10,
    },
    providerInfo: {
        flexDirection: 'row',
        flex: 1,
        marginRight: 10,
    },
    providerImage: {
        width: 50,
        height: 50,
        borderRadius: 25,
    },
    providerDetails: {
        flex: 1,
        marginLeft: 12,
    },
    providerName: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 4,
    },
    orderMeta: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    orderId: {
        fontSize: 12,
        color: '#6c757d',
        fontFamily: 'monospace',
    },
    orderDate: {
        fontSize: 12,
        color: '#6c757d',
        marginLeft: 10,
    },
    statusBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
    },
    statusText: {
        marginLeft: 4,
        fontSize: 12,
        color: 'white',
        fontWeight: '500',
        textTransform: 'capitalize',
    },
    orderItems: {
        paddingHorizontal: 15,
        paddingBottom: 10,
    },
    itemsTitle: {
        fontSize: 14,
        fontWeight: '500',
        color: '#333',
        marginBottom: 8,
    },
    orderItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 2,
    },
    itemName: {
        fontSize: 12,
        color: '#6c757d',
        flex: 1,
        marginRight: 10,
    },
    itemPrice: {
        fontSize: 12,
        color: '#333',
        fontWeight: '500',
    },
    moreItems: {
        fontSize: 12,
        color: '#007bff',
        fontStyle: 'italic',
        marginTop: 4,
    },
    orderFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 15,
        paddingBottom: 10,
    },
    deliveryInfo: {
        flex: 1,
    },
    deliveryRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 4,
    },
    deliveryAddress: {
        marginLeft: 6,
        fontSize: 12,
        color: '#6c757d',
        flex: 1,
    },
    deliveryTime: {
        marginLeft: 6,
        fontSize: 12,
        color: '#007bff',
        fontWeight: '500',
    },
    totalContainer: {
        alignItems: 'flex-end',
    },
    totalAmount: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#0F5257',
    },
    orderActions: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'center',
        paddingHorizontal: 15,
        paddingVertical: 12,
        borderTopWidth: 1,
        borderTopColor: '#f1f3f4',
    },
    actionButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 15,
        backgroundColor: '#f8f9fa',
    },
    cancelButton: {
        borderWidth: 1,
        borderColor: '#dc3545',
        backgroundColor: '#fff5f5',
    },
    actionButtonText: {
        marginLeft: 4,
        fontSize: 11,
        color: '#007bff',
        fontWeight: '500',
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 40,
    },
    emptyTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#333',
        marginTop: 20,
        marginBottom: 10,
    },
    emptySubtitle: {
        fontSize: 14,
        color: '#6c757d',
        textAlign: 'center',
        lineHeight: 20,
        marginBottom: 30,
    },
    browseButton: {
        backgroundColor: '#007bff',
        paddingHorizontal: 25,
        paddingVertical: 12,
        borderRadius: 20,
    },
    browseButtonText: {
        color: 'white',
        fontWeight: '500',
    },
});

export default MyOrdersScreen;
