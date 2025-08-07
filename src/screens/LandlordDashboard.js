import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    ScrollView,
    Alert,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SIZES } from '../utils/constants';

const LandlordDashboard = ({ navigation }) => {
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

    const handleLogout = async () => {
        Alert.alert(
            'Logout',
            'Are you sure you want to logout?',
            [
                {
                    text: 'Cancel',
                    style: 'cancel',
                },
                {
                    text: 'Logout',
                    onPress: async () => {
                        try {
                            await AsyncStorage.multiRemove(['userData', 'token']);
                            navigation.replace('Login');
                        } catch (error) {
                            console.error('Logout error:', error);
                        }
                    },
                },
            ]
        );
    };    const menuItems = [
        {
            title: 'My Properties',
            icon: 'home',
            description: 'Manage your rental properties',
            count: '5',
            onPress: () => navigation.navigate('PropertyListingScreen'),
        },
        {
            title: 'Bookings & Reservations',
            icon: 'calendar',
            description: 'View and manage bookings',
            count: '12',
            onPress: () => navigation.navigate('LandlordBookingManagementScreen'),
        },
        {
            title: 'Guest Management',
            icon: 'people',
            description: 'Manage your guests',
            count: '8',
            onPress: () => navigation.navigate('GuestManagementScreen'),
        },
        {
            title: 'Financial Reports',
            icon: 'bar-chart',
            description: 'View earnings and reports',
            onPress: () => navigation.navigate('LandlordFinancialManagementScreen'),
        },
        {
            title: 'Maintenance',
            icon: 'build',
            description: 'Manage maintenance requests',
            onPress: () => navigation.navigate('MaintenanceScreen'),
        },
        {
            title: 'Analytics',
            icon: 'stats-chart',
            description: 'View property analytics',
            onPress: () => navigation.navigate('LandlordAnalyticsScreen'),
        },
        {
            title: 'Reviews',
            icon: 'star',
            description: 'Manage guest reviews',
            onPress: () => navigation.navigate('ReviewsManagementScreen'),
        },
        {
            title: 'Profile Settings',
            icon: 'settings',
            description: 'Update your profile and preferences',
            onPress: () => navigation.navigate('LandlordProfileScreen'),
        },
    ];

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <View style={styles.welcomeSection}>
                    <Text style={styles.welcomeText}>Welcome back,</Text>
                    <Text style={styles.nameText}>{userData?.name || 'Landlord'}</Text>
                    <Text style={styles.roleText}>Property Owner</Text>
                </View>
                <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
                    <Ionicons name="log-out-outline" size={24} color={COLORS.white} />
                </TouchableOpacity>
            </View>

            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                <View style={styles.statsContainer}>
                    <View style={styles.statCard}>
                        <Ionicons name="home" size={30} color={COLORS.primary} />
                        <Text style={styles.statNumber}>5</Text>
                        <Text style={styles.statLabel}>Properties</Text>
                    </View>
                    <View style={styles.statCard}>
                        <Ionicons name="people" size={30} color={COLORS.success} />
                        <Text style={styles.statNumber}>8</Text>
                        <Text style={styles.statLabel}>Active Tenants</Text>
                    </View>
                    <View style={styles.statCard}>
                        <Ionicons name="cash" size={30} color={COLORS.warning} />
                        <Text style={styles.statNumber}>$2,340</Text>
                        <Text style={styles.statLabel}>Monthly Income</Text>
                    </View>
                </View>                <View style={styles.quickActions}>
                    <Text style={styles.sectionTitle}>Quick Actions</Text>
                    <View style={styles.actionRow}>
                        <TouchableOpacity 
                            style={styles.actionCard}
                            onPress={() => navigation.navigate('PropertyEdit')}
                        >
                            <Ionicons name="add-circle" size={32} color={COLORS.primary} />
                            <Text style={styles.actionText}>Add Property</Text>
                        </TouchableOpacity>
                        <TouchableOpacity 
                            style={styles.actionCard}
                            onPress={() => navigation.navigate('PropertyEdit')}
                        >
                            <Ionicons name="camera" size={32} color={COLORS.success} />
                            <Text style={styles.actionText}>Upload Photos</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                <View style={styles.menuContainer}>
                    <Text style={styles.sectionTitle}>Property Management</Text>
                    {menuItems.map((item, index) => (
                        <TouchableOpacity
                            key={index}
                            style={styles.menuItem}
                            onPress={item.onPress}
                        >
                            <View style={styles.menuIcon}>
                                <Ionicons name={item.icon} size={24} color={COLORS.primary} />
                            </View>
                            <View style={styles.menuContent}>
                                <Text style={styles.menuTitle}>{item.title}</Text>
                                <Text style={styles.menuDescription}>{item.description}</Text>
                            </View>
                            {item.count && (
                                <View style={styles.countBadge}>
                                    <Text style={styles.countText}>{item.count}</Text>
                                </View>
                            )}
                            <Ionicons name="chevron-forward" size={20} color={COLORS.gray} />
                        </TouchableOpacity>
                    ))}
                </View>
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
        paddingHorizontal: 20,
        paddingBottom: 20,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    welcomeSection: {
        flex: 1,
    },
    welcomeText: {
        fontSize: 16,
        color: COLORS.white,
        opacity: 0.8,
    },
    nameText: {
        fontSize: 24,
        fontWeight: 'bold',
        color: COLORS.white,
        marginTop: 5,
    },
    roleText: {
        fontSize: 14,
        color: COLORS.white,
        opacity: 0.8,
        marginTop: 2,
    },
    logoutButton: {
        padding: 10,
        backgroundColor: 'rgba(255,255,255,0.2)',
        borderRadius: 8,
    },
    content: {
        flex: 1,
        padding: 20,
    },
    statsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 30,
    },
    statCard: {
        backgroundColor: COLORS.white,
        padding: 15,
        borderRadius: 12,
        alignItems: 'center',
        flex: 1,
        marginHorizontal: 5,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 3.84,
        elevation: 5,
    },
    statNumber: {
        fontSize: 20,
        fontWeight: 'bold',
        color: COLORS.dark,
        marginTop: 8,
    },
    statLabel: {
        fontSize: 12,
        color: COLORS.gray,
        marginTop: 5,
    },
    quickActions: {
        marginBottom: 30,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: COLORS.dark,
        marginBottom: 15,
    },
    actionRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    actionCard: {
        backgroundColor: COLORS.white,
        padding: 20,
        borderRadius: 12,
        alignItems: 'center',
        flex: 1,
        marginHorizontal: 5,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 3.84,
        elevation: 5,
    },
    actionText: {
        fontSize: 14,
        color: COLORS.dark,
        marginTop: 8,
        fontWeight: '500',
    },
    menuContainer: {
        backgroundColor: COLORS.white,
        borderRadius: 12,
        padding: 20,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 3.84,
        elevation: 5,
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 15,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.lightGray,
    },
    menuIcon: {
        width: 50,
        height: 50,
        backgroundColor: `${COLORS.primary}15`,
        borderRadius: 25,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 15,
    },
    menuContent: {
        flex: 1,
    },
    menuTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: COLORS.dark,
    },
    menuDescription: {
        fontSize: 14,
        color: COLORS.gray,
        marginTop: 2,
    },
    countBadge: {
        backgroundColor: COLORS.primary,
        borderRadius: 12,
        paddingHorizontal: 8,
        paddingVertical: 4,
        marginRight: 10,
    },
    countText: {
        color: COLORS.white,
        fontSize: 12,
        fontWeight: 'bold',
    },
});

export default LandlordDashboard;
