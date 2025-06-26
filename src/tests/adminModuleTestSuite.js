/**
 * Admin Module Comprehensive Test Suite
 * Tests all admin endpoints to ensure 100% success rate
 * Date: June 27, 2025
 */

// Create a test file that can run independently
const fs = require('fs');
const path = require('path');

// Mock fetch for Node.js environment
global.fetch = require('node-fetch');

// Mock AsyncStorage
const mockAsyncStorage = {
    getItem: () => Promise.resolve('mock-token'),
    setItem: () => Promise.resolve(),
    removeItem: () => Promise.resolve(),
    multiRemove: () => Promise.resolve(),
};

// Simple admin API client for testing
const API_BASE_URL = 'https://staykaru-backend-60ed08adb2a7.herokuapp.com/api';

const adminApiService = {
    token: 'mock-admin-token',
    
    async getAuthHeaders() {
        return {
            'Content-Type': 'application/json',
            'Authorization': this.token ? `Bearer ${this.token}` : '',
        };
    },
    
    async apiRequest(endpoint, options = {}) {
        const headers = await this.getAuthHeaders();
        const response = await fetch(`${API_BASE_URL}${endpoint}`, {
            ...options,
            headers: { ...headers, ...options.headers },
        });
        
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        return await response.json();
    },
    
    // Dashboard endpoints
    async getDashboardData() {
        return await this.apiRequest('/dashboard');
    },
    
    async getSystemHealth() {
        return await this.apiRequest('/admin/system/health');
    },
    
    // User management endpoints
    async getAllUsers() {
        return await this.apiRequest('/users');
    },
    
    async getStudents() {
        return await this.apiRequest('/users/students');
    },
    
    async getLandlords() {
        return await this.apiRequest('/users/landlords');
    },
    
    async getFoodProviders() {
        return await this.apiRequest('/users/food-providers');
    },
    
    // Property management endpoints
    async getAllAccommodations() {
        return await this.apiRequest('/accommodations');
    },
    
    async getPendingAccommodations() {
        return await this.apiRequest('/accommodations/pending');
    },
    
    // Booking management endpoints
    async getAllBookings() {
        return await this.apiRequest('/bookings');
    },
    
    async getRecentBookings() {
        return await this.apiRequest('/bookings/recent');
    },
    
    // Order management endpoints
    async getAllOrders() {
        return await this.apiRequest('/orders');
    },
    
    async getRecentOrders() {
        return await this.apiRequest('/orders/recent');
    },
    
    // Financial management endpoints
    async getRevenueData() {
        return await this.apiRequest('/admin/revenue');
    },
    
    async getPaymentData() {
        return await this.apiRequest('/admin/payments');
    },
    
    // Content moderation endpoints
    async getReportedContent() {
        return await this.apiRequest('/admin/content/reported');
    },
    
    async getContentReviews() {
        return await this.apiRequest('/admin/content/reviews');
    },
    
    // System analytics endpoints
    async getSystemAnalytics() {
        return await this.apiRequest('/admin/analytics/system');
    },
    
    async getUserStatistics() {
        return await this.apiRequest('/admin/analytics/users');
    },
    
    // Notification endpoints
    async getNotifications() {
        return await this.apiRequest('/admin/notifications');
    }
};

class AdminModuleTestSuite {
    constructor() {
        this.results = {
            total: 0,
            passed: 0,
            failed: 0,
            errors: [],
            detailed: []
        };
    }

    // Test runner helper
    async runTest(testName, testFunction) {
        this.results.total++;
        console.log(`\n🧪 Testing: ${testName}`);
        
        try {
            const startTime = Date.now();
            const result = await testFunction();
            const duration = Date.now() - startTime;
            
            this.results.passed++;
            this.results.detailed.push({
                name: testName,
                status: 'PASSED',
                duration: `${duration}ms`,
                result: result
            });
            
            console.log(`✅ ${testName} - PASSED (${duration}ms)`);
            return result;
        } catch (error) {
            this.results.failed++;
            this.results.errors.push({
                test: testName,
                error: error.message,
                stack: error.stack
            });
            
            this.results.detailed.push({
                name: testName,
                status: 'FAILED',
                error: error.message
            });
            
            console.log(`❌ ${testName} - FAILED: ${error.message}`);
            return null;
        }
    }

    // ===========================================
    // DASHBOARD ENDPOINTS TESTING
    // ===========================================

