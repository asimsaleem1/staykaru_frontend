# StayKaru Admin Module - Complete Specification

## Overview
The StayKaru Admin Module provides comprehensive administrative capabilities for managing the entire platform, including user management, content moderation, analytics, system administration, and financial oversight.

## Authentication & Authorization
- **JWT Token Required**: All admin endpoints require valid JWT authentication
- **Role-Based Access**: Only users with 'admin' role can access these endpoints
- **Base URL**: `https://staykaru-backend-60ed08adb2a7.herokuapp.com/api/admin`
- **Development URL**: `http://localhost:3000/api/admin`

## Core Features & Screens

### 1. Dashboard Overview Screen
**Purpose**: Main admin dashboard with key metrics and quick actions

**Endpoints**:
- `GET /api/admin/analytics/dashboard` - Dashboard analytics
- `GET /api/admin/analytics/performance` - Performance metrics
- `GET /api/admin/system/health` - System health status

**Frontend Requirements**:
- Real-time metrics display
- Quick action buttons
- System status indicators
- Performance charts
- Recent activity feed

### 2. User Management Screen
**Purpose**: Manage all platform users (students, landlords, food providers)

**Endpoints**:
- `GET /api/admin/users` - List all users with pagination
- `GET /api/admin/users/statistics` - User statistics
- `GET /api/admin/users/:id` - Get specific user details
- `PUT /api/admin/users/:id/status` - Activate/deactivate user
- `DELETE /api/admin/users/:id` - Delete user account
- `GET /api/admin/analytics/users` - User analytics
- `GET /api/admin/users/activity-report` - User activity report

**Frontend Requirements**:
- User list with search and filters
- User details modal/sidebar
- Bulk actions (activate/deactivate)
- User statistics charts
- Activity timeline
- Export functionality

### 3. Accommodation Management Screen
**Purpose**: Manage and moderate accommodation listings

**Endpoints**:
- `GET /api/admin/accommodations` - List all accommodations
- `PUT /api/admin/accommodations/:id/approve` - Approve accommodation
- `PUT /api/admin/accommodations/:id/reject` - Reject accommodation
- `DELETE /api/admin/accommodations/:id` - Delete accommodation
- `GET /api/admin/accommodations/statistics` - Accommodation statistics

**Frontend Requirements**:
- Accommodation list with status filters
- Preview accommodation details
- Approval/rejection workflow
- Statistics dashboard
- Bulk moderation actions

### 4. Food Service Management Screen
**Purpose**: Manage food providers and their services

**Endpoints**:
- `GET /api/admin/food-services` - List all food services
- `PUT /api/admin/food-services/:id/approve` - Approve food service
- `PUT /api/admin/food-services/:id/reject` - Reject food service
- `GET /api/admin/food-providers` - List food providers
- `GET /api/admin/food-providers/statistics` - Food provider statistics
- `GET /api/admin/food-providers/analytics` - Food provider analytics
- `GET /api/admin/food-services/statistics` - Food service statistics
- `GET /api/admin/food-services/reports` - Food service reports

**Frontend Requirements**:
- Food service/provider list
- Service approval workflow
- Provider analytics dashboard
- Menu item management
- Revenue tracking

### 5. Booking Management Screen
**Purpose**: Monitor and manage all platform bookings

**Endpoints**:
- `GET /api/admin/bookings` - List all bookings
- `GET /api/admin/bookings/:id` - Get booking details
- `PUT /api/admin/bookings/:id/cancel` - Cancel booking
- `GET /api/admin/analytics/bookings` - Booking analytics

**Frontend Requirements**:
- Booking list with status filters
- Booking details view
- Booking timeline
- Cancellation management
- Booking statistics

### 6. Order Management Screen
**Purpose**: Manage food orders and delivery

**Endpoints**:
- `GET /api/admin/orders` - List all orders
- `GET /api/admin/orders/:id` - Get order details
- `GET /api/admin/analytics/orders` - Order analytics

**Frontend Requirements**:
- Order list with status tracking
- Order details modal
- Delivery tracking
- Order statistics

### 7. Financial Management Screen
**Purpose**: Monitor payments, transactions, and revenue

**Endpoints**:
- `GET /api/admin/transactions` - List all transactions
- `GET /api/admin/payments/statistics` - Payment statistics
- `GET /api/admin/commissions` - Commission reports
- `GET /api/admin/analytics/revenue` - Revenue analytics

