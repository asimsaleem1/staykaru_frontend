import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    ScrollView,
    StyleSheet,
    TouchableOpacity,
    FlatList,
    Image,
    Alert,
    RefreshControl,
    Switch,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import LandlordNavigation from '../../components/landlord/LandlordNavigation';
import { fetchFromBackend } from '../../utils/networkUtils';

const PropertyListingScreen = ({ navigation }) => {
    const [properties, setProperties] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [stats, setStats] = useState({
        totalProperties: 0,
        activeProperties: 0,
        occupiedRooms: 0,
        totalRooms: 0,
        monthlyRevenue: 0
    });

    useEffect(() => {
        loadProperties();
        loadStats();
    }, []);

    const loadProperties = async () => {
        try {
            setLoading(true);
            const response = await fetchFromBackend('/accommodations/landlord/my-properties');
            
            if (response.success) {
                setProperties(response.data);
                console.log('✅ Properties loaded:', response.data.length);
            } else {
                Alert.alert('Error', 'Failed to load properties');
            }
        } catch (error) {
            console.error('❌ Error loading properties:', error);
            Alert.alert('Error', 'Failed to load properties');
        } finally {
            setLoading(false);
        }
    };

    const loadStats = async () => {
        try {
            const response = await fetchFromBackend('/accommodations/landlord/stats');
            
            if (response.success) {
                setStats(response.data);
            }
        } catch (error) {
            console.error('❌ Error loading stats:', error);
        }
    };

    const onRefresh = async () => {
        setRefreshing(true);
        await Promise.all([loadProperties(), loadStats()]);
        setRefreshing(false);
    };

    const handlePropertyStatus = async (propertyId, newStatus) => {
        try {
            const response = await fetchFromBackend(`/accommodations/${propertyId}/status`, {
                method: 'PUT',
                data: { status: newStatus }
            });

            if (response.success) {
                await loadProperties();
                Alert.alert('Success', `Property ${newStatus} successfully`);
            } else {
                Alert.alert('Error', 'Failed to update property status');
            }
        } catch (error) {
            console.error('❌ Error updating property status:', error);
            Alert.alert('Error', 'Failed to update property status');
        }
    };

    const handleDeleteProperty = async (propertyId) => {
        Alert.alert(
            'Delete Property',
            'Are you sure you want to delete this property? This action cannot be undone.',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            const response = await fetchFromBackend(`/accommodations/${propertyId}`, {
                                method: 'DELETE'
                            });

                            if (response.success) {
                                await loadProperties();
                                Alert.alert('Success', 'Property deleted successfully');
                            } else {
                                Alert.alert('Error', 'Failed to delete property');
                            }
                        } catch (error) {
                            console.error('❌ Error deleting property:', error);
                            Alert.alert('Error', 'Failed to delete property');
                        }
                    }
                }
            ]
        );
    };

    const formatPrice = (price) => {
        return new Intl.NumberFormat('en-PK', {
            style: 'currency',
            currency: 'PKR',
            minimumFractionDigits: 0,
        }).format(price);
    };

    const getStatusColor = (status) => {
        switch (status?.toLowerCase()) {
            case 'active': return '#4CAF50';
            case 'inactive': return '#FF9800';
            case 'maintenance': return '#FF5722';
            case 'occupied': return '#2196F3';
            default: return '#666';
        }
    };

    const getOccupancyRate = (property) => {
        if (!property.rooms || property.rooms.length === 0) return 0;
        const occupiedRooms = property.rooms.filter(room => room.isOccupied).length;
        return (occupiedRooms / property.rooms.length) * 100;
    };

    const renderPropertyCard = ({ item }) => (
        <View style={styles.propertyCard}>
            <Image 
                source={{ uri: item.images?.[0] || 'https://via.placeholder.com/300x200' }} 
                style={styles.propertyImage}
            />
            
            <View style={styles.propertyInfo}>
                <View style={styles.propertyHeader}>
                    <Text style={styles.propertyTitle}>{item.title}</Text>
                    <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
                        <Text style={styles.statusText}>{item.status}</Text>
                    </View>
                </View>
                
                <Text style={styles.propertyType}>{item.type}</Text>
                <Text style={styles.propertyLocation}>
                    <Ionicons name="location-outline" size={14} color="#666" />
                    {' '}{item.location?.area}, {item.location?.city}
                </Text>
                
                <View style={styles.propertyStats}>
                    <View style={styles.stat}>
                        <Text style={styles.statValue}>{item.rooms?.length || 0}</Text>
                        <Text style={styles.statLabel}>Rooms</Text>
                    </View>
                    <View style={styles.stat}>
                        <Text style={styles.statValue}>{getOccupancyRate(item).toFixed(0)}%</Text>
                        <Text style={styles.statLabel}>Occupied</Text>
                    </View>
                    <View style={styles.stat}>
                        <Text style={styles.statValue}>
                            {item.rating ? item.rating.toFixed(1) : 'N/A'}
                        </Text>
                        <Text style={styles.statLabel}>Rating</Text>
                    </View>
                    <View style={styles.stat}>
                        <Text style={styles.statValue}>{formatPrice(item.price)}</Text>
                        <Text style={styles.statLabel}>Price</Text>
                    </View>
                </View>
                
                <View style={styles.propertyActions}>
                    <TouchableOpacity
                        style={styles.actionButton}
                        onPress={() => navigation.navigate('PropertyDetails', { propertyId: item.id })}
                    >
                        <Ionicons name="eye-outline" size={16} color="#4CAF50" />
                        <Text style={styles.actionText}>View</Text>
                    </TouchableOpacity>
                    
                    <TouchableOpacity
                        style={styles.actionButton}
                        onPress={() => navigation.navigate('EditProperty', { propertyId: item.id })}
                    >
                        <Ionicons name="pencil-outline" size={16} color="#2196F3" />
                        <Text style={[styles.actionText, { color: '#2196F3' }]}>Edit</Text>
                    </TouchableOpacity>
                    
                    <TouchableOpacity
                        style={styles.actionButton}
                        onPress={() => navigation.navigate('PropertyBookings', { propertyId: item.id })}
                    >
                        <Ionicons name="calendar-outline" size={16} color="#FF9800" />
                        <Text style={[styles.actionText, { color: '#FF9800' }]}>Bookings</Text>
                    </TouchableOpacity>
                    
                    <TouchableOpacity
                        style={styles.actionButton}
                        onPress={() => handleDeleteProperty(item.id)}
                    >
                        <Ionicons name="trash-outline" size={16} color="#F44336" />
                        <Text style={[styles.actionText, { color: '#F44336' }]}>Delete</Text>
                    </TouchableOpacity>
                </View>
                
                <View style={styles.statusToggle}>
                    <Text style={styles.toggleLabel}>Active Status</Text>
                    <Switch
                        value={item.status === 'active'}
                        onValueChange={(value) => 
                            handlePropertyStatus(item.id, value ? 'active' : 'inactive')
                        }
                        trackColor={{ false: '#ccc', true: '#4CAF50' }}
                        thumbColor="#fff"
                    />
                </View>
            </View>
        </View>
    );

    const renderStatsCard = (title, value, icon, color) => (
        <View style={styles.statsCard}>
            <View style={[styles.statsIcon, { backgroundColor: color }]}>
                <Ionicons name={icon} size={24} color="#fff" />
            </View>
            <View style={styles.statsInfo}>
                <Text style={styles.statsValue}>{value}</Text>
                <Text style={styles.statsTitle}>{title}</Text>
            </View>
        </View>
    );

    return (
        <SafeAreaView style={styles.container}>
            {/* Header */}
            <LinearGradient
                colors={['#6B73FF', '#9575CD']}
                style={styles.header}
            >
                <View style={styles.headerContent}>
                    <Text style={styles.headerTitle}>My Properties</Text>
                    <TouchableOpacity
                        onPress={() => navigation.navigate('AddProperty')}
                        style={styles.addButton}
                    >
                        <Ionicons name="add" size={24} color="#fff" />
                    </TouchableOpacity>
                </View>
            </LinearGradient>

            <ScrollView 
                style={styles.content}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
            >
                {/* Stats Overview */}
                <Text style={styles.sectionTitle}>Overview</Text>
                <View style={styles.statsContainer}>
                    {renderStatsCard(
                        'Total Properties', 
                        stats.totalProperties, 
                        'home-outline', 
                        '#4CAF50'
                    )}
                    {renderStatsCard(
                        'Active Properties', 
                        stats.activeProperties, 
                        'checkmark-circle-outline', 
                        '#2196F3'
                    )}
                    {renderStatsCard(
                        'Occupancy', 
                        `${stats.totalRooms > 0 ? Math.round((stats.occupiedRooms / stats.totalRooms) * 100) : 0}%`, 
                        'people-outline', 
                        '#FF9800'
                    )}
                    {renderStatsCard(
                        'Monthly Revenue', 
                        formatPrice(stats.monthlyRevenue), 
                        'trending-up-outline', 
                        '#9C27B0'
                    )}
                </View>

                {/* Properties List */}
                <View style={styles.propertiesSection}>
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>Properties ({properties.length})</Text>
                        <TouchableOpacity
                            onPress={() => navigation.navigate('AddProperty')}
                            style={styles.addPropertyButton}
                        >
                            <Ionicons name="add" size={20} color="#fff" />
                            <Text style={styles.addPropertyText}>Add Property</Text>
                        </TouchableOpacity>
                    </View>

                    {loading ? (
                        <View style={styles.loadingContainer}>
                            <Text style={styles.loadingText}>Loading properties...</Text>
                        </View>
                    ) : properties.length === 0 ? (
                        <View style={styles.emptyContainer}>
                            <Ionicons name="home-outline" size={64} color="#ccc" />
                            <Text style={styles.emptyText}>No properties yet</Text>
                            <Text style={styles.emptySubText}>Add your first property to get started</Text>
                            <TouchableOpacity
                                style={styles.emptyButton}
                                onPress={() => navigation.navigate('AddProperty')}
                            >
                                <Text style={styles.emptyButtonText}>Add Property</Text>
                            </TouchableOpacity>
                        </View>
                    ) : (
                        <FlatList
                            data={properties}
                            renderItem={renderPropertyCard}
                            keyExtractor={(item) => item.id.toString()}
                            showsVerticalScrollIndicator={false}
                            scrollEnabled={false}
                        />
                    )}
                </View>
            </ScrollView>

            {/* Bottom Navigation */}
            <LandlordNavigation navigation={navigation} activeRoute="properties" />
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    header: {
        paddingHorizontal: 20,
        paddingVertical: 15,
    },
    headerContent: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#fff',
    },
    addButton: {
        backgroundColor: 'rgba(255,255,255,0.2)',
        borderRadius: 25,
        padding: 8,
    },
    content: {
        flex: 1,
        padding: 20,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 15,
    },
    statsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        marginBottom: 25,
    },
    statsCard: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 15,
        flexDirection: 'row',
        alignItems: 'center',
        width: '48%',
        marginBottom: 10,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
    },
    statsIcon: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    statsInfo: {
        flex: 1,
    },
    statsValue: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
    },
    statsTitle: {
        fontSize: 12,
        color: '#666',
        marginTop: 2,
    },
    propertiesSection: {
        flex: 1,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 15,
    },
    addPropertyButton: {
        backgroundColor: '#4CAF50',
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
    },
    addPropertyText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: '600',
        marginLeft: 5,
    },
    loadingContainer: {
        paddingVertical: 40,
        alignItems: 'center',
    },
    loadingText: {
        fontSize: 16,
        color: '#666',
    },
    emptyContainer: {
        alignItems: 'center',
        paddingVertical: 60,
    },
    emptyText: {
        fontSize: 18,
        color: '#666',
        marginTop: 15,
        fontWeight: '600',
    },
    emptySubText: {
        fontSize: 14,
        color: '#999',
        marginTop: 5,
        marginBottom: 20,
    },
    emptyButton: {
        backgroundColor: '#4CAF50',
        paddingHorizontal: 30,
        paddingVertical: 12,
        borderRadius: 25,
    },
    emptyButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
    propertyCard: {
        backgroundColor: '#fff',
        borderRadius: 12,
        marginBottom: 15,
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    propertyImage: {
        width: '100%',
        height: 180,
        borderTopLeftRadius: 12,
        borderTopRightRadius: 12,
    },
    propertyInfo: {
        padding: 15,
    },
    propertyHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 5,
    },
    propertyTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
        flex: 1,
        marginRight: 10,
    },
    statusBadge: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
    },
    statusText: {
        color: '#fff',
        fontSize: 12,
        fontWeight: '600',
        textTransform: 'capitalize',
    },
    propertyType: {
        fontSize: 14,
        color: '#4CAF50',
        fontWeight: '600',
        marginBottom: 5,
    },
    propertyLocation: {
        fontSize: 14,
        color: '#666',
        marginBottom: 15,
    },
    propertyStats: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 15,
        paddingVertical: 10,
        borderTopWidth: 1,
        borderBottomWidth: 1,
        borderColor: '#f0f0f0',
    },
    stat: {
        alignItems: 'center',
        flex: 1,
    },
    statValue: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
    },
    statLabel: {
        fontSize: 12,
        color: '#666',
        marginTop: 2,
    },
    propertyActions: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginBottom: 15,
    },
    actionButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 8,
        backgroundColor: '#f8f8f8',
    },
    actionText: {
        fontSize: 12,
        color: '#4CAF50',
        marginLeft: 4,
        fontWeight: '600',
    },
    statusToggle: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingTop: 10,
        borderTopWidth: 1,
        borderTopColor: '#f0f0f0',
    },
    toggleLabel: {
        fontSize: 16,
        color: '#333',
        fontWeight: '600',
    },
});

export default PropertyListingScreen;
