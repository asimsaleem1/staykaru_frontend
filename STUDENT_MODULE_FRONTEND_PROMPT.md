# STUDENT MODULE - FRONTEND DEVELOPMENT PROMPT

## 🎯 Project Overview

You are tasked with developing the **Student Module Frontend** for the Staykaru platform - a comprehensive student accommodation and food service platform. This module serves university students who need to find accommodation, order food, and manage their student life efficiently.

## 📋 Requirements Summary

### ✅ Backend Status
- **100% Tested**: All 29 endpoints are working perfectly
- **API Ready**: Complete REST API with JWT authentication
- **Real-time**: WebSocket support for notifications and updates
- **Database**: MongoDB with optimized schemas
- **File Upload**: Image upload support for profiles and reviews

### 🎯 Target Users
- **Primary**: University students (18-25 years)
- **Secondary**: International students
- **Platforms**: Mobile-first (React Native/Flutter) + Web (React.js)

---

## 🏗️ Technical Architecture

### Frontend Stack Options

#### Option 1: React Native (Recommended for Mobile)
```javascript
// Core Dependencies
{
  "react-native": "^0.72.0",
  "@react-navigation/native": "^6.1.0",
  "@react-navigation/stack": "^6.3.0",
  "@react-navigation/bottom-tabs": "^6.5.0",
  "axios": "^1.5.0",
  "react-native-vector-icons": "^10.0.0",
  "react-native-elements": "^3.4.3",
  "react-native-maps": "^1.7.1",
  "react-native-image-picker": "^5.6.0",
  "socket.io-client": "^4.7.0",
  "react-native-push-notification": "^8.1.1",
  "react-native-gesture-handler": "^2.12.0",
  "react-native-reanimated": "^3.4.0"
}
```

#### Option 2: Flutter (Alternative Mobile)
```yaml
# pubspec.yaml
dependencies:
  flutter:
    sdk: flutter
  dio: ^5.3.0
  provider: ^6.0.5
  google_maps_flutter: ^2.4.0
  image_picker: ^1.0.4
  socket_io_client: ^2.0.3
  flutter_local_notifications: ^15.1.1
  cached_network_image: ^3.2.3
  shimmer: ^3.0.0
```

#### Option 3: React.js (Web Version)
```javascript
// package.json
{
  "react": "^18.2.0",
  "react-router-dom": "^6.15.0",
  "axios": "^1.5.0",
  "socket.io-client": "^4.7.0",
  "react-query": "^3.39.0",
  "react-hook-form": "^7.45.0",
  "react-dropzone": "^14.2.3",
  "react-google-maps": "^9.4.5",
  "react-hot-toast": "^2.4.1",
  "tailwindcss": "^3.3.0"
}
```

---

## 📱 Screen Specifications

### 1. Authentication Screens

#### Login Screen
```javascript
// Features Required
- Email/Password input fields with validation
- "Remember Me" checkbox
- "Forgot Password" link
- "Register" navigation link
- Social login buttons (Google, Facebook)
- Loading states during authentication
- Error handling with user-friendly messages

// UI Components
- Clean, modern design with university branding
- Input validation with real-time feedback
- Secure password field with show/hide toggle
- Responsive design for different screen sizes
```

#### Registration Screen
```javascript
// Form Fields Required
- Full Name (required)
- Email Address (required, with validation)
- Password (required, strength indicator)
- Confirm Password (required, match validation)
- Phone Number (required, with country code)
- Gender (dropdown: Male, Female, Other)
- University (required, searchable dropdown)
- Program/Field of Study (required)
- Year of Study (dropdown: 1st, 2nd, 3rd, 4th, 5th+)
- Terms & Conditions checkbox (required)

// Features
- Multi-step form for better UX
- Real-time validation
- Email verification process
- Profile picture upload option
- University search with autocomplete
```

### 2. Dashboard Screen

#### Main Dashboard
```javascript
// Layout Structure
- Header with user profile and notifications
- Welcome message with user's name
- Quick action buttons (Book Accommodation, Order Food)
- Recent activity cards
- Statistics overview
- Bottom navigation

// Components Required
- User greeting with profile picture
- Notification badge with unread count
- Quick action cards with icons
- Recent bookings/orders list
- Spending analytics chart
- Search bar for quick access
- Weather widget (optional)

// Data Integration
- Real-time notification updates
- Live booking/order status
- Dynamic statistics
- Personalized recommendations
```

### 3. Accommodation Screens

#### Accommodation List Screen
```javascript
// Search & Filter Features
- Location search with autocomplete
- Price range slider (0-2000)
- Amenities filter (WiFi, Kitchen, Gym, Parking, etc.)
- Date range picker for availability
- Sort options (Price, Rating, Distance, Newest)
- Map/List view toggle

// Accommodation Cards
- High-quality image carousel
- Title and location
- Price per night/week/month
- Rating with star display
- Amenities icons
- Availability status
- Quick book button

// Advanced Features
- Infinite scroll pagination
- Pull-to-refresh
- Offline caching
- Favorite/bookmark functionality
- Share accommodation feature
```

