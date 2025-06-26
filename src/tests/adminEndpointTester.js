/**
 * COMPREHENSIVE ADMIN MODULE ENDPOINT TESTING
 * Tests all admin endpoints for backend connectivity and functionality
 * Date: June 26, 2025
 */

const API_BASE_URL = 'https://staykaru-backend-60ed08adb2a7.herokuapp.com/api';

class AdminEndpointTester {
    constructor() {
        this.results = {
            passed: 0,
            failed: 0,
            total: 0,
            details: []
        };
        this.authToken = null;
    }

    // Test result logging
    logResult(testName, passed, details) {
        this.results.total++;
        if (passed) {
            this.results.passed++;
            console.log(`✅ ${testName}: PASSED`);
        } else {
            this.results.failed++;
            console.log(`❌ ${testName}: FAILED - ${details}`);
        }
        
        this.results.details.push({
            test: testName,
            status: passed ? 'PASSED' : 'FAILED',
            details: details,
            timestamp: new Date().toISOString()
        });
    }

    // Make authenticated API request
    async makeRequest(endpoint, method = 'GET', body = null) {
        const options = {
            method,
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
            const data = response.ok ? await response.json() : null;
            
            return {
                status: response.status,
                ok: response.ok,
                data: data
            };
        } catch (error) {
            return {
                status: 0,
                ok: false,
                error: error.message
            };
        }
    }

    // Test 1: Backend Health Check
    async testBackendHealth() {
        console.log('\n🔍 Testing Backend Health...');
        
        const response = await this.makeRequest('/health');
        const passed = response.status === 200 || response.ok;
        
        this.logResult('Backend Health Check', passed, 
            passed ? 'Backend is accessible' : `Status: ${response.status}, Error: ${response.error}`);
        
        return passed;
    }

    // Test 2: Admin Authentication
    async testAdminAuth() {
        console.log('\n🔍 Testing Admin Authentication...');
        
        const credentials = {
            email: 'admin@staykaru.com',
            password: 'admin123'
        };

        const response = await this.makeRequest('/auth/login', 'POST', credentials);
        const passed = response.ok && response.data && response.data.access_token;
        
        if (passed) {
            this.authToken = response.data.access_token;
        }
        
        this.logResult('Admin Authentication', passed, 
            passed ? 'Admin login successful' : `Status: ${response.status}, Error: ${response.error}`);
        
        return passed;
    }

    // Test 3: Admin Dashboard Stats
    async testAdminStats() {
        console.log('\n🔍 Testing Admin Stats Endpoints...');
        
        const endpoints = [
            '/admin/stats',
            '/admin/dashboard',
            '/admin/stats/realtime',
            '/stats',
            '/dashboard/stats'
        ];

        let passed = false;
        let workingEndpoint = null;

        for (const endpoint of endpoints) {
            const response = await this.makeRequest(endpoint);
            if (response.ok) {
                passed = true;
                workingEndpoint = endpoint;
                break;
            }
        }

        this.logResult('Admin Stats Endpoints', passed, 
            passed ? `Working endpoint: ${workingEndpoint}` : 'All stats endpoints failed');
        
        return passed;
    }

    // Test 4: User Management
    async testUserManagement() {
        console.log('\n🔍 Testing User Management Endpoints...');
        
        const endpoints = [
            '/admin/users',
            '/users',
            '/admin/users?limit=10',
            '/users?role=student'
        ];

        let passed = false;
        let workingEndpoint = null;

        for (const endpoint of endpoints) {
            const response = await this.makeRequest(endpoint);
            if (response.ok) {
                passed = true;
                workingEndpoint = endpoint;
                break;
            }
        }

        this.logResult('User Management', passed, 
            passed ? `Working endpoint: ${workingEndpoint}` : 'All user endpoints failed');
        
        return passed;
    }

    // Test 5: Accommodation Management
    async testAccommodationManagement() {
        console.log('\n🔍 Testing Accommodation Management...');
        
        const endpoints = [
            '/accommodations',
            '/admin/accommodations',
            '/listings',
            '/properties'
        ];

        let passed = false;
        let workingEndpoint = null;

        for (const endpoint of endpoints) {
            const response = await this.makeRequest(endpoint);
            if (response.ok) {
                passed = true;
                workingEndpoint = endpoint;
                break;
            }
        }

        this.logResult('Accommodation Management', passed, 
            passed ? `Working endpoint: ${workingEndpoint}` : 'All accommodation endpoints failed');
        
        return passed;
    }

    // Test 6: Food Provider Management
    async testFoodProviderManagement() {
        console.log('\n🔍 Testing Food Provider Management...');
        
        const endpoints = [
            '/food-providers',
            '/admin/food-providers',
            '/providers',
            '/restaurants'
        ];

        let passed = false;
        let workingEndpoint = null;

        for (const endpoint of endpoints) {
            const response = await this.makeRequest(endpoint);
            if (response.ok) {
                passed = true;
                workingEndpoint = endpoint;
                break;
            }
        }

        this.logResult('Food Provider Management', passed, 
            passed ? `Working endpoint: ${workingEndpoint}` : 'All food provider endpoints failed');
        
        return passed;
    }

