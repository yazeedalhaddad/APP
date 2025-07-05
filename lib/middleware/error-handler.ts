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

  // Handle database connection errors
  if (error instanceof Error) {
    if (error.message.includes("DATABASE_URL") || error.message.includes("connection")) {
      return ApiResponseBuilder.internalServerError("Database connection failed. Please check your configuration.")
    }
  }

  // Handle unexpected errors
  return ApiResponseBuilder.internalServerError("An unexpected error occurred")
}

export function withErrorHandler<T extends any[]>(handler: (...args: T) => Promise<NextResponse>) {
  return async (...args: T): Promise<NextResponse> => {
    try {
      return await handler(...args)
    } catch (error) {
      return handleApiError(error)
    }
  }
}