**Frontend Requirements**:
- Transaction history
- Payment statistics
- Revenue charts
- Commission tracking
- Financial reports

### 8. Content Moderation Screen
**Purpose**: Moderate reviews and content

**Endpoints**:
- `GET /api/admin/content/reports` - Content reports
- `GET /api/admin/content/review-queue` - Review queue
- `GET /api/admin/content/statistics` - Moderation statistics

**Frontend Requirements**:
- Reported content list
- Review queue management
- Content approval/rejection
- Moderation statistics

### 9. System Administration Screen
**Purpose**: System configuration and maintenance

**Endpoints**:
- `GET /api/admin/system/performance` - System performance
- `GET /api/admin/system/logs` - System logs
- `GET /api/admin/config/platform` - Platform configuration
- `PUT /api/admin/config/platform` - Update platform config
- `POST /api/admin/system/backup` - Create system backup

**Frontend Requirements**:
- System performance metrics
- Log viewer
- Configuration forms
- Backup management
- System health monitoring

### 10. Export & Reports Screen
**Purpose**: Generate and download reports

**Endpoints**:
- `GET /api/admin/export/users` - Export user data
- `GET /api/admin/export/bookings` - Export booking data
- `GET /api/admin/export/transactions` - Export transaction data

**Frontend Requirements**:
- Export options (CSV, Excel, PDF)
- Report generation
- Download management
- Scheduled reports

### 11. Notification Management Screen
**Purpose**: Send notifications to users

**Endpoints**:
- `POST /api/admin/notifications/broadcast` - Send broadcast notification
- `POST /api/admin/notifications/targeted` - Send targeted notification

**Frontend Requirements**:
- Notification composer
- User targeting options
- Notification history
- Template management

## API Endpoint Details

### Query Parameters
Most list endpoints support:
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 10)
- `search`: Search term
- `status`: Filter by status
- `role`: Filter by user role
- `type`: Filter by type

### Response Format
All endpoints return consistent JSON responses:
```json
{
  "success": true,
  "data": {...},
  "message": "Operation successful",
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 100,
    "pages": 10
  }
}
```

### Error Handling
- `400`: Bad Request
- `401`: Unauthorized
- `403`: Forbidden
- `404`: Not Found
- `500`: Internal Server Error

## Frontend Implementation Guidelines

### Required Technologies
- React/Vue/Angular (any modern framework)
- State management (Redux/Vuex/NgRx)
- HTTP client (Axios/Fetch)
- UI library (Material-UI, Ant Design, etc.)
- Charts library (Chart.js, D3.js, etc.)

### Key Components Needed
1. **Layout Components**
   - Admin sidebar navigation
   - Header with user info
   - Breadcrumb navigation
   - Loading states

2. **Data Display Components**
   - Data tables with pagination
   - Search and filter components
   - Modal dialogs
   - Status badges

3. **Analytics Components**
   - Chart components
   - Metric cards
   - Dashboard widgets
   - Real-time updates

4. **Form Components**
   - User management forms
   - Configuration forms
   - Notification composer
   - Export options

### State Management
- User authentication state
- Current page/section
- Data caching
- Loading states
- Error handling

### Security Considerations
- JWT token storage
- Token refresh handling
- Role-based UI rendering
- Input validation
- XSS protection

## Testing Requirements

### Unit Tests
- Component rendering
- API integration
- State management
- User interactions

### Integration Tests
- End-to-end workflows
- API endpoint testing
- Authentication flows
- Error scenarios

### Performance Tests
- Large data sets
- Real-time updates
- Concurrent users
- Memory usage

## Deployment Considerations

### Environment Variables
- API base URL
- JWT secret
- Database connection
- File upload limits

### Build Configuration
- Production optimization
- Asset compression
- Environment-specific configs
- Error tracking

### Monitoring
- Performance monitoring
- Error tracking
- User analytics
- System health checks

## Success Metrics

### Functionality
- All endpoints working correctly
- Proper error handling
- Real-time updates
- Bulk operations

### Performance
- Page load times < 2 seconds
- API response times < 500ms
- Smooth user interactions
- Efficient data loading

### User Experience
- Intuitive navigation
- Responsive design
- Accessibility compliance
- Cross-browser compatibility

This specification provides a complete roadmap for implementing a fully functional admin module frontend that integrates seamlessly with the existing backend API. 