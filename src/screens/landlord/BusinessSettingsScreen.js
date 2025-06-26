import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    TextInput,
    Alert,
    Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SIZES } from '../../utils/constants';
import { fetchFromBackend } from '../../utils/networkUtils';

const BusinessSettingsScreen = ({ navigation }) => {
    const [businessData, setBusinessData] = useState({
        businessName: '',
        businessType: '',
        contactPerson: '',
        email: '',
        phone: '',
        address: '',
        city: '',
        province: '',
        postalCode: '',
        ntnNumber: '',
        bankName: '',
        accountNumber: '',
        accountTitle: '',
        description: '',
        logo: null,
    });
    const [loading, setLoading] = useState(false);
    const [verificationStatus, setVerificationStatus] = useState('pending');

    const businessTypes = [
        'Individual Landlord',
        'Property Management Company',
        'Real Estate Agency',
        'Hotel/Hospitality',
        'Vacation Rental',
        'Student Housing',
        'Corporate Housing',
        'Other',
    ];

    const pakistaniProvinces = [
        'Punjab',
        'Sindh',
        'Khyber Pakhtunkhwa',
        'Balochistan',
        'Islamabad Capital Territory',
        'Azad Kashmir',
        'Gilgit-Baltistan',
    ];

    useEffect(() => {
        loadBusinessData();
    }, []);

    const loadBusinessData = async () => {
        setLoading(true);
        try {
            const response = await fetchFromBackend('/api/landlord/business');
            if (response?.success && response.data) {
                setBusinessData(response.data);
                setVerificationStatus(response.data.verificationStatus || 'pending');
            }
        } catch (error) {
            console.error('Error loading business data:', error);
        } finally {
            setLoading(false);
        }
    };

    const saveBusinessData = async () => {
        if (!businessData.businessName.trim()) {
            Alert.alert('Error', 'Business name is required');
            return;
        }

        if (!businessData.contactPerson.trim()) {
            Alert.alert('Error', 'Contact person name is required');
            return;
        }

        if (!businessData.email.trim()) {
            Alert.alert('Error', 'Email is required');
            return;
        }

        if (!businessData.phone.trim()) {
            Alert.alert('Error', 'Phone number is required');
            return;
        }

        setLoading(true);
        try {
            const response = await fetchFromBackend('/api/landlord/business', {
                method: 'PUT',
                body: JSON.stringify(businessData)
            });

            if (response?.success) {
                Alert.alert('Success', 'Business settings updated successfully');
                if (response.data?.verificationStatus) {
                    setVerificationStatus(response.data.verificationStatus);
                }
            }
        } catch (error) {
            console.error('Error saving business data:', error);
            Alert.alert('Error', 'Failed to save business settings');
        } finally {
            setLoading(false);
        }
    };

    const uploadLogo = async () => {
        Alert.alert('Coming Soon', 'Logo upload feature will be available soon');
    };

    const uploadDocument = async (documentType) => {
        Alert.alert('Coming Soon', `${documentType} upload feature will be available soon`);
    };

    const getVerificationStatusColor = () => {
        switch (verificationStatus) {
            case 'verified':
                return COLORS.success;
            case 'rejected':
                return COLORS.error;
            case 'pending':
                return COLORS.warning;
            default:
                return COLORS.gray;
        }
    };

    const getVerificationStatusText = () => {
        switch (verificationStatus) {
            case 'verified':
                return 'Verified';
            case 'rejected':
                return 'Rejected';
            case 'pending':
                return 'Pending Verification';
            default:
                return 'Not Submitted';
        }
    };

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity
                    onPress={() => navigation.goBack()}
                    style={styles.backButton}
                >
                    <Ionicons name="arrow-back" size={24} color={COLORS.white} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Business Settings</Text>
                <TouchableOpacity
                    onPress={saveBusinessData}
                    style={styles.saveButton}
                    disabled={loading}
                >
                    {loading ? (
                        <Ionicons name="hourglass-outline" size={24} color={COLORS.white} />
                    ) : (
                        <Ionicons name="checkmark" size={24} color={COLORS.white} />
                    )}
                </TouchableOpacity>
            </View>

            <ScrollView style={styles.content}>
                {/* Verification Status */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Verification Status</Text>
                    <View style={styles.verificationCard}>
                        <View style={styles.verificationHeader}>
                            <Ionicons 
                                name={verificationStatus === 'verified' ? 'checkmark-circle' : 'time-outline'} 
                                size={24} 
                                color={getVerificationStatusColor()} 
                            />
                            <Text style={[styles.verificationStatus, { color: getVerificationStatusColor() }]}>
                                {getVerificationStatusText()}
                            </Text>
                        </View>
                        <Text style={styles.verificationDescription}>
                            {verificationStatus === 'verified' 
                                ? 'Your business is verified and can receive payments'
                                : verificationStatus === 'rejected'
                                ? 'Your verification was rejected. Please update your information and resubmit.'
                                : 'Complete your business information to get verified'
                            }
                        </Text>
                    </View>
                </View>

                {/* Business Information */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Business Information</Text>
                    
                    <View style={styles.inputGroup}>
                        <Text style={styles.inputLabel}>Business Name *</Text>
                        <TextInput
                            style={styles.input}
                            value={businessData.businessName}
                            onChangeText={(text) => setBusinessData(prev => ({ ...prev, businessName: text }))}
                            placeholder="Enter business name"
                        />
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.inputLabel}>Business Type</Text>
                        <View style={styles.typeGrid}>
                            {businessTypes.map(type => (
                                <TouchableOpacity
                                    key={type}
                                    style={[styles.typeButton, businessData.businessType === type && styles.selectedType]}
                                    onPress={() => setBusinessData(prev => ({ ...prev, businessType: type }))}
                                >
                                    <Text style={[styles.typeText, businessData.businessType === type && styles.selectedTypeText]}>
                                        {type}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.inputLabel}>Business Logo</Text>
                        <TouchableOpacity style={styles.logoUpload} onPress={uploadLogo}>
                            {businessData.logo ? (
                                <Image source={{ uri: businessData.logo }} style={styles.logoImage} />
                            ) : (
                                <View style={styles.logoPlaceholder}>
                                    <Ionicons name="camera-outline" size={32} color={COLORS.gray} />
                                    <Text style={styles.logoText}>Upload Logo</Text>
                                </View>
                            )}
                        </TouchableOpacity>
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.inputLabel}>Business Description</Text>
                        <TextInput
                            style={[styles.input, styles.textArea]}
                            value={businessData.description}
                            onChangeText={(text) => setBusinessData(prev => ({ ...prev, description: text }))}
                            placeholder="Describe your business"
                            multiline
                            numberOfLines={4}
                        />
                    </View>
                </View>

                {/* Contact Information */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Contact Information</Text>
                    
                    <View style={styles.inputGroup}>
                        <Text style={styles.inputLabel}>Contact Person *</Text>
                        <TextInput
                            style={styles.input}
                            value={businessData.contactPerson}
                            onChangeText={(text) => setBusinessData(prev => ({ ...prev, contactPerson: text }))}
                            placeholder="Enter contact person name"
                        />
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.inputLabel}>Email *</Text>
                        <TextInput
                            style={styles.input}
                            value={businessData.email}
                            onChangeText={(text) => setBusinessData(prev => ({ ...prev, email: text }))}
                            placeholder="Enter email address"
                            keyboardType="email-address"
                        />
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.inputLabel}>Phone Number *</Text>
                        <TextInput
                            style={styles.input}
                            value={businessData.phone}
                            onChangeText={(text) => setBusinessData(prev => ({ ...prev, phone: text }))}
                            placeholder="Enter phone number"
                            keyboardType="phone-pad"
                        />
                    </View>
                </View>

                {/* Address Information */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Address Information</Text>
                    
                    <View style={styles.inputGroup}>
                        <Text style={styles.inputLabel}>Street Address</Text>
                        <TextInput
                            style={styles.input}
                            value={businessData.address}
                            onChangeText={(text) => setBusinessData(prev => ({ ...prev, address: text }))}
                            placeholder="Enter street address"
                        />
                    </View>

                    <View style={styles.inputRow}>
                        <View style={styles.inputHalf}>
                            <Text style={styles.inputLabel}>City</Text>
                            <TextInput
                                style={styles.input}
                                value={businessData.city}
                                onChangeText={(text) => setBusinessData(prev => ({ ...prev, city: text }))}
                                placeholder="Enter city"
                            />
                        </View>
                        <View style={styles.inputHalf}>
                            <Text style={styles.inputLabel}>Postal Code</Text>
                            <TextInput
                                style={styles.input}
                                value={businessData.postalCode}
                                onChangeText={(text) => setBusinessData(prev => ({ ...prev, postalCode: text }))}
                                placeholder="Enter postal code"
                            />
                        </View>
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.inputLabel}>Province</Text>
                        <View style={styles.provinceGrid}>
                            {pakistaniProvinces.map(province => (
                                <TouchableOpacity
                                    key={province}
                                    style={[styles.provinceButton, businessData.province === province && styles.selectedProvince]}
                                    onPress={() => setBusinessData(prev => ({ ...prev, province }))}
                                >
                                    <Text style={[styles.provinceText, businessData.province === province && styles.selectedProvinceText]}>
                                        {province}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>
                </View>

                {/* Tax Information */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Tax Information</Text>
                    
                    <View style={styles.inputGroup}>
                        <Text style={styles.inputLabel}>NTN Number</Text>
                        <TextInput
                            style={styles.input}
                            value={businessData.ntnNumber}
                            onChangeText={(text) => setBusinessData(prev => ({ ...prev, ntnNumber: text }))}
                            placeholder="Enter NTN number"
                        />
                    </View>

                    <TouchableOpacity 
                        style={styles.documentButton}
                        onPress={() => uploadDocument('NTN Certificate')}
                    >
                        <Ionicons name="document-text-outline" size={24} color={COLORS.primary} />
                        <Text style={styles.documentButtonText}>Upload NTN Certificate</Text>
                        <Ionicons name="chevron-forward" size={18} color={COLORS.gray} />
                    </TouchableOpacity>
                </View>

                {/* Banking Information */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Banking Information</Text>
                    
                    <View style={styles.inputGroup}>
                        <Text style={styles.inputLabel}>Bank Name</Text>
                        <TextInput
                            style={styles.input}
                            value={businessData.bankName}
                            onChangeText={(text) => setBusinessData(prev => ({ ...prev, bankName: text }))}
                            placeholder="Enter bank name"
                        />
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.inputLabel}>Account Number</Text>
                        <TextInput
                            style={styles.input}
                            value={businessData.accountNumber}
                            onChangeText={(text) => setBusinessData(prev => ({ ...prev, accountNumber: text }))}
                            placeholder="Enter account number"
                            keyboardType="numeric"
                        />
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.inputLabel}>Account Title</Text>
                        <TextInput
                            style={styles.input}
                            value={businessData.accountTitle}
                            onChangeText={(text) => setBusinessData(prev => ({ ...prev, accountTitle: text }))}
                            placeholder="Enter account title"
                        />
                    </View>

                    <TouchableOpacity 
                        style={styles.documentButton}
                        onPress={() => uploadDocument('Bank Statement')}
                    >
                        <Ionicons name="card-outline" size={24} color={COLORS.primary} />
                        <Text style={styles.documentButtonText}>Upload Bank Statement</Text>
                        <Ionicons name="chevron-forward" size={18} color={COLORS.gray} />
                    </TouchableOpacity>
                </View>

                {/* Document Upload */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Legal Documents</Text>
                    
                    <TouchableOpacity 
                        style={styles.documentButton}
                        onPress={() => uploadDocument('Business Registration')}
                    >
                        <Ionicons name="business-outline" size={24} color={COLORS.primary} />
                        <Text style={styles.documentButtonText}>Upload Business Registration</Text>
                        <Ionicons name="chevron-forward" size={18} color={COLORS.gray} />
                    </TouchableOpacity>

                    <TouchableOpacity 
                        style={styles.documentButton}
                        onPress={() => uploadDocument('CNIC/Passport')}
                    >
                        <Ionicons name="person-outline" size={24} color={COLORS.primary} />
                        <Text style={styles.documentButtonText}>Upload CNIC/Passport</Text>
                        <Ionicons name="chevron-forward" size={18} color={COLORS.gray} />
                    </TouchableOpacity>
                </View>

                <View style={styles.bottomPadding} />
            </ScrollView>
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
    saveButton: {
        padding: 8,
        backgroundColor: 'rgba(255,255,255,0.2)',
        borderRadius: 20,
    },
    content: {
        flex: 1,
        padding: 20,
    },
    section: {
        marginBottom: 30,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: COLORS.dark,
        marginBottom: 15,
    },
    verificationCard: {
        backgroundColor: COLORS.white,
        padding: 15,
        borderRadius: 12,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    verificationHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10,
    },
    verificationStatus: {
        fontSize: 16,
        fontWeight: 'bold',
        marginLeft: 10,
    },
    verificationDescription: {
        fontSize: 14,
        color: COLORS.gray,
        lineHeight: 20,
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
    inputRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 20,
    },
    inputHalf: {
        width: '48%',
    },
    typeGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
    },
    typeButton: {
        width: '48%',
        padding: 12,
        borderRadius: 8,
        backgroundColor: COLORS.lightGray,
        marginBottom: 10,
        alignItems: 'center',
    },
    selectedType: {
        backgroundColor: COLORS.primary,
    },
    typeText: {
        fontSize: 12,
        color: COLORS.dark,
        textAlign: 'center',
    },
    selectedTypeText: {
        color: COLORS.white,
    },
    logoUpload: {
        height: 120,
        borderWidth: 2,
        borderColor: COLORS.lightGray,
        borderStyle: 'dashed',
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: COLORS.white,
    },
    logoImage: {
        width: 100,
        height: 100,
        borderRadius: 10,
    },
    logoPlaceholder: {
        alignItems: 'center',
    },
    logoText: {
        fontSize: 14,
        color: COLORS.gray,
        marginTop: 8,
    },
    provinceGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
    },
    provinceButton: {
        width: '48%',
        padding: 10,
        borderRadius: 8,
        backgroundColor: COLORS.lightGray,
        marginBottom: 10,
        alignItems: 'center',
    },
    selectedProvince: {
        backgroundColor: COLORS.primary,
    },
    provinceText: {
        fontSize: 12,
        color: COLORS.dark,
        textAlign: 'center',
    },
    selectedProvinceText: {
        color: COLORS.white,
    },
    documentButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.white,
        padding: 15,
        borderRadius: 10,
        marginBottom: 10,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    documentButtonText: {
        flex: 1,
        fontSize: 16,
        color: COLORS.dark,
        marginLeft: 15,
    },
    bottomPadding: {
        height: 50,
    },
});

export default BusinessSettingsScreen;
