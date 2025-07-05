import { type NextRequest, NextResponse } from "next/server"
import { requireAuth, getClientIP, getUserAgent } from "@/lib/middleware/auth"
import { userService } from "@/lib/services/user-service"
import { ApiResponseBuilder } from "@/lib/utils/api-response"
import { withErrorHandler } from "@/lib/middleware/error-handler"

async function logoutHandler(request: NextRequest) {
  const user = await requireAuth(request)
  const ipAddress = getClientIP(request)
  const userAgent = getUserAgent(request)

  await userService.logout(user.id, user.email, ipAddress, userAgent)

  return NextResponse.json(ApiResponseBuilder.success(null, "Logged out successfully"))
}

export const POST = withErrorHandler(logoutHandler)
