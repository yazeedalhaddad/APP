import { type NextRequest, NextResponse } from "next/server"
import { requireAuth } from "@/lib/middleware"
import { getReportByTaskId } from "@/lib/database"

export async function GET(request: NextRequest, { params }: { params: { taskId: string } }) {
  try {
    await requireAuth(request)
    const report = await getReportByTaskId(params.taskId)

    if (!report) {
      return NextResponse.json({ success: false, error: "Report not found" }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      data: {
        task_id: report.task_id,
        status: report.status,
        title: report.title,
        type: report.type,
        file_path: report.file_path,
        error_message: report.error_message,
        created_at: report.created_at,
        completed_at: report.completed_at,
      },
    })
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Failed to fetch report status" },
      { status: error instanceof Error && error.message === "Authentication required" ? 401 : 500 },
    )
  }
}
