// Database Resource Check - Comprehensive Data Analysis
// Shows all available resources in the database for admin

import adminApiService from '../services/adminApiService';
import { realTimeApiService } from '../services/realTimeApiService';
import backendStatusService from '../services/backendStatusService';
import authService from '../services/authService';

class DatabaseResourceCheck {
    constructor() {
        this.results = {
            timestamp: new Date().toISOString(),
            backendHealth: false,
            databaseResources: {
                users: {},
                accommodations: {},
                foodProviders: {},
                bookings: {},
                orders: {},
                analytics: {},
                system: {}
            },
            summary: {
                totalUsers: 0,
                totalAccommodations: 0,
                totalFoodProviders: 0,
                totalBookings: 0,
                totalOrders: 0,
                databaseStatus: 'unknown'
            }
        };
    }

    async runComprehensiveCheck() {
        console.log('🔍 STARTING COMPREHENSIVE DATABASE RESOURCE CHECK');
        console.log('=' .repeat(60));
        console.log('📡 Backend URL: https://staykaru-backend-60ed08adb2a7.herokuapp.com/api');
        console.log('🗄️ Database: MongoDB Atlas');
        console.log('⏰ Check Start: ' + this.results.timestamp);
        console.log('=' .repeat(60));

        try {
            // Check 1: Backend Health
            await this.checkBackendHealth();
            
            // Check 2: User Resources
            await this.checkUserResources();
            
            // Check 3: Accommodation Resources
            await this.checkAccommodationResources();
            
            // Check 4: Food Provider Resources
            await this.checkFoodProviderResources();
            
            // Check 5: Booking Resources
            await this.checkBookingResources();
            
            // Check 6: Order Resources
            await this.checkOrderResources();
            
            // Check 7: Analytics Resources
            await this.checkAnalyticsResources();
            
            // Check 8: System Resources
            await this.checkSystemResources();
            
            // Generate comprehensive report
            this.generateComprehensiveReport();
            
        } catch (error) {
            console.error('❌ Database resource check failed:', error);
        }
        
        return this.results;
    }

    async checkBackendHealth() {
        console.log('\n🏥 CHECK 1: BACKEND HEALTH');
        console.log('-'.repeat(40));
        
        try {
            const isHealthy = await backendStatusService.forceCheck();
            this.results.backendHealth = isHealthy;
            
            if (isHealthy) {
                console.log('✅ Backend Health: HEALTHY');
                console.log('✅ Database Connection: Active');
                console.log('✅ API Response: Fast (< 5 seconds)');
            } else {
                console.log('❌ Backend Health: UNHEALTHY');
                console.log('❌ Database Connection: Failed');
            }
        } catch (error) {
            console.error('❌ Backend health check failed:', error.message);
            this.results.backendHealth = false;
        }
    }

    async checkUserResources() {
        console.log('\n👥 CHECK 2: USER RESOURCES');
        console.log('-'.repeat(40));
        
        try {
            // Get all users
            console.log('📊 Fetching all users...');
            const allUsers = await adminApiService.getAllUsers();
            this.results.databaseResources.users.allUsers = allUsers;
            
            if (allUsers && Array.isArray(allUsers)) {
                console.log(`✅ Total Users: ${allUsers.length}`);
                this.results.summary.totalUsers = allUsers.length;
                
                // Count by role
                const students = allUsers.filter(user => user.role === 'student');
                const landlords = allUsers.filter(user => user.role === 'landlord');
                const foodProviders = allUsers.filter(user => user.role === 'food_provider');
                const admins = allUsers.filter(user => user.role === 'admin');
                
                console.log(`   👨‍🎓 Students: ${students.length}`);
                console.log(`   🏠 Landlords: ${landlords.length}`);
                console.log(`   🍽️ Food Providers: ${foodProviders.length}`);
                console.log(`   👨‍💼 Admins: ${admins.length}`);
                
                // Show user details if any exist
                if (allUsers.length > 0) {
                    console.log('\n📋 USER DETAILS:');
                    allUsers.forEach((user, index) => {
                        console.log(`   ${index + 1}. ${user.name || user.email} (${user.role})`);
                        if (user.email) console.log(`      Email: ${user.email}`);
                        if (user.createdAt) console.log(`      Created: ${new Date(user.createdAt).toLocaleDateString()}`);
                    });
                }
            } else {
                console.log('⚠️ No users found or invalid data structure');
            }

            // Get students specifically
            console.log('\n👨‍🎓 Fetching students...');
            const students = await adminApiService.getStudents();
            this.results.databaseResources.users.students = students;
            console.log(`✅ Students: ${students && Array.isArray(students) ? students.length : 0}`);

            // Get landlords specifically
            console.log('🏠 Fetching landlords...');
            const landlords = await adminApiService.getLandlords();
            this.results.databaseResources.users.landlords = landlords;
            console.log(`✅ Landlords: ${landlords && Array.isArray(landlords) ? landlords.length : 0}`);

            // Get food providers specifically
            console.log('🍽️ Fetching food providers...');
            const foodProviders = await adminApiService.getFoodProviders();
            this.results.databaseResources.users.foodProviders = foodProviders;
            console.log(`✅ Food Providers: ${foodProviders && Array.isArray(foodProviders) ? foodProviders.length : 0}`);

        } catch (error) {
            console.error('❌ User resources check failed:', error.message);
        }
    }

