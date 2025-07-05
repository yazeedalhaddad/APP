import { type NextRequest, NextResponse } from "next/server"
import { requireRole } from "@/lib/middleware"
import { getAuditLogs } from "@/lib/database"

export async function GET(request: NextRequest) {
  try {
    await requireRole(request, ["admin"])
    const { searchParams } = new URL(request.url)

    const filters = {
      limit: Number.parseInt(searchParams.get("limit") || "100"),
      offset: Number.parseInt(searchParams.get("offset") || "0"),
      user_id: searchParams.get("user_id") || undefined,
      action: searchParams.get("action") || undefined,
      document_id: searchParams.get("document_id") || undefined,
      start_date: searchParams.get("start_date") || undefined,
      end_date: searchParams.get("end_date") || undefined,
    }

    const auditLogs = await getAuditLogs(filters)

    return NextResponse.json({
      success: true,
      data: auditLogs,
    })
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Failed to fetch audit logs" },
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
