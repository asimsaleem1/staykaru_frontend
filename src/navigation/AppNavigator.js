import React, { useState, useEffect } from 'react';
import { View, Text } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import AsyncStorage from '@react-native-async-storage/async-storage';

import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import StudentTabNavigator from './StudentTabNavigator';
import LoadingSpinner from '../components/LoadingSpinner';

// Import onboarding and chatbot screens
import OnboardingScreen from '../screens/OnboardingScreen';
import ChatbotScreen_new from '../screens/student/ChatbotScreen_new.js';

// Import new admin stack navigator
import AdminStackNavigator from './AdminStackNavigator';

// Import new student screens
import ChatScreen_new from '../screens/student/ChatScreen_new';
import SupportScreen_new from '../screens/student/SupportScreen_new.js';
import NotificationsScreen_new from '../screens/student/NotificationsScreen_new.js';
import StudentProfileScreen_new from '../screens/student/StudentProfileScreen_new';
import SafetyEmergencyScreen_new from '../screens/student/SafetyEmergencyScreen_new.js';
import SocialFeedScreen from '../screens/student/SocialFeedScreen';
import UnifiedMapScreen from '../screens/student/UnifiedMapScreen';

// Import new student screens with database integration
import AccommodationsListScreen_new from '../screens/student/AccommodationsListScreen_new';
import AccommodationDetailsScreen_new from '../screens/student/AccommodationDetailsScreen_new';
import MyBookingsScreen_new from '../screens/student/MyBookingsScreen_new';
import BookingDetailsScreen from '../screens/student/BookingDetailsScreen';
import FoodProvidersScreen_new from '../screens/student/FoodProvidersScreen_new';
import FoodProviderDetailsScreen_new from '../screens/student/FoodProviderDetailsScreen_new';
import FoodOrderCheckoutScreen_new from '../screens/student/FoodOrderCheckoutScreen_new';
import MyOrdersScreen_new from '../screens/student/MyOrdersScreen_new';
import OrderDetailsScreen_new from '../screens/student/OrderDetailsScreen_new';
import MapViewScreen_new from '../screens/student/MapViewScreen_new';
import WriteReviewScreen_new from '../screens/student/WriteReviewScreen_new';
import RecommendationSystemScreen from '../screens/student/RecommendationSystemScreen';

// Import new landlord screens
import LandlordDashboardScreen from '../screens/landlord/LandlordDashboardScreen';
import PropertyListingScreen from '../screens/landlord/PropertyListingScreen';
import PropertyEditScreen from '../screens/landlord/PropertyEditScreen';
import PropertyDetailScreen from '../screens/landlord/PropertyDetailScreen';
import PropertyCalendarScreen from '../screens/landlord/PropertyCalendarScreen';
import BookingManagementScreen from '../screens/landlord/BookingManagementScreen';
import AnalyticsScreen from '../screens/landlord/AnalyticsScreen';
import FinancialManagementScreen from '../screens/landlord/FinancialManagementScreen';
import GuestManagementScreen from '../screens/landlord/GuestManagementScreen';
import ReviewsManagementScreen from '../screens/landlord/ReviewsManagementScreen';
import LandlordNotificationsScreen from '../screens/landlord/NotificationsScreen';
import LandlordProfileScreen from '../screens/landlord/LandlordProfileScreen';
import MaintenanceScreen from '../screens/landlord/MaintenanceScreen';
import VendorManagementScreen from '../screens/landlord/VendorManagementScreen';
import BusinessSettingsScreen from '../screens/landlord/BusinessSettingsScreen';
import BookingPreferencesScreen from '../screens/landlord/BookingPreferencesScreen';
import AccountSettingsScreen from '../screens/landlord/AccountSettingsScreen';

// Import missing landlord screens
import AddPropertyScreen from '../screens/landlord/AddPropertyScreen';
import PropertiesScreen from '../screens/landlord/PropertiesScreen';
import BookingsScreen from '../screens/landlord/BookingsScreen';
import EarningsScreen from '../screens/landlord/EarningsScreen';

