import { type NextRequest, NextResponse } from "next/server"
import { requireAuth } from "@/lib/middleware"
import { getMergeRequestById } from "@/lib/database"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    await requireAuth(request)
    const mergeRequest = await getMergeRequestById(params.id)

    if (!mergeRequest) {
      return NextResponse.json({ success: false, error: "Merge request not found" }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      data: mergeRequest,
    })
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Failed to fetch merge request" },
      { status: error instanceof Error && error.message === "Authentication required" ? 401 : 500 },
    )
  }
}
