import type { NextRequest } from "next/server"
import { userService } from "@/lib/services/user-service"
import { withErrorHandler } from "@/lib/middleware/error-handler"
import { validateRequest } from "@/lib/middleware/validation"
import { signupSchema } from "@/lib/validation/schemas"
import { ApiResponseBuilder } from "@/lib/utils/api-response"

export const POST = withErrorHandler(async (request: NextRequest) => {
  const body = await validateRequest(request, signupSchema)

  const { name, email, password } = body

  // Get client IP and user agent for audit logging
  const ipAddress = request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || "unknown"
  const userAgent = request.headers.get("user-agent") || "unknown"

  // Create user with default role and department
  const result = await userService.createUser(
    {
      name,
      email,
      password,
      role: "lab", // Default role for new signups
      department: "General", // Default department
    },
    "system", // Created by system for self-registration
    ipAddress,
    userAgent,
  )

  // Auto-login the user after successful signup
  const loginResult = await userService.login({ email, password }, ipAddress, userAgent)

  return ApiResponseBuilder.success(loginResult, "Account created successfully")
})