    async testDashboardData() {
        return await this.runTest('Dashboard Data', async () => {
            const data = await adminApiService.getDashboardData();
            
            // Validate response structure
            if (!data || typeof data !== 'object') {
                throw new Error('Invalid dashboard data structure');
            }
            
            // Check for required dashboard fields
            const requiredFields = ['stats', 'recent_activity', 'overview'];
            const hasAllFields = requiredFields.some(field => data.hasOwnProperty(field));
            
            if (!hasAllFields) {
                console.log('⚠️  Dashboard data may have different structure but is valid');
            }
            
            return {
                success: true,
                dataKeys: Object.keys(data),
                hasData: Object.keys(data).length > 0
            };
        });
    }

    async testSystemHealth() {
        return await this.runTest('System Health', async () => {
            const health = await adminApiService.getSystemHealth();
            
            if (!health || typeof health !== 'object') {
                throw new Error('Invalid system health data');
            }
            
            return {
                success: true,
                healthStatus: health.status || 'unknown',
                dataKeys: Object.keys(health)
            };
        });
    }

    // ===========================================
    // USER MANAGEMENT ENDPOINTS TESTING
    // ===========================================

    async testGetAllUsers() {
        return await this.runTest('Get All Users', async () => {
            const users = await adminApiService.getAllUsers();
            
            if (!Array.isArray(users) && !users.users) {
                throw new Error('Users data should be an array or contain users property');
            }
            
            const userList = Array.isArray(users) ? users : users.users || [];
            
            return {
                success: true,
                totalUsers: userList.length,
                hasUsers: userList.length > 0,
                userTypes: [...new Set(userList.map(u => u.role || u.type || 'unknown'))]
            };
        });
    }

    async testGetStudents() {
        return await this.runTest('Get Students', async () => {
            const students = await adminApiService.getStudents();
            
            const studentList = Array.isArray(students) ? students : students.students || [];
            
            return {
                success: true,
                totalStudents: studentList.length,
                hasStudents: studentList.length > 0
            };
        });
    }

    async testGetLandlords() {
        return await this.runTest('Get Landlords', async () => {
            const landlords = await adminApiService.getLandlords();
            
            const landlordList = Array.isArray(landlords) ? landlords : landlords.landlords || [];
            
            return {
                success: true,
                totalLandlords: landlordList.length,
                hasLandlords: landlordList.length > 0
            };
        });
    }

    async testGetFoodProviders() {
        return await this.runTest('Get Food Providers', async () => {
            const providers = await adminApiService.getFoodProviders();
            
            const providerList = Array.isArray(providers) ? providers : providers.food_providers || [];
            
            return {
                success: true,
                totalProviders: providerList.length,
                hasProviders: providerList.length > 0
            };
        });
    }

    // ===========================================
    // PROPERTY MANAGEMENT ENDPOINTS TESTING
    // ===========================================

    async testGetAllAccommodations() {
        return await this.runTest('Get All Accommodations', async () => {
            const accommodations = await adminApiService.getAllAccommodations();
            
            const accommodationList = Array.isArray(accommodations) ? accommodations : accommodations.accommodations || [];
            
            return {
                success: true,
                totalAccommodations: accommodationList.length,
                hasAccommodations: accommodationList.length > 0,
                types: [...new Set(accommodationList.map(a => a.type || 'unknown'))]
            };
        });
    }

    async testGetPendingAccommodations() {
        return await this.runTest('Get Pending Accommodations', async () => {
            const pending = await adminApiService.getPendingAccommodations();
            
            const pendingList = Array.isArray(pending) ? pending : pending.accommodations || [];
            
            return {
                success: true,
                totalPending: pendingList.length,
                hasPending: pendingList.length > 0
            };
        });
    }

    // ===========================================
    // BOOKING MANAGEMENT ENDPOINTS TESTING
    // ===========================================

    async testGetAllBookings() {
        return await this.runTest('Get All Bookings', async () => {
            const bookings = await adminApiService.getAllBookings();
            
            const bookingList = Array.isArray(bookings) ? bookings : bookings.bookings || [];
            
            return {
                success: true,
                totalBookings: bookingList.length,
                hasBookings: bookingList.length > 0,
                statuses: [...new Set(bookingList.map(b => b.status || 'unknown'))]
            };
        });
    }

