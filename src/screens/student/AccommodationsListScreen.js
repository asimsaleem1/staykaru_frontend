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
import { LinearGradient } from 'expo-linear-gradient';
import { testBackendConnection, fetchFromBackend, getMockData } from '../../utils/networkUtils';

const { width } = Dimensions.get('window');

const AccommodationsListScreen = ({ navigation }) => {
    const [accommodations, setAccommodations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [showFilters, setShowFilters] = useState(false);
    const [filters, setFilters] = useState({
        minPrice: '',
        maxPrice: '',
        type: '',
        rating: '',
        sortBy: 'rating_desc'
    });
    const [viewType, setViewType] = useState('grid'); // 'grid' or 'list'

    useEffect(() => {
        loadAccommodations();
    }, [filters]);    const loadAccommodations = async () => {
        try {
            setLoading(true);
              // Test backend connection first with more aggressive approach
            const connectionTest = await testBackendConnection();
            
            if (connectionTest.success) {
                // Backend is available - fetch real data
                const params = new URLSearchParams({
                    search: searchQuery,
                    sortBy: filters.sortBy,
                    limit: 50, // Fetch more accommodations
                    ...(filters.minPrice && { minPrice: filters.minPrice }),
                    ...(filters.maxPrice && { maxPrice: filters.maxPrice }),
                    ...(filters.type && { type: filters.type }),
                    ...(filters.rating && { minRating: filters.rating }),
                });

                const response = await fetchFromBackend(`/accommodations?${params}`);
                if (response.success) {
                    setAccommodations(response.data || []);
                    console.log(`✅ Loaded ${(response.data || []).length} accommodations from backend`);
                } else {
                    console.log('❌ Backend request failed, using mock data');
                    const mockAccommodations = getMockData('accommodations');
                    setAccommodations(mockAccommodations);
                }
            } else {
                console.log('Backend not available, using mock accommodations data');
                // Backend not available - use mock data
                const mockAccommodations = getMockData('accommodations');
                setAccommodations(mockAccommodations);
            }
        } catch (error) {
            console.error('Load accommodations error:', error);
            // Fallback to mock data on error
            console.log('Error loading accommodations, using mock data as fallback');
            const mockAccommodations = getMockData('accommodations');
            setAccommodations(mockAccommodations);
        } finally {
            setLoading(false);
        }
    };

    const onRefresh = async () => {
        setRefreshing(true);
        await loadAccommodations();
        setRefreshing(false);
    };

    const handleSearch = () => {
        loadAccommodations();
    };

    const clearFilters = () => {
        setFilters({
            minPrice: '',
            maxPrice: '',
            type: '',
            rating: '',
            sortBy: 'rating_desc'
        });
        setSearchQuery('');
    };

    const AccommodationCard = ({ accommodation, isListView = false }) => (
        <TouchableOpacity
            style={[styles.accommodationCard, isListView && styles.listViewCard]}
            onPress={() => navigation.navigate('AccommodationDetail', { accommodationId: accommodation.id || accommodation._id })}
        >
            <Image
                source={{ uri: accommodation.images?.[0] || 'https://via.placeholder.com/300x200' }}
                style={[styles.accommodationImage, isListView && styles.listViewImage]}
            />
            <View style={[styles.accommodationInfo, isListView && styles.listViewInfo]}>
                <Text style={styles.accommodationTitle} numberOfLines={2}>
                    {accommodation.title}
                </Text>
                <Text style={styles.accommodationType}>
                    {accommodation.type} • {accommodation.location?.city}
                </Text>
                <View style={styles.accommodationDetails}>
                    <View style={styles.ratingContainer}>
                        <Icon name="star" size={16} color="#FFD700" />
                        <Text style={styles.ratingText}>
                            {accommodation.rating || '4.5'} ({accommodation.reviews_count || 0})
                        </Text>
                    </View>
                    <Text style={styles.accommodationPrice}>
                        ${accommodation.price}/night
                    </Text>
                </View>
                <View style={styles.amenitiesContainer}>
                    {accommodation.amenities?.slice(0, 3).map((amenity, index) => (
                        <View key={index} style={styles.amenityTag}>
                            <Text style={styles.amenityText}>{amenity}</Text>
                        </View>
                    ))}
                </View>
            </View>
            <TouchableOpacity style={styles.favoriteButton}>
                <Icon name="favorite-border" size={24} color="#E91E63" />
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
                    {/* Price Range */}
                    <View style={styles.filterSection}>
                        <Text style={styles.filterSectionTitle}>Price Range</Text>
                        <View style={styles.priceInputs}>
                            <TextInput
                                style={styles.priceInput}
                                placeholder="Min Price"
                                value={filters.minPrice}
                                onChangeText={(text) => setFilters(prev => ({ ...prev, minPrice: text }))}
                                keyboardType="numeric"
                            />
                            <Text style={styles.priceSeparator}>to</Text>
                            <TextInput
                                style={styles.priceInput}
                                placeholder="Max Price"
                                value={filters.maxPrice}
                                onChangeText={(text) => setFilters(prev => ({ ...prev, maxPrice: text }))}
                                keyboardType="numeric"
                            />
                        </View>
                    </View>

                    {/* Accommodation Type */}
                    <View style={styles.filterSection}>
                        <Text style={styles.filterSectionTitle}>Type</Text>
                        <View style={styles.typeOptions}>
                            {['hostel', 'apartment', 'room', 'studio'].map((type) => (
                                <TouchableOpacity
                                    key={type}
                                    style={[
                                        styles.typeOption,
                                        filters.type === type && styles.selectedTypeOption
                                    ]}
                                    onPress={() => setFilters(prev => ({
                                        ...prev,
                                        type: prev.type === type ? '' : type
                                    }))}
                                >
                                    <Text style={[
                                        styles.typeOptionText,
                                        filters.type === type && styles.selectedTypeOptionText
                                    ]}>
                                        {type.charAt(0).toUpperCase() + type.slice(1)}
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
                                { value: 'price_asc', label: 'Price: Low to High' },
                                { value: 'price_desc', label: 'Price: High to Low' },
                                { value: 'rating_desc', label: 'Rating: High to Low' },
                                { value: 'distance_asc', label: 'Distance: Nearest' }
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
                            loadAccommodations();
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
                <Text style={styles.headerTitle}>Accommodations</Text>
                <TouchableOpacity onPress={() => setViewType(viewType === 'grid' ? 'list' : 'grid')}>
                    <Icon name={viewType === 'grid' ? 'view-list' : 'view-module'} size={24} color="#333" />
                </TouchableOpacity>
            </View>

            {/* Search Bar */}
            <View style={styles.searchContainer}>
                <View style={styles.searchBar}>
                    <Icon name="search" size={20} color="#666" />
                    <TextInput
                        style={styles.searchInput}
                        placeholder="Search accommodations..."
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                        onSubmitEditing={handleSearch}
                    />
                    {searchQuery.length > 0 && (
                        <TouchableOpacity onPress={() => {
                            setSearchQuery('');
                            loadAccommodations();
                        }}>
                            <Icon name="clear" size={20} color="#666" />
                        </TouchableOpacity>
                    )}
                </View>
                <TouchableOpacity style={styles.filterButton} onPress={() => setShowFilters(true)}>
                    <Icon name="filter-list" size={20} color="#4A90E2" />
                </TouchableOpacity>
            </View>

            {/* Results Count */}
            <View style={styles.resultsHeader}>
                <Text style={styles.resultsCount}>
                    {accommodations.length} accommodations found
                </Text>
            </View>

            {/* Accommodations List */}
            <ScrollView
                contentContainerStyle={styles.scrollContent}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                }
            >
                {loading ? (
                    <View style={styles.loadingContainer}>
                        <Text style={styles.loadingText}>Loading accommodations...</Text>
                    </View>
                ) : accommodations.length === 0 ? (
                    <View style={styles.emptyContainer}>
                        <Icon name="home" size={64} color="#ccc" />
                        <Text style={styles.emptyTitle}>No accommodations found</Text>
                        <Text style={styles.emptyText}>Try adjusting your search or filters</Text>
                        <TouchableOpacity style={styles.clearFiltersButton} onPress={clearFilters}>
                            <Text style={styles.clearFiltersButtonText}>Clear Filters</Text>
                        </TouchableOpacity>
                    </View>
                ) : (
                    <View style={viewType === 'grid' ? styles.gridContainer : styles.listContainer}>
                        {accommodations.map((accommodation) => (
                            <AccommodationCard
                                key={accommodation._id}
                                accommodation={accommodation}
                                isListView={viewType === 'list'}
                            />
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
        backgroundColor: '#f0f8ff',
        borderRadius: 20,
        borderWidth: 1,
        borderColor: '#4A90E2',
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
    gridContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
    },
    listContainer: {
        flex: 1,
    },
    accommodationCard: {
        backgroundColor: '#fff',
        borderRadius: 15,
        marginBottom: 20,
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
        overflow: 'hidden',
        width: (width - 50) / 2,
    },
    listViewCard: {
        flexDirection: 'row',
        width: '100%',
    },
    accommodationImage: {
        width: '100%',
        height: 120,
    },
    listViewImage: {
        width: 120,
        height: 120,
    },
    accommodationInfo: {
        padding: 12,
        flex: 1,
    },
    listViewInfo: {
        padding: 15,
    },
    accommodationTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 5,
    },
    accommodationType: {
        fontSize: 12,
        color: '#666',
        marginBottom: 8,
    },
    accommodationDetails: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    ratingContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    ratingText: {
        fontSize: 12,
        color: '#666',
        marginLeft: 4,
    },
    accommodationPrice: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#4A90E2',
    },
    amenitiesContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
    },
    amenityTag: {
        backgroundColor: '#f0f8ff',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
        marginRight: 5,
        marginBottom: 3,
    },
    amenityText: {
        fontSize: 10,
        color: '#4A90E2',
    },
    favoriteButton: {
        position: 'absolute',
        top: 10,
        right: 10,
        backgroundColor: 'rgba(255,255,255,0.9)',
        borderRadius: 20,
        padding: 5,
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
        backgroundColor: '#4A90E2',
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 20,
    },
    clearFiltersButtonText: {
        color: '#fff',
        fontWeight: 'bold',
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
    priceInputs: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    priceInput: {
        flex: 1,
        backgroundColor: '#f5f5f5',
        borderRadius: 10,
        paddingHorizontal: 15,
        paddingVertical: 12,
        fontSize: 16,
    },
    priceSeparator: {
        marginHorizontal: 15,
        color: '#666',
    },
    typeOptions: {
        flexDirection: 'row',
        flexWrap: 'wrap',
    },
    typeOption: {
        backgroundColor: '#f5f5f5',
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 20,
        marginRight: 10,
        marginBottom: 10,
    },
    selectedTypeOption: {
        backgroundColor: '#4A90E2',
    },
    typeOptionText: {
        color: '#666',
    },
    selectedTypeOptionText: {
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
        backgroundColor: '#f0f8ff',
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
        backgroundColor: '#f0f8ff',
    },
    sortOptionText: {
        fontSize: 16,
        color: '#666',
    },
    selectedSortOptionText: {
        color: '#4A90E2',
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
        backgroundColor: '#4A90E2',
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

export default AccommodationsListScreen;
