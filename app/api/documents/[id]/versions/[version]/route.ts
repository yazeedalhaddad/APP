import { type NextRequest, NextResponse } from "next/server"
import { requireAuth, getClientIP, getUserAgent } from "@/lib/middleware/auth"
import { documentService } from "@/lib/services/document-service"
import { ApiResponseBuilder } from "@/lib/utils/api-response"
import { withErrorHandler } from "@/lib/middleware/error-handler"
import { ValidationError } from "@/lib/utils/errors"

async function getDocumentVersionHandler(
  request: NextRequest,
  { params }: { params: { id: string; version: string } },
) {
  const user = await requireAuth(request)
  const versionNumber = Number.parseInt(params.version)

  if (isNaN(versionNumber)) {
    throw new ValidationError("Invalid version number")
  }

  const ipAddress = getClientIP(request)
  const userAgent = getUserAgent(request)

  const version = await documentService.getDocumentVersion(params.id, versionNumber, user.id, ipAddress, userAgent)

  return NextResponse.json(ApiResponseBuilder.success(version))
}

export const GET = withErrorHandler(getDocumentVersionHandler)