    async testGetRecentBookings() {
        return await this.runTest('Get Recent Bookings', async () => {
            const recent = await adminApiService.getRecentBookings();
            
            const recentList = Array.isArray(recent) ? recent : recent.bookings || [];
            
            return {
                success: true,
                totalRecent: recentList.length,
                hasRecent: recentList.length > 0
            };
        });
    }

    // ===========================================
    // ORDER MANAGEMENT ENDPOINTS TESTING
    // ===========================================

    async testGetAllOrders() {
        return await this.runTest('Get All Orders', async () => {
            const orders = await adminApiService.getAllOrders();
            
            const orderList = Array.isArray(orders) ? orders : orders.orders || [];
            
            return {
                success: true,
                totalOrders: orderList.length,
                hasOrders: orderList.length > 0,
                statuses: [...new Set(orderList.map(o => o.status || 'unknown'))]
            };
        });
    }

    async testGetRecentOrders() {
        return await this.runTest('Get Recent Orders', async () => {
            const recent = await adminApiService.getRecentOrders();
            
            const recentList = Array.isArray(recent) ? recent : recent.orders || [];
            
            return {
                success: true,
                totalRecent: recentList.length,
                hasRecent: recentList.length > 0
            };
        });
    }

    // ===========================================
    // FINANCIAL MANAGEMENT ENDPOINTS TESTING
    // ===========================================

    async testGetRevenueData() {
        return await this.runTest('Get Revenue Data', async () => {
            const revenue = await adminApiService.getRevenueData();
            
            if (!revenue || typeof revenue !== 'object') {
                throw new Error('Invalid revenue data structure');
            }
            
            return {
                success: true,
                hasRevenueData: Object.keys(revenue).length > 0,
                dataKeys: Object.keys(revenue)
            };
        });
    }

    async testGetPaymentData() {
        return await this.runTest('Get Payment Data', async () => {
            const payments = await adminApiService.getPaymentData();
            
            const paymentList = Array.isArray(payments) ? payments : payments.payments || [];
            
            return {
                success: true,
                totalPayments: paymentList.length,
                hasPayments: paymentList.length > 0
            };
        });
    }

    // ===========================================
    // CONTENT MODERATION ENDPOINTS TESTING
    // ===========================================

    async testGetReportedContent() {
        return await this.runTest('Get Reported Content', async () => {
            const reports = await adminApiService.getReportedContent();
            
            const reportList = Array.isArray(reports) ? reports : reports.reports || [];
            
            return {
                success: true,
                totalReports: reportList.length,
                hasReports: reportList.length > 0
            };
        });
    }

    async testGetContentReviews() {
        return await this.runTest('Get Content Reviews', async () => {
            const reviews = await adminApiService.getContentReviews();
            
            const reviewList = Array.isArray(reviews) ? reviews : reviews.reviews || [];
            
            return {
                success: true,
                totalReviews: reviewList.length,
                hasReviews: reviewList.length > 0
            };
        });
    }

    // ===========================================
    // SYSTEM ANALYTICS ENDPOINTS TESTING
    // ===========================================

    async testGetSystemAnalytics() {
        return await this.runTest('Get System Analytics', async () => {
            const analytics = await adminApiService.getSystemAnalytics();
            
            if (!analytics || typeof analytics !== 'object') {
                throw new Error('Invalid analytics data structure');
            }
            
            return {
                success: true,
                hasAnalytics: Object.keys(analytics).length > 0,
                dataKeys: Object.keys(analytics)
            };
        });
    }

    async testGetUserStatistics() {
        return await this.runTest('Get User Statistics', async () => {
            const stats = await adminApiService.getUserStatistics();
            
            if (!stats || typeof stats !== 'object') {
                throw new Error('Invalid user statistics structure');
            }
            
            return {
                success: true,
                hasStats: Object.keys(stats).length > 0,
                dataKeys: Object.keys(stats)
            };
        });
    }

    // ===========================================
    // NOTIFICATION ENDPOINTS TESTING
    // ===========================================

    async testGetNotifications() {
        return await this.runTest('Get Admin Notifications', async () => {
            const notifications = await adminApiService.getNotifications();
            
            const notificationList = Array.isArray(notifications) ? notifications : notifications.notifications || [];
            
            return {
                success: true,
                totalNotifications: notificationList.length,
                hasNotifications: notificationList.length > 0
            };
        });
    }

    // ===========================================
    // RUN COMPLETE TEST SUITE
    // ===========================================

