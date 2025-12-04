import { type NextRequest, NextResponse } from "next/server"
import { query } from "@/lib/db"
import { authMiddleware } from "@/lib/auth-middleware"

// GET /api/reviews/:id - Get single review
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const reviewId = Number.parseInt(id)

    if (isNaN(reviewId)) {
      return NextResponse.json({ error: "Invalid review ID" }, { status: 400 })
    }

    const sql = `
      SELECT 
        r.*,
        u.name as "userName",
        s.title as "serviceTitle"
      FROM "Review" r
      JOIN "User" u ON r."userId" = u.id
      JOIN "Booking" b ON r."bookingId" = b.id
      JOIN "Service" s ON b."serviceId" = s.id
      WHERE r.id = $1
    `

    const reviews = await query(sql, [reviewId])

    if (reviews.length === 0) {
      return NextResponse.json({ error: "Review not found" }, { status: 404 })
    }

    return NextResponse.json(reviews[0])
  } catch (error) {
    console.error("[v0] GET /api/reviews/:id error:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to fetch review" },
      { status: 500 },
    )
  }
}

// DELETE /api/reviews/:id - Delete review (owner or admin only)
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  return authMiddleware(async (req, user) => {
    try {
      const { id } = await params
      const reviewId = Number.parseInt(id)

      if (isNaN(reviewId)) {
        return NextResponse.json({ error: "Invalid review ID" }, { status: 400 })
      }

      // Check ownership
      const reviewSql = `SELECT "userId" FROM "Review" WHERE id = $1`
      const reviews = await query(reviewSql, [reviewId])

      if (reviews.length === 0) {
        return NextResponse.json({ error: "Review not found" }, { status: 404 })
      }

      if (reviews[0].userId !== user.id && user.role !== "admin") {
        return NextResponse.json({ error: "Cannot delete review" }, { status: 403 })
      }

      await query(`DELETE FROM "Review" WHERE id = $1`, [reviewId])
      return NextResponse.json({ message: "Review deleted successfully" })
    } catch (error) {
      console.error("[v0] DELETE /api/reviews/:id error:", error)
      return NextResponse.json(
        { error: error instanceof Error ? error.message : "Failed to delete review" },
        { status: 500 },
      )
    }
  })(req)
}
