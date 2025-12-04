import { type NextRequest, NextResponse } from "next/server"
import { authMiddleware } from "@/lib/auth-middleware"
import { query } from "@/lib/db"

async function handler(req: NextRequest, user: any) {
  try {
    // Fetch latest user data
    const result = await query(
      'SELECT id, name, email, role, phone, "createdAt", "updatedAt" FROM "User" WHERE id = $1',
      [user.id],
    )

    if (result.length === 0) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    return NextResponse.json({ user: result[0] })
  } catch (error) {
    console.error("[v0] /me error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export const GET = authMiddleware(handler)
