// Quick test to check data format from working endpoints
const { default: fetch } = require('node-fetch');

const API_BASE_URL = 'https://staykaru-backend-60ed08adb2a7.herokuapp.com/api';
const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2NzgzMDVlNzBlYzQ0NGQwN2EwNWZlZWMiLCJyb2xlIjoiYWRtaW4iLCJpYXQiOjE3MzY5ODg3OTQsImV4cCI6MTczNzA3NTE5NH0.pBjJLTbhB9_vL9_0ZNdJp99OEjwgaQnT3LO6d86Jvks';

async function testDataFormats() {
    console.log('🧪 Testing data formats from working endpoints...');
    
    const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
    };

    const endpoints = [
        { name: 'Dashboard', url: '/dashboard' },
        { name: 'All Users', url: '/admin/users' },
        { name: 'All Accommodations', url: '/admin/accommodations' },
        { name: 'All Food Providers', url: '/admin/food-providers' }
    ];

    for (const endpoint of endpoints) {
        try {
            console.log(`\n🔍 Testing ${endpoint.name}:`);
            const response = await fetch(`${API_BASE_URL}${endpoint.url}`, {
                method: 'GET',
                headers,
            });

            if (response.ok) {
                const data = await response.json();
                console.log(`✅ ${endpoint.name} format:`, {
                    isArray: Array.isArray(data),
                    hasData: data.data ? 'Yes' : 'No',
                    hasTotal: data.total ? 'Yes' : 'No',
                    keys: Object.keys(data),
                    firstItemKeys: Array.isArray(data) && data.length > 0 ? Object.keys(data[0]) : 
                                  data.data && data.data.length > 0 ? Object.keys(data.data[0]) : 'No items'
                });
            } else {
                console.log(`❌ ${endpoint.name} failed: ${response.status}`);
            }
        } catch (error) {
            console.error(`❌ ${endpoint.name} error:`, error.message);
        }
    }
}

testDataFormats().catch(console.error);
