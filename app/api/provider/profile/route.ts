import { type NextRequest, NextResponse } from "next/server"
import { query } from "@/lib/db"
import { authMiddleware } from "@/lib/auth-middleware"

// GET /api/provider/profile - Get provider profile
export async function GET(req: NextRequest) {
  return authMiddleware(async (req, user) => {
    try {
      if (user.role !== "provider") {
        return NextResponse.json({ error: "Only providers can access this" }, { status: 403 })
      }

      const sql = `SELECT * FROM "User" WHERE id = $1 AND role = 'provider'`
      const result = await query(sql, [user.id])

      if (result.length === 0) {
        return NextResponse.json({ error: "Provider profile not found" }, { status: 404 })
      }

      // Remove password from response
      const { password, ...profile } = result[0]
      return NextResponse.json({ profile })
    } catch (error) {
      console.error("[v0] GET /api/provider/profile error:", error)
      return NextResponse.json(
        { error: error instanceof Error ? error.message : "Failed to fetch profile" },
        { status: 500 },
      )
    }
  })(req)
}

// PUT /api/provider/profile - Update provider profile
export async function PUT(req: NextRequest) {
  return authMiddleware(async (req, user) => {
    try {
      if (user.role !== "provider") {
        return NextResponse.json({ error: "Only providers can access this" }, { status: 403 })
      }

      const formData = await req.formData()
      const bio = formData.get("bio") as string
      const specialties = formData.get("specialties") as string
      const yearsExperience = formData.get("yearsExperience") as string
      const bankAccount = formData.get("bankAccount") as string
      const bankRoutingNumber = formData.get("bankRoutingNumber") as string
      const idProof = formData.get("idProof") as File | null

      let idProofUrl = null

      // Handle file upload (for now, store as base64 in DB or use external service)
      if (idProof) {
        const buffer = await idProof.arrayBuffer()
        const base64 = Buffer.from(buffer).toString("base64")
        idProofUrl = `data:${idProof.type};base64,${base64}`
      }

      const updateFields = []
      const params: any[] = []
      let paramIndex = 1

      if (bio) {
        updateFields.push(`"bio" = $${paramIndex}`)
        params.push(bio)
        paramIndex++
      }
      if (specialties) {
        updateFields.push(`"specialties" = $${paramIndex}`)
        params.push(specialties)
        paramIndex++
      }
      if (yearsExperience) {
        updateFields.push(`"yearsExperience" = $${paramIndex}`)
        params.push(Number(yearsExperience))
        paramIndex++
      }
      if (bankAccount) {
        updateFields.push(`"bankAccount" = $${paramIndex}`)
        params.push(bankAccount)
        paramIndex++
      }
      if (bankRoutingNumber) {
        updateFields.push(`"bankRoutingNumber" = $${paramIndex}`)
        params.push(bankRoutingNumber)
        paramIndex++
      }
      if (idProofUrl) {
        updateFields.push(`"idProofUrl" = $${paramIndex}`)
        params.push(idProofUrl)
        paramIndex++
      }

      updateFields.push(`"updatedAt" = NOW()`)
      params.push(user.id)

      if (updateFields.length === 1) {
        // No fields to update
        const sql = `SELECT * FROM "User" WHERE id = $1`
        const result = await query(sql, [user.id])
        const { password, ...profile } = result[0]
        return NextResponse.json({ profile })
      }

      const sql = `UPDATE "User" SET ${updateFields.join(", ")} WHERE id = $${paramIndex} RETURNING *`
      const result = await query(sql, params)

      const { password, ...profile } = result[0]
      return NextResponse.json({ profile })
    } catch (error) {
      console.error("[v0] PUT /api/provider/profile error:", error)
      return NextResponse.json(
        { error: error instanceof Error ? error.message : "Failed to update profile" },
        { status: 400 },
      )
    }
  })(req)
}
