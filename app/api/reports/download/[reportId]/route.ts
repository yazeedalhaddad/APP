import { type NextRequest, NextResponse } from "next/server"
import { requireAuth, getClientIP, getUserAgent } from "@/lib/middleware"
import { getReportByTaskId, createAuditLog } from "@/lib/database"

export async function GET(request: NextRequest, { params }: { params: { reportId: string } }) {
  try {
    const user = await requireAuth(request)
    const report = await getReportByTaskId(params.reportId)

    if (!report) {
      return NextResponse.json({ success: false, error: "Report not found" }, { status: 404 })
    }

    if (report.status !== "completed" || !report.file_path) {
      return NextResponse.json({ success: false, error: "Report is not ready for download" }, { status: 400 })
    }

    // Create audit log
    await createAuditLog({
      user_id: user.id,
      action: "REPORT_DOWNLOADED",
      details: { report_id: report.id, title: report.title },
      ip_address: getClientIP(request),
      user_agent: getUserAgent(request),
    })

    // TODO: Implement actual file download from storage
    // This would typically involve streaming the file from S3 or similar storage
    return NextResponse.json({
      success: true,
      data: {
        download_url: report.file_path,
        filename: `${report.title}.pdf`,
      },
      message: "Report ready for download",
    })
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Failed to download report" },
      { status: error instanceof Error && error.message === "Authentication required" ? 401 : 500 },
    )
  }
}
