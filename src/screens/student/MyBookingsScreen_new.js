import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    FlatList,
    StyleSheet,
    TouchableOpacity,
    ActivityIndicator,
    Alert,
    RefreshControl,
    Image
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import studentApiService from '../../services/studentApiService';

const MyBookingsScreen = ({ navigation }) => {
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [activeTab, setActiveTab] = useState('all');

    useEffect(() => {
        loadBookings();
    }, []);

    const loadBookings = async (isRefresh = false) => {
        try {
            if (isRefresh) {
                setRefreshing(true);
            } else {
                setLoading(true);
            }

            const data = await studentApiService.getMyBookings();
            setBookings(data);
        } catch (error) {
            console.error('Error loading bookings:', error);
            Alert.alert('Error', 'Failed to load bookings');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const onRefresh = () => {
        loadBookings(true);
    };

    const handleCancelBooking = (bookingId) => {
        Alert.alert(
            'Cancel Booking',
            'Are you sure you want to cancel this booking?',
            [
                { text: 'No', style: 'cancel' },
                { 
                    text: 'Yes, Cancel',
                    style: 'destructive',
                    onPress: () => cancelBooking(bookingId)
                }
            ]
        );
    };

    const cancelBooking = async (bookingId) => {
        try {
            setLoading(true);
            await studentApiService.cancelBooking(bookingId);
            
            // Update local state
            setBookings(bookings.map(booking => 
                booking._id === bookingId 
                    ? { ...booking, status: 'cancelled' }
                    : booking
            ));
            
            Alert.alert('Success', 'Booking cancelled successfully');
        } catch (error) {
            console.error('Error cancelling booking:', error);
            Alert.alert('Error', 'Failed to cancel booking');
        } finally {
            setLoading(false);
        }
    };

    const getStatusColor = (status) => {
        switch (status?.toLowerCase()) {
            case 'confirmed':
                return '#28a745';
            case 'pending':
                return '#ffc107';
            case 'cancelled':
                return '#dc3545';
            case 'completed':
                return '#007bff';
            default:
                return '#6c757d';
        }
    };

    const getStatusIcon = (status) => {
        switch (status?.toLowerCase()) {
            case 'confirmed':
                return 'checkmark-circle';
            case 'pending':
                return 'time';
            case 'cancelled':
                return 'close-circle';
            case 'completed':
                return 'flag';
            default:
                return 'help-circle';
        }
    };

    const filterBookings = () => {
        switch (activeTab) {
            case 'active':
                return bookings.filter(booking => 
                    ['confirmed', 'pending'].includes(booking.status?.toLowerCase())
                );
            case 'completed':
                return bookings.filter(booking => 
                    booking.status?.toLowerCase() === 'completed'
                );
            case 'cancelled':
                return bookings.filter(booking => 
                    booking.status?.toLowerCase() === 'cancelled'
                );
            default:
                return bookings;
        }
    };

    const tabs = [
        { key: 'all', label: 'All', count: bookings.length },
        { 
            key: 'active', 
            label: 'Active', 
            count: bookings.filter(b => ['confirmed', 'pending'].includes(b.status?.toLowerCase())).length 
        },
        { 
            key: 'completed', 
            label: 'Completed', 
            count: bookings.filter(b => b.status?.toLowerCase() === 'completed').length 
        },
        { 
            key: 'cancelled', 
            label: 'Cancelled', 
            count: bookings.filter(b => b.status?.toLowerCase() === 'cancelled').length 
        }
    ];

    const renderTabBar = () => (
        <View style={styles.tabContainer}>
            {tabs.map(tab => (
                <TouchableOpacity
                    key={tab.key}
                    style={[
                        styles.tab,
                        activeTab === tab.key && styles.activeTab
                    ]}
                    onPress={() => setActiveTab(tab.key)}
                >
                    <Text style={[
                        styles.tabText,
                        activeTab === tab.key && styles.activeTabText
                    ]}>
                        {tab.label}
                    </Text>
                    {tab.count > 0 && (
                        <View style={[
                            styles.tabBadge,
                            activeTab === tab.key && styles.activeTabBadge
                        ]}>
                            <Text style={[
                                styles.tabBadgeText,
                                activeTab === tab.key && styles.activeTabBadgeText
                            ]}>
                                {tab.count}
                            </Text>
                        </View>
                    )}
                </TouchableOpacity>
            ))}
        </View>
    );

    const renderBookingCard = ({ item }) => (
        <TouchableOpacity 
            style={styles.bookingCard}
            onPress={() => navigation.navigate('BookingDetails', { 
                bookingId: item._id,
                booking: item 
            })}
        >
            <View style={styles.bookingHeader}>
                <View style={styles.accommodationInfo}>
                    <Image
                        source={{ 
                            uri: item.accommodation?.images?.[0] || 
                                 item.accommodation?.image ||
                                 'https://via.placeholder.com/100x80?text=Property'
                        }}
                        style={styles.accommodationImage}
                        resizeMode="cover"
                    />
                    
                    <View style={styles.accommodationDetails}>
                        <Text style={styles.accommodationName} numberOfLines={1}>
                            {item.accommodation?.name || item.accommodationName || 'Property'}
                        </Text>
                        <View style={styles.locationRow}>
                            <Ionicons name="location" size={12} color="#6c757d" />
                            <Text style={styles.location} numberOfLines={1}>
                                {item.accommodation?.location || item.location || 'Location'}
                            </Text>
                        </View>
                        <Text style={styles.bookingId}>
                            Booking ID: {item._id?.slice(-8) || 'N/A'}
                        </Text>
                    </View>
                </View>

                <View style={[
                    styles.statusBadge,
                    { backgroundColor: getStatusColor(item.status) }
                ]}>
                    <Ionicons 
                        name={getStatusIcon(item.status)} 
                        size={12} 
                        color="white" 
                    />
                    <Text style={styles.statusText}>
                        {item.status || 'Pending'}
                    </Text>
                </View>
            </View>

            <View style={styles.bookingDetails}>
                <View style={styles.dateRow}>
                    <View style={styles.dateItem}>
                        <Text style={styles.dateLabel}>Check-in</Text>
                        <Text style={styles.dateValue}>
                            {item.checkIn ? new Date(item.checkIn).toLocaleDateString() : 'N/A'}
                        </Text>
                    </View>
                    
                    <Ionicons name="arrow-forward" size={16} color="#6c757d" />
                    
                    <View style={styles.dateItem}>
                        <Text style={styles.dateLabel}>Check-out</Text>
                        <Text style={styles.dateValue}>
                            {item.checkOut ? new Date(item.checkOut).toLocaleDateString() : 'N/A'}
                        </Text>
                    </View>
                </View>

                <View style={styles.bookingMeta}>
                    <View style={styles.metaItem}>
                        <Ionicons name="people" size={14} color="#6c757d" />
                        <Text style={styles.metaText}>
                            {item.guests || 1} Guest{(item.guests || 1) !== 1 ? 's' : ''}
                        </Text>
                    </View>
                    
                    <View style={styles.metaItem}>
                        <Ionicons name="calendar" size={14} color="#6c757d" />
                        <Text style={styles.metaText}>
                            {item.duration || 'N/A'} Month{(item.duration || 1) !== 1 ? 's' : ''}
                        </Text>
                    </View>
                    
                    <View style={styles.metaItem}>
                        <Ionicons name="pricetag" size={14} color="#28a745" />
                        <Text style={[styles.metaText, { color: '#28a745', fontWeight: 'bold' }]}>
                            PKR {item.totalAmount?.toLocaleString() || 'N/A'}
                        </Text>
                    </View>
                </View>
            </View>

            <View style={styles.bookingActions}>
                <TouchableOpacity 
                    style={styles.actionButton}
                    onPress={() => navigation.navigate('Chat', {
                        recipientId: item.accommodation?.landlord?._id,
                        recipientName: item.accommodation?.landlord?.name || 'Landlord'
                    })}
                >
                    <Ionicons name="chatbubble-outline" size={16} color="#007bff" />
                    <Text style={styles.actionButtonText}>Contact</Text>
                </TouchableOpacity>

                {['pending', 'confirmed'].includes(item.status?.toLowerCase()) && (
                    <TouchableOpacity 
                        style={[styles.actionButton, styles.cancelButton]}
                        onPress={() => handleCancelBooking(item._id)}
                    >
                        <Ionicons name="close-outline" size={16} color="#dc3545" />
                        <Text style={[styles.actionButtonText, { color: '#dc3545' }]}>
                            Cancel
                        </Text>
                    </TouchableOpacity>
                )}

                {item.status?.toLowerCase() === 'completed' && (
                    <TouchableOpacity 
                        style={styles.actionButton}
                        onPress={() => navigation.navigate('WriteReview', {
                            itemId: item.accommodation?._id,
                            itemType: 'accommodation',
                            itemName: item.accommodation?.name
                        })}
                    >
                        <Ionicons name="star-outline" size={16} color="#ffc107" />
                        <Text style={[styles.actionButtonText, { color: '#ffc107' }]}>
                            Review
                        </Text>
                    </TouchableOpacity>
                )}
            </View>
        </TouchableOpacity>
    );

    const renderEmptyState = () => (
        <View style={styles.emptyContainer}>
            <Ionicons name="calendar" size={80} color="#e9ecef" />
            <Text style={styles.emptyTitle}>No bookings found</Text>
            <Text style={styles.emptySubtitle}>
                {activeTab === 'all' 
                    ? "You haven't made any bookings yet"
                    : `No ${activeTab} bookings found`}
            </Text>
            <TouchableOpacity 
                style={styles.browseButton}
                onPress={() => navigation.navigate('AccommodationsScreen')}
            >
                <Text style={styles.browseButtonText}>Browse Accommodations</Text>
            </TouchableOpacity>
        </View>
    );

    if (loading && bookings.length === 0) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#007bff" />
                    <Text style={styles.loadingText}>Loading your bookings...</Text>
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
                <Text style={styles.headerTitle}>My Bookings</Text>
                <TouchableOpacity onPress={onRefresh}>
                    <Ionicons name="refresh" size={24} color="#007bff" />
                </TouchableOpacity>
            </View>

            {renderTabBar()}

            <FlatList
                data={filterBookings()}
                renderItem={renderBookingCard}
                keyExtractor={(item) => item._id || item.id || Math.random().toString()}
                ListEmptyComponent={renderEmptyState}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                        colors={['#007bff']}
                    />
                }
                showsVerticalScrollIndicator={false}
                contentContainerStyle={[
                    styles.listContainer,
                    filterBookings().length === 0 && styles.emptyListContainer
                ]}
            />
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
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        marginTop: 10,
        fontSize: 16,
        color: '#6c757d',
    },
    tabContainer: {
        flexDirection: 'row',
        backgroundColor: 'white',
        borderBottomWidth: 1,
        borderBottomColor: '#e9ecef',
    },
    tab: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 15,
        borderBottomWidth: 3,
        borderBottomColor: 'transparent',
    },
    activeTab: {
        borderBottomColor: '#007bff',
    },
    tabText: {
        fontSize: 14,
        fontWeight: '500',
        color: '#6c757d',
    },
    activeTabText: {
        color: '#007bff',
    },
    tabBadge: {
        backgroundColor: '#e9ecef',
        borderRadius: 10,
        minWidth: 20,
        height: 20,
        alignItems: 'center',
        justifyContent: 'center',
        marginLeft: 5,
    },
    activeTabBadge: {
        backgroundColor: '#007bff',
    },
    tabBadgeText: {
        fontSize: 12,
        fontWeight: 'bold',
        color: '#6c757d',
    },
    activeTabBadgeText: {
        color: 'white',
    },
    listContainer: {
        padding: 15,
    },
    emptyListContainer: {
        flex: 1,
    },
    bookingCard: {
        backgroundColor: 'white',
        borderRadius: 12,
        marginBottom: 15,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    bookingHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        padding: 15,
        paddingBottom: 10,
    },
    accommodationInfo: {
        flexDirection: 'row',
        flex: 1,
        marginRight: 10,
    },
    accommodationImage: {
        width: 80,
        height: 60,
        borderRadius: 8,
    },
    accommodationDetails: {
        flex: 1,
        marginLeft: 12,
    },
    accommodationName: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 4,
    },
    locationRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 4,
    },
    location: {
        marginLeft: 4,
        fontSize: 12,
        color: '#6c757d',
        flex: 1,
    },
    bookingId: {
        fontSize: 10,
        color: '#adb5bd',
        fontFamily: 'monospace',
    },
    statusBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
    },
    statusText: {
        marginLeft: 4,
        fontSize: 12,
        color: 'white',
        fontWeight: '500',
        textTransform: 'capitalize',
    },
    bookingDetails: {
        paddingHorizontal: 15,
        paddingBottom: 10,
    },
    dateRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 12,
        backgroundColor: '#f8f9fa',
        padding: 12,
        borderRadius: 8,
    },
    dateItem: {
        alignItems: 'center',
        flex: 1,
    },
    dateLabel: {
        fontSize: 12,
        color: '#6c757d',
        marginBottom: 2,
    },
    dateValue: {
        fontSize: 14,
        fontWeight: '500',
        color: '#333',
    },
    bookingMeta: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    metaItem: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
        justifyContent: 'center',
    },
    metaText: {
        marginLeft: 4,
        fontSize: 12,
        color: '#6c757d',
        textAlign: 'center',
    },
    bookingActions: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'center',
        paddingHorizontal: 15,
        paddingVertical: 12,
        borderTopWidth: 1,
        borderTopColor: '#f1f3f4',
    },
    actionButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 15,
        paddingVertical: 8,
        borderRadius: 20,
        backgroundColor: '#f8f9fa',
    },
    cancelButton: {
        borderWidth: 1,
        borderColor: '#dc3545',
        backgroundColor: '#fff5f5',
    },
    actionButtonText: {
        marginLeft: 6,
        fontSize: 12,
        color: '#007bff',
        fontWeight: '500',
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 40,
    },
    emptyTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#333',
        marginTop: 20,
        marginBottom: 10,
    },
    emptySubtitle: {
        fontSize: 14,
        color: '#6c757d',
        textAlign: 'center',
        lineHeight: 20,
        marginBottom: 30,
    },
    browseButton: {
        backgroundColor: '#007bff',
        paddingHorizontal: 25,
        paddingVertical: 12,
        borderRadius: 20,
    },
    browseButtonText: {
        color: 'white',
        fontWeight: '500',
    },
});

export default MyBookingsScreen;
