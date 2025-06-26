import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    ScrollView,
    StyleSheet,
    TouchableOpacity,
    Image,
    ActivityIndicator,
    Alert,
    TextInput,
    FlatList,
    RefreshControl
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { studentApiService } from '../../services/studentApiService_new';

const FoodProvidersScreen = ({ navigation, route }) => {
    const [providers, setProviders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [filteredProviders, setFilteredProviders] = useState([]);
    const [activeFilter, setActiveFilter] = useState('all');
    const [sortBy, setSortBy] = useState('rating');

    // Get location from route params or use default
    const { location } = route.params || {};

    useEffect(() => {
        loadFoodProviders();
    }, []);

    useEffect(() => {
        filterAndSortProviders();
    }, [providers, searchQuery, activeFilter, sortBy]);

    const loadFoodProviders = async (isRefresh = false) => {
        try {
            if (isRefresh) {
                setRefreshing(true);
            } else {
                setLoading(true);
            }

            const data = await studentApiService.getFoodProviders(location);
            setProviders(data);
        } catch (error) {
            console.error('Error loading food providers:', error);
            Alert.alert('Error', 'Failed to load food providers');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const filterAndSortProviders = () => {
        let filtered = [...providers];

        // Apply search filter
        if (searchQuery.trim()) {
            filtered = filtered.filter(provider =>
                provider.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                provider.cuisine?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                provider.location?.toLowerCase().includes(searchQuery.toLowerCase())
            );
        }

        // Apply category filter
        if (activeFilter !== 'all') {
            filtered = filtered.filter(provider => {
                const cuisine = provider.cuisine?.toLowerCase() || '';
                return cuisine.includes(activeFilter.toLowerCase());
            });
        }

        // Apply sorting
        filtered.sort((a, b) => {
            switch (sortBy) {
                case 'rating':
                    return (b.rating || 0) - (a.rating || 0);
                case 'distance':
                    return (a.distance || 0) - (b.distance || 0);
                case 'price':
                    return (a.averagePrice || 0) - (b.averagePrice || 0);
                case 'name':
                    return (a.name || '').localeCompare(b.name || '');
                default:
                    return 0;
            }
        });

        setFilteredProviders(filtered);
    };

    const onRefresh = () => {
        loadFoodProviders(true);
    };

    const filters = [
        { key: 'all', label: 'All' },
        { key: 'fast food', label: 'Fast Food' },
        { key: 'pakistani', label: 'Pakistani' },
        { key: 'chinese', label: 'Chinese' },
        { key: 'italian', label: 'Italian' },
        { key: 'desserts', label: 'Desserts' }
    ];

    const sortOptions = [
        { key: 'rating', label: 'Rating', icon: 'star' },
        { key: 'distance', label: 'Distance', icon: 'location' },
        { key: 'price', label: 'Price', icon: 'pricetag' },
        { key: 'name', label: 'Name', icon: 'text' }
    ];

    const renderHeader = () => (
        <View style={styles.header}>
            {/* Search Bar */}
            <View style={styles.searchContainer}>
                <Ionicons name="search" size={20} color="#6c757d" style={styles.searchIcon} />
                <TextInput
                    style={styles.searchInput}
                    placeholder="Search restaurants, cuisine..."
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                    placeholderTextColor="#6c757d"
                />
                {searchQuery.length > 0 && (
                    <TouchableOpacity onPress={() => setSearchQuery('')}>
                        <Ionicons name="close-circle" size={20} color="#6c757d" />
                    </TouchableOpacity>
                )}
            </View>

            {/* Filters */}
            <ScrollView 
                horizontal 
                showsHorizontalScrollIndicator={false}
                style={styles.filtersContainer}
                contentContainerStyle={styles.filtersContent}
            >
                {filters.map(filter => (
                    <TouchableOpacity
                        key={filter.key}
                        style={[
                            styles.filterChip,
                            activeFilter === filter.key && styles.activeFilterChip
                        ]}
                        onPress={() => setActiveFilter(filter.key)}
                    >
                        <Text style={[
                            styles.filterText,
                            activeFilter === filter.key && styles.activeFilterText
                        ]}>
                            {filter.label}
                        </Text>
                    </TouchableOpacity>
                ))}
            </ScrollView>

            {/* Sort Options */}
            <ScrollView 
                horizontal 
                showsHorizontalScrollIndicator={false}
                style={styles.sortContainer}
                contentContainerStyle={styles.sortContent}
            >
                {sortOptions.map(option => (
                    <TouchableOpacity
                        key={option.key}
                        style={[
                            styles.sortChip,
                            sortBy === option.key && styles.activeSortChip
                        ]}
                        onPress={() => setSortBy(option.key)}
                    >
                        <Ionicons 
                            name={option.icon} 
                            size={16} 
                            color={sortBy === option.key ? '#007bff' : '#6c757d'} 
                        />
                        <Text style={[
                            styles.sortText,
                            sortBy === option.key && styles.activeSortText
                        ]}>
                            {option.label}
                        </Text>
                    </TouchableOpacity>
                ))}
            </ScrollView>

            {/* Results Count */}
            <Text style={styles.resultsCount}>
                {filteredProviders.length} restaurant{filteredProviders.length !== 1 ? 's' : ''} found
            </Text>
        </View>
    );

    const renderProviderCard = ({ item }) => (
        <TouchableOpacity
            style={styles.providerCard}
            onPress={() => navigation.navigate('FoodProviderDetails', { 
                providerId: item._id || item.id,
                provider: item 
            })}
        >
            <Image
                source={{ 
                    uri: item.image || item.images?.[0] || 'https://via.placeholder.com/300x200?text=Restaurant'
                }}
                style={styles.providerImage}
                resizeMode="cover"
            />
            
            <View style={styles.providerInfo}>
                <View style={styles.providerHeader}>
                    <Text style={styles.providerName} numberOfLines={1}>
                        {item.name || 'Restaurant'}
                    </Text>
                    <View style={styles.ratingContainer}>
                        <Ionicons name="star" size={14} color="#ffc107" />
                        <Text style={styles.rating}>
                            {item.rating?.toFixed(1) || '4.0'}
                        </Text>
                    </View>
                </View>

                <View style={styles.cuisineContainer}>
                    <Text style={styles.cuisine} numberOfLines={1}>
                        {item.cuisine || 'Various Cuisines'}
                    </Text>
                    {item.isOpen !== false && (
                        <View style={styles.openBadge}>
                            <Text style={styles.openText}>Open</Text>
                        </View>
                    )}
                </View>

                <View style={styles.detailsRow}>
                    <View style={styles.locationContainer}>
                        <Ionicons name="location" size={12} color="#6c757d" />
                        <Text style={styles.location} numberOfLines={1}>
                            {item.location || item.address || 'Location'}
                        </Text>
                    </View>
                    {item.distance && (
                        <Text style={styles.distance}>
                            {item.distance} km
                        </Text>
                    )}
                </View>

                <View style={styles.providerFooter}>
                    <View style={styles.priceContainer}>
                        <Ionicons name="pricetag" size={12} color="#28a745" />
                        <Text style={styles.price}>
                            PKR {item.averagePrice || item.minOrder || '200'}+ avg
                        </Text>
                    </View>
                    
                    <View style={styles.deliveryContainer}>
                        <Ionicons name="time" size={12} color="#007bff" />
                        <Text style={styles.deliveryTime}>
                            {item.deliveryTime || '20-30'} min
                        </Text>
                    </View>
                </View>

                {/* Quick Action Buttons */}
                <View style={styles.quickActions}>
                    <TouchableOpacity 
                        style={styles.quickActionBtn}
                        onPress={() => navigation.navigate('FoodProviderDetails', { 
                            providerId: item._id || item.id,
                            provider: item 
                        })}
                    >
                        <Ionicons name="restaurant" size={16} color="#007bff" />
                        <Text style={styles.quickActionText}>Menu</Text>
                    </TouchableOpacity>
                    
                    <TouchableOpacity 
                        style={styles.quickActionBtn}
                        onPress={() => navigation.navigate('Chat', {
                            recipientId: item.ownerId || item._id,
                            recipientName: item.name
                        })}
                    >
                        <Ionicons name="chatbubble" size={16} color="#28a745" />
                        <Text style={styles.quickActionText}>Chat</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </TouchableOpacity>
    );

    const renderEmptyState = () => (
        <View style={styles.emptyContainer}>
            <Ionicons name="restaurant" size={80} color="#e9ecef" />
            <Text style={styles.emptyTitle}>No restaurants found</Text>
            <Text style={styles.emptySubtitle}>
                {searchQuery ? 'Try adjusting your search or filters' : 'No restaurants available in your area'}
            </Text>
            <TouchableOpacity 
                style={styles.retryButton}
                onPress={() => {
                    setSearchQuery('');
                    setActiveFilter('all');
                    loadFoodProviders();
                }}
            >
                <Text style={styles.retryButtonText}>Reset Filters</Text>
            </TouchableOpacity>
        </View>
    );

    if (loading && providers.length === 0) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#007bff" />
                    <Text style={styles.loadingText}>Finding restaurants near you...</Text>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.screenHeader}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Ionicons name="arrow-back" size={24} color="#333" />
                </TouchableOpacity>
                <Text style={styles.screenTitle}>Food Providers</Text>
                <TouchableOpacity onPress={() => navigation.navigate('MapView', { type: 'food' })}>
                    <Ionicons name="map" size={24} color="#007bff" />
                </TouchableOpacity>
            </View>

            <FlatList
                data={filteredProviders}
                renderItem={renderProviderCard}
                keyExtractor={(item) => item._id || item.id || Math.random().toString()}
                ListHeaderComponent={renderHeader}
                ListEmptyComponent={renderEmptyState}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                        colors={['#007bff']}
                    />
                }
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.listContainer}
            />
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8f9fa',
    },
    screenHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingVertical: 15,
        backgroundColor: 'white',
        borderBottomWidth: 1,
        borderBottomColor: '#e9ecef',
    },
    screenTitle: {
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
    listContainer: {
        paddingBottom: 20,
    },
    header: {
        backgroundColor: 'white',
        paddingBottom: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#e9ecef',
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f8f9fa',
        borderRadius: 25,
        paddingHorizontal: 15,
        paddingVertical: 10,
        margin: 15,
        marginBottom: 10,
    },
    searchIcon: {
        marginRight: 10,
    },
    searchInput: {
        flex: 1,
        fontSize: 16,
        color: '#333',
    },
    filtersContainer: {
        marginBottom: 10,
    },
    filtersContent: {
        paddingHorizontal: 15,
    },
    filterChip: {
        backgroundColor: '#f8f9fa',
        borderWidth: 1,
        borderColor: '#dee2e6',
        borderRadius: 20,
        paddingHorizontal: 15,
        paddingVertical: 8,
        marginRight: 10,
    },
    activeFilterChip: {
        backgroundColor: '#007bff',
        borderColor: '#007bff',
    },
    filterText: {
        fontSize: 14,
        color: '#6c757d',
        fontWeight: '500',
    },
    activeFilterText: {
        color: 'white',
    },
    sortContainer: {
        marginBottom: 10,
    },
    sortContent: {
        paddingHorizontal: 15,
    },
    sortChip: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f8f9fa',
        borderWidth: 1,
        borderColor: '#dee2e6',
        borderRadius: 15,
        paddingHorizontal: 12,
        paddingVertical: 6,
        marginRight: 10,
    },
    activeSortChip: {
        backgroundColor: '#e3f2fd',
        borderColor: '#007bff',
    },
    sortText: {
        marginLeft: 5,
        fontSize: 12,
        color: '#6c757d',
        fontWeight: '500',
    },
    activeSortText: {
        color: '#007bff',
    },
    resultsCount: {
        fontSize: 14,
        color: '#6c757d',
        paddingHorizontal: 15,
        marginBottom: 5,
    },
    providerCard: {
        backgroundColor: 'white',
        borderRadius: 12,
        marginHorizontal: 15,
        marginVertical: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    providerImage: {
        width: '100%',
        height: 150,
        borderTopLeftRadius: 12,
        borderTopRightRadius: 12,
    },
    providerInfo: {
        padding: 15,
    },
    providerHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    providerName: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
        flex: 1,
        marginRight: 10,
    },
    ratingContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff3cd',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
    },
    rating: {
        marginLeft: 4,
        fontSize: 12,
        fontWeight: '500',
        color: '#856404',
    },
    cuisineContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    cuisine: {
        fontSize: 14,
        color: '#6c757d',
        flex: 1,
    },
    openBadge: {
        backgroundColor: '#d4edda',
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 10,
    },
    openText: {
        fontSize: 10,
        color: '#155724',
        fontWeight: '500',
    },
    detailsRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 10,
    },
    locationContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    location: {
        marginLeft: 4,
        fontSize: 12,
        color: '#6c757d',
        flex: 1,
    },
    distance: {
        fontSize: 12,
        color: '#007bff',
        fontWeight: '500',
    },
    providerFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    priceContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    price: {
        marginLeft: 4,
        fontSize: 12,
        color: '#28a745',
        fontWeight: '500',
    },
    deliveryContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    deliveryTime: {
        marginLeft: 4,
        fontSize: 12,
        color: '#007bff',
        fontWeight: '500',
    },
    quickActions: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        paddingTop: 12,
        borderTopWidth: 1,
        borderTopColor: '#f1f3f4',
    },
    quickActionBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 8,
        borderRadius: 20,
        backgroundColor: '#f8f9fa',
    },
    quickActionText: {
        marginLeft: 6,
        fontSize: 12,
        color: '#333',
        fontWeight: '500',
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 40,
        paddingVertical: 60,
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
    },
    retryButton: {
        marginTop: 20,
        backgroundColor: '#007bff',
        paddingHorizontal: 25,
        paddingVertical: 12,
        borderRadius: 20,
    },
    retryButtonText: {
        color: 'white',
        fontWeight: '500',
    },
});

export default FoodProvidersScreen;
