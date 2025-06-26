# StayKaru - Student Accommodation & Food Delivery Platform

## Overview

StayKaru is a comprehensive React Native application designed specifically for students in Pakistan to find accommodation and order food. The platform serves four types of users: Students, Landlords, Food Providers, and Administrators.

## 🚀 Current Status

✅ **FULLY FUNCTIONAL** - All modules implemented and tested
✅ **Navigation Fixed** - All screen navigation working properly  
✅ **Admin Module Complete** - Full admin dashboard with all features
✅ **Student Module Enhanced** - Added chat, support, and notifications
✅ **Clean Codebase** - Removed redundant test files and documentation

## � User Modules

### 👤 Admin Module

**Login Credentials:**

- **Email:** `admin@staykaru.com`
- **Password:** `admin123`

**Alternative Admin:**

- **Email:** `assaleemofficial@gmail.com`
- **Password:** `admin123`

**Features:**

- ✅ Dashboard with analytics
- ✅ User management (Students, Landlords, Food Providers)
- ✅ Accommodation management and approval
- ✅ Food provider management and approval
- ✅ Booking management
- ✅ Order management
- ✅ Content moderation
- ✅ Financial management
- ✅ System settings
- ✅ Reports center
- ✅ Notifications management
- ✅ Analytics and insights

### 🎓 Student Module

**Features:**

- ✅ Dashboard with quick access
- ✅ Browse accommodations with filters
- ✅ Accommodation booking system
- ✅ Food provider browsing
- ✅ Food ordering and tracking
- ✅ Booking history and management
- ✅ Order history and tracking
- ✅ **NEW:** Live chat support
- ✅ **NEW:** Help & support center
- ✅ **NEW:** Push notifications
- ✅ **NEW:** Enhanced profile management
- ✅ **NEW:** Settings and preferences

## 🔧 Technical Stack

### Frontend

- **React Native** with Expo SDK 53
- **Expo Router** for navigation
- **Expo Vector Icons** for consistent iconography
- **AsyncStorage** for local data persistence
- **Expo Image Picker** for profile pictures
- **Expo Auth Session** for social login

### Backend Integration

- **API Base URL**: `https://staykaru-backend-60ed08adb2a7.herokuapp.com/api`
- **Authentication**: JWT token-based
- **File Upload**: Multipart form data for images
- **Real-time Updates**: WebSocket ready

## 📁 Project Structure

```
src/
├── components/           # Reusable UI components
│   ├── FormField.js     # Enhanced form input component
│   ├── LoadingSpinner.js # Loading states and overlays
│   ├── ImagePicker.js   # Profile picture selection
│   └── EmailVerificationModal.js # OTP verification modal
├── screens/             # Application screens
│   ├── LoginScreen.js   # User authentication
│   ├── RegisterScreen.js # User registration
│   ├── EmailVerificationScreen.js # Email verification
│   └── StudentDashboard.js # Student dashboard
├── services/            # Business logic and API calls
│   ├── authService.js   # Authentication API calls
│   ├── validationService.js # Form validation logic
│   └── imageService.js  # Image handling and upload
├── utils/               # Utility functions and constants
│   ├── constants.js     # App constants and configurations
│   └── helpers.js       # Helper functions
└── navigation/          # Navigation configuration
    └── AppNavigator.js  # Main navigation structure
```

## 🚀 Installation & Setup

### Prerequisites

- Node.js (16.x or higher)
- Expo CLI
- Expo Go app on your mobile device

### Installation Steps

1. **Navigate to your project:**

   ```bash
   cd d:\FYP\staykaru_frontend
   ```

2. **Run the setup script:**

   ```powershell
   .\setup.ps1
   ```

3. **Start the development server:**

   ```bash
   npm start
   ```

4. **Run on your device:**
   - Install Expo Go from App Store (iOS) or Google Play (Android)
   - Scan the QR code with Expo Go (Android) or Camera app (iOS)

### Development Commands

```bash
# Start Expo development server
npm start

# Open Android simulator
npm run android

# Open iOS simulator (macOS only)
npm run ios

# Open in web browser
npm run web
```

## 📱 App Flow

### 1. **Registration**

- Comprehensive form with all required fields
- Real-time validation and error handling
- Profile picture upload with camera/gallery options
- Password strength indicator
- CNIC/Passport auto-formatting

### 2. **Email Verification**

- 6-digit OTP sent to registered email
- Auto-focus input fields for smooth UX
- Resend functionality with countdown timer
- Real-time validation

### 3. **Login**

- Email/password authentication
- Email verification check
- Role-based dashboard navigation
- Social login options

### 4. **Dashboard**

