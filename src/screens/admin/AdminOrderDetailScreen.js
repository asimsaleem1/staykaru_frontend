import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Alert,
    ActivityIndicator,
    Image,
    Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SIZES } from '../../utils/constants';
import adminApiService from '../../services/adminApiService';

const { width } = Dimensions.get('window');

const AdminOrderDetailScreen = ({ navigation, route }) => {
    const { orderId } = route.params;
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadOrderDetails();
    }, [orderId]);

    const loadOrderDetails = async () => {
        try {
            setLoading(true);
            const response = await adminApiService.getOrderDetails(orderId);
            if (response.success) {
                setOrder(response.data);
            } else {
                throw new Error(response.message);
            }
        } catch (error) {
            console.error('Error loading order details:', error);
            Alert.alert('Error', 'Failed to load order details');
            navigation.goBack();
        } finally {
            setLoading(false);
        }
    };

    const updateOrderStatus = async (status) => {
        try {
            const response = await adminApiService.updateOrderStatus(orderId, status);
            if (response.success) {
                setOrder(prev => ({ ...prev, status }));
                Alert.alert('Success', `Order ${status} successfully`);
            } else {
                throw new Error(response.message);
            }
        } catch (error) {
            console.error('Error updating order status:', error);
            Alert.alert('Error', 'Failed to update order status');
        }
    };

    const formatCurrency = (amount) => {
        return `₨${amount?.toLocaleString('en-PK') || '0'}`;
    };

    const getStatusColor = (status) => {
        switch (status?.toLowerCase()) {
            case 'confirmed': return '#2ecc71';
            case 'preparing': return '#f39c12';
            case 'ready': return '#3498db';
            case 'delivered': return '#27ae60';
            case 'cancelled': return '#e74c3c';
            default: return '#7f8c8d';
        }
    };

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={COLORS.primary} />
                <Text style={styles.loadingText}>Loading order details...</Text>
            </View>
        );
    }

    if (!order) {
        return (
            <View style={styles.errorContainer}>
                <Text style={styles.errorText}>Order not found</Text>
            </View>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity 
                    style={styles.backButton}
                    onPress={() => navigation.goBack()}
                >
                    <Ionicons name="arrow-back" size={24} color={COLORS.white} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Order Details</Text>
                <View style={styles.headerRight} />
            </View>

            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                {/* Order Info Card */}
                <View style={styles.card}>
                    <View style={styles.cardHeader}>
                        <Text style={styles.cardTitle}>Order Information</Text>
                        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(order.status) }]}>
                            <Text style={styles.statusText}>{order.status?.toUpperCase()}</Text>
                        </View>
                    </View>

                    <View style={styles.infoRow}>
                        <Text style={styles.infoLabel}>Order ID:</Text>
                        <Text style={styles.infoValue}>{order.id}</Text>
                    </View>

                    <View style={styles.infoRow}>
                        <Text style={styles.infoLabel}>Order Date:</Text>
                        <Text style={styles.infoValue}>{new Date(order.createdAt).toLocaleDateString()}</Text>
                    </View>

                    <View style={styles.infoRow}>
                        <Text style={styles.infoLabel}>Delivery Time:</Text>
                        <Text style={styles.infoValue}>{order.deliveryTime || 'ASAP'}</Text>
                    </View>

                    <View style={styles.infoRow}>
                        <Text style={styles.infoLabel}>Total Amount:</Text>
                        <Text style={[styles.infoValue, styles.amountText]}>{formatCurrency(order.totalAmount)}</Text>
                    </View>
                </View>

                {/* Customer Information */}
                <View style={styles.card}>
                    <Text style={styles.cardTitle}>Customer Information</Text>
                    
                    <View style={styles.infoRow}>
                        <Text style={styles.infoLabel}>Name:</Text>
                        <Text style={styles.infoValue}>{order.customer?.name || 'N/A'}</Text>
                    </View>

                    <View style={styles.infoRow}>
                        <Text style={styles.infoLabel}>Email:</Text>
                        <Text style={styles.infoValue}>{order.customer?.email || 'N/A'}</Text>
                    </View>

                    <View style={styles.infoRow}>
                        <Text style={styles.infoLabel}>Phone:</Text>
                        <Text style={styles.infoValue}>{order.customer?.phone || 'N/A'}</Text>
                    </View>

                    <View style={styles.infoRow}>
                        <Text style={styles.infoLabel}>Address:</Text>
                        <Text style={styles.infoValue}>{order.deliveryAddress || 'N/A'}</Text>
                    </View>
                </View>

                {/* Food Provider Information */}
                <View style={styles.card}>
                    <Text style={styles.cardTitle}>Food Provider Information</Text>
                    
                    <View style={styles.infoRow}>
                        <Text style={styles.infoLabel}>Restaurant:</Text>
                        <Text style={styles.infoValue}>{order.provider?.name || 'N/A'}</Text>
                    </View>

                    <View style={styles.infoRow}>
                        <Text style={styles.infoLabel}>Contact:</Text>
                        <Text style={styles.infoValue}>{order.provider?.phone || 'N/A'}</Text>
                    </View>

                    <View style={styles.infoRow}>
                        <Text style={styles.infoLabel}>Address:</Text>
                        <Text style={styles.infoValue}>{order.provider?.address || 'N/A'}</Text>
                    </View>
                </View>

                {/* Order Items */}
                <View style={styles.card}>
                    <Text style={styles.cardTitle}>Order Items</Text>
                    
                    {order.items?.map((item, index) => (
                        <View key={index} style={styles.orderItem}>
                            <View style={styles.itemHeader}>
                                <View style={styles.itemInfo}>
                                    <Text style={styles.itemName}>{item.name}</Text>
                                    <Text style={styles.itemPrice}>{formatCurrency(item.price)} x {item.quantity}</Text>
                                </View>
                                <Text style={styles.itemTotal}>{formatCurrency(item.price * item.quantity)}</Text>
                            </View>
                            {item.customizations && (
                                <Text style={styles.itemCustomizations}>
                                    {item.customizations}
                                </Text>
                            )}
                        </View>
                    ))}

                    {/* Order Summary */}
                    <View style={styles.orderSummary}>
                        <View style={styles.summaryRow}>
                            <Text style={styles.summaryLabel}>Subtotal:</Text>
                            <Text style={styles.summaryValue}>{formatCurrency(order.subtotal)}</Text>
                        </View>
                        
                        <View style={styles.summaryRow}>
                            <Text style={styles.summaryLabel}>Delivery Fee:</Text>
                            <Text style={styles.summaryValue}>{formatCurrency(order.deliveryFee || 0)}</Text>
                        </View>
                        
                        <View style={styles.summaryRow}>
                            <Text style={styles.summaryLabel}>Tax:</Text>
                            <Text style={styles.summaryValue}>{formatCurrency(order.tax || 0)}</Text>
                        </View>
                        
                        <View style={[styles.summaryRow, styles.totalRow]}>
                            <Text style={styles.totalLabel}>Total:</Text>
                            <Text style={styles.totalValue}>{formatCurrency(order.totalAmount)}</Text>
                        </View>
                    </View>
                </View>

                {/* Payment Information */}
                <View style={styles.card}>
                    <Text style={styles.cardTitle}>Payment Information</Text>
                    
                    <View style={styles.infoRow}>
                        <Text style={styles.infoLabel}>Payment Status:</Text>
                        <Text style={[styles.infoValue, { color: getStatusColor(order.paymentStatus) }]}>
                            {order.paymentStatus?.toUpperCase() || 'PENDING'}
                        </Text>
                    </View>

                    <View style={styles.infoRow}>
                        <Text style={styles.infoLabel}>Payment Method:</Text>
                        <Text style={styles.infoValue}>{order.paymentMethod || 'Cash on Delivery'}</Text>
                    </View>

                    <View style={styles.infoRow}>
                        <Text style={styles.infoLabel}>Transaction ID:</Text>
                        <Text style={styles.infoValue}>{order.transactionId || 'N/A'}</Text>
                    </View>
                </View>

                {/* Action Buttons */}
                {['pending', 'confirmed', 'preparing'].includes(order.status?.toLowerCase()) && (
                    <View style={styles.actionButtons}>
                        {order.status === 'pending' && (
                            <>
                                <TouchableOpacity 
                                    style={[styles.actionButton, styles.confirmButton]}
                                    onPress={() => updateOrderStatus('confirmed')}
                                >
                                    <Ionicons name="checkmark" size={20} color={COLORS.white} />
                                    <Text style={styles.actionButtonText}>Confirm</Text>
                                </TouchableOpacity>

                                <TouchableOpacity 
                                    style={[styles.actionButton, styles.cancelButton]}
                                    onPress={() => updateOrderStatus('cancelled')}
                                >
                                    <Ionicons name="close" size={20} color={COLORS.white} />
                                    <Text style={styles.actionButtonText}>Cancel</Text>
                                </TouchableOpacity>
                            </>
                        )}

                        {order.status === 'confirmed' && (
                            <TouchableOpacity 
                                style={[styles.actionButton, styles.preparingButton]}
                                onPress={() => updateOrderStatus('preparing')}
                            >
                                <Ionicons name="restaurant" size={20} color={COLORS.white} />
                                <Text style={styles.actionButtonText}>Mark as Preparing</Text>
                            </TouchableOpacity>
                        )}

                        {order.status === 'preparing' && (
                            <TouchableOpacity 
                                style={[styles.actionButton, styles.readyButton]}
                                onPress={() => updateOrderStatus('ready')}
                            >
                                <Ionicons name="checkmark-circle" size={20} color={COLORS.white} />
                                <Text style={styles.actionButtonText}>Mark as Ready</Text>
                            </TouchableOpacity>
                        )}
                    </View>
                )}
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8f9fa',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f8f9fa',
    },
    loadingText: {
        marginTop: 10,
        fontSize: 16,
        color: COLORS.textSecondary,
    },
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f8f9fa',
    },
    errorText: {
        fontSize: 18,
        color: COLORS.error,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingVertical: 15,
        backgroundColor: COLORS.primary,
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
    },
    backButton: {
        padding: 8,
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: COLORS.white,
    },
    headerRight: {
        width: 40,
    },
    content: {
        flex: 1,
        paddingHorizontal: 20,
        paddingTop: 20,
    },
    card: {
        backgroundColor: COLORS.white,
        borderRadius: 12,
        padding: 20,
        marginBottom: 16,
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 3.84,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    cardTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: COLORS.textPrimary,
    },
    statusBadge: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
    },
    statusText: {
        color: COLORS.white,
        fontSize: 12,
        fontWeight: 'bold',
    },
    infoRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 8,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    infoLabel: {
        fontSize: 14,
        color: COLORS.textSecondary,
        flex: 1,
    },
    infoValue: {
        fontSize: 14,
        color: COLORS.textPrimary,
        fontWeight: '500',
        flex: 1,
        textAlign: 'right',
    },
    amountText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: COLORS.success,
    },
    orderItem: {
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
        paddingVertical: 12,
    },
    itemHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
    },
    itemInfo: {
        flex: 1,
    },
    itemName: {
        fontSize: 16,
        fontWeight: '600',
        color: COLORS.textPrimary,
        marginBottom: 4,
    },
    itemPrice: {
        fontSize: 14,
        color: COLORS.textSecondary,
    },
    itemTotal: {
        fontSize: 16,
        fontWeight: 'bold',
        color: COLORS.textPrimary,
    },
    itemCustomizations: {
        fontSize: 12,
        color: COLORS.textSecondary,
        fontStyle: 'italic',
        marginTop: 4,
    },
    orderSummary: {
        marginTop: 16,
        paddingTop: 16,
        borderTopWidth: 2,
        borderTopColor: '#e0e0e0',
    },
    summaryRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 4,
    },
    summaryLabel: {
        fontSize: 14,
        color: COLORS.textSecondary,
    },
    summaryValue: {
        fontSize: 14,
        color: COLORS.textPrimary,
        fontWeight: '500',
    },
    totalRow: {
        marginTop: 8,
        paddingTop: 8,
        borderTopWidth: 1,
        borderTopColor: '#e0e0e0',
    },
    totalLabel: {
        fontSize: 16,
        fontWeight: 'bold',
        color: COLORS.textPrimary,
    },
    totalValue: {
        fontSize: 16,
        fontWeight: 'bold',
        color: COLORS.success,
    },
    actionButtons: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 20,
        marginBottom: 30,
    },
    actionButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 15,
        borderRadius: 8,
        marginHorizontal: 5,
    },
    confirmButton: {
        backgroundColor: COLORS.success,
    },
    cancelButton: {
        backgroundColor: COLORS.error,
    },
    preparingButton: {
        backgroundColor: '#f39c12',
    },
    readyButton: {
        backgroundColor: '#3498db',
    },
    actionButtonText: {
        color: COLORS.white,
        fontSize: 16,
        fontWeight: 'bold',
        marginLeft: 8,
    },
});

export default AdminOrderDetailScreen;