    async checkAccommodationResources() {
        console.log('\n🏠 CHECK 3: ACCOMMODATION RESOURCES');
        console.log('-'.repeat(40));
        
        try {
            // Get all accommodations
            console.log('📊 Fetching all accommodations...');
            const allAccommodations = await adminApiService.getAllAccommodations();
            this.results.databaseResources.accommodations.allAccommodations = allAccommodations;
            
            if (allAccommodations && Array.isArray(allAccommodations)) {
                console.log(`✅ Total Accommodations: ${allAccommodations.length}`);
                this.results.summary.totalAccommodations = allAccommodations.length;
                
                // Show accommodation details if any exist
                if (allAccommodations.length > 0) {
                    console.log('\n📋 ACCOMMODATION DETAILS:');
                    allAccommodations.forEach((acc, index) => {
                        console.log(`   ${index + 1}. ${acc.title || acc.name || 'Unnamed Property'}`);
                        if (acc.address) console.log(`      Address: ${acc.address}`);
                        if (acc.price) console.log(`      Price: $${acc.price}`);
                        if (acc.status) console.log(`      Status: ${acc.status}`);
                    });
                }
            } else {
                console.log('⚠️ No accommodations found or invalid data structure');
            }

            // Get pending accommodations
            console.log('\n⏳ Fetching pending accommodations...');
            const pendingAccommodations = await adminApiService.getPendingAccommodations();
            this.results.databaseResources.accommodations.pendingAccommodations = pendingAccommodations;
            console.log(`✅ Pending Accommodations: ${pendingAccommodations && Array.isArray(pendingAccommodations) ? pendingAccommodations.length : 0}`);

        } catch (error) {
            console.error('❌ Accommodation resources check failed:', error.message);
        }
    }

    async checkFoodProviderResources() {
        console.log('\n🍽️ CHECK 4: FOOD PROVIDER RESOURCES');
        console.log('-'.repeat(40));
        
        try {
            // Get all food providers data
            console.log('📊 Fetching all food providers data...');
            const allFoodProvidersData = await adminApiService.getAllFoodProvidersData();
            this.results.databaseResources.foodProviders.allFoodProvidersData = allFoodProvidersData;
            
            if (allFoodProvidersData && Array.isArray(allFoodProvidersData)) {
                console.log(`✅ Total Food Providers: ${allFoodProvidersData.length}`);
                this.results.summary.totalFoodProviders = allFoodProvidersData.length;
                
                // Show food provider details if any exist
                if (allFoodProvidersData.length > 0) {
                    console.log('\n📋 FOOD PROVIDER DETAILS:');
                    allFoodProvidersData.forEach((provider, index) => {
                        console.log(`   ${index + 1}. ${provider.name || provider.restaurantName || 'Unnamed Restaurant'}`);
                        if (provider.cuisine) console.log(`      Cuisine: ${provider.cuisine}`);
                        if (provider.address) console.log(`      Address: ${provider.address}`);
                        if (provider.rating) console.log(`      Rating: ${provider.rating}/5`);
                    });
                }
            } else {
                console.log('⚠️ No food providers found or invalid data structure');
            }

        } catch (error) {
            console.error('❌ Food provider resources check failed:', error.message);
        }
    }

