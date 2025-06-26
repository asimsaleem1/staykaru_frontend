# 🚀 StayKaru Frontend Development - Complete Guide

## 📋 Overview

This comprehensive guide provides detailed instructions for developing the StayKaru frontend application. The backend is **100% production-ready** with all APIs fully operational and documented. The guide covers setup, architecture, implementation of all features, and best practices.

## 🌐 Backend Integration Details

### Production API

**Base URL:** `https://staykaru-backend-60ed08adb2a7.herokuapp.com`  
**API Documentation (Swagger):** `https://staykaru-backend-60ed08adb2a7.herokuapp.com/api`  
**WebSocket URL:** `wss://staykaru-backend-60ed08adb2a7.herokuapp.com`

### Authentication

All API requests (except public endpoints) require JWT authentication via the `Authorization` header:

```
Authorization: Bearer <jwt_token>
```

Tokens are obtained through the login endpoint and should be stored securely (preferably in httpOnly cookies or securely managed in localStorage).

## 🏗️ Recommended Frontend Architecture

### Tech Stack

- **Framework:** React.js (Next.js recommended for SEO benefits)
- **State Management:** Redux Toolkit or React Query
- **UI Components:** Material UI or Chakra UI (with Pakistan-themed customization)
- **Form Management:** React Hook Form with Yup validation
- **Map Integration:** Google Maps React with custom Pakistani location markers
- **Real-time Features:** Socket.IO client
- **API Client:** Axios with interceptors for token management
- **Internationalization:** i18next (English and Urdu support)

### Folder Structure

```
src/
├── api/                  # API service layer
│   ├── auth.api.js       # Authentication endpoints
│   ├── accommodations.api.js
│   ├── food.api.js
│   └── ...
├── assets/               # Static assets (images, fonts, etc.)
├── components/           # Reusable UI components
│   ├── common/           # Shared components (buttons, cards, etc.)
│   ├── layouts/          # Layout components
│   └── features/         # Feature-specific components
├── contexts/             # React contexts
├── hooks/                # Custom React hooks
├── pages/                # Application pages
│   ├── auth/             # Authentication pages
│   ├── student/          # Student pages
│   ├── landlord/         # Landlord pages
│   ├── food-provider/    # Food provider pages
│   └── admin/            # Admin pages
├── redux/                # Redux state management
├── utils/                # Utility functions
├── styles/               # Global styles
└── App.js                # Root component
```

## 💼 User Role Implementation

### 1. Student Role

#### Required Pages
- Dashboard
- Browse Accommodations
- Accommodation Details
- Browse Food Providers 
- Food Provider Details
- Food Ordering
- Booking Management
- Profile Management
- Map View (Nearby Services)
- Chat with Providers

#### Key Features
- Location-based search (using Pakistani coordinates)
- Filters for accommodations and food
- Booking and order management
- Reviews and ratings
- Payment integration
- AI chatbot assistance

#### Implementation Notes
- Ensure mobile responsiveness for student users
- Implement "Save for Later" functionality
- Add Pakistani university filter options
- Support for PKR currency display
- Pakistani phone number format validation

### 2. Landlord Role

#### Required Pages
- Dashboard
- Property Management
- Booking Management
- Analytics
- Profile Management
- Chat with Students

#### Key Features
- Property listing creation with image upload
- Calendar for availability management
- Booking approval workflow
- Payment receipt confirmation
- Revenue analytics

#### Implementation Notes
- Implement comprehensive property creation form
- Create a calendar view for managing bookings
- Design analytics dashboard with charts
- Support image gallery management
- Build chat interface for student communication

### 3. Food Provider Role

#### Required Pages
- Dashboard
- Restaurant Management
- Menu Management
- Order Management
- Analytics
- Profile Management

#### Key Features
- Menu creation and management
- Special offers and promotions
- Order processing workflow
- Availability toggling
- Revenue analytics

#### Implementation Notes
- Create drag-and-drop menu builder
- Implement order status workflow
- Design analytics dashboard with charts
- Build operating hours management interface
- Support for multiple restaurant locations

### 4. Admin Role

#### Required Pages
- Dashboard
- User Management
- Accommodation Management
- Food Provider Management
- Analytics
- System Settings

#### Key Features
- User approval and management
- Content moderation
- System-wide analytics
- Configuration management
- Support ticket handling

#### Implementation Notes
- Create comprehensive admin dashboard
- Implement user management interface
- Build moderation tools for listings
- Design system-wide analytics with filters
- Create configuration management interface

## 🖼️ UI/UX Guidelines

### Brand Identity

