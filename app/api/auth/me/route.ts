import { type NextRequest, NextResponse } from "next/server"
import { requireAuth } from "@/lib/middleware"
import { getUserById } from "@/lib/database"

export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth(request)
    const fullUser = await getUserById(user.id)

    if (!fullUser) {
      return NextResponse.json({ success: false, error: "User not found" }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      data: fullUser,
    })
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Authentication failed" },
      { status: 401 },
    )
  }
}
