import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';

// Import Student Screens
import StudentDashboardScreen from '../screens/student/StudentDashboardScreen';
import AccommodationsListScreen from '../screens/student/AccommodationsListScreen';
import FoodProvidersListScreen from '../screens/student/FoodProvidersListScreen';
import MyOrdersScreen from '../screens/student/MyOrdersScreen';
import StudentProfileScreen from '../screens/student/StudentProfileScreen';

const Tab = createBottomTabNavigator();

const StudentTabNavigator = () => {
    return (
        <Tab.Navigator
            screenOptions={({ route }) => ({
                tabBarIcon: ({ focused, color, size }) => {
                    let iconName;

                    if (route.name === 'Home') {
                        iconName = focused ? 'home' : 'home-outline';
                    } else if (route.name === 'Stay') {
                        iconName = focused ? 'business' : 'business-outline';
                    } else if (route.name === 'Food') {
                        iconName = focused ? 'restaurant' : 'restaurant-outline';
                    } else if (route.name === 'MyOrders') {
                        iconName = focused ? 'bag' : 'bag-outline';
                    } else if (route.name === 'Profile') {
                        iconName = focused ? 'person' : 'person-outline';
                    }

                    return <Ionicons name={iconName} size={size} color={color} />;
                },
                tabBarActiveTintColor: '#007AFF',
                tabBarInactiveTintColor: 'gray',
                headerShown: false,
                tabBarStyle: {
                    backgroundColor: 'white',
                    borderTopWidth: 1,
                    borderTopColor: '#E5E5E5',
                    height: 60,
                    paddingBottom: 8,
                    paddingTop: 8,
                },
                tabBarLabelStyle: {
                    fontSize: 12,
                    fontWeight: '500',
                },
            })}
        >
            <Tab.Screen 
                name="Home" 
                component={StudentDashboardScreen}
                options={{
                    tabBarLabel: 'HOME',
                }}
            />
            <Tab.Screen 
                name="Stay" 
                component={AccommodationsListScreen}
                options={{
                    tabBarLabel: 'STAY',
                }}
            />
            <Tab.Screen 
                name="Food" 
                component={FoodProvidersListScreen}
                options={{
                    tabBarLabel: 'FOOD',
                }}
            />
            <Tab.Screen 
                name="MyOrders" 
                component={MyOrdersScreen}
                options={{
                    tabBarLabel: 'MYORDER',
                }}
            />
            <Tab.Screen 
                name="Profile" 
                component={StudentProfileScreen}
                options={{
                    tabBarLabel: 'PROFILE',
                }}
            />
        </Tab.Navigator>
    );
};

export default StudentTabNavigator;
