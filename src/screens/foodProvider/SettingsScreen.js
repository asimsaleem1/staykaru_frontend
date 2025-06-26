import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    RefreshControl,
    Alert,
    Modal,
    TextInput,
    Switch,
    Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SIZES } from '../../utils/constants';
import { fetchFromBackend } from '../../utils/networkUtils';
import { pickImage } from '../../services/imageService';
import authService from '../../services/authService';

const SettingsScreen = ({ navigation }) => {
    const [providerData, setProviderData] = useState({
        business_name: '',
        description: '',
        phone: '',
        email: '',
        address: '',
        logo: null,
        cover_image: null,
        business_hours: {
            monday: { open: '09:00', close: '22:00', isOpen: true },
            tuesday: { open: '09:00', close: '22:00', isOpen: true },
            wednesday: { open: '09:00', close: '22:00', isOpen: true },
            thursday: { open: '09:00', close: '22:00', isOpen: true },
            friday: { open: '09:00', close: '22:00', isOpen: true },
            saturday: { open: '09:00', close: '22:00', isOpen: true },
            sunday: { open: '10:00', close: '21:00', isOpen: false },
        },
        delivery_settings: {
            delivery_fee: '',
            min_order_amount: '',
            max_delivery_distance: '',
            estimated_delivery_time: '',
            free_delivery_threshold: '',
        },
        notification_settings: {
            new_orders: true,
            order_updates: true,
            reviews: true,
            promotions: false,
            marketing: false,
        },
        payment_settings: {
            cash_on_delivery: true,
            online_payment: true,
            bank_details: {
                account_holder: '',
                account_number: '',
                bank_name: '',
                routing_number: '',
            }
        }
    });
    
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [refreshing, setRefreshing] = useState(false);
    const [activeSection, setActiveSection] = useState('business');
    const [hoursModalVisible, setHoursModalVisible] = useState(false);
    const [selectedDay, setSelectedDay] = useState(null);

    const settingSections = [
        { id: 'business', label: 'Business Info', icon: 'business-outline' },
        { id: 'hours', label: 'Business Hours', icon: 'time-outline' },
        { id: 'delivery', label: 'Delivery Settings', icon: 'bicycle-outline' },
        { id: 'payments', label: 'Payment Settings', icon: 'card-outline' },
        { id: 'notifications', label: 'Notifications', icon: 'notifications-outline' },
        { id: 'account', label: 'Account', icon: 'person-outline' },
    ];

    const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

    useEffect(() => {
        loadProviderSettings();
    }, []);

    const loadProviderSettings = async () => {
        setLoading(true);
        try {
            const user = await authService.getCurrentUser();
            const response = await fetchFromBackend(`/food-providers/${user.id}/settings`);
            if (response?.success) {
                setProviderData({ ...providerData, ...response.data });
            }
        } catch (error) {
            console.error('Error loading settings:', error);
            Alert.alert('Error', 'Failed to load settings');
        } finally {
            setLoading(false);
        }
    };

    const handleRefresh = async () => {
        setRefreshing(true);
        await loadProviderSettings();
        setRefreshing(false);
    };

    const saveSettings = async () => {
        setSaving(true);
        try {
            const user = await authService.getCurrentUser();
            const response = await fetchFromBackend(`/food-providers/${user.id}/settings`, {
                method: 'PUT',
                body: JSON.stringify(providerData)
            });

            if (response?.success) {
                Alert.alert('Success', 'Settings saved successfully');
            }
        } catch (error) {
            console.error('Error saving settings:', error);
            Alert.alert('Error', 'Failed to save settings');
        } finally {
            setSaving(false);
        }
    };

    const pickBusinessImage = async (type) => {
        try {
            const image = await pickImage();
            if (image) {
                setProviderData({
                    ...providerData,
                    [type]: image.uri
                });
            }
        } catch (error) {
            console.error('Error picking image:', error);
            Alert.alert('Error', 'Failed to pick image');
        }
    };

    const formatTime = (time) => {
        const [hour, minute] = time.split(':');
        const hourInt = parseInt(hour);
        const ampm = hourInt >= 12 ? 'PM' : 'AM';
        const displayHour = hourInt === 0 ? 12 : hourInt > 12 ? hourInt - 12 : hourInt;
        return `${displayHour}:${minute} ${ampm}`;
    };

    const renderBusinessInfoSection = () => (
        <View style={styles.section}>
            <Text style={styles.sectionTitle}>Business Information</Text>
            
            <View style={styles.imageUploadSection}>
                <View style={styles.imageUpload}>
                    <Text style={styles.imageLabel}>Business Logo</Text>
                    <TouchableOpacity
                        style={styles.imagePicker}
                        onPress={() => pickBusinessImage('logo')}
                    >
                        {providerData.logo ? (
                            <Image source={{ uri: providerData.logo }} style={styles.uploadedImage} />
                        ) : (
                            <View style={styles.imagePlaceholder}>
                                <Ionicons name="camera-outline" size={32} color={COLORS.gray} />
                                <Text style={styles.placeholderText}>Upload Logo</Text>
                            </View>
                        )}
                    </TouchableOpacity>
                </View>

                <View style={styles.imageUpload}>
                    <Text style={styles.imageLabel}>Cover Image</Text>
                    <TouchableOpacity
                        style={[styles.imagePicker, styles.coverImagePicker]}
                        onPress={() => pickBusinessImage('cover_image')}
                    >
                        {providerData.cover_image ? (
                            <Image source={{ uri: providerData.cover_image }} style={styles.coverImage} />
                        ) : (
                            <View style={styles.imagePlaceholder}>
                                <Ionicons name="image-outline" size={32} color={COLORS.gray} />
                                <Text style={styles.placeholderText}>Upload Cover</Text>
                            </View>
                        )}
                    </TouchableOpacity>
                </View>
            </View>

            <View style={styles.formField}>
                <Text style={styles.fieldLabel}>Business Name</Text>
                <TextInput
                    style={styles.textInput}
                    value={providerData.business_name}
                    onChangeText={(text) => setProviderData({ ...providerData, business_name: text })}
                    placeholder="Enter business name"
                />
            </View>

            <View style={styles.formField}>
                <Text style={styles.fieldLabel}>Description</Text>
                <TextInput
                    style={[styles.textInput, styles.textArea]}
                    value={providerData.description}
                    onChangeText={(text) => setProviderData({ ...providerData, description: text })}
                    placeholder="Describe your business"
                    multiline
                    numberOfLines={4}
                />
            </View>

            <View style={styles.formField}>
                <Text style={styles.fieldLabel}>Phone Number</Text>
                <TextInput
                    style={styles.textInput}
                    value={providerData.phone}
                    onChangeText={(text) => setProviderData({ ...providerData, phone: text })}
                    placeholder="Enter phone number"
                    keyboardType="phone-pad"
                />
            </View>

            <View style={styles.formField}>
                <Text style={styles.fieldLabel}>Email</Text>
                <TextInput
                    style={styles.textInput}
                    value={providerData.email}
                    onChangeText={(text) => setProviderData({ ...providerData, email: text })}
                    placeholder="Enter email address"
                    keyboardType="email-address"
                    autoCapitalize="none"
                />
            </View>

            <View style={styles.formField}>
                <Text style={styles.fieldLabel}>Business Address</Text>
                <TextInput
                    style={[styles.textInput, styles.textArea]}
                    value={providerData.address}
                    onChangeText={(text) => setProviderData({ ...providerData, address: text })}
                    placeholder="Enter complete business address"
                    multiline
                    numberOfLines={3}
                />
            </View>
        </View>
    );

    const renderBusinessHoursSection = () => (
        <View style={styles.section}>
            <Text style={styles.sectionTitle}>Business Hours</Text>
            {days.map((day) => {
                const dayData = providerData.business_hours[day];
                return (
                    <View key={day} style={styles.dayRow}>
                        <View style={styles.dayInfo}>
                            <Text style={styles.dayName}>
                                {day.charAt(0).toUpperCase() + day.slice(1)}
                            </Text>
                            <Switch
                                value={dayData.isOpen}
                                onValueChange={(value) => setProviderData({
                                    ...providerData,
                                    business_hours: {
                                        ...providerData.business_hours,
                                        [day]: { ...dayData, isOpen: value }
                                    }
                                })}
                                trackColor={{ false: COLORS.lightGray, true: COLORS.primary }}
                            />
                        </View>
                        {dayData.isOpen && (
                            <TouchableOpacity
                                style={styles.timeSelector}
                                onPress={() => {
                                    setSelectedDay(day);
                                    setHoursModalVisible(true);
                                }}
                            >
                                <Text style={styles.timeText}>
                                    {formatTime(dayData.open)} - {formatTime(dayData.close)}
                                </Text>
                                <Ionicons name="chevron-forward" size={20} color={COLORS.gray} />
                            </TouchableOpacity>
                        )}
                        {!dayData.isOpen && (
                            <Text style={styles.closedText}>Closed</Text>
                        )}
                    </View>
                );
            })}
        </View>
    );

    const renderDeliverySettingsSection = () => (
        <View style={styles.section}>
            <Text style={styles.sectionTitle}>Delivery Settings</Text>
            
            <View style={styles.formField}>
                <Text style={styles.fieldLabel}>Delivery Fee (₨)</Text>
                <TextInput
                    style={styles.textInput}
                    value={providerData.delivery_settings.delivery_fee}
                    onChangeText={(text) => setProviderData({
                        ...providerData,
                        delivery_settings: { ...providerData.delivery_settings, delivery_fee: text }
                    })}
                    placeholder="0"
                    keyboardType="numeric"
                />
            </View>

            <View style={styles.formField}>
                <Text style={styles.fieldLabel}>Minimum Order Amount (₨)</Text>
                <TextInput
                    style={styles.textInput}
                    value={providerData.delivery_settings.min_order_amount}
                    onChangeText={(text) => setProviderData({
                        ...providerData,
                        delivery_settings: { ...providerData.delivery_settings, min_order_amount: text }
                    })}
                    placeholder="0"
                    keyboardType="numeric"
                />
            </View>

            <View style={styles.formField}>
                <Text style={styles.fieldLabel}>Maximum Delivery Distance (km)</Text>
                <TextInput
                    style={styles.textInput}
                    value={providerData.delivery_settings.max_delivery_distance}
                    onChangeText={(text) => setProviderData({
                        ...providerData,
                        delivery_settings: { ...providerData.delivery_settings, max_delivery_distance: text }
                    })}
                    placeholder="5"
                    keyboardType="numeric"
                />
            </View>

            <View style={styles.formField}>
                <Text style={styles.fieldLabel}>Estimated Delivery Time (minutes)</Text>
                <TextInput
                    style={styles.textInput}
                    value={providerData.delivery_settings.estimated_delivery_time}
                    onChangeText={(text) => setProviderData({
                        ...providerData,
                        delivery_settings: { ...providerData.delivery_settings, estimated_delivery_time: text }
                    })}
                    placeholder="30"
                    keyboardType="numeric"
                />
            </View>

            <View style={styles.formField}>
                <Text style={styles.fieldLabel}>Free Delivery Threshold (₨)</Text>
                <TextInput
                    style={styles.textInput}
                    value={providerData.delivery_settings.free_delivery_threshold}
                    onChangeText={(text) => setProviderData({
                        ...providerData,
                        delivery_settings: { ...providerData.delivery_settings, free_delivery_threshold: text }
                    })}
                    placeholder="500"
                    keyboardType="numeric"
                />
            </View>
        </View>
    );

    const renderPaymentSettingsSection = () => (
        <View style={styles.section}>
            <Text style={styles.sectionTitle}>Payment Methods</Text>
            
            <View style={styles.switchRow}>
                <Text style={styles.switchLabel}>Cash on Delivery</Text>
                <Switch
                    value={providerData.payment_settings.cash_on_delivery}
                    onValueChange={(value) => setProviderData({
                        ...providerData,
                        payment_settings: { ...providerData.payment_settings, cash_on_delivery: value }
                    })}
                    trackColor={{ false: COLORS.lightGray, true: COLORS.primary }}
                />
            </View>

            <View style={styles.switchRow}>
                <Text style={styles.switchLabel}>Online Payment</Text>
                <Switch
                    value={providerData.payment_settings.online_payment}
                    onValueChange={(value) => setProviderData({
                        ...providerData,
                        payment_settings: { ...providerData.payment_settings, online_payment: value }
                    })}
                    trackColor={{ false: COLORS.lightGray, true: COLORS.primary }}
                />
            </View>

            {providerData.payment_settings.online_payment && (
                <>
                    <Text style={styles.sectionSubtitle}>Bank Details for Payments</Text>
                    
                    <View style={styles.formField}>
                        <Text style={styles.fieldLabel}>Account Holder Name</Text>
                        <TextInput
                            style={styles.textInput}
                            value={providerData.payment_settings.bank_details.account_holder}
                            onChangeText={(text) => setProviderData({
                                ...providerData,
                                payment_settings: {
                                    ...providerData.payment_settings,
                                    bank_details: { ...providerData.payment_settings.bank_details, account_holder: text }
                                }
                            })}
                            placeholder="Account holder name"
                        />
                    </View>

                    <View style={styles.formField}>
                        <Text style={styles.fieldLabel}>Account Number</Text>
                        <TextInput
                            style={styles.textInput}
                            value={providerData.payment_settings.bank_details.account_number}
                            onChangeText={(text) => setProviderData({
                                ...providerData,
                                payment_settings: {
                                    ...providerData.payment_settings,
                                    bank_details: { ...providerData.payment_settings.bank_details, account_number: text }
                                }
                            })}
                            placeholder="Account number"
                            keyboardType="numeric"
                        />
                    </View>

                    <View style={styles.formField}>
                        <Text style={styles.fieldLabel}>Bank Name</Text>
                        <TextInput
                            style={styles.textInput}
                            value={providerData.payment_settings.bank_details.bank_name}
                            onChangeText={(text) => setProviderData({
                                ...providerData,
                                payment_settings: {
                                    ...providerData.payment_settings,
                                    bank_details: { ...providerData.payment_settings.bank_details, bank_name: text }
                                }
                            })}
                            placeholder="Bank name"
                        />
                    </View>

                    <View style={styles.formField}>
                        <Text style={styles.fieldLabel}>Routing Number</Text>
                        <TextInput
                            style={styles.textInput}
                            value={providerData.payment_settings.bank_details.routing_number}
                            onChangeText={(text) => setProviderData({
                                ...providerData,
                                payment_settings: {
                                    ...providerData.payment_settings,
                                    bank_details: { ...providerData.payment_settings.bank_details, routing_number: text }
                                }
                            })}
                            placeholder="Routing number"
                            keyboardType="numeric"
                        />
                    </View>
                </>
            )}
        </View>
    );

    const renderNotificationSettingsSection = () => (
        <View style={styles.section}>
            <Text style={styles.sectionTitle}>Notification Preferences</Text>
            
            <View style={styles.switchRow}>
                <View style={styles.notificationInfo}>
                    <Text style={styles.switchLabel}>New Orders</Text>
                    <Text style={styles.notificationDesc}>Get notified when you receive new orders</Text>
                </View>
                <Switch
                    value={providerData.notification_settings.new_orders}
                    onValueChange={(value) => setProviderData({
                        ...providerData,
                        notification_settings: { ...providerData.notification_settings, new_orders: value }
                    })}
                    trackColor={{ false: COLORS.lightGray, true: COLORS.primary }}
                />
            </View>

            <View style={styles.switchRow}>
                <View style={styles.notificationInfo}>
                    <Text style={styles.switchLabel}>Order Updates</Text>
                    <Text style={styles.notificationDesc}>Get notified about order status changes</Text>
                </View>
                <Switch
                    value={providerData.notification_settings.order_updates}
                    onValueChange={(value) => setProviderData({
                        ...providerData,
                        notification_settings: { ...providerData.notification_settings, order_updates: value }
                    })}
                    trackColor={{ false: COLORS.lightGray, true: COLORS.primary }}
                />
            </View>

            <View style={styles.switchRow}>
                <View style={styles.notificationInfo}>
                    <Text style={styles.switchLabel}>Reviews & Ratings</Text>
                    <Text style={styles.notificationDesc}>Get notified when customers leave reviews</Text>
                </View>
                <Switch
                    value={providerData.notification_settings.reviews}
                    onValueChange={(value) => setProviderData({
                        ...providerData,
                        notification_settings: { ...providerData.notification_settings, reviews: value }
                    })}
                    trackColor={{ false: COLORS.lightGray, true: COLORS.primary }}
                />
            </View>

            <View style={styles.switchRow}>
                <View style={styles.notificationInfo}>
                    <Text style={styles.switchLabel}>Promotions</Text>
                    <Text style={styles.notificationDesc}>Get notified about promotional opportunities</Text>
                </View>
                <Switch
                    value={providerData.notification_settings.promotions}
                    onValueChange={(value) => setProviderData({
                        ...providerData,
                        notification_settings: { ...providerData.notification_settings, promotions: value }
                    })}
                    trackColor={{ false: COLORS.lightGray, true: COLORS.primary }}
                />
            </View>

            <View style={styles.switchRow}>
                <View style={styles.notificationInfo}>
                    <Text style={styles.switchLabel}>Marketing Messages</Text>
                    <Text style={styles.notificationDesc}>Receive marketing and promotional messages</Text>
                </View>
                <Switch
                    value={providerData.notification_settings.marketing}
                    onValueChange={(value) => setProviderData({
                        ...providerData,
                        notification_settings: { ...providerData.notification_settings, marketing: value }
                    })}
                    trackColor={{ false: COLORS.lightGray, true: COLORS.primary }}
                />
            </View>
        </View>
    );

    const renderAccountSection = () => (
        <View style={styles.section}>
            <Text style={styles.sectionTitle}>Account Management</Text>
            
            <TouchableOpacity style={styles.accountOption}>
                <Ionicons name="key-outline" size={24} color={COLORS.primary} />
                <Text style={styles.optionText}>Change Password</Text>
                <Ionicons name="chevron-forward" size={20} color={COLORS.gray} />
            </TouchableOpacity>

            <TouchableOpacity style={styles.accountOption}>
                <Ionicons name="shield-checkmark-outline" size={24} color={COLORS.success} />
                <Text style={styles.optionText}>Privacy Settings</Text>
                <Ionicons name="chevron-forward" size={20} color={COLORS.gray} />
            </TouchableOpacity>

            <TouchableOpacity style={styles.accountOption}>
                <Ionicons name="help-circle-outline" size={24} color={COLORS.info} />
                <Text style={styles.optionText}>Help & Support</Text>
                <Ionicons name="chevron-forward" size={20} color={COLORS.gray} />
            </TouchableOpacity>

            <TouchableOpacity style={styles.accountOption}>
                <Ionicons name="document-text-outline" size={24} color={COLORS.dark} />
                <Text style={styles.optionText}>Terms & Conditions</Text>
                <Ionicons name="chevron-forward" size={20} color={COLORS.gray} />
            </TouchableOpacity>

            <TouchableOpacity 
                style={[styles.accountOption, styles.dangerOption]}
                onPress={() => {
                    Alert.alert(
                        'Delete Account',
                        'Are you sure you want to delete your account? This action cannot be undone.',
                        [
                            { text: 'Cancel', style: 'cancel' },
                            { text: 'Delete', style: 'destructive', onPress: () => {
                                // Handle account deletion
                                Alert.alert('Feature Coming Soon', 'Account deletion will be available soon.');
                            }}
                        ]
                    );
                }}
            >
                <Ionicons name="trash-outline" size={24} color={COLORS.error} />
                <Text style={[styles.optionText, { color: COLORS.error }]}>Delete Account</Text>
                <Ionicons name="chevron-forward" size={20} color={COLORS.gray} />
            </TouchableOpacity>
        </View>
    );

    const renderActiveSection = () => {
        switch (activeSection) {
            case 'business':
                return renderBusinessInfoSection();
            case 'hours':
                return renderBusinessHoursSection();
            case 'delivery':
                return renderDeliverySettingsSection();
            case 'payments':
                return renderPaymentSettingsSection();
            case 'notifications':
                return renderNotificationSettingsSection();
            case 'account':
                return renderAccountSection();
            default:
                return renderBusinessInfoSection();
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
                <Text style={styles.headerTitle}>Settings</Text>
                <TouchableOpacity
                    onPress={saveSettings}
                    style={styles.saveButton}
                    disabled={saving}
                >
                    <Ionicons 
                        name={saving ? "hourglass-outline" : "checkmark"} 
                        size={24} 
                        color={COLORS.white} 
                    />
                </TouchableOpacity>
            </View>

            <View style={styles.tabContainer}>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    {settingSections.map((section) => (
                        <TouchableOpacity
                            key={section.id}
                            style={[
                                styles.tab,
                                activeSection === section.id && styles.activeTab
                            ]}
                            onPress={() => setActiveSection(section.id)}
                        >
                            <Ionicons 
                                name={section.icon} 
                                size={20} 
                                color={activeSection === section.id ? COLORS.primary : COLORS.gray} 
                            />
                            <Text style={[
                                styles.tabText,
                                activeSection === section.id && styles.activeTabText
                            ]}>
                                {section.label}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            </View>

            <ScrollView
                style={styles.content}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
                }
                showsVerticalScrollIndicator={false}
            >
                {renderActiveSection()}
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
    tabContainer: {
        backgroundColor: COLORS.white,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    tab: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 15,
        paddingVertical: 12,
        marginHorizontal: 5,
        borderBottomWidth: 3,
        borderBottomColor: 'transparent',
    },
    activeTab: {
        borderBottomColor: COLORS.primary,
    },
    tabText: {
        fontSize: 12,
        color: COLORS.gray,
        marginLeft: 5,
        fontWeight: '500',
    },
    activeTabText: {
        color: COLORS.primary,
        fontWeight: 'bold',
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
        marginBottom: 20,
    },
    sectionSubtitle: {
        fontSize: 16,
        fontWeight: '600',
        color: COLORS.dark,
        marginTop: 20,
        marginBottom: 15,
    },
    imageUploadSection: {
        marginBottom: 20,
    },
    imageUpload: {
        marginBottom: 20,
    },
    imageLabel: {
        fontSize: 14,
        fontWeight: '600',
        color: COLORS.dark,
        marginBottom: 10,
    },
    imagePicker: {
        borderWidth: 2,
        borderColor: COLORS.lightGray,
        borderStyle: 'dashed',
        borderRadius: 12,
        padding: 20,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: COLORS.white,
    },
    coverImagePicker: {
        height: 120,
    },
    imagePlaceholder: {
        alignItems: 'center',
    },
    placeholderText: {
        fontSize: 14,
        color: COLORS.gray,
        marginTop: 8,
    },
    uploadedImage: {
        width: 80,
        height: 80,
        borderRadius: 40,
    },
    coverImage: {
        width: '100%',
        height: 80,
        borderRadius: 8,
    },
    formField: {
        marginBottom: 20,
    },
    fieldLabel: {
        fontSize: 16,
        fontWeight: '600',
        color: COLORS.dark,
        marginBottom: 8,
    },
    textInput: {
        borderWidth: 1,
        borderColor: COLORS.lightGray,
        borderRadius: 8,
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
    dayRow: {
        backgroundColor: COLORS.white,
        borderRadius: 12,
        padding: 15,
        marginBottom: 10,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
    },
    dayInfo: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 10,
    },
    dayName: {
        fontSize: 16,
        fontWeight: '600',
        color: COLORS.dark,
    },
    timeSelector: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 8,
        paddingHorizontal: 12,
        backgroundColor: COLORS.lightGray,
        borderRadius: 8,
    },
    timeText: {
        fontSize: 14,
        color: COLORS.dark,
        fontWeight: '500',
    },
    closedText: {
        fontSize: 14,
        color: COLORS.gray,
        fontStyle: 'italic',
        textAlign: 'center',
    },
    switchRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: COLORS.white,
        borderRadius: 12,
        padding: 15,
        marginBottom: 10,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
    },
    switchLabel: {
        fontSize: 16,
        fontWeight: '500',
        color: COLORS.dark,
    },
    notificationInfo: {
        flex: 1,
        marginRight: 15,
    },
    notificationDesc: {
        fontSize: 12,
        color: COLORS.gray,
        marginTop: 2,
    },
    accountOption: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.white,
        borderRadius: 12,
        padding: 15,
        marginBottom: 10,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
    },
    optionText: {
        fontSize: 16,
        color: COLORS.dark,
        flex: 1,
        marginLeft: 15,
    },
    dangerOption: {
        borderWidth: 1,
        borderColor: COLORS.error,
    },
});

export default SettingsScreen;
