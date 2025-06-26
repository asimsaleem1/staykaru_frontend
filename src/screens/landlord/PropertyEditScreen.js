import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    ScrollView,
    StyleSheet,
    TouchableOpacity,
    TextInput,
    Alert,
    Switch,
    Platform,
    Modal,
    FlatList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as ImagePicker from 'expo-image-picker';
import CustomImagePicker from '../../components/ImagePicker';
import { fetchFromBackend } from '../../utils/networkUtils';

const PropertyEditScreen = ({ navigation, route }) => {
    const { propertyId, isEditing = false } = route.params || {};
    
    const [property, setProperty] = useState({
        title: '',
        description: '',
        type: 'room',
        address: '',
        city: 'Karachi',
        area: '',
        price: '',
        images: [],
        amenities: [],
        rules: [],
        availability: {
            checkIn: '14:00',
            checkOut: '11:00',
            minimumStay: 1,
            advanceBooking: 365,
        },
        contact: {
            phone: '',
            whatsapp: '',
            email: '',
        },
        coordinates: {
            latitude: 24.8607,
            longitude: 67.0011,
        },
        status: 'active',
        verified: false,
    });

    const [loading, setLoading] = useState(false);
    const [showCityModal, setShowCityModal] = useState(false);
    const [showTypeModal, setShowTypeModal] = useState(false);
    const [showAmenitiesModal, setShowAmenitiesModal] = useState(false);

    const propertyTypes = [
        { key: 'room', label: 'Single Room', icon: 'bed-outline' },
        { key: 'apartment', label: 'Apartment', icon: 'home-outline' },
        { key: 'house', label: 'House', icon: 'business-outline' },
        { key: 'hostel', label: 'Hostel', icon: 'school-outline' },
        { key: 'pg', label: 'PG Accommodation', icon: 'people-outline' },
    ];

    const pakistaniCities = [
        'Karachi', 'Lahore', 'Islamabad', 'Rawalpindi', 'Faisalabad',
        'Multan', 'Hyderabad', 'Peshawar', 'Quetta', 'Sialkot',
        'Gujranwala', 'Bahawalpur', 'Sargodha', 'Sukkur', 'Larkana'
    ];

    const availableAmenities = [
        { key: 'wifi', label: 'WiFi', icon: 'wifi-outline' },
        { key: 'ac', label: 'Air Conditioning', icon: 'snow-outline' },
        { key: 'parking', label: 'Parking', icon: 'car-outline' },
        { key: 'laundry', label: 'Laundry', icon: 'shirt-outline' },
        { key: 'kitchen', label: 'Kitchen Access', icon: 'restaurant-outline' },
        { key: 'tv', label: 'TV', icon: 'tv-outline' },
        { key: 'gym', label: 'Gym', icon: 'fitness-outline' },
        { key: 'security', label: '24/7 Security', icon: 'shield-outline' },
        { key: 'cleaning', label: 'Cleaning Service', icon: 'brush-outline' },
        { key: 'meals', label: 'Meals Included', icon: 'fast-food-outline' },
        { key: 'generator', label: 'Generator Backup', icon: 'flash-outline' },
        { key: 'water', label: 'Water Supply', icon: 'water-outline' },
    ];

    useEffect(() => {
        if (isEditing && propertyId) {
            loadPropertyData();
        }
        requestPermissions();
    }, []);

    const requestPermissions = async () => {
        if (Platform.OS !== 'web') {
            const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
            if (status !== 'granted') {
                Alert.alert('Permission Required', 'We need camera roll permission to upload images.');
            }
        }
    };

    const loadPropertyData = async () => {
        try {
            setLoading(true);
            const response = await fetchFromBackend(`/properties/${propertyId}`);
            
            if (response.success) {
                setProperty(response.data);
                console.log('✅ Property data loaded for editing');
            } else {
                Alert.alert('Error', 'Failed to load property data');
                navigation.goBack();
            }
        } catch (error) {
            console.error('❌ Error loading property:', error);
            Alert.alert('Error', 'Failed to load property data');
            navigation.goBack();
        } finally {
            setLoading(false);
        }
    };

    const handleImagePick = async () => {
        try {
            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsMultipleSelection: true,
                quality: 0.8,
                aspect: [16, 9],
            });

            if (!result.canceled && result.assets) {
                const newImages = result.assets.map(asset => ({
                    uri: asset.uri,
                    width: asset.width,
                    height: asset.height,
                }));
                
                setProperty(prev => ({
                    ...prev,
                    images: [...prev.images, ...newImages]
                }));
            }
        } catch (error) {
            console.error('❌ Error picking images:', error);
            Alert.alert('Error', 'Failed to pick images');
        }
    };

    const removeImage = (index) => {
        setProperty(prev => ({
            ...prev,
            images: prev.images.filter((_, i) => i !== index)
        }));
    };

    const toggleAmenity = (amenityKey) => {
        setProperty(prev => ({
            ...prev,
            amenities: prev.amenities.includes(amenityKey)
                ? prev.amenities.filter(a => a !== amenityKey)
                : [...prev.amenities, amenityKey]
        }));
    };

    const validateForm = () => {
        if (!property.title.trim()) {
            Alert.alert('Validation Error', 'Property title is required');
            return false;
        }
        if (!property.description.trim()) {
            Alert.alert('Validation Error', 'Property description is required');
            return false;
        }
        if (!property.address.trim()) {
            Alert.alert('Validation Error', 'Property address is required');
            return false;
        }
        if (!property.price || isNaN(property.price) || parseInt(property.price) <= 0) {
            Alert.alert('Validation Error', 'Valid price is required');
            return false;
        }
        if (property.images.length === 0) {
            Alert.alert('Validation Error', 'At least one image is required');
            return false;
        }
        if (!property.contact.phone.trim()) {
            Alert.alert('Validation Error', 'Contact phone number is required');
            return false;
        }
        return true;
    };

    const handleSave = async () => {
        if (!validateForm()) return;

        try {
            setLoading(true);
            
            const endpoint = isEditing ? `/properties/${propertyId}` : '/properties';
            const method = isEditing ? 'PUT' : 'POST';
            
            const response = await fetchFromBackend(endpoint, {
                method,
                body: JSON.stringify({
                    ...property,
                    price: parseInt(property.price),
                    availability: {
                        ...property.availability,
                        minimumStay: parseInt(property.availability.minimumStay),
                        advanceBooking: parseInt(property.availability.advanceBooking),
                    }
                }),
            });

            if (response.success) {
                Alert.alert(
                    'Success',
                    isEditing ? 'Property updated successfully' : 'Property created successfully',
                    [
                        {
                            text: 'OK',
                            onPress: () => navigation.goBack()
                        }
                    ]
                );
                console.log(`✅ Property ${isEditing ? 'updated' : 'created'} successfully`);
            } else {
                Alert.alert('Error', response.message || 'Failed to save property');
            }
        } catch (error) {
            console.error('❌ Error saving property:', error);
            Alert.alert('Error', 'Failed to save property');
        } finally {
            setLoading(false);
        }
    };

    const renderImagePicker = () => (
        <CustomImagePicker
            images={property.images}
            onImagePick={handleImagePick}
            onImageRemove={removeImage}
            maxImages={10}
        />
    );

    const renderCityModal = () => (
        <Modal
            visible={showCityModal}
            animationType="slide"
            presentationStyle="pageSheet"
        >
            <SafeAreaView style={styles.modalContainer}>
                <View style={styles.modalHeader}>
                    <TouchableOpacity
                        onPress={() => setShowCityModal(false)}
                        style={styles.modalCloseButton}
                    >
                        <Ionicons name="close" size={24} color="#666" />
                    </TouchableOpacity>
                    <Text style={styles.modalTitle}>Select City</Text>
                    <View style={{ width: 40 }} />
                </View>
                
                <FlatList
                    data={pakistaniCities}
                    keyExtractor={(item) => item}
                    renderItem={({ item }) => (
                        <TouchableOpacity
                            style={[
                                styles.cityItem,
                                property.city === item && styles.selectedCityItem
                            ]}
                            onPress={() => {
                                setProperty(prev => ({ ...prev, city: item }));
                                setShowCityModal(false);
                            }}
                        >
                            <Text style={[
                                styles.cityText,
                                property.city === item && styles.selectedCityText
                            ]}>
                                {item}
                            </Text>
                            {property.city === item && (
                                <Ionicons name="checkmark" size={20} color="#6B73FF" />
                            )}
                        </TouchableOpacity>
                    )}
                />
            </SafeAreaView>
        </Modal>
    );

    const renderTypeModal = () => (
        <Modal
            visible={showTypeModal}
            animationType="slide"
            presentationStyle="pageSheet"
        >
            <SafeAreaView style={styles.modalContainer}>
                <View style={styles.modalHeader}>
                    <TouchableOpacity
                        onPress={() => setShowTypeModal(false)}
                        style={styles.modalCloseButton}
                    >
                        <Ionicons name="close" size={24} color="#666" />
                    </TouchableOpacity>
                    <Text style={styles.modalTitle}>Property Type</Text>
                    <View style={{ width: 40 }} />
                </View>
                
                <FlatList
                    data={propertyTypes}
                    keyExtractor={(item) => item.key}
                    renderItem={({ item }) => (
                        <TouchableOpacity
                            style={[
                                styles.typeItem,
                                property.type === item.key && styles.selectedTypeItem
                            ]}
                            onPress={() => {
                                setProperty(prev => ({ ...prev, type: item.key }));
                                setShowTypeModal(false);
                            }}
                        >
                            <View style={styles.typeItemContent}>
                                <Ionicons name={item.icon} size={24} color="#666" />
                                <Text style={[
                                    styles.typeText,
                                    property.type === item.key && styles.selectedTypeText
                                ]}>
                                    {item.label}
                                </Text>
                            </View>
                            {property.type === item.key && (
                                <Ionicons name="checkmark" size={20} color="#6B73FF" />
                            )}
                        </TouchableOpacity>
                    )}
                />
            </SafeAreaView>
        </Modal>
    );

    const renderAmenitiesModal = () => (
        <Modal
            visible={showAmenitiesModal}
            animationType="slide"
            presentationStyle="pageSheet"
        >
            <SafeAreaView style={styles.modalContainer}>
                <View style={styles.modalHeader}>
                    <TouchableOpacity
                        onPress={() => setShowAmenitiesModal(false)}
                        style={styles.modalCloseButton}
                    >
                        <Ionicons name="close" size={24} color="#666" />
                    </TouchableOpacity>
                    <Text style={styles.modalTitle}>Select Amenities</Text>
                    <TouchableOpacity
                        onPress={() => setShowAmenitiesModal(false)}
                        style={styles.doneButton}
                    >
                        <Text style={styles.doneButtonText}>Done</Text>
                    </TouchableOpacity>
                </View>
                
                <FlatList
                    data={availableAmenities}
                    keyExtractor={(item) => item.key}
                    numColumns={2}
                    renderItem={({ item }) => (
                        <TouchableOpacity
                            style={[
                                styles.amenityItem,
                                property.amenities.includes(item.key) && styles.selectedAmenityItem
                            ]}
                            onPress={() => toggleAmenity(item.key)}
                        >
                            <Ionicons 
                                name={item.icon} 
                                size={24} 
                                color={property.amenities.includes(item.key) ? '#6B73FF' : '#666'} 
                            />
                            <Text style={[
                                styles.amenityText,
                                property.amenities.includes(item.key) && styles.selectedAmenityText
                            ]}>
                                {item.label}
                            </Text>
                            {property.amenities.includes(item.key) && (
                                <Ionicons name="checkmark-circle" size={20} color="#6B73FF" />
                            )}
                        </TouchableOpacity>
                    )}
                />
            </SafeAreaView>
        </Modal>
    );

    return (
        <SafeAreaView style={styles.container}>
            {/* Header */}
            <LinearGradient
                colors={['#6B73FF', '#9575CD']}
                style={styles.header}
            >
                <View style={styles.headerContent}>
                    <TouchableOpacity
                        onPress={() => navigation.goBack()}
                        style={styles.backButton}
                    >
                        <Ionicons name="arrow-back" size={24} color="#fff" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>
                        {isEditing ? 'Edit Property' : 'Add New Property'}
                    </Text>
                    <TouchableOpacity
                        onPress={handleSave}
                        style={styles.saveButton}
                        disabled={loading}
                    >
                        <Text style={styles.saveButtonText}>
                            {loading ? 'Saving...' : 'Save'}
                        </Text>
                    </TouchableOpacity>
                </View>
            </LinearGradient>

            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                {/* Basic Information */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Basic Information</Text>
                    
                    <View style={styles.formGroup}>
                        <Text style={styles.label}>Property Title *</Text>
                        <TextInput
                            style={styles.input}
                            value={property.title}
                            onChangeText={(text) => setProperty(prev => ({ ...prev, title: text }))}
                            placeholder="e.g., Cozy Room in Gulshan-e-Iqbal"
                            placeholderTextColor="#999"
                        />
                    </View>

                    <View style={styles.formGroup}>
                        <Text style={styles.label}>Description *</Text>
                        <TextInput
                            style={[styles.input, styles.textArea]}
                            value={property.description}
                            onChangeText={(text) => setProperty(prev => ({ ...prev, description: text }))}
                            placeholder="Describe your property, nearby facilities, and what makes it special..."
                            placeholderTextColor="#999"
                            multiline
                            numberOfLines={4}
                        />
                    </View>

                    <View style={styles.formGroup}>
                        <Text style={styles.label}>Property Type *</Text>
                        <TouchableOpacity
                            style={styles.selector}
                            onPress={() => setShowTypeModal(true)}
                        >
                            <Text style={styles.selectorText}>
                                {propertyTypes.find(t => t.key === property.type)?.label || 'Select Type'}
                            </Text>
                            <Ionicons name="chevron-down" size={20} color="#666" />
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Location */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Location</Text>
                    
                    <View style={styles.formGroup}>
                        <Text style={styles.label}>Address *</Text>
                        <TextInput
                            style={styles.input}
                            value={property.address}
                            onChangeText={(text) => setProperty(prev => ({ ...prev, address: text }))}
                            placeholder="e.g., Block 5, Gulshan-e-Iqbal"
                            placeholderTextColor="#999"
                        />
                    </View>

                    <View style={styles.formGroup}>
                        <Text style={styles.label}>City *</Text>
                        <TouchableOpacity
                            style={styles.selector}
                            onPress={() => setShowCityModal(true)}
                        >
                            <Text style={styles.selectorText}>{property.city}</Text>
                            <Ionicons name="chevron-down" size={20} color="#666" />
                        </TouchableOpacity>
                    </View>

                    <View style={styles.formGroup}>
                        <Text style={styles.label}>Area/Neighborhood</Text>
                        <TextInput
                            style={styles.input}
                            value={property.area}
                            onChangeText={(text) => setProperty(prev => ({ ...prev, area: text }))}
                            placeholder="e.g., Near University of Karachi"
                            placeholderTextColor="#999"
                        />
                    </View>
                </View>

                {/* Pricing */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Pricing</Text>
                    
                    <View style={styles.formGroup}>
                        <Text style={styles.label}>Monthly Rent (PKR) *</Text>
                        <TextInput
                            style={styles.input}
                            value={property.price}
                            onChangeText={(text) => setProperty(prev => ({ ...prev, price: text }))}
                            placeholder="e.g., 15000"
                            placeholderTextColor="#999"
                            keyboardType="numeric"
                        />
                    </View>
                </View>

                {/* Images */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Images *</Text>
                    <Text style={styles.sectionSubtitle}>
                        Upload clear photos of your property (max 10 images)
                    </Text>
                    {renderImagePicker()}
                </View>

                {/* Amenities */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Amenities</Text>
                    <TouchableOpacity
                        style={styles.amenitiesButton}
                        onPress={() => setShowAmenitiesModal(true)}
                    >
                        <Text style={styles.amenitiesButtonText}>
                            {property.amenities.length > 0 
                                ? `${property.amenities.length} amenities selected`
                                : 'Select amenities'
                            }
                        </Text>
                        <Ionicons name="chevron-forward" size={20} color="#6B73FF" />
                    </TouchableOpacity>
                    
                    {property.amenities.length > 0 && (
                        <View style={styles.selectedAmenities}>
                            {property.amenities.map(amenityKey => {
                                const amenity = availableAmenities.find(a => a.key === amenityKey);
                                return amenity ? (
                                    <View key={amenityKey} style={styles.amenityTag}>
                                        <Ionicons name={amenity.icon} size={16} color="#6B73FF" />
                                        <Text style={styles.amenityTagText}>{amenity.label}</Text>
                                    </View>
                                ) : null;
                            })}
                        </View>
                    )}
                </View>

                {/* Availability */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Availability Settings</Text>
                    
                    <View style={styles.formRow}>
                        <View style={styles.formGroupHalf}>
                            <Text style={styles.label}>Check-in Time</Text>
                            <TextInput
                                style={styles.input}
                                value={property.availability.checkIn}
                                onChangeText={(text) => setProperty(prev => ({
                                    ...prev,
                                    availability: { ...prev.availability, checkIn: text }
                                }))}
                                placeholder="14:00"
                                placeholderTextColor="#999"
                            />
                        </View>
                        
                        <View style={styles.formGroupHalf}>
                            <Text style={styles.label}>Check-out Time</Text>
                            <TextInput
                                style={styles.input}
                                value={property.availability.checkOut}
                                onChangeText={(text) => setProperty(prev => ({
                                    ...prev,
                                    availability: { ...prev.availability, checkOut: text }
                                }))}
                                placeholder="11:00"
                                placeholderTextColor="#999"
                            />
                        </View>
                    </View>

                    <View style={styles.formRow}>
                        <View style={styles.formGroupHalf}>
                            <Text style={styles.label}>Minimum Stay (days)</Text>
                            <TextInput
                                style={styles.input}
                                value={property.availability.minimumStay.toString()}
                                onChangeText={(text) => setProperty(prev => ({
                                    ...prev,
                                    availability: { ...prev.availability, minimumStay: parseInt(text) || 1 }
                                }))}
                                placeholder="1"
                                placeholderTextColor="#999"
                                keyboardType="numeric"
                            />
                        </View>
                        
                        <View style={styles.formGroupHalf}>
                            <Text style={styles.label}>Advance Booking (days)</Text>
                            <TextInput
                                style={styles.input}
                                value={property.availability.advanceBooking.toString()}
                                onChangeText={(text) => setProperty(prev => ({
                                    ...prev,
                                    availability: { ...prev.availability, advanceBooking: parseInt(text) || 365 }
                                }))}
                                placeholder="365"
                                placeholderTextColor="#999"
                                keyboardType="numeric"
                            />
                        </View>
                    </View>
                </View>

                {/* Contact Information */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Contact Information</Text>
                    
                    <View style={styles.formGroup}>
                        <Text style={styles.label}>Phone Number *</Text>
                        <TextInput
                            style={styles.input}
                            value={property.contact.phone}
                            onChangeText={(text) => setProperty(prev => ({
                                ...prev,
                                contact: { ...prev.contact, phone: text }
                            }))}
                            placeholder="03XX-XXXXXXX"
                            placeholderTextColor="#999"
                            keyboardType="phone-pad"
                        />
                    </View>

                    <View style={styles.formGroup}>
                        <Text style={styles.label}>WhatsApp Number</Text>
                        <TextInput
                            style={styles.input}
                            value={property.contact.whatsapp}
                            onChangeText={(text) => setProperty(prev => ({
                                ...prev,
                                contact: { ...prev.contact, whatsapp: text }
                            }))}
                            placeholder="03XX-XXXXXXX"
                            placeholderTextColor="#999"
                            keyboardType="phone-pad"
                        />
                    </View>

                    <View style={styles.formGroup}>
                        <Text style={styles.label}>Email Address</Text>
                        <TextInput
                            style={styles.input}
                            value={property.contact.email}
                            onChangeText={(text) => setProperty(prev => ({
                                ...prev,
                                contact: { ...prev.contact, email: text }
                            }))}
                            placeholder="your@email.com"
                            placeholderTextColor="#999"
                            keyboardType="email-address"
                            autoCapitalize="none"
                        />
                    </View>
                </View>

                {/* Property Status */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Property Status</Text>
                    
                    <View style={styles.switchRow}>
                        <View style={styles.switchInfo}>
                            <Text style={styles.switchTitle}>Active Status</Text>
                            <Text style={styles.switchSubtitle}>
                                Property is visible to students and available for booking
                            </Text>
                        </View>
                        <Switch
                            value={property.status === 'active'}
                            onValueChange={(value) => setProperty(prev => ({
                                ...prev,
                                status: value ? 'active' : 'inactive'
                            }))}
                            trackColor={{ false: '#ccc', true: '#6B73FF' }}
                            thumbColor={property.status === 'active' ? '#fff' : '#f4f3f4'}
                        />
                    </View>
                </View>

                {/* Save Button */}
                <View style={styles.saveSection}>
                    <TouchableOpacity
                        style={[styles.saveButtonLarge, loading && styles.saveButtonDisabled]}
                        onPress={handleSave}
                        disabled={loading}
                    >
                        <Text style={styles.saveButtonLargeText}>
                            {loading ? 'Saving Property...' : (isEditing ? 'Update Property' : 'Create Property')}
                        </Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>

            {/* Modals */}
            {renderCityModal()}
            {renderTypeModal()}
            {renderAmenitiesModal()}
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
        paddingVertical: 15,
    },
    headerContent: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    backButton: {
        padding: 8,
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#fff',
        flex: 1,
        textAlign: 'center',
        marginHorizontal: 20,
    },
    saveButton: {
        backgroundColor: 'rgba(255,255,255,0.2)',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
    },
    saveButtonText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: '600',
    },
    content: {
        flex: 1,
    },
    section: {
        backgroundColor: '#fff',
        marginHorizontal: 20,
        marginTop: 20,
        borderRadius: 12,
        padding: 20,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 5,
    },
    sectionSubtitle: {
        fontSize: 14,
        color: '#666',
        marginBottom: 15,
    },
    formGroup: {
        marginBottom: 20,
    },
    formGroupHalf: {
        flex: 1,
        marginBottom: 20,
    },
    formRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: 15,
    },
    label: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
        marginBottom: 8,
    },
    input: {
        borderWidth: 1,
        borderColor: '#e0e0e0',
        borderRadius: 8,
        paddingHorizontal: 15,
        paddingVertical: 12,
        fontSize: 16,
        color: '#333',
        backgroundColor: '#fff',
    },
    textArea: {
        height: 100,
        textAlignVertical: 'top',
    },
    selector: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#e0e0e0',
        borderRadius: 8,
        paddingHorizontal: 15,
        paddingVertical: 12,
        backgroundColor: '#fff',
    },
    selectorText: {
        fontSize: 16,
        color: '#333',
    },
    amenitiesButton: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#6B73FF',
        borderRadius: 8,
        paddingHorizontal: 15,
        paddingVertical: 12,
        backgroundColor: '#f8f9ff',
    },
    amenitiesButtonText: {
        fontSize: 16,
        color: '#6B73FF',
        fontWeight: '500',
    },
    selectedAmenities: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginTop: 15,
        gap: 8,
    },
    amenityTag: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f0f0f0',
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 15,
    },
    amenityTagText: {
        fontSize: 12,
        color: '#666',
        marginLeft: 5,
    },
    switchRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    switchInfo: {
        flex: 1,
        marginRight: 15,
    },
    switchTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
    },
    switchSubtitle: {
        fontSize: 14,
        color: '#666',
        marginTop: 2,
    },
    saveSection: {
        padding: 20,
    },
    saveButtonLarge: {
        backgroundColor: '#6B73FF',
        paddingVertical: 15,
        borderRadius: 25,
        alignItems: 'center',
    },
    saveButtonDisabled: {
        backgroundColor: '#ccc',
    },
    saveButtonLargeText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
    },
    // Modal Styles
    modalContainer: {
        flex: 1,
        backgroundColor: '#fff',
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#e0e0e0',
    },
    modalCloseButton: {
        padding: 5,
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
    },
    doneButton: {
        backgroundColor: '#6B73FF',
        paddingHorizontal: 15,
        paddingVertical: 8,
        borderRadius: 15,
    },
    doneButtonText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: '600',
    },
    cityItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    selectedCityItem: {
        backgroundColor: '#f8f9ff',
    },
    cityText: {
        fontSize: 16,
        color: '#333',
    },
    selectedCityText: {
        color: '#6B73FF',
        fontWeight: '600',
    },
    typeItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    selectedTypeItem: {
        backgroundColor: '#f8f9ff',
    },
    typeItemContent: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    typeText: {
        fontSize: 16,
        color: '#333',
        marginLeft: 15,
    },
    selectedTypeText: {
        color: '#6B73FF',
        fontWeight: '600',
    },
    amenityItem: {
        flex: 1,
        flexDirection: 'column',
        alignItems: 'center',
        margin: 8,
        padding: 15,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#e0e0e0',
        backgroundColor: '#fff',
    },
    selectedAmenityItem: {
        borderColor: '#6B73FF',
        backgroundColor: '#f8f9ff',
    },
    amenityText: {
        fontSize: 12,
        color: '#666',
        marginTop: 5,
        textAlign: 'center',
    },
    selectedAmenityText: {
        color: '#6B73FF',
        fontWeight: '600',
    },
});

export default PropertyEditScreen;
