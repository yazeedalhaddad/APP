import { type NextRequest, NextResponse } from "next/server"
import { requireAuth, getClientIP, getUserAgent } from "@/lib/middleware/auth"
import { reportService } from "@/lib/services/report-service"
import { ApiResponseBuilder } from "@/lib/utils/api-response"
import { withErrorHandler } from "@/lib/middleware/error-handler"

async function downloadReportHandler(request: NextRequest, { params }: { params: { reportId: string } }) {
  const user = await requireAuth(request)
  const ipAddress = getClientIP(request)
  const userAgent = getUserAgent(request)

  const downloadInfo = await reportService.downloadReport(params.reportId, user.id, ipAddress, userAgent)

  return NextResponse.json(ApiResponseBuilder.success(downloadInfo, "Report ready for download"))
}

export const GET = withErrorHandler(downloadReportHandler)