#### Accommodation Detail Screen
```javascript
// Image Gallery
- Full-screen image carousel
- Multiple high-resolution photos
- Virtual tour option (if available)
- Image zoom functionality

// Information Sections
- Detailed description
- Amenities list with icons
- House rules and policies
- Location details with map
- Host information and rating
- Cancellation policy

// Booking Section
- Date picker for check-in/check-out
- Guest count selector
- Price breakdown
- Special requests text area
- Booking button with loading state

// Reviews Section
- Overall rating display
- Review list with pagination
- Review filters (All, Positive, Negative)
- Write review button
```

#### My Bookings Screen
```javascript
// Booking Management
- Active bookings tab
- Past bookings tab
- Booking status indicators
- Booking details view
- Cancel/modify options
- Payment status display

// Booking Cards
- Accommodation image and name
- Booking dates
- Total amount
- Status badge (Pending, Confirmed, Completed, Cancelled)
- Action buttons (View Details, Cancel, Extend)
- Payment information
```

### 4. Food Service Screens

#### Food Provider List Screen
```javascript
// Provider Cards
- Restaurant logo and name
- Cuisine type
- Rating and review count
- Delivery time estimate
- Minimum order amount
- Delivery fee
- Open/closed status

// Search & Filter
- Cuisine type filter
- Rating filter (4+ stars, 3+ stars, etc.)
- Delivery time filter
- Price range filter
- Distance filter
- Open now filter

// Features
- Favorite restaurants
- Quick reorder from history
- Restaurant recommendations
- Special offers and discounts
```

#### Menu Screen
```javascript
// Menu Categories
- Horizontal scrollable category tabs
- Category icons and names
- Item count per category

// Menu Items
- High-quality food images
- Item name and description
- Price display
- Customization options
- Add to cart button
- Dietary information (Vegetarian, Vegan, Gluten-free)

// Cart Integration
- Floating cart button with item count
- Cart preview
- Total amount display
- Checkout button
```

#### Order Management Screen
```javascript
// Order Tracking
- Real-time order status
- Delivery progress bar
- Estimated delivery time
- Driver location (if available)
- Order history

// Order Details
- Restaurant information
- Ordered items with quantities
- Price breakdown
- Delivery address
- Payment method
- Order timeline

// Actions
- Cancel order (if applicable)
- Contact restaurant
- Rate order
- Reorder functionality
```

### 5. Profile Screens

#### Profile Overview Screen
```javascript
// User Information
- Profile picture with edit option
- Personal details
- Academic information
- Contact information
- Account settings

// Preferences Section
- Accommodation preferences
- Food preferences
- Notification settings
- Privacy settings
- Language preferences

// Quick Actions
- Edit profile
- Change password
- Payment methods
- Address book
- Help & Support
```

#### Edit Profile Screen
```javascript
// Editable Fields
- Profile picture upload
- Personal information
- Academic details
- Contact information
- Preferences

// Features
- Image cropping and editing
- Form validation
- Auto-save functionality
- Cancel changes option
- Save button with loading state
```

### 6. Review Screens

#### Write Review Screen
```javascript
// Review Form
- Star rating selector (1-5 stars)
- Review text area
- Photo upload option
- Anonymous review toggle
- Submit button

// Features
- Character count for review text
- Photo gallery for multiple images
- Draft saving
- Preview before submission
```

#### Review History Screen
```javascript
// Review List
- Review cards with ratings
- Review text and photos
- Target (accommodation/restaurant)
- Review date
- Edit/delete options

// Filters
- All reviews
- Accommodation reviews
- Food provider reviews
- Date range filter
```

### 7. Notification Screen
```javascript
// Notification List
- Notification cards with icons
- Notification title and message
- Timestamp
- Read/unread status
- Action buttons

// Features
- Mark as read functionality
- Mark all as read
- Notification filters
- Delete notifications
- Notification preferences
```

### 8. Payment Screens

#### Payment Methods Screen
```javascript
// Payment Options
- Saved payment methods
- Add new payment method
- Digital wallets
- Bank transfer options

// Security Features
- Secure payment processing
- Payment method verification
- Transaction history
```

#### Payment History Screen
```javascript
// Transaction List
- Transaction details
- Payment status
- Amount and date
- Receipt download
- Refund status
```

---

## 🔧 Technical Requirements

