// Enhanced Admin Endpoint Testing with Alternative Endpoint Discovery
const https = require('https');
const http = require('http');

const API_BASE_URL = 'https://staykaru-backend-60ed08adb2a7.herokuapp.com/api';

class ComprehensiveAdminTester {
    constructor() {
        this.results = [];
        this.token = null;
        this.workingEndpoints = [];
        this.failedEndpoints = [];
    }

    log(message, type = 'info') {
        const timestamp = new Date().toISOString();
        const logEntry = { timestamp, message, type };
        this.results.push(logEntry);
        console.log(`[${type.toUpperCase()}] ${message}`);
    }

    makeRequest(url, options = {}) {
        return new Promise((resolve, reject) => {
            const urlObj = new URL(url);
            const isHttps = urlObj.protocol === 'https:';
            const lib = isHttps ? https : http;
            
            const reqOptions = {
                hostname: urlObj.hostname,
                port: urlObj.port || (isHttps ? 443 : 80),
                path: urlObj.pathname + urlObj.search,
                method: options.method || 'GET',
                headers: options.headers || {},
                timeout: 10000
            };

            const req = lib.request(reqOptions, (res) => {
                let data = '';
                res.on('data', (chunk) => {
                    data += chunk;
                });
                res.on('end', () => {
                    try {
                        const jsonData = data ? JSON.parse(data) : {};
                        resolve({ 
                            status: res.statusCode, 
                            data: jsonData,
                            ok: res.statusCode >= 200 && res.statusCode < 300
                        });
                    } catch (e) {
                        resolve({ 
                            status: res.statusCode, 
                            data: data,
                            ok: res.statusCode >= 200 && res.statusCode < 300
                        });
                    }
                });
            });

            req.on('error', (error) => {
                reject(error);
            });

            req.on('timeout', () => {
                req.destroy();
                reject(new Error('Request timeout'));
            });

            if (options.body) {
                req.write(options.body);
            }

            req.end();
        });
    }

