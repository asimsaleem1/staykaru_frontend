# LANDLORD MODULE - COMPLETE SPECIFICATION

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

The **Landlord Module** is a comprehensive property management system designed for property owners to list, manage, and monetize their student accommodations. This module provides landlords with tools to handle bookings, track revenue, manage properties, and communicate with students effectively.

### Key Features:
- **Property Management & Listing**
- **Booking Management & Approval**
- **Revenue Tracking & Analytics**
- **Tenant Communication**
- **Property Maintenance**
- **Financial Reporting**
- **Notification System**

---

## ✅ Functional Requirements

### 1. Authentication & Authorization
- **Landlord Registration**: Create new landlord accounts with verification
- **Landlord Login**: Secure authentication with JWT tokens
- **Profile Management**: Complete landlord profile setup
- **Password Management**: Secure password change functionality
- **Session Management**: Automatic token refresh and logout

### 2. Property Management
- **Property Registration**: Add new accommodations with detailed information
- **Property Listing**: Create comprehensive property listings
- **Property Updates**: Modify property details, pricing, and availability
- **Property Deactivation**: Temporarily or permanently remove properties
- **Property Verification**: Admin approval process for new listings
- **Image Management**: Upload and manage property photos

### 3. Booking Management
- **Booking Requests**: Receive and review booking requests from students
- **Booking Approval**: Accept or reject booking requests
- **Booking Status Management**: Track booking lifecycle (pending, confirmed, completed, cancelled)
- **Booking Calendar**: Visual calendar for property availability
- **Booking History**: Complete booking records and analytics
- **Cancellation Management**: Handle booking cancellations and refunds

### 4. Revenue & Financial Management
- **Revenue Tracking**: Monitor income from all properties
- **Payment Processing**: Handle secure payment transactions
- **Commission Management**: Track platform commission and fees
- **Financial Reports**: Generate detailed financial statements
- **Tax Documentation**: Prepare tax-related reports
- **Payout Management**: Process landlord payouts

### 5. Analytics & Reporting
- **Occupancy Analytics**: Track property occupancy rates
- **Revenue Analytics**: Analyze income trends and patterns
- **Booking Analytics**: Monitor booking performance metrics
- **Property Performance**: Compare property performance
- **Market Analysis**: Understand market trends and pricing
- **Custom Reports**: Generate custom analytics reports

### 6. Communication System
- **Tenant Messaging**: Direct communication with students
- **Notification System**: Real-time updates and alerts
- **Announcement System**: Broadcast messages to tenants
- **Support System**: Access to customer support
- **Document Sharing**: Share important documents with tenants

### 7. Maintenance & Operations
- **Maintenance Requests**: Track and manage property maintenance
- **Service Providers**: Manage maintenance service providers
- **Maintenance Scheduling**: Schedule and track maintenance activities
- **Issue Tracking**: Monitor and resolve property issues
- **Quality Assurance**: Maintain property standards

### 8. Dashboard & Overview
- **Landlord Dashboard**: Comprehensive overview of all activities
- **Property Overview**: Quick access to property information
- **Financial Summary**: Revenue and financial overview
- **Recent Activity**: Latest bookings, messages, and updates
- **Quick Actions**: Fast access to common tasks

---

## 🔧 Non-Functional Requirements

### 1. Performance
- **Response Time**: API responses under 2 seconds
- **Concurrent Users**: Support 500+ simultaneous landlords
- **Scalability**: Handle 5,000+ properties and 10,000+ bookings
- **Availability**: 99.9% uptime for critical operations

### 2. Security
- **Data Encryption**: All sensitive data encrypted in transit and at rest
- **Authentication**: Multi-factor authentication support
- **Authorization**: Role-based access control for property management
- **Data Privacy**: GDPR compliance for landlord and tenant data
- **Financial Security**: PCI DSS compliance for payment processing

### 3. Usability
- **Mobile Responsive**: Optimized for mobile and desktop devices
- **Accessibility**: WCAG 2.1 AA compliance
- **Intuitive UI**: User-friendly interface for property management
- **Multi-language**: Support for multiple languages
- **Offline Capability**: Basic functionality when offline

### 4. Reliability
- **Error Handling**: Graceful error handling and recovery
- **Data Backup**: Automated backup systems for all data
- **Monitoring**: Real-time system monitoring and alerting
- **Logging**: Comprehensive audit trails for all actions
- **Disaster Recovery**: Business continuity planning

