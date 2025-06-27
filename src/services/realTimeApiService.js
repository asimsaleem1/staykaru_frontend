import AsyncStorage from '@react-native-async-storage/async-storage';
import backendStatusService from './backendStatusService';

const API_BASE_URL = 'https://staykaru-backend-60ed08adb2a7.herokuapp.com/api';

class RealTimeApiService {
    constructor() {
        this.token = null;
        this.refreshInterval = null;
        this.callbacks = new Map();
    }

    async getAuthHeaders() {
        if (!this.token) {
            this.token = await AsyncStorage.getItem('token');
        }
        console.log('RealTimeApiService using token:', this.token);
        return {
            'Content-Type': 'application/json',
            'Authorization': this.token ? `Bearer ${this.token}` : '',
        };
    }

    async getUserRole() {
        try {
            const userData = await AsyncStorage.getItem('user');
            if (userData) {
                const user = JSON.parse(userData);
                return user.role;
            }
        } catch (e) {}
        return null;
    }

    // Real-time subscription system
    subscribe(key, callback) {
        if (!this.callbacks.has(key)) {
            this.callbacks.set(key, []);
        }
        this.callbacks.get(key).push(callback);
    }

    unsubscribe(key, callback) {
        if (this.callbacks.has(key)) {
            const callbacks = this.callbacks.get(key);
            const index = callbacks.indexOf(callback);
            if (index > -1) {
                callbacks.splice(index, 1);
            }
        }
    }

    notifySubscribers(key, data) {
        if (this.callbacks.has(key)) {
            this.callbacks.get(key).forEach(callback => {
                try {
                    callback(data);
                } catch (error) {
                    console.error('Error in callback:', error);
                }
            });
        }
    }

    // Start real-time updates
    startRealTimeUpdates() {
        console.log('🔄 Starting real-time updates...');
        if (this.refreshInterval) {
            clearInterval(this.refreshInterval);
        }

        // Check backend health before starting
        backendStatusService.checkBackendHealth().then(isHealthy => {
            if (!isHealthy) {
                console.log('⚠️ Backend is unavailable, real-time updates disabled');
                // Return empty data immediately to avoid errors
                this.notifySubscribers('adminStats', this.getEmptyStats());
                this.notifySubscribers('accommodations', { data: [], total: 0 });
                this.notifySubscribers('foodProviders', { data: [], total: 0 });
                this.notifySubscribers('orders', { data: [], total: 0 });
                return;
            }

            console.log('✅ Backend is healthy, starting real-time updates');

            this.refreshInterval = setInterval(async () => {
                try {
                    // Only fetch if backend is still healthy
                    if (backendStatusService.getCurrentStatus()) {
                        await this.fetchAndNotifyAll();
                    } else {
                        // Backend went down, stop updates and notify with empty data
                        this.stopRealTimeUpdates();
                        this.notifySubscribers('adminStats', this.getEmptyStats());
                        this.notifySubscribers('accommodations', { data: [], total: 0 });
                        this.notifySubscribers('foodProviders', { data: [], total: 0 });
                        this.notifySubscribers('orders', { data: [], total: 0 });
                    }
                } catch (error) {
                    console.error('Real-time update error:', error);
                    this.stopRealTimeUpdates();
                }
            }, 60000); // Every 60 seconds

            // Initial fetch only if backend is healthy
            this.fetchAndNotifyAll();
        });
    }

    stopRealTimeUpdates() {
        console.log('⏹️ Stopping real-time updates...');
        if (this.refreshInterval) {
            clearInterval(this.refreshInterval);
            this.refreshInterval = null;
        }
    }

    async fetchAndNotifyAll() {
        try {
            const isHealthy = backendStatusService.getCurrentStatus();
            if (!isHealthy) {
                console.warn('⚠️ Backend unavailable, skipping real-time fetch');
                return;
            }

            const role = await this.getUserRole();

            let adminStats = null;
            let accommodations = { data: [], total: 0, page: 1 };
            let foodProviders = { data: [], total: 0, page: 1 };
            let orders = { data: [], total: 0, page: 1 };

            if (role === 'admin') {
                [adminStats, accommodations, foodProviders, orders] = await Promise.all([
                    this.getAdminRealTimeStats(),
                    this.getAccommodations(),
                    this.getFoodProviders(),
                    this.getOrders()
                ]);
            } else if (role === 'food_provider') {
                // For food providers, only fetch their own stats/orders (customize as needed)
                adminStats = await this.getAdminRealTimeStats(); // or a food provider dashboard endpoint
                // Optionally, fetch provider-specific orders, analytics, etc.
                // accommodations and foodProviders remain empty
                orders = await this.getOrders(); // or a provider-specific orders endpoint
            }

            this.notifySubscribers('adminStats', adminStats);
            this.notifySubscribers('accommodations', accommodations);
            this.notifySubscribers('foodProviders', foodProviders);
            this.notifySubscribers('orders', orders);

        } catch (error) {
            console.error('Error fetching real-time data:', error);
            this.stopRealTimeUpdates();
        }
    }

