import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const StudentNavigation = ({ navigation, activeRoute }) => {
    const navigationItems = [
        {
            key: 'dashboard',
            label: 'Home',
            icon: 'home-outline',
            activeIcon: 'home',
            screen: 'StudentDashboard'
        },
        {
            key: 'accommodations',
            label: 'Housing',
            icon: 'bed-outline',
            activeIcon: 'bed',
            screen: 'AccommodationSearch'
        },
        {
            key: 'food',
            label: 'Food',
            icon: 'restaurant-outline',
            activeIcon: 'restaurant',
            screen: 'FoodSearch'
        },
        {
            key: 'bookings',
            label: 'Bookings',
            icon: 'calendar-outline',
            activeIcon: 'calendar',
            screen: 'BookingHistory'
        },
        {
            key: 'profile',
            label: 'Profile',
            icon: 'person-outline',
            activeIcon: 'person',
            screen: 'StudentProfile'
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
                        color={activeRoute === item.key ? '#4CAF50' : '#666'}
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
        backgroundColor: '#f0fff0',
    },
    navLabel: {
        fontSize: 12,
        color: '#666',
        marginTop: 4,
        textAlign: 'center',
        fontWeight: '500',
    },
    activeNavLabel: {
        color: '#4CAF50',
        fontWeight: '600',
    },
});

export default StudentNavigation;
