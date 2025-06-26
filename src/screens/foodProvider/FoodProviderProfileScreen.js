import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    ScrollView,
    StyleSheet,
    TouchableOpacity,
    TextInput,
    Alert,
    Image,
    Switch,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as ImagePicker from 'expo-image-picker';
import authService from '../../services/authService';
import { fetchFromBackend } from '../../utils/networkUtils';

const FoodProviderProfileScreen = ({ navigation }) => {
    const [user, setUser] = useState(null);
    const [profile, setProfile] = useState({
        name: '',
        email: '',
        phone: '',
        businessName: '',
        businessType: '',
        cuisineTypes: [],
        description: '',
        address: '',
        city: '',
        operatingHours: {
            monday: { open: '09:00', close: '22:00', closed: false },
            tuesday: { open: '09:00', close: '22:00', closed: false },
            wednesday: { open: '09:00', close: '22:00', closed: false },
            thursday: { open: '09:00', close: '22:00', closed: false },
            friday: { open: '09:00', close: '22:00', closed: false },
            saturday: { open: '09:00', close: '22:00', closed: false },
            sunday: { open: '09:00', close: '22:00', closed: false },
        },
        bankAccount: '',
        bankName: '',
        profileImage: null,
        businessLogo: null,
    });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [notificationSettings, setNotificationSettings] = useState({
        orderNotifications: true,
        marketingEmails: false,
        smsNotifications: true,
        reviewNotifications: true,
    });

    const cuisineOptions = [
        'Pakistani', 'Chinese', 'Indian', 'Italian', 'Fast Food',
        'Arabic', 'Continental', 'Turkish', 'BBQ', 'Desserts',
        'Beverages', 'Bakery', 'Traditional', 'Fusion'
    ];

    useEffect(() => {
        loadProfile();
    }, []);    const loadProfile = async () => {
        try {
            setLoading(true);
            const currentUser = await authService.getCurrentUser();
            
            if (!currentUser) {
                console.log('❌ No user found, redirecting to login');
                navigation.reset({
                    index: 0,
                    routes: [{ name: 'Login' }],
                });
                return;
            }
            
            setUser(currentUser);

            // Fetch food provider profile data
            const profileRes = await fetchFromBackend(`/food-provider/profile/${currentUser.id}`);
            
            if (profileRes.success) {
                setProfile({
                    name: profileRes.data.name || currentUser.name || '',
                    email: profileRes.data.email || currentUser.email || '',
                    phone: profileRes.data.phone || '',
                    businessName: profileRes.data.businessName || '',
                    businessType: profileRes.data.businessType || '',
                    cuisineTypes: profileRes.data.cuisineTypes || [],
                    description: profileRes.data.description || '',
                    address: profileRes.data.address || '',
                    city: profileRes.data.city || '',
                    operatingHours: profileRes.data.operatingHours || profile.operatingHours,
                    bankAccount: profileRes.data.bankAccount || '',
                    bankName: profileRes.data.bankName || '',
                    profileImage: profileRes.data.profileImage || null,
                    businessLogo: profileRes.data.businessLogo || null,
                });
                setNotificationSettings(profileRes.data.notificationSettings || notificationSettings);
            }

            console.log('✅ Food provider profile loaded successfully');
        } catch (error) {
            console.error('❌ Error loading profile:', error);
            Alert.alert('Error', 'Failed to load profile data');
        } finally {
            setLoading(false);
        }
    };

    const handleSaveProfile = async () => {
        try {
            setSaving(true);
            
            const profileData = {
                ...profile,
                notificationSettings
            };

            const response = await fetchFromBackend(`/food-provider/profile/${user.id}`, {
                method: 'PUT',
                data: profileData
            });

            if (response.success) {
                Alert.alert('Success', 'Profile updated successfully');
                setEditMode(false);
                await loadProfile();
            } else {
                Alert.alert('Error', 'Failed to update profile');
            }
        } catch (error) {
            console.error('❌ Error saving profile:', error);
            Alert.alert('Error', 'Failed to update profile');
        } finally {
            setSaving(false);
        }
    };

    const handleImagePicker = async (type) => {
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.8,
        });

        if (!result.canceled) {
            if (type === 'profile') {
                setProfile({ ...profile, profileImage: result.assets[0].uri });
            } else {
                setProfile({ ...profile, businessLogo: result.assets[0].uri });
            }
        }
    };

    const toggleCuisineType = (cuisine) => {
        const updatedCuisines = profile.cuisineTypes.includes(cuisine)
            ? profile.cuisineTypes.filter(c => c !== cuisine)
            : [...profile.cuisineTypes, cuisine];
        
        setProfile({ ...profile, cuisineTypes: updatedCuisines });
    };

    const updateOperatingHours = (day, field, value) => {
        setProfile({
            ...profile,
            operatingHours: {
                ...profile.operatingHours,
                [day]: {
                    ...profile.operatingHours[day],
                    [field]: value
                }
            }
        });
    };

    if (loading) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.loadingContainer}>
                    <Text style={styles.loadingText}>Loading Profile...</Text>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            {/* Header */}
            <LinearGradient
                colors={['#FF6B35', '#FF8E53']}
                style={styles.header}
            >
                <View style={styles.headerContent}>
                    <TouchableOpacity
                        onPress={() => navigation.goBack()}
                        style={styles.backButton}
                    >
                        <Icon name="arrow-back" size={24} color="#fff" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Profile</Text>
                    <TouchableOpacity
                        onPress={() => editMode ? handleSaveProfile() : setEditMode(true)}
                        style={styles.editButton}
                    >
                        <Icon 
                            name={editMode ? "save" : "edit"} 
                            size={24} 
                            color="#fff" 
                        />
                    </TouchableOpacity>
                </View>
            </LinearGradient>

            <ScrollView style={styles.content}>
                {/* Profile Images Section */}
                <View style={styles.profileSection}>
                    <View style={styles.imagesRow}>
                        <View style={styles.imageContainer}>
                            <Text style={styles.imageLabel}>Profile Photo</Text>
                            <TouchableOpacity 
                                onPress={editMode ? () => handleImagePicker('profile') : null}
                                style={styles.profileImageContainer}
                            >
                                {profile.profileImage ? (
                                    <Image source={{ uri: profile.profileImage }} style={styles.profileImage} />
                                ) : (
                                    <View style={styles.defaultProfileImage}>
                                        <Icon name="person" size={40} color="#fff" />
                                    </View>
                                )}
                                {editMode && (
                                    <View style={styles.editImageOverlay}>
                                        <Icon name="camera-alt" size={16} color="#fff" />
                                    </View>
                                )}
                            </TouchableOpacity>
                        </View>

                        <View style={styles.imageContainer}>
                            <Text style={styles.imageLabel}>Business Logo</Text>
                            <TouchableOpacity 
                                onPress={editMode ? () => handleImagePicker('logo') : null}
                                style={styles.profileImageContainer}
                            >
                                {profile.businessLogo ? (
                                    <Image source={{ uri: profile.businessLogo }} style={styles.profileImage} />
                                ) : (
                                    <View style={styles.defaultProfileImage}>
                                        <Icon name="business" size={40} color="#fff" />
                                    </View>
                                )}
                                {editMode && (
                                    <View style={styles.editImageOverlay}>
                                        <Icon name="camera-alt" size={16} color="#fff" />
                                    </View>
                                )}
                            </TouchableOpacity>
                        </View>
                    </View>                    <Text style={styles.profileName}>{profile?.businessName || profile?.name || 'Food Provider'}</Text>
                    <Text style={styles.profileEmail}>{profile?.email || ''}</Text>
                </View>

                {/* Basic Information */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Basic Information</Text>
                    
                    <View style={styles.inputGroup}>
                        <Text style={styles.inputLabel}>Full Name</Text>
                        <TextInput
                            style={[styles.textInput, !editMode && styles.disabledInput]}
                            value={profile?.name || ''}
                            onChangeText={(text) => setProfile({ ...profile, name: text })}
                            editable={editMode}
                            placeholder="Enter your full name"
                        />
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.inputLabel}>Email</Text>
                        <TextInput
                            style={[styles.textInput, styles.disabledInput]}
                            value={profile.email}
                            editable={false}
                            placeholder="Email address"
                        />
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.inputLabel}>Phone Number</Text>
                        <TextInput
                            style={[styles.textInput, !editMode && styles.disabledInput]}
                            value={profile.phone}
                            onChangeText={(text) => setProfile({ ...profile, phone: text })}
                            editable={editMode}
                            placeholder="+92 300 1234567"
                            keyboardType="phone-pad"
                        />
                    </View>
                </View>

                {/* Business Information */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Business Information</Text>
                    
                    <View style={styles.inputGroup}>
                        <Text style={styles.inputLabel}>Business Name</Text>
                        <TextInput
                            style={[styles.textInput, !editMode && styles.disabledInput]}
                            value={profile.businessName}
                            onChangeText={(text) => setProfile({ ...profile, businessName: text })}
                            editable={editMode}
                            placeholder="Your restaurant/business name"
                        />
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.inputLabel}>Business Type</Text>
                        <TextInput
                            style={[styles.textInput, !editMode && styles.disabledInput]}
                            value={profile.businessType}
                            onChangeText={(text) => setProfile({ ...profile, businessType: text })}
                            editable={editMode}
                            placeholder="e.g. Restaurant, Cafe, Cloud Kitchen"
                        />
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.inputLabel}>Business Description</Text>
                        <TextInput
                            style={[styles.textArea, !editMode && styles.disabledInput]}
                            value={profile.description}
                            onChangeText={(text) => setProfile({ ...profile, description: text })}
                            editable={editMode}
                            placeholder="Describe your business"
                            multiline
                            numberOfLines={4}
                        />
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.inputLabel}>Address</Text>
                        <TextInput
                            style={[styles.textInput, !editMode && styles.disabledInput]}
                            value={profile.address}
                            onChangeText={(text) => setProfile({ ...profile, address: text })}
                            editable={editMode}
                            placeholder="Business address"
                            multiline
                        />
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.inputLabel}>City</Text>
                        <TextInput
                            style={[styles.textInput, !editMode && styles.disabledInput]}
                            value={profile.city}
                            onChangeText={(text) => setProfile({ ...profile, city: text })}
                            editable={editMode}
                            placeholder="City name"
                        />
                    </View>
                </View>

                {/* Cuisine Types */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Cuisine Types</Text>
                    <View style={styles.cuisineGrid}>
                        {cuisineOptions.map((cuisine) => (
                            <TouchableOpacity
                                key={cuisine}
                                style={[
                                    styles.cuisineChip,
                                    profile.cuisineTypes.includes(cuisine) && styles.selectedCuisineChip,
                                    !editMode && styles.disabledChip
                                ]}
                                onPress={editMode ? () => toggleCuisineType(cuisine) : null}
                                disabled={!editMode}
                            >
                                <Text style={[
                                    styles.cuisineChipText,
                                    profile.cuisineTypes.includes(cuisine) && styles.selectedCuisineChipText
                                ]}>
                                    {cuisine}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>

                {/* Operating Hours */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Operating Hours</Text>
                    {Object.keys(profile.operatingHours).map((day) => (
                        <View key={day} style={styles.dayRow}>
                            <Text style={styles.dayLabel}>{day.charAt(0).toUpperCase() + day.slice(1)}</Text>
                            <View style={styles.hoursContainer}>
                                <Switch
                                    value={!profile.operatingHours[day].closed}
                                    onValueChange={(value) => updateOperatingHours(day, 'closed', !value)}
                                    disabled={!editMode}
                                    trackColor={{ false: '#ccc', true: '#FF6B35' }}
                                    thumbColor="#fff"
                                />
                                {!profile.operatingHours[day].closed && (
                                    <View style={styles.timeInputs}>
                                        <TextInput
                                            style={[styles.timeInput, !editMode && styles.disabledInput]}
                                            value={profile.operatingHours[day].open}
                                            onChangeText={(text) => updateOperatingHours(day, 'open', text)}
                                            editable={editMode}
                                            placeholder="09:00"
                                        />
                                        <Text style={styles.timeSeparator}>-</Text>
                                        <TextInput
                                            style={[styles.timeInput, !editMode && styles.disabledInput]}
                                            value={profile.operatingHours[day].close}
                                            onChangeText={(text) => updateOperatingHours(day, 'close', text)}
                                            editable={editMode}
                                            placeholder="22:00"
                                        />
                                    </View>
                                )}
                            </View>
                        </View>
                    ))}
                </View>

                {/* Payment Information */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Payment Information</Text>
                    
                    <View style={styles.inputGroup}>
                        <Text style={styles.inputLabel}>Bank Account Number</Text>
                        <TextInput
                            style={[styles.textInput, !editMode && styles.disabledInput]}
                            value={profile.bankAccount}
                            onChangeText={(text) => setProfile({ ...profile, bankAccount: text })}
                            editable={editMode}
                            placeholder="Account number"
                            keyboardType="numeric"
                        />
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.inputLabel}>Bank Name</Text>
                        <TextInput
                            style={[styles.textInput, !editMode && styles.disabledInput]}
                            value={profile.bankName}
                            onChangeText={(text) => setProfile({ ...profile, bankName: text })}
                            editable={editMode}
                            placeholder="e.g. HBL, UBL, Allied Bank"
                        />
                    </View>
                </View>

                {/* Notification Settings */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Notification Settings</Text>
                    
                    <View style={styles.switchRow}>
                        <Text style={styles.switchLabel}>Order Notifications</Text>
                        <Switch
                            value={notificationSettings.orderNotifications}
                            onValueChange={(value) => 
                                setNotificationSettings({
                                    ...notificationSettings,
                                    orderNotifications: value
                                })
                            }
                            trackColor={{ false: '#ccc', true: '#FF6B35' }}
                            thumbColor="#fff"
                        />
                    </View>

                    <View style={styles.switchRow}>
                        <Text style={styles.switchLabel}>Review Notifications</Text>
                        <Switch
                            value={notificationSettings.reviewNotifications}
                            onValueChange={(value) => 
                                setNotificationSettings({
                                    ...notificationSettings,
                                    reviewNotifications: value
                                })
                            }
                            trackColor={{ false: '#ccc', true: '#FF6B35' }}
                            thumbColor="#fff"
                        />
                    </View>

                    <View style={styles.switchRow}>
                        <Text style={styles.switchLabel}>SMS Notifications</Text>
                        <Switch
                            value={notificationSettings.smsNotifications}
                            onValueChange={(value) => 
                                setNotificationSettings({
                                    ...notificationSettings,
                                    smsNotifications: value
                                })
                            }
                            trackColor={{ false: '#ccc', true: '#FF6B35' }}
                            thumbColor="#fff"
                        />
                    </View>

                    <View style={styles.switchRow}>
                        <Text style={styles.switchLabel}>Marketing Emails</Text>
                        <Switch
                            value={notificationSettings.marketingEmails}
                            onValueChange={(value) => 
                                setNotificationSettings({
                                    ...notificationSettings,
                                    marketingEmails: value
                                })
                            }
                            trackColor={{ false: '#ccc', true: '#FF6B35' }}
                            thumbColor="#fff"
                        />
                    </View>
                </View>

                {editMode && (
                    <View style={styles.section}>
                        <TouchableOpacity
                            style={[styles.saveButton, saving && styles.disabledButton]}
                            onPress={handleSaveProfile}
                            disabled={saving}
                        >
                            <Text style={styles.saveButtonText}>
                                {saving ? 'Saving...' : 'Save Changes'}
                            </Text>
                        </TouchableOpacity>
                        
                        <TouchableOpacity
                            style={styles.cancelButton}
                            onPress={() => {
                                setEditMode(false);
                                loadProfile();
                            }}
                        >
                            <Text style={styles.cancelButtonText}>Cancel</Text>
                        </TouchableOpacity>
                    </View>
                )}
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        fontSize: 16,
        color: '#666',
        marginTop: 10,
    },
    header: {
        paddingHorizontal: 20,
        paddingVertical: 15,
    },
    headerContent: {
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
        color: '#fff',
        flex: 1,
        textAlign: 'center',
        marginRight: 40,
    },
    editButton: {
        padding: 8,
    },
    content: {
        flex: 1,
    },
    profileSection: {
        alignItems: 'center',
        padding: 20,
        backgroundColor: '#fff',
        marginBottom: 10,
    },
    imagesRow: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        width: '100%',
        marginBottom: 20,
    },
    imageContainer: {
        alignItems: 'center',
    },
    imageLabel: {
        fontSize: 12,
        color: '#666',
        marginBottom: 10,
    },
    profileImageContainer: {
        position: 'relative',
    },
    profileImage: {
        width: 80,
        height: 80,
        borderRadius: 40,
    },
    defaultProfileImage: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: '#FF6B35',
        justifyContent: 'center',
        alignItems: 'center',
    },
    editImageOverlay: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        backgroundColor: '#4CAF50',
        width: 24,
        height: 24,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: '#fff',
    },
    profileName: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 5,
    },
    profileEmail: {
        fontSize: 16,
        color: '#666',
    },
    section: {
        backgroundColor: '#fff',
        padding: 20,
        marginBottom: 10,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 15,
    },
    inputGroup: {
        marginBottom: 15,
    },
    inputLabel: {
        fontSize: 14,
        fontWeight: '600',
        color: '#333',
        marginBottom: 5,
    },
    textInput: {
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 8,
        padding: 12,
        fontSize: 16,
        backgroundColor: '#fff',
    },
    textArea: {
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 8,
        padding: 12,
        fontSize: 16,
        backgroundColor: '#fff',
        height: 100,
        textAlignVertical: 'top',
    },
    disabledInput: {
        backgroundColor: '#f5f5f5',
        color: '#666',
    },
    cuisineGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginTop: 10,
    },
    cuisineChip: {
        backgroundColor: '#f0f0f0',
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 20,
        margin: 4,
        borderWidth: 1,
        borderColor: '#ddd',
    },
    selectedCuisineChip: {
        backgroundColor: '#FF6B35',
        borderColor: '#FF6B35',
    },
    disabledChip: {
        opacity: 0.7,
    },
    cuisineChipText: {
        fontSize: 12,
        color: '#333',
        fontWeight: '500',
    },
    selectedCuisineChipText: {
        color: '#fff',
    },
    dayRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    dayLabel: {
        fontSize: 16,
        color: '#333',
        fontWeight: '500',
        width: 80,
    },
    hoursContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
        justifyContent: 'flex-end',
    },
    timeInputs: {
        flexDirection: 'row',
        alignItems: 'center',
        marginLeft: 15,
    },
    timeInput: {
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 6,
        padding: 8,
        fontSize: 14,
        width: 60,
        textAlign: 'center',
    },
    timeSeparator: {
        marginHorizontal: 8,
        fontSize: 16,
        color: '#666',
    },
    switchRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    switchLabel: {
        fontSize: 16,
        color: '#333',
        flex: 1,
    },
    saveButton: {
        backgroundColor: '#FF6B35',
        padding: 15,
        borderRadius: 8,
        alignItems: 'center',
        marginBottom: 10,
    },
    saveButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    cancelButton: {
        backgroundColor: '#f5f5f5',
        padding: 15,
        borderRadius: 8,
        alignItems: 'center',
    },
    cancelButtonText: {
        color: '#666',
        fontSize: 16,
        fontWeight: '600',
    },
    disabledButton: {
        opacity: 0.7,
    },
});

export default FoodProviderProfileScreen;
