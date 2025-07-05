import { type NextRequest, NextResponse } from "next/server"
import { requireAuth, getClientIP, getUserAgent } from "@/lib/middleware/auth"
import { validateBody, validateQuery } from "@/lib/middleware/validation"
import { mergeRequestService } from "@/lib/services/merge-request-service"
import { mergeRequestFiltersSchema, createMergeRequestSchema } from "@/lib/validation/schemas"
import { ApiResponseBuilder } from "@/lib/utils/api-response"
import { withErrorHandler } from "@/lib/middleware/error-handler"

async function getMergeRequestsHandler(request: NextRequest) {
  await requireAuth(request)
  const filters = validateQuery(request, mergeRequestFiltersSchema)

  const mergeRequests = await mergeRequestService.getMergeRequests(filters)

  return NextResponse.json(ApiResponseBuilder.success(mergeRequests))
}

async function createMergeRequestHandler(request: NextRequest) {
  const user = await requireAuth(request)
  const mergeRequestData = await validateBody(request, createMergeRequestSchema)
  const ipAddress = getClientIP(request)
  const userAgent = getUserAgent(request)

  const mergeRequest = await mergeRequestService.createMergeRequest(mergeRequestData, user.id, ipAddress, userAgent)

  return NextResponse.json(ApiResponseBuilder.success(mergeRequest, "Merge request created successfully"), {
    status: 201,
  })
}

export const GET = withErrorHandler(getMergeRequestsHandler)
export const POST = withErrorHandler(createMergeRequestHandler)
