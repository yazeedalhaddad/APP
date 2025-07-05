import { type NextRequest, NextResponse } from "next/server"
import { requireAuth, getClientIP, getUserAgent } from "@/lib/middleware"
import { getDraftById, updateDraft, createAuditLog } from "@/lib/database"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    await requireAuth(request)
    const draft = await getDraftById(params.id)

    if (!draft) {
      return NextResponse.json({ success: false, error: "Draft not found" }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      data: draft,
    })
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Failed to fetch draft" },
      { status: error instanceof Error && error.message === "Authentication required" ? 401 : 500 },
    )
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await requireAuth(request)
    const updates = await request.json()

    const draft = await updateDraft(params.id, updates)

    if (!draft) {
      return NextResponse.json({ success: false, error: "Draft not found or no changes made" }, { status: 404 })
    }

    // Create audit log
    await createAuditLog({
      user_id: user.id,
      action: "DRAFT_UPDATED",
      draft_id: draft.id,
      details: { updates },
      ip_address: getClientIP(request),
      user_agent: getUserAgent(request),
    })

    return NextResponse.json({
      success: true,
      data: draft,
      message: "Draft updated successfully",
    })
  } catch (error) {
    console.error("Update draft error:", error)
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Failed to update draft" },
      { status: error instanceof Error && error.message === "Authentication required" ? 401 : 500 },
    )
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await requireAuth(request)
    const draft = await getDraftById(params.id)

    if (!draft) {
      return NextResponse.json({ success: false, error: "Draft not found" }, { status: 404 })
    }

    // Only allow creator or admin to delete
    if (draft.creator_id !== user.id && user.role !== "admin") {
      return NextResponse.json({ success: false, error: "Insufficient permissions" }, { status: 403 })
    }

    await updateDraft(params.id, { status: "rejected" }) // Soft delete

    // Create audit log
    await createAuditLog({
      user_id: user.id,
      action: "DRAFT_DELETED",
      draft_id: draft.id,
      details: { name: draft.name },
      ip_address: getClientIP(request),
      user_agent: getUserAgent(request),
    })

    return NextResponse.json({
      success: true,
      message: "Draft deleted successfully",
    })
  } catch (error) {
    console.error("Delete draft error:", error)
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Failed to delete draft" },
      { status: error instanceof Error && error.message === "Authentication required" ? 401 : 500 },
    )
  }
}
