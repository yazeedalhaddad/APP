import { type NextRequest, NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import { validateBody } from "@/lib/middleware/validation"
import { getClientIP, getUserAgent, generateToken } from "@/lib/middleware/auth"
import { loginSchema } from "@/lib/validation/schemas"
import { ApiResponseBuilder } from "@/lib/utils/api-response"
import { withErrorHandler } from "@/lib/middleware/error-handler"
import { getUserByEmail, createAuditLog } from "@/lib/database"

async function loginHandler(request: NextRequest) {
  const credentials = await validateBody(request, loginSchema)
  const ipAddress = getClientIP(request)
  const userAgent = getUserAgent(request)

  // Get user by email
  const user = await getUserByEmail(credentials.email)

  if (!user) {
    // Create audit log for failed login attempt
    await createAuditLog({
      user_id: "unknown",
      action: "LOGIN_FAILED",
      details: { email: credentials.email, reason: "User not found" },
      ip_address: ipAddress,
      user_agent: userAgent,
    }).catch(() => {}) // Don't fail if audit log fails

    return ApiResponseBuilder.unauthorized("Invalid email or password")
  }

  // Verify password
  const isValidPassword = await bcrypt.compare(credentials.password, user.password)

  if (!isValidPassword) {
    // Create audit log for failed login attempt
    await createAuditLog({
      user_id: user.id,
      action: "LOGIN_FAILED",
      details: { email: credentials.email, reason: "Invalid password" },
      ip_address: ipAddress,
      user_agent: userAgent,
    }).catch(() => {}) // Don't fail if audit log fails

    return ApiResponseBuilder.unauthorized("Invalid email or password")
  }

  // Generate JWT token
  const token = generateToken(user.id)

  // Create audit log for successful login
  await createAuditLog({
    user_id: user.id,
    action: "LOGIN_SUCCESS",
    details: { email: credentials.email },
    ip_address: ipAddress,
    user_agent: userAgent,
  }).catch(() => {}) // Don't fail if audit log fails

  // Remove password from response
  const { password, ...userWithoutPassword } = user

  return NextResponse.json(
    ApiResponseBuilder.success(
      {
        user: userWithoutPassword,
        token,
      },
      "Login successful",
    ),
  )
}

export const POST = withErrorHandler(loginHandler)
