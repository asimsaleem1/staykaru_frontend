// Student Endpoint Basic Test - Run from browser console
// 1. Open browser dev tools (F12)
// 2. Paste this code in console
// 3. Press Enter to run

const API_BASE_URL = 'https://staykaru-backend-60ed08adb2a7.herokuapp.com/api';

async function testStudentEndpoints() {
    console.log('🔧 Testing student endpoints...');
    
    // Get token
    let token;
    try {
        const loginResponse = await fetch(`${API_BASE_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: 'admin@staykaru.com',
                password: 'admin123'
            })
        });
        const loginData = await loginResponse.json();
        token = loginData.access_token;
        console.log('✅ Got authentication token');
    } catch (error) {
        console.error('❌ Failed to get token:', error);
        return;
    }

    const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
    };

    // Test these endpoints
    const testEndpoints = [
        '/users/profile',
        '/user/preferences', 
        '/student/preferences',
        '/profile/preferences',
        '/dashboard',
        '/student/dashboard',
        '/dashboard/student',
        '/accommodations/search',
        '/accommodations/filter',
        '/student/bookings',
        '/bookings/user',
        '/my/bookings',
        '/student/orders',
        '/orders/user',
        '/my/orders',
        '/preferences',
        '/student/summary',
        '/analytics/student',
        '/student/analytics',
        '/recommendations/accommodations',
        '/recommendations/food',
        '/accommodations/recommended',
        '/food-providers/recommended'
    ];

    const working = [];
    const failed = [];

    for (const endpoint of testEndpoints) {
        try {
            const response = await fetch(`${API_BASE_URL}${endpoint}`, {
                method: 'GET',
                headers: headers
            });
            
            if (response.ok) {
                console.log(`✅ ${endpoint} (${response.status})`);
                working.push({ endpoint, status: response.status });
            } else {
                console.log(`❌ ${endpoint} (${response.status})`);
                failed.push({ endpoint, status: response.status });
            }
        } catch (error) {
            console.log(`❌ ${endpoint} (Error: ${error.message})`);
            failed.push({ endpoint, error: error.message });
        }
        
        // Small delay between requests
        await new Promise(resolve => setTimeout(resolve, 200));
    }

    console.log('\n📊 SUMMARY:');
    console.log(`Total tested: ${testEndpoints.length}`);
    console.log(`✅ Working: ${working.length}`);
    console.log(`❌ Failed: ${failed.length}`);
    console.log(`Success rate: ${((working.length / testEndpoints.length) * 100).toFixed(1)}%`);

    if (working.length > 0) {
        console.log('\n🎯 WORKING ENDPOINTS:');
        working.forEach(ep => {
            console.log(`✅ GET ${ep.endpoint} (${ep.status})`);
        });
        
        // Export working endpoints
        console.log('\n📋 Working endpoints for code implementation:');
        console.log(JSON.stringify(working, null, 2));
    }

    return { working, failed, total: testEndpoints.length };
}

// Run the test
testStudentEndpoints().then(results => {
    console.log('Test completed. Results:', results);
}).catch(error => {
    console.error('Test failed:', error);
});
