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

const AdminAccommodationsScreen = ({ navigation }) => {
    const [accommodations, setAccommodations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedStatus, setSelectedStatus] = useState('all');
    const [selectedLocation, setSelectedLocation] = useState('all');
    const [sortColumn, setSortColumn] = useState('createdAt');
    const [sortDirection, setSortDirection] = useState('desc');

    const statusOptions = [
        { key: 'all', label: 'All Status', count: 0 },
        { key: 'active', label: 'Active', count: 0 },
        { key: 'pending', label: 'Pending', count: 0 },
        { key: 'rejected', label: 'Rejected', count: 0 },
        { key: 'inactive', label: 'Inactive', count: 0 },
    ];

    const pakistaniCities = [
        'all', 'Karachi', 'Lahore', 'Islamabad', 'Rawalpindi', 'Faisalabad',
        'Multan', 'Hyderabad', 'Gujranwala', 'Peshawar', 'Quetta', 'Sialkot'
    ];

    useEffect(() => {
        loadAccommodations();
    }, [selectedStatus, selectedLocation, sortColumn, sortDirection]);

    const loadAccommodations = async () => {
        try {
            setLoading(true);
            const params = {
                search: searchQuery,
                status: selectedStatus !== 'all' ? selectedStatus : undefined,
                location: selectedLocation !== 'all' ? selectedLocation : undefined,
                sortBy: sortColumn,
                sortOrder: sortDirection,
                page: 1,
                limit: 50
            };
            
            const data = await adminApiService.getAccommodations(params);
            setAccommodations(data.accommodations || []);
            updateStatusCounts(data.accommodations || []);
        } catch (error) {
            console.error('Error loading accommodations:', error);
            Alert.alert('Error', 'Failed to load accommodations');
        } finally {
            setLoading(false);
        }
    };

    const updateStatusCounts = (accommodationsList) => {
        const counts = accommodationsList.reduce((acc, accommodation) => {
            acc[accommodation.status] = (acc[accommodation.status] || 0) + 1;
            return acc;
        }, {});

        statusOptions.forEach(option => {
            if (option.key === 'all') {
                option.count = accommodationsList.length;
            } else {
                option.count = counts[option.key] || 0;
            }
        });
    };

    const onRefresh = async () => {
        setRefreshing(true);
        await loadAccommodations();
        setRefreshing(false);
    };

    const handleSearch = (query) => {
        setSearchQuery(query);
        // Debounce search
        setTimeout(() => {
            loadAccommodations();
        }, 500);
    };

    const handleSort = (column) => {
        if (sortColumn === column) {
            setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
        } else {
            setSortColumn(column);
            setSortDirection('asc');
        }
    };    const handleAccommodationPress = (accommodation) => {
        navigation.navigate('AdminAccommodationDetail', { accommodationId: accommodation._id });
    };

    const handleStatusChange = async (accommodationId, newStatus, reason = '') => {
        try {
            await adminApiService.updateAccommodationStatus(accommodationId, newStatus, reason);
            Alert.alert('Success', `Accommodation ${newStatus} successfully`);
            loadAccommodations();
        } catch (error) {
            console.error('Error updating status:', error);
            Alert.alert('Error', 'Failed to update accommodation status');
        }
    };

    const handleApprove = (accommodation) => {
        Alert.alert(
            'Approve Accommodation',
            `Are you sure you want to approve "${accommodation.title}"?`,
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Approve',
                    onPress: () => handleStatusChange(accommodation._id, 'active')
                }
            ]
        );
    };

    const handleReject = (accommodation) => {
        Alert.prompt(
            'Reject Accommodation',
            `Please provide a reason for rejecting "${accommodation.title}":`,
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Reject',
                    onPress: (reason) => handleStatusChange(accommodation._id, 'rejected', reason)
                }
            ],
            'plain-text',
            '',
            'Reason for rejection...'
        );
    };

    const columns = [
        {
            key: 'title',
            title: 'Property Title',
            sortable: true,
            render: (item) => (
                <View>
                    <Text style={styles.propertyTitle}>{item.title}</Text>
                    <Text style={styles.propertySubtitle}>ID: {item._id}</Text>
                </View>
            )
        },
        {
            key: 'location',
            title: 'Location',
            sortable: true,
            render: (item) => (
                <View>
                    <Text style={styles.locationText}>{item.location?.city || 'N/A'}</Text>
                    <Text style={styles.locationSubtext}>{item.location?.area || ''}</Text>
                </View>
            )
        },
        {
            key: 'landlord',
            title: 'Landlord',
            render: (item) => (
                <Text style={styles.landlordText}>{item.landlord?.name || 'Unknown'}</Text>
            )
        },
        {
            key: 'pricing',
            title: 'Price (PKR)',
            sortable: true,
            render: (item) => (
                <Text style={styles.priceText}>₨{item.pricing?.monthly || 0}/month</Text>
            )
        },
        {
            key: 'status',
            title: 'Status',
            sortable: true,
            render: (item) => (
                <View style={[styles.statusBadge, styles[`status${item.status}`]]}>
                    <Text style={styles.statusText}>{item.status.toUpperCase()}</Text>
                </View>
            )
        },
        {
            key: 'createdAt',
            title: 'Listed Date',
            sortable: true,
            render: (item) => (
                <Text style={styles.dateText}>
                    {new Date(item.createdAt).toLocaleDateString('en-GB')}
                </Text>
            )
        },
        {
            key: 'actions',
            title: 'Actions',
            render: (item) => (
                <View style={styles.actionButtons}>
                    <TouchableOpacity
                        style={styles.viewButton}
                        onPress={() => handleAccommodationPress(item)}
                    >
                        <Ionicons name="eye" size={16} color={COLORS.primary} />
                    </TouchableOpacity>
                    {item.status === 'pending' && (
                        <>
                            <TouchableOpacity
                                style={styles.approveButton}
                                onPress={() => handleApprove(item)}
                            >
                                <Ionicons name="checkmark" size={16} color={COLORS.success} />
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={styles.rejectButton}
                                onPress={() => handleReject(item)}
                            >
                                <Ionicons name="close" size={16} color={COLORS.error} />
                            </TouchableOpacity>
                        </>
                    )}
                </View>
            )
        }
    ];

    const filteredAccommodations = accommodations.filter(accommodation => {
        const matchesSearch = accommodation.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                             accommodation.location?.city?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                             accommodation.landlord?.name?.toLowerCase().includes(searchQuery.toLowerCase());
        
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
                    <Text style={styles.headerTitle}>Accommodation Management</Text>
                    <Text style={styles.headerSubtitle}>{accommodations.length} total properties</Text>
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
                        placeholder="Search accommodations..."
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

                {/* Location Filter */}
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterTabs}>
                    {pakistaniCities.map((city) => (
                        <TouchableOpacity
                            key={city}
                            style={[styles.filterTab, selectedLocation === city && styles.filterTabActive]}
                            onPress={() => setSelectedLocation(city)}
                        >
                            <Text style={[styles.filterTabText, selectedLocation === city && styles.filterTabTextActive]}>
                                {city === 'all' ? 'All Cities' : city}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            </View>

            {/* Accommodations Table */}
            <View style={styles.tableContainer}>
                <DataTable
                    data={filteredAccommodations}
                    columns={columns}
                    loading={loading}
                    onRowPress={handleAccommodationPress}
                    onSort={handleSort}
                    sortColumn={sortColumn}
                    sortDirection={sortDirection}
                    emptyMessage="No accommodations found"
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
    propertyTitle: {
        fontSize: SIZES.body1,
        fontWeight: '600',
        color: COLORS.dark,
    },
    propertySubtitle: {
        fontSize: SIZES.body2,
        color: COLORS.gray[500],
        marginTop: 2,
    },
    locationText: {
        fontSize: SIZES.body1,
        color: COLORS.dark,
    },
    locationSubtext: {
        fontSize: SIZES.body2,
        color: COLORS.gray[500],
        marginTop: 2,
    },
    landlordText: {
        fontSize: SIZES.body1,
        color: COLORS.dark,
    },
    priceText: {
        fontSize: SIZES.body1,
        fontWeight: '600',
        color: COLORS.success,
    },
    statusBadge: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 6,
        alignSelf: 'flex-start',
    },
    statusactive: {
        backgroundColor: COLORS.success + '20',
    },
    statuspending: {
        backgroundColor: COLORS.warning + '20',
    },
    statusrejected: {
        backgroundColor: COLORS.error + '20',
    },
    statusinactive: {
        backgroundColor: COLORS.gray[200],
    },
    statusText: {
        fontSize: SIZES.body2,
        fontWeight: '600',
        color: COLORS.dark,
    },
    dateText: {
        fontSize: SIZES.body2,
        color: COLORS.gray[600],
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
    approveButton: {
        padding: 8,
        borderRadius: 6,
        backgroundColor: COLORS.success + '10',
        marginRight: 4,
    },
    rejectButton: {
        padding: 8,
        borderRadius: 6,
        backgroundColor: COLORS.error + '10',
    },
});

export default AdminAccommodationsScreen;
