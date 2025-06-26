import React, { useState, useRef, useEffect } from 'react';
import {
    View,
    StyleSheet,
    Dimensions,
    Alert,
    TouchableOpacity,
    Text,
    TextInput,
    ScrollView,
    Modal
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { studentApiService } from '../../services/studentApiService_new';

const { width, height } = Dimensions.get('window');

const MapViewScreen = ({ navigation, route }) => {
    const { type = 'accommodation', location: initialLocation } = route.params || {};
    const mapRef = useRef(null);
    
    const [region, setRegion] = useState({
        latitude: 24.8607, // Default to Karachi
        longitude: 67.0011,
        latitudeDelta: 0.05,
        longitudeDelta: 0.05,
    });
    
    const [markers, setMarkers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedMarker, setSelectedMarker] = useState(null);
    const [modalVisible, setModalVisible] = useState(false);
    const [mapType, setMapType] = useState('standard');

    useEffect(() => {
        initializeMap();
        loadMarkers();
    }, [type]);

    const initializeMap = async () => {
        try {
            const { status } = await Location.requestForegroundPermissionsAsync();
            if (status === 'granted') {
                const userLocation = await Location.getCurrentPositionAsync({});
                setRegion({
                    latitude: userLocation.coords.latitude,
                    longitude: userLocation.coords.longitude,
                    latitudeDelta: 0.05,
                    longitudeDelta: 0.05,
                });
            }
        } catch (error) {
            console.error('Error getting location:', error);
        }
    };

    const loadMarkers = async () => {
        try {
            setLoading(true);
            let data = [];
            
            if (type === 'accommodation') {
                data = await studentApiService.getAccommodations();
            } else if (type === 'food') {
                data = await studentApiService.getFoodProviders();
            }

            // Convert data to markers
            const mapMarkers = data.map((item, index) => ({
                id: item._id || item.id || index.toString(),
                title: item.name || item.title,
                description: item.location || item.address,
                coordinate: {
                    latitude: item.coordinates?.lat || item.latitude || (24.8607 + Math.random() * 0.1),
                    longitude: item.coordinates?.lng || item.longitude || (67.0011 + Math.random() * 0.1),
                },
                price: item.price,
                rating: item.rating || item.averageRating,
                image: item.image || item.images?.[0],
                type: type,
                data: item
            }));

            setMarkers(mapMarkers);
        } catch (error) {
            console.error('Error loading markers:', error);
            Alert.alert('Error', 'Failed to load locations');
        } finally {
            setLoading(false);
        }
    };

    const handleMarkerPress = (marker) => {
        setSelectedMarker(marker);
        setModalVisible(true);
        
        // Animate to marker
        mapRef.current?.animateToRegion({
            ...marker.coordinate,
            latitudeDelta: 0.01,
            longitudeDelta: 0.01,
        }, 1000);
    };

    const handleSearch = async () => {
        if (!searchQuery.trim()) return;

        try {
            const geocoded = await Location.geocodeAsync(searchQuery);
            if (geocoded.length > 0) {
                const location = geocoded[0];
                const newRegion = {
                    latitude: location.latitude,
                    longitude: location.longitude,
                    latitudeDelta: 0.05,
                    longitudeDelta: 0.05,
                };
                setRegion(newRegion);
                mapRef.current?.animateToRegion(newRegion, 1000);
            } else {
                Alert.alert('Location not found', 'Please try a different search term');
            }
        } catch (error) {
            console.error('Geocoding error:', error);
            Alert.alert('Error', 'Failed to search location');
        }
    };

    const navigateToDetails = () => {
        setModalVisible(false);
        
        if (type === 'accommodation') {
            navigation.navigate('AccommodationDetails', {
                accommodationId: selectedMarker.id,
                accommodation: selectedMarker.data
            });
        } else if (type === 'food') {
            navigation.navigate('FoodProviderDetails', {
                providerId: selectedMarker.id,
                provider: selectedMarker.data
            });
        }
    };

    const getMarkerColor = (markerType) => {
        return markerType === 'accommodation' ? '#007bff' : '#28a745';
    };

    const renderMarkerDetail = () => (
        <Modal
            visible={modalVisible}
            transparent={true}
            animationType="slide"
            onRequestClose={() => setModalVisible(false)}
        >
            <View style={styles.modalOverlay}>
                <View style={styles.modalContent}>
                    <View style={styles.modalHeader}>
                        <Text style={styles.modalTitle} numberOfLines={2}>
                            {selectedMarker?.title}
                        </Text>
                        <TouchableOpacity 
                            onPress={() => setModalVisible(false)}
                            style={styles.closeButton}
                        >
                            <Ionicons name="close" size={24} color="#333" />
                        </TouchableOpacity>
                    </View>

                    <View style={styles.modalBody}>
                        <View style={styles.modalRow}>
                            <Ionicons name="location" size={16} color="#6c757d" />
                            <Text style={styles.modalLocation} numberOfLines={2}>
                                {selectedMarker?.description}
                            </Text>
                        </View>

                        {selectedMarker?.price && (
                            <View style={styles.modalRow}>
                                <Ionicons name="pricetag" size={16} color="#28a745" />
                                <Text style={styles.modalPrice}>
                                    PKR {selectedMarker.price.toLocaleString()}
                                    {type === 'accommodation' ? '/month' : ' avg'}
                                </Text>
                            </View>
                        )}

                        {selectedMarker?.rating && (
                            <View style={styles.modalRow}>
                                <Ionicons name="star" size={16} color="#ffc107" />
                                <Text style={styles.modalRating}>
                                    {selectedMarker.rating.toFixed(1)} rating
                                </Text>
                            </View>
                        )}
                    </View>

                    <View style={styles.modalActions}>
                        <TouchableOpacity 
                            style={styles.directionButton}
                            onPress={() => {
                                // Open directions in default maps app
                                const { latitude, longitude } = selectedMarker.coordinate;
                                const url = `https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}`;
                                // Handle URL opening
                            }}
                        >
                            <Ionicons name="navigate" size={16} color="#007bff" />
                            <Text style={styles.directionButtonText}>Directions</Text>
                        </TouchableOpacity>

                        <TouchableOpacity 
                            style={styles.detailsButton}
                            onPress={navigateToDetails}
                        >
                            <Ionicons name="information-circle" size={16} color="white" />
                            <Text style={styles.detailsButtonText}>View Details</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );

    const renderControls = () => (
        <View style={styles.controls}>
            {/* Search Bar */}
            <View style={styles.searchContainer}>
                <TextInput
                    style={styles.searchInput}
                    placeholder={`Search ${type === 'accommodation' ? 'accommodations' : 'restaurants'}...`}
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                    onSubmitEditing={handleSearch}
                    placeholderTextColor="#6c757d"
                />
                <TouchableOpacity style={styles.searchButton} onPress={handleSearch}>
                    <Ionicons name="search" size={20} color="#007bff" />
                </TouchableOpacity>
            </View>

            {/* Map Type Toggle */}
            <TouchableOpacity 
                style={styles.mapTypeButton}
                onPress={() => setMapType(mapType === 'standard' ? 'satellite' : 'standard')}
            >
                <Ionicons 
                    name={mapType === 'standard' ? 'globe-outline' : 'map-outline'} 
                    size={20} 
                    color="#007bff" 
                />
            </TouchableOpacity>

            {/* Current Location Button */}
            <TouchableOpacity 
                style={styles.locationButton}
                onPress={initializeMap}
            >
                <Ionicons name="locate" size={20} color="#007bff" />
            </TouchableOpacity>
        </View>
    );

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Ionicons name="arrow-back" size={24} color="#333" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>
                    {type === 'accommodation' ? 'Accommodations Map' : 'Food Providers Map'}
                </Text>
                <TouchableOpacity 
                    onPress={() => navigation.navigate(type === 'accommodation' ? 'AccommodationsScreen' : 'FoodProviders')}
                >
                    <Ionicons name="list" size={24} color="#007bff" />
                </TouchableOpacity>
            </View>

            <View style={styles.mapContainer}>
                <MapView
                    ref={mapRef}
                    style={styles.map}
                    provider={PROVIDER_GOOGLE}
                    region={region}
                    mapType={mapType}
                    showsUserLocation={true}
                    showsMyLocationButton={false}
                    onRegionChangeComplete={setRegion}
                >
                    {markers.map((marker) => (
                        <Marker
                            key={marker.id}
                            coordinate={marker.coordinate}
                            title={marker.title}
                            description={marker.description}
                            onPress={() => handleMarkerPress(marker)}
                            pinColor={getMarkerColor(marker.type)}
                        />
                    ))}
                </MapView>

                {renderControls()}
                {renderMarkerDetail()}

                {/* Legend */}
                <View style={styles.legend}>
                    <View style={styles.legendItem}>
                        <View style={[styles.legendDot, { backgroundColor: getMarkerColor(type) }]} />
                        <Text style={styles.legendText}>
                            {type === 'accommodation' ? 'Accommodations' : 'Restaurants'}
                        </Text>
                    </View>
                </View>
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingVertical: 15,
        backgroundColor: 'white',
        borderBottomWidth: 1,
        borderBottomColor: '#e9ecef',
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
    },
    mapContainer: {
        flex: 1,
        position: 'relative',
    },
    map: {
        width: width,
        height: '100%',
    },
    controls: {
        position: 'absolute',
        top: 20,
        left: 20,
        right: 20,
    },
    searchContainer: {
        flexDirection: 'row',
        backgroundColor: 'white',
        borderRadius: 25,
        paddingHorizontal: 15,
        paddingVertical: 5,
        marginBottom: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    searchInput: {
        flex: 1,
        fontSize: 16,
        paddingVertical: 10,
        color: '#333',
    },
    searchButton: {
        padding: 10,
    },
    mapTypeButton: {
        position: 'absolute',
        right: 0,
        top: 60,
        backgroundColor: 'white',
        borderRadius: 25,
        padding: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    locationButton: {
        position: 'absolute',
        right: 0,
        top: 110,
        backgroundColor: 'white',
        borderRadius: 25,
        padding: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    legend: {
        position: 'absolute',
        bottom: 20,
        left: 20,
        backgroundColor: 'white',
        borderRadius: 15,
        padding: 15,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    legendItem: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    legendDot: {
        width: 12,
        height: 12,
        borderRadius: 6,
        marginRight: 8,
    },
    legendText: {
        fontSize: 12,
        color: '#333',
        fontWeight: '500',
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: 'white',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        padding: 20,
        maxHeight: height * 0.4,
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 15,
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
        flex: 1,
        marginRight: 10,
    },
    closeButton: {
        padding: 5,
    },
    modalBody: {
        marginBottom: 20,
    },
    modalRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10,
    },
    modalLocation: {
        marginLeft: 10,
        fontSize: 14,
        color: '#6c757d',
        flex: 1,
    },
    modalPrice: {
        marginLeft: 10,
        fontSize: 14,
        color: '#28a745',
        fontWeight: '500',
    },
    modalRating: {
        marginLeft: 10,
        fontSize: 14,
        color: '#ffc107',
        fontWeight: '500',
    },
    modalActions: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    directionButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f8f9fa',
        borderWidth: 1,
        borderColor: '#007bff',
        borderRadius: 20,
        paddingHorizontal: 20,
        paddingVertical: 10,
        flex: 1,
        marginRight: 10,
        justifyContent: 'center',
    },
    directionButtonText: {
        marginLeft: 5,
        fontSize: 14,
        color: '#007bff',
        fontWeight: '500',
    },
    detailsButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#007bff',
        borderRadius: 20,
        paddingHorizontal: 20,
        paddingVertical: 10,
        flex: 1,
        justifyContent: 'center',
    },
    detailsButtonText: {
        marginLeft: 5,
        fontSize: 14,
        color: 'white',
        fontWeight: '500',
    },
});

export default MapViewScreen;
