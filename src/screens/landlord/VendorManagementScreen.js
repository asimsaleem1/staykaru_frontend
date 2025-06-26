import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    TextInput,
    Modal,
    Alert,
    RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SIZES } from '../../utils/constants';
import { fetchFromBackend } from '../../utils/networkUtils';

const VendorManagementScreen = ({ navigation }) => {
    const [vendors, setVendors] = useState([]);
    const [loading, setLoading] = useState(false);
    const [refreshing, setRefreshing] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [addVendorModalVisible, setAddVendorModalVisible] = useState(false);
    const [selectedVendor, setSelectedVendor] = useState(null);
    const [vendorDetailsModalVisible, setVendorDetailsModalVisible] = useState(false);
    const [newVendor, setNewVendor] = useState({
        name: '',
        category: '',
        phone: '',
        email: '',
        address: '',
        hourlyRate: '',
        description: '',
    });

    const serviceCategories = [
        { id: 'all', name: 'All Services', icon: 'grid-outline' },
        { id: 'plumbing', name: 'Plumbing', icon: 'water-outline' },
        { id: 'electrical', name: 'Electrical', icon: 'flash-outline' },
        { id: 'hvac', name: 'HVAC', icon: 'thermometer-outline' },
        { id: 'carpentry', name: 'Carpentry', icon: 'hammer-outline' },
        { id: 'painting', name: 'Painting', icon: 'brush-outline' },
        { id: 'cleaning', name: 'Cleaning', icon: 'sparkles-outline' },
        { id: 'landscaping', name: 'Landscaping', icon: 'leaf-outline' },
        { id: 'general', name: 'General Repair', icon: 'build-outline' },
    ];

    useEffect(() => {
        loadVendors();
    }, []);

    const loadVendors = async () => {
        setLoading(true);
        try {
            const response = await fetchFromBackend('/api/landlord/maintenance/vendors');
            if (response?.success) {
                setVendors(response.data || []);
            }
        } catch (error) {
            console.error('Error loading vendors:', error);
            Alert.alert('Error', 'Failed to load vendors');
        } finally {
            setLoading(false);
        }
    };

    const handleRefresh = async () => {
        setRefreshing(true);
        await loadVendors();
        setRefreshing(false);
    };

    const addVendor = async () => {
        try {
            const response = await fetchFromBackend('/api/landlord/maintenance/vendors', {
                method: 'POST',
                body: JSON.stringify({
                    ...newVendor,
                    hourly_rate: parseFloat(newVendor.hourlyRate) || 0,
                })
            });

            if (response?.success) {
                setVendors(prev => [...prev, response.data]);
                setAddVendorModalVisible(false);
                setNewVendor({
                    name: '',
                    category: '',
                    phone: '',
                    email: '',
                    address: '',
                    hourlyRate: '',
                    description: '',
                });
                Alert.alert('Success', 'Vendor added successfully');
            }
        } catch (error) {
            console.error('Error adding vendor:', error);
            Alert.alert('Error', 'Failed to add vendor');
        }
    };

    const getFilteredVendors = () => {
        return vendors.filter(vendor => {
            const categoryMatch = selectedCategory === 'all' || vendor.category === selectedCategory;
            const searchMatch = searchQuery === '' || 
                vendor.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                vendor.category?.toLowerCase().includes(searchQuery.toLowerCase());
            
            return categoryMatch && searchMatch;
        });
    };

    const getRatingStars = (rating) => {
        const stars = [];
        const filledStars = Math.floor(rating || 0);
        const hasHalfStar = (rating || 0) % 1 !== 0;
        
        for (let i = 0; i < 5; i++) {
            if (i < filledStars) {
                stars.push(<Ionicons key={i} name="star" size={16} color={COLORS.warning} />);
            } else if (i === filledStars && hasHalfStar) {
                stars.push(<Ionicons key={i} name="star-half" size={16} color={COLORS.warning} />);
            } else {
                stars.push(<Ionicons key={i} name="star-outline" size={16} color={COLORS.gray} />);
            }
        }
        return stars;
    };

    const getCategoryIcon = (category) => {
        const categoryData = serviceCategories.find(cat => cat.id === category);
        return categoryData?.icon || 'build-outline';
    };

    const renderVendorCard = (vendor) => (
        <TouchableOpacity
            key={vendor.id}
            style={styles.vendorCard}
            onPress={() => {
                setSelectedVendor(vendor);
                setVendorDetailsModalVisible(true);
            }}
        >
            <View style={styles.vendorHeader}>
                <View style={styles.vendorIcon}>
                    <Ionicons name={getCategoryIcon(vendor.category)} size={24} color={COLORS.primary} />
                </View>
                <View style={styles.vendorInfo}>
                    <Text style={styles.vendorName}>{vendor.name}</Text>
                    <Text style={styles.vendorCategory}>{vendor.category}</Text>
                    <View style={styles.ratingContainer}>
                        {getRatingStars(vendor.rating)}
                        <Text style={styles.ratingText}>({vendor.rating || 0})</Text>
                    </View>
                </View>
                <View style={styles.vendorPrice}>
                    <Text style={styles.priceText}>₨{vendor.hourly_rate || 0}/hr</Text>
                    <Text style={styles.priceLabel}>Hourly Rate</Text>
                </View>
            </View>

            <View style={styles.vendorDetails}>
                <View style={styles.contactInfo}>
                    <Ionicons name="call-outline" size={16} color={COLORS.gray} />
                    <Text style={styles.contactText}>{vendor.phone || 'No phone'}</Text>
                </View>
                <View style={styles.contactInfo}>
                    <Ionicons name="mail-outline" size={16} color={COLORS.gray} />
                    <Text style={styles.contactText}>{vendor.email || 'No email'}</Text>
                </View>
            </View>

            <View style={styles.vendorStats}>
                <View style={styles.statItem}>
                    <Text style={styles.statNumber}>{vendor.completed_jobs || 0}</Text>
                    <Text style={styles.statLabel}>Jobs Done</Text>
                </View>
                <View style={styles.statItem}>
                    <Text style={styles.statNumber}>{vendor.response_time || 'N/A'}</Text>
                    <Text style={styles.statLabel}>Response Time</Text>
                </View>
                <View style={styles.statItem}>
                    <Text style={[styles.statNumber, { color: vendor.available ? COLORS.success : COLORS.error }]}>
                        {vendor.available ? 'Available' : 'Busy'}
                    </Text>
                    <Text style={styles.statLabel}>Status</Text>
                </View>
            </View>
        </TouchableOpacity>
    );

    const renderAddVendorModal = () => (
        <Modal
            visible={addVendorModalVisible}
            animationType="slide"
            presentationStyle="pageSheet"
        >
            <View style={styles.modalContainer}>
                <View style={styles.modalHeader}>
                    <TouchableOpacity
                        onPress={() => setAddVendorModalVisible(false)}
                        style={styles.closeButton}
                    >
                        <Ionicons name="close" size={24} color={COLORS.dark} />
                    </TouchableOpacity>
                    <Text style={styles.modalTitle}>Add New Vendor</Text>
                    <TouchableOpacity
                        onPress={addVendor}
                        style={styles.saveButton}
                    >
                        <Text style={styles.saveButtonText}>Save</Text>
                    </TouchableOpacity>
                </View>

                <ScrollView style={styles.modalContent}>
                    <View style={styles.inputGroup}>
                        <Text style={styles.inputLabel}>Vendor Name</Text>
                        <TextInput
                            style={styles.input}
                            value={newVendor.name}
                            onChangeText={(text) => setNewVendor(prev => ({ ...prev, name: text }))}
                            placeholder="Enter vendor name"
                        />
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.inputLabel}>Category</Text>
                        <View style={styles.categoryGrid}>
                            {serviceCategories.slice(1).map(category => (
                                <TouchableOpacity
                                    key={category.id}
                                    style={[styles.categoryItem, newVendor.category === category.id && styles.selectedCategory]}
                                    onPress={() => setNewVendor(prev => ({ ...prev, category: category.id }))}
                                >
                                    <Ionicons name={category.icon} size={20} color={newVendor.category === category.id ? COLORS.white : COLORS.primary} />
                                    <Text style={[styles.categoryText, newVendor.category === category.id && styles.selectedCategoryText]}>
                                        {category.name}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.inputLabel}>Phone Number</Text>
                        <TextInput
                            style={styles.input}
                            value={newVendor.phone}
                            onChangeText={(text) => setNewVendor(prev => ({ ...prev, phone: text }))}
                            placeholder="Enter phone number"
                            keyboardType="phone-pad"
                        />
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.inputLabel}>Email</Text>
                        <TextInput
                            style={styles.input}
                            value={newVendor.email}
                            onChangeText={(text) => setNewVendor(prev => ({ ...prev, email: text }))}
                            placeholder="Enter email address"
                            keyboardType="email-address"
                        />
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.inputLabel}>Address</Text>
                        <TextInput
                            style={[styles.input, styles.textArea]}
                            value={newVendor.address}
                            onChangeText={(text) => setNewVendor(prev => ({ ...prev, address: text }))}
                            placeholder="Enter address"
                            multiline
                            numberOfLines={3}
                        />
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.inputLabel}>Hourly Rate (PKR)</Text>
                        <TextInput
                            style={styles.input}
                            value={newVendor.hourlyRate}
                            onChangeText={(text) => setNewVendor(prev => ({ ...prev, hourlyRate: text }))}
                            placeholder="Enter hourly rate"
                            keyboardType="numeric"
                        />
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.inputLabel}>Description</Text>
                        <TextInput
                            style={[styles.input, styles.textArea]}
                            value={newVendor.description}
                            onChangeText={(text) => setNewVendor(prev => ({ ...prev, description: text }))}
                            placeholder="Enter description"
                            multiline
                            numberOfLines={4}
                        />
                    </View>
                </ScrollView>
            </View>
        </Modal>
    );

    const renderVendorDetailsModal = () => (
        <Modal
            visible={vendorDetailsModalVisible}
            animationType="slide"
            presentationStyle="pageSheet"
        >
            <View style={styles.modalContainer}>
                <View style={styles.modalHeader}>
                    <TouchableOpacity
                        onPress={() => setVendorDetailsModalVisible(false)}
                        style={styles.closeButton}
                    >
                        <Ionicons name="close" size={24} color={COLORS.dark} />
                    </TouchableOpacity>
                    <Text style={styles.modalTitle}>Vendor Details</Text>
                    <TouchableOpacity
                        onPress={() => Alert.alert('Coming Soon', 'Edit vendor feature')}
                        style={styles.editButton}
                    >
                        <Ionicons name="pencil" size={20} color={COLORS.primary} />
                    </TouchableOpacity>
                </View>

                <ScrollView style={styles.modalContent}>
                    {selectedVendor && (
                        <>
                            <View style={styles.vendorProfile}>
                                <View style={styles.vendorIcon}>
                                    <Ionicons name={getCategoryIcon(selectedVendor.category)} size={32} color={COLORS.primary} />
                                </View>
                                <Text style={styles.vendorName}>{selectedVendor.name}</Text>
                                <Text style={styles.vendorCategory}>{selectedVendor.category}</Text>
                                <View style={styles.ratingContainer}>
                                    {getRatingStars(selectedVendor.rating)}
                                    <Text style={styles.ratingText}>({selectedVendor.rating || 0})</Text>
                                </View>
                            </View>

                            <View style={styles.contactSection}>
                                <Text style={styles.sectionTitle}>Contact Information</Text>
                                <View style={styles.contactItem}>
                                    <Ionicons name="call" size={20} color={COLORS.primary} />
                                    <Text style={styles.contactDetail}>{selectedVendor.phone || 'No phone'}</Text>
                                </View>
                                <View style={styles.contactItem}>
                                    <Ionicons name="mail" size={20} color={COLORS.primary} />
                                    <Text style={styles.contactDetail}>{selectedVendor.email || 'No email'}</Text>
                                </View>
                                <View style={styles.contactItem}>
                                    <Ionicons name="location" size={20} color={COLORS.primary} />
                                    <Text style={styles.contactDetail}>{selectedVendor.address || 'No address'}</Text>
                                </View>
                            </View>

                            <View style={styles.statsSection}>
                                <Text style={styles.sectionTitle}>Statistics</Text>
                                <View style={styles.statsGrid}>
                                    <View style={styles.statCard}>
                                        <Text style={styles.statValue}>{selectedVendor.completed_jobs || 0}</Text>
                                        <Text style={styles.statLabel}>Jobs Completed</Text>
                                    </View>
                                    <View style={styles.statCard}>
                                        <Text style={styles.statValue}>₨{selectedVendor.hourly_rate || 0}</Text>
                                        <Text style={styles.statLabel}>Hourly Rate</Text>
                                    </View>
                                    <View style={styles.statCard}>
                                        <Text style={styles.statValue}>{selectedVendor.response_time || 'N/A'}</Text>
                                        <Text style={styles.statLabel}>Response Time</Text>
                                    </View>
                                    <View style={styles.statCard}>
                                        <Text style={[styles.statValue, { color: selectedVendor.available ? COLORS.success : COLORS.error }]}>
                                            {selectedVendor.available ? 'Available' : 'Busy'}
                                        </Text>
                                        <Text style={styles.statLabel}>Status</Text>
                                    </View>
                                </View>
                            </View>

                            <View style={styles.actionButtons}>
                                <TouchableOpacity style={[styles.actionButton, { backgroundColor: COLORS.primary }]}>
                                    <Ionicons name="call" size={20} color={COLORS.white} />
                                    <Text style={styles.actionButtonText}>Call</Text>
                                </TouchableOpacity>
                                <TouchableOpacity style={[styles.actionButton, { backgroundColor: COLORS.success }]}>
                                    <Ionicons name="mail" size={20} color={COLORS.white} />
                                    <Text style={styles.actionButtonText}>Email</Text>
                                </TouchableOpacity>
                                <TouchableOpacity style={[styles.actionButton, { backgroundColor: COLORS.warning }]}>
                                    <Ionicons name="hammer" size={20} color={COLORS.white} />
                                    <Text style={styles.actionButtonText}>Assign Job</Text>
                                </TouchableOpacity>
                            </View>
                        </>
                    )}
                </ScrollView>
            </View>
        </Modal>
    );

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity
                    onPress={() => navigation.goBack()}
                    style={styles.backButton}
                >
                    <Ionicons name="arrow-back" size={24} color={COLORS.white} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Vendor Management</Text>
                <TouchableOpacity
                    onPress={() => setAddVendorModalVisible(true)}
                    style={styles.addButton}
                >
                    <Ionicons name="add" size={24} color={COLORS.white} />
                </TouchableOpacity>
            </View>

            <View style={styles.categoriesContainer}>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    {serviceCategories.map(category => (
                        <TouchableOpacity
                            key={category.id}
                            style={[styles.categoryButton, selectedCategory === category.id && styles.activeCategoryButton]}
                            onPress={() => setSelectedCategory(category.id)}
                        >
                            <Ionicons 
                                name={category.icon} 
                                size={20} 
                                color={selectedCategory === category.id ? COLORS.white : COLORS.primary} 
                            />
                            <Text style={[styles.categoryButtonText, selectedCategory === category.id && styles.activeCategoryButtonText]}>
                                {category.name}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            </View>

            <View style={styles.searchContainer}>
                <Ionicons name="search" size={20} color={COLORS.gray} style={styles.searchIcon} />
                <TextInput
                    style={styles.searchInput}
                    placeholder="Search vendors..."
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                    placeholderTextColor={COLORS.gray}
                />
            </View>

            <ScrollView
                style={styles.content}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
                }
            >
                {getFilteredVendors().map(renderVendorCard)}
                
                {getFilteredVendors().length === 0 && (
                    <View style={styles.emptyState}>
                        <Ionicons name="people-outline" size={64} color={COLORS.gray} />
                        <Text style={styles.emptyTitle}>No Vendors Found</Text>
                        <Text style={styles.emptyDescription}>
                            No vendors match your current filters. Try adjusting your search or add a new vendor.
                        </Text>
                    </View>
                )}
            </ScrollView>

            {renderAddVendorModal()}
            {renderVendorDetailsModal()}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    header: {
        backgroundColor: COLORS.primary,
        paddingTop: 50,
        paddingBottom: 20,
        paddingHorizontal: 20,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    backButton: {
        padding: 8,
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: COLORS.white,
        flex: 1,
        textAlign: 'center',
    },
    addButton: {
        padding: 8,
        backgroundColor: 'rgba(255,255,255,0.2)',
        borderRadius: 20,
    },
    categoriesContainer: {
        paddingVertical: 15,
        paddingHorizontal: 20,
        backgroundColor: COLORS.white,
    },
    categoryButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 15,
        paddingVertical: 8,
        borderRadius: 20,
        backgroundColor: COLORS.lightGray,
        marginRight: 10,
    },
    activeCategoryButton: {
        backgroundColor: COLORS.primary,
    },
    categoryButtonText: {
        color: COLORS.dark,
        fontWeight: '500',
        marginLeft: 5,
    },
    activeCategoryButtonText: {
        color: COLORS.white,
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.white,
        marginHorizontal: 20,
        marginBottom: 20,
        paddingHorizontal: 15,
        borderRadius: 25,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    searchIcon: {
        marginRight: 10,
    },
    searchInput: {
        flex: 1,
        paddingVertical: 12,
        fontSize: 16,
        color: COLORS.dark,
    },
    content: {
        flex: 1,
        paddingHorizontal: 20,
    },
    vendorCard: {
        backgroundColor: COLORS.white,
        borderRadius: 12,
        padding: 15,
        marginBottom: 15,
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    vendorHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 15,
    },
    vendorIcon: {
        width: 50,
        height: 50,
        backgroundColor: `${COLORS.primary}15`,
        borderRadius: 25,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 15,
    },
    vendorInfo: {
        flex: 1,
    },
    vendorName: {
        fontSize: 16,
        fontWeight: 'bold',
        color: COLORS.dark,
        marginBottom: 5,
    },
    vendorCategory: {
        fontSize: 14,
        color: COLORS.gray,
        marginBottom: 5,
        textTransform: 'capitalize',
    },
    ratingContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    ratingText: {
        fontSize: 12,
        color: COLORS.gray,
        marginLeft: 5,
    },
    vendorPrice: {
        alignItems: 'flex-end',
    },
    priceText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: COLORS.primary,
    },
    priceLabel: {
        fontSize: 12,
        color: COLORS.gray,
    },
    vendorDetails: {
        marginBottom: 15,
    },
    contactInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 5,
    },
    contactText: {
        fontSize: 14,
        color: COLORS.dark,
        marginLeft: 8,
    },
    vendorStats: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingTop: 15,
        borderTopWidth: 1,
        borderTopColor: COLORS.lightGray,
    },
    statItem: {
        alignItems: 'center',
        flex: 1,
    },
    statNumber: {
        fontSize: 16,
        fontWeight: 'bold',
        color: COLORS.dark,
    },
    statLabel: {
        fontSize: 12,
        color: COLORS.gray,
        marginTop: 2,
    },
    emptyState: {
        alignItems: 'center',
        paddingVertical: 50,
    },
    emptyTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: COLORS.dark,
        marginTop: 15,
        marginBottom: 5,
    },
    emptyDescription: {
        fontSize: 14,
        color: COLORS.gray,
        textAlign: 'center',
        paddingHorizontal: 20,
    },
    modalContainer: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    modalHeader: {
        backgroundColor: COLORS.white,
        paddingTop: 50,
        paddingBottom: 20,
        paddingHorizontal: 20,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderBottomWidth: 1,
        borderBottomColor: COLORS.lightGray,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: COLORS.dark,
        flex: 1,
        textAlign: 'center',
    },
    closeButton: {
        padding: 8,
    },
    saveButton: {
        paddingHorizontal: 15,
        paddingVertical: 8,
        backgroundColor: COLORS.primary,
        borderRadius: 20,
    },
    saveButtonText: {
        color: COLORS.white,
        fontWeight: 'bold',
    },
    editButton: {
        padding: 8,
    },
    modalContent: {
        flex: 1,
        padding: 20,
    },
    inputGroup: {
        marginBottom: 20,
    },
    inputLabel: {
        fontSize: 14,
        color: COLORS.dark,
        marginBottom: 8,
        fontWeight: '500',
    },
    input: {
        borderWidth: 1,
        borderColor: COLORS.lightGray,
        borderRadius: 10,
        paddingHorizontal: 15,
        paddingVertical: 12,
        fontSize: 16,
        color: COLORS.dark,
        backgroundColor: COLORS.white,
    },
    textArea: {
        height: 100,
        textAlignVertical: 'top',
    },
    categoryGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
    },
    categoryItem: {
        width: '48%',
        flexDirection: 'row',
        alignItems: 'center',
        padding: 10,
        borderRadius: 8,
        backgroundColor: COLORS.lightGray,
        marginBottom: 10,
    },
    selectedCategory: {
        backgroundColor: COLORS.primary,
    },
    categoryText: {
        fontSize: 12,
        color: COLORS.dark,
        marginLeft: 8,
    },
    selectedCategoryText: {
        color: COLORS.white,
    },
    vendorProfile: {
        alignItems: 'center',
        marginBottom: 30,
    },
    contactSection: {
        marginBottom: 30,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: COLORS.dark,
        marginBottom: 15,
    },
    contactItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10,
    },
    contactDetail: {
        fontSize: 16,
        color: COLORS.dark,
        marginLeft: 10,
    },
    statsSection: {
        marginBottom: 30,
    },
    statsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
    },
    statCard: {
        width: '48%',
        backgroundColor: COLORS.white,
        padding: 15,
        borderRadius: 10,
        alignItems: 'center',
        marginBottom: 10,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    statValue: {
        fontSize: 18,
        fontWeight: 'bold',
        color: COLORS.dark,
        marginBottom: 5,
    },
    actionButtons: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    actionButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 15,
        borderRadius: 10,
        marginHorizontal: 5,
    },
    actionButtonText: {
        color: COLORS.white,
        fontSize: 16,
        fontWeight: 'bold',
        marginLeft: 8,
    },
});

export default VendorManagementScreen;
