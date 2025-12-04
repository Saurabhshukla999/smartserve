# Provider Portal Documentation

## Overview

The ServiceHub provider portal enables service providers to manage their business, accept bookings, and earn revenue. This document outlines all provider features and workflow.

## Provider Features

### 1. Provider Onboarding & Profile Management
**Route:** `/provider/profile`
- Complete professional profile with bio and specialties
- Upload government ID for verification
- Add banking information for payouts
- Years of experience and certifications

**API Endpoints:**
- `GET /api/provider/profile` - Get provider profile
- `PUT /api/provider/profile` - Update profile with file uploads

### 2. Service Management
**Route:** `/provider/services` (list), `/provider/services/new` (create), `/provider/services/[id]/edit` (update)

**Features:**
- Create multiple services with titles, descriptions, categories, and pricing
- Upload service images (converted to base64 URLs)
- Set location and service areas (latitude/longitude)
- Edit existing services
- Delete services
- View service ratings and reviews

**API Endpoints:**
- `POST /api/services` - Create new service (FormData with images)
- `PUT /api/services/[id]` - Update service
- `DELETE /api/services/[id]` - Delete service
- `GET /api/services?providerId=X` - List provider's services

### 3. Provider Dashboard
**Route:** `/provider/dashboard`

**Displays:**
- Total bookings count
- Total earnings from completed bookings
- Number of regular clients
- Average rating across all services
- Upcoming bookings list
- Pending booking requests
- Quick action buttons for common tasks

**API Endpoints:**
- `GET /api/bookings?providerId=X` - Fetch provider's bookings
- `GET /api/provider/stats` - Get dashboard statistics

### 4. Bookings Management
**Route:** `/provider/bookings`

**Features:**
- View all bookings for your services
- Filter by status: All, Pending, Confirmed, Completed, Cancelled
- Approve/reject pending booking requests
- Mark confirmed bookings as completed
- View client details and booking time
- See pricing for each booking
- Responsive table layout (cards on mobile)

**API Endpoints:**
- `GET /api/bookings?providerId=X` - List provider's bookings
- `PATCH /api/bookings/[id]` - Update booking status

### 5. Notifications Center
**Location:** NavBar (top right for providers)

**Features:**
- Real-time notification badge showing unread count
- Dropdown list of recent notifications
- Notifications for:
  - New booking requests
  - Booking confirmations
  - Customer reviews
  - System announcements
- Mark notifications as read
- Delete notifications

**API Endpoints:**
- `GET /api/provider/notifications` - Get notifications
- `PATCH /api/provider/notifications/[id]` - Mark as read
- `DELETE /api/provider/notifications/[id]` - Delete notification

## User Flows

### Booking Workflow for Providers

1. **Customer books service**
   - New booking created with "pending" status
   - Provider receives notification

2. **Provider reviews booking**
   - Goes to `/provider/bookings`
   - Reviews customer details and booking time
   - Clicks "Approve" or "Reject"

3. **After approval**
   - Booking status changes to "confirmed"
   - Customer receives confirmation
   - Booking appears in "Upcoming Bookings" section

4. **After service completion**
   - Provider marks booking as "completed"
   - Customer can now leave a review
   - Provider earns revenue (calculated in stats)

### Service Creation Workflow

1. **Navigate to Services**
   - Go to `/provider/services`
   - Click "Add Service"

2. **Fill service details**
   - Title, category, price
   - Description (required 10+ characters)
   - Location and coordinates
   - Upload service images (auto-converted to URLs)

3. **Save and publish**
   - Service immediately available for booking
   - Appears in customer search results
   - Can be edited or deleted anytime

## Database Schema

### User Table (Provider)
- id, name, email, password, role ("provider"), phone
- bio, specialties, yearsExperience
- bankAccount, bankRoutingNumber (encrypted in production)
- idProofUrl, verificationStatus
- createdAt, updatedAt

### Service Table
- id, title, description, category
- price, city, locationLat, locationLng
- images (array of URLs)
- providerId (foreign key to User)
- createdAt, updatedAt

### Booking Table
- id, userId, serviceId, datetime
- status ("pending", "confirmed", "completed", "cancelled")
- createdAt, updatedAt

### Review Table
- id, userId, bookingId, rating (1-5)
- comment, createdAt, updatedAt

## API Response Format

### Success Response
\`\`\`json
{
  "data": {...},
  "message": "Success"
}
\`\`\`

### Error Response
\`\`\`json
{
  "error": "Error message",
  "status": 400
}
\`\`\`

## Authentication

All provider endpoints require:
1. Valid JWT token in Authorization header
2. User role must be "provider"
3. Ownership verification for updates/deletes

## Image Upload

Services support multiple image uploads:
- **Format:** JPEG, PNG
- **Size:** Up to 10MB per image
- **Conversion:** Images converted to base64 data URLs (production: use Cloudinary)
- **Storage:** Stored in Service.images array

## Earnings Calculation

Provider earnings are calculated as:
- Sum of service prices for all "completed" bookings
- Displayed in dashboard stats
- Endpoint: `GET /api/provider/stats`

## Testing the Provider Portal

### Manual Testing Checklist

1. **Authentication**
   - [ ] Sign up as provider with all required fields
   - [ ] Login as provider
   - [ ] Verify token stored in localStorage
   - [ ] Logout clears token

2. **Profile Management**
   - [ ] Navigate to profile page
   - [ ] Update bio and specialties
   - [ ] Upload ID proof
   - [ ] Enter banking information
   - [ ] Save changes successfully

3. **Service Management**
   - [ ] Create new service with images
   - [ ] Upload multiple images
   - [ ] Edit existing service
   - [ ] Delete service with confirmation
   - [ ] Services appear in search

4. **Dashboard**
   - [ ] View all dashboard stats
   - [ ] Stats update when bookings change
   - [ ] Pending requests section visible
   - [ ] Upcoming bookings displayed

5. **Bookings**
   - [ ] Filter bookings by status
   - [ ] Approve pending booking
   - [ ] Reject booking
   - [ ] Mark as completed
   - [ ] View client details

6. **Notifications**
   - [ ] Notifications dropdown opens
   - [ ] Badge shows unread count
   - [ ] Mark notification as read
   - [ ] Delete notification

## Production Considerations

1. **Image Upload**
   - Replace base64 with Cloudinary or AWS S3
   - Implement image optimization and compression

2. **Banking Information**
   - Encrypt bank details at rest
   - Use tokenization for payments
   - Integrate with Stripe Connect

3. **ID Verification**
   - Implement automated ID verification service
   - Store verification status and expiry
   - Add reverification workflow

4. **Earnings Payouts**
   - Implement monthly payout cycle
   - Add transaction history
   - Implement tax reporting

5. **Security**
   - Use httpOnly cookies instead of localStorage for tokens
   - Add rate limiting on API endpoints
   - Implement CSRF protection
