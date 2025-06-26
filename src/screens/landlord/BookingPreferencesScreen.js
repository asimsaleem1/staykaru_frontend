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
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SIZES } from '../../utils/constants';
import { fetchFromBackend } from '../../utils/networkUtils';

const BookingPreferencesScreen = ({ navigation }) => {
    const [preferences, setPreferences] = useState({
        instantBooking: false,
        requireApproval: true,
        minStayDays: 1,
        maxStayDays: 30,
        advanceNoticeDays: 1,
        preparationTime: 2,
        checkInTime: '15:00',
        checkOutTime: '11:00',
        flexibleCheckIn: false,
        allowSameDayBooking: true,
        allowWeekendBooking: true,
        cancellationPolicy: 'moderate',
        refundProcessingDays: 5,
        securityDeposit: 0,
        cleaningFee: 0,
        extraGuestFee: 0,
        maxGuests: 4,
        allowPets: false,
        allowSmoking: false,
        allowParties: false,
        requireIdVerification: true,
        requirePhoneVerification: true,
        requireEmailVerification: true,
        autoConfirmBookings: false,
        sendBookingReminders: true,
        sendCheckInInstructions: true,
        guestCommunicationLanguage: 'english',
        customWelcomeMessage: '',
        specialInstructions: '',
    });
    const [loading, setLoading] = useState(false);

    const cancellationPolicies = [
        {
            id: 'flexible',
            name: 'Flexible',
            description: 'Free cancellation 24 hours before check-in',
        },
        {
            id: 'moderate',
            name: 'Moderate',
            description: 'Free cancellation 5 days before check-in',
        },
        {
            id: 'strict',
            name: 'Strict',
            description: 'Free cancellation up to 14 days before check-in',
        },
    ];

    const languages = [
        { id: 'english', name: 'English' },
        { id: 'urdu', name: 'Urdu' },
        { id: 'punjabi', name: 'Punjabi' },
        { id: 'sindhi', name: 'Sindhi' },
        { id: 'pashto', name: 'Pashto' },
        { id: 'balochi', name: 'Balochi' },
    ];

    useEffect(() => {
        loadPreferences();
    }, []);

    const loadPreferences = async () => {
        setLoading(true);
        try {
            const response = await fetchFromBackend('/api/landlord/booking-preferences');
            if (response?.success && response.data) {
                setPreferences(response.data);
            }
        } catch (error) {
            console.error('Error loading preferences:', error);
        } finally {
            setLoading(false);
        }
    };

    const savePreferences = async () => {
        setLoading(true);
        try {
            const response = await fetchFromBackend('/api/landlord/booking-preferences', {
                method: 'PUT',
                body: JSON.stringify(preferences)
            });

            if (response?.success) {
                Alert.alert('Success', 'Booking preferences updated successfully');
            }
        } catch (error) {
            console.error('Error saving preferences:', error);
            Alert.alert('Error', 'Failed to save booking preferences');
        } finally {
            setLoading(false);
        }
    };

    const updatePreference = (key, value) => {
        setPreferences(prev => ({ ...prev, [key]: value }));
    };

    const renderSwitchRow = (title, key, description = null) => (
        <View style={styles.switchRow}>
            <View style={styles.switchContent}>
                <Text style={styles.switchTitle}>{title}</Text>
                {description && <Text style={styles.switchDescription}>{description}</Text>}
            </View>
            <Switch
                value={preferences[key]}
                onValueChange={(value) => updatePreference(key, value)}
                trackColor={{ false: COLORS.lightGray, true: `${COLORS.primary}50` }}
                thumbColor={preferences[key] ? COLORS.primary : COLORS.gray}
            />
        </View>
    );

    const renderNumberInput = (title, key, suffix = '', placeholder = '') => (
        <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>{title}</Text>
            <View style={styles.numberInputContainer}>
                <TextInput
                    style={styles.numberInput}
                    value={preferences[key]?.toString()}
                    onChangeText={(text) => updatePreference(key, parseInt(text) || 0)}
                    placeholder={placeholder}
                    keyboardType="numeric"
                />
                {suffix && <Text style={styles.inputSuffix}>{suffix}</Text>}
            </View>
        </View>
    );

    const renderTimeInput = (title, key) => (
        <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>{title}</Text>
            <TextInput
                style={styles.input}
                value={preferences[key]}
                onChangeText={(text) => updatePreference(key, text)}
                placeholder="HH:MM"
                placeholderTextColor={COLORS.gray}
            />
        </View>
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
                <Text style={styles.headerTitle}>Booking Preferences</Text>
                <TouchableOpacity
                    onPress={savePreferences}
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
                {/* Booking Controls */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Booking Controls</Text>
                    <View style={styles.card}>
                        {renderSwitchRow(
                            'Instant Booking',
                            'instantBooking',
                            'Guests can book immediately without approval'
                        )}
                        {renderSwitchRow(
                            'Require Approval',
                            'requireApproval',
                            'Review and approve booking requests'
                        )}
                        {renderSwitchRow(
                            'Allow Same-Day Booking',
                            'allowSameDayBooking',
                            'Allow bookings for today'
                        )}
                        {renderSwitchRow(
                            'Allow Weekend Booking',
                            'allowWeekendBooking',
                            'Allow bookings on weekends'
                        )}
                        {renderSwitchRow(
                            'Auto-Confirm Bookings',
                            'autoConfirmBookings',
                            'Automatically confirm approved bookings'
                        )}
                    </View>
                </View>

                {/* Stay Duration */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Stay Duration</Text>
                    <View style={styles.card}>
                        <View style={styles.inputRow}>
                            <View style={styles.inputHalf}>
                                {renderNumberInput('Minimum Stay', 'minStayDays', 'days', '1')}
                            </View>
                            <View style={styles.inputHalf}>
                                {renderNumberInput('Maximum Stay', 'maxStayDays', 'days', '30')}
                            </View>
                        </View>
                        <View style={styles.inputRow}>
                            <View style={styles.inputHalf}>
                                {renderNumberInput('Advance Notice', 'advanceNoticeDays', 'days', '1')}
                            </View>
                            <View style={styles.inputHalf}>
                                {renderNumberInput('Preparation Time', 'preparationTime', 'hours', '2')}
                            </View>
                        </View>
                    </View>
                </View>

                {/* Check-in/Check-out */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Check-in & Check-out</Text>
                    <View style={styles.card}>
                        <View style={styles.inputRow}>
                            <View style={styles.inputHalf}>
                                {renderTimeInput('Check-in Time', 'checkInTime')}
                            </View>
                            <View style={styles.inputHalf}>
                                {renderTimeInput('Check-out Time', 'checkOutTime')}
                            </View>
                        </View>
                        {renderSwitchRow(
                            'Flexible Check-in',
                            'flexibleCheckIn',
                            'Allow flexible check-in times'
                        )}
                    </View>
                </View>

                {/* Cancellation Policy */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Cancellation Policy</Text>
                    <View style={styles.card}>
                        {cancellationPolicies.map(policy => (
                            <TouchableOpacity
                                key={policy.id}
                                style={[
                                    styles.policyOption,
                                    preferences.cancellationPolicy === policy.id && styles.selectedPolicy
                                ]}
                                onPress={() => updatePreference('cancellationPolicy', policy.id)}
                            >
                                <View style={styles.policyContent}>
                                    <Text style={[
                                        styles.policyName,
                                        preferences.cancellationPolicy === policy.id && styles.selectedPolicyText
                                    ]}>
                                        {policy.name}
                                    </Text>
                                    <Text style={[
                                        styles.policyDescription,
                                        preferences.cancellationPolicy === policy.id && styles.selectedPolicyDescription
                                    ]}>
                                        {policy.description}
                                    </Text>
                                </View>
                                {preferences.cancellationPolicy === policy.id && (
                                    <Ionicons name="checkmark-circle" size={24} color={COLORS.white} />
                                )}
                            </TouchableOpacity>
                        ))}
                        {renderNumberInput('Refund Processing', 'refundProcessingDays', 'days', '5')}
                    </View>
                </View>

                {/* Pricing */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Additional Fees (PKR)</Text>
                    <View style={styles.card}>
                        {renderNumberInput('Security Deposit', 'securityDeposit', 'PKR', '0')}
                        {renderNumberInput('Cleaning Fee', 'cleaningFee', 'PKR', '0')}
                        {renderNumberInput('Extra Guest Fee', 'extraGuestFee', 'PKR per guest', '0')}
                        {renderNumberInput('Maximum Guests', 'maxGuests', 'guests', '4')}
                    </View>
                </View>

                {/* House Rules */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>House Rules</Text>
                    <View style={styles.card}>
                        {renderSwitchRow('Allow Pets', 'allowPets')}
                        {renderSwitchRow('Allow Smoking', 'allowSmoking')}
                        {renderSwitchRow('Allow Parties/Events', 'allowParties')}
                    </View>
                </View>

                {/* Verification Requirements */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Guest Verification</Text>
                    <View style={styles.card}>
                        {renderSwitchRow(
                            'ID Verification',
                            'requireIdVerification',
                            'Require government ID verification'
                        )}
                        {renderSwitchRow(
                            'Phone Verification',
                            'requirePhoneVerification',
                            'Require phone number verification'
                        )}
                        {renderSwitchRow(
                            'Email Verification',
                            'requireEmailVerification',
                            'Require email verification'
                        )}
                    </View>
                </View>

                {/* Communication */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Communication</Text>
                    <View style={styles.card}>
                        {renderSwitchRow(
                            'Send Booking Reminders',
                            'sendBookingReminders',
                            'Send automatic booking reminders'
                        )}
                        {renderSwitchRow(
                            'Send Check-in Instructions',
                            'sendCheckInInstructions',
                            'Automatically send check-in details'
                        )}

                        <View style={styles.inputGroup}>
                            <Text style={styles.inputLabel}>Preferred Language</Text>
                            <View style={styles.languageGrid}>
                                {languages.map(language => (
                                    <TouchableOpacity
                                        key={language.id}
                                        style={[
                                            styles.languageButton,
                                            preferences.guestCommunicationLanguage === language.id && styles.selectedLanguage
                                        ]}
                                        onPress={() => updatePreference('guestCommunicationLanguage', language.id)}
                                    >
                                        <Text style={[
                                            styles.languageText,
                                            preferences.guestCommunicationLanguage === language.id && styles.selectedLanguageText
                                        ]}>
                                            {language.name}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.inputLabel}>Welcome Message</Text>
                            <TextInput
                                style={[styles.input, styles.textArea]}
                                value={preferences.customWelcomeMessage}
                                onChangeText={(text) => updatePreference('customWelcomeMessage', text)}
                                placeholder="Enter custom welcome message for guests"
                                multiline
                                numberOfLines={4}
                                placeholderTextColor={COLORS.gray}
                            />
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.inputLabel}>Special Instructions</Text>
                            <TextInput
                                style={[styles.input, styles.textArea]}
                                value={preferences.specialInstructions}
                                onChangeText={(text) => updatePreference('specialInstructions', text)}
                                placeholder="Enter special instructions for guests"
                                multiline
                                numberOfLines={4}
                                placeholderTextColor={COLORS.gray}
                            />
                        </View>
                    </View>
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
    textArea: {
        height: 80,
        textAlignVertical: 'top',
    },
    inputRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    inputHalf: {
        width: '48%',
    },
    numberInputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: COLORS.lightGray,
        borderRadius: 8,
        backgroundColor: COLORS.white,
    },
    numberInput: {
        flex: 1,
        paddingHorizontal: 12,
        paddingVertical: 10,
        fontSize: 16,
        color: COLORS.dark,
    },
    inputSuffix: {
        fontSize: 14,
        color: COLORS.gray,
        paddingHorizontal: 12,
        backgroundColor: COLORS.lightGray,
        paddingVertical: 10,
    },
    policyOption: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 15,
        borderRadius: 8,
        backgroundColor: COLORS.lightGray,
        marginBottom: 10,
    },
    selectedPolicy: {
        backgroundColor: COLORS.primary,
    },
    policyContent: {
        flex: 1,
    },
    policyName: {
        fontSize: 16,
        fontWeight: 'bold',
        color: COLORS.dark,
        marginBottom: 5,
    },
    selectedPolicyText: {
        color: COLORS.white,
    },
    policyDescription: {
        fontSize: 14,
        color: COLORS.gray,
    },
    selectedPolicyDescription: {
        color: COLORS.white,
        opacity: 0.8,
    },
    languageGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
    },
    languageButton: {
        width: '48%',
        padding: 10,
        borderRadius: 8,
        backgroundColor: COLORS.lightGray,
        marginBottom: 10,
        alignItems: 'center',
    },
    selectedLanguage: {
        backgroundColor: COLORS.primary,
    },
    languageText: {
        fontSize: 14,
        color: COLORS.dark,
    },
    selectedLanguageText: {
        color: COLORS.white,
    },
    bottomPadding: {
        height: 50,
    },
});

export default BookingPreferencesScreen;
