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
    FlatList,
    ActivityIndicator
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
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        activeBookings: 0,
        pendingOrders: 0,
        savedPlaces: 0,
        notifications: 0,
        totalSpent: 0,
        completedBookings: 0
    });
    const [recommendations, setRecommendations] = useState([]);
    const [recentActivity, setRecentActivity] = useState([]);
    const [nearbyPlaces, setNearbyPlaces] = useState([]);

    useEffect(() => {
        loadDashboardData();
    }, []);

    const loadDashboardData = async () => {
        try {
            setLoading(true);
            const currentUser = await authService.getCurrentUser();
            setUser(currentUser);
            
            // Load real-time student data from backend
            await Promise.all([
                loadStudentStats(),
                loadRecommendations(),
                loadRecentActivity(),
                loadNearbyPlaces()
            ]);
        } catch (error) {
            console.error('Error loading dashboard:', error);
            Alert.alert('Error', 'Failed to load dashboard data');
        } finally {
            setLoading(false);
        }
    };

    const loadStudentStats = async () => {
        try {
            // In real implementation, this would fetch from backend
            // const response = await fetch('${API_URL}/student/stats', { headers: authHeaders });
            // For now, using enhanced mock data
            setStats({
                activeBookings: 2,
                pendingOrders: 1,
                savedPlaces: 8,
                notifications: 3,
                totalSpent: 45000,
                completedBookings: 12
            });
        } catch (error) {
            console.error('Error loading stats:', error);
        }
    };

    const loadRecommendations = async () => {
        try {
            // This would integrate with ML recommendation engine
            // Based on user preferences, location, budget, and behavior
            const mockRecommendations = [
                {
                    id: '1',
                    type: 'accommodation',
                    title: 'University Heights Hostel',
                    subtitle: 'Perfect for your budget & location',
                    price: 'PKR 8,000/month',
                    rating: 4.8,
                    distance: '0.5 km from university',
                    image: 'https://via.placeholder.com/300x200',
                    reason: 'Matches your budget and proximity preferences',
                    tags: ['WiFi', 'AC', 'Laundry'],
                    discount: '15% off first month'
                },
                {
                    id: '2',
                    type: 'food',
                    title: 'Campus Delights',
                    subtitle: 'Your favorite cuisine nearby',
                    price: 'PKR 200-500',
                    rating: 4.6,
                    distance: '0.2 km from you',
                    image: 'https://via.placeholder.com/300x200',
                    reason: 'Based on your order history',
                    tags: ['Fast Food', 'Pakistani', 'Delivery'],
                    discount: 'Free delivery today'
                },
                {
                    id: '3',
                    type: 'accommodation',
                    title: 'Student Paradise',
                    subtitle: 'Highly rated in your area',
                    price: 'PKR 12,000/month',
                    rating: 4.9,
                    distance: '1.2 km from university',
                    image: 'https://via.placeholder.com/300x200',
                    reason: 'Premium option with great reviews',
                    tags: ['Gym', 'Pool', 'Security'],
                    discount: 'No broker fee'
                }
            ];
            setRecommendations(mockRecommendations);
        } catch (error) {
            console.error('Error loading recommendations:', error);
        }
    };

    const loadRecentActivity = async () => {
        try {
            const mockActivity = [
                {
                    id: '1',
                    type: 'booking',
                    title: 'Accommodation Booking Confirmed',
                    subtitle: 'Comfort Inn, Near University',
                    time: '2 hours ago',
                    icon: 'checkmark-circle',
                    color: '#4CAF50',
                    status: 'confirmed'
                },
                {
                    id: '2',
                    type: 'order',
                    title: 'Food Order Delivered',
                    subtitle: 'Biryani House - PKR 450',
                    time: '1 day ago',
                    icon: 'restaurant',
                    color: '#FF9800',
                    status: 'delivered'
                },
                {
                    id: '3',
                    type: 'favorite',
                    title: 'Added to Favorites',
                    subtitle: 'Green Valley Apartments',
                    time: '2 days ago',
                    icon: 'heart',
                    color: '#E91E63',
                    status: 'saved'
                },
                {
                    id: '4',
                    type: 'payment',
                    title: 'Payment Successful',
                    subtitle: 'Monthly rent - PKR 8,000',
                    time: '3 days ago',
                    icon: 'card',
                    color: '#9C27B0',
                    status: 'completed'
                }
            ];
            setRecentActivity(mockActivity);
        } catch (error) {
            console.error('Error loading activity:', error);
        }
    };

    const loadNearbyPlaces = async () => {
        try {
            // This would use geolocation and backend data
            const mockNearby = [
                {
                    id: '1',
                    name: 'Student Plaza',
                    type: 'accommodation',
                    distance: '0.3 km',
                    rating: 4.5,
                    price: 'PKR 7,500/month',
                    available: true
                },
                {
                    id: '2',
                    name: 'Fast Bites',
                    type: 'food',
                    distance: '0.1 km',
                    rating: 4.3,
                    price: 'PKR 150-400',
                    available: true
                },
                {
                    id: '3',
                    name: 'Elite Hostel',
                    type: 'accommodation',
                    distance: '0.7 km',
                    rating: 4.7,
                    price: 'PKR 10,000/month',
                    available: false
                }
            ];
            setNearbyPlaces(mockNearby);
        } catch (error) {
            console.error('Error loading nearby places:', error);
        }
    };

    const onRefresh = async () => {
        setRefreshing(true);
        await loadDashboardData();
        setRefreshing(false);
    };

    const handleRecommendationPress = (item) => {
        if (item.type === 'accommodation') {
            navigation.navigate('AccommodationDetail', { accommodation: item });
        } else if (item.type === 'food') {
            navigation.navigate('FoodProviderDetail', { foodProvider: item });
        }
    };

    const quickActions = [
        {
            id: '1',
            title: 'Accommodations',
            subtitle: 'Find your home',
            icon: 'home',
            color: '#4CAF50',
            route: 'AccommodationsList',
            count: stats.activeBookings
        },
        {
            id: '2',
            title: 'Food & Dining',
            subtitle: 'Order delicious food',
            icon: 'restaurant',
            color: '#FF9800',
            route: 'FoodProvidersList',
            count: stats.pendingOrders
        },
        {
            id: '3',
            title: 'Map View',
            subtitle: 'Explore nearby',
            icon: 'map',
            color: '#2196F3',
            route: 'AccommodationMap'
        },
        {
            id: '4',
            title: 'My Bookings',
            subtitle: `${stats.activeBookings} active`,
            icon: 'calendar',
            color: '#9C27B0',
            route: 'MyBookings'
        },
        {
            id: '5',
            title: 'Favorites',
            subtitle: `${stats.savedPlaces} saved`,
            icon: 'heart',
            color: '#E91E63',
            route: 'Favorites'
        },
        {
            id: '6',
            title: 'AI Assistant',
            subtitle: 'Get personalized help',
            icon: 'chatbubble-ellipses',
            color: '#607D8B',
            route: 'Chatbot'
        }
    ];

    const renderQuickAction = ({ item }) => (
        <TouchableOpacity
            style={styles.quickActionCard}
            onPress={() => navigation.navigate(item.route)}
        >
            <View style={[styles.quickActionIcon, { backgroundColor: item.color }]}>
                <Ionicons name={item.icon} size={24} color="white" />
                {item.count > 0 && (
                    <View style={styles.badge}>
                        <Text style={styles.badgeText}>{item.count}</Text>
                    </View>
                )}
            </View>
            <Text style={styles.quickActionTitle}>{item.title}</Text>
            <Text style={styles.quickActionSubtitle}>{item.subtitle}</Text>
        </TouchableOpacity>
    );

    const renderRecommendation = ({ item }) => (
        <TouchableOpacity
            style={styles.recommendationCard}
            onPress={() => handleRecommendationPress(item)}
        >
            <Image source={{ uri: item.image }} style={styles.recommendationImage} />
            {item.discount && (
                <View style={styles.discountBadge}>
                    <Text style={styles.discountText}>{item.discount}</Text>
                </View>
            )}
            <View style={styles.recommendationContent}>
                <View style={styles.recommendationHeader}>
                    <Text style={styles.recommendationTitle}>{item.title}</Text>
                    <View style={styles.ratingContainer}>
                        <Ionicons name="star" size={12} color="#FFD700" />
                        <Text style={styles.rating}>{item.rating}</Text>
                    </View>
                </View>
                <Text style={styles.recommendationSubtitle}>{item.subtitle}</Text>
                <Text style={styles.recommendationReason}>{item.reason}</Text>
                <View style={styles.recommendationFooter}>
                    <Text style={styles.price}>{item.price}</Text>
                    <Text style={styles.distance}>{item.distance}</Text>
                </View>
                <View style={styles.tagsContainer}>
                    {item.tags.slice(0, 3).map((tag, index) => (
                        <View key={index} style={styles.tag}>
                            <Text style={styles.tagText}>{tag}</Text>
                        </View>
                    ))}
                </View>
            </View>
        </TouchableOpacity>
    );

    const renderActivityItem = ({ item }) => (
        <View style={styles.activityItem}>
            <View style={[styles.activityIcon, { backgroundColor: item.color }]}>
                <Ionicons name={item.icon} size={16} color="white" />
            </View>
            <View style={styles.activityContent}>
                <Text style={styles.activityTitle}>{item.title}</Text>
                <Text style={styles.activitySubtitle}>{item.subtitle}</Text>
                <Text style={styles.activityTime}>{item.time}</Text>
            </View>
            <View style={[styles.statusIndicator, { backgroundColor: item.color }]} />
        </View>
    );

    if (loading) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={COLORS.primary} />
                    <Text style={styles.loadingText}>Loading your dashboard...</Text>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView
                style={styles.scrollView}
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                        colors={[COLORS.primary]}
                        tintColor={COLORS.primary}
                    />
                }
            >
                {/* Header */}
                <LinearGradient
                    colors={['#667eea', '#764ba2']}
                    style={styles.header}
                >
                    <View style={styles.headerContent}>
                        <View style={styles.headerLeft}>
                            <Text style={styles.welcomeText}>Welcome back,</Text>
                            <Text style={styles.userName}>{user?.name || 'Student'}</Text>
                            <Text style={styles.headerSubtitle}>Find your perfect place to stay & eat</Text>
                        </View>
                        <TouchableOpacity
                            style={styles.profileButton}
                            onPress={() => navigation.navigate('Profile')}
                        >
                            <View style={styles.profileAvatar}>
                                <Text style={styles.profileInitial}>
                                    {user?.name?.charAt(0) || 'S'}
                                </Text>
                            </View>
                        </TouchableOpacity>
                    </View>

                    {/* Stats Overview */}
                    <View style={styles.statsContainer}>
                        <View style={styles.statItem}>
                            <Text style={styles.statNumber}>{stats.activeBookings}</Text>
                            <Text style={styles.statLabel}>Active Bookings</Text>
                        </View>
                        <View style={styles.statItem}>
                            <Text style={styles.statNumber}>{stats.completedBookings}</Text>
                            <Text style={styles.statLabel}>Completed</Text>
                        </View>
                        <View style={styles.statItem}>
                            <Text style={styles.statNumber}>{stats.savedPlaces}</Text>
                            <Text style={styles.statLabel}>Favorites</Text>
                        </View>
                        <View style={styles.statItem}>
                            <Text style={styles.statNumber}>PKR {(stats.totalSpent / 1000).toFixed(0)}k</Text>
                            <Text style={styles.statLabel}>Total Spent</Text>
                        </View>
                    </View>
                </LinearGradient>

                {/* Quick Actions */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Quick Actions</Text>
                    <FlatList
                        data={quickActions}
                        renderItem={renderQuickAction}
                        keyExtractor={(item) => item.id}
                        numColumns={2}
                        scrollEnabled={false}
                        contentContainerStyle={styles.quickActionsGrid}
                    />
                </View>

                {/* Personalized Recommendations */}
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>Recommended for You</Text>
                        <TouchableOpacity onPress={() => navigation.navigate('Recommendations')}>
                            <Text style={styles.viewAllText}>View All</Text>
                        </TouchableOpacity>
                    </View>
                    <FlatList
                        data={recommendations}
                        renderItem={renderRecommendation}
                        keyExtractor={(item) => item.id}
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={styles.recommendationsContainer}
                    />
                </View>

                {/* Recent Activity */}
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>Recent Activity</Text>
                        <TouchableOpacity onPress={() => navigation.navigate('ActivityHistory')}>
                            <Text style={styles.viewAllText}>View All</Text>
                        </TouchableOpacity>
                    </View>
                    <View style={styles.activityContainer}>
                        {recentActivity.slice(0, 4).map((item) => (
                            <View key={item.id}>
                                {renderActivityItem({ item })}
                            </View>
                        ))}
                    </View>
                </View>

                {/* Nearby Places */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Nearby Places</Text>
                    <View style={styles.nearbyContainer}>
                        {nearbyPlaces.map((place) => (
                            <TouchableOpacity
                                key={place.id}
                                style={styles.nearbyItem}
                                onPress={() => {
                                    if (place.type === 'accommodation') {
                                        navigation.navigate('AccommodationDetail', { accommodation: place });
                                    } else {
                                        navigation.navigate('FoodProviderDetail', { foodProvider: place });
                                    }
                                }}
                            >
                                <View style={styles.nearbyInfo}>
                                    <Text style={styles.nearbyName}>{place.name}</Text>
                                    <Text style={styles.nearbyDetails}>{place.distance} • {place.price}</Text>
                                    <View style={styles.nearbyRating}>
                                        <Ionicons name="star" size={12} color="#FFD700" />
                                        <Text style={styles.nearbyRatingText}>{place.rating}</Text>
                                    </View>
                                </View>
                                <View style={[styles.availabilityDot, { 
                                    backgroundColor: place.available ? '#4CAF50' : '#F44336' 
                                }]} />
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>

                <View style={{ height: 100 }} />
            </ScrollView>
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
        color: COLORS.primary,
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
        marginBottom: 20,
    },
    headerLeft: {
        flex: 1,
    },
    welcomeText: {
        fontSize: 16,
        color: 'rgba(255, 255, 255, 0.8)',
        marginBottom: 4,
    },
    userName: {
        fontSize: 24,
        fontWeight: 'bold',
        color: 'white',
        marginBottom: 4,
    },
    headerSubtitle: {
        fontSize: 14,
        color: 'rgba(255, 255, 255, 0.8)',
    },
    profileButton: {
        padding: 4,
    },
    profileAvatar: {
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: 'rgba(255, 255, 255, 0.3)',
    },
    profileInitial: {
        fontSize: 20,
        fontWeight: 'bold',
        color: 'white',
    },
    statsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    statItem: {
        alignItems: 'center',
    },
    statNumber: {
        fontSize: 20,
        fontWeight: 'bold',
        color: 'white',
        marginBottom: 4,
    },
    statLabel: {
        fontSize: 12,
        color: 'rgba(255, 255, 255, 0.8)',
    },
    section: {
        marginBottom: 25,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        marginBottom: 15,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#333',
        paddingHorizontal: 20,
        marginBottom: 15,
    },
    viewAllText: {
        color: COLORS.primary,
        fontSize: 14,
        fontWeight: '600',
    },
    quickActionsGrid: {
        paddingHorizontal: 20,
    },
    quickActionCard: {
        backgroundColor: 'white',
        padding: 20,
        borderRadius: 12,
        flex: 1,
        margin: 5,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    quickActionIcon: {
        width: 50,
        height: 50,
        borderRadius: 25,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 10,
        position: 'relative',
    },
    badge: {
        position: 'absolute',
        top: -5,
        right: -5,
        backgroundColor: '#FF4444',
        borderRadius: 10,
        minWidth: 20,
        height: 20,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 4,
    },
    badgeText: {
        color: 'white',
        fontSize: 10,
        fontWeight: 'bold',
    },
    quickActionTitle: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#333',
        textAlign: 'center',
        marginBottom: 4,
    },
    quickActionSubtitle: {
        fontSize: 12,
        color: '#666',
        textAlign: 'center',
    },
    recommendationsContainer: {
        paddingHorizontal: 20,
    },
    recommendationCard: {
        backgroundColor: 'white',
        borderRadius: 12,
        marginRight: 15,
        width: 280,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
        overflow: 'hidden',
    },
    recommendationImage: {
        width: '100%',
        height: 120,
        resizeMode: 'cover',
    },
    discountBadge: {
        position: 'absolute',
        top: 10,
        right: 10,
        backgroundColor: '#FF4444',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
    },
    discountText: {
        color: 'white',
        fontSize: 10,
        fontWeight: 'bold',
    },
    recommendationContent: {
        padding: 15,
    },
    recommendationHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 5,
    },
    recommendationTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
        flex: 1,
    },
    ratingContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    rating: {
        fontSize: 12,
        color: '#666',
        marginLeft: 4,
    },
    recommendationSubtitle: {
        fontSize: 14,
        color: '#666',
        marginBottom: 8,
    },
    recommendationReason: {
        fontSize: 12,
        color: '#888',
        fontStyle: 'italic',
        marginBottom: 10,
    },
    recommendationFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 10,
    },
    price: {
        fontSize: 14,
        fontWeight: 'bold',
        color: COLORS.primary,
    },
    distance: {
        fontSize: 12,
        color: '#666',
    },
    tagsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
    },
    tag: {
        backgroundColor: '#f0f0f0',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 8,
        marginRight: 5,
        marginBottom: 5,
    },
    tagText: {
        fontSize: 10,
        color: '#666',
    },
    activityContainer: {
        backgroundColor: 'white',
        marginHorizontal: 20,
        borderRadius: 12,
        padding: 15,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    activityItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
        position: 'relative',
    },
    activityIcon: {
        width: 32,
        height: 32,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    activityContent: {
        flex: 1,
    },
    activityTitle: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 2,
    },
    activitySubtitle: {
        fontSize: 13,
        color: '#666',
        marginBottom: 4,
    },
    activityTime: {
        fontSize: 11,
        color: '#999',
    },
    statusIndicator: {
        width: 8,
        height: 8,
        borderRadius: 4,
        position: 'absolute',
        right: 0,
        top: '50%',
        marginTop: -4,
    },
    nearbyContainer: {
        backgroundColor: 'white',
        marginHorizontal: 20,
        borderRadius: 12,
        padding: 15,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    nearbyItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    nearbyInfo: {
        flex: 1,
    },
    nearbyName: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 4,
    },
    nearbyDetails: {
        fontSize: 12,
        color: '#666',
        marginBottom: 4,
    },
    nearbyRating: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    nearbyRatingText: {
        fontSize: 12,
        color: '#666',
        marginLeft: 4,
    },
    availabilityDot: {
        width: 12,
        height: 12,
        borderRadius: 6,
    },
});

export default StudentDashboardScreen;
