import { type NextRequest, NextResponse } from "next/server"
import { query } from "@/lib/db"
import { authMiddleware } from "@/lib/auth-middleware"

// GET /api/provider/stats - Get provider statistics
export async function GET(req: NextRequest) {
  return authMiddleware(async (req, user) => {
    try {
      if (user.role !== "provider") {
        return NextResponse.json({ error: "Only providers can access this" }, { status: 403 })
      }

      // Total earnings from completed bookings
      const earningsSql = `
        SELECT COALESCE(SUM(s.price), 0) as earnings
        FROM "Booking" b
        JOIN "Service" s ON b."serviceId" = s.id
        WHERE s."providerId" = $1 AND b.status = 'completed'
      `
      const earnings = await query(earningsSql, [user.id])

      // Average rating
      const ratingsSql = `
        SELECT COALESCE(AVG(r.rating), 0) as avgRating
        FROM "Review" r
        JOIN "Booking" b ON r."bookingId" = b.id
        JOIN "Service" s ON b."serviceId" = s.id
        WHERE s."providerId" = $1
      `
      const ratings = await query(ratingsSql, [user.id])

      // Regular clients (users with 2+ bookings)
      const clientsSql = `
        SELECT COUNT(DISTINCT b."userId") as regularClients
        FROM "Booking" b
        JOIN "Service" s ON b."serviceId" = s.id
        WHERE s."providerId" = $1
        GROUP BY b."userId"
        HAVING COUNT(*) >= 2
      `
      const clients = await query(clientsSql, [user.id])

      return NextResponse.json({
        totalEarnings: Number(earnings[0]?.earnings) || 0,
        averageRating: Number(ratings[0]?.avgRating) || 0,
        regularClients: clients.length,
      })
    } catch (error) {
      console.error("[v0] GET /api/provider/stats error:", error)
      return NextResponse.json(
        { error: error instanceof Error ? error.message : "Failed to fetch stats" },
        { status: 500 },
      )
    }
  })(req)
}
