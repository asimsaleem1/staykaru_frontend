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

const AdminFoodProviderDetailScreen = () => {
    const navigation = useNavigation();
    const route = useRoute();
    const { providerId } = route.params;

    const [provider, setProvider] = useState(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [updating, setUpdating] = useState(false);

    useEffect(() => {
        fetchProviderDetails();
    }, [providerId]);

    const fetchProviderDetails = async () => {
        try {
            setLoading(true);
            // For now, simulate API call with mock data
            const mockProvider = {
                _id: providerId,
                businessName: 'Karachi Biryani House',
                description: 'Authentic Pakistani cuisine specializing in traditional biryani and local delicacies.',
                location: {
                    city: 'Karachi',
                    area: 'Gulshan-e-Iqbal',
                    address: 'Block 13-A, Main University Road',
                    coordinates: { lat: 24.9265, lng: 67.1342 }
                },
                contact: {
                    phone: '+92-300-1234567',
                    email: 'info@biryanihouse.com',
                    whatsapp: '+92-300-1234567'
                },
                owner: {
                    name: 'Muhammad Usman',
                    cnic: '42101-1234567-8',
                    email: 'usman@biryanihouse.com',
                    phone: '+92-301-7654321'
                },
                businessInfo: {
                    licenseNumber: 'KHI-FB-2024-001',
                    establishedYear: 2018,
                    cuisineType: 'Pakistani',
                    serviceType: ['Delivery', 'Takeaway'],
                    operatingHours: {
                        opening: '11:00 AM',
                        closing: '11:00 PM',
                        daysOpen: 'Monday to Sunday'
                    },
                    minimumOrder: 300,
                    deliveryCharges: 50,
                    deliveryRadius: '5 km'
                },
                images: [
                    'https://via.placeholder.com/300x200/FF6B35/FFFFFF?text=Restaurant',
                    'https://via.placeholder.com/300x200/F7931E/FFFFFF?text=Kitchen',
                    'https://via.placeholder.com/300x200/FFD23F/FFFFFF?text=Food'
                ],
                menuCategories: [
                    { name: 'Biryani', items: 8 },
                    { name: 'Karahi', items: 6 },
                    { name: 'BBQ', items: 12 },
                    { name: 'Beverages', items: 15 },
                    { name: 'Desserts', items: 5 }
                ],
                rating: 4.5,
                totalReviews: 156,
                totalOrders: 1234,
                status: 'active',
                verificationStatus: 'verified',
                documents: {
                    businessLicense: 'uploaded',
                    foodLicense: 'uploaded',
                    taxCertificate: 'uploaded'
                },
                stats: {
                    monthlyOrders: 234,
                    avgOrderValue: 850,
                    completionRate: 96,
                    avgDeliveryTime: 35
                },
                createdAt: '2024-01-10T09:15:00Z',
                updatedAt: '2024-01-20T14:30:00Z'
            };
            setProvider(mockProvider);
        } catch (error) {
            console.error('Error fetching provider details:', error);
            Alert.alert('Error', 'Failed to load food provider details');
        } finally {
            setLoading(false);
        }
    };

    const onRefresh = async () => {
        setRefreshing(true);
        await fetchProviderDetails();
        setRefreshing(false);
    };

    const updateStatus = async (newStatus, reason = '') => {
        try {
            setUpdating(true);
            await adminApiService.updateFoodProviderStatus(providerId, newStatus, reason);
            setProvider(prev => ({ ...prev, status: newStatus }));
            Alert.alert('Success', `Food provider ${newStatus} successfully`);
        } catch (error) {
            console.error('Error updating status:', error);
            Alert.alert('Error', 'Failed to update food provider status');
        } finally {
            setUpdating(false);
        }
    };

    const handleStatusChange = (newStatus) => {
        if (newStatus === 'rejected' || newStatus === 'suspended') {
            Alert.prompt(
                'Reason Required',
                `Please provide a reason for ${newStatus === 'rejected' ? 'rejecting' : 'suspending'} this food provider:`,
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
                `Are you sure you want to ${newStatus} this food provider?`,
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

    const getVerificationColor = (status) => {
        switch (status) {
            case 'verified': return '#4CAF50';
            case 'pending': return '#FF9800';
            case 'rejected': return '#F44336';
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

    if (!provider) {
        return (
            <View style={styles.errorContainer}>
                <MaterialIcons name="error-outline" size={64} color="#ccc" />
                <Text style={styles.errorText}>Food Provider not found</Text>
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
                <Text style={styles.headerTitle}>Food Provider Details</Text>
                <View style={styles.placeholder} />
            </View>

            {/* Status Badges */}
            <View style={styles.statusContainer}>
                <View style={[styles.statusBadge, { backgroundColor: getStatusColor(provider.status) }]}>
                    <Text style={styles.statusText}>{provider.status.toUpperCase()}</Text>
                </View>
                <View style={[styles.statusBadge, { backgroundColor: getVerificationColor(provider.verificationStatus) }]}>
                    <MaterialIcons name="verified" size={16} color="#fff" />
                    <Text style={styles.statusText}>{provider.verificationStatus.toUpperCase()}</Text>
                </View>
            </View>

            {/* Images */}
            {provider.images && provider.images.length > 0 && (
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.imageContainer}>
                    {provider.images.map((image, index) => (
                        <Image key={index} source={{ uri: image }} style={styles.image} />
                    ))}
                </ScrollView>
            )}

            {/* Basic Info */}
            <View style={styles.section}>
                <Text style={styles.title}>{provider.businessName}</Text>
                <Text style={styles.description}>{provider.description}</Text>
                
                <View style={styles.locationContainer}>
                    <MaterialIcons name="location-on" size={20} color="#666" />
                    <Text style={styles.location}>
                        {provider.location.address}, {provider.location.area}, {provider.location.city}
                    </Text>
                </View>

                <View style={styles.ratingContainer}>
                    <MaterialIcons name="star" size={20} color="#FFD700" />
                    <Text style={styles.rating}>{provider.rating} ({provider.totalReviews} reviews)</Text>
                </View>
            </View>

            {/* Contact Information */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Contact Information</Text>
                <View style={styles.contactItem}>
                    <MaterialIcons name="phone" size={20} color="#666" />
                    <Text style={styles.contactText}>{provider.contact.phone}</Text>
                </View>
                <View style={styles.contactItem}>
                    <MaterialIcons name="email" size={20} color="#666" />
                    <Text style={styles.contactText}>{provider.contact.email}</Text>
                </View>
                <View style={styles.contactItem}>
                    <MaterialIcons name="message" size={20} color="#666" />
                    <Text style={styles.contactText}>{provider.contact.whatsapp}</Text>
                </View>
            </View>

            {/* Owner Information */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Owner Information</Text>
                <View style={styles.ownerContainer}>
                    <Text style={styles.ownerName}>{provider.owner.name}</Text>
                    <Text style={styles.ownerDetail}>CNIC: {provider.owner.cnic}</Text>
                    <Text style={styles.ownerDetail}>Email: {provider.owner.email}</Text>
                    <Text style={styles.ownerDetail}>Phone: {provider.owner.phone}</Text>
                </View>
            </View>

            {/* Business Information */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Business Information</Text>
                <View style={styles.businessInfo}>
                    <View style={styles.infoRow}>
                        <Text style={styles.infoLabel}>License Number:</Text>
                        <Text style={styles.infoValue}>{provider.businessInfo.licenseNumber}</Text>
                    </View>
                    <View style={styles.infoRow}>
                        <Text style={styles.infoLabel}>Established:</Text>
                        <Text style={styles.infoValue}>{provider.businessInfo.establishedYear}</Text>
                    </View>
                    <View style={styles.infoRow}>
                        <Text style={styles.infoLabel}>Cuisine Type:</Text>
                        <Text style={styles.infoValue}>{provider.businessInfo.cuisineType}</Text>
                    </View>
                    <View style={styles.infoRow}>
                        <Text style={styles.infoLabel}>Service Type:</Text>
                        <Text style={styles.infoValue}>{provider.businessInfo.serviceType.join(', ')}</Text>
                    </View>
                    <View style={styles.infoRow}>
                        <Text style={styles.infoLabel}>Operating Hours:</Text>
                        <Text style={styles.infoValue}>
                            {provider.businessInfo.operatingHours.opening} - {provider.businessInfo.operatingHours.closing}
                        </Text>
                    </View>
                    <View style={styles.infoRow}>
                        <Text style={styles.infoLabel}>Days Open:</Text>
                        <Text style={styles.infoValue}>{provider.businessInfo.operatingHours.daysOpen}</Text>
                    </View>
                    <View style={styles.infoRow}>
                        <Text style={styles.infoLabel}>Minimum Order:</Text>
                        <Text style={styles.infoValue}>Rs. {provider.businessInfo.minimumOrder}</Text>
                    </View>
                    <View style={styles.infoRow}>
                        <Text style={styles.infoLabel}>Delivery Charges:</Text>
                        <Text style={styles.infoValue}>Rs. {provider.businessInfo.deliveryCharges}</Text>
                    </View>
                    <View style={styles.infoRow}>
                        <Text style={styles.infoLabel}>Delivery Radius:</Text>
                        <Text style={styles.infoValue}>{provider.businessInfo.deliveryRadius}</Text>
                    </View>
                </View>
            </View>

            {/* Menu Categories */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Menu Categories</Text>
                <View style={styles.menuContainer}>
                    {provider.menuCategories.map((category, index) => (
                        <View key={index} style={styles.categoryItem}>
                            <Text style={styles.categoryName}>{category.name}</Text>
                            <Text style={styles.categoryCount}>{category.items} items</Text>
                        </View>
                    ))}
                </View>
            </View>

            {/* Statistics */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Performance Statistics</Text>
                <View style={styles.statsContainer}>
                    <View style={styles.statItem}>
                        <Text style={styles.statValue}>{provider.stats.monthlyOrders}</Text>
                        <Text style={styles.statLabel}>Monthly Orders</Text>
                    </View>
                    <View style={styles.statItem}>
                        <Text style={styles.statValue}>Rs. {provider.stats.avgOrderValue}</Text>
                        <Text style={styles.statLabel}>Avg Order Value</Text>
                    </View>
                    <View style={styles.statItem}>
                        <Text style={styles.statValue}>{provider.stats.completionRate}%</Text>
                        <Text style={styles.statLabel}>Completion Rate</Text>
                    </View>
                    <View style={styles.statItem}>
                        <Text style={styles.statValue}>{provider.stats.avgDeliveryTime} min</Text>
                        <Text style={styles.statLabel}>Avg Delivery</Text>
                    </View>
                </View>
            </View>

            {/* Documents */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Documents</Text>
                <View style={styles.documentsContainer}>
                    <View style={styles.documentItem}>
                        <MaterialIcons name="description" size={20} color="#666" />
                        <Text style={styles.documentName}>Business License</Text>
                        <View style={[styles.documentStatus, { backgroundColor: '#4CAF50' }]}>
                            <Text style={styles.documentStatusText}>Uploaded</Text>
                        </View>
                    </View>
                    <View style={styles.documentItem}>
                        <MaterialIcons name="description" size={20} color="#666" />
                        <Text style={styles.documentName}>Food License</Text>
                        <View style={[styles.documentStatus, { backgroundColor: '#4CAF50' }]}>
                            <Text style={styles.documentStatusText}>Uploaded</Text>
                        </View>
                    </View>
                    <View style={styles.documentItem}>
                        <MaterialIcons name="description" size={20} color="#666" />
                        <Text style={styles.documentName}>Tax Certificate</Text>
                        <View style={[styles.documentStatus, { backgroundColor: '#4CAF50' }]}>
                            <Text style={styles.documentStatusText}>Uploaded</Text>
                        </View>
                    </View>
                </View>
            </View>

            {/* Dates */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Important Dates</Text>
                <View style={styles.dateContainer}>
                    <Text style={styles.dateItem}>Registered: {formatDate(provider.createdAt)}</Text>
                    <Text style={styles.dateItem}>Last Updated: {formatDate(provider.updatedAt)}</Text>
                </View>
            </View>

            {/* Action Buttons */}
            <View style={styles.actionContainer}>
                {provider.status === 'pending' && (
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
                
                {provider.status === 'active' && (
                    <TouchableOpacity 
                        style={[styles.actionButton, styles.suspendButton]}
                        onPress={() => handleStatusChange('suspended')}
                        disabled={updating}
                    >
                        <MaterialIcons name="pause" size={20} color="#fff" />
                        <Text style={styles.actionButtonText}>Suspend</Text>
                    </TouchableOpacity>
                )}
                
                {provider.status === 'suspended' && (
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
        flexDirection: 'row',
        padding: 16,
        justifyContent: 'center',
        gap: 12,
    },
    statusBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 12,
        gap: 4,
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
        marginBottom: 8,
    },
    location: {
        fontSize: 14,
        color: '#666',
        marginLeft: 4,
        flex: 1,
    },
    ratingContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    rating: {
        fontSize: 14,
        color: '#666',
        marginLeft: 4,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 12,
    },
    contactItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    contactText: {
        fontSize: 14,
        color: '#666',
        marginLeft: 8,
    },
    ownerContainer: {
        borderWidth: 1,
        borderColor: '#e0e0e0',
        borderRadius: 8,
        padding: 12,
    },
    ownerName: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 4,
    },
    ownerDetail: {
        fontSize: 14,
        color: '#666',
        marginBottom: 2,
    },
    businessInfo: {},
    infoRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 8,
    },
    infoLabel: {
        fontSize: 14,
        color: '#666',
        flex: 1,
    },
    infoValue: {
        fontSize: 14,
        color: '#333',
        fontWeight: '500',
        flex: 1,
        textAlign: 'right',
    },
    menuContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    categoryItem: {
        backgroundColor: '#f0f0f0',
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 16,
        alignItems: 'center',
    },
    categoryName: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#333',
    },
    categoryCount: {
        fontSize: 12,
        color: '#666',
    },
    statsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
    },
    statItem: {
        alignItems: 'center',
    },
    statValue: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#1976d2',
    },
    statLabel: {
        fontSize: 11,
        color: '#666',
        marginTop: 4,
        textAlign: 'center',
    },
    documentsContainer: {},
    documentItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    documentName: {
        fontSize: 14,
        color: '#333',
        marginLeft: 8,
        flex: 1,
    },
    documentStatus: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 8,
    },
    documentStatusText: {
        fontSize: 12,
        color: '#fff',
        fontWeight: 'bold',
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

export default AdminFoodProviderDetailScreen;