    // Helper method to get empty stats structure
    getEmptyStats() {
        return {
            stats: {
                totalUsers: 0,
                totalStudents: 0,
                totalLandlords: 0,
                totalFoodProviders: 0,
                totalAccommodations: 0,
                totalOrders: 0,
                totalRevenue: 0,
                activeBookings: 0,
                pendingApprovals: 0,
                systemHealth: 'Backend Unavailable',
                onlineUsers: 0,
                newRegistrationsToday: 0,
                bookingsToday: 0,
                ordersToday: 0
            },
            recentActivity: []
        };
    }

    // Admin Real-Time Statistics - UPDATED TO USE WORKING ENDPOINTS ONLY
    async getAdminRealTimeStats() {
        try {
            // Skip if backend is known to be down
            if (!backendStatusService.getCurrentStatus()) {
                return this.getEmptyStats();
            }

            const headers = await this.getAuthHeaders();
            console.log('📊 Fetching admin stats from working /dashboard endpoint...');
            
            // Use the working /dashboard endpoint (confirmed in tests)
            const response = await fetch(`${API_BASE_URL}/dashboard`, {
                method: 'GET',
                headers,
            });

            if (response.ok) {
                const data = await response.json();
                console.log('✅ Real admin stats received from backend');
                return data;
            } else {
                throw new Error(`HTTP ${response.status}`);
            }
            
        } catch (error) {
            // Only log if backend was supposed to be available
            if (backendStatusService.getCurrentStatus()) {
                console.error('❌ Unexpected admin stats error:', error.message);
            }
            
            // Return empty stats when backend fails
            return this.getEmptyStats();
        }
    }

    // Get Top Performers from Backend - 100% BACKEND DATA
    async getTopPerformers() {
        try {
            if (!backendStatusService.getCurrentStatus()) {
                return { data: [] };
            }

            const headers = await this.getAuthHeaders();
            const endpoints = ['/admin/top-performers', '/users?sort=rating', '/landlords?sort=rating'];
            
            for (const endpoint of endpoints) {
                try {
                    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
                        method: 'GET',
                        headers,
                    });
                    
                    if (response.ok) {
                        const data = await response.json();
                        console.log('✅ Top performers received from backend');
                        return data;
                    } else if (response.status !== 404) {
                        break;
                    }
                } catch (endpointError) {
                    // Silently try next endpoint
                }
            }
            
