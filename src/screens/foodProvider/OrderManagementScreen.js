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
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SIZES } from '../../utils/constants';
import { fetchFromBackend } from '../../utils/networkUtils';
import authService from '../../services/authService';

const OrderManagementScreen = ({ navigation }) => {
    const [activeOrders, setActiveOrders] = useState([]);
    const [orderHistory, setOrderHistory] = useState([]);
    const [loading, setLoading] = useState(false);
    const [refreshing, setRefreshing] = useState(false);
    const [selectedTab, setSelectedTab] = useState('active');
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [orderDetailsVisible, setOrderDetailsVisible] = useState(false);
    const [statusUpdateVisible, setStatusUpdateVisible] = useState(false);
    const [rejectReason, setRejectReason] = useState('');

    const orderStatuses = [
        { id: 'pending', label: 'Pending', color: COLORS.warning },
        { id: 'accepted', label: 'Accepted', color: COLORS.primary },
        { id: 'preparing', label: 'Preparing', color: COLORS.info },
        { id: 'ready', label: 'Ready', color: COLORS.success },
        { id: 'out_for_delivery', label: 'Out for Delivery', color: COLORS.secondary },
        { id: 'delivered', label: 'Delivered', color: COLORS.success },
        { id: 'completed', label: 'Completed', color: COLORS.success },
        { id: 'cancelled', label: 'Cancelled', color: COLORS.error },
        { id: 'rejected', label: 'Rejected', color: COLORS.error },
    ];

    useEffect(() => {
        loadOrders();
        // Set up real-time updates
        const interval = setInterval(loadOrders, 15000); // Refresh every 15 seconds
        return () => clearInterval(interval);
    }, []);

    const loadOrders = async () => {
        setLoading(true);
        try {
            const user = await authService.getCurrentUser();
            const response = await fetchFromBackend(`/orders/provider/${user.id}`);
            if (response?.success) {
                const orders = response.data || [];
                setActiveOrders(orders.filter(order => 
                    ['pending', 'accepted', 'preparing', 'ready', 'out_for_delivery'].includes(order.status)
                ));
                setOrderHistory(orders.filter(order => 
                    ['delivered', 'completed', 'cancelled', 'rejected'].includes(order.status)
                ));
            }
        } catch (error) {
            console.error('Error loading orders:', error);
            Alert.alert('Error', 'Failed to load orders');
        } finally {
            setLoading(false);
        }
    };

    const handleRefresh = async () => {
        setRefreshing(true);
        await loadOrders();
        setRefreshing(false);
    };

    const updateOrderStatus = async (orderId, newStatus, reason = null) => {
        try {
            const response = await fetchFromBackend(`/api/orders/${orderId}/status`, {
                method: 'PUT',
                body: JSON.stringify({ 
                    status: newStatus,
                    reason: reason 
                })
            });

            if (response?.success) {
                Alert.alert('Success', `Order ${newStatus} successfully`);
                await loadOrders();
                setStatusUpdateVisible(false);
                setOrderDetailsVisible(false);
            }
        } catch (error) {
            console.error('Error updating order status:', error);
            Alert.alert('Error', 'Failed to update order status');
        }
    };

    const getStatusColor = (status) => {
        const statusInfo = orderStatuses.find(s => s.id === status);
        return statusInfo?.color || COLORS.gray;
    };

    const getStatusLabel = (status) => {
        const statusInfo = orderStatuses.find(s => s.id === status);
        return statusInfo?.label || status;
    };

    const formatPrice = (price) => {
        return `₨${price?.toLocaleString() || 0}`;
    };

    const renderOrderCard = (order) => (
        <TouchableOpacity
            key={order.id}
            style={styles.orderCard}
            onPress={() => {
                setSelectedOrder(order);
                setOrderDetailsVisible(true);
            }}
        >
            <View style={styles.orderHeader}>
                <View style={styles.orderInfo}>
                    <Text style={styles.orderId}>Order #{order.id}</Text>
                    <Text style={styles.customerName}>{order.customer_name || 'Unknown Customer'}</Text>
                    <Text style={styles.orderTime}>
                        {new Date(order.created_at).toLocaleTimeString()}
                    </Text>
                </View>
                <View style={styles.orderStatus}>
                    <View style={[styles.statusBadge, { backgroundColor: getStatusColor(order.status) }]}>
                        <Text style={styles.statusText}>{getStatusLabel(order.status)}</Text>
                    </View>
                    <Text style={styles.orderAmount}>{formatPrice(order.total_amount)}</Text>
                </View>
            </View>

            <View style={styles.orderItems}>
                <Text style={styles.itemsLabel}>Items ({order.items?.length || 0}):</Text>
                <Text style={styles.itemsList} numberOfLines={2}>
                    {order.items?.map(item => `${item.quantity}x ${item.name}`).join(', ') || 'No items'}
                </Text>
            </View>

            {order.status === 'pending' && (
                <View style={styles.quickActions}>
                    <TouchableOpacity
                        style={[styles.actionButton, { backgroundColor: COLORS.success }]}
                        onPress={() => updateOrderStatus(order.id, 'accepted')}
                    >
                        <Text style={styles.actionButtonText}>Accept</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.actionButton, { backgroundColor: COLORS.error }]}
                        onPress={() => {
                            setSelectedOrder(order);
                            setStatusUpdateVisible(true);
                        }}
                    >
                        <Text style={styles.actionButtonText}>Reject</Text>
                    </TouchableOpacity>
                </View>
            )}

            {order.special_instructions && (
                <View style={styles.specialInstructions}>
                    <Text style={styles.instructionsLabel}>Special Instructions:</Text>
                    <Text style={styles.instructionsText}>{order.special_instructions}</Text>
                </View>
            )}
        </TouchableOpacity>
    );

    const renderOrderDetails = () => (
        <Modal
            visible={orderDetailsVisible}
            animationType="slide"
            presentationStyle="pageSheet"
        >
            <View style={styles.modalContainer}>
                <View style={styles.modalHeader}>
                    <Text style={styles.modalTitle}>Order Details</Text>
                    <TouchableOpacity
                        onPress={() => setOrderDetailsVisible(false)}
                        style={styles.closeButton}
                    >
                        <Ionicons name="close" size={24} color={COLORS.dark} />
                    </TouchableOpacity>
                </View>

                <ScrollView style={styles.modalContent}>
                    {selectedOrder && (
                        <>
                            <View style={styles.detailSection}>
                                <Text style={styles.detailLabel}>Order Information</Text>
                                <View style={styles.detailRow}>
                                    <Text style={styles.detailKey}>Order ID:</Text>
                                    <Text style={styles.detailValue}>#{selectedOrder.id}</Text>
                                </View>
                                <View style={styles.detailRow}>
                                    <Text style={styles.detailKey}>Status:</Text>
                                    <View style={[styles.statusBadge, { backgroundColor: getStatusColor(selectedOrder.status) }]}>
                                        <Text style={styles.statusText}>{getStatusLabel(selectedOrder.status)}</Text>
                                    </View>
                                </View>
                                <View style={styles.detailRow}>
                                    <Text style={styles.detailKey}>Order Time:</Text>
                                    <Text style={styles.detailValue}>
                                        {new Date(selectedOrder.created_at).toLocaleString()}
                                    </Text>
                                </View>
                                <View style={styles.detailRow}>
                                    <Text style={styles.detailKey}>Total Amount:</Text>
                                    <Text style={[styles.detailValue, styles.priceText]}>
                                        {formatPrice(selectedOrder.total_amount)}
                                    </Text>
                                </View>
                            </View>

                            <View style={styles.detailSection}>
                                <Text style={styles.detailLabel}>Customer Information</Text>
                                <View style={styles.detailRow}>
                                    <Text style={styles.detailKey}>Name:</Text>
                                    <Text style={styles.detailValue}>{selectedOrder.customer_name || 'N/A'}</Text>
                                </View>
                                <View style={styles.detailRow}>
                                    <Text style={styles.detailKey}>Phone:</Text>
                                    <Text style={styles.detailValue}>{selectedOrder.customer_phone || 'N/A'}</Text>
                                </View>
                                <View style={styles.detailRow}>
                                    <Text style={styles.detailKey}>Address:</Text>
                                    <Text style={styles.detailValue}>{selectedOrder.delivery_address || 'N/A'}</Text>
                                </View>
                            </View>

                            <View style={styles.detailSection}>
                                <Text style={styles.detailLabel}>Order Items</Text>
                                {selectedOrder.items?.map((item, index) => (
                                    <View key={index} style={styles.itemRow}>
                                        <Text style={styles.itemName}>{item.name}</Text>
                                        <Text style={styles.itemQuantity}>x{item.quantity}</Text>
                                        <Text style={styles.itemPrice}>{formatPrice(item.price * item.quantity)}</Text>
                                    </View>
                                ))}
                            </View>

                            {selectedOrder.special_instructions && (
                                <View style={styles.detailSection}>
                                    <Text style={styles.detailLabel}>Special Instructions</Text>
                                    <Text style={styles.instructionsText}>{selectedOrder.special_instructions}</Text>
                                </View>
                            )}

                            {['accepted', 'preparing', 'ready'].includes(selectedOrder.status) && (
                                <View style={styles.statusActions}>
                                    {selectedOrder.status === 'accepted' && (
                                        <TouchableOpacity
                                            style={[styles.statusActionButton, { backgroundColor: COLORS.primary }]}
                                            onPress={() => updateOrderStatus(selectedOrder.id, 'preparing')}
                                        >
                                            <Text style={styles.statusActionText}>Start Preparing</Text>
                                        </TouchableOpacity>
                                    )}
                                    {selectedOrder.status === 'preparing' && (
                                        <TouchableOpacity
                                            style={[styles.statusActionButton, { backgroundColor: COLORS.success }]}
                                            onPress={() => updateOrderStatus(selectedOrder.id, 'ready')}
                                        >
                                            <Text style={styles.statusActionText}>Mark Ready</Text>
                                        </TouchableOpacity>
                                    )}
                                    {selectedOrder.status === 'ready' && (
                                        <TouchableOpacity
                                            style={[styles.statusActionButton, { backgroundColor: COLORS.secondary }]}
                                            onPress={() => updateOrderStatus(selectedOrder.id, 'out_for_delivery')}
                                        >
                                            <Text style={styles.statusActionText}>Out for Delivery</Text>
                                        </TouchableOpacity>
                                    )}
                                </View>
                            )}
                        </>
                    )}
                </ScrollView>
            </View>
        </Modal>
    );

    const renderRejectModal = () => (
        <Modal
            visible={statusUpdateVisible}
            animationType="slide"
            transparent={true}
        >
            <View style={styles.modalOverlay}>
                <View style={styles.rejectModal}>
                    <Text style={styles.rejectTitle}>Reject Order</Text>
                    <Text style={styles.rejectSubtitle}>Please provide a reason for rejecting this order:</Text>
                    
                    <TextInput
                        style={styles.rejectInput}
                        value={rejectReason}
                        onChangeText={setRejectReason}
                        placeholder="Enter rejection reason..."
                        multiline
                        numberOfLines={3}
                    />

                    <View style={styles.rejectActions}>
                        <TouchableOpacity
                            style={[styles.rejectButton, { backgroundColor: COLORS.gray }]}
                            onPress={() => {
                                setStatusUpdateVisible(false);
                                setRejectReason('');
                            }}
                        >
                            <Text style={styles.rejectButtonText}>Cancel</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.rejectButton, { backgroundColor: COLORS.error }]}
                            onPress={() => {
                                if (rejectReason.trim()) {
                                    updateOrderStatus(selectedOrder.id, 'rejected', rejectReason);
                                    setRejectReason('');
                                } else {
                                    Alert.alert('Error', 'Please provide a reason for rejection');
                                }
                            }}
                        >
                            <Text style={styles.rejectButtonText}>Reject Order</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity
                    onPress={() => navigation.goBack()}
                    style={styles.backButton}
                >
                    <Ionicons name="arrow-back" size={24} color={COLORS.white} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Order Management</Text>
                <TouchableOpacity
                    onPress={loadOrders}
                    style={styles.refreshButton}
                >
                    <Ionicons name="refresh" size={24} color={COLORS.white} />
                </TouchableOpacity>
            </View>

            <View style={styles.tabContainer}>
                <TouchableOpacity
                    style={[styles.tab, selectedTab === 'active' && styles.activeTab]}
                    onPress={() => setSelectedTab('active')}
                >
                    <Text style={[styles.tabText, selectedTab === 'active' && styles.activeTabText]}>
                        Active ({activeOrders.length})
                    </Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.tab, selectedTab === 'history' && styles.activeTab]}
                    onPress={() => setSelectedTab('history')}
                >
                    <Text style={[styles.tabText, selectedTab === 'history' && styles.activeTabText]}>
                        History ({orderHistory.length})
                    </Text>
                </TouchableOpacity>
            </View>

            <ScrollView
                style={styles.content}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
                }
            >
                {selectedTab === 'active' ? (
                    activeOrders.length > 0 ? (
                        activeOrders.map(renderOrderCard)
                    ) : (
                        <View style={styles.emptyState}>
                            <Ionicons name="receipt-outline" size={64} color={COLORS.gray} />
                            <Text style={styles.emptyTitle}>No Active Orders</Text>
                            <Text style={styles.emptyDescription}>
                                New orders will appear here when customers place them
                            </Text>
                        </View>
                    )
                ) : (
                    orderHistory.length > 0 ? (
                        orderHistory.map(renderOrderCard)
                    ) : (
                        <View style={styles.emptyState}>
                            <Ionicons name="time-outline" size={64} color={COLORS.gray} />
                            <Text style={styles.emptyTitle}>No Order History</Text>
                            <Text style={styles.emptyDescription}>
                                Completed orders will appear here
                            </Text>
                        </View>
                    )
                )}
            </ScrollView>

            {renderOrderDetails()}
            {renderRejectModal()}
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
    refreshButton: {
        padding: 8,
    },
    tabContainer: {
        flexDirection: 'row',
        backgroundColor: COLORS.white,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    tab: {
        flex: 1,
        paddingVertical: 15,
        alignItems: 'center',
        borderBottomWidth: 3,
        borderBottomColor: 'transparent',
    },
    activeTab: {
        borderBottomColor: COLORS.primary,
    },
    tabText: {
        fontSize: 16,
        color: COLORS.gray,
        fontWeight: '500',
    },
    activeTabText: {
        color: COLORS.primary,
        fontWeight: 'bold',
    },
    content: {
        flex: 1,
        padding: 20,
    },
    orderCard: {
        backgroundColor: COLORS.white,
        borderRadius: 12,
        padding: 15,
        marginBottom: 15,
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    orderHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 10,
    },
    orderInfo: {
        flex: 1,
    },
    orderId: {
        fontSize: 16,
        fontWeight: 'bold',
        color: COLORS.dark,
        marginBottom: 5,
    },
    customerName: {
        fontSize: 14,
        color: COLORS.gray,
        marginBottom: 2,
    },
    orderTime: {
        fontSize: 12,
        color: COLORS.gray,
    },
    orderStatus: {
        alignItems: 'flex-end',
    },
    statusBadge: {
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 15,
        marginBottom: 5,
    },
    statusText: {
        color: COLORS.white,
        fontSize: 12,
        fontWeight: 'bold',
    },
    orderAmount: {
        fontSize: 16,
        fontWeight: 'bold',
        color: COLORS.primary,
    },
    orderItems: {
        marginBottom: 10,
    },
    itemsLabel: {
        fontSize: 14,
        fontWeight: '600',
        color: COLORS.dark,
        marginBottom: 5,
    },
    itemsList: {
        fontSize: 14,
        color: COLORS.gray,
        lineHeight: 20,
    },
    quickActions: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 10,
    },
    actionButton: {
        flex: 1,
        paddingVertical: 10,
        borderRadius: 8,
        alignItems: 'center',
        marginHorizontal: 5,
    },
    actionButtonText: {
        color: COLORS.white,
        fontSize: 14,
        fontWeight: 'bold',
    },
    specialInstructions: {
        marginTop: 10,
        padding: 10,
        backgroundColor: COLORS.lightGray,
        borderRadius: 8,
    },
    instructionsLabel: {
        fontSize: 12,
        color: COLORS.gray,
        marginBottom: 5,
    },
    instructionsText: {
        fontSize: 14,
        color: COLORS.dark,
        lineHeight: 18,
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
    modalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: COLORS.white,
        flex: 1,
        textAlign: 'center',
    },
    closeButton: {
        padding: 8,
        backgroundColor: 'rgba(255,255,255,0.2)',
        borderRadius: 20,
    },
    modalContent: {
        flex: 1,
        padding: 20,
    },
    detailSection: {
        backgroundColor: COLORS.white,
        borderRadius: 12,
        padding: 15,
        marginBottom: 15,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    detailLabel: {
        fontSize: 16,
        fontWeight: 'bold',
        color: COLORS.dark,
        marginBottom: 10,
    },
    detailRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 10,
    },
    detailKey: {
        fontSize: 14,
        color: COLORS.gray,
        flex: 1,
    },
    detailValue: {
        fontSize: 14,
        color: COLORS.dark,
        fontWeight: '500',
        flex: 2,
        textAlign: 'right',
    },
    priceText: {
        color: COLORS.primary,
        fontWeight: 'bold',
    },
    itemRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 8,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.lightGray,
    },
    itemName: {
        fontSize: 14,
        color: COLORS.dark,
        flex: 2,
    },
    itemQuantity: {
        fontSize: 14,
        color: COLORS.gray,
        flex: 1,
        textAlign: 'center',
    },
    itemPrice: {
        fontSize: 14,
        color: COLORS.primary,
        fontWeight: 'bold',
        flex: 1,
        textAlign: 'right',
    },
    statusActions: {
        marginTop: 20,
    },
    statusActionButton: {
        paddingVertical: 15,
        borderRadius: 10,
        alignItems: 'center',
        marginBottom: 10,
    },
    statusActionText: {
        color: COLORS.white,
        fontSize: 16,
        fontWeight: 'bold',
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    rejectModal: {
        backgroundColor: COLORS.white,
        borderRadius: 12,
        padding: 20,
        margin: 20,
        width: '90%',
    },
    rejectTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: COLORS.dark,
        marginBottom: 10,
    },
    rejectSubtitle: {
        fontSize: 14,
        color: COLORS.gray,
        marginBottom: 15,
    },
    rejectInput: {
        borderWidth: 1,
        borderColor: COLORS.lightGray,
        borderRadius: 8,
        padding: 12,
        fontSize: 16,
        color: COLORS.dark,
        textAlignVertical: 'top',
        marginBottom: 20,
    },
    rejectActions: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    rejectButton: {
        flex: 1,
        paddingVertical: 12,
        borderRadius: 8,
        alignItems: 'center',
        marginHorizontal: 5,
    },
    rejectButtonText: {
        color: COLORS.white,
        fontSize: 16,
        fontWeight: 'bold',
    },
});

export default OrderManagementScreen;
