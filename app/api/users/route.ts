import { type NextRequest, NextResponse } from "next/server"
import { requireRole, getClientIP, getUserAgent } from "@/lib/middleware/auth"
import { validateBody, validateQuery } from "@/lib/middleware/validation"
import { userService } from "@/lib/services/user-service"
import { paginationSchema, createUserSchema } from "@/lib/validation/schemas"
import { ApiResponseBuilder } from "@/lib/utils/api-response"
import { withErrorHandler } from "@/lib/middleware/error-handler"

async function getUsersHandler(request: NextRequest) {
  await requireRole(request, ["admin"])
  const { limit, offset } = validateQuery(request, paginationSchema)

  const users = await userService.getAllUsers(limit, offset)

  return NextResponse.json(ApiResponseBuilder.success(users))
}

async function createUserHandler(request: NextRequest) {
  const user = await requireRole(request, ["admin"])
  const userData = await validateBody(request, createUserSchema)
  const ipAddress = getClientIP(request)
  const userAgent = getUserAgent(request)

  const newUser = await userService.createUser(userData, user.id, ipAddress, userAgent)

  return NextResponse.json(ApiResponseBuilder.success(newUser, "User created successfully"), {
    status: 201,
  })
}

export const GET = withErrorHandler(getUsersHandler)
export const POST = withErrorHandler(createUserHandler)
