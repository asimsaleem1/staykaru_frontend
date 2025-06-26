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

const LandlordProfileScreen = ({ navigation }) => {
    const [user, setUser] = useState(null);
    const [profile, setProfile] = useState({
        name: '',
        email: '',
        phone: '',
        cnic: '',
        address: '',
        city: '',
        ntn: '',
        bankAccount: '',
        bankName: '',
        profileImage: null,
    });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [notificationSettings, setNotificationSettings] = useState({
        bookingNotifications: true,
        marketingEmails: false,
        smsNotifications: true,
    });

    useEffect(() => {
        loadProfile();
    }, []);

    const loadProfile = async () => {
        try {
            setLoading(true);
            const currentUser = await authService.getCurrentUser();
            setUser(currentUser);

            // Fetch landlord profile data
            const profileRes = await fetchFromBackend(`/landlord/profile/${currentUser.id}`);
            
            if (profileRes.success) {
                setProfile({
                    name: profileRes.data.name || currentUser.name || '',
                    email: profileRes.data.email || currentUser.email || '',
                    phone: profileRes.data.phone || '',
                    cnic: profileRes.data.cnic || '',
                    address: profileRes.data.address || '',
                    city: profileRes.data.city || '',
                    ntn: profileRes.data.ntn || '',
                    bankAccount: profileRes.data.bankAccount || '',
                    bankName: profileRes.data.bankName || '',
                    profileImage: profileRes.data.profileImage || null,
                });
                setNotificationSettings(profileRes.data.notificationSettings || notificationSettings);
            }

            console.log('✅ Profile loaded successfully');
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

            const response = await fetchFromBackend(`/landlord/profile/${user.id}`, {
                method: 'PUT',
                data: profileData
            });

            if (response.success) {
                Alert.alert('Success', 'Profile updated successfully');
                setEditMode(false);
                await loadProfile(); // Reload profile data
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
    };    const handleChangePassword = () => {
        navigation.navigate('AccountSettings');
    };

    const handleBankSettings = () => {
        navigation.navigate('BusinessSettings');
    };

    const handleVerificationDocuments = () => {
        navigation.navigate('BusinessSettings');
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
                colors={['#2E7D32', '#4CAF50']}
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
                </View>

                {/* Address Information */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Address Information</Text>
                    
                    <View style={styles.inputGroup}>
                        <Text style={styles.inputLabel}>Address</Text>
                        <TextInput
                            style={[styles.textInput, !editMode && styles.disabledInput]}
                            value={profile.address}
                            onChangeText={(text) => setProfile({ ...profile, address: text })}
                            editable={editMode}
                            placeholder="Street address"
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

                {/* Business Information */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Business Information</Text>
                    
                    <View style={styles.inputGroup}>
                        <Text style={styles.inputLabel}>NTN Number (Optional)</Text>
                        <TextInput
                            style={[styles.textInput, !editMode && styles.disabledInput]}
                            value={profile.ntn}
                            onChangeText={(text) => setProfile({ ...profile, ntn: text })}
                            editable={editMode}
                            placeholder="National Tax Number"
                        />
                    </View>

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
                        <Text style={styles.switchLabel}>Booking Notifications</Text>
                        <Switch
                            value={notificationSettings.bookingNotifications}
                            onValueChange={(value) => 
                                setNotificationSettings({
                                    ...notificationSettings,
                                    bookingNotifications: value
                                })
                            }
                            trackColor={{ false: '#ccc', true: '#4CAF50' }}
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
                            trackColor={{ false: '#ccc', true: '#4CAF50' }}
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
                            trackColor={{ false: '#ccc', true: '#4CAF50' }}
                            thumbColor="#fff"
                        />
                    </View>
                </View>                {/* Quick Actions */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Account Settings</Text>
                    
                    <TouchableOpacity style={styles.actionRow} onPress={handleChangePassword}>
                        <Icon name="lock" size={24} color="#666" />
                        <Text style={styles.actionText}>Account & Security</Text>
                        <Icon name="chevron-right" size={24} color="#ccc" />
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.actionRow} onPress={handleBankSettings}>
                        <Icon name="business" size={24} color="#666" />
                        <Text style={styles.actionText}>Business Settings</Text>
                        <Icon name="chevron-right" size={24} color="#ccc" />
                    </TouchableOpacity>

                    <TouchableOpacity 
                        style={styles.actionRow} 
                        onPress={() => navigation.navigate('BookingPreferences')}
                    >
                        <Icon name="settings" size={24} color="#666" />
                        <Text style={styles.actionText}>Booking Preferences</Text>
                        <Icon name="chevron-right" size={24} color="#ccc" />
                    </TouchableOpacity>

                    <TouchableOpacity 
                        style={styles.actionRow} 
                        onPress={() => navigation.navigate('Maintenance')}
                    >
                        <Icon name="build" size={24} color="#666" />
                        <Text style={styles.actionText}>Maintenance Management</Text>
                        <Icon name="chevron-right" size={24} color="#ccc" />
                    </TouchableOpacity>

                    <TouchableOpacity 
                        style={styles.actionRow} 
                        onPress={() => navigation.navigate('VendorManagement')}
                    >
                        <Icon name="people" size={24} color="#666" />
                        <Text style={styles.actionText}>Vendor Management</Text>
                        <Icon name="chevron-right" size={24} color="#ccc" />
                    </TouchableOpacity>

                    <TouchableOpacity 
                        style={styles.actionRow} 
                        onPress={() => navigation.navigate('LandlordNotifications')}
                    >
                        <Icon name="notifications" size={24} color="#666" />
                        <Text style={styles.actionText}>Notifications & Messages</Text>
                        <Icon name="chevron-right" size={24} color="#ccc" />
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.actionRow} onPress={handleVerificationDocuments}>
                        <Icon name="verified-user" size={24} color="#666" />
                        <Text style={styles.actionText}>Verification Documents</Text>
                        <Icon name="chevron-right" size={24} color="#ccc" />
                    </TouchableOpacity>
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
                                loadProfile(); // Reset changes
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
        backgroundColor: '#2E7D32',
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
    disabledInput: {
        backgroundColor: '#f5f5f5',
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
    actionRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    actionText: {
        fontSize: 16,
        color: '#333',
        flex: 1,
        marginLeft: 15,
    },
    saveButton: {
        backgroundColor: '#4CAF50',
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

export default LandlordProfileScreen;
