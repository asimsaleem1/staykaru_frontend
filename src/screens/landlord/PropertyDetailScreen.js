import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Image,
    Alert,
    ActivityIndicator,
    Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { fetchFromBackend } from '../../utils/networkUtils';
import authService from '../../services/authService';

const { width } = Dimensions.get('window');

const PropertyDetailScreen = ({ navigation, route }) => {
    const { propertyId } = route.params;
    const [property, setProperty] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadPropertyDetails();
    }, [propertyId]);

    const loadPropertyDetails = async () => {
        try {
            setLoading(true);
            const user = await authService.getCurrentUser();
            const response = await fetchFromBackend(`/landlord/properties/${propertyId}?landlordId=${user.id}`);
            
            if (response.success) {
                setProperty(response.data);
            } else {
                throw new Error(response.message || 'Failed to load property details');
            }
        } catch (error) {
            console.error('Error loading property details:', error);
            Alert.alert('Error', 'Failed to load property details');
            navigation.goBack();
        } finally {
            setLoading(false);
        }
    };

    const formatCurrency = (amount) => {
        return `₨${amount?.toLocaleString('en-PK') || '0'}`;
    };

    const handleEdit = () => {
        navigation.navigate('PropertyEdit', { propertyId });
    };

    const handleViewBookings = () => {
        navigation.navigate('BookingManagement', { propertyId });
    };

    const handleViewCalendar = () => {
        navigation.navigate('PropertyCalendar', { propertyId });
    };

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#3498db" />
                <Text style={styles.loadingText}>Loading property details...</Text>
            </View>
        );
    }

    if (!property) {
        return (
            <View style={styles.errorContainer}>
                <Text style={styles.errorText}>Property not found</Text>
            </View>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity 
                    style={styles.backButton}
                    onPress={() => navigation.goBack()}
                >
                    <Ionicons name="arrow-back" size={24} color="#fff" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Property Details</Text>
                <TouchableOpacity 
                    style={styles.editButton}
                    onPress={handleEdit}
                >
                    <Ionicons name="create-outline" size={24} color="#fff" />
                </TouchableOpacity>
            </View>

            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                {/* Property Images */}
                {property.images && property.images.length > 0 && (
                    <View style={styles.imageContainer}>
                        <Image 
                            source={{ uri: property.images[0] }} 
                            style={styles.mainImage} 
                            resizeMode="cover"
                        />
                        {property.images.length > 1 && (
                            <View style={styles.imageCount}>
                                <Ionicons name="images" size={16} color="#fff" />
                                <Text style={styles.imageCountText}>{property.images.length}</Text>
                            </View>
                        )}
                    </View>
                )}

                {/* Property Info */}
                <View style={styles.card}>
                    <Text style={styles.propertyTitle}>{property.title}</Text>
                    <Text style={styles.propertyAddress}>{property.address}</Text>
                    
                    <View style={styles.priceRow}>
                        <Text style={styles.price}>{formatCurrency(property.price)}</Text>
                        <Text style={styles.priceUnit}>/{property.priceUnit || 'month'}</Text>
                    </View>

                    <View style={styles.statusContainer}>
                        <View style={[styles.statusBadge, 
                            property.status === 'active' ? styles.activeBadge : styles.inactiveBadge
                        ]}>
                            <Text style={styles.statusText}>{property.status?.toUpperCase()}</Text>
                        </View>
                    </View>
                </View>

                {/* Property Details */}
                <View style={styles.card}>
                    <Text style={styles.cardTitle}>Property Details</Text>
                    
                    <View style={styles.detailRow}>
                        <Text style={styles.detailLabel}>Type:</Text>
                        <Text style={styles.detailValue}>{property.type || 'N/A'}</Text>
                    </View>

                    <View style={styles.detailRow}>
                        <Text style={styles.detailLabel}>Bedrooms:</Text>
                        <Text style={styles.detailValue}>{property.bedrooms || 'N/A'}</Text>
                    </View>

                    <View style={styles.detailRow}>
                        <Text style={styles.detailLabel}>Bathrooms:</Text>
                        <Text style={styles.detailValue}>{property.bathrooms || 'N/A'}</Text>
                    </View>

                    <View style={styles.detailRow}>
                        <Text style={styles.detailLabel}>Area:</Text>
                        <Text style={styles.detailValue}>{property.area || 'N/A'} sq ft</Text>
                    </View>

                    <View style={styles.detailRow}>
                        <Text style={styles.detailLabel}>Capacity:</Text>
                        <Text style={styles.detailValue}>{property.capacity || 'N/A'} people</Text>
                    </View>
                </View>

                {/* Description */}
                {property.description && (
                    <View style={styles.card}>
                        <Text style={styles.cardTitle}>Description</Text>
                        <Text style={styles.description}>{property.description}</Text>
                    </View>
                )}

                {/* Amenities */}
                {property.amenities && property.amenities.length > 0 && (
                    <View style={styles.card}>
                        <Text style={styles.cardTitle}>Amenities</Text>
                        <View style={styles.amenitiesContainer}>
                            {property.amenities.map((amenity, index) => (
                                <View key={index} style={styles.amenityItem}>
                                    <Ionicons name="checkmark-circle" size={16} color="#2ecc71" />
                                    <Text style={styles.amenityText}>{amenity}</Text>
                                </View>
                            ))}
                        </View>
                    </View>
                )}

                {/* Statistics */}
                <View style={styles.card}>
                    <Text style={styles.cardTitle}>Statistics</Text>
                    
                    <View style={styles.statsGrid}>
                        <View style={styles.statItem}>
                            <Text style={styles.statValue}>{property.totalBookings || 0}</Text>
                            <Text style={styles.statLabel}>Total Bookings</Text>
                        </View>
                        
                        <View style={styles.statItem}>
                            <Text style={styles.statValue}>{property.currentOccupancy || 0}%</Text>
                            <Text style={styles.statLabel}>Occupancy Rate</Text>
                        </View>
                        
                        <View style={styles.statItem}>
                            <Text style={styles.statValue}>{property.rating || 0}</Text>
                            <Text style={styles.statLabel}>Rating</Text>
                        </View>
                        
                        <View style={styles.statItem}>
                            <Text style={styles.statValue}>{property.views || 0}</Text>
                            <Text style={styles.statLabel}>Views</Text>
                        </View>
                    </View>
                </View>

                {/* Action Buttons */}
                <View style={styles.actionButtons}>
                    <TouchableOpacity style={styles.actionButton} onPress={handleViewBookings}>
                        <Ionicons name="calendar" size={20} color="#fff" />
                        <Text style={styles.actionButtonText}>View Bookings</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.actionButton} onPress={handleViewCalendar}>
                        <Ionicons name="calendar-outline" size={20} color="#fff" />
                        <Text style={styles.actionButtonText}>Calendar</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
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
        backgroundColor: '#f8f9fa',
    },
    loadingText: {
        marginTop: 10,
        fontSize: 16,
        color: '#7f8c8d',
    },
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f8f9fa',
    },
    errorText: {
        fontSize: 18,
        color: '#e74c3c',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingVertical: 15,
        backgroundColor: '#3498db',
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
    },
    backButton: {
        padding: 8,
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#fff',
    },
    editButton: {
        padding: 8,
    },
    content: {
        flex: 1,
    },
    imageContainer: {
        position: 'relative',
    },
    mainImage: {
        width: width,
        height: 250,
    },
    imageCount: {
        position: 'absolute',
        top: 15,
        right: 15,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.7)',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 15,
    },
    imageCountText: {
        color: '#fff',
        fontSize: 12,
        marginLeft: 4,
    },
    card: {
        backgroundColor: '#fff',
        padding: 20,
        marginVertical: 8,
        marginHorizontal: 16,
        borderRadius: 12,
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 3.84,
    },
    propertyTitle: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#2c3e50',
        marginBottom: 8,
    },
    propertyAddress: {
        fontSize: 16,
        color: '#7f8c8d',
        marginBottom: 12,
    },
    priceRow: {
        flexDirection: 'row',
        alignItems: 'baseline',
        marginBottom: 16,
    },
    price: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#27ae60',
    },
    priceUnit: {
        fontSize: 16,
        color: '#7f8c8d',
        marginLeft: 4,
    },
    statusContainer: {
        alignItems: 'flex-start',
    },
    statusBadge: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
    },
    activeBadge: {
        backgroundColor: '#2ecc71',
    },
    inactiveBadge: {
        backgroundColor: '#e74c3c',
    },
    statusText: {
        color: '#fff',
        fontSize: 12,
        fontWeight: 'bold',
    },
    cardTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#2c3e50',
        marginBottom: 16,
    },
    detailRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 8,
        borderBottomWidth: 1,
        borderBottomColor: '#ecf0f1',
    },
    detailLabel: {
        fontSize: 14,
        color: '#7f8c8d',
    },
    detailValue: {
        fontSize: 14,
        color: '#2c3e50',
        fontWeight: '500',
    },
    description: {
        fontSize: 14,
        color: '#2c3e50',
        lineHeight: 20,
    },
    amenitiesContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
    },
    amenityItem: {
        flexDirection: 'row',
        alignItems: 'center',
        width: '50%',
        marginBottom: 8,
    },
    amenityText: {
        fontSize: 14,
        color: '#2c3e50',
        marginLeft: 8,
    },
    statsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
    },
    statItem: {
        width: '48%',
        alignItems: 'center',
        backgroundColor: '#f8f9fa',
        padding: 16,
        borderRadius: 8,
        marginBottom: 8,
    },
    statValue: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#3498db',
    },
    statLabel: {
        fontSize: 12,
        color: '#7f8c8d',
        marginTop: 4,
    },
    actionButtons: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 20,
    },
    actionButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#3498db',
        paddingVertical: 15,
        borderRadius: 8,
        marginHorizontal: 5,
    },
    actionButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
        marginLeft: 8,
    },
});

export default PropertyDetailScreen;
