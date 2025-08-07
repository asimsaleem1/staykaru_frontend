import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    ScrollView,
    StyleSheet,
    TouchableOpacity,
    Image,
    Alert,
    RefreshControl
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { Ionicons } from '@expo/vector-icons';
import authService from '../../services/authService';
import { testBackendConnection, getMockData } from '../../utils/networkUtils';

const MyBookingsScreen = ({ navigation }) => {
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [activeTab, setActiveTab] = useState('upcoming'); // 'upcoming', 'past', 'cancelled'

    useEffect(() => {
        loadBookings();
    }, []);    const loadBookings = async () => {
        try {
            setLoading(true);
            
            // Test backend connection first
            const connectionTest = await testBackendConnection();
            
            if (connectionTest.success) {
                // Backend is available - fetch real data
                const response = await authService.makeAuthenticatedRequest('/bookings/my-bookings');
                setBookings(response.data || []);
            } else {
                console.log('Backend not available, using mock bookings data');
                // Backend not available - use mock data
                const mockBookings = getMockData('bookings');
                setBookings(mockBookings);
            }
        } catch (error) {
            console.error('Load bookings error:', error);
            // Fallback to mock data on error
            console.log('Error loading bookings, using mock data as fallback');
            const mockBookings = getMockData('bookings');
            setBookings(mockBookings);
        } finally {
            setLoading(false);
        }
    };

    const onRefresh = async () => {
        setRefreshing(true);
        await loadBookings();
        setRefreshing(false);
    };

    const handleCancelBooking = async (bookingId) => {
        Alert.alert(
            'Cancel Booking',
            'Are you sure you want to cancel this booking? This action cannot be undone.',
            [
                { text: 'No', style: 'cancel' },
                {
                    text: 'Yes, Cancel',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await authService.makeAuthenticatedRequest(
                                `/bookings/${bookingId}/cancel`,
                                'PUT',
                                { reason: 'Cancelled by user' }
                            );
                            Alert.alert('Success', 'Booking cancelled successfully');
                            loadBookings();
                        } catch (error) {
                            console.error('Cancel booking error:', error);
                            Alert.alert('Error', 'Failed to cancel booking');
                        }
                    }
                }
            ]
        );
    };

    const getStatusColor = (status) => {
        switch (status.toLowerCase()) {
            case 'confirmed':
                return '#4CAF50';
            case 'pending':
                return '#FF9800';
            case 'cancelled':
                return '#f44336';
            case 'completed':
                return '#2196F3';
            default:
                return '#666';
        }
    };

    const getStatusIcon = (status) => {
        switch (status.toLowerCase()) {
            case 'confirmed':
                return 'check-circle';
            case 'pending':
                return 'schedule';
            case 'cancelled':
                return 'cancel';
            case 'completed':
                return 'done-all';
            default:
                return 'info';
        }
    };

    const filterBookingsByTab = (bookings, tab) => {
        const now = new Date();
        
        switch (tab) {
            case 'upcoming':
                return bookings.filter(booking => 
                    ['confirmed', 'pending'].includes(booking.status?.toLowerCase()) &&
                    new Date(booking.start_date) >= now
                );
            case 'past':
                return bookings.filter(booking => 
                    booking.status?.toLowerCase() === 'completed' ||
                    (new Date(booking.end_date) < now && booking.status?.toLowerCase() !== 'cancelled')
                );
            case 'cancelled':
                return bookings.filter(booking => 
                    booking.status?.toLowerCase() === 'cancelled'
                );
            default:
                return bookings;
        }
    };

    const filteredBookings = filterBookingsByTab(bookings, activeTab);

    const BookingCard = ({ booking }) => {
        const canCancel = booking.status?.toLowerCase() === 'confirmed' && 
                         new Date(booking.start_date) > new Date();
        
        return (
            <View style={styles.bookingCard}>
                <View style={styles.bookingHeader}>
                    <View style={styles.bookingImageContainer}>
                        <Image
                            source={{ 
                                uri: booking.accommodation?.images?.[0] || 'https://via.placeholder.com/100x80' 
                            }}
                            style={styles.bookingImage}
                        />
                        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(booking.status) }]}>
                            <Icon 
                                name={getStatusIcon(booking.status)} 
                                size={12} 
                                color="#fff" 
                            />
                            <Text style={styles.statusText}>{booking.status}</Text>
                        </View>
                    </View>
                    
                    <View style={styles.bookingInfo}>
                        <Text style={styles.accommodationTitle} numberOfLines={2}>
                            {booking.accommodation?.title || 'Accommodation'}
                        </Text>
                        <Text style={styles.accommodationLocation}>
                            {booking.accommodation?.location?.city || 'Location'}
                        </Text>
                        
                        <View style={styles.bookingDetails}>
                            <View style={styles.detailItem}>
                                <Icon name="calendar-today" size={16} color="#666" />
                                <Text style={styles.detailText}>
                                    {new Date(booking.start_date).toLocaleDateString()} - {' '}
                                    {new Date(booking.end_date).toLocaleDateString()}
                                </Text>
                            </View>
                            
                            <View style={styles.detailItem}>
                                <Icon name="people" size={16} color="#666" />
                                <Text style={styles.detailText}>
                                    {booking.guests} guest{booking.guests > 1 ? 's' : ''}
                                </Text>
                            </View>
                            
                            <View style={styles.detailItem}>
                                <Icon name="payment" size={16} color="#666" />
                                <Text style={styles.totalAmount}>
                                    ${booking.total_amount?.toFixed(2) || '0.00'}
                                </Text>
                            </View>
                        </View>
                    </View>
                </View>

                {booking.special_requests && (
                    <View style={styles.specialRequests}>
                        <Text style={styles.specialRequestsTitle}>Special Requests:</Text>
                        <Text style={styles.specialRequestsText}>{booking.special_requests}</Text>
                    </View>
                )}

                <View style={styles.bookingActions}>
                    <TouchableOpacity 
                        style={styles.viewButton}
                        onPress={() => navigation.navigate('AccommodationDetail', { 
                            id: booking.accommodation?._id 
                        })}
                    >
                        <Text style={styles.viewButtonText}>View Details</Text>
                    </TouchableOpacity>
                    
                    {canCancel && (
                        <TouchableOpacity 
                            style={styles.cancelButton}
                            onPress={() => handleCancelBooking(booking._id)}
                        >
                            <Text style={styles.cancelButtonText}>Cancel</Text>
                        </TouchableOpacity>
                    )}
                    
                    {booking.status?.toLowerCase() === 'completed' && (
                        <TouchableOpacity style={styles.reviewButton}>
                            <Text style={styles.reviewButtonText}>Write Review</Text>
                        </TouchableOpacity>
                    )}
                </View>
            </View>
        );
    };

    const TabButton = ({ title, isActive, onPress, count }) => (
        <TouchableOpacity
            style={[styles.tabButton, isActive && styles.activeTabButton]}
            onPress={onPress}
        >
            <Text style={[styles.tabButtonText, isActive && styles.activeTabButtonText]}>
                {title}
            </Text>
            {count > 0 && (
                <View style={styles.tabBadge}>
                    <Text style={styles.tabBadgeText}>{count}</Text>
                </View>
            )}
        </TouchableOpacity>
    );

    return (
        <SafeAreaView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Icon name="arrow-back" size={24} color="#333" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>My Bookings</Text>
                <TouchableOpacity onPress={loadBookings}>
                    <Icon name="refresh" size={24} color="#333" />
                </TouchableOpacity>
            </View>

            {/* Tabs */}
            <View style={styles.tabsContainer}>
                <TabButton
                    title="Upcoming"
                    isActive={activeTab === 'upcoming'}
                    onPress={() => setActiveTab('upcoming')}
                    count={filterBookingsByTab(bookings, 'upcoming').length}
                />
                <TabButton
                    title="Past"
                    isActive={activeTab === 'past'}
                    onPress={() => setActiveTab('past')}
                    count={filterBookingsByTab(bookings, 'past').length}
                />
                <TabButton
                    title="Cancelled"
                    isActive={activeTab === 'cancelled'}
                    onPress={() => setActiveTab('cancelled')}
                    count={filterBookingsByTab(bookings, 'cancelled').length}
                />
            </View>

            {/* Bookings List */}
            <ScrollView
                contentContainerStyle={styles.scrollContent}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                }
            >
                {loading ? (
                    <View style={styles.loadingContainer}>
                        <Text style={styles.loadingText}>Loading bookings...</Text>
                    </View>
                ) : filteredBookings.length === 0 ? (
                    <View style={styles.emptyContainer}>
                        <Icon 
                            name={
                                activeTab === 'upcoming' ? 'event' :
                                activeTab === 'past' ? 'history' : 'cancel'
                            } 
                            size={64} 
                            color="#ccc" 
                        />
                        <Text style={styles.emptyTitle}>
                            {activeTab === 'upcoming' ? 'No Upcoming Bookings' :
                             activeTab === 'past' ? 'No Past Bookings' : 'No Cancelled Bookings'}
                        </Text>
                        <Text style={styles.emptyText}>
                            {activeTab === 'upcoming' 
                                ? 'Book your first accommodation to see it here!'
                                : 'Your booking history will appear here.'}
                        </Text>
                        {activeTab === 'upcoming' && (
                            <TouchableOpacity
                                style={styles.exploreButton}
                                onPress={() => navigation.navigate('AccommodationsList')}
                            >
                                <Text style={styles.exploreButtonText}>Explore Accommodations</Text>
                            </TouchableOpacity>
                        )}
                    </View>
                ) : (
                    <View style={styles.bookingsList}>
                        {filteredBookings.map((booking) => (
                            <BookingCard key={booking._id} booking={booking} />
                        ))}
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
    tabsContainer: {
        flexDirection: 'row',
        backgroundColor: '#fff',
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#e0e0e0',
    },
    tabButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 10,
        paddingHorizontal: 15,
        borderRadius: 20,
        marginHorizontal: 5,
        position: 'relative',
    },
    activeTabButton: {
        backgroundColor: '#4A90E2',
    },
    tabButtonText: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#666',
    },
    activeTabButtonText: {
        color: '#fff',
    },
    tabBadge: {
        position: 'absolute',
        top: -5,
        right: -5,
        backgroundColor: '#e74c3c',
        borderRadius: 10,
        minWidth: 20,
        height: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },
    tabBadgeText: {
        color: '#fff',
        fontSize: 12,
        fontWeight: 'bold',
    },
    scrollContent: {
        flexGrow: 1,
        padding: 20,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 50,
    },
    loadingText: {
        fontSize: 16,
        color: '#666',
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 50,
    },
    emptyTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#333',
        marginTop: 20,
        marginBottom: 10,
    },
    emptyText: {
        fontSize: 16,
        color: '#666',
        textAlign: 'center',
        marginBottom: 30,
    },
    exploreButton: {
        backgroundColor: '#4A90E2',
        paddingHorizontal: 30,
        paddingVertical: 15,
        borderRadius: 25,
    },
    exploreButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    bookingsList: {
        flex: 1,
    },
    bookingCard: {
        backgroundColor: '#fff',
        borderRadius: 15,
        marginBottom: 20,
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
        overflow: 'hidden',
    },
    bookingHeader: {
        flexDirection: 'row',
        padding: 15,
    },
    bookingImageContainer: {
        position: 'relative',
        marginRight: 15,
    },
    bookingImage: {
        width: 100,
        height: 80,
        borderRadius: 10,
    },
    statusBadge: {
        position: 'absolute',
        top: -8,
        right: -8,
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
    },
    statusText: {
        color: '#fff',
        fontSize: 10,
        fontWeight: 'bold',
        marginLeft: 4,
        textTransform: 'capitalize',
    },
    bookingInfo: {
        flex: 1,
    },
    accommodationTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 5,
    },
    accommodationLocation: {
        fontSize: 14,
        color: '#666',
        marginBottom: 10,
    },
    bookingDetails: {
        flex: 1,
    },
    detailItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 5,
    },
    detailText: {
        fontSize: 14,
        color: '#666',
        marginLeft: 8,
    },
    totalAmount: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#4A90E2',
        marginLeft: 8,
    },
    specialRequests: {
        paddingHorizontal: 15,
        paddingBottom: 15,
        borderTopWidth: 1,
        borderTopColor: '#f0f0f0',
    },
    specialRequestsTitle: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 5,
    },
    specialRequestsText: {
        fontSize: 14,
        color: '#666',
        lineHeight: 20,
    },
    bookingActions: {
        flexDirection: 'row',
        paddingHorizontal: 15,
        paddingVertical: 15,
        borderTopWidth: 1,
        borderTopColor: '#f0f0f0',
    },
    viewButton: {
        flex: 1,
        backgroundColor: '#f0f8ff',
        paddingVertical: 10,
        borderRadius: 8,
        marginRight: 10,
        alignItems: 'center',
    },
    viewButtonText: {
        color: '#4A90E2',
        fontSize: 14,
        fontWeight: 'bold',
    },
    cancelButton: {
        flex: 1,
        backgroundColor: '#ffe6e6',
        paddingVertical: 10,
        borderRadius: 8,
        marginLeft: 5,
        alignItems: 'center',
    },
    cancelButtonText: {
        color: '#e74c3c',
        fontSize: 14,
        fontWeight: 'bold',
    },
    reviewButton: {
        flex: 1,
        backgroundColor: '#e8f5e8',
        paddingVertical: 10,
        borderRadius: 8,
        marginLeft: 5,
        alignItems: 'center',
    },
    reviewButtonText: {
        color: '#4CAF50',
        fontSize: 14,
        fontWeight: 'bold',
    },
});

export default MyBookingsScreen;
