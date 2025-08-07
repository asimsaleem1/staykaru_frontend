// Comprehensive Backend Connectivity Test
// Tests all endpoints with real backend data

import adminApiService from '../services/adminApiService';
import { realTimeApiService } from '../services/realTimeApiService';
import backendStatusService from '../services/backendStatusService';
import authService from '../services/authService';

class ComprehensiveBackendTest {
    constructor() {
        this.results = {
            backendHealth: false,
            adminEndpoints: {},
            realTimeEndpoints: {},
            authEndpoints: {},
            overall: false
        };
        this.startTime = Date.now();
    }

    async runAllTests() {
        console.log('🚀 Starting Comprehensive Backend Connectivity Test...');
        console.log('📡 Testing connection to: https://staykaru-backend-60ed08adb2a7.herokuapp.com/api');
        
        try {
            // Test 1: Backend Health Check
            await this.testBackendHealth();
            
            // Test 2: Admin Endpoints
            await this.testAdminEndpoints();
            
            // Test 3: Real-time Endpoints
            await this.testRealTimeEndpoints();
            
            // Test 4: Auth Endpoints
            await this.testAuthEndpoints();
            
            // Calculate overall success
            this.calculateOverallSuccess();
            
            // Generate report
            this.generateReport();
            
        } catch (error) {
            console.error('❌ Comprehensive test failed:', error);
            this.results.overall = false;
        }
        
        return this.results;
    }

    async testBackendHealth() {
        console.log('\n🏥 Testing Backend Health...');
        try {
            const isHealthy = await backendStatusService.forceCheck();
            this.results.backendHealth = isHealthy;
            
            if (isHealthy) {
                console.log('✅ Backend is healthy and accessible');
            } else {
                console.log('❌ Backend is not accessible');
            }
        } catch (error) {
            console.error('❌ Backend health check failed:', error);
            this.results.backendHealth = false;
        }
    }

    async testAdminEndpoints() {
        console.log('\n👨‍💼 Testing Admin Endpoints...');
        
        const adminTests = [
            { name: 'Dashboard Data', method: () => adminApiService.getDashboardData() },
            { name: 'System Health', method: () => adminApiService.getSystemHealth() },
            { name: 'All Users', method: () => adminApiService.getAllUsers() },
            { name: 'Students', method: () => adminApiService.getStudents() },
            { name: 'Landlords', method: () => adminApiService.getLandlords() },
            { name: 'Food Providers', method: () => adminApiService.getFoodProviders() },
            { name: 'User Analytics', method: () => adminApiService.getUserAnalytics() },
            { name: 'Performance Metrics', method: () => adminApiService.getPerformanceMetrics() },
            { name: 'Revenue Analytics', method: () => adminApiService.getRevenueAnalytics() },
            { name: 'All Accommodations', method: () => adminApiService.getAllAccommodations() },
            { name: 'Pending Accommodations', method: () => adminApiService.getPendingAccommodations() },
            { name: 'Food Providers Data', method: () => adminApiService.getAllFoodProvidersData() },
            { name: 'Food Provider Analytics', method: () => adminApiService.getFoodProviderAnalytics() },
            { name: 'Reported Content', method: () => adminApiService.getReportedContent() },
            { name: 'Transaction History', method: () => adminApiService.getTransactionHistory() },
            { name: 'Recent Bookings', method: () => adminApiService.getRecentBookings() },
            { name: 'Recent Orders', method: () => adminApiService.getRecentOrders() },
            { name: 'Revenue Data', method: () => adminApiService.getRevenueData() }
        ];

        for (const test of adminTests) {
            try {
                console.log(`  Testing: ${test.name}...`);
                const result = await test.method();
                
                if (result) {
                    this.results.adminEndpoints[test.name] = {
                        status: 'success',
                        data: result,
                        timestamp: new Date().toISOString()
                    };
                    console.log(`  ✅ ${test.name}: Success`);
                } else {
                    this.results.adminEndpoints[test.name] = {
                        status: 'no_data',
                        message: 'No data returned',
                        timestamp: new Date().toISOString()
                    };
                    console.log(`  ⚠️ ${test.name}: No data`);
                }
            } catch (error) {
                this.results.adminEndpoints[test.name] = {
                    status: 'error',
                    error: error.message,
                    timestamp: new Date().toISOString()
                };
                console.log(`  ❌ ${test.name}: ${error.message}`);
            }
        }
    }

