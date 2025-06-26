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
    Dimensions,
    Share
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { studentApiService } from '../../services/studentApiService_new';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

const AccommodationDetailsScreen = ({ navigation, route }) => {
    const { accommodationId, accommodation: initialAccommodation } = route.params;
    const [accommodation, setAccommodation] = useState(initialAccommodation || null);
    const [loading, setLoading] = useState(!initialAccommodation);
    const [activeImageIndex, setActiveImageIndex] = useState(0);
    const [bookingLoading, setBookingLoading] = useState(false);

    useEffect(() => {
        if (!initialAccommodation) {
            loadAccommodationDetails();
        }
    }, [accommodationId]);

    const loadAccommodationDetails = async () => {
        try {
            setLoading(true);
            const data = await studentApiService.getAccommodationDetails(accommodationId);
            setAccommodation(data);
        } catch (error) {
            console.error('Error loading accommodation details:', error);
            Alert.alert('Error', 'Failed to load accommodation details');
            navigation.goBack();
        } finally {
            setLoading(false);
        }
    };

    const handleBooking = async () => {
        Alert.alert(
            'Book Accommodation',
            'Select booking period',
            [
                { text: 'Cancel', style: 'cancel' },
                { 
                    text: 'Book for 1 Month', 
                    onPress: () => createBooking(1) 
                },
                { 
                    text: 'Book for 3 Months', 
                    onPress: () => createBooking(3) 
                },
                { 
                    text: 'Book for 6 Months', 
                    onPress: () => createBooking(6) 
                }
            ]
        );
    };

    const createBooking = async (months) => {
        try {
            setBookingLoading(true);
            
            const checkInDate = new Date();
            const checkOutDate = new Date();
            checkOutDate.setMonth(checkOutDate.getMonth() + months);

            const bookingData = {
                accommodationId: accommodation._id,
                checkIn: checkInDate.toISOString().split('T')[0],
                checkOut: checkOutDate.toISOString().split('T')[0],
                guests: 1,
                totalAmount: accommodation.price * months,
                duration: months
            };

            const result = await studentApiService.createBooking(bookingData);
            
            Alert.alert(
                'Booking Created!',
                `Your booking has been ${result.isSimulated ? 'submitted' : 'confirmed'}.\n` +
                `${result.isSimulated ? 'Simulation' : 'Confirmation'} Code: ${result.confirmationCode || result.id}`,
                [
                    {
                        text: 'View Bookings',
                        onPress: () => navigation.navigate('MyBookings')
                    },
                    { text: 'OK' }
                ]
            );
        } catch (error) {
            console.error('Booking error:', error);
            Alert.alert('Error', 'Failed to create booking. Please try again.');
        } finally {
            setBookingLoading(false);
        }
    };

    const handleShare = async () => {
        try {
            await Share.share({
                message: `Check out this accommodation: ${accommodation.name}\nLocation: ${accommodation.location}\nPrice: PKR ${accommodation.price}/month`,
                title: accommodation.name
            });
        } catch (error) {
            console.error('Share error:', error);
        }
    };

    const handleReview = () => {
        navigation.navigate('WriteReview', {
            itemId: accommodation._id,
            itemType: 'accommodation',
            itemName: accommodation.name
        });
    };

    const renderImageGallery = () => (
        <View style={styles.imageGallery}>
            <ScrollView
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                onMomentumScrollEnd={(event) => {
                    const index = Math.round(event.nativeEvent.contentOffset.x / width);
                    setActiveImageIndex(index);
                }}
            >
                {(accommodation.images || []).map((image, index) => (
                    <Image
                        key={index}
                        source={{ uri: image }}
                        style={styles.accommodationImage}
                        resizeMode="cover"
                    />
                ))}
            </ScrollView>
            
            {accommodation.images && accommodation.images.length > 1 && (
                <View style={styles.imageIndicators}>
                    {accommodation.images.map((_, index) => (
                        <View
                            key={index}
                            style={[
                                styles.indicator,
                                { backgroundColor: index === activeImageIndex ? 'white' : 'rgba(255,255,255,0.5)' }
                            ]}
                        />
                    ))}
                </View>
            )}

            <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
                <Ionicons name="arrow-back" size={24} color="white" />
            </TouchableOpacity>

            <TouchableOpacity style={styles.shareButton} onPress={handleShare}>
                <Ionicons name="share-outline" size={24} color="white" />
            </TouchableOpacity>
        </View>
    );

    const renderAmenities = () => (
        <View style={styles.section}>
            <Text style={styles.sectionTitle}>Amenities</Text>
            <View style={styles.amenitiesGrid}>
                {(accommodation.amenities || ['WiFi', 'Parking', 'Security']).map((amenity, index) => (
                    <View key={index} style={styles.amenityItem}>
                        <Ionicons name="checkmark-circle" size={20} color="#28a745" />
                        <Text style={styles.amenityText}>{amenity}</Text>
                    </View>
                ))}
            </View>
        </View>
    );

    const renderReviews = () => (
        <View style={styles.section}>
            <View style={styles.reviewsHeader}>
                <Text style={styles.sectionTitle}>Reviews</Text>
                <TouchableOpacity style={styles.writeReviewButton} onPress={handleReview}>
                    <Ionicons name="add" size={16} color="#007bff" />
                    <Text style={styles.writeReviewText}>Write Review</Text>
                </TouchableOpacity>
            </View>
            
            {accommodation.reviews && accommodation.reviews.length > 0 ? (
                accommodation.reviews.slice(0, 3).map((review, index) => (
                    <View key={index} style={styles.reviewItem}>
                        <View style={styles.reviewHeader}>
                            <Text style={styles.reviewerName}>{review.userName || 'Anonymous'}</Text>
                            <View style={styles.reviewRating}>
                                {[...Array(5)].map((_, i) => (
                                    <Ionicons
                                        key={i}
                                        name="star"
                                        size={12}
                                        color={i < (review.rating || 5) ? "#ffc107" : "#e9ecef"}
                                    />
                                ))}
                            </View>
                        </View>
                        <Text style={styles.reviewText}>{review.comment || 'Great place!'}</Text>
                        <Text style={styles.reviewDate}>
                            {new Date(review.createdAt || Date.now()).toLocaleDateString()}
                        </Text>
                    </View>
                ))
            ) : (
                <Text style={styles.noReviews}>No reviews yet. Be the first to review!</Text>
            )}
        </View>
    );

    if (loading) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#007bff" />
                    <Text style={styles.loadingText}>Loading details...</Text>
                </View>
            </SafeAreaView>
        );
    }

    if (!accommodation) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.errorContainer}>
                    <Ionicons name="alert-circle" size={60} color="#dc3545" />
                    <Text style={styles.errorText}>Accommodation not found</Text>
                    <TouchableOpacity style={styles.retryButton} onPress={() => navigation.goBack()}>
                        <Text style={styles.retryButtonText}>Go Back</Text>
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
                {/* Image Gallery */}
                {renderImageGallery()}

                {/* Basic Info */}
                <View style={styles.basicInfo}>
                    <View style={styles.titleRow}>
                        <Text style={styles.accommodationName}>
                            {accommodation.name || accommodation.title}
                        </Text>
                        <View style={styles.ratingContainer}>
                            <Ionicons name="star" size={16} color="#ffc107" />
                            <Text style={styles.rating}>
                                {accommodation.rating || accommodation.averageRating || '4.0'}
                            </Text>
                        </View>
                    </View>

                    <View style={styles.locationRow}>
                        <Ionicons name="location" size={18} color="#6c757d" />
                        <Text style={styles.location}>
                            {accommodation.location || accommodation.address}
                        </Text>
                    </View>

                    <View style={styles.priceRow}>
                        <Text style={styles.price}>
                            PKR {accommodation.price?.toLocaleString() || 'N/A'}
                            <Text style={styles.priceUnit}> /month</Text>
                        </Text>
                        <View style={styles.availabilityBadge}>
                            <Text style={styles.availabilityText}>
                                {accommodation.availability !== false ? 'Available' : 'Not Available'}
                            </Text>
                        </View>
                    </View>
                </View>

                {/* Property Details */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Property Details</Text>
                    <View style={styles.detailsGrid}>
                        <View style={styles.detailItem}>
                            <Ionicons name="bed" size={24} color="#007bff" />
                            <Text style={styles.detailLabel}>Bedrooms</Text>
                            <Text style={styles.detailValue}>{accommodation.bedrooms || 1}</Text>
                        </View>
                        
                        <View style={styles.detailItem}>
                            <Ionicons name="water" size={24} color="#007bff" />
                            <Text style={styles.detailLabel}>Bathrooms</Text>
                            <Text style={styles.detailValue}>{accommodation.bathrooms || 1}</Text>
                        </View>
                        
                        <View style={styles.detailItem}>
                            <Ionicons name="resize" size={24} color="#007bff" />
                            <Text style={styles.detailLabel}>Area</Text>
                            <Text style={styles.detailValue}>{accommodation.area || 'N/A'} sq.ft</Text>
                        </View>
                        
                        <View style={styles.detailItem}>
                            <Ionicons name="home" size={24} color="#007bff" />
                            <Text style={styles.detailLabel}>Type</Text>
                            <Text style={styles.detailValue}>{accommodation.type || 'Apartment'}</Text>
                        </View>
                    </View>
                </View>

                {/* Description */}
                {accommodation.description && (
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Description</Text>
                        <Text style={styles.description}>{accommodation.description}</Text>
                    </View>
                )}

                {/* Amenities */}
                {renderAmenities()}

                {/* Reviews */}
                {renderReviews()}

                {/* Contact Info */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Contact Information</Text>
                    <View style={styles.contactInfo}>
                        <View style={styles.contactItem}>
                            <Ionicons name="person" size={20} color="#007bff" />
                            <Text style={styles.contactText}>
                                {accommodation.landlord?.name || 'Property Owner'}
                            </Text>
                        </View>
                        
                        {accommodation.landlord?.phone && (
                            <View style={styles.contactItem}>
                                <Ionicons name="call" size={20} color="#007bff" />
                                <Text style={styles.contactText}>
                                    {accommodation.landlord.phone}
                                </Text>
                            </View>
                        )}
                        
                        {accommodation.landlord?.email && (
                            <View style={styles.contactItem}>
                                <Ionicons name="mail" size={20} color="#007bff" />
                                <Text style={styles.contactText}>
                                    {accommodation.landlord.email}
                                </Text>
                            </View>
                        )}
                    </View>
                </View>

                <View style={styles.bottomSpacing} />
            </ScrollView>

            {/* Bottom Action Bar */}
            <View style={styles.bottomBar}>
                <TouchableOpacity
                    style={styles.chatButton}
                    onPress={() => navigation.navigate('Chat', {
                        recipientId: accommodation.landlord?._id,
                        recipientName: accommodation.landlord?.name || 'Property Owner'
                    })}
                >
                    <Ionicons name="chatbubble-outline" size={24} color="#007bff" />
                    <Text style={styles.chatButtonText}>Chat</Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                    style={[styles.bookButton, bookingLoading && styles.bookButtonDisabled]}
                    onPress={handleBooking}
                    disabled={bookingLoading || accommodation.availability === false}
                >
                    {bookingLoading ? (
                        <ActivityIndicator size="small" color="white" />
                    ) : (
                        <>
                            <Ionicons name="calendar" size={24} color="white" />
                            <Text style={styles.bookButtonText}>
                                {accommodation.availability === false ? 'Not Available' : 'Book Now'}
                            </Text>
                        </>
                    )}
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
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
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    errorText: {
        fontSize: 18,
        color: '#dc3545',
        marginTop: 10,
        textAlign: 'center',
    },
    retryButton: {
        marginTop: 20,
        backgroundColor: '#007bff',
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 20,
    },
    retryButtonText: {
        color: 'white',
        fontWeight: '500',
    },
    scrollView: {
        flex: 1,
    },
    imageGallery: {
        height: 300,
        position: 'relative',
    },
    accommodationImage: {
        width: width,
        height: 300,
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
        marginHorizontal: 4,
    },
    backButton: {
        position: 'absolute',
        top: 40,
        left: 20,
        backgroundColor: 'rgba(0,0,0,0.5)',
        borderRadius: 20,
        padding: 8,
    },
    shareButton: {
        position: 'absolute',
        top: 40,
        right: 20,
        backgroundColor: 'rgba(0,0,0,0.5)',
        borderRadius: 20,
        padding: 8,
    },
    basicInfo: {
        padding: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#e9ecef',
    },
    titleRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 10,
    },
    accommodationName: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#333',
        flex: 1,
        marginRight: 10,
    },
    ratingContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f8f9fa',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
    },
    rating: {
        marginLeft: 4,
        fontSize: 14,
        fontWeight: '500',
        color: '#333',
    },
    locationRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 15,
    },
    location: {
        marginLeft: 8,
        fontSize: 16,
        color: '#6c757d',
        flex: 1,
    },
    priceRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    price: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#0F5257',
    },
    priceUnit: {
        fontSize: 16,
        fontWeight: 'normal',
        color: '#6c757d',
    },
    availabilityBadge: {
        backgroundColor: '#d4edda',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 15,
    },
    availabilityText: {
        fontSize: 12,
        color: '#155724',
        fontWeight: '500',
    },
    section: {
        padding: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#e9ecef',
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 15,
    },
    detailsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
    },
    detailItem: {
        width: '50%',
        alignItems: 'center',
        marginBottom: 20,
    },
    detailLabel: {
        fontSize: 12,
        color: '#6c757d',
        marginTop: 8,
        marginBottom: 4,
    },
    detailValue: {
        fontSize: 16,
        fontWeight: '500',
        color: '#333',
    },
    description: {
        fontSize: 16,
        color: '#333',
        lineHeight: 24,
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
        marginLeft: 8,
        fontSize: 14,
        color: '#333',
    },
    reviewsHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 15,
    },
    writeReviewButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#e3f2fd',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 15,
    },
    writeReviewText: {
        marginLeft: 4,
        fontSize: 12,
        color: '#007bff',
        fontWeight: '500',
    },
    reviewItem: {
        marginBottom: 15,
        paddingBottom: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#f1f3f4',
    },
    reviewHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    reviewerName: {
        fontSize: 14,
        fontWeight: '500',
        color: '#333',
    },
    reviewRating: {
        flexDirection: 'row',
    },
    reviewText: {
        fontSize: 14,
        color: '#333',
        lineHeight: 20,
        marginBottom: 5,
    },
    reviewDate: {
        fontSize: 12,
        color: '#6c757d',
    },
    noReviews: {
        fontSize: 14,
        color: '#6c757d',
        fontStyle: 'italic',
        textAlign: 'center',
        paddingVertical: 20,
    },
    contactInfo: {
        backgroundColor: '#f8f9fa',
        borderRadius: 8,
        padding: 15,
    },
    contactItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10,
    },
    contactText: {
        marginLeft: 10,
        fontSize: 14,
        color: '#333',
    },
    bottomSpacing: {
        height: 100,
    },
    bottomBar: {
        flexDirection: 'row',
        backgroundColor: 'white',
        paddingHorizontal: 20,
        paddingVertical: 15,
        borderTopWidth: 1,
        borderTopColor: '#e9ecef',
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
    },
    chatButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#f8f9fa',
        borderWidth: 1,
        borderColor: '#007bff',
        borderRadius: 8,
        paddingVertical: 12,
        marginRight: 10,
    },
    chatButtonText: {
        marginLeft: 8,
        fontSize: 16,
        color: '#007bff',
        fontWeight: '500',
    },
    bookButton: {
        flex: 2,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#0F5257',
        borderRadius: 8,
        paddingVertical: 12,
    },
    bookButtonDisabled: {
        backgroundColor: '#6c757d',
    },
    bookButtonText: {
        marginLeft: 8,
        fontSize: 16,
        color: 'white',
        fontWeight: '500',
    },
});

export default AccommodationDetailsScreen;
