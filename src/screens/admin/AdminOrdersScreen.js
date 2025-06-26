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

const AdminOrdersScreen = ({ navigation }) => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedStatus, setSelectedStatus] = useState('all');
    const [selectedProvider, setSelectedProvider] = useState('all');
    const [sortColumn, setSortColumn] = useState('createdAt');
    const [sortDirection, setSortDirection] = useState('desc');
    const [dateRange, setDateRange] = useState('all');

    const statusOptions = [
        { key: 'all', label: 'All Status', count: 0 },
        { key: 'pending', label: 'Pending', count: 0 },
        { key: 'confirmed', label: 'Confirmed', count: 0 },
        { key: 'preparing', label: 'Preparing', count: 0 },
        { key: 'ready', label: 'Ready', count: 0 },
        { key: 'delivered', label: 'Delivered', count: 0 },
        { key: 'cancelled', label: 'Cancelled', count: 0 },
    ];

    const dateRangeOptions = [
        { key: 'all', label: 'All Time' },
        { key: 'today', label: 'Today' },
        { key: 'week', label: 'This Week' },
        { key: 'month', label: 'This Month' },
    ];

    useEffect(() => {
        loadOrders();
    }, [selectedStatus, selectedProvider, dateRange, sortColumn, sortDirection]);

    const loadOrders = async () => {
        try {
            setLoading(true);
            const params = {
                search: searchQuery,
                status: selectedStatus !== 'all' ? selectedStatus : undefined,
                provider: selectedProvider !== 'all' ? selectedProvider : undefined,
                dateRange: dateRange !== 'all' ? dateRange : undefined,
                sortBy: sortColumn,
                sortOrder: sortDirection,
                page: 1,
                limit: 50
            };
            
            const data = await adminApiService.getOrders(params);
            setOrders(data.orders || []);
            updateStatusCounts(data.orders || []);
        } catch (error) {
            console.error('Error loading orders:', error);
            Alert.alert('Error', 'Failed to load orders');
        } finally {
            setLoading(false);
        }
    };

    const updateStatusCounts = (ordersList) => {
        const counts = ordersList.reduce((acc, order) => {
            acc[order.status] = (acc[order.status] || 0) + 1;
            return acc;
        }, {});

        statusOptions.forEach(option => {
            if (option.key === 'all') {
                option.count = ordersList.length;
            } else {
                option.count = counts[option.key] || 0;
            }
        });
    };

    const onRefresh = async () => {
        setRefreshing(true);
        await loadOrders();
        setRefreshing(false);
    };

    const handleSearch = (query) => {
        setSearchQuery(query);
        // Debounce search
        setTimeout(() => {
            loadOrders();
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

    const handleOrderPress = (order) => {
        navigation.navigate('AdminOrderDetail', { id: order._id });
    };

    const handleUpdateOrderStatus = async (orderId, newStatus) => {
        try {
            await adminApiService.updateOrderStatus(orderId, newStatus);
            Alert.alert('Success', `Order status updated to ${newStatus}`);
            loadOrders();
        } catch (error) {
            console.error('Error updating order status:', error);
            Alert.alert('Error', 'Failed to update order status');
        }
    };

    const formatCurrency = (amount) => {
        return `₨${amount?.toLocaleString() || 0}`;
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-GB');
    };

    const formatTime = (dateString) => {
        return new Date(dateString).toLocaleTimeString('en-GB', { 
            hour: '2-digit', 
            minute: '2-digit' 
        });
    };

    const getStatusColor = (status) => {
        const colors = {
            pending: COLORS.warning,
            confirmed: COLORS.primary,
            preparing: '#FF9800',
            ready: '#4CAF50',
            delivered: COLORS.success,
            cancelled: COLORS.error,
        };
        return colors[status] || COLORS.gray[400];
    };

    const columns = [
        {
            key: 'orderId',
            title: 'Order ID',
            sortable: true,
            render: (item) => (
                <View>
                    <Text style={styles.orderId}>#{item._id?.slice(-8) || 'N/A'}</Text>
                    <Text style={styles.orderTime}>
                        {formatDate(item.createdAt)} {formatTime(item.createdAt)}
                    </Text>
                </View>
            )
        },
        {
            key: 'student',
            title: 'Customer',
            render: (item) => (
                <View>
                    <Text style={styles.studentName}>{item.student?.name || 'Unknown'}</Text>
                    <Text style={styles.studentPhone}>{item.student?.phone || 'N/A'}</Text>
                </View>
            )
        },
        {
            key: 'foodProvider',
            title: 'Restaurant',
            render: (item) => (
                <View>
                    <Text style={styles.providerName}>{item.foodProvider?.businessName || 'N/A'}</Text>
                    <Text style={styles.providerLocation}>
                        {item.foodProvider?.location?.city || ''}
                    </Text>
                </View>
            )
        },
        {
            key: 'items',
            title: 'Items',
            render: (item) => (
                <View>
                    <Text style={styles.itemCount}>{item.items?.length || 0} items</Text>
                    <Text style={styles.itemDetails}>
                        {item.items?.slice(0, 2)?.map(i => i.name).join(', ') || 'N/A'}
                        {item.items?.length > 2 ? '...' : ''}
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
                    <Text style={styles.paymentMethod}>{item.paymentMethod || 'Cash'}</Text>
                </View>
            )
        },
        {
            key: 'deliveryAddress',
            title: 'Delivery',
            render: (item) => (
                <View>
                    <Text style={styles.deliveryAddress}>{item.deliveryAddress?.area || 'N/A'}</Text>
                    <Text style={styles.deliveryTime}>
                        Est: {item.estimatedDeliveryTime ? formatTime(item.estimatedDeliveryTime) : 'N/A'}
                    </Text>
                </View>
            )
        },
        {
            key: 'status',
            title: 'Status',
            sortable: true,
            render: (item) => (
                <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) + '20' }]}>
                    <Text style={[styles.statusText, { color: getStatusColor(item.status) }]}>
                        {item.status?.toUpperCase() || 'PENDING'}
                    </Text>
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
                        onPress={() => handleOrderPress(item)}
                    >
                        <Ionicons name="eye" size={16} color={COLORS.primary} />
                    </TouchableOpacity>
                    {item.status === 'pending' && (
                        <TouchableOpacity
                            style={styles.confirmButton}
                            onPress={() => handleUpdateOrderStatus(item._id, 'confirmed')}
                        >
                            <Ionicons name="checkmark" size={16} color={COLORS.success} />
                        </TouchableOpacity>
                    )}
                    {(item.status === 'pending' || item.status === 'confirmed') && (
                        <TouchableOpacity
                            style={styles.cancelButton}
                            onPress={() => handleUpdateOrderStatus(item._id, 'cancelled')}
                        >
                            <Ionicons name="close" size={16} color={COLORS.error} />
                        </TouchableOpacity>
                    )}
                </View>
            )
        }
    ];

    const filteredOrders = orders.filter(order => {
        const matchesSearch = order.student?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                             order.foodProvider?.businessName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                             order._id?.toLowerCase().includes(searchQuery.toLowerCase());
        
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
                    <Text style={styles.headerTitle}>Order Management</Text>
                    <Text style={styles.headerSubtitle}>{orders.length} total orders</Text>
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
                        placeholder="Search orders..."
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

                {/* Date Range Filter */}
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

            {/* Orders Table */}
            <View style={styles.tableContainer}>
                <DataTable
                    data={filteredOrders}
                    columns={columns}
                    loading={loading}
                    onRowPress={handleOrderPress}
                    onSort={handleSort}
                    sortColumn={sortColumn}
                    sortDirection={sortDirection}
                    emptyMessage="No orders found"
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
    orderId: {
        fontSize: SIZES.body1,
        fontWeight: '600',
        color: COLORS.primary,
    },
    orderTime: {
        fontSize: SIZES.body2,
        color: COLORS.gray[500],
        marginTop: 2,
    },
    studentName: {
        fontSize: SIZES.body1,
        fontWeight: '600',
        color: COLORS.dark,
    },
    studentPhone: {
        fontSize: SIZES.body2,
        color: COLORS.gray[500],
        marginTop: 2,
    },
    providerName: {
        fontSize: SIZES.body1,
        color: COLORS.dark,
    },
    providerLocation: {
        fontSize: SIZES.body2,
        color: COLORS.gray[500],
        marginTop: 2,
    },
    itemCount: {
        fontSize: SIZES.body1,
        fontWeight: '600',
        color: COLORS.dark,
    },
    itemDetails: {
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
    deliveryAddress: {
        fontSize: SIZES.body1,
        color: COLORS.dark,
    },
    deliveryTime: {
        fontSize: SIZES.body2,
        color: COLORS.gray[500],
        marginTop: 2,
    },
    statusBadge: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 6,
        alignSelf: 'flex-start',
    },
    statusText: {
        fontSize: SIZES.body2,
        fontWeight: '600',
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
    confirmButton: {
        padding: 8,
        borderRadius: 6,
        backgroundColor: COLORS.success + '10',
        marginRight: 4,
    },
    cancelButton: {
        padding: 8,
        borderRadius: 6,
        backgroundColor: COLORS.error + '10',
    },
});

export default AdminOrdersScreen;
