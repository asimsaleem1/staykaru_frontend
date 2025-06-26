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
    ActivityIndicator
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { Ionicons } from '@expo/vector-icons';
import StudentNavigation from '../components/student/StudentNavigation';
import authService from '../services/authService';
import { studentApiService } from '../services/studentApiService_new';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

const StudentDashboard = ({ navigation }) => {
    const [user, setUser] = useState(null);
    const [dashboardData, setDashboardData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        loadDashboardData();
    }, []);

    const loadDashboardData = async () => {
        try {
            setLoading(true);
            setError(null);
            
            const currentUser = await authService.getCurrentUser();
            setUser(currentUser);

            // Set auth token for student API service
            const token = await authService.getToken();
            studentApiService.setAuthToken?.(token);

            // Load comprehensive dashboard data using enhanced service
            const data = await studentApiService.getStudentDashboard();
            setDashboardData(data);

        } catch (error) {
            console.error('Dashboard load error:', error);
            setError('Failed to load dashboard data');
            // Set fallback data
            setDashboardData({
                profile: { name: 'Student', email: 'student@example.com', isDefault: true },
                stats: { totalAccommodations: 0, totalFoodProviders: 0, totalBookings: 0, totalOrders: 0, unreadNotifications: 0 },
                recentAccommodations: [],
                recentFoodProviders: [],
                recentNotifications: [],
                recentBookings: [],
                recentOrders: []
            });
        } finally {
            setLoading(false);
        }
    };

    const onRefresh = async () => {
        setRefreshing(true);
        await loadDashboardData();
        setRefreshing(false);
    };

    const handleLogout = async () => {
        Alert.alert(
            'Logout',
            'Are you sure you want to logout?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Logout',
                    style: 'destructive',
                    onPress: async () => {
                        await authService.logout();
                        navigation.replace('Login');
                    }
                }
            ]
        );
    };

    const navigateToAccommodations = () => {
        navigation.navigate('AccommodationsList');
    };

    const navigateToFoodProviders = () => {
        navigation.navigate('FoodProviders');
    };

    const navigateToBookings = () => {
        navigation.navigate('MyBookings');
    };

    const navigateToOrders = () => {
        navigation.navigate('MyOrders');
    };

    const navigateToProfile = () => {
        navigation.navigate('StudentProfile');
    };

    const navigateToNotifications = () => {
        navigation.navigate('Notifications');
    };

    const navigateToChatbot = () => {
        navigation.navigate('Chatbot');
    };

    const navigateToSupport = () => {
        navigation.navigate('Support');
    };

    const navigateToSafetyEmergency = () => {
        navigation.navigate('SafetyEmergency');
    };

    const navigateToSocialFeed = () => {
        navigation.navigate('SocialFeed');
    };

    const navigateToRecommendations = () => {
        navigation.navigate('RecommendationSystem');
    };

    if (loading) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#007bff" />
                    <Text style={styles.loadingText}>Loading dashboard...</Text>
                </View>
            </SafeAreaView>
        );
    }

    const stats = dashboardData?.stats || {};
    const profile = dashboardData?.profile || {};

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView
                style={styles.scrollView}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                }
            >
                {/* Header */}
                <LinearGradient
                    colors={['#007bff', '#0056b3']}
                    style={styles.header}
                >
                    <View style={styles.headerContent}>
                        <View style={styles.userInfo}>
                            <Text style={styles.welcomeText}>Welcome back,</Text>
                            <Text style={styles.userName}>
                                {profile.name || user?.name || 'Student'}
                                {profile.isDefault && (
                                    <Text style={styles.defaultIndicator}> (Demo)</Text>
                                )}
                            </Text>
                        </View>
                        <TouchableOpacity 
                            style={styles.profileButton} 
                            onPress={navigateToProfile}
                        >
                            <Ionicons name="person-circle" size={40} color="white" />
                        </TouchableOpacity>
                    </View>

                    {error && (
                        <View style={styles.errorBanner}>
                            <Ionicons name="warning" size={16} color="#fff3cd" />
                            <Text style={styles.errorText}>
                                Using demo data - {error}
                            </Text>
                        </View>
                    )}
                </LinearGradient>

                {/* Quick Stats */}
                <View style={styles.statsContainer}>
                    <View style={styles.statsGrid}>
                        <TouchableOpacity 
                            style={styles.statCard}
                            onPress={navigateToAccommodations}
                        >
                            <Ionicons name="home" size={24} color="#007bff" />
                            <Text style={styles.statNumber}>{stats.totalAccommodations}</Text>
                            <Text style={styles.statLabel}>Accommodations</Text>
                        </TouchableOpacity>

                        <TouchableOpacity 
                            style={styles.statCard}
                            onPress={navigateToFoodProviders}
                        >
                            <Ionicons name="restaurant" size={24} color="#28a745" />
                            <Text style={styles.statNumber}>{stats.totalFoodProviders}</Text>
                            <Text style={styles.statLabel}>Food Providers</Text>
                        </TouchableOpacity>

                        <TouchableOpacity 
                            style={styles.statCard}
                            onPress={navigateToBookings}
                        >
                            <Ionicons name="calendar" size={24} color="#ffc107" />
                            <Text style={styles.statNumber}>{stats.totalBookings}</Text>
                            <Text style={styles.statLabel}>My Bookings</Text>
                        </TouchableOpacity>

                        <TouchableOpacity 
                            style={styles.statCard}
                            onPress={navigateToOrders}
                        >
                            <Ionicons name="receipt" size={24} color="#dc3545" />
                            <Text style={styles.statNumber}>{stats.totalOrders}</Text>
                            <Text style={styles.statLabel}>My Orders</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Quick Actions */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Quick Actions</Text>
                    <View style={styles.actionsGrid}>
                        <TouchableOpacity 
                            style={styles.actionCard}
                            onPress={navigateToAccommodations}
                        >
                            <Ionicons name="search" size={28} color="#007bff" />
                            <Text style={styles.actionText}>Find Accommodation</Text>
                        </TouchableOpacity>

                        <TouchableOpacity 
                            style={styles.actionCard}
                            onPress={navigateToFoodProviders}
                        >
                            <Ionicons name="fast-food" size={28} color="#28a745" />
                            <Text style={styles.actionText}>Order Food</Text>
                        </TouchableOpacity>

                        <TouchableOpacity 
                            style={styles.actionCard}
                            onPress={navigateToProfile}
                        >
                            <Ionicons name="settings" size={28} color="#6c757d" />
                            <Text style={styles.actionText}>Preferences</Text>
                        </TouchableOpacity>

                        <TouchableOpacity 
                            style={styles.actionCard}
                            onPress={navigateToRecommendations}
                        >
                            <Ionicons name="sparkles" size={28} color="#ff6b6b" />
                            <Text style={styles.actionText}>Recommendations</Text>
                        </TouchableOpacity>

                        <TouchableOpacity 
                            style={styles.actionCard}
                            onPress={navigateToNotifications}
                        >
                            <View style={styles.notificationBadge}>
                                <Ionicons name="notifications" size={28} color="#ffc107" />
                                {stats.unreadNotifications > 0 && (
                                    <View style={styles.badge}>
                                        <Text style={styles.badgeText}>
                                            {stats.unreadNotifications}
                                        </Text>
                                    </View>
                                )}
                            </View>
                            <Text style={styles.actionText}>Notifications</Text>
                        </TouchableOpacity>

                        <TouchableOpacity 
                            style={styles.actionCard}
                            onPress={navigateToChatbot}
                        >
                            <Ionicons name="chatbubbles" size={28} color="#007bff" />
                            <Text style={styles.actionText}>AI Assistant</Text>
                        </TouchableOpacity>

                        <TouchableOpacity 
                            style={styles.actionCard}
                            onPress={navigateToSupport}
                        >
                            <Ionicons name="help-circle" size={28} color="#28a745" />
                            <Text style={styles.actionText}>Support</Text>
                        </TouchableOpacity>

                        <TouchableOpacity 
                            style={styles.actionCard}
                            onPress={navigateToSafetyEmergency}
                        >
                            <Ionicons name="shield" size={28} color="#dc3545" />
                            <Text style={styles.actionText}>Safety</Text>
                        </TouchableOpacity>

                        <TouchableOpacity 
                            style={styles.actionCard}
                            onPress={navigateToSafetyEmergency}
                        >
                            <Ionicons name="warning" size={28} color="#dc3545" />
                            <Text style={styles.actionText}>Safety & Emergency</Text>
                        </TouchableOpacity>

                        <TouchableOpacity 
                            style={styles.actionCard}
                            onPress={navigateToSocialFeed}
                        >
                            <Ionicons name="people" size={28} color="#6c757d" />
                            <Text style={styles.actionText}>Social Feed</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Recent Accommodations */}
                {dashboardData?.recentAccommodations?.length > 0 && (
                    <View style={styles.section}>
                        <View style={styles.sectionHeader}>
                            <Text style={styles.sectionTitle}>Recent Accommodations</Text>
                            <TouchableOpacity onPress={navigateToAccommodations}>
                                <Text style={styles.seeAllText}>See All</Text>
                            </TouchableOpacity>
                        </View>
                        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                            {dashboardData.recentAccommodations.map((accommodation, index) => (
                                <TouchableOpacity
                                    key={accommodation._id || index}
                                    style={styles.accommodationCard}
                                    onPress={() => navigation.navigate('AccommodationDetails', { 
                                        accommodationId: accommodation._id 
                                    })}
                                >
                                    <Image
                                        source={{ 
                                            uri: accommodation.images?.[0] || 
                                                 'https://via.placeholder.com/200x120?text=Accommodation'
                                        }}
                                        style={styles.accommodationImage}
                                        resizeMode="cover"
                                    />
                                    <View style={styles.accommodationInfo}>
                                        <Text style={styles.accommodationName} numberOfLines={1}>
                                            {accommodation.name}
                                        </Text>
                                        <Text style={styles.accommodationLocation} numberOfLines={1}>
                                            {accommodation.location}
                                        </Text>
                                        <Text style={styles.accommodationPrice}>
                                            ${accommodation.price}/month
                                        </Text>
                                    </View>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                    </View>
                )}

                {/* Recent Food Providers */}
                {dashboardData?.recentFoodProviders?.length > 0 && (
                    <View style={styles.section}>
                        <View style={styles.sectionHeader}>
                            <Text style={styles.sectionTitle}>Popular Food Providers</Text>
                            <TouchableOpacity onPress={navigateToFoodProviders}>
                                <Text style={styles.seeAllText}>See All</Text>
                            </TouchableOpacity>
                        </View>
                        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                            {dashboardData.recentFoodProviders.map((provider, index) => (
                                <TouchableOpacity
                                    key={provider._id || index}
                                    style={styles.providerCard}
                                    onPress={() => navigation.navigate('FoodProviderDetails', { 
                                        providerId: provider._id 
                                    })}
                                >
                                    <Image
                                        source={{ 
                                            uri: provider.logo || provider.image || 
                                                 'https://via.placeholder.com/120x120?text=Restaurant'
                                        }}
                                        style={styles.providerImage}
                                        resizeMode="cover"
                                    />
                                    <View style={styles.providerInfo}>
                                        <Text style={styles.providerName} numberOfLines={1}>
                                            {provider.name}
                                        </Text>
                                        <Text style={styles.providerType} numberOfLines={1}>
                                            {provider.cuisine_type || provider.type}
                                        </Text>
                                        <View style={styles.ratingContainer}>
                                            <Ionicons name="star" size={12} color="#ffc107" />
                                            <Text style={styles.ratingText}>
                                                {provider.rating || '4.0'}
                                            </Text>
                                        </View>
                                    </View>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                    </View>
                )}

                {/* Recent Activity */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Recent Activity</Text>
                    <View style={styles.activityContainer}>
                        {dashboardData?.recentBookings?.length > 0 || dashboardData?.recentOrders?.length > 0 ? (
                            <>
                                {dashboardData.recentBookings.slice(0, 2).map((booking, index) => (
                                    <View key={`booking-${index}`} style={styles.activityItem}>
                                        <Ionicons name="home" size={20} color="#007bff" />
                                        <View style={styles.activityContent}>
                                            <Text style={styles.activityText}>
                                                Booking: {booking.accommodation_name || 'Accommodation'}
                                            </Text>
                                            <Text style={styles.activityDate}>
                                                {new Date(booking.createdAt).toLocaleDateString()}
                                            </Text>
                                        </View>
                                        <Text style={styles.activityStatus}>
                                            {booking.status}
                                        </Text>
                                    </View>
                                ))}
                                {dashboardData.recentOrders.slice(0, 2).map((order, index) => (
                                    <View key={`order-${index}`} style={styles.activityItem}>
                                        <Ionicons name="restaurant" size={20} color="#28a745" />
                                        <View style={styles.activityContent}>
                                            <Text style={styles.activityText}>
                                                Order: {order.provider_name || 'Food Order'}
                                            </Text>
                                            <Text style={styles.activityDate}>
                                                {new Date(order.createdAt).toLocaleDateString()}
                                            </Text>
                                        </View>
                                        <Text style={styles.activityStatus}>
                                            {order.status}
                                        </Text>
                                    </View>
                                ))}
                            </>
                        ) : (
                            <View style={styles.emptyActivity}>
                                <Ionicons name="time" size={40} color="#6c757d" />
                                <Text style={styles.emptyActivityText}>No recent activity</Text>
                                <Text style={styles.emptyActivitySubtext}>
                                    Start by booking accommodation or ordering food
                                </Text>
                            </View>
                        )}
                    </View>
                </View>

                {/* Logout Button */}
                <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
                    <Ionicons name="log-out" size={20} color="#dc3545" />
                    <Text style={styles.logoutText}>Logout</Text>
                </TouchableOpacity>

            </ScrollView>

            <StudentNavigation navigation={navigation} currentRoute="Dashboard" />
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8f9fa',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        marginTop: 10,
        fontSize: 16,
        color: '#6c757d',
    },
    scrollView: {
        flex: 1,
    },
    header: {
        paddingTop: 20,
        paddingBottom: 20,
        paddingHorizontal: 20,
    },
    headerContent: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    userInfo: {
        flex: 1,
    },
    welcomeText: {
        fontSize: 16,
        color: 'rgba(255, 255, 255, 0.8)',
        marginBottom: 5,
    },
    userName: {
        fontSize: 24,
        fontWeight: 'bold',
        color: 'white',
    },
    defaultIndicator: {
        fontSize: 14,
        fontWeight: 'normal',
        color: 'rgba(255, 255, 255, 0.7)',
    },
    profileButton: {
        padding: 5,
    },
    errorBanner: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 15,
        padding: 10,
        backgroundColor: 'rgba(255, 193, 7, 0.2)',
        borderRadius: 8,
    },
    errorText: {
        marginLeft: 8,
        color: '#fff3cd',
        fontSize: 12,
    },
    statsContainer: {
        padding: 20,
        backgroundColor: 'white',
        marginTop: -10,
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
    },
    statsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
    },
    statCard: {
        width: '48%',
        backgroundColor: '#f8f9fa',
        padding: 15,
        borderRadius: 12,
        alignItems: 'center',
        marginBottom: 10,
    },
    statNumber: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#333',
        marginTop: 5,
    },
    statLabel: {
        fontSize: 12,
        color: '#6c757d',
        textAlign: 'center',
        marginTop: 5,
    },
    section: {
        backgroundColor: 'white',
        marginTop: 10,
        padding: 20,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 15,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
    },
    seeAllText: {
        fontSize: 14,
        color: '#007bff',
        fontWeight: '500',
    },
    actionsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
    },
    actionCard: {
        width: '48%',
        backgroundColor: '#f8f9fa',
        padding: 15,
        borderRadius: 12,
        alignItems: 'center',
        marginBottom: 10,
        minHeight: 80,
    },
    actionText: {
        fontSize: 12,
        color: '#333',
        textAlign: 'center',
        marginTop: 8,
        fontWeight: '500',
    },
    notificationBadge: {
        position: 'relative',
    },
    badge: {
        position: 'absolute',
        top: -5,
        right: -5,
        backgroundColor: '#dc3545',
        borderRadius: 10,
        minWidth: 20,
        height: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },
    badgeText: {
        color: 'white',
        fontSize: 10,
        fontWeight: 'bold',
    },
    accommodationCard: {
        width: 180,
        marginRight: 15,
        backgroundColor: '#f8f9fa',
        borderRadius: 12,
        overflow: 'hidden',
    },
    accommodationImage: {
        width: '100%',
        height: 120,
    },
    accommodationInfo: {
        padding: 12,
    },
    accommodationName: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 4,
    },
    accommodationLocation: {
        fontSize: 12,
        color: '#6c757d',
        marginBottom: 4,
    },
    accommodationPrice: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#007bff',
    },
    providerCard: {
        width: 140,
        marginRight: 15,
        backgroundColor: '#f8f9fa',
        borderRadius: 12,
        overflow: 'hidden',
    },
    providerImage: {
        width: '100%',
        height: 100,
    },
    providerInfo: {
        padding: 12,
    },
    providerName: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 4,
    },
    providerType: {
        fontSize: 12,
        color: '#6c757d',
        marginBottom: 4,
    },
    ratingContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    ratingText: {
        fontSize: 12,
        color: '#6c757d',
        marginLeft: 4,
    },
    activityContainer: {
        marginTop: 10,
    },
    activityItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#e9ecef',
    },
    activityContent: {
        flex: 1,
        marginLeft: 12,
    },
    activityText: {
        fontSize: 14,
        color: '#333',
        marginBottom: 2,
    },
    activityDate: {
        fontSize: 12,
        color: '#6c757d',
    },
    activityStatus: {
        fontSize: 12,
        color: '#28a745',
        fontWeight: '500',
        textTransform: 'capitalize',
    },
    emptyActivity: {
        alignItems: 'center',
        paddingVertical: 40,
    },
    emptyActivityText: {
        fontSize: 16,
        color: '#6c757d',
        marginTop: 10,
        fontWeight: '500',
    },
    emptyActivitySubtext: {
        fontSize: 14,
        color: '#6c757d',
        marginTop: 5,
        textAlign: 'center',
    },
    logoutButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'white',
        marginTop: 10,
        marginHorizontal: 20,
        marginBottom: 20,
        padding: 15,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#dc3545',
    },
    logoutText: {
        fontSize: 16,
        color: '#dc3545',
        marginLeft: 8,
        fontWeight: '500',
    },
});

export default StudentDashboard;
