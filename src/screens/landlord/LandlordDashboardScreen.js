import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    ScrollView,
    StyleSheet,
    TouchableOpacity,
    Dimensions,
    RefreshControl,
    Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import LandlordNavigation from '../../components/landlord/LandlordNavigation';
import authService from '../../services/authService';
import { fetchFromBackend } from '../../utils/networkUtils';

const { width } = Dimensions.get('window');

const LandlordDashboardScreen = ({ navigation }) => {
    const [user, setUser] = useState(null);
    const [dashboardData, setDashboardData] = useState({
        properties: [],
        bookings: [],
        earnings: { total: 0, thisMonth: 0, pending: 0 },
        analytics: { occupancyRate: 0, avgRating: 0, totalViews: 0 },
        notifications: []
    });
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    useEffect(() => {
        loadDashboardData();
    }, []);

    const loadDashboardData = async () => {
        try {
            setLoading(true);
            const currentUser = await authService.getCurrentUser();
            setUser(currentUser);

            // Fetch landlord dashboard data from backend
            const [propertiesRes, bookingsRes, earningsRes, analyticsRes] = await Promise.all([
                fetchFromBackend(`/accommodations/landlord/${currentUser.id}`),
                fetchFromBackend(`/bookings/landlord/${currentUser.id}?limit=5`),
                fetchFromBackend(`/landlord/earnings/${currentUser.id}`),
                fetchFromBackend(`/landlord/analytics/${currentUser.id}`)
            ]);

            setDashboardData({
                properties: propertiesRes.success ? propertiesRes.data : [],
                bookings: bookingsRes.success ? bookingsRes.data : [],
                earnings: earningsRes.success ? earningsRes.data : { total: 0, thisMonth: 0, pending: 0 },
                analytics: analyticsRes.success ? analyticsRes.data : { occupancyRate: 0, avgRating: 0, totalViews: 0 },
                notifications: []
            });

            console.log('✅ Landlord dashboard data loaded successfully');
        } catch (error) {
            console.error('❌ Error loading landlord dashboard:', error);
            Alert.alert('Error', 'Failed to load dashboard data. Please try again.');
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
                        navigation.reset({
                            index: 0,
                            routes: [{ name: 'Login' }],
                        });
                    }
                }
            ]
        );
    };

    const formatCurrency = (amount) => {
        return `₨${amount?.toLocaleString('en-PK') || '0'}`;
    };

    if (loading) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.loadingContainer}>
                    <Text style={styles.loadingText}>Loading Dashboard...</Text>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                }
            >
                {/* Header */}
                <LinearGradient
                    colors={['#2E7D32', '#4CAF50']}
                    style={styles.header}
                >
                    <View style={styles.headerContent}>
                        <View style={styles.welcomeSection}>
                            <Text style={styles.welcomeText}>Welcome back,</Text>
                            <Text style={styles.userName}>{user?.name || 'Landlord'}</Text>
                            <Text style={styles.userRole}>Property Owner</Text>
                        </View>
                        <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
                            <Icon name="logout" size={24} color="#fff" />
                        </TouchableOpacity>
                    </View>
                </LinearGradient>

                {/* Quick Stats */}
                <View style={styles.statsContainer}>
                    <View style={styles.statsRow}>
                        <View style={styles.statCard}>
                            <Icon name="home" size={32} color="#2E7D32" />
                            <Text style={styles.statNumber}>{dashboardData.properties.length}</Text>
                            <Text style={styles.statLabel}>Properties</Text>
                        </View>
                        <View style={styles.statCard}>
                            <Icon name="book" size={32} color="#FF9800" />
                            <Text style={styles.statNumber}>{dashboardData.bookings.length}</Text>
                            <Text style={styles.statLabel}>Active Bookings</Text>
                        </View>
                    </View>
                    <View style={styles.statsRow}>
                        <View style={styles.statCard}>
                            <Icon name="trending-up" size={32} color="#4CAF50" />
                            <Text style={styles.statNumber}>{formatCurrency(dashboardData.earnings.thisMonth)}</Text>
                            <Text style={styles.statLabel}>This Month</Text>
                        </View>
                        <View style={styles.statCard}>
                            <Icon name="star" size={32} color="#FFD700" />
                            <Text style={styles.statNumber}>{dashboardData.analytics.avgRating?.toFixed(1) || '0.0'}</Text>
                            <Text style={styles.statLabel}>Avg Rating</Text>
                        </View>
                    </View>
                </View>

                {/* Quick Actions */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Quick Actions</Text>
                    <View style={styles.actionsGrid}>
                        <TouchableOpacity
                            style={styles.actionCard}
                            onPress={() => navigation.navigate('AddProperty')}
                        >
                            <Icon name="add-home" size={40} color="#2E7D32" />
                            <Text style={styles.actionText}>Add Property</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={styles.actionCard}
                            onPress={() => navigation.navigate('Properties')}
                        >
                            <Icon name="home-work" size={40} color="#FF9800" />
                            <Text style={styles.actionText}>My Properties</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={styles.actionCard}
                            onPress={() => navigation.navigate('Bookings')}
                        >
                            <Icon name="event" size={40} color="#2196F3" />
                            <Text style={styles.actionText}>Bookings</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={styles.actionCard}
                            onPress={() => navigation.navigate('Earnings')}
                        >
                            <Icon name="account-balance-wallet" size={40} color="#4CAF50" />
                            <Text style={styles.actionText}>Earnings</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Recent Bookings */}
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>Recent Bookings</Text>
                        <TouchableOpacity onPress={() => navigation.navigate('Bookings')}>
                            <Text style={styles.viewAllText}>View All</Text>
                        </TouchableOpacity>
                    </View>
                    
                    {dashboardData.bookings.length > 0 ? (
                        dashboardData.bookings.slice(0, 3).map((booking, index) => (
                            <View key={booking.id || index} style={styles.bookingCard}>
                                <View style={styles.bookingHeader}>
                                    <Text style={styles.bookingProperty}>{booking.property?.title || 'Property'}</Text>
                                    <Text style={styles.bookingAmount}>{formatCurrency(booking.total_amount)}</Text>
                                </View>
                                <Text style={styles.bookingGuest}>{booking.student?.name || 'Guest'}</Text>
                                <View style={styles.bookingDates}>
                                    <Text style={styles.bookingDate}>
                                        {new Date(booking.check_in_date).toLocaleDateString('en-PK')} - {new Date(booking.check_out_date).toLocaleDateString('en-PK')}
                                    </Text>
                                    <View style={[styles.statusBadge, { backgroundColor: getStatusColor(booking.status) }]}>
                                        <Text style={styles.statusText}>{booking.status}</Text>
                                    </View>
                                </View>
                            </View>
                        ))
                    ) : (
                        <View style={styles.emptyState}>
                            <Icon name="event-busy" size={48} color="#ccc" />
                            <Text style={styles.emptyText}>No recent bookings</Text>
                        </View>
                    )}
                </View>

                {/* Properties Overview */}
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>My Properties</Text>
                        <TouchableOpacity onPress={() => navigation.navigate('Properties')}>
                            <Text style={styles.viewAllText}>View All</Text>
                        </TouchableOpacity>
                    </View>
                    
                    {dashboardData.properties.length > 0 ? (
                        dashboardData.properties.slice(0, 2).map((property, index) => (
                            <TouchableOpacity
                                key={property.id || index}
                                style={styles.propertyCard}
                                onPress={() => navigation.navigate('PropertyDetail', { id: property.id })}
                            >
                                <View style={styles.propertyInfo}>
                                    <Text style={styles.propertyTitle}>{property.title}</Text>
                                    <Text style={styles.propertyLocation}>{property.location?.address}</Text>
                                    <Text style={styles.propertyPrice}>{formatCurrency(property.price)} / month</Text>
                                </View>
                                <View style={styles.propertyStats}>
                                    <View style={styles.propertyStat}>
                                        <Icon name="visibility" size={16} color="#666" />
                                        <Text style={styles.propertyStatText}>{property.views || 0}</Text>
                                    </View>
                                    <View style={styles.propertyStat}>
                                        <Icon name="star" size={16} color="#FFD700" />
                                        <Text style={styles.propertyStatText}>{property.rating?.toFixed(1) || '0.0'}</Text>
                                    </View>
                                </View>
                            </TouchableOpacity>
                        ))
                    ) : (
                        <View style={styles.emptyState}>
                            <Icon name="home" size={48} color="#ccc" />
                            <Text style={styles.emptyText}>No properties listed yet</Text>
                            <TouchableOpacity
                                style={styles.addButton}
                                onPress={() => navigation.navigate('AddProperty')}
                            >
                                <Text style={styles.addButtonText}>Add Your First Property</Text>
                            </TouchableOpacity>
                        </View>                    )}
                </View>
            </ScrollView>
            
            {/* Bottom Navigation */}
            <LandlordNavigation navigation={navigation} activeRoute="dashboard" />
        </SafeAreaView>
    );
};

