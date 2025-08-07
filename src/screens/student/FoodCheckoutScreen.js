import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Alert,
    TextInput,
    SafeAreaView,
    FlatList
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import authService from '../../services/authService';

const FoodCheckoutScreen = ({ route, navigation }) => {
    const { cart, provider, total } = route.params;
    const [deliveryAddress, setDeliveryAddress] = useState('');
    const [deliveryInstructions, setDeliveryInstructions] = useState('');
    const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('card');
    const [promoCode, setPromoCode] = useState('');
    const [deliveryTime, setDeliveryTime] = useState('asap');
    const [loading, setLoading] = useState(false);

    const deliveryFee = 5.99;
    const serviceFee = 2.50;
    const tax = (total + deliveryFee + serviceFee) * 0.08;
    const grandTotal = total + deliveryFee + serviceFee + tax;

    const paymentMethods = [
        { id: 'card', name: 'Credit/Debit Card', icon: 'card' },
        { id: 'digital_wallet', name: 'Digital Wallet', icon: 'wallet' },
        { id: 'cash', name: 'Cash on Delivery', icon: 'cash' }
    ];

    const deliveryOptions = [
        { id: 'asap', name: 'ASAP (30-45 min)', icon: 'flash' },
        { id: 'scheduled', name: 'Schedule for later', icon: 'time' }
    ];

    const handlePlaceOrder = async () => {
        if (!deliveryAddress.trim()) {
            Alert.alert('Missing Information', 'Please enter your delivery address');
            return;
        }

        try {
            setLoading(true);
            
            const orderData = {
                food_provider: provider.id,
                total_amount: grandTotal,
                items: cart.map(item => ({
                    menu_item: item.menuItem.id,
                    quantity: item.quantity,
                    special_instructions: item.customizations?.join(', ') || ''
                })),
                delivery_location: {
                    address: deliveryAddress,
                    instructions: deliveryInstructions
                },
                payment_method: selectedPaymentMethod,
                delivery_time: deliveryTime,
                promo_code: promoCode || undefined
            };

            const response = await authService.makeAuthenticatedRequest('/orders', 'POST', orderData);
            
            Alert.alert(
                'Order Placed Successfully!',
                `Your order #${response.data.id} has been confirmed. You can track its progress in My Orders.`,
                [
                    {
                        text: 'Track Order',
                        onPress: () => {
                            navigation.reset({
                                index: 1,
                                routes: [
                                    { name: 'StudentDashboard' },
                                    { name: 'OrderTracking', params: { orderId: response.data.id } }
                                ]
                            });
                        }
                    },
                    {
                        text: 'View Orders',
                        onPress: () => {
                            navigation.reset({
                                index: 1,
                                routes: [
                                    { name: 'StudentDashboard' },
                                    { name: 'MyOrders' }
                                ]
                            });
                        }
                    }
                ]
            );
        } catch (error) {
            console.error('Place order error:', error);
            Alert.alert('Order Failed', 'There was an error placing your order. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const renderCartItem = ({ item }) => (
        <View style={styles.cartItem}>
            <View style={styles.cartItemInfo}>
                <Text style={styles.cartItemName}>{item?.menuItem?.name || 'Unknown Item'}</Text>
                <Text style={styles.cartItemQuantity}>Qty: {item.quantity}</Text>
                {item.customizations && item.customizations.length > 0 && (
                    <Text style={styles.cartItemCustomizations}>
                        {item.customizations.join(', ')}
                    </Text>
                )}
            </View>
            <Text style={styles.cartItemPrice}>${item.totalPrice.toFixed(2)}</Text>
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
                <Text style={styles.headerTitle}>Checkout</Text>
                <View style={styles.headerButton} />
            </View>

            <ScrollView style={styles.content}>
                {/* Restaurant Info */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Order from</Text>
                    <View style={styles.restaurantInfo}>
                        <Text style={styles.restaurantName}>{provider?.name || 'Unknown Provider'}</Text>
                        <Text style={styles.restaurantAddress}>{provider.address}</Text>
                    </View>
                </View>

                {/* Order Items */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Your Order</Text>
                    <FlatList
                        data={cart}
                        renderItem={renderCartItem}
                        keyExtractor={(item, index) => item.id ? item.id.toString() : index.toString()}
                        scrollEnabled={false}
                    />
                </View>

                {/* Delivery Address */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Delivery Address</Text>
                    <TextInput
                        style={styles.textInput}
                        placeholder="Enter your delivery address"
                        value={deliveryAddress}
                        onChangeText={setDeliveryAddress}
                        multiline
                        numberOfLines={3}
                    />
                    <TextInput
                        style={styles.textInput}
                        placeholder="Delivery instructions (optional)"
                        value={deliveryInstructions}
                        onChangeText={setDeliveryInstructions}
                        multiline
                        numberOfLines={2}
                    />
                </View>

                {/* Delivery Time */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Delivery Time</Text>
                    {deliveryOptions.map((option) => (
                        <TouchableOpacity
                            key={option.id}
                            style={[
                                styles.optionItem,
                                deliveryTime === option.id && styles.optionItemSelected
                            ]}
                            onPress={() => setDeliveryTime(option.id)}
                        >
                            <View style={styles.optionContent}>
                                <Ionicons 
                                    name={option.icon} 
                                    size={20} 
                                    color={deliveryTime === option.id ? '#3498db' : '#7f8c8d'} 
                                />
                                <Text style={[
                                    styles.optionText,
                                    deliveryTime === option.id && styles.optionTextSelected
                                ]}>
                                    {option?.name || 'Unknown Option'}
                                </Text>
                            </View>
                            <View style={[
                                styles.radioButton,
                                deliveryTime === option.id && styles.radioButtonSelected
                            ]} />
                        </TouchableOpacity>
                    ))}
                </View>

                {/* Payment Method */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Payment Method</Text>
                    {paymentMethods.map((method) => (
                        <TouchableOpacity
                            key={method.id}
                            style={[
                                styles.optionItem,
                                selectedPaymentMethod === method.id && styles.optionItemSelected
                            ]}
                            onPress={() => setSelectedPaymentMethod(method.id)}
                        >
                            <View style={styles.optionContent}>
                                <Ionicons 
                                    name={method.icon} 
                                    size={20} 
                                    color={selectedPaymentMethod === method.id ? '#3498db' : '#7f8c8d'} 
                                />
                                <Text style={[
                                    styles.optionText,
                                    selectedPaymentMethod === method.id && styles.optionTextSelected
                                ]}>
                                    {method?.name || 'Unknown Method'}
                                </Text>
                            </View>
                            <View style={[
                                styles.radioButton,
                                selectedPaymentMethod === method.id && styles.radioButtonSelected
                            ]} />
                        </TouchableOpacity>
                    ))}
                </View>

                {/* Promo Code */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Promo Code</Text>
                    <View style={styles.promoContainer}>
                        <TextInput
                            style={[styles.textInput, { flex: 1, marginRight: 8 }]}
                            placeholder="Enter promo code"
                            value={promoCode}
                            onChangeText={setPromoCode}
                        />
                        <TouchableOpacity style={styles.applyButton}>
                            <Text style={styles.applyButtonText}>Apply</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Order Summary */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Order Summary</Text>
                    <View style={styles.summaryContainer}>
                        <View style={styles.summaryRow}>
                            <Text style={styles.summaryLabel}>Subtotal</Text>
                            <Text style={styles.summaryValue}>${total.toFixed(2)}</Text>
                        </View>
                        <View style={styles.summaryRow}>
                            <Text style={styles.summaryLabel}>Delivery Fee</Text>
                            <Text style={styles.summaryValue}>${deliveryFee.toFixed(2)}</Text>
                        </View>
                        <View style={styles.summaryRow}>
                            <Text style={styles.summaryLabel}>Service Fee</Text>
                            <Text style={styles.summaryValue}>${serviceFee.toFixed(2)}</Text>
                        </View>
                        <View style={styles.summaryRow}>
                            <Text style={styles.summaryLabel}>Tax</Text>
                            <Text style={styles.summaryValue}>${tax.toFixed(2)}</Text>
                        </View>
                        <View style={[styles.summaryRow, styles.summaryTotal]}>
                            <Text style={styles.summaryLabelTotal}>Total</Text>
                            <Text style={styles.summaryValueTotal}>${grandTotal.toFixed(2)}</Text>
                        </View>
                    </View>
                </View>

                <View style={styles.bottomSpacing} />
            </ScrollView>

            {/* Place Order Button */}
            <View style={styles.footer}>
                <TouchableOpacity 
                    style={[styles.placeOrderButton, loading && styles.placeOrderButtonDisabled]}
                    onPress={handlePlaceOrder}
                    disabled={loading}
                >
                    <LinearGradient
                        colors={loading ? ['#95a5a6', '#7f8c8d'] : ['#2ecc71', '#27ae60']}
                        style={styles.placeOrderButtonGradient}
                    >
                        <Text style={styles.placeOrderButtonText}>
                            {loading ? 'Placing Order...' : `Place Order • $${grandTotal.toFixed(2)}`}
                        </Text>
                    </LinearGradient>
                </TouchableOpacity>
            </View>
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
    content: {
        flex: 1
    },
    section: {
        backgroundColor: 'white',
        marginTop: 8,
        paddingHorizontal: 16,
        paddingVertical: 16
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#2c3e50',
        marginBottom: 12
    },
    restaurantInfo: {
        paddingVertical: 8
    },
    restaurantName: {
        fontSize: 16,
        fontWeight: '600',
        color: '#2c3e50',
        marginBottom: 4
    },
    restaurantAddress: {
        fontSize: 14,
        color: '#7f8c8d'
    },
    cartItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        paddingVertical: 8,
        borderBottomWidth: 1,
        borderBottomColor: '#ecf0f1'
    },
    cartItemInfo: {
        flex: 1
    },
    cartItemName: {
        fontSize: 16,
        fontWeight: '600',
        color: '#2c3e50',
        marginBottom: 4
    },
    cartItemQuantity: {
        fontSize: 14,
        color: '#7f8c8d',
        marginBottom: 2
    },
    cartItemCustomizations: {
        fontSize: 12,
        color: '#95a5a6',
        fontStyle: 'italic'
    },
    cartItemPrice: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#2ecc71'
    },
    textInput: {
        borderWidth: 1,
        borderColor: '#ecf0f1',
        borderRadius: 8,
        padding: 12,
        fontSize: 16,
        backgroundColor: 'white',
        marginBottom: 8,
        textAlignVertical: 'top'
    },
    optionItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 12,
        paddingHorizontal: 8,
        borderRadius: 8,
        marginBottom: 8
    },
    optionItemSelected: {
        backgroundColor: '#e3f2fd'
    },
    optionContent: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1
    },
    optionText: {
        fontSize: 16,
        color: '#2c3e50',
        marginLeft: 12
    },
    optionTextSelected: {
        color: '#3498db',
        fontWeight: '600'
    },
    radioButton: {
        width: 20,
        height: 20,
        borderRadius: 10,
        borderWidth: 2,
        borderColor: '#ecf0f1'
    },
    radioButtonSelected: {
        borderColor: '#3498db',
        backgroundColor: '#3498db'
    },
    promoContainer: {
        flexDirection: 'row',
        alignItems: 'center'
    },
    applyButton: {
        backgroundColor: '#3498db',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderRadius: 8
    },
    applyButtonText: {
        color: 'white',
        fontSize: 14,
        fontWeight: '600'
    },
    summaryContainer: {
        backgroundColor: '#f8f9fa',
        borderRadius: 8,
        padding: 16
    },
    summaryRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8
    },
    summaryLabel: {
        fontSize: 16,
        color: '#2c3e50'
    },
    summaryValue: {
        fontSize: 16,
        color: '#2c3e50'
    },
    summaryTotal: {
        borderTopWidth: 1,
        borderTopColor: '#ecf0f1',
        paddingTop: 8,
        marginTop: 8,
        marginBottom: 0
    },
    summaryLabelTotal: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#2c3e50'
    },
    summaryValueTotal: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#2ecc71'
    },
    bottomSpacing: {
        height: 100
    },
    footer: {
        padding: 16,
        backgroundColor: 'white',
        borderTopWidth: 1,
        borderTopColor: '#ecf0f1'
    },
    placeOrderButton: {
        borderRadius: 12,
        overflow: 'hidden'
    },
    placeOrderButtonDisabled: {
        opacity: 0.7
    },
    placeOrderButtonGradient: {
        paddingVertical: 16,
        alignItems: 'center'
    },
    placeOrderButtonText: {
        color: 'white',
        fontSize: 18,
        fontWeight: 'bold'
    }
});

export default FoodCheckoutScreen;
