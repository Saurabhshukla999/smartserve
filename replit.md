# ServiceHub - Trusted Local Service Network

## Overview

ServiceHub is a Next.js-based service marketplace platform that connects users with trusted service providers from their personal network. The application enables users to discover and book local services while allowing providers to manage their offerings, accept bookings, and earn revenue. Built with Next.js 14, TypeScript, and Neon PostgreSQL, it features role-based access control, real-time booking management, and a comprehensive review system.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Framework**: Next.js 14 with App Router
- Server-side rendering with client-side interactivity
- File-based routing in `/app` directory
- React Server Components for optimal performance

**State Management**: Zustand
- Global authentication state (`useAuthStore`)
- Toast notification system (`useToastStore`)
- Client-side state persistence via localStorage for auth tokens

**UI Framework**: Radix UI + Tailwind CSS
- Component library using shadcn/ui conventions
- Custom design system with CSS variables for theming
- Responsive design with mobile-first approach
- Dark mode support via CSS custom properties

**Form Handling**: React Hook Form + Zod
- Schema validation for services, bookings, and reviews
- Type-safe form inputs with TypeScript inference

**Routing & Protection**:
- `ProtectedRoute` component enforces authentication
- Role-based routing (user vs provider paths)
- Automatic redirects based on user role after login

### Backend Architecture

**API Structure**: Next.js API Routes
- RESTful endpoints under `/app/api/`
- Organized by domain: `/auth`, `/services`, `/bookings`, `/reviews`, `/provider`

**Authentication System**:
- JWT-based authentication with 7-day token expiration
- bcryptjs for password hashing (10 salt rounds)
- Token stored in localStorage (client) and validated via Authorization header
- Middleware: `authMiddleware` and `roleMiddleware` for route protection
- `/api/auth/signup`, `/api/auth/login`, `/api/auth/me` endpoints

**Authorization**:
- Role-based access control (RBAC): "user" and "provider" roles
- Provider-only routes require role verification
- Token verification on every protected API request

**Data Validation**:
- Zod schemas in `/lib/validation.ts`
- Request validation for services, bookings, and reviews
- Type-safe API contracts with TypeScript

**File Upload Handling**:
- Multipart form data support for service images and provider ID proofs
- Base64 encoding for image storage in database
- Images stored as data URLs in service and provider records

### Database Architecture

**Database**: Neon PostgreSQL (Serverless)
- Connection via `@neondatabase/serverless`
- Query interface abstraction in `/lib/db.ts`
- Transaction support with automatic rollback

**Schema Structure** (inferred from API usage):

**Users Table**:
- Fields: id, name, email, password (hashed), role, phone, bio, specialties, yearsExperience, idProofUrl, bankAccount, bankRoutingNumber
- Supports both user and provider profiles

**Services Table**:
- Fields: id, providerId, title, description, category, city, price, locationLat, locationLng, images (array/JSON)
- Categories: plumbing, electrical, cleaning, gardening, tutoring, other
- Links to provider user record

**Bookings Table**:
- Fields: id, userId, serviceId, datetime, status, quantity
- Status values: pending, confirmed, cancelled, completed
- Foreign keys to users and services

**Reviews Table**:
- Fields: id, bookingId, serviceId, userId, rating (1-5), comment, createdAt
- Constraints: One review per booking, only for completed bookings
- Used to calculate service average ratings

**Query Patterns**:
- Parameterized queries to prevent SQL injection
- JOIN queries for service listings with provider info and ratings
- Aggregate queries for dashboard statistics (total bookings, earnings, average ratings)

### External Dependencies

**Core Framework**:
- Next.js 14 (App Router, Server Components)
- React 18
- TypeScript

**Database**:
- Neon PostgreSQL (serverless Postgres)
- `@neondatabase/serverless` client

**Authentication & Security**:
- jsonwebtoken (JWT generation/verification)
- bcryptjs (password hashing)

**UI Components**:
- Radix UI primitives (Dialog, Dropdown, Popover, etc.)
- Tailwind CSS
- shadcn/ui component patterns
- Lucide React (icon library)

**Form & Validation**:
- react-hook-form
- zod
- @hookform/resolvers

**HTTP Client**:
- Axios (with interceptors for token injection and 401 handling)

**Development & Testing**:
- Jest (unit and integration tests in `__tests__` directory)
- ESLint

**Utilities**:
- date-fns (date formatting)
- clsx + tailwind-merge (className utilities)
- immer (immutable state updates)

**Optional Integrations** (from documentation):
- Postman for API testing (collection included)
- Google Maps (placeholder implementation for service locations)

### Key Design Decisions

**Authentication Choice**: JWT tokens were chosen for stateless authentication, enabling easy horizontal scaling. Tokens are stored in localStorage with a note that httpOnly cookies would be more secure for production.

**Database Choice**: Neon PostgreSQL serverless was selected for:
- Automatic scaling
- Branching support for development
- Standard SQL compatibility
- Cost-effectiveness for variable workloads

**File Storage Strategy**: Images and documents are base64-encoded and stored directly in the database rather than using object storage. This simplifies deployment but may need refactoring for high-volume usage.

**Role-Based Routing**: Separate route hierarchies for users (`/services`, `/bookings`, `/profile`) and providers (`/provider/dashboard`, `/provider/services`) reduce complexity and enable role-specific UI/UX.

**State Management**: Zustand was chosen over Redux for simpler API and smaller bundle size. Authentication state is global while component state remains local.

**Form Validation**: Zod provides runtime type validation matching TypeScript types, ensuring type safety across the full stack from API to UI.