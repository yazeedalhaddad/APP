import type { NextResponse } from "next/server"
import { AppError } from "@/lib/utils/errors"
import { ApiResponseBuilder } from "@/lib/utils/api-response"

export function handleApiError(error: unknown): NextResponse {
  console.error("API Error:", error)

  if (error instanceof AppError) {
    switch (error.statusCode) {
      case 400:
        return ApiResponseBuilder.badRequest(error.message)
      case 401:
        return ApiResponseBuilder.unauthorized(error.message)
      case 403:
        return ApiResponseBuilder.forbidden(error.message)
      case 404:
        return ApiResponseBuilder.notFound(error.message)
      case 409:
        return ApiResponseBuilder.conflict(error.message)
      default:
        return ApiResponseBuilder.internalServerError(error.message)
    }
  }

  // Handle unexpected errors
  return ApiResponseBuilder.internalServerError("An unexpected error occurred")
}
