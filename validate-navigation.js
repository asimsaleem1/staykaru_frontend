#!/usr/bin/env node
/**
 * Navigation Validation Script
 * Validates all navigation routes and screen registrations
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 Validating StayKaru Frontend Navigation...\n');

// Define required screens and their navigation names
const requiredScreens = {
  // Student Screens
  'AccommodationsList': 'src/screens/student/AccommodationsListScreen_new.js',
  'AccommodationDetails': 'src/screens/student/AccommodationDetailsScreen_new.js', 
  'FoodProvidersList': 'src/screens/student/FoodProvidersScreen_new.js',
  'FoodProviderDetails': 'src/screens/student/FoodProviderDetailsScreen_new.js',
  'FoodOrderCheckout': 'src/screens/student/FoodOrderCheckoutScreen_new.js',
  'OrderDetails': 'src/screens/student/OrderDetailsScreen_new.js',
  'MyBookings': 'src/screens/student/MyBookingsScreen_new.js',
  'MyOrders': 'src/screens/student/MyOrdersScreen_new.js',
  'MapView': 'src/screens/student/MapViewScreen_new.js',
  'Chat': 'src/screens/student/ChatScreen_new.js',
  'WriteReview': 'src/screens/student/WriteReviewScreen_new.js',
  'Support': 'src/screens/student/SupportScreen_new.js',
  'Notifications': 'src/screens/student/NotificationsScreen_new.js',
  'StudentProfile': 'src/screens/student/StudentProfileScreen_new.js',
  'SafetyEmergency': 'src/screens/student/SafetyEmergencyScreen_new.js',
  'SocialFeed': 'src/screens/student/SocialFeedScreen.js',
  'UnifiedMap': 'src/screens/student/UnifiedMapScreen.js',
  'Chatbot': 'src/screens/student/ChatbotScreen.js'
};

// Check if files exist
console.log('📁 Checking screen files existence...');
let missingFiles = [];
let existingFiles = [];

for (const [screenName, filePath] of Object.entries(requiredScreens)) {
  const fullPath = path.join(__dirname, filePath);
  if (fs.existsSync(fullPath)) {
    console.log(`✅ ${screenName}: ${filePath}`);
    existingFiles.push(screenName);
  } else {
    console.log(`❌ ${screenName}: ${filePath} - FILE NOT FOUND`);
    missingFiles.push(screenName);
  }
}

// Check AppNavigator.js for screen registrations
console.log('\n🗺️  Checking AppNavigator.js registrations...');
const appNavigatorPath = path.join(__dirname, 'src/navigation/AppNavigator.js');
if (fs.existsSync(appNavigatorPath)) {
  const appNavigatorContent = fs.readFileSync(appNavigatorPath, 'utf-8');
  
  let registeredScreens = [];
  let missingRegistrations = [];
  
  for (const screenName of existingFiles) {
    if (appNavigatorContent.includes(`name="${screenName}"`)) {
      console.log(`✅ ${screenName} - registered in AppNavigator`);
      registeredScreens.push(screenName);
    } else {
      console.log(`❌ ${screenName} - NOT registered in AppNavigator`);
      missingRegistrations.push(screenName);
    }
  }
  
  console.log(`\n📊 Registration Summary:`);
  console.log(`   ✅ Registered: ${registeredScreens.length}/${existingFiles.length}`);
  console.log(`   ❌ Missing registrations: ${missingRegistrations.length}`);
  
  if (missingRegistrations.length > 0) {
    console.log(`\n🚨 Missing registrations: ${missingRegistrations.join(', ')}`);
  }
  
} else {
  console.log('❌ AppNavigator.js not found!');
}

// Check StudentApiService methods
console.log('\n🔧 Checking StudentApiService methods...');
const apiServicePath = path.join(__dirname, 'src/services/studentApiService_new.js');
if (fs.existsSync(apiServicePath)) {
  const apiContent = fs.readFileSync(apiServicePath, 'utf-8');
  
  const requiredMethods = [
    'getAccommodations',
    'getAccommodationDetails', 
    'getFoodProviders',
    'getFoodProviderDetails',
    'getFoodProviderMenu',
    'createBooking',
    'getBookingHistory',
    'getOrderHistory',
    'createOrder',
    'getOrderDetails',
    'cancelBooking',
    'cancelOrder',
    'getChatMessages',
    'sendMessage',
    'createReview'
  ];
  
  let availableMethods = [];
  let missingMethods = [];
  
  for (const method of requiredMethods) {
    if (apiContent.includes(`async ${method}(`)) {
      console.log(`✅ ${method} - available`);
      availableMethods.push(method);
    } else {
      console.log(`❌ ${method} - NOT found`);
      missingMethods.push(method);
    }
  }
  
  console.log(`\n📊 API Methods Summary:`);
  console.log(`   ✅ Available: ${availableMethods.length}/${requiredMethods.length}`);
  console.log(`   ❌ Missing: ${missingMethods.length}`);
  
} else {
  console.log('❌ studentApiService_new.js not found!');
}

// Overall summary
console.log('\n🎯 OVERALL VALIDATION SUMMARY');
console.log('================================');
console.log(`📁 Screen Files: ${existingFiles.length}/${Object.keys(requiredScreens).length} exist`);
console.log(`🗺️  Navigation: Checked for registrations`);
console.log(`🔧 API Service: Checked for required methods`);

if (missingFiles.length === 0) {
  console.log('\n🎉 ALL SCREEN FILES EXIST!');
} else {
  console.log(`\n⚠️  ${missingFiles.length} files missing: ${missingFiles.join(', ')}`);
}

console.log('\n✅ Navigation validation complete!');
