# API Testing Guide

## Overview

This guide covers testing all ServiceHub business APIs for services, bookings, and reviews.

## Setup

### 1. Import Postman Collection

1. Open Postman
2. Click "Import" and select `postman-collection.json`
3. Update environment variables:
   - `base_url`: http://localhost:3000
   - `user_token`: Get by signing in as a user
   - `provider_token`: Get by signing in as a provider

### 2. Seed Database

Run the seeding script to populate test data:

\`\`\`bash
npm run seed
# or execute scripts/01-seed-data.sql directly in your database UI
\`\`\`

### 3. Run Jest Tests

\`\`\`bash
npm test
npm test -- --watch
\`\`\`

## Manual Testing Checklist

### Services API

- [ ] **List Services**
  - `GET /api/services`
  - Filter by category: `?category=plumbing`
  - Filter by city: `?city=San Francisco`
  - Filter by minimum rating: `?minRating=4`
  - Expected: 200 OK with array of services

- [ ] **Get Service Details**
  - `GET /api/services/1`
  - Expected: 200 OK with full service data and reviews array

- [ ] **Create Service (Provider)**
  - `POST /api/services` with auth token
  - Body: Valid service data with title, description, category, etc.
  - Expected: 201 Created with new service ID

- [ ] **Create Service (User fails)**
  - `POST /api/services` with user token
  - Expected: 403 Forbidden

- [ ] **Update Service**
  - `PUT /api/services/1` with provider auth
  - Body: Partial update (e.g., just price)
  - Expected: 200 OK with updated service

- [ ] **Delete Service**
  - `DELETE /api/services/1` with provider auth
  - Expected: 200 OK

### Bookings API

- [ ] **Create Booking**
  - `POST /api/bookings` with user auth
  - Body: `{ serviceId: 1, datetime: "2025-11-10T14:00:00Z", quantity: 1 }`
  - Expected: 201 Created with booking ID

- [ ] **Availability Check**
  - Create two bookings at same time slot
  - Second should fail with 409 Conflict
  - Expected: Error message "This time slot is not available"

- [ ] **Get User Bookings**
  - `GET /api/bookings?userId=1` with user auth
  - Expected: 200 OK with user's bookings

- [ ] **Get Provider Bookings**
  - `GET /api/bookings?providerId=3` with provider auth
  - Expected: 200 OK with their service bookings

- [ ] **Update Booking (Confirm)**
  - `PATCH /api/bookings/1` with provider auth
  - Body: `{ status: "confirmed" }`
  - Expected: 200 OK

- [ ] **Update Booking (User Cancel)**
  - `PATCH /api/bookings/1` with user auth
  - Body: `{ status: "cancelled" }`
  - Expected: 200 OK

### Reviews API

- [ ] **Create Review (Success)**
  - First complete a booking (change status to "completed")
  - `POST /api/reviews` with user auth
  - Body: `{ bookingId: 1, rating: 5, comment: "Great service!" }`
  - Expected: 201 Created

- [ ] **Create Review (Non-Completed Fails)**
  - Try to review pending booking
  - Expected: 400 Bad Request "Can only review completed bookings"

- [ ] **Create Review (Duplicate Fails)**
  - Try to create second review for same booking
  - Expected: 400 Bad Request "Review already exists"

- [ ] **Get Service Reviews**
  - `GET /api/reviews?serviceId=1`
  - Expected: 200 OK with reviews array

- [ ] **Delete Review**
  - `DELETE /api/reviews/1` with review owner auth
  - Expected: 200 OK

## Error Handling Tests

- [ ] Invalid service ID (non-numeric): 400 Bad Request
- [ ] Non-existent service ID: 404 Not Found
- [ ] Unauthorized operations: 403 Forbidden
- [ ] Invalid JWT tokens: 401 Unauthorized
- [ ] Missing required fields: 400 Bad Request with validation errors

## Performance Tests

- [ ] List services with 1000+ records: Should complete < 1s
- [ ] Complex filters (category + city + minRating): Should complete < 1s
- [ ] Get service with 100+ reviews: Should complete < 500ms

## Sample Requests

### Create Service (Provider)

\`\`\`bash
curl -X POST http://localhost:3000/api/services \
  -H "Authorization: Bearer YOUR_PROVIDER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Professional Plumbing",
    "description": "Expert plumbing services for your home",
    "category": "plumbing",
    "city": "San Francisco",
    "price": 95,
    "locationLat": 37.7749,
    "locationLng": -122.4194
  }'
\`\`\`

### Create Booking (User)

\`\`\`bash
curl -X POST http://localhost:3000/api/bookings \
  -H "Authorization: Bearer YOUR_USER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "serviceId": 1,
    "datetime": "2025-11-10T14:00:00Z",
    "quantity": 1
  }'
\`\`\`

### Create Review (User - Completed Booking)

\`\`\`bash
curl -X POST http://localhost:3000/api/reviews \
  -H "Authorization: Bearer YOUR_USER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "bookingId": 1,
    "rating": 5,
    "comment": "Excellent service! Very professional."
  }'
\`\`\`

## Key Testing Points

1. **Validation**: All endpoints validate input per Zod schemas
2. **Authorization**: Auth middleware enforces role-based access
3. **Availability**: Booking checks for conflicts before creating
4. **Integrity**: Reviews only created for completed bookings
5. **Ownership**: Users can only modify their own data
6. **Filters**: Service list supports multiple concurrent filters
