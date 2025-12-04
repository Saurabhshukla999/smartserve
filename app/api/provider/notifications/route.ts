import { type NextRequest, NextResponse } from "next/server"
import { query } from "@/lib/db"
import { authMiddleware } from "@/lib/auth-middleware"

// GET /api/provider/notifications - Get provider notifications
export async function GET(req: NextRequest) {
  return authMiddleware(async (req, user) => {
    try {
      if (user.role !== "provider") {
        return NextResponse.json({ error: "Only providers can access this" }, { status: 403 })
      }

      // Get pending bookings as notifications
      const pendingBookingSql = `
        SELECT 
          b.id,
          'Booking Request: ' || s.title as title,
          u.name || ' wants to book your service' as message,
          'booking' as type,
          false as read,
          b."createdAt"
        FROM "Booking" b
        JOIN "Service" s ON b."serviceId" = s.id
        JOIN "User" u ON b."userId" = u.id
        WHERE s."providerId" = $1 AND b.status = 'pending'
        ORDER BY b."createdAt" DESC
        LIMIT 10
      `

      const notifications = await query(pendingBookingSql, [user.id])

      return NextResponse.json({
        notifications: notifications.map((n: any) => ({
          ...n,
          id: String(n.id),
        })),
      })
    } catch (error) {
      console.error("[v0] GET /api/provider/notifications error:", error)
      return NextResponse.json(
        { error: error instanceof Error ? error.message : "Failed to fetch notifications" },
        { status: 500 },
      )
    }
  })(req)
}
