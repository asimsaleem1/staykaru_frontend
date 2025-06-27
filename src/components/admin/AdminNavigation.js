import React, { useState } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    ScrollView,
    StyleSheet,
    Modal,
    Alert,
    Dimensions,
    Animated
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, SIZES } from '../../utils/constants';

const { width } = Dimensions.get('window');

const AdminNavigation = ({ navigation, currentScreen }) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const [slideAnim] = useState(new Animated.Value(0));

    const toggleExpanded = () => {
        const toValue = isExpanded ? 0 : 1;
        Animated.timing(slideAnim, {
            toValue,
            duration: 300,
            useNativeDriver: false,
        }).start();
        setIsExpanded(!isExpanded);
    };

    const adminScreens = [
        {
            id: 'Dashboard',
            title: 'Dashboard',
            icon: 'grid',
            color: '#4F8EF7',
            gradient: ['#4F8EF7', '#5B9BFF'],
            description: 'Overview & Analytics'
        },
        {
            id: 'UserManagement',
            title: 'User Management',
            icon: 'people',
            color: '#34C759',
            gradient: ['#34C759', '#40D867'],
            description: 'Manage all users'
        },
        {
            id: 'AccommodationManagement',
            title: 'Accommodations',
            icon: 'home',
            color: '#FF9500',
            gradient: ['#FF9500', '#FFA726'],
            description: 'Property management'
        },
        {
            id: 'FoodServiceManagement',
            title: 'Food Services',
            icon: 'restaurant',
            color: '#FF2D55',
            gradient: ['#FF2D55', '#FF3B69'],
            description: 'Restaurant management'
        },
        {
            id: 'BookingManagement',
            title: 'Bookings',
            icon: 'calendar',
            color: '#AF52DE',
            gradient: ['#AF52DE', '#BA68C8'],
            description: 'Reservation tracking'
        },
        {
            id: 'OrderManagement',
            title: 'Orders',
            icon: 'fast-food',
            color: '#30D158',
            gradient: ['#30D158', '#4CAF50'],
            description: 'Food order management'
        },
        {
            id: 'FinancialManagement',
            title: 'Financial',
            icon: 'card',
            color: '#5856D6',
            gradient: ['#5856D6', '#673AB7'],
            description: 'Revenue & transactions'
        },
        {
            id: 'ContentModeration',
            title: 'Content',
            icon: 'shield-checkmark',
            color: '#FF9F0A',
            gradient: ['#FF9F0A', '#FFB74D'],
            description: 'Content moderation'
        },
        {
            id: 'SystemAdministration',
            title: 'System',
            icon: 'settings',
            color: '#007AFF',
            gradient: ['#007AFF', '#2196F3'],
            description: 'System configuration'
        },
        {
            id: 'ExportReports',
            title: 'Reports',
            icon: 'document-text',
            color: '#FF3B30',
            gradient: ['#FF3B30', '#F44336'],
            description: 'Generate reports'
        },
        {
            id: 'NotificationManagement',
            title: 'Notifications',
            icon: 'notifications',
            color: '#5AC8FA',
            gradient: ['#5AC8FA', '#03DAC6'],
            description: 'Send notifications'
        },
        {
            id: 'AdminProfile',
            title: 'Profile',
            icon: 'person',
            color: '#FF6B6B',
            gradient: ['#FF6B6B', '#E57373'],
            description: 'Account settings'
        },
        {
            id: 'AdminTestRunner',
            title: 'Test Runner',
            icon: 'bug',
            color: '#8E44AD',
            gradient: ['#8E44AD', '#9B59B6'],
            description: 'System diagnostics'
        }
    ];

    const handleScreenPress = (screenId) => {
        navigation.navigate(screenId);
        if (isExpanded) {
            toggleExpanded();
        }
    };

    const currentScreenData = adminScreens.find(screen => screen.id === currentScreen);

    return (
        <View style={styles.container}>
            {/* Main Navigation Bar */}
            <LinearGradient colors={[COLORS.primary, COLORS.secondary]} style={styles.mainNav}>
                <View style={styles.mainNavContent}>
                    <View style={styles.currentScreenInfo}>
                        <View style={[styles.currentIcon, { backgroundColor: currentScreenData?.color + '20' }]}>
                            <Ionicons 
                                name={currentScreenData?.icon || 'grid'} 
                                size={24} 
                                color={currentScreenData?.color || '#fff'} 
                            />
                        </View>
                        <View style={styles.currentScreenText}>
                            <Text style={styles.currentScreenTitle}>{currentScreenData?.title || 'Dashboard'}</Text>
                            <Text style={styles.currentScreenDescription}>{currentScreenData?.description || 'Overview & Analytics'}</Text>
                        </View>
                    </View>
                    
                    <TouchableOpacity style={styles.expandButton} onPress={toggleExpanded}>
                        <Ionicons 
                            name={isExpanded ? 'chevron-up' : 'chevron-down'} 
                            size={24} 
                            color="#fff" 
                        />
                    </TouchableOpacity>
                </View>
            </LinearGradient>

            {/* Expanded Navigation Menu */}
            <Animated.View 
                style={[
                    styles.expandedMenu,
                    {
                        maxHeight: slideAnim.interpolate({
                            inputRange: [0, 1],
                            outputRange: [0, 400],
                        }),
                        opacity: slideAnim,
                    }
                ]}
            >
                <ScrollView 
                    style={styles.menuScroll}
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={styles.menuContent}
                >
                    <Text style={styles.menuTitle}>Admin Modules</Text>
                    
                    <View style={styles.menuGrid}>
                        {adminScreens.map((screen) => (
                            <TouchableOpacity
                                key={screen.id}
                                style={[
                                    styles.menuItem,
                                    currentScreen === screen.id && styles.menuItemActive
                                ]}
                                onPress={() => handleScreenPress(screen.id)}
                                activeOpacity={0.8}
                            >
                                <LinearGradient 
                                    colors={screen.gradient} 
                                    style={styles.menuItemGradient}
                                >
                                    <View style={styles.menuItemHeader}>
                                        <Ionicons name={screen.icon} size={20} color="#fff" />
                                        {currentScreen === screen.id && (
                                            <View style={styles.activeIndicator}>
                                                <Ionicons name="checkmark-circle" size={16} color="#fff" />
                                            </View>
                                        )}
                                    </View>
                                    <Text style={styles.menuItemTitle}>{screen.title}</Text>
                                    <Text style={styles.menuItemDescription}>{screen.description}</Text>
                                </LinearGradient>
                            </TouchableOpacity>
                        ))}
                    </View>
                </ScrollView>
            </Animated.View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 1000,
    },
    mainNav: {
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderBottomLeftRadius: 16,
        borderBottomRightRadius: 16,
        elevation: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
    },
    mainNavContent: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    currentScreenInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    currentIcon: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    currentScreenText: {
        flex: 1,
    },
    currentScreenTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#fff',
        marginBottom: 2,
    },
    currentScreenDescription: {
        fontSize: 12,
        color: '#fff',
        opacity: 0.9,
    },
    expandButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    expandedMenu: {
        backgroundColor: '#fff',
        borderBottomLeftRadius: 16,
        borderBottomRightRadius: 16,
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        overflow: 'hidden',
    },
    menuScroll: {
        maxHeight: 400,
    },
    menuContent: {
        padding: 16,
    },
    menuTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 16,
        textAlign: 'center',
    },
    menuGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
    },
    menuItem: {
        width: (width - 48) / 2,
        marginBottom: 12,
        borderRadius: 12,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    menuItemActive: {
        elevation: 6,
        shadowOpacity: 0.2,
        transform: [{ scale: 1.02 }],
    },
    menuItemGradient: {
        borderRadius: 12,
        padding: 12,
        minHeight: 80,
    },
    menuItemHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    activeIndicator: {
        backgroundColor: 'rgba(255, 255, 255, 0.3)',
        borderRadius: 8,
        padding: 2,
    },
    menuItemTitle: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#fff',
        marginBottom: 4,
    },
    menuItemDescription: {
        fontSize: 10,
        color: '#fff',
        opacity: 0.9,
    },
});

export default AdminNavigation;
