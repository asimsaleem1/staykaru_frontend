import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { View } from 'react-native';
import { COLORS } from '../utils/constants';

// Import all admin screens
import DashboardScreen from '../screens/admin/DashboardScreen';
import UserManagementScreen from '../screens/admin/UserManagementScreen';
import AccommodationManagementScreen from '../screens/admin/AccommodationManagementScreen';
import FoodServiceManagementScreen from '../screens/admin/FoodServiceManagementScreen';
import BookingManagementScreen from '../screens/admin/BookingManagementScreen';
import OrderManagementScreen from '../screens/admin/OrderManagementScreen';
import FinancialManagementScreen from '../screens/admin/FinancialManagementScreen';
import ContentModerationScreen from '../screens/admin/ContentModerationScreen';
import SystemAdministrationScreen from '../screens/admin/SystemAdministrationScreen';
import ExportReportsScreen from '../screens/admin/ExportReportsScreen';
import NotificationManagementScreen from '../screens/admin/NotificationManagementScreen';
import AdminTestRunnerScreen from '../screens/admin/AdminTestRunnerScreen';
import AdminProfileScreen from '../screens/admin/AdminProfileScreen';

// Import Admin Navigation component
import AdminNavigation from '../components/admin/AdminNavigation';

const Stack = createStackNavigator();

// Custom header component that includes AdminNavigation
const AdminHeader = ({ navigation, route }) => (
  <View style={{ flex: 1 }}>
    <AdminNavigation navigation={navigation} currentScreen={route.name} />
  </View>
);

const AdminStackNavigator = () => {
  return (
    <Stack.Navigator
      initialRouteName="Dashboard"
      screenOptions={{
        headerStyle: {
          backgroundColor: COLORS.primary,
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
        headerShown: false, // Hide default header since we have custom navigation
      }}
    >
      <Stack.Screen 
        name="Dashboard" 
        component={DashboardScreen}
        options={{ title: 'Admin Dashboard' }}
      />
      <Stack.Screen 
        name="UserManagement" 
        component={UserManagementScreen}
        options={{ title: 'User Management' }}
      />
      <Stack.Screen 
        name="AccommodationManagement" 
        component={AccommodationManagementScreen}
        options={{ title: 'Accommodation Management' }}
      />
      <Stack.Screen 
        name="FoodServiceManagement" 
        component={FoodServiceManagementScreen}
        options={{ title: 'Food Service Management' }}
      />
      <Stack.Screen 
        name="BookingManagement" 
        component={BookingManagementScreen}
        options={{ title: 'Booking Management' }}
      />
      <Stack.Screen 
        name="OrderManagement" 
        component={OrderManagementScreen}
        options={{ title: 'Order Management' }}
      />
      <Stack.Screen 
        name="FinancialManagement" 
        component={FinancialManagementScreen}
        options={{ title: 'Financial Management' }}
      />
      <Stack.Screen 
        name="ContentModeration" 
        component={ContentModerationScreen}
        options={{ title: 'Content Moderation' }}
      />
      <Stack.Screen 
        name="SystemAdministration" 
        component={SystemAdministrationScreen}
        options={{ title: 'System Administration' }}
      />
      <Stack.Screen 
        name="ExportReports" 
        component={ExportReportsScreen}
        options={{ title: 'Export & Reports' }}
      />
      <Stack.Screen 
        name="NotificationManagement" 
        component={NotificationManagementScreen}
        options={{ title: 'Notification Management' }}
      />
      <Stack.Screen 
        name="AdminTestRunner" 
        component={AdminTestRunnerScreen}
        options={{ title: 'Admin Test Runner' }}
      />
      <Stack.Screen 
        name="AdminProfile" 
        component={AdminProfileScreen}
        options={{ title: 'Admin Profile' }}
      />
    </Stack.Navigator>
  );
};

export default AdminStackNavigator; 