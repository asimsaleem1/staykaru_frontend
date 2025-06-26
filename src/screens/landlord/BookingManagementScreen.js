import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    ScrollView,
    StyleSheet,
    TouchableOpacity,
    FlatList,
    Alert,
    RefreshControl,
    Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import LandlordNavigation from '../../components/landlord/LandlordNavigation';
import { fetchFromBackend } from '../../utils/networkUtils';

const BookingManagementScreen = ({ navigation }) => {
    const [bookings, setBookings] = useState([]);
    const [filteredBookings, setFilteredBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [filterStatus, setFilterStatus] = useState('all');
    const [selectedBooking, setSelectedBooking] = useState(null);
    const [showDetailsModal, setShowDetailsModal] = useState(false);

    const statusOptions = ['all', 'pending', 'confirmed', 'checked-in', 'checked-out', 'cancelled'];

    useEffect(() => {
        loadBookings();
    }, []);

    useEffect(() => {
        filterBookings();
    }, [filterStatus, bookings]);

    const loadBookings = async () => {
        try {
            setLoading(true);
            const response = await fetchFromBackend('/bookings/landlord');
            
            if (response.success) {
                setBookings(response.data);
                console.log('✅ Bookings loaded:', response.data.length);
            } else {
                Alert.alert('Error', 'Failed to load bookings');
            }
        } catch (error) {
            console.error('❌ Error loading bookings:', error);
            Alert.alert('Error', 'Failed to load bookings');
        } finally {
            setLoading(false);
        }
    };

    const filterBookings = () => {
        if (filterStatus === 'all') {
            setFilteredBookings(bookings);
        } else {
            setFilteredBookings(bookings.filter(booking => 
                booking.status?.toLowerCase() === filterStatus
            ));
        }
    };

    const onRefresh = async () => {
        setRefreshing(true);
        await loadBookings();
        setRefreshing(false);
    };

    const handleStatusUpdate = async (bookingId, newStatus) => {
        try {
            const response = await fetchFromBackend(`/bookings/${bookingId}/status`, {
                method: 'PUT',
                data: { status: newStatus }
            });

            if (response.success) {
                await loadBookings();
                Alert.alert('Success', `Booking ${newStatus} successfully`);
                setShowDetailsModal(false);
            } else {
                Alert.alert('Error', 'Failed to update booking status');
            }
        } catch (error) {
            console.error('❌ Error updating booking status:', error);
            Alert.alert('Error', 'Failed to update booking status');
        }
    };

    const formatPrice = (price) => {
        return new Intl.NumberFormat('en-PK', {
            style: 'currency',
            currency: 'PKR',
            minimumFractionDigits: 0,
        }).format(price);
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-PK', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    const getStatusColor = (status) => {
        switch (status?.toLowerCase()) {
            case 'confirmed': return '#4CAF50';
            case 'pending': return '#FF9800';
            case 'checked-in': return '#2196F3';
            case 'checked-out': return '#9C27B0';
            case 'cancelled': return '#F44336';
            default: return '#757575';
        }
    };

    const renderBookingCard = ({ item }) => (
        <TouchableOpacity 
            style={styles.bookingCard}
            onPress={() => {
                setSelectedBooking(item);
                setShowDetailsModal(true);
            }}
        >
            <View style={styles.bookingHeader}>
                <Text style={styles.guestName}>{item.guest?.name || 'Guest'}</Text>
                <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
                    <Text style={styles.statusText}>{item.status}</Text>
                </View>
            </View>
            
            <Text style={styles.propertyName}>{item.property?.title}</Text>
            
            <View style={styles.bookingDates}>
                <View style={styles.dateInfo}>
                    <Ionicons name="calendar-outline" size={16} color="#666" />
                    <Text style={styles.dateText}>
                        {formatDate(item.checkIn)} - {formatDate(item.checkOut)}
                    </Text>
                </View>
                <Text style={styles.nights}>
                    {Math.ceil((new Date(item.checkOut) - new Date(item.checkIn)) / (1000 * 60 * 60 * 24))} nights
                </Text>
            </View>
            
            <View style={styles.bookingFooter}>
                <Text style={styles.totalAmount}>{formatPrice(item.totalAmount)}</Text>
                <Text style={styles.bookingId}>#{item.id}</Text>
            </View>
        </TouchableOpacity>
    );

    const renderFilterTabs = () => (
        <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            style={styles.filterTabs}
        >
            {statusOptions.map((status) => (
                <TouchableOpacity
                    key={status}
                    style={[
                        styles.filterTab,
                        filterStatus === status && styles.activeFilterTab
                    ]}
                    onPress={() => setFilterStatus(status)}
                >
                    <Text style={[
                        styles.filterTabText,
                        filterStatus === status && styles.activeFilterTabText
                    ]}>
                        {status.charAt(0).toUpperCase() + status.slice(1)}
                    </Text>
                </TouchableOpacity>
            ))}
        </ScrollView>
    );

    const renderBookingDetails = () => (
        <Modal
            visible={showDetailsModal}
            animationType="slide"
            presentationStyle="pageSheet"
        >
            <SafeAreaView style={styles.modalContainer}>
                <View style={styles.modalHeader}>
                    <TouchableOpacity
                        onPress={() => setShowDetailsModal(false)}
                        style={styles.modalCloseButton}
                    >
                        <Ionicons name="close" size={24} color="#666" />
                    </TouchableOpacity>
                    <Text style={styles.modalTitle}>Booking Details</Text>
                    <View style={{ width: 40 }} />
                </View>
                
                {selectedBooking && (
                    <ScrollView style={styles.modalContent}>
                        {/* Booking Information */}
                        <View style={styles.detailSection}>
                            <Text style={styles.sectionTitle}>Booking Information</Text>
                            <View style={styles.detailRow}>
                                <Text style={styles.detailLabel}>Booking ID:</Text>
                                <Text style={styles.detailValue}>#{selectedBooking.id}</Text>
                            </View>
                            <View style={styles.detailRow}>
                                <Text style={styles.detailLabel}>Status:</Text>
                                <View style={[styles.statusBadge, { backgroundColor: getStatusColor(selectedBooking.status) }]}>
                                    <Text style={styles.statusText}>{selectedBooking.status}</Text>
                                </View>
                            </View>
                            <View style={styles.detailRow}>
                                <Text style={styles.detailLabel}>Check-in:</Text>
                                <Text style={styles.detailValue}>{formatDate(selectedBooking.checkIn)}</Text>
                            </View>
                            <View style={styles.detailRow}>
                                <Text style={styles.detailLabel}>Check-out:</Text>
                                <Text style={styles.detailValue}>{formatDate(selectedBooking.checkOut)}</Text>
                            </View>
                            <View style={styles.detailRow}>
                                <Text style={styles.detailLabel}>Total Amount:</Text>
                                <Text style={styles.detailValue}>{formatPrice(selectedBooking.totalAmount)}</Text>
                            </View>
                        </View>

                        {/* Guest Information */}
                        <View style={styles.detailSection}>
                            <Text style={styles.sectionTitle}>Guest Information</Text>
                            <View style={styles.detailRow}>
                                <Text style={styles.detailLabel}>Name:</Text>
                                <Text style={styles.detailValue}>{selectedBooking.guest?.name || 'N/A'}</Text>
                            </View>
                            <View style={styles.detailRow}>
                                <Text style={styles.detailLabel}>Email:</Text>
                                <Text style={styles.detailValue}>{selectedBooking.guest?.email || 'N/A'}</Text>
                            </View>
                            <View style={styles.detailRow}>
                                <Text style={styles.detailLabel}>Phone:</Text>
                                <Text style={styles.detailValue}>{selectedBooking.guest?.phone || 'N/A'}</Text>
                            </View>
                        </View>

                        {/* Property Information */}
                        <View style={styles.detailSection}>
                            <Text style={styles.sectionTitle}>Property Information</Text>
                            <View style={styles.detailRow}>
                                <Text style={styles.detailLabel}>Property:</Text>
                                <Text style={styles.detailValue}>{selectedBooking.property?.title || 'N/A'}</Text>
                            </View>
                            <View style={styles.detailRow}>
                                <Text style={styles.detailLabel}>Type:</Text>
                                <Text style={styles.detailValue}>{selectedBooking.property?.type || 'N/A'}</Text>
                            </View>
                            <View style={styles.detailRow}>
                                <Text style={styles.detailLabel}>Location:</Text>
                                <Text style={styles.detailValue}>
                                    {selectedBooking.property?.location?.area}, {selectedBooking.property?.location?.city}
                                </Text>
                            </View>
                        </View>

                        {/* Action Buttons */}
                        <View style={styles.actionSection}>
                            {selectedBooking.status === 'pending' && (
                                <>
                                    <TouchableOpacity
                                        style={[styles.actionButton, styles.confirmButton]}
                                        onPress={() => handleStatusUpdate(selectedBooking.id, 'confirmed')}
                                    >
                                        <Text style={styles.actionButtonText}>Confirm Booking</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        style={[styles.actionButton, styles.cancelButton]}
                                        onPress={() => handleStatusUpdate(selectedBooking.id, 'cancelled')}
                                    >
                                        <Text style={styles.actionButtonText}>Cancel Booking</Text>
                                    </TouchableOpacity>
                                </>
                            )}
                            
                            {selectedBooking.status === 'confirmed' && (
                                <TouchableOpacity
                                    style={[styles.actionButton, styles.checkinButton]}
                                    onPress={() => handleStatusUpdate(selectedBooking.id, 'checked-in')}
                                >
                                    <Text style={styles.actionButtonText}>Mark as Checked In</Text>
                                </TouchableOpacity>
                            )}
                            
                            {selectedBooking.status === 'checked-in' && (
                                <TouchableOpacity
                                    style={[styles.actionButton, styles.checkoutButton]}
                                    onPress={() => handleStatusUpdate(selectedBooking.id, 'checked-out')}
                                >
                                    <Text style={styles.actionButtonText}>Mark as Checked Out</Text>
                                </TouchableOpacity>
                            )}
                        </View>
                    </ScrollView>
                )}
            </SafeAreaView>
        </Modal>
    );

    return (
        <SafeAreaView style={styles.container}>
            {/* Header */}
            <LinearGradient
                colors={['#6B73FF', '9575CD']}
                style={styles.header}
            >
                <View style={styles.headerContent}>
                    <TouchableOpacity
                        onPress={() => navigation.goBack()}
                        style={styles.backButton}
                    >
                        <Ionicons name="arrow-back" size={24} color="#fff" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Bookings</Text>
                    <TouchableOpacity
                        style={styles.calendarButton}
                        onPress={() => navigation.navigate('BookingCalendar')}
                    >
                        <Ionicons name="calendar-outline" size={24} color="#fff" />
                    </TouchableOpacity>
                </View>
            </LinearGradient>

            {/* Filter Tabs */}
            {renderFilterTabs()}

            {/* Bookings List */}
            <FlatList
                data={filteredBookings}
                renderItem={renderBookingCard}
                keyExtractor={(item) => item.id.toString()}
                contentContainerStyle={styles.listContainer}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                }
                showsVerticalScrollIndicator={false}
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <Ionicons name="calendar-outline" size={64} color="#ccc" />
                        <Text style={styles.emptyText}>No bookings found</Text>
                        <Text style={styles.emptySubText}>
                            {filterStatus === 'all' 
                                ? 'You haven\'t received any bookings yet' 
                                : `No ${filterStatus} bookings found`
                            }
                        </Text>
                    </View>
                }
            />

            {/* Booking Details Modal */}
            {renderBookingDetails()}

            {/* Bottom Navigation */}
            <LandlordNavigation navigation={navigation} activeRoute="bookings" />
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    header: {
        paddingHorizontal: 20,
        paddingVertical: 15,
    },
    headerContent: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    backButton: {
        padding: 8,
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#fff',
        flex: 1,
        textAlign: 'center',
        marginHorizontal: 20,
    },
    calendarButton: {
        padding: 8,
    },
    filterTabs: {
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#e0e0e0',
    },
    filterTab: {
        paddingHorizontal: 20,
        paddingVertical: 12,
        marginHorizontal: 4,
        borderBottomWidth: 2,
        borderBottomColor: 'transparent',
    },
    activeFilterTab: {
        borderBottomColor: '#6B73FF',
    },
    filterTabText: {
        fontSize: 14,
        color: '#666',
        fontWeight: '500',
    },
    activeFilterTabText: {
        color: '#6B73FF',
        fontWeight: '600',
    },
    listContainer: {
        padding: 20,
    },
    bookingCard: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 15,
        marginBottom: 15,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
    },
    bookingHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    guestName: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
    },
    statusBadge: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
    },
    statusText: {
        color: '#fff',
        fontSize: 12,
        fontWeight: '600',
        textTransform: 'capitalize',
    },
    propertyName: {
        fontSize: 16,
        color: '#6B73FF',
        fontWeight: '600',
        marginBottom: 10,
    },
    bookingDates: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 10,
    },
    dateInfo: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    dateText: {
        fontSize: 14,
        color: '#666',
        marginLeft: 5,
    },
    nights: {
        fontSize: 14,
        color: '#666',
        fontWeight: '500',
    },
    bookingFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingTop: 10,
        borderTopWidth: 1,
        borderTopColor: '#f0f0f0',
    },
    totalAmount: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#4CAF50',
    },
    bookingId: {
        fontSize: 14,
        color: '#999',
        fontWeight: '500',
    },
    emptyContainer: {
        alignItems: 'center',
        paddingVertical: 60,
    },
    emptyText: {
        fontSize: 18,
        color: '#666',
        marginTop: 15,
        fontWeight: '600',
    },
    emptySubText: {
        fontSize: 14,
        color: '#999',
        marginTop: 5,
        textAlign: 'center',
    },
    // Modal Styles
    modalContainer: {
        flex: 1,
        backgroundColor: '#fff',
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#e0e0e0',
    },
    modalCloseButton: {
        padding: 5,
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
    },
    modalContent: {
        flex: 1,
        padding: 20,
    },
    detailSection: {
        marginBottom: 25,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 15,
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
        fontWeight: '500',
    },
    detailValue: {
        fontSize: 14,
        color: '#333',
        fontWeight: '600',
        flex: 1,
        textAlign: 'right',
    },
    actionSection: {
        marginTop: 20,
    },
    actionButton: {
        padding: 15,
        borderRadius: 8,
        alignItems: 'center',
        marginBottom: 10,
    },
    confirmButton: {
        backgroundColor: '#4CAF50',
    },
    cancelButton: {
        backgroundColor: '#F44336',
    },
    checkinButton: {
        backgroundColor: '#2196F3',
    },
    checkoutButton: {
        backgroundColor: '#9C27B0',
    },
    actionButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
});

export default BookingManagementScreen;
