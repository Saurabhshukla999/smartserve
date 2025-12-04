import { type NextRequest, NextResponse } from "next/server"
import { query, transaction } from "@/lib/db"
import { bookingCreateSchema } from "@/lib/validation"
import { authMiddleware } from "@/lib/auth-middleware"

// POST /api/bookings - Create booking with availability check
export async function POST(req: NextRequest) {
  return authMiddleware(async (req, user) => {
    try {
      const body = await req.json()
      const validatedData = bookingCreateSchema.parse(body)

      const result = await transaction(async (txQuery) => {
        const serviceSql = `SELECT id, "providerId" FROM "Service" WHERE id = $1 FOR UPDATE`
        const services = await txQuery(serviceSql, [validatedData.serviceId])

        if (services.length === 0) {
          throw new Error("Service not found")
        }

        const bookingWindowStart = new Date(validatedData.datetime)
        const bookingWindowEnd = new Date(new Date(validatedData.datetime).getTime() + 60 * 60 * 1000)

        const conflictSql = `
          SELECT id
          FROM "Booking"
          WHERE "serviceId" = $1 
          AND status IN ('pending', 'confirmed')
          AND datetime >= $2 AND datetime < $3
          FOR UPDATE
        `

        const conflicts = await txQuery(conflictSql, [
          validatedData.serviceId,
          bookingWindowStart.toISOString(),
          bookingWindowEnd.toISOString(),
        ])

        if (conflicts.length > 0) {
          throw new Error("SLOT_UNAVAILABLE")
        }

        const createSql = `
          INSERT INTO "Booking" (
            "userId", "serviceId", datetime, quantity, status, "createdAt", "updatedAt"
          ) VALUES ($1, $2, $3, $4, 'pending', NOW(), NOW())
          RETURNING *
        `

        const params = [user.id, validatedData.serviceId, validatedData.datetime, validatedData.quantity]
        const booking = await txQuery(createSql, params)

        return booking[0]
      })

      return NextResponse.json(result, { status: 201 })
    } catch (error) {
      console.error("[v0] POST /api/bookings error:", error)
      
      if (error instanceof Error && error.message === "SLOT_UNAVAILABLE") {
        return NextResponse.json({ error: "This time slot is not available", conflict: true }, { status: 409 })
      }
      
      if (error instanceof Error && error.message === "Service not found") {
        return NextResponse.json({ error: "Service not found" }, { status: 404 })
      }
      
      return NextResponse.json(
        { error: error instanceof Error ? error.message : "Failed to create booking" },
        { status: 400 },
      )
    }
  })(req)
}

// GET /api/bookings - Get bookings (user can see own, provider can see for their services)
export async function GET(req: NextRequest) {
  return authMiddleware(async (req, user) => {
    try {
      const { searchParams } = new URL(req.url)
      const userId = searchParams.get("userId")
      const providerId = searchParams.get("providerId")

      let sql = `
        SELECT 
          b.*,
          s.title as "serviceTitle",
          s.price,
          u.name as "userName"
        FROM "Booking" b
        JOIN "Service" s ON b."serviceId" = s.id
        JOIN "User" u ON b."userId" = u.id
        WHERE 1=1
      `
      const params: any[] = []

      // Users can only see their own bookings
      if (userId) {
        if (user.role === "user" && Number.parseInt(userId) !== user.id) {
          return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
        }
        sql += ` AND b."userId" = $${params.length + 1}`
        params.push(Number.parseInt(userId))
      }

      // Providers can see bookings for their services
      if (providerId) {
        if (user.role === "provider" && Number.parseInt(providerId) !== user.id) {
          return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
        }
        sql += ` AND s."providerId" = $${params.length + 1}`
        params.push(Number.parseInt(providerId))
      }

      if (!userId && !providerId) {
        // Default to current user's bookings if no filter specified
        sql += ` AND b."userId" = $${params.length + 1}`
        params.push(user.id)
      }

      sql += ` ORDER BY b.datetime DESC`

      const bookings = await query(sql, params)
      return NextResponse.json({ data: bookings })
    } catch (error) {
      console.error("[v0] GET /api/bookings error:", error)
      return NextResponse.json(
        { error: error instanceof Error ? error.message : "Failed to fetch bookings" },
        { status: 500 },
      )
    }
  })(req)
}
