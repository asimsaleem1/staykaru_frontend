import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    ScrollView,
    StyleSheet,
    TouchableOpacity,
    TextInput,
    ActivityIndicator,
    Alert,
    KeyboardAvoidingView,
    Platform
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import studentApiService from '../../services/studentApiService';

const FoodOrderCheckoutScreen = ({ navigation, route }) => {
    const { cart, provider, totalAmount } = route.params;
    const [loading, setLoading] = useState(false);
    const [orderData, setOrderData] = useState({
        deliveryAddress: '',
        phone: '',
        notes: '',
        paymentMethod: 'cash'
    });
    const [userProfile, setUserProfile] = useState(null);

    useEffect(() => {
        loadUserProfile();
    }, []);

    const loadUserProfile = async () => {
        try {
            const profile = await studentApiService.getProfile();
            setUserProfile(profile);
            setOrderData(prev => ({
                ...prev,
                phone: profile.phone || '',
                deliveryAddress: profile.address || ''
            }));
        } catch (error) {
            console.error('Error loading profile:', error);
        }
    };

    const handleInputChange = (field, value) => {
        setOrderData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const validateOrder = () => {
        if (!orderData.deliveryAddress.trim()) {
            Alert.alert('Error', 'Please enter delivery address');
            return false;
        }
        if (!orderData.phone.trim()) {
            Alert.alert('Error', 'Please enter phone number');
            return false;
        }
        if (orderData.phone.length < 11) {
            Alert.alert('Error', 'Please enter a valid phone number');
            return false;
        }
        return true;
    };

    const calculateDeliveryFee = () => {
        return 50; // Fixed delivery fee for now
    };

    const calculateTotalWithDelivery = () => {
        return totalAmount + calculateDeliveryFee();
    };

    const placeOrder = async () => {
        if (!validateOrder()) return;

        try {
            setLoading(true);

            const orderPayload = {
                providerId: provider._id || provider.id,
                providerName: provider.name,
                items: cart.map(item => ({
                    itemId: item._id,
                    name: item.name,
                    price: item.price,
                    quantity: item.quantity
                })),
                deliveryAddress: orderData.deliveryAddress,
                phone: orderData.phone,
                notes: orderData.notes,
                paymentMethod: orderData.paymentMethod,
                subtotal: totalAmount,
                deliveryFee: calculateDeliveryFee(),
                totalAmount: calculateTotalWithDelivery()
            };

            const result = await studentApiService.createFoodOrder(orderPayload);

            Alert.alert(
                'Order Placed Successfully!',
                `Your order has been ${result.isSimulated ? 'submitted' : 'confirmed'}.\n` +
                `${result.isSimulated ? 'Simulation' : 'Order'} ID: ${result.orderId || result.id}\n` +
                `Estimated delivery: ${typeof result.estimatedDelivery === 'string' ? result.estimatedDelivery : '30-45 minutes'}`,
                [
                    {
                        text: 'View My Orders',
                        onPress: () => {
                            // Navigate to MyOrders and refresh the data
                            navigation.navigate('MyOrders', { 
                                refresh: true,
                                newOrderId: result._id || result.id || result.orderId
                            });
                        }
                    },
                    {
                        text: 'Continue Shopping',
                        onPress: () => {
                            navigation.popToTop();
                        }
                    }
                ]
            );
        } catch (error) {
            console.error('Error placing order:', error);
            Alert.alert('Error', 'Failed to place order. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const renderOrderSummary = () => (
        <View style={styles.section}>
            <Text style={styles.sectionTitle}>Order Summary</Text>
            
            <View style={styles.providerInfo}>
                <Text style={styles.providerName}>{provider.name}</Text>
                <View style={styles.providerMeta}>
                    <Ionicons name="star" size={14} color="#ffc107" />
                    <Text style={styles.providerRating}>
                        {provider.rating?.toFixed(1) || '4.0'}
                    </Text>
                    <Text style={styles.providerLocation}>
                        • {provider.location || 'Location'}
                    </Text>
                </View>
            </View>

            <View style={styles.itemsList}>
                {cart.map((item, index) => (
                    <View key={index} style={styles.orderItem}>
                        <View style={styles.itemInfo}>
                            <Text style={styles.itemName}>{item.name}</Text>
                            <Text style={styles.itemPrice}>
                                PKR {item.price} × {item.quantity}
                            </Text>
                        </View>
                        <Text style={styles.itemTotal}>
                            PKR {(item.price * item.quantity).toLocaleString()}
                        </Text>
                    </View>
                ))}
            </View>

            <View style={styles.orderTotals}>
                <View style={styles.totalRow}>
                    <Text style={styles.totalLabel}>Subtotal</Text>
                    <Text style={styles.totalValue}>PKR {totalAmount.toLocaleString()}</Text>
                </View>
                <View style={styles.totalRow}>
                    <Text style={styles.totalLabel}>Delivery Fee</Text>
                    <Text style={styles.totalValue}>PKR {calculateDeliveryFee()}</Text>
                </View>
                <View style={[styles.totalRow, styles.grandTotalRow]}>
                    <Text style={styles.grandTotalLabel}>Total</Text>
                    <Text style={styles.grandTotalValue}>
                        PKR {calculateTotalWithDelivery().toLocaleString()}
                    </Text>
                </View>
            </View>
        </View>
    );

    const renderDeliveryDetails = () => (
        <View style={styles.section}>
            <Text style={styles.sectionTitle}>Delivery Details</Text>
            
            <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Delivery Address *</Text>
                <TextInput
                    style={styles.textInput}
                    value={orderData.deliveryAddress}
                    onChangeText={(text) => handleInputChange('deliveryAddress', text)}
                    placeholder="Enter your complete delivery address"
                    multiline
                    numberOfLines={3}
                    textAlignVertical="top"
                />
            </View>

            <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Phone Number *</Text>
                <TextInput
                    style={styles.textInput}
                    value={orderData.phone}
                    onChangeText={(text) => handleInputChange('phone', text)}
                    placeholder="03XXXXXXXXX"
                    keyboardType="phone-pad"
                    maxLength={11}
                />
            </View>

            <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Special Instructions (Optional)</Text>
                <TextInput
                    style={styles.textInput}
                    value={orderData.notes}
                    onChangeText={(text) => handleInputChange('notes', text)}
                    placeholder="Any special instructions for your order..."
                    multiline
                    numberOfLines={2}
                    textAlignVertical="top"
                />
            </View>
        </View>
    );

    const renderPaymentMethod = () => (
        <View style={styles.section}>
            <Text style={styles.sectionTitle}>Payment Method</Text>
            
            <TouchableOpacity
                style={[
                    styles.paymentOption,
                    orderData.paymentMethod === 'cash' && styles.selectedPaymentOption
                ]}
                onPress={() => handleInputChange('paymentMethod', 'cash')}
            >
                <View style={styles.paymentOptionContent}>
                    <Ionicons name="cash" size={24} color="#28a745" />
                    <View style={styles.paymentOptionText}>
                        <Text style={styles.paymentOptionTitle}>Cash on Delivery</Text>
                        <Text style={styles.paymentOptionSubtitle}>
                            Pay when your order arrives
                        </Text>
                    </View>
                </View>
                <View style={[
                    styles.radioButton,
                    orderData.paymentMethod === 'cash' && styles.radioButtonSelected
                ]} />
            </TouchableOpacity>

            <TouchableOpacity
                style={[
                    styles.paymentOption,
                    orderData.paymentMethod === 'card' && styles.selectedPaymentOption
                ]}
                onPress={() => handleInputChange('paymentMethod', 'card')}
            >
                <View style={styles.paymentOptionContent}>
                    <Ionicons name="card" size={24} color="#007bff" />
                    <View style={styles.paymentOptionText}>
                        <Text style={styles.paymentOptionTitle}>Credit/Debit Card</Text>
                        <Text style={styles.paymentOptionSubtitle}>
                            Pay online securely
                        </Text>
                    </View>
                </View>
                <View style={[
                    styles.radioButton,
                    orderData.paymentMethod === 'card' && styles.radioButtonSelected
                ]} />
            </TouchableOpacity>

            <TouchableOpacity
                style={[
                    styles.paymentOption,
                    orderData.paymentMethod === 'mobile' && styles.selectedPaymentOption
                ]}
                onPress={() => handleInputChange('paymentMethod', 'mobile')}
            >
                <View style={styles.paymentOptionContent}>
                    <Ionicons name="phone-portrait" size={24} color="#ff6b35" />
                    <View style={styles.paymentOptionText}>
                        <Text style={styles.paymentOptionTitle}>Mobile Wallet</Text>
                        <Text style={styles.paymentOptionSubtitle}>
                            JazzCash, EasyPaisa, etc.
                        </Text>
                    </View>
                </View>
                <View style={[
                    styles.radioButton,
                    orderData.paymentMethod === 'mobile' && styles.radioButtonSelected
                ]} />
            </TouchableOpacity>
        </View>
    );

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Ionicons name="arrow-back" size={24} color="#333" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Checkout</Text>
                <View style={{ width: 24 }} />
            </View>

            <KeyboardAvoidingView 
                style={styles.content}
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            >
                <ScrollView 
                    style={styles.scrollView}
                    showsVerticalScrollIndicator={false}
                    keyboardShouldPersistTaps="handled"
                >
                    {renderOrderSummary()}
                    {renderDeliveryDetails()}
                    {renderPaymentMethod()}
                    
                    <View style={styles.bottomSpacing} />
                </ScrollView>

                <View style={styles.footer}>
                    <View style={styles.footerTotal}>
                        <Text style={styles.footerTotalText}>
                            Total: PKR {calculateTotalWithDelivery().toLocaleString()}
                        </Text>
                        <Text style={styles.footerDeliveryTime}>
                            Estimated delivery: 30-45 min
                        </Text>
                    </View>
                    
                    <TouchableOpacity
                        style={[styles.placeOrderButton, loading && styles.placeOrderButtonDisabled]}
                        onPress={placeOrder}
                        disabled={loading}
                    >
                        {loading ? (
                            <ActivityIndicator size="small" color="white" />
                        ) : (
                            <>
                                <Ionicons name="checkmark-circle" size={20} color="white" />
                                <Text style={styles.placeOrderButtonText}>Place Order</Text>
                            </>
                        )}
                    </TouchableOpacity>
                </View>
            </KeyboardAvoidingView>
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
    content: {
        flex: 1,
    },
    scrollView: {
        flex: 1,
    },
    section: {
        backgroundColor: 'white',
        marginVertical: 8,
        padding: 20,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 15,
    },
    providerInfo: {
        paddingBottom: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#f1f3f4',
        marginBottom: 15,
    },
    providerName: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 5,
    },
    providerMeta: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    providerRating: {
        marginLeft: 5,
        fontSize: 14,
        color: '#333',
        fontWeight: '500',
    },
    providerLocation: {
        fontSize: 14,
        color: '#6c757d',
        marginLeft: 5,
    },
    itemsList: {
        marginBottom: 15,
    },
    orderItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 8,
        borderBottomWidth: 1,
        borderBottomColor: '#f8f9fa',
    },
    itemInfo: {
        flex: 1,
    },
    itemName: {
        fontSize: 14,
        fontWeight: '500',
        color: '#333',
        marginBottom: 2,
    },
    itemPrice: {
        fontSize: 12,
        color: '#6c757d',
    },
    itemTotal: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#333',
    },
    orderTotals: {
        paddingTop: 15,
        borderTopWidth: 1,
        borderTopColor: '#f1f3f4',
    },
    totalRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 5,
    },
    totalLabel: {
        fontSize: 14,
        color: '#6c757d',
    },
    totalValue: {
        fontSize: 14,
        color: '#333',
        fontWeight: '500',
    },
    grandTotalRow: {
        paddingTop: 10,
        borderTopWidth: 1,
        borderTopColor: '#f1f3f4',
        marginTop: 5,
    },
    grandTotalLabel: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
    },
    grandTotalValue: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#0F5257',
    },
    inputGroup: {
        marginBottom: 20,
    },
    inputLabel: {
        fontSize: 14,
        fontWeight: '500',
        color: '#333',
        marginBottom: 8,
    },
    textInput: {
        borderWidth: 1,
        borderColor: '#dee2e6',
        borderRadius: 8,
        paddingHorizontal: 15,
        paddingVertical: 12,
        fontSize: 16,
        backgroundColor: '#fff',
        color: '#333',
    },
    paymentOption: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 15,
        borderWidth: 1,
        borderColor: '#dee2e6',
        borderRadius: 8,
        marginBottom: 10,
        backgroundColor: '#fff',
    },
    selectedPaymentOption: {
        borderColor: '#007bff',
        backgroundColor: '#f8f9ff',
    },
    paymentOptionContent: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    paymentOptionText: {
        marginLeft: 15,
        flex: 1,
    },
    paymentOptionTitle: {
        fontSize: 16,
        fontWeight: '500',
        color: '#333',
        marginBottom: 2,
    },
    paymentOptionSubtitle: {
        fontSize: 12,
        color: '#6c757d',
    },
    radioButton: {
        width: 20,
        height: 20,
        borderRadius: 10,
        borderWidth: 2,
        borderColor: '#dee2e6',
        backgroundColor: '#fff',
    },
    radioButtonSelected: {
        borderColor: '#007bff',
        backgroundColor: '#007bff',
    },
    bottomSpacing: {
        height: 20,
    },
    footer: {
        backgroundColor: 'white',
        paddingHorizontal: 20,
        paddingVertical: 15,
        borderTopWidth: 1,
        borderTopColor: '#e9ecef',
    },
    footerTotal: {
        marginBottom: 15,
    },
    footerTotalText: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
        textAlign: 'center',
    },
    footerDeliveryTime: {
        fontSize: 12,
        color: '#6c757d',
        textAlign: 'center',
        marginTop: 2,
    },
    placeOrderButton: {
        backgroundColor: '#0F5257',
        borderRadius: 25,
        paddingVertical: 15,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    placeOrderButtonDisabled: {
        backgroundColor: '#6c757d',
    },
    placeOrderButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
        marginLeft: 8,
    },
});

export default FoodOrderCheckoutScreen;
