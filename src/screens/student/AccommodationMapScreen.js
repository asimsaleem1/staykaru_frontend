import React, { useState, useEffect, useRef } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    TextInput,
    Alert,
    Platform,
    Dimensions,
    Modal,
    ScrollView,
    Image
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { Ionicons } from '@expo/vector-icons';
import MapView, { Marker, Callout, PROVIDER_GOOGLE } from 'react-native-maps';
import * as Location from 'expo-location';
import { COLORS, SIZES } from '../../utils/constants';
import recommendationService from '../../services/recommendationService';

const { width, height } = Dimensions.get('window');

const AccommodationMapScreen = ({ navigation, route }) => {
    const [accommodations, setAccommodations] = useState([]);
    const [foodProviders, setFoodProviders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedProperty, setSelectedProperty] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchType, setSearchType] = useState('accommodation'); // 'accommodation' or 'food'
    const [showPropertyModal, setShowPropertyModal] = useState(false);
    const [userLocation, setUserLocation] = useState(null);
    const [mapRegion, setMapRegion] = useState({
        latitude: 24.8607, // Karachi coordinates
        longitude: 67.0011,
        latitudeDelta: 0.0922,
        longitudeDelta: 0.0421,
    });
    const mapRef = useRef(null);

    useEffect(() => {
        loadData();
        getCurrentLocation();
    }, [searchType]);

    const getCurrentLocation = async () => {
        try {
            let { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') {
                Alert.alert('Permission denied', 'Permission to access location was denied');
                return;
            }

            let location = await Location.getCurrentPositionAsync({});
            const { latitude, longitude } = location.coords;
            
            setUserLocation({ latitude, longitude });
            setMapRegion({
                latitude,
                longitude,
                latitudeDelta: 0.0922,
                longitudeDelta: 0.0421,
            });

            // Update user location in recommendation service
            await recommendationService.updateUserLocation(latitude, longitude);
            
            // Center map on user location
            if (mapRef.current) {
                mapRef.current.animateToRegion({
                    latitude,
                    longitude,
                    latitudeDelta: 0.0922,
                    longitudeDelta: 0.0421,
                }, 1000);
            }
        } catch (error) {
            console.error('Error getting location:', error);
            Alert.alert('Error', 'Failed to get your location');
        }
    };

    const loadData = async () => {
        try {
            setLoading(true);
            
            if (searchType === 'accommodation') {
                const response = await recommendationService.getPersonalizedAccommodations();
                if (response.success) {
                    setAccommodations(response.data.map(item => ({
                        ...item,
                        coordinate: {
                            latitude: item.latitude || (24.8607 + (Math.random() - 0.5) * 0.1),
                            longitude: item.longitude || (67.0011 + (Math.random() - 0.5) * 0.1),
                        }
                    })));
                }
            } else {
                const response = await recommendationService.getPersonalizedFoodOptions();
                if (response.success) {
                    setFoodProviders(response.data.map(item => ({
                        ...item,
                        coordinate: {
                            latitude: item.latitude || (24.8607 + (Math.random() - 0.5) * 0.1),
                            longitude: item.longitude || (67.0011 + (Math.random() - 0.5) * 0.1),
                        }
                    })));
                }
            }
        } catch (error) {
            console.error('Error loading data:', error);
            Alert.alert('Error', 'Failed to load data');
        } finally {
            setLoading(false);
        }
    };

    const handleMarkerPress = (item) => {
        setSelectedProperty(item);
        setShowPropertyModal(true);
        
        // Track user interaction
        recommendationService.trackUserInteraction(
            searchType, 
            item.id, 
            'marker_click'
        );
    };

    const handleSearch = async () => {
        if (!searchQuery.trim()) return;
        
        try {
            setLoading(true);
            const response = await recommendationService.searchWithRecommendations(
                searchQuery, 
                searchType
            );
            
            if (response.success) {
                if (searchType === 'accommodation') {
                    setAccommodations(response.data.map(item => ({
                        ...item,
                        coordinate: {
                            latitude: item.latitude || (24.8607 + (Math.random() - 0.5) * 0.1),
                            longitude: item.longitude || (67.0011 + (Math.random() - 0.5) * 0.1),
                        }
                    })));
                } else {
                    setFoodProviders(response.data.map(item => ({
                        ...item,
                        coordinate: {
                            latitude: item.latitude || (24.8607 + (Math.random() - 0.5) * 0.1),
                            longitude: item.longitude || (67.0011 + (Math.random() - 0.5) * 0.1),
                        }
                    })));
                }
            }
        } catch (error) {
            console.error('Error searching:', error);
            Alert.alert('Error', 'Search failed');
        } finally {
            setLoading(false);
        }
    };

    const handleBookNow = () => {
        if (selectedProperty && searchType === 'accommodation') {
            setShowPropertyModal(false);
            navigation.navigate('BookingForm', { property: selectedProperty });
        } else if (selectedProperty && searchType === 'food') {
            setShowPropertyModal(false);
            navigation.navigate('FoodProviderDetail', { provider: selectedProperty });
        }
    };

    const renderPropertyModal = () => {
        if (!selectedProperty) return null;

        return (
            <Modal
                visible={showPropertyModal}
                animationType="slide"
                transparent={true}
                onRequestClose={() => setShowPropertyModal(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>
                                {searchType === 'accommodation' ? selectedProperty.title : selectedProperty.name}
                            </Text>
                            <TouchableOpacity onPress={() => setShowPropertyModal(false)}>
                                <Ionicons name="close" size={24} color={COLORS.dark} />
                            </TouchableOpacity>
                        </View>

                        <ScrollView style={styles.modalBody}>
                            {selectedProperty.images && selectedProperty.images[0] && (
                                <Image
                                    source={{ uri: selectedProperty.images[0] }}
                                    style={styles.propertyImage}
                                />
                            )}

                            <View style={styles.propertyInfo}>
                                <View style={styles.priceRatingRow}>
                                    <Text style={styles.propertyPrice}>
                                        {searchType === 'accommodation' 
                                            ? `₨${selectedProperty.price?.toLocaleString()}/month`
                                            : selectedProperty.priceRange
                                        }
                                    </Text>
                                    <View style={styles.ratingContainer}>
                                        <Ionicons name="star" size={16} color="#FFD700" />
                                        <Text style={styles.ratingText}>
                                            {selectedProperty.rating} ({selectedProperty.reviewCount || 0})
                                        </Text>
                                    </View>
                                </View>

                                {selectedProperty.location && (
                                    <View style={styles.locationRow}>
                                        <Ionicons name="location" size={16} color={COLORS.gray[600]} />
                                        <Text style={styles.locationText}>{selectedProperty.location}</Text>
                                    </View>
                                )}

                                {selectedProperty.distance && (
                                    <View style={styles.locationRow}>
                                        <Ionicons name="walk" size={16} color={COLORS.gray[600]} />
                                        <Text style={styles.locationText}>{selectedProperty.distance}</Text>
                                    </View>
                                )}

                                {searchType === 'accommodation' && selectedProperty.amenities && (
                                    <View style={styles.amenitiesSection}>
                                        <Text style={styles.sectionTitle}>Amenities</Text>
                                        <View style={styles.amenitiesGrid}>
                                            {selectedProperty.amenities.slice(0, 6).map((amenity, index) => (
                                                <View key={index} style={styles.amenityChip}>
                                                    <Text style={styles.amenityText}>{amenity}</Text>
                                                </View>
                                            ))}
                                        </View>
                                    </View>
                                )}

                                {searchType === 'food' && selectedProperty.specialties && (
                                    <View style={styles.amenitiesSection}>
                                        <Text style={styles.sectionTitle}>Specialties</Text>
                                        <View style={styles.amenitiesGrid}>
                                            {selectedProperty.specialties.slice(0, 6).map((specialty, index) => (
                                                <View key={index} style={styles.amenityChip}>
                                                    <Text style={styles.amenityText}>{specialty}</Text>
                                                </View>
                                            ))}
                                        </View>
                                    </View>
                                )}

                                {selectedProperty.matchReasons && (
                                    <View style={styles.matchSection}>
                                        <Text style={styles.sectionTitle}>Why this matches you</Text>
                                        {selectedProperty.matchReasons.map((reason, index) => (
                                            <View key={index} style={styles.matchReasonRow}>
                                                <Ionicons name="checkmark-circle" size={16} color={COLORS.success} />
                                                <Text style={styles.matchReasonText}>{reason}</Text>
                                            </View>
                                        ))}
                                    </View>
                                )}
                            </View>
                        </ScrollView>

                        <View style={styles.modalFooter}>
                            <TouchableOpacity
                                style={styles.detailsButton}
                                onPress={() => {
                                    setShowPropertyModal(false);
                                    if (searchType === 'accommodation') {
                                        navigation.navigate('AccommodationDetail', { property: selectedProperty });
                                    } else {
                                        navigation.navigate('FoodProviderDetail', { provider: selectedProperty });
                                    }
                                }}
                            >
                                <Text style={styles.detailsButtonText}>View Details</Text>
                            </TouchableOpacity>
                            
                            <TouchableOpacity
                                style={styles.bookButton}
                                onPress={handleBookNow}
                            >
                                <Text style={styles.bookButtonText}>
                                    {searchType === 'accommodation' ? 'Book Now' : 'Order Now'}
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        );
    };

    const renderMarkers = () => {
        const items = searchType === 'accommodation' ? accommodations : foodProviders;
        
        return items.map((item, index) => (
            <Marker
                key={item.id}
                coordinate={item.coordinate}
                onPress={() => handleMarkerPress(item)}
            >
                <View style={[
                    styles.markerContainer,
                    { backgroundColor: searchType === 'accommodation' ? COLORS.primary : COLORS.warning }
                ]}>
                    <Ionicons 
                        name={searchType === 'accommodation' ? 'home' : 'restaurant'} 
                        size={20} 
                        color={COLORS.light} 
                    />
                </View>
                <Callout tooltip>
                    <View style={styles.calloutContainer}>
                        <Text style={styles.calloutTitle}>
                            {searchType === 'accommodation' ? item.title : item.name}
                        </Text>
                        <Text style={styles.calloutPrice}>
                            {searchType === 'accommodation' 
                                ? `₨${item.price?.toLocaleString()}/month`
                                : item.priceRange
                            }
                        </Text>
                        <View style={styles.calloutRating}>
                            <Ionicons name="star" size={12} color="#FFD700" />
                            <Text style={styles.calloutRatingText}>{item.rating}</Text>
                        </View>
                    </View>
                </Callout>
            </Marker>
        ));
    };

    return (
        <SafeAreaView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Ionicons name="arrow-back" size={24} color={COLORS.dark} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Explore Map</Text>
                <TouchableOpacity onPress={getCurrentLocation}>
                    <Ionicons name="locate" size={24} color={COLORS.primary} />
                </TouchableOpacity>
            </View>

            {/* Search Section */}
            <View style={styles.searchSection}>
                <View style={styles.searchTypeToggle}>
                    <TouchableOpacity
                        style={[
                            styles.toggleButton,
                            searchType === 'accommodation' && styles.toggleButtonActive
                        ]}
                        onPress={() => setSearchType('accommodation')}
                    >
                        <Ionicons 
                            name="home" 
                            size={16} 
                            color={searchType === 'accommodation' ? COLORS.light : COLORS.dark} 
                        />
                        <Text style={[
                            styles.toggleButtonText,
                            searchType === 'accommodation' && styles.toggleButtonTextActive
                        ]}>
                            Accommodation
                        </Text>
                    </TouchableOpacity>
                    
                    <TouchableOpacity
                        style={[
                            styles.toggleButton,
                            searchType === 'food' && styles.toggleButtonActive
                        ]}
                        onPress={() => setSearchType('food')}
                    >
                        <Ionicons 
                            name="restaurant" 
                            size={16} 
                            color={searchType === 'food' ? COLORS.light : COLORS.dark} 
                        />
                        <Text style={[
                            styles.toggleButtonText,
                            searchType === 'food' && styles.toggleButtonTextActive
                        ]}>
                            Food
                        </Text>
                    </TouchableOpacity>
                </View>

                <View style={styles.searchInputContainer}>
                    <TextInput
                        style={styles.searchInput}
                        placeholder={`Search for ${searchType === 'accommodation' ? 'accommodations' : 'restaurants'}...`}
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                        onSubmitEditing={handleSearch}
                    />
                    <TouchableOpacity style={styles.searchButton} onPress={handleSearch}>
                        <Ionicons name="search" size={20} color={COLORS.light} />
                    </TouchableOpacity>
                </View>
            </View>

            {/* Map */}
            <View style={styles.mapContainer}>
                <MapView
                    ref={mapRef}
                    style={styles.map}
                    provider={PROVIDER_GOOGLE}
                    region={mapRegion}
                    onRegionChangeComplete={setMapRegion}
                    showsUserLocation={true}
                    showsMyLocationButton={false}
                    showsCompass={true}
                    showsScale={true}
                >
                    {renderMarkers()}
                </MapView>

                {/* Floating Action Buttons */}
                <View style={styles.floatingButtons}>
                    <TouchableOpacity 
                        style={styles.floatingButton}
                        onPress={() => navigation.navigate('Chatbot')}
                    >
                        <Ionicons name="chatbubble-ellipses" size={24} color={COLORS.light} />
                    </TouchableOpacity>
                    
                    <TouchableOpacity 
                        style={styles.floatingButton}
                        onPress={() => {
                            if (searchType === 'accommodation') {
                                navigation.navigate('AccommodationsListScreen');
                            } else {
                                navigation.navigate('FoodProvidersListScreen');
                            }
                        }}
                    >
                        <Ionicons name="list" size={24} color={COLORS.light} />
                    </TouchableOpacity>
                </View>
            </View>

            {renderPropertyModal()}
        </SafeAreaView>
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
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingVertical: 16,
        backgroundColor: COLORS.light,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.gray[200],
    },
    headerTitle: {
        fontSize: SIZES.h3,
        fontWeight: 'bold',
        color: COLORS.dark,
    },
    searchSection: {
        backgroundColor: COLORS.light,
        paddingHorizontal: 20,
        paddingBottom: 16,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.gray[200],
    },
    searchTypeToggle: {
        flexDirection: 'row',
        backgroundColor: COLORS.gray[100],
        borderRadius: 8,
        padding: 4,
        marginBottom: 16,
    },
    toggleButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 8,
        borderRadius: 6,
    },
    toggleButtonActive: {
        backgroundColor: COLORS.primary,
    },
    toggleButtonText: {
        fontSize: SIZES.body2,
        fontWeight: '500',
        color: COLORS.dark,
        marginLeft: 6,
    },
    toggleButtonTextActive: {
        color: COLORS.light,
    },
    searchInputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    searchInput: {
        flex: 1,
        height: 44,
        backgroundColor: COLORS.gray[100],
        borderRadius: 8,
        paddingHorizontal: 16,
        fontSize: SIZES.body2,
        color: COLORS.dark,
        marginRight: 12,
    },
    searchButton: {
        width: 44,
        height: 44,
        backgroundColor: COLORS.primary,
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
    },
    mapContainer: {
        flex: 1,
        position: 'relative',
    },
    map: {
        flex: 1,
    },
    markerContainer: {
        width: 40,
        height: 40,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 2,
        borderColor: COLORS.light,
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 3,
    },
    calloutContainer: {
        backgroundColor: COLORS.light,
        padding: 12,
        borderRadius: 8,
        minWidth: 150,
        alignItems: 'center',
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 3,
    },
    calloutTitle: {
        fontSize: SIZES.body2,
        fontWeight: '600',
        color: COLORS.dark,
        textAlign: 'center',
        marginBottom: 4,
    },
    calloutPrice: {
        fontSize: SIZES.body3,
        color: COLORS.primary,
        fontWeight: '500',
        marginBottom: 4,
    },
    calloutRating: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    calloutRatingText: {
        fontSize: SIZES.body3,
        color: COLORS.dark,
        marginLeft: 2,
    },
    floatingButtons: {
        position: 'absolute',
        right: 20,
        bottom: 20,
        gap: 12,
    },
    floatingButton: {
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: COLORS.primary,
        alignItems: 'center',
        justifyContent: 'center',
        elevation: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 5,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: COLORS.light,
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        maxHeight: height * 0.8,
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 20,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.gray[200],
    },
    modalTitle: {
        fontSize: SIZES.h4,
        fontWeight: 'bold',
        color: COLORS.dark,
        flex: 1,
        marginRight: 16,
    },
    modalBody: {
        flex: 1,
    },
    propertyImage: {
        width: '100%',
        height: 200,
        resizeMode: 'cover',
    },
    propertyInfo: {
        padding: 20,
    },
    priceRatingRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    propertyPrice: {
        fontSize: SIZES.h4,
        fontWeight: 'bold',
        color: COLORS.primary,
    },
    ratingContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    ratingText: {
        fontSize: SIZES.body2,
        color: COLORS.dark,
        marginLeft: 4,
    },
    locationRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    locationText: {
        fontSize: SIZES.body2,
        color: COLORS.gray[600],
        marginLeft: 8,
    },
    amenitiesSection: {
        marginTop: 16,
    },
    sectionTitle: {
        fontSize: SIZES.body1,
        fontWeight: '600',
        color: COLORS.dark,
        marginBottom: 12,
    },
    amenitiesGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    amenityChip: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        backgroundColor: COLORS.gray[100],
        borderRadius: 16,
    },
    amenityText: {
        fontSize: SIZES.body3,
        color: COLORS.dark,
    },
    matchSection: {
        marginTop: 16,
    },
    matchReasonRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    matchReasonText: {
        fontSize: SIZES.body2,
        color: COLORS.dark,
        marginLeft: 8,
    },
    modalFooter: {
        flexDirection: 'row',
        padding: 20,
        gap: 12,
        borderTopWidth: 1,
        borderTopColor: COLORS.gray[200],
    },
    detailsButton: {
        flex: 1,
        paddingVertical: 16,
        backgroundColor: COLORS.gray[100],
        borderRadius: 8,
        alignItems: 'center',
    },
    detailsButtonText: {
        fontSize: SIZES.body1,
        fontWeight: '600',
        color: COLORS.dark,
    },
    bookButton: {
        flex: 1,
        paddingVertical: 16,
        backgroundColor: COLORS.primary,
        borderRadius: 8,
        alignItems: 'center',
    },
    bookButtonText: {
        fontSize: SIZES.body1,
        fontWeight: '600',
        color: COLORS.light,
    },
});

export default AccommodationMapScreen;
