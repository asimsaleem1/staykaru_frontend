import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    ScrollView,
    StyleSheet,
    TouchableOpacity,
    Switch,
    Alert,
    Share,
    Linking
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

const AccountSettingsScreen = ({ navigation }) => {
    const [settings, setSettings] = useState({
        notifications: {
            push: true,
            email: true,
            sms: false,
            booking: true,
            orders: true,
            promotions: false,
            updates: true
        },
        privacy: {
            profileVisible: true,
            showLocation: false,
            allowDataCollection: false,
            shareWithPartners: false
        },
        preferences: {
            darkMode: false,
            language: 'English',
            currency: 'USD',
            distanceUnit: 'Miles',
            autoRefresh: true
        },
        security: {
            biometric: false,
            twoFactor: false,
            sessionTimeout: '30'
        }
    });

    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadSettings();
    }, []);

    const loadSettings = async () => {
        try {
            setLoading(true);
            const savedSettings = await AsyncStorage.getItem('userSettings');
            if (savedSettings) {
                setSettings({ ...settings, ...JSON.parse(savedSettings) });
            }
        } catch (error) {
            console.error('Error loading settings:', error);
        } finally {
            setLoading(false);
        }
    };

    const saveSettings = async (newSettings) => {
        try {
            await AsyncStorage.setItem('userSettings', JSON.stringify(newSettings));
            setSettings(newSettings);
        } catch (error) {
            console.error('Error saving settings:', error);
            Alert.alert('Error', 'Failed to save settings');
        }
    };

    const updateNotificationSetting = (key, value) => {
        const newSettings = {
            ...settings,
            notifications: {
                ...settings.notifications,
                [key]: value
            }
        };
        saveSettings(newSettings);
    };

    const updatePrivacySetting = (key, value) => {
        const newSettings = {
            ...settings,
            privacy: {
                ...settings.privacy,
                [key]: value
            }
        };
        saveSettings(newSettings);
    };

    const updatePreferenceSetting = (key, value) => {
        const newSettings = {
            ...settings,
            preferences: {
                ...settings.preferences,
                [key]: value
            }
        };
        saveSettings(newSettings);
    };

    const updateSecuritySetting = (key, value) => {
        const newSettings = {
            ...settings,
            security: {
                ...settings.security,
                [key]: value
            }
        };
        saveSettings(newSettings);
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
                            await AsyncStorage.multiRemove(['token', 'user', 'userData']);
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

    const handleDeleteAccount = () => {
        Alert.alert(
            'Delete Account',
            'This action cannot be undone. All your data will be permanently deleted.',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: () => {
                        Alert.alert('Coming Soon', 'Account deletion will be available soon. Please contact support for assistance.');
                    }
                }
            ]
        );
    };

    const shareApp = async () => {
        try {
            await Share.share({
                message: 'Check out StayKaru - the best app for student accommodation and food delivery!',
                url: 'https://staykaru.com',
                title: 'StayKaru App'
            });
        } catch (error) {
            console.error('Error sharing:', error);
        }
    };

    const contactSupport = () => {
        Alert.alert(
            'Contact Support',
            'How would you like to contact us?',
            [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Email', onPress: () => Linking.openURL('mailto:support@staykaru.com') },
                { text: 'Phone', onPress: () => Linking.openURL('tel:+1234567890') },
                { text: 'Chat', onPress: () => navigation.navigate('Support') }
            ]
        );
    };

    const renderSettingItem = (title, value, onToggle, description = null) => (
        <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
                <Text style={styles.settingTitle}>{title}</Text>
                {description && <Text style={styles.settingDescription}>{description}</Text>}
            </View>
            <Switch
                value={value}
                onValueChange={onToggle}
                trackColor={{ false: '#e1e8ed', true: '#3498db' }}
                thumbColor={value ? '#ffffff' : '#f4f3f4'}
            />
        </View>
    );

    const renderActionItem = (icon, title, subtitle, onPress, color = '#2c3e50', showArrow = true) => (
        <TouchableOpacity style={styles.actionItem} onPress={onPress}>
            <View style={styles.actionInfo}>
                <Icon name={icon} size={24} color={color} />
                <View style={styles.actionText}>
                    <Text style={[styles.actionTitle, { color }]}>{title}</Text>
                    {subtitle && <Text style={styles.actionSubtitle}>{subtitle}</Text>}
                </View>
            </View>
            {showArrow && <Icon name="chevron-right" size={20} color="#bdc3c7" />}
        </TouchableOpacity>
    );

    return (
        <SafeAreaView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity 
                    style={styles.backButton}
                    onPress={() => navigation.goBack()}
                >
                    <Ionicons name="arrow-back" size={24} color="#2c3e50" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Settings</Text>
                <View style={styles.headerSpacer} />
            </View>

            <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
                {/* Account Section */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Account</Text>
                    {renderActionItem('person', 'Edit Profile', 'Update your personal information', 
                        () => navigation.navigate('StudentProfile'))}
                    {renderActionItem('payment', 'Payment Methods', 'Manage cards and payment options', 
                        () => navigation.navigate('PaymentMethods'))}
                    {renderActionItem('bookmark', 'Saved Places', 'View your favorite accommodations', 
                        () => navigation.navigate('Favorites'))}
                    {renderActionItem('history', 'Booking History', 'View past bookings and orders', 
                        () => navigation.navigate('MyBookings'))}
                </View>

                {/* Notifications Section */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Notifications</Text>
                    {renderSettingItem(
                        'Push Notifications',
                        settings.notifications.push,
                        (value) => updateNotificationSetting('push', value),
                        'Receive notifications on your device'
                    )}
                    {renderSettingItem(
                        'Email Notifications',
                        settings.notifications.email,
                        (value) => updateNotificationSetting('email', value),
                        'Receive email updates and confirmations'
                    )}
                    {renderSettingItem(
                        'SMS Notifications',
                        settings.notifications.sms,
                        (value) => updateNotificationSetting('sms', value),
                        'Get text messages for important updates'
                    )}
                    {renderSettingItem(
                        'Booking Updates',
                        settings.notifications.booking,
                        (value) => updateNotificationSetting('booking', value)
                    )}
                    {renderSettingItem(
                        'Order Updates',
                        settings.notifications.orders,
                        (value) => updateNotificationSetting('orders', value)
                    )}
                    {renderSettingItem(
                        'Promotions',
                        settings.notifications.promotions,
                        (value) => updateNotificationSetting('promotions', value),
                        'Receive special offers and deals'
                    )}
                </View>

                {/* Privacy Section */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Privacy</Text>
                    {renderSettingItem(
                        'Profile Visibility',
                        settings.privacy.profileVisible,
                        (value) => updatePrivacySetting('profileVisible', value),
                        'Make your profile visible to other users'
                    )}
                    {renderSettingItem(
                        'Share Location',
                        settings.privacy.showLocation,
                        (value) => updatePrivacySetting('showLocation', value),
                        'Allow app to use your location for better recommendations'
                    )}
                    {renderSettingItem(
                        'Data Collection',
                        settings.privacy.allowDataCollection,
                        (value) => updatePrivacySetting('allowDataCollection', value),
                        'Help improve the app with usage analytics'
                    )}
                </View>

                {/* Preferences Section */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Preferences</Text>
                    {renderSettingItem(
                        'Dark Mode',
                        settings.preferences.darkMode,
                        (value) => updatePreferenceSetting('darkMode', value),
                        'Use dark theme throughout the app'
                    )}
                    {renderActionItem('language', 'Language', settings.preferences.language, 
                        () => Alert.alert('Coming Soon', 'Multiple languages will be available soon'))}
                    {renderActionItem('attach-money', 'Currency', settings.preferences.currency, 
                        () => Alert.alert('Coming Soon', 'Currency selection will be available soon'))}
                    {renderSettingItem(
                        'Auto Refresh',
                        settings.preferences.autoRefresh,
                        (value) => updatePreferenceSetting('autoRefresh', value),
                        'Automatically refresh data when app opens'
                    )}
                </View>

                {/* Security Section */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Security</Text>
                    {renderSettingItem(
                        'Biometric Login',
                        settings.security.biometric,
                        (value) => updateSecuritySetting('biometric', value),
                        'Use fingerprint or face recognition to login'
                    )}
                    {renderSettingItem(
                        'Two-Factor Authentication',
                        settings.security.twoFactor,
                        (value) => updateSecuritySetting('twoFactor', value),
                        'Add extra security to your account'
                    )}
                    {renderActionItem('lock', 'Change Password', 'Update your account password', 
                        () => navigation.navigate('ChangePassword'))}
                    {renderActionItem('security', 'Privacy Policy', 'Read our privacy policy', 
                        () => navigation.navigate('PrivacyPolicy'))}
                </View>

                {/* Support Section */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Support</Text>
                    {renderActionItem('help', 'Help Center', 'Get help and support', 
                        () => navigation.navigate('Support'))}
                    {renderActionItem('feedback', 'Send Feedback', 'Tell us what you think', 
                        () => navigation.navigate('Feedback'))}
                    {renderActionItem('share', 'Share App', 'Invite friends to StayKaru', shareApp)}
                    {renderActionItem('support', 'Contact Support', 'Get in touch with our team', contactSupport)}
                    {renderActionItem('star-rate', 'Rate App', 'Rate us on the app store', 
                        () => Alert.alert('Coming Soon', 'App store rating will be available soon'))}
                </View>

                {/* About Section */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>About</Text>
                    {renderActionItem('info', 'Terms of Service', 'Read our terms and conditions', 
                        () => navigation.navigate('TermsOfService'))}
                    {renderActionItem('description', 'About StayKaru', 'Learn more about our app', 
                        () => navigation.navigate('AboutApp'))}
                    <View style={styles.versionInfo}>
                        <Text style={styles.versionText}>Version 2.0.0</Text>
                        <Text style={styles.buildText}>Build 2025.06.24</Text>
                    </View>
                </View>

                {/* Danger Zone */}
                <View style={[styles.section, styles.dangerSection]}>
                    <Text style={[styles.sectionTitle, styles.dangerTitle]}>Account Actions</Text>
                    {renderActionItem('logout', 'Logout', 'Sign out of your account', handleLogout, '#e74c3c', false)}
                    {renderActionItem('delete-forever', 'Delete Account', 'Permanently delete your account', 
                        handleDeleteAccount, '#e74c3c', false)}
                </View>

                <View style={styles.bottomSpacer} />
            </ScrollView>
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
    headerSpacer: {
        width: 40,
    },
    scrollContainer: {
        flex: 1,
    },
    section: {
        backgroundColor: '#fff',
        marginTop: 12,
        paddingVertical: 8,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#2c3e50',
        paddingHorizontal: 16,
        paddingVertical: 12,
        backgroundColor: '#f8f9fa',
    },
    settingItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#ecf0f1',
    },
    settingInfo: {
        flex: 1,
        marginRight: 12,
    },
    settingTitle: {
        fontSize: 16,
        color: '#2c3e50',
        marginBottom: 2,
    },
    settingDescription: {
        fontSize: 14,
        color: '#7f8c8d',
        lineHeight: 18,
    },
    actionItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#ecf0f1',
    },
    actionInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    actionText: {
        marginLeft: 12,
        flex: 1,
    },
    actionTitle: {
        fontSize: 16,
        fontWeight: '500',
        marginBottom: 2,
    },
    actionSubtitle: {
        fontSize: 14,
        color: '#7f8c8d',
    },
    versionInfo: {
        paddingHorizontal: 16,
        paddingVertical: 12,
        alignItems: 'center',
    },
    versionText: {
        fontSize: 14,
        color: '#7f8c8d',
        fontWeight: '500',
    },
    buildText: {
        fontSize: 12,
        color: '#95a5a6',
        marginTop: 2,
    },
    dangerSection: {
        marginTop: 20,
    },
    dangerTitle: {
        color: '#e74c3c',
    },
    bottomSpacer: {
        height: 40,
    },
});

export default AccountSettingsScreen;
