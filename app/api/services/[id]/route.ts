import { type NextRequest, NextResponse } from "next/server"
import { query } from "@/lib/db"
import { serviceUpdateSchema } from "@/lib/validation"
import { authMiddleware } from "@/lib/auth-middleware"

// GET /api/services/:id - Get single service with reviews
export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params
    const serviceId = Number.parseInt(id)

    if (isNaN(serviceId)) {
      return NextResponse.json({ error: "Invalid service ID" }, { status: 400 })
    }

    const serviceSql = `
      SELECT 
        s.*,
        s."providerId",
        u.name as "providerName",
        COALESCE(AVG(r.rating), 0) as "avgRating",
        COUNT(r.id) as "reviewCount"
      FROM "Service" s
      LEFT JOIN "User" u ON s."providerId" = u.id
      LEFT JOIN "Review" r ON s.id = r."serviceId"
      WHERE s.id = $1
      GROUP BY s.id, u.id
    `

    const services = await query(serviceSql, [serviceId])
    if (services.length === 0) {
      return NextResponse.json({ error: "Service not found" }, { status: 404 })
    }

    const reviewsSql = `
      SELECT 
        r.*,
        u.name as "userName"
      FROM "Review" r
      JOIN "User" u ON r."userId" = u.id
      WHERE r."serviceId" = $1
      ORDER BY r."createdAt" DESC
    `

    const reviews = await query(reviewsSql, [serviceId])

    return NextResponse.json({
      ...services[0],
      reviews,
    })
  } catch (error) {
    console.error("[v0] GET /api/services/:id error:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to fetch service" },
      { status: 500 },
    )
  }
}

// PUT /api/services/:id - Update service (provider only)
export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  return authMiddleware(async (req, user) => {
    try {
      const { id } = params
      const serviceId = Number.parseInt(id)

      if (isNaN(serviceId)) {
        return NextResponse.json({ error: "Invalid service ID" }, { status: 400 })
      }

      // Check ownership
      const ownershipSql = `SELECT "providerId" FROM "Service" WHERE id = $1`
      const services = await query(ownershipSql, [serviceId])

      if (services.length === 0) {
        return NextResponse.json({ error: "Service not found" }, { status: 404 })
      }

      if (services[0].providerId !== user.id) {
        return NextResponse.json({ error: "Cannot update service of another provider" }, { status: 403 })
      }

      const formData = await req.formData()

      // Handle new image uploads
      const imageFiles = formData.getAll("images") as File[]
      const imageUrls: string[] = []

      for (const file of imageFiles) {
        if (file.size > 0) {
          const buffer = await file.arrayBuffer()
          const base64 = Buffer.from(buffer).toString("base64")
          imageUrls.push(`data:${file.type};base64,${base64}`)
        }
      }

      const body = {
        title: formData.get("title"),
        description: formData.get("description"),
        category: formData.get("category"),
        city: formData.get("city"),
        price: formData.get("price") ? Number(formData.get("price")) : undefined,
        locationLat: formData.get("locationLat") ? Number(formData.get("locationLat")) : undefined,
        locationLng: formData.get("locationLng") ? Number(formData.get("locationLng")) : undefined,
        images: imageUrls.length > 0 ? imageUrls : undefined,
      }

      const validatedData = serviceUpdateSchema.parse(body)

      const updateFields: string[] = []
      const updateParams: any[] = []
      let paramIndex = 1

      Object.entries(validatedData).forEach(([key, value]) => {
        if (value !== undefined) {
          updateFields.push(`"${key}" = $${paramIndex}`)
          updateParams.push(value)
          paramIndex++
        }
      })

      if (updateFields.length === 0) {
        return NextResponse.json(services[0])
      }

      updateFields.push(`"updatedAt" = NOW()`)
      updateParams.push(serviceId)

      const sql = `
        UPDATE "Service"
        SET ${updateFields.join(", ")}
        WHERE id = $${paramIndex}
        RETURNING *
      `

      const result = await query(sql, updateParams)
      return NextResponse.json(result[0])
    } catch (error) {
      console.error("[v0] PUT /api/services/:id error:", error)
      return NextResponse.json(
        { error: error instanceof Error ? error.message : "Failed to update service" },
        { status: 400 },
      )
    }
  })(req)
}

// DELETE /api/services/:id - Delete service (provider only)
export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  return authMiddleware(async (req, user) => {
    try {
      const { id } = params
      const serviceId = Number.parseInt(id)

      if (isNaN(serviceId)) {
        return NextResponse.json({ error: "Invalid service ID" }, { status: 400 })
      }

      // Check ownership
      const ownershipSql = `SELECT "providerId" FROM "Service" WHERE id = $1`
      const services = await query(ownershipSql, [serviceId])

      if (services.length === 0) {
        return NextResponse.json({ error: "Service not found" }, { status: 404 })
      }

      if (services[0].providerId !== user.id && user.role !== "admin") {
        return NextResponse.json({ error: "Cannot delete service of another provider" }, { status: 403 })
      }

      await query(`DELETE FROM "Service" WHERE id = $1`, [serviceId])
      return NextResponse.json({ message: "Service deleted successfully" })
    } catch (error) {
      console.error("[v0] DELETE /api/services/:id error:", error)
      return NextResponse.json(
        { error: error instanceof Error ? error.message : "Failed to delete service" },
        { status: 500 },
      )
    }
  })(req)
}
