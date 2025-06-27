# Landlord Module: Endpoints and Test Cases

## Authentication
- **POST /api/auth/register**
  - Register as landlord (role: 'landlord')
- **POST /api/auth/login**
  - Login as landlord

## Profile
- **GET /api/users/landlord/profile**
  - Get landlord profile
- **PUT /api/users/profile**
  - Update profile
- **PUT /api/users/change-password**
  - Change password
- **POST /api/users/landlord/fcm-token**
  - Update FCM token

## Accommodation Management
- **POST /api/accommodations**
  - Create accommodation
- **GET /api/accommodations/landlord**
  - List landlord's accommodations
- **GET /api/accommodations/:id**
  - Get accommodation details
- **PUT /api/accommodations/:id**
  - Update accommodation
- **DELETE /api/accommodations/:id**
  - Delete accommodation
- **POST /api/accommodations/search**
  - Search accommodations

## Dashboard & Analytics
- **GET /api/accommodations/landlord/dashboard**
  - Landlord dashboard overview
- **GET /api/accommodations/landlord/activities**
  - Landlord activity log
- **GET /api/dashboard/landlord/accommodations**
  - Dashboard: accommodations
- **GET /api/dashboard/landlord/revenue**
  - Dashboard: revenue analytics

## Bookings
- **GET /api/users/landlord/bookings**
  - Bookings for landlord's accommodations
- **GET /api/bookings/landlord**
  - Bookings for landlord (Booking Controller)
- **GET /api/bookings/landlord/stats**
  - Booking statistics
- **GET /api/bookings/landlord/revenue**
  - Revenue analytics

## Admin Endpoints (for landlord management)
- **GET /api/admin/accommodations**
  - All accommodations (admin)
- **GET /api/admin/accommodations/statistics**
  - Accommodation stats (admin)
- **GET /api/accommodations/admin/pending**
  - Pending accommodations (admin)

## Location (for city/country selection)
- **POST /api/location/countries**
  - Create country
- **POST /api/location/cities**
  - Create city
- **GET /api/location/countries**
  - List countries
- **GET /api/location/cities**
  - List cities

---

## Test Cases (Covered in Comprehensive Test)
- Register landlord
- Login landlord
- Create country/city
- Create accommodation
- List accommodations
- Get accommodation by ID
- Get landlord accommodations
- Get dashboard, activities
- Get landlord profile
- Get bookings (user/landlord)
- Get statistics, revenue
- Update accommodation
- Search accommodations
- Admin endpoints (list, stats, pending)
- Error handling: unauthorized, not found, invalid data, forbidden
- Delete accommodation, city, country

---

## Request/Response Example
- All requests require `Authorization: Bearer <token>`
- Use JSON for request/response bodies
- See DTOs for field names and types

---

*Use this file to map frontend actions to backend endpoints and ensure all flows are covered and tested.* 

## Updated API Base URL
https://staykaru-backend-60ed08adb2a7.herokuapp.com/api 