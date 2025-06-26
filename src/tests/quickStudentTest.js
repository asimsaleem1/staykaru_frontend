// Simple Test Runner for Student Module
// Run this to validate the new implementation

const API_BASE_URL = 'https://staykaru-backend-60ed08adb2a7.herokuapp.com/api';

async function testStudentModuleBasics() {
    console.log('🧪 Testing Enhanced Student Module Implementation...');
    
    let passed = 0;
    let total = 0;

    function test(name, condition) {
        total++;
        if (condition) {
            console.log(`✅ ${name}`);
            passed++;
        } else {
            console.log(`❌ ${name}`);
        }
    }

    try {
        // Test 1: Check if we can import the new service
        const { studentApiService } = await import('./studentApiService_new.js');
        test('Service Import', !!studentApiService);

        // Test 2: Check service methods exist
        test('Service Methods', 
            typeof studentApiService.getStudentProfile === 'function' &&
            typeof studentApiService.getAccommodations === 'function' &&
            typeof studentApiService.getStudentDashboard === 'function'
        );

        // Test 3: Check fallback data generation
        const fallbackProfile = studentApiService.generateFallbackData('profile');
        test('Fallback Data Generation', 
            fallbackProfile && fallbackProfile.id && fallbackProfile.isDefault === true
        );

        // Test 4: Check client-side filtering
        const testItems = [
            { name: 'Test 1', price: 200, type: 'apartment' },
            { name: 'Test 2', price: 800, type: 'house' }
        ];
        const filtered = studentApiService.applyFilters(testItems, { maxPrice: 500 });
        test('Client-side Filtering', filtered.length === 1 && filtered[0].price === 200);

        // Test 5: Test API call structure
        try {
            await studentApiService.apiCall('/fake-endpoint');
        } catch (error) {
            test('Error Handling', error.message.includes('failed'));
        }

        console.log(`\n📊 Results: ${passed}/${total} tests passed (${((passed/total)*100).toFixed(1)}%)`);
        
        if (passed === total) {
            console.log('🎉 All tests passed! Student module is ready.');
        } else {
            console.log(`⚠️ ${total - passed} test(s) failed. Review implementation.`);
        }

    } catch (error) {
        console.error('❌ Test suite failed:', error);
    }
}

// Run the tests
testStudentModuleBasics();
