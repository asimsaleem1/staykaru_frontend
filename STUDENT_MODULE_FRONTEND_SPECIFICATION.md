# StayKaru Student Module Frontend Specification

## Overview

The StayKaru Student Module provides comprehensive functionality for student users to discover accommodations, book places, order food, and manage their university living experience in one integrated platform. This document outlines the complete specification for developing the student-facing frontend interface.

## Table of Contents

1. [Design System](#design-system)
2. [Authentication & Onboarding](#authentication--onboarding)
3. [Student Dashboard](#student-dashboard)
4. [Accommodation Module](#accommodation-module)
5. [Booking Management](#booking-management)
6. [Food Service Module](#food-service-module)
7. [Order Management](#order-management)
8. [User Profile & Settings](#user-profile--settings)
9. [Notifications System](#notifications-system)
10. [Chat & Support](#chat--support)
11. [Integration Requirements](#integration-requirements)
12. [Non-Functional Requirements](#non-functional-requirements)
13. [Technical Implementation](#technical-implementation)
14. [Appendix: API Reference](#appendix-api-reference)

## Design System

### Colors

- **Primary**: `#3498db` (Blue)
- **Secondary**: `#2ecc71` (Green)
- **Accent**: `#e74c3c` (Red)
- **Neutral**:
  - Dark: `#2c3e50`
  - Mid: `#7f8c8d`
  - Light: `#ecf0f1`
- **Background**: `#f9f9f9`

### Typography

- **Headings**: Poppins (Bold, SemiBold)
- **Body**: Inter (Regular, Medium)
- **Sizes**:
  - H1: 32px / 40px line height
  - H2: 24px / 32px line height
  - H3: 20px / 28px line height
  - Body: 16px / 24px line height
  - Small: 14px / 20px line height

### Components

Develop consistent reusable components:

- Buttons (Primary, Secondary, Tertiary, Icon)
- Form elements (Input, Select, Checkbox, Radio, Toggle)
- Cards (Accommodation, Food Item, Booking)
- Navigation (Header, Footer, Sidebar)
- Modals and Dialogs
- Loaders and Skeletons
- Alerts and Notifications

### Responsive Breakpoints

- Mobile: 320px - 767px
- Tablet: 768px - 1023px
- Desktop: 1024px - 1439px
- Large Desktop: 1440px+

## Authentication & Onboarding

### Screens

#### 1. Login Screen

![Login Screen](https://via.placeholder.com/600x400.png?text=Login+Screen+Mockup)

**Requirements:**
- Email/phone and password fields with validation
- "Remember me" option with secure storage
- Forgot password link
- "Sign up as a student" link
- OAuth login options (Google, Facebook, Apple)
- Password strength indicator on registration
- Two-factor authentication support (optional)

**Error Handling:**
- Specific error messages for different scenarios:
  - Invalid credentials
  - Account locked due to multiple attempts
  - Unverified email address
  - Network connectivity issues
  - Server errors
- Appropriate UI feedback:
  - Form validation errors with inline messages
  - Toast notifications for transient errors
  - Modal dialogs for critical errors
  - Offline mode detection with automatic retry
- Security considerations:
  - Rate limiting for failed login attempts
  - Throttling protection with exponential back-off
  - Generic error messages for security (production)
  - Detailed error messages for debugging (development)

**API Integration:**
```javascript
POST /api/auth/login
{
  "email": "student@example.com",
  "password": "securepassword"
}

// Example response handling
try {
  const response = await api.post('/api/auth/login', credentials);
  // Store tokens securely
  secureStorage.setItem('accessToken', response.data.accessToken);
  secureStorage.setItem('refreshToken', response.data.refreshToken);
  // Navigate to dashboard
  navigate('/dashboard');
} catch (error) {
  if (!navigator.onLine) {
    setError('You are currently offline. Please check your connection and try again.');
  } else if (error.response) {
    switch (error.response.status) {
      case 401:
        setError('Invalid email or password. Please try again.');
        break;
      case 403:
        setError('Your account has been temporarily locked. Please try again later or reset your password.');
        break;
      case 423:
        setError('Your email address is not verified. Please check your inbox or request a new verification email.');
        setShowResendVerification(true);
        break;
      default:
        setError('Unable to log in. Please try again later.');
    }
  } else {
    setError('A connection error occurred. Please try again.');
  }
}
```

#### 2. Registration Screen

![Registration Screen](https://via.placeholder.com/600x400.png?text=Registration+Screen+Mockup)

**Requirements:**
- Multi-step registration form
- Step 1: Basic Info (Name, Email, Password, Phone)
- Step 2: Personal Details (Gender, Date of Birth, Address)
- Step 3: Academic Info (University, Student ID)
- Step 4: Emergency Contact
- Password strength indicator
- Email verification step

**API Integration:**
```javascript
POST /api/auth/register
{
  "name": "Student Name",
  "email": "student@example.com",
  "password": "securePassword123",
  "role": "student",
  "phone": "1234567890",
  "countryCode": "+1",
  "gender": "female",
  "dateOfBirth": "2000-01-15",
  "address": "123 Campus Drive",
  "university": "Example University",
  "studentId": "STU12345",
  "emergencyContact": {
    "name": "Parent Name",
    "phone": "9876543210",
    "relationship": "parent"
  }
}
```

#### 3. Forgot Password Flow

**Requirements:**
- Email/phone entry for reset link
- OTP verification screen
- New password and confirm password fields
- Success confirmation

**API Integration:**
```javascript
POST /api/auth/forgot-password
{
  "email": "student@example.com"
}

POST /api/auth/verify-otp
{
  "email": "student@example.com",
  "otp": "123456"
}

POST /api/auth/reset-password
{
  "email": "student@example.com",
  "token": "reset_token",
  "password": "newSecurePassword123"
}
```

#### 4. Email Verification Screen

**Requirements:**
- Email verification code entry
- Resend code option
- Success confirmation

**API Integration:**
```javascript
POST /api/auth/verify-email
{
  "email": "student@example.com",
  "verificationCode": "123456"
}
```

## Student Dashboard

![Student Dashboard](https://via.placeholder.com/800x600.png?text=Student+Dashboard+Mockup)

### Components

#### 1. Dashboard Header
- Profile avatar and name
- Quick navigation links
- Notification bell with counter
- Search functionality

#### 2. Overview Section
- Welcome message with user's name
- Current/upcoming bookings summary
- Recent food orders
- Important notifications panel

#### 3. Quick Action Cards
- Find Accommodation
- Order Food
- My Bookings
- My Profile

#### 4. Accommodation Highlights
- Featured accommodations carousel
- Recently viewed properties
- Saved/favorited properties

#### 5. Food Services Highlights
- Local restaurants with ratings
- Special offers/discounts
- Recently ordered from restaurants

#### 6. Upcoming Events & Reminders
- Calendar view with booking dates
- Payment due reminders
- University events (if integrated)

#### 7. Dashboard Error States & Offline Support

**Error State Requirements:**
- Skeleton loaders during initial data fetch
- Empty state designs for each component when no data is available
- Error state displays with retry options
- Partial loading states when some API calls succeed and others fail
- Fall-back content when primary data is unavailable

**Implementation Example:**
```jsx
function DashboardSection({ title, endpoint, renderContent, fallbackContent }) {
  const { data, error, isLoading, refetch } = useQuery(
    ['dashboard', endpoint],
    () => api.get(`/api/${endpoint}`),
    {
      retry: 2,
      staleTime: 1000 * 60 * 5, // 5 minutes
      refetchOnWindowFocus: true
    }
  );

  if (isLoading) {
    return <SkeletonLoader type="dashboard-section" />;
  }

  if (error) {
    return (
      <ErrorState
        title={`Could not load ${title}`}
        message="We're having trouble fetching your data"
        action={() => refetch()}
        actionText="Try Again"
      >
        {fallbackContent && (
          <div className="fallback-content">
            {fallbackContent}
          </div>
        )}
      </ErrorState>
    );
  }

  return (
    <div className="dashboard-section">
      <h2>{title}</h2>
      {data?.data?.length === 0 ? (
        <EmptyState
          title={`No ${title} to show`}
          message={`When you have ${title.toLowerCase()}, they will appear here.`}
        />
      ) : (
        renderContent(data.data)
      )}
    </div>
  );
}
```

**Offline Support:**
- Offline detection and status indicator
- Service worker for caching essential dashboard data
- Background sync for pending actions when connection restores
- Optimistic UI updates with offline queueing
- Last-known-good data display with timestamp
- Local storage persistence for critical user data

**Implementation Example:**
```javascript
// Network status monitoring
function useNetworkStatus() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [offlineSince, setOfflineSince] = useState(null);
  
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setOfflineSince(null);
      
      // Process any pending offline actions
      offlineQueue.processQueue();
      
      toast.success('You are back online! Syncing your data...');
    };
    
    const handleOffline = () => {
      setIsOnline(false);
      setOfflineSince(new Date());
      
      toast.warning('You are offline. Limited features are available.', {
        autoClose: false,
        toastId: 'offline-warning'
      });
    };
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);
  
  return { isOnline, offlineSince };
}
```

**API Integration:**
```javascript
GET /api/dashboard/summary
GET /api/dashboard/upcoming-bookings
GET /api/dashboard/recent-orders
GET /api/dashboard/notifications
```

## Accommodation Module

### Screens

#### 1. Accommodation Listing

![Accommodation Listing](https://via.placeholder.com/800x600.png?text=Accommodation+Listing)

**Requirements:**
- Grid/List view toggle
- Advanced filtering panel:
  - Price range slider
  - Property type checkboxes
  - Amenities multiselect
  - Distance from university
  - Availability calendar
- Sorting options (Price, Distance, Rating)
- Map view toggle with property pins
- Pagination or infinite scroll
- Accommodation cards with:
  - Featured image
  - Title and location
  - Price
  - Key amenities icons
  - Rating
  - Availability status
  - Favorite button

**API Integration:**
```javascript
GET /api/accommodations
GET /api/accommodations?price_min=200&price_max=500&amenities=wifi,kitchen
GET /api/accommodations/nearby?lat=40.7128&lng=-74.0060&radius=10
```

#### 2. Accommodation Details

![Accommodation Details](https://via.placeholder.com/800x600.png?text=Accommodation+Details)

**Requirements:**
- Image gallery with lightbox
- Property overview section with key details and features
- Dynamic price breakdown based on selected dates and options
- Comprehensive amenities list with icons and descriptions
- Location with interactive map showing:
  - Nearby points of interest
  - Transport links
  - Distance to university
- Real-time availability calendar with:
  - Color-coded date ranges
  - Minimum stay indicators
  - Price variations by season/date
  - Live availability updates
- Reviews and ratings section with:
  - Verified renter badges
  - Photo reviews
  - Sortable by rating/date
  - Response from landlord
- Similar properties carousel based on matching criteria
- Book now button/form with real-time validation
- Contact landlord option with instant messaging
- Virtual tour integration (360° views where available)
- Share property button (social/email/messaging apps)
- Save/favorite functionality

**API Integration:**
```javascript
GET /api/accommodations/{id}
GET /api/accommodations/{id}/reviews
GET /api/accommodations/{id}/availability?start_date=2025-06-01&end_date=2025-08-31
```

**Real-time Availability Implementation:**
```javascript
function AccommodationDetail() {
  const [selectedDates, setSelectedDates] = useState({ startDate: null, endDate: null });
  const [availability, setAvailability] = useState([]);
  const [isCheckingAvailability, setIsCheckingAvailability] = useState(false);
  const [currentViewers, setCurrentViewers] = useState(0);
  
  // Initial availability data load
  useEffect(() => {
    loadAvailabilityData();
  }, [accommodationId]);
  
  // Real-time updates for availability and current viewers
  useEffect(() => {
    socket.emit('join-accommodation-room', { accommodationId });
    
    socket.on('availability-changed', (data) => {
      // Update availability calendar with new data
      setAvailability(prev => 
        prev.map(day => {
          const updatedDay = data.updatedDays.find(d => d.date === day.date);
          return updatedDay || day;
        })
      );
      
      // If user has selected dates that are no longer available
      if (selectedDates.startDate && selectedDates.endDate) {
        checkIfSelectedDatesAreStillAvailable();
      }
    });
    
    socket.on('current-viewers-update', (data) => {
      setCurrentViewers(data.count);
    });
    
    // Booking urgency indicators
    socket.on('booking-created', (data) => {
      if (data.accommodationId === accommodationId) {
        toast.info('Someone just booked this accommodation for dates in your search period!', {
          autoClose: 5000
        });
        loadAvailabilityData(); // Refresh availability data
      }
    });
    
    return () => {
      socket.emit('leave-accommodation-room', { accommodationId });
      socket.off('availability-changed');
      socket.off('current-viewers-update');
      socket.off('booking-created');
    };
  }, [accommodationId, selectedDates]);
  
  // Check real-time availability when dates are selected
  const checkAvailability = async () => {
    setIsCheckingAvailability(true);
    try {
      const response = await api.get(`/api/accommodations/${accommodationId}/check-availability`, {
        params: {
          start_date: formatDate(selectedDates.startDate),
          end_date: formatDate(selectedDates.endDate)
        }
      });
      return response.data.available;
    } catch (error) {
      toast.error('Could not verify availability. Please try again.');
      return false;
    } finally {
      setIsCheckingAvailability(false);
    }
  };
}
```

#### 3. Map View

**Requirements:**
- Interactive map with property pins
- Clustering for multiple properties
- Filter controls
- Property quick view on pin click
- Current location detection
- Search by address or landmark
- Drawing tools for custom area search

**API Integration:**
```javascript
GET /api/accommodations?location_lat=40.7128&location_lng=-74.0060&radius=5
```

#### 4. Favorites/Saved Accommodations

**Requirements:**
- List of saved properties
- Quick compare view
- Remove from favorites option
- Notes/tags for saved properties
- Availability alerts opt-in

**API Integration:**
```javascript
GET /api/accommodations/favorites
POST /api/accommodations/{id}/favorite
DELETE /api/accommodations/{id}/favorite
```

## Booking Management

### Screens

#### 1. Booking Form

![Booking Form](https://via.placeholder.com/800x600.png?text=Booking+Form)

**Requirements:**
- Date range picker (check-in/check-out)
- Guest count selection
- Special requests text area
- Price breakdown with:
  - Base rate
  - Cleaning fee
  - Service fee
  - Taxes
  - Total amount
- Terms and conditions checkbox
- Payment method selection
- Promo code field
- Booking summary sidebar

**API Integration:**
```javascript
POST /api/bookings
{
  "accommodation": "accommodation_id",
  "start_date": "2025-06-01T00:00:00.000Z",
  "end_date": "2025-06-07T00:00:00.000Z",
  "payment_method": "card",
  "total_amount": 500,
  "guests": 2,
  "special_requests": "Late check-in preferred"
}
```

#### 2. Booking Confirmation

**Requirements:**
- Success animation/illustration
- Booking reference number
- Booking details summary
- Add to calendar button
- Share itinerary option
- Contact host button
- Return to dashboard link

#### 3. My Bookings Screen

![My Bookings](https://via.placeholder.com/800x600.png?text=My+Bookings)

**Requirements:**
- Tabs for:
  - Upcoming bookings
  - Past bookings
  - Cancelled bookings
- Booking cards with:
  - Property image and name
  - Dates
  - Status indicator
  - Price paid
  - Action buttons (cancel, modify, review)
- Filters for date range, property type
- Detailed view expansion

**API Integration:**
```javascript
GET /api/bookings/my-bookings
GET /api/bookings/{id}
PUT /api/bookings/{id}/cancel
```

## Food Service Module

### Screens

#### 1. Food Provider Listing

![Food Provider Listing](https://via.placeholder.com/800x600.png?text=Food+Provider+Listing)

**Requirements:**
- Restaurant/food provider cards with:
  - Featured image
  - Name and cuisine type
  - Rating
  - Distance/delivery time
  - Operating hours
  - Price range indicator
  - Promotion badges
- Filters for:
  - Cuisine type
  - Distance
  - Rating
  - Price range
  - Offering promotions
- Sorting options
- Search by restaurant name or dish
- Quick view of popular items
- Recommended based on past orders

**API Integration:**
```javascript
GET /api/food-providers
GET /api/food-providers?cuisine=italian&rating_min=4
```

#### 2. Restaurant/Menu Detail

![Restaurant Detail](https://via.placeholder.com/800x600.png?text=Restaurant+Detail)

**Requirements:**
- Restaurant info header with:
  - Cover image
  - Logo
  - Name and rating
  - Location and hours
  - Contact info
- Menu categorization
- Menu item cards with:
  - Item image
  - Name and description
  - Price
  - Customization options
  - Add to cart button
  - Quantity selector
- Sticky shopping cart preview
- Reviews and ratings section
- Dietary preference filters (veg, vegan, etc.)

**API Integration:**
```javascript
GET /api/food-providers/{id}
GET /api/menu-items?foodProvider={id}
```

#### 3. Shopping Cart & Checkout

![Food Checkout](https://via.placeholder.com/800x600.png?text=Food+Checkout)

**Requirements:**
- Cart items list with:
  - Item name and image
  - Quantity controls
  - Price
  - Customization options
  - Remove button
- Subtotal calculation
- Delivery fee
- Service fee and taxes
- Delivery address selection/input
- Delivery time selection
  - ASAP option
  - Scheduled option with time picker
- Payment method selection
- Special instructions field
- Promo code application
- Order summary

**API Integration:**
```javascript
POST /api/orders
{
  "food_provider": "provider_id",
  "total_amount": 42.48,
  "items": [{
    "menu_item": "item_id",
    "quantity": 2,
    "special_instructions": "Extra spicy"
  }],
  "delivery_location": {
    "coordinates": {
      "latitude": 12.9716,
      "longitude": 77.5946
    },
    "address": "123 University Ave, Room 123",
    "landmark": "Near Library"
  },
  "delivery_instructions": "Call when you arrive"
}
```

#### 4. Order Tracking

**Requirements:**
- Real-time order status tracking with live updates
- Order status indicators with time stamps:
  - Order Placed
  - Order Confirmed
  - Preparing
  - Ready for Pickup
  - Out for Delivery
  - Nearby (within 500m)
  - Delivered
- Accurate estimated delivery time with dynamic updates
- Delivery person details when assigned:
  - Name and photo
  - Contact options (call, text)
  - Rating
- Interactive map with real-time delivery tracking:
  - Live location updates (15-second intervals)
  - Estimated route visualization
  - Geofence-based notifications
- Restaurant and order details with ability to:
  - View itemized receipt
  - Contact restaurant directly
  - Report issues
- Support chat/call options with:
  - In-app messaging
  - Call integration
  - Automated support options
- Rating and feedback prompt on delivery
- Push notifications for status changes
- Order issue reporting workflow

**API Integration:**
```javascript
GET /api/orders/{id}/track
```

**Real-time Implementation:**
```javascript
// WebSocket setup for order tracking
function OrderTrackingScreen({ orderId }) {
  const [order, setOrder] = useState(null);
  const [driverLocation, setDriverLocation] = useState(null);
  const [estimatedTime, setEstimatedTime] = useState(null);
  
  // Initial data fetch
  useEffect(() => {
    const fetchOrderDetails = async () => {
      try {
        const response = await api.get(`/api/orders/${orderId}/track`);
        setOrder(response.data);
        setDriverLocation(response.data.currentLocation);
        setEstimatedTime(response.data.estimatedDeliveryTime);
      } catch (error) {
        handleError(error);
      }
    };
    
    fetchOrderDetails();
  }, [orderId]);
  
  // WebSocket connection for real-time updates
  useEffect(() => {
    // Connect to order tracking socket
    socket.emit('join-order-tracking', { orderId });
    
    // Listen for order status changes
    socket.on('order-status-changed', (data) => {
      setOrder(prev => ({...prev, status: data.newStatus}));
      
      // Show push notification
      if (document.hidden) {
        showPushNotification({
          title: 'Order Update',
          body: `Your order is now ${data.newStatus}`,
          icon: '/icons/order-status.png'
        });
      }
    });
    
    // Listen for driver location updates
    socket.on('driver-location-update', (data) => {
      setDriverLocation(data.location);
      setEstimatedTime(data.estimatedArrival);
    });
    
    // Listen for estimated time changes
    socket.on('estimated-time-update', (data) => {
      setEstimatedTime(data.estimatedTime);
    });
    
    return () => {
      socket.off('order-status-changed');
      socket.off('driver-location-update');
      socket.off('estimated-time-update');
      socket.emit('leave-order-tracking', { orderId });
    };
  }, [orderId]);
  
  // Fallback for offline or disconnected state
  useEffect(() => {
    const pollInterval = setInterval(async () => {
      if (!socket.connected) {
        try {
          const response = await api.get(`/api/orders/${orderId}/track`);
          setOrder(response.data);
          setDriverLocation(response.data.currentLocation);
          setEstimatedTime(response.data.estimatedDeliveryTime);
        } catch (error) {
          console.log('Polling fallback error:', error);
        }
      }
    }, 30000); // 30 second polling as fallback
    
    return () => clearInterval(pollInterval);
  }, [orderId, socket.connected]);
  
  return (
    // Rendering UI with real-time data
  );
}
```

#### 5. My Orders Screen

**Requirements:**
- Tabs for:
  - Active orders
  - Past orders
- Order cards with:
  - Restaurant name and image
  - Order number
  - Date and time
  - Status indicator
  - Total price
  - Reorder button
- Order details expansion
- Rating and review submission
- Filter orders by date range
- Search by restaurant or item

**API Integration:**
```javascript
GET /api/orders/my-orders
```

## User Profile & Settings

### Screens

#### 1. Profile Overview

![Profile Screen](https://via.placeholder.com/800x600.png?text=Profile+Screen)

**Requirements:**
- Profile photo with upload option
- Personal information section
- Academic information section
- Contact information section
- Password and security section
- Preferences section
- Save changes button

**API Integration:**
```javascript
GET /api/users/profile
PUT /api/users/profile
```

#### 2. Account Settings

**Requirements:**
- Email preferences
  - Marketing emails
  - Booking notifications
  - Order notifications
- Privacy settings
- Linked accounts (social)
- Application preferences
- Language selection
- Deactivate account option

**API Integration:**
```javascript
GET /api/users/settings
PUT /api/users/settings
```

#### 3. Payment Methods

**Requirements:**
- Saved payment methods list
- Add new payment method form
- Set default payment method
- Remove payment method option
- Payment history with filters

**API Integration:**
```javascript
GET /api/users/payment-methods
POST /api/users/payment-methods
```

## Notifications System

### Components

#### 1. Notification Center

**Requirements:**
- Real-time notifications with WebSocket integration
- Message persistence across sessions
- Notification categories:
  - Booking related (confirmations, cancellations, reminders)
  - Order related (status changes, delivery updates)
  - Account related (profile updates, payment confirmations)
  - Promotional (deals, discounts, special offers)
- Mark as read functionality
- Clear all option
- Filter by type
- Pagination or infinite scroll
- Unread notifications counter
- Notification preference settings by category
- Search within notifications

**API Integration:**
```javascript
GET /api/notifications?page=1&limit=20
GET /api/notifications/unread/count
PUT /api/notifications/{id}/read
PUT /api/notifications/mark-all-read
GET /api/notifications/preferences
PUT /api/notifications/preferences
```

**WebSocket Implementation:**
```javascript
// Listening for new notifications
socket.on('new-notification', (notification) => {
  // Add notification to state
  dispatch(addNotification(notification));
  
  // Update unread count
  dispatch(incrementUnreadCount());
  
  // Show toast for high priority notifications
  if (notification.priority === 'high') {
    showToast({
      type: notification.type,
      message: notification.message,
      actions: notification.actions
    });
  }
});

// Subscribe to notification channels on login
useEffect(() => {
  if (isAuthenticated) {
    socket.emit('subscribe-notifications', {
      userId: currentUser.id
    });
  }
  
  return () => {
    socket.emit('unsubscribe-notifications');
  };
}, [isAuthenticated, currentUser]);
```

#### 2. Notification Modals and Toasts

**Requirements:**
- Important notification pop-ups with priority levels
- Contextual styling based on notification type
- Action buttons within notifications
- Dismissible design with animation
- Don't show again option with preference storage
- Toast notifications for non-intrusive updates
- Sound alerts for high-priority notifications (toggleable)
- Stacked notification handling for multiple alerts

**Implementation Example:**
```jsx
function NotificationToast({ notification, onDismiss, onAction }) {
  const { type, title, message, actions } = notification;
  
  return (
    <div className={`notification-toast notification-${type}`}>
      <div className="notification-icon">
        {getIconForType(type)}
      </div>
      <div className="notification-content">
        <h4>{title}</h4>
        <p>{message}</p>
      </div>
      {actions && (
        <div className="notification-actions">
          {actions.map(action => (
            <button 
              key={action.id} 
              className={`btn-${action.style || 'default'}`}
              onClick={() => onAction(action.id, notification.id)}
            >
              {action.label}
            </button>
          ))}
        </div>
      )}
      <button className="notification-close" onClick={onDismiss}>
        <span className="sr-only">Dismiss</span>
        <CloseIcon />
      </button>
    </div>
  );
}
```

#### 3. Push Notifications

**Requirements:**
- Browser push notification integration using Web Push API
- Mobile push notification support with deep linking
- Permission request flow with fallbacks
- Quiet hours setting with time zone awareness
- Notification grouping by category and source
- Rich notifications with images and action buttons
- Background notifications when app is closed
- Offline queue for missed notifications

**Implementation Example:**
```javascript
// Request notification permission
async function setupPushNotifications() {
  try {
    if (!('Notification' in window)) {
      console.log('This browser does not support notifications');
      return false;
    }
    
    const permission = await Notification.requestPermission();
    
    if (permission === 'granted') {
      const registration = await navigator.serviceWorker.getRegistration();
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(PUBLIC_VAPID_KEY)
      });
      
      // Register subscription with server
      await api.post('/api/notifications/devices', {
        type: 'web',
        token: JSON.stringify(subscription),
        userId: currentUser.id
      });
      
      return true;
    } else {
      // Store user preference to not ask again
      localStorage.setItem('notification_permission_denied', 'true');
      return false;
    }
  } catch (error) {
    console.error('Failed to register push notifications:', error);
    return false;
  }
}

## Chat & Support

### Screens

#### 1. Chat Interface

![Chat Interface](https://via.placeholder.com/800x600.png?text=Chat+Interface)

**Requirements:**
- Conversation list
- Individual chat threads with:
  - Landlords
  - Food delivery providers
  - Customer support
- Message input with attachments
- Read receipts
- Typing indicators
- Chat search function
- Media sharing capabilities

**API Integration:**
```javascript
GET /api/chats
GET /api/chats/{id}/messages
POST /api/chats/{id}/messages
```

#### 2. Support Portal

**Requirements:**
- FAQ section with search
- Support ticket creation form
- Ticket tracking
- Live chat option with support
- Knowledge base articles
- Video tutorials

**API Integration:**
```javascript
GET /api/support/articles
POST /api/support/tickets
```

## Integration Requirements

### 1. Mapping & Location

- Google Maps or Mapbox integration
- Geolocation services
- Address autocomplete
- Distance and ETA calculations
- Campus landmark references

### 2. Payment Processing

- Secure payment gateway integration
- Multiple payment methods:
  - Credit/debit cards
  - Digital wallets
  - Bank transfers
  - Campus card/meal plan integration
- Payment receipt generation
- Refund processing

### 3. Calendar & Scheduling

- Google/Apple Calendar integration
- Booking reminders
- Availability synchronization
- Conflict detection

### 4. Social Integration

- Social sharing capabilities
- Social login options
- Roommate finding integration
- University social groups

## Non-Functional Requirements

### 1. Performance

- Page load time < 3 seconds
- Image optimization strategies
- Lazy loading for content
- API response handling with skeletons
- Bundle size optimization

### 2. Accessibility (WCAG 2.1 AA)

- Semantic HTML
- ARIA attributes
- Keyboard navigation support
- Screen reader compatibility
- Sufficient color contrast
- Focus indicators
- Text resizing support

### 3. Security

- HTTPS implementation
- XSS prevention
- CSRF protection
- Input validation
- Secure authentication flows
- Data encryption
- Privacy policy compliance

### 4. Offline Capability

- Progressive Web App implementation
- Service worker for caching
- Offline content availability
- Background sync for pending actions
- "Add to Home Screen" functionality

### 5. Analytics

- User behavior tracking
- Conversion funnels
- Error tracking
- Performance monitoring
- A/B testing capability

## Technical Implementation

### State Management

#### 1. Global State Architecture

**Recommended Solution:**
- Redux Toolkit or Context API with React Query
- Centralized store with modular slices by feature
- Persist critical user data in local storage

**Key Considerations:**
- Separation of UI state from server state
- Cache invalidation strategies
- Performance optimization for large state trees

#### 2. Real-time Data Management

**WebSocket Integration:**
- Connection to `/api/socket` endpoint for real-time events
- Socket.IO client configuration:
```javascript
import { io } from "socket.io-client";

const socket = io(API_BASE_URL, {
  transports: ['websocket'],
  reconnection: true,
  reconnectionAttempts: 5,
  reconnectionDelay: 1000,
  auth: {
    token: () => localStorage.getItem('accessToken')
  }
});
```

**Event Handling Strategy:**
- Topic-based channel subscriptions:
  - `booking-updates`: For booking status changes
  - `order-updates`: For food order status changes
  - `notifications`: For system notifications
  - `chat-messages`: For direct messages

**Implementation Example:**
```javascript
// In component mount
useEffect(() => {
  // Join relevant rooms based on user ID
  socket.emit('join-room', `user-${userId}`);
  
  // Listen for specific events
  socket.on('order-status-changed', handleOrderStatusChange);
  socket.on('new-notification', handleNewNotification);
  socket.on('booking-update', handleBookingUpdate);
  
  return () => {
    // Clean up listeners
    socket.off('order-status-changed');
    socket.off('new-notification');
    socket.off('booking-update');
  };
}, [userId]);
```

#### 3. Progressive Data Loading

**Implementation Approaches:**
- Pagination with cursor-based implementation
- Infinite scroll with intersection observer
- Data prefetching for common user flows

**Example Implementation:**
```javascript
const fetchAccommodations = async (pageParam = 0) => {
  const response = await api.get(`/api/accommodations`, {
    params: { limit: 10, offset: pageParam * 10, ...filterParams }
  });
  return response.data;
};

// Using React Query for infinite scroll
const {
  data,
  fetchNextPage,
  hasNextPage,
  isFetchingNextPage,
  status
} = useInfiniteQuery(
  ['accommodations', filterParams],
  ({ pageParam = 0 }) => fetchAccommodations(pageParam),
  {
    getNextPageParam: (lastPage, allPages) => {
      return lastPage.hasMore ? allPages.length : undefined;
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  }
);
```

### Error Handling

#### 1. Comprehensive Error Management Strategy

**Error Categorization:**
- Network errors (offline, timeouts)
- API errors (4xx, 5xx responses)
- Validation errors (form submissions)
- Authentication errors (expired tokens)
- Business logic errors (e.g., booking conflicts)

**Error Handling Architecture:**
- Centralized error interceptors for API calls
- Global error boundary components
- Custom error handling hooks

**Implementation Example:**
```javascript
// API Error Interceptor
api.interceptors.response.use(
  response => response,
  error => {
    // Handle based on error type
    if (error.response) {
      // Server responded with error status
      switch (error.response.status) {
        case 401:
          // Unauthorized - handle token refresh or redirect to login
          return handleUnauthorizedError(error);
        case 403:
          // Forbidden - handle permission issues
          return handleForbiddenError(error);
        case 404:
          // Not found
          return handleNotFoundError(error);
        case 422:
          // Validation errors
          return Promise.reject({
            type: 'VALIDATION_ERROR',
            errors: error.response.data.errors,
            message: 'Please check the form for errors'
          });
        case 500:
          // Server error
          return Promise.reject({
            type: 'SERVER_ERROR',
            message: 'Something went wrong. Please try again later.'
          });
      }
    } else if (error.request) {
      // Network error
      return Promise.reject({
        type: 'NETWORK_ERROR',
        message: 'Unable to connect to server. Please check your internet connection.'
      });
    }
    
    return Promise.reject(error);
  }
);
```

#### 2. User-Facing Error Feedback

**UI Components:**
- Toast notifications for transient errors
- Modal dialogs for blocking errors
- Inline form validation feedback
- Empty states for failed data loads
- Error boundaries for component-level failures

**Implementation Example:**
```jsx
// Form error handling example
const submitForm = async (values) => {
  setSubmitting(true);
  setErrors({});
  
  try {
    await api.post('/api/bookings', values);
    toast.success('Booking confirmed successfully!');
    navigate('/bookings');
  } catch (error) {
    if (error.type === 'VALIDATION_ERROR') {
      setErrors(error.errors);
      toast.error('Please correct the errors in the form.');
    } else if (error.type === 'NETWORK_ERROR') {
      toast.error(
        'Connection issue detected. Your booking is saved locally and will be submitted when you're back online.',
        { duration: 5000 }
      );
      addToOfflineQueue('booking', values);
    } else {
      toast.error('Unable to complete your booking. Please try again.');
    }
  } finally {
    setSubmitting(false);
  }
};
```

#### 3. Offline Support & Recovery

**Strategies:**
- Offline queue for critical actions
- Local storage for pending changes
- Background sync when connection restores
- Service worker for offline caching

**Example Implementation:**
```javascript
// Offline queue manager
const offlineQueueManager = {
  async addToQueue(actionType, payload) {
    const queue = JSON.parse(localStorage.getItem('offlineQueue') || '[]');
    queue.push({
      id: Date.now(),
      actionType,
      payload,
      timestamp: new Date().toISOString()
    });
    localStorage.setItem('offlineQueue', JSON.stringify(queue));
  },
  
  async processQueue() {
    const queue = JSON.parse(localStorage.getItem('offlineQueue') || '[]');
    if (queue.length === 0) return;
    
    const newQueue = [...queue];
    
    for (let i = 0; i < queue.length; i++) {
      const item = queue[i];
      try {
        switch(item.actionType) {
          case 'booking':
            await api.post('/api/bookings', item.payload);
            break;
          case 'order':
            await api.post('/api/orders', item.payload);
            break;
          // Add other action types
        }
        // Remove from queue if successful
        newQueue.splice(newQueue.findIndex(q => q.id === item.id), 1);
        toast.success(`Your ${item.actionType} has been synchronized.`);
      } catch (error) {
        console.error('Failed to process offline item', error);
        // Keep in queue for next attempt
      }
    }
    
    localStorage.setItem('offlineQueue', JSON.stringify(newQueue));
  },
  
  // Initialize listener for online status
  init() {
    window.addEventListener('online', this.processQueue);
  }
};
```

### Performance Optimization

#### 1. Lazy Loading & Code Splitting

**Implementation Strategy:**
- Route-based code splitting
- Component-level lazy loading
- Critical CSS path optimization
- Asset preloading for common user journeys

**Example:**
```javascript
// Route-based code splitting
const Dashboard = lazy(() => import('./pages/Dashboard'));
const AccommodationDetail = lazy(() => import('./pages/AccommodationDetail'));

function App() {
  return (
    <Suspense fallback={<SkeletonLoader />}>
      <Routes>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/accommodations/:id" element={<AccommodationDetail />} />
        {/* Other routes */}
      </Routes>
    </Suspense>
  );
}
```

#### 2. Advanced Caching Strategies

**Implementation Approach:**
- API response caching with TTL
- Resource prioritization for critical paths
- Background data prefetching
- Stale-while-revalidate pattern

**Example Implementation:**
```javascript
// Using React Query for data fetching with caching
export function useAccommodation(id) {
  return useQuery(
    ['accommodation', id],
    () => api.get(`/api/accommodations/${id}`),
    {
      staleTime: 1000 * 60 * 10, // 10 minutes
      cacheTime: 1000 * 60 * 30, // 30 minutes
      refetchOnWindowFocus: false,
      refetchOnMount: true,
      retry: 2,
      onError: (error) => handleAccommodationError(error)
    }
  );
}
```

### Accessibility & Internationalization

#### 1. Accessibility Implementation

**Key Requirements:**
- ARIA attributes for interactive elements
- Keyboard navigation support
- Screen reader compatibility
- Focus management
- Color contrast compliance

**Component Example:**
```jsx
// Accessible accordion component
function AccessibleAccordion({ title, children }) {
  const [isOpen, setIsOpen] = useState(false);
  const contentId = useId();
  const headerId = useId();
  
  return (
    <div className="accordion">
      <button
        id={headerId}
        aria-expanded={isOpen}
        aria-controls={contentId}
        className="accordion-header"
        onClick={() => setIsOpen(!isOpen)}
      >
        {title}
        <span className="sr-only">{isOpen ? 'Collapse' : 'Expand'}</span>
        <ChevronIcon className={isOpen ? 'rotate-180' : ''} />
      </button>
      <div
        id={contentId}
        role="region"
        aria-labelledby={headerId}
        className={`accordion-content ${isOpen ? 'open' : ''}`}
        hidden={!isOpen}
      >
        {children}
      </div>
    </div>
  );
}
```

#### 2. Internationalization Framework

**Implementation Strategy:**
- i18next integration
- Locale-based formatting for dates, currencies
- RTL layout support
- Language detection and persistence
- Lazy loading of translation files

## Appendix: API Reference

### Authentication Endpoints

```
POST /api/auth/register
POST /api/auth/login
POST /api/auth/refresh-token
POST /api/auth/forgot-password
POST /api/auth/reset-password
GET /api/auth/profile
```

### Accommodation Endpoints

```
GET /api/accommodations
GET /api/accommodations/{id}
GET /api/accommodations/nearby
GET /api/accommodations/favorites
POST /api/accommodations/{id}/favorite
DELETE /api/accommodations/{id}/favorite
```

### Booking Endpoints

```
POST /api/bookings
GET /api/bookings/my-bookings
GET /api/bookings/{id}
PUT /api/bookings/{id}/cancel
```

### Food Service Endpoints

```
GET /api/food-providers
GET /api/food-providers/{id}
GET /api/menu-items
GET /api/menu-items/{id}
```

### Order Endpoints

```
POST /api/orders
GET /api/orders/my-orders
GET /api/orders/{id}
GET /api/orders/{id}/track
```

### User Profile Endpoints

```
GET /api/users/profile
PUT /api/users/profile
GET /api/users/settings
PUT /api/users/settings
```

### Chat & Support Endpoints

```
GET /api/chats
GET /api/chats/{id}/messages
POST /api/chats/{id}/messages
GET /api/support/articles
POST /api/support/tickets
```

### Notification Endpoints

```
GET /api/notifications
PUT /api/notifications/{id}/read
PUT /api/notifications/settings
```

---

## Conclusion

This comprehensive specification document outlines all the required screens, components, and functionality for the StayKaru Student Module frontend. With enhanced focus on real-time data fetching, robust error handling, and offline support, the Student Module is designed to provide a seamless and resilient user experience across all features.

Key highlights of this specification include:

1. **Real-time Data Architecture** - Utilizing WebSocket connections for immediate updates to critical information like order tracking, accommodation availability, and notifications without requiring page refreshes.

2. **Comprehensive Error Management** - Implementing a multi-layered approach to error handling with specific strategies for network errors, API responses, form validation, and business logic failures.

3. **Offline Capabilities** - Ensuring core functionality remains accessible during connectivity issues with intelligent data caching, request queueing, and background synchronization when connection is restored.

4. **User-Focused Feedback** - Providing clear, contextual error messages and loading states to keep users informed throughout their journey and minimize frustration.

5. **Performance Optimization** - Employing strategies like lazy loading, code splitting, and progressive data loading to maintain fast response times even on slower connections.

Development teams should follow this document closely to ensure consistent implementation of all requirements while maintaining flexibility for design creativity and user experience enhancements.

Regular reviews against this specification should be conducted throughout the development process to ensure alignment with project goals and user needs. Any deviations or enhancements should be documented and approved before implementation.

Frontend engineers should pay particular attention to the Technical Implementation section, which provides concrete examples and best practices for implementing real-time features, error handling, and state management.
