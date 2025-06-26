import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    ScrollView,
    StyleSheet,
    TouchableOpacity,
    Alert,
    RefreshControl,
    Modal,
    FlatList,
    TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import LandlordNavigation from '../../components/landlord/LandlordNavigation';
import { fetchFromBackend } from '../../utils/networkUtils';

const NotificationsScreen = ({ navigation }) => {
    const [notifications, setNotifications] = useState([]);
    const [filteredNotifications, setFilteredNotifications] = useState([]);
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [activeTab, setActiveTab] = useState('notifications');
    const [filterType, setFilterType] = useState('all');
    const [showMessageModal, setShowMessageModal] = useState(false);
    const [selectedConversation, setSelectedConversation] = useState(null);
    const [messageText, setMessageText] = useState('');
    const [unreadCount, setUnreadCount] = useState(0);

    const tabs = [
        { key: 'notifications', label: 'Notifications', icon: 'notifications-outline' },
        { key: 'messages', label: 'Messages', icon: 'chatbubbles-outline' },
    ];

    const notificationFilters = [
        { key: 'all', label: 'All', icon: 'list-outline' },
        { key: 'unread', label: 'Unread', icon: 'ellipse-outline' },
        { key: 'bookings', label: 'Bookings', icon: 'calendar-outline' },
        { key: 'payments', label: 'Payments', icon: 'card-outline' },
        { key: 'reviews', label: 'Reviews', icon: 'star-outline' },
    ];

    useEffect(() => {
        loadData();
    }, []);

    useEffect(() => {
        filterNotifications();
    }, [notifications, filterType]);

    const loadData = async () => {
        try {
            setLoading(true);
            
            const [notificationsRes, messagesRes] = await Promise.all([
                fetchFromBackend('/notifications'),
                fetchFromBackend('/landlord/messages')
            ]);

            if (notificationsRes.success) {
                setNotifications(notificationsRes.data);
                setUnreadCount(notificationsRes.data.filter(n => !n.isRead).length);
                console.log('✅ Notifications loaded successfully');
            }

            if (messagesRes.success) {
                setMessages(messagesRes.data);
                console.log('✅ Messages loaded successfully');
            }
        } catch (error) {
            console.error('❌ Error loading data:', error);
            Alert.alert('Error', 'Failed to load notifications and messages');
        } finally {
            setLoading(false);
        }
    };

    const onRefresh = async () => {
        setRefreshing(true);
        await loadData();
        setRefreshing(false);
    };

    const filterNotifications = () => {
        let filtered = notifications;

        switch (filterType) {
            case 'unread':
                filtered = notifications.filter(n => !n.isRead);
                break;
            case 'bookings':
                filtered = notifications.filter(n => n.type === 'booking');
                break;
            case 'payments':
                filtered = notifications.filter(n => n.type === 'payment');
                break;
            case 'reviews':
                filtered = notifications.filter(n => n.type === 'review');
                break;
            default:
                break;
        }

        setFilteredNotifications(filtered);
    };

    const markAsRead = async (notificationId) => {
        try {
            const response = await fetchFromBackend(`/notifications/${notificationId}/read`, {
                method: 'PUT',
            });

            if (response.success) {
                setNotifications(prev => prev.map(n => 
                    n.id === notificationId ? { ...n, isRead: true } : n
                ));
                setUnreadCount(prev => Math.max(0, prev - 1));
                console.log('✅ Notification marked as read');
            }
        } catch (error) {
            console.error('❌ Error marking notification as read:', error);
        }
    };

    const markAllAsRead = async () => {
        try {
            const response = await fetchFromBackend('/notifications/mark-all-read', {
                method: 'PUT',
            });

            if (response.success) {
                setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
                setUnreadCount(0);
                Alert.alert('Success', 'All notifications marked as read');
                console.log('✅ All notifications marked as read');
            } else {
                Alert.alert('Error', 'Failed to mark notifications as read');
            }
        } catch (error) {
            console.error('❌ Error marking all notifications as read:', error);
            Alert.alert('Error', 'Failed to mark notifications as read');
        }
    };

    const sendMessage = async () => {
        if (!selectedConversation || !messageText.trim()) return;

        try {
            const response = await fetchFromBackend(`/landlord/messages/${selectedConversation.id}`, {
                method: 'POST',
                body: JSON.stringify({ message: messageText.trim() }),
            });

            if (response.success) {
                setMessageText('');
                // Refresh conversation
                loadConversationMessages(selectedConversation.id);
                console.log('✅ Message sent successfully');
            } else {
                Alert.alert('Error', 'Failed to send message');
            }
        } catch (error) {
            console.error('❌ Error sending message:', error);
            Alert.alert('Error', 'Failed to send message');
        }
    };

    const loadConversationMessages = async (conversationId) => {
        try {
            const response = await fetchFromBackend(`/landlord/messages/${conversationId}`);
            
            if (response.success) {
                setSelectedConversation(prev => ({
                    ...prev,
                    messages: response.data.messages
                }));
                console.log('✅ Conversation messages loaded');
            }
        } catch (error) {
            console.error('❌ Error loading conversation messages:', error);
        }
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffInHours = (now - date) / (1000 * 60 * 60);
        
        if (diffInHours < 1) {
            return 'Just now';
        } else if (diffInHours < 24) {
            return `${Math.floor(diffInHours)}h ago`;
        } else if (diffInHours < 48) {
            return 'Yesterday';
        } else {
            return date.toLocaleDateString('en-PK', {
                month: 'short',
                day: 'numeric'
            });
        }
    };

    const getNotificationIcon = (type) => {
        switch (type) {
            case 'booking': return 'calendar-outline';
            case 'payment': return 'card-outline';
            case 'review': return 'star-outline';
            case 'maintenance': return 'construct-outline';
            case 'message': return 'chatbubble-outline';
            default: return 'notifications-outline';
        }
    };

    const getNotificationColor = (type) => {
        switch (type) {
            case 'booking': return '#4CAF50';
            case 'payment': return '#2196F3';
            case 'review': return '#FF9800';
            case 'maintenance': return '#F44336';
            case 'message': return '#9C27B0';
            default: return '#6B73FF';
        }
    };

    const renderNotificationItem = ({ item: notification }) => (
        <TouchableOpacity
            style={[
                styles.notificationCard,
                !notification.isRead && styles.unreadNotification
            ]}
            onPress={() => {
                if (!notification.isRead) {
                    markAsRead(notification.id);
                }
                // Navigate to relevant screen based on notification type
                if (notification.actionUrl) {
                    navigation.navigate(notification.actionUrl);
                }
            }}
        >
            <View style={styles.notificationHeader}>
                <View style={[
                    styles.notificationIcon,
                    { backgroundColor: getNotificationColor(notification.type) }
                ]}>
                    <Ionicons 
                        name={getNotificationIcon(notification.type)} 
                        size={20} 
                        color="#fff" 
                    />
                </View>
                <View style={styles.notificationContent}>
                    <Text style={[
                        styles.notificationTitle,
                        !notification.isRead && styles.unreadText
                    ]}>
                        {notification.title}
                    </Text>
                    <Text style={styles.notificationMessage}>
                        {notification.message}
                    </Text>
                    <Text style={styles.notificationTime}>
                        {formatDate(notification.createdAt)}
                    </Text>
                </View>
                {!notification.isRead && <View style={styles.unreadDot} />}
            </View>
        </TouchableOpacity>
    );

    const renderMessageItem = ({ item: conversation }) => (
        <TouchableOpacity
            style={styles.messageCard}
            onPress={() => {
                setSelectedConversation(conversation);
                loadConversationMessages(conversation.id);
                setShowMessageModal(true);
            }}
        >
            <View style={styles.messageHeader}>
                <View style={styles.messageAvatar}>
                    <Text style={styles.messageInitial}>
                        {conversation.guestName.charAt(0).toUpperCase()}
                    </Text>
                </View>
                <View style={styles.messageContent}>
                    <View style={styles.messageInfo}>
                        <Text style={styles.messageName}>
                            {conversation.guestName}
                        </Text>
                        <Text style={styles.messageTime}>
                            {formatDate(conversation.lastMessage.createdAt)}
                        </Text>
                    </View>
                    <Text style={styles.messagePreview} numberOfLines={2}>
                        {conversation.lastMessage.content}
                    </Text>
                    <Text style={styles.messageProperty}>
                        {conversation.propertyName}
                    </Text>
                </View>
                {conversation.unreadCount > 0 && (
                    <View style={styles.unreadBadge}>
                        <Text style={styles.unreadBadgeText}>
                            {conversation.unreadCount}
                        </Text>
                    </View>
                )}
            </View>
        </TouchableOpacity>
    );

    const renderMessageModal = () => (
        <Modal
            visible={showMessageModal}
            animationType="slide"
            presentationStyle="pageSheet"
        >
            <SafeAreaView style={styles.modalContainer}>
                <View style={styles.modalHeader}>
                    <TouchableOpacity
                        onPress={() => setShowMessageModal(false)}
                        style={styles.modalCloseButton}
                    >
                        <Ionicons name="arrow-back" size={24} color="#666" />
                    </TouchableOpacity>
                    <View style={styles.modalHeaderInfo}>
                        <Text style={styles.modalTitle}>
                            {selectedConversation?.guestName}
                        </Text>
                        <Text style={styles.modalSubtitle}>
                            {selectedConversation?.propertyName}
                        </Text>
                    </View>
                    <TouchableOpacity style={styles.callButton}>
                        <Ionicons name="call-outline" size={20} color="#6B73FF" />
                    </TouchableOpacity>
                </View>
                
                <View style={styles.messagesContainer}>
                    <ScrollView style={styles.messagesList}>
                        {selectedConversation?.messages?.map((message, index) => (
                            <View
                                key={index}
                                style={[
                                    styles.messageItem,
                                    message.isFromLandlord ? styles.sentMessage : styles.receivedMessage
                                ]}
                            >
                                <Text style={[
                                    styles.messageText,
                                    message.isFromLandlord ? styles.sentMessageText : styles.receivedMessageText
                                ]}>
                                    {message.content}
                                </Text>
                                <Text style={[
                                    styles.messageTimestamp,
                                    message.isFromLandlord ? styles.sentTimestamp : styles.receivedTimestamp
                                ]}>
                                    {formatDate(message.createdAt)}
                                </Text>
                            </View>
                        ))}
                    </ScrollView>
                    
                    <View style={styles.messageInput}>
                        <TextInput
                            style={styles.messageTextInput}
                            value={messageText}
                            onChangeText={setMessageText}
                            placeholder="Type a message..."
                            placeholderTextColor="#999"
                            multiline
                        />
                        <TouchableOpacity
                            style={[
                                styles.sendButton,
                                { opacity: messageText.trim() ? 1 : 0.5 }
                            ]}
                            onPress={sendMessage}
                            disabled={!messageText.trim()}
                        >
                            <Ionicons name="send" size={20} color="#fff" />
                        </TouchableOpacity>
                    </View>
                </View>
            </SafeAreaView>
        </Modal>
    );

    const renderNotifications = () => (
        <View style={styles.tabContent}>
            {/* Filters */}
            <View style={styles.filterSection}>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    <View style={styles.filterContainer}>
                        {notificationFilters.map(filter => (
                            <TouchableOpacity
                                key={filter.key}
                                style={[
                                    styles.filterButton,
                                    filterType === filter.key && styles.activeFilterButton
                                ]}
                                onPress={() => setFilterType(filter.key)}
                            >
                                <Ionicons 
                                    name={filter.icon} 
                                    size={16} 
                                    color={filterType === filter.key ? '#fff' : '#6B73FF'} 
                                />
                                <Text style={[
                                    styles.filterText,
                                    filterType === filter.key && styles.activeFilterText
                                ]}>
                                    {filter.label}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </ScrollView>
                
                {unreadCount > 0 && (
                    <TouchableOpacity
                        style={styles.markAllButton}
                        onPress={markAllAsRead}
                    >
                        <Text style={styles.markAllButtonText}>Mark All Read</Text>
                    </TouchableOpacity>
                )}
            </View>            {/* Notifications List */}
            <FlatList
                data={filteredNotifications}
                renderItem={renderNotificationItem}
                keyExtractor={(item) => item.id.toString()}
                showsVerticalScrollIndicator={false}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <Ionicons name="notifications-outline" size={64} color="#ccc" />
                        <Text style={styles.emptyText}>No notifications</Text>
                        <Text style={styles.emptySubText}>
                            {filterType === 'all' 
                                ? 'Notifications will appear here'
                                : 'No notifications match the selected filter'
                            }
                        </Text>
                    </View>
                }
            />
        </View>
    );    const renderMessages = () => (
        <View style={styles.tabContent}>
            <FlatList
                data={messages}
                renderItem={renderMessageItem}
                keyExtractor={(item) => item.id.toString()}
                showsVerticalScrollIndicator={false}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <Ionicons name="chatbubbles-outline" size={64} color="#ccc" />
                        <Text style={styles.emptyText}>No messages</Text>
                        <Text style={styles.emptySubText}>
                            Messages from guests will appear here
                        </Text>
                    </View>
                }
            />
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
                    <TouchableOpacity
                        onPress={() => navigation.goBack()}
                        style={styles.backButton}
                    >
                        <Ionicons name="arrow-back" size={24} color="#fff" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Notifications</Text>
                    <View style={styles.headerRight}>
                        {unreadCount > 0 && (
                            <View style={styles.unreadBadge}>
                                <Text style={styles.unreadBadgeText}>{unreadCount}</Text>
                            </View>
                        )}
                    </View>
                </View>
            </LinearGradient>

            {/* Tab Navigation */}
            <View style={styles.tabNavigation}>
                {tabs.map((tab) => (
                    <TouchableOpacity
                        key={tab.key}
                        style={[
                            styles.tab,
                            activeTab === tab.key && styles.activeTab
                        ]}
                        onPress={() => setActiveTab(tab.key)}
                    >
                        <Ionicons 
                            name={tab.icon} 
                            size={20} 
                            color={activeTab === tab.key ? '#6B73FF' : '#666'} 
                        />
                        <Text style={[
                            styles.tabText,
                            activeTab === tab.key && styles.activeTabText
                        ]}>
                            {tab.label}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>            {/* Tab Content */}
            <View style={styles.content}>
                {activeTab === 'notifications' ? renderNotifications() : renderMessages()}
            </View>

            {/* Message Modal */}
            {renderMessageModal()}

            {/* Bottom Navigation */}
            <LandlordNavigation navigation={navigation} activeRoute="notifications" />
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
    backButton: {
        padding: 8,
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#fff',
        flex: 1,
        textAlign: 'center',
        marginHorizontal: 20,
    },
    headerRight: {
        width: 40,
        alignItems: 'flex-end',
    },
    tabNavigation: {
        flexDirection: 'row',
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#e0e0e0',
    },
    tab: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 15,
        borderBottomWidth: 2,
        borderBottomColor: 'transparent',
    },
    activeTab: {
        borderBottomColor: '#6B73FF',
    },
    tabText: {
        fontSize: 16,
        color: '#666',
        marginLeft: 8,
        fontWeight: '500',
    },
    activeTabText: {
        color: '#6B73FF',
        fontWeight: '600',
    },
    content: {
        flex: 1,
    },
    tabContent: {
        padding: 20,
    },
    filterSection: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    filterContainer: {
        flexDirection: 'row',
    },
    filterButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: '#6B73FF',
        marginRight: 10,
        backgroundColor: '#fff',
    },
    activeFilterButton: {
        backgroundColor: '#6B73FF',
    },
    filterText: {
        fontSize: 14,
        color: '#6B73FF',
        marginLeft: 5,
        fontWeight: '500',
    },
    activeFilterText: {
        color: '#fff',
    },
    markAllButton: {
        backgroundColor: '#6B73FF',
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 15,
    },
    markAllButtonText: {
        color: '#fff',
        fontSize: 12,
        fontWeight: '600',
    },
    notificationCard: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 15,
        marginBottom: 12,
        elevation: 1,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 1,
    },
    unreadNotification: {
        borderLeftWidth: 4,
        borderLeftColor: '#6B73FF',
    },
    notificationHeader: {
        flexDirection: 'row',
        alignItems: 'flex-start',
    },
    notificationIcon: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 15,
    },
    notificationContent: {
        flex: 1,
    },
    notificationTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
        marginBottom: 5,
    },
    unreadText: {
        fontWeight: 'bold',
    },
    notificationMessage: {
        fontSize: 14,
        color: '#666',
        lineHeight: 20,
        marginBottom: 5,
    },
    notificationTime: {
        fontSize: 12,
        color: '#999',
    },
    unreadDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: '#6B73FF',
        marginLeft: 10,
    },
    messageCard: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 15,
        marginBottom: 12,
        elevation: 1,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 1,
    },
    messageHeader: {
        flexDirection: 'row',
        alignItems: 'flex-start',
    },
    messageAvatar: {
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: '#6B73FF',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 15,
    },
    messageInitial: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
    },
    messageContent: {
        flex: 1,
    },
    messageInfo: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 5,
    },
    messageName: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
    },
    messageTime: {
        fontSize: 12,
        color: '#999',
    },
    messagePreview: {
        fontSize: 14,
        color: '#666',
        lineHeight: 20,
        marginBottom: 5,
    },
    messageProperty: {
        fontSize: 12,
        color: '#6B73FF',
        fontWeight: '600',
    },
    unreadBadge: {
        backgroundColor: '#F44336',
        borderRadius: 10,
        minWidth: 20,
        height: 20,
        justifyContent: 'center',
        alignItems: 'center',
        marginLeft: 10,
    },
    unreadBadgeText: {
        color: '#fff',
        fontSize: 12,
        fontWeight: 'bold',
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
        textAlign: 'center',
    },
    // Message Modal Styles
    modalContainer: {
        flex: 1,
        backgroundColor: '#fff',
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#e0e0e0',
    },
    modalCloseButton: {
        padding: 5,
    },
    modalHeaderInfo: {
        flex: 1,
        alignItems: 'center',
        marginHorizontal: 20,
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
    },
    modalSubtitle: {
        fontSize: 14,
        color: '#666',
        marginTop: 2,
    },
    callButton: {
        padding: 5,
    },
    messagesContainer: {
        flex: 1,
    },
    messagesList: {
        flex: 1,
        padding: 20,
    },
    messageItem: {
        marginBottom: 15,
        maxWidth: '80%',
    },
    sentMessage: {
        alignSelf: 'flex-end',
    },
    receivedMessage: {
        alignSelf: 'flex-start',
    },
    messageText: {
        fontSize: 16,
        lineHeight: 22,
        padding: 12,
        borderRadius: 20,
    },
    sentMessageText: {
        backgroundColor: '#6B73FF',
        color: '#fff',
        borderBottomRightRadius: 5,
    },
    receivedMessageText: {
        backgroundColor: '#f0f0f0',
        color: '#333',
        borderBottomLeftRadius: 5,
    },
    messageTimestamp: {
        fontSize: 12,
        marginTop: 5,
    },
    sentTimestamp: {
        color: '#999',
        textAlign: 'right',
    },
    receivedTimestamp: {
        color: '#999',
        textAlign: 'left',
    },
    messageInput: {
        flexDirection: 'row',
        alignItems: 'flex-end',
        padding: 20,
        borderTopWidth: 1,
        borderTopColor: '#e0e0e0',
        backgroundColor: '#f8f9ff',
    },
    messageTextInput: {
        flex: 1,
        borderWidth: 1,
        borderColor: '#e0e0e0',
        borderRadius: 20,
        paddingHorizontal: 15,
        paddingVertical: 10,
        fontSize: 16,
        color: '#333',
        backgroundColor: '#fff',
        maxHeight: 100,
    },
    sendButton: {
        backgroundColor: '#6B73FF',
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        marginLeft: 10,
    },
});

export default NotificationsScreen;
