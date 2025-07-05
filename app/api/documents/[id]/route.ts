import { type NextRequest, NextResponse } from "next/server"
import { requireAuth, getClientIP, getUserAgent } from "@/lib/middleware/auth"
import { documentService } from "@/lib/services/document-service"
import { ApiResponseBuilder } from "@/lib/utils/api-response"
import { withErrorHandler } from "@/lib/middleware/error-handler"

async function getDocumentHandler(request: NextRequest, { params }: { params: { id: string } }) {
  const user = await requireAuth(request)
  const ipAddress = getClientIP(request)
  const userAgent = getUserAgent(request)

  const document = await documentService.getDocumentById(params.id, user.id, ipAddress, userAgent)

  return NextResponse.json(ApiResponseBuilder.success(document))
}

export const GET = withErrorHandler(getDocumentHandler)