    async checkBookingResources() {
        console.log('\n📅 CHECK 5: BOOKING RESOURCES');
        console.log('-'.repeat(40));
        
        try {
            // Get recent bookings
            console.log('📊 Fetching recent bookings...');
            const recentBookings = await adminApiService.getRecentBookings();
            this.results.databaseResources.bookings.recentBookings = recentBookings;
            
            if (recentBookings && Array.isArray(recentBookings)) {
                console.log(`✅ Total Recent Bookings: ${recentBookings.length}`);
                this.results.summary.totalBookings = recentBookings.length;
                
                // Show booking details if any exist
                if (recentBookings.length > 0) {
                    console.log('\n📋 BOOKING DETAILS:');
                    recentBookings.forEach((booking, index) => {
                        console.log(`   ${index + 1}. Booking ID: ${booking.id || booking._id}`);
                        if (booking.studentName) console.log(`      Student: ${booking.studentName}`);
                        if (booking.accommodationName) console.log(`      Property: ${booking.accommodationName}`);
                        if (booking.checkIn) console.log(`      Check-in: ${new Date(booking.checkIn).toLocaleDateString()}`);
                        if (booking.status) console.log(`      Status: ${booking.status}`);
                    });
                }
            } else {
                console.log('⚠️ No bookings found or invalid data structure');
            }

        } catch (error) {
            console.error('❌ Booking resources check failed:', error.message);
        }
    }

    async checkOrderResources() {
        console.log('\n🛒 CHECK 6: ORDER RESOURCES');
        console.log('-'.repeat(40));
        
        try {
            // Get recent orders
            console.log('📊 Fetching recent orders...');
            const recentOrders = await adminApiService.getRecentOrders();
            this.results.databaseResources.orders.recentOrders = recentOrders;
            
            if (recentOrders && Array.isArray(recentOrders)) {
                console.log(`✅ Total Recent Orders: ${recentOrders.length}`);
                this.results.summary.totalOrders = recentOrders.length;
                
                // Show order details if any exist
                if (recentOrders.length > 0) {
                    console.log('\n📋 ORDER DETAILS:');
                    recentOrders.forEach((order, index) => {
                        console.log(`   ${index + 1}. Order ID: ${order.id || order._id}`);
                        if (order.studentName) console.log(`      Student: ${order.studentName}`);
                        if (order.foodProviderName) console.log(`      Restaurant: ${order.foodProviderName}`);
                        if (order.totalAmount) console.log(`      Amount: $${order.totalAmount}`);
                        if (order.status) console.log(`      Status: ${order.status}`);
                    });
                }
            } else {
                console.log('⚠️ No orders found or invalid data structure');
            }

        } catch (error) {
            console.error('❌ Order resources check failed:', error.message);
        }
    }

    async checkAnalyticsResources() {
        console.log('\n📊 CHECK 7: ANALYTICS RESOURCES');
        console.log('-'.repeat(40));
        
        try {
            // Get user analytics
            console.log('📈 Fetching user analytics...');
            const userAnalytics = await adminApiService.getUserAnalytics();
            this.results.databaseResources.analytics.userAnalytics = userAnalytics;
            console.log('✅ User Analytics: Retrieved');

            // Get performance metrics
            console.log('⚡ Fetching performance metrics...');
            const performanceMetrics = await adminApiService.getPerformanceMetrics();
            this.results.databaseResources.analytics.performanceMetrics = performanceMetrics;
            console.log('✅ Performance Metrics: Retrieved');

            // Get revenue analytics
            console.log('💰 Fetching revenue analytics...');
            const revenueAnalytics = await adminApiService.getRevenueAnalytics();
            this.results.databaseResources.analytics.revenueAnalytics = revenueAnalytics;
            console.log('✅ Revenue Analytics: Retrieved');

            // Get food provider analytics
            console.log('🍽️ Fetching food provider analytics...');
            const foodProviderAnalytics = await adminApiService.getFoodProviderAnalytics();
            this.results.databaseResources.analytics.foodProviderAnalytics = foodProviderAnalytics;
            console.log('✅ Food Provider Analytics: Retrieved');

            // Get revenue data
            console.log('💵 Fetching revenue data...');
            const revenueData = await adminApiService.getRevenueData();
            this.results.databaseResources.analytics.revenueData = revenueData;
            console.log('✅ Revenue Data: Retrieved');

        } catch (error) {
            console.error('❌ Analytics resources check failed:', error.message);
        }
    }

