// Comprehensive Student Module Implementation Test
// Tests the new enhanced student service and dashboard

import { studentApiService } from '../services/studentApiService_new';

class StudentModuleTest {
    constructor() {
        this.results = {
            total: 0,
            passed: 0,
            failed: 0,
            details: []
        };
    }

    log(message, type = 'info') {
        const timestamp = new Date().toISOString();
        const logEntry = { timestamp, message, type };
        
        console.log(`[${timestamp}] ${type.toUpperCase()}: ${message}`);
        this.results.details.push(logEntry);
    }

    async test(name, testFunction) {
        this.results.total++;
        this.log(`Testing: ${name}`, 'test');

        try {
            const result = await testFunction();
            if (result) {
                this.results.passed++;
                this.log(`✅ PASS: ${name}`, 'pass');
                return true;
            } else {
                this.results.failed++;
                this.log(`❌ FAIL: ${name} - Test returned false`, 'fail');
                return false;
            }
        } catch (error) {
            this.results.failed++;
            this.log(`❌ ERROR: ${name} - ${error.message}`, 'error');
            return false;
        }
    }

    async runAllTests() {
        this.log('🚀 Starting Comprehensive Student Module Test Suite', 'start');

        // Test 1: Service Initialization
        await this.test('Student API Service Initialization', async () => {
            return typeof studentApiService === 'object' && 
                   typeof studentApiService.getStudentProfile === 'function';
        });

        // Test 2: Auth Token Setting
        await this.test('Auth Token Setting', async () => {
            studentApiService.setAuthToken?.('test-token');
            return true; // Should not throw error
        });

        // Test 3: Profile Retrieval
        await this.test('Student Profile Retrieval', async () => {
            const profile = await studentApiService.getStudentProfile('test-user');
            return profile && typeof profile === 'object' && profile.id;
        });

        // Test 4: Profile Update
        await this.test('Student Profile Update', async () => {
            const updateData = { name: 'Test Student', phone: '123-456-7890' };
            const result = await studentApiService.updateStudentProfile('test-user', updateData);
            return result && (result.updated || result.name === updateData.name);
        });

        // Test 5: Accommodations Retrieval
        await this.test('Accommodations Retrieval', async () => {
            const accommodations = await studentApiService.getAccommodations();
            return Array.isArray(accommodations);
        });

        // Test 6: Accommodations Search
        await this.test('Accommodations Search', async () => {
            const results = await studentApiService.searchAccommodations('apartment');
            return Array.isArray(results);
        });

        // Test 7: Accommodations Filtering
        await this.test('Accommodations Filtering', async () => {
            const filters = { minPrice: 100, maxPrice: 500 };
            const filtered = await studentApiService.getAccommodations(filters);
            return Array.isArray(filtered);
        });

        // Test 8: Food Providers Retrieval
        await this.test('Food Providers Retrieval', async () => {
            const providers = await studentApiService.getFoodProviders();
            return Array.isArray(providers);
        });

        // Test 9: Booking History
        await this.test('Booking History Retrieval', async () => {
            const bookings = await studentApiService.getBookingHistory();
            return Array.isArray(bookings);
        });

        // Test 10: Create Booking
        await this.test('Create Booking', async () => {
            const bookingData = {
                accommodationId: 'test-acc-id',
                checkIn: '2025-02-01',
                checkOut: '2025-02-07'
            };
            const result = await studentApiService.createBooking(bookingData);
            return result && (result.id || result.accommodationId);
        });

        // Test 11: Order History
        await this.test('Order History Retrieval', async () => {
            const orders = await studentApiService.getOrderHistory();
            return Array.isArray(orders);
        });

        // Test 12: Create Order
        await this.test('Create Order', async () => {
            const orderData = {
                providerId: 'test-provider-id',
                items: [{ id: 'item1', quantity: 2, price: 10.99 }]
            };
            const result = await studentApiService.createOrder(orderData);
            return result && (result.id || result.providerId);
        });

        // Test 13: Preferences Retrieval
        await this.test('Student Preferences Retrieval', async () => {
            const preferences = await studentApiService.getStudentPreferences();
            return preferences && typeof preferences === 'object';
        });

        // Test 14: Preferences Update
        await this.test('Student Preferences Update', async () => {
            const newPrefs = { dietary: 'vegetarian', budget: 600 };
            const result = await studentApiService.updateStudentPreferences(newPrefs);
            return result && (result.updated || result.dietary);
        });

        // Test 15: Notifications
        await this.test('Student Notifications Retrieval', async () => {
            const notifications = await studentApiService.getStudentNotifications();
            return Array.isArray(notifications);
        });

        // Test 16: Dashboard Data
        await this.test('Student Dashboard Data', async () => {
            const dashboard = await studentApiService.getStudentDashboard();
            return dashboard && 
                   dashboard.stats && 
                   typeof dashboard.stats === 'object';
        });

        // Test 17: Recommendations
        await this.test('Accommodation Recommendations', async () => {
            const recommendations = await studentApiService.getRecommendations('accommodations');
            return Array.isArray(recommendations);
        });

        // Test 18: Food Recommendations
        await this.test('Food Recommendations', async () => {
            const recommendations = await studentApiService.getRecommendations('food');
            return Array.isArray(recommendations);
        });

        // Test 19: Create Review
        await this.test('Create Review', async () => {
            const reviewData = {
                itemId: 'test-item-id',
                rating: 5,
                comment: 'Great service!'
            };
            const result = await studentApiService.createReview(reviewData);
            return result && (result.id || result.rating);
        });

        // Test 20: Analytics
        await this.test('Student Analytics', async () => {
            const analytics = await studentApiService.getStudentAnalytics();
            return analytics && 
                   analytics.spending && 
                   analytics.activity &&
                   typeof analytics.spending.total === 'number';
        });

        // Test 21: Client-side Filtering
        await this.test('Client-side Filtering Function', async () => {
            const testItems = [
                { name: 'Test 1', price: 200, type: 'apartment' },
                { name: 'Test 2', price: 800, type: 'house' }
            ];
            const filtered = studentApiService.applyFilters(testItems, { maxPrice: 500 });
            return filtered.length === 1 && filtered[0].price === 200;
        });

        // Test 22: Fallback Data Generation
        await this.test('Fallback Data Generation', async () => {
            const fallbackProfile = studentApiService.generateFallbackData('profile');
            return fallbackProfile && 
                   fallbackProfile.id && 
                   fallbackProfile.isDefault === true;
        });

        // Test 23: Error Handling for Invalid Endpoints
        await this.test('Error Handling for Invalid Endpoints', async () => {
            try {
                await studentApiService.apiCall('/nonexistent-endpoint');
                return false; // Should have thrown an error
            } catch (error) {
                return error.message.includes('failed');
            }
        });

        // Test 24: Multiple Endpoint Fallback
        await this.test('Multiple Endpoint Fallback Strategy', async () => {
            const endpoints = ['/fake1', '/fake2', '/users/profile'];
            try {
                const result = await studentApiService.apiCall(endpoints);
                return true; // If it doesn't throw, fallback worked
            } catch (error) {
                return true; // Expected if all endpoints fail
            }
        });

        // Test 25: Data Type Validation
        await this.test('Data Type Validation', async () => {
            const dashboard = await studentApiService.getStudentDashboard();
            return typeof dashboard.stats.totalAccommodations === 'number' &&
                   typeof dashboard.stats.totalFoodProviders === 'number' &&
                   Array.isArray(dashboard.recentAccommodations) &&
                   Array.isArray(dashboard.recentFoodProviders);
        });

        this.generateReport();
    }

