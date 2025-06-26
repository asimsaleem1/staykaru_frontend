/**
 * REACT NATIVE ADMIN MODULE ENDPOINT TESTER
 * Can be run directly in the React Native app environment
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

const API_BASE_URL = 'https://staykaru-backend-60ed08adb2a7.herokuapp.com/api';

export class AdminModuleTester {
    constructor() {
        this.results = {
            passed: 0,
            failed: 0,
            total: 0,
            details: [],
            workingEndpoints: {}
        };
        this.authToken = null;
    }

    // Test logging
    logResult(testName, passed, details, endpoint = null) {
        this.results.total++;
        if (passed) {
            this.results.passed++;
            console.log(`✅ ${testName}: PASSED`);
            if (endpoint) {
                this.results.workingEndpoints[testName] = endpoint;
            }
        } else {
            this.results.failed++;
            console.log(`❌ ${testName}: FAILED - ${details}`);
        }
        
        this.results.details.push({
            test: testName,
            status: passed ? 'PASSED' : 'FAILED',
            details: details,
            endpoint: endpoint,
            timestamp: new Date().toISOString()
        });
    }

    // Make API request with timeout
    async makeRequest(endpoint, method = 'GET', body = null, timeout = 10000) {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), timeout);

        const options = {
            method,
            signal: controller.signal,
            headers: {
                'Content-Type': 'application/json',
                'Authorization': this.authToken ? `Bearer ${this.authToken}` : ''
            }
        };

        if (body) {
            options.body = JSON.stringify(body);
        }

        try {
            const response = await fetch(`${API_BASE_URL}${endpoint}`, options);
            clearTimeout(timeoutId);
            
            let data = null;
            try {
                data = await response.json();
            } catch (e) {
                // Response might not be JSON
            }
            
            return {
                status: response.status,
                ok: response.ok,
                data: data,
                endpoint: endpoint
            };
        } catch (error) {
            clearTimeout(timeoutId);
            return {
                status: 0,
                ok: false,
                error: error.message,
                endpoint: endpoint
            };
        }
    }

    // Test multiple endpoints and return the first working one
    async testMultipleEndpoints(testName, endpoints, method = 'GET', body = null) {
        console.log(`\n🔍 Testing ${testName}...`);
        
        for (const endpoint of endpoints) {
            const response = await this.makeRequest(endpoint, method, body, 5000);
            
            if (response.ok) {
                this.logResult(testName, true, `Working endpoint found: ${endpoint}`, endpoint);
                return { success: true, endpoint, data: response.data };
            }
            
            // Log individual endpoint failures for debugging
            console.log(`   ⚠️ ${endpoint}: ${response.status || response.error}`);
        }
        
        this.logResult(testName, false, `All endpoints failed. Tried: ${endpoints.join(', ')}`);
        return { success: false, endpoints };
    }

    // Test 1: Basic Backend Connectivity
    async testBackendConnectivity() {
        const endpoints = [
            '/health',
            '/status', 
            '/',
            '/ping',
            '/api/health'
        ];
        
        return await this.testMultipleEndpoints('Backend Connectivity', endpoints);
    }

    // Test 2: Authentication Endpoints
    async testAuthentication() {
        const endpoints = [
            '/auth/login',
            '/login',
            '/authenticate',
            '/admin/login'
        ];
        
        const credentials = [
            { email: 'admin@staykaru.com', password: 'admin123' },
            { email: 'admin@admin.com', password: 'admin' },
            { username: 'admin', password: 'admin123' }
        ];

        for (const cred of credentials) {
            const result = await this.testMultipleEndpoints('Admin Authentication', endpoints, 'POST', cred);
            if (result.success && result.data && (result.data.access_token || result.data.token)) {
                this.authToken = result.data.access_token || result.data.token;
                await AsyncStorage.setItem('adminTestToken', this.authToken);
                return result;
            }
        }
        
        return { success: false };
    }

    // Test 3: Admin Dashboard Stats
    async testAdminStats() {
        const endpoints = [
            '/admin/stats',
            '/admin/dashboard/stats',
            '/admin/dashboard',
            '/stats/admin',
            '/dashboard/admin',
            '/admin/analytics',
            '/analytics/admin'
        ];
        
        return await this.testMultipleEndpoints('Admin Stats', endpoints);
    }

    // Test 4: User Management
    async testUserManagement() {
        const endpoints = [
            '/admin/users',
            '/users',
            '/admin/user-management',
            '/user-management',
            '/admin/members',
            '/members'
        ];
        
        return await this.testMultipleEndpoints('User Management', endpoints);
    }

    // Test 5: Accommodation Management
    async testAccommodationManagement() {
        const endpoints = [
            '/accommodations',
            '/admin/accommodations',
            '/properties',
            '/admin/properties',
            '/listings',
            '/admin/listings',
            '/rentals',
            '/admin/rentals'
        ];
        
        return await this.testMultipleEndpoints('Accommodation Management', endpoints);
    }

    // Test 6: Food Provider Management
    async testFoodProviderManagement() {
        const endpoints = [
            '/food-providers',
            '/admin/food-providers',
            '/providers',
            '/admin/providers',
            '/restaurants',
            '/admin/restaurants',
            '/vendors',
            '/admin/vendors'
        ];
        
        return await this.testMultipleEndpoints('Food Provider Management', endpoints);
    }

    // Test 7: Order Management
    async testOrderManagement() {
        const endpoints = [
            '/orders',
            '/admin/orders',
            '/bookings',
            '/admin/bookings',
            '/transactions',
            '/admin/transactions',
            '/purchases',
            '/admin/purchases'
        ];
        
        return await this.testMultipleEndpoints('Order Management', endpoints);
    }

    // Test 8: Financial Management
    async testFinancialManagement() {
        const endpoints = [
            '/admin/financial',
            '/admin/finance',
            '/financial',
            '/finance',
            '/admin/revenue',
            '/revenue',
            '/admin/payments',
            '/payments'
        ];
        
        return await this.testMultipleEndpoints('Financial Management', endpoints);
    }

    // Test 9: Content Moderation
    async testContentModeration() {
        const endpoints = [
            '/admin/moderation',
            '/moderation',
            '/admin/reports',
            '/reports',
            '/admin/content',
            '/content',
            '/admin/flagged',
            '/flagged'
        ];
        
        return await this.testMultipleEndpoints('Content Moderation', endpoints);
    }

    // Test 10: System Management
    async testSystemManagement() {
        const endpoints = [
            '/admin/system',
            '/system',
            '/admin/settings',
            '/settings',
            '/admin/config',
            '/config',
            '/admin/alerts',
            '/alerts'
        ];
        
        return await this.testMultipleEndpoints('System Management', endpoints);
    }

    // Run all tests
    async runComprehensiveTest() {
        console.log('🚀 Starting Comprehensive Admin Module Testing...');
        console.log('='.repeat(60));
        
        const startTime = Date.now();

        // Try to get existing token
        try {
            this.authToken = await AsyncStorage.getItem('adminTestToken');
        } catch (e) {
            // Ignore
        }

        // Run all tests
        await this.testBackendConnectivity();
        await this.testAuthentication();
        await this.testAdminStats();
        await this.testUserManagement();
        await this.testAccommodationManagement();
        await this.testFoodProviderManagement();
        await this.testOrderManagement();
        await this.testFinancialManagement();
        await this.testContentModeration();
        await this.testSystemManagement();

        const endTime = Date.now();
        const duration = (endTime - startTime) / 1000;

        return this.generateReport(duration);
    }

    // Generate comprehensive report
    generateReport(duration = 0) {
        console.log('\n' + '='.repeat(60));
        console.log('📊 ADMIN MODULE COMPREHENSIVE TEST REPORT');
        console.log('='.repeat(60));
        console.log(`✅ Tests Passed: ${this.results.passed}`);
        console.log(`❌ Tests Failed: ${this.results.failed}`);
        console.log(`📊 Total Tests: ${this.results.total}`);
        console.log(`⏱️  Duration: ${duration}s`);
        console.log(`📈 Success Rate: ${((this.results.passed / this.results.total) * 100).toFixed(1)}%`);
        
        if (Object.keys(this.results.workingEndpoints).length > 0) {
            console.log('\n🔧 WORKING ENDPOINTS:');
            Object.entries(this.results.workingEndpoints).forEach(([test, endpoint]) => {
                console.log(`   ${test}: ${endpoint}`);
            });
        }
        
        console.log('='.repeat(60));

        // Detailed results
        console.log('\n📋 DETAILED TEST RESULTS:');
        this.results.details.forEach((result, index) => {
            const status = result.status === 'PASSED' ? '✅' : '❌';
            const endpoint = result.endpoint ? ` (${result.endpoint})` : '';
            console.log(`${index + 1}. ${status} ${result.test}${endpoint}: ${result.details}`);
        });

        return {
            ...this.results,
            duration,
            successRate: (this.results.passed / this.results.total) * 100
        };
    }
}

export default AdminModuleTester;
