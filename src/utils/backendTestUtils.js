import { realTimeApiService } from '../services/realTimeApiService';

export const testBackendEndpoints = async () => {
    const endpoints = [
        { name: 'Admin Real-Time Stats', method: () => realTimeApiService.getAdminRealTimeStats() },
        { name: 'Users', method: () => realTimeApiService.getUsers() },
        { name: 'Accommodations', method: () => realTimeApiService.getAccommodations() },
        { name: 'Food Providers', method: () => realTimeApiService.getFoodProviders() },
        { name: 'Orders', method: () => realTimeApiService.getOrders() }
    ];

    console.log('🔍 Testing Backend Endpoints...');
    
    for (const endpoint of endpoints) {
        try {
            console.log(`Testing ${endpoint.name}...`);
            const result = await endpoint.method();
            console.log(`✅ ${endpoint.name}: Success`, result.data ? `(${result.data.length} items)` : '');
        } catch (error) {
            console.error(`❌ ${endpoint.name}: Failed`, error.message);
        }
    }
    
    console.log('🏁 Backend endpoint testing complete');
};

export const quickEndpointCheck = async () => {
    try {
        const result = await realTimeApiService.getAdminRealTimeStats();
        console.log('✅ Quick admin stats check:', result);
        return true;
    } catch (error) {
        console.error('❌ Quick admin stats check failed:', error);
        return false;
    }
};
