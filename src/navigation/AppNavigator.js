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

// Import new admin screens
import AdminDashboardScreen from '../screens/admin/AdminDashboardScreen_new';
import AdminUserManagementScreen from '../screens/admin/AdminUserManagementScreen';
import AdminContentModerationScreen from '../screens/admin/AdminContentModerationScreen';
import AdminFinancialManagementScreen from '../screens/admin/AdminFinancialManagementScreen';
import AdminSystemSettingsScreen from '../screens/admin/AdminSystemSettingsScreen';
import AdminReportsCenterScreen from '../screens/admin/AdminReportsCenterScreen';
import AdminAnalyticsScreen from '../screens/admin/AdminAnalyticsScreen';
import AdminAccommodationsScreen from '../screens/admin/AdminAccommodationsScreen';
import AdminFoodProvidersScreen from '../screens/admin/AdminFoodProvidersScreen';
import AdminBookingsScreen from '../screens/admin/AdminBookingsScreen';
import AdminOrdersScreen from '../screens/admin/AdminOrdersScreen';
import AdminNotificationsScreen from '../screens/admin/AdminNotificationsScreen';
import AdminAccommodationDetailScreen from '../screens/admin/AdminAccommodationDetailScreen';
import AdminFoodProviderDetailScreen from '../screens/admin/AdminFoodProviderDetailScreen';
import AdminAnnouncementsScreen from '../screens/admin/AdminAnnouncementsScreen';
import AdminBookingDetailScreen from '../screens/admin/AdminBookingDetailScreen';
import AdminOrderDetailScreen from '../screens/admin/AdminOrderDetailScreen';
import AdminSystemHealthScreen from '../screens/admin/AdminSystemHealthScreen';
import AdminSystemLogsScreen from '../screens/admin/AdminSystemLogsScreen';
import AdminProfileScreen from '../screens/admin/AdminProfileScreen';

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
import FoodProviderDashboardScreen from '../screens/foodProvider/FoodProviderDashboardScreen';
import FoodProviderProfileScreen from '../screens/foodProvider/FoodProviderProfileScreen';
import MenuManagementScreen from '../screens/foodProvider/MenuManagementScreen';
import OrderManagementScreen from '../screens/foodProvider/OrderManagementScreen';
import InventoryManagementScreen from '../screens/foodProvider/InventoryManagementScreen';
import ReviewsRatingsScreen from '../screens/foodProvider/ReviewsRatingsScreen';
import AnalyticsReportsScreen from '../screens/foodProvider/AnalyticsReportsScreen';
import SettingsScreen from '../screens/foodProvider/SettingsScreen';

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
        setInitialRoute('AdminDashboard');
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
        <Stack.Screen
          name="AccommodationsList" 
          component={AccommodationsListScreen_new}
          options={{ 
            headerShown: false
          }}
        />
        <Stack.Screen 
          name="AccommodationDetail" 
          component={AccommodationDetailsScreen_new}
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
          name="BookingDetails" 
          component={BookingDetailsScreen}
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
          name="FoodProviderDetail" 
          component={FoodProviderDetailsScreen_new}
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
          name="OrderDetails" 
          component={OrderDetailsScreen_new}
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
          name="Notifications" 
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
          name="AccommodationMap" 
          component={MapViewScreen_new}
          options={{ 
            headerShown: false
          }}
        />
        <Stack.Screen 
          name="UnifiedMap" 
          component={UnifiedMapScreen}
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
          name="SocialFeed" 
          component={SocialFeedScreen}
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
          name="AdminDashboard" 
          component={AdminDashboardScreen}
          options={{ 
            headerShown: false // Admin screens handle their own headers
          }}
        />
        <Stack.Screen 
          name="AdminUserManagement" 
          component={AdminUserManagementScreen}
          options={{ 
            headerShown: false
          }}
        />
        <Stack.Screen 
          name="AdminContentModeration" 
          component={AdminContentModerationScreen}
          options={{ 
            headerShown: false
          }}
        />
        <Stack.Screen 
          name="AdminFinancialManagement" 
          component={AdminFinancialManagementScreen}
          options={{ 
            headerShown: false
          }}
        />
        <Stack.Screen 
          name="AdminSystemSettings" 
          component={AdminSystemSettingsScreen}
          options={{ 
            headerShown: false
          }}
        />
        <Stack.Screen 
          name="AdminReportsCenter" 
          component={AdminReportsCenterScreen}
          options={{ 
            headerShown: false
          }}
        />
        <Stack.Screen 
          name="AdminAnalytics" 
          component={AdminAnalyticsScreen}
          options={{ 
            headerShown: false
          }}
        />
        <Stack.Screen 
          name="AdminAccommodations" 
          component={AdminAccommodationsScreen}
          options={{ 
            headerShown: false
          }}
        />
        <Stack.Screen 
          name="AdminFoodProviders" 
          component={AdminFoodProvidersScreen}
          options={{ 
            headerShown: false
          }}
        />
        <Stack.Screen 
          name="AdminBookings" 
          component={AdminBookingsScreen}
          options={{ 
            headerShown: false
          }}
        />
        <Stack.Screen 
          name="AdminOrders" 
          component={AdminOrdersScreen}
          options={{ 
            headerShown: false
          }}
        />
        <Stack.Screen 
          name="AdminNotifications" 
          component={AdminNotificationsScreen}
          options={{ 
            headerShown: false
          }}
        />
        <Stack.Screen 
          name="AdminAccommodationDetail" 
          component={AdminAccommodationDetailScreen}
          options={{ 
            headerShown: false
          }}
        />
        <Stack.Screen 
          name="AdminFoodProviderDetail" 
          component={AdminFoodProviderDetailScreen}
          options={{ 
            headerShown: false
          }}
        />
        <Stack.Screen 
          name="AdminAnnouncements" 
          component={AdminAnnouncementsScreen}
          options={{ 
            headerShown: false
          }}
        />
        <Stack.Screen 
          name="AdminBookingDetail" 
          component={AdminBookingDetailScreen}
          options={{ 
            headerShown: false
          }}
        />
        <Stack.Screen 
          name="AdminOrderDetail" 
          component={AdminOrderDetailScreen}
          options={{ 
            headerShown: false
          }}
        />
        <Stack.Screen 
          name="AdminSystemHealth" 
          component={AdminSystemHealthScreen}
          options={{ 
            headerShown: false
          }}
        />
        <Stack.Screen 
          name="AdminSystemLogs" 
          component={AdminSystemLogsScreen}
          options={{ 
            headerShown: false
          }}
        />
        <Stack.Screen 
          name="AdminProfile" 
          component={AdminProfileScreen}
          options={{ 
            headerShown: false
          }}
        />
        <Stack.Screen
          name="LandlordDashboardNew" 
          component={LandlordDashboardScreen}
          options={{ 
            headerShown: false
          }}
        />
        <Stack.Screen 
          name="PropertyListing" 
          component={PropertyListingScreen}
          options={{ 
            headerShown: false
          }}
        />
        <Stack.Screen 
          name="PropertyEdit" 
          component={PropertyEditScreen}
          options={{ 
            headerShown: false
          }}
        />
        <Stack.Screen 
          name="PropertyDetail" 
          component={PropertyDetailScreen}
          options={{ 
            headerShown: false
          }}
        />
        <Stack.Screen 
          name="PropertyCalendar" 
          component={PropertyCalendarScreen}
          options={{ 
            headerShown: false
          }}
        />
        <Stack.Screen 
          name="BookingManagement" 
          component={BookingManagementScreen}
          options={{ 
            headerShown: false
          }}
        />
        <Stack.Screen 
          name="Analytics" 
          component={AnalyticsScreen}
          options={{ 
            headerShown: false
          }}
        />
        <Stack.Screen 
          name="FinancialManagement" 
          component={FinancialManagementScreen}
          options={{ 
            headerShown: false
          }}
        />
        <Stack.Screen 
          name="GuestManagement" 
          component={GuestManagementScreen}
          options={{ 
            headerShown: false
          }}
        />
        <Stack.Screen 
          name="ReviewsManagement" 
          component={ReviewsManagementScreen}
          options={{ 
            headerShown: false
          }}
        />
        <Stack.Screen 
          name="LandlordNotifications" 
          component={LandlordNotificationsScreen}
          options={{ 
            headerShown: false
          }}
        />
        <Stack.Screen 
          name="LandlordProfile" 
          component={LandlordProfileScreen}
          options={{ 
            headerShown: false
          }}
        />
        <Stack.Screen 
          name="Maintenance" 
          component={MaintenanceScreen}
          options={{ 
            headerShown: false
          }}
        />
        <Stack.Screen 
          name="VendorManagement" 
          component={VendorManagementScreen}
          options={{ 
            headerShown: false
          }}
        />
        <Stack.Screen 
          name="BusinessSettings" 
          component={BusinessSettingsScreen}
          options={{ 
            headerShown: false
          }}
        />
        <Stack.Screen 
          name="BookingPreferences" 
          component={BookingPreferencesScreen}
          options={{ 
            headerShown: false
          }}
        />
        <Stack.Screen 
          name="AccountSettings" 
          component={AccountSettingsScreen}
          options={{ 
            headerShown: false
          }}
        />
        <Stack.Screen 
          name="AddProperty" 
          component={AddPropertyScreen}
          options={{ 
            headerShown: false
          }}
        />
        <Stack.Screen 
          name="Properties" 
          component={PropertiesScreen}
          options={{ 
            headerShown: false
          }}
        />
        <Stack.Screen 
          name="Bookings" 
          component={BookingsScreen}
          options={{ 
            headerShown: false
          }}
        />
        <Stack.Screen 
          name="Earnings" 
          component={EarningsScreen}
          options={{ 
            headerShown: false
          }}
        />
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
          name="MenuManagement" 
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
          name="InventoryManagement" 
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
          name="AnalyticsReports" 
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
          name="FoodProviders" 
          component={FoodProvidersScreen_new}
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
          name="FoodSearch" 
          component={FoodProvidersScreen_new}
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
          name="MyOrders" 
          component={MyOrdersScreen_new}
          options={{ 
            headerShown: false
          }}
        />
        <Stack.Screen 
          name="NotificationList" 
          component={NotificationsScreen_new}
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
          name="FoodProviderDetails" 
          component={FoodProviderDetailsScreen_new}
          options={{ 
            headerShown: false
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;
