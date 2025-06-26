import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';

// Import Student Screens
import StudentDashboardScreen from '../screens/student/StudentDashboardScreen';
import AccommodationsListScreen from '../screens/student/AccommodationsListScreen';
import FoodProvidersListScreen from '../screens/student/FoodProvidersListScreen';
import MyBookingsScreen from '../screens/student/MyBookingsScreen';
import MyOrdersScreen from '../screens/student/MyOrdersScreen';
import StudentProfileScreen from '../screens/student/StudentProfileScreen';
import ChatbotScreen from '../screens/student/ChatbotScreen';
import SafetyEmergencyScreen from '../screens/student/SafetyEmergencyScreen';
import SocialFeedScreen from '../screens/student/SocialFeedScreen';

const Tab = createBottomTabNavigator();

const StudentTabNavigator = () => {
    return (
        <Tab.Navigator
            screenOptions={({ route }) => ({
                tabBarIcon: ({ focused, color, size }) => {
                    let iconName;

                    if (route.name === 'Dashboard') {
                        iconName = focused ? 'home' : 'home-outline';
                    } else if (route.name === 'Accommodations') {
                        iconName = focused ? 'business' : 'business-outline';
                    } else if (route.name === 'Food') {
                        iconName = focused ? 'restaurant' : 'restaurant-outline';
                    } else if (route.name === 'Bookings') {
                        iconName = focused ? 'calendar' : 'calendar-outline';
                    } else if (route.name === 'Orders') {
                        iconName = focused ? 'bag' : 'bag-outline';
                    } else if (route.name === 'Assistant') {
                        iconName = focused ? 'chatbubble-ellipses' : 'chatbubble-ellipses-outline';
                    } else if (route.name === 'Profile') {
                        iconName = focused ? 'person' : 'person-outline';
                    } else if (route.name === 'Chatbot') {
                        iconName = focused ? 'chatbubbles' : 'chatbubbles-outline';
                    } else if (route.name === 'Safety') {
                        iconName = focused ? 'alert-circle' : 'alert-circle-outline';
                    } else if (route.name === 'Social') {
                        iconName = focused ? 'people' : 'people-outline';
                    }

                    return <Ionicons name={iconName} size={size} color={color} />;
                },
                tabBarActiveTintColor: '#3498db',
                tabBarInactiveTintColor: '#7f8c8d',
                tabBarStyle: {
                    backgroundColor: '#ffffff',
                    borderTopWidth: 1,
                    borderTopColor: '#ecf0f1',
                    height: 60,
                    paddingBottom: 8,
                    paddingTop: 8,
                },
                tabBarLabelStyle: {
                    fontSize: 12,
                    fontWeight: '600',
                },
                headerShown: false,
            })}
        >
            <Tab.Screen 
                name="Dashboard" 
                component={StudentDashboardScreen}
                options={{
                    tabBarLabel: 'Home',
                }}
            />
            <Tab.Screen 
                name="Accommodations" 
                component={AccommodationsListScreen}
                options={{
                    tabBarLabel: 'Stay',
                }}
            />
            <Tab.Screen 
                name="Food" 
                component={FoodProvidersListScreen}
                options={{
                    tabBarLabel: 'Food',
                }}
            />
            <Tab.Screen 
                name="Bookings" 
                component={MyBookingsScreen}
                options={{
                    tabBarLabel: 'My Stays',
                }}
            />
            <Tab.Screen 
                name="Orders" 
                component={MyOrdersScreen}
                options={{
                    tabBarLabel: 'My Orders',
                }}
            />
            <Tab.Screen 
                name="Assistant" 
                component={ChatbotScreen}
                options={{
                    tabBarLabel: 'Assistant',
                }}
            />
            <Tab.Screen 
                name="Profile" 
                component={StudentProfileScreen}
                options={{
                    tabBarLabel: 'Profile',
                }}
            />
            <Tab.Screen 
                name="Chatbot" 
                component={ChatbotScreen}
                options={{
                    tabBarLabel: 'Chat',
                }}
            />
            <Tab.Screen 
                name="Safety" 
                component={SafetyEmergencyScreen}
                options={{
                    tabBarLabel: 'Safety',
                }}
            />
            <Tab.Screen 
                name="Social" 
                component={SocialFeedScreen}
                options={{
                    tabBarLabel: 'Social',
                }}
            />
        </Tab.Navigator>
    );
};

export default StudentTabNavigator;