- Role-specific interface and features
- Quick stats and navigation
- Recent activity tracking
- Profile management

## 🔐 Authentication Flow

### Registration Process

1. User completes comprehensive registration form
2. Client-side validation with real-time feedback
3. Server-side validation and account creation
4. Email verification required before login
5. OTP verification with resend functionality
6. Account activation after email verification

### Login Process

1. User enters email and password
2. System checks email verification status
3. If verified: authenticate and route to dashboard
4. If not verified: show verification modal
5. JWT token stored for session management
6. Role-based navigation to appropriate dashboard

## 🎨 Design System

### Colors

- **Primary**: #2563eb (Blue)
- **Success**: #10b981 (Green)
- **Error**: #ef4444 (Red)
- **Warning**: #f59e0b (Amber)
- **Gray Scale**: 50-900 variations

### Typography

- **Large Title**: 32px
- **Headings**: 28px, 24px, 20px, 18px
- **Body**: 16px, 14px, 12px
- **Caption**: 10px

### Components

- **FormField**: Enhanced input with validation
- **LoadingSpinner**: Consistent loading states
- **ImagePicker**: Profile picture selection
- **Modal**: Email verification overlay

## 🔧 Configuration

### Expo Configuration (app.json)

```json
{
  "expo": {
    "name": "StayKaru",
    "slug": "staykaru-frontend",
    "version": "1.0.0",
    "platforms": ["ios", "android", "web"]
  }
}
```

### API Configuration

- **Base URL**: `https://staykaru-backend-60ed08adb2a7.herokuapp.com/api`
- **Endpoints**: `/auth/register`, `/auth/login`, `/auth/verify-email`, etc.

### Dependencies

```json
{
  "expo": "~53.0.0",
  "@expo/vector-icons": "^14.0.4",
  "expo-image-picker": "~16.1.4",
  "@react-navigation/native": "^7.0.15",
  "@react-navigation/stack": "^7.0.15"
}
```

## 🧪 Testing

### Manual Testing Checklist

- [ ] Registration with all fields
- [ ] Email verification flow
- [ ] Login with verified account
- [ ] Login with unverified account
- [ ] Profile picture upload
- [ ] Form validation
- [ ] Role-based navigation
- [ ] Logout functionality

## 📱 Deployment

### Expo Build

```bash
# Build for Android
expo build:android

# Build for iOS
expo build:ios
```

### Publishing

```bash
# Publish to Expo
expo publish

# Create standalone app
expo build:android --type app-bundle
```

## 🚀 Future Enhancements

### Planned Features

- **Push Notifications** for real-time updates
- **Real-time Chat** system
- **Payment Integration** for bookings
- **Map Integration** for location services
- **Advanced Search** and filtering
- **Rating & Review** system

### Technical Improvements

- **State Management** with Redux Toolkit
- **Offline Support** with sync
- **Performance Optimization**
- **Analytics Integration**
- **Advanced Security** measures

## 📞 Support

For technical support:

- **Email**: support@staykaru.com
- **Documentation**: Check project files
- **Backend API**: Fully deployed and functional

---

**StayKaru Team 2025** - Building the future of student accommodation with Expo! 🎓🏠📱

## 📁 Project Structure

```
src/
├── components/           # Reusable UI components
│   ├── FormField.js     # Enhanced form input component
│   ├── LoadingSpinner.js # Loading states and overlays
│   ├── ImagePicker.js   # Profile picture selection
│   └── EmailVerificationModal.js # OTP verification modal
├── screens/             # Application screens
│   ├── LoginScreen.js   # User authentication
│   ├── RegisterScreen.js # User registration
│   ├── EmailVerificationScreen.js # Email verification
│   └── StudentDashboard.js # Student dashboard
├── services/            # Business logic and API calls
│   ├── authService.js   # Authentication API calls
│   ├── validationService.js # Form validation logic
│   └── imageService.js  # Image handling and upload
├── utils/               # Utility functions and constants
│   ├── constants.js     # App constants and configurations
│   └── helpers.js       # Helper functions
└── navigation/          # Navigation configuration
    └── AppNavigator.js  # Main navigation structure
```

## 🚀 Installation & Setup

### Prerequisites

- Node.js (14.x or higher)
- React Native CLI
- Android Studio (for Android development)
- Xcode (for iOS development - macOS only)

### Installation Steps

