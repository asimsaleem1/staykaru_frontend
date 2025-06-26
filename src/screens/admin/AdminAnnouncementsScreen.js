import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    TextInput,
    Alert,
    RefreshControl,
    Switch,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { MaterialIcons } from '@expo/vector-icons';
import LoadingSpinner from '../../components/LoadingSpinner';
import { adminApiService } from '../../services/adminApiService';

const AdminAnnouncementsScreen = () => {
    const navigation = useNavigation();

    const [announcements, setAnnouncements] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [newAnnouncement, setNewAnnouncement] = useState({
        title: '',
        message: '',
        type: 'general',
        targetAudience: 'all',
        priority: 'normal',
        expiryDate: '',
        isActive: true,
    });
    const [creating, setCreating] = useState(false);

    const announcementTypes = [
        { value: 'general', label: 'General' },
        { value: 'maintenance', label: 'Maintenance' },
        { value: 'promotion', label: 'Promotion' },
        { value: 'policy', label: 'Policy Update' },
        { value: 'emergency', label: 'Emergency' },
    ];

    const targetAudiences = [
        { value: 'all', label: 'All Users' },
        { value: 'students', label: 'Students Only' },
        { value: 'landlords', label: 'Landlords Only' },
        { value: 'food_providers', label: 'Food Providers Only' },
        { value: 'admins', label: 'Admins Only' },
    ];

    const priorities = [
        { value: 'low', label: 'Low' },
        { value: 'normal', label: 'Normal' },
        { value: 'high', label: 'High' },
        { value: 'urgent', label: 'Urgent' },
    ];

    useEffect(() => {
        fetchAnnouncements();
    }, []);

    const fetchAnnouncements = async () => {
        try {
            setLoading(true);
            // For now, simulate API call with mock data
            const mockAnnouncements = [
                {
                    _id: '1',
                    title: 'System Maintenance Scheduled',
                    message: 'We will be performing scheduled maintenance on our servers tonight from 2:00 AM to 4:00 AM. During this time, the app may be unavailable.',
                    type: 'maintenance',
                    targetAudience: 'all',
                    priority: 'high',
                    isActive: true,
                    createdAt: '2024-01-20T10:00:00Z',
                    expiryDate: '2024-01-25T23:59:59Z',
                    author: 'System Admin',
                    views: 234,
                },
                {
                    _id: '2',
                    title: 'New Food Delivery Partner',
                    message: 'We are excited to announce our partnership with Express Delivery Service for faster food deliveries!',
                    type: 'promotion',
                    targetAudience: 'students',
                    priority: 'normal',
                    isActive: true,
                    createdAt: '2024-01-19T14:30:00Z',
                    expiryDate: '2024-02-19T23:59:59Z',
                    author: 'Marketing Team',
                    views: 156,
                },
                {
                    _id: '3',
                    title: 'Updated Terms of Service',
                    message: 'Please review our updated Terms of Service that will take effect from February 1st, 2024.',
                    type: 'policy',
                    targetAudience: 'all',
                    priority: 'normal',
                    isActive: true,
                    createdAt: '2024-01-18T09:15:00Z',
                    expiryDate: '2024-03-01T23:59:59Z',
                    author: 'Legal Team',
                    views: 89,
                },
                {
                    _id: '4',
                    title: 'Special Discount for January',
                    message: 'Get 20% off on all accommodation bookings made this month. Use code JAN20 at checkout.',
                    type: 'promotion',
                    targetAudience: 'students',
                    priority: 'high',
                    isActive: false,
                    createdAt: '2024-01-01T00:00:00Z',
                    expiryDate: '2024-01-31T23:59:59Z',
                    author: 'Sales Team',
                    views: 445,
                },
            ];
            setAnnouncements(mockAnnouncements);
        } catch (error) {
            console.error('Error fetching announcements:', error);
            Alert.alert('Error', 'Failed to load announcements');
        } finally {
            setLoading(false);
        }
    };

    const onRefresh = async () => {
        setRefreshing(true);
        await fetchAnnouncements();
        setRefreshing(false);
    };

    const createAnnouncement = async () => {
        if (!newAnnouncement.title.trim() || !newAnnouncement.message.trim()) {
            Alert.alert('Error', 'Please fill in all required fields');
            return;
        }

        try {
            setCreating(true);
            const announcementData = {
                ...newAnnouncement,
                createdAt: new Date().toISOString(),
                author: 'Admin',
                views: 0,
            };

            // For now, simulate API call
            const mockResponse = {
                success: true,
                announcement: {
                    _id: Date.now().toString(),
                    ...announcementData,
                }
            };

            if (mockResponse.success) {
                setAnnouncements(prev => [mockResponse.announcement, ...prev]);
                setNewAnnouncement({
                    title: '',
                    message: '',
                    type: 'general',
                    targetAudience: 'all',
                    priority: 'normal',
                    expiryDate: '',
                    isActive: true,
                });
                setShowCreateForm(false);
                Alert.alert('Success', 'Announcement created successfully');
            }
        } catch (error) {
            console.error('Error creating announcement:', error);
            Alert.alert('Error', 'Failed to create announcement');
        } finally {
            setCreating(false);
        }
    };

    const toggleAnnouncementStatus = async (announcementId, currentStatus) => {
        try {
            const newStatus = !currentStatus;
            // Simulate API call
            setAnnouncements(prev =>
                prev.map(announcement =>
                    announcement._id === announcementId
                        ? { ...announcement, isActive: newStatus }
                        : announcement
                )
            );
            Alert.alert('Success', `Announcement ${newStatus ? 'activated' : 'deactivated'} successfully`);
        } catch (error) {
            console.error('Error toggling announcement status:', error);
            Alert.alert('Error', 'Failed to update announcement status');
        }
    };

    const deleteAnnouncement = (announcementId) => {
        Alert.alert(
            'Confirm Delete',
            'Are you sure you want to delete this announcement?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            // Simulate API call
                            setAnnouncements(prev => prev.filter(a => a._id !== announcementId));
                            Alert.alert('Success', 'Announcement deleted successfully');
                        } catch (error) {
                            console.error('Error deleting announcement:', error);
                            Alert.alert('Error', 'Failed to delete announcement');
                        }
                    }
                }
            ]
        );
    };

    const getTypeColor = (type) => {
        switch (type) {
            case 'emergency': return '#F44336';
            case 'maintenance': return '#FF9800';
            case 'promotion': return '#4CAF50';
            case 'policy': return '#2196F3';
            default: return '#9E9E9E';
        }
    };

    const getPriorityColor = (priority) => {
        switch (priority) {
            case 'urgent': return '#F44336';
            case 'high': return '#FF9800';
            case 'normal': return '#4CAF50';
            default: return '#9E9E9E';
        }
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    const renderAnnouncementItem = (announcement) => (
        <View key={announcement._id} style={styles.announcementCard}>
            <View style={styles.announcementHeader}>
                <View style={styles.badgeContainer}>
                    <View style={[styles.typeBadge, { backgroundColor: getTypeColor(announcement.type) }]}>
                        <Text style={styles.badgeText}>{announcement.type.toUpperCase()}</Text>
                    </View>
                    <View style={[styles.priorityBadge, { backgroundColor: getPriorityColor(announcement.priority) }]}>
                        <Text style={styles.badgeText}>{announcement.priority.toUpperCase()}</Text>
                    </View>
                </View>
                <Switch
                    value={announcement.isActive}
                    onValueChange={() => toggleAnnouncementStatus(announcement._id, announcement.isActive)}
                    trackColor={{ false: '#767577', true: '#81b0ff' }}
                    thumbColor={announcement.isActive ? '#1976d2' : '#f4f3f4'}
                />
            </View>

            <Text style={styles.announcementTitle}>{announcement.title}</Text>
            <Text style={styles.announcementMessage} numberOfLines={3}>
                {announcement.message}
            </Text>

            <View style={styles.announcementMeta}>
                <Text style={styles.metaText}>Target: {announcement.targetAudience}</Text>
                <Text style={styles.metaText}>Views: {announcement.views}</Text>
            </View>

            <View style={styles.announcementFooter}>
                <Text style={styles.dateText}>
                    Created: {formatDate(announcement.createdAt)}
                </Text>
                {announcement.expiryDate && (
                    <Text style={styles.dateText}>
                        Expires: {formatDate(announcement.expiryDate)}
                    </Text>
                )}
            </View>

            <View style={styles.actionButtons}>
                <TouchableOpacity
                    style={[styles.actionButton, styles.editButton]}
                    onPress={() => {
                        // For now, just show alert
                        Alert.alert('Edit', 'Edit functionality will be implemented');
                    }}
                >
                    <MaterialIcons name="edit" size={16} color="#fff" />
                    <Text style={styles.actionButtonText}>Edit</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.actionButton, styles.deleteButton]}
                    onPress={() => deleteAnnouncement(announcement._id)}
                >
                    <MaterialIcons name="delete" size={16} color="#fff" />
                    <Text style={styles.actionButtonText}>Delete</Text>
                </TouchableOpacity>
            </View>
        </View>
    );

    if (loading) {
        return <LoadingSpinner />;
    }

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <MaterialIcons name="arrow-back" size={24} color="#333" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Announcements</Text>
                <TouchableOpacity onPress={() => setShowCreateForm(!showCreateForm)}>
                    <MaterialIcons name="add" size={24} color="#1976d2" />
                </TouchableOpacity>
            </View>

            {/* Create Form */}
            {showCreateForm && (
                <View style={styles.createForm}>
                    <Text style={styles.formTitle}>Create New Announcement</Text>
                    
                    <TextInput
                        style={styles.input}
                        placeholder="Title *"
                        value={newAnnouncement.title}
                        onChangeText={(text) => setNewAnnouncement(prev => ({ ...prev, title: text }))}
                    />
                    
                    <TextInput
                        style={[styles.input, styles.messageInput]}
                        placeholder="Message *"
                        value={newAnnouncement.message}
                        onChangeText={(text) => setNewAnnouncement(prev => ({ ...prev, message: text }))}
                        multiline
                        numberOfLines={4}
                    />

                    <View style={styles.selectRow}>
                        <View style={styles.selectContainer}>
                            <Text style={styles.selectLabel}>Type</Text>
                            <View style={styles.selectButtons}>
                                {announcementTypes.slice(0, 3).map((type) => (
                                    <TouchableOpacity
                                        key={type.value}
                                        style={[
                                            styles.selectButton,
                                            newAnnouncement.type === type.value && styles.selectedButton
                                        ]}
                                        onPress={() => setNewAnnouncement(prev => ({ ...prev, type: type.value }))}
                                    >
                                        <Text style={[
                                            styles.selectButtonText,
                                            newAnnouncement.type === type.value && styles.selectedButtonText
                                        ]}>
                                            {type.label}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </View>
                    </View>

                    <View style={styles.selectRow}>
                        <View style={styles.selectContainer}>
                            <Text style={styles.selectLabel}>Priority</Text>
                            <View style={styles.selectButtons}>
                                {priorities.map((priority) => (
                                    <TouchableOpacity
                                        key={priority.value}
                                        style={[
                                            styles.selectButton,
                                            newAnnouncement.priority === priority.value && styles.selectedButton
                                        ]}
                                        onPress={() => setNewAnnouncement(prev => ({ ...prev, priority: priority.value }))}
                                    >
                                        <Text style={[
                                            styles.selectButtonText,
                                            newAnnouncement.priority === priority.value && styles.selectedButtonText
                                        ]}>
                                            {priority.label}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </View>
                    </View>

                    <View style={styles.selectRow}>
                        <View style={styles.selectContainer}>
                            <Text style={styles.selectLabel}>Target Audience</Text>
                            <View style={styles.selectButtons}>
                                {targetAudiences.slice(0, 3).map((audience) => (
                                    <TouchableOpacity
                                        key={audience.value}
                                        style={[
                                            styles.selectButton,
                                            newAnnouncement.targetAudience === audience.value && styles.selectedButton
                                        ]}
                                        onPress={() => setNewAnnouncement(prev => ({ ...prev, targetAudience: audience.value }))}
                                    >
                                        <Text style={[
                                            styles.selectButtonText,
                                            newAnnouncement.targetAudience === audience.value && styles.selectedButtonText
                                        ]}>
                                            {audience.label}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </View>
                    </View>

                    <View style={styles.formActions}>
                        <TouchableOpacity
                            style={[styles.formButton, styles.cancelButton]}
                            onPress={() => setShowCreateForm(false)}
                        >
                            <Text style={styles.cancelButtonText}>Cancel</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.formButton, styles.createButton]}
                            onPress={createAnnouncement}
                            disabled={creating}
                        >
                            {creating ? (
                                <Text style={styles.createButtonText}>Creating...</Text>
                            ) : (
                                <Text style={styles.createButtonText}>Create</Text>
                            )}
                        </TouchableOpacity>
                    </View>
                </View>
            )}

            {/* Announcements List */}
            <ScrollView
                style={styles.content}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
            >
                {announcements.length === 0 ? (
                    <View style={styles.emptyContainer}>
                        <MaterialIcons name="campaign" size={64} color="#ccc" />
                        <Text style={styles.emptyText}>No announcements found</Text>
                        <Text style={styles.emptySubText}>Create your first announcement to get started</Text>
                    </View>
                ) : (
                    announcements.map(renderAnnouncementItem)
                )}
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 16,
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#e0e0e0',
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
    },
    createForm: {
        backgroundColor: '#fff',
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#e0e0e0',
    },
    formTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 16,
    },
    input: {
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 8,
        padding: 12,
        fontSize: 14,
        marginBottom: 12,
    },
    messageInput: {
        height: 80,
        textAlignVertical: 'top',
    },
    selectRow: {
        marginBottom: 16,
    },
    selectContainer: {
        flex: 1,
    },
    selectLabel: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 8,
    },
    selectButtons: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    selectButton: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: '#ddd',
        backgroundColor: '#fff',
    },
    selectedButton: {
        backgroundColor: '#1976d2',
        borderColor: '#1976d2',
    },
    selectButtonText: {
        fontSize: 12,
        color: '#666',
    },
    selectedButtonText: {
        color: '#fff',
    },
    formActions: {
        flexDirection: 'row',
        gap: 12,
        marginTop: 8,
    },
    formButton: {
        flex: 1,
        paddingVertical: 12,
        borderRadius: 8,
        alignItems: 'center',
    },
    cancelButton: {
        backgroundColor: '#f5f5f5',
        borderWidth: 1,
        borderColor: '#ddd',
    },
    createButton: {
        backgroundColor: '#1976d2',
    },
    cancelButtonText: {
        color: '#666',
        fontWeight: 'bold',
    },
    createButtonText: {
        color: '#fff',
        fontWeight: 'bold',
    },
    content: {
        flex: 1,
    },
    announcementCard: {
        backgroundColor: '#fff',
        margin: 12,
        borderRadius: 12,
        padding: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    announcementHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    badgeContainer: {
        flexDirection: 'row',
        gap: 8,
    },
    typeBadge: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 8,
    },
    priorityBadge: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 8,
    },
    badgeText: {
        color: '#fff',
        fontSize: 10,
        fontWeight: 'bold',
    },
    announcementTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 8,
    },
    announcementMessage: {
        fontSize: 14,
        color: '#666',
        lineHeight: 20,
        marginBottom: 12,
    },
    announcementMeta: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 12,
    },
    metaText: {
        fontSize: 12,
        color: '#666',
        fontStyle: 'italic',
    },
    announcementFooter: {
        marginBottom: 12,
    },
    dateText: {
        fontSize: 12,
        color: '#666',
        marginBottom: 2,
    },
    actionButtons: {
        flexDirection: 'row',
        gap: 8,
    },
    actionButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 8,
        borderRadius: 6,
        gap: 4,
    },
    editButton: {
        backgroundColor: '#1976d2',
    },
    deleteButton: {
        backgroundColor: '#F44336',
    },
    actionButtonText: {
        color: '#fff',
        fontSize: 12,
        fontWeight: 'bold',
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 32,
        marginTop: 64,
    },
    emptyText: {
        fontSize: 18,
        color: '#666',
        marginTop: 16,
        marginBottom: 8,
    },
    emptySubText: {
        fontSize: 14,
        color: '#999',
        textAlign: 'center',
    },
});

export default AdminAnnouncementsScreen;
