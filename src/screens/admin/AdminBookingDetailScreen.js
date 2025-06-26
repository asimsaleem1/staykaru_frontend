import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Alert,
    ActivityIndicator,
    Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SIZES } from '../../utils/constants';
import adminApiService from '../../services/adminApiService';

const { width } = Dimensions.get('window');

const AdminBookingDetailScreen = ({ navigation, route }) => {
    const { bookingId } = route.params;
    const [booking, setBooking] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadBookingDetails();
    }, [bookingId]);

    const loadBookingDetails = async () => {
        try {
            setLoading(true);
            const response = await adminApiService.getBookingDetails(bookingId);
            if (response.success) {
                setBooking(response.data);
            } else {
                throw new Error(response.message);
            }
        } catch (error) {
            console.error('Error loading booking details:', error);
            Alert.alert('Error', 'Failed to load booking details');
            navigation.goBack();
        } finally {
            setLoading(false);
        }
    };

    const updateBookingStatus = async (status) => {
        try {
            const response = await adminApiService.updateBookingStatus(bookingId, status);
            if (response.success) {
                setBooking(prev => ({ ...prev, status }));
                Alert.alert('Success', `Booking ${status} successfully`);
            } else {
                throw new Error(response.message);
            }
        } catch (error) {
            console.error('Error updating booking status:', error);
            Alert.alert('Error', 'Failed to update booking status');
        }
    };

    const formatCurrency = (amount) => {
        return `₨${amount?.toLocaleString('en-PK') || '0'}`;
    };

    const getStatusColor = (status) => {
        switch (status?.toLowerCase()) {
            case 'confirmed': return '#2ecc71';
            case 'pending': return '#f39c12';
            case 'cancelled': return '#e74c3c';
            case 'completed': return '#3498db';
            default: return '#7f8c8d';
        }
    };

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={COLORS.primary} />
                <Text style={styles.loadingText}>Loading booking details...</Text>
            </View>
        );
    }

    if (!booking) {
        return (
            <View style={styles.errorContainer}>
                <Text style={styles.errorText}>Booking not found</Text>
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
                <Text style={styles.headerTitle}>Booking Details</Text>
                <View style={styles.headerRight} />
            </View>

            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                {/* Booking Info Card */}
                <View style={styles.card}>
                    <View style={styles.cardHeader}>
                        <Text style={styles.cardTitle}>Booking Information</Text>
                        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(booking.status) }]}>
                            <Text style={styles.statusText}>{booking.status?.toUpperCase()}</Text>
                        </View>
                    </View>

                    <View style={styles.infoRow}>
                        <Text style={styles.infoLabel}>Booking ID:</Text>
                        <Text style={styles.infoValue}>{booking.id}</Text>
                    </View>

                    <View style={styles.infoRow}>
                        <Text style={styles.infoLabel}>Check-in:</Text>
                        <Text style={styles.infoValue}>{new Date(booking.checkIn).toLocaleDateString()}</Text>
                    </View>

                    <View style={styles.infoRow}>
                        <Text style={styles.infoLabel}>Check-out:</Text>
                        <Text style={styles.infoValue}>{new Date(booking.checkOut).toLocaleDateString()}</Text>
                    </View>

                    <View style={styles.infoRow}>
                        <Text style={styles.infoLabel}>Duration:</Text>
                        <Text style={styles.infoValue}>{booking.duration || 'N/A'} nights</Text>
                    </View>

                    <View style={styles.infoRow}>
                        <Text style={styles.infoLabel}>Total Amount:</Text>
                        <Text style={[styles.infoValue, styles.amountText]}>{formatCurrency(booking.totalAmount)}</Text>
                    </View>
                </View>

                {/* Guest Information */}
                <View style={styles.card}>
                    <Text style={styles.cardTitle}>Guest Information</Text>
                    
                    <View style={styles.infoRow}>
                        <Text style={styles.infoLabel}>Name:</Text>
                        <Text style={styles.infoValue}>{booking.guest?.name || 'N/A'}</Text>
                    </View>

                    <View style={styles.infoRow}>
                        <Text style={styles.infoLabel}>Email:</Text>
                        <Text style={styles.infoValue}>{booking.guest?.email || 'N/A'}</Text>
                    </View>

                    <View style={styles.infoRow}>
                        <Text style={styles.infoLabel}>Phone:</Text>
                        <Text style={styles.infoValue}>{booking.guest?.phone || 'N/A'}</Text>
                    </View>

                    <View style={styles.infoRow}>
                        <Text style={styles.infoLabel}>Guests:</Text>
                        <Text style={styles.infoValue}>{booking.guests || 1}</Text>
                    </View>
                </View>

                {/* Property Information */}
                <View style={styles.card}>
                    <Text style={styles.cardTitle}>Property Information</Text>
                    
                    <View style={styles.infoRow}>
                        <Text style={styles.infoLabel}>Property:</Text>
                        <Text style={styles.infoValue}>{booking.property?.title || 'N/A'}</Text>
                    </View>

                    <View style={styles.infoRow}>
                        <Text style={styles.infoLabel}>Address:</Text>
                        <Text style={styles.infoValue}>{booking.property?.address || 'N/A'}</Text>
                    </View>

                    <View style={styles.infoRow}>
                        <Text style={styles.infoLabel}>Landlord:</Text>
                        <Text style={styles.infoValue}>{booking.property?.landlord?.name || 'N/A'}</Text>
                    </View>
                </View>

                {/* Payment Information */}
                <View style={styles.card}>
                    <Text style={styles.cardTitle}>Payment Information</Text>
                    
                    <View style={styles.infoRow}>
                        <Text style={styles.infoLabel}>Payment Status:</Text>
                        <Text style={[styles.infoValue, { color: getStatusColor(booking.paymentStatus) }]}>
                            {booking.paymentStatus?.toUpperCase() || 'PENDING'}
                        </Text>
                    </View>

                    <View style={styles.infoRow}>
                        <Text style={styles.infoLabel}>Payment Method:</Text>
                        <Text style={styles.infoValue}>{booking.paymentMethod || 'N/A'}</Text>
                    </View>

                    <View style={styles.infoRow}>
                        <Text style={styles.infoLabel}>Transaction ID:</Text>
                        <Text style={styles.infoValue}>{booking.transactionId || 'N/A'}</Text>
                    </View>
                </View>

                {/* Action Buttons */}
                {booking.status === 'pending' && (
                    <View style={styles.actionButtons}>
                        <TouchableOpacity 
                            style={[styles.actionButton, styles.confirmButton]}
                            onPress={() => updateBookingStatus('confirmed')}
                        >
                            <Ionicons name="checkmark" size={20} color={COLORS.white} />
                            <Text style={styles.actionButtonText}>Confirm</Text>
                        </TouchableOpacity>

                        <TouchableOpacity 
                            style={[styles.actionButton, styles.cancelButton]}
                            onPress={() => updateBookingStatus('cancelled')}
                        >
                            <Ionicons name="close" size={20} color={COLORS.white} />
                            <Text style={styles.actionButtonText}>Cancel</Text>
                        </TouchableOpacity>
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
    actionButtonText: {
        color: COLORS.white,
        fontSize: 16,
        fontWeight: 'bold',
        marginLeft: 8,
    },
});

export default AdminBookingDetailScreen;
