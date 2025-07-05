import { type NextRequest, NextResponse } from "next/server"
import { requireAuth } from "@/lib/middleware/auth"
import { mergeRequestService } from "@/lib/services/merge-request-service"
import { ApiResponseBuilder } from "@/lib/utils/api-response"
import { withErrorHandler } from "@/lib/middleware/error-handler"

async function getMergeRequestHandler(request: NextRequest, { params }: { params: { id: string } }) {
  await requireAuth(request)
  const mergeRequest = await mergeRequestService.getMergeRequestById(params.id)

  return NextResponse.json(ApiResponseBuilder.success(mergeRequest))
}

export const GET = withErrorHandler(getMergeRequestHandler)
