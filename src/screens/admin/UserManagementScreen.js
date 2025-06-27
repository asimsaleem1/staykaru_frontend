import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  FlatList,
  Modal,
  Alert,
  ActivityIndicator,
  Animated,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS } from '../../utils/constants';
import AsyncStorage from '@react-native-async-storage/async-storage';
import AdminApiService from '../../services/adminApiService';

const { width } = Dimensions.get('window');

const UserManagementScreen = () => {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRole, setSelectedRole] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedUser, setSelectedUser] = useState(null);
  const [showUserModal, setShowUserModal] = useState(false);
  const [fadeAnim] = useState(new Animated.Value(0));
  const [error, setError] = useState(null);

  const roles = ['all', 'student', 'landlord', 'food_provider', 'admin'];
  const statuses = ['all', 'active', 'inactive', 'pending'];

  useEffect(() => {
    fetchUsers();
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: true,
    }).start();
  }, []);

  useEffect(() => {
    filterUsers();
  }, [users, searchQuery, selectedRole, selectedStatus]);

  const fetchUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      const api = new AdminApiService();
      const token = await AsyncStorage.getItem('token');
      api.setToken(token);
      const data = await api.getUsers();
      setUsers(data.data || data || []);
    } catch (error) {
      setError('Failed to fetch users');
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const filterUsers = () => {
    let filtered = users;

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(user =>
        user.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.phone?.includes(searchQuery)
      );
    }

    // Filter by role
    if (selectedRole !== 'all') {
      filtered = filtered.filter(user => user.role === selectedRole);
    }

    // Filter by status
    if (selectedStatus !== 'all') {
      filtered = filtered.filter(user => user.status === selectedStatus);
    }

    setFilteredUsers(filtered);
  };

  const handleUserAction = async (userId, action) => {
    setLoading(true);
    setError(null);
    try {
      const api = new AdminApiService();
      const token = await AsyncStorage.getItem('token');
      api.setToken(token);
      if (action === 'activate' || action === 'deactivate') {
        await api.updateUserStatus(userId, action === 'activate' ? 'active' : 'inactive');
      } else if (action === 'delete') {
        // Confirm deletion
        Alert.alert(
          'Delete User',
          'Are you sure you want to delete this user? This action cannot be undone.',
          [
            { text: 'Cancel', style: 'cancel', onPress: () => setLoading(false) },
            {
              text: 'Delete',
              style: 'destructive',
              onPress: async () => {
                try {
                  await api.deleteUser(userId);
                  Alert.alert('Success', 'User deleted successfully');
                  fetchUsers();
                } catch (err) {
                  Alert.alert('Error', 'Failed to delete user: ' + err.message);
                } finally {
                  setLoading(false);
                }
              }
            }
          ]
        );
        return;
      }
      if (action !== 'delete') fetchUsers();
    } catch (error) {
      setError('Failed to perform user action');
      setLoading(false);
    } finally {
      if (action !== 'delete') setLoading(false);
    }
  };

  const getRoleColor = (role) => {
    switch (role) {
      case 'admin': return '#FF3B30';
      case 'landlord': return '#FF9500';
      case 'food_provider': return '#FF2D55';
      case 'student': return '#34C759';
      default: return '#8E8E93';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return '#34C759';
      case 'inactive': return '#FF3B30';
      case 'pending': return '#FF9500';
      default: return '#8E8E93';
    }
  };

  const renderUserCard = ({ item, index }) => {
    return (
      <Animated.View 
        style={[
          styles.userCard, 
          { 
            opacity: fadeAnim,
            transform: [{ 
              translateY: fadeAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [50, 0],
              })
            }]
          }
        ]}
      >
        <View style={styles.userCardHeader}>
          <View style={styles.userInfo}>
            <View style={[styles.avatar, { backgroundColor: getRoleColor(item.role) + '20' }]}>
              <Ionicons name="person" size={24} color={getRoleColor(item.role)} />
            </View>
            <View style={styles.userDetails}>
              <Text style={styles.userName}>{item.name || 'Unknown User'}</Text>
              <Text style={styles.userEmail}>{item.email}</Text>
              <View style={styles.userMeta}>
                <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) + '20' }]}>
                  <Text style={[styles.statusText, { color: getStatusColor(item.status) }]}>
                    {item.status || 'unknown'}
                  </Text>
                </View>
                <View style={[styles.roleBadge, { backgroundColor: getRoleColor(item.role) + '20' }]}>
                  <Text style={[styles.roleText, { color: getRoleColor(item.role) }]}>
                    {item.role || 'unknown'}
                  </Text>
                </View>
              </View>
            </View>
          </View>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => {
              setSelectedUser(item);
              setShowUserModal(true);
            }}
          >
            <Ionicons name="ellipsis-vertical" size={20} color="#666" />
          </TouchableOpacity>
        </View>
        
        <View style={styles.userCardFooter}>
          <Text style={styles.userPhone}>📞 {item.phone || 'No phone'}</Text>
          <Text style={styles.userDate}>📅 Joined: {new Date(item.createdAt || Date.now()).toLocaleDateString()}</Text>
        </View>
      </Animated.View>
    );
  };

  const renderFilterChip = ({ item, type }) => (
    <TouchableOpacity
      style={[
        styles.filterChip,
        (type === 'role' ? selectedRole : selectedStatus) === item && styles.filterChipActive,
      ]}
      onPress={() => type === 'role' ? setSelectedRole(item) : setSelectedStatus(item)}
    >
      <Text
        style={[
          styles.filterChipText,
          (type === 'role' ? selectedRole : selectedStatus) === item && styles.filterChipTextActive,
        ]}
      >
        {item.charAt(0).toUpperCase() + item.slice(1)}
      </Text>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>Loading users...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={[styles.loadingText, { color: 'red' }]}>{error}</Text>
          <TouchableOpacity onPress={fetchUsers} style={{ marginTop: 16 }}>
            <Text style={{ color: COLORS.primary, fontWeight: 'bold' }}>Retry</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
        {/* Header */}
        <LinearGradient colors={[COLORS.primary, COLORS.secondary]} style={styles.header}>
          <Text style={styles.headerTitle}>User Management</Text>
          <Text style={styles.headerSubtitle}>Manage all platform users</Text>
        </LinearGradient>

        {/* Search and Filters */}
        <View style={styles.searchContainer}>
          <View style={styles.searchBox}>
            <Ionicons name="search" size={20} color="#666" />
            <TextInput
              style={styles.searchInput}
              placeholder="Search users..."
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>
        </View>

        {/* Filter Chips */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterContainer}>
          <Text style={styles.filterLabel}>Role:</Text>
          {roles.map((role) => (
            <View key={role} style={styles.chipContainer}>
              {renderFilterChip({ item: role, type: 'role' })}
            </View>
          ))}
        </ScrollView>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterContainer}>
          <Text style={styles.filterLabel}>Status:</Text>
          {statuses.map((status) => (
            <View key={status} style={styles.chipContainer}>
              {renderFilterChip({ item: status, type: 'status' })}
            </View>
          ))}
        </ScrollView>

        {/* User List */}
        <FlatList
          data={filteredUsers}
          renderItem={renderUserCard}
          keyExtractor={(item) => item.id || item._id}
          contentContainerStyle={styles.userList}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={{ alignItems: 'center', marginTop: 40 }}>
              <Ionicons name="person-outline" size={48} color="#ccc" />
              <Text style={{ color: '#888', fontSize: 18, marginTop: 12 }}>No users found.</Text>
            </View>
          }
        />

        {/* User Action Modal */}
        <Modal
          visible={showUserModal}
          transparent
          animationType="slide"
          onRequestClose={() => setShowUserModal(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>User Actions</Text>
                <TouchableOpacity onPress={() => setShowUserModal(false)}>
                  <Ionicons name="close" size={24} color="#666" />
                </TouchableOpacity>
              </View>
              
              {selectedUser && (
                <View style={styles.modalBody}>
                  <Text style={styles.modalUserName}>{selectedUser.name}</Text>
                  <Text style={styles.modalUserEmail}>{selectedUser.email}</Text>
                  
                  <View style={styles.actionButtons}>
                    <TouchableOpacity
                      style={[styles.actionBtn, styles.activateBtn]}
                      onPress={() => {
                        handleUserAction(selectedUser.id || selectedUser._id, 'activate');
                        setShowUserModal(false);
                      }}
                    >
                      <Ionicons name="checkmark-circle" size={20} color="#fff" />
                      <Text style={styles.actionBtnText}>Activate</Text>
                    </TouchableOpacity>
                    
                    <TouchableOpacity
                      style={[styles.actionBtn, styles.deactivateBtn]}
                      onPress={() => {
                        handleUserAction(selectedUser.id || selectedUser._id, 'deactivate');
                        setShowUserModal(false);
                      }}
                    >
                      <Ionicons name="close-circle" size={20} color="#fff" />
                      <Text style={styles.actionBtnText}>Deactivate</Text>
                    </TouchableOpacity>
                    
                    <TouchableOpacity
                      style={[styles.actionBtn, styles.deleteBtn]}
                      onPress={() => {
                        Alert.alert(
                          'Delete User',
                          'Are you sure you want to delete this user?',
                          [
                            { text: 'Cancel', style: 'cancel' },
                            {
                              text: 'Delete',
                              style: 'destructive',
                              onPress: () => {
                                handleUserAction(selectedUser.id || selectedUser._id, 'delete');
                                setShowUserModal(false);
                              }
                            }
                          ]
                        );
                      }}
                    >
                      <Ionicons name="trash" size={20} color="#fff" />
                      <Text style={styles.actionBtnText}>Delete</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )}
            </View>
          </View>
        </Modal>
      </Animated.View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FB',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    color: COLORS.primary,
    fontSize: 16,
  },
  header: {
    padding: 24,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#fff',
    opacity: 0.9,
    marginTop: 4,
  },
  searchContainer: {
    padding: 16,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  searchInput: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
    color: '#333',
  },
  filterContainer: {
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  filterLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginRight: 12,
    alignSelf: 'center',
  },
  chipContainer: {
    marginRight: 8,
  },
  filterChip: {
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  filterChipActive: {
    backgroundColor: COLORS.primary,
  },
  filterChipText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  filterChipTextActive: {
    color: '#fff',
  },
  userList: {
    padding: 16,
  },
  userCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  userCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  userInfo: {
    flexDirection: 'row',
    flex: 1,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  userDetails: {
    flex: 1,
  },
  userName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  userMeta: {
    flexDirection: 'row',
    gap: 8,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  roleBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  roleText: {
    fontSize: 12,
    fontWeight: '600',
  },
  actionButton: {
    padding: 8,
  },
  userCardFooter: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  userPhone: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  userDate: {
    fontSize: 14,
    color: '#666',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    width: width * 0.9,
    maxWidth: 400,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  modalBody: {
    alignItems: 'center',
  },
  modalUserName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  modalUserEmail: {
    fontSize: 14,
    color: '#666',
    marginBottom: 20,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    gap: 8,
  },
  activateBtn: {
    backgroundColor: '#34C759',
  },
  deactivateBtn: {
    backgroundColor: '#FF9500',
  },
  deleteBtn: {
    backgroundColor: '#FF3B30',
  },
  actionBtnText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
});

export default UserManagementScreen; 