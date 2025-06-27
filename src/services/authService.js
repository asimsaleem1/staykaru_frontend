import AsyncStorage from '@react-native-async-storage/async-storage';

const API_BASE_URL = 'https://staykaru-backend-60ed08adb2a7.herokuapp.com/api';

class AuthService {
    constructor() {
        this.token = null;
        this.user = null;
    }

    // Check if user needs onboarding
    async needsOnboarding(userId) {
        try {
            const hasCompletedOnboarding = await AsyncStorage.getItem('hasCompletedOnboarding');
            if (hasCompletedOnboarding) {
                return false;
            }

            // Also check with backend
            const response = await fetch(`${API_BASE_URL}/user/${userId}/onboarding-status`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': this.token ? `Bearer ${this.token}` : '',
                },
            });

            if (response.ok) {
                const data = await response.json();
                return !data.hasCompletedOnboarding;
            }

            return true; // Default to needing onboarding if unclear
        } catch (error) {
            console.error('Error checking onboarding status:', error);
            return true;
        }
    }

    // Update user preferences
    async updateUserPreferences(userId, preferences) {
        try {
            const response = await fetch(`${API_BASE_URL}/user/${userId}/preferences`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': this.token ? `Bearer ${this.token}` : '',
                },
                body: JSON.stringify(preferences),
            });

            if (response.ok) {
                const data = await response.json();
                
                // Also store locally
                await AsyncStorage.setItem('userPreferences', JSON.stringify(preferences));
                
                return {
                    success: true,
                    data: data
                };
            } else {
                const errorData = await response.json();
                return {
                    success: false,
                    message: errorData.message || 'Failed to update preferences'
                };
            }
        } catch (error) {
            console.error('Error updating user preferences:', error);
            return {
                success: false,
                message: 'Network error occurred'
            };
        }
    }

    // Mark onboarding as complete
    async completeOnboarding(userId) {
        try {
            const response = await fetch(`${API_BASE_URL}/user/${userId}/complete-onboarding`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': this.token ? `Bearer ${this.token}` : '',
                },
            });

            if (response.ok) {
                await AsyncStorage.setItem('hasCompletedOnboarding', 'true');
                return { success: true };
            } else {
                return { success: false, message: 'Failed to mark onboarding as complete' };
            }
        } catch (error) {
            console.error('Error completing onboarding:', error);
            return { success: false, message: 'Network error occurred' };
        }
    }

    // NEW: Simplified Registration with Immediate Login
    async register(userData) {
        try {
            console.log('AuthService: Starting registration...');
            console.log('AuthService: User data received:', userData);
            
            // Updated payload matching new backend requirements
            const registrationPayload = {
                name: userData.name || '',
                email: userData.email || '',
                password: userData.password || '',
                role: userData.role || 'student',
                phone: userData.phone || '',
                countryCode: userData.countryCode || '+92',
                gender: userData.gender || '',
                identificationType: userData.identificationType || 'cnic',
                identificationNumber: userData.cnicPassport || '',
                profileImage: userData.profileImage || null
            };

            console.log('AuthService: Prepared payload:', registrationPayload);
            console.log('AuthService: Making API call to:', `${API_BASE_URL}/auth/register`);
            
            const response = await fetch(`${API_BASE_URL}/auth/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(registrationPayload),
            });

            console.log('AuthService: Response status:', response.status);
            
            let data;
            try {
                data = await response.json();
                console.log('AuthService: Response data:', data);
            } catch (jsonError) {
                console.error('AuthService: Failed to parse JSON response:', jsonError);
                const textResponse = await response.text();
                console.log('AuthService: Raw response:', textResponse);
                throw new Error('Server returned invalid response');
            }

            if (!response.ok) {
                console.error('AuthService: Registration failed with status:', response.status);
                throw new Error(data.message || `HTTP ${response.status}: Registration failed`);
            }

            console.log('AuthService: Registration successful with immediate login');
            
            // Store token and user data immediately after registration
            if (data.access_token) {
                this.token = data.access_token;
                await AsyncStorage.setItem('token', data.access_token);
            }
            
            if (data.user) {
                this.user = data.user;
                await AsyncStorage.setItem('user', JSON.stringify(data.user));
            }

            return {
                success: true,
                message: 'Registration successful! Logging you in...',
                user: data.user,
                token: data.access_token,
                immediateLogin: true
            };
        } catch (error) {
            console.error('AuthService: Registration error:', error);
            return {
                success: false,
                message: error.message || 'Registration failed. Please try again.'
            };
        }
    }    // NEW: Simplified Login (No Email Verification Required)
    async login(email, password) {
        try {
            console.log('AuthService: Starting login...');
            console.log('AuthService: Login credentials:', { email, password: '***' });
            
            const loginPayload = { email, password };
            console.log('AuthService: Making login API call to:', `${API_BASE_URL}/auth/login`);
            
            const response = await fetch(`${API_BASE_URL}/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(loginPayload),
            });

            console.log('AuthService: Login response status:', response.status);
            
            // Handle 503 Service Unavailable (backend down)
            if (response.status === 503) {
                console.error('AuthService: Backend service unavailable (503)');
                throw new Error('Service temporarily unavailable. Please try again later.');
            }
            
            // Get response text first, then try to parse as JSON
            const responseText = await response.text();
            console.log('AuthService: Raw response text:', responseText);
            
            let data;
            try {
                data = JSON.parse(responseText);
                console.log('AuthService: Parsed login response data:', data);
            } catch (jsonError) {
                console.error('AuthService: Failed to parse login response as JSON:', jsonError);
                console.log('AuthService: Response text length:', responseText.length);
                console.log('AuthService: Response preview:', responseText.substring(0, 200));
                
                // Check if response looks like HTML (common for 503 errors)
                if (responseText.trim().startsWith('<')) {
                    throw new Error('Backend service is currently unavailable. Please try again later.');
                }
                
                throw new Error('Server returned invalid response format');
            }

            if (!response.ok) {
                console.error('AuthService: Login failed with status:', response.status);
                
                // Handle common login errors
                if (response.status === 401 || response.status === 400) {
                    console.log('AuthService: Login failed - invalid credentials');
                    throw new Error('Invalid email or password');
                }
                
                throw new Error(data?.message || `HTTP ${response.status}: Login failed`);
            }

            console.log('AuthService: Login successful');
            
            // Store token and user data
            if (data.access_token) {
                console.log('AuthService: Storing authentication token');
                this.token = data.access_token;
                await AsyncStorage.setItem('token', data.access_token);
            }
            
            if (data.user) {
                console.log('AuthService: Storing user data');
                this.user = data.user;
                await AsyncStorage.setItem('user', JSON.stringify(data.user));
            }

            return {
                success: true,
                user: data.user,
                token: data.access_token
            };
        } catch (error) {
            console.error('AuthService: Login error:', error);
            
            // If it's a backend availability issue, offer demo mode for admin
            if (error.message.includes('unavailable') || error.message.includes('503')) {
                console.log('AuthService: Backend unavailable, checking for demo mode...');
                
                // Allow demo login for admin during backend downtime
                if (email === 'admin@staykaru.com' || email === 'demo@admin.com') {
                    console.log('AuthService: Activating demo mode for admin');
                    
                    const demoUser = {
                        id: 'demo-admin-1',
                        name: 'Demo Admin',
                        email: email,
                        role: 'admin',
                        isDemo: true
                    };
                    
                    const demoToken = 'demo-token-' + Date.now();
                    
                    this.user = demoUser;
                    this.token = demoToken;
                    
                    await AsyncStorage.setItem('user', JSON.stringify(demoUser));
                    await AsyncStorage.setItem('token', demoToken);
                    await AsyncStorage.setItem('demoMode', 'true');
                    
                    return {
                        success: true,
                        user: demoUser,
                        token: demoToken,
                        isDemo: true,
                        message: 'Demo mode activated - limited functionality'
                    };
                }
            }
            
            return {
                success: false,
                message: error.message || 'Login failed'
            };
        }
    }    // Get Dashboard Data with Role-Based Access
    async getDashboard() {
        try {
            const token = await AsyncStorage.getItem('token');
            if (!token) {
                throw new Error('No token found');
            }

            const response = await fetch(`${API_BASE_URL}/auth/dashboard`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });

            const data = await response.json();

            if (!response.ok) {
                if (response.status === 401) {
                    // Token expired
                    await this.logout();
                    throw new Error('Session expired. Please login again.');
                }
                throw new Error(data.message || 'Failed to get dashboard data');
            }

            return {
                success: true,
                data: data
            };
        } catch (error) {
            console.error('Get dashboard error:', error);
            return {
                success: false,
                message: error.message || 'Failed to get dashboard data'
            };
        }
    }

    // Get User Profile
    async getProfile() {
        try {
            const token = await AsyncStorage.getItem('token');
            if (!token) {
                throw new Error('No token found');
            }

            const response = await fetch(`${API_BASE_URL}/auth/profile`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Failed to get profile');
            }

            this.user = data;
            await AsyncStorage.setItem('user', JSON.stringify(data));

            return {
                success: true,
                user: data
            };
        } catch (error) {
            console.error('Get profile error:', error);
            return {
                success: false,
                message: error.message || 'Failed to get profile'
            };
        }
    }

    // Logout
    async logout() {
        try {
            this.token = null;
            this.user = null;
            await AsyncStorage.multiRemove(['token', 'user']);
            return { success: true };
        } catch (error) {
            console.error('Logout error:', error);
            return { success: false };
        }
    }

    // Get stored token
    async getToken() {
        try {
            const token = await AsyncStorage.getItem('token');
            this.token = token;
            return token;
        } catch (error) {
            console.error('Get token error:', error);
            return null;
        }
    }

    // Check Auth Status
    async checkAuthStatus() {
        try {
            const token = await AsyncStorage.getItem('token');
            const userStr = await AsyncStorage.getItem('user');

            if (token && userStr) {
                this.token = token;
                this.user = JSON.parse(userStr);
                return { isAuthenticated: true, user: this.user };
            }

            return { isAuthenticated: false };
        } catch (error) {
            console.error('Check auth status error:', error);
            return { isAuthenticated: false };
        }
    }

    // Helper: Get Role-Based Dashboard Route
    getRoleDashboardRoute(role) {
        switch (role) {
            case 'admin':
                return 'AdminStack';
            case 'student':
                return 'StudentDashboard';
            case 'landlord':
                return 'LandlordDashboardNew';
            case 'food_provider':
                return 'FoodProviderDashboardNew';
            default:
                return 'StudentDashboard'; // Default to student dashboard
        }
    }    // Helper: Make Authenticated API Call
    async makeAuthenticatedRequest(url, method = 'GET', body = null) {
        try {
            const token = await AsyncStorage.getItem('token');
            
            const headers = {
                'Content-Type': 'application/json'
            };
            
            if (token) {
                headers.Authorization = `Bearer ${token}`;
            }

            // Construct full URL if it's a relative path
            const fullUrl = url.startsWith('http') ? url : `${API_BASE_URL}${url}`;
            
            const response = await fetch(fullUrl, {
                method,
                headers,
                body: body ? JSON.stringify(body) : null
            });
            
            if (response.status === 401) {
                // Token expired or invalid
                await this.logout();
                throw new Error('Session expired. Please login again.');
            }

            const data = await response.json();
            return {
                success: response.ok,
                data: data,
                status: response.status
            };
        } catch (error) {
            console.error('Authenticated API call failed:', error);
            throw error;
        }
    }

    // Get current user data
    async getCurrentUser() {
        try {
            const userData = await AsyncStorage.getItem('user');
            if (userData) {
                return JSON.parse(userData);
            }
            return null;
        } catch (error) {
            console.error('Get current user error:', error);
            return null;
        }
    }

    // Check if user is authenticated
    async isAuthenticated() {
        try {
            const token = await AsyncStorage.getItem('token');
            const userData = await AsyncStorage.getItem('user');
            return !!(token && userData);
        } catch (error) {
            console.error('Check authentication error:', error);
            return false;
        }
    }
}

export default new AuthService();
