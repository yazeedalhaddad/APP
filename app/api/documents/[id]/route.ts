import { type NextRequest, NextResponse } from "next/server"
import { requireAuth, getClientIP, getUserAgent } from "@/lib/middleware"
import { getDocumentById, createAuditLog } from "@/lib/database"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await requireAuth(request)
    const document = await getDocumentById(params.id)

    if (!document) {
      return NextResponse.json({ success: false, error: "Document not found" }, { status: 404 })
    }

    // Create audit log
    await createAuditLog({
      user_id: user.id,
      action: "DOCUMENT_VIEWED",
      document_id: document.id,
      details: { title: document.title },
      ip_address: getClientIP(request),
      user_agent: getUserAgent(request),
    })

    return NextResponse.json({
      success: true,
      data: document,
    })
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Failed to fetch document" },
      { status: error instanceof Error && error.message === "Authentication required" ? 401 : 500 },
    )
  }
}
