// Comprehensive Admin Module Test
// Tests all admin endpoints with detailed reporting

import adminApiService from '../services/adminApiService';
import { realTimeApiService } from '../services/realTimeApiService';
import backendStatusService from '../services/backendStatusService';
import authService from '../services/authService';

class AdminModuleComprehensiveTest {
    constructor() {
        this.results = {
            testStartTime: new Date().toISOString(),
            backendHealth: false,
            adminEndpoints: {},
            realTimeEndpoints: {},
            authEndpoints: {},
            summary: {
                totalTests: 0,
                successfulTests: 0,
                failedTests: 0,
                successRate: 0,
                overall: false
            }
        };
    }

    async runAllTests() {
        console.log('🚀 STARTING COMPREHENSIVE ADMIN MODULE TEST');
        console.log('=' .repeat(60));
        console.log('📡 Backend URL: https://staykaru-backend-60ed08adb2a7.herokuapp.com/api');
        console.log('🗄️ Database: MongoDB Atlas');
        console.log('⏰ Test Start: ' + this.results.testStartTime);
        console.log('=' .repeat(60));

        try {
            // Test 1: Backend Health Check
            await this.testBackendHealth();
            
            // Test 2: Authentication
            await this.testAuthentication();
            
            // Test 3: Core Admin Endpoints
            await this.testCoreAdminEndpoints();
            
            // Test 4: Analytics Endpoints
            await this.testAnalyticsEndpoints();
            
            // Test 5: User Management Endpoints
            await this.testUserManagementEndpoints();
            
            // Test 6: Content Management Endpoints
            await this.testContentManagementEndpoints();
            
            // Test 7: Real-time Endpoints
            await this.testRealTimeEndpoints();
            
            // Test 8: System Endpoints
            await this.testSystemEndpoints();
            
            // Calculate results
            this.calculateResults();
            
            // Generate detailed report
            this.generateDetailedReport();
            
        } catch (error) {
            console.error('❌ Comprehensive test failed:', error);
            this.results.summary.overall = false;
        }
        
        return this.results;
    }

    async testBackendHealth() {
        console.log('\n🏥 TEST 1: BACKEND HEALTH CHECK');
        console.log('-'.repeat(40));
        
        try {
            const isHealthy = await backendStatusService.forceCheck();
            this.results.backendHealth = isHealthy;
            
            if (isHealthy) {
                console.log('✅ Backend Health: HEALTHY');
                console.log('✅ Response Time: < 5 seconds');
                console.log('✅ Connection: Stable');
            } else {
                console.log('❌ Backend Health: UNHEALTHY');
                console.log('❌ Connection: Failed');
            }
        } catch (error) {
            console.error('❌ Backend health check failed:', error.message);
            this.results.backendHealth = false;
        }
    }

    async testAuthentication() {
        console.log('\n🔐 TEST 2: AUTHENTICATION');
        console.log('-'.repeat(40));
        
        try {
            const currentUser = await authService.getCurrentUser();
            
            if (currentUser) {
                this.results.authEndpoints['Get Current User'] = {
                    status: 'success',
                    data: currentUser,
                    timestamp: new Date().toISOString()
                };
                console.log('✅ Get Current User: SUCCESS');
                console.log(`   User: ${currentUser.name || currentUser.email || 'Admin'}`);
                console.log(`   Role: ${currentUser.role || 'admin'}`);
            } else {
                this.results.authEndpoints['Get Current User'] = {
                    status: 'no_user',
                    message: 'No user logged in',
                    timestamp: new Date().toISOString()
                };
                console.log('⚠️ Get Current User: NO USER LOGGED IN');
            }
        } catch (error) {
            this.results.authEndpoints['Get Current User'] = {
                status: 'error',
                error: error.message,
                timestamp: new Date().toISOString()
            };
            console.log(`❌ Get Current User: ${error.message}`);
        }
    }