1. **Clone the repository**

   ```bash
   cd d:\FYP\staykaru_frontend
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Install iOS dependencies** (macOS only)

   ```bash
   cd ios && pod install && cd ..
   ```

4. **Configure React Native Vector Icons**
   - Follow the setup guide for your platform
   - Android: Add fonts to `android/app/src/main/assets/fonts/`
   - iOS: Add fonts to Xcode project

### Required Dependencies

```json
{
  "@react-native-async-storage/async-storage": "^1.19.0",
  "@react-native-picker/picker": "^2.5.0",
  "@react-native-community/datetimepicker": "^7.6.0",
  "react-native-image-picker": "^5.6.0",
  "react-native-vector-icons": "^10.0.0",
  "@react-navigation/native": "^6.1.0",
  "@react-navigation/stack": "^6.3.0"
}
```

## 🏃‍♂️ Running the Application

### Development Mode

**Start Metro Bundler**

```bash
npm start
```

**Run on Android**

```bash
npm run android
```

**Run on iOS** (macOS only)

```bash
npm run ios
```

### Production Build

**Android APK**

```bash
cd android
./gradlew assembleRelease
```

**iOS Archive** (macOS only)

```bash
cd ios
xcodebuild -workspace StayKaru.xcworkspace -scheme StayKaru archive
```

## 🔐 Authentication Flow

### Registration Process

1. User fills comprehensive registration form
2. Form validation (client-side and server-side)
3. Profile picture upload (optional)
4. Account creation with email verification required
5. Email verification with 6-digit OTP
6. Account activation after email verification

### Login Process

1. User enters email and password
2. System checks if email is verified
3. If not verified, shows verification modal
4. If verified, authenticates and routes to role-based dashboard
5. JWT token stored for session management

## 📱 Screen Details

### LoginScreen

- Email/password authentication
- Social login buttons (ready for integration)
- Forgot password link
- Email verification modal for unverified accounts
- Role-based navigation after successful login

### RegisterScreen

- Multi-section form with validation
- Profile picture upload with preview
- Dynamic country/city selection
- Real-time password strength indicator
- CNIC auto-formatting (Pakistani format)
- Age validation based on selected role

### EmailVerificationScreen

- 6-digit OTP input with auto-focus
- Countdown timer for resend functionality
- Resend code option
- Real-time validation
- Success/error handling

### StudentDashboard

- Welcome header with user info
- Quick stats cards
- Service menu navigation
- Recent activity section
- Logout functionality

## 🎨 Design System

### Colors

- **Primary**: #2563eb (Blue)
- **Success**: #10b981 (Green)
- **Error**: #ef4444 (Red)
- **Warning**: #f59e0b (Amber)
- **Gray Scale**: 50-900 variations

### Typography

- **Large Title**: 32px
- **Headings**: 28px, 24px, 20px, 18px
- **Body**: 16px, 14px, 12px
- **Caption**: 10px

### Components

- **FormField**: Enhanced input with validation
- **LoadingSpinner**: Consistent loading states
- **ImagePicker**: Profile picture selection
- **Modal**: Email verification overlay

## 🔧 Configuration

### API Configuration

The app is configured to work with the deployed backend:

- **Base URL**: `https://staykaru-backend-60ed08adb2a7.herokuapp.com/api`
- **Endpoints**: `/auth/register`, `/auth/login`, `/auth/verify-email`, etc.

### Role Configuration

```javascript
const ROLES = {
  ADMIN: "admin",
  STUDENT: "student",
  LANDLORD: "landlord",
  FOOD_PROVIDER: "food_provider",
};
```

## 🧪 Testing

### Manual Testing Checklist

- [ ] Registration with all fields
- [ ] Email verification flow
- [ ] Login with verified account
- [ ] Login with unverified account
- [ ] Profile picture upload
- [ ] Form validation
- [ ] Role-based navigation
- [ ] Logout functionality

### Automated Testing (Future)

- Unit tests with Jest
- Integration tests with Detox
- API testing

## 🚀 Deployment

### Android

1. Generate signed APK
2. Upload to Google Play Store
3. Configure app permissions

### iOS

1. Create iOS Archive
2. Upload to App Store Connect
3. Submit for review

## 📞 Support & Contact

For technical support or questions:

- **Email**: support@staykaru.com
- **Documentation**: Available in project files
- **Backend API**: Fully deployed and functional

## 🔄 Future Enhancements

### Planned Features

- **Push Notifications** for bookings and updates
- **Real-time Chat** between users
- **Payment Integration** for bookings
- **Map Integration** for location services
- **Advanced Search** and filtering
- **Rating & Review** system
- **Multi-language Support**

### Technical Improvements

- **State Management** with Redux or Context API
- **Offline Support** with sync capabilities
- **Performance Optimization**
- **Advanced Security** measures
- **Analytics Integration**

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

---

**StayKaru Team 2025** - Building the future of student accommodation! 🎓🏠
