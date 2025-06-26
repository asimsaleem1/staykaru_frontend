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
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import authService from '../services/authService';
import validationService from '../services/validationService';
import FormField from '../components/FormField';
import LoadingSpinner from '../components/LoadingSpinner';
import { COLORS, SIZES } from '../utils/constants';

const LoginScreen = ({ navigation, route }) => {
    const [formData, setFormData] = useState({
        email: route?.params?.prefillEmail || '',
        password: route?.params?.prefillPassword || '',
    });
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});

    const updateFormData = (key, value) => {
        setFormData(prev => ({ ...prev, [key]: value }));
        // Clear error when user starts typing
        if (errors[key]) {
            setErrors(prev => ({ ...prev, [key]: '' }));
        }
    };

    const validateForm = () => {
        const newErrors = {};

        if (!validationService.validateEmail(formData.email)) {
            newErrors.email = 'Please enter a valid email address';
        }

        if (!formData.password) {
            newErrors.password = 'Password is required';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };    const handleLogin = async () => {
        if (!validateForm()) {
            return;
        }

        setLoading(true);
        try {
            const result = await authService.login(formData.email, formData.password);

            if (result.success) {
                // Store user data for future navigation decisions
                if (result.user) {
                    await AsyncStorage.setItem('userData', JSON.stringify(result.user));
                }
                
                // Navigate to appropriate dashboard based on user role
                const dashboardRoute = authService.getRoleDashboardRoute(result.user?.role);
                navigation.replace(dashboardRoute);
            } else {
                Alert.alert('Login Failed', result.message || 'Invalid credentials');
            }
        } catch (error) {
            console.error('Login error:', error);
            Alert.alert('Error', 'Login failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };const handleForgotPassword = () => {
        navigation.navigate('ForgotPassword');
    };

    // Debug functions for testing login
    const runDiagnostics = async () => {
        Alert.alert('Running Login Diagnostics', 'Check the console for detailed results...');
        const result = await runLoginDiagnostics();
        Alert.alert(
            'Diagnostics Complete',
            result ? 'Login tests passed! ✅' : 'Login tests failed. Check console for details. ❌'
        );
    };

    const fillTestCredentials = () => {
        setFormData({
            email: 'john.doe.1234@test.com', // Use the email from recent registration
            password: 'Test@123456',
        });
        Alert.alert('Test Credentials Filled', 'Login form filled with test credentials for debugging.');
    };

    const testRecentRegistration = async () => {
        // Get a recent email from localStorage if available
        Alert.alert('Testing Recent Registration', 'Testing login with recently created account...');
        const result = await testLoginWithCredentials('john.doe.1234@test.com', 'Test@123456');
        
        if (result.success) {
            Alert.alert('Success!', 'Recent registration login works! ✅');
        } else {
            Alert.alert('Login Failed', `Issue: ${result.message}\n\nThis might be due to email verification requirements.`);
        }
    };

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
            <ScrollView
                contentContainerStyle={styles.scrollContainer}
                showsVerticalScrollIndicator={false}
            >                <View style={styles.header}>
                    <View style={styles.logoContainer}>
                        <Ionicons name="home" size={48} color={COLORS.primary} />
                    </View>
                    <Text style={styles.title}>Welcome Back</Text>
                    <Text style={styles.subtitle}>Sign in to your StayKaru account</Text>
                    
                    {/* Debug buttons - remove in production */}
                    <View style={styles.debugContainer}>
                        <TouchableOpacity style={styles.debugButton} onPress={fillTestCredentials}>
                            <Text style={styles.debugButtonText}>Fill Test Login</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.debugButton} onPress={testRecentRegistration}>
                            <Text style={styles.debugButtonText}>Test Recent User</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.debugButton} onPress={runDiagnostics}>
                            <Text style={styles.debugButtonText}>Run Diagnostics</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                <View style={styles.form}>
                    <FormField
                        label="Email Address"
                        value={formData.email}
                        onChangeText={(value) => updateFormData('email', value)}
                        placeholder="Enter your email"
                        keyboardType="email-address"
                        autoCapitalize="none"
                        leftIcon="mail"
                        error={errors.email}
                    />

                    <FormField
                        label="Password"
                        value={formData.password}
                        onChangeText={(value) => updateFormData('password', value)}
                        placeholder="Enter your password"
                        secureTextEntry
                        leftIcon="lock-closed"
                        error={errors.password}
                    />

                    <TouchableOpacity onPress={handleForgotPassword} style={styles.forgotPassword}>
                        <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.loginButton, loading && styles.disabledButton]}
                        onPress={handleLogin}
                        disabled={loading}
                    >
                        {loading ? (
                            <LoadingSpinner size="small" color="#fff" />
                        ) : (
                            <Text style={styles.loginButtonText}>Sign In</Text>
                        )}
                    </TouchableOpacity>
                </View>                {/* Register Link */}
                <View style={styles.registerLinkContainer}>
                    <Text style={styles.registerLinkText}>Don't have an account? </Text>
                    <TouchableOpacity onPress={() => navigation.navigate('Register')}>
                        <Text style={styles.registerLink}>Sign Up</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
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
        justifyContent: 'center',
    },
    header: {
        alignItems: 'center',
        marginBottom: 40,
    },
    logoContainer: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: COLORS.primary + '20',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 20,
    },
    title: {
        fontSize: SIZES.largeTitle,
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
        marginBottom: 30,
    },
    forgotPassword: {
        alignItems: 'flex-end',
        marginBottom: 30,
    },
    forgotPasswordText: {
        color: COLORS.primary,
        fontSize: SIZES.body2,
        fontWeight: '600',
    },
    loginButton: {
        backgroundColor: COLORS.primary,
        padding: 16,
        borderRadius: SIZES.radius,
        alignItems: 'center',
        flexDirection: 'row',
        justifyContent: 'center',
    },
    disabledButton: {
        backgroundColor: COLORS.gray[400],
    },
    loginButtonText: {
        color: '#fff',
        fontSize: SIZES.body1,
        fontWeight: '600',
    },
    socialSection: {
        marginBottom: 30,
    },
    divider: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 20,
    },
    dividerLine: {
        flex: 1,
        height: 1,
        backgroundColor: COLORS.gray[300],
    },
    dividerText: {
        marginHorizontal: 15,
        color: COLORS.gray[600],
        fontSize: SIZES.body2,
    },
    socialButtons: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    socialButton: {
        flex: 1,
        backgroundColor: 'white',
        padding: 15,
        borderRadius: SIZES.radius,
        alignItems: 'center',
        marginHorizontal: 5,
        borderWidth: 1,
        borderColor: COLORS.gray[300],
        flexDirection: 'row',
        justifyContent: 'center',
    },
    socialButtonText: {
        color: COLORS.dark,
        fontSize: SIZES.body1,
        fontWeight: '600',
        marginLeft: 8,
    },
    registerLinkContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
    },
    registerLinkText: {
        color: COLORS.gray[600],
        fontSize: SIZES.body1,
    },    registerLink: {
        color: COLORS.primary,
        fontSize: SIZES.body1,
        fontWeight: '600',
    },
    debugContainer: {
        flexDirection: 'row',
        marginTop: 15,
        gap: 8,
        flexWrap: 'wrap',
        justifyContent: 'center',
    },
    debugButton: {
        backgroundColor: COLORS.warning,
        paddingVertical: 4,
        paddingHorizontal: 8,
        borderRadius: 4,
        minWidth: 80,
    },
    debugButtonText: {
        color: '#fff',
        fontSize: 10,
        fontWeight: '600',
        textAlign: 'center',
    },
});

export default LoginScreen;
