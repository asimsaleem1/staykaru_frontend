import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    TextInput,
    ActivityIndicator,
    Alert,
    RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SIZES } from '../../utils/constants';
import adminApiService from '../../services/adminApiService';
import DataTable from '../../components/admin/DataTable';

const AdminBookingsScreen = ({ navigation }) => {
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedStatus, setSelectedStatus] = useState('all');
    const [selectedPaymentStatus, setSelectedPaymentStatus] = useState('all');
    const [sortColumn, setSortColumn] = useState('createdAt');
    const [sortDirection, setSortDirection] = useState('desc');
    const [dateRange, setDateRange] = useState('all');

    const statusOptions = [
        { key: 'all', label: 'All Status', count: 0 },
        { key: 'confirmed', label: 'Confirmed', count: 0 },
        { key: 'pending', label: 'Pending', count: 0 },
        { key: 'cancelled', label: 'Cancelled', count: 0 },
        { key: 'completed', label: 'Completed', count: 0 },
    ];

    const paymentStatusOptions = [
        { key: 'all', label: 'All Payments' },
        { key: 'paid', label: 'Paid' },
        { key: 'pending', label: 'Pending' },
        { key: 'refunded', label: 'Refunded' },
        { key: 'failed', label: 'Failed' },
    ];

    const dateRangeOptions = [
        { key: 'all', label: 'All Time' },
        { key: 'today', label: 'Today' },
        { key: 'week', label: 'This Week' },
        { key: 'month', label: 'This Month' },
        { key: 'quarter', label: 'This Quarter' },
    ];

    useEffect(() => {
        loadBookings();
    }, [selectedStatus, selectedPaymentStatus, dateRange, sortColumn, sortDirection]);

    const loadBookings = async () => {
        try {
            setLoading(true);
            const params = {
                search: searchQuery,
                status: selectedStatus !== 'all' ? selectedStatus : undefined,
                paymentStatus: selectedPaymentStatus !== 'all' ? selectedPaymentStatus : undefined,
                dateRange: dateRange !== 'all' ? dateRange : undefined,
                sortBy: sortColumn,
                sortOrder: sortDirection,
                page: 1,
                limit: 50
            };
            
            const data = await adminApiService.getBookings(params);
            setBookings(data.bookings || []);
            updateStatusCounts(data.bookings || []);
        } catch (error) {
            console.error('Error loading bookings:', error);
            Alert.alert('Error', 'Failed to load bookings');
        } finally {
            setLoading(false);
        }
    };

    const updateStatusCounts = (bookingsList) => {
        const counts = bookingsList.reduce((acc, booking) => {
            acc[booking.status] = (acc[booking.status] || 0) + 1;
            return acc;
        }, {});

        statusOptions.forEach(option => {
            if (option.key === 'all') {
                option.count = bookingsList.length;
            } else {
                option.count = counts[option.key] || 0;
            }
        });
    };

    const onRefresh = async () => {
        setRefreshing(true);
        await loadBookings();
        setRefreshing(false);
    };

    const handleSearch = (query) => {
        setSearchQuery(query);
        // Debounce search
        setTimeout(() => {
            loadBookings();
        }, 500);
    };

    const handleSort = (column) => {
        if (sortColumn === column) {
            setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
        } else {
            setSortColumn(column);
            setSortDirection('asc');
        }
    };

    const handleBookingPress = (booking) => {
        navigation.navigate('AdminBookingDetail', { id: booking._id });
    };

    const handleCancelBooking = (booking) => {
        Alert.prompt(
            'Cancel Booking',
            `Please provide a reason for cancelling booking #${booking._id}:`,
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Confirm Cancel',
                    style: 'destructive',
                    onPress: async (reason) => {
                        try {
                            await adminApiService.cancelBooking(booking._id, reason);
                            Alert.alert('Success', 'Booking cancelled successfully');
                            loadBookings();
                        } catch (error) {
                            console.error('Error cancelling booking:', error);
                            Alert.alert('Error', 'Failed to cancel booking');
                        }
                    }
                }
            ],
            'plain-text',
            '',
            'Cancellation reason...'
        );
    };

    const formatCurrency = (amount) => {
        return `₨${amount?.toLocaleString() || 0}`;
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-GB');
    };

    const formatDateRange = (checkIn, checkOut) => {
        return `${formatDate(checkIn)} - ${formatDate(checkOut)}`;
    };

    const calculateDuration = (checkIn, checkOut) => {
        const start = new Date(checkIn);
        const end = new Date(checkOut);
        const diffTime = Math.abs(end - start);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return `${diffDays} day${diffDays > 1 ? 's' : ''}`;
    };

    const columns = [
        {
            key: 'bookingId',
            title: 'Booking ID',
            sortable: true,
            render: (item) => (
                <View>
                    <Text style={styles.bookingId}>#{item._id?.slice(-8) || 'N/A'}</Text>
                    <Text style={styles.bookingDate}>{formatDate(item.createdAt)}</Text>
                </View>
            )
        },
        {
            key: 'student',
            title: 'Student',
            render: (item) => (
                <View>
                    <Text style={styles.studentName}>{item.student?.name || 'Unknown'}</Text>
                    <Text style={styles.studentEmail}>{item.student?.email || ''}</Text>
                </View>
            )
        },
        {
            key: 'accommodation',
            title: 'Accommodation',
            render: (item) => (
                <View>
                    <Text style={styles.accommodationTitle}>{item.accommodation?.title || 'N/A'}</Text>
                    <Text style={styles.accommodationLocation}>
                        {item.accommodation?.location?.city || ''}
                    </Text>
                </View>
            )
        },
        {
            key: 'dates',
            title: 'Stay Period',
            render: (item) => (
                <View>
                    <Text style={styles.dateRange}>
                        {formatDateRange(item.checkInDate, item.checkOutDate)}
                    </Text>
                    <Text style={styles.duration}>
                        {calculateDuration(item.checkInDate, item.checkOutDate)}
                    </Text>
                </View>
            )
        },
        {
            key: 'totalAmount',
            title: 'Amount',
            sortable: true,
            render: (item) => (
                <View>
                    <Text style={styles.totalAmount}>{formatCurrency(item.totalAmount)}</Text>
                    <Text style={styles.paymentMethod}>{item.paymentMethod || 'N/A'}</Text>
                </View>
            )
        },
        {
            key: 'status',
            title: 'Status',
            sortable: true,
            render: (item) => (
                <View>
                    <View style={[styles.statusBadge, styles[`status${item.status}`]]}>
                        <Text style={styles.statusText}>{item.status.toUpperCase()}</Text>
                    </View>
                    <View style={[styles.paymentBadge, styles[`payment${item.paymentStatus}`]]}>
                        <Text style={styles.paymentText}>{item.paymentStatus?.toUpperCase() || 'PENDING'}</Text>
                    </View>
                </View>
            )
        },
        {
            key: 'actions',
            title: 'Actions',
            render: (item) => (
                <View style={styles.actionButtons}>
                    <TouchableOpacity
                        style={styles.viewButton}
                        onPress={() => handleBookingPress(item)}
                    >
                        <Ionicons name="eye" size={16} color={COLORS.primary} />
                    </TouchableOpacity>
                    {(item.status === 'confirmed' || item.status === 'pending') && (
                        <TouchableOpacity
                            style={styles.cancelButton}
                            onPress={() => handleCancelBooking(item)}
                        >
                            <Ionicons name="close-circle" size={16} color={COLORS.error} />
                        </TouchableOpacity>
                    )}
                </View>
            )
        }
    ];

    const filteredBookings = bookings.filter(booking => {
        const matchesSearch = booking.student?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                             booking.accommodation?.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                             booking._id?.toLowerCase().includes(searchQuery.toLowerCase());
        
        return matchesSearch;
    });

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity
                    style={styles.backButton}
                    onPress={() => navigation.goBack()}
                >
                    <Ionicons name="arrow-back" size={24} color={COLORS.dark} />
                </TouchableOpacity>
                <View style={styles.headerContent}>
                    <Text style={styles.headerTitle}>Booking Management</Text>
                    <Text style={styles.headerSubtitle}>{bookings.length} total bookings</Text>
                </View>
                <TouchableOpacity
                    style={styles.exportButton}
                    onPress={() => Alert.alert('Export', 'Export functionality coming soon')}
                >
                    <Ionicons name="download" size={20} color={COLORS.primary} />
                </TouchableOpacity>
            </View>

            {/* Filters */}
            <View style={styles.filtersContainer}>
                {/* Search */}
                <View style={styles.searchContainer}>
                    <Ionicons name="search" size={20} color={COLORS.gray[400]} />
                    <TextInput
                        style={styles.searchInput}
                        placeholder="Search bookings..."
                        value={searchQuery}
                        onChangeText={handleSearch}
                    />
                </View>

                {/* Status Filter */}
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterTabs}>
                    {statusOptions.map((status) => (
                        <TouchableOpacity
                            key={status.key}
                            style={[styles.filterTab, selectedStatus === status.key && styles.filterTabActive]}
                            onPress={() => setSelectedStatus(status.key)}
                        >
                            <Text style={[styles.filterTabText, selectedStatus === status.key && styles.filterTabTextActive]}>
                                {status.label} ({status.count})
                            </Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>

                {/* Payment Status & Date Range Filter */}
                <View style={styles.filterRow}>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterTabs}>
                        {paymentStatusOptions.map((status) => (
                            <TouchableOpacity
                                key={status.key}
                                style={[styles.filterTab, selectedPaymentStatus === status.key && styles.filterTabActive]}
                                onPress={() => setSelectedPaymentStatus(status.key)}
                            >
                                <Text style={[styles.filterTabText, selectedPaymentStatus === status.key && styles.filterTabTextActive]}>
                                    {status.label}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                </View>

                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterTabs}>
                    {dateRangeOptions.map((range) => (
                        <TouchableOpacity
                            key={range.key}
                            style={[styles.filterTab, dateRange === range.key && styles.filterTabActive]}
                            onPress={() => setDateRange(range.key)}
                        >
                            <Text style={[styles.filterTabText, dateRange === range.key && styles.filterTabTextActive]}>
                                {range.label}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            </View>

            {/* Bookings Table */}
            <View style={styles.tableContainer}>
                <DataTable
                    data={filteredBookings}
                    columns={columns}
                    loading={loading}
                    onRowPress={handleBookingPress}
                    onSort={handleSort}
                    sortColumn={sortColumn}
                    sortDirection={sortDirection}
                    emptyMessage="No bookings found"
                    refreshControl={
                        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                    }
                />
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.gray[50],
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingTop: 20,
        paddingBottom: 16,
        backgroundColor: COLORS.light,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.gray[200],
    },
    backButton: {
        marginRight: 16,
        padding: 8,
    },
    headerContent: {
        flex: 1,
    },
    headerTitle: {
        fontSize: SIZES.h3,
        fontWeight: 'bold',
        color: COLORS.dark,
    },
    headerSubtitle: {
        fontSize: SIZES.body2,
        color: COLORS.gray[600],
        marginTop: 2,
    },
    exportButton: {
        padding: 8,
        borderRadius: 8,
        backgroundColor: COLORS.primary + '10',
    },
    filtersContainer: {
        backgroundColor: COLORS.light,
        paddingHorizontal: 20,
        paddingBottom: 16,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.gray[200],
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.gray[100],
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 12,
        marginBottom: 16,
    },
    searchInput: {
        flex: 1,
        fontSize: SIZES.body1,
        color: COLORS.dark,
        marginLeft: 12,
    },
    filterTabs: {
        marginBottom: 8,
    },
    filterRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    filterTab: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        backgroundColor: COLORS.gray[100],
        marginRight: 8,
    },
    filterTabActive: {
        backgroundColor: COLORS.primary,
    },
    filterTabText: {
        fontSize: SIZES.body2,
        color: COLORS.gray[600],
        fontWeight: '500',
    },
    filterTabTextActive: {
        color: COLORS.light,
        fontWeight: '600',
    },
    tableContainer: {
        flex: 1,
        backgroundColor: COLORS.light,
        margin: 20,
        borderRadius: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    bookingId: {
        fontSize: SIZES.body1,
        fontWeight: '600',
        color: COLORS.primary,
    },
    bookingDate: {
        fontSize: SIZES.body2,
        color: COLORS.gray[500],
        marginTop: 2,
    },
    studentName: {
        fontSize: SIZES.body1,
        fontWeight: '600',
        color: COLORS.dark,
    },
    studentEmail: {
        fontSize: SIZES.body2,
        color: COLORS.gray[500],
        marginTop: 2,
    },
    accommodationTitle: {
        fontSize: SIZES.body1,
        color: COLORS.dark,
    },
    accommodationLocation: {
        fontSize: SIZES.body2,
        color: COLORS.gray[500],
        marginTop: 2,
    },
    dateRange: {
        fontSize: SIZES.body1,
        color: COLORS.dark,
    },
    duration: {
        fontSize: SIZES.body2,
        color: COLORS.gray[500],
        marginTop: 2,
    },
    totalAmount: {
        fontSize: SIZES.body1,
        fontWeight: '600',
        color: COLORS.success,
    },
    paymentMethod: {
        fontSize: SIZES.body2,
        color: COLORS.gray[500],
        marginTop: 2,
    },
    statusBadge: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 6,
        alignSelf: 'flex-start',
        marginBottom: 4,
    },
    paymentBadge: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 6,
        alignSelf: 'flex-start',
    },
    statusconfirmed: {
        backgroundColor: COLORS.success + '20',
    },
    statuspending: {
        backgroundColor: COLORS.warning + '20',
    },
    statuscancelled: {
        backgroundColor: COLORS.error + '20',
    },
    statuscompleted: {
        backgroundColor: COLORS.primary + '20',
    },
    paymentpaid: {
        backgroundColor: COLORS.success + '20',
    },
    paymentpending: {
        backgroundColor: COLORS.warning + '20',
    },
    paymentrefunded: {
        backgroundColor: COLORS.gray[200],
    },
    paymentfailed: {
        backgroundColor: COLORS.error + '20',
    },
    statusText: {
        fontSize: SIZES.body2,
        fontWeight: '600',
        color: COLORS.dark,
    },
    paymentText: {
        fontSize: SIZES.body2,
        fontWeight: '500',
        color: COLORS.dark,
    },
    actionButtons: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    viewButton: {
        padding: 8,
        borderRadius: 6,
        backgroundColor: COLORS.primary + '10',
        marginRight: 4,
    },
    cancelButton: {
        padding: 8,
        borderRadius: 6,
        backgroundColor: COLORS.error + '10',
    },
});

export default AdminBookingsScreen;
