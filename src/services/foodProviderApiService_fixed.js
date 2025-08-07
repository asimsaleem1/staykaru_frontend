import AsyncStorage from '@react-native-async-storage/async-storage';
import backendStatusService from './backendStatusService.js';

const API_BASE_URL = 'https://staykaru-backend-60ed08adb2a7.herokuapp.com/api';

class FoodProviderAPIClient {
    constructor() {
        this.token = null;
        this.baseURL = API_BASE_URL;
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

    async apiCall(endpoint, options = {}) {
        const headers = await this.getAuthHeaders();

        if (!backendStatusService.getCurrentStatus()) {
            throw new Error('Backend service is currently unavailable');
        }

        try {
            const response = await fetch(`${this.baseURL}${endpoint}`, {
                headers,
                ...options
            });

            if (response.ok) {
                return await response.json();
            } else {
                const errorText = await response.text();
                throw new Error(`HTTP ${response.status}: ${errorText}`);
            }
        } catch (error) {
            throw error;
        }
    }

    // Authentication Methods
    async register(providerData) {
        const response = await fetch(`${this.baseURL}/auth/food-provider/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(providerData)
        });

        if (response.ok) {
            const data = await response.json();
            if (data.access_token) {
                await AsyncStorage.setItem('token', data.access_token);
                await AsyncStorage.setItem('user', JSON.stringify(data.user));
            }
            return data;
        } else {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Registration failed');
        }
    }

    async login(email, password) {
        const response = await fetch(`${this.baseURL}/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ 
                email, 
                password,
                role: 'food_provider'
            })
        });

        if (response.ok) {
            const data = await response.json();
            if (data.access_token) {
                await AsyncStorage.setItem('token', data.access_token);
                await AsyncStorage.setItem('user', JSON.stringify(data.user));
            }
            return data;
        } else {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Login failed');
        }
    }

    async logout() {
        try {
            await this.apiCall('/auth/logout', { method: 'POST' });
        } catch (error) {
            console.warn('Logout API call failed:', error);
        } finally {
            await AsyncStorage.removeItem('token');
            await AsyncStorage.removeItem('user');
            this.token = null;
        }
    }

    // Dashboard Methods - Updated to use working food provider endpoints
    async getDashboard() {
        try {
            // Use the working food provider dashboard endpoint
            const response = await fetch(`${this.baseURL}/food-providers/dashboard`, {
                headers: await this.getAuthHeaders(),
            });
            
            if (response.ok) {
                const data = await response.json();
                return {
                    totalOrders: data.totalOrders || 0,
                    activeOrders: data.activeOrders || 0,
                    totalRevenue: data.totalRevenue || 0,
                    menuItems: data.menuItems || 0
                };
            } else {
                throw new Error(`HTTP ${response.status}: Dashboard fetch failed`);
            }
        } catch (error) {
            console.warn('Dashboard fetch failed, using fallback data:', error.message);
            // Return fallback data when backend is unavailable
            return {
                totalOrders: 0,
                activeOrders: 0,
                totalRevenue: 0,
                menuItems: 0
            };
        }
    }

    async getAnalytics(days = 30) {
        try {
            // Use the working food provider analytics endpoint
            const response = await fetch(`${this.baseURL}/food-providers/analytics?days=${days}`, {
                headers: await this.getAuthHeaders(),
            });
            
            if (response.ok) {
                const data = await response.json();
                return {
                    todayRevenue: data.todayRevenue || 0,
                    weeklyRevenue: data.weeklyRevenue || 0,
                    monthlyRevenue: data.monthlyRevenue || 0,
                    orderStats: data.orderStats || {}
                };
            } else {
                throw new Error(`HTTP ${response.status}: Analytics fetch failed`);
            }
        } catch (error) {
            console.warn('Analytics fetch failed, using fallback data:', error.message);
            return {
                todayRevenue: 0,
                weeklyRevenue: 0,
                monthlyRevenue: 0,
                orderStats: {}
            };
        }
    }

    // Profile Management
    async getFoodProviderProfile() {
        try {
            const user = await AsyncStorage.getItem('user');
            const userData = JSON.parse(user);
            const providerId = userData?.id;

            if (!providerId) {
                throw new Error('No provider ID found');
            }

            const response = await fetch(`${this.baseURL}/food-providers/${providerId}`, {
                headers: await this.getAuthHeaders(),
            });
            
            if (response.ok) {
                const data = await response.json();
                return data;
            } else {
                throw new Error(`HTTP ${response.status}: Profile fetch failed`);
            }
        } catch (error) {
            console.warn('Profile fetch failed, using fallback data:', error.message);
            // Return fallback profile data when backend is unavailable
            return {
                id: 'current-user',
                name: 'Food Provider',
                email: 'food@provider.com',
                role: 'food_provider',
                phone: '1234567890'
            };
        }
    }

    async updateFoodProviderProfile(profileData) {
        try {
            const user = await AsyncStorage.getItem('user');
            const userData = JSON.parse(user);
            const providerId = userData?.id;

            if (!providerId) {
                throw new Error('No provider ID found');
            }

            const response = await fetch(`${this.baseURL}/food-providers/${providerId}`, {
                method: 'PUT',
                headers: await this.getAuthHeaders(),
                body: JSON.stringify(profileData),
            });
            
            if (response.ok) {
                return await response.json();
            } else {
                throw new Error(`HTTP ${response.status}: Profile update failed`);
            }
        } catch (error) {
            console.warn('Profile update failed:', error.message);
            throw error;
        }
    }

    // Menu Management
    async getMenu() {
        try {
            const user = await AsyncStorage.getItem('user');
            const userData = JSON.parse(user);
            const providerId = userData?.id;

            if (!providerId) {
                throw new Error('No provider ID found');
            }

            const response = await fetch(`${this.baseURL}/food-providers/owner/menu-items/${providerId}`, {
                headers: await this.getAuthHeaders(),
            });
            
            if (response.ok) {
                const data = await response.json();
                return data;
            } else {
                throw new Error(`HTTP ${response.status}: Menu fetch failed`);
            }
        } catch (error) {
            console.warn('Menu fetch failed, using fallback data:', error.message);
            return { menu: { categories: [] } };
        }
    }

    async addMenuItem(menuItem) {
        try {
            const user = await AsyncStorage.getItem('user');
            const userData = JSON.parse(user);
            const providerId = userData?.id;

            if (!providerId) {
                throw new Error('No provider ID found');
            }

            const response = await fetch(`${this.baseURL}/food-providers/owner/menu-items/${providerId}`, {
                method: 'POST',
                headers: await this.getAuthHeaders(),
                body: JSON.stringify(menuItem)
            });
            
            if (response.ok) {
                return await response.json();
            } else {
                throw new Error(`HTTP ${response.status}: Add menu item failed`);
            }
        } catch (error) {
            console.warn('Add menu item failed:', error.message);
            throw error;
        }
    }

    async updateMenuItem(itemId, menuItem) {
        try {
            const user = await AsyncStorage.getItem('user');
            const userData = JSON.parse(user);
            const providerId = userData?.id;

            if (!providerId) {
                throw new Error('No provider ID found');
            }

            const response = await fetch(`${this.baseURL}/food-providers/owner/menu-items/${providerId}/${itemId}`, {
                method: 'PUT',
                headers: await this.getAuthHeaders(),
                body: JSON.stringify(menuItem)
            });
            
            if (response.ok) {
                return await response.json();
            } else {
                throw new Error(`HTTP ${response.status}: Update menu item failed`);
            }
        } catch (error) {
            console.warn('Update menu item failed:', error.message);
            throw error;
        }
    }

    async deleteMenuItem(itemId) {
        try {
            const user = await AsyncStorage.getItem('user');
            const userData = JSON.parse(user);
            const providerId = userData?.id;

            if (!providerId) {
                throw new Error('No provider ID found');
            }

            const response = await fetch(`${this.baseURL}/food-providers/owner/menu-items/${providerId}/${itemId}`, {
                method: 'DELETE',
                headers: await this.getAuthHeaders(),
            });
            
            if (response.ok) {
                return await response.json();
            } else {
                throw new Error(`HTTP ${response.status}: Delete menu item failed`);
            }
        } catch (error) {
            console.warn('Delete menu item failed:', error.message);
            throw error;
        }
    }

    // Order Management
    async getOrders(params = {}) {
        try {
            // Use the working food provider orders endpoint
            const queryParams = new URLSearchParams(params).toString();
            const queryString = queryParams ? `?${queryParams}` : '';
            
            const response = await fetch(`${this.baseURL}/food-providers/orders${queryString}`, {
                headers: await this.getAuthHeaders(),
            });
            
            if (response.ok) {
                const data = await response.json();
                return data;
            } else {
                throw new Error(`HTTP ${response.status}: Orders fetch failed`);
            }
        } catch (error) {
            console.warn('Orders fetch failed, using fallback data:', error.message);
            // Return empty orders array when backend is unavailable
            return { orders: [] };
        }
    }

    async getOrderDetails(orderId) {
        try {
            const response = await fetch(`${this.baseURL}/orders/${orderId}`, {
                headers: await this.getAuthHeaders(),
            });
            
            if (response.ok) {
                return await response.json();
            } else {
                throw new Error(`HTTP ${response.status}: Order details fetch failed`);
            }
        } catch (error) {
            console.warn('Order details fetch failed:', error.message);
            throw error;
        }
    }

    async updateOrderStatus(orderId, status, estimatedTime = null) {
        try {
            const response = await fetch(`${this.baseURL}/orders/${orderId}/status`, {
                method: 'PUT',
                headers: await this.getAuthHeaders(),
                body: JSON.stringify({ status, estimatedTime }),
            });
            
            if (response.ok) {
                return await response.json();
            } else {
                throw new Error(`HTTP ${response.status}: Order status update failed`);
            }
        } catch (error) {
            console.warn('Order status update failed:', error.message);
            throw error;
        }
    }

    // Revenue and Analytics
    async getRevenueStats(days = 30) {
        try {
            const response = await fetch(`${this.baseURL}/food-providers/analytics?days=${days}`, {
                headers: await this.getAuthHeaders(),
            });
            
            if (response.ok) {
                const data = await response.json();
                return {
                    totalRevenue: data.totalRevenue || 0,
                    todayRevenue: data.todayRevenue || 0,
                    weeklyRevenue: data.weeklyRevenue || 0,
                    monthlyRevenue: data.monthlyRevenue || 0,
                    revenueChart: data.revenueChart || []
                };
            } else {
                throw new Error(`HTTP ${response.status}: Revenue stats fetch failed`);
            }
        } catch (error) {
            console.warn('Revenue stats fetch failed:', error.message);
            return {
                totalRevenue: 0,
                todayRevenue: 0,
                weeklyRevenue: 0,
                monthlyRevenue: 0,
                revenueChart: []
            };
        }
    }

    // Notifications
    async getNotifications() {
        try {
            const response = await fetch(`${this.baseURL}/notifications`, {
                headers: await this.getAuthHeaders(),
            });
            
            if (response.ok) {
                const data = await response.json();
                return data;
            } else {
                throw new Error(`HTTP ${response.status}: Notifications fetch failed`);
            }
        } catch (error) {
            console.warn('Notifications fetch failed:', error.message);
            return { notifications: [] };
        }
    }

    async markNotificationAsRead(notificationId) {
        try {
            const response = await fetch(`${this.baseURL}/notifications/${notificationId}/read`, {
                method: 'PUT',
                headers: await this.getAuthHeaders(),
            });
            
            if (response.ok) {
                return await response.json();
            } else {
                throw new Error(`HTTP ${response.status}: Mark notification as read failed`);
            }
        } catch (error) {
            console.warn('Mark notification as read failed:', error.message);
            throw error;
        }
    }

    // Settings and Preferences
    async getSettings() {
        try {
            const response = await fetch(`${this.baseURL}/food-provider/settings`, {
                headers: await this.getAuthHeaders(),
            });
            
            if (response.ok) {
                const data = await response.json();
                return data;
            } else {
                throw new Error(`HTTP ${response.status}: Settings fetch failed`);
            }
        } catch (error) {
            console.warn('Settings fetch failed, using defaults:', error.message);
            return {
                notifications: {
                    orderUpdates: true,
                    promotions: true,
                    reviews: true
                },
                businessHours: {
                    monday: { open: '09:00', close: '22:00', closed: false },
                    tuesday: { open: '09:00', close: '22:00', closed: false },
                    wednesday: { open: '09:00', close: '22:00', closed: false },
                    thursday: { open: '09:00', close: '22:00', closed: false },
                    friday: { open: '09:00', close: '22:00', closed: false },
                    saturday: { open: '09:00', close: '22:00', closed: false },
                    sunday: { open: '09:00', close: '22:00', closed: false }
                },
                orderPreferences: {
                    autoAccept: false,
                    maxOrdersPerHour: 10,
                    preparationTime: 30
                }
            };
        }
    }

    async updateSettings(settings) {
        try {
            const response = await fetch(`${this.baseURL}/food-provider/settings`, {
                method: 'PUT',
                headers: await this.getAuthHeaders(),
                body: JSON.stringify(settings),
            });
            
            if (response.ok) {
                return await response.json();
            } else {
                throw new Error(`HTTP ${response.status}: Settings update failed`);
            }
        } catch (error) {
            console.warn('Settings update failed:', error.message);
            throw error;
        }
    }

    // Image Upload
    async uploadImage(imageData, type = 'menu') {
        try {
            const formData = new FormData();
            formData.append('image', {
                uri: imageData.uri,
                type: imageData.type || 'image/jpeg',
                name: imageData.name || 'image.jpg',
            });
            formData.append('type', type);

            const headers = await this.getAuthHeaders();
            delete headers['Content-Type']; // Let fetch set the content type for FormData

            const response = await fetch(`${this.baseURL}/upload/image`, {
                method: 'POST',
                headers,
                body: formData,
            });
            
            if (response.ok) {
                return await response.json();
            } else {
                throw new Error(`HTTP ${response.status}: Image upload failed`);
            }
        } catch (error) {
            console.warn('Image upload failed:', error.message);
            throw error;
        }
    }
}

// Create and export a singleton instance
const foodProviderApiService = new FoodProviderAPIClient();
export default foodProviderApiService;
