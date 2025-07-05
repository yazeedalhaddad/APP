import { type NextRequest, NextResponse } from "next/server"
import { requireAuth, getClientIP, getUserAgent } from "@/lib/middleware"
import { getDocumentVersion, createAuditLog } from "@/lib/database"

export async function GET(request: NextRequest, { params }: { params: { id: string; version: string } }) {
  try {
    const user = await requireAuth(request)
    const versionNumber = Number.parseInt(params.version)

    if (isNaN(versionNumber)) {
      return NextResponse.json({ success: false, error: "Invalid version number" }, { status: 400 })
    }

    const version = await getDocumentVersion(params.id, versionNumber)

    if (!version) {
      return NextResponse.json({ success: false, error: "Document version not found" }, { status: 404 })
    }

    // Create audit log
    await createAuditLog({
      user_id: user.id,
      action: "DOCUMENT_VERSION_VIEWED",
      document_id: params.id,
      details: { version_number: versionNumber },
      ip_address: getClientIP(request),
      user_agent: getUserAgent(request),
    })

    return NextResponse.json({
      success: true,
      data: version,
    })
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Failed to fetch document version" },
      { status: error instanceof Error && error.message === "Authentication required" ? 401 : 500 },
    )
  }
}
