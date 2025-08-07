import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    ScrollView,
    StyleSheet,
    TouchableOpacity,
    TextInput,
    FlatList,
    Image,
    Alert,
    RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import StudentNavigation from '../../components/student/StudentNavigation';
import { fetchFromBackend } from '../../utils/networkUtils';

const AccommodationSearchScreen = ({ navigation }) => {
    const [accommodations, setAccommodations] = useState([]);
    const [filteredAccommodations, setFilteredAccommodations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [searchText, setSearchText] = useState('');
    const [filters, setFilters] = useState({
        minPrice: '',
        maxPrice: '',
        city: '',
        type: '',
        amenities: []
    });
    const [showFilters, setShowFilters] = useState(false);

    const accommodationTypes = [
        'Shared Room',
        'Single Room',
        'Studio Apartment',
        'Hostel',
        'PG/Mess'
    ];

    const amenityOptions = [
        'WiFi',
        'AC',
        'Laundry',
        'Parking',
        'Security',
        'Mess',
        'Gym',
        'Study Room'
    ];

    const cities = [
        'Islamabad',
        'Lahore',
        'Karachi',
        'Rawalpindi',
        'Faisalabad',
        'Multan',
        'Peshawar',
        'Quetta'
    ];

    useEffect(() => {
        loadAccommodations();
    }, []);

    useEffect(() => {
        filterAccommodations();
    }, [searchText, filters, accommodations]);

    const loadAccommodations = async () => {
        try {
            setLoading(true);
            const response = await fetchFromBackend('/accommodations/available');
            
            if (response.success) {
                setAccommodations(response.data);
                console.log('✅ Accommodations loaded:', response.data.length);
            } else {
                Alert.alert('Error', 'Failed to load accommodations');
            }
        } catch (error) {
            console.error('❌ Error loading accommodations:', error);
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

    const filterAccommodations = () => {
        let filtered = accommodations;

        // Search text filter
        if (searchText.trim()) {
            filtered = filtered.filter(item =>
                item.title?.toLowerCase().includes(searchText.toLowerCase()) ||
                item.description?.toLowerCase().includes(searchText.toLowerCase()) ||
                item.location?.city?.toLowerCase().includes(searchText.toLowerCase()) ||
                item.location?.area?.toLowerCase().includes(searchText.toLowerCase())
            );
        }

        // Price filter
        if (filters.minPrice) {
            filtered = filtered.filter(item => item.price >= parseInt(filters.minPrice));
        }
        if (filters.maxPrice) {
            filtered = filtered.filter(item => item.price <= parseInt(filters.maxPrice));
        }

        // City filter
        if (filters.city) {
            filtered = filtered.filter(item => 
                item.location?.city?.toLowerCase() === filters.city.toLowerCase()
            );
        }

        // Type filter
        if (filters.type) {
            filtered = filtered.filter(item => 
                item.type?.toLowerCase() === filters.type.toLowerCase()
            );
        }

        // Amenities filter
        if (filters.amenities.length > 0) {
            filtered = filtered.filter(item =>
                filters.amenities.every(amenity =>
                    item.amenities?.includes(amenity)
                )
            );
        }

        setFilteredAccommodations(filtered);
    };

    const toggleAmenityFilter = (amenity) => {
        setFilters(prev => ({
            ...prev,
            amenities: prev.amenities.includes(amenity)
                ? prev.amenities.filter(a => a !== amenity)
                : [...prev.amenities, amenity]
        }));
    };

    const clearFilters = () => {
        setFilters({
            minPrice: '',
            maxPrice: '',
            city: '',
            type: '',
            amenities: []
        });
        setSearchText('');
    };

    const formatPrice = (price) => {
        return new Intl.NumberFormat('en-PK', {
            style: 'currency',
            currency: 'PKR',
            minimumFractionDigits: 0,
        }).format(price);
    };

    const handleBookNow = async (accommodationId) => {
        try {
            // Navigate to booking screen
            navigation.navigate('AccommodationBooking', { accommodationId });
        } catch (error) {
            console.error('❌ Error navigating to booking:', error);
            Alert.alert('Error', 'Failed to proceed with booking');
        }
    };

    const renderAccommodationCard = ({ item }) => (
        <TouchableOpacity 
            style={styles.accommodationCard}
            onPress={() => navigation.navigate('AccommodationDetails', { accommodationId: item.id })}
        >
            <Image 
                source={{ uri: item.images?.[0] || 'https://via.placeholder.com/300x200' }} 
                style={styles.accommodationImage}
            />
            <View style={styles.accommodationInfo}>
                <View style={styles.accommodationHeader}>
                    <Text style={styles.accommodationTitle}>{item.title}</Text>
                    <View style={styles.ratingContainer}>
                        <Ionicons name="star" size={16} color="#FFD700" />
                        <Text style={styles.rating}>{item.rating || '4.0'}</Text>
                    </View>
                </View>
                
                <Text style={styles.accommodationType}>{item.type}</Text>
                <Text style={styles.accommodationLocation}>
                    <Ionicons name="location-outline" size={14} color="#666" />
                    {' '}{item.location?.area}, {item.location?.city}
                </Text>
                
                <Text style={styles.accommodationDescription} numberOfLines={2}>
                    {item.description}
                </Text>
                
                <View style={styles.amenitiesContainer}>
                    {item.amenities?.slice(0, 3).map((amenity, index) => (
                        <View key={index} style={styles.amenityTag}>
                            <Text style={styles.amenityText}>{amenity}</Text>
                        </View>
                    ))}
                    {item.amenities?.length > 3 && (
                        <Text style={styles.moreAmenities}>+{item.amenities.length - 3} more</Text>
                    )}
                </View>
                
                <View style={styles.accommodationFooter}>
                    <View style={styles.priceContainer}>
                        <Text style={styles.price}>{formatPrice(item.price)}</Text>
                        <Text style={styles.priceUnit}>/month</Text>
                    </View>
                    <TouchableOpacity 
                        style={styles.bookButton}
                        onPress={() => handleBookNow(item.id)}
                    >
                        <Text style={styles.bookButtonText}>Book Now</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </TouchableOpacity>
    );

    const renderFilters = () => (
        <View style={styles.filtersContainer}>
            <Text style={styles.filtersTitle}>Filters</Text>
            
            {/* Price Range */}
            <View style={styles.filterSection}>
                <Text style={styles.filterLabel}>Price Range (PKR/month)</Text>
                <View style={styles.priceInputs}>
                    <TextInput
                        style={styles.priceInput}
                        placeholder="Min"
                        value={filters.minPrice}
                        onChangeText={(text) => setFilters({...filters, minPrice: text})}
                        keyboardType="numeric"
                    />
                    <Text style={styles.priceSeparator}>-</Text>
                    <TextInput
                        style={styles.priceInput}
                        placeholder="Max"
                        value={filters.maxPrice}
                        onChangeText={(text) => setFilters({...filters, maxPrice: text})}
                        keyboardType="numeric"
                    />
                </View>
            </View>

            {/* City Filter */}
            <View style={styles.filterSection}>
                <Text style={styles.filterLabel}>City</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    <View style={styles.optionsContainer}>
                        {cities.map((city) => (
                            <TouchableOpacity
                                key={city}
                                style={[
                                    styles.optionChip,
                                    filters.city === city && styles.selectedChip
                                ]}
                                onPress={() => setFilters({
                                    ...filters,
                                    city: filters.city === city ? '' : city
                                })}
                            >
                                <Text style={[
                                    styles.optionText,
                                    filters.city === city && styles.selectedText
                                ]}>
                                    {city}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </ScrollView>
            </View>

            {/* Type Filter */}
            <View style={styles.filterSection}>
                <Text style={styles.filterLabel}>Accommodation Type</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    <View style={styles.optionsContainer}>
                        {accommodationTypes.map((type) => (
                            <TouchableOpacity
                                key={type}
                                style={[
                                    styles.optionChip,
                                    filters.type === type && styles.selectedChip
                                ]}
                                onPress={() => setFilters({
                                    ...filters,
                                    type: filters.type === type ? '' : type
                                })}
                            >
                                <Text style={[
                                    styles.optionText,
                                    filters.type === type && styles.selectedText
                                ]}>
                                    {type}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </ScrollView>
            </View>

            {/* Amenities Filter */}
            <View style={styles.filterSection}>
                <Text style={styles.filterLabel}>Amenities</Text>
                <View style={styles.amenitiesGrid}>
                    {amenityOptions.map((amenity) => (
                        <TouchableOpacity
                            key={amenity}
                            style={[
                                styles.amenityChip,
                                filters.amenities.includes(amenity) && styles.selectedChip
                            ]}
                            onPress={() => toggleAmenityFilter(amenity)}
                        >
                            <Text style={[
                                styles.amenityChipText,
                                filters.amenities.includes(amenity) && styles.selectedText
                            ]}>
                                {amenity}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>
            </View>

            <View style={styles.filterActions}>
                <TouchableOpacity style={styles.clearButton} onPress={clearFilters}>
                    <Text style={styles.clearButtonText}>Clear All</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                    style={styles.applyButton} 
                    onPress={() => setShowFilters(false)}
                >
                    <Text style={styles.applyButtonText}>Apply Filters</Text>
                </TouchableOpacity>
            </View>
        </View>
    );

    return (
        <SafeAreaView style={styles.container}>
            {/* Header */}
            <LinearGradient
                colors={['#4CAF50', '#45A049']}
                style={styles.header}
            >
                <View style={styles.headerContent}>
                    <Text style={styles.headerTitle}>Find Accommodation</Text>
                    <TouchableOpacity
                        onPress={() => setShowFilters(!showFilters)}
                        style={styles.filterButton}
                    >
                        <Ionicons name="filter" size={24} color="#fff" />
                    </TouchableOpacity>
                </View>
                
                <View style={styles.searchContainer}>
                    <Ionicons name="search" size={20} color="#666" style={styles.searchIcon} />
                    <TextInput
                        style={styles.searchInput}
                        placeholder="Search by location, type, or amenities..."
                        value={searchText}
                        onChangeText={setSearchText}
                    />
                </View>
            </LinearGradient>

            {/* Filters Panel */}
            {showFilters && renderFilters()}

            {/* Results */}
            <View style={styles.resultsContainer}>
                <Text style={styles.resultsText}>
                    {filteredAccommodations.length} accommodations found
                </Text>
            </View>

            {/* Accommodations List */}
            <FlatList
                data={filteredAccommodations}
                renderItem={renderAccommodationCard}
                keyExtractor={(item) => item.id.toString()}
                contentContainerStyle={styles.listContainer}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                }
                showsVerticalScrollIndicator={false}
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <Ionicons name="home-outline" size={64} color="#ccc" />
                        <Text style={styles.emptyText}>No accommodations found</Text>
                        <Text style={styles.emptySubText}>Try adjusting your search criteria</Text>
                    </View>
                }
            />

            {/* Bottom Navigation */}
            <StudentNavigation navigation={navigation} activeRoute="accommodations" />
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
        paddingTop: 15,
        paddingBottom: 20,
    },
    headerContent: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 15,
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#fff',
    },
    filterButton: {
        padding: 8,
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        borderRadius: 25,
        paddingHorizontal: 15,
        paddingVertical: 12,
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
        backgroundColor: '#fff',
        padding: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#e0e0e0',
    },
    filtersTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 15,
        color: '#333',
    },
    filterSection: {
        marginBottom: 20,
    },
    filterLabel: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
        marginBottom: 10,
    },
    priceInputs: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    priceInput: {
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 8,
        padding: 12,
        fontSize: 16,
        flex: 1,
        backgroundColor: '#fff',
    },
    priceSeparator: {
        marginHorizontal: 10,
        fontSize: 16,
        color: '#666',
    },
    optionsContainer: {
        flexDirection: 'row',
    },
    optionChip: {
        backgroundColor: '#f0f0f0',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        marginRight: 10,
        borderWidth: 1,
        borderColor: '#ddd',
    },
    selectedChip: {
        backgroundColor: '#4CAF50',
        borderColor: '#4CAF50',
    },
    optionText: {
        fontSize: 14,
        color: '#333',
        fontWeight: '500',
    },
    selectedText: {
        color: '#fff',
    },
    amenitiesGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
    },
    amenityChip: {
        backgroundColor: '#f0f0f0',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 15,
        margin: 4,
        borderWidth: 1,
        borderColor: '#ddd',
    },
    amenityChipText: {
        fontSize: 12,
        color: '#333',
        fontWeight: '500',
    },
    filterActions: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 10,
    },
    clearButton: {
        backgroundColor: '#f5f5f5',
        paddingHorizontal: 20,
        paddingVertical: 12,
        borderRadius: 8,
        flex: 0.45,
        alignItems: 'center',
    },
    clearButtonText: {
        color: '#666',
        fontSize: 16,
        fontWeight: '600',
    },
    applyButton: {
        backgroundColor: '#4CAF50',
        paddingHorizontal: 20,
        paddingVertical: 12,
        borderRadius: 8,
        flex: 0.45,
        alignItems: 'center',
    },
    applyButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
    resultsContainer: {
        paddingHorizontal: 20,
        paddingVertical: 10,
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#e0e0e0',
    },
    resultsText: {
        fontSize: 14,
        color: '#666',
        fontWeight: '500',
    },
    listContainer: {
        padding: 20,
    },
    accommodationCard: {
        backgroundColor: '#fff',
        borderRadius: 12,
        marginBottom: 15,
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    accommodationImage: {
        width: '100%',
        height: 200,
        borderTopLeftRadius: 12,
        borderTopRightRadius: 12,
    },
    accommodationInfo: {
        padding: 15,
    },
    accommodationHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 5,
    },
    accommodationTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
        flex: 1,
        marginRight: 10,
    },
    ratingContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    rating: {
        fontSize: 14,
        color: '#666',
        marginLeft: 4,
        fontWeight: '600',
    },
    accommodationType: {
        fontSize: 14,
        color: '#4CAF50',
        fontWeight: '600',
        marginBottom: 5,
    },
    accommodationLocation: {
        fontSize: 14,
        color: '#666',
        marginBottom: 8,
    },
    accommodationDescription: {
        fontSize: 14,
        color: '#666',
        lineHeight: 20,
        marginBottom: 10,
    },
    amenitiesContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginBottom: 15,
    },
    amenityTag: {
        backgroundColor: '#f0f0f0',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 10,
        marginRight: 6,
        marginBottom: 4,
    },
    amenityText: {
        fontSize: 12,
        color: '#666',
        fontWeight: '500',
    },
    moreAmenities: {
        fontSize: 12,
        color: '#4CAF50',
        fontWeight: '500',
        alignSelf: 'center',
    },
    accommodationFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    priceContainer: {
        flexDirection: 'row',
        alignItems: 'baseline',
    },
    price: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#4CAF50',
    },
    priceUnit: {
        fontSize: 14,
        color: '#666',
        marginLeft: 4,
    },
    bookButton: {
        backgroundColor: '#4CAF50',
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 8,
    },
    bookButtonText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: '600',
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 60,
    },
    emptyText: {
        fontSize: 18,
        color: '#666',
        marginTop: 15,
        fontWeight: '600',
    },
    emptySubText: {
        fontSize: 14,
        color: '#999',
        marginTop: 5,
    },
});

export default AccommodationSearchScreen;
