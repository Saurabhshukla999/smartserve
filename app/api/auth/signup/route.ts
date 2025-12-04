import { type NextRequest, NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import { query } from "@/lib/db"
import { generateToken } from "@/lib/jwt"

export async function POST(req: NextRequest) {
  try {
    const { name, email, password, role, phone } = await req.json()

    // Validate input
    if (!name || !email || !password || !role || !phone) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Check if user exists
    const existing = await query('SELECT id FROM "User" WHERE email = $1', [email])

    if (existing.length > 0) {
      return NextResponse.json({ error: "User already exists" }, { status: 409 })
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10)

    // Create user
    const result = await query(
      `INSERT INTO "User" (name, email, password, role, phone, "createdAt", "updatedAt")
       VALUES ($1, $2, $3, $4, $5, NOW(), NOW())
       RETURNING id, name, email, role, phone`,
      [name, email, hashedPassword, role, phone],
    )

    const user = result[0]

    // Generate token
    const token = generateToken({
      id: user.id,
      email: user.email,
      role: user.role,
    })

    return NextResponse.json({ token, user }, { status: 201 })
  } catch (error) {
    console.error("[v0] Signup error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