    async getAuthToken() {
        try {
            this.log('🔐 Testing admin authentication...');
            
            const response = await this.makeRequest(`${API_BASE_URL}/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email: 'admin@staykaru.com',
                    password: 'admin123'
                }),
            });

            if (response.ok) {
                this.token = response.data.token || response.data.access_token;
                this.log('✅ Admin authentication successful', 'success');
                return true;
            } else {
                this.log(`❌ Admin authentication failed: ${response.status}`, 'error');
                return false;
            }
        } catch (error) {
            this.log(`❌ Admin authentication error: ${error.message}`, 'error');
            return false;
        }
    }

    getAuthHeaders() {
        return {
            'Content-Type': 'application/json',
            'Authorization': this.token ? `Bearer ${this.token}` : '',
        };
    }

    async testEndpointWithAlternatives(name, primaryEndpoint, alternatives = []) {
        const allEndpoints = [primaryEndpoint, ...alternatives];
        
        for (const endpoint of allEndpoints) {
            try {
                this.log(`🧪 Testing ${name}: GET ${endpoint}`);
                
                const response = await this.makeRequest(`${API_BASE_URL}${endpoint}`, {
                    method: 'GET',
                    headers: this.getAuthHeaders(),
                });
                
                if (response.ok) {
                    this.log(`✅ ${name} - SUCCESS (${response.status}) via ${endpoint}`, 'success');
                    this.workingEndpoints.push({ name, endpoint, status: response.status });
                    return { success: true, endpoint, data: response.data, status: response.status };
                } else if (response.status === 404) {
                    this.log(`⚠️ ${name} - 404 on ${endpoint}, trying next...`, 'warning');
                    continue;
                } else {
                    this.log(`❌ ${name} - FAILED (${response.status}) on ${endpoint}`, 'error');
                    this.failedEndpoints.push({ name, endpoint, status: response.status, reason: `HTTP ${response.status}` });
                    return { success: false, endpoint, status: response.status };
                }
            } catch (error) {
                this.log(`❌ ${name} - ERROR on ${endpoint}: ${error.message}`, 'error');
                this.failedEndpoints.push({ name, endpoint, status: 'ERROR', reason: error.message });
            }
        }
        
        this.log(`❌ ${name} - ALL ENDPOINTS FAILED`, 'error');
        return { success: false, endpoint: primaryEndpoint, status: 'ALL_FAILED' };
    }

    async runComprehensiveTests() {
        this.log('🚀 Starting COMPREHENSIVE admin endpoint testing with alternatives...');
        
        // Test authentication first
        const authSuccess = await this.getAuthToken();
        if (!authSuccess) {
            this.log('❌ Cannot proceed without authentication', 'error');
            return this.generateReport();
        }

        // Test all endpoints with alternatives
        const tests = [
            // Dashboard & Stats
            {
                name: 'Dashboard Stats',
                primary: '/admin/stats',
                alternatives: ['/dashboard/stats', '/stats', '/admin/dashboard/stats']
            },
            {
                name: 'Admin Dashboard',
                primary: '/admin/dashboard',
                alternatives: ['/dashboard', '/admin/dashboard/overview']
            },
            {
                name: 'System Health',
                primary: '/admin/health',
                alternatives: ['/health', '/admin/system/health', '/system/status']
            },
            
            // User Management (Known Working)
            {
                name: 'All Users',
                primary: '/admin/users',
                alternatives: ['/users']
            },
            {
                name: 'Students',
                primary: '/admin/users?role=student',
                alternatives: ['/users?role=student', '/students']
            },
            {
                name: 'Landlords',
                primary: '/admin/users?role=landlord',
                alternatives: ['/users?role=landlord', '/landlords']
            },
            {
                name: 'Food Providers',
                primary: '/admin/users?role=food_provider',
                alternatives: ['/users?role=food_provider', '/food-providers/users']
            },
            
            // Analytics
            {
                name: 'User Analytics',
                primary: '/admin/analytics/users',
                alternatives: ['/analytics/users', '/admin/users/analytics']
            },
            {
                name: 'Performance Metrics',
                primary: '/admin/analytics/performance',
                alternatives: ['/analytics/performance', '/admin/performance']
            },
            {
                name: 'System Analytics',
                primary: '/admin/analytics/system',
                alternatives: ['/analytics/system', '/admin/system/analytics']
            },
            
            // Content Management
            {
                name: 'All Accommodations',
                primary: '/admin/accommodations',
                alternatives: ['/accommodations']
            },
            {
                name: 'Pending Accommodations',
                primary: '/admin/accommodations?status=pending',
                alternatives: ['/accommodations?status=pending', '/admin/accommodations/pending']
            },
            {
                name: 'Accommodation Analytics',
                primary: '/admin/accommodations/analytics',
                alternatives: ['/accommodations/analytics', '/admin/analytics/accommodations']
            },
            
            // Food Provider Management
            {
                name: 'All Food Providers',
                primary: '/admin/food-providers',
                alternatives: ['/food-providers']
            },
            {
                name: 'Food Provider Analytics',
                primary: '/admin/food-providers/analytics',
                alternatives: ['/food-providers/analytics', '/admin/analytics/food-providers']
            },
            
            // Order Management
            {
                name: 'All Orders',
                primary: '/admin/orders',
                alternatives: ['/orders', '/admin/orders/all']
            },
            {
                name: 'Order Analytics',
                primary: '/admin/orders/analytics',
                alternatives: ['/orders/analytics', '/admin/analytics/orders']
            },
            
            // Moderation
            {
                name: 'Moderation Queue',
                primary: '/admin/moderation/queue',
                alternatives: ['/moderation/queue', '/admin/content/moderation', '/admin/reports/pending']
            },
            {
                name: 'Reported Content',
                primary: '/admin/moderation/reports',
                alternatives: ['/moderation/reports', '/admin/reports', '/admin/content/reports']
            },
            {
                name: 'Flagged Users',
                primary: '/admin/moderation/flagged-users',
                alternatives: ['/moderation/flagged-users', '/admin/users/flagged', '/admin/users?status=flagged']
            },
            
            // Financial Management
            {
                name: 'Revenue Analytics',
                primary: '/admin/financial/revenue',
                alternatives: ['/financial/revenue', '/admin/revenue', '/admin/analytics/revenue']
            },
            {
                name: 'Transaction History',
                primary: '/admin/financial/transactions',
                alternatives: ['/financial/transactions', '/admin/transactions', '/transactions']
            },
            {
                name: 'Payment Analytics',
                primary: '/admin/financial/payments',
                alternatives: ['/financial/payments', '/admin/payments', '/payments/analytics']
            },
            {
                name: 'Payout Management',
                primary: '/admin/financial/payouts',
                alternatives: ['/financial/payouts', '/admin/payouts', '/payouts']
            },
            
            // Reports
            {
                name: 'Generate Report',
                primary: '/admin/reports/generate',
                alternatives: ['/reports/generate', '/admin/reports/new']
            },
            {
                name: 'Report History',
                primary: '/admin/reports/history',
                alternatives: ['/reports/history', '/admin/reports', '/reports']
            },
            {
                name: 'Scheduled Reports',
                primary: '/admin/reports/scheduled',
                alternatives: ['/reports/scheduled', '/admin/reports/schedule']
            }
        ];

        // Run all tests
        for (const test of tests) {
            await this.testEndpointWithAlternatives(test.name, test.primary, test.alternatives);
        }

        return this.generateReport();
    }

    generateReport() {
        const total = this.workingEndpoints.length + this.failedEndpoints.length;
        const successful = this.workingEndpoints.length;
        const failed = this.failedEndpoints.length;
        const successRate = total > 0 ? ((successful / total) * 100) : 0;
        
        this.log('🏁 COMPREHENSIVE testing completed!');
        this.log('📊 FINAL TEST SUMMARY:', 'info');
        this.log(`Total Endpoints Tested: ${total}`, 'info');
        this.log(`Successful: ${successful}`, 'success');
        this.log(`Failed: ${failed}`, 'error');
        this.log(`Success Rate: ${successRate.toFixed(2)}%`, 'info');
        
        if (this.workingEndpoints.length > 0) {
            this.log('🎯 WORKING ENDPOINTS:', 'info');
            this.workingEndpoints.forEach(endpoint => {
                this.log(`  ✅ ${endpoint.name} -> ${endpoint.endpoint} (${endpoint.status})`, 'success');
            });
        }

        if (this.failedEndpoints.length > 0) {
            this.log('❌ FAILED ENDPOINTS (Need Backend Implementation):', 'info');
            this.failedEndpoints.forEach(endpoint => {
                this.log(`  ❌ ${endpoint.name} -> ${endpoint.endpoint} (${endpoint.reason})`, 'error');
            });
        }
        
        return {
            summary: {
                total,
                successful,
                failed,
                successRate: successRate.toFixed(2)
            },
            workingEndpoints: this.workingEndpoints,
            failedEndpoints: this.failedEndpoints,
            details: this.results
        };
    }
}

// Run the comprehensive tests
async function runComprehensiveTests() {
    const tester = new ComprehensiveAdminTester();
    await tester.runComprehensiveTests();
}

runComprehensiveTests().catch(console.error);
