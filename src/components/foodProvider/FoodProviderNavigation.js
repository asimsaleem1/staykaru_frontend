import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';

import LoginScreen from '../../screens/foodProvider/LoginScreen.js';
import RegisterScreen from '../../screens/foodProvider/RegisterScreen.js';
import ForgotPasswordScreen from '../../screens/foodProvider/ForgotPasswordScreen.js';
import FoodProviderDashboardScreen from '../../screens/foodProvider/FoodProviderDashboardScreen.js';
import AnalyticsDashboardScreen from '../../screens/foodProvider/AnalyticsDashboardScreen.js';
import FoodProviderProfileScreen from '../../screens/foodProvider/FoodProviderProfileScreen.js';
import SettingsScreen from '../../screens/foodProvider/SettingsScreen.js';
import MenuManagementScreen from '../../screens/foodProvider/MenuManagementScreen.js';
import AddMenuItemScreen from '../../screens/foodProvider/AddMenuItemScreen.js';
import EditMenuItemScreen from '../../screens/foodProvider/EditMenuItemScreen.js';
import OrderManagementScreen from '../../screens/foodProvider/OrderManagementScreen.js';
import OrderDetailsScreen from '../../screens/foodProvider/OrderDetailsScreen.js';
import NotificationsCenterScreen from '../../screens/foodProvider/NotificationsCenterScreen.js';

const Stack = createStackNavigator();

export default function FoodProviderNavigation() {
  return (
    <Stack.Navigator initialRouteName="Login" screenOptions={{ headerShown: true }}>
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Register" component={RegisterScreen} />
      <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
      <Stack.Screen name="FoodProviderDashboard" component={FoodProviderDashboardScreen} options={{ title: 'Dashboard' }} />
      <Stack.Screen name="AnalyticsDashboard" component={AnalyticsDashboardScreen} options={{ title: 'Analytics' }} />
      <Stack.Screen name="Profile" component={FoodProviderProfileScreen} options={{ title: 'Profile' }} />
      <Stack.Screen name="Settings" component={SettingsScreen} />
      <Stack.Screen name="MenuManagement" component={MenuManagementScreen} options={{ title: 'Menu' }} />
      <Stack.Screen name="AddMenuItem" component={AddMenuItemScreen} options={{ title: 'Add Menu Item' }} />
      <Stack.Screen name="EditMenuItem" component={EditMenuItemScreen} options={{ title: 'Edit Menu Item' }} />
      <Stack.Screen name="OrderManagement" component={OrderManagementScreen} options={{ title: 'Orders' }} />
      <Stack.Screen name="OrderDetails" component={OrderDetailsScreen} options={{ title: 'Order Details' }} />
      <Stack.Screen name="NotificationsCenter" component={NotificationsCenterScreen} options={{ title: 'Notifications' }} />
    </Stack.Navigator>
  );
} 