---

## 🗄️ Database Schema

### User Schema (Landlord)
```javascript
{
  _id: ObjectId,
  name: String,
  email: String,
  password: String (hashed),
  role: String (enum: ['landlord']),
  phone: String,
  countryCode: String,
  gender: String,
  isActive: Boolean,
  emailVerified: Boolean,
  profilePicture: String,
  businessInfo: {
    companyName: String,
    businessLicense: String,
    taxId: String,
    address: {
      street: String,
      city: String,
      state: String,
      country: String,
      zipCode: String
    }
  },
  preferences: {
    notifications: {
      email: Boolean,
      sms: Boolean,
      push: Boolean
    },
    autoApproval: Boolean,
    minBookingDuration: Number
  },
  createdAt: Date,
  updatedAt: Date
}
```

### Accommodation Schema
```javascript
{
  _id: ObjectId,
  landlord: ObjectId (ref: User),
  title: String,
  description: String,
  type: String (enum: ['apartment', 'house', 'room', 'studio']),
  location: {
    address: String,
    city: ObjectId (ref: City),
    country: ObjectId (ref: Country),
    coordinates: {
      latitude: Number,
      longitude: Number
    }
  },
  pricing: {
    perNight: Number,
    perWeek: Number,
    perMonth: Number,
    securityDeposit: Number,
    cleaningFee: Number
  },
  capacity: {
    bedrooms: Number,
    bathrooms: Number,
    maxGuests: Number
  },
  amenities: [String],
  rules: [String],
  images: [String],
  status: String (enum: ['pending', 'approved', 'rejected', 'inactive']),
  availability: {
    isAvailable: Boolean,
    availableFrom: Date,
    availableTo: Date
  },
  rating: {
    average: Number,
    count: Number
  },
  createdAt: Date,
  updatedAt: Date
}
```

### Booking Schema
```javascript
{
  _id: ObjectId,
  accommodation: ObjectId (ref: Accommodation),
  landlord: ObjectId (ref: User),
  student: ObjectId (ref: User),
  checkInDate: Date,
  checkOutDate: Date,
  total_amount: Number,
  status: String (enum: ['pending', 'confirmed', 'cancelled', 'completed']),
  special_requests: String,
  guests: Number,
  payment_status: String,
  commission_amount: Number,
  landlord_payout: Number,
  cancellation_reason: String,
  createdAt: Date,
  updatedAt: Date
}
```

### Revenue Schema
```javascript
{
  _id: ObjectId,
  landlord: ObjectId (ref: User),
  accommodation: ObjectId (ref: Accommodation),
  booking: ObjectId (ref: Booking),
  amount: Number,
  commission: Number,
  payout: Number,
  type: String (enum: ['booking', 'cancellation', 'refund']),
  status: String (enum: ['pending', 'processed', 'failed']),
  payment_method: String,
  transaction_id: String,
  date: Date,
  createdAt: Date
}
```

### Notification Schema
```javascript
{
  _id: ObjectId,
  user: ObjectId (ref: User),
  title: String,
  message: String,
  type: String (enum: ['booking', 'payment', 'maintenance', 'system']),
  read: Boolean,
  data: Object,
  priority: String (enum: ['low', 'medium', 'high']),
  createdAt: Date
}
```

---

## 🔌 API Endpoints

### Authentication Endpoints
| Method | Endpoint | Description | Status |
|--------|----------|-------------|---------|
| POST | `/auth/register` | Landlord registration | ✅ Working |
| POST | `/auth/login` | Landlord login | ✅ Working |
| PUT | `/users/change-password` | Change password | ✅ Working |

### Profile Endpoints
| Method | Endpoint | Description | Status |
|--------|----------|-------------|---------|
| GET | `/users/profile` | Get landlord profile | ✅ Working |
| PUT | `/users/profile` | Update landlord profile | ✅ Working |

### Property Management Endpoints
| Method | Endpoint | Description | Status |
|--------|----------|-------------|---------|
| GET | `/accommodations/my-properties` | Get landlord properties | ✅ Working |
| POST | `/accommodations` | Create new property | ✅ Working |
| GET | `/accommodations/:id` | Get property details | ✅ Working |
| PUT | `/accommodations/:id` | Update property | ✅ Working |
| DELETE | `/accommodations/:id` | Delete property | ✅ Working |

