import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    TextInput,
    Switch,
    Alert,
    Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { COLORS, SIZES } from '../../utils/constants';
import { fetchFromBackend } from '../../utils/networkUtils';

const AccountSettingsScreen = ({ navigation }) => {
    const [userInfo, setUserInfo] = useState({
        name: '',
        email: '',
        phone: '',
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
    });
    const [settings, setSettings] = useState({
        emailNotifications: true,
        pushNotifications: true,
        smsNotifications: false,
        marketingEmails: false,
        bookingAlerts: true,
        paymentAlerts: true,
        maintenanceAlerts: true,
        reviewAlerts: true,
        twoFactorAuth: false,
        biometricAuth: false,
        sessionTimeout: 30,
        dataSharing: false,
        analytics: true,
    });
    const [loading, setLoading] = useState(false);
    const [changePasswordModalVisible, setChangePasswordModalVisible] = useState(false);
    const [twoFactorModalVisible, setTwoFactorModalVisible] = useState(false);
    const [deleteAccountModalVisible, setDeleteAccountModalVisible] = useState(false);
    const [sessions, setSessions] = useState([]);

    useEffect(() => {
        loadAccountData();
        loadSessions();
    }, []);

    const loadAccountData = async () => {
        setLoading(true);
        try {
            const [settingsResponse, userResponse] = await Promise.all([
                fetchFromBackend('/api/auth/settings'),
                fetchFromBackend('/api/auth/profile')
            ]);

            if (settingsResponse?.success) {
                setSettings(settingsResponse.data);
            }

            if (userResponse?.success) {
                setUserInfo(prev => ({
                    ...prev,
                    name: userResponse.data.name || '',
                    email: userResponse.data.email || '',
                    phone: userResponse.data.phone || '',
                }));
            }
        } catch (error) {
            console.error('Error loading account data:', error);
        } finally {
            setLoading(false);
        }
    };

    const loadSessions = async () => {
        try {
            const response = await fetchFromBackend('/api/auth/sessions');
            if (response?.success) {
                setSessions(response.data || []);
            }
        } catch (error) {
            console.error('Error loading sessions:', error);
        }
    };

    const updateProfile = async () => {
        if (!userInfo.name.trim()) {
            Alert.alert('Error', 'Name is required');
            return;
        }

        if (!userInfo.email.trim()) {
            Alert.alert('Error', 'Email is required');
            return;
        }

        setLoading(true);
        try {
            const response = await fetchFromBackend('/api/auth/profile', {
                method: 'PUT',
                body: JSON.stringify({
                    name: userInfo.name,
                    email: userInfo.email,
                    phone: userInfo.phone,
                })
            });

            if (response?.success) {
                Alert.alert('Success', 'Profile updated successfully');
            }
        } catch (error) {
            console.error('Error updating profile:', error);
            Alert.alert('Error', 'Failed to update profile');
        } finally {
            setLoading(false);
        }
    };

    const updateSettings = async () => {
        setLoading(true);
        try {
            const response = await fetchFromBackend('/api/auth/settings', {
                method: 'PUT',
                body: JSON.stringify(settings)
            });

            if (response?.success) {
                Alert.alert('Success', 'Settings updated successfully');
            }
        } catch (error) {
            console.error('Error updating settings:', error);
            Alert.alert('Error', 'Failed to update settings');
        } finally {
            setLoading(false);
        }
    };

    const changePassword = async () => {
        if (!userInfo.currentPassword || !userInfo.newPassword || !userInfo.confirmPassword) {
            Alert.alert('Error', 'All password fields are required');
            return;
        }

        if (userInfo.newPassword !== userInfo.confirmPassword) {
            Alert.alert('Error', 'New passwords do not match');
            return;
        }

        if (userInfo.newPassword.length < 8) {
            Alert.alert('Error', 'Password must be at least 8 characters long');
            return;
        }

        setLoading(true);
        try {
            const response = await fetchFromBackend('/api/auth/change-password', {
                method: 'PUT',
                body: JSON.stringify({
                    currentPassword: userInfo.currentPassword,
                    newPassword: userInfo.newPassword,
                })
            });

            if (response?.success) {
                Alert.alert('Success', 'Password changed successfully');
                setChangePasswordModalVisible(false);
                setUserInfo(prev => ({
                    ...prev,
                    currentPassword: '',
                    newPassword: '',
                    confirmPassword: '',
                }));
            }
        } catch (error) {
            console.error('Error changing password:', error);
            Alert.alert('Error', 'Failed to change password');
        } finally {
            setLoading(false);
        }
    };

    const toggleTwoFactorAuth = async () => {
        if (!settings.twoFactorAuth) {
            setTwoFactorModalVisible(true);
        } else {
            // Disable 2FA
            Alert.alert(
                'Disable Two-Factor Authentication',
                'Are you sure you want to disable two-factor authentication?',
                [
                    { text: 'Cancel', style: 'cancel' },
                    {
                        text: 'Disable',
                        style: 'destructive',
                        onPress: async () => {
                            try {
                                const response = await fetchFromBackend('/api/auth/2fa', {
                                    method: 'PUT',
                                    body: JSON.stringify({ enabled: false })
                                });

                                if (response?.success) {
                                    setSettings(prev => ({ ...prev, twoFactorAuth: false }));
                                    Alert.alert('Success', 'Two-factor authentication disabled');
                                }
                            } catch (error) {
                                Alert.alert('Error', 'Failed to disable two-factor authentication');
                            }
                        }
                    }
                ]
            );
        }
    };

    const terminateSession = async (sessionId) => {
        try {
            const response = await fetchFromBackend(`/api/auth/sessions/${sessionId}`, {
                method: 'DELETE'
            });

            if (response?.success) {
                setSessions(prev => prev.filter(session => session.id !== sessionId));
                Alert.alert('Success', 'Session terminated');
            }
        } catch (error) {
            Alert.alert('Error', 'Failed to terminate session');
        }
    };

    const terminateAllSessions = async () => {
        Alert.alert(
            'Terminate All Sessions',
            'This will log you out from all devices. Continue?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Terminate All',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            const response = await fetchFromBackend('/api/auth/sessions/terminate-all', {
                                method: 'POST'
                            });

                            if (response?.success) {
                                Alert.alert('Success', 'All sessions terminated. You will be logged out.');
                                setTimeout(() => {
                                    AsyncStorage.multiRemove(['userData', 'token']);
                                    navigation.replace('Login');
                                }, 2000);
                            }
                        } catch (error) {
                            Alert.alert('Error', 'Failed to terminate sessions');
                        }
                    }
                }
            ]
        );
    };

    const deleteAccount = async () => {
        Alert.alert(
            'Delete Account',
            'This action cannot be undone. All your data will be permanently deleted.',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            const response = await fetchFromBackend('/api/auth/delete-account', {
                                method: 'DELETE'
                            });

                            if (response?.success) {
                                Alert.alert('Account Deleted', 'Your account has been deleted successfully.');
                                setTimeout(() => {
                                    AsyncStorage.multiRemove(['userData', 'token']);
                                    navigation.replace('Login');
                                }, 2000);
                            }
                        } catch (error) {
                            Alert.alert('Error', 'Failed to delete account');
                        }
                    }
                }
            ]
        );
    };

    const renderSwitchRow = (title, key, description = null) => (
        <View style={styles.switchRow}>
            <View style={styles.switchContent}>
                <Text style={styles.switchTitle}>{title}</Text>
                {description && <Text style={styles.switchDescription}>{description}</Text>}
            </View>
            <Switch
                value={settings[key]}
                onValueChange={(value) => setSettings(prev => ({ ...prev, [key]: value }))}
                trackColor={{ false: COLORS.lightGray, true: `${COLORS.primary}50` }}
                thumbColor={settings[key] ? COLORS.primary : COLORS.gray}
            />
        </View>
    );

    const renderChangePasswordModal = () => (
        <Modal
            visible={changePasswordModalVisible}
            animationType="slide"
            presentationStyle="pageSheet"
        >
            <View style={styles.modalContainer}>
                <View style={styles.modalHeader}>
                    <TouchableOpacity
                        onPress={() => setChangePasswordModalVisible(false)}
                        style={styles.closeButton}
                    >
                        <Ionicons name="close" size={24} color={COLORS.dark} />
                    </TouchableOpacity>
                    <Text style={styles.modalTitle}>Change Password</Text>
                    <TouchableOpacity
                        onPress={changePassword}
                        style={styles.saveButton}
                        disabled={loading}
                    >
                        <Text style={styles.saveButtonText}>Save</Text>
                    </TouchableOpacity>
                </View>

                <View style={styles.modalContent}>
                    <View style={styles.inputGroup}>
                        <Text style={styles.inputLabel}>Current Password</Text>
                        <TextInput
                            style={styles.input}
                            value={userInfo.currentPassword}
                            onChangeText={(text) => setUserInfo(prev => ({ ...prev, currentPassword: text }))}
                            placeholder="Enter current password"
                            secureTextEntry
                        />
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.inputLabel}>New Password</Text>
                        <TextInput
                            style={styles.input}
                            value={userInfo.newPassword}
                            onChangeText={(text) => setUserInfo(prev => ({ ...prev, newPassword: text }))}
                            placeholder="Enter new password"
                            secureTextEntry
                        />
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.inputLabel}>Confirm New Password</Text>
                        <TextInput
                            style={styles.input}
                            value={userInfo.confirmPassword}
                            onChangeText={(text) => setUserInfo(prev => ({ ...prev, confirmPassword: text }))}
                            placeholder="Confirm new password"
                            secureTextEntry
                        />
                    </View>

                    <Text style={styles.passwordHint}>
                        Password must be at least 8 characters long and contain a mix of letters, numbers, and symbols.
                    </Text>
                </View>
            </View>
        </Modal>
    );

    const renderTwoFactorModal = () => (
        <Modal
            visible={twoFactorModalVisible}
            animationType="slide"
            presentationStyle="pageSheet"
        >
            <View style={styles.modalContainer}>
                <View style={styles.modalHeader}>
                    <TouchableOpacity
                        onPress={() => setTwoFactorModalVisible(false)}
                        style={styles.closeButton}
                    >
                        <Ionicons name="close" size={24} color={COLORS.dark} />
                    </TouchableOpacity>
                    <Text style={styles.modalTitle}>Setup Two-Factor Authentication</Text>
                    <View style={styles.placeholder} />
                </View>

                <View style={styles.modalContent}>
                    <View style={styles.twoFactorInfo}>
                        <Ionicons name="shield-checkmark" size={64} color={COLORS.primary} />
                        <Text style={styles.twoFactorTitle}>Secure Your Account</Text>
                        <Text style={styles.twoFactorDescription}>
                            Two-factor authentication adds an extra layer of security to your account.
                            You'll need to verify your identity using your phone when logging in.
                        </Text>
                    </View>

                    <TouchableOpacity
                        style={styles.enableButton}
                        onPress={() => {
                            Alert.alert('Coming Soon', 'Two-factor authentication setup will be available soon');
                            setTwoFactorModalVisible(false);
                        }}
                    >
                        <Text style={styles.enableButtonText}>Enable Two-Factor Authentication</Text>
                    </TouchableOpacity>
                </View>
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
                <Text style={styles.headerTitle}>Account Settings</Text>
                <TouchableOpacity
                    onPress={updateSettings}
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
                {/* Profile Information */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Profile Information</Text>
                    <View style={styles.card}>
                        <View style={styles.inputGroup}>
                            <Text style={styles.inputLabel}>Full Name</Text>
                            <TextInput
                                style={styles.input}
                                value={userInfo.name}
                                onChangeText={(text) => setUserInfo(prev => ({ ...prev, name: text }))}
                                placeholder="Enter your full name"
                            />
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.inputLabel}>Email Address</Text>
                            <TextInput
                                style={styles.input}
                                value={userInfo.email}
                                onChangeText={(text) => setUserInfo(prev => ({ ...prev, email: text }))}
                                placeholder="Enter your email"
                                keyboardType="email-address"
                            />
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.inputLabel}>Phone Number</Text>
                            <TextInput
                                style={styles.input}
                                value={userInfo.phone}
                                onChangeText={(text) => setUserInfo(prev => ({ ...prev, phone: text }))}
                                placeholder="Enter your phone number"
                                keyboardType="phone-pad"
                            />
                        </View>

                        <TouchableOpacity style={styles.updateButton} onPress={updateProfile}>
                            <Text style={styles.updateButtonText}>Update Profile</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Security */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Security</Text>
                    <View style={styles.card}>
                        <TouchableOpacity
                            style={styles.menuItem}
                            onPress={() => setChangePasswordModalVisible(true)}
                        >
                            <Ionicons name="key-outline" size={24} color={COLORS.primary} />
                            <Text style={styles.menuItemText}>Change Password</Text>
                            <Ionicons name="chevron-forward" size={20} color={COLORS.gray} />
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.menuItem}
                            onPress={toggleTwoFactorAuth}
                        >
                            <Ionicons name="shield-checkmark-outline" size={24} color={COLORS.primary} />
                            <View style={styles.menuItemContent}>
                                <Text style={styles.menuItemText}>Two-Factor Authentication</Text>
                                <Text style={styles.menuItemSubtext}>
                                    {settings.twoFactorAuth ? 'Enabled' : 'Disabled'}
                                </Text>
                            </View>
                            <Switch
                                value={settings.twoFactorAuth}
                                onValueChange={toggleTwoFactorAuth}
                                trackColor={{ false: COLORS.lightGray, true: `${COLORS.primary}50` }}
                                thumbColor={settings.twoFactorAuth ? COLORS.primary : COLORS.gray}
                            />
                        </TouchableOpacity>

                        {renderSwitchRow(
                            'Biometric Authentication',
                            'biometricAuth',
                            'Use fingerprint or face ID to login'
                        )}

                        <View style={styles.inputGroup}>
                            <Text style={styles.inputLabel}>Session Timeout (minutes)</Text>
                            <TextInput
                                style={styles.input}
                                value={settings.sessionTimeout?.toString()}
                                onChangeText={(text) => setSettings(prev => ({ ...prev, sessionTimeout: parseInt(text) || 30 }))}
                                placeholder="30"
                                keyboardType="numeric"
                            />
                        </View>
                    </View>
                </View>

                {/* Notifications */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Notifications</Text>
                    <View style={styles.card}>
                        {renderSwitchRow('Email Notifications', 'emailNotifications')}
                        {renderSwitchRow('Push Notifications', 'pushNotifications')}
                        {renderSwitchRow('SMS Notifications', 'smsNotifications')}
                        {renderSwitchRow('Marketing Emails', 'marketingEmails')}
                        {renderSwitchRow('Booking Alerts', 'bookingAlerts')}
                        {renderSwitchRow('Payment Alerts', 'paymentAlerts')}
                        {renderSwitchRow('Maintenance Alerts', 'maintenanceAlerts')}
                        {renderSwitchRow('Review Alerts', 'reviewAlerts')}
                    </View>
                </View>

                {/* Privacy */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Privacy</Text>
                    <View style={styles.card}>
                        {renderSwitchRow(
                            'Data Sharing',
                            'dataSharing',
                            'Share anonymous usage data to improve the app'
                        )}
                        {renderSwitchRow(
                            'Analytics',
                            'analytics',
                            'Allow analytics to track app usage'
                        )}
                    </View>
                </View>

                {/* Active Sessions */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Active Sessions</Text>
                    <View style={styles.card}>
                        {sessions.map((session, index) => (
                            <View key={session.id || index} style={styles.sessionItem}>
                                <View style={styles.sessionInfo}>
                                    <Text style={styles.sessionDevice}>{session.device || 'Unknown Device'}</Text>
                                    <Text style={styles.sessionDetails}>
                                        {session.location || 'Unknown Location'} • {session.lastActive || 'Active now'}
                                    </Text>
                                </View>
                                {!session.current && (
                                    <TouchableOpacity
                                        onPress={() => terminateSession(session.id)}
                                        style={styles.terminateButton}
                                    >
                                        <Text style={styles.terminateButtonText}>End</Text>
                                    </TouchableOpacity>
                                )}
                            </View>
                        ))}

                        <TouchableOpacity
                            style={styles.terminateAllButton}
                            onPress={terminateAllSessions}
                        >
                            <Text style={styles.terminateAllButtonText}>Terminate All Sessions</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Danger Zone */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Danger Zone</Text>
                    <View style={styles.card}>
                        <TouchableOpacity
                            style={styles.deleteButton}
                            onPress={deleteAccount}
                        >
                            <Ionicons name="trash-outline" size={24} color={COLORS.error} />
                            <Text style={styles.deleteButtonText}>Delete Account</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                <View style={styles.bottomPadding} />
            </ScrollView>

            {renderChangePasswordModal()}
            {renderTwoFactorModal()}
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
        marginBottom: 25,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: COLORS.dark,
        marginBottom: 15,
    },
    card: {
        backgroundColor: COLORS.white,
        borderRadius: 12,
        padding: 15,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    inputGroup: {
        marginBottom: 15,
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
        borderRadius: 8,
        paddingHorizontal: 12,
        paddingVertical: 10,
        fontSize: 16,
        color: COLORS.dark,
        backgroundColor: COLORS.white,
    },
    updateButton: {
        backgroundColor: COLORS.primary,
        paddingVertical: 12,
        borderRadius: 8,
        alignItems: 'center',
        marginTop: 10,
    },
    updateButtonText: {
        color: COLORS.white,
        fontSize: 16,
        fontWeight: 'bold',
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 15,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.lightGray,
    },
    menuItemContent: {
        flex: 1,
        marginLeft: 15,
    },
    menuItemText: {
        fontSize: 16,
        color: COLORS.dark,
        marginLeft: 15,
    },
    menuItemSubtext: {
        fontSize: 12,
        color: COLORS.gray,
        marginTop: 2,
    },
    switchRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 15,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.lightGray,
    },
    switchContent: {
        flex: 1,
        marginRight: 15,
    },
    switchTitle: {
        fontSize: 16,
        color: COLORS.dark,
        fontWeight: '500',
    },
    switchDescription: {
        fontSize: 14,
        color: COLORS.gray,
        marginTop: 2,
    },
    sessionItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.lightGray,
    },
    sessionInfo: {
        flex: 1,
    },
    sessionDevice: {
        fontSize: 16,
        color: COLORS.dark,
        fontWeight: '500',
    },
    sessionDetails: {
        fontSize: 14,
        color: COLORS.gray,
        marginTop: 2,
    },
    terminateButton: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        backgroundColor: COLORS.error,
        borderRadius: 15,
    },
    terminateButtonText: {
        color: COLORS.white,
        fontSize: 12,
        fontWeight: 'bold',
    },
    terminateAllButton: {
        marginTop: 15,
        paddingVertical: 12,
        backgroundColor: COLORS.error,
        borderRadius: 8,
        alignItems: 'center',
    },
    terminateAllButtonText: {
        color: COLORS.white,
        fontSize: 16,
        fontWeight: 'bold',
    },
    deleteButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 15,
        backgroundColor: `${COLORS.error}15`,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: COLORS.error,
    },
    deleteButtonText: {
        color: COLORS.error,
        fontSize: 16,
        fontWeight: 'bold',
        marginLeft: 10,
    },
    bottomPadding: {
        height: 50,
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
        fontSize: 18,
        fontWeight: 'bold',
        color: COLORS.dark,
        flex: 1,
        textAlign: 'center',
    },
    closeButton: {
        padding: 8,
    },
    saveButtonText: {
        color: COLORS.primary,
        fontWeight: 'bold',
        fontSize: 16,
    },
    placeholder: {
        width: 40,
    },
    modalContent: {
        flex: 1,
        padding: 20,
    },
    passwordHint: {
        fontSize: 12,
        color: COLORS.gray,
        marginTop: 10,
        lineHeight: 18,
    },
    twoFactorInfo: {
        alignItems: 'center',
        paddingVertical: 40,
    },
    twoFactorTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: COLORS.dark,
        marginTop: 20,
        marginBottom: 15,
    },
    twoFactorDescription: {
        fontSize: 16,
        color: COLORS.gray,
        textAlign: 'center',
        lineHeight: 24,
        paddingHorizontal: 20,
    },
    enableButton: {
        backgroundColor: COLORS.primary,
        paddingVertical: 15,
        borderRadius: 10,
        alignItems: 'center',
        marginTop: 40,
    },
    enableButtonText: {
        color: COLORS.white,
        fontSize: 16,
        fontWeight: 'bold',
    },
});

export default AccountSettingsScreen;