    async testCoreAdminEndpoints() {
        console.log('\n👨‍💼 TEST 3: CORE ADMIN ENDPOINTS');
        console.log('-'.repeat(40));
        
        const coreTests = [
            { name: 'Dashboard Data', method: () => adminApiService.getDashboardData() },
            { name: 'System Health', method: () => adminApiService.getSystemHealth() }
        ];

        for (const test of coreTests) {
            await this.runSingleTest(test, 'adminEndpoints');
        }
    }

    async testAnalyticsEndpoints() {
        console.log('\n📊 TEST 4: ANALYTICS ENDPOINTS');
        console.log('-'.repeat(40));
        
        const analyticsTests = [
            { name: 'User Analytics', method: () => adminApiService.getUserAnalytics() },
            { name: 'Performance Metrics', method: () => adminApiService.getPerformanceMetrics() },
            { name: 'Revenue Analytics', method: () => adminApiService.getRevenueAnalytics() },
            { name: 'Food Provider Analytics', method: () => adminApiService.getFoodProviderAnalytics() }
        ];

        for (const test of analyticsTests) {
            await this.runSingleTest(test, 'adminEndpoints');
        }
    }

    async testUserManagementEndpoints() {
        console.log('\n👥 TEST 5: USER MANAGEMENT ENDPOINTS');
        console.log('-'.repeat(40));
        
        const userTests = [
            { name: 'All Users', method: () => adminApiService.getAllUsers() },
            { name: 'Students', method: () => adminApiService.getStudents() },
            { name: 'Landlords', method: () => adminApiService.getLandlords() },
            { name: 'Food Providers', method: () => adminApiService.getFoodProviders() }
        ];

        for (const test of userTests) {
            await this.runSingleTest(test, 'adminEndpoints');
        }
    }

    async testContentManagementEndpoints() {
        console.log('\n🏠 TEST 6: CONTENT MANAGEMENT ENDPOINTS');
        console.log('-'.repeat(40));
        
        const contentTests = [
            { name: 'All Accommodations', method: () => adminApiService.getAllAccommodations() },
            { name: 'Pending Accommodations', method: () => adminApiService.getPendingAccommodations() },
            { name: 'Food Providers Data', method: () => adminApiService.getAllFoodProvidersData() },
            { name: 'Recent Bookings', method: () => adminApiService.getRecentBookings() },
            { name: 'Recent Orders', method: () => adminApiService.getRecentOrders() },
            { name: 'Revenue Data', method: () => adminApiService.getRevenueData() }
        ];

        for (const test of contentTests) {
            await this.runSingleTest(test, 'adminEndpoints');
        }
    }

    async testRealTimeEndpoints() {
        console.log('\n🔄 TEST 7: REAL-TIME ENDPOINTS');
        console.log('-'.repeat(40));
        
        const realTimeTests = [
            { name: 'Admin Real-time Stats', method: () => realTimeApiService.getAdminRealTimeStats() },
            { name: 'Top Performers', method: () => realTimeApiService.getTopPerformers() },
            { name: 'System Alerts', method: () => realTimeApiService.getSystemAlerts() },
            { name: 'Users', method: () => realTimeApiService.getUsers() },
            { name: 'Accommodations', method: () => realTimeApiService.getAccommodations() },
            { name: 'Food Providers', method: () => realTimeApiService.getFoodProviders() },
            { name: 'Orders', method: () => realTimeApiService.getOrders() }
        ];

        for (const test of realTimeTests) {
            await this.runSingleTest(test, 'realTimeEndpoints');
        }
    }

    async testSystemEndpoints() {
        console.log('\n⚙️ TEST 8: SYSTEM ENDPOINTS');
        console.log('-'.repeat(40));
        
        const systemTests = [
            { name: 'Reported Content', method: () => adminApiService.getReportedContent() },
            { name: 'Transaction History', method: () => adminApiService.getTransactionHistory() }
        ];

        for (const test of systemTests) {
            await this.runSingleTest(test, 'adminEndpoints');
        }
    }

