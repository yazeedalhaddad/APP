import { type NextRequest, NextResponse } from "next/server"
import { requireRole, getClientIP, getUserAgent } from "@/lib/middleware/auth"
import { validateBody } from "@/lib/middleware/validation"
import { userService } from "@/lib/services/user-service"
import { updateUserSchema } from "@/lib/validation/schemas"
import { ApiResponseBuilder } from "@/lib/utils/api-response"
import { withErrorHandler } from "@/lib/middleware/error-handler"

async function getUserHandler(request: NextRequest, { params }: { params: { id: string } }) {
  await requireRole(request, ["admin"])
  const user = await userService.getUserById(params.id)

  return NextResponse.json(ApiResponseBuilder.success(user))
}

async function updateUserHandler(request: NextRequest, { params }: { params: { id: string } }) {
  const user = await requireRole(request, ["admin"])
  const updates = await validateBody(request, updateUserSchema)
  const ipAddress = getClientIP(request)
  const userAgent = getUserAgent(request)

  const updatedUser = await userService.updateUser(params.id, updates, user.id, ipAddress, userAgent)

  return NextResponse.json(ApiResponseBuilder.success(updatedUser, "User updated successfully"))
}

async function deleteUserHandler(request: NextRequest, { params }: { params: { id: string } }) {
  const user = await requireRole(request, ["admin"])
  const ipAddress = getClientIP(request)
  const userAgent = getUserAgent(request)

  await userService.deleteUser(params.id, user.id, ipAddress, userAgent)

  return NextResponse.json(ApiResponseBuilder.success(null, "User deleted successfully"))
}

export const GET = withErrorHandler(getUserHandler)
export const PUT = withErrorHandler(updateUserHandler)
export const DELETE = withErrorHandler(deleteUserHandler)
