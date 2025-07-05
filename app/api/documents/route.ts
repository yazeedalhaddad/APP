import { type NextRequest, NextResponse } from "next/server"
import { requireAuth, getClientIP, getUserAgent } from "@/lib/middleware/auth"
import { validateBody, validateQuery } from "@/lib/middleware/validation"
import { documentService } from "@/lib/services/document-service"
import { documentFiltersSchema, createDocumentSchema } from "@/lib/validation/schemas"
import { ApiResponseBuilder } from "@/lib/utils/api-response"
import { withErrorHandler } from "@/lib/middleware/error-handler"

async function getDocumentsHandler(request: NextRequest) {
  const user = await requireAuth(request)
  const filters = validateQuery(request, documentFiltersSchema)

  let documents
  if (filters.search) {
    const ipAddress = getClientIP(request)
    const userAgent = getUserAgent(request)
    documents = await documentService.searchDocuments(filters.search, user.id, ipAddress, userAgent)
  } else {
    documents = await documentService.getDocuments(filters)
  }

  return NextResponse.json(ApiResponseBuilder.success(documents))
}

async function createDocumentHandler(request: NextRequest) {
  const user = await requireAuth(request)
  const documentData = await validateBody(request, createDocumentSchema)
  const ipAddress = getClientIP(request)
  const userAgent = getUserAgent(request)

  const document = await documentService.createDocument(documentData, user.id, ipAddress, userAgent)

  return NextResponse.json(ApiResponseBuilder.success(document, "Document created successfully"), {
    status: 201,
  })
}

export const GET = withErrorHandler(getDocumentsHandler)
export const POST = withErrorHandler(createDocumentHandler)
