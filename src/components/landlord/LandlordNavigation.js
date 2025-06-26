import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const LandlordNavigation = ({ navigation, activeRoute }) => {    const navigationItems = [        {
            key: 'dashboard',
            label: 'Dashboard',
            icon: 'home-outline',
            activeIcon: 'home',
            screen: 'LandlordDashboardNew'
        },
        {
            key: 'properties',
            label: 'Properties',
            icon: 'business-outline',
            activeIcon: 'business',
            screen: 'PropertyListing'
        },
        {
            key: 'bookings',
            label: 'Bookings',
            icon: 'calendar-outline',
            activeIcon: 'calendar',
            screen: 'BookingManagement'
        },        {
            key: 'analytics',
            label: 'Analytics',
            icon: 'analytics-outline',
            activeIcon: 'analytics',
            screen: 'Analytics'
        },
        {
            key: 'profile',
            label: 'Profile',
            icon: 'person-outline',
            activeIcon: 'person',
            screen: 'LandlordProfile'
        }
    ];

    return (
        <View style={styles.container}>
            {navigationItems.map((item) => (
                <TouchableOpacity
                    key={item.key}
                    style={[
                        styles.navItem,
                        activeRoute === item.key && styles.activeNavItem
                    ]}
                    onPress={() => navigation.navigate(item.screen)}
                >
                    <Ionicons
                        name={activeRoute === item.key ? item.activeIcon : item.icon}
                        size={24}
                        color={activeRoute === item.key ? '#6B73FF' : '#666'}
                    />
                    <Text style={[
                        styles.navLabel,
                        activeRoute === item.key && styles.activeNavLabel
                    ]}>
                        {item.label}
                    </Text>
                </TouchableOpacity>
            ))}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        backgroundColor: '#fff',
        borderTopWidth: 1,
        borderTopColor: '#e0e0e0',
        paddingVertical: 8,
        paddingHorizontal: 10,
        elevation: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    navItem: {
        flex: 1,
        alignItems: 'center',
        paddingVertical: 8,
        paddingHorizontal: 4,
        borderRadius: 8,
    },
    activeNavItem: {
        backgroundColor: '#f0f0ff',
    },
    navLabel: {
        fontSize: 12,
        color: '#666',
        marginTop: 4,
        textAlign: 'center',
        fontWeight: '500',
    },
    activeNavLabel: {
        color: '#6B73FF',
        fontWeight: '600',
    },
});

export default LandlordNavigation;
