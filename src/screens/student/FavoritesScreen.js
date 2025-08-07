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
    TextInput
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { Ionicons } from '@expo/vector-icons';

const FavoritesScreen = ({ navigation }) => {
    const [favorites, setFavorites] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [filteredFavorites, setFilteredFavorites] = useState([]);

    useEffect(() => {
        loadFavorites();
    }, []);

    useEffect(() => {
        filterFavorites();
    }, [searchQuery, favorites]);

    const loadFavorites = async () => {
        try {
            setLoading(true);
            // Mock data for favorites
            const mockFavorites = [
                {
                    id: '1',
                    title: 'Modern Studio Apartment',
                    location: 'Downtown Campus Area',
                    price: '$800/month',
                    rating: 4.5,
                    reviews: 23,
                    image: 'https://via.placeholder.com/300x200',
                    amenities: ['WiFi', 'Kitchen', 'Parking', 'Laundry'],
                    distance: '0.5 miles from campus',
                    availability: 'Available Now',
                    notes: 'Close to library and cafeteria',
                    savedDate: '2025-01-15',
                    type: 'Studio'
                },
                {
                    id: '2',
                    title: 'Shared House Near Campus',
                    location: 'University District',
                    price: '$600/month',
                    rating: 4.2,
                    reviews: 18,
                    image: 'https://via.placeholder.com/300x200',
                    amenities: ['WiFi', 'Laundry', 'Garden', 'Parking'],
                    distance: '0.3 miles from campus',
                    availability: 'Available from June',
                    notes: 'Great for sharing with friends',
                    savedDate: '2025-01-10',
                    type: 'Shared Room'
                },
                {
                    id: '3',
                    title: 'Luxury Apartment Complex',
                    location: 'Premium District',
                    price: '$1200/month',
                    rating: 4.8,
                    reviews: 45,
                    image: 'https://via.placeholder.com/300x200',
                    amenities: ['WiFi', 'Gym', 'Pool', 'Parking', 'Security'],
                    distance: '1.2 miles from campus',
                    availability: 'Available Now',
                    notes: 'Premium amenities, worth the price',
                    savedDate: '2025-01-12',
                    type: 'Apartment'
                }
            ];
            setFavorites(mockFavorites);
        } catch (error) {
            console.error('Error loading favorites:', error);
            Alert.alert('Error', 'Failed to load favorites');
        } finally {
            setLoading(false);
        }
    };

    const onRefresh = async () => {
        setRefreshing(true);
        await loadFavorites();
        setRefreshing(false);
    };

    const filterFavorites = () => {
        if (!searchQuery.trim()) {
            setFilteredFavorites(favorites);
            return;
        }

        const filtered = favorites.filter(item =>
            item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.notes.toLowerCase().includes(searchQuery.toLowerCase())
        );
        setFilteredFavorites(filtered);
    };

    const removeFavorite = (id) => {
        Alert.alert(
            'Remove Favorite',
            'Are you sure you want to remove this from your favorites?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Remove',
                    style: 'destructive',
                    onPress: () => {
                        setFavorites(favorites.filter(item => item.id !== id));
                        Alert.alert('Success', 'Removed from favorites');
                    }
                }
            ]
        );
    };

    const navigateToDetail = (accommodation) => {
        navigation.navigate('AccommodationDetail', { 
            accommodationId: accommodation.id,
            accommodation: accommodation 
        });
    };

    const compareSelected = () => {
        const selectedIds = favorites.filter(item => item.selected).map(item => item.id);
        if (selectedIds.length < 2) {
            Alert.alert('Compare Properties', 'Please select at least 2 properties to compare');
            return;
        }
        if (selectedIds.length > 3) {
            Alert.alert('Compare Properties', 'You can compare maximum 3 properties at once');
            return;
        }
        
        navigation.navigate('CompareAccommodations', { 
            accommodationIds: selectedIds 
        });
    };

    const toggleSelection = (id) => {
        setFavorites(favorites.map(item => 
            item.id === id ? { ...item, selected: !item.selected } : item
        ));
    };

    const renderFavoriteCard = (item) => (
        <View key={item.id} style={styles.favoriteCard}>
            {/* Selection checkbox for comparison */}
            <TouchableOpacity 
                style={styles.selectionButton}
                onPress={() => toggleSelection(item.id)}
            >
                <Icon 
                    name={item.selected ? "check-circle" : "radio-button-unchecked"} 
                    size={20} 
                    color={item.selected ? "#3498db" : "#bdc3c7"} 
                />
            </TouchableOpacity>

            <Image source={{ uri: item.image }} style={styles.accommodationImage} />
            
            <View style={styles.cardContent}>
                <View style={styles.cardHeader}>
                    <Text style={styles.accommodationTitle}>{item.title}</Text>
                    <TouchableOpacity 
                        style={styles.removeButton}
                        onPress={() => removeFavorite(item.id)}
                    >
                        <Icon name="favorite" size={24} color="#e74c3c" />
                    </TouchableOpacity>
                </View>
                
                <Text style={styles.accommodationLocation}>{item.location}</Text>
                
                <View style={styles.ratingContainer}>
                    <Icon name="star" size={16} color="#FFD700" />
                    <Text style={styles.ratingText}>{item.rating}</Text>
                    <Text style={styles.reviewsText}>({item.reviews} reviews)</Text>
                </View>
                
                <Text style={styles.accommodationPrice}>{item.price}</Text>
                <Text style={styles.distanceText}>{item.distance}</Text>
                
                <View style={styles.availabilityContainer}>
                    <Icon name="event-available" size={16} color="#27ae60" />
                    <Text style={styles.availabilityText}>{item.availability}</Text>
                </View>
                
                {/* Amenities */}
                <View style={styles.amenitiesContainer}>
                    {item.amenities.slice(0, 3).map((amenity, index) => (
                        <View key={index} style={styles.amenityTag}>
                            <Text style={styles.amenityText}>{amenity}</Text>
                        </View>
                    ))}
                    {item.amenities.length > 3 && (
                        <Text style={styles.moreAmenities}>+{item.amenities.length - 3} more</Text>
                    )}
                </View>
                
                {/* Personal notes */}
                {item.notes && (
                    <View style={styles.notesContainer}>
                        <Icon name="sticky-note-2" size={14} color="#7f8c8d" />
                        <Text style={styles.notesText}>{item.notes}</Text>
                    </View>
                )}
                
                <View style={styles.cardActions}>
                    <TouchableOpacity 
                        style={styles.viewButton}
                        onPress={() => navigateToDetail(item)}
                    >
                        <Text style={styles.viewButtonText}>View Details</Text>
                    </TouchableOpacity>
                    
                    <TouchableOpacity style={styles.contactButton}>
                        <Icon name="phone" size={16} color="#3498db" />
                        <Text style={styles.contactButtonText}>Contact</Text>
                    </TouchableOpacity>
                </View>
                
                <Text style={styles.savedDate}>Saved on {new Date(item.savedDate).toLocaleDateString()}</Text>
            </View>
        </View>
    );

    const renderEmptyState = () => (
        <View style={styles.emptyContainer}>
            <Icon name="favorite-border" size={80} color="#bdc3c7" />
            <Text style={styles.emptyTitle}>No Favorites Yet</Text>
            <Text style={styles.emptyText}>
                Save accommodations you're interested in to view them here
            </Text>
            <TouchableOpacity 
                style={styles.browseButton}
                onPress={() => navigation.navigate('AccommodationsList')}
            >
                <Text style={styles.browseButtonText}>Browse Accommodations</Text>
            </TouchableOpacity>
        </View>
    );

    const selectedCount = favorites.filter(item => item.selected).length;

    return (
        <SafeAreaView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity 
                    style={styles.backButton}
                    onPress={() => navigation.goBack()}
                >
                    <Ionicons name="arrow-back" size={24} color="#2c3e50" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>My Favorites</Text>
                <View style={styles.headerActions}>
                    {selectedCount > 0 && (
                        <TouchableOpacity 
                            style={styles.compareButton}
                            onPress={compareSelected}
                        >
                            <Icon name="compare-arrows" size={20} color="#3498db" />
                            <Text style={styles.compareText}>Compare ({selectedCount})</Text>
                        </TouchableOpacity>
                    )}
                </View>
            </View>

            {/* Search Bar */}
            <View style={styles.searchContainer}>
                <View style={styles.searchBar}>
                    <Icon name="search" size={20} color="#7f8c8d" />
                    <TextInput
                        style={styles.searchInput}
                        placeholder="Search favorites..."
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                    />
                    {searchQuery.length > 0 && (
                        <TouchableOpacity onPress={() => setSearchQuery('')}>
                            <Icon name="clear" size={20} color="#7f8c8d" />
                        </TouchableOpacity>
                    )}
                </View>
            </View>

            {/* Favorites List */}
            <ScrollView
                style={styles.scrollContainer}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                }
                showsVerticalScrollIndicator={false}
            >
                {loading ? (
                    <View style={styles.loadingContainer}>
                        <Text style={styles.loadingText}>Loading favorites...</Text>
                    </View>
                ) : filteredFavorites.length === 0 ? (
                    searchQuery ? (
                        <View style={styles.emptyContainer}>
                            <Icon name="search-off" size={80} color="#bdc3c7" />
                            <Text style={styles.emptyTitle}>No Results Found</Text>
                            <Text style={styles.emptyText}>
                                Try adjusting your search terms
                            </Text>
                        </View>
                    ) : (
                        renderEmptyState()
                    )
                ) : (
                    <View style={styles.favoritesContainer}>
                        {filteredFavorites.map(renderFavoriteCard)}
                    </View>
                )}
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f9f9f9',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 12,
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#ecf0f1',
    },
    backButton: {
        padding: 8,
    },
    headerTitle: {
        flex: 1,
        fontSize: 18,
        fontWeight: '600',
        color: '#2c3e50',
        textAlign: 'center',
        marginLeft: -32, // Compensate for back button
    },
    headerActions: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    compareButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#e3f2fd',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
    },
    compareText: {
        marginLeft: 4,
        fontSize: 12,
        color: '#3498db',
        fontWeight: '600',
    },
    searchContainer: {
        paddingHorizontal: 16,
        paddingVertical: 12,
        backgroundColor: '#fff',
    },
    searchBar: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f8f9fa',
        borderRadius: 25,
        paddingHorizontal: 16,
        paddingVertical: 12,
    },
    searchInput: {
        flex: 1,
        marginLeft: 8,
        fontSize: 16,
        color: '#2c3e50',
    },
    scrollContainer: {
        flex: 1,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 40,
    },
    loadingText: {
        fontSize: 16,
        color: '#7f8c8d',
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 60,
        paddingHorizontal: 32,
    },
    emptyTitle: {
        fontSize: 20,
        fontWeight: '600',
        color: '#7f8c8d',
        marginTop: 16,
        marginBottom: 8,
    },
    emptyText: {
        fontSize: 14,
        color: '#95a5a6',
        textAlign: 'center',
        lineHeight: 20,
        marginBottom: 24,
    },
    browseButton: {
        backgroundColor: '#3498db',
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 25,
    },
    browseButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
    favoritesContainer: {
        paddingHorizontal: 16,
        paddingBottom: 20,
    },
    favoriteCard: {
        backgroundColor: '#fff',
        borderRadius: 12,
        marginBottom: 16,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 3.84,
        position: 'relative',
    },
    selectionButton: {
        position: 'absolute',
        top: 12,
        left: 12,
        zIndex: 1,
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 4,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 1,
        },
        shadowOpacity: 0.2,
        shadowRadius: 1.41,
    },
    accommodationImage: {
        width: '100%',
        height: 200,
        borderTopLeftRadius: 12,
        borderTopRightRadius: 12,
    },
    cardContent: {
        padding: 16,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 8,
    },
    accommodationTitle: {
        flex: 1,
        fontSize: 18,
        fontWeight: '600',
        color: '#2c3e50',
        marginRight: 8,
    },
    removeButton: {
        padding: 4,
    },
    accommodationLocation: {
        fontSize: 14,
        color: '#7f8c8d',
        marginBottom: 8,
    },
    ratingContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    ratingText: {
        marginLeft: 4,
        fontSize: 14,
        fontWeight: '600',
        color: '#2c3e50',
    },
    reviewsText: {
        marginLeft: 4,
        fontSize: 14,
        color: '#7f8c8d',
    },
    accommodationPrice: {
        fontSize: 18,
        fontWeight: '700',
        color: '#27ae60',
        marginBottom: 4,
    },
    distanceText: {
        fontSize: 12,
        color: '#3498db',
        marginBottom: 8,
    },
    availabilityContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    availabilityText: {
        marginLeft: 4,
        fontSize: 14,
        color: '#27ae60',
        fontWeight: '500',
    },
    amenitiesContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        alignItems: 'center',
        marginBottom: 12,
    },
    amenityTag: {
        backgroundColor: '#ecf0f1',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
        marginRight: 6,
        marginBottom: 4,
    },
    amenityText: {
        fontSize: 12,
        color: '#7f8c8d',
    },
    moreAmenities: {
        fontSize: 12,
        color: '#3498db',
        fontWeight: '500',
    },
    notesContainer: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        backgroundColor: '#fff3cd',
        padding: 8,
        borderRadius: 6,
        marginBottom: 12,
    },
    notesText: {
        flex: 1,
        marginLeft: 6,
        fontSize: 12,
        color: '#856404',
        fontStyle: 'italic',
    },
    cardActions: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 8,
    },
    viewButton: {
        flex: 1,
        backgroundColor: '#3498db',
        paddingVertical: 12,
        borderRadius: 6,
        marginRight: 8,
    },
    viewButtonText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: '600',
        textAlign: 'center',
    },
    contactButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#ecf0f1',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderRadius: 6,
    },
    contactButtonText: {
        marginLeft: 4,
        color: '#3498db',
        fontSize: 14,
        fontWeight: '600',
    },
    savedDate: {
        fontSize: 12,
        color: '#95a5a6',
        textAlign: 'right',
        fontStyle: 'italic',
    },
});

export default FavoritesScreen;
