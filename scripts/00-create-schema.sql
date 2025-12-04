-- Database Schema for ServiceHub Platform
-- Creates tables for Users, Services, Bookings, and Reviews

-- Users table (both customers and providers)
CREATE TABLE IF NOT EXISTS "User" (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  role VARCHAR(50) NOT NULL CHECK (role IN ('user', 'provider')),
  phone VARCHAR(50),
  bio TEXT,
  specialties TEXT,
  "yearsExperience" INTEGER,
  "idProofUrl" TEXT,
  "bankAccount" VARCHAR(255),
  "bankRoutingNumber" VARCHAR(255),
  "verificationStatus" VARCHAR(50) DEFAULT 'pending',
  "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Services table
CREATE TABLE IF NOT EXISTS "Service" (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  category VARCHAR(100) NOT NULL,
  city VARCHAR(255) NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  "providerId" INTEGER NOT NULL REFERENCES "User"(id) ON DELETE CASCADE,
  "locationLat" DECIMAL(10, 8),
  "locationLng" DECIMAL(11, 8),
  images TEXT[] DEFAULT '{}',
  "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Bookings table
CREATE TABLE IF NOT EXISTS "Booking" (
  id SERIAL PRIMARY KEY,
  "userId" INTEGER NOT NULL REFERENCES "User"(id) ON DELETE CASCADE,
  "serviceId" INTEGER NOT NULL REFERENCES "Service"(id) ON DELETE CASCADE,
  datetime TIMESTAMP NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1,
  status VARCHAR(50) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'cancelled', 'completed')),
  "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Reviews table
CREATE TABLE IF NOT EXISTS "Review" (
  id SERIAL PRIMARY KEY,
  "userId" INTEGER NOT NULL REFERENCES "User"(id) ON DELETE CASCADE,
  "bookingId" INTEGER NOT NULL REFERENCES "Booking"(id) ON DELETE CASCADE,
  "serviceId" INTEGER NOT NULL REFERENCES "Service"(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW(),
  UNIQUE("bookingId")
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_service_provider ON "Service"("providerId");
CREATE INDEX IF NOT EXISTS idx_service_category ON "Service"(category);
CREATE INDEX IF NOT EXISTS idx_service_city ON "Service"(city);
CREATE INDEX IF NOT EXISTS idx_booking_user ON "Booking"("userId");
CREATE INDEX IF NOT EXISTS idx_booking_service ON "Booking"("serviceId");
CREATE INDEX IF NOT EXISTS idx_booking_datetime ON "Booking"(datetime);
CREATE INDEX IF NOT EXISTS idx_review_service ON "Review"("serviceId");
CREATE INDEX IF NOT EXISTS idx_user_email ON "User"(email);
