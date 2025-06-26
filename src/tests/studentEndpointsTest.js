// Comprehensive Student Module Endpoint Testing
const { default: fetch } = require('node-fetch');

const API_BASE_URL = 'https://staykaru-backend-60ed08adb2a7.herokuapp.com/api';

// Test credentials for student authentication
const STUDENT_CREDENTIALS = {
    email: 'student@staykaru.com',
    password: 'password123'
};

class StudentEndpointTester {
    constructor() {
        this.token = null;
        this.studentId = null;
        this.successfulEndpoints = [];
        this.failedEndpoints = [];
    }

    async authenticate() {
        console.log('[INFO] 🔐 Testing student authentication...');
        try {
            const response = await fetch(`${API_BASE_URL}/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(STUDENT_CREDENTIALS),
            });

            if (response.ok) {
                const data = await response.json();
                this.token = data.access_token || data.token;
                this.studentId = data.user?.id || data.user?.sub;
                console.log('[SUCCESS] ✅ Student authentication successful');
                console.log(`[INFO] Student ID: ${this.studentId}`);
                return true;
            } else {
                console.log('[ERROR] ❌ Student authentication failed:', response.status);
                return false;
            }
        } catch (error) {
            console.error('[ERROR] ❌ Authentication error:', error.message);
            return false;
        }
    }

    async testEndpoint(name, method, endpoint, body = null, alternatives = []) {
        console.log(`[INFO] 🧪 Testing ${name}: ${method} ${endpoint}`);
        
        const headers = {
            'Content-Type': 'application/json',
            'Authorization': this.token ? `Bearer ${this.token}` : '',
        };

        const endpoints = [endpoint, ...alternatives];
        
        for (let i = 0; i < endpoints.length; i++) {
            const currentEndpoint = endpoints[i];
            try {
                const options = {
                    method,
                    headers,
                };
                
                if (body && (method === 'POST' || method === 'PUT' || method === 'PATCH')) {
                    options.body = JSON.stringify(body);
                }

                const response = await fetch(`${API_BASE_URL}${currentEndpoint}`, options);
                
                if (response.ok) {
                    const data = await response.json();
                    console.log(`[SUCCESS] ✅ ${name} - SUCCESS (${response.status}) via ${currentEndpoint}`);
                    
                    // Log sample data structure
                    if (data) {
                        const isArray = Array.isArray(data);
                        const hasData = data.data ? 'Yes' : 'No';
                        const hasTotal = data.total !== undefined ? 'Yes' : 'No';
                        const count = isArray ? data.length : (data.data?.length || 'N/A');
                        
                        console.log(`[INFO] Data format: Array=${isArray}, HasData=${hasData}, HasTotal=${hasTotal}, Count=${count}`);
                    }
                    
                    this.successfulEndpoints.push({
                        name,
                        method,
                        endpoint: currentEndpoint,
                        status: response.status,
                        data: data
                    });
                    return data;
                } else if (response.status === 404 && i < endpoints.length - 1) {
                    console.log(`[WARNING] ⚠️ ${name} - 404 on ${currentEndpoint}, trying next...`);
                    continue;
                } else {
                    throw new Error(`HTTP ${response.status}`);
                }
            } catch (error) {
                if (i < endpoints.length - 1) {
                    console.log(`[WARNING] ⚠️ ${name} - ${error.message} on ${currentEndpoint}, trying next...`);
                } else {
                    console.log(`[ERROR] ❌ ${name} - FAILED (${error.message}) on ${currentEndpoint}`);
                    this.failedEndpoints.push({
                        name,
                        method,
                        endpoint: currentEndpoint,
                        error: error.message
                    });
                }
            }
        }
        return null;
    }

    async runAllTests() {
        console.log('[INFO] 🚀 Starting COMPREHENSIVE student endpoint testing...');
        
        // Authenticate first
        const authSuccess = await this.authenticate();
        if (!authSuccess) {
            console.log('[ERROR] ❌ Cannot proceed without authentication');
            return;
        }

        // Test Student Profile Endpoints
        await this.testEndpoint(
            'Student Profile',
            'GET',
            `/student/profile/${this.studentId}`,
            null,
            [`/student/profile`, `/users/${this.studentId}`, `/profile`]
        );

        await this.testEndpoint(
            'Update Student Profile',
            'PUT',
            `/student/profile/${this.studentId}`,
            { name: 'Test Student Updated' },
            [`/student/profile`, `/users/${this.studentId}`, `/profile`]
        );

        // Test Accommodation Endpoints
        await this.testEndpoint(
            'Browse Accommodations',
            'GET',
            '/student/accommodations',
            null,
            ['/accommodations', '/student/browse/accommodations']
        );

        await this.testEndpoint(
            'Search Accommodations',
            'GET',
            '/student/accommodations/search?query=apartment',
            null,
            ['/accommodations/search?query=apartment', '/search/accommodations?query=apartment']
        );

        await this.testEndpoint(
            'Filter Accommodations',
            'GET',
            '/student/accommodations/filter?type=apartment&minPrice=100&maxPrice=500',
            null,
            ['/accommodations/filter?type=apartment&minPrice=100&maxPrice=500']
        );

        await this.testEndpoint(
            'Accommodation Details',
            'GET',
            '/student/accommodations/507f1f77bcf86cd799439011',
            null,
            ['/accommodations/507f1f77bcf86cd799439011']
        );

        // Test Booking Endpoints
        await this.testEndpoint(
            'Student Bookings',
            'GET',
            `/student/bookings`,
            null,
            [`/student/${this.studentId}/bookings`, '/bookings']
        );

        await this.testEndpoint(
            'Create Booking',
            'POST',
            '/student/bookings',
            {
                accommodationId: '507f1f77bcf86cd799439011',
                checkIn: '2025-07-01',
                checkOut: '2025-07-31',
                guests: 1
            },
            ['/bookings']
        );

        await this.testEndpoint(
            'Booking History',
            'GET',
            `/student/bookings/history`,
            null,
            [`/student/${this.studentId}/bookings/history`, '/bookings/history']
        );

        // Test Food Provider Endpoints
        await this.testEndpoint(
            'Browse Food Providers',
            'GET',
            '/student/food-providers',
            null,
            ['/food-providers', '/student/browse/food-providers']
        );

        await this.testEndpoint(
            'Food Provider Details',
            'GET',
            '/student/food-providers/507f1f77bcf86cd799439011',
            null,
            ['/food-providers/507f1f77bcf86cd799439011']
        );

        await this.testEndpoint(
            'Food Provider Menu',
            'GET',
            '/student/food-providers/507f1f77bcf86cd799439011/menu',
            null,
            ['/food-providers/507f1f77bcf86cd799439011/menu']
        );

        // Test Order Endpoints
        await this.testEndpoint(
            'Student Orders',
            'GET',
            `/student/orders`,
            null,
            [`/student/${this.studentId}/orders`, '/orders']
        );

        await this.testEndpoint(
            'Create Order',
            'POST',
            '/student/orders',
            {
                foodProviderId: '507f1f77bcf86cd799439011',
                items: [
                    { itemId: 'item1', quantity: 2, price: 10.50 }
                ],
                deliveryAddress: 'Test Address'
            },
            ['/orders']
        );

        await this.testEndpoint(
            'Order History',
            'GET',
            `/student/orders/history`,
            null,
            [`/student/${this.studentId}/orders/history`, '/orders/history']
        );

        // Test Preferences Endpoints
        await this.testEndpoint(
            'Student Preferences',
            'GET',
            `/student/preferences`,
            null,
            [`/student/${this.studentId}/preferences`, '/preferences']
        );

        await this.testEndpoint(
            'Update Preferences',
            'PUT',
            `/student/preferences`,
            {
                accommodationType: 'apartment',
                priceRange: { min: 100, max: 500 },
                foodPreferences: ['vegetarian'],
                location: 'city center'
            },
            [`/student/${this.studentId}/preferences`, '/preferences']
        );

        // Test Recommendation Endpoints
        await this.testEndpoint(
            'Accommodation Recommendations',
            'GET',
            `/student/recommendations/accommodations`,
            null,
            [`/student/${this.studentId}/recommendations/accommodations`, '/recommendations/accommodations']
        );

        await this.testEndpoint(
            'Food Recommendations',
            'GET',
            `/student/recommendations/food`,
            null,
            [`/student/${this.studentId}/recommendations/food`, '/recommendations/food']
        );

        // Test Review Endpoints
        await this.testEndpoint(
            'Student Reviews',
            'GET',
            `/student/reviews`,
            null,
            [`/student/${this.studentId}/reviews`, '/reviews']
        );

        await this.testEndpoint(
            'Create Review',
            'POST',
            '/student/reviews',
            {
                type: 'accommodation',
                targetId: '507f1f77bcf86cd799439011',
                rating: 5,
                comment: 'Great place to stay!'
            },
            ['/reviews']
        );

        // Test Notification Endpoints
        await this.testEndpoint(
            'Student Notifications',
            'GET',
            `/student/notifications`,
            null,
            [`/student/${this.studentId}/notifications`, '/notifications']
        );

        await this.testEndpoint(
            'Mark Notification Read',
            'PUT',
            '/student/notifications/507f1f77bcf86cd799439011/read',
            null,
            ['/notifications/507f1f77bcf86cd799439011/read']
        );

        // Test Dashboard Endpoints
        await this.testEndpoint(
            'Student Dashboard',
            'GET',
            `/student/dashboard`,
            null,
            [`/student/${this.studentId}/dashboard`, '/dashboard/student']
        );

        await this.testEndpoint(
            'Student Analytics',
            'GET',
            `/student/analytics`,
            null,
            [`/student/${this.studentId}/analytics`, '/analytics/student']
        );

        // Print final results
        this.printResults();
    }

    printResults() {
        console.log('\n[INFO] 🏁 COMPREHENSIVE student testing completed!');
        console.log('[INFO] 📊 FINAL TEST SUMMARY:');
        console.log(`[INFO] Total Endpoints Tested: ${this.successfulEndpoints.length + this.failedEndpoints.length}`);
        console.log(`[SUCCESS] Successful: ${this.successfulEndpoints.length}`);
        console.log(`[ERROR] Failed: ${this.failedEndpoints.length}`);
        
        const successRate = ((this.successfulEndpoints.length / (this.successfulEndpoints.length + this.failedEndpoints.length)) * 100).toFixed(2);
        console.log(`[INFO] Success Rate: ${successRate}%`);
        
        console.log('\n[INFO] 🎯 WORKING ENDPOINTS:');
        this.successfulEndpoints.forEach(endpoint => {
            console.log(`[SUCCESS]   ✅ ${endpoint.name} -> ${endpoint.endpoint} (${endpoint.status})`);
        });
        
        if (this.failedEndpoints.length > 0) {
            console.log('\n[INFO] ❌ FAILED ENDPOINTS:');
            this.failedEndpoints.forEach(endpoint => {
                console.log(`[ERROR]   ❌ ${endpoint.name} -> ${endpoint.endpoint} (${endpoint.error})`);
            });
        }
    }
}

// Run the tests
const tester = new StudentEndpointTester();
tester.runAllTests().catch(console.error);
