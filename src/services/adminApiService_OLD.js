import AsyncStorage from '@react-native-async-storage/async-storage';

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

    // Analytics Endpoints - UPDATED TO USE WORKING ENDPOINTS ONLY
    async getDashboardAnalytics(timeRange = '30d') {
        try {
            const headers = await this.getAuthHeaders();
            console.log('📊 Fetching dashboard data from working endpoint...');
            
            // Use the working /dashboard endpoint instead of non-existent admin-specific one
            const response = await fetch(`${API_BASE_URL}/dashboard`, {
                method: 'GET',
                headers,
            });
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: Failed to fetch dashboard analytics`);
            }
            
            const data = await response.json();
            console.log('✅ Dashboard analytics received from backend');
            return data;
        } catch (error) {
            console.error('Admin API: Dashboard analytics error:', error);
            // Return empty structure when backend fails - NO MOCK DATA
            return {
                stats: {
                    totalUsers: 0,
                    totalStudents: 0, 
                    totalLandlords: 0,
                    totalFoodProviders: 0,
                    totalAccommodations: 0,
                    totalOrders: 0,
                    activeBookings: 0,
                    pendingApprovals: 0
                },
                analytics: []
            };
        }
    }

    async getUserAnalytics(timeRange = '30d') {
        try {
            const headers = await this.getAuthHeaders();
            console.log('📊 Fetching user analytics from working endpoint...');
            
            // Use confirmed working endpoint /admin/analytics/users
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
            // Return empty structure when backend fails - NO MOCK DATA
            return {
                userGrowth: [],
                demographics: [],
                engagement: []
            };
        }
    }

    async getPerformanceMetrics(timeRange = '30d') {
        try {
            const headers = await this.getAuthHeaders();
            console.log('📊 Fetching performance metrics from working endpoint...');
            
            // Use confirmed working endpoint /admin/analytics/performance
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
            // Return empty structure when backend fails - NO MOCK DATA
            return {
                metrics: [],
                systemHealth: 'Unknown'
            };
        }
    }

    async getRevenueAnalytics(timeRange = '30d') {
        try {
            const headers = await this.getAuthHeaders();
            const response = await fetch(`${API_BASE_URL}/admin/analytics/revenue?timeRange=${timeRange}`, {
                method: 'GET',
                headers,
            });
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: Failed to fetch revenue analytics`);
            }
            
            return await response.json();
        } catch (error) {
            console.error('Admin API: Revenue analytics error:', error);
            return this.getMockRevenueAnalytics();
        }
    }

    // New API methods for additional admin screens
    
    // Analytics
    async getAnalytics(type, timeRange = '30d') {
        try {
            const headers = await this.getAuthHeaders();
            const response = await fetch(`${API_BASE_URL}/admin/analytics/${type}?timeRange=${timeRange}`, {
                method: 'GET',
                headers,
            });
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: Failed to fetch ${type} analytics`);
            }
            
            return await response.json();
        } catch (error) {
            console.error(`Admin API: ${type} analytics error:`, error);
            return this.getMockAnalytics(type);
        }
    }

    // Accommodations - UPDATED TO USE WORKING ENDPOINTS
    async getAccommodations(params = {}) {
        try {
            const headers = await this.getAuthHeaders();
            const queryString = new URLSearchParams(params).toString();
            console.log('🏠 Fetching accommodations from confirmed working endpoint...');
            
            // Use confirmed working endpoint /admin/accommodations
            const response = await fetch(`${API_BASE_URL}/admin/accommodations?${queryString}`, {
                method: 'GET',
                headers,
            });
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: Failed to fetch accommodations`);
            }
            
            const data = await response.json();
            console.log('✅ Accommodations data received from backend');
            return data;
        } catch (error) {
            console.error('Admin API: Accommodations error:', error);
            // Return empty structure when backend fails - NO MOCK DATA
            return {
                data: [],
                total: 0,
                page: 1,
                limit: 10
            };
        }
    }

    async getPendingAccommodations(params = {}) {
        try {
            const headers = await this.getAuthHeaders();
            const queryString = new URLSearchParams({ status: 'pending', ...params }).toString();
            console.log('⏳ Fetching pending accommodations from confirmed working endpoint...');
            
            // Use confirmed working endpoint /admin/accommodations?status=pending
            const response = await fetch(`${API_BASE_URL}/admin/accommodations?${queryString}`, {
                method: 'GET',
                headers,
            });
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: Failed to fetch pending accommodations`);
            }
            
            const data = await response.json();
            console.log('✅ Pending accommodations data received from backend');
            return data;
        } catch (error) {
            console.error('Admin API: Pending accommodations error:', error);
            return { data: [], total: 0, page: 1, limit: 10 };
        }
    }

    async updateAccommodationStatus(accommodationId, status, reason = '') {
        try {
            const headers = await this.getAuthHeaders();
            const response = await fetch(`${API_BASE_URL}/admin/accommodations/${accommodationId}/status`, {
                method: 'PUT',
                headers,
                body: JSON.stringify({ status, reason }),
            });
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: Failed to update accommodation status`);
            }
            
            return await response.json();
        } catch (error) {
            console.error('Admin API: Update accommodation status error:', error);
            throw error;
        }
    }

    // Food Providers - UPDATED TO USE WORKING ENDPOINTS
    async getAllFoodProviders(params = {}) {
        try {
            const headers = await this.getAuthHeaders();
            const queryString = new URLSearchParams(params).toString();
            console.log('🍕 Fetching all food providers from confirmed working endpoint...');
            
            // Use confirmed working endpoint /admin/food-providers
            const response = await fetch(`${API_BASE_URL}/admin/food-providers?${queryString}`, {
                method: 'GET',
                headers,
            });
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: Failed to fetch food providers`);
            }
            
            const data = await response.json();
            console.log('✅ Food providers data received from backend');
            return data;
        } catch (error) {
            console.error('Admin API: Food providers error:', error);
            // Return empty structure when backend fails - NO MOCK DATA
            return {
                data: [],
                total: 0,
                page: 1,
                limit: 10
            };
        }
    }

    async getFoodProviderAnalytics(params = {}) {
        try {
            const headers = await this.getAuthHeaders();
            const queryString = new URLSearchParams(params).toString();
            console.log('📊 Fetching food provider analytics from confirmed working endpoint...');
            
            // Use confirmed working endpoint /admin/food-providers/analytics
            const response = await fetch(`${API_BASE_URL}/admin/food-providers/analytics?${queryString}`, {
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
            return {
                analytics: [],
                metrics: {}
            };
        }
    }

    async updateFoodProviderStatus(providerId, status, reason = '') {
        try {
            const headers = await this.getAuthHeaders();
            const response = await fetch(`${API_BASE_URL}/admin/food-providers/${providerId}/status`, {
                method: 'PUT',
                headers,
                body: JSON.stringify({ status, reason }),
            });
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: Failed to update food provider status`);
            }
            
            return await response.json();
        } catch (error) {
            console.error('Admin API: Update food provider status error:', error);
            throw error;
        }
    }

    // Bookings
    async getBookings(params = {}) {
        try {
            const headers = await this.getAuthHeaders();
            const queryString = new URLSearchParams(params).toString();
            const response = await fetch(`${API_BASE_URL}/admin/bookings?${queryString}`, {
                method: 'GET',
                headers,
            });
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: Failed to fetch bookings`);
            }
            
            return await response.json();
        } catch (error) {
            console.error('Admin API: Bookings error:', error);
            return this.getMockBookings();
        }
    }

    async cancelBooking(bookingId, reason = '') {
        try {
            const headers = await this.getAuthHeaders();
            const response = await fetch(`${API_BASE_URL}/admin/bookings/${bookingId}/cancel`, {
                method: 'PUT',
                headers,
                body: JSON.stringify({ reason }),
            });
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: Failed to cancel booking`);
            }
            
            return await response.json();
        } catch (error) {
            console.error('Admin API: Cancel booking error:', error);
            throw error;
        }
    }

    // Orders
    async getOrders(params = {}) {
        try {
            const headers = await this.getAuthHeaders();
            const queryString = new URLSearchParams(params).toString();
            const response = await fetch(`${API_BASE_URL}/admin/orders?${queryString}`, {
                method: 'GET',
                headers,
            });
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: Failed to fetch orders`);
            }
            
            return await response.json();
        } catch (error) {
            console.error('Admin API: Orders error:', error);
            return this.getMockOrders();
        }
    }

    async updateOrderStatus(orderId, status) {
        try {
            const headers = await this.getAuthHeaders();
            const response = await fetch(`${API_BASE_URL}/admin/orders/${orderId}/status`, {
                method: 'PUT',
                headers,
                body: JSON.stringify({ status }),
            });
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: Failed to update order status`);
            }
            
            return await response.json();
        } catch (error) {
            console.error('Admin API: Update order status error:', error);
            throw error;
        }
    }

    // Notifications
    async getNotifications(params = {}) {
        try {
            const headers = await this.getAuthHeaders();
            const queryString = new URLSearchParams(params).toString();
            const response = await fetch(`${API_BASE_URL}/admin/notifications?${queryString}`, {
                method: 'GET',
                headers,
            });
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: Failed to fetch notifications`);
            }
            
            return await response.json();
        } catch (error) {
            console.error('Admin API: Notifications error:', error);
            return this.getMockNotifications();
        }
    }

    async markNotificationAsRead(notificationId) {
        try {
            const headers = await this.getAuthHeaders();
            const response = await fetch(`${API_BASE_URL}/admin/notifications/${notificationId}/read`, {
                method: 'PUT',
                headers,
            });
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: Failed to mark notification as read`);
            }
            
            return await response.json();
        } catch (error) {
            console.error('Admin API: Mark notification as read error:', error);
            throw error;
        }
    }

    async markAllNotificationsAsRead() {
        try {
            const headers = await this.getAuthHeaders();
            const response = await fetch(`${API_BASE_URL}/admin/notifications/mark-all-read`, {
                method: 'PUT',
                headers,
            });
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: Failed to mark all notifications as read`);
            }
            
            return await response.json();
        } catch (error) {
            console.error('Admin API: Mark all notifications as read error:', error);
            throw error;
        }
    }

    async deleteNotification(notificationId) {
        try {
            const headers = await this.getAuthHeaders();
            const response = await fetch(`${API_BASE_URL}/admin/notifications/${notificationId}`, {
                method: 'DELETE',
                headers,
            });
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: Failed to delete notification`);
            }
            
            return await response.json();
        } catch (error) {
            console.error('Admin API: Delete notification error:', error);
            throw error;
        }
    }

    async createNotification(notificationData) {
        try {
            const headers = await this.getAuthHeaders();
            const response = await fetch(`${API_BASE_URL}/admin/notifications`, {
                method: 'POST',
                headers,
                body: JSON.stringify(notificationData),
            });
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: Failed to create notification`);
            }
            
            return await response.json();
        } catch (error) {
            console.error('Admin API: Create notification error:', error);
            throw error;
        }
    }

    // User Management Endpoints - UPDATED TO USE WORKING ENDPOINTS
    async getUsers(params = {}) {
        try {
            const headers = await this.getAuthHeaders();
            const queryParams = new URLSearchParams(params).toString();
            console.log('👥 Fetching users from confirmed working endpoint...');
            
            // Use confirmed working endpoint /admin/users
            const response = await fetch(`${API_BASE_URL}/admin/users?${queryParams}`, {
                method: 'GET',
                headers,
            });
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: Failed to fetch users`);
            }
            
            const data = await response.json();
            console.log('✅ Users data received from backend');
            return data;
        } catch (error) {
            console.error('Admin API: Users error:', error);
            // Return empty structure when backend fails - NO MOCK DATA
            return {
                data: [],
                total: 0,
                page: 1,
                limit: 10
            };
        }
    }

    async getStudents(params = {}) {
        try {
            const headers = await this.getAuthHeaders();
            const queryParams = new URLSearchParams({ role: 'student', ...params }).toString();
            console.log('🎓 Fetching students from confirmed working endpoint...');
            
            // Use confirmed working endpoint /admin/users?role=student
            const response = await fetch(`${API_BASE_URL}/admin/users?${queryParams}`, {
                method: 'GET',
                headers,
            });
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: Failed to fetch students`);
            }
            
            const data = await response.json();
            console.log('✅ Students data received from backend');
            return data;
        } catch (error) {
            console.error('Admin API: Students error:', error);
            return { data: [], total: 0, page: 1, limit: 10 };
        }
    }

    async getLandlords(params = {}) {
        try {
            const headers = await this.getAuthHeaders();
            const queryParams = new URLSearchParams({ role: 'landlord', ...params }).toString();
            console.log('🏠 Fetching landlords from confirmed working endpoint...');
            
            // Use confirmed working endpoint /admin/users?role=landlord
            const response = await fetch(`${API_BASE_URL}/admin/users?${queryParams}`, {
                method: 'GET',
                headers,
            });
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: Failed to fetch landlords`);
            }
            
            const data = await response.json();
            console.log('✅ Landlords data received from backend');
            return data;
        } catch (error) {
            console.error('Admin API: Landlords error:', error);
            return { data: [], total: 0, page: 1, limit: 10 };
        }
    }

    async getFoodProviders(params = {}) {
        try {
            const headers = await this.getAuthHeaders();
            const queryParams = new URLSearchParams({ role: 'food_provider', ...params }).toString();
            console.log('🍕 Fetching food providers from confirmed working endpoint...');
            
            // Use confirmed working endpoint /admin/users?role=food_provider  
            const response = await fetch(`${API_BASE_URL}/admin/users?${queryParams}`, {
                method: 'GET',
                headers,
            });
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: Failed to fetch food providers`);
            }
            
            const data = await response.json();
            console.log('✅ Food providers data received from backend');
            return data;
        } catch (error) {
            console.error('Admin API: Food providers error:', error);
            return { data: [], total: 0, page: 1, limit: 10 };
        }
    }

    async updateUserStatus(userId, status, reason = '') {
        try {
            const headers = await this.getAuthHeaders();
            const response = await fetch(`${API_BASE_URL}/admin/users/${userId}/status`, {
                method: 'PUT',
                headers,
                body: JSON.stringify({ status, reason }),
            });
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: Failed to update user status`);
            }
            
            return await response.json();
        } catch (error) {
            console.error('Admin API: Update user status error:', error);
            throw error;
        }
    }

    async deleteUser(userId, reason = '') {
        try {
            const headers = await this.getAuthHeaders();
            const response = await fetch(`${API_BASE_URL}/admin/users/${userId}`, {
                method: 'DELETE',
                headers,
                body: JSON.stringify({ reason }),
            });
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: Failed to delete user`);
            }
            
            return await response.json();
        } catch (error) {
            console.error('Admin API: Delete user error:', error);
            throw error;
        }
    }

    // Content Moderation Endpoints
    async getModerationQueue(params = {}) {
        try {
            const headers = await this.getAuthHeaders();
            const queryParams = new URLSearchParams(params).toString();
            const response = await fetch(`${API_BASE_URL}/admin/moderation/queue?${queryParams}`, {
                method: 'GET',
                headers,
            });
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: Failed to fetch moderation queue`);
            }
            
            return await response.json();
        } catch (error) {
            console.error('Admin API: Moderation queue error:', error);
            // Return mock data for demonstration when API is not available
            return this.getMockModerationQueue();
        }
    }

    async moderateContent(contentId, action, reason = '') {
        try {
            const headers = await this.getAuthHeaders();
            const response = await fetch(`${API_BASE_URL}/admin/moderation/${contentId}`, {
                method: 'PUT',
                headers,
                body: JSON.stringify({ action, reason }),
            });
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: Failed to moderate content`);
            }
            
            return await response.json();
        } catch (error) {
            console.error('Admin API: Moderate content error:', error);
            throw error;
        }
    }

    // System Settings Endpoints
    async getSystemSettings() {
        try {
            const headers = await this.getAuthHeaders();
            const response = await fetch(`${API_BASE_URL}/admin/settings`, {
                method: 'GET',
                headers,
            });
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: Failed to fetch system settings`);
            }
            
            return await response.json();
        } catch (error) {
            console.error('Admin API: System settings error:', error);
            // Return mock data for demonstration when API is not available
            return this.getMockSystemSettings();
        }
    }

    async updateSystemSettings(settings) {
        try {
            const headers = await this.getAuthHeaders();
            const response = await fetch(`${API_BASE_URL}/admin/settings`, {
                method: 'PUT',
                headers,
                body: JSON.stringify(settings),
            });
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: Failed to update system settings`);
            }
            
            return await response.json();
        } catch (error) {
            console.error('Admin API: Update system settings error:', error);
            throw error;
        }
    }

    // System Health Endpoints
    async getSystemHealth() {
        try {
            const headers = await this.getAuthHeaders();
            const response = await fetch(`${API_BASE_URL}/admin/system/health`, {
                method: 'GET',
                headers,
            });
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: Failed to fetch system health`);
            }
            
            return await response.json();
        } catch (error) {
            console.error('Admin API: System health error:', error);
            // Return mock data for demonstration when API is not available
            return this.getMockSystemHealth();
        }
    }

    async getSystemLogs(params = {}) {
        try {
            const headers = await this.getAuthHeaders();
            const queryParams = new URLSearchParams(params).toString();
            const response = await fetch(`${API_BASE_URL}/admin/system/logs?${queryParams}`, {
                method: 'GET',
                headers,
            });
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: Failed to fetch system logs`);
            }
            
            return await response.json();
        } catch (error) {
            console.error('Admin API: System logs error:', error);
            // Return mock data for demonstration when API is not available
            return this.getMockSystemLogs();
        }
    }

    // Real-time Stats Endpoints
    async getRealTimeStats() {
        try {
            const headers = await this.getAuthHeaders();
            const response = await fetch(`${API_BASE_URL}/admin/stats/realtime`, {
                method: 'GET',
                headers,
            });
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: Failed to fetch real-time stats`);
            }
            
            return await response.json();
        } catch (error) {
            console.error('Admin API: Real-time stats error:', error);
            // Return mock data for demonstration when API is not available
            return this.getMockRealTimeStats();
        }
    }

    async getRecentActivity(limit = 10) {
        try {
            const headers = await this.getAuthHeaders();
            const response = await fetch(`${API_BASE_URL}/admin/activity/recent?limit=${limit}`, {
                method: 'GET',
                headers,
            });
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: Failed to fetch recent activity`);
            }
            
            return await response.json();
        } catch (error) {
            console.error('Admin API: Recent activity error:', error);
            // Return mock data for demonstration when API is not available
            return this.getMockRecentActivity();
        }
    }

    // Financial Endpoints
    async getFinancialSummary(timeRange = '30d') {
        try {
            const headers = await this.getAuthHeaders();
            const response = await fetch(`${API_BASE_URL}/admin/financial/summary?timeRange=${timeRange}`, {
                method: 'GET',
                headers,
            });
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: Failed to fetch financial summary`);
            }
            
            return await response.json();
        } catch (error) {
            console.error('Admin API: Financial summary error:', error);
            // Return mock data for demonstration when API is not available
            return this.getMockFinancialSummary();
        }
    }

    // Mock Data Methods (for development/fallback)
    getMockDashboardAnalytics() {
        return {
            success: true,
            data: {
                counts: {
                    users: 1247,
                    bookings: 89,
                    orders: 156,
                    revenue: 45670,
                    systemHealth: 98
                },
                changes: {
                    users: 12.5,
                    bookings: 8.3,
                    orders: -2.1,
                    revenue: 15.7,
                    systemHealth: 2.1
                },
                trends: {
                    users: 'up',
                    bookings: 'up',
                    orders: 'down',
                    revenue: 'up',
                    systemHealth: 'up'
                },
                userGrowth: [
                    { month: 'Jan', total: 1100, students: 750, landlords: 280, foodProviders: 70 },
                    { month: 'Feb', total: 1150, students: 785, landlords: 290, foodProviders: 75 },
                    { month: 'Mar', total: 1200, students: 820, landlords: 300, foodProviders: 80 },
                    { month: 'Apr', total: 1247, students: 847, landlords: 315, foodProviders: 85 }
                ],
                revenueData: [
                    { date: '2024-01', bookingRevenue: 12000, orderRevenue: 8000, commissionRate: 12.5 },
                    { date: '2024-02', bookingRevenue: 15000, orderRevenue: 9000, commissionRate: 13.0 },
                    { date: '2024-03', bookingRevenue: 18000, orderRevenue: 11000, commissionRate: 12.8 },
                    { date: '2024-04', bookingRevenue: 20000, orderRevenue: 13000, commissionRate: 13.2 }
                ],
                recentActivity: [
                    { id: 1, type: 'user_registration', message: 'New student registered', timestamp: new Date() },
                    { id: 2, type: 'booking_created', message: 'New accommodation booking', timestamp: new Date() },
                    { id: 3, type: 'order_placed', message: 'Food order placed', timestamp: new Date() }
                ],
                systemAlerts: [
                    { id: 1, type: 'warning', message: 'Server response time increased', severity: 'medium' },
                    { id: 2, type: 'info', message: 'System maintenance scheduled', severity: 'low' }
                ]
            }
        };
    }

    getMockUserAnalytics() {
        return {
            success: true,
            data: {
                totalUsers: 1247,
                activeUsers: 892,
                newUsersToday: 15,
                usersByRole: {
                    student: 847,
                    landlord: 315,
                    foodProvider: 85
                },
                usersByStatus: {
                    active: 892,
                    inactive: 245,
                    suspended: 89,
                    pending: 21
                }
            }
        };
    }

    getMockRevenueAnalytics() {
        return {
            success: true,
            data: {
                totalRevenue: 45670,
                monthlyRevenue: 13200,
                revenueGrowth: 15.7,
                commissionEarned: 5908,
                pendingPayouts: 2340
            }
        };
    }

    getMockAnalytics(type) {
        const mockData = {
            users: {
                totalUsers: 1234,
                activeUsers: 890,
                newThisMonth: 156,
                retentionRate: 78,
                growthData: [
                    { label: '1', value: 100 },
                    { label: '2', value: 120 },
                    { label: '3', value: 140 },
                    { label: '4', value: 180 },
                    { label: '5', value: 200 },
                ],
                demographics: [
                    { label: 'Students', value: 60 },
                    { label: 'Landlords', value: 25 },
                    { label: 'Food Providers', value: 15 },
                ],
            },
            revenue: {
                totalRevenue: 125000,
                bookingRevenue: 75000,
                orderRevenue: 50000,
                commission: 15625,
                revenueData: [
                    { label: 'Jan', value: 10000 },
                    { label: 'Feb', value: 12000 },
                    { label: 'Mar', value: 15000 },
                    { label: 'Apr', value: 18000 },
                    { label: 'May', value: 20000 },
                ],
            },
            bookings: {
                totalBookings: 456,
                activeBookings: 89,
                completionRate: 92,
                avgDuration: 15,
                bookingTrends: [
                    { label: 'W1', value: 25 },
                    { label: 'W2', value: 30 },
                    { label: 'W3', value: 35 },
                    { label: 'W4', value: 40 },
                ],
            },
            orders: {
                totalOrders: 2341,
                completedOrders: 2100,
                avgOrderValue: 850,
                popularItemsCount: 15,
                orderVolume: [
                    { label: 'Mon', value: 45 },
                    { label: 'Tue', value: 52 },
                    { label: 'Wed', value: 48 },
                    { label: 'Thu', value: 65 },
                    { label: 'Fri', value: 78 },
                ],
            },
        };
        return mockData[type] || {};
    }

    getMockAccommodations() {
        return {
            accommodations: [
                {
                    _id: '1',
                    title: 'Cozy Student Apartment in DHA',
                    location: { city: 'Karachi', area: 'DHA Phase 5' },
                    landlord: { name: 'Ahmed Ali' },
                    pricing: { monthly: 25000 },
                    status: 'active',
                    createdAt: '2024-01-15T10:30:00Z',
                },
                {
                    _id: '2',
                    title: 'Shared Room near University',
                    location: { city: 'Lahore', area: 'Model Town' },
                    landlord: { name: 'Fatima Khan' },
                    pricing: { monthly: 15000 },
                    status: 'pending',
                    createdAt: '2024-01-14T14:20:00Z',
                },
            ],
        };
    }

    getMockFoodProviders() {
        return {
            foodProviders: [
                {
                    _id: '1',
                    businessName: 'Karachi Biryani House',
                    location: { city: 'Karachi', area: 'Gulshan' },
                    contact: { phone: '+92-300-1234567', email: 'info@biryanihouse.com' },
                    cuisineType: 'Pakistani',
                    rating: 4.5,
                    status: 'active',
                    createdAt: '2024-01-10T09:15:00Z',
                },
                {
                    _id: '2',
                    businessName: 'Fast Food Corner',
                    location: { city: 'Lahore', area: 'Johar Town' },
                    contact: { phone: '+92-301-7654321', email: 'orders@fastfood.com' },
                    cuisineType: 'Fast Food',
                    rating: 4.2,
                    status: 'pending',
                    createdAt: '2024-01-12T16:45:00Z',
                },
            ],
        };
    }

    getMockBookings() {
        return {
            bookings: [
                {
                    _id: '1',
                    student: { name: 'Sara Ahmed', email: 'sara@email.com' },
                    accommodation: { title: 'Cozy Student Apartment in DHA' },
                    checkInDate: '2024-02-01T00:00:00Z',
                    checkOutDate: '2024-02-28T00:00:00Z',
                    totalAmount: 25000,
                    paymentMethod: 'Bank Transfer',
                    status: 'confirmed',
                    paymentStatus: 'paid',
                    createdAt: '2024-01-15T10:30:00Z',
                },
                {
                    _id: '2',
                    student: { name: 'Ali Hassan', email: 'ali@email.com' },
                    accommodation: { title: 'Shared Room near University' },
                    checkInDate: '2024-02-15T00:00:00Z',
                    checkOutDate: '2024-03-15T00:00:00Z',
                    totalAmount: 15000,
                    paymentMethod: 'Credit Card',
                    status: 'pending',
                    paymentStatus: 'pending',
                    createdAt: '2024-01-16T11:20:00Z',
                },
            ],
        };
    }

    getMockOrders() {
        return {
            orders: [
                {
                    _id: '1',
                    student: { name: 'Sara Ahmed', phone: '+92-300-1111111' },
                    foodProvider: { businessName: 'Karachi Biryani House', location: { city: 'Karachi' } },
                    items: [
                        { name: 'Chicken Biryani', price: 350 },
                        { name: 'Raita', price: 50 },
                    ],
                    totalAmount: 400,
                    paymentMethod: 'Cash',
                    deliveryAddress: { area: 'DHA Phase 5' },
                    estimatedDeliveryTime: '2024-01-20T13:30:00Z',
                    status: 'delivered',
                    createdAt: '2024-01-20T12:15:00Z',
                },
                {
                    _id: '2',
                    student: { name: 'Ali Hassan', phone: '+92-301-2222222' },
                    foodProvider: { businessName: 'Fast Food Corner', location: { city: 'Lahore' } },
                    items: [
                        { name: 'Burger', price: 250 },
                        { name: 'Fries', price: 100 },
                    ],
                    totalAmount: 350,
                    paymentMethod: 'Online',
                    deliveryAddress: { area: 'Model Town' },
                    estimatedDeliveryTime: '2024-01-20T14:00:00Z',
                    status: 'preparing',
                    createdAt: '2024-01-20T13:00:00Z',
                },
            ],
        };
    }

    getMockNotifications() {
        return {
            notifications: [
                {
                    _id: '1',
                    title: 'New Booking Request',
                    message: 'A new booking request has been submitted for review.',
                    type: 'booking',
                    targetAudience: 'admins',
                    read: false,
                    createdAt: '2024-01-20T10:30:00Z',
                },
                {
                    _id: '2',
                    title: 'System Maintenance',
                    message: 'Scheduled system maintenance will occur tonight from 2 AM to 4 AM.',
                    type: 'system',
                    targetAudience: 'all',
                    read: true,
                    createdAt: '2024-01-19T15:20:00Z',
                },
                {
                    _id: '3',
                    title: 'Order Status Update',
                    message: 'Order #12345 has been delivered successfully.',
                    type: 'order',
                    targetAudience: 'food_providers',
                    read: false,
                    createdAt: '2024-01-20T14:45:00Z',
                },
            ],
        };
    }

    getMockUsers() {
        return {
            users: [
                {
                    _id: '1',
                    name: 'Ahmad Khan',
                    email: 'ahmad@example.com',
                    phone: '+92-301-1234567',
                    role: 'student',
                    status: 'active',
                    emailVerified: true,
                    createdAt: '2024-01-15T10:30:00Z',
                    lastLogin: '2024-01-20T09:15:00Z',
                    location: { city: 'Karachi' }
                },
                {
                    _id: '2',
                    name: 'Ali Hassan',
                    email: 'ali@example.com',
                    phone: '+92-301-2222222',
                    role: 'landlord',
                    status: 'active',
                    emailVerified: true,
                    createdAt: '2024-01-10T14:20:00Z',
                    lastLogin: '2024-01-19T16:45:00Z',
                    location: { city: 'Lahore' }
                },
                {
                    _id: '3',
                    name: 'Sara Ahmed',
                    email: 'sara@example.com',
                    phone: '+92-301-3333333',
                    role: 'food_provider',
                    status: 'pending',
                    emailVerified: false,
                    createdAt: '2024-01-18T11:10:00Z',
                    lastLogin: '2024-01-20T08:30:00Z',
                    location: { city: 'Islamabad' }
                }
            ],
            pagination: {
                page: 1,
                limit: 10,
                total: 1247,
                pages: 125
            }
        };
    }

    getMockModerationQueue() {
        return {
            queue: [
                {
                    _id: '1',
                    type: 'accommodation',
                    title: 'University Heights Hostel',
                    description: 'New accommodation listing pending approval',
                    submittedBy: { name: 'Ali Hassan', role: 'landlord' },
                    status: 'pending',
                    priority: 'high',
                    reportedBy: null,
                    reason: null,
                    createdAt: '2024-01-20T10:30:00Z'
                },
                {
                    _id: '2',
                    type: 'food_provider',
                    title: 'Campus Delights Restaurant',
                    description: 'Food provider registration pending approval',
                    submittedBy: { name: 'Sara Ahmed', role: 'food_provider' },
                    status: 'pending',
                    priority: 'medium',
                    reportedBy: null,
                    reason: null,
                    createdAt: '2024-01-19T15:20:00Z'
                },
                {
                    _id: '3',
                    type: 'user_report',
                    title: 'Inappropriate Content Report',
                    description: 'User reported inappropriate images in accommodation listing',
                    submittedBy: { name: 'Ahmad Khan', role: 'student' },
                    status: 'under_review',
                    priority: 'high',
                    reportedBy: { name: 'Ahmad Khan' },
                    reason: 'Inappropriate images',
                    createdAt: '2024-01-19T12:45:00Z'
                }
            ],
            pagination: {
                page: 1,
                limit: 10,
                total: 23,
                pages: 3
            }
        };
    }

    getMockSystemSettings() {
        return {
            settings: {
                app: {
                    appName: 'StayKaru',
                    version: '1.0.0',
                    maintenanceMode: false,
                    allowRegistrations: true,
                    emailVerificationRequired: true
                },
                payments: {
                    stripePublishableKey: 'pk_test_...',
                    commissiion: {
                        accommodation: 0.10,
                        food: 0.05
                    },
                    currency: 'PKR'
                },
                notifications: {
                    emailNotifications: true,
                    pushNotifications: true,
                    smsNotifications: false
                },
                security: {
                    maxLoginAttempts: 5,
                    passwordMinLength: 8,
                    sessionTimeout: 24
                },
                content: {
                    autoModeration: true,
                    requireApproval: true,
                    allowReports: true
                }
            }
        };
    }

    getMockSystemHealth() {
        return {
            health: {
                status: 'healthy',
                uptime: 99.9,
                lastCheck: '2024-01-20T15:30:00Z',
                components: {
                    database: {
                        status: 'healthy',
                        responseTime: 45,
                        lastCheck: '2024-01-20T15:30:00Z'
                    },
                    api: {
                        status: 'healthy',
                        responseTime: 120,
                        lastCheck: '2024-01-20T15:30:00Z'
                    },
                    storage: {
                        status: 'healthy',
                        usage: 68,
                        lastCheck: '2024-01-20T15:30:00Z'
                    },
                    cache: {
                        status: 'degraded',
                        hitRate: 89,
                        lastCheck: '2024-01-20T15:30:00Z'
                    }
                },
                metrics: {
                    activeUsers: 342,
                    requestsPerMinute: 145,
                    averageResponseTime: 89,
                    errorRate: 0.02
                }
            }
        };
    }

    getMockRealTimeStats() {
        return {
            stats: {
                totalUsers: 1247,
                totalStudents: 856,
                totalLandlords: 234,
                totalFoodProviders: 157,
                totalAccommodations: 342,
                totalFoodItems: 1563,
                activeBookings: 89,
                pendingOrders: 23,
                totalRevenue: 2845000,
                todayRevenue: 45000,
                monthlyRevenue: 1250000,
                pendingApprovals: 23,
                systemHealth: 'Excellent',
                onlineUsers: 134,
                newRegistrationsToday: 12,
                bookingsToday: 8,
                ordersToday: 45
            }
        };
    }

    getMockRecentActivity() {
        return {
            activities: [
                {
                    id: '1',
                    type: 'user_registration',
                    title: 'New Student Registration',
                    description: 'Ahmad Khan registered as a student',
                    time: '5 minutes ago',
                    icon: 'person-add',
                    color: '#4CAF50',
                    user: { name: 'Ahmad Khan', role: 'student' }
                },
                {
                    id: '2',
                    type: 'accommodation_booking',
                    title: 'New Accommodation Booking',
                    description: 'Booking for Paradise Hostel confirmed',
                    time: '12 minutes ago',
                    icon: 'home',
                    color: '#2196F3',
                    user: { name: 'Ali Hassan', role: 'student' }
                },
                {
                    id: '3',
                    type: 'food_order',
                    title: 'High-Value Food Order',
                    description: 'Order worth PKR 2,500 from Campus Cafeteria',
                    time: '25 minutes ago',
                    icon: 'restaurant',
                    color: '#FF9800',
                    user: { name: 'Sara Khan', role: 'student' }
                },
                {
                    id: '4',
                    type: 'content_report',
                    title: 'Content Reported',
                    description: 'Property listing reported for inappropriate content',
                    time: '1 hour ago',
                    icon: 'flag',
                    color: '#F44336',
                    user: { name: 'Ahmed Ali', role: 'student' }
                },
                {
                    id: '5',
                    type: 'payment',
                    title: 'Payment Processed',
                    description: 'PKR 15,000 payment completed',
                    time: '2 hours ago',
                    icon: 'card',
                    color: '#9C27B0',
                    user: { name: 'Hassan Khan', role: 'landlord' }
                }
            ]
        };
    }

    getMockSystemLogs() {
        return {
            logs: [
                {
                    id: '1',
                    level: 'info',
                    message: 'User login successful',
                    timestamp: '2024-01-20T15:30:00Z',
                    source: 'auth-service',
                    userId: 'user_123'
                },
                {
                    id: '2',
                    level: 'warning',
                    message: 'High memory usage detected',
                    timestamp: '2024-01-20T15:25:00Z',
                    source: 'system-monitor',
                    details: { memoryUsage: '85%' }
                },
                {
                    id: '3',
                    level: 'error',
                    message: 'Payment processing failed',
                    timestamp: '2024-01-20T15:20:00Z',
                    source: 'payment-service',
                    error: 'Payment gateway timeout'
                }
            ]
        };
    }

    getMockFinancialSummary() {
        return {
            summary: {
                totalRevenue: 2845000,
                todayRevenue: 45000,
                monthlyRevenue: 1250000,
                yearlyRevenue: 12500000,
                accommodationRevenue: 1800000,
                foodRevenue: 1045000,
                commission: {
                    accommodation: 180000,
                    food: 52250,
                    total: 232250
                },
                trends: {
                    revenueGrowth: 15.5,
                    userGrowth: 22.3,
                    bookingGrowth: 18.7,
                    orderGrowth: 25.1
                }
            }
        };
    }
}

export default new AdminAPIClient();
