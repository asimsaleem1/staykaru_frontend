// Try different backend URLs for development/production
const BACKEND_URLS = [
    'https://staykaru-backend-60ed08adb2a7.herokuapp.com/api', // Production
    'http://localhost:3000/api', // Local development
    'http://192.168.1.100:3000/api', // Local network (update with your IP)
];

// Use the first URL as default, but allow switching
export const API_BASE_URL = BACKEND_URLS[0];
export const FALLBACK_URLS = BACKEND_URLS;

export const ROLES = {
    ADMIN: 'admin',
    STUDENT: 'student',
    LANDLORD: 'landlord',
    FOOD_PROVIDER: 'food_provider',
};

export const ROLE_OPTIONS = [
    { label: 'Select Role', value: '' },
    { label: 'Student', value: 'student' },
    { label: 'Landlord', value: 'landlord' },
    { label: 'Food Provider', value: 'food_provider' },
];

export const COUNTRIES = [
    { label: 'Select Country', value: '' },
    { label: 'Pakistan', value: 'Pakistan' },
    { label: 'India', value: 'India' },
    { label: 'United States', value: 'United States' },
    { label: 'United Kingdom', value: 'United Kingdom' },
    { label: 'Canada', value: 'Canada' },
    { label: 'Australia', value: 'Australia' },
];

export const CITIES = {
    Pakistan: [
        'Select City',
        'Karachi',
        'Lahore',
        'Islamabad',
        'Rawalpindi',
        'Faisalabad',
        'Multan',
        'Peshawar',
        'Quetta',
        'Sialkot',
        'Gujranwala'
    ],
    India: [
        'Select City',
        'Mumbai',
        'Delhi',
        'Bangalore',
        'Chennai',
        'Kolkata',
        'Hyderabad',
        'Pune',
        'Ahmedabad',
        'Jaipur',
        'Lucknow'
    ],
    'United States': [
        'Select City',
        'New York',
        'Los Angeles',
        'Chicago',
        'Houston',
        'Phoenix',
        'Philadelphia',
        'San Antonio',
        'San Diego',
        'Dallas',
        'San Jose'
    ],
    'United Kingdom': [
        'Select City',
        'London',
        'Manchester',
        'Birmingham',
        'Liverpool',
        'Leeds',
        'Sheffield',
        'Bristol',
        'Glasgow',
        'Edinburgh',
        'Newcastle'
    ],
    Canada: [
        'Select City',
        'Toronto',
        'Vancouver',
        'Montreal',
        'Calgary',
        'Ottawa',
        'Edmonton',
        'Mississauga',
        'Winnipeg',
        'Quebec City',
        'Hamilton'
    ],
    Australia: [
        'Select City',
        'Sydney',
        'Melbourne',
        'Brisbane',
        'Perth',
        'Adelaide',
        'Gold Coast',
        'Newcastle',
        'Canberra',
        'Sunshine Coast',
        'Wollongong'
    ],
};

export const COLORS = {
    primary: '#2563eb',
    secondary: '#64748b',
    success: '#10b981',
    error: '#ef4444',
    warning: '#f59e0b',
    info: '#3b82f6',
    light: '#f8fafc',
    dark: '#1e293b',
    gray: {
        50: '#f8fafc',
        100: '#f1f5f9',
        200: '#e2e8f0',
        300: '#cbd5e1',
        400: '#94a3b8',
        500: '#64748b',
        600: '#475569',
        700: '#334155',
        800: '#1e293b',
        900: '#0f172a',
    }
};

export const FONTS = {
    regular: 'System',
    medium: 'System',
    bold: 'System',
    light: 'System',
};

export const SIZES = {
    // Global sizes
    base: 8,
    font: 14,
    radius: 8,
    padding: 16,
    margin: 16,

    // Font sizes
    largeTitle: 32,
    h1: 28,
    h2: 24,
    h3: 20,
    h4: 18,
    body1: 16,
    body2: 14,
    body3: 12,
    caption: 10,

    // App dimensions
    width: 375,
    height: 812,
};
