import { type NextRequest, NextResponse } from "next/server"
import { verifyToken } from "./jwt"

export function authMiddleware(handler: (req: NextRequest, user: any) => Promise<NextResponse>) {
  return async (req: NextRequest) => {
    const token = req.headers.get("authorization")?.replace("Bearer ", "")

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const user = verifyToken(token)
    if (!user) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 })
    }

    return handler(req, user)
  }
}

export function roleMiddleware(requiredRole: string) {
  return (handler: (req: NextRequest, user: any) => Promise<NextResponse>) => {
    return async (req: NextRequest, user: any) => {
      if (user.role !== requiredRole) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 })
      }
      return handler(req, user)
    }
  }
}
