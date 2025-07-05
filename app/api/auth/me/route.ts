import { type NextRequest, NextResponse } from "next/server"
import { requireAuth } from "@/lib/middleware/auth"
import { userService } from "@/lib/services/user-service"
import { ApiResponseBuilder } from "@/lib/utils/api-response"
import { withErrorHandler } from "@/lib/middleware/error-handler"

async function getMeHandler(request: NextRequest) {
  const user = await requireAuth(request)
  const fullUser = await userService.getUserById(user.id)

  return NextResponse.json(ApiResponseBuilder.success(fullUser))
}

export const GET = withErrorHandler(getMeHandler)
