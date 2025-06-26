import AsyncStorage from '@react-native-async-storage/async-storage';

const API_BASE_URL = 'https://staykaru-backend-60ed08adb2a7.herokuapp.com/api';

class RecommendationService {
    constructor() {
        this.userPreferences = null;
        this.locationData = null;
    }

    async getUserPreferences() {
        if (!this.userPreferences) {
            try {
                const preferencesString = await AsyncStorage.getItem('userPreferences');
                if (preferencesString) {
                    this.userPreferences = JSON.parse(preferencesString);
                }
            } catch (error) {
                console.error('Error loading user preferences:', error);
            }
        }
        return this.userPreferences;
    }

    async getUserLocation() {
        if (!this.locationData) {
            try {
                const locationString = await AsyncStorage.getItem('userLocation');
                if (locationString) {
                    this.locationData = JSON.parse(locationString);
                }
            } catch (error) {
                console.error('Error loading user location:', error);
            }
        }
        return this.locationData;
    }

    async getPersonalizedAccommodations() {
        try {
            const preferences = await this.getUserPreferences();
            const location = await this.getUserLocation();
            const token = await AsyncStorage.getItem('token');

            const response = await fetch(`${API_BASE_URL}/recommendations/accommodations`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': token ? `Bearer ${token}` : '',
                },
                body: JSON.stringify({
                    preferences,
                    location,
                    limit: 10
                })
            });

