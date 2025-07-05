import { type NextRequest, NextResponse } from "next/server"
import { requireAuth, getClientIP, getUserAgent } from "@/lib/middleware"
import { createAuditLog } from "@/lib/database"

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth(request)

    // Create audit log
    await createAuditLog({
      user_id: user.id,
      action: "USER_LOGOUT",
      details: { email: user.email },
      ip_address: getClientIP(request),
      user_agent: getUserAgent(request),
    })

    return NextResponse.json({
      success: true,
      message: "Logged out successfully",
    })
  } catch (error) {
    return NextResponse.json({ success: false, error: "Logout failed" }, { status: 500 })
  }
}
