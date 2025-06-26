import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';

// Import all new student screens
import StudentDashboard_new from '../screens/StudentDashboard_new';
import AccommodationsListScreen_new from '../screens/student/AccommodationsListScreen_new';
import AccommodationDetailsScreen_new from '../screens/student/AccommodationDetailsScreen_new';
import FoodProvidersScreen_new from '../screens/student/FoodProvidersScreen_new';
import FoodProviderDetailsScreen_new from '../screens/student/FoodProviderDetailsScreen_new';
import FoodOrderCheckoutScreen_new from '../screens/student/FoodOrderCheckoutScreen_new';
import MyBookingsScreen_new from '../screens/student/MyBookingsScreen_new';
import MyOrdersScreen_new from '../screens/student/MyOrdersScreen_new';
import StudentProfileScreen_new from '../screens/student/StudentProfileScreen_new';
import MapViewScreen_new from '../screens/student/MapViewScreen_new';
import ChatScreen_new from '../screens/student/ChatScreen_new';
import WriteReviewScreen_new from '../screens/student/WriteReviewScreen_new';

const Stack = createStackNavigator();

const StudentStackNavigator = () => {
    return (
        <Stack.Navigator
            screenOptions={{
                headerShown: false,
                gestureEnabled: true,
                gestureDirection: 'horizontal',
            }}
        >
            {/* Main Dashboard */}
            <Stack.Screen 
                name="StudentDashboard" 
                component={StudentDashboard_new}
                options={{ title: 'Home' }}
            />

            {/* Accommodation Screens */}
            <Stack.Screen 
                name="AccommodationsScreen" 
                component={AccommodationsListScreen_new}
                options={{ title: 'Accommodations' }}
            />
            <Stack.Screen 
                name="AccommodationDetails" 
                component={AccommodationDetailsScreen_new}
                options={{ title: 'Property Details' }}
            />

            {/* Food Screens */}
            <Stack.Screen 
                name="FoodProviders" 
                component={FoodProvidersScreen_new}
                options={{ title: 'Restaurants' }}
            />
            <Stack.Screen 
                name="FoodProviderDetails" 
                component={FoodProviderDetailsScreen_new}
                options={{ title: 'Restaurant Menu' }}
            />
            <Stack.Screen 
                name="FoodOrderCheckout" 
                component={FoodOrderCheckoutScreen_new}
                options={{ title: 'Checkout' }}
            />

            {/* Booking & Order Management */}
            <Stack.Screen 
                name="MyBookings" 
                component={MyBookingsScreen_new}
                options={{ title: 'My Bookings' }}
            />
            <Stack.Screen 
                name="MyOrders" 
                component={MyOrdersScreen_new}
                options={{ title: 'My Orders' }}
            />

            {/* Profile & Settings */}
            <Stack.Screen 
                name="StudentProfile" 
                component={StudentProfileScreen_new}
                options={{ title: 'Profile' }}
            />

            {/* Utility Screens */}
            <Stack.Screen 
                name="MapView" 
                component={MapViewScreen_new}
                options={{ title: 'Map View' }}
            />
            <Stack.Screen 
                name="Chat" 
                component={ChatScreen_new}
                options={{ title: 'Chat' }}
            />
            <Stack.Screen 
                name="WriteReview" 
                component={WriteReviewScreen_new}
                options={{ title: 'Write Review' }}
            />
        </Stack.Navigator>
    );
};

export default StudentStackNavigator;
