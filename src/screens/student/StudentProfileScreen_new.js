import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    ScrollView,
    StyleSheet,
    TouchableOpacity,
    Image,
    TextInput,
    Alert,
    ActivityIndicator,
    KeyboardAvoidingView,
    Platform
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import studentApiService from '../../services/studentApiService';
import * as ImagePicker from 'expo-image-picker';

const StudentProfileScreen = ({ navigation }) => {
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [editing, setEditing] = useState(false);
    const [saving, setSaving] = useState(false);
    const [editedProfile, setEditedProfile] = useState({});

    useEffect(() => {
        loadProfile();
    }, []);

    const loadProfile = async () => {
        try {
            setLoading(true);
            const data = await studentApiService.getProfile();
            setProfile(data);
            setEditedProfile(data);
        } catch (error) {
            console.error('Error loading profile:', error);
            Alert.alert('Error', 'Failed to load profile');
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = () => {
        setEditing(true);
        setEditedProfile({ ...profile });
    };

    const handleCancel = () => {
        setEditing(false);
        setEditedProfile({ ...profile });
    };

    const handleSave = async () => {
        try {
            setSaving(true);
            const updatedProfile = await studentApiService.updateProfile(editedProfile);
            setProfile(updatedProfile);
            setEditing(false);
            Alert.alert('Success', 'Profile updated successfully');
        } catch (error) {
            console.error('Error updating profile:', error);
            Alert.alert('Error', 'Failed to update profile');
        } finally {
            setSaving(false);
        }
    };

    const handleImagePicker = async () => {
        try {
            const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
            if (status !== 'granted') {
                Alert.alert('Permission needed', 'Please grant camera roll permissions');
                return;
            }

            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true,
                aspect: [1, 1],
                quality: 0.8,
            });

            if (!result.canceled && result.assets[0]) {
                const imageUri = result.assets[0].uri;
                setEditedProfile(prev => ({ ...prev, profileImage: imageUri }));
            }
        } catch (error) {
            console.error('Error picking image:', error);
            Alert.alert('Error', 'Failed to pick image');
        }
    };

    const handleInputChange = (field, value) => {
        setEditedProfile(prev => ({ ...prev, [field]: value }));
    };

    const handleLogout = () => {
        Alert.alert(
            'Logout',
            'Are you sure you want to logout?',
            [
                { text: 'Cancel', style: 'cancel' },
                { 
                    text: 'Logout', 
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await studentApiService.logout();
                            navigation.reset({
                                index: 0,
                                routes: [{ name: 'Login' }],
                            });
                        } catch (error) {
                            console.error('Logout error:', error);
                        }
                    }
                }
            ]
        );
    };

    const renderProfileHeader = () => (
        <View style={styles.profileHeader}>
            <View style={styles.imageContainer}>
                <Image
                    source={{ 
                        uri: editing ? editedProfile.profileImage : profile?.profileImage || 
                             'https://via.placeholder.com/120x120?text=Profile'
                    }}
                    style={styles.profileImage}
                    resizeMode="cover"
                />
                
                {editing && (
                    <TouchableOpacity 
                        style={styles.imageEditButton}
                        onPress={handleImagePicker}
                    >
                        <Ionicons name="camera" size={20} color="white" />
                    </TouchableOpacity>
                )}
            </View>

            <View style={styles.profileInfo}>
                {editing ? (
                    <TextInput
                        style={styles.nameInput}
                        value={editedProfile.name || ''}
                        onChangeText={(text) => handleInputChange('name', text)}
                        placeholder="Full Name"
                        placeholderTextColor="#6c757d"
                    />
                ) : (
                    <Text style={styles.profileName}>
                        {profile?.name || 'Student Name'}
                    </Text>
                )}
                
                <Text style={styles.profileEmail}>
                    {profile?.email || 'student@example.com'}
                </Text>
                
                <View style={styles.verificationBadge}>
                    <Ionicons 
                        name={profile?.isVerified ? "checkmark-circle" : "time"} 
                        size={16} 
                        color={profile?.isVerified ? "#28a745" : "#ffc107"} 
                    />
                    <Text style={[
                        styles.verificationText,
                        { color: profile?.isVerified ? "#28a745" : "#ffc107" }
                    ]}>
                        {profile?.isVerified ? 'Verified' : 'Pending Verification'}
                    </Text>
                </View>
            </View>
        </View>
    );

    const renderProfileDetails = () => (
        <View style={styles.section}>
            <Text style={styles.sectionTitle}>Personal Information</Text>
            
            <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Phone Number</Text>
                {editing ? (
                    <TextInput
                        style={styles.textInput}
                        value={editedProfile.phone || ''}
                        onChangeText={(text) => handleInputChange('phone', text)}
                        placeholder="03XXXXXXXXX"
                        keyboardType="phone-pad"
                        placeholderTextColor="#6c757d"
                    />
                ) : (
                    <Text style={styles.inputValue}>
                        {profile?.phone || 'Not provided'}
                    </Text>
                )}
            </View>

            <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>University</Text>
                {editing ? (
                    <TextInput
                        style={styles.textInput}
                        value={editedProfile.university || ''}
                        onChangeText={(text) => handleInputChange('university', text)}
                        placeholder="University Name"
                        placeholderTextColor="#6c757d"
                    />
                ) : (
                    <Text style={styles.inputValue}>
                        {profile?.university || 'Not provided'}
                    </Text>
                )}
            </View>

            <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Student ID</Text>
                {editing ? (
                    <TextInput
                        style={styles.textInput}
                        value={editedProfile.studentId || ''}
                        onChangeText={(text) => handleInputChange('studentId', text)}
                        placeholder="Student ID"
                        placeholderTextColor="#6c757d"
                    />
                ) : (
                    <Text style={styles.inputValue}>
                        {profile?.studentId || 'Not provided'}
                    </Text>
                )}
            </View>

            <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Address</Text>
                {editing ? (
                    <TextInput
                        style={[styles.textInput, styles.textArea]}
                        value={editedProfile.address || ''}
                        onChangeText={(text) => handleInputChange('address', text)}
                        placeholder="Your current address"
                        multiline
                        numberOfLines={3}
                        textAlignVertical="top"
                        placeholderTextColor="#6c757d"
                    />
                ) : (
                    <Text style={styles.inputValue}>
                        {profile?.address || 'Not provided'}
                    </Text>
                )}
            </View>

            <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Date of Birth</Text>
                {editing ? (
                    <TextInput
                        style={styles.textInput}
                        value={editedProfile.dateOfBirth || ''}
                        onChangeText={(text) => handleInputChange('dateOfBirth', text)}
                        placeholder="DD/MM/YYYY"
                        placeholderTextColor="#6c757d"
                    />
                ) : (
                    <Text style={styles.inputValue}>
                        {profile?.dateOfBirth || 'Not provided'}
                    </Text>
                )}
            </View>
        </View>
    );

    const renderPreferences = () => (
        <View style={styles.section}>
            <Text style={styles.sectionTitle}>Preferences</Text>
            
            <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Accommodation Budget (PKR/month)</Text>
                {editing ? (
                    <TextInput
                        style={styles.textInput}
                        value={editedProfile.budget?.toString() || ''}
                        onChangeText={(text) => handleInputChange('budget', text)}
                        placeholder="e.g., 15000"
                        keyboardType="numeric"
                        placeholderTextColor="#6c757d"
                    />
                ) : (
                    <Text style={styles.inputValue}>
                        {profile?.budget ? `PKR ${profile.budget.toLocaleString()}` : 'Not set'}
                    </Text>
                )}
            </View>

            <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Preferred Location</Text>
                {editing ? (
                    <TextInput
                        style={styles.textInput}
                        value={editedProfile.preferredLocation || ''}
                        onChangeText={(text) => handleInputChange('preferredLocation', text)}
                        placeholder="e.g., Near University"
                        placeholderTextColor="#6c757d"
                    />
                ) : (
                    <Text style={styles.inputValue}>
                        {profile?.preferredLocation || 'Not set'}
                    </Text>
                )}
            </View>
        </View>
    );

    const renderStatistics = () => (
        <View style={styles.section}>
            <Text style={styles.sectionTitle}>Activity Summary</Text>
            
            <View style={styles.statsGrid}>
                <View style={styles.statItem}>
                    <Text style={styles.statNumber}>
                        {profile?.stats?.totalBookings || 0}
                    </Text>
                    <Text style={styles.statLabel}>Bookings</Text>
                </View>
                
                <View style={styles.statItem}>
                    <Text style={styles.statNumber}>
                        {profile?.stats?.totalOrders || 0}
                    </Text>
                    <Text style={styles.statLabel}>Food Orders</Text>
                </View>
                
                <View style={styles.statItem}>
                    <Text style={styles.statNumber}>
                        {profile?.stats?.totalReviews || 0}
                    </Text>
                    <Text style={styles.statLabel}>Reviews</Text>
                </View>
                
                <View style={styles.statItem}>
                    <Text style={styles.statNumber}>
                        {profile?.stats?.memberSince ? 
                            new Date(profile.stats.memberSince).getFullYear() : 
                            new Date().getFullYear()}
                    </Text>
                    <Text style={styles.statLabel}>Member Since</Text>
                </View>
            </View>
        </View>
    );

    const renderActionButtons = () => (
        <View style={styles.actionsSection}>
            {editing ? (
                <View style={styles.editActions}>
                    <TouchableOpacity 
                        style={[styles.actionButton, styles.cancelButton]}
                        onPress={handleCancel}
                    >
                        <Ionicons name="close" size={20} color="#dc3545" />
                        <Text style={[styles.actionButtonText, { color: '#dc3545' }]}>
                            Cancel
                        </Text>
                    </TouchableOpacity>
                    
                    <TouchableOpacity 
                        style={[styles.actionButton, styles.saveButton]}
                        onPress={handleSave}
                        disabled={saving}
                    >
                        {saving ? (
                            <ActivityIndicator size="small" color="white" />
                        ) : (
                            <Ionicons name="checkmark" size={20} color="white" />
                        )}
                        <Text style={[styles.actionButtonText, { color: 'white' }]}>
                            {saving ? 'Saving...' : 'Save'}
                        </Text>
                    </TouchableOpacity>
                </View>
            ) : (
                <>
                    <TouchableOpacity 
                        style={styles.actionButton}
                        onPress={handleEdit}
                    >
                        <Ionicons name="create-outline" size={20} color="#007bff" />
                        <Text style={styles.actionButtonText}>Edit Profile</Text>
                    </TouchableOpacity>

                    <TouchableOpacity 
                        style={styles.actionButton}
                        onPress={() => navigation.navigate('AccountSettings')}
                    >
                        <Ionicons name="settings-outline" size={20} color="#007bff" />
                        <Text style={styles.actionButtonText}>Account Settings</Text>
                    </TouchableOpacity>

                    <TouchableOpacity 
                        style={styles.actionButton}
                        onPress={() => navigation.navigate('Support')}
                    >
                        <Ionicons name="help-circle-outline" size={20} color="#007bff" />
                        <Text style={styles.actionButtonText}>Help & Support</Text>
                    </TouchableOpacity>

                    <TouchableOpacity 
                        style={[styles.actionButton, styles.logoutButton]}
                        onPress={handleLogout}
                    >
                        <Ionicons name="log-out-outline" size={20} color="#dc3545" />
                        <Text style={[styles.actionButtonText, { color: '#dc3545' }]}>
                            Logout
                        </Text>
                    </TouchableOpacity>
                </>
            )}
        </View>
    );

    if (loading) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#007bff" />
                    <Text style={styles.loadingText}>Loading profile...</Text>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Ionicons name="arrow-back" size={24} color="#333" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Profile</Text>
                <View style={{ width: 24 }} />
            </View>

            <KeyboardAvoidingView 
                style={styles.content}
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            >
                <ScrollView 
                    style={styles.scrollView}
                    showsVerticalScrollIndicator={false}
                    keyboardShouldPersistTaps="handled"
                >
                    {renderProfileHeader()}
                    {renderProfileDetails()}
                    {renderPreferences()}
                    {renderStatistics()}
                    {renderActionButtons()}
                    
                    <View style={styles.bottomSpacing} />
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8f9fa',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingVertical: 15,
        backgroundColor: 'white',
        borderBottomWidth: 1,
        borderBottomColor: '#e9ecef',
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#333',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        marginTop: 10,
        fontSize: 16,
        color: '#6c757d',
    },
    content: {
        flex: 1,
    },
    scrollView: {
        flex: 1,
    },
    profileHeader: {
        backgroundColor: 'white',
        alignItems: 'center',
        padding: 30,
        marginBottom: 15,
    },
    imageContainer: {
        position: 'relative',
        marginBottom: 20,
    },
    profileImage: {
        width: 120,
        height: 120,
        borderRadius: 60,
        borderWidth: 4,
        borderColor: '#007bff',
    },
    imageEditButton: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        backgroundColor: '#007bff',
        borderRadius: 20,
        padding: 8,
        borderWidth: 3,
        borderColor: 'white',
    },
    profileInfo: {
        alignItems: 'center',
    },
    profileName: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 5,
    },
    nameInput: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#333',
        borderBottomWidth: 1,
        borderBottomColor: '#007bff',
        paddingVertical: 5,
        textAlign: 'center',
        minWidth: 200,
    },
    profileEmail: {
        fontSize: 16,
        color: '#6c757d',
        marginBottom: 10,
    },
    verificationBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f8f9fa',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 15,
    },
    verificationText: {
        marginLeft: 5,
        fontSize: 12,
        fontWeight: '500',
    },
    section: {
        backgroundColor: 'white',
        marginVertical: 8,
        padding: 20,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 20,
    },
    inputGroup: {
        marginBottom: 20,
    },
    inputLabel: {
        fontSize: 14,
        fontWeight: '500',
        color: '#333',
        marginBottom: 8,
    },
    textInput: {
        borderWidth: 1,
        borderColor: '#dee2e6',
        borderRadius: 8,
        paddingHorizontal: 15,
        paddingVertical: 12,
        fontSize: 16,
        backgroundColor: '#fff',
        color: '#333',
    },
    textArea: {
        height: 80,
        textAlignVertical: 'top',
    },
    inputValue: {
        fontSize: 16,
        color: '#333',
        paddingVertical: 12,
        paddingHorizontal: 15,
        backgroundColor: '#f8f9fa',
        borderRadius: 8,
    },
    statsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
    },
    statItem: {
        width: '50%',
        alignItems: 'center',
        marginBottom: 20,
    },
    statNumber: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#007bff',
        marginBottom: 5,
    },
    statLabel: {
        fontSize: 14,
        color: '#6c757d',
        fontWeight: '500',
    },
    actionsSection: {
        backgroundColor: 'white',
        marginVertical: 8,
        padding: 20,
    },
    editActions: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    actionButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#f8f9fa',
        borderWidth: 1,
        borderColor: '#007bff',
        borderRadius: 25,
        paddingVertical: 12,
        paddingHorizontal: 20,
        marginBottom: 10,
        flex: 1,
        marginHorizontal: 5,
    },
    cancelButton: {
        borderColor: '#dc3545',
        backgroundColor: '#fff5f5',
    },
    saveButton: {
        backgroundColor: '#007bff',
        borderColor: '#007bff',
    },
    logoutButton: {
        borderColor: '#dc3545',
        backgroundColor: '#fff5f5',
    },
    actionButtonText: {
        marginLeft: 8,
        fontSize: 16,
        fontWeight: '500',
        color: '#007bff',
    },
    bottomSpacing: {
        height: 30,
    },
});

export default StudentProfileScreen;
