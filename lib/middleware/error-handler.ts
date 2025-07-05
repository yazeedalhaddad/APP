import { NextResponse } from "next/server"
import { AppError } from "@/lib/utils/errors"
import { ApiResponseBuilder } from "@/lib/utils/api-response"

export function handleError(error: unknown): NextResponse {
  console.error("API Error:", error)

  if (error instanceof AppError) {
    return NextResponse.json(ApiResponseBuilder.error(error.message), {
      status: error.statusCode,
    })
  }

  // Handle unexpected errors
  return NextResponse.json(ApiResponseBuilder.error("Internal server error"), {
    status: 500,
  })
}

export function withErrorHandler(handler: Function) {
  return async (...args: any[]) => {
    try {
      return await handler(...args)
    } catch (error) {
      return handleError(error)
    }
  }
}
