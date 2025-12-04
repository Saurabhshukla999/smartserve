-- Seed data for testing (run after migrations)
-- This script populates the database with test users, services, bookings, and reviews

-- Insert test users (2 customers, 2 providers)
INSERT INTO "User" (name, email, password, phone, role, "createdAt", "updatedAt") VALUES
  ('John Customer', 'john@example.com', '$2b$10$samplehashedpassword1', '555-0001', 'user', NOW(), NOW()),
  ('Jane Customer', 'jane@example.com', '$2b$10$samplehashedpassword2', '555-0002', 'user', NOW(), NOW()),
  ('Mike Plumber', 'mike@example.com', '$2b$10$samplehashedpassword3', '555-0003', 'provider', NOW(), NOW()),
  ('Sarah Cleaner', 'sarah@example.com', '$2b$10$samplehashedpassword4', '555-0004', 'provider', NOW(), NOW()),
  ('Bob Electrician', 'bob@example.com', '$2b$10$samplehashedpassword5', '555-0005', 'provider', NOW(), NOW())
ON CONFLICT DO NOTHING;

-- Insert sample services
INSERT INTO "Service" (
  title, description, category, city, price, "providerId", 
  "locationLat", "locationLng", images, "createdAt", "updatedAt"
) VALUES
  (
    'Professional Plumbing Services',
    'Expert plumbing repairs and installations. Available 24/7 for emergencies. Licensed and insured.',
    'plumbing',
    'San Francisco',
    85.00,
    (SELECT id FROM "User" WHERE email = 'mike@example.com'),
    37.7749,
    -122.4194,
    ARRAY['https://example.com/plumbing1.jpg'],
    NOW(),
    NOW()
  ),
  (
    'House Cleaning Service',
    'Thorough house cleaning with eco-friendly products. Move-in/move-out cleaning available.',
    'cleaning',
    'San Francisco',
    150.00,
    (SELECT id FROM "User" WHERE email = 'sarah@example.com'),
    37.7749,
    -122.4194,
    ARRAY['https://example.com/cleaning1.jpg'],
    NOW(),
    NOW()
  ),
  (
    'Electrical Repairs & Installations',
    'Residential electrical work, panel upgrades, rewiring. Code compliant and safe.',
    'electrical',
    'Oakland',
    95.00,
    (SELECT id FROM "User" WHERE email = 'bob@example.com'),
    37.8044,
    -122.2712,
    ARRAY['https://example.com/electrical1.jpg'],
    NOW(),
    NOW()
  ),
  (
    'Garden Landscaping',
    'Design and maintenance of outdoor gardens. Tree trimming, planting, and lawn care.',
    'gardening',
    'San Francisco',
    120.00,
    (SELECT id FROM "User" WHERE email = 'mike@example.com'),
    37.7749,
    -122.4194,
    ARRAY['https://example.com/gardening1.jpg'],
    NOW(),
    NOW()
  )
ON CONFLICT DO NOTHING;

-- Insert sample bookings (various statuses)
INSERT INTO "Booking" (
  "userId", "serviceId", datetime, quantity, status, "createdAt", "updatedAt"
) VALUES
  (
    (SELECT id FROM "User" WHERE email = 'john@example.com'),
    (SELECT id FROM "Service" WHERE title = 'Professional Plumbing Services'),
    NOW() + INTERVAL '2 days',
    1,
    'confirmed',
    NOW() - INTERVAL '1 day',
    NOW() - INTERVAL '1 day'
  ),
  (
    (SELECT id FROM "User" WHERE email = 'jane@example.com'),
    (SELECT id FROM "Service" WHERE title = 'House Cleaning Service'),
    NOW() + INTERVAL '5 days',
    2,
    'pending',
    NOW(),
    NOW()
  ),
  (
    (SELECT id FROM "User" WHERE email = 'john@example.com'),
    (SELECT id FROM "Service" WHERE title = 'Electrical Repairs & Installations'),
    NOW() - INTERVAL '3 days',
    1,
    'completed',
    NOW() - INTERVAL '5 days',
    NOW() - INTERVAL '3 days'
  ),
  (
    (SELECT id FROM "User" WHERE email = 'jane@example.com'),
    (SELECT id FROM "Service" WHERE title = 'Garden Landscaping'),
    NOW() + INTERVAL '1 day',
    1,
    'cancelled',
    NOW() - INTERVAL '2 days',
    NOW() - INTERVAL '1 day'
  )
ON CONFLICT DO NOTHING;

-- Insert sample reviews (only for completed bookings)
INSERT INTO "Review" (
  "userId", "bookingId", rating, comment, "createdAt", "updatedAt"
) VALUES
  (
    (SELECT id FROM "User" WHERE email = 'john@example.com'),
    (SELECT id FROM "Booking" WHERE status = 'completed' LIMIT 1),
    5,
    'Excellent work! Bob was professional and thorough. Highly recommend!',
    NOW() - INTERVAL '2 days',
    NOW() - INTERVAL '2 days'
  )
ON CONFLICT DO NOTHING;
