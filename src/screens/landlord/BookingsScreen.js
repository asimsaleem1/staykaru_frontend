import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    FlatList,
    StyleSheet,
    TouchableOpacity,
    Alert,
    RefreshControl,
    Modal
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

const BookingsScreen = ({ navigation }) => {
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [selectedFilter, setSelectedFilter] = useState('all');

    useEffect(() => {
        loadBookings();
    }, []);

    const loadBookings = async () => {
        try {
            // Mock data for now
            setBookings([
                {
                    id: '1',
                    guestName: 'John Smith',
                    propertyTitle: 'Modern Studio Apartment',
                    checkIn: '2025-01-15',
                    checkOut: '2025-06-15',
                    status: 'confirmed',
                    amount: 6000,
                    nights: 151
                },
                {
                    id: '2',
                    guestName: 'Sarah Johnson',
                    propertyTitle: 'Shared Room in House',
                    checkIn: '2025-02-01',
                    checkOut: '2025-07-01',
                    status: 'pending',
                    amount: 3000,
                    nights: 150
                }
            ]);
        } catch (error) {
            console.error('Error loading bookings:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const onRefresh = () => {
        setRefreshing(true);
        loadBookings();
    };

    const handleBookingAction = (bookingId, action) => {
        Alert.alert(
            'Confirm Action',
            `Are you sure you want to ${action} this booking?`,
            [
                { text: 'Cancel', style: 'cancel' },
                { 
                    text: 'Confirm', 
                    onPress: () => {
                        // Handle booking action
                        console.log(`${action} booking ${bookingId}`);
                    }
                }
            ]
        );
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'confirmed': return '#2ecc71';
            case 'pending': return '#f39c12';
            case 'cancelled': return '#e74c3c';
            case 'completed': return '#3498db';
            default: return '#7f8c8d';
        }
    };

    const renderBooking = ({ item }) => (
        <View style={styles.bookingCard}>
            <View style={styles.bookingHeader}>
                <Text style={styles.guestName}>{item.guestName}</Text>
                <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
                    <Text style={styles.statusText}>{item.status}</Text>
                </View>
            </View>
            
            <Text style={styles.propertyTitle}>{item.propertyTitle}</Text>
            
            <View style={styles.bookingDetails}>
                <View style={styles.dateContainer}>
                    <Ionicons name="calendar-outline" size={16} color="#7f8c8d" />
                    <Text style={styles.dateText}>
                        {item.checkIn} - {item.checkOut}
                    </Text>
                </View>
                <Text style={styles.nightsText}>{item.nights} nights</Text>
            </View>
            
            <View style={styles.bookingFooter}>
                <Text style={styles.amount}>${item.amount}</Text>
                <View style={styles.actionButtons}>
                    {item.status === 'pending' && (
                        <>
                            <TouchableOpacity 
                                style={[styles.actionButton, styles.approveButton]}
                                onPress={() => handleBookingAction(item.id, 'approve')}
                            >
                                <Text style={styles.actionButtonText}>Approve</Text>
                            </TouchableOpacity>
                            <TouchableOpacity 
                                style={[styles.actionButton, styles.rejectButton]}
                                onPress={() => handleBookingAction(item.id, 'reject')}
                            >
                                <Text style={styles.actionButtonText}>Reject</Text>
                            </TouchableOpacity>
                        </>
                    )}
                    <TouchableOpacity 
                        style={[styles.actionButton, styles.viewButton]}
                        onPress={() => navigation.navigate('BookingDetail', { bookingId: item.id })}
                    >
                        <Text style={styles.actionButtonText}>View</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );

    const filteredBookings = bookings.filter(booking => 
        selectedFilter === 'all' || booking.status === selectedFilter
    );

    const filterOptions = [
        { key: 'all', label: 'All' },
        { key: 'pending', label: 'Pending' },
        { key: 'confirmed', label: 'Confirmed' },
        { key: 'completed', label: 'Completed' },
        { key: 'cancelled', label: 'Cancelled' }
    ];

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Ionicons name="arrow-back" size={24} color="#2c3e50" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Bookings</Text>
                <TouchableOpacity>
                    <Ionicons name="filter-outline" size={24} color="#3498db" />
                </TouchableOpacity>
            </View>

            <View style={styles.filterContainer}>
                <FlatList
                    data={filterOptions}
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    renderItem={({ item }) => (
                        <TouchableOpacity
                            style={[
                                styles.filterButton,
                                selectedFilter === item.key && styles.activeFilterButton
                            ]}
                            onPress={() => setSelectedFilter(item.key)}
                        >
                            <Text style={[
                                styles.filterText,
                                selectedFilter === item.key && styles.activeFilterText
                            ]}>
                                {item.label}
                            </Text>
                        </TouchableOpacity>
                    )}
                    keyExtractor={(item) => item.key}
                />
            </View>

            <FlatList
                data={filteredBookings}
                renderItem={renderBooking}
                keyExtractor={(item) => item.id}
                style={styles.bookingsList}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                }
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <Ionicons name="calendar-outline" size={64} color="#bdc3c7" />
                        <Text style={styles.emptyTitle}>No Bookings Found</Text>
                        <Text style={styles.emptySubtitle}>
                            {selectedFilter === 'all' 
                                ? 'You haven\'t received any bookings yet'
                                : `No ${selectedFilter} bookings found`
                            }
                        </Text>
                    </View>
                }
            />
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
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingVertical: 15,
        backgroundColor: '#ffffff',
        borderBottomWidth: 1,
        borderBottomColor: '#ecf0f1',
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#2c3e50',
    },
    filterContainer: {
        paddingVertical: 15,
        backgroundColor: '#ffffff',
        borderBottomWidth: 1,
        borderBottomColor: '#ecf0f1',
    },
    filterButton: {
        paddingHorizontal: 20,
        paddingVertical: 8,
        marginHorizontal: 5,
        borderRadius: 20,
        backgroundColor: '#ecf0f1',
    },
    activeFilterButton: {
        backgroundColor: '#3498db',
    },
    filterText: {
        fontSize: 14,
        color: '#7f8c8d',
        fontWeight: '500',
    },
    activeFilterText: {
        color: '#ffffff',
    },
    bookingsList: {
        flex: 1,
        paddingHorizontal: 20,
        paddingTop: 15,
    },
    bookingCard: {
        backgroundColor: '#ffffff',
        borderRadius: 12,
        padding: 20,
        marginBottom: 15,
        borderWidth: 1,
        borderColor: '#ecf0f1',
    },
    bookingHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    guestName: {
        fontSize: 16,
        fontWeight: '600',
        color: '#2c3e50',
    },
    statusBadge: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
    },
    statusText: {
        fontSize: 12,
        fontWeight: '500',
        color: '#ffffff',
        textTransform: 'capitalize',
    },
    propertyTitle: {
        fontSize: 14,
        color: '#7f8c8d',
        marginBottom: 12,
    },
    bookingDetails: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 15,
    },
    dateContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    dateText: {
        fontSize: 14,
        color: '#2c3e50',
        marginLeft: 5,
    },
    nightsText: {
        fontSize: 14,
        color: '#7f8c8d',
    },
    bookingFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    amount: {
        fontSize: 18,
        fontWeight: '700',
        color: '#2ecc71',
    },
    actionButtons: {
        flexDirection: 'row',
    },
    actionButton: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 6,
        marginLeft: 8,
    },
    approveButton: {
        backgroundColor: '#2ecc71',
    },
    rejectButton: {
        backgroundColor: '#e74c3c',
    },
    viewButton: {
        backgroundColor: '#3498db',
    },
    actionButtonText: {
        color: '#ffffff',
        fontSize: 12,
        fontWeight: '600',
    },
    emptyContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 60,
    },
    emptyTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#2c3e50',
        marginTop: 20,
        marginBottom: 8,
    },
    emptySubtitle: {
        fontSize: 14,
        color: '#7f8c8d',
        textAlign: 'center',
    },
});

export default BookingsScreen;
