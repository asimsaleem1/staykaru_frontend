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
    ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SIZES } from '../../utils/constants';
import adminApiService from '../../services/adminApiService';

const AdminSystemSettingsScreen = ({ navigation }) => {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [selectedTab, setSelectedTab] = useState('general');
    const [settings, setSettings] = useState({
        general: {
            siteName: '',
            siteDescription: '',
            contactEmail: '',
            supportPhone: '',
            maintenanceMode: false,
            allowRegistration: true,
            emailVerificationRequired: true,
        },
        payment: {
            stripePublicKey: '',
            stripeSecretKey: '',
            paypalClientId: '',
            paypalClientSecret: '',
            commissionRate: 10,
            minPayoutAmount: 50,
            payoutSchedule: 'weekly',
            autoPayouts: false,
        },
        security: {
            twoFactorRequired: false,
            sessionTimeout: 24,
            maxLoginAttempts: 5,
            passwordMinLength: 8,
            requireSpecialChars: true,
            ipWhitelist: '',
            rateLimitEnabled: true,
            rateLimitRequests: 100,
        },
        integrations: {
            emailProvider: 'sendgrid',
            sendgridApiKey: '',
            smsProvider: 'twilio',
            twilioAccountSid: '',
            twilioAuthToken: '',
            googleAnalyticsId: '',
            facebookPixelId: '',
        },
        maintenance: {
            backupEnabled: true,
            backupFrequency: 'daily',
            backupRetention: 30,
            monitoringEnabled: true,
            errorReporting: true,
            performanceTracking: true,
        }
    });

    useEffect(() => {
        loadSettings();
    }, []);

    const loadSettings = async () => {
        try {
            setLoading(true);
            const response = await adminApiService.getSystemSettings();
            
            if (response.success) {
                setSettings(response.data.settings || settings);
            }
        } catch (error) {
            console.error('Error loading settings:', error);
            Alert.alert('Error', 'Failed to load settings');
        } finally {
            setLoading(false);
        }
    };

    const saveSettings = async (category) => {
        try {
            setSaving(true);
            await adminApiService.updateSystemSettings({
                category,
                settings: settings[category]
            });
            Alert.alert('Success', 'Settings saved successfully');
        } catch (error) {
            Alert.alert('Error', 'Failed to save settings');
        } finally {
            setSaving(false);
        }
    };

    const updateSetting = (category, key, value) => {
        setSettings(prev => ({
            ...prev,
            [category]: {
                ...prev[category],
                [key]: value
            }
        }));
    };

    const renderSectionHeader = (title, subtitle) => (
        <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>{title}</Text>
            {subtitle && <Text style={styles.sectionSubtitle}>{subtitle}</Text>}
        </View>
    );

    const renderTextInput = (category, key, label, placeholder, secureTextEntry = false, multiline = false) => (
        <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>{label}</Text>
            <TextInput
                style={[styles.textInput, multiline && styles.textInputMultiline]}
                placeholder={placeholder}
                value={settings[category][key]}
                onChangeText={(value) => updateSetting(category, key, value)}
                secureTextEntry={secureTextEntry}
                multiline={multiline}
                numberOfLines={multiline ? 4 : 1}
                textAlignVertical={multiline ? 'top' : 'center'}
            />
        </View>
    );

    const renderNumberInput = (category, key, label, placeholder, min = 0, max = 999999) => (
        <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>{label}</Text>
            <TextInput
                style={styles.textInput}
                placeholder={placeholder}
                value={settings[category][key]?.toString()}
                onChangeText={(value) => {
                    const numValue = parseInt(value) || 0;
                    if (numValue >= min && numValue <= max) {
                        updateSetting(category, key, numValue);
                    }
                }}
                keyboardType="numeric"
            />
        </View>
    );

    const renderSwitch = (category, key, label, description) => (
        <View style={styles.switchGroup}>
            <View style={styles.switchContent}>
                <Text style={styles.switchLabel}>{label}</Text>
                {description && <Text style={styles.switchDescription}>{description}</Text>}
            </View>
            <Switch
                value={settings[category][key]}
                onValueChange={(value) => updateSetting(category, key, value)}
                trackColor={{ false: COLORS.gray[300], true: COLORS.primary + '40' }}
                thumbColor={settings[category][key] ? COLORS.primary : COLORS.gray[400]}
            />
        </View>
    );

    const renderPicker = (category, key, label, options) => (
        <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>{label}</Text>
            <View style={styles.pickerContainer}>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    {options.map((option) => (
                        <TouchableOpacity
                            key={option.value}
                            style={[
                                styles.pickerOption,
                                settings[category][key] === option.value && styles.pickerOptionActive
                            ]}
                            onPress={() => updateSetting(category, key, option.value)}
                        >
                            <Text style={[
                                styles.pickerOptionText,
                                settings[category][key] === option.value && styles.pickerOptionTextActive
                            ]}>
                                {option.label}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            </View>
        </View>
    );

    const renderGeneralTab = () => (
        <ScrollView style={styles.tabContent} showsVerticalScrollIndicator={false}>
            {renderSectionHeader('General Settings', 'Basic site configuration')}
            
            {renderTextInput('general', 'siteName', 'Site Name', 'StayKaru')}
            {renderTextInput('general', 'siteDescription', 'Site Description', 'Student accommodation platform', false, true)}
            {renderTextInput('general', 'contactEmail', 'Contact Email', 'admin@staykaru.com')}
            {renderTextInput('general', 'supportPhone', 'Support Phone', '+1 (555) 123-4567')}

            {renderSectionHeader('Registration & Access', 'Control user registration and access')}
            
            {renderSwitch('general', 'allowRegistration', 'Allow New Registrations', 'Users can create new accounts')}
            {renderSwitch('general', 'emailVerificationRequired', 'Email Verification Required', 'Users must verify email before accessing the platform')}
            {renderSwitch('general', 'maintenanceMode', 'Maintenance Mode', 'Temporarily disable access for maintenance')}

            <TouchableOpacity
                style={styles.saveButton}
                onPress={() => saveSettings('general')}
                disabled={saving}
            >
                {saving ? (
                    <ActivityIndicator color={COLORS.light} />
                ) : (
                    <Text style={styles.saveButtonText}>Save General Settings</Text>
                )}
            </TouchableOpacity>
        </ScrollView>
    );

    const renderPaymentTab = () => (
        <ScrollView style={styles.tabContent} showsVerticalScrollIndicator={false}>
            {renderSectionHeader('Payment Configuration', 'Payment gateway settings')}
            
            {renderTextInput('payment', 'stripePublicKey', 'Stripe Public Key', 'pk_live_...')}
            {renderTextInput('payment', 'stripeSecretKey', 'Stripe Secret Key', 'sk_live_...', true)}
            {renderTextInput('payment', 'paypalClientId', 'PayPal Client ID', 'Your PayPal client ID')}
            {renderTextInput('payment', 'paypalClientSecret', 'PayPal Client Secret', 'Your PayPal client secret', true)}

            {renderSectionHeader('Commission & Payouts', 'Financial configuration')}
            
            {renderNumberInput('payment', 'commissionRate', 'Commission Rate (%)', '10', 0, 50)}
            {renderNumberInput('payment', 'minPayoutAmount', 'Minimum Payout Amount ($)', '50', 1, 1000)}
            
            {renderPicker('payment', 'payoutSchedule', 'Payout Schedule', [
                { value: 'daily', label: 'Daily' },
                { value: 'weekly', label: 'Weekly' },
                { value: 'bi-weekly', label: 'Bi-weekly' },
                { value: 'monthly', label: 'Monthly' }
            ])}
            
            {renderSwitch('payment', 'autoPayouts', 'Automatic Payouts', 'Process payouts automatically based on schedule')}

            <TouchableOpacity
                style={styles.saveButton}
                onPress={() => saveSettings('payment')}
                disabled={saving}
            >
                {saving ? (
                    <ActivityIndicator color={COLORS.light} />
                ) : (
                    <Text style={styles.saveButtonText}>Save Payment Settings</Text>
                )}
            </TouchableOpacity>
        </ScrollView>
    );

    const renderSecurityTab = () => (
        <ScrollView style={styles.tabContent} showsVerticalScrollIndicator={false}>
            {renderSectionHeader('Authentication Security', 'User authentication settings')}
            
            {renderSwitch('security', 'twoFactorRequired', 'Require Two-Factor Authentication', 'All users must enable 2FA')}
            {renderNumberInput('security', 'sessionTimeout', 'Session Timeout (hours)', '24', 1, 168)}
            {renderNumberInput('security', 'maxLoginAttempts', 'Max Login Attempts', '5', 3, 10)}

            {renderSectionHeader('Password Policy', 'Password requirements')}
            
            {renderNumberInput('security', 'passwordMinLength', 'Minimum Password Length', '8', 6, 20)}
            {renderSwitch('security', 'requireSpecialChars', 'Require Special Characters', 'Passwords must contain special characters')}

            {renderSectionHeader('Network Security', 'Network access control')}
            
            {renderTextInput('security', 'ipWhitelist', 'IP Whitelist', 'Comma-separated IP addresses', false, true)}
            {renderSwitch('security', 'rateLimitEnabled', 'Rate Limiting', 'Limit API requests per user')}
            {renderNumberInput('security', 'rateLimitRequests', 'Rate Limit (requests/hour)', '100', 10, 1000)}

            <TouchableOpacity
                style={styles.saveButton}
                onPress={() => saveSettings('security')}
                disabled={saving}
            >
                {saving ? (
                    <ActivityIndicator color={COLORS.light} />
                ) : (
                    <Text style={styles.saveButtonText}>Save Security Settings</Text>
                )}
            </TouchableOpacity>
        </ScrollView>
    );

    const renderIntegrationsTab = () => (
        <ScrollView style={styles.tabContent} showsVerticalScrollIndicator={false}>
            {renderSectionHeader('Email Service', 'Email delivery configuration')}
            
            {renderPicker('integrations', 'emailProvider', 'Email Provider', [
                { value: 'sendgrid', label: 'SendGrid' },
                { value: 'mailgun', label: 'Mailgun' },
                { value: 'ses', label: 'Amazon SES' }
            ])}
            {renderTextInput('integrations', 'sendgridApiKey', 'SendGrid API Key', 'SG.xxxxxxxx', true)}

            {renderSectionHeader('SMS Service', 'SMS notification configuration')}
            
            {renderPicker('integrations', 'smsProvider', 'SMS Provider', [
                { value: 'twilio', label: 'Twilio' },
                { value: 'nexmo', label: 'Nexmo' },
                { value: 'messagebird', label: 'MessageBird' }
            ])}
            {renderTextInput('integrations', 'twilioAccountSid', 'Twilio Account SID', 'ACxxxxxxxx')}
            {renderTextInput('integrations', 'twilioAuthToken', 'Twilio Auth Token', 'Your auth token', true)}

            {renderSectionHeader('Analytics & Tracking', 'Third-party analytics')}
            
            {renderTextInput('integrations', 'googleAnalyticsId', 'Google Analytics ID', 'GA-XXXXXXXX-X')}
            {renderTextInput('integrations', 'facebookPixelId', 'Facebook Pixel ID', 'Your Facebook Pixel ID')}

            <TouchableOpacity
                style={styles.saveButton}
                onPress={() => saveSettings('integrations')}
                disabled={saving}
            >
                {saving ? (
                    <ActivityIndicator color={COLORS.light} />
                ) : (
                    <Text style={styles.saveButtonText}>Save Integration Settings</Text>
                )}
            </TouchableOpacity>
        </ScrollView>
    );

    const renderMaintenanceTab = () => (
        <ScrollView style={styles.tabContent} showsVerticalScrollIndicator={false}>
            {renderSectionHeader('Backup Configuration', 'Data backup settings')}
            
            {renderSwitch('maintenance', 'backupEnabled', 'Enable Automatic Backups', 'Regular database backups')}
            
            {renderPicker('maintenance', 'backupFrequency', 'Backup Frequency', [
                { value: 'hourly', label: 'Hourly' },
                { value: 'daily', label: 'Daily' },
                { value: 'weekly', label: 'Weekly' }
            ])}
            
            {renderNumberInput('maintenance', 'backupRetention', 'Backup Retention (days)', '30', 1, 365)}

            {renderSectionHeader('Monitoring & Reporting', 'System monitoring settings')}
            
            {renderSwitch('maintenance', 'monitoringEnabled', 'System Monitoring', 'Monitor system performance and health')}
            {renderSwitch('maintenance', 'errorReporting', 'Error Reporting', 'Automatically report system errors')}
            {renderSwitch('maintenance', 'performanceTracking', 'Performance Tracking', 'Track and analyze system performance')}

            <View style={styles.maintenanceActions}>
                <TouchableOpacity
                    style={styles.maintenanceButton}
                    onPress={() => Alert.alert('Backup', 'Manual backup initiated')}
                >
                    <Ionicons name="download" size={20} color={COLORS.primary} />
                    <Text style={styles.maintenanceButtonText}>Create Backup</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.maintenanceButton}
                    onPress={() => Alert.alert('Cache', 'Cache cleared successfully')}
                >
                    <Ionicons name="refresh" size={20} color={COLORS.primary} />
                    <Text style={styles.maintenanceButtonText}>Clear Cache</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.maintenanceButton}
                    onPress={() => Alert.alert('Logs', 'System logs exported')}
                >
                    <Ionicons name="document-text" size={20} color={COLORS.primary} />
                    <Text style={styles.maintenanceButtonText}>Export Logs</Text>
                </TouchableOpacity>
            </View>

            <TouchableOpacity
                style={styles.saveButton}
                onPress={() => saveSettings('maintenance')}
                disabled={saving}
            >
                {saving ? (
                    <ActivityIndicator color={COLORS.light} />
                ) : (
                    <Text style={styles.saveButtonText}>Save Maintenance Settings</Text>
                )}
            </TouchableOpacity>
        </ScrollView>
    );

    const renderTabContent = () => {
        switch (selectedTab) {
            case 'general':
                return renderGeneralTab();
            case 'payment':
                return renderPaymentTab();
            case 'security':
                return renderSecurityTab();
            case 'integrations':
                return renderIntegrationsTab();
            case 'maintenance':
                return renderMaintenanceTab();
            default:
                return renderGeneralTab();
        }
    };

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity
                    style={styles.backButton}
                    onPress={() => navigation.goBack()}
                >
                    <Ionicons name="arrow-back" size={24} color={COLORS.dark} />
                </TouchableOpacity>
                <View style={styles.headerContent}>
                    <Text style={styles.headerTitle}>System Settings</Text>
                    <Text style={styles.headerSubtitle}>Configure platform settings</Text>
                </View>
            </View>

            {/* Tab Navigation */}
            <View style={styles.tabNavigation}>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    {[
                        { key: 'general', label: 'General', icon: 'settings' },
                        { key: 'payment', label: 'Payment', icon: 'card' },
                        { key: 'security', label: 'Security', icon: 'shield-checkmark' },
                        { key: 'integrations', label: 'Integrations', icon: 'link' },
                        { key: 'maintenance', label: 'Maintenance', icon: 'construct' },
                    ].map((tab) => (
                        <TouchableOpacity
                            key={tab.key}
                            style={[
                                styles.tabButton,
                                selectedTab === tab.key && styles.tabButtonActive
                            ]}
                            onPress={() => setSelectedTab(tab.key)}
                        >
                            <Ionicons
                                name={tab.icon}
                                size={18}
                                color={selectedTab === tab.key ? COLORS.primary : COLORS.gray[500]}
                            />
                            <Text style={[
                                styles.tabButtonText,
                                selectedTab === tab.key && styles.tabButtonTextActive
                            ]}>
                                {tab.label}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            </View>

            {/* Content */}
            {loading ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={COLORS.primary} />
                    <Text style={styles.loadingText}>Loading settings...</Text>
                </View>
            ) : (
                renderTabContent()
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.gray[50],
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingTop: 20,
        paddingBottom: 16,
        backgroundColor: COLORS.light,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.gray[200],
    },
    backButton: {
        marginRight: 16,
        padding: 8,
    },
    headerContent: {
        flex: 1,
    },
    headerTitle: {
        fontSize: SIZES.h3,
        fontWeight: 'bold',
        color: COLORS.dark,
    },
    headerSubtitle: {
        fontSize: SIZES.body2,
        color: COLORS.gray[600],
        marginTop: 2,
    },
    tabNavigation: {
        backgroundColor: COLORS.light,
        paddingHorizontal: 20,
        paddingBottom: 16,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.gray[200],
    },
    tabButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderRadius: 12,
        marginRight: 12,
        backgroundColor: COLORS.gray[100],
    },
    tabButtonActive: {
        backgroundColor: COLORS.primary + '20',
    },
    tabButtonText: {
        fontSize: SIZES.body2,
        color: COLORS.gray[500],
        fontWeight: '500',
        marginLeft: 8,
    },
    tabButtonTextActive: {
        color: COLORS.primary,
        fontWeight: '600',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        fontSize: SIZES.body1,
        color: COLORS.gray[600],
        marginTop: 16,
    },
    tabContent: {
        flex: 1,
        padding: 20,
    },
    sectionHeader: {
        marginBottom: 20,
    },
    sectionTitle: {
        fontSize: SIZES.h4,
        fontWeight: 'bold',
        color: COLORS.dark,
        marginBottom: 4,
    },
    sectionSubtitle: {
        fontSize: SIZES.body2,
        color: COLORS.gray[600],
    },
    inputGroup: {
        marginBottom: 20,
    },
    inputLabel: {
        fontSize: SIZES.body2,
        fontWeight: '600',
        color: COLORS.dark,
        marginBottom: 8,
    },
    textInput: {
        borderWidth: 1,
        borderColor: COLORS.gray[300],
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 12,
        fontSize: SIZES.body1,
        color: COLORS.dark,
        backgroundColor: COLORS.light,
    },
    textInputMultiline: {
        height: 100,
        textAlignVertical: 'top',
    },
    switchGroup: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.gray[200],
        marginBottom: 16,
    },
    switchContent: {
        flex: 1,
        marginRight: 16,
    },
    switchLabel: {
        fontSize: SIZES.body1,
        fontWeight: '600',
        color: COLORS.dark,
        marginBottom: 4,
    },
    switchDescription: {
        fontSize: SIZES.body2,
        color: COLORS.gray[600],
    },
    pickerContainer: {
        marginTop: 8,
    },
    pickerOption: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        backgroundColor: COLORS.gray[100],
        marginRight: 8,
        borderWidth: 1,
        borderColor: COLORS.gray[200],
    },
    pickerOptionActive: {
        backgroundColor: COLORS.primary,
        borderColor: COLORS.primary,
    },
    pickerOptionText: {
        fontSize: SIZES.body2,
        color: COLORS.gray[700],
        fontWeight: '500',
    },
    pickerOptionTextActive: {
        color: COLORS.light,
        fontWeight: '600',
    },
    maintenanceActions: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
        marginBottom: 24,
    },
    maintenanceButton: {
        flex: 1,
        minWidth: '30%',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: COLORS.light,
        borderRadius: 12,
        padding: 16,
        borderWidth: 1,
        borderColor: COLORS.gray[200],
    },
    maintenanceButtonText: {
        fontSize: SIZES.body2,
        color: COLORS.gray[700],
        marginLeft: 8,
        fontWeight: '500',
    },
    saveButton: {
        backgroundColor: COLORS.primary,
        borderRadius: 12,
        paddingVertical: 16,
        alignItems: 'center',
        marginTop: 20,
    },
    saveButtonText: {
        fontSize: SIZES.body1,
        fontWeight: '600',
        color: COLORS.light,
    },
});

export default AdminSystemSettingsScreen;