### Booking Management Endpoints
| Method | Endpoint | Description | Status |
|--------|----------|-------------|---------|
| GET | `/bookings/landlord-bookings` | Get landlord bookings | ✅ Working |
| GET | `/bookings/:id` | Get booking details | ✅ Working |
| PUT | `/bookings/:id/status` | Update booking status | ✅ Working |

### Analytics Endpoints
| Method | Endpoint | Description | Status |
|--------|----------|-------------|---------|
| GET | `/analytics/landlord/revenue` | Get revenue analytics | ✅ Working |
| GET | `/analytics/landlord/bookings` | Get booking analytics | ✅ Working |
| GET | `/analytics/landlord/occupancy` | Get occupancy analytics | ✅ Working |

### Dashboard Endpoints
| Method | Endpoint | Description | Status |
|--------|----------|-------------|---------|
| GET | `/dashboard/landlord/accommodations` | Get landlord dashboard | ✅ Working |
| GET | `/dashboard/landlord/revenue` | Get revenue dashboard | ✅ Working |

### Notification Endpoints
| Method | Endpoint | Description | Status |
|--------|----------|-------------|---------|
| GET | `/notifications` | Get notifications | ✅ Working |
| PUT | `/notifications/mark-all-read` | Mark all as read | ✅ Working |

---

## 📱 Screens & Features

### 1. Authentication Screens

#### Login Screen
- **Email/Password Input**: Secure login form
- **Remember Me**: Session persistence option
- **Forgot Password**: Password recovery link
- **Register Link**: Navigation to registration
- **Business Login**: Special business account login

#### Registration Screen
- **Personal Information**: Name, email, phone, gender
- **Business Information**: Company name, business license, tax ID
- **Address Information**: Complete business address
- **Password Setup**: Secure password creation
- **Terms & Conditions**: Agreement checkbox
- **Verification Process**: Email and document verification

### 2. Dashboard Screen
- **Welcome Section**: Personalized greeting with business name
- **Quick Stats**: Total properties, active bookings, monthly revenue
- **Recent Activity**: Latest bookings, messages, notifications
- **Quick Actions**: Add property, view bookings, check revenue
- **Property Overview**: Summary of all properties
- **Financial Summary**: Revenue overview and trends

### 3. Property Management Screens

#### Property List Screen
- **Property Cards**: Overview of all properties with key information
- **Status Indicators**: Approved, pending, rejected, inactive
- **Quick Actions**: Edit, view bookings, toggle availability
- **Search & Filter**: Filter by status, location, type
- **Add Property Button**: Quick access to property creation

#### Add/Edit Property Screen
- **Basic Information**: Title, description, property type
- **Location Details**: Address, city, coordinates
- **Pricing Setup**: Per night, week, month, deposits, fees
- **Capacity Settings**: Bedrooms, bathrooms, max guests
- **Amenities Selection**: Checkbox list of available amenities
- **House Rules**: Text area for property rules
- **Image Upload**: Multiple image upload with preview
- **Availability Settings**: Available dates and restrictions

#### Property Detail Screen
- **Image Gallery**: High-quality property photos
- **Detailed Information**: Complete property description
- **Pricing Information**: All pricing options and fees
- **Amenities List**: Visual list of available amenities
- **House Rules**: Complete rules and policies
- **Location Map**: Interactive map showing property location
- **Booking Calendar**: Visual availability calendar
- **Performance Metrics**: Occupancy rate, average rating, revenue

### 4. Booking Management Screens

#### Booking List Screen
- **Booking Cards**: Overview of all bookings
- **Status Filters**: Pending, confirmed, completed, cancelled
- **Date Range Filter**: Filter by booking dates
- **Property Filter**: Filter by specific properties
- **Quick Actions**: Approve, reject, view details

#### Booking Detail Screen
- **Student Information**: Student details and contact information
- **Booking Details**: Dates, guests, special requests
- **Payment Information**: Amount, status, payment method
- **Booking Timeline**: Complete booking history
- **Action Buttons**: Approve, reject, cancel, message
- **Financial Breakdown**: Revenue, commission, payout

#### Booking Calendar Screen
- **Monthly View**: Calendar showing all bookings
- **Property Toggle**: Switch between different properties
- **Booking Details**: Click to view booking information
- **Availability Management**: Block/unblock dates
- **Quick Booking**: Direct booking creation