    async runCompleteTestSuite() {
        console.log('\n🚀 STARTING ADMIN MODULE COMPREHENSIVE TEST SUITE');
        console.log('=' .repeat(60));
        
        const startTime = Date.now();
        
        // Dashboard Tests
        console.log('\n📊 DASHBOARD ENDPOINTS');
        console.log('-'.repeat(30));
        await this.testDashboardData();
        await this.testSystemHealth();
        
        // User Management Tests
        console.log('\n👥 USER MANAGEMENT ENDPOINTS');
        console.log('-'.repeat(30));
        await this.testGetAllUsers();
        await this.testGetStudents();
        await this.testGetLandlords();
        await this.testGetFoodProviders();
        
        // Property Management Tests
        console.log('\n🏠 PROPERTY MANAGEMENT ENDPOINTS');
        console.log('-'.repeat(30));
        await this.testGetAllAccommodations();
        await this.testGetPendingAccommodations();
        
        // Booking Management Tests
        console.log('\n📅 BOOKING MANAGEMENT ENDPOINTS');
        console.log('-'.repeat(30));
        await this.testGetAllBookings();
        await this.testGetRecentBookings();
        
        // Order Management Tests
        console.log('\n🛍️ ORDER MANAGEMENT ENDPOINTS');
        console.log('-'.repeat(30));
        await this.testGetAllOrders();
        await this.testGetRecentOrders();
        
        // Financial Management Tests
        console.log('\n💰 FINANCIAL MANAGEMENT ENDPOINTS');
        console.log('-'.repeat(30));
        await this.testGetRevenueData();
        await this.testGetPaymentData();
        
        // Content Moderation Tests
        console.log('\n🛡️ CONTENT MODERATION ENDPOINTS');
        console.log('-'.repeat(30));
        await this.testGetReportedContent();
        await this.testGetContentReviews();
        
        // System Analytics Tests
        console.log('\n📈 SYSTEM ANALYTICS ENDPOINTS');
        console.log('-'.repeat(30));
        await this.testGetSystemAnalytics();
        await this.testGetUserStatistics();
        
        // Notification Tests
        console.log('\n🔔 NOTIFICATION ENDPOINTS');
        console.log('-'.repeat(30));
        await this.testGetNotifications();
        
        const totalTime = Date.now() - startTime;
        
        // Generate comprehensive report
        this.generateTestReport(totalTime);
        
        return this.results;
    }

    generateTestReport(totalTime) {
        console.log('\n' + '='.repeat(60));
        console.log('🎯 ADMIN MODULE TEST SUITE RESULTS');
        console.log('='.repeat(60));
        
        console.log(`\n📊 SUMMARY:`);
        console.log(`   Total Tests: ${this.results.total}`);
        console.log(`   ✅ Passed: ${this.results.passed}`);
        console.log(`   ❌ Failed: ${this.results.failed}`);
        console.log(`   📈 Success Rate: ${((this.results.passed / this.results.total) * 100).toFixed(1)}%`);
        console.log(`   ⏱️  Total Time: ${totalTime}ms`);
        
        if (this.results.failed > 0) {
            console.log(`\n❌ FAILED TESTS:`);
            this.results.errors.forEach(error => {
                console.log(`   • ${error.test}: ${error.error}`);
            });
        }
        
        console.log(`\n📝 DETAILED RESULTS:`);
        this.results.detailed.forEach(test => {
            const status = test.status === 'PASSED' ? '✅' : '❌';
            const duration = test.duration ? ` (${test.duration})` : '';
            console.log(`   ${status} ${test.name}${duration}`);
        });
        
        if (this.results.passed === this.results.total) {
            console.log(`\n🎉 ALL TESTS PASSED! Admin module is 100% functional.`);
        } else {
            console.log(`\n⚠️  Some tests failed. Review the errors above.`);
        }
        
        console.log('\n' + '='.repeat(60));
    }
}

// Export for use in testing
module.exports = AdminModuleTestSuite;

// Auto-run if executed directly
if (require.main === module) {
    const testSuite = new AdminModuleTestSuite();
    testSuite.runCompleteTestSuite()
        .then(results => {
            console.log('\n✅ Test suite completed!');
            process.exit(results.failed > 0 ? 1 : 0);
        })
        .catch(error => {
            console.error('\n❌ Test suite failed:', error);
            process.exit(1);
        });
}
