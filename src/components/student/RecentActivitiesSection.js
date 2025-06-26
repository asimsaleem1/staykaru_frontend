import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import studentApiService from '../../services/studentApiService';

const RecentActivitiesSection = ({ navigation }) => {
    const [activities, setActivities] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadRecentActivities();
    }, []);

    const loadRecentActivities = async () => {
        try {
            setLoading(true);
            const recentActivities = await studentApiService.getRecentActivities();
            setActivities(recentActivities.slice(0, 5)); // Show only last 5 activities
        } catch (error) {
            console.warn('Failed to load recent activities:', error);
        } finally {
            setLoading(false);
        }
    };

    const getActivityIcon = (type) => {
        switch (type) {
            case 'order_placed':
                return { name: 'restaurant', color: '#FF6B35' };
            case 'order_cancelled':
                return { name: 'close-circle', color: '#dc3545' };
            case 'booking_created':
                return { name: 'bed', color: '#28A745' };
            case 'booking_cancelled':
                return { name: 'close-circle', color: '#dc3545' };
            case 'payment_completed':
                return { name: 'card', color: '#007bff' };
            default:
                return { name: 'time', color: '#6c757d' };
        }
    };

    const formatTime = (timestamp) => {
        const now = new Date();
        const activityTime = new Date(timestamp);
        const diffInMinutes = Math.floor((now - activityTime) / (1000 * 60));
        
        if (diffInMinutes < 1) return 'Just now';
        if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
        if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
        return `${Math.floor(diffInMinutes / 1440)}d ago`;
    };

    if (loading || activities.length === 0) {
        return null;
    }

    return (
        <View style={styles.section}>
            <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Recent Activity</Text>
                <TouchableOpacity onPress={() => navigation.navigate('RecentActivity')}>
                    <Text style={styles.seeAllText}>See All</Text>
                </TouchableOpacity>
            </View>
            
            <View style={styles.activityContainer}>
                {activities.map((activity, index) => {
                    const icon = getActivityIcon(activity.type);
                    return (
                        <View key={activity.id || index} style={styles.activityItem}>
                            <View style={[styles.activityIconContainer, { backgroundColor: `${icon.color}20` }]}>
                                <Ionicons name={icon.name} size={20} color={icon.color} />
                            </View>
                            <View style={styles.activityContent}>
                                <Text style={styles.activityMessage} numberOfLines={2}>
                                    {activity.message}
                                </Text>
                                <Text style={styles.activityTime}>
                                    {formatTime(activity.timestamp)}
                                </Text>
                            </View>
                        </View>
                    );
                })}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    section: {
        marginTop: 20,
        marginHorizontal: 16,
        marginBottom: 20,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#333',
    },
    seeAllText: {
        fontSize: 14,
        color: '#667eea',
        fontWeight: '500',
    },
    activityContainer: {
        backgroundColor: '#fff',
        borderRadius: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    activityItem: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#f1f3f4',
    },
    activityIconContainer: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    activityContent: {
        flex: 1,
        justifyContent: 'center',
    },
    activityMessage: {
        fontSize: 14,
        color: '#333',
        fontWeight: '500',
        marginBottom: 4,
    },
    activityTime: {
        fontSize: 12,
        color: '#6c757d',
    },
});

export default RecentActivitiesSection;