### State Management
```javascript
// Redux/Context Structure
{
  auth: {
    user: User | null,
    token: string | null,
    isAuthenticated: boolean,
    loading: boolean
  },
  profile: {
    userProfile: UserProfile | null,
    preferences: Preferences | null,
    loading: boolean
  },
  accommodations: {
    list: Accommodation[],
    filters: FilterOptions,
    selectedAccommodation: Accommodation | null,
    loading: boolean
  },
  bookings: {
    active: Booking[],
    past: Booking[],
    selectedBooking: Booking | null,
    loading: boolean
  },
  orders: {
    active: Order[],
    past: Order[],
    selectedOrder: Order | null,
    loading: boolean
  },
  notifications: {
    list: Notification[],
    unreadCount: number,
    loading: boolean
  },
  reviews: {
    list: Review[],
    selectedReview: Review | null,
    loading: boolean
  }
}
```

### API Integration
```javascript
// API Service Structure
class ApiService {
  // Authentication
  register(userData) {}
  login(credentials) {}
  logout() {}
  changePassword(passwords) {}
  
  // Profile
  getProfile() {}
  updateProfile(profileData) {}
  uploadProfilePicture(image) {}
  
  // Accommodations
  getAccommodations(filters) {}
  getAccommodationDetails(id) {}
  
  // Bookings
  getMyBookings(filters) {}
  createBooking(bookingData) {}
  cancelBooking(id) {}
  
  // Orders
  getMyOrders(filters) {}
  createOrder(orderData) {}
  cancelOrder(id) {}
  
  // Reviews
  getReviews(filters) {}
  createReview(reviewData) {}
  updateReview(id, reviewData) {}
  
  // Notifications
  getNotifications(filters) {}
  markAsRead(id) {}
  markAllAsRead() {}
}
```

### Real-time Features
```javascript
// WebSocket Integration
class WebSocketService {
  connect(token) {
    this.socket = io('http://localhost:3000', {
      auth: { token }
    });
    
    this.socket.on('notification', this.handleNotification);
    this.socket.on('booking_update', this.handleBookingUpdate);
    this.socket.on('order_update', this.handleOrderUpdate);
  }
  
  handleNotification(notification) {
    // Show push notification
    // Update notification count
    // Add to notification list
  }
  
  handleBookingUpdate(booking) {
    // Update booking status
    // Show status change notification
  }
  
  handleOrderUpdate(order) {
    // Update order status
    // Show delivery updates
  }
}
```

### Offline Support
```javascript
// Offline Data Management
class OfflineManager {
  // Cache accommodations
  cacheAccommodations(data) {}
  
  // Cache user profile
  cacheProfile(data) {}
  
  // Queue offline actions
  queueAction(action) {}
  
  // Sync when online
  syncOfflineActions() {}
}
```

---

## 🎨 UI/UX Requirements

### Design System
```javascript
// Color Palette
const colors = {
  primary: '#2563EB',      // Blue
  secondary: '#10B981',    // Green
  accent: '#F59E0B',       // Orange
  success: '#059669',      // Green
  warning: '#D97706',      // Orange
  error: '#DC2626',        // Red
  info: '#3B82F6',         // Blue
  light: '#F8FAFC',        // Light gray
  dark: '#1E293B',         // Dark gray
  white: '#FFFFFF',
  black: '#000000'
};

// Typography
const typography = {
  h1: { fontSize: 32, fontWeight: 'bold' },
  h2: { fontSize: 24, fontWeight: 'bold' },
  h3: { fontSize: 20, fontWeight: 'semibold' },
  body: { fontSize: 16, fontWeight: 'normal' },
  caption: { fontSize: 14, fontWeight: 'normal' },
  button: { fontSize: 16, fontWeight: 'semibold' }
};

// Spacing
const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48
};
```

### Component Library
```javascript
// Required Components
- Button (Primary, Secondary, Outline, Ghost)
- Input (Text, Email, Password, Search)
- Card (Accommodation, Order, Booking, Review)
- Modal (Confirmation, Image Gallery, Filter)
- Bottom Sheet (Options, Actions)
- Loading (Spinner, Skeleton, Shimmer)
- Toast (Success, Error, Warning, Info)
- Rating (Star Rating, Review Rating)
- Image (Profile, Accommodation, Food)
- Map (Location, Delivery Tracking)
```

### Responsive Design
```javascript
// Breakpoints
const breakpoints = {
  mobile: '320px',
  tablet: '768px',
  desktop: '1024px',
  wide: '1440px'
};

// Responsive utilities
const responsive = {
  mobile: '@media (min-width: 320px)',
  tablet: '@media (min-width: 768px)',
  desktop: '@media (min-width: 1024px)',
  wide: '@media (min-width: 1440px)'
};
```

---

## 🔒 Security Requirements