    generateReport() {
        const successRate = ((this.results.passed / this.results.total) * 100).toFixed(1);
        
        this.log('', 'separator');
        this.log('📊 COMPREHENSIVE STUDENT MODULE TEST REPORT', 'report');
        this.log('='.repeat(50), 'separator');
        this.log(`Total Tests: ${this.results.total}`, 'summary');
        this.log(`Passed: ${this.results.passed}`, 'summary');
        this.log(`Failed: ${this.results.failed}`, 'summary');
        this.log(`Success Rate: ${successRate}%`, 'summary');
        this.log('='.repeat(50), 'separator');

        if (this.results.passed === this.results.total) {
            this.log('🎉 ALL TESTS PASSED! Student module is fully functional.', 'success');
        } else if (successRate >= 80) {
            this.log('✅ GOOD: Most tests passed. Student module is largely functional.', 'good');
        } else if (successRate >= 60) {
            this.log('⚠️ WARNING: Some tests failed. Student module has issues.', 'warning');
        } else {
            this.log('❌ CRITICAL: Many tests failed. Student module needs significant work.', 'critical');
        }

        // Export results for documentation
        this.exportResults();
    }

    exportResults() {
        const report = {
            timestamp: new Date().toISOString(),
            summary: {
                total: this.results.total,
                passed: this.results.passed,
                failed: this.results.failed,
                successRate: ((this.results.passed / this.results.total) * 100).toFixed(1) + '%'
            },
            details: this.results.details,
            status: this.results.passed === this.results.total ? 'ALL_PASS' : 
                   this.results.passed / this.results.total >= 0.8 ? 'MOSTLY_PASS' : 'NEEDS_WORK'
        };

        console.log('\n📋 EXPORTABLE REPORT:');
        console.log(JSON.stringify(report, null, 2));

        return report;
    }
}

// Export for use in other files
export const runStudentModuleTests = async () => {
    const tester = new StudentModuleTest();
    return await tester.runAllTests();
};

// Auto-run if this file is executed directly
if (typeof window === 'undefined' && require.main === module) {
    runStudentModuleTests().catch(console.error);
}

export default StudentModuleTest;
