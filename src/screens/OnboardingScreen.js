import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Dimensions,
    Alert,
    Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { COLORS, SIZES } from '../utils/constants';
import authService from '../services/authService';

const { width, height } = Dimensions.get('window');

const OnboardingScreen = ({ navigation }) => {
    const [currentStep, setCurrentStep] = useState(0);
    const [userPreferences, setUserPreferences] = useState({
        accommodationType: '',
        budget: '',
        preferredLocation: '',
        foodPreferences: [],
        lifestyle: [],
        priorities: [],
        transportation: '',
        studyField: ''
    });
    const [userData, setUserData] = useState(null);

    useEffect(() => {
        loadUserData();
    }, []);

    const loadUserData = async () => {
        try {
            const userDataString = await AsyncStorage.getItem('userData');
            if (userDataString) {
                setUserData(JSON.parse(userDataString));
            }
        } catch (error) {
            console.error('Error loading user data:', error);
        }
    };

    const onboardingSteps = [
        {
            title: "Welcome to StayKaru!",
            subtitle: "Let's personalize your experience",
            description: "We'll ask you a few questions to provide better recommendations for accommodations and food options.",
            icon: "home-outline",
            color: "#3498db"
        },
        {
            title: "What type of accommodation are you looking for?",
            subtitle: "Choose your preferred living arrangement",
            type: "single_choice",
            field: "accommodationType",
            options: [
                { id: 'single_room', label: '🏠 Single Room', description: 'Private room in shared space' },
                { id: 'shared_apartment', label: '🏢 Shared Apartment', description: 'Apartment with roommates' },
                { id: 'studio', label: '🏨 Studio Apartment', description: 'Self-contained unit' },
                { id: 'full_apartment', label: '🏡 Full Apartment', description: 'Entire apartment to yourself' }
            ]
        },
        {
            title: "What's your monthly budget?",
            subtitle: "Help us show options within your range",
            type: "single_choice",
            field: "budget",
            options: [
                { id: 'under_15000', label: '💰 Under ₨15,000', description: 'Budget-friendly options' },
                { id: '15000_25000', label: '💵 ₨15,000 - ₨25,000', description: 'Mid-range options' },
                { id: '25000_40000', label: '💸 ₨25,000 - ₨40,000', description: 'Premium options' },
                { id: 'above_40000', label: '💎 Above ₨40,000', description: 'Luxury options' }
            ]
        },
        {
            title: "Where would you prefer to stay?",
            subtitle: "Choose your preferred area",
            type: "single_choice",
            field: "preferredLocation",
            options: [
                { id: 'near_university', label: '🏫 Near University', description: 'Close to educational institutions' },
                { id: 'city_center', label: '🌆 City Center', description: 'Downtown area with amenities' },
                { id: 'clifton_dha', label: '🌊 Clifton/DHA', description: 'Upscale residential area' },
                { id: 'gulshan_gulberg', label: '🏘️ Gulshan/Gulberg', description: 'Well-connected neighborhoods' },
                { id: 'north_nazimabad', label: '🏙️ North Nazimabad', description: 'Established residential area' }
            ]
        },
        {
            title: "What type of food do you prefer?",
            subtitle: "Select all that apply",
            type: "multiple_choice",
            field: "foodPreferences",
            options: [
                { id: 'pakistani', label: '🍛 Pakistani/Desi', description: 'Traditional local cuisine' },
                { id: 'fast_food', label: '🍕 Fast Food', description: 'Quick and convenient meals' },
                { id: 'healthy', label: '🥗 Healthy/Diet', description: 'Health-conscious options' },
                { id: 'international', label: '🌍 International', description: 'Global cuisines' },
                { id: 'vegetarian', label: '🌱 Vegetarian/Vegan', description: 'Plant-based options' },
                { id: 'halal', label: '☪️ Halal', description: 'Halal-certified food' }
            ]
        },
        {
            title: "What's your lifestyle like?",
            subtitle: "This helps us understand your needs",
            type: "multiple_choice",
            field: "lifestyle",
            options: [
                { id: 'student', label: '📚 Active Student', description: 'Studying and attending classes' },
                { id: 'social', label: '👥 Social Person', description: 'Enjoys meeting new people' },
                { id: 'quiet', label: '🤫 Quiet Living', description: 'Prefers peaceful environment' },
                { id: 'work_study', label: '💼 Work & Study', description: 'Balancing work and education' },
                { id: 'fitness', label: '🏋️ Fitness Enthusiast', description: 'Active and health-focused' },
                { id: 'tech_savvy', label: '💻 Tech Savvy', description: 'Needs good internet and tech amenities' }
            ]
        },
        {
            title: "What are your priorities?",
            subtitle: "Choose what matters most to you",
            type: "multiple_choice",
            field: "priorities",
            options: [
                { id: 'safety', label: '🔒 Safety & Security', description: 'Secure living environment' },
                { id: 'transport', label: '🚌 Transportation Access', description: 'Easy commute options' },
                { id: 'amenities', label: '🏊 Amenities', description: 'Gym, pool, common areas' },
                { id: 'internet', label: '📶 High-Speed Internet', description: 'Reliable internet connection' },
                { id: 'cleanliness', label: '🧹 Cleanliness', description: 'Well-maintained facilities' },
                { id: 'price', label: '💰 Best Price', description: 'Value for money' }
            ]
        },
        {
            title: "How do you usually travel?",
            subtitle: "This helps with location recommendations",
            type: "single_choice",
            field: "transportation",
            options: [
                { id: 'public_transport', label: '🚌 Public Transport', description: 'Bus, rickshaw, etc.' },
                { id: 'own_vehicle', label: '🏍️ Own Vehicle', description: 'Bike or car' },
                { id: 'ride_sharing', label: '🚗 Ride Sharing', description: 'Uber, Careem, etc.' },
                { id: 'walking', label: '🚶 Walking', description: 'Prefer to walk' },
                { id: 'cycling', label: '🚴 Cycling', description: 'Bicycle commute' }
            ]
        },
        {
            title: "You're all set!",
            subtitle: "Your preferences have been saved",
            description: "We'll use this information to provide personalized recommendations. You can always update your preferences later in the settings.",
            icon: "checkmark-circle-outline",
            color: "#2ecc71",
            type: "completion"
        }
    ];

    const handleNext = () => {
        if (currentStep < onboardingSteps.length - 1) {
            setCurrentStep(currentStep + 1);
        } else {
            completeOnboarding();
        }
    };

    const handleBack = () => {
        if (currentStep > 0) {
            setCurrentStep(currentStep - 1);
        }
    };

    const handleSelection = (field, value, isMultiple = false) => {
        if (isMultiple) {
            const currentValues = userPreferences[field] || [];
            const updatedValues = currentValues.includes(value)
                ? currentValues.filter(v => v !== value)
                : [...currentValues, value];
            setUserPreferences(prev => ({ ...prev, [field]: updatedValues }));
        } else {
            setUserPreferences(prev => ({ ...prev, [field]: value }));
        }
    };

    const completeOnboarding = async () => {
        try {
            // Save preferences to backend
            if (userData) {
                await authService.updateUserPreferences(userData.id, userPreferences);
            }
            
            // Mark onboarding as completed
            await AsyncStorage.setItem('hasCompletedOnboarding', 'true');
            await AsyncStorage.setItem('userPreferences', JSON.stringify(userPreferences));
            
            Alert.alert(
                'Welcome to StayKaru!',
                'Your preferences have been saved. You can now explore personalized recommendations.',
                [
                    {
                        text: 'Start Exploring',
                        onPress: () => {
                            navigation.reset({
                                index: 0,
                                routes: [{ name: 'StudentDashboard' }],
                            });
                        }
                    }
                ]
            );
        } catch (error) {
            console.error('Error completing onboarding:', error);
            Alert.alert('Error', 'Failed to save preferences. Please try again.');
        }
    };

    const renderProgressBar = () => (
        <View style={styles.progressContainer}>
            <View style={styles.progressBar}>
                <View 
                    style={[
                        styles.progressFill, 
                        { width: `${((currentStep + 1) / onboardingSteps.length) * 100}%` }
                    ]} 
                />
            </View>
            <Text style={styles.progressText}>
                {currentStep + 1} of {onboardingSteps.length}
            </Text>
        </View>
    );

    const renderWelcomeStep = (step) => (
        <View style={styles.welcomeContainer}>
            <View style={[styles.welcomeIcon, { backgroundColor: step.color + '20' }]}>
                <Ionicons name={step.icon} size={60} color={step.color} />
            </View>
            <Text style={styles.welcomeTitle}>{step.title}</Text>
            <Text style={styles.welcomeSubtitle}>{step.subtitle}</Text>
            <Text style={styles.welcomeDescription}>{step.description}</Text>
        </View>
    );

    const renderSelectionStep = (step) => (
        <View style={styles.selectionContainer}>
            <Text style={styles.stepTitle}>{step.title}</Text>
            <Text style={styles.stepSubtitle}>{step.subtitle}</Text>
            
            <ScrollView style={styles.optionsContainer} showsVerticalScrollIndicator={false}>
                {step.options.map((option) => {
                    const isSelected = step.type === 'multiple_choice'
                        ? (userPreferences[step.field] || []).includes(option.id)
                        : userPreferences[step.field] === option.id;
                    
                    return (
                        <TouchableOpacity
                            key={option.id}
                            style={[
                                styles.optionCard,
                                isSelected && styles.optionCardSelected
                            ]}
                            onPress={() => handleSelection(step.field, option.id, step.type === 'multiple_choice')}
                        >
                            <View style={styles.optionContent}>
                                <Text style={[
                                    styles.optionLabel,
                                    isSelected && styles.optionLabelSelected
                                ]}>
                                    {option.label}
                                </Text>
                                <Text style={[
                                    styles.optionDescription,
                                    isSelected && styles.optionDescriptionSelected
                                ]}>
                                    {option.description}
                                </Text>
                            </View>
                            <View style={[
                                styles.optionIndicator,
                                isSelected && styles.optionIndicatorSelected
                            ]}>
                                {isSelected && (
                                    <Ionicons name="checkmark" size={16} color={COLORS.light} />
                                )}
                            </View>
                        </TouchableOpacity>
                    );
                })}
            </ScrollView>
        </View>
    );

    const renderCompletionStep = (step) => (
        <View style={styles.completionContainer}>
            <View style={[styles.completionIcon, { backgroundColor: step.color + '20' }]}>
                <Ionicons name={step.icon} size={80} color={step.color} />
            </View>
            <Text style={styles.completionTitle}>{step.title}</Text>
            <Text style={styles.completionSubtitle}>{step.subtitle}</Text>
            <Text style={styles.completionDescription}>{step.description}</Text>
            
            <View style={styles.preferencesPreview}>
                <Text style={styles.previewTitle}>Your Preferences:</Text>
                <Text style={styles.previewItem}>🏠 {userPreferences.accommodationType}</Text>
                <Text style={styles.previewItem}>💰 {userPreferences.budget}</Text>
                <Text style={styles.previewItem}>📍 {userPreferences.preferredLocation}</Text>
                <Text style={styles.previewItem}>
                    🍽️ {userPreferences.foodPreferences?.length || 0} food preferences
                </Text>
            </View>
        </View>
    );

    const currentStepData = onboardingSteps[currentStep];
    const canProceed = () => {
        if (!currentStepData.field) return true;
        
        if (currentStepData.type === 'multiple_choice') {
            return (userPreferences[currentStepData.field] || []).length > 0;
        }
        
        return userPreferences[currentStepData.field];
    };

    return (
        <SafeAreaView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity 
                    onPress={handleBack}
                    disabled={currentStep === 0}
                    style={[styles.backButton, currentStep === 0 && styles.backButtonDisabled]}
                >
                    <Ionicons 
                        name="arrow-back" 
                        size={24} 
                        color={currentStep === 0 ? COLORS.gray[400] : COLORS.dark} 
                    />
                </TouchableOpacity>
                
                <TouchableOpacity 
                    onPress={() => {
                        Alert.alert(
                            'Skip Onboarding',
                            'Are you sure you want to skip the setup? You can always complete it later in settings.',
                            [
                                { text: 'Continue Setup', style: 'cancel' },
                                {
                                    text: 'Skip',
                                    onPress: () => {
                                        navigation.reset({
                                            index: 0,
                                            routes: [{ name: 'StudentDashboard' }],
                                        });
                                    }
                                }
                            ]
                        );
                    }}
                    style={styles.skipButton}
                >
                    <Text style={styles.skipButtonText}>Skip</Text>
                </TouchableOpacity>
            </View>

            {renderProgressBar()}

            {/* Content */}
            <View style={styles.content}>
                {currentStepData.type === 'completion' ? (
                    renderCompletionStep(currentStepData)
                ) : currentStepData.type ? (
                    renderSelectionStep(currentStepData)
                ) : (
                    renderWelcomeStep(currentStepData)
                )}
            </View>

            {/* Footer */}
            <View style={styles.footer}>
                <TouchableOpacity
                    style={[
                        styles.nextButton,
                        !canProceed() && styles.nextButtonDisabled
                    ]}
                    onPress={handleNext}
                    disabled={!canProceed()}
                >
                    <LinearGradient
                        colors={canProceed() ? [COLORS.primary, COLORS.secondary] : [COLORS.gray[300], COLORS.gray[400]]}
                        style={styles.nextButtonGradient}
                    >
                        <Text style={[
                            styles.nextButtonText,
                            !canProceed() && styles.nextButtonTextDisabled
                        ]}>
                            {currentStep === onboardingSteps.length - 1 ? 'Get Started' : 'Continue'}
                        </Text>
                        <Ionicons 
                            name="arrow-forward" 
                            size={20} 
                            color={canProceed() ? COLORS.light : COLORS.gray[500]} 
                        />
                    </LinearGradient>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.gray[50],
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 16,
    },
    backButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: COLORS.light,
        alignItems: 'center',
        justifyContent: 'center',
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
    },
    backButtonDisabled: {
        backgroundColor: COLORS.gray[200],
    },
    skipButton: {
        paddingHorizontal: 16,
        paddingVertical: 8,
    },
    skipButtonText: {
        fontSize: SIZES.body2,
        color: COLORS.gray[600],
        fontWeight: '500',
    },
    progressContainer: {
        paddingHorizontal: 20,
        marginBottom: 20,
    },
    progressBar: {
        height: 4,
        backgroundColor: COLORS.gray[200],
        borderRadius: 2,
        overflow: 'hidden',
    },
    progressFill: {
        height: '100%',
        backgroundColor: COLORS.primary,
        borderRadius: 2,
    },
    progressText: {
        fontSize: SIZES.body3,
        color: COLORS.gray[600],
        textAlign: 'center',
        marginTop: 8,
    },
    content: {
        flex: 1,
        paddingHorizontal: 20,
    },
    welcomeContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 40,
    },
    welcomeIcon: {
        width: 120,
        height: 120,
        borderRadius: 60,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 30,
    },
    welcomeTitle: {
        fontSize: SIZES.h2,
        fontWeight: 'bold',
        color: COLORS.dark,
        textAlign: 'center',
        marginBottom: 12,
    },
    welcomeSubtitle: {
        fontSize: SIZES.h4,
        color: COLORS.gray[600],
        textAlign: 'center',
        marginBottom: 20,
    },
    welcomeDescription: {
        fontSize: SIZES.body1,
        color: COLORS.gray[600],
        textAlign: 'center',
        lineHeight: 24,
        paddingHorizontal: 20,
    },
    selectionContainer: {
        flex: 1,
        paddingVertical: 20,
    },
    stepTitle: {
        fontSize: SIZES.h3,
        fontWeight: 'bold',
        color: COLORS.dark,
        marginBottom: 8,
    },
    stepSubtitle: {
        fontSize: SIZES.body1,
        color: COLORS.gray[600],
        marginBottom: 30,
    },
    optionsContainer: {
        flex: 1,
    },
    optionCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.light,
        borderRadius: 12,
        padding: 20,
        marginBottom: 12,
        borderWidth: 2,
        borderColor: COLORS.gray[200],
        elevation: 1,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
    },
    optionCardSelected: {
        borderColor: COLORS.primary,
        backgroundColor: COLORS.primary + '10',
    },
    optionContent: {
        flex: 1,
    },
    optionLabel: {
        fontSize: SIZES.body1,
        fontWeight: '600',
        color: COLORS.dark,
        marginBottom: 4,
    },
    optionLabelSelected: {
        color: COLORS.primary,
    },
    optionDescription: {
        fontSize: SIZES.body3,
        color: COLORS.gray[600],
    },
    optionDescriptionSelected: {
        color: COLORS.primary,
    },
    optionIndicator: {
        width: 24,
        height: 24,
        borderRadius: 12,
        borderWidth: 2,
        borderColor: COLORS.gray[300],
        alignItems: 'center',
        justifyContent: 'center',
        marginLeft: 16,
    },
    optionIndicatorSelected: {
        backgroundColor: COLORS.primary,
        borderColor: COLORS.primary,
    },
    completionContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 40,
    },
    completionIcon: {
        width: 140,
        height: 140,
        borderRadius: 70,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 30,
    },
    completionTitle: {
        fontSize: SIZES.h2,
        fontWeight: 'bold',
        color: COLORS.dark,
        textAlign: 'center',
        marginBottom: 12,
    },
    completionSubtitle: {
        fontSize: SIZES.h4,
        color: COLORS.gray[600],
        textAlign: 'center',
        marginBottom: 20,
    },
    completionDescription: {
        fontSize: SIZES.body1,
        color: COLORS.gray[600],
        textAlign: 'center',
        lineHeight: 24,
        paddingHorizontal: 20,
        marginBottom: 30,
    },
    preferencesPreview: {
        backgroundColor: COLORS.light,
        borderRadius: 12,
        padding: 20,
        width: '100%',
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
    },
    previewTitle: {
        fontSize: SIZES.body1,
        fontWeight: '600',
        color: COLORS.dark,
        marginBottom: 12,
    },
    previewItem: {
        fontSize: SIZES.body2,
        color: COLORS.gray[700],
        marginBottom: 8,
    },
    footer: {
        paddingHorizontal: 20,
        paddingVertical: 20,
    },
    nextButton: {
        borderRadius: 12,
        overflow: 'hidden',
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
    },
    nextButtonDisabled: {
        elevation: 1,
        shadowOpacity: 0.05,
    },
    nextButtonGradient: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 16,
        paddingHorizontal: 24,
    },
    nextButtonText: {
        fontSize: SIZES.body1,
        fontWeight: '600',
        color: COLORS.light,
        marginRight: 8,
    },
    nextButtonTextDisabled: {
        color: COLORS.gray[500],
    },
});

export default OnboardingScreen;