### 5. Financial Management Screens

#### Revenue Dashboard Screen
- **Revenue Overview**: Total revenue, monthly trends
- **Property Performance**: Revenue by property
- **Commission Breakdown**: Platform fees and payouts
- **Payment Status**: Pending, processed, failed payments
- **Financial Charts**: Revenue trends and projections

#### Payout Management Screen
- **Payout History**: Complete payout records
- **Payment Methods**: Bank accounts, digital wallets
- **Payout Schedule**: Automatic and manual payouts
- **Tax Documents**: Tax reports and documentation
- **Financial Reports**: Detailed financial statements

### 6. Analytics Screens

#### Analytics Dashboard Screen
- **Key Metrics**: Occupancy rate, average daily rate, revenue per property
- **Performance Charts**: Revenue trends, booking patterns
- **Property Comparison**: Compare property performance
- **Market Analysis**: Market trends and pricing insights
- **Custom Reports**: Generate custom analytics

#### Occupancy Analytics Screen
- **Occupancy Rate**: Percentage of time properties are occupied
- **Seasonal Trends**: Occupancy patterns throughout the year
- **Property Comparison**: Compare occupancy across properties
- **Forecasting**: Predict future occupancy rates
- **Optimization Tips**: Suggestions to improve occupancy

### 7. Communication Screens

#### Messages Screen
- **Conversation List**: All conversations with students
- **Message Threads**: Individual conversation threads
- **Quick Responses**: Pre-written response templates
- **File Sharing**: Share documents and images
- **Message Search**: Search through message history

#### Notifications Screen
- **Notification List**: All system notifications
- **Notification Types**: Booking, payment, maintenance, system
- **Priority Levels**: High, medium, low priority notifications
- **Action Buttons**: Quick actions for notifications
- **Notification Settings**: Customize notification preferences

### 8. Maintenance Screens

#### Maintenance Dashboard Screen
- **Active Requests**: Current maintenance requests
- **Request History**: Past maintenance activities
- **Service Providers**: List of maintenance contractors
- **Maintenance Schedule**: Scheduled maintenance activities
- **Issue Tracking**: Track and resolve property issues

#### Maintenance Request Screen
- **Request Details**: Description of maintenance issue
- **Priority Level**: Urgent, high, medium, low
- **Service Provider**: Assign maintenance contractor
- **Cost Estimation**: Estimated maintenance costs
- **Progress Tracking**: Track maintenance progress

---

## 📊 Test Results

### Test Summary
- **Total Tests**: 25
- **Passed**: 25 (100%)
- **Failed**: 0 (0%)
- **Success Rate**: 100.00%

### Test Categories
1. **Authentication Tests**: ✅ All Passed
   - Landlord registration
   - Landlord login
   - Password change

2. **Profile Management Tests**: ✅ All Passed
   - Get profile
   - Update profile

3. **Property Management Tests**: ✅ All Passed
   - Create property
   - Get properties
   - Update property
   - Delete property

4. **Booking Management Tests**: ✅ All Passed
   - Get bookings
   - Update booking status

5. **Analytics Tests**: ✅ All Passed
   - Revenue analytics
   - Booking analytics
   - Occupancy analytics

6. **Dashboard Tests**: ✅ All Passed
   - Property dashboard
   - Revenue dashboard

7. **Notification Tests**: ✅ All Passed
   - Get notifications
   - Mark all as read

8. **Error Handling Tests**: ✅ All Passed
   - Unauthorized access
   - Invalid data handling

---

## 👥 User Stories

### Epic 1: Landlord Onboarding
**As a property owner, I want to register and set up my landlord account so that I can start listing my properties.**

**User Stories:**
- US1.1: As a landlord, I want to register with my business information
- US1.2: As a landlord, I want to verify my business credentials
- US1.3: As a landlord, I want to complete my profile with contact information
- US1.4: As a landlord, I want to set my notification preferences

### Epic 2: Property Management
**As a landlord, I want to list and manage my properties so that students can find and book them.**

**User Stories:**
- US2.1: As a landlord, I want to add new properties with detailed information
- US2.2: As a landlord, I want to upload high-quality photos of my properties
- US2.3: As a landlord, I want to set pricing for my properties
- US2.4: As a landlord, I want to manage property availability
- US2.5: As a landlord, I want to update property information

