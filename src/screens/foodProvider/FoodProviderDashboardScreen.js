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
import FoodProviderNavigation from '../../components/foodProvider/FoodProviderNavigation';
import authService from '../../services/authService';
import foodProviderApiService from '../../services/foodProviderApiService';
import { fetchFromBackend } from '../../utils/networkUtils';

const { width } = Dimensions.get('window');

const FoodProviderDashboardScreen = ({ navigation }) => {
    const [user, setUser] = useState(null);
    const [dashboardData, setDashboardData] = useState({
        orders: [],
        menuItems: [],
        earnings: { total: 0, today: 0, thisMonth: 0, pending: 0 },
        analytics: { 
            totalOrders: 0, 
            avgRating: 0, 
            popularItems: [],
            orderGrowth: 0 
        },
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

            // Fetch real-time food provider dashboard data from backend
            const [ordersData, menuData, analyticsData, revenueData] = await Promise.all([
                foodProviderApiService.getOrders({ limit: 10, status: 'active' }),
                foodProviderApiService.getMenu(),
                foodProviderApiService.getAnalytics('30d'),
                foodProviderApiService.getRevenueStats('30d')
            ]);

            // Process orders data
            const orders = ordersData.orders || [];
            const pendingOrders = orders.filter(order => order.status === 'pending').length;
            const preparingOrders = orders.filter(order => order.status === 'preparing').length;

            // Process menu data
            const menuItems = [];
            if (menuData.menu && menuData.menu.categories) {
                menuData.menu.categories.forEach(category => {
                    menuItems.push(...category.items);
                });
            }

            // Process analytics data
            const analytics = analyticsData.analytics || {};
            const revenue = revenueData.revenue || {};

            setDashboardData({
                orders: orders,
                menuItems: menuItems,
                earnings: {
                    total: revenue.totalEarnings || 0,
                    today: revenue.today || 0,
                    thisMonth: revenue.thisMonth || 0,
                    pending: revenue.pendingPayouts || 0
                },
                analytics: {
                    totalOrders: analytics.monthlyOrders || 0,
                    avgRating: analytics.customerSatisfaction?.averageRating || 0,
                    popularItems: analytics.popularItems || [],
                    orderGrowth: 15, // Calculate from data
                    todayOrders: analytics.todayOrders || 0,
                    avgOrderValue: analytics.averageOrderValue || 0
                },
                notifications: [],
                stats: {
                    pendingOrders,
                    preparingOrders,
                    totalMenuItems: menuItems.length,
                    activeMenuItems: menuItems.filter(item => item.isAvailable).length
                }
            });

            console.log('✅ Food provider dashboard data loaded successfully');
        } catch (error) {
            console.error('❌ Error loading food provider dashboard:', error);
            Alert.alert('Error', 'Failed to load dashboard data. Please try again.');
        } finally {
            setLoading(false);
            setRefreshing(false);
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

    const getOrderStatusColor = (status) => {
        switch (status?.toLowerCase()) {
            case 'pending': return '#FF9800';
            case 'preparing': return '#2196F3';
            case 'ready': return '#4CAF50';
            case 'delivered': return '#8BC34A';
            case 'cancelled': return '#F44336';
            default: return '#757575';
        }
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
                    colors={['#FF6B35', '#FF8E53']}
                    style={styles.header}
                >
                    <View style={styles.headerContent}>
                        <View style={styles.welcomeSection}>
                            <Text style={styles.welcomeText}>Welcome back,</Text>
                            <Text style={styles.userName}>{user?.name || 'Food Provider'}</Text>
                            <Text style={styles.userRole}>Restaurant Owner</Text>
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
                            <Icon name="restaurant-menu" size={32} color="#FF6B35" />
                            <Text style={styles.statNumber}>{dashboardData.menuItems.length}</Text>
                            <Text style={styles.statLabel}>Menu Items</Text>
                        </View>
                        <View style={styles.statCard}>
                            <Icon name="shopping-cart" size={32} color="#2196F3" />
                            <Text style={styles.statNumber}>{dashboardData.orders.length}</Text>
                            <Text style={styles.statLabel}>New Orders</Text>
                        </View>
                    </View>
                    <View style={styles.statsRow}>
                        <View style={styles.statCard}>
                            <Icon name="trending-up" size={32} color="#4CAF50" />
                            <Text style={styles.statNumber}>{formatCurrency(dashboardData.earnings.today)}</Text>
                            <Text style={styles.statLabel}>Today's Earnings</Text>
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
                            onPress={() => navigation.navigate('MenuManagement')}
                        >
                            <Icon name="menu-book" size={40} color="#FF6B35" />
                            <Text style={styles.actionText}>Manage Menu</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={styles.actionCard}
                            onPress={() => navigation.navigate('OrderManagement')}
                        >
                            <Icon name="receipt" size={40} color="#2196F3" />
                            <Text style={styles.actionText}>View Orders</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={styles.actionCard}
                            onPress={() => navigation.navigate('InventoryManagement')}
                        >
                            <Icon name="inventory" size={40} color="#4CAF50" />
                            <Text style={styles.actionText}>Inventory</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={styles.actionCard}
                            onPress={() => navigation.navigate('ReviewsRatings')}
                        >
                            <Icon name="star" size={40} color="#FFD700" />
                            <Text style={styles.actionText}>Reviews</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={styles.actionCard}
                            onPress={() => navigation.navigate('AnalyticsReports')}
                        >
                            <Icon name="bar-chart" size={40} color="#9C27B0" />
                            <Text style={styles.actionText}>Analytics</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={styles.actionCard}
                            onPress={() => navigation.navigate('Settings')}
                        >
                            <Icon name="settings" size={40} color="#607D8B" />
                            <Text style={styles.actionText}>Settings</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Recent Orders */}
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>Recent Orders</Text>
                        <TouchableOpacity onPress={() => navigation.navigate('OrderManagement')}>
                            <Text style={styles.viewAllText}>View All</Text>
                        </TouchableOpacity>
                    </View>
                    
                    {dashboardData.orders.length > 0 ? (
                        dashboardData.orders.slice(0, 5).map((order, index) => (
                            <TouchableOpacity
                                key={order.id || index}
                                style={styles.orderCard}
                                onPress={() => navigation.navigate('OrderDetail', { id: order.id })}
                            >
                                <View style={styles.orderHeader}>
                                    <Text style={styles.orderNumber}>Order #{order.id}</Text>
                                    <Text style={styles.orderAmount}>{formatCurrency(order.total_amount)}</Text>
                                </View>
                                <Text style={styles.orderCustomer}>{order.customer?.name || 'Customer'}</Text>
                                <View style={styles.orderFooter}>
                                    <Text style={styles.orderTime}>
                                        {new Date(order.created_at).toLocaleTimeString('en-PK', { 
                                            hour: '2-digit', 
                                            minute: '2-digit' 
                                        })}
                                    </Text>
                                    <View style={[
                                        styles.statusBadge, 
                                        { backgroundColor: getOrderStatusColor(order.status) }
                                    ]}>
                                        <Text style={styles.statusText}>{order.status}</Text>
                                    </View>
                                </View>
                            </TouchableOpacity>
                        ))
                    ) : (
                        <View style={styles.emptyState}>
                            <Icon name="shopping-cart" size={48} color="#ccc" />
                            <Text style={styles.emptyText}>No recent orders</Text>
                        </View>
                    )}
                </View>

                {/* Popular Menu Items */}
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>Popular Menu Items</Text>
                        <TouchableOpacity onPress={() => navigation.navigate('MenuManagement')}>
                            <Text style={styles.viewAllText}>Manage Menu</Text>
                        </TouchableOpacity>
                    </View>
                    
                    {dashboardData.analytics.popularItems?.length > 0 ? (
                        dashboardData.analytics.popularItems.slice(0, 3).map((item, index) => (
                            <View key={item.id || index} style={styles.menuItemCard}>
                                <View style={styles.menuItemInfo}>
                                    <Text style={styles.menuItemName}>{item.name}</Text>
                                    <Text style={styles.menuItemPrice}>{formatCurrency(item.price)}</Text>
                                </View>
                                <View style={styles.menuItemStats}>
                                    <View style={styles.menuItemStat}>
                                        <Icon name="shopping-cart" size={16} color="#666" />
                                        <Text style={styles.menuItemStatText}>{item.orderCount || 0} orders</Text>
                                    </View>
                                    <View style={styles.menuItemStat}>
                                        <Icon name="star" size={16} color="#FFD700" />
                                        <Text style={styles.menuItemStatText}>{item.rating?.toFixed(1) || '0.0'}</Text>
                                    </View>
                                </View>
                            </View>
                        ))
                    ) : (
                        <View style={styles.emptyState}>
                            <Icon name="restaurant-menu" size={48} color="#ccc" />
                            <Text style={styles.emptyText}>No popular items yet</Text>
                            <TouchableOpacity
                                style={styles.addButton}
                                onPress={() => navigation.navigate('MenuManagement')}
                            >
                                <Text style={styles.addButtonText}>Add Menu Items</Text>
                            </TouchableOpacity>
                        </View>
                    )}
                </View>

                {/* Earnings Overview */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Earnings Overview</Text>
                    <View style={styles.earningsGrid}>
                        <View style={styles.earningCard}>
                            <Text style={styles.earningLabel}>Total Earnings</Text>
                            <Text style={styles.earningAmount}>{formatCurrency(dashboardData.earnings.total)}</Text>
                        </View>
                        <View style={styles.earningCard}>
                            <Text style={styles.earningLabel}>This Month</Text>
                            <Text style={styles.earningAmount}>{formatCurrency(dashboardData.earnings.thisMonth)}</Text>
                        </View>
                        <View style={styles.earningCard}>
                            <Text style={styles.earningLabel}>Pending</Text>
                            <Text style={styles.earningAmount}>{formatCurrency(dashboardData.earnings.pending)}</Text>
                        </View>
                    </View>                </View>
            </ScrollView>
            
            {/* Bottom Navigation */}
            <FoodProviderNavigation navigation={navigation} activeRoute="dashboard" />
        </SafeAreaView>
    );
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
        color: '#FF6B35',
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
    orderCard: {
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
    orderHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 5,
    },
    orderNumber: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
    },
    orderAmount: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#FF6B35',
    },
    orderCustomer: {
        fontSize: 14,
        color: '#666',
        marginBottom: 8,
    },
    orderFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    orderTime: {
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
    menuItemCard: {
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
    menuItemInfo: {
        flex: 1,
    },
    menuItemName: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
        marginBottom: 4,
    },
    menuItemPrice: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#FF6B35',
    },
    menuItemStats: {
        alignItems: 'flex-end',
    },
    menuItemStat: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 4,
    },
    menuItemStatText: {
        fontSize: 12,
        color: '#666',
        marginLeft: 4,
    },
    earningsGrid: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
    },
    earningCard: {
        backgroundColor: '#fff',
        padding: 15,
        borderRadius: 12,
        width: (width - 70) / 3,
        alignItems: 'center',
        marginBottom: 10,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    earningLabel: {
        fontSize: 12,
        color: '#666',
        marginBottom: 5,
        textAlign: 'center',
    },
    earningAmount: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#333',
        textAlign: 'center',
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
        backgroundColor: '#FF6B35',
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

export default FoodProviderDashboardScreen;
