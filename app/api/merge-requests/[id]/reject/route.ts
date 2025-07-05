import { type NextRequest, NextResponse } from "next/server"
import { requireRole, getClientIP, getUserAgent } from "@/lib/middleware/auth"
import { validateBody } from "@/lib/middleware/validation"
import { mergeRequestService } from "@/lib/services/merge-request-service"
import { approveMergeRequestSchema } from "@/lib/validation/schemas"
import { ApiResponseBuilder } from "@/lib/utils/api-response"
import { withErrorHandler } from "@/lib/middleware/error-handler"

async function rejectMergeRequestHandler(request: NextRequest, { params }: { params: { id: string } }) {
  const user = await requireRole(request, ["management", "admin"])
  const { reason } = await validateBody(request, approveMergeRequestSchema)
  const ipAddress = getClientIP(request)
  const userAgent = getUserAgent(request)

  const mergeRequest = await mergeRequestService.rejectMergeRequest(
    params.id,
    reason,
    user.id,
    user.name,
    ipAddress,
    userAgent,
  )

  return NextResponse.json(ApiResponseBuilder.success(mergeRequest, "Merge request rejected"))
}

export const POST = withErrorHandler(rejectMergeRequestHandler)
