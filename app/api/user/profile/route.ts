import { type NextRequest, NextResponse } from "next/server"
import { query } from "@/lib/db"
import { authMiddleware } from "@/lib/auth-middleware"

// GET /api/user/profile - Get user profile
export async function GET(req: NextRequest) {
  return authMiddleware(async (req, user) => {
    try {
      const sql = `SELECT id, name, email, phone, bio, role, "createdAt", "updatedAt" FROM "User" WHERE id = $1`
      const result = await query(sql, [user.id])

      if (result.length === 0) {
        return NextResponse.json({ error: "User profile not found" }, { status: 404 })
      }

      return NextResponse.json({ profile: result[0] })
    } catch (error) {
      console.error("[v0] GET /api/user/profile error:", error)
      return NextResponse.json(
        { error: error instanceof Error ? error.message : "Failed to fetch profile" },
        { status: 500 },
      )
    }
  })(req)
}

// PUT /api/user/profile - Update user profile
export async function PUT(req: NextRequest) {
  return authMiddleware(async (req, user) => {
    try {
      const body = await req.json()
      const { name, phone, bio, location } = body

      const updateFields: string[] = []
      const params: any[] = []
      let paramIndex = 1

      // Only allow updating specific fields (not email or role)
      if (name !== undefined && name.trim()) {
        updateFields.push(`name = $${paramIndex}`)
        params.push(name.trim())
        paramIndex++
      }

      if (phone !== undefined) {
        updateFields.push(`phone = $${paramIndex}`)
        params.push(phone || null)
        paramIndex++
      }

      if (bio !== undefined) {
        updateFields.push(`bio = $${paramIndex}`)
        params.push(bio || null)
        paramIndex++
      }

      // Note: location is not in the User table schema currently
      // If you want to add it, you'd need a migration
      // For now, we'll skip it or store in bio

      if (updateFields.length === 0) {
        // No fields to update, return current profile
        const sql = `SELECT id, name, email, phone, bio, role, "createdAt", "updatedAt" FROM "User" WHERE id = $1`
        const result = await query(sql, [user.id])
        return NextResponse.json({ profile: result[0] })
      }

      updateFields.push(`"updatedAt" = NOW()`)
      params.push(user.id)

      const sql = `
        UPDATE "User" 
        SET ${updateFields.join(", ")} 
        WHERE id = $${paramIndex}
        RETURNING id, name, email, phone, bio, role, "createdAt", "updatedAt"
      `

      const result = await query(sql, params)

      if (result.length === 0) {
        return NextResponse.json({ error: "User not found" }, { status: 404 })
      }

      return NextResponse.json({ profile: result[0] })
    } catch (error) {
      console.error("[v0] PUT /api/user/profile error:", error)
      return NextResponse.json(
        { error: error instanceof Error ? error.message : "Failed to update profile" },
        { status: 400 },
      )
    }
  })(req)
}

