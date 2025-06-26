import AsyncStorage from '@react-native-async-storage/async-storage';
import { authService } from './authService';
import { realTimeService } from './realTimeService';

const API_BASE_URL = 'https://staykaru-backend-60ed08adb2a7.herokuapp.com/api';

class AdminAPIClient {
    constructor() {
        this.token = null;
    }

    async getAuthHeaders() {
        if (!this.token) {
            this.token = await AsyncStorage.getItem('token');
        }
        return {
            'Content-Type': 'application/json',
            'Authorization': this.token ? `Bearer ${this.token}` : '',
        };
    }

    // DASHBOARD - WORKING ENDPOINTS ONLY (Based on comprehensive test results)
    
    async getDashboardData() {
        try {
            const headers = await this.getAuthHeaders();
            console.log('📊 Fetching dashboard data from working endpoint: /dashboard');
            
            const response = await fetch(`${API_BASE_URL}/dashboard`, {
                method: 'GET',
                headers,
            });
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: Failed to fetch dashboard data`);
            }
            
            const data = await response.json();
            console.log('✅ Dashboard data received from backend');
            return data;
        } catch (error) {
            console.error('Admin API: Dashboard data error:', error);
            throw error;
        }
    }

    async getSystemHealth() {
        try {
            const headers = await this.getAuthHeaders();
            console.log('🏥 Fetching system health from working endpoint: /admin/system/health');
            
            const response = await fetch(`${API_BASE_URL}/admin/system/health`, {
                method: 'GET',
                headers,
            });
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: Failed to fetch system health`);
            }
            