// Import new food provider screens
import FoodProviderDashboardScreen from '../screens/foodProvider/FoodProviderDashboardScreen.js';
import FoodProviderProfileScreen from '../screens/foodProvider/FoodProviderProfileScreen.js';
import MenuManagementScreen from '../screens/foodProvider/MenuManagementScreen.js';
import OrderManagementScreen from '../screens/foodProvider/OrderManagementScreen.js';
import InventoryManagementScreen from '../screens/foodProvider/InventoryManagementScreen.js';
import ReviewsRatingsScreen from '../screens/foodProvider/ReviewsRatingsScreen.js';
import AnalyticsReportsScreen from '../screens/foodProvider/AnalyticsReportsScreen.js';
import SettingsScreen from '../screens/foodProvider/SettingsScreen.js';
import AddMenuItemScreen from '../screens/foodProvider/AddMenuItemScreen.js';
import NotificationsCenterScreen from '../screens/foodProvider/NotificationsCenterScreen.js';

const Stack = createStackNavigator();

const AppNavigator = () => {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [initialRoute, setInitialRoute] = useState('Login');

  useEffect(() => {
    checkAuthState();
  }, []);

  const checkAuthState = async () => {
    try {
      const userData = await AsyncStorage.getItem('user');
      if (userData) {
        const parsedUser = JSON.parse(userData);
        setUser(parsedUser);
        await getInitialRoute(parsedUser);
      } else {
        setInitialRoute('Login');
      }
    } catch (error) {
      console.error('Error checking auth state:', error);
      setInitialRoute('Login');
    } finally {
      setLoading(false);
    }
  };

  const getInitialRoute = async (userData) => {
    if (!userData) {
      setInitialRoute('Login');
      return;
    }
    
    // Check if student needs onboarding
    if (userData.role === 'student') {
      const hasCompletedOnboarding = await AsyncStorage.getItem('hasCompletedOnboarding');
      if (!hasCompletedOnboarding) {
        setInitialRoute('Onboarding');
        return;
      }
    }

    switch (userData.role) {
      case 'admin':
        setInitialRoute('AdminStack');
        break;
      case 'student':
        setInitialRoute('StudentDashboard');
        break;
      case 'landlord':
        setInitialRoute('LandlordDashboardNew');
        break;
      case 'food_provider':
        setInitialRoute('FoodProviderDashboardNew');
        break;
      default:
        setInitialRoute('StudentDashboard');
    }
  };

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <LoadingSpinner size="large" text="Loading..." />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName={initialRoute}
        screenOptions={{
          headerShown: false,
          gestureEnabled: false
        }}>
        <Stack.Screen 
          name="Login" 
          component={LoginScreen} />
        <Stack.Screen 
          name="Register" 
          component={RegisterScreen} />
        <Stack.Screen
          name="Onboarding" 
          component={OnboardingScreen}
          options={{ 
            headerShown: false
          }}
        />
        <Stack.Screen
          name="Chatbot" 
          component={ChatbotScreen_new}
          options={{ 
            headerShown: false
          }}
        />
        <Stack.Screen
          name="StudentDashboard" 
          component={StudentTabNavigator}
          options={{ 
            headerShown: false
          }}
        />
        
        {/* New Admin Stack Navigator */}
        <Stack.Screen
          name="AdminStack" 
          component={AdminStackNavigator}
          options={{ 
            headerShown: false
          }}
        />

        {/* Student Screens - Updated with correct navigation names */}
        <Stack.Screen
          name="ChatScreen" 
          component={ChatScreen_new}
          options={{ 
            headerShown: false
          }}
        />
        <Stack.Screen
          name="Chat" 
          component={ChatScreen_new}
          options={{ 
            headerShown: false
          }}
        />
        <Stack.Screen
          name="Support" 
          component={SupportScreen_new}
          options={{ 
            headerShown: false
          }}
        />
        <Stack.Screen
          name="SupportScreen" 
          component={SupportScreen_new}
          options={{ 
            headerShown: false
          }}
        />
        <Stack.Screen
          name="Notifications" 
          component={NotificationsScreen_new}
          options={{ 
            headerShown: false
          }}
        />
        <Stack.Screen
          name="NotificationsScreen" 
          component={NotificationsScreen_new}
          options={{ 
            headerShown: false
          }}
        />
        <Stack.Screen
          name="StudentProfile" 
          component={StudentProfileScreen_new}
          options={{ 
            headerShown: false
          }}
        />
        <Stack.Screen
          name="StudentProfileScreen" 
          component={StudentProfileScreen_new}
          options={{ 
            headerShown: false
          }}
        />
        <Stack.Screen
          name="SafetyEmergency" 
          component={SafetyEmergencyScreen_new}
          options={{ 
            headerShown: false
          }}
        />
        <Stack.Screen
          name="SafetyEmergencyScreen" 
          component={SafetyEmergencyScreen_new}
          options={{ 
            headerShown: false
          }}
        />
        <Stack.Screen
          name="SocialFeed" 
          component={SocialFeedScreen}
          options={{ 
            headerShown: false
          }}
        />
        <Stack.Screen
          name="SocialFeedScreen" 
          component={SocialFeedScreen}
          options={{ 
            headerShown: false
          }}
        />
        <Stack.Screen
          name="UnifiedMapScreen" 
          component={UnifiedMapScreen}
          options={{ 
            headerShown: false
          }}
        />
        <Stack.Screen
          name="AccommodationsList" 
          component={AccommodationsListScreen_new}
          options={{ 
            headerShown: false
          }}
        />
        <Stack.Screen
          name="AccommodationsListScreen" 
          component={AccommodationsListScreen_new}
          options={{ 
            headerShown: false
          }}
        />
        <Stack.Screen
          name="AccommodationDetails" 
          component={AccommodationDetailsScreen_new}
          options={{ 
            headerShown: false
          }}
        />
        <Stack.Screen
          name="AccommodationDetailsScreen" 
          component={AccommodationDetailsScreen_new}
          options={{ 
            headerShown: false
          }}
        />
        <Stack.Screen
          name="MyBookingsScreen" 
          component={MyBookingsScreen_new}
          options={{ 
            headerShown: false
          }}
        />
        <Stack.Screen
          name="MyBookings" 
          component={MyBookingsScreen_new}
          options={{ 
            headerShown: false
          }}
        />
        <Stack.Screen
          name="BookingHistory" 
          component={MyBookingsScreen_new}
          options={{ 
            headerShown: false
          }}
        />
        <Stack.Screen
          name="BookingDetailsScreen" 
          component={BookingDetailsScreen}
          options={{ 
            headerShown: false
          }}
        />
        <Stack.Screen
          name="FoodProviders" 
          component={FoodProvidersScreen_new}
          options={{ 
            headerShown: false
          }}
        />
        <Stack.Screen
          name="FoodProvidersScreen" 
          component={FoodProvidersScreen_new}
          options={{ 
            headerShown: false
          }}
        />
        <Stack.Screen
          name="FoodProvidersList" 
          component={FoodProvidersScreen_new}
          options={{ 
            headerShown: false
          }}
        />
        <Stack.Screen
          name="FoodSearch" 
          component={FoodProvidersScreen_new}
          options={{ 
            headerShown: false
          }}
        />
        <Stack.Screen
          name="FoodProviderDetails" 
          component={FoodProviderDetailsScreen_new}
          options={{ 
            headerShown: false
          }}
        />
        <Stack.Screen
          name="FoodProviderDetailsScreen" 
          component={FoodProviderDetailsScreen_new}
          options={{ 
            headerShown: false
          }}
        />
        <Stack.Screen
          name="FoodOrderCheckoutScreen" 
          component={FoodOrderCheckoutScreen_new}
          options={{ 
            headerShown: false
          }}
        />
        <Stack.Screen
          name="FoodOrderCheckout" 
          component={FoodOrderCheckoutScreen_new}
          options={{ 
            headerShown: false
          }}
        />
        <Stack.Screen
          name="MyOrdersScreen" 
          component={MyOrdersScreen_new}
          options={{ 
            headerShown: false
          }}
        />
        <Stack.Screen
          name="MyOrders" 
          component={MyOrdersScreen_new}
          options={{ 
            headerShown: false
          }}
        />
        <Stack.Screen
          name="OrderDetailsScreen" 
          component={OrderDetailsScreen_new}
          options={{ 
            headerShown: false
          }}
        />
        <Stack.Screen
          name="OrderDetails" 
          component={OrderDetailsScreen_new}
          options={{ 
            headerShown: false
          }}
        />
        <Stack.Screen
          name="AccommodationSearch" 
          component={AccommodationsListScreen_new}
          options={{ 
            headerShown: false
          }}
        />
        <Stack.Screen
          name="MapViewScreen" 
          component={MapViewScreen_new}
          options={{ 
            headerShown: false
          }}
        />
        <Stack.Screen
          name="MapView" 
          component={MapViewScreen_new}
          options={{ 
            headerShown: false
          }}
        />
        <Stack.Screen
          name="WriteReviewScreen" 
          component={WriteReviewScreen_new}
          options={{ 
            headerShown: false
          }}
        />
        <Stack.Screen
          name="WriteReview" 
          component={WriteReviewScreen_new}
          options={{ 
            headerShown: false
          }}
        />
        <Stack.Screen
          name="RecommendationSystem" 
          component={RecommendationSystemScreen}
          options={{ 
            headerShown: false
          }}
        />
        <Stack.Screen
          name="RecommendationSystemScreen" 
          component={RecommendationSystemScreen}
          options={{ 
            headerShown: false
          }}
        />

        {/* Landlord Screens */}
        <Stack.Screen
          name="LandlordDashboardNew" 
          component={LandlordDashboardScreen}
          options={{ 
            headerShown: false
          }}
        />
        <Stack.Screen
          name="PropertyListingScreen" 
          component={PropertyListingScreen}
          options={{ 
            headerShown: false
          }}
        />
        <Stack.Screen
          name="PropertyEditScreen" 
          component={PropertyEditScreen}
          options={{ 
            headerShown: false
          }}
        />
        <Stack.Screen
          name="PropertyDetailScreen" 
          component={PropertyDetailScreen}
          options={{ 
            headerShown: false
          }}
        />
        <Stack.Screen
          name="PropertyCalendarScreen" 
          component={PropertyCalendarScreen}
          options={{ 
            headerShown: false
          }}
        />
        <Stack.Screen
          name="LandlordBookingManagementScreen" 
          component={BookingManagementScreen}
          options={{ 
            headerShown: false
          }}
        />
        <Stack.Screen
          name="LandlordAnalyticsScreen" 
          component={AnalyticsScreen}
          options={{ 
            headerShown: false
          }}
        />
        <Stack.Screen
          name="LandlordFinancialManagementScreen" 
          component={FinancialManagementScreen}
          options={{ 
            headerShown: false
          }}
        />
        <Stack.Screen
          name="GuestManagementScreen" 
          component={GuestManagementScreen}
          options={{ 
            headerShown: false
          }}
        />
        <Stack.Screen
          name="ReviewsManagementScreen" 
          component={ReviewsManagementScreen}
          options={{ 
            headerShown: false
          }}
        />
        <Stack.Screen
          name="LandlordNotificationsScreen" 
          component={LandlordNotificationsScreen}
          options={{ 
            headerShown: false
          }}
        />
        <Stack.Screen
          name="LandlordProfileScreen" 
          component={LandlordProfileScreen}
          options={{ 
            headerShown: false
          }}
        />
        <Stack.Screen
          name="MaintenanceScreen" 
          component={MaintenanceScreen}
          options={{ 
            headerShown: false
          }}
        />
        <Stack.Screen
          name="VendorManagementScreen" 
          component={VendorManagementScreen}
          options={{ 
            headerShown: false
          }}
        />
        <Stack.Screen
          name="BusinessSettingsScreen" 
          component={BusinessSettingsScreen}
          options={{ 
            headerShown: false
          }}
        />
        <Stack.Screen
          name="BookingPreferencesScreen" 
          component={BookingPreferencesScreen}
          options={{ 
            headerShown: false
          }}
        />
        <Stack.Screen
          name="LandlordAccountSettingsScreen" 
          component={AccountSettingsScreen}
          options={{ 
            headerShown: false
          }}
        />
        <Stack.Screen
          name="AddPropertyScreen" 
          component={AddPropertyScreen}
          options={{ 
            headerShown: false
          }}
        />
        <Stack.Screen
          name="PropertiesScreen" 
          component={PropertiesScreen}
          options={{ 
            headerShown: false
          }}
        />
        <Stack.Screen
          name="LandlordBookingsScreen" 
          component={BookingsScreen}
          options={{ 
            headerShown: false
          }}
        />
        <Stack.Screen
          name="EarningsScreen" 
          component={EarningsScreen}
          options={{ 
            headerShown: false
          }}
        />

        {/* Food Provider Screens - Updated with correct navigation names */}
        <Stack.Screen
          name="FoodProviderDashboardNew" 
          component={FoodProviderDashboardScreen}
          options={{ 
            headerShown: false
          }}
        />
        <Stack.Screen
          name="FoodProviderProfile" 
          component={FoodProviderProfileScreen}
          options={{ 
            headerShown: false
          }}
        />
        <Stack.Screen
          name="FoodProviderProfileScreen" 
          component={FoodProviderProfileScreen}
          options={{ 
            headerShown: false
          }}
        />
        <Stack.Screen
          name="MenuManagement" 
          component={MenuManagementScreen}
          options={{ 
            headerShown: false
          }}
        />
        <Stack.Screen
          name="MenuManagementScreen" 
          component={MenuManagementScreen}
          options={{ 
            headerShown: false
          }}
        />
        <Stack.Screen
          name="OrderManagement" 
          component={OrderManagementScreen}
          options={{ 
            headerShown: false
          }}
        />
        <Stack.Screen
          name="FoodProviderOrderManagementScreen" 
          component={OrderManagementScreen}
          options={{ 
            headerShown: false
          }}
        />
        <Stack.Screen
          name="InventoryManagement" 
          component={InventoryManagementScreen}
          options={{ 
            headerShown: false
          }}
        />
        <Stack.Screen
          name="InventoryManagementScreen" 
          component={InventoryManagementScreen}
          options={{ 
            headerShown: false
          }}
        />
        <Stack.Screen
          name="ReviewsRatings" 
          component={ReviewsRatingsScreen}
          options={{ 
            headerShown: false
          }}
        />
        <Stack.Screen
          name="ReviewsRatingsScreen" 
          component={ReviewsRatingsScreen}
          options={{ 
            headerShown: false
          }}
        />
        <Stack.Screen
          name="AnalyticsDashboard" 
          component={AnalyticsReportsScreen}
          options={{ 
            headerShown: false
          }}
        />
        <Stack.Screen
          name="AnalyticsReports" 
          component={AnalyticsReportsScreen}
          options={{ 
            headerShown: false
          }}
        />
        <Stack.Screen
          name="AnalyticsReportsScreen" 
          component={AnalyticsReportsScreen}
          options={{ 
            headerShown: false
          }}
        />
        <Stack.Screen
          name="Settings" 
          component={SettingsScreen}
          options={{ 
            headerShown: false
          }}
        />
        <Stack.Screen
          name="FoodProviderSettingsScreen" 
          component={SettingsScreen}
          options={{ 
            headerShown: false
          }}
        />
        <Stack.Screen
          name="AddMenuItem" 
          component={AddMenuItemScreen}
          options={{ 
            headerShown: false
          }}
        />
        <Stack.Screen
          name="AddMenuItemScreen" 
          component={AddMenuItemScreen}
          options={{ 
            headerShown: false
          }}
        />
        <Stack.Screen
          name="NotificationsCenter" 
          component={NotificationsCenterScreen}
          options={{ 
            headerShown: false
          }}
        />
        <Stack.Screen
          name="NotificationsCenterScreen" 
          component={NotificationsCenterScreen}
          options={{ 
            headerShown: false
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;
