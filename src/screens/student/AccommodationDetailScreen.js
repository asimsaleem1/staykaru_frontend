import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    ScrollView,
    StyleSheet,
    TouchableOpacity,
    Image,
    Alert,
    Dimensions,
    Share,
    Platform
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { Ionicons } from '@expo/vector-icons';
import authService from '../../services/authService';
import { LinearGradient } from 'expo-linear-gradient';

// Conditional import for MapView (not available on web)
let MapView, Marker;
if (Platform.OS !== 'web') {
    try {
        const maps = require('react-native-maps');
        MapView = maps.default;
        Marker = maps.Marker;
    } catch (error) {
        console.log('MapView not available:', error.message);
    }
}

const { width, height } = Dimensions.get('window');

const AccommodationDetailScreen = ({ navigation, route }) => {
    const { id } = route.params;
    const [accommodation, setAccommodation] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isFavorited, setIsFavorited] = useState(false);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);

    useEffect(() => {
        loadAccommodationDetail();
    }, [id]);

    const loadAccommodationDetail = async () => {
        try {
            setLoading(true);
            const response = await authService.makeAuthenticatedRequest(`/accommodations/${id}`);
            setAccommodation(response.data);
        } catch (error) {
            console.error('Load accommodation detail error:', error);
            Alert.alert('Error', 'Failed to load accommodation details');
            navigation.goBack();
        } finally {
            setLoading(false);
        }
    };

    const handleBookNow = () => {
        navigation.navigate('BookingForm', { accommodationId: id });
    };

    const handleToggleFavorite = async () => {
        try {
            await authService.makeAuthenticatedRequest(`/accommodations/${id}/favorite`, 'POST');
            setIsFavorited(!isFavorited);
        } catch (error) {
            console.error('Toggle favorite error:', error);
            Alert.alert('Error', 'Failed to update favorites');
        }
    };

    const handleShare = async () => {
        try {
            await Share.share({
                message: `Check out this accommodation: ${accommodation.title}`,
                url: `https://staykaru.com/accommodations/${id}`,
            });
        } catch (error) {
            console.error('Share error:', error);
        }
    };

    const handleContactOwner = () => {
        Alert.alert(
            'Contact Owner',
            'Choose how you want to contact the owner:',
            [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Call', onPress: () => console.log('Call owner') },
                { text: 'Message', onPress: () => console.log('Message owner') }
            ]
        );
    };

    const AmenityItem = ({ amenity }) => (
        <View style={styles.amenityItem}>
            <Icon name="check-circle" size={20} color="#4CAF50" />
            <Text style={styles.amenityText}>{amenity}</Text>
        </View>
    );

    const ReviewItem = ({ review }) => (
        <View style={styles.reviewItem}>
            <View style={styles.reviewHeader}>
                <View style={styles.reviewerInfo}>
                    <View style={styles.reviewerAvatar}>
                        <Text style={styles.reviewerInitial}>
                            {review.reviewer?.name?.charAt(0) || 'U'}
                        </Text>
                    </View>
                    <View>
                        <Text style={styles.reviewerName}>
                            {review.reviewer?.name || 'Anonymous'}
                        </Text>
                        <Text style={styles.reviewDate}>
                            {new Date(review.created_at).toLocaleDateString()}
                        </Text>
                    </View>
                </View>
                <View style={styles.reviewRating}>
                    {[...Array(5)].map((_, index) => (
                        <Icon
                            key={index}
                            name="star"
                            size={16}
                            color={index < review.rating ? "#FFD700" : "#E0E0E0"}
                        />
                    ))}
                </View>
            </View>
            <Text style={styles.reviewText}>{review.comment}</Text>
        </View>
    );

    if (loading) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.loadingContainer}>
                    <Text style={styles.loadingText}>Loading accommodation details...</Text>
                </View>
            </SafeAreaView>
        );
    }

    if (!accommodation) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.errorContainer}>
                    <Text style={styles.errorText}>Accommodation not found</Text>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView contentContainerStyle={styles.scrollContent}>
                {/* Image Gallery */}
                <View style={styles.imageGallery}>
                    <ScrollView
                        horizontal
                        pagingEnabled
                        showsHorizontalScrollIndicator={false}
                        onMomentumScrollEnd={(event) => {
                            const index = Math.round(event.nativeEvent.contentOffset.x / width);
                            setCurrentImageIndex(index);
                        }}
                    >
                        {(accommodation.images || []).map((image, index) => (
                            <Image
                                key={index}
                                source={{ uri: image || 'https://via.placeholder.com/400x300' }}
                                style={styles.accommodationImage}
                            />
                        ))}
                    </ScrollView>

                    {/* Image Indicators */}
                    {accommodation.images && accommodation.images.length > 1 && (
                        <View style={styles.imageIndicators}>
                            {accommodation.images.map((_, index) => (
                                <View
                                    key={index}
                                    style={[
                                        styles.indicator,
                                        index === currentImageIndex && styles.activeIndicator
                                    ]}
                                />
                            ))}
                        </View>
                    )}

                    {/* Header Actions */}
                    <View style={styles.headerActions}>
                        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
                            <Icon name="arrow-back" size={24} color="#fff" />
                        </TouchableOpacity>
                        <View style={styles.rightActions}>
                            <TouchableOpacity style={styles.actionButton} onPress={handleShare}>
                                <Icon name="share" size={20} color="#fff" />
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.actionButton} onPress={handleToggleFavorite}>
                                <Icon
                                    name={isFavorited ? "favorite" : "favorite-border"}
                                    size={20}
                                    color="#fff"
                                />
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>

                {/* Accommodation Info */}
                <View style={styles.accommodationInfo}>
                    <View style={styles.titleSection}>
                        <Text style={styles.accommodationTitle}>{accommodation.title}</Text>
                        <Text style={styles.accommodationType}>
                            {accommodation.type} • {accommodation.location?.city}
                        </Text>
                        <View style={styles.ratingSection}>
                            <View style={styles.ratingContainer}>
                                <Icon name="star" size={20} color="#FFD700" />
                                <Text style={styles.ratingText}>
                                    {accommodation.rating || '4.5'} ({accommodation.reviews_count || 0} reviews)
                                </Text>
                            </View>
                            <Text style={styles.accommodationPrice}>
                                ${accommodation.price}/night
                            </Text>
                        </View>
                    </View>

                    {/* Description */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Description</Text>
                        <Text style={styles.description}>
                            {accommodation.description || 'No description available.'}
                        </Text>
                    </View>

                    {/* Key Details */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Key Details</Text>
                        <View style={styles.detailsGrid}>
                            <View style={styles.detailItem}>
                                <Icon name="people" size={20} color="#666" />
                                <Text style={styles.detailText}>
                                    {accommodation.max_guests || 1} guests
                                </Text>
                            </View>
                            <View style={styles.detailItem}>
                                <Icon name="bed" size={20} color="#666" />
                                <Text style={styles.detailText}>
                                    {accommodation.bedrooms || 1} bedroom
                                </Text>
                            </View>
                            <View style={styles.detailItem}>
                                <Icon name="bathtub" size={20} color="#666" />
                                <Text style={styles.detailText}>
                                    {accommodation.bathrooms || 1} bathroom
                                </Text>
                            </View>
                            <View style={styles.detailItem}>
                                <Icon name="square-foot" size={20} color="#666" />
                                <Text style={styles.detailText}>
                                    {accommodation.area || 'N/A'} sq ft
                                </Text>
                            </View>
                        </View>
                    </View>

                    {/* Amenities */}
                    {accommodation.amenities && accommodation.amenities.length > 0 && (
                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>Amenities</Text>
                            <View style={styles.amenitiesGrid}>
                                {accommodation.amenities.map((amenity, index) => (
                                    <AmenityItem key={index} amenity={amenity} />
                                ))}
                            </View>
                        </View>
                    )}

                    {/* Location */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Location</Text>
                        <View style={styles.locationInfo}>
                            <Icon name="location-on" size={20} color="#E91E63" />
                            <Text style={styles.locationText}>
                                {accommodation.location?.address || 'Address not provided'}
                            </Text>
                        </View>                        {/* Map View - only on mobile platforms */}
                        {Platform.OS !== 'web' && MapView && accommodation.location?.coordinates ? (
                            <MapView
                                style={styles.mapContainer}
                                initialRegion={{
                                    latitude: accommodation.location.coordinates.lat || 33.6844,
                                    longitude: accommodation.location.coordinates.lng || 73.0479,
                                    latitudeDelta: 0.01,
                                    longitudeDelta: 0.01,
                                }}
                            >
                                <Marker
                                    coordinate={{
                                        latitude: accommodation.location.coordinates.lat || 33.6844,
                                        longitude: accommodation.location.coordinates.lng || 73.0479,
                                    }}
                                    title={accommodation.title}
                                    description={accommodation.location?.address}
                                />
                            </MapView>
                        ) : (
                            <View style={styles.mapPlaceholder}>
                                <Icon name="location-on" size={48} color="#ccc" />
                                <Text style={styles.mapPlaceholderText}>Location on Map</Text>
                                <Text style={styles.mapPlaceholderSubtext}>
                                    {Platform.OS === 'web' 
                                        ? 'Map view is available on mobile devices'
                                        : accommodation.location?.coordinates 
                                            ? 'Loading map...' 
                                            : 'Map will be available when location coordinates are provided'
                                    }
                                </Text>
                            </View>
                        )}
                    </View>

                    {/* House Rules */}
                    {accommodation.house_rules && accommodation.house_rules.length > 0 && (
                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>House Rules</Text>
                            {accommodation.house_rules.map((rule, index) => (
                                <View key={index} style={styles.ruleItem}>
                                    <Icon name="info" size={16} color="#666" />
                                    <Text style={styles.ruleText}>{rule}</Text>
                                </View>
                            ))}
                        </View>
                    )}

                    {/* Reviews */}
                    {accommodation.reviews && accommodation.reviews.length > 0 && (
                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>
                                Reviews ({accommodation.reviews.length})
                            </Text>
                            {accommodation.reviews.slice(0, 3).map((review, index) => (
                                <ReviewItem key={index} review={review} />
                            ))}
                            {accommodation.reviews.length > 3 && (
                                <TouchableOpacity style={styles.seeAllReviewsButton}>
                                    <Text style={styles.seeAllReviewsText}>
                                        See all {accommodation.reviews.length} reviews
                                    </Text>
                                </TouchableOpacity>
                            )}
                        </View>
                    )}

                    {/* Contact Owner */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Host Information</Text>
                        <View style={styles.hostInfo}>
                            <View style={styles.hostAvatar}>
                                <Text style={styles.hostInitial}>
                                    {accommodation.owner?.name?.charAt(0) || 'H'}
                                </Text>
                            </View>
                            <View style={styles.hostDetails}>
                                <Text style={styles.hostName}>
                                    {accommodation.owner?.name || 'Host'}
                                </Text>
                                <Text style={styles.hostJoined}>
                                    Joined {new Date(accommodation.owner?.created_at || Date.now()).getFullYear()}
                                </Text>
                            </View>
                            <TouchableOpacity style={styles.contactButton} onPress={handleContactOwner}>
                                <Text style={styles.contactButtonText}>Contact</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </ScrollView>

            {/* Bottom Action Bar */}
            <LinearGradient
                colors={['transparent', 'rgba(255,255,255,0.9)', '#fff']}
                style={styles.bottomBar}
            >
                <View style={styles.priceInfo}>
                    <Text style={styles.priceLabel}>Price per night</Text>
                    <Text style={styles.priceValue}>${accommodation.price}</Text>
                </View>
                <TouchableOpacity style={styles.bookButton} onPress={handleBookNow}>
                    <Text style={styles.bookButtonText}>Book Now</Text>
                </TouchableOpacity>
            </LinearGradient>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    scrollContent: {
        flexGrow: 1,
        paddingBottom: 100,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        fontSize: 16,
        color: '#666',
    },
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    errorText: {
        fontSize: 16,
        color: '#666',
    },
    imageGallery: {
        height: height * 0.4,
        position: 'relative',
    },
    accommodationImage: {
        width: width,
        height: '100%',
    },
    imageIndicators: {
        position: 'absolute',
        bottom: 20,
        left: 0,
        right: 0,
        flexDirection: 'row',
        justifyContent: 'center',
    },
    indicator: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: 'rgba(255,255,255,0.5)',
        marginHorizontal: 4,
    },
    activeIndicator: {
        backgroundColor: '#fff',
    },
    headerActions: {
        position: 'absolute',
        top: 40,
        left: 0,
        right: 0,
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
    },
    backButton: {
        backgroundColor: 'rgba(0,0,0,0.5)',
        borderRadius: 20,
        padding: 8,
    },
    rightActions: {
        flexDirection: 'row',
    },
    actionButton: {
        backgroundColor: 'rgba(0,0,0,0.5)',
        borderRadius: 20,
        padding: 8,
        marginLeft: 10,
    },
    accommodationInfo: {
        padding: 20,
    },
    titleSection: {
        marginBottom: 20,
    },
    accommodationTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 5,
    },
    accommodationType: {
        fontSize: 16,
        color: '#666',
        marginBottom: 10,
    },
    ratingSection: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    ratingContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    ratingText: {
        fontSize: 16,
        color: '#666',
        marginLeft: 5,
    },
    accommodationPrice: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#4A90E2',
    },
    section: {
        marginBottom: 25,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 15,
    },
    description: {
        fontSize: 16,
        color: '#666',
        lineHeight: 24,
    },
    detailsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
    },
    detailItem: {
        flexDirection: 'row',
        alignItems: 'center',
        width: '48%',
        marginBottom: 15,
    },
    detailText: {
        fontSize: 14,
        color: '#666',
        marginLeft: 10,
    },
    amenitiesGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
    },
    amenityItem: {
        flexDirection: 'row',
        alignItems: 'center',
        width: '50%',
        marginBottom: 10,
    },
    amenityText: {
        fontSize: 14,
        color: '#666',
        marginLeft: 10,
    },
    locationInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 15,
    },
    locationText: {
        fontSize: 16,
        color: '#666',
        marginLeft: 10,
        flex: 1,
    },    mapContainer: {
        height: 200,
        borderRadius: 10,
        overflow: 'hidden',
        marginTop: 10,
    },
    mapPlaceholder: {
        height: 200,
        backgroundColor: '#f5f5f5',
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 10,
    },
    mapPlaceholderText: {
        fontSize: 16,
        color: '#666',
        fontWeight: '600',
        marginTop: 10,
    },
    mapPlaceholderSubtext: {
        fontSize: 12,
        color: '#999',
        marginTop: 5,
        textAlign: 'center',
        paddingHorizontal: 20,
    },
    ruleItem: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginBottom: 10,
    },
    ruleText: {
        fontSize: 14,
        color: '#666',
        marginLeft: 10,
        flex: 1,
    },
    reviewItem: {
        backgroundColor: '#f8f9fa',
        borderRadius: 10,
        padding: 15,
        marginBottom: 15,
    },
    reviewHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 10,
    },
    reviewerInfo: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    reviewerAvatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#4A90E2',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 10,
    },
    reviewerInitial: {
        color: '#fff',
        fontWeight: 'bold',
    },
    reviewerName: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#333',
    },
    reviewDate: {
        fontSize: 12,
        color: '#666',
    },
    reviewRating: {
        flexDirection: 'row',
    },
    reviewText: {
        fontSize: 14,
        color: '#666',
        lineHeight: 20,
    },
    seeAllReviewsButton: {
        alignItems: 'center',
        paddingVertical: 10,
    },
    seeAllReviewsText: {
        color: '#4A90E2',
        fontSize: 16,
        fontWeight: 'bold',
    },
    hostInfo: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    hostAvatar: {
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: '#4A90E2',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 15,
    },
    hostInitial: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
    },
    hostDetails: {
        flex: 1,
    },
    hostName: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
    },
    hostJoined: {
        fontSize: 14,
        color: '#666',
    },
    contactButton: {
        backgroundColor: '#4A90E2',
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 20,
    },
    contactButtonText: {
        color: '#fff',
        fontWeight: 'bold',
    },
    bottomBar: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingVertical: 15,
        paddingBottom: 30,
    },
    priceInfo: {
        flex: 1,
    },
    priceLabel: {
        fontSize: 12,
        color: '#666',
    },
    priceValue: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#333',
    },
    bookButton: {
        backgroundColor: '#4A90E2',
        paddingHorizontal: 30,
        paddingVertical: 15,
        borderRadius: 25,
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 3,
    },
    bookButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
});

export default AccommodationDetailScreen;
