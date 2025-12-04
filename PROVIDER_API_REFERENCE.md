# Provider API Reference

## Authentication

All endpoints require Bearer token in Authorization header:
\`\`\`
Authorization: Bearer <token>
\`\`\`

## Profile Endpoints

### GET /api/provider/profile
Get provider profile information.

**Response:**
\`\`\`json
{
  "profile": {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com",
    "role": "provider",
    "phone": "+1234567890",
    "bio": "Professional plumber...",
    "specialties": "Emergency repairs, Drain cleaning",
    "yearsExperience": 10,
    "idProofUrl": "data:image/jpeg;base64,...",
    "bankAccount": "***7890",
    "bankRoutingNumber": "***123"
  }
}
\`\`\`

### PUT /api/provider/profile
Update provider profile (multipart/form-data for file uploads).

**Request Body:**
\`\`\`
Content-Type: multipart/form-data

bio: "Updated bio"
specialties: "New specialties"
yearsExperience: 12
bankAccount: "1234567890"
bankRoutingNumber: "021000021"
idProof: <File>
\`\`\`

**Response:** Updated profile object

---

## Service Endpoints

### POST /api/services
Create new service (requires "provider" role).

**Request Body:**
\`\`\`
Content-Type: multipart/form-data

title: "Plumbing Repair"
description: "Professional plumbing repair services..."
category: "plumbing"
city: "New York, NY"
price: 85.50
locationLat: 40.7128
locationLng: -74.0060
images: [<File1>, <File2>, ...]
\`\`\`

**Response:**
\`\`\`json
{
  "id": 123,
  "title": "Plumbing Repair",
  "description": "...",
  "category": "plumbing",
  "price": 85.50,
  "city": "New York, NY",
  "providerId": 1,
  "images": ["data:image/jpeg;base64,..."],
  "createdAt": "2025-02-15T10:00:00Z"
}
\`\`\`

### PUT /api/services/:id
Update existing service (provider ownership required).

**Request Body:** Same as POST (all fields optional)

**Response:** Updated service object

### DELETE /api/services/:id
Delete service (provider ownership required).

**Response:**
\`\`\`json
{
  "message": "Service deleted successfully"
}
\`\`\`

### GET /api/services?providerId=X
Get all services by provider.

**Query Parameters:**
- `providerId` - Provider ID
- `limit` - Results per page (default: 20)
- `offset` - Pagination offset (default: 0)

**Response:**
\`\`\`json
{
  "data": [...services],
  "pagination": {
    "limit": 20,
    "offset": 0,
    "total": 5
  }
}
\`\`\`

---

## Bookings Endpoints

### GET /api/bookings?providerId=X
Get all bookings for provider's services.

**Query Parameters:**
- `providerId` - Provider ID (required for providers)

**Response:**
\`\`\`json
{
  "data": [
    {
      "id": 1,
      "serviceTitle": "Plumbing Repair",
      "userName": "Jane Smith",
      "userEmail": "jane@example.com",
      "datetime": "2025-02-20T14:00:00Z",
      "status": "pending",
      "price": 85.50
    }
  ]
}
\`\`\`

### PATCH /api/bookings/:id
Update booking status (provider or user).

**Request Body:**
\`\`\`json
{
  "status": "confirmed"
}
\`\`\`

**Status Options:**
- Providers can set: "confirmed", "cancelled", "completed"
- Users can only set: "cancelled"

**Response:** Updated booking object

---

## Statistics Endpoints

### GET /api/provider/stats
Get provider dashboard statistics.

**Response:**
\`\`\`json
{
  "totalEarnings": 2450.00,
  "averageRating": 4.9,
  "regularClients": 12
}
\`\`\`

---

## Notifications Endpoints

### GET /api/provider/notifications
Get provider notifications.

**Response:**
\`\`\`json
{
  "notifications": [
    {
      "id": "1",
      "title": "Booking Request: Plumbing Repair",
      "message": "Jane Smith wants to book your service",
      "type": "booking",
      "read": false,
      "createdAt": "2025-02-15T10:00:00Z"
    }
  ]
}
\`\`\`

### PATCH /api/provider/notifications/:id
Mark notification as read.

**Request Body:**
\`\`\`json
{
  "read": true
}
\`\`\`

### DELETE /api/provider/notifications/:id
Delete notification.

**Response:**
\`\`\`json
{
  "success": true
}
\`\`\`

---

## Error Codes

| Code | Meaning |
|------|---------|
| 400 | Bad Request - validation error |
| 401 | Unauthorized - missing/invalid token |
| 403 | Forbidden - insufficient permissions |
| 404 | Not Found - resource doesn't exist |
| 409 | Conflict - resource already exists |
| 500 | Server Error |

---

## File Upload Limits

- Maximum file size: 10MB
- Supported formats: JPEG, PNG, PDF
- Maximum files per request: 10
