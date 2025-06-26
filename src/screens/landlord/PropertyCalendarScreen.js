import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    ScrollView,
    StyleSheet,
    TouchableOpacity,
    Alert,
    RefreshControl,
    Modal,
    FlatList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Calendar } from 'react-native-calendars';
import LandlordNavigation from '../../components/landlord/LandlordNavigation';
import { fetchFromBackend } from '../../utils/networkUtils';

const PropertyCalendarScreen = ({ navigation, route }) => {
    const { propertyId } = route.params || {};
    
    const [property, setProperty] = useState(null);
    const [calendarData, setCalendarData] = useState({
        markedDates: {},
        bookings: [],
        blockedDates: [],
        availableDates: {},
    });
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [selectedDate, setSelectedDate] = useState(null);
    const [showBookingModal, setShowBookingModal] = useState(false);
    const [selectedBooking, setSelectedBooking] = useState(null);
    const [showBlockModal, setShowBlockModal] = useState(false);
    const [blockReason, setBlockReason] = useState('');

    const blockReasons = [
        { key: 'maintenance', label: 'Maintenance', icon: 'construct-outline' },
        { key: 'personal', label: 'Personal Use', icon: 'person-outline' },
        { key: 'renovation', label: 'Renovation', icon: 'hammer-outline' },
        { key: 'other', label: 'Other', icon: 'ellipsis-horizontal-outline' },
    ];

    useEffect(() => {
        if (propertyId) {
            loadCalendarData();
        }
    }, [propertyId]);

    const loadCalendarData = async () => {
        try {
            setLoading(true);
            
            const [propertyRes, bookingsRes, blockedRes] = await Promise.all([
                fetchFromBackend(`/properties/${propertyId}`),
                fetchFromBackend(`/bookings/property/${propertyId}/calendar`),
                fetchFromBackend(`/properties/${propertyId}/blocked-dates`)
            ]);

            if (propertyRes.success) {
                setProperty(propertyRes.data);
            }

            let markedDates = {};
            let bookings = [];
            let blockedDates = [];

            // Process bookings
            if (bookingsRes.success) {
                bookings = bookingsRes.data;
                bookings.forEach(booking => {
                    const checkIn = new Date(booking.checkInDate);
                    const checkOut = new Date(booking.checkOutDate);
                    
                    // Mark all dates in booking range
                    for (let d = new Date(checkIn); d <= checkOut; d.setDate(d.getDate() + 1)) {
                        const dateString = d.toISOString().split('T')[0];
                        markedDates[dateString] = {
                            color: getBookingColor(booking.status),
                            textColor: '#fff',
                            startingDay: d.getTime() === checkIn.getTime(),
                            endingDay: d.getTime() === checkOut.getTime(),
                            bookingId: booking.id,
                            bookingStatus: booking.status,
                        };
                    }
                });
            }

            // Process blocked dates
            if (blockedRes.success) {
                blockedDates = blockedRes.data;
                blockedDates.forEach(blocked => {
                    const startDate = new Date(blocked.startDate);
                    const endDate = new Date(blocked.endDate);
                    
                    for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
                        const dateString = d.toISOString().split('T')[0];
                        markedDates[dateString] = {
                            color: '#F44336',
                            textColor: '#fff',
                            startingDay: d.getTime() === startDate.getTime(),
                            endingDay: d.getTime() === endDate.getTime(),
                            blocked: true,
                            reason: blocked.reason,
                        };
                    }
                });
            }

            setCalendarData({
                markedDates,
                bookings,
                blockedDates,
                availableDates: generateAvailableDates(markedDates),
            });

            console.log('✅ Calendar data loaded successfully');
        } catch (error) {
            console.error('❌ Error loading calendar data:', error);
            Alert.alert('Error', 'Failed to load calendar data');
        } finally {
            setLoading(false);
        }
    };

    const onRefresh = async () => {
        setRefreshing(true);
        await loadCalendarData();
        setRefreshing(false);
    };

    const getBookingColor = (status) => {
        switch (status?.toLowerCase()) {
            case 'confirmed': return '#4CAF50';
            case 'pending': return '#FF9800';
            case 'cancelled': return '#F44336';
            case 'completed': return '#2196F3';
            default: return '#757575';
        }
    };

    const generateAvailableDates = (markedDates) => {
        const availableDates = {};
        const today = new Date();
        const nextYear = new Date(today.getFullYear() + 1, today.getMonth(), today.getDate());
        
        for (let d = new Date(today); d <= nextYear; d.setDate(d.getDate() + 1)) {
            const dateString = d.toISOString().split('T')[0];
            if (!markedDates[dateString]) {
                availableDates[dateString] = {
                    color: '#E8F5E8',
                    textColor: '#4CAF50',
                    available: true,
                };
            }
        }
        
        return availableDates;
    };

    const handleDatePress = (date) => {
        setSelectedDate(date);
        const dateInfo = calendarData.markedDates[date.dateString];
        
        if (dateInfo && dateInfo.bookingId) {
            // Show booking details
            const booking = calendarData.bookings.find(b => b.id === dateInfo.bookingId);
            if (booking) {
                setSelectedBooking(booking);
                setShowBookingModal(true);
            }
        } else if (dateInfo && dateInfo.blocked) {
            // Show blocked date info
            Alert.alert(
                'Blocked Date',
                `This date is blocked for: ${dateInfo.reason}`,
                [
                    { text: 'Cancel', style: 'cancel' },
                    { text: 'Unblock', onPress: () => unblockDate(date.dateString) }
                ]
            );
        } else {
            // Available date - option to block
            Alert.alert(
                'Available Date',
                `${date.dateString} is available for booking`,
                [
                    { text: 'Cancel', style: 'cancel' },
                    { text: 'Block Date', onPress: () => setShowBlockModal(true) }
                ]
            );
        }
    };

    const blockDate = async (reason) => {
        if (!selectedDate) return;
        
        try {
            const response = await fetchFromBackend(`/properties/${propertyId}/block-date`, {
                method: 'POST',
                body: JSON.stringify({
                    startDate: selectedDate.dateString,
                    endDate: selectedDate.dateString,
                    reason: reason,
                }),
            });

            if (response.success) {
                Alert.alert('Success', 'Date blocked successfully');
                loadCalendarData();
            } else {
                Alert.alert('Error', response.message || 'Failed to block date');
            }
        } catch (error) {
            console.error('❌ Error blocking date:', error);
            Alert.alert('Error', 'Failed to block date');
        }
        
        setShowBlockModal(false);
        setSelectedDate(null);
    };

    const unblockDate = async (dateString) => {
        try {
            const response = await fetchFromBackend(`/properties/${propertyId}/unblock-date`, {
                method: 'POST',
                body: JSON.stringify({
                    date: dateString,
                }),
            });

            if (response.success) {
                Alert.alert('Success', 'Date unblocked successfully');
                loadCalendarData();
            } else {
                Alert.alert('Error', response.message || 'Failed to unblock date');
            }
        } catch (error) {
            console.error('❌ Error unblocking date:', error);
            Alert.alert('Error', 'Failed to unblock date');
        }
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-PK', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-PK', {
            style: 'currency',
            currency: 'PKR',
            minimumFractionDigits: 0,
        }).format(amount);
    };

    const renderCalendarLegend = () => (
        <View style={styles.legend}>
            <Text style={styles.legendTitle}>Legend</Text>
            <View style={styles.legendItems}>
                <View style={styles.legendItem}>
                    <View style={[styles.legendColor, { backgroundColor: '#4CAF50' }]} />
                    <Text style={styles.legendText}>Confirmed</Text>
                </View>
                <View style={styles.legendItem}>
                    <View style={[styles.legendColor, { backgroundColor: '#FF9800' }]} />
                    <Text style={styles.legendText}>Pending</Text>
                </View>
                <View style={styles.legendItem}>
                    <View style={[styles.legendColor, { backgroundColor: '#F44336' }]} />
                    <Text style={styles.legendText}>Blocked</Text>
                </View>
                <View style={styles.legendItem}>
                    <View style={[styles.legendColor, { backgroundColor: '#E8F5E8', borderWidth: 1, borderColor: '#4CAF50' }]} />
                    <Text style={styles.legendText}>Available</Text>
                </View>
            </View>
        </View>
    );

    const renderUpcomingBookings = () => (
        <View style={styles.section}>
            <Text style={styles.sectionTitle}>Upcoming Bookings</Text>
            {calendarData.bookings
                .filter(booking => new Date(booking.checkInDate) >= new Date() && booking.status === 'confirmed')
                .slice(0, 3)
                .map(booking => (
                    <TouchableOpacity
                        key={booking.id}
                        style={styles.bookingCard}
                        onPress={() => {
                            setSelectedBooking(booking);
                            setShowBookingModal(true);
                        }}
                    >
                        <View style={styles.bookingHeader}>
                            <Text style={styles.bookingGuest}>{booking.guestName}</Text>
                            <Text style={styles.bookingAmount}>{formatCurrency(booking.totalAmount)}</Text>
                        </View>
                        <Text style={styles.bookingDates}>
                            {formatDate(booking.checkInDate)} - {formatDate(booking.checkOutDate)}
                        </Text>
                        <View style={styles.bookingFooter}>
                            <View style={[styles.statusBadge, { backgroundColor: getBookingColor(booking.status) }]}>
                                <Text style={styles.statusText}>{booking.status}</Text>
                            </View>
                            <Text style={styles.bookingDuration}>
                                {Math.ceil((new Date(booking.checkOutDate) - new Date(booking.checkInDate)) / (1000 * 60 * 60 * 24))} days
                            </Text>
                        </View>
                    </TouchableOpacity>
                ))
            }
            
            {calendarData.bookings.filter(booking => 
                new Date(booking.checkInDate) >= new Date() && booking.status === 'confirmed'
            ).length === 0 && (
                <View style={styles.emptyContainer}>
                    <Ionicons name="calendar-outline" size={48} color="#ccc" />
                    <Text style={styles.emptyText}>No upcoming bookings</Text>
                </View>
            )}
        </View>
    );

    const renderBookingModal = () => (
        <Modal
            visible={showBookingModal}
            animationType="slide"
            presentationStyle="pageSheet"
        >
            <SafeAreaView style={styles.modalContainer}>
                <View style={styles.modalHeader}>
                    <TouchableOpacity
                        onPress={() => setShowBookingModal(false)}
                        style={styles.modalCloseButton}
                    >
                        <Ionicons name="close" size={24} color="#666" />
                    </TouchableOpacity>
                    <Text style={styles.modalTitle}>Booking Details</Text>
                    <View style={{ width: 40 }} />
                </View>
                
                {selectedBooking && (
                    <ScrollView style={styles.modalContent}>
                        <View style={styles.bookingDetailCard}>
                            <View style={styles.bookingDetailHeader}>
                                <Text style={styles.bookingDetailTitle}>Booking #{selectedBooking.id}</Text>
                                <View style={[styles.statusBadge, { backgroundColor: getBookingColor(selectedBooking.status) }]}>
                                    <Text style={styles.statusText}>{selectedBooking.status}</Text>
                                </View>
                            </View>
                            
                            <View style={styles.detailRow}>
                                <Text style={styles.detailLabel}>Guest:</Text>
                                <Text style={styles.detailValue}>{selectedBooking.guestName}</Text>
                            </View>
                            
                            <View style={styles.detailRow}>
                                <Text style={styles.detailLabel}>Check-in:</Text>
                                <Text style={styles.detailValue}>{formatDate(selectedBooking.checkInDate)}</Text>
                            </View>
                            
                            <View style={styles.detailRow}>
                                <Text style={styles.detailLabel}>Check-out:</Text>
                                <Text style={styles.detailValue}>{formatDate(selectedBooking.checkOutDate)}</Text>
                            </View>
                            
                            <View style={styles.detailRow}>
                                <Text style={styles.detailLabel}>Duration:</Text>
                                <Text style={styles.detailValue}>
                                    {Math.ceil((new Date(selectedBooking.checkOutDate) - new Date(selectedBooking.checkInDate)) / (1000 * 60 * 60 * 24))} days
                                </Text>
                            </View>
                            
                            <View style={styles.detailRow}>
                                <Text style={styles.detailLabel}>Total Amount:</Text>
                                <Text style={[styles.detailValue, styles.amountText]}>{formatCurrency(selectedBooking.totalAmount)}</Text>
                            </View>
                            
                            {selectedBooking.specialRequests && (
                                <View style={styles.detailRow}>
                                    <Text style={styles.detailLabel}>Special Requests:</Text>
                                    <Text style={styles.detailValue}>{selectedBooking.specialRequests}</Text>
                                </View>
                            )}
                        </View>
                        
                        <View style={styles.bookingActions}>
                            <TouchableOpacity
                                style={styles.actionButton}
                                onPress={() => navigation.navigate('BookingManagement', { bookingId: selectedBooking.id })}
                            >
                                <Ionicons name="eye-outline" size={20} color="#6B73FF" />
                                <Text style={styles.actionButtonText}>View Details</Text>
                            </TouchableOpacity>
                            
                            <TouchableOpacity
                                style={styles.actionButton}
                                onPress={() => {
                                    // Contact guest functionality
                                    Alert.alert('Contact Guest', 'Feature coming soon!');
                                }}
                            >
                                <Ionicons name="chatbubble-outline" size={20} color="#6B73FF" />
                                <Text style={styles.actionButtonText}>Contact Guest</Text>
                            </TouchableOpacity>
                        </View>
                    </ScrollView>
                )}
            </SafeAreaView>
        </Modal>
    );

    const renderBlockModal = () => (
        <Modal
            visible={showBlockModal}
            animationType="slide"
            presentationStyle="pageSheet"
        >
            <SafeAreaView style={styles.modalContainer}>
                <View style={styles.modalHeader}>
                    <TouchableOpacity
                        onPress={() => setShowBlockModal(false)}
                        style={styles.modalCloseButton}
                    >
                        <Ionicons name="close" size={24} color="#666" />
                    </TouchableOpacity>
                    <Text style={styles.modalTitle}>Block Date</Text>
                    <View style={{ width: 40 }} />
                </View>
                
                <View style={styles.modalContent}>
                    <Text style={styles.blockDateText}>
                        Block {selectedDate?.dateString} for:
                    </Text>
                    
                    <FlatList
                        data={blockReasons}
                        keyExtractor={(item) => item.key}
                        renderItem={({ item }) => (
                            <TouchableOpacity
                                style={styles.reasonItem}
                                onPress={() => blockDate(item.key)}
                            >
                                <Ionicons name={item.icon} size={24} color="#666" />
                                <Text style={styles.reasonText}>{item.label}</Text>
                                <Ionicons name="chevron-forward" size={20} color="#ccc" />
                            </TouchableOpacity>
                        )}
                    />
                </View>
            </SafeAreaView>
        </Modal>
    );

    if (!property) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.loadingContainer}>
                    <Text>Loading property...</Text>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            {/* Header */}
            <LinearGradient
                colors={['#6B73FF', '#9575CD']}
                style={styles.header}
            >
                <View style={styles.headerContent}>
                    <TouchableOpacity
                        onPress={() => navigation.goBack()}
                        style={styles.backButton}
                    >
                        <Ionicons name="arrow-back" size={24} color="#fff" />
                    </TouchableOpacity>
                    <View style={styles.headerInfo}>
                        <Text style={styles.headerTitle}>Calendar</Text>
                        <Text style={styles.headerSubtitle}>{property.title}</Text>
                    </View>
                    <TouchableOpacity
                        style={styles.editButton}
                        onPress={() => navigation.navigate('PropertyEdit', { 
                            propertyId: propertyId, 
                            isEditing: true 
                        })}
                    >
                        <Ionicons name="create-outline" size={24} color="#fff" />
                    </TouchableOpacity>
                </View>
            </LinearGradient>

            <ScrollView 
                style={styles.content}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
            >
                {/* Calendar */}
                <View style={styles.calendarSection}>
                    <Calendar
                        style={styles.calendar}
                        theme={{
                            backgroundColor: '#ffffff',
                            calendarBackground: '#ffffff',
                            textSectionTitleColor: '#b6c1cd',
                            selectedDayBackgroundColor: '#6B73FF',
                            selectedDayTextColor: '#ffffff',
                            todayTextColor: '#6B73FF',
                            dayTextColor: '#2d4150',
                            textDisabledColor: '#d9e1e8',
                            arrowColor: '#6B73FF',
                            monthTextColor: '#2d4150',
                            indicatorColor: '#6B73FF',
                            textDayFontFamily: 'System',
                            textMonthFontFamily: 'System',
                            textDayHeaderFontFamily: 'System',
                            textDayFontWeight: '300',
                            textMonthFontWeight: 'bold',
                            textDayHeaderFontWeight: '300',
                            textDayFontSize: 16,
                            textMonthFontSize: 16,
                            textDayHeaderFontSize: 13
                        }}
                        markingType="period"
                        markedDates={{
                            ...calendarData.markedDates,
                            ...calendarData.availableDates,
                        }}
                        onDayPress={handleDatePress}
                        minDate={new Date().toISOString().split('T')[0]}
                        maxDate={new Date(new Date().getFullYear() + 1, new Date().getMonth(), new Date().getDate()).toISOString().split('T')[0]}
                    />
                </View>

                {/* Legend */}
                {renderCalendarLegend()}

                {/* Upcoming Bookings */}
                {renderUpcomingBookings()}

                {/* Quick Stats */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Quick Stats</Text>
                    <View style={styles.statsGrid}>
                        <View style={styles.statCard}>
                            <Text style={styles.statNumber}>
                                {calendarData.bookings.filter(b => b.status === 'confirmed').length}
                            </Text>
                            <Text style={styles.statLabel}>Confirmed Bookings</Text>
                        </View>
                        <View style={styles.statCard}>
                            <Text style={styles.statNumber}>
                                {calendarData.bookings.filter(b => b.status === 'pending').length}
                            </Text>
                            <Text style={styles.statLabel}>Pending Requests</Text>
                        </View>
                        <View style={styles.statCard}>
                            <Text style={styles.statNumber}>
                                {calendarData.blockedDates.length}
                            </Text>
                            <Text style={styles.statLabel}>Blocked Dates</Text>
                        </View>
                        <View style={styles.statCard}>
                            <Text style={styles.statNumber}>
                                {Object.keys(calendarData.availableDates).length}
                            </Text>
                            <Text style={styles.statLabel}>Available Days</Text>
                        </View>
                    </View>
                </View>
            </ScrollView>

            {/* Modals */}
            {renderBookingModal()}
            {renderBlockModal()}

            {/* Bottom Navigation */}
            <LandlordNavigation navigation={navigation} activeRoute="properties" />
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
    headerInfo: {
        flex: 1,
        alignItems: 'center',
        marginHorizontal: 20,
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#fff',
    },
    headerSubtitle: {
        fontSize: 14,
        color: '#fff',
        opacity: 0.8,
        marginTop: 2,
    },
    editButton: {
        padding: 8,
    },
    content: {
        flex: 1,
    },
    calendarSection: {
        backgroundColor: '#fff',
        margin: 20,
        borderRadius: 12,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
    },
    calendar: {
        borderRadius: 12,
        elevation: 0,
        shadowOpacity: 0,
    },
    legend: {
        backgroundColor: '#fff',
        marginHorizontal: 20,
        marginBottom: 20,
        borderRadius: 12,
        padding: 15,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
    },
    legendTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 10,
    },
    legendItems: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
    },
    legendItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    legendColor: {
        width: 16,
        height: 16,
        borderRadius: 8,
        marginRight: 8,
    },
    legendText: {
        fontSize: 14,
        color: '#666',
    },
    section: {
        backgroundColor: '#fff',
        marginHorizontal: 20,
        marginBottom: 20,
        borderRadius: 12,
        padding: 20,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 15,
    },
    bookingCard: {
        borderWidth: 1,
        borderColor: '#e0e0e0',
        borderRadius: 8,
        padding: 15,
        marginBottom: 12,
    },
    bookingHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    bookingGuest: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
    },
    bookingAmount: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#4CAF50',
    },
    bookingDates: {
        fontSize: 14,
        color: '#666',
        marginBottom: 10,
    },
    bookingFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
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
    bookingDuration: {
        fontSize: 14,
        color: '#666',
    },
    statsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
    },
    statCard: {
        width: '48%',
        backgroundColor: '#f8f9ff',
        borderRadius: 8,
        padding: 15,
        alignItems: 'center',
        marginBottom: 10,
    },
    statNumber: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#6B73FF',
    },
    statLabel: {
        fontSize: 12,
        color: '#666',
        textAlign: 'center',
        marginTop: 5,
    },
    emptyContainer: {
        alignItems: 'center',
        paddingVertical: 40,
    },
    emptyText: {
        fontSize: 16,
        color: '#666',
        marginTop: 10,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
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
    bookingDetailCard: {
        backgroundColor: '#f8f9ff',
        borderRadius: 12,
        padding: 20,
        marginBottom: 20,
    },
    bookingDetailHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 15,
    },
    bookingDetailTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
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
    },
    amountText: {
        color: '#4CAF50',
        fontSize: 16,
    },
    bookingActions: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    actionButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f8f9ff',
        paddingHorizontal: 20,
        paddingVertical: 12,
        borderRadius: 25,
        borderWidth: 1,
        borderColor: '#6B73FF',
        width: '48%',
        justifyContent: 'center',
    },
    actionButtonText: {
        fontSize: 14,
        color: '#6B73FF',
        fontWeight: '600',
        marginLeft: 8,
    },
    blockDateText: {
        fontSize: 16,
        color: '#333',
        marginBottom: 20,
        textAlign: 'center',
    },
    reasonItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 15,
        paddingHorizontal: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    reasonText: {
        fontSize: 16,
        color: '#333',
        marginLeft: 15,
        flex: 1,
    },
});

export default PropertyCalendarScreen;
