import { z } from "zod"

// Service Validation Schemas
export const serviceCreateSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters").max(100),
  description: z.string().min(10, "Description must be at least 10 characters").max(1000),
  category: z.enum(["plumbing", "electrical", "cleaning", "gardening", "tutoring", "other"]),
  city: z.string().min(2, "City must be at least 2 characters"),
  price: z.number().positive("Price must be positive"),
  locationLat: z.number().min(-90).max(90).optional(),
  locationLng: z.number().min(-180).max(180).optional(),
  images: z.array(z.string().url()).optional().default([]),
})

export const serviceUpdateSchema = serviceCreateSchema.partial()

export const serviceFilterSchema = z.object({
  category: z.string().optional(),
  city: z.string().optional(),
  minRating: z.number().min(0).max(5).optional(),
  maxPrice: z.number().positive().optional(),
  minPrice: z.number().positive().optional(),
  limit: z.number().min(1).max(100).default(20),
  offset: z.number().min(0).default(0),
})

// Booking Validation Schemas
export const bookingCreateSchema = z.object({
  serviceId: z.number().positive("Service ID must be positive"),
  datetime: z.string().datetime("Invalid datetime format"),
  quantity: z.number().min(1, "Quantity must be at least 1").default(1),
})

export const bookingUpdateSchema = z.object({
  status: z.enum(["pending", "confirmed", "cancelled", "completed"]),
})

// Review Validation Schemas
export const reviewCreateSchema = z.object({
  bookingId: z.number().positive("Booking ID must be positive"),
  rating: z.number().min(1, "Rating must be at least 1").max(5, "Rating cannot exceed 5"),
  comment: z.string().min(5, "Comment must be at least 5 characters").max(500),
})

// Type exports for use in API routes
export type ServiceCreate = z.infer<typeof serviceCreateSchema>
export type ServiceUpdate = z.infer<typeof serviceUpdateSchema>
export type ServiceFilter = z.infer<typeof serviceFilterSchema>
export type BookingCreate = z.infer<typeof bookingCreateSchema>
export type BookingUpdate = z.infer<typeof bookingUpdateSchema>
export type ReviewCreate = z.infer<typeof reviewCreateSchema>
