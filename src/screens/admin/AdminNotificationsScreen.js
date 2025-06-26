import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    TextInput,
    Alert,
    Modal,
    RefreshControl,
    Switch,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SIZES } from '../../utils/constants';
import adminApiService from '../../services/adminApiService';

const AdminNotificationsScreen = ({ navigation }) => {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [selectedTab, setSelectedTab] = useState('all');
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [newNotification, setNewNotification] = useState({
        title: '',
        message: '',
        type: 'info',
        targetAudience: 'all',
        scheduled: false,
        scheduledDate: null,
    });

    const notificationTypes = [
        { key: 'all', label: 'All Notifications', count: 0 },
        { key: 'unread', label: 'Unread', count: 0 },
        { key: 'system', label: 'System', count: 0 },
        { key: 'user', label: 'User Actions', count: 0 },
        { key: 'booking', label: 'Bookings', count: 0 },
        { key: 'order', label: 'Orders', count: 0 },
    ];

    const targetAudienceOptions = [
        { key: 'all', label: 'All Users' },
        { key: 'students', label: 'Students Only' },
        { key: 'landlords', label: 'Landlords Only' },
        { key: 'food_providers', label: 'Food Providers Only' },
        { key: 'admins', label: 'Admins Only' },
    ];

    const notificationPriorities = [
        { key: 'info', label: 'Info', color: COLORS.primary },
        { key: 'warning', label: 'Warning', color: COLORS.warning },
        { key: 'error', label: 'Error', color: COLORS.error },
        { key: 'success', label: 'Success', color: COLORS.success },
    ];

    useEffect(() => {
        loadNotifications();
    }, [selectedTab]);

    const loadNotifications = async () => {
        try {
            setLoading(true);
            const params = {
                type: selectedTab !== 'all' ? selectedTab : undefined,
                page: 1,
                limit: 50
            };
            
            const data = await adminApiService.getNotifications(params);
            setNotifications(data.notifications || []);
            updateTypeCounts(data.notifications || []);
        } catch (error) {
            console.error('Error loading notifications:', error);
            Alert.alert('Error', 'Failed to load notifications');
        } finally {
            setLoading(false);
        }
    };

    const updateTypeCounts = (notificationsList) => {
        const counts = notificationsList.reduce((acc, notification) => {
            acc[notification.type] = (acc[notification.type] || 0) + 1;
            if (!notification.read) {
                acc.unread = (acc.unread || 0) + 1;
            }
            return acc;
        }, {});

        notificationTypes.forEach(type => {
            if (type.key === 'all') {
                type.count = notificationsList.length;
            } else {
                type.count = counts[type.key] || 0;
            }
        });
    };

    const onRefresh = async () => {
        setRefreshing(true);
        await loadNotifications();
        setRefreshing(false);
    };

    const handleMarkAsRead = async (notificationId) => {
        try {
            await adminApiService.markNotificationAsRead(notificationId);
            loadNotifications();
        } catch (error) {
            console.error('Error marking notification as read:', error);
            Alert.alert('Error', 'Failed to mark notification as read');
        }
    };

    const handleMarkAllAsRead = async () => {
        try {
            await adminApiService.markAllNotificationsAsRead();
            Alert.alert('Success', 'All notifications marked as read');
            loadNotifications();
        } catch (error) {
            console.error('Error marking all notifications as read:', error);
            Alert.alert('Error', 'Failed to mark all notifications as read');
        }
    };

    const handleDeleteNotification = async (notificationId) => {
        Alert.alert(
            'Delete Notification',
            'Are you sure you want to delete this notification?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await adminApiService.deleteNotification(notificationId);
                            Alert.alert('Success', 'Notification deleted');
                            loadNotifications();
                        } catch (error) {
                            console.error('Error deleting notification:', error);
                            Alert.alert('Error', 'Failed to delete notification');
                        }
                    }
                }
            ]
        );
    };

    const handleCreateNotification = async () => {
        if (!newNotification.title.trim() || !newNotification.message.trim()) {
            Alert.alert('Error', 'Please fill in all required fields');
            return;
        }

        try {
            await adminApiService.createNotification(newNotification);
            Alert.alert('Success', 'Notification created successfully');
            setShowCreateModal(false);
            setNewNotification({
                title: '',
                message: '',
                type: 'info',
                targetAudience: 'all',
                scheduled: false,
                scheduledDate: null,
            });
            loadNotifications();
        } catch (error) {
            console.error('Error creating notification:', error);
            Alert.alert('Error', 'Failed to create notification');
        }
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-GB', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getNotificationIcon = (type) => {
        const icons = {
            system: 'settings',
            user: 'person',
            booking: 'calendar',
            order: 'restaurant',
            info: 'information-circle',
            warning: 'warning',
            error: 'alert-circle',
            success: 'checkmark-circle',
        };
        return icons[type] || 'notifications';
    };

    const getNotificationColor = (type) => {
        const colors = {
            system: COLORS.primary,
            user: '#6B73FF',
            booking: '#10B981',
            order: '#F59E0B',
            info: COLORS.primary,
            warning: COLORS.warning,
            error: COLORS.error,
            success: COLORS.success,
        };
        return colors[type] || COLORS.gray[400];
    };

    const renderNotificationItem = (notification) => (
        <TouchableOpacity
            key={notification._id}
            style={[
                styles.notificationItem,
                !notification.read && styles.unreadNotification
            ]}
            onPress={() => !notification.read && handleMarkAsRead(notification._id)}
        >
            <View style={styles.notificationContent}>
                <View style={styles.notificationHeader}>
                    <View style={[
                        styles.notificationIcon,
                        { backgroundColor: getNotificationColor(notification.type) + '20' }
                    ]}>
                        <Ionicons
                            name={getNotificationIcon(notification.type)}
                            size={20}
                            color={getNotificationColor(notification.type)}
                        />
                    </View>
                    <View style={styles.notificationInfo}>
                        <Text style={styles.notificationTitle}>{notification.title}</Text>
                        <Text style={styles.notificationDate}>
                            {formatDate(notification.createdAt)}
                        </Text>
                    </View>
                    {!notification.read && <View style={styles.unreadDot} />}
                </View>
                <Text style={styles.notificationMessage}>{notification.message}</Text>
                {notification.targetAudience !== 'all' && (
                    <View style={styles.audienceBadge}>
                        <Text style={styles.audienceText}>
                            Target: {targetAudienceOptions.find(opt => opt.key === notification.targetAudience)?.label}
                        </Text>
                    </View>
                )}
            </View>
            <TouchableOpacity
                style={styles.deleteButton}
                onPress={() => handleDeleteNotification(notification._id)}
            >
                <Ionicons name="trash" size={16} color={COLORS.error} />
            </TouchableOpacity>
        </TouchableOpacity>
    );

    const renderCreateModal = () => (
        <Modal
            visible={showCreateModal}
            animationType="slide"
            presentationStyle="pageSheet"
            onRequestClose={() => setShowCreateModal(false)}
        >
            <View style={styles.modalContainer}>
                <View style={styles.modalHeader}>
                    <TouchableOpacity
                        onPress={() => setShowCreateModal(false)}
                        style={styles.modalCloseButton}
                    >
                        <Ionicons name="close" size={24} color={COLORS.dark} />
                    </TouchableOpacity>
                    <Text style={styles.modalTitle}>Create Notification</Text>
                    <TouchableOpacity
                        onPress={handleCreateNotification}
                        style={styles.modalSaveButton}
                    >
                        <Text style={styles.modalSaveText}>Send</Text>
                    </TouchableOpacity>
                </View>

                <ScrollView style={styles.modalContent}>
                    {/* Title */}
                    <View style={styles.inputGroup}>
                        <Text style={styles.inputLabel}>Title *</Text>
                        <TextInput
                            style={styles.textInput}
                            value={newNotification.title}
                            onChangeText={(text) => setNewNotification(prev => ({ ...prev, title: text }))}
                            placeholder="Notification title..."
                        />
                    </View>

                    {/* Message */}
                    <View style={styles.inputGroup}>
                        <Text style={styles.inputLabel}>Message *</Text>
                        <TextInput
                            style={[styles.textInput, styles.textArea]}
                            value={newNotification.message}
                            onChangeText={(text) => setNewNotification(prev => ({ ...prev, message: text }))}
                            placeholder="Notification message..."
                            multiline
                            numberOfLines={4}
                        />
                    </View>

                    {/* Priority */}
                    <View style={styles.inputGroup}>
                        <Text style={styles.inputLabel}>Priority</Text>
                        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                            {notificationPriorities.map((priority) => (
                                <TouchableOpacity
                                    key={priority.key}
                                    style={[
                                        styles.priorityOption,
                                        newNotification.type === priority.key && styles.priorityOptionActive,
                                        { backgroundColor: priority.color + '20' }
                                    ]}
                                    onPress={() => setNewNotification(prev => ({ ...prev, type: priority.key }))}
                                >
                                    <Text style={[
                                        styles.priorityText,
                                        { color: priority.color },
                                        newNotification.type === priority.key && styles.priorityTextActive
                                    ]}>
                                        {priority.label}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                    </View>

                    {/* Target Audience */}
                    <View style={styles.inputGroup}>
                        <Text style={styles.inputLabel}>Target Audience</Text>
                        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                            {targetAudienceOptions.map((audience) => (
                                <TouchableOpacity
                                    key={audience.key}
                                    style={[
                                        styles.audienceOption,
                                        newNotification.targetAudience === audience.key && styles.audienceOptionActive
                                    ]}
                                    onPress={() => setNewNotification(prev => ({ ...prev, targetAudience: audience.key }))}
                                >
                                    <Text style={[
                                        styles.audienceOptionText,
                                        newNotification.targetAudience === audience.key && styles.audienceOptionTextActive
                                    ]}>
                                        {audience.label}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                    </View>

                    {/* Scheduled */}
                    <View style={styles.inputGroup}>
                        <View style={styles.switchRow}>
                            <Text style={styles.inputLabel}>Schedule for later</Text>
                            <Switch
                                value={newNotification.scheduled}
                                onValueChange={(value) => setNewNotification(prev => ({ ...prev, scheduled: value }))}
                                trackColor={{ false: COLORS.gray[300], true: COLORS.primary + '40' }}
                                thumbColor={newNotification.scheduled ? COLORS.primary : COLORS.gray[400]}
                            />
                        </View>
                        {newNotification.scheduled && (
                            <TouchableOpacity style={styles.datePickerButton}>
                                <Text style={styles.datePickerText}>Select Date & Time</Text>
                                <Ionicons name="calendar" size={20} color={COLORS.primary} />
                            </TouchableOpacity>
                        )}
                    </View>
                </ScrollView>
            </View>
        </Modal>
    );

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity
                    style={styles.backButton}
                    onPress={() => navigation.goBack()}
                >
                    <Ionicons name="arrow-back" size={24} color={COLORS.dark} />
                </TouchableOpacity>
                <View style={styles.headerContent}>
                    <Text style={styles.headerTitle}>Notifications</Text>
                    <Text style={styles.headerSubtitle}>{notifications.length} total notifications</Text>
                </View>
                <TouchableOpacity
                    style={styles.markAllButton}
                    onPress={handleMarkAllAsRead}
                >
                    <Ionicons name="checkmark-done" size={20} color={COLORS.primary} />
                </TouchableOpacity>
            </View>

            {/* Tab Navigation */}
            <View style={styles.tabNavigation}>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    {notificationTypes.map((type) => (
                        <TouchableOpacity
                            key={type.key}
                            style={[
                                styles.tabButton,
                                selectedTab === type.key && styles.tabButtonActive
                            ]}
                            onPress={() => setSelectedTab(type.key)}
                        >
                            <Text style={[
                                styles.tabButtonText,
                                selectedTab === type.key && styles.tabButtonTextActive
                            ]}>
                                {type.label} ({type.count})
                            </Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            </View>

            {/* Notifications List */}
            <ScrollView
                style={styles.content}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                }
            >
                {notifications.map(renderNotificationItem)}
                
                {notifications.length === 0 && !loading && (
                    <View style={styles.emptyContainer}>
                        <Ionicons name="notifications-off" size={64} color={COLORS.gray[400]} />
                        <Text style={styles.emptyTitle}>No Notifications</Text>
                        <Text style={styles.emptyDescription}>
                            No notifications found for the selected filter.
                        </Text>
                    </View>
                )}
            </ScrollView>

            {/* Create Button */}
            <TouchableOpacity
                style={styles.createButton}
                onPress={() => setShowCreateModal(true)}
            >
                <Ionicons name="add" size={24} color={COLORS.light} />
            </TouchableOpacity>

            {renderCreateModal()}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.gray[50],
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingTop: 20,
        paddingBottom: 16,
        backgroundColor: COLORS.light,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.gray[200],
    },
    backButton: {
        marginRight: 16,
        padding: 8,
    },
    headerContent: {
        flex: 1,
    },
    headerTitle: {
        fontSize: SIZES.h3,
        fontWeight: 'bold',
        color: COLORS.dark,
    },
    headerSubtitle: {
        fontSize: SIZES.body2,
        color: COLORS.gray[600],
        marginTop: 2,
    },
    markAllButton: {
        padding: 8,
        borderRadius: 8,
        backgroundColor: COLORS.primary + '10',
    },
    tabNavigation: {
        backgroundColor: COLORS.light,
        paddingHorizontal: 20,
        paddingBottom: 16,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.gray[200],
    },
    tabButton: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        backgroundColor: COLORS.gray[100],
        marginRight: 8,
    },
    tabButtonActive: {
        backgroundColor: COLORS.primary,
    },
    tabButtonText: {
        fontSize: SIZES.body2,
        color: COLORS.gray[600],
        fontWeight: '500',
    },
    tabButtonTextActive: {
        color: COLORS.light,
        fontWeight: '600',
    },
    content: {
        flex: 1,
        padding: 20,
    },
    notificationItem: {
        backgroundColor: COLORS.light,
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        flexDirection: 'row',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    unreadNotification: {
        borderLeftWidth: 4,
        borderLeftColor: COLORS.primary,
    },
    notificationContent: {
        flex: 1,
    },
    notificationHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    notificationIcon: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    notificationInfo: {
        flex: 1,
    },
    notificationTitle: {
        fontSize: SIZES.body1,
        fontWeight: '600',
        color: COLORS.dark,
    },
    notificationDate: {
        fontSize: SIZES.body2,
        color: COLORS.gray[500],
        marginTop: 2,
    },
    unreadDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: COLORS.primary,
    },
    notificationMessage: {
        fontSize: SIZES.body1,
        color: COLORS.gray[700],
        lineHeight: 20,
    },
    audienceBadge: {
        marginTop: 8,
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 6,
        backgroundColor: COLORS.gray[100],
        alignSelf: 'flex-start',
    },
    audienceText: {
        fontSize: SIZES.body2,
        color: COLORS.gray[600],
    },
    deleteButton: {
        padding: 8,
        borderRadius: 6,
        backgroundColor: COLORS.error + '10',
        alignSelf: 'flex-start',
    },
    emptyContainer: {
        alignItems: 'center',
        paddingVertical: 60,
    },
    emptyTitle: {
        fontSize: SIZES.h4,
        fontWeight: 'bold',
        color: COLORS.gray[600],
        marginTop: 16,
    },
    emptyDescription: {
        fontSize: SIZES.body1,
        color: COLORS.gray[500],
        textAlign: 'center',
        marginTop: 8,
    },
    createButton: {
        position: 'absolute',
        bottom: 20,
        right: 20,
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: COLORS.primary,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 8,
    },
    modalContainer: {
        flex: 1,
        backgroundColor: COLORS.light,
    },
    modalHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.gray[200],
    },
    modalCloseButton: {
        padding: 8,
    },
    modalTitle: {
        flex: 1,
        fontSize: SIZES.h3,
        fontWeight: 'bold',
        color: COLORS.dark,
        textAlign: 'center',
    },
    modalSaveButton: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 8,
        backgroundColor: COLORS.primary,
    },
    modalSaveText: {
        fontSize: SIZES.body1,
        fontWeight: '600',
        color: COLORS.light,
    },
    modalContent: {
        flex: 1,
        padding: 20,
    },
    inputGroup: {
        marginBottom: 24,
    },
    inputLabel: {
        fontSize: SIZES.body1,
        fontWeight: '600',
        color: COLORS.dark,
        marginBottom: 8,
    },
    textInput: {
        borderWidth: 1,
        borderColor: COLORS.gray[300],
        borderRadius: 8,
        paddingHorizontal: 16,
        paddingVertical: 12,
        fontSize: SIZES.body1,
        color: COLORS.dark,
        backgroundColor: COLORS.light,
    },
    textArea: {
        height: 100,
        textAlignVertical: 'top',
    },
    priorityOption: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 8,
        marginRight: 8,
    },
    priorityOptionActive: {
        borderWidth: 2,
        borderColor: COLORS.primary,
    },
    priorityText: {
        fontSize: SIZES.body2,
        fontWeight: '500',
    },
    priorityTextActive: {
        fontWeight: '600',
    },
    audienceOption: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 8,
        backgroundColor: COLORS.gray[100],
        marginRight: 8,
    },
    audienceOptionActive: {
        backgroundColor: COLORS.primary,
    },
    audienceOptionText: {
        fontSize: SIZES.body2,
        color: COLORS.gray[600],
        fontWeight: '500',
    },
    audienceOptionTextActive: {
        color: COLORS.light,
        fontWeight: '600',
    },
    switchRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    datePickerButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderWidth: 1,
        borderColor: COLORS.gray[300],
        borderRadius: 8,
        paddingHorizontal: 16,
        paddingVertical: 12,
        backgroundColor: COLORS.light,
    },
    datePickerText: {
        fontSize: SIZES.body1,
        color: COLORS.gray[600],
    },
});

export default AdminNotificationsScreen;