- **Color Scheme:**
  - Primary: #0F5257 (Deep Teal)
  - Secondary: #E5A117 (Golden Yellow)
  - Accent: #9E2B25 (Brick Red)
  - Background: #F4F7F5 (Light Gray)
  - Text: #333333 (Dark Gray)

- **Typography:**
  - Headings: Poppins (Semi-Bold)
  - Body: Roboto (Regular)
  - Accents: Montserrat (Medium)

- **Design Elements:**
  - Clean, minimalist interfaces
  - Subtle Pakistani cultural elements
  - Card-based content display
  - Clear visual hierarchy
  - Consistent spacing and alignment

### Responsive Design Requirements

- Mobile-first approach (majority of Pakistani students use mobile devices)
- Breakpoints:
  - Mobile: 320px - 480px
  - Tablet: 481px - 768px
  - Laptop: 769px - 1024px
  - Desktop: 1025px and above

### Accessibility Guidelines

- WCAG 2.1 AA compliance
- Keyboard navigation support
- Screen reader compatibility
- Color contrast ratios (minimum 4.5:1)
- Focus indicators for interactive elements
- Alternative text for images
- Form labels and error messages

## 🧩 Core Components Implementation

### 1. Authentication Components

#### Login Form
```jsx
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import axios from 'axios';

const schema = yup.object({
  email: yup.string().email('Invalid email').required('Email is required'),
  password: yup.string().required('Password is required')
}).required();

const LoginForm = () => {
  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: yupResolver(schema)
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const onSubmit = async (data) => {
    setLoading(true);
    setError('');
    try {
      const response = await axios.post(
        'https://staykaru-backend-60ed08adb2a7.herokuapp.com/api/auth/login',
        data
      );
      
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      
      // Redirect based on user role
      const role = response.data.user.role;
      if (role === 'student') window.location.href = '/student/dashboard';
      else if (role === 'landlord') window.location.href = '/landlord/dashboard';
      else if (role === 'food_provider') window.location.href = '/food-provider/dashboard';
      else if (role === 'admin') window.location.href = '/admin/dashboard';
      
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div className="form-group">
        <label htmlFor="email">Email</label>
        <input
          id="email"
          type="email"
          {...register('email')}
          className={`form-control ${errors.email ? 'is-invalid' : ''}`}
        />
        {errors.email && <div className="invalid-feedback">{errors.email.message}</div>}
      </div>

      <div className="form-group">
        <label htmlFor="password">Password</label>
        <input
          id="password"
          type="password"
          {...register('password')}
          className={`form-control ${errors.password ? 'is-invalid' : ''}`}
        />
        {errors.password && <div className="invalid-feedback">{errors.password.message}</div>}
      </div>
      
      {error && <div className="alert alert-danger">{error}</div>}
      
      <button type="submit" className="btn btn-primary" disabled={loading}>
        {loading ? 'Logging in...' : 'Login'}
      </button>
    </form>
  );
};

export default LoginForm;
```

#### Registration Form
```jsx
// Similar structure to login form with additional fields
// Include dropdown for user role selection
// Add Pakistan-specific fields (CNIC, etc.)
```

#### Password Reset Flow
```jsx
// Implement email request form
// Create token validation page
// Build new password submission form
```

### 2. Map Components

#### Property Map
```jsx
import React from 'react';
import { GoogleMap, LoadScript, Marker, InfoWindow } from '@react-google-maps/api';
import { useState } from 'react';

const containerStyle = {
  width: '100%',
  height: '400px'
};

const pakistanCenter = {
  lat: 30.3753,
  lng: 69.3451
};

const PropertyMap = ({ properties }) => {
  const [selectedProperty, setSelectedProperty] = useState(null);

  return (
    <LoadScript googleMapsApiKey="YOUR_GOOGLE_MAPS_API_KEY">
      <GoogleMap
        mapContainerStyle={containerStyle}
        center={pakistanCenter}
        zoom={6}
      >
        {properties.map((property) => (
          <Marker
            key={property._id}
            position={{
              lat: property.coordinates.coordinates[1],
              lng: property.coordinates.coordinates[0]
            }}
            onClick={() => setSelectedProperty(property)}
          />
        ))}

        {selectedProperty && (
          <InfoWindow
            position={{
              lat: selectedProperty.coordinates.coordinates[1],
              lng: selectedProperty.coordinates.coordinates[0]
            }}
            onCloseClick={() => setSelectedProperty(null)}
          >
            <div>
              <h3>{selectedProperty.title}</h3>
              <p>{selectedProperty.address}</p>
              <p>PKR {selectedProperty.price} / month</p>
              <a href={`/property/${selectedProperty._id}`}>View Details</a>
            </div>
          </InfoWindow>
        )}
      </GoogleMap>
    </LoadScript>
  );
};

export default PropertyMap;
```

