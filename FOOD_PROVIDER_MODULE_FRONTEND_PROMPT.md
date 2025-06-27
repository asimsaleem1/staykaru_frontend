# FOOD PROVIDER MODULE - FRONTEND DEVELOPMENT PROMPT

## 🎯 Project Overview

You are tasked with developing the **Food Provider Module Frontend** for the Staykaru platform - a comprehensive restaurant and food service management system. This module serves food businesses who want to list their menus, manage orders, and grow their business through Staykaru.

## 📋 Requirements Summary

### ✅ Backend Status
- **100% Tested**: All endpoints are working perfectly
- **API Ready**: Complete REST API with JWT authentication
- **Real-time**: WebSocket support for notifications and order updates
- **Database**: MongoDB with optimized schemas
- **File Upload**: Image upload support for restaurant and menu items

### 🎯 Target Users
- **Primary**: Restaurant owners, food business managers
- **Platforms**: Mobile-first (React Native/Flutter) + Web (React.js)

---

## 🏗️ Technical Architecture

### Frontend Stack Options

#### Option 1: React Native (Recommended for Mobile)
```javascript
{
  "react-native": "^0.72.0",
  "@react-navigation/native": "^6.1.0",
  "axios": "^1.5.0",
  "react-native-vector-icons": "^10.0.0",
  "react-native-elements": "^3.4.3",
  "react-native-image-picker": "^5.6.0",
  "socket.io-client": "^4.7.0",
  "react-native-push-notification": "^8.1.1"
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
  image_picker: ^1.0.4
  socket_io_client: ^2.0.3
  flutter_local_notifications: ^15.1.1
  cached_network_image: ^3.2.3
  shimmer: ^3.0.0
```

#### Option 3: React.js (Web Version)
```javascript
{
  "react": "^18.2.0",
  "react-router-dom": "^6.15.0",
  "axios": "^1.5.0",
  "socket.io-client": "^4.7.0",
  "react-query": "^3.39.0",
  "react-hook-form": "^7.45.0",
  "react-dropzone": "^14.2.3",
  "react-hot-toast": "^2.4.1",
  "tailwindcss": "^3.3.0"
}
```

---

## 📱 Screen Specifications

### 1. Authentication Screens
- Login: Email/password, forgot password, register link
- Registration: Name, email, password, phone, business info, terms

### 2. Dashboard Screen
- Welcome message, quick stats (orders, revenue), recent activity, quick actions

### 3. Restaurant Profile Screens
- View/edit restaurant info, business hours, delivery settings, image upload

### 4. Menu Management Screens
- Menu overview, add/edit/delete menu items, category management, image upload

### 5. Order Management Screens
- Order queue, order details, update status, customer info, order timeline

### 6. Analytics Screens
- Revenue analytics, order analytics, menu analytics, charts and trends

### 7. Notification Screens
- Notification list, mark as read, notification settings

### 8. Settings Screens
- Profile settings, payment settings, notification preferences

---

## 🔧 Technical Requirements

### State Management
- Use Redux/Context for global state (auth, profile, orders, menu, notifications)

### API Integration
- Use Axios/Dio for API calls
- JWT token management (secure storage, refresh)
- Error handling for all API calls
- File upload for images (restaurant, menu items)
- Real-time updates via WebSocket (order status, notifications)

### UI/UX Requirements
- Modern, clean design (Material-UI/Ant Design/Tailwind)
- Responsive for mobile and web
- Accessible (WCAG 2.1 AA)
- Loading states, error messages, empty states
- Consistent color palette and typography

### Security Requirements
- Secure token storage
- HTTPS for all API calls
- Input validation and sanitization
- Role-based access control

### Testing Requirements
- Unit tests for components and services
- Integration tests for API flows
- User acceptance testing for all screens

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
- [ ] Restaurant profile management
- [ ] Menu management
- [ ] Order management
- [ ] Analytics dashboard
- [ ] Notification system

### Phase 3: Advanced Features
- [ ] Real-time updates
- [ ] File/image upload
- [ ] Payment integration
- [ ] Error handling
- [ ] Settings screens

### Phase 4: Polish & Testing
- [ ] UI/UX refinement
- [ ] Performance optimization
- [ ] Comprehensive testing
- [ ] Bug fixes
- [ ] Documentation
- [ ] Deployment preparation

---

## 🎯 Success Criteria
- All API endpoints integrated and functional
- Real-time order and notification updates
- 100% test coverage for core features
- Responsive and accessible UI
- Secure authentication and data handling

---

*This prompt provides all the necessary information to develop a world-class Food Provider Module frontend that integrates seamlessly with the tested backend API. Focus on creating an intuitive, performant, and secure user experience for food businesses.* 