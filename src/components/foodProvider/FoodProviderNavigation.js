import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const FoodProviderNavigation = ({ navigation, activeRoute }) => {
    const navigationItems = [        {
            key: 'dashboard',
            label: 'Dashboard',
            icon: 'home-outline',
            activeIcon: 'home',
            screen: 'FoodProviderDashboardNew'
        },
        {
            key: 'menu',
            label: 'Menu',
            icon: 'restaurant-outline',
            activeIcon: 'restaurant',
            screen: 'MenuManagement'
        },
        {
            key: 'orders',
            label: 'Orders',
            icon: 'receipt-outline',
            activeIcon: 'receipt',
            screen: 'OrderManagement'
        },
        {
            key: 'inventory',
            label: 'Inventory',
            icon: 'cube-outline',
            activeIcon: 'cube',
            screen: 'InventoryManagement'
        },
        {
            key: 'reviews',
            label: 'Reviews',
            icon: 'star-outline',
            activeIcon: 'star',
            screen: 'ReviewsRatings'
        },
        {
            key: 'analytics',
            label: 'Analytics',
            icon: 'bar-chart-outline',
            activeIcon: 'bar-chart',
            screen: 'AnalyticsReports'
        },
        {
            key: 'profile',
            label: 'Profile',
            icon: 'person-outline',
            activeIcon: 'person',
            screen: 'FoodProviderProfile'
        },
        {
            key: 'settings',
            label: 'Settings',
            icon: 'settings-outline',
            activeIcon: 'settings',
            screen: 'Settings'
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
                        color={activeRoute === item.key ? '#FF6B35' : '#666'}
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
        backgroundColor: '#fff5f0',
    },
    navLabel: {
        fontSize: 12,
        color: '#666',
        marginTop: 4,
        textAlign: 'center',
        fontWeight: '500',
    },
    activeNavLabel: {
        color: '#FF6B35',
        fontWeight: '600',
    },
});

export default FoodProviderNavigation;
