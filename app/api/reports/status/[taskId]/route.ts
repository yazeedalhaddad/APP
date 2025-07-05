import { type NextRequest, NextResponse } from "next/server"
import { requireAuth } from "@/lib/middleware/auth"
import { reportService } from "@/lib/services/report-service"
import { ApiResponseBuilder } from "@/lib/utils/api-response"
import { withErrorHandler } from "@/lib/middleware/error-handler"

async function getReportStatusHandler(request: NextRequest, { params }: { params: { taskId: string } }) {
  await requireAuth(request)
  const report = await reportService.getReportStatus(params.taskId)

  const responseData = {
    task_id: report.task_id,
    status: report.status,
    title: report.title,
    type: report.type,
    file_path: report.file_path,
    error_message: report.error_message,
    created_at: report.created_at,
    completed_at: report.completed_at,
  }

  return NextResponse.json(ApiResponseBuilder.success(responseData))
}

export const GET = withErrorHandler(getReportStatusHandler)
