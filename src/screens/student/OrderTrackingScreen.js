import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Alert,
    SafeAreaView,
    ActivityIndicator,
    Linking
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import authService from '../../services/authService';

const OrderTrackingScreen = ({ route, navigation }) => {
    const { orderId } = route.params;
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [trackingData, setTrackingData] = useState(null);

    useEffect(() => {
        loadOrderDetails();
        const interval = setInterval(loadTrackingData, 30000); // Update every 30 seconds
        return () => clearInterval(interval);
    }, [orderId]);

    const loadOrderDetails = async () => {
        try {
            const response = await authService.makeAuthenticatedRequest(`/orders/${orderId}`);
            setOrder(response.data);
            await loadTrackingData();
        } catch (error) {
            console.error('Load order details error:', error);
            Alert.alert('Error', 'Failed to load order details');
        } finally {
            setLoading(false);
        }
    };

    const loadTrackingData = async () => {
        try {
            const response = await authService.makeAuthenticatedRequest(`/orders/${orderId}/track`);
            setTrackingData(response.data);
        } catch (error) {
            console.error('Load tracking data error:', error);
        }
    };

    const getStatusSteps = () => {
        return [
            { 
                id: 'confirmed', 
                title: 'Order Confirmed', 
                description: 'Restaurant received your order',
                icon: 'checkmark-circle'
            },
            { 
                id: 'preparing', 
                title: 'Preparing', 
                description: 'Your food is being prepared',
                icon: 'restaurant'
            },
            { 
                id: 'ready', 
                title: 'Ready for Pickup', 
                description: 'Food is ready for delivery',
                icon: 'bag-check'
            },
            { 
                id: 'out_for_delivery', 
                title: 'Out for Delivery', 
                description: 'Driver is on the way',
                icon: 'bicycle'
            },
            { 
                id: 'delivered', 
                title: 'Delivered', 
                description: 'Order has been delivered',
                icon: 'home'
            }
        ];
    };

    const getCurrentStepIndex = () => {
        if (!order) return 0;
        const steps = getStatusSteps();
        return steps.findIndex(step => step.id === order.status);
    };

    const handleCallDeliveryPerson = () => {
        if (trackingData?.delivery_person?.phone) {
            Linking.openURL(`tel:${trackingData.delivery_person.phone}`);
        } else {
            Alert.alert('Information', 'Delivery person contact not available yet');
        }
    };

    const handleCallRestaurant = () => {
        if (order?.food_provider?.phone) {
            Linking.openURL(`tel:${order.food_provider.phone}`);
        } else {
            Alert.alert('Information', 'Restaurant contact not available');
        }
    };

    const formatEstimatedTime = (minutes) => {
        if (minutes <= 60) {
            return `${minutes} min`;
        } else {
            const hours = Math.floor(minutes / 60);
            const remainingMinutes = minutes % 60;
            return `${hours}h ${remainingMinutes}m`;
        }
    };

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#3498db" />
                <Text style={styles.loadingText}>Loading order details...</Text>
            </View>
        );
    }

    if (!order) {
        return (
            <View style={styles.errorContainer}>
                <Text style={styles.errorText}>Order not found</Text>
                <TouchableOpacity 
                    style={styles.backButton}
                    onPress={() => navigation.goBack()}
                >
                    <Text style={styles.backButtonText}>Go Back</Text>
                </TouchableOpacity>
            </View>
        );
    }

    const statusSteps = getStatusSteps();
    const currentStepIndex = getCurrentStepIndex();

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
                <Text style={styles.headerTitle}>Track Order</Text>
                <TouchableOpacity 
                    onPress={loadTrackingData}
                    style={styles.headerButton}
                >
                    <Ionicons name="refresh" size={24} color="#3498db" />
                </TouchableOpacity>
            </View>

            <ScrollView style={styles.content}>
                {/* Order Status Card */}
                <LinearGradient colors={['#3498db', '#2980b9']} style={styles.statusCard}>
                    <Text style={styles.orderNumber}>Order #{order.id}</Text>
                    <Text style={styles.currentStatus}>{statusSteps[currentStepIndex]?.title}</Text>
                    {trackingData?.estimated_delivery_time && (
                        <Text style={styles.estimatedTime}>
                            Estimated delivery: {formatEstimatedTime(trackingData.estimated_delivery_time)}
                        </Text>
                    )}
                </LinearGradient>

                {/* Progress Tracker */}
                <View style={styles.progressSection}>
                    <Text style={styles.sectionTitle}>Order Progress</Text>
                    <View style={styles.progressContainer}>
                        {statusSteps.map((step, index) => {
                            const isCompleted = index <= currentStepIndex;
                            const isCurrent = index === currentStepIndex;
                            const isLast = index === statusSteps.length - 1;

                            return (
                                <View key={step.id} style={styles.progressStep}>
                                    <View style={styles.stepIndicatorContainer}>
                                        <View style={[
                                            styles.stepIndicator,
                                            isCompleted && styles.stepIndicatorCompleted,
                                            isCurrent && styles.stepIndicatorCurrent
                                        ]}>
                                            <Ionicons 
                                                name={step.icon} 
                                                size={20} 
                                                color={isCompleted ? 'white' : '#bdc3c7'} 
                                            />
                                        </View>
                                        {!isLast && (
                                            <View style={[
                                                styles.stepConnector,
                                                isCompleted && styles.stepConnectorCompleted
                                            ]} />
                                        )}
                                    </View>
                                    <View style={styles.stepContent}>
                                        <Text style={[
                                            styles.stepTitle,
                                            isCompleted && styles.stepTitleCompleted
                                        ]}>
                                            {step.title}
                                        </Text>
                                        <Text style={styles.stepDescription}>{step.description}</Text>
                                        {isCurrent && trackingData?.current_step_time && (
                                            <Text style={styles.stepTime}>
                                                Updated: {new Date(trackingData.current_step_time).toLocaleTimeString()}
                                            </Text>
                                        )}
                                    </View>
                                </View>
                            );
                        })}
                    </View>
                </View>

                {/* Delivery Person Info */}
                {trackingData?.delivery_person && order.status === 'out_for_delivery' && (
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Delivery Person</Text>
                        <View style={styles.deliveryPersonCard}>
                            <View style={styles.deliveryPersonInfo}>
                                <Text style={styles.deliveryPersonName}>
                                    {trackingData?.delivery_person?.name || 'Unknown Delivery Person'}
                                </Text>
                                <Text style={styles.deliveryPersonVehicle}>
                                    {trackingData.delivery_person.vehicle_type} • {trackingData.delivery_person.vehicle_number}
                                </Text>
                                {trackingData.delivery_person.rating && (
                                    <Text style={styles.deliveryPersonRating}>
                                        ⭐ {trackingData.delivery_person.rating}
                                    </Text>
                                )}
                            </View>
                            <TouchableOpacity 
                                style={styles.callButton}
                                onPress={handleCallDeliveryPerson}
                            >
                                <Ionicons name="call" size={20} color="white" />
                            </TouchableOpacity>
                        </View>
                    </View>
                )}

                {/* Restaurant Info */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Restaurant</Text>
                    <View style={styles.restaurantCard}>
                        <View style={styles.restaurantInfo}>
                            <Text style={styles.restaurantName}>{order?.food_provider?.name || 'Unknown Provider'}</Text>
                            <Text style={styles.restaurantAddress}>{order.food_provider.address}</Text>
                        </View>
                        <TouchableOpacity 
                            style={styles.callButton}
                            onPress={handleCallRestaurant}
                        >
                            <Ionicons name="call" size={20} color="white" />
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Order Details */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Order Details</Text>
                    <View style={styles.orderDetailsCard}>
                        {order.items.map((item, index) => (
                            <View key={index} style={styles.orderItem}>
                                <Text style={styles.orderItemName}>
                                    {item?.quantity || 0}x {item?.menu_item?.name || 'Unknown Item'}
                                </Text>
                                <Text style={styles.orderItemPrice}>
                                    ${(item.menu_item.price * item.quantity).toFixed(2)}
                                </Text>
                            </View>
                        ))}
                        <View style={styles.orderTotal}>
                            <Text style={styles.orderTotalText}>
                                Total: ${order.total_amount.toFixed(2)}
                            </Text>
                        </View>
                    </View>
                </View>

                {/* Delivery Address */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Delivery Address</Text>
                    <View style={styles.addressCard}>
                        <Text style={styles.addressText}>{order.delivery_location.address}</Text>
                        {order.delivery_location.instructions && (
                            <Text style={styles.instructionsText}>
                                Instructions: {order.delivery_location.instructions}
                            </Text>
                        )}
                    </View>
                </View>

                <View style={styles.bottomSpacing} />
            </ScrollView>

            {/* Action Buttons */}
            {order.status !== 'delivered' && order.status !== 'cancelled' && (
                <View style={styles.footer}>
                    <TouchableOpacity 
                        style={styles.actionButton}
                        onPress={() => navigation.navigate('MyOrders')}
                    >
                        <Text style={styles.actionButtonText}>View All Orders</Text>
                    </TouchableOpacity>
                </View>
            )}

            {/* Rate Order Button (if delivered) */}
            {order.status === 'delivered' && !order.rating && (
                <View style={styles.footer}>
                    <TouchableOpacity style={styles.rateButton}>
                        <LinearGradient colors={['#f39c12', '#e67e22']} style={styles.rateButtonGradient}>
                            <Text style={styles.rateButtonText}>Rate this order</Text>
                        </LinearGradient>
                    </TouchableOpacity>
                </View>
            )}
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
    statusCard: {
        margin: 16,
        padding: 20,
        borderRadius: 12,
        alignItems: 'center'
    },
    orderNumber: {
        color: 'white',
        fontSize: 16,
        marginBottom: 8,
        opacity: 0.9
    },
    currentStatus: {
        color: 'white',
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 8
    },
    estimatedTime: {
        color: 'white',
        fontSize: 16,
        opacity: 0.9
    },
    progressSection: {
        backgroundColor: 'white',
        margin: 16,
        padding: 16,
        borderRadius: 12
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#2c3e50',
        marginBottom: 16
    },
    progressContainer: {
        paddingHorizontal: 8
    },
    progressStep: {
        flexDirection: 'row',
        marginBottom: 20
    },
    stepIndicatorContainer: {
        alignItems: 'center',
        marginRight: 16
    },
    stepIndicator: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#ecf0f1',
        justifyContent: 'center',
        alignItems: 'center'
    },
    stepIndicatorCompleted: {
        backgroundColor: '#2ecc71'
    },
    stepIndicatorCurrent: {
        backgroundColor: '#3498db',
        borderWidth: 3,
        borderColor: '#e3f2fd'
    },
    stepConnector: {
        width: 2,
        height: 30,
        backgroundColor: '#ecf0f1',
        marginTop: 8
    },
    stepConnectorCompleted: {
        backgroundColor: '#2ecc71'
    },
    stepContent: {
        flex: 1,
        paddingTop: 8
    },
    stepTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#7f8c8d',
        marginBottom: 4
    },
    stepTitleCompleted: {
        color: '#2c3e50'
    },
    stepDescription: {
        fontSize: 14,
        color: '#95a5a6',
        marginBottom: 4
    },
    stepTime: {
        fontSize: 12,
        color: '#3498db',
        fontStyle: 'italic'
    },
    section: {
        backgroundColor: 'white',
        marginHorizontal: 16,
        marginBottom: 16,
        padding: 16,
        borderRadius: 12
    },
    deliveryPersonCard: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between'
    },
    deliveryPersonInfo: {
        flex: 1
    },
    deliveryPersonName: {
        fontSize: 16,
        fontWeight: '600',
        color: '#2c3e50',
        marginBottom: 4
    },
    deliveryPersonVehicle: {
        fontSize: 14,
        color: '#7f8c8d',
        marginBottom: 4
    },
    deliveryPersonRating: {
        fontSize: 14,
        color: '#f39c12'
    },
    callButton: {
        backgroundColor: '#2ecc71',
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center'
    },
    restaurantCard: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between'
    },
    restaurantInfo: {
        flex: 1
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
    orderDetailsCard: {
        backgroundColor: '#f8f9fa',
        borderRadius: 8,
        padding: 12
    },
    orderItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 8
    },
    orderItemName: {
        fontSize: 14,
        color: '#2c3e50',
        flex: 1
    },
    orderItemPrice: {
        fontSize: 14,
        fontWeight: '600',
        color: '#2ecc71'
    },
    orderTotal: {
        borderTopWidth: 1,
        borderTopColor: '#ecf0f1',
        paddingTop: 8,
        marginTop: 8
    },
    orderTotalText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#2c3e50',
        textAlign: 'right'
    },
    addressCard: {
        backgroundColor: '#f8f9fa',
        borderRadius: 8,
        padding: 12
    },
    addressText: {
        fontSize: 16,
        color: '#2c3e50',
        marginBottom: 8
    },
    instructionsText: {
        fontSize: 14,
        color: '#7f8c8d',
        fontStyle: 'italic'
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
    actionButton: {
        backgroundColor: '#3498db',
        padding: 14,
        borderRadius: 8,
        alignItems: 'center'
    },
    actionButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: '600'
    },
    rateButton: {
        borderRadius: 8,
        overflow: 'hidden'
    },
    rateButtonGradient: {
        paddingVertical: 14,
        alignItems: 'center'
    },
    rateButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold'
    }
});

export default OrderTrackingScreen;