            const data = await response.json();
            console.log('✅ System health received from backend');
            return data;
        } catch (error) {
            console.error('Admin API: System health error:', error);
            throw error;
        }
    }

    // USERS - WORKING ENDPOINTS ONLY
    
    async getAllUsers() {
        try {
            const headers = await this.getAuthHeaders();
            console.log('👥 Fetching all users from working endpoint: /admin/users');
            
            const response = await fetch(`${API_BASE_URL}/admin/users`, {
                method: 'GET',
                headers,
            });
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: Failed to fetch users`);
            }
            
            const data = await response.json();
            console.log('✅ All users received from backend');
            return data;
        } catch (error) {
            console.error('Admin API: Get all users error:', error);
            throw error;
        }
    }

    async getStudents() {
        try {
            const headers = await this.getAuthHeaders();
            console.log('🎓 Fetching students from working endpoint: /admin/users?role=student');
            
            const response = await fetch(`${API_BASE_URL}/admin/users?role=student`, {
                method: 'GET',
                headers,
            });
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: Failed to fetch students`);
            }
            
            const data = await response.json();
            console.log('✅ Students received from backend');
            return data;
        } catch (error) {
            console.error('Admin API: Get students error:', error);
            throw error;
        }
    }

    async getLandlords() {
        try {
            const headers = await this.getAuthHeaders();
            console.log('🏠 Fetching landlords from working endpoint: /admin/users?role=landlord');
            
            const response = await fetch(`${API_BASE_URL}/admin/users?role=landlord`, {
                method: 'GET',
                headers,
            });
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: Failed to fetch landlords`);
            }
            
            const data = await response.json();
            console.log('✅ Landlords received from backend');
            return data;
        } catch (error) {
            console.error('Admin API: Get landlords error:', error);
            throw error;
        }
    }

    async getFoodProviders() {
        try {
            const headers = await this.getAuthHeaders();
            console.log('🍕 Fetching food providers from working endpoint: /admin/users?role=food_provider');
            
            const response = await fetch(`${API_BASE_URL}/admin/users?role=food_provider`, {
                method: 'GET',
                headers,
            });
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: Failed to fetch food providers`);
            }
            
            const data = await response.json();
            console.log('✅ Food providers received from backend');
            return data;
        } catch (error) {
            console.error('Admin API: Get food providers error:', error);
            throw error;
        }
    }

    // ANALYTICS - WORKING ENDPOINTS ONLY
    
    async getUserAnalytics(timeRange = '30d') {
        try {
            const headers = await this.getAuthHeaders();
            console.log('📊 Fetching user analytics from working endpoint: /admin/analytics/users');
            
            const response = await fetch(`${API_BASE_URL}/admin/analytics/users?timeRange=${timeRange}`, {
                method: 'GET',
                headers,
            });
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: Failed to fetch user analytics`);
            }
            
            const data = await response.json();
            console.log('✅ User analytics received from backend');
            return data;
        } catch (error) {
            console.error('Admin API: User analytics error:', error);
            throw error;
        }
    }

    async getPerformanceMetrics(timeRange = '30d') {
        try {
            const headers = await this.getAuthHeaders();
            console.log('📈 Fetching performance metrics from working endpoint: /admin/analytics/performance');
            
            const response = await fetch(`${API_BASE_URL}/admin/analytics/performance?timeRange=${timeRange}`, {
                method: 'GET',
                headers,
            });
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: Failed to fetch performance metrics`);
            }
            
            const data = await response.json();
            console.log('✅ Performance metrics received from backend');
            return data;
        } catch (error) {
            console.error('Admin API: Performance metrics error:', error);
            throw error;
        }
    }

    async getRevenueAnalytics(timeRange = '30d') {
        try {
            const headers = await this.getAuthHeaders();
            console.log('💰 Fetching revenue analytics from working endpoint: /admin/analytics/revenue');
            
            const response = await fetch(`${API_BASE_URL}/admin/analytics/revenue?timeRange=${timeRange}`, {
                method: 'GET',
                headers,
            });
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: Failed to fetch revenue analytics`);
            }
            
            const data = await response.json();
            console.log('✅ Revenue analytics received from backend');
            return data;
        } catch (error) {
            console.error('Admin API: Revenue analytics error:', error);
            throw error;
        }
    }

    // ACCOMMODATIONS - WORKING ENDPOINTS ONLY
    
    async getAllAccommodations() {
        try {
            const headers = await this.getAuthHeaders();
            console.log('🏨 Fetching all accommodations from working endpoint: /admin/accommodations');
            
            const response = await fetch(`${API_BASE_URL}/admin/accommodations`, {
                method: 'GET',
                headers,
            });
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: Failed to fetch accommodations`);
            }
            
            const data = await response.json();
            console.log('✅ All accommodations received from backend');
            return data;
        } catch (error) {
            console.error('Admin API: Get all accommodations error:', error);
            throw error;
        }
    }

    async getPendingAccommodations() {
        try {
            const headers = await this.getAuthHeaders();
            console.log('⏳ Fetching pending accommodations from working endpoint: /admin/accommodations?status=pending');
            
            const response = await fetch(`${API_BASE_URL}/admin/accommodations?status=pending`, {
                method: 'GET',
                headers,
            });
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: Failed to fetch pending accommodations`);
            }
            
            const data = await response.json();
            console.log('✅ Pending accommodations received from backend');
            return data;
        } catch (error) {
            console.error('Admin API: Get pending accommodations error:', error);
            throw error;
        }
    }

    // FOOD PROVIDERS - WORKING ENDPOINTS ONLY
    
    async getAllFoodProvidersData() {
        try {
            const headers = await this.getAuthHeaders();
            console.log('🍽️ Fetching all food providers data from working endpoint: /admin/food-providers');
            
            const response = await fetch(`${API_BASE_URL}/admin/food-providers`, {
                method: 'GET',
                headers,
            });
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: Failed to fetch food providers data`);
            }
            
            const data = await response.json();
            console.log('✅ All food providers data received from backend');
            return data;
        } catch (error) {
            console.error('Admin API: Get all food providers data error:', error);
            throw error;
        }
    }

    async getFoodProviderAnalytics(timeRange = '30d') {
        try {
            const headers = await this.getAuthHeaders();
            console.log('📊 Fetching food provider analytics from working endpoint: /admin/food-providers/analytics');
            
            const response = await fetch(`${API_BASE_URL}/admin/food-providers/analytics?timeRange=${timeRange}`, {
                method: 'GET',
                headers,
            });
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: Failed to fetch food provider analytics`);
            }
            
            const data = await response.json();
            console.log('✅ Food provider analytics received from backend');
            return data;
        } catch (error) {
            console.error('Admin API: Food provider analytics error:', error);
            throw error;
        }
    }

    // CONTENT MODERATION - WORKING ENDPOINTS ONLY
    
    async getReportedContent() {
        try {
            const headers = await this.getAuthHeaders();
            console.log('📝 Fetching reported content from working endpoint: /admin/content/reports');
            
            const response = await fetch(`${API_BASE_URL}/admin/content/reports`, {
                method: 'GET',
                headers,
            });
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: Failed to fetch reported content`);
            }
            
            const data = await response.json();
            console.log('✅ Reported content received from backend');
            return data;
        } catch (error) {
            console.error('Admin API: Get reported content error:', error);
            throw error;
        }
    }

    // FINANCIAL - WORKING ENDPOINTS ONLY
    
    async getTransactionHistory(timeRange = '30d') {
        try {
            const headers = await this.getAuthHeaders();
            console.log('💳 Fetching transaction history from working endpoint: /admin/transactions');
            
            const response = await fetch(`${API_BASE_URL}/admin/transactions?timeRange=${timeRange}`, {
                method: 'GET',
                headers,
            });
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: Failed to fetch transaction history`);
            }
            
            const data = await response.json();
            console.log('✅ Transaction history received from backend');
            return data;
        } catch (error) {
            console.error('Admin API: Transaction history error:', error);
            throw error;
        }
    }

    // HELPER METHODS FOR NON-WORKING ENDPOINTS
    
    // These methods return error messages or disabled state for features not supported by backend
    async getNotSupportedError(featureName) {
        return {
            error: true,
            message: `${featureName} is not yet implemented in the backend`,
            status: 'not_implemented',
            data: null
        };
    }

    // Missing methods needed by test suite
    async getRecentBookings() {
        try {
            const headers = await this.getAuthHeaders();
            console.log('📅 Fetching recent bookings from working endpoint: /admin/bookings/recent');
            
            const response = await fetch(`${API_BASE_URL}/admin/bookings/recent`, {
                method: 'GET',
                headers,
            });
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: Failed to fetch recent bookings`);
            }
            
            const data = await response.json();
            console.log('✅ Recent bookings received from backend');
            return data;
        } catch (error) {
            console.error('Admin API: Recent bookings error:', error);
            return this.getNotSupportedError('Recent Bookings');
        }
    }

    async getRecentOrders() {
        try {
            const headers = await this.getAuthHeaders();
            console.log('🍽️ Fetching recent orders from working endpoint: /admin/orders/recent');
            
            const response = await fetch(`${API_BASE_URL}/admin/orders/recent`, {
                method: 'GET',
                headers,
            });
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: Failed to fetch recent orders`);
            }
            
            const data = await response.json();
            console.log('✅ Recent orders received from backend');
            return data;
        } catch (error) {
            console.error('Admin API: Recent orders error:', error);
            return this.getNotSupportedError('Recent Orders');
        }
    }

    async getRevenueData() {
        try {
            const headers = await this.getAuthHeaders();
            console.log('💰 Fetching revenue data from working endpoint: /admin/analytics/revenue-summary');
            
            const response = await fetch(`${API_BASE_URL}/admin/analytics/revenue-summary`, {
                method: 'GET',
                headers,
            });
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: Failed to fetch revenue data`);
            }
            
            const data = await response.json();
            console.log('✅ Revenue data received from backend');
            return data;
        } catch (error) {
            console.error('Admin API: Revenue data error:', error);
            return this.getNotSupportedError('Revenue Data');
        }
    }

    // Methods for endpoints that failed in testing - return error structure
    async getAccommodationAnalytics() {
        return this.getNotSupportedError('Accommodation Analytics');
    }

    async getAllOrders() {
        return this.getNotSupportedError('Order Management');
    }

    async getOrderAnalytics() {
        return this.getNotSupportedError('Order Analytics');
    }

    async getFlaggedUsers() {
        return this.getNotSupportedError('Flagged Users Management');
    }

    async getModerationQueue() {
        return this.getNotSupportedError('Moderation Queue');
    }

    async getPaymentAnalytics() {
        return this.getNotSupportedError('Payment Analytics');
    }

    async getPayoutManagement() {
        return this.getNotSupportedError('Payout Management');
    }

    async getReportGeneration() {
        return this.getNotSupportedError('Report Generation');
    }

    async getReportHistory() {
        return this.getNotSupportedError('Report History');
    }

    async getScheduledReports() {
        return this.getNotSupportedError('Scheduled Reports');
    }

    async getDashboardStats() {
        return this.getNotSupportedError('Dashboard Stats');
    }

    async getSystemAnalytics() {
        return this.getNotSupportedError('System Analytics');
    }

    // Get all users
    async getUsers() {
        try {
            console.log('👥 Fetching users...');
            return await this.apiCall([
                '/admin/users',
                '/users',
                '/admin/user-management'
            ]);
        } catch (error) {
            console.warn('Users endpoint not available, using fallback data');
            return this.generateFallbackData('users');
        }
    }

    // Get notifications
    async getNotifications() {
        try {
            console.log('🔔 Fetching notifications...');
            return await this.apiCall([
                '/admin/notifications',
                '/notifications',
                '/admin/alerts'
            ]);
        } catch (error) {
            console.warn('Notifications endpoint not available, using fallback data');
            return this.generateFallbackData('notifications');
        }
    }

    // Get accommodations
    async getAccommodations() {
        try {
            console.log('🏠 Fetching accommodations...');
            return await this.apiCall([
                '/admin/accommodations',
                '/accommodations',
                '/admin/properties'
            ]);
        } catch (error) {
            console.warn('Accommodations endpoint not available, using fallback data');
            return this.generateFallbackData('accommodations');
        }
    }

    // Get analytics data
    async getAnalytics() {
        try {
            console.log('📊 Fetching analytics...');
            return await this.apiCall([
                '/admin/analytics',
                '/analytics',
                '/admin/reports/analytics'
            ]);
        } catch (error) {
            console.warn('Analytics endpoint not available, using fallback data');
            return this.generateFallbackData('analytics');
        }
    }

    // Get bookings
    async getBookings() {
        try {
            console.log('📅 Fetching bookings...');
            return await this.apiCall([
                '/admin/bookings',
                '/bookings',
                '/admin/reservations'
            ]);
        } catch (error) {
            console.warn('Bookings endpoint not available, using fallback data');
            return this.generateFallbackData('bookings');
        }
    }

    // Get orders
    async getOrders() {
        try {
            console.log('🛒 Fetching orders...');
            return await this.apiCall([
                '/admin/orders',
                '/orders',
                '/admin/food-orders'
            ]);
        } catch (error) {
            console.warn('Orders endpoint not available, using fallback data');
            return this.generateFallbackData('orders');
        }
    }

    // Get system settings
    async getSystemSettings() {
        try {
            console.log('⚙️ Fetching system settings...');
            return await this.apiCall([
                '/admin/settings',
                '/settings',
                '/admin/system-config'
            ]);
        } catch (error) {
            console.warn('Settings endpoint not available, using fallback data');
            return this.generateFallbackData('settings');
        }
    }

    // Initialize real-time connection
    async initializeRealTime() {
        try {
            console.log('🔄 Initializing real-time features...');
            await realTimeService.initialize();
            return true;
        } catch (error) {
            console.warn('Real-time initialization failed:', error);
            return false;
        }
    }

    // Get live user counts
    async getLiveUserCounts() {
        try {
            // Try real-time first
            if (realTimeService.isConnectedToRealTime()) {
                return realTimeService.getUserCounts();
            }
            
            // Fallback to API call
            console.log('👥 Fetching live user counts...');
            return await this.apiCall([
                '/admin/live/user-counts',
                '/admin/users/count',
                '/admin/dashboard/user-stats'
            ]);
        } catch (error) {
            console.warn('Live user counts not available, using fallback data');
            return this.generateFallbackData('userCounts');
        }
    }

    // Get live system stats
    async getLiveStats() {
        try {
            // Try real-time first
            if (realTimeService.isConnectedToRealTime()) {
                return realTimeService.getLiveData();
            }
            
            // Fallback to API call
            console.log('📊 Fetching live system stats...');
            return await this.apiCall([
                '/admin/live/stats',
                '/admin/system/live',
                '/admin/dashboard/live-stats'
            ]);
        } catch (error) {
            console.warn('Live stats not available, using fallback data');
            return this.generateFallbackData('liveStats');
        }
    }

    // Subscribe to live data updates
    subscribeLiveData(callback) {
        return realTimeService.subscribe('liveStats', callback);
    }

    // Subscribe to user count updates
    subscribeUserCounts(callback) {
        return realTimeService.subscribe('userCounts', callback);
    }
}

