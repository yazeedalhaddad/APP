import { type NextRequest, NextResponse } from "next/server"
import { getDashboardMetrics } from "@/lib/database"
import { requireRole } from "@/lib/middleware/auth"
import { ApiResponseBuilder } from "@/lib/utils/api-response"
import { handleApiError } from "@/lib/middleware/error-handler"
import { sql } from "@/lib/db"

export async function GET(request: NextRequest) {
  try {
    // Verify authentication and role
    const authResult = await requireRole(request, ["management", "admin", "production", "lab"])
    if (!authResult.success) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const department = searchParams.get("department")
    const limit = Number.parseInt(searchParams.get("limit") || "100")
    const offset = Number.parseInt(searchParams.get("offset") || "0")

    // Get optimized dashboard metrics with calculations done in SQL
    const metrics = await getDashboardMetrics({
      department: department || undefined,
      limit,
      offset,
    })

    return ApiResponseBuilder.success(
      {
        metrics,
        pagination: {
          limit,
          offset,
          total: metrics.length,
        },
      },
      "Dashboard metrics retrieved successfully",
    )
  } catch (error) {
    return handleApiError(error)
  }
}

export async function POST(request: NextRequest) {
  try {
    // Verify authentication and admin role
    const authResult = await requireRole(request, ["admin"])
    if (!authResult.success) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const {
      department,
      total_documents,
      total_drafts,
      pending_approvals,
      active_users,
      recent_activity,
      custom_metrics,
    } = body

    // Insert new metrics record using the database function
    const result = await sql`
      INSERT INTO dashboard_metrics (
        department,
        total_documents,
        total_drafts,
        pending_approvals,
        active_users,
        recent_activity,
        custom_metrics
      )
      VALUES (
        ${department},
        ${total_documents || 0},
        ${total_drafts || 0},
        ${pending_approvals || 0},
        ${active_users || 0},
        ${recent_activity || 0},
        ${JSON.stringify(custom_metrics) || null}
      )
      RETURNING *
    `

    return ApiResponseBuilder.created(result[0], "Dashboard metrics created successfully")
  } catch (error) {
    return handleApiError(error)
  }
}
