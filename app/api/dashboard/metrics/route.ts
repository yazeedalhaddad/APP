import { type NextRequest, NextResponse } from "next/server"
import { getDashboardMetrics } from "@/lib/database"
import { verifyToken } from "@/lib/middleware"
import { sql } from "@/lib/db"

export async function GET(request: NextRequest) {
  try {
    // Verify authentication
    const authResult = await verifyToken(request)
    if (!authResult.success) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const department = searchParams.get("department")
    const limit = Number.parseInt(searchParams.get("limit") || "100")
    const offset = Number.parseInt(searchParams.get("offset") || "0")

    // Get dashboard metrics
    const metrics = await getDashboardMetrics({
      department: department || undefined,
      limit,
      offset,
    })

    // Calculate summary statistics
    const summary = {
      totalDocuments: 0,
      totalDrafts: 0,
      pendingApprovals: 0,
      activeUsers: 0,
      recentActivity: 0,
    }

    // If we have metrics data, calculate summaries
    if (metrics.length > 0) {
      const latestMetrics = metrics[0]
      summary.totalDocuments = latestMetrics.total_documents || 0
      summary.totalDrafts = latestMetrics.total_drafts || 0
      summary.pendingApprovals = latestMetrics.pending_approvals || 0
      summary.activeUsers = latestMetrics.active_users || 0
      summary.recentActivity = latestMetrics.recent_activity || 0
    }

    return NextResponse.json({
      metrics,
      summary,
      pagination: {
        limit,
        offset,
        total: metrics.length,
      },
    })
  } catch (error) {
    console.error("Error fetching dashboard metrics:", error)
    return NextResponse.json({ error: "Failed to fetch dashboard metrics" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    // Verify authentication and admin role
    const authResult = await verifyToken(request)
    if (!authResult.success) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    if (authResult.user.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
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

    // Insert new metrics record
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

    return NextResponse.json(result[0], { status: 201 })
  } catch (error) {
    console.error("Error creating dashboard metrics:", error)
    return NextResponse.json({ error: "Failed to create dashboard metrics" }, { status: 500 })
  }
}
