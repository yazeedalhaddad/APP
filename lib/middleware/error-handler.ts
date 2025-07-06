import type { NextRequest, NextResponse } from "next/server"
import { ApiResponseBuilder } from "@/lib/utils/api-response"
import { AppError } from "@/lib/utils/errors"

/**
 * Convert any thrown value into a well-formed JSON API response.
 * Always export BOTH helpers expected elsewhere (`handleApiError` +
 * `withErrorHandler`).
 */

/* -------------------------------------------------------------------------- */
/*                             Core Conversion                                */
/* -------------------------------------------------------------------------- */

export function handleApiError(error: unknown): NextResponse {
  console.error("API Error:", error)

  // Known application error with explicit status code
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
        return ApiResponseBuilder.custom(error.statusCode, error.message)
    }
  }

  // Database-style connection issues
  if (error instanceof Error) {
    if (error.message.includes("DATABASE_URL") || error.message.includes("connection")) {
      return ApiResponseBuilder.internalServerError("Database connection failed. Please check your configuration.")
    }
  }

  // Fallback
  return ApiResponseBuilder.internalServerError(error instanceof Error ? error.message : "Internal server error")
}

/* -------------------------------------------------------------------------- */
/*                              Wrapper Utility                               */
/* -------------------------------------------------------------------------- */

export function withErrorHandler<T extends (req: NextRequest, ...args: any[]) => Promise<NextResponse>>(handler: T) {
  return async (req: NextRequest, ...rest: Parameters<T>[1][]): Promise<NextResponse> => {
    try {
      return await handler(req, ...rest)
    } catch (err) {
      return handleApiError(err)
    }
  }
}
