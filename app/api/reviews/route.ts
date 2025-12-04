import { type NextRequest, NextResponse } from "next/server"
import { query } from "@/lib/db"
import { reviewCreateSchema } from "@/lib/validation"
import { authMiddleware } from "@/lib/auth-middleware"

// POST /api/reviews - Create review (only after booking completed)
export async function POST(req: NextRequest) {
  return authMiddleware(async (req, user) => {
    try {
      const body = await req.json()
      const validatedData = reviewCreateSchema.parse(body)

      // Verify booking exists and belongs to current user
      const bookingSql = `
        SELECT b.*, s.id as "serviceId"
        FROM "Booking" b
        JOIN "Service" s ON b."serviceId" = s.id
        WHERE b.id = $1 AND b."userId" = $2
      `

      const bookings = await query(bookingSql, [validatedData.bookingId, user.id])

      if (bookings.length === 0) {
        return NextResponse.json({ error: "Booking not found" }, { status: 404 })
      }

      const booking = bookings[0]

      // Ensure booking is completed
      if (booking.status !== "completed") {
        return NextResponse.json({ error: "Can only review completed bookings" }, { status: 400 })
      }

      // Check if review already exists for this booking
      const existingSql = `SELECT id FROM "Review" WHERE "bookingId" = $1`
      const existing = await query(existingSql, [validatedData.bookingId])

      if (existing.length > 0) {
        return NextResponse.json({ error: "Review already exists for this booking" }, { status: 400 })
      }

      // Create review
      const createSql = `
        INSERT INTO "Review" (
          "userId", "bookingId", "serviceId", rating, comment, "createdAt", "updatedAt"
        ) VALUES ($1, $2, $3, $4, $5, NOW(), NOW())
        RETURNING *
      `

      const params = [user.id, validatedData.bookingId, booking.serviceId, validatedData.rating, validatedData.comment]
      const result = await query(createSql, params)

      return NextResponse.json(result[0], { status: 201 })
    } catch (error) {
      console.error("[v0] POST /api/reviews error:", error)
      return NextResponse.json(
        { error: error instanceof Error ? error.message : "Failed to create review" },
        { status: 400 },
      )
    }
  })(req)
}

// GET /api/reviews - Get all reviews (for admin/analytics)
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const serviceId = searchParams.get("serviceId")
    const limit = Number.parseInt(searchParams.get("limit") || "50")
    const offset = Number.parseInt(searchParams.get("offset") || "0")

    let sql = `
      SELECT 
        r.*,
        u.name as "userName",
        s.title as "serviceTitle",
        s.id as "serviceId"
      FROM "Review" r
      JOIN "User" u ON r."userId" = u.id
      JOIN "Booking" b ON r."bookingId" = b.id
      JOIN "Service" s ON b."serviceId" = s.id
      WHERE 1=1
    `
    const params: any[] = []

    if (serviceId) {
      sql += ` AND s.id = $${params.length + 1}`
      params.push(Number.parseInt(serviceId))
    }

    sql += ` ORDER BY r."createdAt" DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`
    params.push(limit, offset)

    const reviews = await query(sql, params)

    return NextResponse.json({
      data: reviews,
      pagination: { limit, offset },
    })
  } catch (error) {
    console.error("[v0] GET /api/reviews error:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to fetch reviews" },
      { status: 500 },
    )
  }
}
