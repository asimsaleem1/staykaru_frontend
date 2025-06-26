// Node.js Compatible Admin Endpoint Testing
const https = require('https');
const http = require('http');

const API_BASE_URL = 'https://staykaru-backend-60ed08adb2a7.herokuapp.com/api';

class AdminEndpointTester {
    constructor() {
        this.results = [];
        this.token = null;
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

    async testEndpoint(name, endpoint, method = 'GET', body = null) {
        try {
            this.log(`🧪 Testing ${name}: ${method} ${endpoint}`);
            
            const options = {
                method,
                headers: this.getAuthHeaders(),
            };

            if (body && (method === 'POST' || method === 'PUT')) {
                options.body = JSON.stringify(body);
            }

            const response = await this.makeRequest(`${API_BASE_URL}${endpoint}`, options);
            
            if (response.ok) {
                this.log(`✅ ${name} - SUCCESS (${response.status})`, 'success');
                return { success: true, data: response.data, status: response.status };
            } else {
                this.log(`❌ ${name} - FAILED (${response.status})`, 'error');
                return { success: false, status: response.status };
            }
        } catch (error) {
            this.log(`❌ ${name} - ERROR: ${error.message}`, 'error');
            return { success: false, error: error.message };
        }
    }

    async runAllTests() {
        this.log('🚀 Starting comprehensive admin endpoint testing...');
        
        // Test authentication first
        const authSuccess = await this.getAuthToken();
        if (!authSuccess) {
            this.log('❌ Cannot proceed without authentication', 'error');
            return this.results;
        }

        // Core Admin Endpoints
        await this.testEndpoint('Admin Dashboard Stats', '/admin/stats');
        await this.testEndpoint('Admin Dashboard', '/admin/dashboard');
        await this.testEndpoint('System Health', '/admin/health');
        
        // User Management Endpoints
        await this.testEndpoint('Get All Users', '/admin/users');
        await this.testEndpoint('Get Students', '/admin/users?role=student');
        await this.testEndpoint('Get Landlords', '/admin/users?role=landlord');
        await this.testEndpoint('Get Food Providers', '/admin/users?role=food_provider');
        
        // Content Moderation Endpoints
        await this.testEndpoint('Moderation Queue', '/admin/moderation/queue');
        await this.testEndpoint('Reported Content', '/admin/moderation/reports');
        await this.testEndpoint('Flagged Users', '/admin/moderation/flagged-users');
        
        // Financial Management Endpoints
        await this.testEndpoint('Revenue Analytics', '/admin/financial/revenue');
        await this.testEndpoint('Transaction History', '/admin/financial/transactions');
        await this.testEndpoint('Payment Analytics', '/admin/financial/payments');
        await this.testEndpoint('Payout Management', '/admin/financial/payouts');
        
        // System Analytics Endpoints
        await this.testEndpoint('System Analytics', '/admin/analytics/system');
        await this.testEndpoint('User Analytics', '/admin/analytics/users');
        await this.testEndpoint('Performance Metrics', '/admin/analytics/performance');
        
        // Reports Center Endpoints
        await this.testEndpoint('Generate Report', '/admin/reports/generate');
        await this.testEndpoint('Report History', '/admin/reports/history');
        await this.testEndpoint('Scheduled Reports', '/admin/reports/scheduled');
        
        // Accommodation Management
        await this.testEndpoint('All Accommodations', '/admin/accommodations');
        await this.testEndpoint('Pending Accommodations', '/admin/accommodations?status=pending');
        await this.testEndpoint('Accommodation Analytics', '/admin/accommodations/analytics');
        
        // Food Provider Management
        await this.testEndpoint('All Food Providers', '/admin/food-providers');
        await this.testEndpoint('Food Provider Analytics', '/admin/food-providers/analytics');
        
        // Order Management
        await this.testEndpoint('All Orders', '/admin/orders');
        await this.testEndpoint('Order Analytics', '/admin/orders/analytics');
        
        // Alternative endpoint patterns
        await this.testEndpoint('Stats (Alternative)', '/stats');
        await this.testEndpoint('Dashboard (Alternative)', '/dashboard');
        await this.testEndpoint('Users (Alternative)', '/users');
        await this.testEndpoint('Accommodations (Alternative)', '/accommodations');
        await this.testEndpoint('Orders (Alternative)', '/orders');
        
        this.log('🏁 Admin endpoint testing completed!');
        this.generateSummary();
        return this.results;
    }

    generateSummary() {
        const testResults = this.results.filter(r => r.message.includes('Testing'));
        const total = testResults.length;
        const successful = this.results.filter(r => r.type === 'success').length;
        const failed = this.results.filter(r => r.type === 'error' && r.message.includes('FAILED')).length;
        
        this.log('📊 TEST SUMMARY:', 'info');
        this.log(`Total Endpoints Tested: ${total}`, 'info');
        this.log(`Successful: ${successful}`, 'success');
        this.log(`Failed: ${failed}`, 'error');
        this.log(`Success Rate: ${total > 0 ? ((successful / total) * 100).toFixed(2) : 0}%`, 'info');
        
        // List working endpoints
        const workingEndpoints = this.results
            .filter(r => r.type === 'success' && r.message.includes('SUCCESS'))
            .map(r => r.message.split(' - ')[0].replace('✅ ', ''));
        
        if (workingEndpoints.length > 0) {
            this.log('🎯 WORKING ENDPOINTS:', 'info');
            workingEndpoints.forEach(endpoint => this.log(`  ✅ ${endpoint}`, 'success'));
        }
    }
}

// Run the tests
async function runTests() {
    const tester = new AdminEndpointTester();
    await tester.runAllTests();
}

runTests().catch(console.error);
