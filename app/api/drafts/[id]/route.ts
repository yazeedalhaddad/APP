import { type NextRequest, NextResponse } from "next/server"
import { requireAuth, getClientIP, getUserAgent } from "@/lib/middleware/auth"
import { validateBody } from "@/lib/middleware/validation"
import { draftService } from "@/lib/services/draft-service"
import { updateDraftSchema } from "@/lib/validation/schemas"
import { ApiResponseBuilder } from "@/lib/utils/api-response"
import { withErrorHandler } from "@/lib/middleware/error-handler"

async function getDraftHandler(request: NextRequest, { params }: { params: { id: string } }) {
  await requireAuth(request)
  const draft = await draftService.getDraftById(params.id)

  return NextResponse.json(ApiResponseBuilder.success(draft))
}

async function updateDraftHandler(request: NextRequest, { params }: { params: { id: string } }) {
  const user = await requireAuth(request)
  const updates = await validateBody(request, updateDraftSchema)
  const ipAddress = getClientIP(request)
  const userAgent = getUserAgent(request)

  const draft = await draftService.updateDraft(params.id, updates, user.id, user.role, ipAddress, userAgent)

  return NextResponse.json(ApiResponseBuilder.success(draft, "Draft updated successfully"))
}

async function deleteDraftHandler(request: NextRequest, { params }: { params: { id: string } }) {
  const user = await requireAuth(request)
  const ipAddress = getClientIP(request)
  const userAgent = getUserAgent(request)

  await draftService.deleteDraft(params.id, user.id, user.role, ipAddress, userAgent)

  return NextResponse.json(ApiResponseBuilder.success(null, "Draft deleted successfully"))
}

export const GET = withErrorHandler(getDraftHandler)
export const PUT = withErrorHandler(updateDraftHandler)
export const DELETE = withErrorHandler(deleteDraftHandler)