    // Test 7: Order Management
    async testOrderManagement() {
        console.log('\n🔍 Testing Order Management...');
        
        const endpoints = [
            '/orders',
            '/admin/orders',
            '/bookings',
            '/transactions'
        ];

        let passed = false;
        let workingEndpoint = null;

        for (const endpoint of endpoints) {
            const response = await this.makeRequest(endpoint);
            if (response.ok) {
                passed = true;
                workingEndpoint = endpoint;
                break;
            }
        }

        this.logResult('Order Management', passed, 
            passed ? `Working endpoint: ${workingEndpoint}` : 'All order endpoints failed');
        
        return passed;
    }

    // Test 8: Financial Management
    async testFinancialManagement() {
        console.log('\n🔍 Testing Financial Management...');
        
        const endpoints = [
            '/admin/financial/revenue',
            '/admin/financial/transactions',
            '/admin/financial/reports',
            '/financial/stats',
            '/revenue',
            '/payments'
        ];

        let passed = false;
        let workingEndpoint = null;

        for (const endpoint of endpoints) {
            const response = await this.makeRequest(endpoint);
            if (response.ok) {
                passed = true;
                workingEndpoint = endpoint;
                break;
            }
        }

        this.logResult('Financial Management', passed, 
            passed ? `Working endpoint: ${workingEndpoint}` : 'All financial endpoints failed');
        
        return passed;
    }

    // Test 9: Content Moderation
    async testContentModeration() {
        console.log('\n🔍 Testing Content Moderation...');
        
        const endpoints = [
            '/admin/moderation/queue',
            '/admin/reports',
            '/moderation',
            '/admin/content/flagged',
            '/reports'
        ];

        let passed = false;
        let workingEndpoint = null;

        for (const endpoint of endpoints) {
            const response = await this.makeRequest(endpoint);
            if (response.ok) {
                passed = true;
                workingEndpoint = endpoint;
                break;
            }
        }

        this.logResult('Content Moderation', passed, 
            passed ? `Working endpoint: ${workingEndpoint}` : 'All moderation endpoints failed');
        
        return passed;
    }

    // Test 10: System Alerts & Notifications
    async testSystemAlerts() {
        console.log('\n🔍 Testing System Alerts...');
        
        const endpoints = [
            '/admin/alerts',
            '/admin/system-alerts',
            '/alerts',
            '/notifications',
            '/admin/notifications'
        ];

        let passed = false;
        let workingEndpoint = null;

        for (const endpoint of endpoints) {
            const response = await this.makeRequest(endpoint);
            if (response.ok) {
                passed = true;
                workingEndpoint = endpoint;
                break;
            }
        }

        this.logResult('System Alerts', passed, 
            passed ? `Working endpoint: ${workingEndpoint}` : 'All alert endpoints failed');
        
        return passed;
    }

    // Test 11: Reports Center
    async testReportsCenter() {
        console.log('\n🔍 Testing Reports Center...');
        
        const endpoints = [
            '/admin/reports/analytics',
            '/admin/reports',
            '/reports/dashboard',
            '/analytics',
            '/admin/analytics'
        ];

        let passed = false;
        let workingEndpoint = null;

        for (const endpoint of endpoints) {
            const response = await this.makeRequest(endpoint);
            if (response.ok) {
                passed = true;
                workingEndpoint = endpoint;
                break;
            }
        }

        this.logResult('Reports Center', passed, 
            passed ? `Working endpoint: ${workingEndpoint}` : 'All reports endpoints failed');
        
        return passed;
    }

    // Run all tests
    async runAllTests() {
        console.log('🚀 Starting Comprehensive Admin Module Endpoint Testing...');
        console.log('='.repeat(60));
        
        const startTime = Date.now();

        // Run tests in sequence
        const backendHealthy = await this.testBackendHealth();
        
        if (!backendHealthy) {
            console.log('\n❌ Backend is not accessible. Stopping tests.');
            return this.generateReport();
        }

        await this.testAdminAuth();
        await this.testAdminStats();
        await this.testUserManagement();
        await this.testAccommodationManagement();
        await this.testFoodProviderManagement();
        await this.testOrderManagement();
        await this.testFinancialManagement();
        await this.testContentModeration();
        await this.testSystemAlerts();
        await this.testReportsCenter();

        const endTime = Date.now();
        const duration = (endTime - startTime) / 1000;

        return this.generateReport(duration);
    }

    // Generate test report
    generateReport(duration = 0) {
        console.log('\n' + '='.repeat(60));
        console.log('📊 ADMIN MODULE ENDPOINT TEST REPORT');
        console.log('='.repeat(60));
        console.log(`✅ Tests Passed: ${this.results.passed}`);
        console.log(`❌ Tests Failed: ${this.results.failed}`);
        console.log(`📊 Total Tests: ${this.results.total}`);
        console.log(`⏱️  Duration: ${duration}s`);
        console.log(`📈 Success Rate: ${((this.results.passed / this.results.total) * 100).toFixed(1)}%`);
        console.log('='.repeat(60));

        // Detailed results
        console.log('\n📋 DETAILED RESULTS:');
        this.results.details.forEach((result, index) => {
            const status = result.status === 'PASSED' ? '✅' : '❌';
            console.log(`${index + 1}. ${status} ${result.test}: ${result.details}`);
        });

        return this.results;
    }
}

// Export for use in React Native app
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AdminEndpointTester;
} else if (typeof window !== 'undefined') {
    window.AdminEndpointTester = AdminEndpointTester;
}

// Auto-run if executed directly
if (typeof require !== 'undefined' && require.main === module) {
    const tester = new AdminEndpointTester();
    tester.runAllTests().then(results => {
        process.exit(results.failed > 0 ? 1 : 0);
    });
}
