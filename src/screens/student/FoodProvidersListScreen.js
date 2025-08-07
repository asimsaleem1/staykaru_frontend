import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    ScrollView,
    StyleSheet,
    TouchableOpacity,
    Image,
    Alert,
    RefreshControl,
    TextInput,
    Modal,
    Dimensions
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { Ionicons } from '@expo/vector-icons';
import authService from '../../services/authService';
import { testBackendConnection, getMockData } from '../../utils/networkUtils';

const { width } = Dimensions.get('window');

const FoodProvidersListScreen = ({ navigation }) => {
    const [foodProviders, setFoodProviders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [showFilters, setShowFilters] = useState(false);
    const [filters, setFilters] = useState({
        cuisine_type: '',
        rating: '',
        sortBy: 'rating_desc'
    });

    useEffect(() => {
        loadFoodProviders();
    }, [filters]);    const loadFoodProviders = async () => {
        try {
            setLoading(true);
            
            // Test backend connection first
            const connectionTest = await testBackendConnection();
            
            if (connectionTest.success) {
                // Backend is available - fetch real data
                const params = new URLSearchParams({
                    search: searchQuery,
                    sortBy: filters.sortBy,
                    ...(filters.cuisine_type && { cuisine_type: filters.cuisine_type }),
                    ...(filters.rating && { minRating: filters.rating }),
                });

                const response = await authService.makeAuthenticatedRequest(`/food-providers?${params}`);
                setFoodProviders(response.data || []);
            } else {
                console.log('Backend not available, using mock food providers data');
                // Backend not available - use mock data
                const mockProviders = getMockData('foodProviders');
                setFoodProviders(mockProviders);
            }
        } catch (error) {
            console.error('Load food providers error:', error);
            // Fallback to mock data on error
            console.log('Error loading food providers, using mock data as fallback');
            const mockProviders = getMockData('foodProviders');
            setFoodProviders(mockProviders);
        } finally {
            setLoading(false);
        }
    };

    const onRefresh = async () => {
        setRefreshing(true);
        await loadFoodProviders();
        setRefreshing(false);
    };

    const handleSearch = () => {
        loadFoodProviders();
    };

    const clearFilters = () => {
        setFilters({
            cuisine_type: '',
            rating: '',
            sortBy: 'rating_desc'
        });
        setSearchQuery('');
    };    const FoodProviderCard = ({ provider }) => (
        <TouchableOpacity
            style={styles.providerCard}
            onPress={() => navigation.navigate('FoodProviderDetail', { providerId: provider.id || provider._id })}
        >
            <Image
                source={{ uri: provider.image || 'https://via.placeholder.com/300x200' }}
                style={styles.providerImage}
            />
            <View style={styles.providerInfo}>
                <View style={styles.providerHeader}>
                    <Text style={styles.providerName} numberOfLines={1}>
                        {provider?.name || 'Unknown Provider'}
                    </Text>
                    <View style={styles.ratingContainer}>
                        <Icon name="star" size={16} color="#FFD700" />
                        <Text style={styles.ratingText}>
                            {provider.rating || '4.0'}
                        </Text>
                    </View>
                </View>
                
                <Text style={styles.cuisineType}>
                    {provider.cuisine_type || 'Various Cuisines'}
                </Text>
                
                <View style={styles.providerDetails}>
                    <View style={styles.detailItem}>
                        <Icon name="schedule" size={14} color="#666" />
                        <Text style={styles.detailText}>
                            {provider.delivery_time || '30-45'} min
                        </Text>
                    </View>
                    
                    <View style={styles.detailItem}>
                        <Icon name="delivery-dining" size={14} color="#666" />
                        <Text style={styles.detailText}>
                            ${provider.delivery_fee || '2.99'} delivery
                        </Text>
                    </View>
                </View>
                
                {provider.special_offers && provider.special_offers.length > 0 && (
                    <View style={styles.offerBadge}>
                        <Text style={styles.offerText}>
                            {provider.special_offers[0]}
                        </Text>
                    </View>
                )}
            </View>
            
            <TouchableOpacity style={styles.favoriteButton}>
                <Icon name="favorite-border" size={20} color="#E91E63" />
            </TouchableOpacity>
        </TouchableOpacity>
    );

    const FilterModal = () => (
        <Modal
            visible={showFilters}
            animationType="slide"
            presentationStyle="pageSheet"
        >
            <SafeAreaView style={styles.filterModal}>
                <View style={styles.filterHeader}>
                    <Text style={styles.filterTitle}>Filters</Text>
                    <TouchableOpacity onPress={() => setShowFilters(false)}>
                        <Icon name="close" size={24} color="#333" />
                    </TouchableOpacity>
                </View>

                <ScrollView style={styles.filterContent}>
                    {/* Cuisine Type */}
                    <View style={styles.filterSection}>
                        <Text style={styles.filterSectionTitle}>Cuisine Type</Text>
                        <View style={styles.cuisineOptions}>
                            {[
                                'Pakistani', 'Chinese', 'Italian', 'Fast Food', 
                                'Indian', 'Continental', 'Mediterranean', 'Thai'
                            ].map((cuisine) => (
                                <TouchableOpacity
                                    key={cuisine}
                                    style={[
                                        styles.cuisineOption,
                                        filters.cuisine_type === cuisine && styles.selectedCuisineOption
                                    ]}
                                    onPress={() => setFilters(prev => ({
                                        ...prev,
                                        cuisine_type: prev.cuisine_type === cuisine ? '' : cuisine
                                    }))}
                                >
                                    <Text style={[
                                        styles.cuisineOptionText,
                                        filters.cuisine_type === cuisine && styles.selectedCuisineOptionText
                                    ]}>
                                        {cuisine}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>

                    {/* Rating */}
                    <View style={styles.filterSection}>
                        <Text style={styles.filterSectionTitle}>Minimum Rating</Text>
                        <View style={styles.ratingOptions}>
                            {[4, 3, 2, 1].map((rating) => (
                                <TouchableOpacity
                                    key={rating}
                                    style={[
                                        styles.ratingOption,
                                        filters.rating === rating.toString() && styles.selectedRatingOption
                                    ]}
                                    onPress={() => setFilters(prev => ({
                                        ...prev,
                                        rating: prev.rating === rating.toString() ? '' : rating.toString()
                                    }))}
                                >
                                    <View style={styles.ratingStars}>
                                        {[...Array(5)].map((_, index) => (
                                            <Icon
                                                key={index}
                                                name="star"
                                                size={16}
                                                color={index < rating ? "#FFD700" : "#E0E0E0"}
                                            />
                                        ))}
                                    </View>
                                    <Text style={styles.ratingText}>{rating}+ Stars</Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>

                    {/* Sort By */}
                    <View style={styles.filterSection}>
                        <Text style={styles.filterSectionTitle}>Sort By</Text>
                        <View style={styles.sortOptions}>
                            {[
                                { value: 'rating_desc', label: 'Rating: High to Low' },
                                { value: 'delivery_time_asc', label: 'Delivery Time: Fastest' },
                                { value: 'delivery_fee_asc', label: 'Delivery Fee: Lowest' },
                                { value: 'name_asc', label: 'Name: A to Z' }
                            ].map((option) => (
                                <TouchableOpacity
                                    key={option.value}
                                    style={[
                                        styles.sortOption,
                                        filters.sortBy === option.value && styles.selectedSortOption
                                    ]}
                                    onPress={() => setFilters(prev => ({ ...prev, sortBy: option.value }))}
                                >
                                    <Text style={[
                                        styles.sortOptionText,
                                        filters.sortBy === option.value && styles.selectedSortOptionText
                                    ]}>
                                        {option.label}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>
                </ScrollView>

                <View style={styles.filterActions}>
                    <TouchableOpacity style={styles.clearButton} onPress={clearFilters}>
                        <Text style={styles.clearButtonText}>Clear All</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={styles.applyButton}
                        onPress={() => {
                            setShowFilters(false);
                            loadFoodProviders();
                        }}
                    >
                        <Text style={styles.applyButtonText}>Apply Filters</Text>
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        </Modal>
    );

    return (
        <SafeAreaView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Icon name="arrow-back" size={24} color="#333" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Food Providers</Text>
                <TouchableOpacity onPress={() => navigation.navigate('MyOrders')}>
                    <Icon name="shopping-bag" size={24} color="#333" />
                </TouchableOpacity>
            </View>

            {/* Search Bar */}
            <View style={styles.searchContainer}>
                <View style={styles.searchBar}>
                    <Icon name="search" size={20} color="#666" />
                    <TextInput
                        style={styles.searchInput}
                        placeholder="Search restaurants..."
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                        onSubmitEditing={handleSearch}
                    />
                    {searchQuery.length > 0 && (
                        <TouchableOpacity onPress={() => {
                            setSearchQuery('');
                            loadFoodProviders();
                        }}>
                            <Icon name="clear" size={20} color="#666" />
                        </TouchableOpacity>
                    )}
                </View>
                <TouchableOpacity style={styles.filterButton} onPress={() => setShowFilters(true)}>
                    <Icon name="filter-list" size={20} color="#FF6B35" />
                </TouchableOpacity>
            </View>

            {/* Quick Filters */}
            <ScrollView 
                horizontal 
                showsHorizontalScrollIndicator={false}
                style={styles.quickFilters}
                contentContainerStyle={styles.quickFiltersContent}
            >
                {['Pakistani', 'Chinese', 'Italian', 'Fast Food', 'Indian'].map((cuisine) => (
                    <TouchableOpacity
                        key={cuisine}
                        style={[
                            styles.quickFilterButton,
                            filters.cuisine_type === cuisine && styles.activeQuickFilter
                        ]}
                        onPress={() => setFilters(prev => ({
                            ...prev,
                            cuisine_type: prev.cuisine_type === cuisine ? '' : cuisine
                        }))}
                    >
                        <Text style={[
                            styles.quickFilterText,
                            filters.cuisine_type === cuisine && styles.activeQuickFilterText
                        ]}>
                            {cuisine}
                        </Text>
                    </TouchableOpacity>
                ))}
            </ScrollView>

            {/* Results Count */}
            <View style={styles.resultsHeader}>
                <Text style={styles.resultsCount}>
                    {foodProviders.length} restaurants found
                </Text>
            </View>

            {/* Food Providers List */}
            <ScrollView
                contentContainerStyle={styles.scrollContent}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                }
            >
                {loading ? (
                    <View style={styles.loadingContainer}>
                        <Text style={styles.loadingText}>Loading restaurants...</Text>
                    </View>
                ) : foodProviders.length === 0 ? (
                    <View style={styles.emptyContainer}>
                        <Icon name="restaurant" size={64} color="#ccc" />
                        <Text style={styles.emptyTitle}>No restaurants found</Text>
                        <Text style={styles.emptyText}>Try adjusting your search or filters</Text>
                        <TouchableOpacity style={styles.clearFiltersButton} onPress={clearFilters}>
                            <Text style={styles.clearFiltersButtonText}>Clear Filters</Text>
                        </TouchableOpacity>
                    </View>
                ) : (
                    <View style={styles.providersList}>
                        {foodProviders.map((provider) => (
                            <FoodProviderCard key={provider._id} provider={provider} />
                        ))}
                    </View>
                )}
            </ScrollView>

            <FilterModal />
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
    searchContainer: {
        flexDirection: 'row',
        paddingHorizontal: 20,
        paddingVertical: 15,
        backgroundColor: '#fff',
        alignItems: 'center',
    },
    searchBar: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f5f5f5',
        borderRadius: 25,
        paddingHorizontal: 15,
        paddingVertical: 10,
        marginRight: 10,
    },
    searchInput: {
        flex: 1,
        marginLeft: 10,
        fontSize: 16,
        color: '#333',
    },
    filterButton: {
        padding: 10,
        backgroundColor: '#fff5f0',
        borderRadius: 20,
        borderWidth: 1,
        borderColor: '#FF6B35',
    },
    quickFilters: {
        backgroundColor: '#fff',
        paddingVertical: 10,
    },
    quickFiltersContent: {
        paddingHorizontal: 20,
    },
    quickFilterButton: {
        backgroundColor: '#f5f5f5',
        paddingHorizontal: 20,
        paddingVertical: 8,
        borderRadius: 20,
        marginRight: 10,
    },
    activeQuickFilter: {
        backgroundColor: '#FF6B35',
    },
    quickFilterText: {
        fontSize: 14,
        color: '#666',
        fontWeight: '500',
    },
    activeQuickFilterText: {
        color: '#fff',
    },
    resultsHeader: {
        paddingHorizontal: 20,
        paddingVertical: 10,
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#e0e0e0',
    },
    resultsCount: {
        fontSize: 14,
        color: '#666',
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
        marginBottom: 20,
    },
    clearFiltersButton: {
        backgroundColor: '#FF6B35',
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 20,
    },
    clearFiltersButtonText: {
        color: '#fff',
        fontWeight: 'bold',
    },
    providersList: {
        flex: 1,
    },
    providerCard: {
        backgroundColor: '#fff',
        borderRadius: 15,
        marginBottom: 20,
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
        overflow: 'hidden',
        position: 'relative',
    },
    providerImage: {
        width: '100%',
        height: 150,
    },
    providerInfo: {
        padding: 15,
    },
    providerHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 5,
    },
    providerName: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
        flex: 1,
    },
    ratingContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    ratingText: {
        fontSize: 14,
        color: '#666',
        marginLeft: 4,
    },
    cuisineType: {
        fontSize: 14,
        color: '#666',
        marginBottom: 10,
    },
    providerDetails: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 10,
    },
    detailItem: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    detailText: {
        fontSize: 12,
        color: '#666',
        marginLeft: 4,
    },
    offerBadge: {
        backgroundColor: '#e8f5e8',
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 12,
        alignSelf: 'flex-start',
    },
    offerText: {
        fontSize: 12,
        color: '#4CAF50',
        fontWeight: 'bold',
    },
    favoriteButton: {
        position: 'absolute',
        top: 10,
        right: 10,
        backgroundColor: 'rgba(255,255,255,0.9)',
        borderRadius: 20,
        padding: 8,
    },
    // Filter Modal Styles
    filterModal: {
        flex: 1,
        backgroundColor: '#fff',
    },
    filterHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#e0e0e0',
    },
    filterTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#333',
    },
    filterContent: {
        flex: 1,
        paddingHorizontal: 20,
    },
    filterSection: {
        marginVertical: 20,
    },
    filterSectionTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 15,
    },
    cuisineOptions: {
        flexDirection: 'row',
        flexWrap: 'wrap',
    },
    cuisineOption: {
        backgroundColor: '#f5f5f5',
        paddingHorizontal: 15,
        paddingVertical: 8,
        borderRadius: 20,
        marginRight: 10,
        marginBottom: 10,
    },
    selectedCuisineOption: {
        backgroundColor: '#FF6B35',
    },
    cuisineOptionText: {
        color: '#666',
        fontSize: 14,
    },
    selectedCuisineOptionText: {
        color: '#fff',
    },
    ratingOptions: {
        flexDirection: 'column',
    },
    ratingOption: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 10,
        paddingHorizontal: 15,
        borderRadius: 10,
        marginBottom: 5,
    },
    selectedRatingOption: {
        backgroundColor: '#fff5f0',
    },
    ratingStars: {
        flexDirection: 'row',
        marginRight: 10,
    },
    sortOptions: {
        flexDirection: 'column',
    },
    sortOption: {
        paddingVertical: 15,
        paddingHorizontal: 15,
        borderRadius: 10,
        marginBottom: 5,
    },
    selectedSortOption: {
        backgroundColor: '#fff5f0',
    },
    sortOptionText: {
        fontSize: 16,
        color: '#666',
    },
    selectedSortOptionText: {
        color: '#FF6B35',
        fontWeight: 'bold',
    },
    filterActions: {
        flexDirection: 'row',
        paddingHorizontal: 20,
        paddingVertical: 20,
        borderTopWidth: 1,
        borderTopColor: '#e0e0e0',
    },
    clearButton: {
        flex: 1,
        backgroundColor: '#f5f5f5',
        paddingVertical: 15,
        borderRadius: 10,
        marginRight: 10,
        alignItems: 'center',
    },
    clearButtonText: {
        fontSize: 16,
        color: '#666',
        fontWeight: 'bold',
    },
    applyButton: {
        flex: 1,
        backgroundColor: '#FF6B35',
        paddingVertical: 15,
        borderRadius: 10,
        alignItems: 'center',
    },
    applyButtonText: {
        fontSize: 16,
        color: '#fff',
        fontWeight: 'bold',
    },
});

export default FoodProvidersListScreen;