            throw new Error('All top performers endpoints failed');
        } catch (error) {
            if (backendStatusService.getCurrentStatus()) {
                console.error('❌ Unexpected top performers error:', error.message);
            }
            return { data: [] };
        }
    }

    // Get System Alerts from Backend - 100% BACKEND DATA
    async getSystemAlerts() {
        try {
            if (!backendStatusService.getCurrentStatus()) {
                return { data: [] };
            }

            const headers = await this.getAuthHeaders();
            const endpoints = ['/admin/alerts', '/alerts', '/notifications'];
            
            for (const endpoint of endpoints) {
                try {
                    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
                        method: 'GET',
                        headers,
                    });
                    
                    if (response.ok) {
                        const data = await response.json();
                        console.log('✅ System alerts received from backend');
                        return data;
                    } else if (response.status !== 404) {
                        break;
                    }
                } catch (endpointError) {
                    // Silently try next endpoint
                }
            }
            
            throw new Error('All system alerts endpoints failed');
        } catch (error) {
            if (backendStatusService.getCurrentStatus()) {
                console.error('❌ Unexpected system alerts error:', error.message);
            }
            return { data: [] };
        }
    }

    // Get Users with real-time updates - 100% BACKEND DATA
    async getUsers(params = {}) {
        try {
            const headers = await this.getAuthHeaders();
            const queryParams = new URLSearchParams(params).toString();
            const response = await fetch(`${API_BASE_URL}/admin/users?${queryParams}`, {
                method: 'GET',
                headers,
            });

            if (response.ok) {
                const data = await response.json();
                console.log('✅ Real users data received from backend:', data);
                this.notifySubscribers('users', data);
                return data;
            } else {
                throw new Error(`HTTP ${response.status}`);
            }
        } catch (error) {
            console.error('❌ Real-time API: Users error:', error.message);
            const emptyData = { data: [], total: 0, page: 1 };
            this.notifySubscribers('users', emptyData);
            return emptyData;
        }
    }

    // Get Accommodations with real-time updates - UPDATED TO USE WORKING ENDPOINTS
    async getAccommodations(params = {}) {
        try {
            // Skip if backend is known to be down
            if (!backendStatusService.getCurrentStatus()) {
                const emptyData = { data: [], total: 0, page: 1 };
                this.notifySubscribers('accommodations', emptyData);
                return emptyData;
            }

            const headers = await this.getAuthHeaders();
            const queryParams = new URLSearchParams({
                limit: 50,
                sortBy: 'createdAt_desc',
                ...params
            }).toString();
            
            // Use working /admin/accommodations endpoint (confirmed in tests)
            const response = await fetch(`${API_BASE_URL}/admin/accommodations?${queryParams}`, {
                method: 'GET',
                headers,
            });

            if (response.ok) {
                const data = await response.json();
                this.notifySubscribers('accommodations', data);
                return data;
            } else {
                throw new Error(`HTTP ${response.status}`);
            }
        } catch (error) {
            // Only log if backend was supposed to be available
            if (backendStatusService.getCurrentStatus()) {
                console.error('❌ Real-time API: Accommodations error:', error.message);
            }
            const emptyData = { data: [], total: 0, page: 1 };
            this.notifySubscribers('accommodations', emptyData);
            return emptyData;
        }
    }

    // Get Food Providers with real-time updates - UPDATED TO USE WORKING ENDPOINTS
    async getFoodProviders(params = {}) {
        try {
            // Skip if backend is known to be down
            if (!backendStatusService.getCurrentStatus()) {
                const emptyData = { data: [], total: 0, page: 1 };
                this.notifySubscribers('foodProviders', emptyData);
                return emptyData;
            }

            const headers = await this.getAuthHeaders();
            const queryParams = new URLSearchParams({
                limit: 50,
                sortBy: 'createdAt_desc',
                ...params
            }).toString();
            
            // Use working /admin/food-providers endpoint (confirmed in tests)
            const response = await fetch(`${API_BASE_URL}/admin/food-providers?${queryParams}`, {
                method: 'GET',
                headers,
            });

            if (response.ok) {
                const data = await response.json();
                this.notifySubscribers('foodProviders', data);
                return data;
            } else {
                throw new Error(`HTTP ${response.status}`);
            }
        } catch (error) {
            // Only log if backend was supposed to be available
            if (backendStatusService.getCurrentStatus()) {
                console.error('❌ Real-time API: Food providers error:', error.message);
            }
            const emptyData = { data: [], total: 0, page: 1 };
            this.notifySubscribers('foodProviders', emptyData);
            return emptyData;
        }
    }

    // Get Orders with real-time updates - UPDATED TO USE WORKING ENDPOINTS
    async getOrders(params = {}) {
        try {
            // Skip if backend is known to be down
            if (!backendStatusService.getCurrentStatus()) {
                const emptyData = { data: [], total: 0, page: 1 };
                this.notifySubscribers('orders', emptyData);
                return emptyData;
            }

            const headers = await this.getAuthHeaders();
            const queryParams = new URLSearchParams({
                limit: 50,
                sortBy: 'createdAt_desc',
                ...params
            }).toString();
            
            // Use working /orders endpoint (confirmed in tests)
            const response = await fetch(`${API_BASE_URL}/orders?${queryParams}`, {
                method: 'GET',
                headers,
            });

            if (response.ok) {
                const data = await response.json();
                this.notifySubscribers('orders', data);
                return data;
            } else {
                throw new Error(`HTTP ${response.status}`);
            }
        } catch (error) {
            // Only log if backend was supposed to be available
            if (backendStatusService.getCurrentStatus()) {
                console.error('❌ Real-time API: Orders error:', error.message);
            }
            const emptyData = { data: [], total: 0, page: 1 };
            this.notifySubscribers('orders', emptyData);
            return emptyData;
        }
    }

    // Get Student Recommendations - 100% BACKEND DATA
    async getStudentRecommendations(userId) {
        try {
            const headers = await this.getAuthHeaders();
            const response = await fetch(`${API_BASE_URL}/student/recommendations/${userId}`, {
                method: 'GET',
                headers,
            });

            if (response.ok) {
                const data = await response.json();
                console.log('✅ Real recommendations data received from backend:', data);
                return data;
            } else {
                throw new Error(`HTTP ${response.status}`);
            }
        } catch (error) {
            console.error('❌ Real-time API: Recommendations error:', error.message);
            return { data: [] };
        }
    }
}

export default new RealTimeApiService();
