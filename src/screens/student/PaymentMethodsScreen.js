import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    ScrollView,
    StyleSheet,
    TouchableOpacity,
    Alert,
    TextInput,
    Switch
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { Ionicons } from '@expo/vector-icons';

const PaymentMethodsScreen = ({ navigation }) => {
    const [paymentMethods, setPaymentMethods] = useState([]);
    const [loading, setLoading] = useState(true);
    const [defaultPaymentId, setDefaultPaymentId] = useState('1');

    useEffect(() => {
        loadPaymentMethods();
    }, []);

    const loadPaymentMethods = async () => {
        try {
            setLoading(true);
            // Mock data for payment methods
            const mockPaymentMethods = [
                {
                    id: '1',
                    type: 'card',
                    cardType: 'visa',
                    lastFour: '4532',
                    expiryMonth: '12',
                    expiryYear: '26',
                    cardholderName: 'John Doe',
                    isDefault: true,
                    nickname: 'Personal Visa'
                },
                {
                    id: '2',
                    type: 'card',
                    cardType: 'mastercard',
                    lastFour: '8765',
                    expiryMonth: '08',
                    expiryYear: '25',
                    cardholderName: 'John Doe',
                    isDefault: false,
                    nickname: 'Backup Card'
                },
                {
                    id: '3',
                    type: 'paypal',
                    email: 'john.doe@email.com',
                    isDefault: false,
                    nickname: 'PayPal Account'
                },
                {
                    id: '4',
                    type: 'bank',
                    bankName: 'Chase Bank',
                    accountNumber: '****1234',
                    routingNumber: '****5678',
                    isDefault: false,
                    nickname: 'Checking Account'
                }
            ];
            setPaymentMethods(mockPaymentMethods);
        } catch (error) {
            console.error('Error loading payment methods:', error);
            Alert.alert('Error', 'Failed to load payment methods');
        } finally {
            setLoading(false);
        }
    };

    const setDefaultPayment = (id) => {
        setPaymentMethods(paymentMethods.map(method => ({
            ...method,
            isDefault: method.id === id
        })));
        setDefaultPaymentId(id);
        Alert.alert('Success', 'Default payment method updated');
    };

    const removePaymentMethod = (id) => {
        const method = paymentMethods.find(m => m.id === id);
        
        Alert.alert(
            'Remove Payment Method',
            `Are you sure you want to remove ${method.nickname || method.type}?`,
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Remove',
                    style: 'destructive',
                    onPress: () => {
                        setPaymentMethods(paymentMethods.filter(m => m.id !== id));
                        if (method.isDefault && paymentMethods.length > 1) {
                            // Set first remaining method as default
                            const remaining = paymentMethods.filter(m => m.id !== id);
                            if (remaining.length > 0) {
                                setDefaultPayment(remaining[0].id);
                            }
                        }
                        Alert.alert('Success', 'Payment method removed');
                    }
                }
            ]
        );
    };

    const addPaymentMethod = (type) => {
        switch (type) {
            case 'card':
                navigation.navigate('AddCreditCard');
                break;
            case 'paypal':
                navigation.navigate('LinkPayPal');
                break;
            case 'bank':
                navigation.navigate('AddBankAccount');
                break;
            case 'campus':
                navigation.navigate('LinkCampusCard');
                break;
            default:
                Alert.alert('Coming Soon', 'This payment method will be available soon');
        }
    };

    const getCardIcon = (cardType) => {
        switch (cardType?.toLowerCase()) {
            case 'visa':
                return 'credit-card';
            case 'mastercard':
                return 'credit-card';
            case 'amex':
                return 'credit-card';
            default:
                return 'credit-card';
        }
    };

    const getPaymentIcon = (type) => {
        switch (type) {
            case 'card':
                return 'credit-card';
            case 'paypal':
                return 'account-balance-wallet';
            case 'bank':
                return 'account-balance';
            case 'campus':
                return 'school';
            default:
                return 'payment';
        }
    };

    const renderPaymentMethod = (method) => (
        <View key={method.id} style={styles.paymentMethodCard}>
            <View style={styles.methodHeader}>
                <View style={styles.methodInfo}>
                    <Icon 
                        name={method.type === 'card' ? getCardIcon(method.cardType) : getPaymentIcon(method.type)} 
                        size={24} 
                        color="#3498db" 
                    />
                    <View style={styles.methodDetails}>
                        <Text style={styles.methodNickname}>
                            {method.nickname || `${method.type.charAt(0).toUpperCase() + method.type.slice(1)}`}
                        </Text>
                        {method.type === 'card' && (
                            <Text style={styles.methodSubtext}>
                                {method.cardType?.toUpperCase()} ****{method.lastFour}
                            </Text>
                        )}
                        {method.type === 'paypal' && (
                            <Text style={styles.methodSubtext}>{method.email}</Text>
                        )}
                        {method.type === 'bank' && (
                            <Text style={styles.methodSubtext}>
                                {method.bankName} {method.accountNumber}
                            </Text>
                        )}
                    </View>
                </View>
                
                <View style={styles.methodActions}>
                    {method.isDefault && (
                        <View style={styles.defaultBadge}>
                            <Text style={styles.defaultText}>Default</Text>
                        </View>
                    )}
                    <TouchableOpacity 
                        style={styles.actionButton}
                        onPress={() => removePaymentMethod(method.id)}
                    >
                        <Icon name="delete" size={20} color="#e74c3c" />
                    </TouchableOpacity>
                </View>
            </View>

            {method.type === 'card' && (
                <Text style={styles.expiryText}>
                    Expires {method.expiryMonth}/{method.expiryYear}
                </Text>
            )}

            {!method.isDefault && (
                <TouchableOpacity 
                    style={styles.setDefaultButton}
                    onPress={() => setDefaultPayment(method.id)}
                >
                    <Text style={styles.setDefaultText}>Set as Default</Text>
                </TouchableOpacity>
            )}
        </View>
    );

    const renderAddPaymentOptions = () => (
        <View style={styles.addMethodsContainer}>
            <Text style={styles.sectionTitle}>Add New Payment Method</Text>
            
            <TouchableOpacity 
                style={styles.addMethodButton}
                onPress={() => addPaymentMethod('card')}
            >
                <Icon name="credit-card" size={24} color="#3498db" />
                <Text style={styles.addMethodText}>Credit/Debit Card</Text>
                <Icon name="chevron-right" size={20} color="#bdc3c7" />
            </TouchableOpacity>

            <TouchableOpacity 
                style={styles.addMethodButton}
                onPress={() => addPaymentMethod('paypal')}
            >
                <Icon name="account-balance-wallet" size={24} color="#3498db" />
                <Text style={styles.addMethodText}>PayPal</Text>
                <Icon name="chevron-right" size={20} color="#bdc3c7" />
            </TouchableOpacity>

            <TouchableOpacity 
                style={styles.addMethodButton}
                onPress={() => addPaymentMethod('bank')}
            >
                <Icon name="account-balance" size={24} color="#3498db" />
                <Text style={styles.addMethodText}>Bank Account</Text>
                <Icon name="chevron-right" size={20} color="#bdc3c7" />
            </TouchableOpacity>

            <TouchableOpacity 
                style={styles.addMethodButton}
                onPress={() => addPaymentMethod('campus')}
            >
                <Icon name="school" size={24} color="#3498db" />
                <Text style={styles.addMethodText}>Campus Card</Text>
                <View style={styles.comingSoonBadge}>
                    <Text style={styles.comingSoonText}>Coming Soon</Text>
                </View>
            </TouchableOpacity>
        </View>
    );

    const renderEmptyState = () => (
        <View style={styles.emptyContainer}>
            <Icon name="credit-card-off" size={80} color="#bdc3c7" />
            <Text style={styles.emptyTitle}>No Payment Methods</Text>
            <Text style={styles.emptyText}>
                Add a payment method to make bookings and orders easier
            </Text>
        </View>
    );

    return (
        <SafeAreaView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity 
                    style={styles.backButton}
                    onPress={() => navigation.goBack()}
                >
                    <Ionicons name="arrow-back" size={24} color="#2c3e50" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Payment Methods</Text>
                <View style={styles.headerSpacer} />
            </View>

            <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
                {loading ? (
                    <View style={styles.loadingContainer}>
                        <Text style={styles.loadingText}>Loading payment methods...</Text>
                    </View>
                ) : (
                    <>
                        {paymentMethods.length > 0 ? (
                            <View style={styles.paymentMethodsContainer}>
                                <Text style={styles.sectionTitle}>Your Payment Methods</Text>
                                {paymentMethods.map(renderPaymentMethod)}
                            </View>
                        ) : (
                            renderEmptyState()
                        )}
                        
                        {renderAddPaymentOptions()}

                        {/* Payment Security Info */}
                        <View style={styles.securityContainer}>
                            <View style={styles.securityHeader}>
                                <Icon name="security" size={20} color="#27ae60" />
                                <Text style={styles.securityTitle}>Secure Payments</Text>
                            </View>
                            <Text style={styles.securityText}>
                                Your payment information is encrypted and secure. We never store your full card details on our servers.
                            </Text>
                            <View style={styles.securityFeatures}>
                                <View style={styles.securityFeature}>
                                    <Icon name="verified-user" size={16} color="#27ae60" />
                                    <Text style={styles.securityFeatureText}>256-bit SSL encryption</Text>
                                </View>
                                <View style={styles.securityFeature}>
                                    <Icon name="verified-user" size={16} color="#27ae60" />
                                    <Text style={styles.securityFeatureText}>PCI DSS compliant</Text>
                                </View>
                                <View style={styles.securityFeature}>
                                    <Icon name="verified-user" size={16} color="#27ae60" />
                                    <Text style={styles.securityFeatureText}>Fraud protection</Text>
                                </View>
                            </View>
                        </View>
                    </>
                )}
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f9f9f9',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 12,
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#ecf0f1',
    },
    backButton: {
        padding: 8,
    },
    headerTitle: {
        flex: 1,
        fontSize: 18,
        fontWeight: '600',
        color: '#2c3e50',
        textAlign: 'center',
    },
    headerSpacer: {
        width: 40,
    },
    scrollContainer: {
        flex: 1,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 40,
    },
    loadingText: {
        fontSize: 16,
        color: '#7f8c8d',
    },
    emptyContainer: {
        alignItems: 'center',
        paddingVertical: 60,
        paddingHorizontal: 32,
    },
    emptyTitle: {
        fontSize: 20,
        fontWeight: '600',
        color: '#7f8c8d',
        marginTop: 16,
        marginBottom: 8,
    },
    emptyText: {
        fontSize: 14,
        color: '#95a5a6',
        textAlign: 'center',
        lineHeight: 20,
    },
    paymentMethodsContainer: {
        padding: 16,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#2c3e50',
        marginBottom: 16,
    },
    paymentMethodCard: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 3.84,
    },
    methodHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    methodInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    methodDetails: {
        marginLeft: 12,
        flex: 1,
    },
    methodNickname: {
        fontSize: 16,
        fontWeight: '600',
        color: '#2c3e50',
        marginBottom: 2,
    },
    methodSubtext: {
        fontSize: 14,
        color: '#7f8c8d',
    },
    methodActions: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    defaultBadge: {
        backgroundColor: '#e8f5e8',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
        marginRight: 8,
    },
    defaultText: {
        fontSize: 12,
        color: '#27ae60',
        fontWeight: '600',
    },
    actionButton: {
        padding: 8,
    },
    expiryText: {
        fontSize: 12,
        color: '#7f8c8d',
        marginBottom: 8,
    },
    setDefaultButton: {
        backgroundColor: '#e3f2fd',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 6,
        alignSelf: 'flex-start',
    },
    setDefaultText: {
        fontSize: 12,
        color: '#3498db',
        fontWeight: '600',
    },
    addMethodsContainer: {
        padding: 16,
        backgroundColor: '#fff',
        marginHorizontal: 16,
        marginBottom: 16,
        borderRadius: 12,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 3.84,
    },
    addMethodButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#ecf0f1',
    },
    addMethodText: {
        flex: 1,
        marginLeft: 12,
        fontSize: 16,
        color: '#2c3e50',
    },
    comingSoonBadge: {
        backgroundColor: '#fff3e0',
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 8,
        marginRight: 8,
    },
    comingSoonText: {
        fontSize: 10,
        color: '#ff9800',
        fontWeight: '600',
    },
    securityContainer: {
        margin: 16,
        padding: 16,
        backgroundColor: '#f8fff8',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#e8f5e8',
    },
    securityHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    securityTitle: {
        marginLeft: 8,
        fontSize: 16,
        fontWeight: '600',
        color: '#27ae60',
    },
    securityText: {
        fontSize: 14,
        color: '#2c3e50',
        lineHeight: 20,
        marginBottom: 12,
    },
    securityFeatures: {
        gap: 6,
    },
    securityFeature: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    securityFeatureText: {
        marginLeft: 8,
        fontSize: 12,
        color: '#27ae60',
    },
});

export default PaymentMethodsScreen;
