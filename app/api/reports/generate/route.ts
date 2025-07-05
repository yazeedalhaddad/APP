import { type NextRequest, NextResponse } from "next/server"
import { requireRole, getClientIP, getUserAgent } from "@/lib/middleware/auth"
import { validateBody } from "@/lib/middleware/validation"
import { reportService } from "@/lib/services/report-service"
import { generateReportSchema } from "@/lib/validation/schemas"
import { ApiResponseBuilder } from "@/lib/utils/api-response"
import { withErrorHandler } from "@/lib/middleware/error-handler"

async function generateReportHandler(request: NextRequest) {
  const user = await requireRole(request, ["management", "admin"])
  const reportData = await validateBody(request, generateReportSchema)
  const ipAddress = getClientIP(request)
  const userAgent = getUserAgent(request)

  const result = await reportService.generateReport(reportData, user.id, ipAddress, userAgent)

  return NextResponse.json(ApiResponseBuilder.success(result, "Report generation started"), {
    status: 202,
  })
}

export const POST = withErrorHandler(generateReportHandler)