### 3. Accommodation Components

#### Property Card
```jsx
import React from 'react';
import { Link } from 'react-router-dom';
import { AiFillStar } from 'react-icons/ai';
import { BiArea, BiBed, BiBath } from 'react-icons/bi';

const PropertyCard = ({ property }) => {
  const { _id, title, price, images, city, averageRating, bedrooms, bathrooms, area } = property;

  return (
    <div className="property-card">
      <div className="property-image">
        <img src={images[0]} alt={title} />
        <div className="property-tag">
          <span>PKR {price}</span>
          <span>/ month</span>
        </div>
      </div>

      <div className="property-details">
        <h3>{title}</h3>
        <p className="property-location">
          {city.name}, {city.state}
        </p>
        
        <div className="property-features">
          <div className="feature">
            <BiBed />
            <span>{bedrooms} Bed</span>
          </div>
          <div className="feature">
            <BiBath />
            <span>{bathrooms} Bath</span>
          </div>
          <div className="feature">
            <BiArea />
            <span>{area} sq.ft</span>
          </div>
        </div>

        <div className="property-footer">
          <div className="rating">
            <AiFillStar />
            <span>{averageRating.toFixed(1)}</span>
          </div>
          <Link to={`/property/${_id}`} className="btn-view">
            View Details
          </Link>
        </div>
      </div>
    </div>
  );
};

export default PropertyCard;
```

### 4. Food Service Components

#### Restaurant Card
```jsx
// Similar to Property Card
// Include cuisine type, delivery time, minimum order
```

#### Menu Item Card
```jsx
// Display food item with image, price, description
// Include add to cart functionality
```

#### Cart Implementation
```jsx
// Create cart context
// Build cart item component
// Implement quantity controls
// Calculate totals with PKR formatting
```

### 5. Chat Implementation

```jsx
import React, { useEffect, useState } from 'react';
import { io } from 'socket.io-client';

const ChatInterface = ({ userId, recipientId }) => {
  const [socket, setSocket] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');

  useEffect(() => {
    // Connect to socket with authentication
    const token = localStorage.getItem('token');
    const newSocket = io('https://staykaru-backend-60ed08adb2a7.herokuapp.com', {
      query: { token }
    });
    
    setSocket(newSocket);

    // Join chat room
    newSocket.emit('joinRoom', { userId, recipientId });

    // Listen for messages
    newSocket.on('message', (message) => {
      setMessages(prev => [...prev, message]);
    });

    // Get chat history
    newSocket.emit('getChatHistory', { userId, recipientId }, (response) => {
      setMessages(response);
    });

    return () => newSocket.disconnect();
  }, [userId, recipientId]);

  const sendMessage = (e) => {
    e.preventDefault();
    
    if (newMessage.trim() && socket) {
      socket.emit('sendMessage', {
        senderId: userId,
        recipientId,
        content: newMessage
      });
      
      setNewMessage('');
    }
  };

  return (
    <div className="chat-container">
      <div className="chat-messages">
        {messages.map((message, index) => (
          <div 
            key={index} 
            className={`message ${message.senderId === userId ? 'outgoing' : 'incoming'}`}
          >
            <div className="message-content">{message.content}</div>
            <div className="message-timestamp">
              {new Date(message.createdAt).toLocaleTimeString()}
            </div>
          </div>
        ))}
      </div>
      
      <form className="chat-input" onSubmit={sendMessage}>
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Type a message..."
        />
        <button type="submit">Send</button>
      </form>
    </div>
  );
};

export default ChatInterface;
```

## 🔒 Security Considerations

### JWT Token Management

```javascript
// Token interceptor for API requests
import axios from 'axios';

const api = axios.create({
  baseURL: 'https://staykaru-backend-60ed08adb2a7.herokuapp.com/api'
});

api.interceptors.request.use(
  config => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  error => Promise.reject(error)
);

// Token refresh logic
api.interceptors.response.use(
  response => response,
  async error => {
    const originalRequest = error.config;
    
    if (error.response.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        const refreshToken = localStorage.getItem('refreshToken');
        const res = await axios.post(
          'https://staykaru-backend-60ed08adb2a7.herokuapp.com/api/auth/refresh',
          { refreshToken }
        );
        
        localStorage.setItem('token', res.data.token);
        
        return api(originalRequest);
      } catch (err) {
        // Redirect to login if refresh fails
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        window.location.href = '/login';
        return Promise.reject(error);
      }
    }
    
    return Promise.reject(error);
  }
);

export default api;
```

