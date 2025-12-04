# Authentication System Setup Guide

## Overview
This authentication system provides secure user registration, login, and session management with role-based access control (RBAC) for users and service providers.

## Architecture

### Backend
- **JWT Tokens**: Token-based authentication with 7-day expiration
- **Password Hashing**: bcryptjs for secure password storage
- **Database**: Neon PostgreSQL with User table
- **API Routes**: RESTful endpoints at `/api/auth/`

### Frontend
- **Zustand Store**: Global auth state management
- **Axios Client**: HTTP client with automatic token injection
- **Protected Routes**: ProtectedRoute component for access control
- **LocalStorage**: Token persistence (with security note for production)

## API Endpoints

### POST `/api/auth/signup`
Register a new user.

**Request:**
\`\`\`json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "secure_password",
  "role": "user" | "provider",
  "phone": "+1 (555) 000-0000"
}
\`\`\`

**Response:**
\`\`\`json
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com",
    "role": "user",
    "phone": "+1 (555) 000-0000"
  }
}
\`\`\`

### POST `/api/auth/login`
Authenticate an existing user.

**Request:**
\`\`\`json
{
  "email": "john@example.com",
  "password": "secure_password"
}
\`\`\`

**Response:**
\`\`\`json
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com",
    "role": "user",
    "phone": "+1 (555) 000-0000"
  }
}
\`\`\`

### GET `/api/auth/me`
Get current user info (requires valid token).

**Headers:**
\`\`\`
Authorization: Bearer <token>
\`\`\`

**Response:**
\`\`\`json
{
  "user": {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com",
    "role": "user",
    "phone": "+1 (555) 000-0000",
    "createdAt": "2025-02-04T10:30:00Z",
    "updatedAt": "2025-02-04T10:30:00Z"
  }
}
\`\`\`

## Frontend Integration

### Using the Auth Store

\`\`\`tsx
import { useAuthStore } from '@/lib/store'

export function MyComponent() {
  const { user, isAuthenticated, login, logout } = useAuthStore()

  return (
    <>
      {isAuthenticated && <p>Welcome, {user?.name}!</p>}
    </>
  )
}
\`\`\`

### Protected Routes

\`\`\`tsx
import { ProtectedRoute } from '@/components/protected-route'

export default function Dashboard() {
  return (
    <ProtectedRoute requiredRole="provider">
      <h1>Provider Dashboard</h1>
    </ProtectedRoute>
  )
}
\`\`\`

## Testing the Auth Flow

### 1. Sign Up (New User)
- Navigate to `/signup`
- Fill in: name, email, password, phone, and role
- Click "Create Account"
- Should be redirected to services page or provider dashboard

### 2. Login
- Navigate to `/login`
- Enter email and password
- Click "Sign In"
- Should be redirected to services page

### 3. Protected Pages
- Try accessing `/profile`, `/bookings`, `/provider/dashboard` without logging in
- Should redirect to `/login`

### 4. Role-Based Access
- Login as "user" and try accessing `/provider/dashboard`
- Should redirect to `/login`
- Login as "provider" and access `/provider/dashboard`
- Should work correctly

### 5. Logout
- Click logout button in navbar
- Should be redirected to home page
- Token should be cleared from localStorage
- Protected pages should redirect to login

## Security Considerations

### Current Implementation
- Passwords hashed with bcryptjs (10 rounds)
- JWT tokens expire after 7 days
- Tokens stored in localStorage (see below for security note)

### Security Note: localStorage vs httpOnly Cookies
**Current Setup**: Tokens stored in localStorage for simplicity.

**Security Risk**: Vulnerable to XSS attacks if user input isn't sanitized.

**Production Recommendations**:
1. **Use httpOnly Cookies** (recommended)
   - Backend sets token in Set-Cookie header with httpOnly flag
   - Cookie automatically sent with requests
   - Cannot be accessed by JavaScript

2. **If using localStorage**:
   - Implement strict Content Security Policy (CSP)
   - Sanitize all user inputs
   - Use short token expiry (15-30 min) with refresh tokens
   - Set up refresh token rotation

3. **Additional Measures**:
   - Add CSRF protection
   - Implement rate limiting on auth endpoints
   - Log authentication events
   - Add email verification for signups

## Environment Variables

Ensure these are set in your Vercel project:

\`\`\`
NEON_DATABASE_URL=your_neon_database_url
JWT_SECRET=your_secure_random_string
\`\`\`

For development, these can be set in `.env.local` (not committed).

## Database Schema

The User table structure:

\`\`\`sql
CREATE TABLE "User" (
  id SERIAL PRIMARY KEY,
  name VARCHAR NOT NULL,
  email VARCHAR UNIQUE NOT NULL,
  password VARCHAR NOT NULL,
  role VARCHAR NOT NULL,
  phone VARCHAR NOT NULL,
  createdAt TIMESTAMP DEFAULT NOW(),
  updatedAt TIMESTAMP DEFAULT NOW()
);
\`\`\`

## Troubleshooting

### Issue: "Unauthorized" error on protected routes
- Check if token is stored in localStorage
- Verify token hasn't expired (7 days)
- Ensure Authorization header is sent correctly

### Issue: Login always fails
- Verify user exists in database
- Check password matches
- Ensure bcryptjs is installed

### Issue: Role-based protection not working
- Verify user.role is set correctly
- Check ProtectedRoute component is used
- Ensure requiredRole prop matches user.role

## Next Steps

1. **Email Verification**: Require email verification before account activation
2. **Password Reset**: Implement forgot password flow
3. **2FA**: Add two-factor authentication
4. **OAuth**: Add Google/GitHub login options
5. **Session Management**: Implement refresh tokens
