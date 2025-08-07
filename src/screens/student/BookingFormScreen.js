import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    ScrollView,
    StyleSheet,
    TouchableOpacity,
    Alert,
    TextInput,
    Modal
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import authService from '../../services/authService';
import validationService from '../../services/validationService';

const BookingFormScreen = ({ navigation, route }) => {
    const { accommodationId } = route.params;
    const [accommodation, setAccommodation] = useState(null);
    const [loading, setLoading] = useState(false);
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [datePickerMode, setDatePickerMode] = useState('start'); // 'start' or 'end'
    
    const [bookingData, setBookingData] = useState({
        accommodation: accommodationId,
        start_date: new Date(),
        end_date: new Date(Date.now() + 24 * 60 * 60 * 1000), // Tomorrow
        guests: 1,
        payment_method: 'card',
        special_requests: '',
    });
    
    const [errors, setErrors] = useState({});

    useEffect(() => {
        loadAccommodationDetails();
    }, [accommodationId]);

    const loadAccommodationDetails = async () => {
        try {
            const response = await authService.makeAuthenticatedRequest(`/accommodations/${accommodationId}`);
            setAccommodation(response.data);
        } catch (error) {
            console.error('Load accommodation error:', error);
            Alert.alert('Error', 'Failed to load accommodation details');
            navigation.goBack();
        }
    };

    const calculateNights = () => {
        const startDate = new Date(bookingData.start_date);
        const endDate = new Date(bookingData.end_date);
        return Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24));
    };

    const calculateTotal = () => {
        const nights = calculateNights();
        const subtotal = nights * (accommodation?.price || 0);
        const serviceFee = subtotal * 0.1; // 10% service fee
        const tax = subtotal * 0.05; // 5% tax
        return {
            nights,
            subtotal,
            serviceFee,
            tax,
            total: subtotal + serviceFee + tax
        };
    };

    const validateBooking = () => {
        const newErrors = {};
        
        // Date validation
        const startDate = new Date(bookingData.start_date);
        const endDate = new Date(bookingData.end_date);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        if (startDate < today) {
            newErrors.start_date = 'Check-in date cannot be in the past';
        }
        
        if (endDate <= startDate) {
            newErrors.end_date = 'Check-out date must be after check-in date';
        }
        
        // Guests validation
        if (bookingData.guests < 1) {
            newErrors.guests = 'At least 1 guest is required';
        }
        
        if (accommodation?.max_guests && bookingData.guests > accommodation.max_guests) {
            newErrors.guests = `Maximum ${accommodation.max_guests} guests allowed`;
        }
        
        // Payment method validation
        if (!bookingData.payment_method) {
            newErrors.payment_method = 'Payment method is required';
        }
        
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleDateChange = (event, selectedDate) => {
        setShowDatePicker(false);
        
        if (selectedDate) {
            if (datePickerMode === 'start') {
                setBookingData(prev => ({
                    ...prev,
                    start_date: selectedDate,
                    // Automatically set end date to next day if it's before or equal to start date
                    end_date: prev.end_date <= selectedDate 
                        ? new Date(selectedDate.getTime() + 24 * 60 * 60 * 1000)
                        : prev.end_date
                }));
            } else {
                setBookingData(prev => ({ ...prev, end_date: selectedDate }));
            }
            
            // Clear date errors
            if (errors.start_date || errors.end_date) {
                setErrors(prev => ({
                    ...prev,
                    start_date: '',
                    end_date: ''
                }));
            }
        }
    };

    const showDatePickerModal = (mode) => {
        setDatePickerMode(mode);
        setShowDatePicker(true);
    };

    const handleCreateBooking = async () => {
        if (!validateBooking()) {
            Alert.alert('Validation Error', 'Please fix the errors and try again');
            return;
        }

        setLoading(true);
        
        try {
            const { total } = calculateTotal();
            
            const bookingPayload = {
                ...bookingData,
                total_amount: total,
                start_date: bookingData.start_date.toISOString(),
                end_date: bookingData.end_date.toISOString(),
            };

            const response = await authService.makeAuthenticatedRequest('/bookings', 'POST', bookingPayload);
            
            if (response.success) {
                Alert.alert(
                    'Booking Successful! 🎉',
                    'Your accommodation has been booked successfully.',
                    [
                        {
                            text: 'View Booking',
                            onPress: () => {
                                navigation.reset({
                                    index: 1,
                                    routes: [
                                        { name: 'StudentDashboard' },
                                        { name: 'MyBookings' }
                                    ]
                                });
                            }
                        }
                    ]
                );
            } else {
                Alert.alert('Booking Failed', response.message || 'Failed to create booking');
            }
        } catch (error) {
            console.error('Create booking error:', error);
            Alert.alert(
                'Booking Failed',
                error.response?.data?.message || 'Failed to create booking. Please try again.'
            );
        } finally {
            setLoading(false);
        }
    };

    if (!accommodation) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.loadingContainer}>
                    <Text style={styles.loadingText}>Loading accommodation details...</Text>
                </View>
            </SafeAreaView>
        );
    }

    const costBreakdown = calculateTotal();

    return (
        <SafeAreaView style={styles.container}>            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Ionicons name="arrow-back" size={24} color="#333" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Book Your Stay</Text>
                <View style={{ width: 24 }} />
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent}>
                {/* Accommodation Summary */}
                <View style={styles.accommodationSummary}>
                    <Text style={styles.accommodationTitle}>{accommodation.title}</Text>
                    <Text style={styles.accommodationType}>
                        {accommodation.type} • {accommodation.location?.city}
                    </Text>
                    <Text style={styles.accommodationPrice}>
                        ${accommodation.price}/night
                    </Text>
                </View>

                {/* Booking Details Form */}
                <View style={styles.formSection}>
                    <Text style={styles.sectionTitle}>Booking Details</Text>

                    {/* Dates */}
                    <View style={styles.dateSection}>
                        <View style={styles.dateInputContainer}>
                            <Text style={styles.inputLabel}>Check-in Date</Text>
                            <TouchableOpacity
                                style={[styles.dateInput, errors.start_date && styles.inputError]}
                                onPress={() => showDatePickerModal('start')}
                            >
                                <Ionicons name="calendar-outline" size={20} color="#666" />
                                <Text style={styles.dateInputText}>
                                    {bookingData.start_date.toLocaleDateString()}
                                </Text>
                            </TouchableOpacity>
                            {errors.start_date && (
                                <Text style={styles.errorText}>{errors.start_date}</Text>
                            )}
                        </View>

                        <View style={styles.dateInputContainer}>
                            <Text style={styles.inputLabel}>Check-out Date</Text>
                            <TouchableOpacity
                                style={[styles.dateInput, errors.end_date && styles.inputError]}
                                onPress={() => showDatePickerModal('end')}
                            >
                                <Ionicons name="calendar-outline" size={20} color="#666" />
                                <Text style={styles.dateInputText}>
                                    {bookingData.end_date.toLocaleDateString()}
                                </Text>
                            </TouchableOpacity>
                            {errors.end_date && (
                                <Text style={styles.errorText}>{errors.end_date}</Text>
                            )}
                        </View>
                    </View>

                    {/* Guests */}
                    <View style={styles.inputContainer}>
                        <Text style={styles.inputLabel}>Number of Guests</Text>
                        <View style={styles.guestSelector}>                            <TouchableOpacity
                                style={styles.guestButton}
                                onPress={() => {
                                    if (bookingData.guests > 1) {
                                        setBookingData(prev => ({ ...prev, guests: prev.guests - 1 }));
                                    }
                                }}
                                disabled={bookingData.guests <= 1}
                            >
                                <Ionicons name="remove" size={20} color={bookingData.guests <= 1 ? "#ccc" : "#666"} />
                            </TouchableOpacity>
                            <Text style={styles.guestCount}>{bookingData.guests}</Text>
                            <TouchableOpacity
                                style={styles.guestButton}
                                onPress={() => {
                                    const maxGuests = accommodation.max_guests || 10;
                                    if (bookingData.guests < maxGuests) {
                                        setBookingData(prev => ({ ...prev, guests: prev.guests + 1 }));
                                    }
                                }}
                                disabled={bookingData.guests >= (accommodation.max_guests || 10)}
                            >
                                <Ionicons 
                                    name="add" 
                                    size={20} 
                                    color={bookingData.guests >= (accommodation.max_guests || 10) ? "#ccc" : "#666"} 
                                />
                            </TouchableOpacity>
                        </View>
                        {accommodation.max_guests && (
                            <Text style={styles.helperText}>
                                Maximum {accommodation.max_guests} guests allowed
                            </Text>
                        )}
                        {errors.guests && (
                            <Text style={styles.errorText}>{errors.guests}</Text>
                        )}
                    </View>

                    {/* Payment Method */}
                    <View style={styles.inputContainer}>
                        <Text style={styles.inputLabel}>Payment Method</Text>
                        <View style={styles.paymentMethods}>
                            {[
                                { value: 'card', label: 'Credit/Debit Card', icon: 'card-outline' },
                                { value: 'bank_transfer', label: 'Bank Transfer', icon: 'business-outline' },
                                { value: 'paypal', label: 'PayPal', icon: 'wallet-outline' }
                            ].map((method) => (
                                <TouchableOpacity
                                    key={method.value}
                                    style={[
                                        styles.paymentMethod,
                                        bookingData.payment_method === method.value && styles.selectedPaymentMethod
                                    ]}
                                    onPress={() => setBookingData(prev => ({ 
                                        ...prev, 
                                        payment_method: method.value 
                                    }))}
                                >                                    <Ionicons name={method.icon} size={20} color="#666" />
                                    <Text style={styles.paymentMethodText}>{method.label}</Text>
                                    {bookingData.payment_method === method.value && (
                                        <Ionicons name="checkmark-circle" size={20} color="#4A90E2" />
                                    )}
                                </TouchableOpacity>
                            ))}
                        </View>
                        {errors.payment_method && (
                            <Text style={styles.errorText}>{errors.payment_method}</Text>
                        )}
                    </View>

                    {/* Special Requests */}
                    <View style={styles.inputContainer}>
                        <Text style={styles.inputLabel}>Special Requests (Optional)</Text>
                        <TextInput
                            style={styles.textArea}
                            multiline
                            numberOfLines={4}
                            placeholder="Any special requests for your stay?"
                            value={bookingData.special_requests}
                            onChangeText={(text) => setBookingData(prev => ({ 
                                ...prev, 
                                special_requests: text 
                            }))}
                        />
                    </View>
                </View>

                {/* Booking Summary */}
                <View style={styles.summarySection}>
                    <Text style={styles.sectionTitle}>Booking Summary</Text>
                    
                    <View style={styles.summaryRow}>
                        <Text style={styles.summaryLabel}>Accommodation:</Text>
                        <Text style={styles.summaryValue}>{accommodation.title}</Text>
                    </View>
                    
                    <View style={styles.summaryRow}>
                        <Text style={styles.summaryLabel}>Dates:</Text>
                        <Text style={styles.summaryValue}>
                            {bookingData.start_date.toLocaleDateString()} - {bookingData.end_date.toLocaleDateString()}
                        </Text>
                    </View>
                    
                    <View style={styles.summaryRow}>
                        <Text style={styles.summaryLabel}>Guests:</Text>
                        <Text style={styles.summaryValue}>{bookingData.guests}</Text>
                    </View>
                    
                    <View style={styles.summaryDivider} />
                    
                    <View style={styles.summaryRow}>
                        <Text style={styles.summaryLabel}>
                            ${accommodation.price} x {costBreakdown.nights} nights:
                        </Text>
                        <Text style={styles.summaryValue}>${costBreakdown.subtotal.toFixed(2)}</Text>
                    </View>
                    
                    <View style={styles.summaryRow}>
                        <Text style={styles.summaryLabel}>Service fee:</Text>
                        <Text style={styles.summaryValue}>${costBreakdown.serviceFee.toFixed(2)}</Text>
                    </View>
                    
                    <View style={styles.summaryRow}>
                        <Text style={styles.summaryLabel}>Tax:</Text>
                        <Text style={styles.summaryValue}>${costBreakdown.tax.toFixed(2)}</Text>
                    </View>
                    
                    <View style={styles.summaryDivider} />
                    
                    <View style={styles.summaryRow}>
                        <Text style={styles.summaryTotalLabel}>Total:</Text>
                        <Text style={styles.summaryTotalValue}>${costBreakdown.total.toFixed(2)}</Text>
                    </View>
                </View>
            </ScrollView>

            {/* Bottom Action Bar */}
            <View style={styles.bottomBar}>
                <View style={styles.totalInfo}>
                    <Text style={styles.totalLabel}>Total</Text>
                    <Text style={styles.totalValue}>${costBreakdown.total.toFixed(2)}</Text>
                </View>
                <TouchableOpacity
                    style={[styles.bookButton, loading && styles.bookButtonDisabled]}
                    onPress={handleCreateBooking}
                    disabled={loading}
                >
                    <Text style={styles.bookButtonText}>
                        {loading ? 'Creating Booking...' : 'Confirm Booking'}
                    </Text>
                </TouchableOpacity>
            </View>

            {/* Date Picker Modal */}
            {showDatePicker && (
                <DateTimePicker
                    value={datePickerMode === 'start' ? bookingData.start_date : bookingData.end_date}
                    mode="date"
                    display="default"
                    minimumDate={datePickerMode === 'start' ? new Date() : bookingData.start_date}
                    onChange={handleDateChange}
                />
            )}
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
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#e0e0e0',
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#333',
    },
    scrollContent: {
        flexGrow: 1,
        paddingBottom: 100,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        fontSize: 16,
        color: '#666',
    },
    accommodationSummary: {
        backgroundColor: '#fff',
        padding: 20,
        marginBottom: 20,
    },
    accommodationTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 5,
    },
    accommodationType: {
        fontSize: 14,
        color: '#666',
        marginBottom: 10,
    },
    accommodationPrice: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#4A90E2',
    },
    formSection: {
        backgroundColor: '#fff',
        padding: 20,
        marginBottom: 20,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 20,
    },
    dateSection: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 20,
    },
    dateInputContainer: {
        flex: 1,
        marginHorizontal: 5,
    },
    inputLabel: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 8,
    },
    dateInput: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f5f5f5',
        borderRadius: 10,
        paddingHorizontal: 15,
        paddingVertical: 12,
        borderWidth: 1,
        borderColor: 'transparent',
    },
    inputError: {
        borderColor: '#e74c3c',
    },
    dateInputText: {
        fontSize: 16,
        color: '#333',
        marginLeft: 10,
    },
    inputContainer: {
        marginBottom: 20,
    },
    guestSelector: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#f5f5f5',
        borderRadius: 10,
        paddingVertical: 10,
    },
    guestButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#fff',
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
    },
    guestCount: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
        marginHorizontal: 30,
    },
    helperText: {
        fontSize: 12,
        color: '#666',
        marginTop: 5,
    },
    errorText: {
        fontSize: 12,
        color: '#e74c3c',
        marginTop: 5,
    },
    paymentMethods: {
        marginTop: 10,
    },
    paymentMethod: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f5f5f5',
        borderRadius: 10,
        paddingHorizontal: 15,
        paddingVertical: 12,
        marginBottom: 10,
        borderWidth: 2,
        borderColor: 'transparent',
    },
    selectedPaymentMethod: {
        borderColor: '#4A90E2',
        backgroundColor: '#f0f8ff',
    },
    paymentMethodText: {
        fontSize: 16,
        color: '#333',
        marginLeft: 10,
        flex: 1,
    },
    textArea: {
        backgroundColor: '#f5f5f5',
        borderRadius: 10,
        paddingHorizontal: 15,
        paddingVertical: 12,
        fontSize: 16,
        color: '#333',
        textAlignVertical: 'top',
        minHeight: 100,
    },
    summarySection: {
        backgroundColor: '#fff',
        padding: 20,
        marginBottom: 20,
    },
    summaryRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 10,
    },
    summaryLabel: {
        fontSize: 14,
        color: '#666',
        flex: 1,
    },
    summaryValue: {
        fontSize: 14,
        color: '#333',
        textAlign: 'right',
    },
    summaryDivider: {
        height: 1,
        backgroundColor: '#e0e0e0',
        marginVertical: 15,
    },
    summaryTotalLabel: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
    },
    summaryTotalValue: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#4A90E2',
    },
    bottomBar: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingVertical: 15,
        paddingBottom: 30,
        backgroundColor: '#fff',
        borderTopWidth: 1,
        borderTopColor: '#e0e0e0',
    },
    totalInfo: {
        flex: 1,
    },
    totalLabel: {
        fontSize: 12,
        color: '#666',
    },
    totalValue: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
    },
    bookButton: {
        backgroundColor: '#4A90E2',
        paddingHorizontal: 30,
        paddingVertical: 15,
        borderRadius: 25,
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 3,
    },
    bookButtonDisabled: {
        backgroundColor: '#ccc',
    },
    bookButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
});

export default BookingFormScreen;
