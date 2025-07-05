import { type NextRequest, NextResponse } from "next/server"
import { requireRole, getClientIP, getUserAgent } from "@/lib/middleware/auth"
import { mergeRequestService } from "@/lib/services/merge-request-service"
import { ApiResponseBuilder } from "@/lib/utils/api-response"
import { withErrorHandler } from "@/lib/middleware/error-handler"

async function approveMergeRequestHandler(request: NextRequest, { params }: { params: { id: string } }) {
  const user = await requireRole(request, ["management", "admin"])
  const ipAddress = getClientIP(request)
  const userAgent = getUserAgent(request)

  const mergeRequest = await mergeRequestService.approveMergeRequest(
    params.id,
    user.id,
    user.name,
    ipAddress,
    userAgent,
  )

  return NextResponse.json(ApiResponseBuilder.success(mergeRequest, "Merge request approved successfully"))
}

export const POST = withErrorHandler(approveMergeRequestHandler)
