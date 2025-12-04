import { type NextRequest, NextResponse } from "next/server"
import { query } from "@/lib/db"

// GET /api/providers/[id] - Get provider public profile
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const providerId = Number.parseInt(id)

    if (isNaN(providerId)) {
      return NextResponse.json({ error: "Invalid provider ID" }, { status: 400 })
    }

    // Get provider info
    const providerSql = `SELECT id, name, email, phone, bio, specialties, "yearsExperience", role FROM "User" WHERE id = $1 AND role = 'provider'`
    const providers = await query(providerSql, [providerId])

    if (providers.length === 0) {
      return NextResponse.json({ error: "Provider not found" }, { status: 404 })
    }

    const provider = providers[0]

    // Get all services by provider
    const servicesSql = `
      SELECT 
        s.*,
        COALESCE(AVG(r.rating), 0) as avgRating,
        COUNT(r.id) as reviewCount
      FROM "Service" s
      LEFT JOIN "Review" r ON s.id = r."serviceId"
      WHERE s."providerId" = $1
      GROUP BY s.id
      ORDER BY s."createdAt" DESC
    `
    const services = await query(servicesSql, [providerId])

    // Calculate overall rating from all reviews
    const overallRatingSql = `
      SELECT COALESCE(AVG(r.rating), 0) as avgRating, COUNT(r.id) as totalReviews
      FROM "Review" r
      JOIN "Booking" b ON r."bookingId" = b.id
      JOIN "Service" s ON b."serviceId" = s.id
      WHERE s."providerId" = $1
    `
    const ratingData = await query(overallRatingSql, [providerId])

    // Get recent reviews
    const reviewsSql = `
      SELECT 
        r.*,
        u.name as "userName",
        s.title as "serviceTitle"
      FROM "Review" r
      JOIN "User" u ON r."userId" = u.id
      JOIN "Booking" b ON r."bookingId" = b.id
      JOIN "Service" s ON b."serviceId" = s.id
      WHERE s."providerId" = $1
      ORDER BY r."createdAt" DESC
      LIMIT 10
    `
    const reviews = await query(reviewsSql, [providerId])

    return NextResponse.json({
      provider: {
        id: provider.id,
        name: provider.name,
        bio: provider.bio,
        specialties: provider.specialties,
        yearsExperience: provider.yearsExperience,
        phone: provider.phone,
        // Don't expose email for privacy
      },
      services: services || [],
      overallRating: Number(ratingData[0]?.avgRating) || 0,
      totalReviews: Number(ratingData[0]?.totalReviews) || 0,
      recentReviews: reviews || [],
    })
  } catch (error) {
    console.error("[v0] GET /api/providers/[id] error:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to fetch provider profile" },
      { status: 500 },
    )
  }
}

