import { type NextRequest, NextResponse } from "next/server"
import { v4 as uuidv4 } from "uuid"
import { requireRole, getClientIP, getUserAgent } from "@/lib/middleware"
import { createReport, createAuditLog } from "@/lib/database"

export async function POST(request: NextRequest) {
  try {
    const user = await requireRole(request, ["management", "admin"])
    const { title, type, parameters } = await request.json()

    if (!title || !type) {
      return NextResponse.json({ success: false, error: "Title and type are required" }, { status: 400 })
    }

    const taskId = uuidv4()

    const report = await createReport({
      task_id: taskId,
      title,
      type,
      parameters,
      generated_by: user.id,
    })

    // Create audit log
    await createAuditLog({
      user_id: user.id,
      action: "REPORT_GENERATION_STARTED",
      details: { report_id: report.id, title, type, task_id: taskId },
      ip_address: getClientIP(request),
      user_agent: getUserAgent(request),
    })

    // TODO: Add report to message queue for processing
    // This would typically involve adding the task to a queue like RabbitMQ or AWS SQS
    // For now, we'll just return the task ID

    return NextResponse.json({
      success: true,
      data: {
        task_id: taskId,
        report_id: report.id,
      },
      message: "Report generation started",
    })
  } catch (error) {
    console.error("Generate report error:", error)
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Failed to generate report" },
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
