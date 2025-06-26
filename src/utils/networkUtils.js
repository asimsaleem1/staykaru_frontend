import { API_BASE_URL } from '../utils/constants';

// Network connectivity test utility - try real backend first with retries
export const testBackendConnection = async () => {
    const maxRetries = 1; // Reduce retries for faster response
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
            console.log(`🔍 Testing backend connection (attempt ${attempt}/${maxRetries})...`);
            
            // Try a simple endpoint first
            const response = await Promise.race([
                fetch(`${API_BASE_URL}/`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                }),
                new Promise((_, reject) => 
                    setTimeout(() => reject(new Error('Request timeout')), 8000)
                )
            ]);
            
            // Accept any response as connection success (even 404 means server is up)
            if (response.status < 500) {
                console.log('✅ Backend connected successfully');
                return { success: true, status: 'connected' };
            }
            
        } catch (error) {
            console.log(`❌ Attempt ${attempt} failed: ${error.message}`);
            if (attempt === maxRetries) {
                console.log('📱 Backend unavailable, using demo data');
                return { success: false, status: 'demo_mode' };
            }
            // Wait 1 second before retry
            await new Promise(resolve => setTimeout(resolve, 1000));
        }
    }
    
    return { success: false, status: 'demo_mode' };
};

// Force fetch fresh data from backend
export const fetchFromBackend = async (endpoint) => {
    try {
        console.log(`🔄 Fetching data from: ${API_BASE_URL}${endpoint}`);
        
        // Get token for authenticated requests
        const token = await import('@react-native-async-storage/async-storage')
            .then(AsyncStorage => AsyncStorage.default.getItem('token'));
        
        const headers = {
            'Content-Type': 'application/json',
        };
        
        if (token) {
            headers.Authorization = `Bearer ${token}`;
        }
        
        const response = await Promise.race([
            fetch(`${API_BASE_URL}${endpoint}`, {
                method: 'GET',
                headers,
            }),
            new Promise((_, reject) => 
                setTimeout(() => reject(new Error('Request timeout')), 20000)
            )
        ]);

        if (response.ok) {
            const data = await response.json();
            console.log(`✅ Successfully fetched data from ${endpoint}`);
            return { success: true, data };
        } else {
            console.log(`❌ Backend error ${response.status} for ${endpoint}`);
            return { success: false, error: `HTTP ${response.status}` };
        }
    } catch (error) {
        console.log(`❌ Failed to fetch ${endpoint}: ${error.message}`);
        return { success: false, error: error.message };
    }
};

// Mock data for development when backend is not available
export const getMockData = (dataType) => {
    const mockData = {
        accommodations: [
            {
                id: '1',
                _id: '1',
                title: 'Modern Studio Apartment',
                description: 'Fully furnished studio apartment near university',
                price: 25000,
                location: 'Gulberg, Lahore',
                images: ['https://via.placeholder.com/300x200'],
                amenities: ['WiFi', 'AC', 'Kitchen', 'Parking'],
                rating: 4.5,
                reviews: [
                    { id: '1', user: { name: 'Ahmad Ali' }, rating: 5, comment: 'Great place!' }
                ],
                house_rules: ['No smoking', 'No pets', 'Quiet hours 10PM-8AM'],
                type: 'studio',
                available: true
            },
            {
                id: '2',
                _id: '2',
                title: 'Shared Hostel Room',
                description: 'Budget-friendly shared accommodation',
                price: 8000,
                location: 'Johar Town, Lahore',
                images: ['https://via.placeholder.com/300x200'],
                amenities: ['WiFi', 'Common Kitchen', 'Laundry'],
                rating: 4.0,
                reviews: [],
                house_rules: ['No smoking'],
                type: 'hostel',
                available: true
            }
        ],
        foodProviders: [
            {
                id: '1',
                _id: '1',
                name: 'Pizza Corner',
                cuisine_type: 'Italian',
                description: 'Best pizza in town',
                address: 'MM Alam Road, Lahore',
                rating: 4.2,
                delivery_time: '30-45',
                distance: '2.5',
                image: 'https://via.placeholder.com/300x200',
                menu_items: [
                    {
                        id: '1',
                        name: 'Margherita Pizza',
                        description: 'Classic tomato and mozzarella',
                        price: 899,
                        category: 'Pizza',
                        image: 'https://via.placeholder.com/100x100',
                        dietary_info: ['vegetarian']
                    },
                    {
                        id: '2',
                        name: 'Chicken Tikka Pizza',
                        description: 'Spicy chicken with tikka sauce',
                        price: 1299,
                        category: 'Pizza',
                        image: 'https://via.placeholder.com/100x100',
                        dietary_info: []
                    }
                ]
            },
            {
                id: '2',
                _id: '2',
                name: 'Desi Dhaba',
                cuisine_type: 'Pakistani',
                description: 'Authentic Pakistani cuisine',
                address: 'Liberty Market, Lahore',
                rating: 4.5,
                delivery_time: '25-40',
                distance: '1.8',
                image: 'https://via.placeholder.com/300x200',
                menu_items: [
                    {
                        id: '3',
                        name: 'Chicken Karahi',
                        description: 'Traditional chicken karahi',
                        price: 750,
                        category: 'Main Course',
                        image: 'https://via.placeholder.com/100x100',
                        dietary_info: []
                    }
                ]
            }
        ],
        bookings: [
            {
                id: '1',
                _id: '1',
                accommodation: {
                    title: 'Modern Studio Apartment',
                    location: 'Gulberg, Lahore'
                },
                start_date: new Date().toISOString(),
                end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
                status: 'confirmed',
                total_amount: 25000,
                payment_method: 'card'
            }
        ],
        orders: [
            {
                id: '1',
                _id: '1',
                restaurant: {
                    name: 'Pizza Corner'
                },
                items: [
                    {
                        name: 'Margherita Pizza',
                        quantity: 1,
                        price: 899
                    }
                ],
                total_amount: 949, // Including delivery fee
                status: 'delivered',
                created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
                delivery_address: 'Student Hostel, Block A'
            }
        ],
        dashboardStats: {
            totalBookings: 3,
            activeBookings: 1,
            totalOrders: 8,
            recentOrders: 2,
            bookings: [
                {
                    _id: '1',
                    accommodation: { title: 'Modern Studio Apartment' },
                    status: 'confirmed',
                    start_date: new Date().toISOString()
                }
            ],
            accommodations: [
                {
                    _id: '1',
                    id: '1',
                    title: 'Modern Studio Apartment',
                    price: 25000,
                    location: 'Gulberg, Lahore',
                    image: 'https://via.placeholder.com/150x100'
                }
            ],
            foodProviders: [
                {
                    _id: '1',
                    id: '1',
                    name: 'Pizza Corner',
                    cuisine_type: 'Italian',
                    rating: 4.2,
                    image: 'https://via.placeholder.com/150x100'
                }
            ]
        }
    };
    
    return mockData[dataType] || [];
};

export default {
    testBackendConnection,
    fetchFromBackend,
    getMockData
};
