import { type NextRequest, NextResponse } from "next/server"
import { requireRole, getClientIP, getUserAgent } from "@/lib/middleware"
import { updateMergeRequestStatus, createAuditLog } from "@/lib/database"

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await requireRole(request, ["management", "admin"])
    const { reason } = await request.json()

    const mergeRequest = await updateMergeRequestStatus(params.id, "rejected", user.id, reason)

    if (!mergeRequest) {
      return NextResponse.json({ success: false, error: "Merge request not found" }, { status: 404 })
    }

    // Create audit log
    await createAuditLog({
      user_id: user.id,
      action: "MERGE_REQUEST_REJECTED",
      merge_request_id: mergeRequest.id,
      details: { approver: user.name, reason },
      ip_address: getClientIP(request),
      user_agent: getUserAgent(request),
    })

    return NextResponse.json({
      success: true,
      data: mergeRequest,
      message: "Merge request rejected",
    })
  } catch (error) {
    console.error("Reject merge request error:", error)
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Failed to reject merge request" },
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
