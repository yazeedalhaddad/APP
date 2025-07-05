import { type NextRequest, NextResponse } from "next/server"
import { requireRole } from "@/lib/middleware"
import { getUserById } from "@/lib/database"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    await requireRole(request, ["admin"])

    const user = await getUserById(params.id)
    if (!user) {
      return NextResponse.json({ success: false, error: "User not found" }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      data: user,
    })
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Failed to fetch user" },
      {
        status:
          error instanceof Error && error.message === "Authentication required"
            ? 401
            : error instanceof Error && error.message === "Insufficient permissions"
              ? 403
              : 500,
      },
    )
  }
}
