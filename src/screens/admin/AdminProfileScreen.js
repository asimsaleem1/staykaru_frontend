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

const AdminProfileScreen = ({ navigation }) => {
    const [user, setUser] = useState(null);
    const [profile, setProfile] = useState({
        name: '',
        email: '',
        phone: '',
        employeeId: '',
        department: '',
        role: 'admin',
        permissions: [],
        profileImage: null,
        lastLogin: null,
    });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [securitySettings, setSecuritySettings] = useState({
        twoFactorEnabled: false,
        sessionTimeout: 30,
        loginNotifications: true,
    });
    const [notificationSettings, setNotificationSettings] = useState({
        systemAlerts: true,
        userActivityAlerts: true,
        financialAlerts: true,
        securityAlerts: true,
        dailyReports: true,
        weeklyReports: true,
    });

    const departmentOptions = [
        'Administration',
        'Customer Support',
        'Technical',
        'Finance',
        'Marketing',
        'Operations'
    ];

    useEffect(() => {
        loadProfile();
    }, []);

    const loadProfile = async () => {
        try {
            setLoading(true);
            const currentUser = await authService.getCurrentUser();
            setUser(currentUser);

            // Fetch admin profile data
            const profileRes = await fetchFromBackend(`/admin/profile/${currentUser.id}`);
            
            if (profileRes.success) {
                setProfile({
                    name: profileRes.data.name || currentUser.name || '',
                    email: profileRes.data.email || currentUser.email || '',
                    phone: profileRes.data.phone || '',
                    employeeId: profileRes.data.employeeId || '',
                    department: profileRes.data.department || '',
                    role: profileRes.data.role || 'admin',
                    permissions: profileRes.data.permissions || [],
                    profileImage: profileRes.data.profileImage || null,
                    lastLogin: profileRes.data.lastLogin || null,
                });
                setSecuritySettings(profileRes.data.securitySettings || securitySettings);
                setNotificationSettings(profileRes.data.notificationSettings || notificationSettings);
            }

            console.log('✅ Admin profile loaded successfully');
        } catch (error) {
            console.error('❌ Error loading admin profile:', error);
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
                securitySettings,
                notificationSettings
            };

            const response = await fetchFromBackend(`/admin/profile/${user.id}`, {
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
            console.error('❌ Error saving admin profile:', error);
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

    const handleChangePassword = () => {
        navigation.navigate('AdminChangePassword');
    };

    const handle2FASetup = () => {
        navigation.navigate('Admin2FASetup');
    };

    const handleActivityLog = () => {
        navigation.navigate('AdminActivityLog');
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
                colors={['#1976D2', '#42A5F5']}
                style={styles.header}
            >
                <View style={styles.headerContent}>
                    <TouchableOpacity
                        onPress={() => navigation.goBack()}
                        style={styles.backButton}
                    >
                        <Icon name="arrow-back" size={24} color="#fff" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Admin Profile</Text>
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
                                <Icon name="admin-panel-settings" size={60} color="#fff" />
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
                    <View style={styles.roleBadge}>
                        <Text style={styles.roleText}>Administrator</Text>
                    </View>
                    {profile.lastLogin && (
                        <Text style={styles.lastLogin}>
                            Last login: {new Date(profile.lastLogin).toLocaleString('en-PK')}
                        </Text>
                    )}
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
                        <Text style={styles.inputLabel}>Employee ID</Text>
                        <TextInput
                            style={[styles.textInput, !editMode && styles.disabledInput]}
                            value={profile.employeeId}
                            onChangeText={(text) => setProfile({ ...profile, employeeId: text })}
                            editable={editMode}
                            placeholder="Employee ID"
                        />
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.inputLabel}>Department</Text>
                        <TextInput
                            style={[styles.textInput, !editMode && styles.disabledInput]}
                            value={profile.department}
                            onChangeText={(text) => setProfile({ ...profile, department: text })}
                            editable={editMode}
                            placeholder="Select department"
                        />
                    </View>
                </View>

                {/* Security Settings */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Security Settings</Text>
                    
                    <View style={styles.switchRow}>
                        <View style={styles.switchContent}>
                            <Text style={styles.switchLabel}>Two-Factor Authentication</Text>
                            <Text style={styles.switchDescription}>
                                Add an extra layer of security to your account
                            </Text>
                        </View>
                        <Switch
                            value={securitySettings.twoFactorEnabled}
                            onValueChange={(value) => 
                                setSecuritySettings({
                                    ...securitySettings,
                                    twoFactorEnabled: value
                                })
                            }
                            trackColor={{ false: '#ccc', true: '#1976D2' }}
                            thumbColor="#fff"
                        />
                    </View>

                    <View style={styles.switchRow}>
                        <View style={styles.switchContent}>
                            <Text style={styles.switchLabel}>Login Notifications</Text>
                            <Text style={styles.switchDescription}>
                                Get notified when someone logs into your account
                            </Text>
                        </View>
                        <Switch
                            value={securitySettings.loginNotifications}
                            onValueChange={(value) => 
                                setSecuritySettings({
                                    ...securitySettings,
                                    loginNotifications: value
                                })
                            }
                            trackColor={{ false: '#ccc', true: '#1976D2' }}
                            thumbColor="#fff"
                        />
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.inputLabel}>Session Timeout (minutes)</Text>
                        <TextInput
                            style={[styles.textInput, !editMode && styles.disabledInput]}
                            value={securitySettings.sessionTimeout?.toString()}
                            onChangeText={(text) => 
                                setSecuritySettings({
                                    ...securitySettings,
                                    sessionTimeout: parseInt(text) || 30
                                })
                            }
                            editable={editMode}
                            placeholder="30"
                            keyboardType="numeric"
                        />
                    </View>
                </View>

                {/* Notification Settings */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Notification Preferences</Text>
                    
                    <View style={styles.switchRow}>
                        <Text style={styles.switchLabel}>System Alerts</Text>
                        <Switch
                            value={notificationSettings.systemAlerts}
                            onValueChange={(value) => 
                                setNotificationSettings({
                                    ...notificationSettings,
                                    systemAlerts: value
                                })
                            }
                            trackColor={{ false: '#ccc', true: '#1976D2' }}
                            thumbColor="#fff"
                        />
                    </View>

                    <View style={styles.switchRow}>
                        <Text style={styles.switchLabel}>User Activity Alerts</Text>
                        <Switch
                            value={notificationSettings.userActivityAlerts}
                            onValueChange={(value) => 
                                setNotificationSettings({
                                    ...notificationSettings,
                                    userActivityAlerts: value
                                })
                            }
                            trackColor={{ false: '#ccc', true: '#1976D2' }}
                            thumbColor="#fff"
                        />
                    </View>

                    <View style={styles.switchRow}>
                        <Text style={styles.switchLabel}>Financial Alerts</Text>
                        <Switch
                            value={notificationSettings.financialAlerts}
                            onValueChange={(value) => 
                                setNotificationSettings({
                                    ...notificationSettings,
                                    financialAlerts: value
                                })
                            }
                            trackColor={{ false: '#ccc', true: '#1976D2' }}
                            thumbColor="#fff"
                        />
                    </View>

                    <View style={styles.switchRow}>
                        <Text style={styles.switchLabel}>Security Alerts</Text>
                        <Switch
                            value={notificationSettings.securityAlerts}
                            onValueChange={(value) => 
                                setNotificationSettings({
                                    ...notificationSettings,
                                    securityAlerts: value
                                })
                            }
                            trackColor={{ false: '#ccc', true: '#1976D2' }}
                            thumbColor="#fff"
                        />
                    </View>

                    <View style={styles.switchRow}>
                        <Text style={styles.switchLabel}>Daily Reports</Text>
                        <Switch
                            value={notificationSettings.dailyReports}
                            onValueChange={(value) => 
                                setNotificationSettings({
                                    ...notificationSettings,
                                    dailyReports: value
                                })
                            }
                            trackColor={{ false: '#ccc', true: '#1976D2' }}
                            thumbColor="#fff"
                        />
                    </View>

                    <View style={styles.switchRow}>
                        <Text style={styles.switchLabel}>Weekly Reports</Text>
                        <Switch
                            value={notificationSettings.weeklyReports}
                            onValueChange={(value) => 
                                setNotificationSettings({
                                    ...notificationSettings,
                                    weeklyReports: value
                                })
                            }
                            trackColor={{ false: '#ccc', true: '#1976D2' }}
                            thumbColor="#fff"
                        />
                    </View>
                </View>

                {/* Account Actions */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Account Actions</Text>
                    
                    <TouchableOpacity style={styles.actionRow} onPress={handleChangePassword}>
                        <Icon name="lock" size={24} color="#666" />
                        <Text style={styles.actionText}>Change Password</Text>
                        <Icon name="chevron-right" size={24} color="#ccc" />
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.actionRow} onPress={handle2FASetup}>
                        <Icon name="security" size={24} color="#666" />
                        <Text style={styles.actionText}>Two-Factor Authentication Setup</Text>
                        <Icon name="chevron-right" size={24} color="#ccc" />
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.actionRow} onPress={handleActivityLog}>
                        <Icon name="history" size={24} color="#666" />
                        <Text style={styles.actionText}>Activity Log</Text>
                        <Icon name="chevron-right" size={24} color="#ccc" />
                    </TouchableOpacity>
                </View>

                {/* Permissions */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Current Permissions</Text>
                    <View style={styles.permissionsGrid}>
                        {profile.permissions?.length > 0 ? (
                            profile.permissions.map((permission, index) => (
                                <View key={index} style={styles.permissionChip}>
                                    <Icon name="check-circle" size={16} color="#4CAF50" />
                                    <Text style={styles.permissionText}>{permission}</Text>
                                </View>
                            ))
                        ) : (
                            <View style={styles.permissionChip}>
                                <Icon name="admin-panel-settings" size={16} color="#1976D2" />
                                <Text style={styles.permissionText}>Full Admin Access</Text>
                            </View>
                        )}
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
        backgroundColor: '#1976D2',
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
    roleBadge: {
        backgroundColor: '#1976D2',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 15,
        marginBottom: 10,
    },
    roleText: {
        color: '#fff',
        fontSize: 12,
        fontWeight: '600',
        textTransform: 'uppercase',
    },
    lastLogin: {
        fontSize: 12,
        color: '#999',
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
    switchContent: {
        flex: 1,
        marginRight: 15,
    },
    switchLabel: {
        fontSize: 16,
        color: '#333',
        fontWeight: '500',
    },
    switchDescription: {
        fontSize: 12,
        color: '#666',
        marginTop: 2,
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
    permissionsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginTop: 10,
    },
    permissionChip: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f0f8ff',
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 20,
        margin: 4,
        borderWidth: 1,
        borderColor: '#e3f2fd',
    },
    permissionText: {
        fontSize: 12,
        color: '#1976D2',
        fontWeight: '500',
        marginLeft: 4,
    },
    saveButton: {
        backgroundColor: '#1976D2',
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

export default AdminProfileScreen;
