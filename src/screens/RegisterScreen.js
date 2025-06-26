import React, { useState } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    Alert,
    StyleSheet,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    TextInput,
    Modal,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { Ionicons } from '@expo/vector-icons';
import authService from '../services/authService';
import validationService from '../services/validationService';
import FormField from '../components/FormField';
import LoadingSpinner from '../components/LoadingSpinner';
import ImagePicker from '../components/ImagePicker';
import { COLORS, SIZES, ROLE_OPTIONS, COUNTRIES, CITIES } from '../utils/constants';
import { formatDate, validateCNICFormat } from '../utils/helpers';

const RegisterScreen = ({ navigation }) => {    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
        phone: '',
        countryCode: '+92', // Add country code field
        gender: '', // Add gender field
        role: '',
        cnicPassport: '',
        dateOfBirth: null,
        country: '',
        city: '',
        profilePicture: null,
    });
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [passwordStrength, setPasswordStrength] = useState(null);
    const [tempDate, setTempDate] = useState({
        day: '',
        month: '',
        year: ''
    });

    const updateFormData = (key, value) => {
        setFormData(prev => ({ ...prev, [key]: value }));

        // Clear error when user starts typing
        if (errors[key]) {
            setErrors(prev => ({ ...prev, [key]: '' }));
        }

        // Handle special formatting
        if (key === 'cnicPassport') {
            const formatted = validateCNICFormat(value);
            setFormData(prev => ({ ...prev, [key]: formatted }));
        }

        // Password strength check
        if (key === 'password') {
            const strength = validationService.getPasswordStrength(value);
            setPasswordStrength(strength);
        }

        // Clear city when country changes
        if (key === 'country') {
            setFormData(prev => ({ ...prev, city: '' }));
        }
    };
    const handleDateChange = (event, selectedDate) => {
        setShowDatePicker(false);
        if (selectedDate) {
            setFormData(prev => ({ ...prev, dateOfBirth: selectedDate }));
            if (errors.dateOfBirth) {
                setErrors(prev => ({ ...prev, dateOfBirth: '' }));
            }
        }
    };

    const openDatePicker = () => {
        // Initialize temp date with current date if available
        if (formData.dateOfBirth) {
            const date = new Date(formData.dateOfBirth);
            setTempDate({
                day: date.getDate().toString().padStart(2, '0'),
                month: (date.getMonth() + 1).toString().padStart(2, '0'),
                year: date.getFullYear().toString()
            });
        } else {
            setTempDate({ day: '', month: '', year: '' });
        }
        setShowDatePicker(true);
    };

    const handleDateConfirm = () => {
        const { day, month, year } = tempDate;

        // Validate date inputs
        if (!day || !month || !year) {
            Alert.alert('Invalid Date', 'Please fill in all date fields');
            return;
        }

        const dayNum = parseInt(day);
        const monthNum = parseInt(month);
        const yearNum = parseInt(year);

        // Basic validation
        if (dayNum < 1 || dayNum > 31) {
            Alert.alert('Invalid Date', 'Day must be between 1 and 31');
            return;
        }
        if (monthNum < 1 || monthNum > 12) {
            Alert.alert('Invalid Date', 'Month must be between 1 and 12');
            return;
        }
        if (yearNum < 1900 || yearNum > new Date().getFullYear()) {
            Alert.alert('Invalid Date', 'Please enter a valid year');
            return;
        }

        // Create date object
        const selectedDate = new Date(yearNum, monthNum - 1, dayNum);

        // Check if date is valid (handles cases like Feb 30)
        if (selectedDate.getDate() !== dayNum ||
            selectedDate.getMonth() !== monthNum - 1 ||
            selectedDate.getFullYear() !== yearNum) {
            Alert.alert('Invalid Date', 'Please enter a valid date');
            return;
        }

        // Check if date is not in the future
        if (selectedDate > new Date()) {
            Alert.alert('Invalid Date', 'Date of birth cannot be in the future');
            return;
        }

        setFormData(prev => ({ ...prev, dateOfBirth: selectedDate }));
        if (errors.dateOfBirth) {
            setErrors(prev => ({ ...prev, dateOfBirth: '' }));
        }
        setShowDatePicker(false);
    };

    const handleImageSelected = (imageData) => {
        setFormData(prev => ({ ...prev, profilePicture: imageData }));
    };    const validateForm = () => {
        console.log('Validating form data:', formData);
        const validation = validationService.validateRegistrationForm(formData);
        console.log('Validation result:', validation);
        setErrors(validation.errors);
        return validation.isValid;
    };    const handleRegister = async () => {
        console.log('=== REGISTRATION ATTEMPT ===');
        console.log('Form data:', JSON.stringify(formData, null, 2));
        
        // Force show validation errors first
        const validation = validationService.validateRegistrationForm(formData);
        console.log('Validation result:', validation);
        setErrors(validation.errors);
        
        if (!validation.isValid) {
            console.log('Validation failed:', validation.errors);
            Alert.alert(
                'Please Complete Required Fields', 
                Object.values(validation.errors).join('\n\n'),
                [{ text: 'OK' }]
            );
            return;
        }

        console.log('Validation passed, proceeding with registration...');
        setLoading(true);
        
        try {
            // Prepare data for registration with new format
            const registrationData = {
                name: formData.name,
                email: formData.email,
                password: formData.password,
                role: formData.role || 'student',
                phone: formData.phone,
                countryCode: formData.countryCode || '+92',
                gender: formData.gender,
                identificationType: 'cnic', // Default to CNIC
                identificationNumber: formData.cnicPassport,
                profileImage: formData.profilePicture || null
            };

            console.log('Sending to backend:', JSON.stringify(registrationData, null, 2));
            const result = await authService.register(registrationData);
            console.log('Backend response:', result);

            if (result.success && result.immediateLogin) {
                Alert.alert(
                    'Registration Successful! 🎉',
                    'Your account has been created successfully and you are now logged in!',
                    [
                        {
                            text: 'Continue to Dashboard',
                            onPress: () => {
                                const dashboardRoute = authService.getRoleDashboardRoute(result.user?.role);
                                navigation.replace(dashboardRoute);
                            }
                        }
                    ]
                );
            } else if (result.success) {
                Alert.alert(
                    'Registration Successful! 🎉',
                    'Your account has been created successfully.',
                    [
                        {
                            text: 'Continue to Login',
                            onPress: () => navigation.navigate('Login', {
                                prefillEmail: formData.email
                            })
                        }
                    ]
                );
            } else {
                if (result.message && result.message.includes('Email already exists')) {
                    Alert.alert(
                        'Account Already Exists',
                        'An account with this email address already exists. Please try logging in instead.',
                        [
                            {
                                text: 'Go to Login',
                                onPress: () => navigation.navigate('Login', {
                                    prefillEmail: formData.email
                                })
                            }
                        ]
                    );
                } else {
                    Alert.alert(
                        'Registration Failed',
                        result.message || 'There was an issue creating your account. Please try again.',
                        [{ text: 'OK' }]
                    );
                }
            }
        } catch (error) {
            console.error('Registration error:', error);
            Alert.alert('Network Error ⚠️', 'Failed to connect to server. Please check your internet connection and try again.');
        } finally {
            setLoading(false);
        }
    };

    const getAvailableCities = () => {
        return formData.country ? CITIES[formData.country] || [] : [];
    };    const handleAvailableCities = () => {
        return formData.country ? CITIES[formData.country] || [] : [];
    };

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
            <ScrollView
                contentContainerStyle={styles.scrollContainer}
                showsVerticalScrollIndicator={false}            >
                <View style={styles.header}>
                    <TouchableOpacity
                        style={styles.backButton}
                        onPress={() => navigation.goBack()}
                    >
                        <Ionicons name="arrow-back" size={24} color={COLORS.dark} />
                    </TouchableOpacity>
                    <Text style={styles.title}>Create Account</Text>
                    <Text style={styles.subtitle}>Join StayKaru community today</Text>
                    
                    {/* Debug buttons - remove in production */}
                    <View style={styles.debugContainer}>
                    </View>
                </View>

                {/* Profile Picture */}
                <ImagePicker
                    imageUri={formData.profilePicture?.uri}
                    onImageSelected={handleImageSelected}
                    placeholder="Add Profile Picture"
                    size={120}
                />

                <View style={styles.form}>
                    {/* Personal Information */}
                    <Text style={styles.sectionTitle}>Personal Information</Text>

                    <FormField
                        label="Full Name *"
                        value={formData.name}
                        onChangeText={(value) => updateFormData('name', value)}
                        placeholder="Enter your full name"
                        leftIcon="person"
                        error={errors.name}
                    />

                    <FormField
                        label="Email Address *"
                        value={formData.email}
                        onChangeText={(value) => updateFormData('email', value)}
                        placeholder="Enter your email"
                        keyboardType="email-address"
                        autoCapitalize="none"
                        leftIcon="mail"
                        error={errors.email}
                    />                    <FormField
                        label="Phone Number *"
                        value={formData.phone}
                        onChangeText={(value) => updateFormData('phone', value)}
                        placeholder="Enter your phone number (without country code)"
                        keyboardType="phone-pad"
                        leftIcon="call"
                        error={errors.phone}
                    />

                    {/* Country Code */}
                    <View style={styles.fieldContainer}>
                        <Text style={styles.label}>Country Code *</Text>
                        <View style={[styles.pickerContainer, errors.countryCode && styles.errorInput]}>
                            <Ionicons name="flag" size={20} color={COLORS.gray[500]} style={styles.pickerIcon} />
                            <Picker
                                selectedValue={formData.countryCode}
                                style={styles.picker}
                                onValueChange={(value) => updateFormData('countryCode', value)}
                            >
                                <Picker.Item label="Select Country Code" value="" />
                                <Picker.Item label="+92 (Pakistan)" value="+92" />
                                <Picker.Item label="+91 (India)" value="+91" />
                                <Picker.Item label="+1 (USA)" value="+1" />
                                <Picker.Item label="+44 (UK)" value="+44" />
                                <Picker.Item label="+61 (Australia)" value="+61" />
                            </Picker>
                        </View>
                        {errors.countryCode && <Text style={styles.errorText}>{errors.countryCode}</Text>}
                    </View>

                    {/* Gender */}
                    <View style={styles.fieldContainer}>
                        <Text style={styles.label}>Gender *</Text>
                        <View style={[styles.pickerContainer, errors.gender && styles.errorInput]}>
                            <Ionicons name="person" size={20} color={COLORS.gray[500]} style={styles.pickerIcon} />
                            <Picker
                                selectedValue={formData.gender}
                                style={styles.picker}
                                onValueChange={(value) => updateFormData('gender', value)}
                            >
                                <Picker.Item label="Select Gender" value="" />
                                <Picker.Item label="Male" value="male" />
                                <Picker.Item label="Female" value="female" />
                                <Picker.Item label="Other" value="other" />
                            </Picker>
                        </View>
                        {errors.gender && <Text style={styles.errorText}>{errors.gender}</Text>}
                    </View>
                    
                    {/* Date of Birth */}
                    <View style={styles.fieldContainer}>
                        <Text style={styles.label}>Date of Birth *</Text>
                        <TouchableOpacity
                            style={[styles.dateButton, errors.dateOfBirth && styles.errorInput]}
                            onPress={openDatePicker}
                        >
                            <Ionicons name="calendar" size={20} color={COLORS.gray[500]} />
                            <Text style={[
                                styles.dateText,
                                !formData.dateOfBirth && styles.placeholderText
                            ]}>
                                {formData.dateOfBirth ? formatDate(formData.dateOfBirth) : 'Select date of birth'}
                            </Text>
                        </TouchableOpacity>
                        {errors.dateOfBirth && <Text style={styles.errorText}>{errors.dateOfBirth}</Text>}
                    </View>

                    {/* CNIC/Passport */}
                    <FormField
                        label="CNIC or Passport *"
                        value={formData.cnicPassport}
                        onChangeText={(value) => updateFormData('cnicPassport', value)}
                        placeholder="Enter CNIC (XXXXX-XXXXXXX-X) or Passport"
                        leftIcon="card"
                        error={errors.cnicPassport}
                    />

                    {/* Role Selection */}
                    <View style={styles.fieldContainer}>
                        <Text style={styles.label}>Role *</Text>
                        <View style={[styles.pickerContainer, errors.role && styles.errorInput]}>
                            <Ionicons name="briefcase" size={20} color={COLORS.gray[500]} style={styles.pickerIcon} />
                            <Picker
                                selectedValue={formData.role}
                                style={styles.picker}
                                onValueChange={(value) => updateFormData('role', value)}
                            >
                                {ROLE_OPTIONS.map((option, index) => (
                                    <Picker.Item
                                        key={index}
                                        label={option.label}
                                        value={option.value}
                                    />
                                ))}
                            </Picker>
                        </View>
                        {errors.role && <Text style={styles.errorText}>{errors.role}</Text>}
                    </View>

                    {/* Location */}
                    <Text style={styles.sectionTitle}>Location Information</Text>

                    <View style={styles.fieldContainer}>
                        <Text style={styles.label}>Country *</Text>
            <View style={[styles.pickerContainer, errors.country && styles.errorInput]}>
                            <Ionicons name="flag" size={20} color={COLORS.gray[500]} style={styles.pickerIcon} />
                            <Picker
                                selectedValue={formData.country}
                                style={styles.picker}
                                onValueChange={(value) => updateFormData('country', value)}
                            >
                                {COUNTRIES.map((country, index) => (
                                    <Picker.Item
                                        key={index}
                                        label={country.label}
                                        value={country.value}
                                    />
                                ))}
                            </Picker>
                        </View>
                        {errors.country && <Text style={styles.errorText}>{errors.country}</Text>}
                    </View>

                    <View style={styles.fieldContainer}>
                        <Text style={styles.label}>City *</Text>
            <View style={[styles.pickerContainer, errors.city && styles.errorInput]}>
                            <Ionicons name="location" size={20} color={COLORS.gray[500]} style={styles.pickerIcon} />
                            <Picker
                                selectedValue={formData.city}
                                style={styles.picker}
                                onValueChange={(value) => updateFormData('city', value)}
                                enabled={!!formData.country}
                            >
                                {getAvailableCities().map((city, index) => (
                                    <Picker.Item
                                        key={index}
                                        label={city}
                                        value={city === 'Select City' ? '' : city}
                                    />
                                ))}
                            </Picker>
                        </View>
                        {errors.city && <Text style={styles.errorText}>{errors.city}</Text>}
                    </View>

                    {/* Password Section */}
                    <Text style={styles.sectionTitle}>Security</Text>

                    <FormField
                        label="Password *"
                        value={formData.password}
                        onChangeText={(value) => updateFormData('password', value)}
                        placeholder="Create a strong password"
                        secureTextEntry
                        leftIcon="lock-closed"
                        error={errors.password}
                    />

                    {/* Password Strength Indicator */}
                    {formData.password && passwordStrength && (
                        <View style={styles.passwordStrength}>
                            <View style={styles.strengthBar}>
                                <View
                                    style={[
                                        styles.strengthFill,
                                        {
                                            width: `${(passwordStrength.score / 4) * 100}%`,
                                            backgroundColor: passwordStrength.color
                                        }
                                    ]}
                                />
                            </View>
                            <Text style={[styles.strengthText, { color: passwordStrength.color }]}>
                                {passwordStrength.level}
                            </Text>
                        </View>
                    )}

                    <FormField
                        label="Confirm Password *"
                        value={formData.confirmPassword}
                        onChangeText={(value) => updateFormData('confirmPassword', value)}
                        placeholder="Confirm your password"
                        secureTextEntry
                        leftIcon="lock-closed"
                        error={errors.confirmPassword}
                    />

                    {/* Register Button */}
                    <TouchableOpacity
                        style={[styles.registerButton, loading && styles.disabledButton]}
                        onPress={handleRegister}
                        disabled={loading}
                    >
                        {loading ? (
                            <LoadingSpinner size="small" color="#fff" />
                        ) : (<>
                            <Text style={styles.registerButtonText}>Create Account</Text>
                            <Ionicons name="arrow-forward" size={20} color="white" />
                        </>
                        )}
                    </TouchableOpacity>

                    {/* Login Link */}
                    <View style={styles.loginLinkContainer}>
                        <Text style={styles.loginLinkText}>Already have an account? </Text>
                        <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                            <Text style={styles.loginLink}>Sign In</Text>
                        </TouchableOpacity>
                    </View>
                </View>        {/* Date Picker Modal */}
                <Modal
                    visible={showDatePicker}
                    transparent={true}
                    animationType="slide"
                    onRequestClose={() => setShowDatePicker(false)}
                >
                    <View style={styles.modalOverlay}>
                        <View style={styles.modalContainer}>
                            <View style={styles.modalHeader}>
                                <Text style={styles.modalTitle}>Select Date of Birth</Text>
                                <TouchableOpacity
                                    onPress={() => setShowDatePicker(false)}
                                    style={styles.closeButton}
                                >
                                    <Ionicons name="close" size={24} color={COLORS.gray[600]} />
                                </TouchableOpacity>
                            </View>

                            <View style={styles.dateInputContainer}>
                                <View style={styles.dateInput}>
                                    <Text style={styles.dateInputLabel}>Day</Text>
                                    <TextInput
                                        style={styles.dateInputField}
                                        value={tempDate.day}
                                        onChangeText={(text) => setTempDate(prev => ({ ...prev, day: text.replace(/[^0-9]/g, '') }))}
                                        placeholder="DD"
                                        maxLength={2}
                                        keyboardType="numeric"
                                    />
                                </View>

                                <View style={styles.dateInput}>
                                    <Text style={styles.dateInputLabel}>Month</Text>
                                    <TextInput
                                        style={styles.dateInputField}
                                        value={tempDate.month}
                                        onChangeText={(text) => setTempDate(prev => ({ ...prev, month: text.replace(/[^0-9]/g, '') }))}
                                        placeholder="MM"
                                        maxLength={2}
                                        keyboardType="numeric"
                                    />
                                </View>

                                <View style={styles.dateInput}>
                                    <Text style={styles.dateInputLabel}>Year</Text>
                                    <TextInput
                                        style={styles.dateInputField}
                                        value={tempDate.year}
                                        onChangeText={(text) => setTempDate(prev => ({ ...prev, year: text.replace(/[^0-9]/g, '') }))}
                                        placeholder="YYYY"
                                        maxLength={4}
                                        keyboardType="numeric"
                                    />
                                </View>
                            </View>

                            <View style={styles.modalButtons}>
                                <TouchableOpacity
                                    style={styles.modalButton}
                                    onPress={() => setShowDatePicker(false)}
                                >
                                    <Text style={styles.modalButtonText}>Cancel</Text>
                                </TouchableOpacity>

                                <TouchableOpacity
                                    style={[styles.modalButton, styles.confirmButton]}
                                    onPress={handleDateConfirm}
                                >
                                    <Text style={[styles.modalButtonText, styles.confirmButtonText]}>Confirm</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                </Modal>
            </ScrollView>

            {loading && (
                <LoadingSpinner
                    overlay={true}
                    text="Creating your account..."
                    visible={loading}
                />
            )}
        </KeyboardAvoidingView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.light,
    },
    scrollContainer: {
        flexGrow: 1,
        padding: 20,
    },
    header: {
        alignItems: 'center',
        marginBottom: 20,
        position: 'relative',
    },
    backButton: {
        position: 'absolute',
        left: 0,
        top: 0,
        padding: 8,
    },
    title: {
        fontSize: SIZES.h1,
        fontWeight: 'bold',
        color: COLORS.dark,
        marginBottom: 8,
    },
    subtitle: {
        fontSize: SIZES.body1,
        color: COLORS.gray[600],
        textAlign: 'center',
    },
    form: {
        marginTop: 20,
    },
    sectionTitle: {
        fontSize: SIZES.h4,
        fontWeight: 'bold',
        color: COLORS.dark,
        marginTop: 20,
        marginBottom: 15,
    },
    fieldContainer: {
        marginBottom: 20,
    },
    label: {
        fontSize: SIZES.body1,
        fontWeight: '600',
        marginBottom: 8,
        color: COLORS.dark,
    },
    dateButton: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: COLORS.gray[300],
        borderRadius: SIZES.radius,
        backgroundColor: COLORS.light,
        padding: 15,
        minHeight: 50,
    },
    errorInput: {
        borderColor: COLORS.error,
    },
    dateText: {
        fontSize: SIZES.body1,
        color: COLORS.dark,
        marginLeft: 10,
    },
    placeholderText: {
        color: COLORS.gray[400],
    },
    pickerContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: COLORS.gray[300],
        borderRadius: SIZES.radius,
        backgroundColor: COLORS.light,
        minHeight: 50,
    },
    pickerIcon: {
        paddingLeft: 15,
        paddingRight: 10,
    },
    picker: {
        flex: 1,
        height: 50,
    },
    passwordStrength: {
        marginTop: -15,
        marginBottom: 20,
    },
    strengthBar: {
        height: 4,
        backgroundColor: COLORS.gray[200],
        borderRadius: 2,
        marginBottom: 5,
    },
    strengthFill: {
        height: '100%',
        borderRadius: 2,
    },
    strengthText: {
        fontSize: SIZES.body3,
        fontWeight: '500',
    },
    registerButton: {
        backgroundColor: COLORS.primary,
        padding: 16,
        borderRadius: SIZES.radius,
        alignItems: 'center',
        flexDirection: 'row',
        justifyContent: 'center',
        marginTop: 20,
    },
    disabledButton: {
        backgroundColor: COLORS.gray[400],
    },
    registerButtonText: {
        color: '#fff',
        fontSize: SIZES.body1,
        fontWeight: '600',
        marginRight: 8,
    },
    loginLinkContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginTop: 20,
        marginBottom: 40,
    },
    loginLinkText: {
        color: COLORS.gray[600],
        fontSize: SIZES.body1,
    },
    loginLink: {
        color: COLORS.primary,
        fontSize: SIZES.body1,
        fontWeight: '600',
    },
    errorText: {
        color: COLORS.error,
        fontSize: SIZES.body3,
        marginTop: 5,
    },
    // Date Picker Modal Styles
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    modalContainer: {
        backgroundColor: COLORS.light,
        borderRadius: SIZES.radius * 2,
        padding: 20,
        width: '100%',
        maxWidth: 350,
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    modalTitle: {
        fontSize: SIZES.h3,
        fontWeight: 'bold',
        color: COLORS.dark,
    },
    closeButton: {
        padding: 5,
    },
    dateInputContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 20,
    },
    dateInput: {
        flex: 1,
        marginHorizontal: 5,
    },
    dateInputLabel: {
        fontSize: SIZES.body2,
        fontWeight: '600',
        color: COLORS.dark,
        marginBottom: 8,
        textAlign: 'center',
    },
    dateInputField: {
        borderWidth: 1,
        borderColor: COLORS.gray[300],
        borderRadius: SIZES.radius,
        padding: 12,
        fontSize: SIZES.body1,
        textAlign: 'center',
        backgroundColor: COLORS.light,
    },
    modalButtons: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: 10,
    },
    modalButton: {
        flex: 1,
        padding: 12,
        borderRadius: SIZES.radius,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: COLORS.gray[300],
    },
    confirmButton: {
        backgroundColor: COLORS.primary,
        borderColor: COLORS.primary,
    },
    modalButtonText: {
        fontSize: SIZES.body1,
        fontWeight: '600',
        color: COLORS.gray[600],
    },    confirmButtonText: {
        color: '#fff',
    },
    debugContainer: {
        flexDirection: 'row',
        marginTop: 10,
        gap: 10,
    },
    debugButton: {
        backgroundColor: COLORS.warning,
        paddingVertical: 6,
        paddingHorizontal: 12,
        borderRadius: 6,
        flex: 1,
    },
    debugButtonText: {
        color: '#fff',
        fontSize: 12,
        fontWeight: '600',
        textAlign: 'center',
    },
});

export default RegisterScreen;
