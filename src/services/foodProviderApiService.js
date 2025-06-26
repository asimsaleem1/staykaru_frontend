import AsyncStorage from '@react-native-async-storage/async-storage';

const API_BASE_URL = 'https://staykaru-backend-60ed08adb2a7.herokuapp.com/api';

class FoodProviderAPIClient {
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

    // Food Provider Profile Management
    async getFoodProviderProfile() {
        try {
            const headers = await this.getAuthHeaders();
            const response = await fetch(`${API_BASE_URL}/food-provider/profile`, {
                method: 'GET',
                headers,
            });
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: Failed to fetch food provider profile`);
            }
            
            return await response.json();
        } catch (error) {
            console.error('Food Provider API: Profile error:', error);
            return this.getMockFoodProviderProfile();
        }
    }

    async updateFoodProviderProfile(profileData) {
        try {
            const headers = await this.getAuthHeaders();
            const response = await fetch(`${API_BASE_URL}/food-provider/profile`, {
                method: 'PUT',
                headers,
                body: JSON.stringify(profileData),
            });
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: Failed to update food provider profile`);
            }
            
            return await response.json();
        } catch (error) {
            console.error('Food Provider API: Update profile error:', error);
            throw error;
        }
    }

    // Menu Management
    async getMenu() {
        try {
            const headers = await this.getAuthHeaders();
            const response = await fetch(`${API_BASE_URL}/food-provider/menu`, {
                method: 'GET',
                headers,
            });
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: Failed to fetch menu`);
            }
            
            return await response.json();
        } catch (error) {
            console.error('Food Provider API: Menu error:', error);
            return this.getMockMenu();
        }
    }

    async addMenuItem(menuItem) {
        try {
            const headers = await this.getAuthHeaders();
            const response = await fetch(`${API_BASE_URL}/food-provider/menu/items`, {
                method: 'POST',
                headers,
                body: JSON.stringify(menuItem),
            });
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: Failed to add menu item`);
            }
            
            return await response.json();
        } catch (error) {
            console.error('Food Provider API: Add menu item error:', error);
            throw error;
        }
    }

    async updateMenuItem(itemId, menuItem) {
        try {
            const headers = await this.getAuthHeaders();
            const response = await fetch(`${API_BASE_URL}/food-provider/menu/items/${itemId}`, {
                method: 'PUT',
                headers,
                body: JSON.stringify(menuItem),
            });
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: Failed to update menu item`);
            }
            
            return await response.json();
        } catch (error) {
            console.error('Food Provider API: Update menu item error:', error);
            throw error;
        }
    }

    async deleteMenuItem(itemId) {
        try {
            const headers = await this.getAuthHeaders();
            const response = await fetch(`${API_BASE_URL}/food-provider/menu/items/${itemId}`, {
                method: 'DELETE',
                headers,
            });
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: Failed to delete menu item`);
            }
            
            return await response.json();
        } catch (error) {
            console.error('Food Provider API: Delete menu item error:', error);
            throw error;
        }
    }

    // Order Management
    async getOrders(params = {}) {
        try {
            const headers = await this.getAuthHeaders();
            const queryParams = new URLSearchParams(params).toString();
            const response = await fetch(`${API_BASE_URL}/food-provider/orders?${queryParams}`, {
                method: 'GET',
                headers,
            });
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: Failed to fetch orders`);
            }
            
            return await response.json();
        } catch (error) {
            console.error('Food Provider API: Orders error:', error);
            return this.getMockOrders();
        }
    }

    async updateOrderStatus(orderId, status, estimatedTime = null) {
        try {
            const headers = await this.getAuthHeaders();
            const response = await fetch(`${API_BASE_URL}/food-provider/orders/${orderId}/status`, {
                method: 'PUT',
                headers,
                body: JSON.stringify({ status, estimatedTime }),
            });
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: Failed to update order status`);
            }
            
            return await response.json();
        } catch (error) {
            console.error('Food Provider API: Update order status error:', error);
            throw error;
        }
    }

    // Analytics and Insights
    async getAnalytics(timeRange = '30d') {
        try {
            const headers = await this.getAuthHeaders();
            const response = await fetch(`${API_BASE_URL}/food-provider/analytics?timeRange=${timeRange}`, {
                method: 'GET',
                headers,
            });
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: Failed to fetch analytics`);
            }
            
            return await response.json();
        } catch (error) {
            console.error('Food Provider API: Analytics error:', error);
            return this.getMockAnalytics();
        }
    }

    async getRevenueStats(timeRange = '30d') {
        try {
            const headers = await this.getAuthHeaders();
            const response = await fetch(`${API_BASE_URL}/food-provider/revenue?timeRange=${timeRange}`, {
                method: 'GET',
                headers,
            });
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: Failed to fetch revenue stats`);
            }
            
            return await response.json();
        } catch (error) {
            console.error('Food Provider API: Revenue stats error:', error);
            return this.getMockRevenueStats();
        }
    }

    // Student-facing endpoints
    async getFoodProviders(params = {}) {
        try {
            const headers = await this.getAuthHeaders();
            const queryParams = new URLSearchParams(params).toString();
            const response = await fetch(`${API_BASE_URL}/student/food-providers?${queryParams}`, {
                method: 'GET',
                headers,
            });
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: Failed to fetch food providers`);
            }
            
            return await response.json();
        } catch (error) {
            console.error('Food Provider API: Get food providers error:', error);
            return this.getMockFoodProviders();
        }
    }

    async getFoodProviderDetails(providerId) {
        try {
            const headers = await this.getAuthHeaders();
            const response = await fetch(`${API_BASE_URL}/student/food-providers/${providerId}`, {
                method: 'GET',
                headers,
            });
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: Failed to fetch food provider details`);
            }
            
            return await response.json();
        } catch (error) {
            console.error('Food Provider API: Get food provider details error:', error);
            return this.getMockFoodProviderDetails(providerId);
        }
    }

    async placeOrder(orderData) {
        try {
            const headers = await this.getAuthHeaders();
            const response = await fetch(`${API_BASE_URL}/student/orders`, {
                method: 'POST',
                headers,
                body: JSON.stringify(orderData),
            });
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: Failed to place order`);
            }
            
            return await response.json();
        } catch (error) {
            console.error('Food Provider API: Place order error:', error);
            throw error;
        }
    }

    // Mock Data Methods
    getMockFoodProviderProfile() {
        return {
            profile: {
                _id: 'fp_123',
                businessName: 'Campus Delights',
                ownerName: 'Ahmad Ali',
                email: 'ahmad@campusdelights.com',
                phone: '+92-301-1234567',
                description: 'Best Pakistani and Fast Food near university campus',
                cuisine_type: ['Pakistani', 'Fast Food', 'Chinese'],
                location: {
                    address: 'Block A, University Road, Karachi',
                    city: 'Karachi',
                    coordinates: {
                        latitude: 24.8607,
                        longitude: 67.0011
                    }
                },
                openingHours: {
                    monday: { open: '09:00', close: '23:00' },
                    tuesday: { open: '09:00', close: '23:00' },
                    wednesday: { open: '09:00', close: '23:00' },
                    thursday: { open: '09:00', close: '23:00' },
                    friday: { open: '09:00', close: '23:00' },
                    saturday: { open: '10:00', close: '23:00' },
                    sunday: { open: '10:00', close: '22:00' }
                },
                rating: 4.6,
                totalReviews: 234,
                isActive: true,
                verified: true,
                images: [
                    'https://via.placeholder.com/400x300',
                    'https://via.placeholder.com/400x300',
                    'https://via.placeholder.com/400x300'
                ],
                features: ['Home Delivery', 'Takeaway', 'Online Payment', 'Cash on Delivery'],
                minimumOrder: 200,
                deliveryRadius: 5,
                deliveryFee: 50,
                estimatedDeliveryTime: 30
            }
        };
    }

    getMockMenu() {
        return {
            menu: {
                categories: [
                    {
                        _id: 'cat_1',
                        name: 'Pakistani Cuisine',
                        items: [
                            {
                                _id: 'item_1',
                                name: 'Chicken Biryani',
                                description: 'Aromatic basmati rice cooked with tender chicken and spices',
                                price: 350,
                                image: 'https://via.placeholder.com/300x200',
                                isAvailable: true,
                                preparationTime: 25,
                                isVegetarian: false,
                                spiceLevel: 'medium',
                                allergens: [],
                                nutrition: {
                                    calories: 450,
                                    protein: '25g',
                                    carbs: '55g',
                                    fat: '15g'
                                }
                            },
                            {
                                _id: 'item_2',
                                name: 'Karahi Chicken',
                                description: 'Spicy chicken cooked in traditional karahi with tomatoes and spices',
                                price: 450,
                                image: 'https://via.placeholder.com/300x200',
                                isAvailable: true,
                                preparationTime: 30,
                                isVegetarian: false,
                                spiceLevel: 'hot',
                                allergens: [],
                                nutrition: {
                                    calories: 380,
                                    protein: '30g',
                                    carbs: '15g',
                                    fat: '20g'
                                }
                            }
                        ]
                    },
                    {
                        _id: 'cat_2',
                        name: 'Fast Food',
                        items: [
                            {
                                _id: 'item_3',
                                name: 'Zinger Burger',
                                description: 'Crispy chicken fillet burger with fresh vegetables and mayo',
                                price: 250,
                                image: 'https://via.placeholder.com/300x200',
                                isAvailable: true,
                                preparationTime: 15,
                                isVegetarian: false,
                                spiceLevel: 'mild',
                                allergens: ['gluten'],
                                nutrition: {
                                    calories: 520,
                                    protein: '28g',
                                    carbs: '45g',
                                    fat: '25g'
                                }
                            },
                            {
                                _id: 'item_4',
                                name: 'Loaded Fries',
                                description: 'Crispy fries topped with cheese, chicken, and special sauce',
                                price: 200,
                                image: 'https://via.placeholder.com/300x200',
                                isAvailable: true,
                                preparationTime: 10,
                                isVegetarian: false,
                                spiceLevel: 'mild',
                                allergens: ['dairy'],
                                nutrition: {
                                    calories: 380,
                                    protein: '12g',
                                    carbs: '35g',
                                    fat: '22g'
                                }
                            }
                        ]
                    }
                ]
            }
        };
    }

    getMockOrders() {
        return {
            orders: [
                {
                    _id: 'order_1',
                    orderNumber: 'FO-2024-001',
                    student: {
                        name: 'Ahmad Khan',
                        phone: '+92-301-2222222',
                        email: 'ahmad@student.com'
                    },
                    items: [
                        {
                            menuItem: {
                                name: 'Chicken Biryani',
                                price: 350
                            },
                            quantity: 2,
                            specialInstructions: 'Extra spicy'
                        },
                        {
                            menuItem: {
                                name: 'Cold Drink',
                                price: 50
                            },
                            quantity: 2,
                            specialInstructions: ''
                        }
                    ],
                    subtotal: 800,
                    deliveryFee: 50,
                    totalAmount: 850,
                    paymentMethod: 'Cash on Delivery',
                    deliveryAddress: {
                        street: 'Hostel Block A, Room 205',
                        area: 'University Campus',
                        city: 'Karachi',
                        landmark: 'Near Main Gate'
                    },
                    status: 'pending',
                    estimatedDeliveryTime: '2024-01-20T14:30:00Z',
                    placedAt: '2024-01-20T13:15:00Z',
                    statusHistory: [
                        {
                            status: 'pending',
                            timestamp: '2024-01-20T13:15:00Z',
                            note: 'Order received'
                        }
                    ]
                },
                {
                    _id: 'order_2',
                    orderNumber: 'FO-2024-002',
                    student: {
                        name: 'Ali Hassan',
                        phone: '+92-301-3333333',
                        email: 'ali@student.com'
                    },
                    items: [
                        {
                            menuItem: {
                                name: 'Zinger Burger',
                                price: 250
                            },
                            quantity: 1,
                            specialInstructions: 'No mayo'
                        },
                        {
                            menuItem: {
                                name: 'Loaded Fries',
                                price: 200
                            },
                            quantity: 1,
                            specialInstructions: ''
                        }
                    ],
                    subtotal: 450,
                    deliveryFee: 50,
                    totalAmount: 500,
                    paymentMethod: 'Online Payment',
                    deliveryAddress: {
                        street: 'Apartment 3B, Block C',
                        area: 'DHA Phase 2',
                        city: 'Karachi',
                        landmark: 'Near McDonald\'s'
                    },
                    status: 'preparing',
                    estimatedDeliveryTime: '2024-01-20T15:00:00Z',
                    placedAt: '2024-01-20T14:00:00Z',
                    statusHistory: [
                        {
                            status: 'pending',
                            timestamp: '2024-01-20T14:00:00Z',
                            note: 'Order received'
                        },
                        {
                            status: 'confirmed',
                            timestamp: '2024-01-20T14:05:00Z',
                            note: 'Payment confirmed, preparing order'
                        },
                        {
                            status: 'preparing',
                            timestamp: '2024-01-20T14:10:00Z',
                            note: 'Food is being prepared'
                        }
                    ]
                }
            ],
            pagination: {
                page: 1,
                limit: 10,
                total: 156,
                pages: 16
            }
        };
    }

    getMockAnalytics() {
        return {
            analytics: {
                todayOrders: 25,
                todayRevenue: 12500,
                monthlyOrders: 450,
                monthlyRevenue: 185000,
                averageOrderValue: 410,
                popularItems: [
                    { name: 'Chicken Biryani', orders: 85, revenue: 29750 },
                    { name: 'Zinger Burger', orders: 120, revenue: 30000 },
                    { name: 'Loaded Fries', orders: 95, revenue: 19000 }
                ],
                peakHours: [
                    { hour: '12:00', orders: 15 },
                    { hour: '13:00', orders: 22 },
                    { hour: '19:00', orders: 28 },
                    { hour: '20:00', orders: 35 }
                ],
                customerSatisfaction: {
                    averageRating: 4.6,
                    totalReviews: 234,
                    positiveReviews: 201,
                    negativeReviews: 12
                }
            }
        };
    }

    getMockRevenueStats() {
        return {
            revenue: {
                today: 12500,
                yesterday: 11800,
                thisWeek: 78500,
                lastWeek: 72300,
                thisMonth: 185000,
                lastMonth: 167000,
                totalEarnings: 2450000,
                pendingPayouts: 35000,
                completedPayouts: 2415000,
                commission: {
                    rate: 0.05,
                    thisMonth: 9250,
                    total: 122500
                }
            }
        };
    }

    getMockFoodProviders() {
        return {
            foodProviders: [
                {
                    _id: 'fp_1',
                    businessName: 'Campus Delights',
                    description: 'Best Pakistani and Fast Food near university',
                    cuisine_type: ['Pakistani', 'Fast Food'],
                    rating: 4.6,
                    totalReviews: 234,
                    estimatedDeliveryTime: 30,
                    deliveryFee: 50,
                    minimumOrder: 200,
                    isOpen: true,
                    distance: 0.5,
                    image: 'https://via.placeholder.com/300x200',
                    location: {
                        address: 'University Road, Karachi',
                        city: 'Karachi'
                    },
                    popularItems: [
                        { name: 'Chicken Biryani', price: 350 },
                        { name: 'Zinger Burger', price: 250 }
                    ]
                },
                {
                    _id: 'fp_2',
                    businessName: 'Karachi Biryani House',
                    description: 'Authentic Karachi-style biryani and traditional Pakistani food',
                    cuisine_type: ['Pakistani', 'Traditional'],
                    rating: 4.8,
                    totalReviews: 456,
                    estimatedDeliveryTime: 35,
                    deliveryFee: 60,
                    minimumOrder: 300,
                    isOpen: true,
                    distance: 1.2,
                    image: 'https://via.placeholder.com/300x200',
                    location: {
                        address: 'Tariq Road, Karachi',
                        city: 'Karachi'
                    },
                    popularItems: [
                        { name: 'Mutton Biryani', price: 450 },
                        { name: 'Chicken Karahi', price: 500 }
                    ]
                }
            ],
            pagination: {
                page: 1,
                limit: 10,
                total: 25,
                pages: 3
            }
        };
    }

    getMockFoodProviderDetails(providerId) {
        return {
            foodProvider: {
                _id: providerId,
                businessName: 'Campus Delights',
                description: 'Best Pakistani and Fast Food near university campus',
                cuisine_type: ['Pakistani', 'Fast Food', 'Chinese'],
                rating: 4.6,
                totalReviews: 234,
                estimatedDeliveryTime: 30,
                deliveryFee: 50,
                minimumOrder: 200,
                isOpen: true,
                distance: 0.5,
                images: [
                    'https://via.placeholder.com/400x300',
                    'https://via.placeholder.com/400x300'
                ],
                location: {
                    address: 'Block A, University Road, Karachi',
                    city: 'Karachi',
                    coordinates: {
                        latitude: 24.8607,
                        longitude: 67.0011
                    }
                },
                openingHours: {
                    monday: { open: '09:00', close: '23:00' },
                    tuesday: { open: '09:00', close: '23:00' },
                    wednesday: { open: '09:00', close: '23:00' },
                    thursday: { open: '09:00', close: '23:00' },
                    friday: { open: '09:00', close: '23:00' },
                    saturday: { open: '10:00', close: '23:00' },
                    sunday: { open: '10:00', close: '22:00' }
                },
                features: ['Home Delivery', 'Takeaway', 'Online Payment', 'Cash on Delivery'],
                menu: this.getMockMenu().menu
            }
        };
    }
}

export default new FoodProviderAPIClient();