### Authentication Security
```javascript
// Token Management
- Secure token storage (Keychain/Keystore)
- Token refresh mechanism
- Automatic logout on token expiry
- Biometric authentication option

// Data Protection
- Encrypted local storage
- Secure API communication (HTTPS)
- Input sanitization
- XSS protection
```

### Privacy Compliance
```javascript
// GDPR Compliance
- User consent management
- Data deletion options
- Privacy policy integration
- Cookie consent (web)

// Data Handling
- Minimal data collection
- Secure data transmission
- Regular data cleanup
- User data export
```

---

## 📱 Mobile-Specific Requirements

### React Native Features
```javascript
// Required Libraries
- react-native-maps: Location and mapping
- react-native-image-picker: Photo upload
- react-native-push-notification: Push notifications
- react-native-gesture-handler: Touch interactions
- react-native-reanimated: Smooth animations
- react-native-vector-icons: Icons
- react-native-elements: UI components

// Platform-Specific
- iOS: Face ID/Touch ID integration
- Android: Fingerprint authentication
- Both: Deep linking, app shortcuts
```

### Flutter Features
```javascript
// Required Packages
- google_maps_flutter: Maps integration
- image_picker: Photo selection
- flutter_local_notifications: Local notifications
- cached_network_image: Image caching
- shimmer: Loading effects
- provider: State management

// Platform Features
- iOS: Apple Pay integration
- Android: Google Pay integration
- Both: Biometric authentication
```

---

## 🧪 Testing Requirements

### Unit Testing
```javascript
// Test Coverage Requirements
- Components: 90% coverage
- Services: 95% coverage
- Utils: 100% coverage
- API integration: 90% coverage

// Testing Framework
- Jest for unit tests
- React Native Testing Library
- Mock API responses
- Snapshot testing
```

### Integration Testing
```javascript
// Test Scenarios
- Complete user registration flow
- Accommodation booking process
- Food ordering workflow
- Payment processing
- Real-time notifications
- Offline functionality
```

### User Acceptance Testing
```javascript
// Test Cases
- User registration and login
- Profile management
- Accommodation search and booking
- Food ordering and tracking
- Review system
- Notification management
- Payment processing
- Error handling
```

---

## 🚀 Performance Requirements

### Performance Metrics
```javascript
// Target Metrics
- App launch time: <3 seconds
- Screen transition: <300ms
- API response: <2 seconds
- Image loading: <1 second
- Offline functionality: 100% core features

// Optimization
- Image compression and caching
- Lazy loading for lists
- Code splitting
- Bundle size optimization
- Memory management
```

### Monitoring
```javascript
// Analytics Integration
- User behavior tracking
- Performance monitoring
- Error tracking
- Crash reporting
- Usage analytics
```

---

## 📋 Development Checklist

### Phase 1: Core Setup
- [ ] Project initialization
- [ ] Navigation setup
- [ ] State management configuration
- [ ] API service setup
- [ ] Authentication flow
- [ ] Basic UI components

### Phase 2: Core Features
- [ ] User registration and login
- [ ] Profile management
- [ ] Dashboard implementation
- [ ] Accommodation browsing
- [ ] Booking system
- [ ] Basic error handling

### Phase 3: Advanced Features
- [ ] Food ordering system
- [ ] Review system
- [ ] Notification system
- [ ] Payment integration
- [ ] Real-time updates
- [ ] Offline support

### Phase 4: Polish & Testing
- [ ] UI/UX refinement
- [ ] Performance optimization
- [ ] Comprehensive testing
- [ ] Bug fixes
- [ ] Documentation
- [ ] Deployment preparation

---

## 🎯 Success Criteria

### Functional Requirements
- [ ] All 16 API endpoints integrated successfully
- [ ] 100% test coverage for core functionality
- [ ] Real-time notifications working
- [ ] Offline functionality for core features
- [ ] Payment processing secure and reliable

### Performance Requirements
- [ ] App launch time under 3 seconds
- [ ] Smooth 60fps animations
- [ ] Responsive design on all screen sizes
- [ ] Efficient memory usage
- [ ] Fast image loading and caching

### User Experience
- [ ] Intuitive navigation
- [ ] Consistent design language
- [ ] Accessible to users with disabilities
- [ ] Error handling with helpful messages
- [ ] Loading states for all async operations

---

## 📞 Support & Resources

### API Documentation
- Complete API documentation available
- All endpoints tested and verified
- Real-time WebSocket documentation
- Error handling guidelines

### Design Resources
- UI/UX design system
- Component library
- Icon set
- Color palette
- Typography guidelines

### Development Resources
- Code examples and templates
- Best practices guide
- Performance optimization tips
- Security guidelines

---

*This comprehensive prompt provides all the necessary information to develop a world-class Student Module frontend that integrates seamlessly with the tested backend API. Focus on creating an intuitive, performant, and secure user experience for university students.* 