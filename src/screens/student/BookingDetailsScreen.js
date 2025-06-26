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
    Dimensions
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import studentApiService from '../../services/studentApiService';

const { width } = Dimensions.get('window');

const BookingDetailsScreen = ({ route, navigation }) => {
    const { bookingId, booking: initialBooking } = route.params;
    const [booking, setBooking] = useState(initialBooking || null);
    const [loading, setLoading] = useState(!initialBooking);

    useEffect(() => {
        if (!initialBooking && bookingId) {
            loadBookingDetails();
        }
    }, [bookingId, initialBooking]);

    const loadBookingDetails = async () => {
        try {
            setLoading(true);
            const bookingData = await studentApiService.getBookingDetails(bookingId);
            setBooking(bookingData);
        } catch (error) {
            console.error('Error loading booking details:', error);
            Alert.alert('Error', 'Failed to load booking details');
            navigation.goBack();
        } finally {
            setLoading(false);
        }
    };

    const getStatusColor = (status) => {
        switch (status?.toLowerCase()) {
            case 'confirmed': return '#28a745';
            case 'pending': return '#ffc107';
            case 'cancelled': return '#dc3545';
            case 'completed': return '#6f42c1';
            default: return '#6c757d';
        }
    };

    const getStatusIcon = (status) => {
        switch (status?.toLowerCase()) {
            case 'confirmed': return 'checkmark-circle';
            case 'pending': return 'time';
            case 'cancelled': return 'close-circle';
            case 'completed': return 'flag';
            default: return 'help-circle';
        }
    };

    const handleCancelBooking = () => {
        Alert.alert(
            'Cancel Booking',
            'Are you sure you want to cancel this booking? This action cannot be undone.',
            [
                { text: 'No', style: 'cancel' },
                { 
                    text: 'Yes, Cancel', 
                    style: 'destructive',
                    onPress: cancelBooking
                }
            ]
        );
    };

    const cancelBooking = async () => {
        try {
            setLoading(true);
            await studentApiService.cancelBooking(bookingId, 'User requested cancellation');
            
            Alert.alert(
                'Booking Cancelled',
                'Your booking has been cancelled successfully.',
                [{ text: 'OK', onPress: () => navigation.goBack() }]
            );
        } catch (error) {
            console.error('Error cancelling booking:', error);
            Alert.alert('Error', 'Failed to cancel booking. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            weekday: 'short',
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    if (loading) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => navigation.goBack()}>
                        <Ionicons name="arrow-back" size={24} color="#333" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Booking Details</Text>
                    <View style={{ width: 24 }} />
                </View>
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#007bff" />
                    <Text style={styles.loadingText}>Loading booking details...</Text>
                </View>
            </SafeAreaView>
        );
    }

    if (!booking) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => navigation.goBack()}>
                        <Ionicons name="arrow-back" size={24} color="#333" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Booking Details</Text>
                    <View style={{ width: 24 }} />
                </View>
                <View style={styles.errorContainer}>
                    <Ionicons name="alert-circle" size={64} color="#dc3545" />
                    <Text style={styles.errorText}>Booking not found</Text>
                    <TouchableOpacity 
                        style={styles.retryButton}
                        onPress={() => navigation.goBack()}
                    >
                        <Text style={styles.retryButtonText}>Go Back</Text>
                    </TouchableOpacity>
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
                <Text style={styles.headerTitle}>Booking Details</Text>
                <View style={{ width: 24 }} />
            </View>

            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                {/* Status Card */}
                <View style={styles.statusCard}>
                    <View style={styles.statusHeader}>
                        <Ionicons 
                            name={getStatusIcon(booking.status)} 
                            size={24} 
                            color={getStatusColor(booking.status)} 
                        />
                        <Text style={[styles.statusText, { color: getStatusColor(booking.status) }]}>
                            {booking.status?.toUpperCase() || 'UNKNOWN'}
                        </Text>
                    </View>
                    <Text style={styles.bookingId}>
                        Booking ID: {booking._id || booking.id || 'N/A'}
                    </Text>
                </View>

                {/* Accommodation Details */}
                {booking.accommodation && (
                    <View style={styles.card}>
                        <Text style={styles.cardTitle}>Accommodation</Text>
                        <View style={styles.accommodationInfo}>
                            {booking.accommodation.images?.[0] && (
                                <Image 
                                    source={{ uri: booking.accommodation.images[0] }}
                                    style={styles.accommodationImage}
                                />
                            )}
                            <View style={styles.accommodationDetails}>
                                <Text style={styles.accommodationName}>
                                    {booking.accommodation.name || 'Accommodation'}
                                </Text>
                                <Text style={styles.accommodationLocation}>
                                    <Ionicons name="location" size={14} color="#666" />
                                    {' '}{booking.accommodation.location || 'Location not specified'}
                                </Text>
                            </View>
                        </View>
                    </View>
                )}

                {/* Booking Details */}
                <View style={styles.card}>
                    <Text style={styles.cardTitle}>Booking Information</Text>
                    
                    <View style={styles.detailRow}>
                        <Text style={styles.detailLabel}>Check-in Date:</Text>
                        <Text style={styles.detailValue}>
                            {formatDate(booking.checkInDate || booking.checkIn)}
                        </Text>
                    </View>
                    
                    <View style={styles.detailRow}>
                        <Text style={styles.detailLabel}>Check-out Date:</Text>
                        <Text style={styles.detailValue}>
                            {formatDate(booking.checkOutDate || booking.checkOut)}
                        </Text>
                    </View>
                    
                    {booking.guests && (
                        <View style={styles.detailRow}>
                            <Text style={styles.detailLabel}>Guests:</Text>
                            <Text style={styles.detailValue}>{booking.guests}</Text>
                        </View>
                    )}
                    
                    <View style={styles.detailRow}>
                        <Text style={styles.detailLabel}>Total Amount:</Text>
                        <Text style={styles.detailValueBold}>
                            Rs. {booking.total_amount || booking.totalAmount || 0}
                        </Text>
                    </View>
                    
                    <View style={styles.detailRow}>
                        <Text style={styles.detailLabel}>Booking Date:</Text>
                        <Text style={styles.detailValue}>
                            {formatDate(booking.createdAt)}
                        </Text>
                    </View>
                </View>

                {/* Payment Information */}
                <View style={styles.card}>
                    <Text style={styles.cardTitle}>Payment Information</Text>
                    
                    <View style={styles.detailRow}>
                        <Text style={styles.detailLabel}>Payment Status:</Text>
                        <Text style={[
                            styles.detailValue,
                            { color: booking.paymentStatus === 'paid' ? '#28a745' : '#ffc107' }
                        ]}>
                            {booking.paymentStatus?.toUpperCase() || 'PENDING'}
                        </Text>
                    </View>
                    
                    {booking.paymentMethod && (
                        <View style={styles.detailRow}>
                            <Text style={styles.detailLabel}>Payment Method:</Text>
                            <Text style={styles.detailValue}>
                                {booking.paymentMethod.toUpperCase()}
                            </Text>
                        </View>
                    )}
                </View>

                {/* Action Buttons */}
                <View style={styles.actionButtons}>
                    {booking.status === 'pending' && (
                        <TouchableOpacity 
                            style={styles.cancelButton}
                            onPress={handleCancelBooking}
                        >
                            <Ionicons name="close-circle" size={20} color="#fff" />
                            <Text style={styles.cancelButtonText}>Cancel Booking</Text>
                        </TouchableOpacity>
                    )}
                    
                    <TouchableOpacity 
                        style={styles.contactButton}
                        onPress={() => {
                            // Navigate to chat or contact
                            Alert.alert('Contact', 'Contact feature coming soon!');
                        }}
                    >
                        <Ionicons name="chatbubble" size={20} color="#007bff" />
                        <Text style={styles.contactButtonText}>Contact Host</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
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
        paddingHorizontal: 16,
        paddingVertical: 12,
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#e0e0e0',
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#333',
    },
    content: {
        flex: 1,
        padding: 16,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        marginTop: 16,
        fontSize: 16,
        color: '#666',
    },
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 32,
    },
    errorText: {
        fontSize: 18,
        color: '#dc3545',
        marginTop: 16,
        textAlign: 'center',
    },
    retryButton: {
        marginTop: 24,
        backgroundColor: '#007bff',
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 8,
    },
    retryButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
    statusCard: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 20,
        marginBottom: 16,
        alignItems: 'center',
    },
    statusHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    statusText: {
        fontSize: 18,
        fontWeight: 'bold',
        marginLeft: 8,
    },
    bookingId: {
        fontSize: 14,
        color: '#666',
    },
    card: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 20,
        marginBottom: 16,
    },
    cardTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#333',
        marginBottom: 16,
    },
    accommodationInfo: {
        flexDirection: 'row',
    },
    accommodationImage: {
        width: 80,
        height: 60,
        borderRadius: 8,
        marginRight: 12,
    },
    accommodationDetails: {
        flex: 1,
    },
    accommodationName: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
        marginBottom: 4,
    },
    accommodationLocation: {
        fontSize: 14,
        color: '#666',
        flexDirection: 'row',
        alignItems: 'center',
    },
    detailRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 8,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    detailLabel: {
        fontSize: 14,
        color: '#666',
        flex: 1,
    },
    detailValue: {
        fontSize: 14,
        color: '#333',
        fontWeight: '500',
        flex: 1,
        textAlign: 'right',
    },
    detailValueBold: {
        fontSize: 16,
        color: '#333',
        fontWeight: 'bold',
        flex: 1,
        textAlign: 'right',
    },
    actionButtons: {
        marginTop: 16,
        marginBottom: 32,
    },
    cancelButton: {
        backgroundColor: '#dc3545',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 14,
        borderRadius: 8,
        marginBottom: 12,
    },
    cancelButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
        marginLeft: 8,
    },
    contactButton: {
        backgroundColor: '#fff',
        borderWidth: 2,
        borderColor: '#007bff',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 14,
        borderRadius: 8,
    },
    contactButtonText: {
        color: '#007bff',
        fontSize: 16,
        fontWeight: '600',
        marginLeft: 8,
    },
});

export default BookingDetailsScreen;
