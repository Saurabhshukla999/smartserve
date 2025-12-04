import { type NextRequest, NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import { query } from "@/lib/db"
import { generateToken } from "@/lib/jwt"

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json()

    if (!email || !password) {
      return NextResponse.json({ error: "Missing email or password" }, { status: 400 })
    }

    // Find user
    const result = await query('SELECT id, name, email, password, role, phone FROM "User" WHERE email = $1', [email])

    if (result.length === 0) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 })
    }

    const user = result[0]

    // Verify password
    const passwordMatch = await bcrypt.compare(password, user.password)

    if (!passwordMatch) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 })
    }

    // Generate token
    const token = generateToken({
      id: user.id,
      email: user.email,
      role: user.role,
    })

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user

    return NextResponse.json({
      token,
      user: userWithoutPassword,
    })
  } catch (error) {
    console.error("[v0] Login error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