const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
        case 'confirmed': return '#4CAF50';
        case 'pending': return '#FF9800';
        case 'cancelled': return '#F44336';
        case 'completed': return '#2196F3';
        default: return '#757575';
    }
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        fontSize: 16,
        color: '#666',
        marginTop: 10,
    },
    header: {
        padding: 20,
        paddingTop: 40,
    },
    headerContent: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    welcomeSection: {
        flex: 1,
    },
    welcomeText: {
        fontSize: 16,
        color: '#fff',
        opacity: 0.9,
    },
    userName: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#fff',
        marginVertical: 2,
    },
    userRole: {
        fontSize: 14,
        color: '#fff',
        opacity: 0.8,
    },
    logoutButton: {
        padding: 8,
        borderRadius: 20,
        backgroundColor: 'rgba(255,255,255,0.2)',
    },
    statsContainer: {
        padding: 20,
        paddingTop: 10,
    },
    statsRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 15,
    },
    statCard: {
        backgroundColor: '#fff',
        padding: 20,
        borderRadius: 12,
        alignItems: 'center',
        width: (width - 50) / 2,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    statNumber: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#333',
        marginTop: 8,
    },
    statLabel: {
        fontSize: 12,
        color: '#666',
        marginTop: 4,
        textAlign: 'center',
    },
    section: {
        padding: 20,
        paddingTop: 0,
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
    viewAllText: {
        fontSize: 14,
        color: '#2E7D32',
        fontWeight: '600',
    },
    actionsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
    },
    actionCard: {
        backgroundColor: '#fff',
        padding: 20,
        borderRadius: 12,
        alignItems: 'center',
        width: (width - 50) / 2,
        marginBottom: 15,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    actionText: {
        fontSize: 14,
        color: '#333',
        marginTop: 8,
        textAlign: 'center',
        fontWeight: '500',
    },
    bookingCard: {
        backgroundColor: '#fff',
        padding: 15,
        borderRadius: 12,
        marginBottom: 10,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    bookingHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 5,
    },
    bookingProperty: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
        flex: 1,
    },
    bookingAmount: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#2E7D32',
    },
    bookingGuest: {
        fontSize: 14,
        color: '#666',
        marginBottom: 8,
    },
    bookingDates: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    bookingDate: {
        fontSize: 12,
        color: '#666',
    },
    statusBadge: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
    },
    statusText: {
        fontSize: 10,
        color: '#fff',
        fontWeight: '600',
        textTransform: 'uppercase',
    },
    propertyCard: {
        backgroundColor: '#fff',
        padding: 15,
        borderRadius: 12,
        marginBottom: 10,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    propertyInfo: {
        flex: 1,
    },
    propertyTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
        marginBottom: 4,
    },
    propertyLocation: {
        fontSize: 12,
        color: '#666',
        marginBottom: 4,
    },
    propertyPrice: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#2E7D32',
    },
    propertyStats: {
        alignItems: 'flex-end',
    },
    propertyStat: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 4,
    },
    propertyStatText: {
        fontSize: 12,
        color: '#666',
        marginLeft: 4,
    },
    emptyState: {
        alignItems: 'center',
        padding: 40,
        backgroundColor: '#fff',
        borderRadius: 12,
        marginBottom: 10,
    },
    emptyText: {
        fontSize: 16,
        color: '#666',
        marginTop: 10,
        textAlign: 'center',
    },
    addButton: {
        backgroundColor: '#2E7D32',
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 8,
        marginTop: 15,
    },
    addButtonText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: '600',
    },
});

export default LandlordDashboardScreen;
