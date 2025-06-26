import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Image,
    Alert,
    RefreshControl,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { MaterialIcons } from '@expo/vector-icons';
import LoadingSpinner from '../../components/LoadingSpinner';
import { adminApiService } from '../../services/adminApiService';

const AdminAccommodationDetailScreen = () => {
    const navigation = useNavigation();
    const route = useRoute();
    const { accommodationId } = route.params;

    const [accommodation, setAccommodation] = useState(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [updating, setUpdating] = useState(false);

    useEffect(() => {
        fetchAccommodationDetails();
    }, [accommodationId]);

    const fetchAccommodationDetails = async () => {
        try {
            setLoading(true);
            // For now, simulate API call with mock data
            const mockAccommodation = {
                _id: accommodationId,
                title: 'Cozy Student Apartment in DHA',
                description: 'A beautiful 2-bedroom apartment perfect for students, located in a safe and accessible area.',
                location: {
                    city: 'Karachi',
                    area: 'DHA Phase 5',
                    address: 'Street 15, Lane 3, DHA Phase 5',
                    coordinates: { lat: 24.8607, lng: 67.0011 }
                },
                landlord: {
                    _id: 'landlord1',
                    name: 'Ahmed Ali',
                    email: 'ahmed@email.com',
                    phone: '+92-300-1234567',
                    rating: 4.3,
                    totalProperties: 5
                },
                pricing: {
                    monthly: 25000,
                    security: 50000,
                    utilities: 'included'
                },
                features: ['WiFi', 'Parking', 'Furnished', 'AC', 'Kitchen'],
                specifications: {
                    bedrooms: 2,
                    bathrooms: 1,
                    area: '800 sq ft',
                    furnished: true
                },
                images: [
                    'https://via.placeholder.com/300x200/4A90E2/FFFFFF?text=Bedroom',
                    'https://via.placeholder.com/300x200/7ED321/FFFFFF?text=Kitchen',
                    'https://via.placeholder.com/300x200/F5A623/FFFFFF?text=Living+Room'
                ],
                status: 'active',
                views: 45,
                inquiries: 12,
                bookings: 3,
                rating: 4.2,
                reviews: 8,
                createdAt: '2024-01-15T10:30:00Z',
                updatedAt: '2024-01-20T15:45:00Z'
            };
            setAccommodation(mockAccommodation);
        } catch (error) {
            console.error('Error fetching accommodation details:', error);
            Alert.alert('Error', 'Failed to load accommodation details');
        } finally {
            setLoading(false);
        }
    };

    const onRefresh = async () => {
        setRefreshing(true);
        await fetchAccommodationDetails();
        setRefreshing(false);
    };

    const updateStatus = async (newStatus, reason = '') => {
        try {
            setUpdating(true);
            await adminApiService.updateAccommodationStatus(accommodationId, newStatus, reason);
            setAccommodation(prev => ({ ...prev, status: newStatus }));
            Alert.alert('Success', `Accommodation ${newStatus} successfully`);
        } catch (error) {
            console.error('Error updating status:', error);
            Alert.alert('Error', 'Failed to update accommodation status');
        } finally {
            setUpdating(false);
        }
    };

    const handleStatusChange = (newStatus) => {
        if (newStatus === 'rejected' || newStatus === 'suspended') {
            Alert.prompt(
                'Reason Required',
                `Please provide a reason for ${newStatus === 'rejected' ? 'rejecting' : 'suspending'} this accommodation:`,
                [
                    { text: 'Cancel', style: 'cancel' },
                    { 
                        text: 'Confirm', 
                        onPress: (reason) => {
                            if (reason && reason.trim()) {
                                updateStatus(newStatus, reason.trim());
                            } else {
                                Alert.alert('Error', 'Reason is required');
                            }
                        }
                    }
                ],
                'plain-text'
            );
        } else {
            Alert.alert(
                'Confirm Action',
                `Are you sure you want to ${newStatus} this accommodation?`,
                [
                    { text: 'Cancel', style: 'cancel' },
                    { text: 'Confirm', onPress: () => updateStatus(newStatus) }
                ]
            );
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'active': return '#4CAF50';
            case 'pending': return '#FF9800';
            case 'rejected': return '#F44336';
            case 'suspended': return '#9E9E9E';
            default: return '#757575';
        }
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    if (loading) {
        return <LoadingSpinner />;
    }

    if (!accommodation) {
        return (
            <View style={styles.errorContainer}>
                <MaterialIcons name="error-outline" size={64} color="#ccc" />
                <Text style={styles.errorText}>Accommodation not found</Text>
                <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
                    <Text style={styles.backButtonText}>Go Back</Text>
                </TouchableOpacity>
            </View>
        );
    }

    return (
        <ScrollView 
            style={styles.container}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        >
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <MaterialIcons name="arrow-back" size={24} color="#333" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Accommodation Details</Text>
                <View style={styles.placeholder} />
            </View>

            {/* Status Badge */}
            <View style={styles.statusContainer}>
                <View style={[styles.statusBadge, { backgroundColor: getStatusColor(accommodation.status) }]}>
                    <Text style={styles.statusText}>{accommodation.status.toUpperCase()}</Text>
                </View>
            </View>

            {/* Images */}
            {accommodation.images && accommodation.images.length > 0 && (
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.imageContainer}>
                    {accommodation.images.map((image, index) => (
                        <Image key={index} source={{ uri: image }} style={styles.image} />
                    ))}
                </ScrollView>
            )}

            {/* Basic Info */}
            <View style={styles.section}>
                <Text style={styles.title}>{accommodation.title}</Text>
                <Text style={styles.description}>{accommodation.description}</Text>
                
                <View style={styles.locationContainer}>
                    <MaterialIcons name="location-on" size={20} color="#666" />
                    <Text style={styles.location}>
                        {accommodation.location.address}, {accommodation.location.area}, {accommodation.location.city}
                    </Text>
                </View>
            </View>

            {/* Pricing */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Pricing</Text>
                <View style={styles.pricingContainer}>
                    <View style={styles.priceItem}>
                        <Text style={styles.priceLabel}>Monthly Rent</Text>
                        <Text style={styles.priceValue}>Rs. {accommodation.pricing.monthly.toLocaleString()}</Text>
                    </View>
                    <View style={styles.priceItem}>
                        <Text style={styles.priceLabel}>Security Deposit</Text>
                        <Text style={styles.priceValue}>Rs. {accommodation.pricing.security.toLocaleString()}</Text>
                    </View>
                    <View style={styles.priceItem}>
                        <Text style={styles.priceLabel}>Utilities</Text>
                        <Text style={styles.priceValue}>{accommodation.pricing.utilities}</Text>
                    </View>
                </View>
            </View>

            {/* Specifications */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Specifications</Text>
                <View style={styles.specContainer}>
                    <View style={styles.specItem}>
                        <MaterialIcons name="bed" size={20} color="#666" />
                        <Text style={styles.specText}>{accommodation.specifications.bedrooms} Bedrooms</Text>
                    </View>
                    <View style={styles.specItem}>
                        <MaterialIcons name="bathroom" size={20} color="#666" />
                        <Text style={styles.specText}>{accommodation.specifications.bathrooms} Bathroom</Text>
                    </View>
                    <View style={styles.specItem}>
                        <MaterialIcons name="square-foot" size={20} color="#666" />
                        <Text style={styles.specText}>{accommodation.specifications.area}</Text>
                    </View>
                    <View style={styles.specItem}>
                        <MaterialIcons name="chair" size={20} color="#666" />
                        <Text style={styles.specText}>{accommodation.specifications.furnished ? 'Furnished' : 'Unfurnished'}</Text>
                    </View>
                </View>
            </View>

            {/* Features */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Features</Text>
                <View style={styles.featuresContainer}>
                    {accommodation.features.map((feature, index) => (
                        <View key={index} style={styles.featureChip}>
                            <Text style={styles.featureText}>{feature}</Text>
                        </View>
                    ))}
                </View>
            </View>

            {/* Landlord Info */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Landlord Information</Text>
                <View style={styles.landlordContainer}>
                    <View style={styles.landlordInfo}>
                        <Text style={styles.landlordName}>{accommodation.landlord.name}</Text>
                        <Text style={styles.landlordDetail}>{accommodation.landlord.email}</Text>
                        <Text style={styles.landlordDetail}>{accommodation.landlord.phone}</Text>
                        <View style={styles.landlordStats}>
                            <Text style={styles.landlordStat}>Rating: {accommodation.landlord.rating}/5</Text>
                            <Text style={styles.landlordStat}>Properties: {accommodation.landlord.totalProperties}</Text>
                        </View>
                    </View>
                </View>
            </View>

            {/* Statistics */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Statistics</Text>
                <View style={styles.statsContainer}>
                    <View style={styles.statItem}>
                        <Text style={styles.statValue}>{accommodation.views}</Text>
                        <Text style={styles.statLabel}>Views</Text>
                    </View>
                    <View style={styles.statItem}>
                        <Text style={styles.statValue}>{accommodation.inquiries}</Text>
                        <Text style={styles.statLabel}>Inquiries</Text>
                    </View>
                    <View style={styles.statItem}>
                        <Text style={styles.statValue}>{accommodation.bookings}</Text>
                        <Text style={styles.statLabel}>Bookings</Text>
                    </View>
                    <View style={styles.statItem}>
                        <Text style={styles.statValue}>{accommodation.rating}</Text>
                        <Text style={styles.statLabel}>Rating</Text>
                    </View>
                </View>
            </View>

            {/* Dates */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Dates</Text>
                <View style={styles.dateContainer}>
                    <Text style={styles.dateItem}>Created: {formatDate(accommodation.createdAt)}</Text>
                    <Text style={styles.dateItem}>Updated: {formatDate(accommodation.updatedAt)}</Text>
                </View>
            </View>

            {/* Action Buttons */}
            <View style={styles.actionContainer}>
                {accommodation.status === 'pending' && (
                    <>
                        <TouchableOpacity 
                            style={[styles.actionButton, styles.approveButton]}
                            onPress={() => handleStatusChange('active')}
                            disabled={updating}
                        >
                            <MaterialIcons name="check" size={20} color="#fff" />
                            <Text style={styles.actionButtonText}>Approve</Text>
                        </TouchableOpacity>
                        <TouchableOpacity 
                            style={[styles.actionButton, styles.rejectButton]}
                            onPress={() => handleStatusChange('rejected')}
                            disabled={updating}
                        >
                            <MaterialIcons name="close" size={20} color="#fff" />
                            <Text style={styles.actionButtonText}>Reject</Text>
                        </TouchableOpacity>
                    </>
                )}
                
                {accommodation.status === 'active' && (
                    <TouchableOpacity 
                        style={[styles.actionButton, styles.suspendButton]}
                        onPress={() => handleStatusChange('suspended')}
                        disabled={updating}
                    >
                        <MaterialIcons name="pause" size={20} color="#fff" />
                        <Text style={styles.actionButtonText}>Suspend</Text>
                    </TouchableOpacity>
                )}
                
                {accommodation.status === 'suspended' && (
                    <TouchableOpacity 
                        style={[styles.actionButton, styles.approveButton]}
                        onPress={() => handleStatusChange('active')}
                        disabled={updating}
                    >
                        <MaterialIcons name="play-arrow" size={20} color="#fff" />
                        <Text style={styles.actionButtonText}>Reactivate</Text>
                    </TouchableOpacity>
                )}
            </View>

            {updating && <LoadingSpinner />}
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 16,
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#e0e0e0',
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
    },
    placeholder: {
        width: 24,
    },
    statusContainer: {
        padding: 16,
        alignItems: 'center',
    },
    statusBadge: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 12,
    },
    statusText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 12,
    },
    imageContainer: {
        marginBottom: 16,
    },
    image: {
        width: 300,
        height: 200,
        marginLeft: 16,
        borderRadius: 8,
    },
    section: {
        backgroundColor: '#fff',
        marginBottom: 12,
        padding: 16,
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 8,
    },
    description: {
        fontSize: 14,
        color: '#666',
        lineHeight: 20,
        marginBottom: 12,
    },
    locationContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    location: {
        fontSize: 14,
        color: '#666',
        marginLeft: 4,
        flex: 1,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 12,
    },
    pricingContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    priceItem: {
        alignItems: 'center',
    },
    priceLabel: {
        fontSize: 12,
        color: '#666',
        marginBottom: 4,
    },
    priceValue: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#333',
    },
    specContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
    },
    specItem: {
        flexDirection: 'row',
        alignItems: 'center',
        width: '50%',
        marginBottom: 8,
    },
    specText: {
        fontSize: 14,
        color: '#666',
        marginLeft: 4,
    },
    featuresContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
    },
    featureChip: {
        backgroundColor: '#e3f2fd',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 16,
        marginRight: 8,
        marginBottom: 8,
    },
    featureText: {
        fontSize: 12,
        color: '#1976d2',
    },
    landlordContainer: {
        borderWidth: 1,
        borderColor: '#e0e0e0',
        borderRadius: 8,
        padding: 12,
    },
    landlordInfo: {},
    landlordName: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 4,
    },
    landlordDetail: {
        fontSize: 14,
        color: '#666',
        marginBottom: 2,
    },
    landlordStats: {
        flexDirection: 'row',
        marginTop: 8,
    },
    landlordStat: {
        fontSize: 12,
        color: '#666',
        marginRight: 16,
    },
    statsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
    },
    statItem: {
        alignItems: 'center',
    },
    statValue: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#1976d2',
    },
    statLabel: {
        fontSize: 12,
        color: '#666',
        marginTop: 4,
    },
    dateContainer: {},
    dateItem: {
        fontSize: 14,
        color: '#666',
        marginBottom: 4,
    },
    actionContainer: {
        flexDirection: 'row',
        padding: 16,
        gap: 12,
    },
    actionButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 12,
        borderRadius: 8,
        gap: 8,
    },
    approveButton: {
        backgroundColor: '#4CAF50',
    },
    rejectButton: {
        backgroundColor: '#F44336',
    },
    suspendButton: {
        backgroundColor: '#FF9800',
    },
    actionButtonText: {
        color: '#fff',
        fontWeight: 'bold',
    },
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 32,
    },
    errorText: {
        fontSize: 18,
        color: '#666',
        marginTop: 16,
        marginBottom: 24,
    },
    backButton: {
        backgroundColor: '#1976d2',
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 8,
    },
    backButtonText: {
        color: '#fff',
        fontWeight: 'bold',
    },
});

export default AdminAccommodationDetailScreen;
