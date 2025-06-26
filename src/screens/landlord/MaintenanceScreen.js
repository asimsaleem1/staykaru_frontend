import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    TextInput,
    Modal,
    Alert,
    RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SIZES } from '../../utils/constants';
import { fetchFromBackend } from '../../utils/networkUtils';

const MaintenanceScreen = ({ navigation }) => {
    const [maintenanceRequests, setMaintenanceRequests] = useState([]);
    const [loading, setLoading] = useState(false);
    const [refreshing, setRefreshing] = useState(false);
    const [filterStatus, setFilterStatus] = useState('all');
    const [filterProperty, setFilterProperty] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedRequest, setSelectedRequest] = useState(null);
    const [detailsModalVisible, setDetailsModalVisible] = useState(false);
    const [properties, setProperties] = useState([]);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setLoading(true);
        try {
            const [requestsResponse, propertiesResponse] = await Promise.all([
                fetchFromBackend('/api/landlord/maintenance'),
                fetchFromBackend('/api/accommodations/landlord')
            ]);

            if (requestsResponse?.success) {
                setMaintenanceRequests(requestsResponse.data || []);
            }

            if (propertiesResponse?.success) {
                setProperties(propertiesResponse.data || []);
            }
        } catch (error) {
            console.error('Error loading maintenance data:', error);
            Alert.alert('Error', 'Failed to load maintenance data');
        } finally {
            setLoading(false);
        }
    };

    const handleRefresh = async () => {
        setRefreshing(true);
        await loadData();
        setRefreshing(false);
    };

    const updateMaintenanceStatus = async (requestId, newStatus) => {
        try {
            const response = await fetchFromBackend(`/api/landlord/maintenance/${requestId}/status`, {
                method: 'PUT',
                body: JSON.stringify({ status: newStatus })
            });

            if (response?.success) {
                setMaintenanceRequests(prev => 
                    prev.map(request => 
                        request.id === requestId 
                            ? { ...request, status: newStatus }
                            : request
                    )
                );
                Alert.alert('Success', 'Maintenance status updated successfully');
            }
        } catch (error) {
            console.error('Error updating maintenance status:', error);
            Alert.alert('Error', 'Failed to update maintenance status');
        }
    };

    const getFilteredRequests = () => {
        return maintenanceRequests.filter(request => {
            const statusMatch = filterStatus === 'all' || request.status === filterStatus;
            const propertyMatch = filterProperty === 'all' || request.property_id === filterProperty;
            const searchMatch = searchQuery === '' || 
                request.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                request.description?.toLowerCase().includes(searchQuery.toLowerCase());
            
            return statusMatch && propertyMatch && searchMatch;
        });
    };

    const getPriorityColor = (priority) => {
        switch (priority?.toLowerCase()) {
            case 'high':
                return COLORS.error;
            case 'medium':
                return COLORS.warning;
            case 'low':
                return COLORS.success;
            default:
                return COLORS.gray;
        }
    };

    const getStatusColor = (status) => {
        switch (status?.toLowerCase()) {
            case 'open':
                return COLORS.warning;
            case 'in_progress':
                return COLORS.primary;
            case 'completed':
                return COLORS.success;
            case 'cancelled':
                return COLORS.error;
            default:
                return COLORS.gray;
        }
    };

    const renderMaintenanceCard = (request) => (
        <TouchableOpacity
            key={request.id}
            style={styles.requestCard}
            onPress={() => {
                setSelectedRequest(request);
                setDetailsModalVisible(true);
            }}
        >
            <View style={styles.requestHeader}>
                <View style={styles.requestInfo}>
                    <Text style={styles.requestTitle}>{request.title || 'Maintenance Request'}</Text>
                    <Text style={styles.propertyName}>
                        {properties.find(p => p.id === request.property_id)?.name || 'Unknown Property'}
                    </Text>
                </View>
                <View style={styles.statusContainer}>
                    <View style={[styles.priorityBadge, { backgroundColor: getPriorityColor(request.priority) }]}>
                        <Text style={styles.priorityText}>{request.priority || 'Medium'}</Text>
                    </View>
                    <View style={[styles.statusBadge, { backgroundColor: getStatusColor(request.status) }]}>
                        <Text style={styles.statusText}>{request.status || 'Open'}</Text>
                    </View>
                </View>
            </View>

            <Text style={styles.requestDescription} numberOfLines={2}>
                {request.description || 'No description provided'}
            </Text>

            <View style={styles.requestFooter}>
                <Text style={styles.requestDate}>
                    Created: {new Date(request.created_at).toLocaleDateString()}
                </Text>
                {request.estimated_cost && (
                    <Text style={styles.requestCost}>
                        Estimated: ₨{request.estimated_cost.toLocaleString()}
                    </Text>
                )}
            </View>
        </TouchableOpacity>
    );

    const renderDetailsModal = () => (
        <Modal
            visible={detailsModalVisible}
            animationType="slide"
            presentationStyle="pageSheet"
        >
            <View style={styles.modalContainer}>
                <View style={styles.modalHeader}>
                    <Text style={styles.modalTitle}>Maintenance Details</Text>
                    <TouchableOpacity
                        onPress={() => setDetailsModalVisible(false)}
                        style={styles.closeButton}
                    >
                        <Ionicons name="close" size={24} color={COLORS.dark} />
                    </TouchableOpacity>
                </View>

                <ScrollView style={styles.modalContent}>
                    {selectedRequest && (
                        <>
                            <View style={styles.detailSection}>
                                <Text style={styles.detailLabel}>Title</Text>
                                <Text style={styles.detailValue}>{selectedRequest.title}</Text>
                            </View>

                            <View style={styles.detailSection}>
                                <Text style={styles.detailLabel}>Description</Text>
                                <Text style={styles.detailValue}>{selectedRequest.description}</Text>
                            </View>

                            <View style={styles.detailRow}>
                                <View style={styles.detailHalf}>
                                    <Text style={styles.detailLabel}>Priority</Text>
                                    <View style={[styles.priorityBadge, { backgroundColor: getPriorityColor(selectedRequest.priority) }]}>
                                        <Text style={styles.priorityText}>{selectedRequest.priority}</Text>
                                    </View>
                                </View>
                                <View style={styles.detailHalf}>
                                    <Text style={styles.detailLabel}>Status</Text>
                                    <View style={[styles.statusBadge, { backgroundColor: getStatusColor(selectedRequest.status) }]}>
                                        <Text style={styles.statusText}>{selectedRequest.status}</Text>
                                    </View>
                                </View>
                            </View>

                            {selectedRequest.estimated_cost && (
                                <View style={styles.detailSection}>
                                    <Text style={styles.detailLabel}>Estimated Cost</Text>
                                    <Text style={styles.costText}>₨{selectedRequest.estimated_cost.toLocaleString()}</Text>
                                </View>
                            )}

                            <View style={styles.actionButtons}>
                                {selectedRequest.status !== 'completed' && (
                                    <>
                                        <TouchableOpacity
                                            style={[styles.actionButton, { backgroundColor: COLORS.primary }]}
                                            onPress={() => updateMaintenanceStatus(selectedRequest.id, 'in_progress')}
                                        >
                                            <Text style={styles.actionButtonText}>Mark In Progress</Text>
                                        </TouchableOpacity>
                                        
                                        <TouchableOpacity
                                            style={[styles.actionButton, { backgroundColor: COLORS.success }]}
                                            onPress={() => updateMaintenanceStatus(selectedRequest.id, 'completed')}
                                        >
                                            <Text style={styles.actionButtonText}>Mark Completed</Text>
                                        </TouchableOpacity>
                                    </>
                                )}

                                <TouchableOpacity
                                    style={[styles.actionButton, { backgroundColor: COLORS.warning }]}
                                    onPress={() => navigation.navigate('VendorManagement')}
                                >
                                    <Text style={styles.actionButtonText}>Assign Vendor</Text>
                                </TouchableOpacity>
                            </View>
                        </>
                    )}
                </ScrollView>
            </View>
        </Modal>
    );

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity
                    onPress={() => navigation.goBack()}
                    style={styles.backButton}
                >
                    <Ionicons name="arrow-back" size={24} color={COLORS.white} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Maintenance</Text>
                <TouchableOpacity
                    onPress={() => Alert.alert('Coming Soon', 'Add maintenance request feature')}
                    style={styles.addButton}
                >
                    <Ionicons name="add" size={24} color={COLORS.white} />
                </TouchableOpacity>
            </View>

            <View style={styles.filtersContainer}>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    <TouchableOpacity
                        style={[styles.filterButton, filterStatus === 'all' && styles.activeFilter]}
                        onPress={() => setFilterStatus('all')}
                    >
                        <Text style={[styles.filterText, filterStatus === 'all' && styles.activeFilterText]}>All</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.filterButton, filterStatus === 'open' && styles.activeFilter]}
                        onPress={() => setFilterStatus('open')}
                    >
                        <Text style={[styles.filterText, filterStatus === 'open' && styles.activeFilterText]}>Open</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.filterButton, filterStatus === 'in_progress' && styles.activeFilter]}
                        onPress={() => setFilterStatus('in_progress')}
                    >
                        <Text style={[styles.filterText, filterStatus === 'in_progress' && styles.activeFilterText]}>In Progress</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.filterButton, filterStatus === 'completed' && styles.activeFilter]}
                        onPress={() => setFilterStatus('completed')}
                    >
                        <Text style={[styles.filterText, filterStatus === 'completed' && styles.activeFilterText]}>Completed</Text>
                    </TouchableOpacity>
                </ScrollView>
            </View>

            <View style={styles.searchContainer}>
                <Ionicons name="search" size={20} color={COLORS.gray} style={styles.searchIcon} />
                <TextInput
                    style={styles.searchInput}
                    placeholder="Search maintenance requests..."
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                    placeholderTextColor={COLORS.gray}
                />
            </View>

            <ScrollView
                style={styles.content}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
                }
            >
                {getFilteredRequests().map(renderMaintenanceCard)}
                
                {getFilteredRequests().length === 0 && (
                    <View style={styles.emptyState}>
                        <Ionicons name="construct-outline" size={64} color={COLORS.gray} />
                        <Text style={styles.emptyTitle}>No Maintenance Requests</Text>
                        <Text style={styles.emptyDescription}>
                            No maintenance requests match your current filters
                        </Text>
                    </View>
                )}
            </ScrollView>

            {renderDetailsModal()}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    header: {
        backgroundColor: COLORS.primary,
        paddingTop: 50,
        paddingBottom: 20,
        paddingHorizontal: 20,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    backButton: {
        padding: 8,
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: COLORS.white,
        flex: 1,
        textAlign: 'center',
    },
    addButton: {
        padding: 8,
        backgroundColor: 'rgba(255,255,255,0.2)',
        borderRadius: 20,
    },
    filtersContainer: {
        paddingVertical: 15,
        paddingHorizontal: 20,
        backgroundColor: COLORS.white,
    },
    filterButton: {
        paddingHorizontal: 20,
        paddingVertical: 8,
        borderRadius: 20,
        backgroundColor: COLORS.lightGray,
        marginRight: 10,
    },
    activeFilter: {
        backgroundColor: COLORS.primary,
    },
    filterText: {
        color: COLORS.dark,
        fontWeight: '500',
    },
    activeFilterText: {
        color: COLORS.white,
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.white,
        marginHorizontal: 20,
        marginBottom: 20,
        paddingHorizontal: 15,
        borderRadius: 25,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    searchIcon: {
        marginRight: 10,
    },
    searchInput: {
        flex: 1,
        paddingVertical: 12,
        fontSize: 16,
        color: COLORS.dark,
    },
    content: {
        flex: 1,
        paddingHorizontal: 20,
    },
    requestCard: {
        backgroundColor: COLORS.white,
        borderRadius: 12,
        padding: 15,
        marginBottom: 15,
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    requestHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 10,
    },
    requestInfo: {
        flex: 1,
        marginRight: 10,
    },
    requestTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: COLORS.dark,
        marginBottom: 5,
    },
    propertyName: {
        fontSize: 14,
        color: COLORS.gray,
    },
    statusContainer: {
        alignItems: 'flex-end',
    },
    priorityBadge: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 10,
        marginBottom: 5,
    },
    priorityText: {
        color: COLORS.white,
        fontSize: 12,
        fontWeight: 'bold',
    },
    statusBadge: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 10,
    },
    statusText: {
        color: COLORS.white,
        fontSize: 12,
        fontWeight: 'bold',
    },
    requestDescription: {
        fontSize: 14,
        color: COLORS.dark,
        marginBottom: 10,
        lineHeight: 20,
    },
    requestFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    requestDate: {
        fontSize: 12,
        color: COLORS.gray,
    },
    requestCost: {
        fontSize: 14,
        color: COLORS.primary,
        fontWeight: 'bold',
    },
    emptyState: {
        alignItems: 'center',
        paddingVertical: 50,
    },
    emptyTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: COLORS.dark,
        marginTop: 15,
        marginBottom: 5,
    },
    emptyDescription: {
        fontSize: 14,
        color: COLORS.gray,
        textAlign: 'center',
    },
    modalContainer: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    modalHeader: {
        backgroundColor: COLORS.primary,
        paddingTop: 50,
        paddingBottom: 20,
        paddingHorizontal: 20,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: COLORS.white,
        flex: 1,
        textAlign: 'center',
    },
    closeButton: {
        padding: 8,
        backgroundColor: 'rgba(255,255,255,0.2)',
        borderRadius: 20,
    },
    modalContent: {
        flex: 1,
        padding: 20,
    },
    detailSection: {
        marginBottom: 20,
    },
    detailLabel: {
        fontSize: 14,
        color: COLORS.gray,
        marginBottom: 5,
        fontWeight: '500',
    },
    detailValue: {
        fontSize: 16,
        color: COLORS.dark,
        lineHeight: 22,
    },
    detailRow: {
        flexDirection: 'row',
        marginBottom: 20,
    },
    detailHalf: {
        flex: 1,
        marginRight: 10,
    },
    costText: {
        fontSize: 20,
        color: COLORS.primary,
        fontWeight: 'bold',
    },
    actionButtons: {
        marginTop: 20,
    },
    actionButton: {
        paddingVertical: 15,
        borderRadius: 10,
        alignItems: 'center',
        marginBottom: 10,
    },
    actionButtonText: {
        color: COLORS.white,
        fontSize: 16,
        fontWeight: 'bold',
    },
});

export default MaintenanceScreen;
