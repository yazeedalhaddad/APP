import { type NextRequest, NextResponse } from "next/server"
import { requireRole, getClientIP, getUserAgent } from "@/lib/middleware"
import { updateMergeRequestStatus, createAuditLog } from "@/lib/database"

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await requireRole(request, ["management", "admin"])

    const mergeRequest = await updateMergeRequestStatus(params.id, "approved", user.id)

    if (!mergeRequest) {
      return NextResponse.json({ success: false, error: "Merge request not found" }, { status: 404 })
    }

    // Create audit log
    await createAuditLog({
      user_id: user.id,
      action: "MERGE_REQUEST_APPROVED",
      merge_request_id: mergeRequest.id,
      details: { approver: user.name },
      ip_address: getClientIP(request),
      user_agent: getUserAgent(request),
    })

    return NextResponse.json({
      success: true,
      data: mergeRequest,
      message: "Merge request approved successfully",
    })
  } catch (error) {
    console.error("Approve merge request error:", error)
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Failed to approve merge request" },
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
