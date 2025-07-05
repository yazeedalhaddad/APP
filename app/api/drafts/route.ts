import { type NextRequest, NextResponse } from "next/server"
import { requireAuth, getClientIP, getUserAgent } from "@/lib/middleware"
import { getDrafts, createDraft, createAuditLog } from "@/lib/database"

export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth(request)
    const { searchParams } = new URL(request.url)

    const filters = {
      limit: Number.parseInt(searchParams.get("limit") || "50"),
      offset: Number.parseInt(searchParams.get("offset") || "0"),
      document_id: searchParams.get("document_id") || undefined,
      creator_id: searchParams.get("creator_id") || undefined,
      status: searchParams.get("status") || undefined,
    }

    const drafts = await getDrafts(filters)

    return NextResponse.json({
      success: true,
      data: drafts,
    })
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Failed to fetch drafts" },
      { status: error instanceof Error && error.message === "Authentication required" ? 401 : 500 },
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth(request)
    const { document_id, name, description, base_version_id, file_path } = await request.json()

    if (!document_id || !name || !base_version_id) {
      return NextResponse.json(
        { success: false, error: "Document ID, name, and base version ID are required" },
        { status: 400 },
      )
    }

    const draft = await createDraft({
      document_id,
      name,
      description,
      creator_id: user.id,
      base_version_id,
      file_path,
    })

    // Create audit log
    await createAuditLog({
      user_id: user.id,
      action: "DRAFT_CREATED",
      document_id,
      draft_id: draft.id,
      details: { name, base_version_id },
      ip_address: getClientIP(request),
      user_agent: getUserAgent(request),
    })

    return NextResponse.json({
      success: true,
      data: draft,
      message: "Draft created successfully",
    })
  } catch (error) {
    console.error("Create draft error:", error)
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Failed to create draft" },
      { status: error instanceof Error && error.message === "Authentication required" ? 401 : 500 },
    )
  }
}
