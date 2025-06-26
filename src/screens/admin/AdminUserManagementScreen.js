import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    TextInput,
    Alert,
    ActivityIndicator,
    Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SIZES } from '../../utils/constants';
import adminApiService from '../../services/adminApiService';
import DataTable from '../../components/admin/DataTable';

const AdminUserManagementScreen = ({ navigation }) => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedRole, setSelectedRole] = useState('all');
    const [selectedStatus, setSelectedStatus] = useState('all');
    const [sortColumn, setSortColumn] = useState('createdAt');
    const [sortDirection, setSortDirection] = useState('desc');
    const [selectedUsers, setSelectedUsers] = useState([]);
    const [showBulkModal, setShowBulkModal] = useState(false);
    const [showUserModal, setShowUserModal] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);

    useEffect(() => {
        loadUsers();
    }, [selectedRole, selectedStatus, sortColumn, sortDirection]);

    const loadUsers = async () => {
        try {
            setLoading(true);
            const filters = {
                role: selectedRole !== 'all' ? selectedRole : undefined,
                status: selectedStatus !== 'all' ? selectedStatus : undefined,
                search: searchQuery || undefined,
                sortBy: sortColumn,
                sortOrder: sortDirection,
            };

            const response = await adminApiService.getUsers(filters);
            if (response.success) {
                setUsers(response.data.users || []);
            }
        } catch (error) {
            console.error('Error loading users:', error);
            Alert.alert('Error', 'Failed to load users');
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = (query) => {
        setSearchQuery(query);
        // Debounce search
        setTimeout(() => {
            loadUsers();
        }, 500);
    };

    const handleSort = (column, direction) => {
        setSortColumn(column);
        setSortDirection(direction);
    };

    const handleUserPress = (user) => {
        setSelectedUser(user);
        setShowUserModal(true);
    };

    const handleUpdateUser = async (userId, updates) => {
        try {
            await adminApiService.updateUser(userId, updates);
            Alert.alert('Success', 'User updated successfully');
            loadUsers();
            setShowUserModal(false);
        } catch (error) {
            Alert.alert('Error', 'Failed to update user');
        }
    };

    const handleBulkUpdate = async (updates) => {
        try {
            await adminApiService.bulkUpdateUsers(selectedUsers, updates);
            Alert.alert('Success', `${selectedUsers.length} users updated successfully`);
            setSelectedUsers([]);
            setShowBulkModal(false);
            loadUsers();
        } catch (error) {
            Alert.alert('Error', 'Failed to update users');
        }
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString();
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

    const getRoleColor = (role) => {
        const colors = {
            student: '#3B82F6',
            landlord: '#10B981',
            food_provider: '#F59E0B',
            admin: '#8B5CF6'
        };
        return colors[role] || '#6B7280';
    };

    const getStatusColor = (status) => {
        const colors = {
            active: '#10B981',
            inactive: '#6B7280',
            suspended: '#EF4444',
            pending: '#F59E0B'
        };
        return colors[status] || '#6B7280';
    };

    const renderUserModal = () => (
        <Modal
            visible={showUserModal}
            animationType="slide"
            transparent={true}
            onRequestClose={() => setShowUserModal(false)}
        >
            <View style={styles.modalOverlay}>
                <View style={styles.modalContainer}>
                    <View style={styles.modalHeader}>
                        <Text style={styles.modalTitle}>Edit User</Text>
                        <TouchableOpacity onPress={() => setShowUserModal(false)}>
                            <Ionicons name="close" size={24} color={COLORS.gray[600]} />
                        </TouchableOpacity>
                    </View>
                    
                    {selectedUser && (
                        <ScrollView style={styles.modalContent}>
                            <View style={styles.userInfo}>
                                <Text style={styles.userName}>{selectedUser.name}</Text>
                                <Text style={styles.userEmail}>{selectedUser.email}</Text>
                            </View>

                            <View style={styles.formSection}>
                                <Text style={styles.sectionTitle}>Role</Text>
                                <View style={styles.buttonGroup}>
                                    {['student', 'landlord', 'food_provider'].map((role) => (
                                        <TouchableOpacity
                                            key={role}
                                            style={[
                                                styles.roleButton,
                                                selectedUser.role === role && styles.roleButtonActive
                                            ]}
                                            onPress={() => setSelectedUser({...selectedUser, role})}
                                        >
                                            <Text style={[
                                                styles.roleButtonText,
                                                selectedUser.role === role && styles.roleButtonTextActive
                                            ]}>
                                                {role.replace('_', ' ').toUpperCase()}
                                            </Text>
                                        </TouchableOpacity>
                                    ))}
                                </View>
                            </View>

                            <View style={styles.formSection}>
                                <Text style={styles.sectionTitle}>Status</Text>
                                <View style={styles.buttonGroup}>
                                    {['active', 'inactive', 'suspended'].map((status) => (
                                        <TouchableOpacity
                                            key={status}
                                            style={[
                                                styles.statusButton,
                                                selectedUser.status === status && styles.statusButtonActive
                                            ]}
                                            onPress={() => setSelectedUser({...selectedUser, status})}
                                        >
                                            <Text style={[
                                                styles.statusButtonText,
                                                selectedUser.status === status && styles.statusButtonTextActive
                                            ]}>
                                                {status.toUpperCase()}
                                            </Text>
                                        </TouchableOpacity>
                                    ))}
                                </View>
                            </View>

                            <TouchableOpacity
                                style={styles.saveButton}
                                onPress={() => handleUpdateUser(selectedUser.id, {
                                    role: selectedUser.role,
                                    status: selectedUser.status
                                })}
                            >
                                <Text style={styles.saveButtonText}>Save Changes</Text>
                            </TouchableOpacity>
                        </ScrollView>
                    )}
                </View>
            </View>
        </Modal>
    );

    const renderBulkModal = () => (
        <Modal
            visible={showBulkModal}
            animationType="slide"
            transparent={true}
            onRequestClose={() => setShowBulkModal(false)}
        >
            <View style={styles.modalOverlay}>
                <View style={styles.modalContainer}>
                    <View style={styles.modalHeader}>
                        <Text style={styles.modalTitle}>Bulk Actions</Text>
                        <TouchableOpacity onPress={() => setShowBulkModal(false)}>
                            <Ionicons name="close" size={24} color={COLORS.gray[600]} />
                        </TouchableOpacity>
                    </View>
                    
                    <View style={styles.modalContent}>
                        <Text style={styles.bulkText}>
                            {selectedUsers.length} users selected
                        </Text>

                        <View style={styles.bulkActions}>
                            <TouchableOpacity
                                style={styles.bulkActionButton}
                                onPress={() => handleBulkUpdate({ status: 'active' })}
                            >
                                <Ionicons name="checkmark-circle" size={20} color="#10B981" />
                                <Text style={styles.bulkActionText}>Activate Users</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={styles.bulkActionButton}
                                onPress={() => handleBulkUpdate({ status: 'suspended' })}
                            >
                                <Ionicons name="ban" size={20} color="#EF4444" />
                                <Text style={styles.bulkActionText}>Suspend Users</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={styles.bulkActionButton}
                                onPress={() => handleBulkUpdate({ role: 'student' })}
                            >
                                <Ionicons name="school" size={20} color="#3B82F6" />
                                <Text style={styles.bulkActionText}>Set as Students</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </View>
        </Modal>
    );

    const columns = [
        {
            key: 'select',
            title: '',
            flex: 0.5,
            render: (_, user) => (
                <TouchableOpacity
                    style={styles.checkbox}
                    onPress={() => {
                        if (selectedUsers.includes(user.id)) {
                            setSelectedUsers(selectedUsers.filter(id => id !== user.id));
                        } else {
                            setSelectedUsers([...selectedUsers, user.id]);
                        }
                    }}
                >
                    <Ionicons
                        name={selectedUsers.includes(user.id) ? 'checkbox' : 'square-outline'}
                        size={20}
                        color={selectedUsers.includes(user.id) ? COLORS.primary : COLORS.gray[400]}
                    />
                </TouchableOpacity>
            )
        },
        {
            key: 'name',
            title: 'User',
            flex: 2,
            sortable: true,
            render: (_, user) => (
                <View>
                    <Text style={styles.userName}>{user.name}</Text>
                    <Text style={styles.userEmail}>{user.email}</Text>
                </View>
            )
        },
        {
            key: 'role',
            title: 'Role',
            flex: 1,
            sortable: true,
            render: (role) => (
                <View style={[styles.badge, { backgroundColor: getRoleColor(role) + '20' }]}>
                    <Text style={[styles.badgeText, { color: getRoleColor(role) }]}>
                        {role?.replace('_', ' ').toUpperCase()}
                    </Text>
                </View>
            )
        },
        {
            key: 'status',
            title: 'Status',
            flex: 1,
            sortable: true,
            render: (status) => (
                <View style={[styles.badge, { backgroundColor: getStatusColor(status) + '20' }]}>
                    <Text style={[styles.badgeText, { color: getStatusColor(status) }]}>
                        {status?.toUpperCase()}
                    </Text>
                </View>
            )
        },
        {
            key: 'createdAt',
            title: 'Joined',
            flex: 1,
            sortable: true,
            render: (date) => <Text style={styles.dateText}>{formatDate(date)}</Text>
        },
        {
            key: 'lastActive',
            title: 'Last Active',
            flex: 1,
            render: (date) => <Text style={styles.dateText}>{formatTimeAgo(date)}</Text>
        }
    ];

    const filteredUsers = users.filter(user => {
        const matchesSearch = !searchQuery || 
            user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            user.email.toLowerCase().includes(searchQuery.toLowerCase());
        
        const matchesRole = selectedRole === 'all' || user.role === selectedRole;
        const matchesStatus = selectedStatus === 'all' || user.status === selectedStatus;
        
        return matchesSearch && matchesRole && matchesStatus;
    });

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
                    <Text style={styles.headerTitle}>User Management</Text>
                    <Text style={styles.headerSubtitle}>{users.length} total users</Text>
                </View>
                <TouchableOpacity
                    style={styles.exportButton}
                    onPress={() => Alert.alert('Export', 'Export functionality coming soon')}
                >
                    <Ionicons name="download" size={20} color={COLORS.primary} />
                </TouchableOpacity>
            </View>

            {/* Filters */}
            <View style={styles.filtersContainer}>
                <View style={styles.searchContainer}>
                    <Ionicons name="search" size={20} color={COLORS.gray[400]} />
                    <TextInput
                        style={styles.searchInput}
                        placeholder="Search users..."
                        value={searchQuery}
                        onChangeText={handleSearch}
                    />
                </View>

                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterTabs}>
                    <TouchableOpacity
                        style={[styles.filterTab, selectedRole === 'all' && styles.filterTabActive]}
                        onPress={() => setSelectedRole('all')}
                    >
                        <Text style={[styles.filterTabText, selectedRole === 'all' && styles.filterTabTextActive]}>
                            All Roles
                        </Text>
                    </TouchableOpacity>
                    
                    {['student', 'landlord', 'food_provider'].map((role) => (
                        <TouchableOpacity
                            key={role}
                            style={[styles.filterTab, selectedRole === role && styles.filterTabActive]}
                            onPress={() => setSelectedRole(role)}
                        >
                            <Text style={[styles.filterTabText, selectedRole === role && styles.filterTabTextActive]}>
                                {role.replace('_', ' ')}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>

                {selectedUsers.length > 0 && (
                    <TouchableOpacity
                        style={styles.bulkActionTrigger}
                        onPress={() => setShowBulkModal(true)}
                    >
                        <Text style={styles.bulkActionTriggerText}>
                            {selectedUsers.length} selected - Bulk Actions
                        </Text>
                        <Ionicons name="chevron-forward" size={16} color={COLORS.primary} />
                    </TouchableOpacity>
                )}
            </View>

            {/* Users Table */}
            <View style={styles.tableContainer}>
                <DataTable
                    data={filteredUsers}
                    columns={columns}
                    loading={loading}
                    onRowPress={handleUserPress}
                    onSort={handleSort}
                    sortColumn={sortColumn}
                    sortDirection={sortDirection}
                    emptyMessage="No users found"
                />
            </View>

            {renderUserModal()}
            {renderBulkModal()}
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
    exportButton: {
        padding: 8,
        borderRadius: 8,
        backgroundColor: COLORS.primary + '20',
    },
    filtersContainer: {
        backgroundColor: COLORS.light,
        paddingHorizontal: 20,
        paddingBottom: 16,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.gray[200],
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.gray[100],
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 12,
        marginBottom: 16,
    },
    searchInput: {
        flex: 1,
        marginLeft: 12,
        fontSize: SIZES.body1,
        color: COLORS.dark,
    },
    filterTabs: {
        marginBottom: 12,
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
        textTransform: 'capitalize',
    },
    filterTabTextActive: {
        color: COLORS.light,
        fontWeight: '600',
    },
    bulkActionTrigger: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.primary + '10',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderRadius: 8,
    },
    bulkActionTriggerText: {
        flex: 1,
        fontSize: SIZES.body2,
        color: COLORS.primary,
        fontWeight: '600',
    },
    tableContainer: {
        flex: 1,
        margin: 20,
    },
    checkbox: {
        padding: 4,
    },
    userName: {
        fontSize: SIZES.body2,
        fontWeight: '600',
        color: COLORS.dark,
    },
    userEmail: {
        fontSize: SIZES.body3,
        color: COLORS.gray[600],
        marginTop: 2,
    },
    badge: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
        alignSelf: 'flex-start',
    },
    badgeText: {
        fontSize: SIZES.body3,
        fontWeight: '600',
    },
    dateText: {
        fontSize: SIZES.body3,
        color: COLORS.gray[600],
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
    userInfo: {
        alignItems: 'center',
        marginBottom: 24,
    },
    formSection: {
        marginBottom: 24,
    },
    sectionTitle: {
        fontSize: SIZES.body1,
        fontWeight: '600',
        color: COLORS.dark,
        marginBottom: 12,
    },
    buttonGroup: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    roleButton: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 8,
        backgroundColor: COLORS.gray[100],
        borderWidth: 1,
        borderColor: COLORS.gray[200],
    },
    roleButtonActive: {
        backgroundColor: COLORS.primary,
        borderColor: COLORS.primary,
    },
    roleButtonText: {
        fontSize: SIZES.body3,
        color: COLORS.gray[600],
        fontWeight: '500',
    },
    roleButtonTextActive: {
        color: COLORS.light,
        fontWeight: '600',
    },
    statusButton: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 8,
        backgroundColor: COLORS.gray[100],
        borderWidth: 1,
        borderColor: COLORS.gray[200],
    },
    statusButtonActive: {
        backgroundColor: COLORS.primary,
        borderColor: COLORS.primary,
    },
    statusButtonText: {
        fontSize: SIZES.body3,
        color: COLORS.gray[600],
        fontWeight: '500',
    },
    statusButtonTextActive: {
        color: COLORS.light,
        fontWeight: '600',
    },
    saveButton: {
        backgroundColor: COLORS.primary,
        paddingVertical: 16,
        borderRadius: 12,
        alignItems: 'center',
    },
    saveButtonText: {
        fontSize: SIZES.body1,
        fontWeight: '600',
        color: COLORS.light,
    },
    bulkText: {
        fontSize: SIZES.body1,
        color: COLORS.gray[700],
        marginBottom: 20,
        textAlign: 'center',
    },
    bulkActions: {
        gap: 12,
    },
    bulkActionButton: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        backgroundColor: COLORS.gray[50],
        borderRadius: 12,
        borderWidth: 1,
        borderColor: COLORS.gray[200],
    },
    bulkActionText: {
        fontSize: SIZES.body1,
        color: COLORS.gray[700],
        marginLeft: 12,
        fontWeight: '500',
    },
});

export default AdminUserManagementScreen;
