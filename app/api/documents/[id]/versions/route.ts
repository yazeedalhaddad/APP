import { type NextRequest, NextResponse } from "next/server"
import { requireAuth } from "@/lib/middleware"
import { getDocumentVersions } from "@/lib/database"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    await requireAuth(request)
    const versions = await getDocumentVersions(params.id)

    return NextResponse.json({
      success: true,
      data: versions,
    })
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Failed to fetch document versions" },
      { status: error instanceof Error && error.message === "Authentication required" ? 401 : 500 },
    )
  }
}
