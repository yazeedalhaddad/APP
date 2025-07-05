import { type NextRequest, NextResponse } from "next/server"
import { userService } from "@/lib/services/user-service"
import { validateBody } from "@/lib/middleware/validation"
import { getClientIP, getUserAgent } from "@/lib/middleware/auth"
import { loginSchema } from "@/lib/validation/schemas"
import { ApiResponseBuilder } from "@/lib/utils/api-response"
import { withErrorHandler } from "@/lib/middleware/error-handler"

async function loginHandler(request: NextRequest) {
  const credentials = await validateBody(request, loginSchema)
  const ipAddress = getClientIP(request)
  const userAgent = getUserAgent(request)

  const result = await userService.login(credentials, ipAddress, userAgent)

  return NextResponse.json(ApiResponseBuilder.success(result, "Login successful"))
}

export const POST = withErrorHandler(loginHandler)
