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
    Modal
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { Ionicons } from '@expo/vector-icons';

const { width: screenWidth } = Dimensions.get('window');

const CompareAccommodationsScreen = ({ navigation, route }) => {
    const [accommodations, setAccommodations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedFeatures, setSelectedFeatures] = useState([]);
    const [showImageModal, setShowImageModal] = useState(false);
    const [selectedImage, setSelectedImage] = useState(null);

    // Mock data for comparison
    const mockAccommodations = [
        {
            id: 1,
            name: 'University Heights',
            type: 'Shared Apartment',
            rent: 800,
            images: [
                'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=400',
                'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=400'
            ],
            rating: 4.5,
            reviews: 124,
            distance: 0.5,
            availableFrom: '2024-02-01',
            deposit: 1000,
            utilities: 150,
            features: {
                bedrooms: 2,
                bathrooms: 1,
                furnished: true,
                wifi: true,
                parking: true,
                gym: false,
                laundry: true,
                kitchen: true,
                ac: true,
                heating: true,
                security: true,
                elevator: false,
                balcony: true,
                study: true,
                common: true
            },
            landlord: {
                name: 'Sarah Johnson',
                rating: 4.7,
                responseTime: '2 hours'
            },
            amenities: ['Free WiFi', 'Furnished', 'Parking', 'Laundry', 'Kitchen', 'Study Room'],
            policies: {
                pets: false,
                smoking: false,
                visitors: true,
                lease: '12 months'
            }
        },
        {
            id: 2,
            name: 'Campus View Residence',
            type: 'Private Room',
            rent: 650,
            images: [
                'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=400',
                'https://images.unsplash.com/photo-1484154218962-a197022b5858?w=400'
            ],
            rating: 4.2,
            reviews: 89,
            distance: 0.8,
            availableFrom: '2024-01-15',
            deposit: 800,
            utilities: 100,
            features: {
                bedrooms: 1,
                bathrooms: 1,
                furnished: true,
                wifi: true,
                parking: false,
                gym: true,
                laundry: true,
                kitchen: true,
                ac: false,
                heating: true,
                security: true,
                elevator: true,
                balcony: false,
                study: false,
                common: true
            },
            landlord: {
                name: 'Mike Chen',
                rating: 4.3,
                responseTime: '4 hours'
            },
            amenities: ['Free WiFi', 'Furnished', 'Gym', 'Laundry', 'Kitchen', 'Elevator'],
            policies: {
                pets: true,
                smoking: false,
                visitors: true,
                lease: '6-12 months'
            }
        },
        {
            id: 3,
            name: 'Student Living Complex',
            type: 'Studio',
            rent: 900,
            images: [
                'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=400',
                'https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=400'
            ],
            rating: 4.8,
            reviews: 156,
            distance: 1.2,
            availableFrom: '2024-03-01',
            deposit: 1200,
            utilities: 120,
            features: {
                bedrooms: 1,
                bathrooms: 1,
                furnished: true,
                wifi: true,
                parking: true,
                gym: true,
                laundry: true,
                kitchen: true,
                ac: true,
                heating: true,
                security: true,
                elevator: true,
                balcony: true,
                study: true,
                common: true
            },
            landlord: {
                name: 'Emma Davis',
                rating: 4.9,
                responseTime: '1 hour'
            },
            amenities: ['All Inclusive', 'Gym', 'Study Areas', 'Rooftop Terrace', 'Concierge', '24/7 Security'],
            policies: {
                pets: false,
                smoking: false,
                visitors: true,
                lease: '12 months'
            }
        }
    ];

    useEffect(() => {
        loadAccommodations();
    }, []);

    const loadAccommodations = async () => {
        try {
            setLoading(true);
            // Get accommodations from route params or use mock data
            const compareIds = route.params?.accommodationIds || [1, 2, 3];
            const filtered = mockAccommodations.filter(acc => compareIds.includes(acc.id));
            setAccommodations(filtered);
        } catch (error) {
            console.error('Error loading accommodations:', error);
            Alert.alert('Error', 'Failed to load accommodations for comparison');
        } finally {
            setLoading(false);
        }
    };

    const removeFromComparison = (accommodationId) => {
        if (accommodations.length <= 2) {
            Alert.alert('Minimum Required', 'You need at least 2 accommodations to compare');
            return;
        }
        
        const updated = accommodations.filter(acc => acc.id !== accommodationId);
        setAccommodations(updated);
    };

    const addToFavorites = (accommodationId) => {
        Alert.alert('Added to Favorites', 'Accommodation has been added to your favorites');
    };

    const contactLandlord = (accommodation) => {
        Alert.alert(
            'Contact Landlord',
            `Contact ${accommodation.landlord.name}?`,
            [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Call', onPress: () => Alert.alert('Calling...', 'Feature coming soon') },
                { text: 'Message', onPress: () => navigation.navigate('Chat', { 
                    recipientId: accommodation.landlord.id,
                    recipientName: accommodation.landlord.name 
                })}
            ]
        );
    };

    const bookNow = (accommodation) => {
        navigation.navigate('AccommodationBooking', { 
            accommodationId: accommodation.id,
            accommodation: accommodation 
        });
    };

    const openImageModal = (imageUrl) => {
        setSelectedImage(imageUrl);
        setShowImageModal(true);
    };

    const renderHeader = () => (
        <View style={styles.header}>
            <TouchableOpacity 
                style={styles.backButton}
                onPress={() => navigation.goBack()}
            >
                <Ionicons name="arrow-back" size={24} color="#2c3e50" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Compare Accommodations</Text>
            <TouchableOpacity 
                style={styles.addButton}
                onPress={() => navigation.navigate('AccommodationSearch', { 
                    mode: 'compare',
                    existing: accommodations.map(acc => acc.id)
                })}
            >
                <Ionicons name="add" size={24} color="#3498db" />
            </TouchableOpacity>
        </View>
    );

    const renderAccommodationCard = (accommodation, index) => (
        <View key={accommodation.id} style={[styles.accommodationCard, { marginLeft: index === 0 ? 16 : 8 }]}>
            {/* Header */}
            <View style={styles.cardHeader}>
                <View style={styles.cardTitleContainer}>
                    <Text style={styles.accommodationName} numberOfLines={1}>
                        {accommodation.name}
                    </Text>
                    <Text style={styles.accommodationType}>{accommodation.type}</Text>
                </View>
                <TouchableOpacity 
                    style={styles.removeButton}
                    onPress={() => removeFromComparison(accommodation.id)}
                >
                    <Icon name="close" size={20} color="#e74c3c" />
                </TouchableOpacity>
            </View>

            {/* Image */}
            <TouchableOpacity onPress={() => openImageModal(accommodation.images[0])}>
                <Image 
                    source={{ uri: accommodation.images[0] }}
                    style={styles.accommodationImage}
                    resizeMode="cover"
                />
            </TouchableOpacity>

            {/* Rating and Distance */}
            <View style={styles.cardStats}>
                <View style={styles.rating}>
                    <Icon name="star" size={16} color="#f39c12" />
                    <Text style={styles.ratingText}>{accommodation.rating}</Text>
                    <Text style={styles.reviewCount}>({accommodation.reviews})</Text>
                </View>
                <Text style={styles.distance}>{accommodation.distance} miles</Text>
            </View>

            {/* Rent */}
            <View style={styles.rentContainer}>
                <Text style={styles.rentAmount}>${accommodation.rent}</Text>
                <Text style={styles.rentPeriod}>/month</Text>
            </View>

            {/* Action Buttons */}
            <View style={styles.actionButtons}>
                <TouchableOpacity 
                    style={styles.favoriteButton}
                    onPress={() => addToFavorites(accommodation.id)}
                >
                    <Icon name="favorite-border" size={20} color="#e74c3c" />
                </TouchableOpacity>
                <TouchableOpacity 
                    style={styles.bookButton}
                    onPress={() => bookNow(accommodation)}
                >
                    <Text style={styles.bookButtonText}>Book Now</Text>
                </TouchableOpacity>
            </View>
        </View>
    );

    const renderComparisonTable = () => {
        const features = [
            { key: 'rent', label: 'Monthly Rent', type: 'currency' },
            { key: 'deposit', label: 'Security Deposit', type: 'currency' },
            { key: 'utilities', label: 'Utilities (est.)', type: 'currency' },
            { key: 'availableFrom', label: 'Available From', type: 'date' },
            { key: 'bedrooms', label: 'Bedrooms', type: 'number' },
            { key: 'bathrooms', label: 'Bathrooms', type: 'number' },
            { key: 'furnished', label: 'Furnished', type: 'boolean' },
            { key: 'wifi', label: 'Free WiFi', type: 'boolean' },
            { key: 'parking', label: 'Parking', type: 'boolean' },
            { key: 'gym', label: 'Gym', type: 'boolean' },
            { key: 'laundry', label: 'Laundry', type: 'boolean' },
            { key: 'ac', label: 'Air Conditioning', type: 'boolean' },
            { key: 'heating', label: 'Heating', type: 'boolean' },
            { key: 'security', label: 'Security', type: 'boolean' },
            { key: 'elevator', label: 'Elevator', type: 'boolean' },
            { key: 'balcony', label: 'Balcony', type: 'boolean' },
            { key: 'study', label: 'Study Room', type: 'boolean' },
        ];

        return (
            <View style={styles.comparisonTable}>
                <Text style={styles.tableTitle}>Feature Comparison</Text>
                
                {features.map((feature, index) => (
                    <View key={feature.key} style={[
                        styles.tableRow,
                        index % 2 === 0 && styles.tableRowEven
                    ]}>
                        <View style={styles.featureNameCell}>
                            <Text style={styles.featureName}>{feature.label}</Text>
                        </View>
                        
                        {accommodations.map((accommodation) => {
                            let value;
                            if (feature.type === 'currency') {
                                value = `$${accommodation[feature.key]}`;
                            } else if (feature.type === 'boolean') {
                                const boolValue = accommodation.features?.[feature.key] ?? accommodation[feature.key];
                                value = boolValue ? '✓' : '✗';
                            } else if (feature.type === 'date') {
                                value = new Date(accommodation[feature.key]).toLocaleDateString();
                            } else {
                                value = accommodation.features?.[feature.key] ?? accommodation[feature.key];
                            }

                            return (
                                <View key={accommodation.id} style={styles.featureValueCell}>
                                    <Text style={[
                                        styles.featureValue,
                                        feature.type === 'boolean' && {
                                            color: value === '✓' ? '#27ae60' : '#e74c3c',
                                            fontWeight: 'bold'
                                        }
                                    ]}>
                                        {value}
                                    </Text>
                                </View>
                            );
                        })}
                    </View>
                ))}
            </View>
        );
    };

    const renderLandlordComparison = () => (
        <View style={styles.landlordComparison}>
            <Text style={styles.sectionTitle}>Landlord Information</Text>
            
            <View style={styles.landlordGrid}>
                {accommodations.map((accommodation) => (
                    <View key={accommodation.id} style={styles.landlordCard}>
                        <Text style={styles.landlordName}>{accommodation.landlord.name}</Text>
                        <View style={styles.landlordStats}>
                            <View style={styles.landlordStat}>
                                <Icon name="star" size={16} color="#f39c12" />
                                <Text style={styles.landlordStatText}>{accommodation.landlord.rating}</Text>
                            </View>
                            <View style={styles.landlordStat}>
                                <Icon name="access-time" size={16} color="#3498db" />
                                <Text style={styles.landlordStatText}>{accommodation.landlord.responseTime}</Text>
                            </View>
                        </View>
                        <TouchableOpacity 
                            style={styles.contactButton}
                            onPress={() => contactLandlord(accommodation)}
                        >
                            <Text style={styles.contactButtonText}>Contact</Text>
                        </TouchableOpacity>
                    </View>
                ))}
            </View>
        </View>
    );

    if (loading) {
        return (
            <SafeAreaView style={styles.container}>
                {renderHeader()}
                <View style={styles.loadingContainer}>
                    <Text style={styles.loadingText}>Loading comparison...</Text>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            {renderHeader()}
            
            <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
                {/* Accommodation Cards */}
                <ScrollView 
                    horizontal 
                    showsHorizontalScrollIndicator={false}
                    style={styles.cardsContainer}
                >
                    {accommodations.map((accommodation, index) => 
                        renderAccommodationCard(accommodation, index)
                    )}
                    <View style={styles.cardsSpacer} />
                </ScrollView>

                {/* Comparison Table */}
                {renderComparisonTable()}

                {/* Landlord Comparison */}
                {renderLandlordComparison()}

                <View style={styles.bottomSpacer} />
            </ScrollView>

            {/* Image Modal */}
            <Modal
                visible={showImageModal}
                transparent={true}
                animationType="fade"
                onRequestClose={() => setShowImageModal(false)}
            >
                <View style={styles.modalContainer}>
                    <TouchableOpacity 
                        style={styles.modalOverlay}
                        onPress={() => setShowImageModal(false)}
                    >
                        <Image 
                            source={{ uri: selectedImage }}
                            style={styles.modalImage}
                            resizeMode="contain"
                        />
                        <TouchableOpacity 
                            style={styles.modalCloseButton}
                            onPress={() => setShowImageModal(false)}
                        >
                            <Icon name="close" size={24} color="#fff" />
                        </TouchableOpacity>
                    </TouchableOpacity>
                </View>
            </Modal>
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
    },
    addButton: {
        padding: 8,
    },
    scrollContainer: {
        flex: 1,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        fontSize: 16,
        color: '#7f8c8d',
    },
    cardsContainer: {
        paddingVertical: 16,
    },
    accommodationCard: {
        width: screenWidth * 0.8,
        backgroundColor: '#fff',
        borderRadius: 12,
        marginRight: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        padding: 16,
        paddingBottom: 8,
    },
    cardTitleContainer: {
        flex: 1,
        marginRight: 8,
    },
    accommodationName: {
        fontSize: 18,
        fontWeight: '600',
        color: '#2c3e50',
        marginBottom: 4,
    },
    accommodationType: {
        fontSize: 14,
        color: '#7f8c8d',
    },
    removeButton: {
        padding: 4,
    },
    accommodationImage: {
        width: '100%',
        height: 180,
        marginBottom: 12,
    },
    cardStats: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 16,
        marginBottom: 8,
    },
    rating: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    ratingText: {
        fontSize: 14,
        fontWeight: '500',
        color: '#2c3e50',
        marginLeft: 4,
    },
    reviewCount: {
        fontSize: 12,
        color: '#7f8c8d',
        marginLeft: 4,
    },
    distance: {
        fontSize: 14,
        color: '#7f8c8d',
    },
    rentContainer: {
        flexDirection: 'row',
        alignItems: 'baseline',
        paddingHorizontal: 16,
        marginBottom: 16,
    },
    rentAmount: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#27ae60',
    },
    rentPeriod: {
        fontSize: 14,
        color: '#7f8c8d',
        marginLeft: 4,
    },
    actionButtons: {
        flexDirection: 'row',
        paddingHorizontal: 16,
        paddingBottom: 16,
        gap: 12,
    },
    favoriteButton: {
        padding: 12,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#e74c3c',
        alignItems: 'center',
        justifyContent: 'center',
    },
    bookButton: {
        flex: 1,
        backgroundColor: '#3498db',
        paddingVertical: 12,
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
    },
    bookButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#fff',
    },
    cardsSpacer: {
        width: 16,
    },
    comparisonTable: {
        backgroundColor: '#fff',
        margin: 16,
        borderRadius: 12,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    tableTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#2c3e50',
        padding: 16,
        backgroundColor: '#f8f9fa',
        borderBottomWidth: 1,
        borderBottomColor: '#ecf0f1',
    },
    tableRow: {
        flexDirection: 'row',
        minHeight: 48,
        borderBottomWidth: 1,
        borderBottomColor: '#ecf0f1',
    },
    tableRowEven: {
        backgroundColor: '#f8f9fa',
    },
    featureNameCell: {
        flex: 2,
        padding: 12,
        justifyContent: 'center',
        borderRightWidth: 1,
        borderRightColor: '#ecf0f1',
    },
    featureName: {
        fontSize: 14,
        fontWeight: '500',
        color: '#2c3e50',
    },
    featureValueCell: {
        flex: 1,
        padding: 12,
        justifyContent: 'center',
        alignItems: 'center',
        borderRightWidth: 1,
        borderRightColor: '#ecf0f1',
    },
    featureValue: {
        fontSize: 14,
        color: '#2c3e50',
        textAlign: 'center',
    },
    landlordComparison: {
        margin: 16,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#2c3e50',
        marginBottom: 12,
    },
    landlordGrid: {
        flexDirection: 'row',
        gap: 12,
    },
    landlordCard: {
        flex: 1,
        backgroundColor: '#fff',
        padding: 16,
        borderRadius: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    landlordName: {
        fontSize: 16,
        fontWeight: '600',
        color: '#2c3e50',
        marginBottom: 8,
        textAlign: 'center',
    },
    landlordStats: {
        marginBottom: 12,
    },
    landlordStat: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 4,
    },
    landlordStatText: {
        fontSize: 14,
        color: '#2c3e50',
        marginLeft: 4,
    },
    contactButton: {
        backgroundColor: '#3498db',
        paddingVertical: 8,
        borderRadius: 6,
        alignItems: 'center',
    },
    contactButtonText: {
        fontSize: 14,
        fontWeight: '500',
        color: '#fff',
    },
    modalContainer: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.9)',
    },
    modalOverlay: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalImage: {
        width: screenWidth * 0.9,
        height: screenWidth * 0.9,
    },
    modalCloseButton: {
        position: 'absolute',
        top: 50,
        right: 20,
        padding: 12,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        borderRadius: 20,
    },
    bottomSpacer: {
        height: 40,
    },
});

export default CompareAccommodationsScreen;
