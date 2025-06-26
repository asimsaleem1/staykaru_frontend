import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Image,
    Alert,
    ActivityIndicator,
    Modal,
    TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SIZES } from '../../utils/constants';
import adminApiService from '../../services/adminApiService';

const AdminContentModerationScreen = ({ navigation }) => {
    const [moderationQueue, setModerationQueue] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedFilter, setSelectedFilter] = useState('pending');
    const [selectedItem, setSelectedItem] = useState(null);
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [showRejectModal, setShowRejectModal] = useState(false);
    const [rejectReason, setRejectReason] = useState('');
    const [autoModerationEnabled, setAutoModerationEnabled] = useState(true);

    useEffect(() => {
        loadModerationQueue();
    }, [selectedFilter]);

    const loadModerationQueue = async () => {
        try {
            setLoading(true);
            const response = await adminApiService.getModerationQueue({
                status: selectedFilter !== 'all' ? selectedFilter : undefined
            });
            
            if (response.success) {
                setModerationQueue(response.data.items || []);
            }
        } catch (error) {
            console.error('Error loading moderation queue:', error);
            Alert.alert('Error', 'Failed to load moderation queue');
        } finally {
            setLoading(false);
        }
    };

    const handleApprove = async (itemId) => {
        try {
            await adminApiService.moderateContent(itemId, { action: 'approve' });
            Alert.alert('Success', 'Content approved successfully');
            loadModerationQueue();
        } catch (error) {
            Alert.alert('Error', 'Failed to approve content');
        }
    };

    const handleReject = async (itemId, reason) => {
        try {
            await adminApiService.moderateContent(itemId, { 
                action: 'reject',
                reason: reason 
            });
            Alert.alert('Success', 'Content rejected successfully');
            setShowRejectModal(false);
            setRejectReason('');
            loadModerationQueue();
        } catch (error) {
            Alert.alert('Error', 'Failed to reject content');
        }
    };

    const handleAutoModeration = async (enabled) => {
        try {
            await adminApiService.updateAutoModeration({ enabled });
            setAutoModerationEnabled(enabled);
            Alert.alert('Success', `Auto-moderation ${enabled ? 'enabled' : 'disabled'}`);
        } catch (error) {
            Alert.alert('Error', 'Failed to update auto-moderation settings');
        }
    };

    const getContentTypeIcon = (type) => {
        const icons = {
            listing: 'home',
            review: 'star',
            message: 'chatbubble',
            profile: 'person',
            image: 'image',
        };
        return icons[type] || 'document';
    };

    const getStatusColor = (status) => {
        const colors = {
            pending: '#F59E0B',
            approved: '#10B981',
            rejected: '#EF4444',
            flagged: '#8B5CF6',
        };
        return colors[status] || '#6B7280';
    };

    const getPriorityColor = (priority) => {
        const colors = {
            high: '#EF4444',
            medium: '#F59E0B',
            low: '#10B981',
        };
        return colors[priority] || '#6B7280';
    };

    const formatTimeAgo = (dateString) => {
        const now = new Date();
        const date = new Date(dateString);
        const diffInMinutes = Math.floor((now - date) / (1000 * 60));
        
        if (diffInMinutes < 1) return 'Just now';
        if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
        if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
        return `${Math.floor(diffInMinutes / 1440)}d ago`;
    };

    const renderModerationItem = (item) => (
        <TouchableOpacity
            key={item.id}
            style={styles.moderationItem}
            onPress={() => {
                setSelectedItem(item);
                setShowDetailModal(true);
            }}
        >
            <View style={styles.itemHeader}>
                <View style={styles.itemType}>
                    <Ionicons 
                        name={getContentTypeIcon(item.type)} 
                        size={16} 
                        color={COLORS.gray[600]} 
                    />
                    <Text style={styles.itemTypeText}>
                        {item.type.toUpperCase()}
                    </Text>
                </View>
                
                <View style={styles.itemBadges}>
                    <View style={[styles.priorityBadge, { backgroundColor: getPriorityColor(item.priority) + '20' }]}>
                        <Text style={[styles.priorityText, { color: getPriorityColor(item.priority) }]}>
                            {item.priority}
                        </Text>
                    </View>
                    
                    <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) + '20' }]}>
                        <Text style={[styles.statusText, { color: getStatusColor(item.status) }]}>
                            {item.status}
                        </Text>
                    </View>
                </View>
            </View>

            <Text style={styles.itemTitle} numberOfLines={2}>
                {item.title || item.content}
            </Text>

            <View style={styles.itemMeta}>
                <Text style={styles.itemUser}>By {item.user?.name}</Text>
                <Text style={styles.itemTime}>{formatTimeAgo(item.createdAt)}</Text>
            </View>

            {item.flagReason && (
                <View style={styles.flagReason}>
                    <Ionicons name="flag" size={14} color="#EF4444" />
                    <Text style={styles.flagReasonText}>{item.flagReason}</Text>
                </View>
            )}

            {item.aiScore && (
                <View style={styles.aiScoreContainer}>
                    <Text style={styles.aiScoreLabel}>AI Score:</Text>
                    <View style={[
                        styles.aiScoreBar,
                        { backgroundColor: item.aiScore > 0.7 ? '#EF4444' : item.aiScore > 0.4 ? '#F59E0B' : '#10B981' }
                    ]}>
                        <Text style={styles.aiScoreText}>{Math.round(item.aiScore * 100)}%</Text>
                    </View>
                </View>
            )}

            <View style={styles.quickActions}>
                <TouchableOpacity
                    style={[styles.quickActionButton, styles.approveButton]}
                    onPress={() => handleApprove(item.id)}
                >
                    <Ionicons name="checkmark" size={16} color="#10B981" />
                    <Text style={[styles.quickActionText, { color: '#10B981' }]}>Approve</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.quickActionButton, styles.rejectButton]}
                    onPress={() => {
                        setSelectedItem(item);
                        setShowRejectModal(true);
                    }}
                >
                    <Ionicons name="close" size={16} color="#EF4444" />
                    <Text style={[styles.quickActionText, { color: '#EF4444' }]}>Reject</Text>
                </TouchableOpacity>
            </View>
        </TouchableOpacity>
    );

    const renderDetailModal = () => (
        <Modal
            visible={showDetailModal}
            animationType="slide"
            transparent={true}
            onRequestClose={() => setShowDetailModal(false)}
        >
            <View style={styles.modalOverlay}>
                <View style={styles.modalContainer}>
                    <View style={styles.modalHeader}>
                        <Text style={styles.modalTitle}>Content Details</Text>
                        <TouchableOpacity onPress={() => setShowDetailModal(false)}>
                            <Ionicons name="close" size={24} color={COLORS.gray[600]} />
                        </TouchableOpacity>
                    </View>
                    
                    {selectedItem && (
                        <ScrollView style={styles.modalContent}>
                            <View style={styles.contentPreview}>
                                <Text style={styles.contentTitle}>{selectedItem.title}</Text>
                                <Text style={styles.contentText}>{selectedItem.content}</Text>
                                
                                {selectedItem.images && selectedItem.images.length > 0 && (
                                    <ScrollView horizontal style={styles.imagePreview}>
                                        {selectedItem.images.map((image, index) => (
                                            <Image
                                                key={index}
                                                source={{ uri: image }}
                                                style={styles.previewImage}
                                            />
                                        ))}
                                    </ScrollView>
                                )}
                            </View>

                            <View style={styles.contentMeta}>
                                <View style={styles.metaRow}>
                                    <Text style={styles.metaLabel}>User:</Text>
                                    <Text style={styles.metaValue}>{selectedItem.user?.name}</Text>
                                </View>
                                <View style={styles.metaRow}>
                                    <Text style={styles.metaLabel}>Type:</Text>
                                    <Text style={styles.metaValue}>{selectedItem.type}</Text>
                                </View>
                                <View style={styles.metaRow}>
                                    <Text style={styles.metaLabel}>Created:</Text>
                                    <Text style={styles.metaValue}>
                                        {new Date(selectedItem.createdAt).toLocaleString()}
                                    </Text>
                                </View>
                                {selectedItem.aiScore && (
                                    <View style={styles.metaRow}>
                                        <Text style={styles.metaLabel}>AI Risk Score:</Text>
                                        <Text style={styles.metaValue}>
                                            {Math.round(selectedItem.aiScore * 100)}%
                                        </Text>
                                    </View>
                                )}
                            </View>

                            <View style={styles.modalActions}>
                                <TouchableOpacity
                                    style={[styles.modalActionButton, styles.modalApproveButton]}
                                    onPress={() => {
                                        handleApprove(selectedItem.id);
                                        setShowDetailModal(false);
                                    }}
                                >
                                    <Text style={styles.modalActionText}>Approve</Text>
                                </TouchableOpacity>

                                <TouchableOpacity
                                    style={[styles.modalActionButton, styles.modalRejectButton]}
                                    onPress={() => {
                                        setShowDetailModal(false);
                                        setShowRejectModal(true);
                                    }}
                                >
                                    <Text style={styles.modalActionText}>Reject</Text>
                                </TouchableOpacity>
                            </View>
                        </ScrollView>
                    )}
                </View>
            </View>
        </Modal>
    );

    const renderRejectModal = () => (
        <Modal
            visible={showRejectModal}
            animationType="slide"
            transparent={true}
            onRequestClose={() => setShowRejectModal(false)}
        >
            <View style={styles.modalOverlay}>
                <View style={styles.rejectModalContainer}>
                    <View style={styles.modalHeader}>
                        <Text style={styles.modalTitle}>Reject Content</Text>
                        <TouchableOpacity onPress={() => setShowRejectModal(false)}>
                            <Ionicons name="close" size={24} color={COLORS.gray[600]} />
                        </TouchableOpacity>
                    </View>
                    
                    <View style={styles.modalContent}>
                        <Text style={styles.rejectLabel}>Reason for rejection:</Text>
                        <TextInput
                            style={styles.rejectInput}
                            placeholder="Enter reason for rejection..."
                            value={rejectReason}
                            onChangeText={setRejectReason}
                            multiline
                            numberOfLines={4}
                            textAlignVertical="top"
                        />

                        <View style={styles.quickReasons}>
                            {[
                                'Inappropriate content',
                                'Spam or misleading',
                                'Copyright violation',
                                'Incorrect information',
                                'Policy violation'
                            ].map((reason) => (
                                <TouchableOpacity
                                    key={reason}
                                    style={styles.quickReasonButton}
                                    onPress={() => setRejectReason(reason)}
                                >
                                    <Text style={styles.quickReasonText}>{reason}</Text>
                                </TouchableOpacity>
                            ))}
                        </View>

                        <TouchableOpacity
                            style={[
                                styles.submitRejectButton,
                                !rejectReason.trim() && styles.submitRejectButtonDisabled
                            ]}
                            onPress={() => selectedItem && handleReject(selectedItem.id, rejectReason)}
                            disabled={!rejectReason.trim()}
                        >
                            <Text style={styles.submitRejectButtonText}>Reject Content</Text>
                        </TouchableOpacity>
                    </View>
                </View>
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
                    <Text style={styles.headerTitle}>Content Moderation</Text>
                    <Text style={styles.headerSubtitle}>
                        {moderationQueue.length} items in queue
                    </Text>
                </View>
                <TouchableOpacity
                    style={[
                        styles.autoModerationToggle,
                        autoModerationEnabled && styles.autoModerationToggleActive
                    ]}
                    onPress={() => handleAutoModeration(!autoModerationEnabled)}
                >
                    <Ionicons 
                        name={autoModerationEnabled ? "shield-checkmark" : "shield"} 
                        size={20} 
                        color={autoModerationEnabled ? COLORS.light : COLORS.gray[600]} 
                    />
                </TouchableOpacity>
            </View>

            {/* Filter Tabs */}
            <View style={styles.filtersContainer}>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterTabs}>
                    {['all', 'pending', 'flagged', 'approved', 'rejected'].map((filter) => (
                        <TouchableOpacity
                            key={filter}
                            style={[styles.filterTab, selectedFilter === filter && styles.filterTabActive]}
                            onPress={() => setSelectedFilter(filter)}
                        >
                            <Text style={[
                                styles.filterTabText,
                                selectedFilter === filter && styles.filterTabTextActive
                            ]}>
                                {filter.toUpperCase()}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            </View>

            {/* Moderation Queue */}
            <ScrollView style={styles.queueContainer} showsVerticalScrollIndicator={false}>
                {loading ? (
                    <View style={styles.loadingContainer}>
                        <ActivityIndicator size="large" color={COLORS.primary} />
                        <Text style={styles.loadingText}>Loading moderation queue...</Text>
                    </View>
                ) : moderationQueue.length === 0 ? (
                    <View style={styles.emptyContainer}>
                        <Ionicons name="checkmark-circle" size={64} color={COLORS.gray[400]} />
                        <Text style={styles.emptyTitle}>Queue is empty</Text>
                        <Text style={styles.emptySubtitle}>
                            No content requires moderation at this time
                        </Text>
                    </View>
                ) : (
                    moderationQueue.map(renderModerationItem)
                )}
            </ScrollView>

            {renderDetailModal()}
            {renderRejectModal()}
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
    autoModerationToggle: {
        padding: 12,
        borderRadius: 12,
        backgroundColor: COLORS.gray[100],
        borderWidth: 1,
        borderColor: COLORS.gray[200],
    },
    autoModerationToggleActive: {
        backgroundColor: COLORS.primary,
        borderColor: COLORS.primary,
    },
    filtersContainer: {
        backgroundColor: COLORS.light,
        paddingHorizontal: 20,
        paddingBottom: 16,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.gray[200],
    },
    filterTabs: {
        flexDirection: 'row',
    },
    filterTab: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        backgroundColor: COLORS.gray[100],
        marginRight: 8,
    },
    filterTabActive: {
        backgroundColor: COLORS.primary,
    },
    filterTabText: {
        fontSize: SIZES.body2,
        color: COLORS.gray[600],
        fontWeight: '500',
    },
    filterTabTextActive: {
        color: COLORS.light,
        fontWeight: '600',
    },
    queueContainer: {
        flex: 1,
        padding: 20,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 60,
    },
    loadingText: {
        fontSize: SIZES.body1,
        color: COLORS.gray[600],
        marginTop: 16,
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 60,
    },
    emptyTitle: {
        fontSize: SIZES.h3,
        fontWeight: 'bold',
        color: COLORS.gray[700],
        marginTop: 16,
    },
    emptySubtitle: {
        fontSize: SIZES.body1,
        color: COLORS.gray[500],
        textAlign: 'center',
        marginTop: 8,
        maxWidth: 250,
    },
    moderationItem: {
        backgroundColor: COLORS.light,
        borderRadius: 16,
        padding: 16,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: COLORS.gray[200],
    },
    itemHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    itemType: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    itemTypeText: {
        fontSize: SIZES.body3,
        color: COLORS.gray[600],
        fontWeight: '600',
        marginLeft: 6,
    },
    itemBadges: {
        flexDirection: 'row',
        gap: 8,
    },
    priorityBadge: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
    },
    priorityText: {
        fontSize: SIZES.body3,
        fontWeight: '600',
        textTransform: 'uppercase',
    },
    statusBadge: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
    },
    statusText: {
        fontSize: SIZES.body3,
        fontWeight: '600',
        textTransform: 'uppercase',
    },
    itemTitle: {
        fontSize: SIZES.body1,
        fontWeight: '600',
        color: COLORS.dark,
        marginBottom: 8,
    },
    itemMeta: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    itemUser: {
        fontSize: SIZES.body2,
        color: COLORS.gray[600],
    },
    itemTime: {
        fontSize: SIZES.body3,
        color: COLORS.gray[500],
    },
    flagReason: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FEF2F2',
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 8,
        marginBottom: 12,
    },
    flagReasonText: {
        fontSize: SIZES.body3,
        color: '#DC2626',
        marginLeft: 6,
        fontWeight: '500',
    },
    aiScoreContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    aiScoreLabel: {
        fontSize: SIZES.body3,
        color: COLORS.gray[600],
        marginRight: 8,
    },
    aiScoreBar: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
    },
    aiScoreText: {
        fontSize: SIZES.body3,
        color: COLORS.light,
        fontWeight: '600',
    },
    quickActions: {
        flexDirection: 'row',
        gap: 12,
    },
    quickActionButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 12,
        borderRadius: 12,
        borderWidth: 1,
    },
    approveButton: {
        backgroundColor: '#F0FDF4',
        borderColor: '#10B981',
    },
    rejectButton: {
        backgroundColor: '#FEF2F2',
        borderColor: '#EF4444',
    },
    quickActionText: {
        fontSize: SIZES.body2,
        fontWeight: '600',
        marginLeft: 6,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    modalContainer: {
        backgroundColor: COLORS.light,
        borderRadius: 16,
        width: '100%',
        maxHeight: '80%',
    },
    rejectModalContainer: {
        backgroundColor: COLORS.light,
        borderRadius: 16,
        width: '100%',
        maxHeight: '70%',
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 20,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.gray[200],
    },
    modalTitle: {
        fontSize: SIZES.h3,
        fontWeight: 'bold',
        color: COLORS.dark,
    },
    modalContent: {
        padding: 20,
    },
    contentPreview: {
        marginBottom: 20,
    },
    contentTitle: {
        fontSize: SIZES.h4,
        fontWeight: 'bold',
        color: COLORS.dark,
        marginBottom: 8,
    },
    contentText: {
        fontSize: SIZES.body1,
        color: COLORS.gray[700],
        lineHeight: 24,
        marginBottom: 16,
    },
    imagePreview: {
        flexDirection: 'row',
        marginVertical: 12,
    },
    previewImage: {
        width: 80,
        height: 80,
        borderRadius: 8,
        marginRight: 8,
    },
    contentMeta: {
        backgroundColor: COLORS.gray[50],
        borderRadius: 12,
        padding: 16,
        marginBottom: 20,
    },
    metaRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 8,
    },
    metaLabel: {
        fontSize: SIZES.body2,
        color: COLORS.gray[600],
        fontWeight: '500',
    },
    metaValue: {
        fontSize: SIZES.body2,
        color: COLORS.dark,
        fontWeight: '600',
    },
    modalActions: {
        flexDirection: 'row',
        gap: 12,
    },
    modalActionButton: {
        flex: 1,
        paddingVertical: 16,
        borderRadius: 12,
        alignItems: 'center',
    },
    modalApproveButton: {
        backgroundColor: '#10B981',
    },
    modalRejectButton: {
        backgroundColor: '#EF4444',
    },
    modalActionText: {
        fontSize: SIZES.body1,
        fontWeight: '600',
        color: COLORS.light,
    },
    rejectLabel: {
        fontSize: SIZES.body1,
        fontWeight: '600',
        color: COLORS.dark,
        marginBottom: 12,
    },
    rejectInput: {
        borderWidth: 1,
        borderColor: COLORS.gray[300],
        borderRadius: 12,
        padding: 16,
        fontSize: SIZES.body1,
        color: COLORS.dark,
        marginBottom: 16,
        minHeight: 100,
    },
    quickReasons: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
        marginBottom: 20,
    },
    quickReasonButton: {
        paddingHorizontal: 12,
        paddingVertical: 8,
        backgroundColor: COLORS.gray[100],
        borderRadius: 20,
        borderWidth: 1,
        borderColor: COLORS.gray[200],
    },
    quickReasonText: {
        fontSize: SIZES.body3,
        color: COLORS.gray[700],
    },
    submitRejectButton: {
        backgroundColor: '#EF4444',
        paddingVertical: 16,
        borderRadius: 12,
        alignItems: 'center',
    },
    submitRejectButtonDisabled: {
        backgroundColor: COLORS.gray[300],
    },
    submitRejectButtonText: {
        fontSize: SIZES.body1,
        fontWeight: '600',
        color: COLORS.light,
    },
});

export default AdminContentModerationScreen;
