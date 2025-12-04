import { type NextRequest, NextResponse } from "next/server"
import { query } from "@/lib/db"
import { bookingUpdateSchema } from "@/lib/validation"
import { authMiddleware } from "@/lib/auth-middleware"

// PATCH /api/bookings/:id - Update booking status (provider only)
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  return authMiddleware(async (req, user) => {
    try {
      const { id } = await params
      const bookingId = Number.parseInt(id)

      if (isNaN(bookingId)) {
        return NextResponse.json({ error: "Invalid booking ID" }, { status: 400 })
      }

      // Get booking and verify provider ownership
      const bookingSql = `
        SELECT b.*, s."providerId"
        FROM "Booking" b
        JOIN "Service" s ON b."serviceId" = s.id
        WHERE b.id = $1
      `

      const bookings = await query(bookingSql, [bookingId])

      if (bookings.length === 0) {
        return NextResponse.json({ error: "Booking not found" }, { status: 404 })
      }

      const booking = bookings[0]

      // Only provider can update their bookings, or user can cancel their own
      if (user.role === "provider" && booking.providerId !== user.id) {
        return NextResponse.json({ error: "Cannot update booking for another provider" }, { status: 403 })
      }

      if (user.role === "user" && booking.userId !== user.id) {
        return NextResponse.json({ error: "Cannot update booking of another user" }, { status: 403 })
      }

      const body = await req.json()
      const validatedData = bookingUpdateSchema.parse(body)

      // Users can only cancel, providers can confirm/cancel
      if (user.role === "user" && validatedData.status !== "cancelled") {
        return NextResponse.json({ error: "Users can only cancel bookings" }, { status: 403 })
      }

      const updateSql = `
        UPDATE "Booking"
        SET status = $1, "updatedAt" = NOW()
        WHERE id = $2
        RETURNING *
      `

      const result = await query(updateSql, [validatedData.status, bookingId])
      return NextResponse.json(result[0])
    } catch (error) {
      console.error("[v0] PATCH /api/bookings/:id error:", error)
      return NextResponse.json(
        { error: error instanceof Error ? error.message : "Failed to update booking" },
        { status: 400 },
      )
    }
  })(req)
}

// GET /api/bookings/:id - Get single booking details
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  return authMiddleware(async (req, user) => {
    try {
      const { id } = await params
      const bookingId = Number.parseInt(id)

      if (isNaN(bookingId)) {
        return NextResponse.json({ error: "Invalid booking ID" }, { status: 400 })
      }

      const sql = `
        SELECT 
          b.*,
          s.title as "serviceTitle",
          s.price,
          u.name as "userName",
          u.email as "userEmail",
          p.name as "providerName"
        FROM "Booking" b
        JOIN "Service" s ON b."serviceId" = s.id
        JOIN "User" u ON b."userId" = u.id
        JOIN "User" p ON s."providerId" = p.id
        WHERE b.id = $1
      `

      const bookings = await query(sql, [bookingId])

      if (bookings.length === 0) {
        return NextResponse.json({ error: "Booking not found" }, { status: 404 })
      }

      const booking = bookings[0]

      // Verify authorization
      if (user.id !== booking.userId && user.id !== booking.providerId) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
      }

      return NextResponse.json(booking)
    } catch (error) {
      console.error("[v0] GET /api/bookings/:id error:", error)
      return NextResponse.json(
        { error: error instanceof Error ? error.message : "Failed to fetch booking" },
        { status: 500 },
      )
    }
  })(req)
}
