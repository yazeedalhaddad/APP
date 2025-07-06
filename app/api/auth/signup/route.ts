import type { NextRequest } from "next/server"
import { withErrorHandler } from "@/lib/middleware/error-handler"
import { ApiResponseBuilder } from "@/lib/utils/api-response"
import { signupSchema } from "@/lib/validation/schemas"
import { userService } from "@/lib/services/user-service"

export const POST = withErrorHandler(async (req: NextRequest) => {
  // Validate and strip confirmPassword
  const { name, email, password } = signupSchema.parse(await req.json())

  // Meta for audit
  const ipAddress = req.headers.get("x-forwarded-for") ?? req.headers.get("x-real-ip") ?? undefined
  const userAgent = req.headers.get("user-agent") ?? undefined

  // Create account and auto-login
  const { user, token } = await userService.registerAndLogin({
    name,
    email,
    password,
    role: "lab",
    department: "General",
    ipAddress,
    userAgent,
  })

  return ApiResponseBuilder.success({ user, token }, "Account created")
})