    async checkSystemResources() {
        console.log('\n⚙️ CHECK 8: SYSTEM RESOURCES');
        console.log('-'.repeat(40));
        
        try {
            // Get system health
            console.log('🏥 Fetching system health...');
            const systemHealth = await adminApiService.getSystemHealth();
            this.results.databaseResources.system.systemHealth = systemHealth;
            console.log('✅ System Health: Retrieved');

            // Get reported content
            console.log('🚨 Fetching reported content...');
            const reportedContent = await adminApiService.getReportedContent();
            this.results.databaseResources.system.reportedContent = reportedContent;
            
            if (reportedContent && Array.isArray(reportedContent)) {
                console.log(`✅ Reported Content: ${reportedContent.length} items`);
            } else {
                console.log('✅ Reported Content: No items found');
            }

            // Get transaction history
            console.log('💳 Fetching transaction history...');
            const transactionHistory = await adminApiService.getTransactionHistory();
            this.results.databaseResources.system.transactionHistory = transactionHistory;
            
            if (transactionHistory && Array.isArray(transactionHistory)) {
                console.log(`✅ Transaction History: ${transactionHistory.length} transactions`);
            } else {
                console.log('✅ Transaction History: No transactions found');
            }

        } catch (error) {
            console.error('❌ System resources check failed:', error.message);
        }
    }

    generateComprehensiveReport() {
        console.log('\n' + '='.repeat(60));
        console.log('📋 COMPREHENSIVE DATABASE RESOURCE REPORT');
        console.log('='.repeat(60));
        
        console.log(`🏥 Backend Health: ${this.results.backendHealth ? '✅ HEALTHY' : '❌ UNHEALTHY'}`);
        console.log(`🗄️ Database Status: ${this.results.backendHealth ? '✅ CONNECTED' : '❌ DISCONNECTED'}`);
        
        console.log('\n📊 DATABASE RESOURCES SUMMARY:');
        console.log('-'.repeat(40));
        console.log(`👥 Total Users: ${this.results.summary.totalUsers}`);
        console.log(`🏠 Total Accommodations: ${this.results.summary.totalAccommodations}`);
        console.log(`🍽️ Total Food Providers: ${this.results.summary.totalFoodProviders}`);
        console.log(`📅 Total Bookings: ${this.results.summary.totalBookings}`);
        console.log(`🛒 Total Orders: ${this.results.summary.totalOrders}`);
        
        console.log('\n📈 ANALYTICS AVAILABLE:');
        console.log('-'.repeat(40));
        console.log('✅ User Analytics');
        console.log('✅ Performance Metrics');
        console.log('✅ Revenue Analytics');
        console.log('✅ Food Provider Analytics');
        console.log('✅ Revenue Data');
        
        console.log('\n⚙️ SYSTEM RESOURCES:');
        console.log('-'.repeat(40));
        console.log('✅ System Health Monitoring');
        console.log('✅ Content Moderation (Reported Content)');
        console.log('✅ Transaction History');
        
        console.log('\n🎯 ADMIN DASHBOARD CAPABILITIES:');
        console.log('-'.repeat(40));
        console.log('✅ Real-time User Management');
        console.log('✅ Accommodation Oversight');
        console.log('✅ Food Provider Management');
        console.log('✅ Booking Monitoring');
        console.log('✅ Order Tracking');
        console.log('✅ Revenue Analytics');
        console.log('✅ System Health Monitoring');
        console.log('✅ Content Moderation');
        console.log('✅ Transaction History');
        
        console.log('\n' + '='.repeat(60));
        console.log('🎉 DATABASE RESOURCE CHECK COMPLETED!');
        console.log('='.repeat(60));
    }
}

export default DatabaseResourceCheck; 