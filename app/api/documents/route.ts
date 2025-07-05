import { type NextRequest, NextResponse } from "next/server"
import { requireAuth, getClientIP, getUserAgent } from "@/lib/middleware"
import { getDocuments, createDocument, createAuditLog } from "@/lib/database"

export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth(request)
    const { searchParams } = new URL(request.url)

    const filters = {
      limit: Number.parseInt(searchParams.get("limit") || "50"),
      offset: Number.parseInt(searchParams.get("offset") || "0"),
      classification: searchParams.get("classification") || undefined,
      owner_id: searchParams.get("owner_id") || undefined,
      search: searchParams.get("q") || undefined,
    }

    const documents = await getDocuments(filters)

    // Create audit log for search if query provided
    if (filters.search) {
      await createAuditLog({
        user_id: user.id,
        action: "DOCUMENTS_SEARCHED",
        details: { query: filters.search, results_count: documents.length },
        ip_address: getClientIP(request),
        user_agent: getUserAgent(request),
      })
    }

    return NextResponse.json({
      success: true,
      data: documents,
    })
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Failed to fetch documents" },
      { status: error instanceof Error && error.message === "Authentication required" ? 401 : 500 },
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth(request)
    const { title, description, file_type, classification, file_path, file_size } = await request.json()

    if (!title || !file_type || !classification || !file_path) {
      return NextResponse.json(
        { success: false, error: "Title, file_type, classification, and file_path are required" },
        { status: 400 },
      )
    }

    const document = await createDocument({
      title,
      description,
      file_type,
      classification,
      owner_id: user.id,
      file_path,
      file_size: file_size || 0,
    })

    // Create audit log
    await createAuditLog({
      user_id: user.id,
      action: "DOCUMENT_CREATED",
      document_id: document.id,
      details: { title, classification, file_type },
      ip_address: getClientIP(request),
      user_agent: getUserAgent(request),
    })

    return NextResponse.json({
      success: true,
      data: document,
      message: "Document created successfully",
    })
  } catch (error) {
    console.error("Create document error:", error)
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Failed to create document" },
      { status: error instanceof Error && error.message === "Authentication required" ? 401 : 500 },
    )
  }
}
