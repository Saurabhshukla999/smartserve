import jwt from "jsonwebtoken"

if (!process.env.JWT_SECRET) {
  throw new Error("JWT_SECRET environment variable is required")
}

const SECRET = process.env.JWT_SECRET

export interface JWTPayload {
  id: number
  email: string
  role: string
}

export function generateToken(payload: JWTPayload): string {
  return jwt.sign(payload, SECRET, { expiresIn: "7d" })
}

export function verifyToken(token: string): JWTPayload | null {
  try {
    return jwt.verify(token, SECRET) as JWTPayload
  } catch {
    return null
  }
}

export function decodeToken(token: string): JWTPayload | null {
  try {
    return jwt.decode(token) as JWTPayload
  } catch {
    return null
  }
}
