import { type NextRequest, NextResponse } from "next/server"
import { requireAuth, getClientIP, getUserAgent } from "@/lib/middleware/auth"
import { validateBody, validateQuery } from "@/lib/middleware/validation"
import { draftService } from "@/lib/services/draft-service"
import { draftFiltersSchema, createDraftSchema } from "@/lib/validation/schemas"
import { ApiResponseBuilder } from "@/lib/utils/api-response"
import { withErrorHandler } from "@/lib/middleware/error-handler"

async function getDraftsHandler(request: NextRequest) {
  await requireAuth(request)
  const filters = validateQuery(request, draftFiltersSchema)

  const drafts = await draftService.getDrafts(filters)

  return NextResponse.json(ApiResponseBuilder.success(drafts))
}

async function createDraftHandler(request: NextRequest) {
  const user = await requireAuth(request)
  const draftData = await validateBody(request, createDraftSchema)
  const ipAddress = getClientIP(request)
  const userAgent = getUserAgent(request)

  const draft = await draftService.createDraft(draftData, user.id, ipAddress, userAgent)

  return NextResponse.json(ApiResponseBuilder.success(draft, "Draft created successfully"), {
    status: 201,
  })
}

export const GET = withErrorHandler(getDraftsHandler)
export const POST = withErrorHandler(createDraftHandler)
