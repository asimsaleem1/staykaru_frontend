import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    ScrollView,
    StyleSheet,
    TouchableOpacity,
    Image,
    TextInput,
    ActivityIndicator,
    RefreshControl,
    Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import studentApiService from '../../services/studentApiService';
import { LinearGradient } from 'expo-linear-gradient';

const AccommodationsListScreen = ({ navigation }) => {
    const [accommodations, setAccommodations] = useState([]);
    const [filteredAccommodations, setFilteredAccommodations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [filters, setFilters] = useState({
        minPrice: '',
        maxPrice: '',
        type: '',
        city: ''
    });
    const [showFilters, setShowFilters] = useState(false);

    useEffect(() => {
        loadAccommodations();
    }, []);

    useEffect(() => {
        handleSearch();
    }, [searchQuery, accommodations]);

    const loadAccommodations = async () => {
        try {
            setLoading(true);
            const data = await studentApiService.getAccommodations();
            setAccommodations(data);
            setFilteredAccommodations(data);
        } catch (error) {
            console.error('Error loading accommodations:', error);
            Alert.alert('Error', 'Failed to load accommodations');
        } finally {
            setLoading(false);
        }
    };

    const onRefresh = async () => {
        setRefreshing(true);
        await loadAccommodations();
        setRefreshing(false);
    };

    const handleSearch = async () => {
        if (searchQuery.trim()) {
            try {
                const results = await studentApiService.searchAccommodations(searchQuery);
                setFilteredAccommodations(results);
            } catch (error) {
                console.error('Search error:', error);
            }
        } else {
            setFilteredAccommodations(accommodations);
        }
    };

    const applyFilters = async () => {
        try {
            const activeFilters = {};
            if (filters.minPrice) activeFilters.minPrice = parseInt(filters.minPrice);
            if (filters.maxPrice) activeFilters.maxPrice = parseInt(filters.maxPrice);
            if (filters.type) activeFilters.type = filters.type;
            if (filters.city) activeFilters.location = filters.city;

            const filtered = await studentApiService.getAccommodations(activeFilters);
            setFilteredAccommodations(filtered);
            setShowFilters(false);
        } catch (error) {
            console.error('Filter error:', error);
        }
    };

    const clearFilters = () => {
        setFilters({
            minPrice: '',
            maxPrice: '',
            type: '',
            city: ''
        });
        setFilteredAccommodations(accommodations);
        setShowFilters(false);
    };

    const navigateToDetails = (accommodation) => {
        navigation.navigate('AccommodationDetails', {
            accommodationId: accommodation._id,
            accommodation: accommodation
        });
    };

    const renderAccommodationCard = (accommodation) => (
        <TouchableOpacity
            key={accommodation._id}
            style={styles.accommodationCard}
            onPress={() => navigateToDetails(accommodation)}
        >
            <Image
                source={{
                    uri: accommodation.images?.[0] || 
                         'https://via.placeholder.com/300x200?text=Accommodation'
                }}
                style={styles.accommodationImage}
                resizeMode="cover"
            />
            
            <View style={styles.accommodationInfo}>
                <Text style={styles.accommodationName} numberOfLines={2}>
                    {accommodation.name || accommodation.title}
                </Text>
                
                <View style={styles.locationRow}>
                    <Ionicons name="location" size={16} color="#6c757d" />
                    <Text style={styles.accommodationLocation} numberOfLines={1}>
                        {accommodation.location || accommodation.address}
                    </Text>
                </View>

                <View style={styles.detailsRow}>
                    <View style={styles.feature}>
                        <Ionicons name="bed" size={16} color="#007bff" />
                        <Text style={styles.featureText}>
                            {accommodation.bedrooms || 1} Bed
                        </Text>
                    </View>
                    
                    <View style={styles.feature}>
                        <Ionicons name="water" size={16} color="#007bff" />
                        <Text style={styles.featureText}>
                            {accommodation.bathrooms || 1} Bath
                        </Text>
                    </View>
                    
                    <View style={styles.feature}>
                        <Ionicons name="resize" size={16} color="#007bff" />
                        <Text style={styles.featureText}>
                            {accommodation.area || 'N/A'} sq.ft
                        </Text>
                    </View>
                </View>

                <View style={styles.priceRow}>
                    <Text style={styles.price}>
                        PKR {accommodation.price?.toLocaleString() || 'N/A'}
                        <Text style={styles.priceUnit}> /month</Text>
                    </Text>
                    
                    <View style={styles.ratingContainer}>
                        <Ionicons name="star" size={14} color="#ffc107" />
                        <Text style={styles.rating}>
                            {accommodation.rating || accommodation.averageRating || '4.0'}
                        </Text>
                    </View>
                </View>

                {accommodation.amenities && (
                    <View style={styles.amenitiesRow}>
                        {accommodation.amenities.slice(0, 3).map((amenity, index) => (
                            <View key={index} style={styles.amenityTag}>
                                <Text style={styles.amenityText}>{amenity}</Text>
                            </View>
                        ))}
                        {accommodation.amenities.length > 3 && (
                            <Text style={styles.moreAmenities}>
                                +{accommodation.amenities.length - 3} more
                            </Text>
                        )}
                    </View>
                )}
            </View>
        </TouchableOpacity>
    );

    const renderFilters = () => (
        <View style={styles.filtersContainer}>
            <View style={styles.filterHeader}>
                <Text style={styles.filterTitle}>Filters</Text>
                <TouchableOpacity onPress={() => setShowFilters(false)}>
                    <Ionicons name="close" size={24} color="#333" />
                </TouchableOpacity>
            </View>

            <View style={styles.filterRow}>
                <View style={styles.filterInput}>
                    <Text style={styles.filterLabel}>Min Price (PKR)</Text>
                    <TextInput
                        style={styles.input}
                        value={filters.minPrice}
                        onChangeText={(text) => setFilters({...filters, minPrice: text})}
                        placeholder="10000"
                        keyboardType="numeric"
                    />
                </View>
                
                <View style={styles.filterInput}>
                    <Text style={styles.filterLabel}>Max Price (PKR)</Text>
                    <TextInput
                        style={styles.input}
                        value={filters.maxPrice}
                        onChangeText={(text) => setFilters({...filters, maxPrice: text})}
                        placeholder="50000"
                        keyboardType="numeric"
                    />
                </View>
            </View>

            <View style={styles.filterInputFull}>
                <Text style={styles.filterLabel}>Type</Text>
                <TextInput
                    style={styles.input}
                    value={filters.type}
                    onChangeText={(text) => setFilters({...filters, type: text})}
                    placeholder="apartment, house, room..."
                />
            </View>

            <View style={styles.filterInputFull}>
                <Text style={styles.filterLabel}>City</Text>
                <TextInput
                    style={styles.input}
                    value={filters.city}
                    onChangeText={(text) => setFilters({...filters, city: text})}
                    placeholder="Islamabad, Lahore, Karachi..."
                />
            </View>

            <View style={styles.filterButtons}>
                <TouchableOpacity style={styles.clearButton} onPress={clearFilters}>
                    <Text style={styles.clearButtonText}>Clear</Text>
                </TouchableOpacity>
                
                <TouchableOpacity style={styles.applyButton} onPress={applyFilters}>
                    <Text style={styles.applyButtonText}>Apply Filters</Text>
                </TouchableOpacity>
            </View>
        </View>
    );

    if (loading) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#007bff" />
                    <Text style={styles.loadingText}>Loading accommodations...</Text>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            {/* Header */}
            <LinearGradient
                colors={['#0F5257', '#0a3d40']}
                style={styles.header}
            >
                <View style={styles.headerContent}>
                    <TouchableOpacity 
                        style={styles.backButton}
                        onPress={() => navigation.goBack()}
                    >
                        <Ionicons name="arrow-back" size={24} color="white" />
                    </TouchableOpacity>
                    
                    <Text style={styles.headerTitle}>Accommodations</Text>
                    
                    <TouchableOpacity 
                        style={styles.mapButton}
                        onPress={() => navigation.navigate('AccommodationMap', { accommodations })}
                    >
                        <Ionicons name="map" size={24} color="white" />
                    </TouchableOpacity>
                </View>

                {/* Search Bar */}
                <View style={styles.searchContainer}>
                    <View style={styles.searchBar}>
                        <Ionicons name="search" size={20} color="#6c757d" />
                        <TextInput
                            style={styles.searchInput}
                            placeholder="Search accommodations..."
                            value={searchQuery}
                            onChangeText={setSearchQuery}
                            placeholderTextColor="#6c757d"
                        />
                        {searchQuery ? (
                            <TouchableOpacity onPress={() => setSearchQuery('')}>
                                <Ionicons name="close-circle" size={20} color="#6c757d" />
                            </TouchableOpacity>
                        ) : null}
                    </View>
                    
                    <TouchableOpacity 
                        style={styles.filterButton}
                        onPress={() => setShowFilters(true)}
                    >
                        <Ionicons name="filter" size={20} color="white" />
                    </TouchableOpacity>
                </View>
            </LinearGradient>

            {/* Results Count */}
            <View style={styles.resultsHeader}>
                <Text style={styles.resultsCount}>
                    {filteredAccommodations.length} accommodation{filteredAccommodations.length !== 1 ? 's' : ''} found
                </Text>
                
                <TouchableOpacity 
                    style={styles.sortButton}
                    onPress={() => {/* Implement sorting */}}
                >
                    <Ionicons name="swap-vertical" size={16} color="#007bff" />
                    <Text style={styles.sortText}>Sort</Text>
                </TouchableOpacity>
            </View>

            {/* Accommodations List */}
            <ScrollView
                style={styles.scrollView}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                }
                showsVerticalScrollIndicator={false}
            >
                {filteredAccommodations.length > 0 ? (
                    <View style={styles.accommodationsList}>
                        {filteredAccommodations.map(renderAccommodationCard)}
                    </View>
                ) : (
                    <View style={styles.emptyContainer}>
                        <Ionicons name="home-outline" size={60} color="#6c757d" />
                        <Text style={styles.emptyTitle}>No accommodations found</Text>
                        <Text style={styles.emptySubtitle}>
                            Try adjusting your search or filters
                        </Text>
                        <TouchableOpacity style={styles.refreshButton} onPress={onRefresh}>
                            <Text style={styles.refreshButtonText}>Refresh</Text>
                        </TouchableOpacity>
                    </View>
                )}
            </ScrollView>

            {/* Filters Modal */}
            {showFilters && (
                <View style={styles.filtersOverlay}>
                    <View style={styles.filtersModal}>
                        {renderFilters()}
                    </View>
                </View>
            )}
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8f9fa',
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
    header: {
        paddingTop: 10,
        paddingBottom: 20,
        paddingHorizontal: 20,
    },
    headerContent: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    backButton: {
        padding: 5,
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: 'white',
        flex: 1,
        textAlign: 'center',
    },
    mapButton: {
        padding: 5,
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    searchBar: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'white',
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
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        borderRadius: 25,
        padding: 12,
    },
    resultsHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 15,
        backgroundColor: 'white',
        borderBottomWidth: 1,
        borderBottomColor: '#e9ecef',
    },
    resultsCount: {
        fontSize: 16,
        color: '#333',
        fontWeight: '500',
    },
    sortButton: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    sortText: {
        marginLeft: 5,
        fontSize: 14,
        color: '#007bff',
        fontWeight: '500',
    },
    scrollView: {
        flex: 1,
    },
    accommodationsList: {
        padding: 20,
    },
    accommodationCard: {
        backgroundColor: 'white',
        borderRadius: 12,
        marginBottom: 20,
        overflow: 'hidden',
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    accommodationImage: {
        width: '100%',
        height: 200,
    },
    accommodationInfo: {
        padding: 15,
    },
    accommodationName: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 8,
    },
    locationRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10,
    },
    accommodationLocation: {
        marginLeft: 5,
        fontSize: 14,
        color: '#6c757d',
        flex: 1,
    },
    detailsRow: {
        flexDirection: 'row',
        marginBottom: 10,
    },
    feature: {
        flexDirection: 'row',
        alignItems: 'center',
        marginRight: 15,
    },
    featureText: {
        marginLeft: 5,
        fontSize: 12,
        color: '#6c757d',
    },
    priceRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 10,
    },
    price: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#0F5257',
    },
    priceUnit: {
        fontSize: 14,
        fontWeight: 'normal',
        color: '#6c757d',
    },
    ratingContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    rating: {
        marginLeft: 3,
        fontSize: 14,
        color: '#6c757d',
        fontWeight: '500',
    },
    amenitiesRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        alignItems: 'center',
    },
    amenityTag: {
        backgroundColor: '#e3f2fd',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
        marginRight: 8,
        marginBottom: 4,
    },
    amenityText: {
        fontSize: 10,
        color: '#1976d2',
        fontWeight: '500',
    },
    moreAmenities: {
        fontSize: 10,
        color: '#6c757d',
        fontStyle: 'italic',
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
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
        fontSize: 16,
        color: '#6c757d',
        textAlign: 'center',
        marginBottom: 20,
    },
    refreshButton: {
        backgroundColor: '#007bff',
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 20,
    },
    refreshButtonText: {
        color: 'white',
        fontWeight: '500',
    },
    filtersOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'flex-end',
    },
    filtersModal: {
        backgroundColor: 'white',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        maxHeight: '80%',
    },
    filtersContainer: {
        padding: 20,
    },
    filterHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    filterTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#333',
    },
    filterRow: {
        flexDirection: 'row',
        marginBottom: 15,
    },
    filterInput: {
        flex: 1,
        marginRight: 10,
    },
    filterInputFull: {
        marginBottom: 15,
    },
    filterLabel: {
        fontSize: 14,
        fontWeight: '500',
        color: '#333',
        marginBottom: 5,
    },
    input: {
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 8,
        paddingHorizontal: 12,
        paddingVertical: 10,
        fontSize: 16,
        backgroundColor: 'white',
    },
    filterButtons: {
        flexDirection: 'row',
        marginTop: 20,
    },
    clearButton: {
        flex: 1,
        backgroundColor: '#6c757d',
        padding: 15,
        borderRadius: 8,
        marginRight: 10,
        alignItems: 'center',
    },
    clearButtonText: {
        color: 'white',
        fontWeight: '500',
        fontSize: 16,
    },
    applyButton: {
        flex: 2,
        backgroundColor: '#007bff',
        padding: 15,
        borderRadius: 8,
        alignItems: 'center',
    },
    applyButtonText: {
        color: 'white',
        fontWeight: '500',
        fontSize: 16,
    },
});

export default AccommodationsListScreen;
