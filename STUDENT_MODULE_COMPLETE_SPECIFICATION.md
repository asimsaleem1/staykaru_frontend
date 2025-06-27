# STUDENT MODULE - COMPLETE SPECIFICATION

## 📋 Table of Contents
1. [Module Overview](#module-overview)
2. [Functional Requirements](#functional-requirements)
3. [Non-Functional Requirements](#non-functional-requirements)
4. [Database Schema](#database-schema)
5. [API Endpoints](#api-endpoints)
6. [Screens & Features](#screens--features)
7. [Test Results](#test-results)
8. [User Stories](#user-stories)
9. [Technical Implementation](#technical-implementation)

---

## 🎯 Module Overview

The **Student Module** is a comprehensive system designed for university students to find accommodation, order food, manage bookings, and interact with the Staykaru platform. This module provides a complete student experience with real-time tracking, notifications, and personalized recommendations.

### Key Features:
- **Accommodation Booking & Management**
- **Food Ordering & Tracking**
- **Profile Management**
- **Real-time Notifications**
- **Review System**
- **Dashboard Analytics**
- **Payment Integration**

---

## ✅ Functional Requirements

### 1. Authentication & Authorization
- **Student Registration**: Create new student accounts with email verification
- **Student Login**: Secure authentication with JWT tokens
- **Password Management**: Change password functionality
- **Session Management**: Automatic token refresh and logout

### 2. Profile Management
- **View Profile**: Display student information and preferences
- **Update Profile**: Modify personal details, contact information
- **Profile Picture**: Upload and manage profile images
- **Preferences**: Set accommodation and food preferences

### 3. Accommodation Management
- **Browse Accommodations**: View available student accommodations
- **Search & Filter**: Advanced search with location, price, amenities
- **Accommodation Details**: View detailed information, photos, reviews
- **Booking Management**: Create, view, and manage accommodation bookings
- **Booking History**: Track past and current bookings

### 4. Food Service Management
- **Browse Food Providers**: View available food services
- **Menu Browsing**: Explore food provider menus and items
- **Order Management**: Place food orders with customization
- **Order Tracking**: Real-time order status and delivery tracking
- **Order History**: View past orders and receipts

### 5. Review & Rating System
- **Write Reviews**: Rate and review accommodations and food providers
- **View Reviews**: Read reviews from other students
- **Review Management**: Edit and delete own reviews
- **Rating Analytics**: View average ratings and feedback

### 6. Notification System
- **Real-time Notifications**: Instant updates for bookings, orders, messages
- **Notification Preferences**: Customize notification settings
- **Read/Unread Management**: Mark notifications as read
- **Notification History**: View all past notifications

### 7. Dashboard & Analytics
- **Student Dashboard**: Overview of bookings, orders, and activities
- **Booking Analytics**: Statistics on accommodation usage
- **Order Analytics**: Food ordering patterns and preferences
- **Financial Summary**: Spending analysis and payment history

### 8. Payment Integration
- **Multiple Payment Methods**: Credit card, digital wallets, bank transfer
- **Secure Transactions**: Encrypted payment processing
- **Payment History**: Track all transactions and receipts
- **Refund Management**: Handle cancellations and refunds

---

## 🔧 Non-Functional Requirements

### 1. Performance
- **Response Time**: API responses under 2 seconds
- **Concurrent Users**: Support 1000+ simultaneous users
- **Scalability**: Handle 10,000+ daily transactions
- **Availability**: 99.9% uptime

### 2. Security
- **Data Encryption**: All sensitive data encrypted in transit and at rest
- **Authentication**: Multi-factor authentication support
- **Authorization**: Role-based access control
- **Data Privacy**: GDPR compliance for student data

### 3. Usability
- **Mobile Responsive**: Optimized for mobile devices
- **Accessibility**: WCAG 2.1 AA compliance
- **Intuitive UI**: User-friendly interface design
- **Multi-language**: Support for multiple languages

### 4. Reliability
- **Error Handling**: Graceful error handling and recovery
- **Data Backup**: Automated backup systems
- **Monitoring**: Real-time system monitoring
- **Logging**: Comprehensive audit trails

---

## 🗄️ Database Schema

### User Schema
```javascript
{
  _id: ObjectId,
  name: String,
  email: String,
  password: String (hashed),
  role: String (enum: ['student']),
  phone: String,
  countryCode: String,
  gender: String,
  program: String,
  yearOfStudy: String,
  university: String,
  isActive: Boolean,
  emailVerified: Boolean,
  profilePicture: String,
  preferences: {
    accommodation: Object,
    food: Object
  },
  createdAt: Date,
  updatedAt: Date
}
```

### Booking Schema
```javascript
{
  _id: ObjectId,
  user: ObjectId (ref: User),
  accommodation: ObjectId (ref: Accommodation),
  checkInDate: Date,
  checkOutDate: Date,
  total_amount: Number,
  status: String (enum: ['pending', 'confirmed', 'cancelled', 'completed']),
  special_requests: String,
  guests: Number,
  payment_status: String,
  createdAt: Date,
  updatedAt: Date
}
```

### Order Schema
```javascript
{
  _id: ObjectId,
  user: ObjectId (ref: User),
  food_provider: ObjectId (ref: FoodProvider),
  items: [{
    menu_item: ObjectId (ref: MenuItem),
    quantity: Number,
    price: Number,
    special_instructions: String
  }],
  delivery_location: {
    coordinates: {
      latitude: Number,
      longitude: Number
    },
    address: String,
    landmark: String
  },
  total_amount: Number,
  status: String (enum: ['placed', 'confirmed', 'preparing', 'out_for_delivery', 'delivered', 'cancelled']),
  tracking_history: [{
    location: Object,
    status: String,
    timestamp: Date
  }],
  createdAt: Date,
  updatedAt: Date
}
```

### Review Schema
```javascript
{
  _id: ObjectId,
  user: ObjectId (ref: User),
  target_type: String (enum: ['accommodation', 'food_provider']),
  target_id: ObjectId,
  rating: Number (1-5),
  comment: String,
  verified: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

### Notification Schema
```javascript
{
  _id: ObjectId,
  user: ObjectId (ref: User),
  title: String,
  message: String,
  type: String (enum: ['booking', 'order', 'payment', 'system']),
  read: Boolean,
  data: Object,
  createdAt: Date
}
```

---

## 🔌 API Endpoints

### Authentication Endpoints
| Method | Endpoint | Description | Status |
|--------|----------|-------------|---------|
| POST | `/auth/register` | Student registration | ✅ Working |
| POST | `/auth/login` | Student login | ✅ Working |
| PUT | `/users/change-password` | Change password | ✅ Working |

### Profile Endpoints
| Method | Endpoint | Description | Status |
|--------|----------|-------------|---------|
| GET | `/users/profile` | Get student profile | ✅ Working |
| PUT | `/users/profile` | Update student profile | ✅ Working |

### Dashboard Endpoints
| Method | Endpoint | Description | Status |
|--------|----------|-------------|---------|
| GET | `/dashboard/student/accommodations` | Get available accommodations | ✅ Working |
| GET | `/dashboard/student/food-options` | Get available food options | ✅ Working |

### Booking Endpoints
| Method | Endpoint | Description | Status |
|--------|----------|-------------|---------|
| GET | `/bookings/my-bookings` | Get student bookings | ✅ Working |
| POST | `/bookings` | Create new booking | ✅ Working |

### Order Endpoints
| Method | Endpoint | Description | Status |
|--------|----------|-------------|---------|
| GET | `/orders/my-orders` | Get student orders | ✅ Working |
| POST | `/orders` | Create new order | ✅ Working |

### Review Endpoints
| Method | Endpoint | Description | Status |
|--------|----------|-------------|---------|
| GET | `/reviews` | Get all reviews | ✅ Working |
| POST | `/reviews` | Create new review | ✅ Working |

### Notification Endpoints
| Method | Endpoint | Description | Status |
|--------|----------|-------------|---------|
| GET | `/notifications` | Get notifications | ✅ Working |
| GET | `/notifications/unread-count` | Get unread count | ✅ Working |
| PUT | `/notifications/mark-all-read` | Mark all as read | ✅ Working |

---

## 📱 Screens & Features

### 1. Authentication Screens

#### Login Screen
- **Email/Password Input**: Secure login form
- **Remember Me**: Session persistence option
- **Forgot Password**: Password recovery link
- **Register Link**: Navigation to registration
- **Social Login**: Optional social media login

#### Registration Screen
- **Personal Information**: Name, email, phone, gender
- **Academic Information**: University, program, year of study
- **Password Setup**: Secure password creation
- **Terms & Conditions**: Agreement checkbox
- **Email Verification**: Verification process

### 2. Dashboard Screen
- **Welcome Section**: Personalized greeting
- **Quick Actions**: Book accommodation, order food
- **Recent Activity**: Latest bookings and orders
- **Notifications**: Unread notification count
- **Statistics**: Booking and order analytics
- **Quick Search**: Fast accommodation/food search

### 3. Accommodation Screens

#### Accommodation List Screen
- **Search Bar**: Location, price, amenities search
- **Filter Options**: Price range, location, amenities
- **Accommodation Cards**: Preview with key information
- **Map View**: Location-based browsing
- **Sort Options**: Price, rating, distance sorting

#### Accommodation Detail Screen
- **Photo Gallery**: High-quality accommodation images
- **Detailed Information**: Description, amenities, rules
- **Pricing**: Per night, weekly, monthly rates
- **Availability Calendar**: Check-in/check-out dates
- **Reviews & Ratings**: Student feedback
- **Booking Form**: Reservation creation
- **Contact Host**: Direct messaging option

#### My Bookings Screen
- **Active Bookings**: Current and upcoming stays
- **Past Bookings**: Historical booking records
- **Booking Status**: Pending, confirmed, completed
- **Booking Actions**: Cancel, modify, extend
- **Payment Status**: Paid, pending, refunded

### 4. Food Service Screens

#### Food Provider List Screen
- **Search & Filter**: Cuisine type, rating, delivery time
- **Provider Cards**: Restaurant information and ratings
- **Quick Order**: Direct ordering from list
- **Favorites**: Save preferred providers

#### Menu Screen
- **Menu Categories**: Appetizers, mains, desserts
- **Menu Items**: Photos, descriptions, prices
- **Customization**: Special instructions, modifications
- **Add to Cart**: Shopping cart functionality
- **Nutritional Info**: Health and dietary information

#### Order Management Screen
- **Active Orders**: Current and pending orders
- **Order History**: Past order records
- **Order Details**: Items, quantities, prices
- **Order Tracking**: Real-time delivery status
- **Order Actions**: Cancel, reorder, rate

### 5. Profile Screens

#### Profile Overview Screen
- **Personal Information**: Name, email, phone
- **Academic Information**: University, program, year
- **Profile Picture**: Upload and manage photos
- **Preferences**: Accommodation and food preferences
- **Account Settings**: Privacy, notifications, security

#### Edit Profile Screen
- **Editable Fields**: All profile information
- **Photo Upload**: Profile picture management
- **Preference Settings**: Customize experience
- **Save Changes**: Update profile information

### 6. Review Screens

#### Write Review Screen
- **Rating System**: 1-5 star rating
- **Review Text**: Detailed feedback
- **Photo Upload**: Add review photos
- **Anonymous Option**: Hide identity
- **Submit Review**: Post review

#### Review History Screen
- **My Reviews**: All written reviews
- **Review Status**: Published, pending, rejected
- **Edit Reviews**: Modify existing reviews
- **Delete Reviews**: Remove reviews

### 7. Notification Screen
- **Notification List**: All notifications
- **Unread Indicators**: Visual unread markers
- **Notification Types**: Booking, order, system
- **Action Buttons**: Quick actions for notifications
- **Mark as Read**: Individual and bulk actions

### 8. Payment Screens

#### Payment Method Screen
- **Saved Cards**: Previously used payment methods
- **Add New Card**: Secure card addition
- **Digital Wallets**: PayPal, Apple Pay, Google Pay
- **Bank Transfer**: Direct bank payment

#### Payment History Screen
- **Transaction List**: All payment records
- **Payment Status**: Successful, pending, failed
- **Receipts**: Download payment receipts
- **Refund Status**: Track refunds and cancellations

---

## 📊 Test Results

### Test Summary
- **Total Tests**: 29
- **Passed**: 29 (100%)
- **Failed**: 0 (0%)
- **Success Rate**: 100.00%

### Test Categories
1. **Authentication Tests**: ✅ All Passed
   - Admin login
   - Student registration
   - Student login
   - Password change

2. **Profile Management Tests**: ✅ All Passed
   - Get profile
   - Update profile
   - Change password

3. **Dashboard Tests**: ✅ All Passed
   - Get accommodations
   - Get food options

4. **Booking Tests**: ✅ All Passed
   - Get bookings
   - Create booking

5. **Order Tests**: ✅ All Passed
   - Get orders
   - Create order

6. **Review Tests**: ✅ All Passed
   - Get reviews
   - Create review

7. **Notification Tests**: ✅ All Passed
   - Get notifications
   - Get unread count
   - Mark all as read

8. **Error Handling Tests**: ✅ All Passed
   - Unauthorized access
   - Invalid data handling

---

## 👥 User Stories

### Epic 1: Student Onboarding
**As a new student, I want to register and set up my profile so that I can start using the platform.**

**User Stories:**
- US1.1: As a student, I want to register with my email and basic information
- US1.2: As a student, I want to verify my email address
- US1.3: As a student, I want to complete my profile with academic information
- US1.4: As a student, I want to set my accommodation preferences

### Epic 2: Accommodation Discovery
**As a student, I want to find and book suitable accommodation near my university.**

**User Stories:**
- US2.1: As a student, I want to search for accommodations by location
- US2.2: As a student, I want to filter accommodations by price and amenities
- US2.3: As a student, I want to view detailed accommodation information
- US2.4: As a student, I want to book accommodation for specific dates
- US2.5: As a student, I want to manage my bookings

### Epic 3: Food Ordering
**As a student, I want to order food from nearby restaurants and track delivery.**

**User Stories:**
- US3.1: As a student, I want to browse food providers near me
- US3.2: As a student, I want to view restaurant menus and prices
- US3.3: As a student, I want to customize my food order
- US3.4: As a student, I want to track my food delivery in real-time
- US3.5: As a student, I want to view my order history

### Epic 4: Reviews and Ratings
**As a student, I want to share my experiences and read others' reviews.**

**User Stories:**
- US4.1: As a student, I want to rate and review accommodations
- US4.2: As a student, I want to rate and review food providers
- US4.3: As a student, I want to read reviews from other students
- US4.4: As a student, I want to manage my own reviews

### Epic 5: Notifications and Communication
**As a student, I want to stay informed about my bookings and orders.**

**User Stories:**
- US5.1: As a student, I want to receive notifications about booking updates
- US5.2: As a student, I want to receive notifications about order status
- US5.3: As a student, I want to manage my notification preferences
- US5.4: As a student, I want to mark notifications as read

### Epic 6: Payment and Financial Management
**As a student, I want to securely pay for services and track my spending.**

**User Stories:**
- US6.1: As a student, I want to pay for accommodation bookings
- US6.2: As a student, I want to pay for food orders
- US6.3: As a student, I want to view my payment history
- US6.4: As a student, I want to request refunds when needed

---

## 🛠️ Technical Implementation

### Frontend Technologies
- **Framework**: React Native / Flutter (Mobile) + React.js (Web)
- **State Management**: Redux / Context API
- **UI Components**: Material-UI / Ant Design
- **Navigation**: React Navigation / Flutter Navigation
- **HTTP Client**: Axios / Dio

### Backend Technologies
- **Framework**: NestJS (Node.js)
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT with Passport.js
- **File Upload**: Multer with cloud storage
- **Real-time**: Socket.io for notifications
- **Payment**: Stripe / PayPal integration

### Key Features Implementation
1. **Real-time Notifications**: WebSocket connections for instant updates
2. **Image Upload**: Cloud storage integration for profile pictures
3. **Payment Processing**: Secure payment gateway integration
4. **Location Services**: GPS integration for delivery tracking
5. **Push Notifications**: Mobile push notification system

### Security Measures
1. **JWT Authentication**: Secure token-based authentication
2. **Password Hashing**: bcrypt for password security
3. **Input Validation**: Comprehensive data validation
4. **Rate Limiting**: API rate limiting for abuse prevention
5. **CORS Configuration**: Cross-origin resource sharing setup

### Performance Optimizations
1. **Database Indexing**: Optimized MongoDB indexes
2. **Caching**: Redis caching for frequently accessed data
3. **Image Optimization**: Compressed and optimized images
4. **Lazy Loading**: On-demand data loading
5. **Pagination**: Efficient data pagination

---

## 🎯 Success Metrics

### User Engagement
- **Daily Active Users**: Target 80% of registered students
- **Session Duration**: Average 15+ minutes per session
- **Feature Adoption**: 70%+ students use booking and ordering
- **Retention Rate**: 85% monthly retention

### Business Metrics
- **Booking Conversion**: 25% search to booking conversion
- **Order Frequency**: Average 3 orders per student per month
- **Review Participation**: 60% of students write reviews
- **Payment Success**: 95% successful payment rate

### Technical Metrics
- **API Response Time**: <2 seconds average
- **System Uptime**: 99.9% availability
- **Error Rate**: <1% API error rate
- **Test Coverage**: 100% endpoint coverage

---

## 🚀 Future Enhancements

### Phase 2 Features
1. **AI Recommendations**: Personalized accommodation and food suggestions
2. **Social Features**: Student community and roommate matching
3. **Advanced Analytics**: Detailed spending and usage analytics
4. **Integration**: University portal integration
5. **Multi-language**: International student support

### Phase 3 Features
1. **Virtual Tours**: 360° accommodation tours
2. **Voice Commands**: Voice-activated ordering
3. **AR Features**: Augmented reality for accommodation viewing
4. **Blockchain**: Decentralized payment and review system
5. **IoT Integration**: Smart home features for accommodations

---

*This specification document provides a comprehensive overview of the Student Module, ensuring all stakeholders have a clear understanding of the requirements, implementation, and expected outcomes.* 