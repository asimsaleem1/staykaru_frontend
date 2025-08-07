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

const StudentProfileScreen = ({ navigation }) => {
    const [user, setUser] = useState(null);
    const [profile, setProfile] = useState({
        name: '',
        email: '',
        phone: '',
        studentId: '',
        university: '',
        program: '',
        yearOfStudy: '',
        dateOfBirth: '',
        cnic: '',
        emergencyContact: {
            name: '',
            phone: '',
            relationship: ''
        },
        currentAddress: '',
        permanentAddress: '',
        city: '',
        profileImage: null,
    });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [preferences, setPreferences] = useState({
        accommodationType: '',
        priceRange: { min: 0, max: 50000 },
        preferredAreas: [],
        dietaryPreferences: [],
        smokingPreference: 'no',
        petFriendly: false,
    });
    const [notificationSettings, setNotificationSettings] = useState({
        bookingUpdates: true,
        orderUpdates: true,
        promotionalOffers: false,
        smsNotifications: true,
        emailNotifications: true,
    });

    const universities = [
        'COMSATS University Islamabad',
        'University of Punjab',
        'LUMS',
        'NUST',
        'UET Lahore',
        'IBA Karachi',
        'Quaid-i-Azam University',
        'Other'
    ];

    const accommodationTypes = [
        'Shared Room',
        'Single Room',
        'Studio Apartment',
        'Hostel',
        'PG/Mess'
    ];

    const dietaryOptions = [
        'Vegetarian',
        'Non-Vegetarian',
        'Halal Only',
        'No Beef',
        'No Pork',
        'Gluten-Free'
    ];

    useEffect(() => {
        loadProfile();
    }, []);

    const loadProfile = async () => {
        try {
            setLoading(true);
            const currentUser = await authService.getCurrentUser();
            setUser(currentUser);

            // Fetch student profile data
            const profileRes = await fetchFromBackend(`/student/profile/${currentUser.id}`);
            
            if (profileRes.success) {
                setProfile({
                    name: profileRes.data.name || currentUser.name || '',
                    email: profileRes.data.email || currentUser.email || '',
                    phone: profileRes.data.phone || '',
                    studentId: profileRes.data.studentId || '',
                    university: profileRes.data.university || '',
                    program: profileRes.data.program || '',
                    yearOfStudy: profileRes.data.yearOfStudy || '',
                    dateOfBirth: profileRes.data.dateOfBirth || '',
                    cnic: profileRes.data.cnic || '',
                    emergencyContact: profileRes.data.emergencyContact || {
                        name: '',
                        phone: '',
                        relationship: ''
                    },
                    currentAddress: profileRes.data.currentAddress || '',
                    permanentAddress: profileRes.data.permanentAddress || '',
                    city: profileRes.data.city || '',
                    profileImage: profileRes.data.profileImage || null,
                });
                setPreferences(profileRes.data.preferences || preferences);
                setNotificationSettings(profileRes.data.notificationSettings || notificationSettings);
            }

            console.log('✅ Student profile loaded successfully');
        } catch (error) {
            console.error('❌ Error loading student profile:', error);
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
                preferences,
                notificationSettings
            };

            const response = await fetchFromBackend(`/student/profile/${user.id}`, {
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
            console.error('❌ Error saving student profile:', error);
            Alert.alert('Error', 'Failed to update profile');
        } finally {
            setSaving(false);
        }
    };

    const handleImagePicker = async () => {
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.8,
        });

        if (!result.canceled) {
            setProfile({ ...profile, profileImage: result.assets[0].uri });
        }
    };

    const togglePreferredArea = (area) => {
        const updatedAreas = preferences.preferredAreas.includes(area)
            ? preferences.preferredAreas.filter(a => a !== area)
            : [...preferences.preferredAreas, area];
        
        setPreferences({ ...preferences, preferredAreas: updatedAreas });
    };

    const toggleDietaryPreference = (diet) => {
        const updatedDiets = preferences.dietaryPreferences.includes(diet)
            ? preferences.dietaryPreferences.filter(d => d !== diet)
            : [...preferences.dietaryPreferences, diet];
        
        setPreferences({ ...preferences, dietaryPreferences: updatedDiets });
    };

    const handleLogout = () => {
        Alert.alert(
            'Logout',
            'Are you sure you want to logout?',
            [
                {
                    text: 'Cancel',
                    style: 'cancel',
                },
                {
                    text: 'Logout',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await authService.logout();
                            navigation.reset({
                                index: 0,
                                routes: [{ name: 'Login' }],
                            });
                        } catch (error) {
                            console.error('Logout error:', error);
                            Alert.alert('Error', 'Failed to logout. Please try again.');
                        }
                    },
                },
            ]
        );
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
                colors={['#6B73FF', '#9575CD']}
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
                {/* Profile Image Section */}
                <View style={styles.profileSection}>
                    <TouchableOpacity 
                        onPress={editMode ? handleImagePicker : null}
                        style={styles.profileImageContainer}
                    >
                        {profile.profileImage ? (
                            <Image source={{ uri: profile.profileImage }} style={styles.profileImage} />
                        ) : (
                            <View style={styles.defaultProfileImage}>
                                <Icon name="person" size={60} color="#fff" />
                            </View>
                        )}
                        {editMode && (
                            <View style={styles.editImageOverlay}>
                                <Icon name="camera-alt" size={20} color="#fff" />
                            </View>
                        )}
                    </TouchableOpacity>
                    <Text style={styles.profileName}>{profile.name}</Text>
                    <Text style={styles.profileEmail}>{profile.email}</Text>
                    <View style={styles.studentBadge}>
                        <Text style={styles.studentText}>Student</Text>
                    </View>
                </View>

                {/* Basic Information */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Basic Information</Text>
                    
                    <View style={styles.inputGroup}>
                        <Text style={styles.inputLabel}>Full Name</Text>
                        <TextInput
                            style={[styles.textInput, !editMode && styles.disabledInput]}
                            value={profile.name}
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

                    <View style={styles.inputGroup}>
                        <Text style={styles.inputLabel}>CNIC Number</Text>
                        <TextInput
                            style={[styles.textInput, !editMode && styles.disabledInput]}
                            value={profile.cnic}
                            onChangeText={(text) => setProfile({ ...profile, cnic: text })}
                            editable={editMode}
                            placeholder="12345-1234567-1"
                            keyboardType="numeric"
                        />
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.inputLabel}>Date of Birth</Text>
                        <TextInput
                            style={[styles.textInput, !editMode && styles.disabledInput]}
                            value={profile.dateOfBirth}
                            onChangeText={(text) => setProfile({ ...profile, dateOfBirth: text })}
                            editable={editMode}
                            placeholder="DD/MM/YYYY"
                        />
                    </View>
                </View>

                {/* Academic Information */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Academic Information</Text>
                    
                    <View style={styles.inputGroup}>
                        <Text style={styles.inputLabel}>Student ID</Text>
                        <TextInput
                            style={[styles.textInput, !editMode && styles.disabledInput]}
                            value={profile.studentId}
                            onChangeText={(text) => setProfile({ ...profile, studentId: text })}
                            editable={editMode}
                            placeholder="Your student ID"
                        />
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.inputLabel}>University</Text>
                        <TextInput
                            style={[styles.textInput, !editMode && styles.disabledInput]}
                            value={profile.university}
                            onChangeText={(text) => setProfile({ ...profile, university: text })}
                            editable={editMode}
                            placeholder="Your university name"
                        />
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.inputLabel}>Program/Degree</Text>
                        <TextInput
                            style={[styles.textInput, !editMode && styles.disabledInput]}
                            value={profile.program}
                            onChangeText={(text) => setProfile({ ...profile, program: text })}
                            editable={editMode}
                            placeholder="e.g. BS Computer Science"
                        />
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.inputLabel}>Year of Study</Text>
                        <TextInput
                            style={[styles.textInput, !editMode && styles.disabledInput]}
                            value={profile.yearOfStudy}
                            onChangeText={(text) => setProfile({ ...profile, yearOfStudy: text })}
                            editable={editMode}
                            placeholder="e.g. 2nd Year"
                        />
                    </View>
                </View>

                {/* Emergency Contact */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Emergency Contact</Text>
                    
                    <View style={styles.inputGroup}>
                        <Text style={styles.inputLabel}>Contact Name</Text>
                        <TextInput
                            style={[styles.textInput, !editMode && styles.disabledInput]}
                            value={profile.emergencyContact.name}
                            onChangeText={(text) => setProfile({ 
                                ...profile, 
                                emergencyContact: { ...profile.emergencyContact, name: text }
                            })}
                            editable={editMode}
                            placeholder="Emergency contact name"
                        />
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.inputLabel}>Contact Phone</Text>
                        <TextInput
                            style={[styles.textInput, !editMode && styles.disabledInput]}
                            value={profile.emergencyContact.phone}
                            onChangeText={(text) => setProfile({ 
                                ...profile, 
                                emergencyContact: { ...profile.emergencyContact, phone: text }
                            })}
                            editable={editMode}
                            placeholder="+92 300 1234567"
                            keyboardType="phone-pad"
                        />
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.inputLabel}>Relationship</Text>
                        <TextInput
                            style={[styles.textInput, !editMode && styles.disabledInput]}
                            value={profile.emergencyContact.relationship}
                            onChangeText={(text) => setProfile({ 
                                ...profile, 
                                emergencyContact: { ...profile.emergencyContact, relationship: text }
                            })}
                            editable={editMode}
                            placeholder="e.g. Father, Mother, Guardian"
                        />
                    </View>
                </View>

                {/* Address Information */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Address Information</Text>
                    
                    <View style={styles.inputGroup}>
                        <Text style={styles.inputLabel}>Current Address</Text>
                        <TextInput
                            style={[styles.textArea, !editMode && styles.disabledInput]}
                            value={profile.currentAddress}
                            onChangeText={(text) => setProfile({ ...profile, currentAddress: text })}
                            editable={editMode}
                            placeholder="Current residential address"
                            multiline
                            numberOfLines={3}
                        />
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.inputLabel}>Permanent Address</Text>
                        <TextInput
                            style={[styles.textArea, !editMode && styles.disabledInput]}
                            value={profile.permanentAddress}
                            onChangeText={(text) => setProfile({ ...profile, permanentAddress: text })}
                            editable={editMode}
                            placeholder="Permanent/Home address"
                            multiline
                            numberOfLines={3}
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

                {/* Accommodation Preferences */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Accommodation Preferences</Text>
                    
                    <View style={styles.inputGroup}>
                        <Text style={styles.inputLabel}>Preferred Accommodation Type</Text>
                        <TextInput
                            style={[styles.textInput, !editMode && styles.disabledInput]}
                            value={preferences.accommodationType}
                            onChangeText={(text) => setPreferences({ ...preferences, accommodationType: text })}
                            editable={editMode}
                            placeholder="e.g. Shared Room, Single Room"
                        />
                    </View>

                    <View style={styles.priceRangeContainer}>
                        <Text style={styles.inputLabel}>Budget Range (PKR per month)</Text>
                        <View style={styles.priceInputs}>
                            <TextInput
                                style={[styles.priceInput, !editMode && styles.disabledInput]}
                                value={preferences.priceRange.min.toString()}
                                onChangeText={(text) => setPreferences({ 
                                    ...preferences, 
                                    priceRange: { ...preferences.priceRange, min: parseInt(text) || 0 }
                                })}
                                editable={editMode}
                                placeholder="Min"
                                keyboardType="numeric"
                            />
                            <Text style={styles.priceSeparator}>-</Text>
                            <TextInput
                                style={[styles.priceInput, !editMode && styles.disabledInput]}
                                value={preferences.priceRange.max.toString()}
                                onChangeText={(text) => setPreferences({ 
                                    ...preferences, 
                                    priceRange: { ...preferences.priceRange, max: parseInt(text) || 50000 }
                                })}
                                editable={editMode}
                                placeholder="Max"
                                keyboardType="numeric"
                            />
                        </View>
                    </View>

                    <View style={styles.switchRow}>
                        <Text style={styles.switchLabel}>Pet Friendly</Text>
                        <Switch
                            value={preferences.petFriendly}
                            onValueChange={(value) => setPreferences({ ...preferences, petFriendly: value })}
                            disabled={!editMode}
                            trackColor={{ false: '#ccc', true: '#6B73FF' }}
                            thumbColor="#fff"
                        />
                    </View>
                </View>

                {/* Dietary Preferences */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Dietary Preferences</Text>
                    <View style={styles.preferencesGrid}>
                        {dietaryOptions.map((diet) => (
                            <TouchableOpacity
                                key={diet}
                                style={[
                                    styles.preferenceChip,
                                    preferences.dietaryPreferences.includes(diet) && styles.selectedPreferenceChip,
                                    !editMode && styles.disabledChip
                                ]}
                                onPress={editMode ? () => toggleDietaryPreference(diet) : null}
                                disabled={!editMode}
                            >
                                <Text style={[
                                    styles.preferenceChipText,
                                    preferences.dietaryPreferences.includes(diet) && styles.selectedPreferenceChipText
                                ]}>
                                    {diet}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>

                {/* Notification Settings */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Notification Settings</Text>
                    
                    <View style={styles.switchRow}>
                        <Text style={styles.switchLabel}>Booking Updates</Text>
                        <Switch
                            value={notificationSettings.bookingUpdates}
                            onValueChange={(value) => 
                                setNotificationSettings({
                                    ...notificationSettings,
                                    bookingUpdates: value
                                })
                            }
                            trackColor={{ false: '#ccc', true: '#6B73FF' }}
                            thumbColor="#fff"
                        />
                    </View>

                    <View style={styles.switchRow}>
                        <Text style={styles.switchLabel}>Order Updates</Text>
                        <Switch
                            value={notificationSettings.orderUpdates}
                            onValueChange={(value) => 
                                setNotificationSettings({
                                    ...notificationSettings,
                                    orderUpdates: value
                                })
                            }
                            trackColor={{ false: '#ccc', true: '#6B73FF' }}
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
                            trackColor={{ false: '#ccc', true: '#6B73FF' }}
                            thumbColor="#fff"
                        />
                    </View>

                    <View style={styles.switchRow}>
                        <Text style={styles.switchLabel}>Email Notifications</Text>
                        <Switch
                            value={notificationSettings.emailNotifications}
                            onValueChange={(value) => 
                                setNotificationSettings({
                                    ...notificationSettings,
                                    emailNotifications: value
                                })
                            }
                            trackColor={{ false: '#ccc', true: '#6B73FF' }}
                            thumbColor="#fff"
                        />
                    </View>

                    <View style={styles.switchRow}>
                        <Text style={styles.switchLabel}>Promotional Offers</Text>
                        <Switch
                            value={notificationSettings.promotionalOffers}
                            onValueChange={(value) => 
                                setNotificationSettings({
                                    ...notificationSettings,
                                    promotionalOffers: value
                                })
                            }
                            trackColor={{ false: '#ccc', true: '#6B73FF' }}
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
                
                {/* Logout Section */}
                <View style={styles.section}>
                    <TouchableOpacity
                        style={styles.logoutButton}
                        onPress={handleLogout}
                    >
                        <Icon name="logout" size={20} color="#fff" />
                        <Text style={styles.logoutButtonText}>Logout</Text>
                    </TouchableOpacity>
                </View>
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
    profileImageContainer: {
        position: 'relative',
        marginBottom: 15,
    },
    profileImage: {
        width: 100,
        height: 100,
        borderRadius: 50,
    },
    defaultProfileImage: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: '#6B73FF',
        justifyContent: 'center',
        alignItems: 'center',
    },
    editImageOverlay: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        backgroundColor: '#4CAF50',
        width: 30,
        height: 30,
        borderRadius: 15,
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
        marginBottom: 10,
    },
    studentBadge: {
        backgroundColor: '#6B73FF',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 15,
    },
    studentText: {
        color: '#fff',
        fontSize: 12,
        fontWeight: '600',
        textTransform: 'uppercase',
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
        height: 80,
        textAlignVertical: 'top',
    },
    disabledInput: {
        backgroundColor: '#f5f5f5',
        color: '#666',
    },
    priceRangeContainer: {
        marginBottom: 15,
    },
    priceInputs: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 5,
    },
    priceInput: {
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 8,
        padding: 12,
        fontSize: 16,
        backgroundColor: '#fff',
        flex: 1,
    },
    priceSeparator: {
        marginHorizontal: 10,
        fontSize: 16,
        color: '#666',
    },
    preferencesGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginTop: 10,
    },
    preferenceChip: {
        backgroundColor: '#f0f0f0',
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 20,
        margin: 4,
        borderWidth: 1,
        borderColor: '#ddd',
    },
    selectedPreferenceChip: {
        backgroundColor: '#6B73FF',
        borderColor: '#6B73FF',
    },
    disabledChip: {
        opacity: 0.7,
    },
    preferenceChipText: {
        fontSize: 12,
        color: '#333',
        fontWeight: '500',
    },
    selectedPreferenceChipText: {
        color: '#fff',
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
        backgroundColor: '#6B73FF',
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
    logoutButton: {
        backgroundColor: '#FF4444',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 15,
        borderRadius: 8,
        marginTop: 10,
    },
    logoutButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
        marginLeft: 8,
    },
});

export default StudentProfileScreen;
