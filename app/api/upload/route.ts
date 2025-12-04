import { type NextRequest, NextResponse } from "next/server"
import { authMiddleware } from "@/lib/auth-middleware"

// POST /api/upload - Upload image file
export async function POST(req: NextRequest) {
  return authMiddleware(async (req, user) => {
    try {
      const formData = await req.formData()
      const file = formData.get("file") as File

      if (!file) {
        return NextResponse.json({ error: "No file provided" }, { status: 400 })
      }

      // For now, convert to base64 (in production, use Cloudinary, S3, etc.)
      const buffer = await file.arrayBuffer()
      const base64 = Buffer.from(buffer).toString("base64")
      const dataUrl = `data:${file.type};base64,${base64}`

      return NextResponse.json({
        url: dataUrl,
        filename: file.name,
      })
    } catch (error) {
      console.error("[v0] POST /api/upload error:", error)
      return NextResponse.json(
        { error: error instanceof Error ? error.message : "Failed to upload file" },
        { status: 400 },
      )
    }
  })(req)
}
