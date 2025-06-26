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

const AdminFoodProvidersScreen = ({ navigation }) => {
    const [foodProviders, setFoodProviders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedStatus, setSelectedStatus] = useState('all');
    const [selectedCuisine, setSelectedCuisine] = useState('all');
    const [sortColumn, setSortColumn] = useState('createdAt');
    const [sortDirection, setSortDirection] = useState('desc');

    const statusOptions = [
        { key: 'all', label: 'All Status', count: 0 },
        { key: 'active', label: 'Active', count: 0 },
        { key: 'pending', label: 'Pending', count: 0 },
        { key: 'rejected', label: 'Rejected', count: 0 },
        { key: 'inactive', label: 'Inactive', count: 0 },
    ];

    const cuisineTypes = [
        'all', 'Pakistani', 'Chinese', 'Continental', 'Fast Food', 'Italian',
        'Arabian', 'Indian', 'BBQ', 'Desserts', 'Beverages', 'Healthy'
    ];

    useEffect(() => {
        loadFoodProviders();
    }, [selectedStatus, selectedCuisine, sortColumn, sortDirection]);

    const loadFoodProviders = async () => {
        try {
            setLoading(true);
            const params = {
                search: searchQuery,
                status: selectedStatus !== 'all' ? selectedStatus : undefined,
                cuisine: selectedCuisine !== 'all' ? selectedCuisine : undefined,
                sortBy: sortColumn,
                sortOrder: sortDirection,
                page: 1,
                limit: 50
            };
            
            const data = await adminApiService.getFoodProviders(params);
            setFoodProviders(data.foodProviders || []);
            updateStatusCounts(data.foodProviders || []);
        } catch (error) {
            console.error('Error loading food providers:', error);
            Alert.alert('Error', 'Failed to load food providers');
        } finally {
            setLoading(false);
        }
    };

    const updateStatusCounts = (providersList) => {
        const counts = providersList.reduce((acc, provider) => {
            acc[provider.status] = (acc[provider.status] || 0) + 1;
            return acc;
        }, {});

        statusOptions.forEach(option => {
            if (option.key === 'all') {
                option.count = providersList.length;
            } else {
                option.count = counts[option.key] || 0;
            }
        });
    };

    const onRefresh = async () => {
        setRefreshing(true);
        await loadFoodProviders();
        setRefreshing(false);
    };

    const handleSearch = (query) => {
        setSearchQuery(query);
        // Debounce search
        setTimeout(() => {
            loadFoodProviders();
        }, 500);
    };

    const handleSort = (column) => {
        if (sortColumn === column) {
            setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
        } else {
            setSortColumn(column);
            setSortDirection('asc');
        }
    };    const handleProviderPress = (provider) => {
        navigation.navigate('AdminFoodProviderDetail', { providerId: provider._id });
    };

    const handleStatusChange = async (providerId, newStatus, reason = '') => {
        try {
            await adminApiService.updateFoodProviderStatus(providerId, newStatus, reason);
            Alert.alert('Success', `Food provider ${newStatus} successfully`);
            loadFoodProviders();
        } catch (error) {
            console.error('Error updating status:', error);
            Alert.alert('Error', 'Failed to update food provider status');
        }
    };

    const handleApprove = (provider) => {
        Alert.alert(
            'Approve Food Provider',
            `Are you sure you want to approve "${provider.businessName}"?`,
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Approve',
                    onPress: () => handleStatusChange(provider._id, 'active')
                }
            ]
        );
    };

    const handleReject = (provider) => {
        Alert.prompt(
            'Reject Food Provider',
            `Please provide a reason for rejecting "${provider.businessName}":`,
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Reject',
                    onPress: (reason) => handleStatusChange(provider._id, 'rejected', reason)
                }
            ],
            'plain-text',
            '',
            'Reason for rejection...'
        );
    };

    const columns = [
        {
            key: 'businessName',
            title: 'Business Name',
            sortable: true,
            render: (item) => (
                <View>
                    <Text style={styles.businessName}>{item.businessName}</Text>
                    <Text style={styles.businessSubtitle}>ID: {item._id}</Text>
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
            key: 'contact',
            title: 'Contact',
            render: (item) => (
                <View>
                    <Text style={styles.contactText}>{item.contact?.phone || 'N/A'}</Text>
                    <Text style={styles.contactSubtext}>{item.contact?.email || ''}</Text>
                </View>
            )
        },
        {
            key: 'cuisineType',
            title: 'Cuisine',
            render: (item) => (
                <View style={styles.cuisineBadge}>
                    <Text style={styles.cuisineText}>{item.cuisineType || 'N/A'}</Text>
                </View>
            )
        },
        {
            key: 'rating',
            title: 'Rating',
            sortable: true,
            render: (item) => (
                <View style={styles.ratingContainer}>
                    <Ionicons name="star" size={16} color="#FFD700" />
                    <Text style={styles.ratingText}>{item.rating?.toFixed(1) || '0.0'}</Text>
                </View>
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
            title: 'Registered',
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
                        onPress={() => handleProviderPress(item)}
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

    const filteredFoodProviders = foodProviders.filter(provider => {
        const matchesSearch = provider.businessName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                             provider.location?.city?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                             provider.contact?.email?.toLowerCase().includes(searchQuery.toLowerCase());
        
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
                    <Text style={styles.headerTitle}>Food Provider Management</Text>
                    <Text style={styles.headerSubtitle}>{foodProviders.length} total providers</Text>
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
                        placeholder="Search food providers..."
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

                {/* Cuisine Filter */}
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterTabs}>
                    {cuisineTypes.map((cuisine) => (
                        <TouchableOpacity
                            key={cuisine}
                            style={[styles.filterTab, selectedCuisine === cuisine && styles.filterTabActive]}
                            onPress={() => setSelectedCuisine(cuisine)}
                        >
                            <Text style={[styles.filterTabText, selectedCuisine === cuisine && styles.filterTabTextActive]}>
                                {cuisine === 'all' ? 'All Cuisines' : cuisine}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            </View>

            {/* Food Providers Table */}
            <View style={styles.tableContainer}>
                <DataTable
                    data={filteredFoodProviders}
                    columns={columns}
                    loading={loading}
                    onRowPress={handleProviderPress}
                    onSort={handleSort}
                    sortColumn={sortColumn}
                    sortDirection={sortDirection}
                    emptyMessage="No food providers found"
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
    businessName: {
        fontSize: SIZES.body1,
        fontWeight: '600',
        color: COLORS.dark,
    },
    businessSubtitle: {
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
    contactText: {
        fontSize: SIZES.body1,
        color: COLORS.dark,
    },
    contactSubtext: {
        fontSize: SIZES.body2,
        color: COLORS.gray[500],
        marginTop: 2,
    },
    cuisineBadge: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 6,
        backgroundColor: COLORS.primary + '10',
    },
    cuisineText: {
        fontSize: SIZES.body2,
        color: COLORS.primary,
        fontWeight: '500',
    },
    ratingContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    ratingText: {
        fontSize: SIZES.body1,
        color: COLORS.dark,
        marginLeft: 4,
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

export default AdminFoodProvidersScreen;