### Role-based Access Control

```javascript
import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';

const ProtectedRoute = ({ allowedRoles }) => {
  const user = JSON.parse(localStorage.getItem('user'));
  
  if (!user) {
    // Not logged in
    return <Navigate to="/login" />;
  }
  
  if (!allowedRoles.includes(user.role)) {
    // Not authorized
    return <Navigate to="/unauthorized" />;
  }
  
  // Authorized
  return <Outlet />;
};

// Usage in routes
// <Route element={<ProtectedRoute allowedRoles={['student']} />}>
//   <Route path="/student/dashboard" element={<StudentDashboard />} />
// </Route>
```

## 🌍 Internationalization

### i18next Configuration

```javascript
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import enTranslations from './locales/en.json';
import urTranslations from './locales/ur.json';

i18n
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: enTranslations },
      ur: { translation: urTranslations }
    },
    lng: 'en',
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false
    }
  });

export default i18n;
```

### Language Switcher

```jsx
import React from 'react';
import { useTranslation } from 'react-i18next';

const LanguageSwitcher = () => {
  const { i18n } = useTranslation();

  const changeLanguage = (language) => {
    i18n.changeLanguage(language);
  };

  return (
    <div className="language-switcher">
      <button 
        className={i18n.language === 'en' ? 'active' : ''} 
        onClick={() => changeLanguage('en')}
      >
        English
      </button>
      <button 
        className={i18n.language === 'ur' ? 'active' : ''} 
        onClick={() => changeLanguage('ur')}
      >
        اردو
      </button>
    </div>
  );
};

export default LanguageSwitcher;
```

## 📱 Mobile Responsiveness

### Media Queries Structure

```css
/* Base styles for all devices */
.property-card {
  width: 100%;
  margin-bottom: 20px;
  /* Common styles */
}

/* Small devices (phones) */
@media (min-width: 320px) and (max-width: 480px) {
  .property-card {
    flex-direction: column;
  }
  
  /* Other mobile-specific styles */
}

/* Medium devices (tablets) */
@media (min-width: 481px) and (max-width: 768px) {
  .property-card {
    flex-direction: row;
  }
  
  /* Other tablet-specific styles */
}

/* Large devices (laptops/desktops) */
@media (min-width: 769px) {
  .property-card {
    display: grid;
    grid-template-columns: 40% 60%;
  }
  
  /* Other desktop-specific styles */
}
```

## 📊 Analytics Integration

### Google Analytics Setup

```jsx
import React, { useEffect } from 'react';
import ReactGA from 'react-ga';

const initGA = () => {
  ReactGA.initialize('UA-XXXXXXXX-X'); // Replace with your tracking ID
};

const logPageView = () => {
  ReactGA.set({ page: window.location.pathname });
  ReactGA.pageview(window.location.pathname);
};

const Analytics = ({ children }) => {
  useEffect(() => {
    initGA();
    logPageView();
    
    // Track page changes
    const handleLocationChange = () => {
      logPageView();
    };

    // Listen for route changes
    window.addEventListener('popstate', handleLocationChange);

    return () => {
      window.removeEventListener('popstate', handleLocationChange);
    };
  }, []);

  return <>{children}</>;
};

export default Analytics;
```

### Event Tracking

```javascript
import ReactGA from 'react-ga';

// Track user interactions
export const trackEvent = (category, action, label) => {
  ReactGA.event({
    category,
    action,
    label
  });
};

// Example usage
// trackEvent('Accommodation', 'View', propertyId);
// trackEvent('Food', 'Order', restaurantId);
```

## 🚀 Deployment Strategy

### Production Build

```bash
# Create optimized build
npm run build

# Test production build locally
npx serve -s build
```

### Recommended Hosting

- **Vercel** - Optimal for Next.js applications
- **Netlify** - Good for React applications with serverless functions
- **AWS Amplify** - Enterprise-grade hosting with CI/CD

### Environment Variables

```
# Public variables
REACT_APP_API_URL=https://staykaru-backend-60ed08adb2a7.herokuapp.com/api
REACT_APP_WEBSOCKET_URL=wss://staykaru-backend-60ed08adb2a7.herokuapp.com
REACT_APP_GOOGLE_MAPS_API_KEY=your_maps_api_key

# Private variables (for server-side code only)
API_SECRET=your_api_secret
```

## 🧪 Testing Strategy

### Component Testing

