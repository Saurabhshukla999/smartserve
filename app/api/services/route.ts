import { type NextRequest, NextResponse } from "next/server"
import { query } from "@/lib/db"
import { serviceCreateSchema, serviceFilterSchema } from "@/lib/validation"
import { authMiddleware } from "@/lib/auth-middleware"

// GET /api/services - List all services with filters
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const filters = {
      category: searchParams.get("category") || undefined,
      city: searchParams.get("city") || undefined,
      minRating: searchParams.get("minRating") ? Number.parseFloat(searchParams.get("minRating")!) : undefined,
      maxPrice: searchParams.get("maxPrice") ? Number.parseFloat(searchParams.get("maxPrice")!) : undefined,
      minPrice: searchParams.get("minPrice") ? Number.parseFloat(searchParams.get("minPrice")!) : undefined,
      limit: searchParams.get("limit") ? Number.parseInt(searchParams.get("limit")!) : 20,
      offset: searchParams.get("offset") ? Number.parseInt(searchParams.get("offset")!) : 0,
    }

    const validatedFilters = serviceFilterSchema.parse(filters)

    let sql = `
      SELECT 
        s.*,
        COALESCE(AVG(r.rating), 0) as avgRating,
        COUNT(r.id) as reviewCount
      FROM "Service" s
      LEFT JOIN "Review" r ON s.id = r."serviceId"
      WHERE 1=1
    `
    const params: any[] = []

    if (validatedFilters.category) {
      sql += ` AND s.category = $${params.length + 1}`
      params.push(validatedFilters.category)
    }
    if (validatedFilters.city) {
      sql += ` AND s.city = $${params.length + 1}`
      params.push(validatedFilters.city)
    }
    if (validatedFilters.minPrice) {
      sql += ` AND s.price >= $${params.length + 1}`
      params.push(validatedFilters.minPrice)
    }
    if (validatedFilters.maxPrice) {
      sql += ` AND s.price <= $${params.length + 1}`
      params.push(validatedFilters.maxPrice)
    }

    sql += ` GROUP BY s.id HAVING 1=1`

    if (validatedFilters.minRating) {
      sql += ` AND COALESCE(AVG(r.rating), 0) >= $${params.length + 1}`
      params.push(validatedFilters.minRating)
    }

    sql += ` ORDER BY s."createdAt" DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`
    params.push(validatedFilters.limit, validatedFilters.offset)

    const services = await query(sql, params)

    return NextResponse.json({
      data: services,
      pagination: {
        limit: validatedFilters.limit,
        offset: validatedFilters.offset,
        total: services.length,
      },
    })
  } catch (error) {
    console.error("[v0] GET /api/services error:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to fetch services" },
      { status: 400 },
    )
  }
}

// POST /api/services - Create new service (provider only)
export async function POST(req: NextRequest) {
  return authMiddleware(async (req, user) => {
    try {
      if (user.role !== "provider") {
        return NextResponse.json({ error: "Only providers can create services" }, { status: 403 })
      }

      const formData = await req.formData()

      const imageFiles = formData.getAll("images") as File[]
      const imageUrls: string[] = []

      // Convert images to base64 URLs (in production, use Cloudinary)
      for (const file of imageFiles) {
        const buffer = await file.arrayBuffer()
        const base64 = Buffer.from(buffer).toString("base64")
        imageUrls.push(`data:${file.type};base64,${base64}`)
      }

      const body = {
        title: formData.get("title"),
        description: formData.get("description"),
        category: formData.get("category"),
        city: formData.get("city"),
        price: Number(formData.get("price")),
        locationLat: formData.get("locationLat") ? Number(formData.get("locationLat")) : null,
        locationLng: formData.get("locationLng") ? Number(formData.get("locationLng")) : null,
        images: imageUrls,
      }

      const validatedData = serviceCreateSchema.parse(body)

      const sql = `
        INSERT INTO "Service" (
          title, description, category, city, price, 
          "providerId", "locationLat", "locationLng", images, "createdAt", "updatedAt"
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW(), NOW())
        RETURNING *
      `

      const params = [
        validatedData.title,
        validatedData.description,
        validatedData.category,
        validatedData.city,
        validatedData.price,
        user.id,
        validatedData.locationLat || null,
        validatedData.locationLng || null,
        validatedData.images || [],
      ]

      const result = await query(sql, params)
      return NextResponse.json(result[0], { status: 201 })
    } catch (error) {
      console.error("[v0] POST /api/services error:", error)
      return NextResponse.json(
        { error: error instanceof Error ? error.message : "Failed to create service" },
        { status: 400 },
      )
    }
  })(req)
}
