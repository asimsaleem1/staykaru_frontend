import React, { useState } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    ScrollView,
    StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SIZES } from '../../utils/constants';

const AdminNavigation = ({ activeScreen, onNavigate, user }) => {
    const [collapsed, setCollapsed] = useState(false);    const navigationItems = [
        {
            id: 'dashboard',
            title: 'Dashboard',
            icon: 'grid-outline',
            description: 'Overview & Analytics',
            screen: 'AdminDashboard'
        },
        {
            id: 'analytics',
            title: 'Analytics Center',
            icon: 'analytics-outline',
            description: 'Detailed Analytics',
            screen: 'AdminAnalytics'
        },
        {
            id: 'endpointTest',
            title: 'Endpoint Testing',
            icon: 'bug-outline',
            description: 'Test Backend APIs',
            screen: 'AdminEndpointTest'
        },
        {
            id: 'moduleTest',
            title: 'Module Testing',
            icon: 'checkmark-circle-outline',
            description: 'Test All Modules',
            screen: 'AdminModuleTest'
        },
        {
            id: 'users',
            title: 'User Management',
            icon: 'people-outline',
            description: 'Manage Platform Users',
            screen: 'AdminUserManagement'
        },
        {
            id: 'accommodations',
            title: 'Accommodations',
            icon: 'home-outline',
            description: 'Manage Properties',
            screen: 'AdminAccommodations'
        },
        {
            id: 'foodProviders',
            title: 'Food Providers',
            icon: 'restaurant-outline',
            description: 'Manage Restaurants',
            screen: 'AdminFoodProviders'
        },
        {
            id: 'bookings',
            title: 'Bookings',
            icon: 'calendar-outline',
            description: 'Manage Bookings',
            screen: 'AdminBookings'
        },
        {
            id: 'orders',
            title: 'Orders',
            icon: 'receipt-outline',
            description: 'Manage Food Orders',
            screen: 'AdminOrders'
        },
        {
            id: 'moderation',
            title: 'Content Moderation',
            icon: 'shield-checkmark-outline',
            description: 'Review & Moderate Content',
            screen: 'AdminContentModeration'
        },
        {
            id: 'finance',
            title: 'Financial Management',
            icon: 'card-outline',
            description: 'Revenue & Payouts',
            screen: 'AdminFinancialManagement'
        },        {
            id: 'notifications',
            title: 'Notifications',
            icon: 'notifications-outline',
            description: 'Manage Notifications',
            screen: 'AdminNotifications'
        },
        {
            id: 'announcements',
            title: 'Announcements',
            icon: 'megaphone-outline',
            description: 'Create & Manage Announcements',
            screen: 'AdminAnnouncements'
        },
        {
            id: 'reports',
            title: 'Reports & Analytics',
            icon: 'bar-chart-outline',
            description: 'Generate Reports',
            screen: 'AdminReportsCenter'
        },
        {
            id: 'settings',
            title: 'System Settings',
            icon: 'settings-outline',
            description: 'Platform Configuration',
            screen: 'AdminSystemSettings'
        }
    ];

    const renderNavigationItem = (item) => (
        <TouchableOpacity
            key={item.id}
            style={[
                styles.navItem,
                activeScreen === item.id && styles.navItemActive,
                collapsed && styles.navItemCollapsed
            ]}
            onPress={() => onNavigate(item.screen || item.id)}
        >
            <View style={styles.navItemIcon}>
                <Ionicons
                    name={item.icon}
                    size={24}
                    color={activeScreen === item.id ? COLORS.primary : COLORS.gray[600]}
                />
            </View>
            {!collapsed && (
                <View style={styles.navItemContent}>
                    <Text style={[
                        styles.navItemTitle,
                        activeScreen === item.id && styles.navItemTitleActive
                    ]}>
                        {item.title}
                    </Text>
                    <Text style={styles.navItemDescription}>
                        {item.description}
                    </Text>
                </View>
            )}
            {activeScreen === item.id && <View style={styles.navItemIndicator} />}
        </TouchableOpacity>
    );

    return (
        <View style={[styles.container, collapsed && styles.containerCollapsed]}>
            {/* Header */}
            <View style={styles.header}>
                <View style={styles.headerContent}>
                    {!collapsed && (
                        <View>
                            <Text style={styles.brandTitle}>StayKaru Admin</Text>
                            <Text style={styles.brandSubtitle}>Control Panel</Text>
                        </View>
                    )}
                    <TouchableOpacity
                        style={styles.collapseButton}
                        onPress={() => setCollapsed(!collapsed)}
                    >
                        <Ionicons
                            name={collapsed ? 'chevron-forward' : 'chevron-back'}
                            size={20}
                            color={COLORS.gray[600]}
                        />
                    </TouchableOpacity>
                </View>
            </View>

            {/* User Info */}
            {!collapsed && (
                <View style={styles.userInfo}>
                    <View style={styles.userAvatar}>
                        <Ionicons name="person" size={24} color={COLORS.primary} />
                    </View>
                    <View style={styles.userDetails}>
                        <Text style={styles.userName}>{user?.name || 'Admin User'}</Text>
                        <Text style={styles.userRole}>Administrator</Text>
                    </View>
                </View>
            )}

            {/* Navigation Items */}
            <ScrollView style={styles.navigation} showsVerticalScrollIndicator={false}>
                {navigationItems.map(renderNavigationItem)}
            </ScrollView>

            {/* Footer */}
            <View style={styles.footer}>
                <TouchableOpacity style={styles.footerButton}>
                    <Ionicons name="help-circle-outline" size={20} color={COLORS.gray[600]} />
                    {!collapsed && <Text style={styles.footerButtonText}>Help & Support</Text>}
                </TouchableOpacity>
                <TouchableOpacity style={styles.footerButton}>
                    <Ionicons name="log-out-outline" size={20} color={COLORS.error} />
                    {!collapsed && <Text style={[styles.footerButtonText, { color: COLORS.error }]}>Logout</Text>}
                </TouchableOpacity>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        width: 280,
        backgroundColor: COLORS.light,
        borderRightWidth: 1,
        borderRightColor: COLORS.gray[200],
        flexDirection: 'column',
    },
    containerCollapsed: {
        width: 80,
    },
    header: {
        padding: 20,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.gray[200],
    },
    headerContent: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    brandTitle: {
        fontSize: SIZES.h3,
        fontWeight: 'bold',
        color: COLORS.dark,
    },
    brandSubtitle: {
        fontSize: SIZES.body3,
        color: COLORS.gray[600],
        marginTop: 2,
    },
    collapseButton: {
        padding: 8,
        borderRadius: 6,
        backgroundColor: COLORS.gray[100],
    },
    userInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 20,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.gray[200],
    },
    userAvatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: COLORS.primary + '20',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    userDetails: {
        flex: 1,
    },
    userName: {
        fontSize: SIZES.body1,
        fontWeight: '600',
        color: COLORS.dark,
    },
    userRole: {
        fontSize: SIZES.body3,
        color: COLORS.gray[600],
        marginTop: 2,
    },
    navigation: {
        flex: 1,
        paddingTop: 10,
    },
    navItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 12,
        marginHorizontal: 10,
        marginVertical: 2,
        borderRadius: 8,
        position: 'relative',
    },
    navItemCollapsed: {
        paddingHorizontal: 16,
        marginHorizontal: 12,
        justifyContent: 'center',
    },
    navItemActive: {
        backgroundColor: COLORS.primary + '10',
    },
    navItemIcon: {
        marginRight: 12,
    },
    navItemContent: {
        flex: 1,
    },
    navItemTitle: {
        fontSize: SIZES.body1,
        fontWeight: '600',
        color: COLORS.gray[700],
    },
    navItemTitleActive: {
        color: COLORS.primary,
    },
    navItemDescription: {
        fontSize: SIZES.body3,
        color: COLORS.gray[500],
        marginTop: 2,
    },
    navItemIndicator: {
        position: 'absolute',
        right: 0,
        top: 0,
        bottom: 0,
        width: 3,
        backgroundColor: COLORS.primary,
        borderTopLeftRadius: 2,
        borderBottomLeftRadius: 2,
    },
    footer: {
        padding: 20,
        borderTopWidth: 1,
        borderTopColor: COLORS.gray[200],
    },
    footerButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 8,
    },
    footerButtonText: {
        fontSize: SIZES.body2,
        color: COLORS.gray[600],
        marginLeft: 8,
    },
});

export default AdminNavigation;