    async testRealTimeEndpoints() {
        console.log('\n🔄 Testing Real-time Endpoints...');
        
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
            try {
                console.log(`  Testing: ${test.name}...`);
                const result = await test.method();
                
                if (result) {
                    this.results.realTimeEndpoints[test.name] = {
                        status: 'success',
                        data: result,
                        timestamp: new Date().toISOString()
                    };
                    console.log(`  ✅ ${test.name}: Success`);
                } else {
                    this.results.realTimeEndpoints[test.name] = {
                        status: 'no_data',
                        message: 'No data returned',
                        timestamp: new Date().toISOString()
                    };
                    console.log(`  ⚠️ ${test.name}: No data`);
                }
            } catch (error) {
                this.results.realTimeEndpoints[test.name] = {
                    status: 'error',
                    error: error.message,
                    timestamp: new Date().toISOString()
                };
                console.log(`  ❌ ${test.name}: ${error.message}`);
            }
        }
    }

    async testAuthEndpoints() {
        console.log('\n🔐 Testing Auth Endpoints...');
        
        try {
            // Test current user retrieval
            console.log('  Testing: Get Current User...');
            const currentUser = await authService.getCurrentUser();
            
            if (currentUser) {
                this.results.authEndpoints['Get Current User'] = {
                    status: 'success',
                    data: currentUser,
                    timestamp: new Date().toISOString()
                };
                console.log('  ✅ Get Current User: Success');
            } else {
                this.results.authEndpoints['Get Current User'] = {
                    status: 'no_user',
                    message: 'No user logged in',
                    timestamp: new Date().toISOString()
                };
                console.log('  ⚠️ Get Current User: No user logged in');
            }
        } catch (error) {
            this.results.authEndpoints['Get Current User'] = {
                status: 'error',
                error: error.message,
                timestamp: new Date().toISOString()
            };
            console.log(`  ❌ Get Current User: ${error.message}`);
        }
    }

    calculateOverallSuccess() {
        const totalTests = Object.keys(this.results.adminEndpoints).length + 
                          Object.keys(this.results.realTimeEndpoints).length + 
                          Object.keys(this.results.authEndpoints).length + 1; // +1 for backend health
        
        const successfulTests = Object.values(this.results.adminEndpoints).filter(r => r.status === 'success').length +
                               Object.values(this.results.realTimeEndpoints).filter(r => r.status === 'success').length +
                               Object.values(this.results.authEndpoints).filter(r => r.status === 'success').length +
                               (this.results.backendHealth ? 1 : 0);
        
        const successRate = (successfulTests / totalTests) * 100;
        this.results.overall = successRate >= 80; // 80% success rate threshold
        
        console.log(`\n📊 Overall Success Rate: ${successRate.toFixed(1)}% (${successfulTests}/${totalTests})`);
    }

    generateReport() {
        const endTime = Date.now();
        const duration = endTime - this.startTime;
        
        console.log('\n📋 COMPREHENSIVE BACKEND TEST REPORT');
        console.log('=====================================');
        console.log(`⏱️  Test Duration: ${duration}ms`);
        console.log(`🏥 Backend Health: ${this.results.backendHealth ? '✅ Healthy' : '❌ Unhealthy'}`);
        console.log(`🎯 Overall Status: ${this.results.overall ? '✅ PASSED' : '❌ FAILED'}`);
        
        console.log('\n👨‍💼 Admin Endpoints:');
        Object.entries(this.results.adminEndpoints).forEach(([name, result]) => {
            const status = result.status === 'success' ? '✅' : result.status === 'no_data' ? '⚠️' : '❌';
            console.log(`  ${status} ${name}: ${result.status}`);
        });
        
        console.log('\n🔄 Real-time Endpoints:');
        Object.entries(this.results.realTimeEndpoints).forEach(([name, result]) => {
            const status = result.status === 'success' ? '✅' : result.status === 'no_data' ? '⚠️' : '❌';
            console.log(`  ${status} ${name}: ${result.status}`);
        });
        
        console.log('\n🔐 Auth Endpoints:');
        Object.entries(this.results.authEndpoints).forEach(([name, result]) => {
            const status = result.status === 'success' ? '✅' : result.status === 'no_data' ? '⚠️' : '❌';
            console.log(`  ${status} ${name}: ${result.status}`);
        });
        
        console.log('\n🎉 Test completed successfully!');
    }
}

// Export for use in other files
export default ComprehensiveBackendTest;

// Run test if this file is executed directly
if (typeof window !== 'undefined') {
    const test = new ComprehensiveBackendTest();
    test.runAllTests().then(results => {
        console.log('Test results:', results);
    });
} 