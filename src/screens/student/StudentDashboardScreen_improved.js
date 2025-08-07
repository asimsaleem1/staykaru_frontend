import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    ScrollView,
    StyleSheet,
    TouchableOpacity,
    Image,
    Alert,
    RefreshControl,
    Dimensions,
    FlatList
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import authService from '../../services/authService';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, SIZES } from '../../utils/constants';

const { width } = Dimensions.get('window');

const StudentDashboardScreen = ({ navigation }) => {
    const [user, setUser] = useState(null);
    const [refreshing, setRefreshing] = useState(false);
    const [stats, setStats] = useState({
        activeBookings: 0,
        pendingOrders: 0,
        savedPlaces: 0,
        notifications: 0
    });

    useEffect(() => {
        loadDashboardData();
    }, []);

    const loadDashboardData = async () => {
        try {
            const currentUser = await authService.getCurrentUser();
            setUser(currentUser);
            
            // Load user stats
            setStats({
                activeBookings: 2,
                pendingOrders: 1,
                savedPlaces: 8,
                notifications: 3
            });
        } catch (error) {
            console.error('Error loading dashboard:', error);
        }
    };

    const onRefresh = async () => {
        setRefreshing(true);
        await loadDashboardData();
        setRefreshing(false);
    };

    const quickActions = [
        {
            id: '1',
            title: 'My Bookings',
            subtitle: `${stats.activeBookings} active`,
            icon: 'calendar',
            color: '#4CAF50',
            route: 'MyBookings'
        },
        {
            id: '2',
            title: 'Search Map',
            subtitle: 'Find nearby places',
            icon: 'map',
            color: '#2196F3',
            route: 'AccommodationMap'
        },
        {
            id: '3',
            title: 'Favorites',
            subtitle: `${stats.savedPlaces} saved`,
            icon: 'heart',
            color: '#E91E63',
            route: 'Favorites'
        },
        {
            id: '4',
            title: 'AI Assistant',
            subtitle: 'Get help & tips',
            icon: 'chatbubble-ellipses',
            color: '#9C27B0',
            route: 'Chatbot'
        },
        {
            id: '5',
            title: 'Safety Center',
            subtitle: 'Emergency contacts',
            icon: 'shield-checkmark',
            color: '#FF5722',
            route: 'SafetyEmergency'
        },
        {
            id: '6',
            title: 'Community',
            subtitle: 'Social feed',
            icon: 'people',
            color: '#FF9800',
            route: 'SocialFeed'
        },
        {
            id: '7',
            title: 'Notifications',
            subtitle: `${stats.notifications} new`,
            icon: 'notifications',
            color: '#607D8B',
            route: 'Notifications'
        },
        {
            id: '8',
            title: 'Support',
            subtitle: 'Get help',
            icon: 'help-circle',
            color: '#795548',
            route: 'Support'
        }
    ];

    const renderQuickAction = ({ item }) => (
        <TouchableOpacity
            style={styles.quickActionCard}
            onPress={() => navigation.navigate(item.route)}
        >
            <View style={[styles.quickActionIcon, { backgroundColor: item.color }]}>
                <Ionicons name={item.icon} size={24} color="white" />
            </View>
            <Text style={styles.quickActionTitle}>{item.title}</Text>
            <Text style={styles.quickActionSubtitle}>{item.subtitle}</Text>
        </TouchableOpacity>
    );

    const recentActivities = [
        {
            id: '1',
            type: 'booking',
            title: 'Accommodation Booking Confirmed',
            subtitle: 'Comfort Inn, Near University',
            time: '2 hours ago',
            icon: 'checkmark-circle',
            color: '#4CAF50'
        },
        {
            id: '2',
            type: 'order',
            title: 'Food Order Delivered',
            subtitle: 'Spice Garden Restaurant',
            time: 'Yesterday',
            icon: 'bag-check',
            color: '#2196F3'
        },
        {
            id: '3',
            type: 'review',
            title: 'Review Request',
            subtitle: 'Rate your recent stay',
            time: '2 days ago',
            icon: 'star',
            color: '#FF9800'
        }
    ];

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView 
                style={styles.scrollView}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                }
                showsVerticalScrollIndicator={false}
            >
                {/* Header */}
                <LinearGradient
                    colors={[COLORS.primary, COLORS.secondary]}
                    style={styles.header}
                >
                    <View style={styles.headerContent}>
                        <View style={styles.welcomeSection}>
                            <Text style={styles.welcomeText}>Welcome back,</Text>
                            <Text style={styles.userName}>{user?.name || 'Student'}</Text>
                            <Text style={styles.subtitle}>Ready to explore today?</Text>
                        </View>
                        <TouchableOpacity 
                            style={styles.notificationButton}
                            onPress={() => navigation.navigate('Notifications')}
                        >
                            <Ionicons name="notifications-outline" size={24} color="white" />
                            {stats.notifications > 0 && (
                                <View style={styles.notificationBadge}>
                                    <Text style={styles.notificationBadgeText}>{stats.notifications}</Text>
                                </View>
                            )}
                        </TouchableOpacity>
                    </View>
                </LinearGradient>

                {/* Stats Cards */}
                <View style={styles.statsContainer}>
                    <View style={styles.statsCard}>
                        <Ionicons name="calendar" size={24} color={COLORS.primary} />
                        <Text style={styles.statsNumber}>{stats.activeBookings}</Text>
                        <Text style={styles.statsLabel}>Active Bookings</Text>
                    </View>
                    <View style={styles.statsCard}>
                        <Ionicons name="bag" size={24} color={COLORS.secondary} />
                        <Text style={styles.statsNumber}>{stats.pendingOrders}</Text>
                        <Text style={styles.statsLabel}>Pending Orders</Text>
                    </View>
                    <View style={styles.statsCard}>
                        <Ionicons name="heart" size={24} color={COLORS.error} />
                        <Text style={styles.statsNumber}>{stats.savedPlaces}</Text>
                        <Text style={styles.statsLabel}>Saved Places</Text>
                    </View>
                </View>

                {/* Quick Actions */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Quick Actions</Text>
                    <FlatList
                        data={quickActions}
                        renderItem={renderQuickAction}
                        keyExtractor={item => item.id}
                        numColumns={2}
                        scrollEnabled={false}
                        columnWrapperStyle={styles.quickActionRow}
                    />
                </View>

                {/* Recent Activity */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Recent Activity</Text>
                    {recentActivities.map(activity => (
                        <View key={activity.id} style={styles.activityCard}>
                            <View style={[styles.activityIcon, { backgroundColor: activity.color }]}>
                                <Ionicons name={activity.icon} size={20} color="white" />
                            </View>
                            <View style={styles.activityContent}>
                                <Text style={styles.activityTitle}>{activity.title}</Text>
                                <Text style={styles.activitySubtitle}>{activity.subtitle}</Text>
                                <Text style={styles.activityTime}>{activity.time}</Text>
                            </View>
                        </View>
                    ))}
                </View>

                {/* Featured Actions */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Explore More</Text>
                    
                    <TouchableOpacity 
                        style={styles.featuredCard}
                        onPress={() => navigation.navigate('AccommodationMap')}
                    >
                        <LinearGradient
                            colors={['#4CAF50', '#45a049']}
                            style={styles.featuredGradient}
                        >
                            <Ionicons name="map" size={32} color="white" />
                            <View style={styles.featuredContent}>
                                <Text style={styles.featuredTitle}>Explore Map</Text>
                                <Text style={styles.featuredSubtitle}>Find accommodations and food nearby</Text>
                            </View>
                            <Ionicons name="chevron-forward" size={24} color="white" />
                        </LinearGradient>
                    </TouchableOpacity>

                    <TouchableOpacity 
                        style={styles.featuredCard}
                        onPress={() => navigation.navigate('Chatbot')}
                    >
                        <LinearGradient
                            colors={['#9C27B0', '#8E24AA']}
                            style={styles.featuredGradient}
                        >
                            <Ionicons name="chatbubble-ellipses" size={32} color="white" />
                            <View style={styles.featuredContent}>
                                <Text style={styles.featuredTitle}>AI Assistant</Text>
                                <Text style={styles.featuredSubtitle}>Get personalized recommendations</Text>
                            </View>
                            <Ionicons name="chevron-forward" size={24} color="white" />
                        </LinearGradient>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.lightGray,
    },
    scrollView: {
        flex: 1,
    },
    header: {
        paddingTop: 20,
        paddingBottom: 30,
        paddingHorizontal: 20,
    },
    headerContent: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
    },
    welcomeSection: {
        flex: 1,
    },
    welcomeText: {
        fontSize: SIZES.body3,
        color: 'rgba(255, 255, 255, 0.8)',
    },
    userName: {
        fontSize: SIZES.h2,
        fontWeight: 'bold',
        color: COLORS.white,
        marginTop: 4,
    },
    subtitle: {
        fontSize: SIZES.body4,
        color: 'rgba(255, 255, 255, 0.7)',
        marginTop: 4,
    },
    notificationButton: {
        position: 'relative',
        padding: 8,
    },
    notificationBadge: {
        position: 'absolute',
        top: 4,
        right: 4,
        backgroundColor: COLORS.error,
        borderRadius: 10,
        minWidth: 20,
        height: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },
    notificationBadgeText: {
        color: COLORS.white,
        fontSize: 12,
        fontWeight: 'bold',
    },
    statsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        marginTop: -15,
        marginBottom: 20,
    },
    statsCard: {
        backgroundColor: COLORS.white,
        padding: 16,
        borderRadius: 12,
        alignItems: 'center',
        flex: 1,
        marginHorizontal: 4,
        shadowColor: COLORS.black,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
    },
    statsNumber: {
        fontSize: SIZES.h3,
        fontWeight: 'bold',
        color: COLORS.black,
        marginTop: 8,
    },
    statsLabel: {
        fontSize: SIZES.body5,
        color: COLORS.gray,
        marginTop: 4,
        textAlign: 'center',
    },
    section: {
        paddingHorizontal: 20,
        marginBottom: 20,
    },
    sectionTitle: {
        fontSize: SIZES.h3,
        fontWeight: 'bold',
        color: COLORS.black,
        marginBottom: 16,
    },
    quickActionRow: {
        justifyContent: 'space-between',
    },
    quickActionCard: {
        backgroundColor: COLORS.white,
        padding: 16,
        borderRadius: 12,
        alignItems: 'center',
        width: (width - 60) / 2,
        marginBottom: 12,
        shadowColor: COLORS.black,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
    },
    quickActionIcon: {
        width: 48,
        height: 48,
        borderRadius: 24,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 8,
    },
    quickActionTitle: {
        fontSize: SIZES.body3,
        fontWeight: '600',
        color: COLORS.black,
        textAlign: 'center',
        marginBottom: 4,
    },
    quickActionSubtitle: {
        fontSize: SIZES.body5,
        color: COLORS.gray,
        textAlign: 'center',
    },
    activityCard: {
        backgroundColor: COLORS.white,
        padding: 16,
        borderRadius: 12,
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
        shadowColor: COLORS.black,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
    },
    activityIcon: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    activityContent: {
        flex: 1,
    },
    activityTitle: {
        fontSize: SIZES.body3,
        fontWeight: '600',
        color: COLORS.black,
        marginBottom: 4,
    },
    activitySubtitle: {
        fontSize: SIZES.body4,
        color: COLORS.gray,
        marginBottom: 2,
    },
    activityTime: {
        fontSize: SIZES.body5,
        color: COLORS.gray,
    },
    featuredCard: {
        marginBottom: 12,
        borderRadius: 12,
        overflow: 'hidden',
        shadowColor: COLORS.black,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
    },
    featuredGradient: {
        padding: 20,
        flexDirection: 'row',
        alignItems: 'center',
    },
    featuredContent: {
        flex: 1,
        marginLeft: 16,
    },
    featuredTitle: {
        fontSize: SIZES.body2,
        fontWeight: 'bold',
        color: COLORS.white,
        marginBottom: 4,
    },
    featuredSubtitle: {
        fontSize: SIZES.body4,
        color: 'rgba(255, 255, 255, 0.8)',
    },
});

export default StudentDashboardScreen;