```jsx
import { render, screen, fireEvent } from '@testing-library/react';
import PropertyCard from './PropertyCard';

const mockProperty = {
  _id: '1',
  title: 'Modern Apartment',
  price: 15000,
  images: ['image-url.jpg'],
  city: { name: 'Islamabad', state: 'ICT' },
  averageRating: 4.5,
  bedrooms: 2,
  bathrooms: 1,
  area: 1200
};

test('renders property card with correct data', () => {
  render(<PropertyCard property={mockProperty} />);
  
  expect(screen.getByText('Modern Apartment')).toBeInTheDocument();
  expect(screen.getByText('PKR 15000')).toBeInTheDocument();
  expect(screen.getByText('Islamabad, ICT')).toBeInTheDocument();
  expect(screen.getByText('2 Bed')).toBeInTheDocument();
  expect(screen.getByText('1 Bath')).toBeInTheDocument();
  expect(screen.getByText('1200 sq.ft')).toBeInTheDocument();
  expect(screen.getByText('4.5')).toBeInTheDocument();
});

test('navigates to property details when view button is clicked', () => {
  render(<PropertyCard property={mockProperty} />);
  
  const viewButton = screen.getByText('View Details');
  fireEvent.click(viewButton);
  
  // Add assertions for navigation
});
```

### Integration Testing

```jsx
// Test authentication flow
// Test booking creation process
// Test food ordering process
```

### E2E Testing

```javascript
// Using Cypress for E2E testing
describe('Student Flow', () => {
  beforeEach(() => {
    cy.visit('/login');
    cy.get('#email').type('student@staykaru.com');
    cy.get('#password').type('password123');
    cy.get('button[type="submit"]').click();
    cy.url().should('include', '/student/dashboard');
  });

  it('can browse accommodations', () => {
    cy.get('[data-cy="accommodation-link"]').click();
    cy.url().should('include', '/accommodations');
    cy.get('[data-cy="property-card"]').should('have.length.at.least', 1);
  });

  it('can view accommodation details', () => {
    cy.get('[data-cy="accommodation-link"]').click();
    cy.get('[data-cy="property-card"]').first().click();
    cy.url().should('include', '/property/');
    cy.get('[data-cy="property-title"]').should('be.visible');
    cy.get('[data-cy="property-price"]').should('be.visible');
  });

  // More test cases...
});
```

## 📝 Final Checklist

Before launching, ensure:

1. **Authentication**
   - [ ] Login works for all user types
   - [ ] Registration includes all required fields
   - [ ] Password reset flow functions correctly
   - [ ] Token refresh mechanism works properly

2. **Student Features**
   - [ ] Accommodation search and filtering works
   - [ ] Food service search and filtering works
   - [ ] Booking creation process is complete
   - [ ] Food ordering process is complete
   - [ ] Review submission works properly
   - [ ] Map displays correct locations

3. **Landlord Features**
   - [ ] Property management features work
   - [ ] Booking management interface is complete
   - [ ] Analytics dashboard displays correct data
   - [ ] Communication system with students works

4. **Food Provider Features**
   - [ ] Restaurant management features work
   - [ ] Menu management interface is complete
   - [ ] Order processing workflow functions correctly
   - [ ] Analytics dashboard displays correct data

5. **Admin Features**
   - [ ] User management interface works
   - [ ] Content moderation tools function correctly
   - [ ] System-wide analytics display correct data
   - [ ] Configuration management tools work

6. **Technical Requirements**
   - [ ] Responsive on all device sizes
   - [ ] Accessible according to WCAG 2.1 AA
   - [ ] Performance optimized (Lighthouse score >90)
   - [ ] SEO optimized
   - [ ] Analytics properly implemented
   - [ ] Error handling for all API requests
   - [ ] Loading states for all async operations

## 🌟 Support Resources

### Official Documentation

- [Backend API Documentation](https://staykaru-backend-60ed08adb2a7.herokuapp.com/api)
- [Database Schema Diagram](https://staykaru-docs.s3.amazonaws.com/schema.pdf) (optional)
- [Wireframes & Mockups](https://staykaru-docs.s3.amazonaws.com/mockups.pdf) (optional)

### Contact Information

- **Backend Support:** backend-team@staykaru.pk
- **Design Support:** design-team@staykaru.pk
- **Project Manager:** pm@staykaru.pk

---

## 🎉 Let's Make StayKaru Great!

This comprehensive guide provides all the information needed to build a world-class frontend for StayKaru. The backend is 100% production-ready and waiting for your frontend integration. Follow these guidelines to ensure consistency, performance, and a great user experience for all StayKaru users in Pakistan.

Happy coding! 🚀
