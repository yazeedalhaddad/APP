import { type NextRequest, NextResponse } from "next/server"
import { requireAuth } from "@/lib/middleware/auth"
import { documentService } from "@/lib/services/document-service"
import { ApiResponseBuilder } from "@/lib/utils/api-response"
import { withErrorHandler } from "@/lib/middleware/error-handler"

async function getDocumentVersionsHandler(request: NextRequest, { params }: { params: { id: string } }) {
  await requireAuth(request)
  const versions = await documentService.getDocumentVersions(params.id)

  return NextResponse.json(ApiResponseBuilder.success(versions))
}

export const GET = withErrorHandler(getDocumentVersionsHandler)