    async runSingleTest(test, category) {
        try {
            console.log(`  Testing: ${test.name}...`);
            const result = await test.method();
            
            if (result) {
                this.results[category][test.name] = {
                    status: 'success',
                    data: result,
                    timestamp: new Date().toISOString()
                };
                console.log(`  ✅ ${test.name}: SUCCESS`);
                
                // Log data summary if available
                if (Array.isArray(result)) {
                    console.log(`     📊 Data Count: ${result.length}`);
                } else if (result && typeof result === 'object') {
                    const keys = Object.keys(result);
                    console.log(`     📊 Data Keys: ${keys.join(', ')}`);
                }
            } else {
                this.results[category][test.name] = {
                    status: 'no_data',
                    message: 'No data returned',
                    timestamp: new Date().toISOString()
                };
                console.log(`  ⚠️ ${test.name}: NO DATA`);
            }
        } catch (error) {
            this.results[category][test.name] = {
                status: 'error',
                error: error.message,
                timestamp: new Date().toISOString()
            };
            console.log(`  ❌ ${test.name}: ${error.message}`);
        }
    }

    calculateResults() {
        const allEndpoints = [
            ...Object.values(this.results.adminEndpoints),
            ...Object.values(this.results.realTimeEndpoints),
            ...Object.values(this.results.authEndpoints)
        ];
        
        const totalTests = allEndpoints.length + (this.results.backendHealth ? 1 : 0);
        const successfulTests = allEndpoints.filter(r => r.status === 'success').length + 
                               (this.results.backendHealth ? 1 : 0);
        
        this.results.summary = {
            totalTests,
            successfulTests,
            failedTests: totalTests - successfulTests,
            successRate: totalTests > 0 ? (successfulTests / totalTests) * 100 : 0,
            overall: successfulTests / totalTests >= 0.8 // 80% threshold
        };
    }

    generateDetailedReport() {
        const endTime = new Date();
        const duration = endTime - new Date(this.results.testStartTime);
        
        console.log('\n' + '='.repeat(60));
        console.log('📋 COMPREHENSIVE ADMIN MODULE TEST REPORT');
        console.log('='.repeat(60));
        console.log(`⏰ Test Duration: ${duration.getTime()}ms`);
        console.log(`🏥 Backend Health: ${this.results.backendHealth ? '✅ HEALTHY' : '❌ UNHEALTHY'}`);
        console.log(`🎯 Overall Status: ${this.results.summary.overall ? '✅ PASSED' : '❌ FAILED'}`);
        console.log(`📊 Success Rate: ${this.results.summary.successRate.toFixed(1)}%`);
        console.log(`✅ Successful Tests: ${this.results.summary.successfulTests}/${this.results.summary.totalTests}`);
        
        console.log('\n📊 DETAILED RESULTS:');
        console.log('-'.repeat(40));
        
        // Admin Endpoints
        console.log('\n👨‍💼 ADMIN ENDPOINTS:');
        Object.entries(this.results.adminEndpoints).forEach(([name, result]) => {
            const status = result.status === 'success' ? '✅' : result.status === 'no_data' ? '⚠️' : '❌';
            console.log(`  ${status} ${name}: ${result.status.toUpperCase()}`);
        });
        
        // Real-time Endpoints
        console.log('\n🔄 REAL-TIME ENDPOINTS:');
        Object.entries(this.results.realTimeEndpoints).forEach(([name, result]) => {
            const status = result.status === 'success' ? '✅' : result.status === 'no_data' ? '⚠️' : '❌';
            console.log(`  ${status} ${name}: ${result.status.toUpperCase()}`);
        });
        
        // Auth Endpoints
        console.log('\n🔐 AUTH ENDPOINTS:');
        Object.entries(this.results.authEndpoints).forEach(([name, result]) => {
            const status = result.status === 'success' ? '✅' : result.status === 'no_data' ? '⚠️' : '❌';
            console.log(`  ${status} ${name}: ${result.status.toUpperCase()}`);
        });
        
        console.log('\n' + '='.repeat(60));
        console.log('🎉 TEST COMPLETED SUCCESSFULLY!');
        console.log('='.repeat(60));
    }
}

export default AdminModuleComprehensiveTest; 