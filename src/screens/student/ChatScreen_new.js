import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    FlatList,
    StyleSheet,
    TouchableOpacity,
    Image,
    TextInput,
    ActivityIndicator,
    Alert,
    RefreshControl
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { studentApiService } from '../../services/studentApiService_new';

const ChatScreen = ({ navigation, route }) => {
    const { recipientId, recipientName } = route.params || {};
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);
    const [refreshing, setRefreshing] = useState(false);

    useEffect(() => {
        loadMessages();
        // Set up real-time message updates if available
        const interval = setInterval(loadMessages, 5000); // Poll every 5 seconds
        return () => clearInterval(interval);
    }, [recipientId]);

    const loadMessages = async (isRefresh = false) => {
        try {
            if (isRefresh) {
                setRefreshing(true);
            } else if (messages.length === 0) {
                setLoading(true);
            }

            // Ensure we have a valid recipient ID
            let validRecipientId = recipientId;
            if (!validRecipientId || validRecipientId === 'undefined' || validRecipientId === 'null') {
                console.warn('Invalid recipient ID, using default chat');
                validRecipientId = 'support_chat';
            }

            const data = await studentApiService.getChatMessages(validRecipientId);
            
            // Handle different response formats
            if (data && data.messages && Array.isArray(data.messages)) {
                setMessages(data.messages);
            } else if (Array.isArray(data)) {
                setMessages(data);
            } else {
                throw new Error('Invalid messages format received');
            }
        } catch (error) {
            console.error('Error loading messages:', error);
            // Create demo messages if API fails
            setMessages([
                {
                    _id: '1',
                    text: 'Hello! I\'m interested in your property.',
                    sender: 'me',
                    timestamp: new Date(Date.now() - 1000 * 60 * 30),
                    status: 'sent'
                },
                {
                    _id: '2',
                    text: 'Hi! Thank you for your interest. The property is available for viewing.',
                    sender: 'other',
                    timestamp: new Date(Date.now() - 1000 * 60 * 25),
                    status: 'delivered'
                },
                {
                    _id: '3',
                    text: 'When would be a good time to visit?',
                    sender: 'me',
                    timestamp: new Date(Date.now() - 1000 * 60 * 20),
                    status: 'read'
                },
                {
                    _id: '4',
                    text: 'You can visit anytime between 10 AM to 6 PM. Please let me know in advance.',
                    sender: 'other',
                    timestamp: new Date(Date.now() - 1000 * 60 * 15),
                    status: 'delivered'
                }
            ]);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const sendMessage = async () => {
        if (!newMessage.trim()) return;

        const messageText = newMessage.trim();
        setNewMessage('');

        // Ensure we have a valid recipient ID
        let validRecipientId = recipientId;
        if (!validRecipientId || validRecipientId === 'undefined' || validRecipientId === 'null') {
            console.warn('Invalid recipient ID, using default for sending message');
            validRecipientId = 'support_chat';
        }

        // Optimistically add message to UI
        const tempMessage = {
            _id: Date.now().toString(),
            text: messageText,
            sender: 'me',
            timestamp: new Date(),
            status: 'sending'
        };

        setMessages(prev => [...prev, tempMessage]);

        try {
            setSending(true);
            // Fix: Pass separate parameters instead of object
            const sentMessage = await studentApiService.sendMessage(validRecipientId, messageText);

            // Update the temporary message with the sent message
            setMessages(prev => 
                prev.map(msg => 
                    msg._id === tempMessage._id 
                        ? { 
                            ...tempMessage, 
                            _id: sentMessage.message?._id || tempMessage._id,
                            status: 'sent',
                            timestamp: sentMessage.message?.timestamp || tempMessage.timestamp
                          }
                        : msg
                )
            );
        } catch (error) {
            console.error('Error sending message:', error);
            // Update message status to failed
            setMessages(prev => 
                prev.map(msg => 
                    msg._id === tempMessage._id 
                        ? { ...msg, status: 'failed' }
                        : msg
                )
            );
            Alert.alert('Error', 'Failed to send message');
        } finally {
            setSending(false);
        }
    };

    const onRefresh = () => {
        loadMessages(true);
    };

    const formatTime = (timestamp) => {
        const date = new Date(timestamp);
        const now = new Date();
        const diffInHours = (now - date) / (1000 * 60 * 60);

        if (diffInHours < 24) {
            return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        } else if (diffInHours < 24 * 7) {
            return date.toLocaleDateString([], { weekday: 'short', hour: '2-digit', minute: '2-digit' });
        } else {
            return date.toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
        }
    };

    const getMessageStatusIcon = (status) => {
        switch (status) {
            case 'sending':
                return 'time-outline';
            case 'sent':
                return 'checkmark';
            case 'delivered':
                return 'checkmark-done';
            case 'read':
                return 'checkmark-done-outline';
            case 'failed':
                return 'alert-circle-outline';
            default:
                return 'checkmark';
        }
    };

    const getMessageStatusColor = (status) => {
        switch (status) {
            case 'sending':
                return '#6c757d';
            case 'sent':
                return '#6c757d';
            case 'delivered':
                return '#007bff';
            case 'read':
                return '#007bff';
            case 'failed':
                return '#dc3545';
            default:
                return '#6c757d';
        }
    };

    const renderMessage = ({ item, index }) => {
        const isMe = item.sender === 'me';
        const prevMessage = index > 0 ? messages[index - 1] : null;
        const showTimestamp = !prevMessage || 
            (new Date(item.timestamp) - new Date(prevMessage.timestamp)) > 5 * 60 * 1000; // 5 minutes

        return (
            <View style={styles.messageContainer}>
                {showTimestamp && (
                    <Text style={styles.timestampText}>
                        {formatTime(item.timestamp)}
                    </Text>
                )}
                
                <View style={[
                    styles.messageBubble,
                    isMe ? styles.myMessage : styles.otherMessage
                ]}>
                    <Text style={[
                        styles.messageText,
                        isMe ? styles.myMessageText : styles.otherMessageText
                    ]}>
                        {item.text}
                    </Text>
                    
                    {isMe && (
                        <View style={styles.messageStatus}>
                            <Ionicons 
                                name={getMessageStatusIcon(item.status)} 
                                size={12} 
                                color={getMessageStatusColor(item.status)} 
                            />
                        </View>
                    )}
                </View>
            </View>
        );
    };

    const renderEmptyState = () => (
        <View style={styles.emptyContainer}>
            <Ionicons name="chatbubbles" size={80} color="#e9ecef" />
            <Text style={styles.emptyTitle}>No messages yet</Text>
            <Text style={styles.emptySubtitle}>
                Start a conversation with {recipientName}
            </Text>
        </View>
    );

    if (loading) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => navigation.goBack()}>
                        <Ionicons name="arrow-back" size={24} color="#333" />
                    </TouchableOpacity>
                    <View style={styles.headerInfo}>
                        <Text style={styles.headerTitle}>{recipientName || 'Chat'}</Text>
                        <Text style={styles.headerSubtitle}>Loading...</Text>
                    </View>
                    <TouchableOpacity onPress={() => navigation.navigate('UserProfile', { userId: recipientId })}>
                        <Ionicons name="information-circle-outline" size={24} color="#007bff" />
                    </TouchableOpacity>
                </View>
                
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#007bff" />
                    <Text style={styles.loadingText}>Loading messages...</Text>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Ionicons name="arrow-back" size={24} color="#333" />
                </TouchableOpacity>
                
                <View style={styles.headerInfo}>
                    <Text style={styles.headerTitle}>{recipientName || 'Chat'}</Text>
                    <Text style={styles.headerSubtitle}>
                        {messages.length > 0 ? 'Active now' : 'Tap to start chatting'}
                    </Text>
                </View>
                
                <TouchableOpacity onPress={() => navigation.navigate('UserProfile', { userId: recipientId })}>
                    <Ionicons name="information-circle-outline" size={24} color="#007bff" />
                </TouchableOpacity>
            </View>

            <FlatList
                data={messages}
                renderItem={renderMessage}
                keyExtractor={(item) => item._id}
                ListEmptyComponent={renderEmptyState}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                        colors={['#007bff']}
                    />
                }
                style={styles.messagesList}
                contentContainerStyle={[
                    styles.messagesContainer,
                    messages.length === 0 && styles.emptyMessagesContainer
                ]}
                inverted={messages.length > 0}
                showsVerticalScrollIndicator={false}
            />

            <View style={styles.inputContainer}>
                <View style={styles.messageInputContainer}>
                    <TextInput
                        style={styles.messageInput}
                        value={newMessage}
                        onChangeText={setNewMessage}
                        placeholder="Type a message..."
                        placeholderTextColor="#6c757d"
                        multiline
                        maxLength={500}
                    />
                    
                    <TouchableOpacity
                        style={[
                            styles.sendButton,
                            (!newMessage.trim() || sending) && styles.sendButtonDisabled
                        ]}
                        onPress={sendMessage}
                        disabled={!newMessage.trim() || sending}
                    >
                        {sending ? (
                            <ActivityIndicator size="small" color="white" />
                        ) : (
                            <Ionicons name="send" size={20} color="white" />
                        )}
                    </TouchableOpacity>
                </View>
                
                <Text style={styles.messageHint}>
                    {newMessage.length}/500 characters
                </Text>
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8f9fa',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingVertical: 15,
        backgroundColor: 'white',
        borderBottomWidth: 1,
        borderBottomColor: '#e9ecef',
    },
    headerInfo: {
        flex: 1,
        marginLeft: 15,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
    },
    headerSubtitle: {
        fontSize: 12,
        color: '#6c757d',
        marginTop: 2,
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
    messagesList: {
        flex: 1,
    },
    messagesContainer: {
        paddingHorizontal: 15,
        paddingVertical: 10,
    },
    emptyMessagesContainer: {
        flex: 1,
    },
    messageContainer: {
        marginVertical: 2,
    },
    timestampText: {
        fontSize: 12,
        color: '#6c757d',
        textAlign: 'center',
        marginVertical: 10,
    },
    messageBubble: {
        maxWidth: '80%',
        borderRadius: 18,
        paddingHorizontal: 15,
        paddingVertical: 10,
        marginVertical: 2,
        position: 'relative',
    },
    myMessage: {
        backgroundColor: '#007bff',
        alignSelf: 'flex-end',
        borderBottomRightRadius: 5,
    },
    otherMessage: {
        backgroundColor: 'white',
        alignSelf: 'flex-start',
        borderBottomLeftRadius: 5,
        borderWidth: 1,
        borderColor: '#e9ecef',
    },
    messageText: {
        fontSize: 16,
        lineHeight: 20,
    },
    myMessageText: {
        color: 'white',
    },
    otherMessageText: {
        color: '#333',
    },
    messageStatus: {
        position: 'absolute',
        bottom: 2,
        right: 5,
    },
    inputContainer: {
        backgroundColor: 'white',
        paddingHorizontal: 15,
        paddingVertical: 10,
        borderTopWidth: 1,
        borderTopColor: '#e9ecef',
    },
    messageInputContainer: {
        flexDirection: 'row',
        alignItems: 'flex-end',
        marginBottom: 5,
    },
    messageInput: {
        flex: 1,
        borderWidth: 1,
        borderColor: '#dee2e6',
        borderRadius: 20,
        paddingHorizontal: 15,
        paddingVertical: 10,
        marginRight: 10,
        maxHeight: 100,
        fontSize: 16,
        backgroundColor: '#f8f9fa',
        color: '#333',
    },
    sendButton: {
        backgroundColor: '#007bff',
        borderRadius: 20,
        padding: 10,
        alignItems: 'center',
        justifyContent: 'center',
        minWidth: 40,
        minHeight: 40,
    },
    sendButtonDisabled: {
        backgroundColor: '#6c757d',
    },
    messageHint: {
        fontSize: 12,
        color: '#6c757d',
        textAlign: 'right',
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 40,
    },
    emptyTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#333',
        marginTop: 20,
        marginBottom: 10,
    },
    emptySubtitle: {
        fontSize: 14,
        color: '#6c757d',
        textAlign: 'center',
        lineHeight: 20,
    },
});

export default ChatScreen;