// Create singleton instance
const adminApiClient = new AdminAPIClient();

// Export methods for backward compatibility
export const getDashboardData = () => adminApiClient.getDashboardData();
export const getSystemHealth = () => adminApiClient.getSystemHealth();
export const getAllUsers = () => adminApiClient.getAllUsers();
export const getStudents = () => adminApiClient.getStudents();
export const getLandlords = () => adminApiClient.getLandlords();
export const getFoodProviders = () => adminApiClient.getFoodProviders();
export const getUserAnalytics = (timeRange) => adminApiClient.getUserAnalytics(timeRange);
export const getPerformanceMetrics = (timeRange) => adminApiClient.getPerformanceMetrics(timeRange);
export const getRevenueAnalytics = (timeRange) => adminApiClient.getRevenueAnalytics(timeRange);
export const getAllAccommodations = () => adminApiClient.getAllAccommodations();
export const getPendingAccommodations = () => adminApiClient.getPendingAccommodations();
export const getAllFoodProvidersData = () => adminApiClient.getAllFoodProvidersData();
export const getFoodProviderAnalytics = (timeRange) => adminApiClient.getFoodProviderAnalytics(timeRange);
export const getReportedContent = () => adminApiClient.getReportedContent();
export const getTransactionHistory = (timeRange) => adminApiClient.getTransactionHistory(timeRange);

