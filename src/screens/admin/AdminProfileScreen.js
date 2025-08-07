import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, TextInput, Switch, Dimensions
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS } from '../../utils/constants';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';

const { width } = Dimensions.get('window');

const AdminProfileScreen = () => {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [darkModeEnabled, setDarkModeEnabled] = useState(false);
  const [autoBackupEnabled, setAutoBackupEnabled] = useState(true);
  const [editForm, setEditForm] = useState({});
  const navigation = useNavigation();

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      const storedUser = await AsyncStorage.getItem('user');
      if (storedUser) {
        const user = JSON.parse(storedUser);
        setUserData(user);
        setEditForm({
          name: user.name || '',
          email: user.email || '',
          phone: user.phone || '',
          gender: user.gender || '',
          countryCode: user.countryCode || '',
          identificationType: user.identificationType || '',
          identificationNumber: user.identificationNumber || '',
        });
      }
    } catch (error) {
      console.error('Error loading user data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            await AsyncStorage.clear();
            navigation.reset({
              index: 0,
              routes: [{ name: 'Login' }],
            });
          }
        }
      ]
    );
  };

  const handleSaveProfile = async () => {
    try {
      const updatedUser = { ...userData, ...editForm };
      await AsyncStorage.setItem('user', JSON.stringify(updatedUser));
      setUserData(updatedUser);
      setIsEditing(false);
      Alert.alert('Success', 'Profile updated successfully!');
    } catch (error) {
      Alert.alert('Error', 'Failed to update profile. Please try again.');
    }
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'Delete Account',
      'This action cannot be undone. Are you sure you want to delete your account?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            Alert.alert('Account Deleted', 'Your account has been deleted.');
          }
        }
      ]
    );
  };

  const profileSections = [
    {
      title: 'Personal Information',
      icon: 'person',
      color: '#4F8EF7',
      items: [
        { label: 'Full Name', value: editForm.name, key: 'name', editable: true },
        { label: 'Email', value: editForm.email, key: 'email', editable: true },
        { label: 'Phone', value: editForm.phone, key: 'phone', editable: true },
        { label: 'Gender', value: editForm.gender, key: 'gender', editable: true },
        { label: 'Country Code', value: editForm.countryCode, key: 'countryCode', editable: true },
        { label: 'ID Type', value: editForm.identificationType, key: 'identificationType', editable: true },
        { label: 'ID Number', value: editForm.identificationNumber, key: 'identificationNumber', editable: true },
      ]
    },
    {
      title: 'Account Settings',
      icon: 'settings',
      color: '#FF9500',
      items: [
        { label: 'Role', value: userData?.role || 'Admin', editable: false },
        { label: 'User ID', value: userData?.id || 'N/A', editable: false },
        { label: 'Account Status', value: 'Active', editable: false },
        { label: 'Last Login', value: 'Today', editable: false },
      ]
    },
    {
      title: 'Preferences',
      icon: 'options',
      color: '#34C759',
      items: [
        { label: 'Notifications', value: notificationsEnabled, type: 'switch', key: 'notifications' },
        { label: 'Dark Mode', value: darkModeEnabled, type: 'switch', key: 'darkMode' },
        { label: 'Auto Backup', value: autoBackupEnabled, type: 'switch', key: 'autoBackup' },
      ]
    }
  ];

  const renderProfileItem = (item, sectionIndex, itemIndex) => {
    if (item.type === 'switch') {
      return (
        <View key={itemIndex} style={styles.profileItem}>
          <View style={styles.profileItemLeft}>
            <Text style={styles.profileItemLabel}>{item.label}</Text>
          </View>
          <Switch
            value={item.value}
            onValueChange={(value) => {
              switch (item.key) {
                case 'notifications':
                  setNotificationsEnabled(value);
                  break;
                case 'darkMode':
                  setDarkModeEnabled(value);
                  break;
                case 'autoBackup':
                  setAutoBackupEnabled(value);
                  break;
              }
            }}
            trackColor={{ false: '#767577', true: COLORS.primary }}
            thumbColor={item.value ? '#fff' : '#f4f3f4'}
          />
        </View>
      );
    }

    return (
      <View key={itemIndex} style={styles.profileItem}>
        <View style={styles.profileItemLeft}>
          <Text style={styles.profileItemLabel}>{item.label}</Text>
          {isEditing && item.editable ? (
            <TextInput
              style={styles.profileItemInput}
              value={item.value}
              onChangeText={(text) => setEditForm({ ...editForm, [item.key]: text })}
              placeholder={`Enter ${item.label.toLowerCase()}`}
            />
          ) : (
            <Text style={styles.profileItemValue}>{item.value || 'Not set'}</Text>
          )}
        </View>
        {isEditing && item.editable && (
          <Ionicons name="create-outline" size={20} color="#666" />
        )}
      </View>
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text>Loading profile...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <LinearGradient colors={[COLORS.primary, COLORS.secondary]} style={styles.header}>
          <View style={styles.headerContent}>
            <View style={styles.profileImageContainer}>
              <Ionicons name="person" size={40} color="#fff" />
            </View>
            <View style={styles.headerText}>
              <Text style={styles.headerTitle}>{userData?.name || 'Administrator'}</Text>
              <Text style={styles.headerSubtitle}>{userData?.email || 'admin@staykaru.com'}</Text>
              <Text style={styles.headerRole}>{userData?.role || 'Admin'}</Text>
            </View>
          </View>
        </LinearGradient>

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={[styles.actionButton, isEditing ? styles.saveButton : styles.editButton]}
            onPress={() => {
              if (isEditing) {
                handleSaveProfile();
              } else {
                setIsEditing(true);
              }
            }}
          >
            <Ionicons 
              name={isEditing ? "checkmark" : "create"} 
              size={20} 
              color="#fff" 
            />
            <Text style={styles.actionButtonText}>
              {isEditing ? 'Save Changes' : 'Edit Profile'}
            </Text>
          </TouchableOpacity>

          {isEditing && (
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => {
                setIsEditing(false);
                loadUserData();
              }}
            >
              <Ionicons name="close" size={20} color="#FF3B30" />
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Profile Sections */}
        {profileSections.map((section, sectionIndex) => (
          <View key={sectionIndex} style={styles.section}>
            <View style={styles.sectionHeader}>
              <View style={[styles.sectionIcon, { backgroundColor: section.color + '20' }]}>
                <Ionicons name={section.icon} size={20} color={section.color} />
              </View>
              <Text style={styles.sectionTitle}>{section.title}</Text>
            </View>
            
            <View style={styles.sectionContent}>
              {section.items.map((item, itemIndex) => renderProfileItem(item, sectionIndex, itemIndex))}
            </View>
          </View>
        ))}

        {/* Quick Actions */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={[styles.sectionIcon, { backgroundColor: '#5856D6' + '20' }]}>
              <Ionicons name="flash" size={20} color="#5856D6" />
            </View>
            <Text style={styles.sectionTitle}>Quick Actions</Text>
          </View>
          
          <View style={styles.quickActions}>
            <TouchableOpacity style={styles.quickActionButton} onPress={() => navigation.navigate('NotificationManagement')}>
              <Ionicons name="notifications" size={24} color="#FF3B30" />
              <Text style={styles.quickActionText}>Send Notification</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.quickActionButton} onPress={() => navigation.navigate('ExportReports')}>
              <Ionicons name="document-text" size={24} color="#5856D6" />
              <Text style={styles.quickActionText}>Generate Report</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.quickActionButton} onPress={() => navigation.navigate('SystemAdministration')}>
              <Ionicons name="settings" size={24} color="#FF9500" />
              <Text style={styles.quickActionText}>System Settings</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.quickActionButton} onPress={() => navigation.navigate('AdminTestRunner')}>
              <Ionicons name="bug" size={24} color="#FF6B6B" />
              <Text style={styles.quickActionText}>Run Tests</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Danger Zone */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={[styles.sectionIcon, { backgroundColor: '#FF3B30' + '20' }]}>
              <Ionicons name="warning" size={20} color="#FF3B30" />
            </View>
            <Text style={styles.sectionTitle}>Danger Zone</Text>
          </View>
          
          <View style={styles.dangerZone}>
            <TouchableOpacity style={styles.dangerButton} onPress={handleLogout}>
              <Ionicons name="log-out-outline" size={20} color="#FF9500" />
              <Text style={styles.dangerButtonText}>Logout</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.dangerButton} onPress={handleDeleteAccount}>
              <Ionicons name="trash-outline" size={20} color="#FF3B30" />
              <Text style={[styles.dangerButtonText, { color: '#FF3B30' }]}>Delete Account</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FB',
  },
  scrollView: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    padding: 24,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  profileImageContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  headerText: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#fff',
    opacity: 0.9,
    marginBottom: 2,
  },
  headerRole: {
    fontSize: 14,
    color: '#fff',
    opacity: 0.8,
    textTransform: 'uppercase',
    fontWeight: '600',
  },
  actionButtons: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    flex: 1,
    justifyContent: 'center',
  },
  editButton: {
    backgroundColor: COLORS.primary,
  },
  saveButton: {
    backgroundColor: '#34C759',
  },
  actionButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    marginLeft: 8,
  },
  cancelButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#FF3B30',
    justifyContent: 'center',
  },
  cancelButtonText: {
    color: '#FF3B30',
    fontWeight: 'bold',
    marginLeft: 8,
  },
  section: {
    margin: 16,
    backgroundColor: '#fff',
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  sectionIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  sectionContent: {
    padding: 16,
  },
  profileItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f8f8f8',
  },
  profileItemLeft: {
    flex: 1,
  },
  profileItemLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  profileItemValue: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  profileItemInput: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 4,
    padding: 8,
    marginTop: 4,
  },
  quickActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 16,
    gap: 12,
  },
  quickActionButton: {
    width: (width - 80) / 2,
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#f8f8f8',
    borderRadius: 8,
  },
  quickActionText: {
    fontSize: 12,
    color: '#333',
    marginTop: 8,
    textAlign: 'center',
    fontWeight: '500',
  },
  dangerZone: {
    padding: 16,
    gap: 12,
  },
  dangerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fff5f5',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ffebee',
  },
  dangerButtonText: {
    fontSize: 16,
    color: '#FF9500',
    fontWeight: '600',
    marginLeft: 12,
  },
});

export default AdminProfileScreen; 