            if (response.ok) {
                const data = await response.json();
                return {
                    success: true,
                    data: data.recommendations,
                    metadata: data.metadata
                };
            } else {
                // Fallback to mock recommendations
                return this.getMockAccommodationRecommendations(preferences, location);
            }
        } catch (error) {
            console.error('Error getting accommodation recommendations:', error);
            return this.getMockAccommodationRecommendations();
        }
    }

    async getPersonalizedFoodOptions() {
        try {
            const preferences = await this.getUserPreferences();
            const location = await this.getUserLocation();
            const token = await AsyncStorage.getItem('token');

            const response = await fetch(`${API_BASE_URL}/recommendations/food`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': token ? `Bearer ${token}` : '',
                },
                body: JSON.stringify({
                    preferences,
                    location,
                    limit: 10
                })
            });

            if (response.ok) {
                const data = await response.json();
                return {
                    success: true,
                    data: data.recommendations,
                    metadata: data.metadata
                };
            } else {
                // Fallback to mock recommendations
                return this.getMockFoodRecommendations(preferences, location);
            }
        } catch (error) {
            console.error('Error getting food recommendations:', error);
            return this.getMockFoodRecommendations();
        }
    }

    async getDashboardRecommendations() {
        try {
            const [accommodations, food] = await Promise.all([
                this.getPersonalizedAccommodations(),
                this.getPersonalizedFoodOptions()
            ]);

            return {
                success: true,
                data: {
                    accommodations: accommodations.data?.slice(0, 5) || [],
                    food: food.data?.slice(0, 5) || [],
                    tips: this.getPersonalizedTips()
                }
            };
        } catch (error) {
            console.error('Error getting dashboard recommendations:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    getPersonalizedTips() {
        const tips = [
            {
                id: 1,
                title: "Budget Tip",
                message: "Consider shared accommodations to save up to 40% on monthly rent.",
                icon: "cash-outline",
                type: "budget"
            },
            {
                id: 2,
                title: "Location Tip",
                message: "Areas near universities often have better public transport connectivity.",
                icon: "location-outline",
                type: "location"
            },
            {
                id: 3,
                title: "Safety Tip",
                message: "Always visit accommodations during daytime and check security measures.",
                icon: "shield-checkmark-outline",
                type: "safety"
            },
            {
                id: 4,
                title: "Food Tip",
                message: "Local restaurants near universities often offer student discounts.",
                icon: "restaurant-outline",
                type: "food"
            }
        ];

        // Randomly select 2-3 tips
        return tips.sort(() => 0.5 - Math.random()).slice(0, 3);
    }

    getMockAccommodationRecommendations(preferences = {}, location = null) {
        const mockAccommodations = [
            {
                id: '1',
                title: 'Modern Studio Apartment',
                location: 'Gulshan-e-Iqbal',
                price: 18000,
                currency: 'PKR',
                period: 'month',
                rating: 4.5,
                reviewCount: 23,
                distance: '2.3 km from KU',
                images: ['https://via.placeholder.com/300x200'],
                amenities: ['WiFi', 'AC', 'Parking', 'Security'],
                type: 'studio',
                area: '350 sq ft',
                availableFrom: '2024-02-01',
                matchScore: 95,
                matchReasons: ['Within budget', 'Preferred location', 'Good rating']
            },
            {
                id: '2',
                title: 'Shared Apartment - Single Room',
                location: 'North Nazimabad',
                price: 15000,
                currency: 'PKR',
                period: 'month',
                rating: 4.2,
                reviewCount: 18,
                distance: '3.1 km from KU',
                images: ['https://via.placeholder.com/300x200'],
                amenities: ['WiFi', 'Kitchen', 'Laundry', 'Common Area'],
                type: 'shared_room',
                area: '200 sq ft',
                availableFrom: '2024-01-15',
                matchScore: 88,
                matchReasons: ['Budget-friendly', 'Good transport links']
            },
            {
                id: '3',
                title: 'Luxury 1BHK Apartment',
                location: 'Clifton Block 2',
                price: 35000,
                currency: 'PKR',
                period: 'month',
                rating: 4.8,
                reviewCount: 45,
                distance: '8.2 km from KU',
                images: ['https://via.placeholder.com/300x200'],
                amenities: ['WiFi', 'AC', 'Gym', 'Pool', 'Security', 'Parking'],
                type: 'full_apartment',
                area: '650 sq ft',
                availableFrom: '2024-02-15',
                matchScore: 75,
                matchReasons: ['Luxury amenities', 'Excellent location']
            }
        ];

        // Filter based on preferences
        let filtered = mockAccommodations;
        
        if (preferences?.budget) {
            const budgetRanges = {
                'under_15000': [0, 15000],
                '15000_25000': [15000, 25000],
                '25000_40000': [25000, 40000],
                'above_40000': [40000, Infinity]
            };
            
            const range = budgetRanges[preferences.budget];
            if (range) {
                filtered = filtered.filter(acc => acc.price >= range[0] && acc.price <= range[1]);
            }
        }

        if (preferences?.accommodationType) {
            const typeMapping = {
                'single_room': 'shared_room',
                'shared_apartment': 'shared_room',
                'studio': 'studio',
                'full_apartment': 'full_apartment'
            };
            
            const targetType = typeMapping[preferences.accommodationType];
            if (targetType) {
                filtered = filtered.filter(acc => acc.type === targetType);
            }
        }

        return {
            success: true,
            data: filtered.sort((a, b) => b.matchScore - a.matchScore),
            metadata: {
                totalCount: filtered.length,
                source: 'mock',
                preferences: preferences
            }
        };
    }

    getMockFoodRecommendations(preferences = {}, location = null) {
        const mockRestaurants = [
            {
                id: '1',
                name: 'Desi Delight',
                cuisine: 'Pakistani',
                rating: 4.6,
                reviewCount: 156,
                priceRange: '₨₨',
                deliveryTime: '25-35 min',
                distance: '1.2 km',
                image: 'https://via.placeholder.com/300x200',
                specialties: ['Biryani', 'Karahi', 'BBQ'],
                discount: '20% off on first order',
                matchScore: 92,
                matchReasons: ['Matches food preferences', 'Highly rated', 'Near location']
            },
            {
                id: '2',
                name: 'Fresh & Healthy',
                cuisine: 'Healthy',
                rating: 4.3,
                reviewCount: 89,
                priceRange: '₨₨₨',
                deliveryTime: '20-30 min',
                distance: '0.8 km',
                image: 'https://via.placeholder.com/300x200',
                specialties: ['Salads', 'Grilled Items', 'Smoothies'],
                discount: 'Free delivery',
                matchScore: 87,
                matchReasons: ['Health-conscious menu', 'Fast delivery']
            },
            {
                id: '3',
                name: 'Pizza Corner',
                cuisine: 'Fast Food',
                rating: 4.1,
                reviewCount: 234,
                priceRange: '₨',
                deliveryTime: '15-25 min',
                distance: '2.1 km',
                image: 'https://via.placeholder.com/300x200',
                specialties: ['Pizza', 'Burgers', 'Fries'],
                discount: 'Buy 1 Get 1 Free',
                matchScore: 78,
                matchReasons: ['Budget-friendly', 'Quick delivery']
            }
        ];

        // Filter based on preferences
        let filtered = mockRestaurants;
        
        if (preferences?.foodPreferences?.length > 0) {
            const cuisineMapping = {
                'pakistani': 'Pakistani',
                'fast_food': 'Fast Food',
                'healthy': 'Healthy',
                'international': 'International'
            };
            
            const preferredCuisines = preferences.foodPreferences
                .map(pref => cuisineMapping[pref])
                .filter(Boolean);
            
            if (preferredCuisines.length > 0) {
                filtered = filtered.filter(restaurant => 
                    preferredCuisines.includes(restaurant.cuisine)
                );
            }
        }

        return {
            success: true,
            data: filtered.sort((a, b) => b.matchScore - a.matchScore),
            metadata: {
                totalCount: filtered.length,
                source: 'mock',
                preferences: preferences
            }
        };
    }

    async updateUserLocation(latitude, longitude, address = '') {
        try {
            const locationData = {
                latitude,
                longitude,
                address,
                timestamp: new Date().toISOString()
            };
            
            await AsyncStorage.setItem('userLocation', JSON.stringify(locationData));
            this.locationData = locationData;
            
            // Also update backend if user is logged in
            const token = await AsyncStorage.getItem('token');
            if (token) {
                await fetch(`${API_BASE_URL}/user/location`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`,
                    },
                    body: JSON.stringify(locationData)
                });
            }
            
            return { success: true };
        } catch (error) {
            console.error('Error updating user location:', error);
            return { success: false, error: error.message };
        }
    }

    async updateUserPreferences(newPreferences) {
        try {
            const updatedPreferences = {
                ...this.userPreferences,
                ...newPreferences,
                lastUpdated: new Date().toISOString()
            };
            
            await AsyncStorage.setItem('userPreferences', JSON.stringify(updatedPreferences));
            this.userPreferences = updatedPreferences;
            
            // Also update backend if user is logged in
            const token = await AsyncStorage.getItem('token');
            if (token) {
                await fetch(`${API_BASE_URL}/user/preferences`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`,
                    },
                    body: JSON.stringify(updatedPreferences)
                });
            }
            
            return { success: true };
        } catch (error) {
            console.error('Error updating user preferences:', error);
            return { success: false, error: error.message };
        }
    }

    async searchWithRecommendations(query, type = 'accommodation') {
        try {
            const preferences = await this.getUserPreferences();
            const location = await this.getUserLocation();
            const token = await AsyncStorage.getItem('token');

            const response = await fetch(`${API_BASE_URL}/search/${type}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': token ? `Bearer ${token}` : '',
                },
                body: JSON.stringify({
                    query,
                    preferences,
                    location,
                    includeRecommendations: true
                })
            });

            if (response.ok) {
                return await response.json();
            } else {
                throw new Error('Search request failed');
            }
        } catch (error) {
            console.error('Error performing search with recommendations:', error);
            return { success: false, error: error.message };
        }
    }

    async trackUserInteraction(type, itemId, action) {
        try {
            const token = await AsyncStorage.getItem('token');
            if (!token) return;

            await fetch(`${API_BASE_URL}/analytics/interaction`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({
                    type,
                    itemId,
                    action,
                    timestamp: new Date().toISOString()
                })
            });
        } catch (error) {
            console.error('Error tracking user interaction:', error);
        }
    }
}

export default new RecommendationService();