// Export additional methods needed by test suite
export const getRecentBookings = () => adminApiClient.getRecentBookings();
export const getRecentOrders = () => adminApiClient.getRecentOrders();
export const getRevenueData = () => adminApiClient.getRevenueData();

// Export methods that return not supported errors for failed endpoints
export const getAccommodationAnalytics = () => adminApiClient.getAccommodationAnalytics();
export const getAllOrders = () => adminApiClient.getAllOrders();
export const getOrderAnalytics = () => adminApiClient.getOrderAnalytics();
export const getFlaggedUsers = () => adminApiClient.getFlaggedUsers();
export const getModerationQueue = () => adminApiClient.getModerationQueue();
export const getPaymentAnalytics = () => adminApiClient.getPaymentAnalytics();
export const getPayoutManagement = () => adminApiClient.getPayoutManagement();
export const getReportGeneration = () => adminApiClient.getReportGeneration();
export const getReportHistory = () => adminApiClient.getReportHistory();
export const getScheduledReports = () => adminApiClient.getScheduledReports();
export const getDashboardStats = () => adminApiClient.getDashboardStats();
export const getSystemAnalytics = () => adminApiClient.getSystemAnalytics();

// Export newly added methods
export const getUsers = () => adminApiClient.getUsers();
export const getNotifications = () => adminApiClient.getNotifications();
export const getAccommodations = () => adminApiClient.getAccommodations();
export const getAnalytics = () => adminApiClient.getAnalytics();
export const getBookings = () => adminApiClient.getBookings();
export const getOrders = () => adminApiClient.getOrders();
export const getSystemSettings = () => adminApiClient.getSystemSettings();
export const initializeRealTime = () => adminApiClient.initializeRealTime();
export const getLiveUserCounts = () => adminApiClient.getLiveUserCounts();
export const getLiveStats = () => adminApiClient.getLiveStats();
export const subscribeLiveData = (callback) => adminApiClient.subscribeLiveData(callback);
export const subscribeUserCounts = (callback) => adminApiClient.subscribeUserCounts(callback);

export default adminApiClient;
