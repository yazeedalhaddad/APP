import { type NextRequest, NextResponse } from "next/server"
import { requireRole } from "@/lib/middleware/auth"
import { validateQuery } from "@/lib/middleware/validation"
import { getAuditLogs } from "@/lib/database"
import { auditLogFiltersSchema } from "@/lib/validation/schemas"
import { ApiResponseBuilder } from "@/lib/utils/api-response"
import { withErrorHandler } from "@/lib/middleware/error-handler"

async function getAuditLogsHandler(request: NextRequest) {
  await requireRole(request, ["admin"])
  const filters = validateQuery(request, auditLogFiltersSchema)

  const auditLogs = await getAuditLogs(filters)

  return NextResponse.json(ApiResponseBuilder.success(auditLogs))
}

export const GET = withErrorHandler(getAuditLogsHandler)