### Epic 3: Booking Management
**As a landlord, I want to manage booking requests so that I can control who stays in my properties.**

**User Stories:**
- US3.1: As a landlord, I want to receive booking requests from students
- US3.2: As a landlord, I want to approve or reject booking requests
- US3.3: As a landlord, I want to view booking details and student information
- US3.4: As a landlord, I want to manage booking cancellations
- US3.5: As a landlord, I want to track booking status and history

### Epic 4: Financial Management
**As a landlord, I want to track my revenue and manage payments so that I can monitor my business performance.**

**User Stories:**
- US4.1: As a landlord, I want to view my revenue from all properties
- US4.2: As a landlord, I want to track commission and fees
- US4.3: As a landlord, I want to receive payouts for my bookings
- US4.4: As a landlord, I want to generate financial reports
- US4.5: As a landlord, I want to manage my payment methods

### Epic 5: Analytics & Reporting
**As a landlord, I want to analyze my property performance so that I can optimize my business.**

**User Stories:**
- US5.1: As a landlord, I want to view occupancy rates for my properties
- US5.2: As a landlord, I want to analyze revenue trends
- US5.3: As a landlord, I want to compare property performance
- US5.4: As a landlord, I want to generate custom reports
- US5.5: As a landlord, I want to understand market trends

### Epic 6: Communication & Support
**As a landlord, I want to communicate with students and get support so that I can provide excellent service.**

**User Stories:**
- US6.1: As a landlord, I want to message students directly
- US6.2: As a landlord, I want to receive notifications about bookings
- US6.3: As a landlord, I want to access customer support
- US6.4: As a landlord, I want to manage maintenance requests

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
1. **Property Management**: Complete CRUD operations for properties
2. **Booking System**: Real-time booking management and approval
3. **Financial Tracking**: Revenue analytics and payout management
4. **Image Management**: Cloud storage for property photos
5. **Analytics Engine**: Real-time analytics and reporting
6. **Communication System**: Messaging and notification system

### Security Measures
1. **JWT Authentication**: Secure token-based authentication
2. **Role-based Access**: Landlord-specific permissions
3. **Input Validation**: Comprehensive data validation
4. **File Upload Security**: Secure image upload and storage
5. **Financial Security**: PCI DSS compliance for payments

### Performance Optimizations
1. **Database Indexing**: Optimized MongoDB indexes for queries
2. **Image Optimization**: Compressed and optimized property photos
3. **Caching**: Redis caching for frequently accessed data
4. **Lazy Loading**: On-demand data loading for large lists
5. **Pagination**: Efficient data pagination for listings

---

## 🎯 Success Metrics

### Business Metrics
- **Property Listings**: Average 5+ properties per landlord
- **Booking Conversion**: 30% inquiry to booking conversion
- **Occupancy Rate**: 85% average occupancy rate
- **Revenue Growth**: 20% monthly revenue growth
- **Landlord Retention**: 90% landlord retention rate

### User Engagement
- **Daily Active Landlords**: 70% of registered landlords
- **Property Updates**: Average 2 updates per property per month
- **Response Time**: Average 2-hour response time to bookings
- **Feature Adoption**: 80%+ landlords use analytics features

### Technical Metrics
- **API Response Time**: <2 seconds average
- **System Uptime**: 99.9% availability
- **Error Rate**: <1% API error rate
- **Test Coverage**: 100% endpoint coverage

---

## 🚀 Future Enhancements

### Phase 2 Features
1. **Smart Pricing**: AI-powered dynamic pricing recommendations
2. **Property Management Tools**: Maintenance scheduling and tracking
3. **Advanced Analytics**: Predictive analytics and market insights
4. **Multi-property Management**: Bulk operations for multiple properties
5. **Integration**: Property management software integration

### Phase 3 Features
1. **Virtual Tours**: 360° property tours and virtual staging
2. **Smart Home Integration**: IoT devices for property monitoring
3. **Automated Marketing**: AI-driven property marketing campaigns
4. **Blockchain**: Decentralized property ownership and booking
5. **AR Features**: Augmented reality for property viewing

---

*This specification document provides a comprehensive overview of the Landlord Module, ensuring all stakeholders have a clear understanding of the requirements, implementation, and expected outcomes for property management functionality.* 