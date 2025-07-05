import { type NextRequest, NextResponse } from "next/server"
import { requireAuth, getClientIP, getUserAgent } from "@/lib/middleware"
import { getMergeRequests, createMergeRequest, createAuditLog } from "@/lib/database"

export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth(request)
    const { searchParams } = new URL(request.url)

    const filters = {
      limit: Number.parseInt(searchParams.get("limit") || "50"),
      offset: Number.parseInt(searchParams.get("offset") || "0"),
      status: searchParams.get("status") || undefined,
      approver_id: searchParams.get("approver_id") || undefined,
    }

    const mergeRequests = await getMergeRequests(filters)

    return NextResponse.json({
      success: true,
      data: mergeRequests,
    })
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Failed to fetch merge requests" },
      { status: error instanceof Error && error.message === "Authentication required" ? 401 : 500 },
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth(request)
    const { draft_id, approver_id, summary } = await request.json()

    if (!draft_id || !approver_id || !summary) {
      return NextResponse.json(
        { success: false, error: "Draft ID, approver ID, and summary are required" },
        { status: 400 },
      )
    }

    const mergeRequest = await createMergeRequest({
      draft_id,
      approver_id,
      summary,
    })

    // Create audit log
    await createAuditLog({
      user_id: user.id,
      action: "MERGE_REQUEST_CREATED",
      merge_request_id: mergeRequest.id,
      draft_id,
      details: { approver_id, summary },
      ip_address: getClientIP(request),
      user_agent: getUserAgent(request),
    })

    return NextResponse.json({
      success: true,
      data: mergeRequest,
      message: "Merge request created successfully",
    })
  } catch (error) {
    console.error("Create merge request error:", error)
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Failed to create merge request" },
      { status: error instanceof Error && error.message === "Authentication required" ? 401 : 500 },
    )
  }
}
