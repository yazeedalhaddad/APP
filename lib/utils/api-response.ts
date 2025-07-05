import { NextResponse } from "next/server"

export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  message?: string
  timestamp: string
}

export class ApiResponseBuilder {
  static success<T>(data: T, message?: string): ApiResponse<T> {
    return {
      success: true,
      data,
      message,
      timestamp: new Date().toISOString(),
    }
  }

  static error(error: string, statusCode = 500): NextResponse {
    const response: ApiResponse = {
      success: false,
      error,
      timestamp: new Date().toISOString(),
    }
    return NextResponse.json(response, { status: statusCode })
  }

  static badRequest(error: string): NextResponse {
    return this.error(error, 400)
  }

  static unauthorized(error = "Unauthorized"): NextResponse {
    return this.error(error, 401)
  }

  static forbidden(error = "Forbidden"): NextResponse {
    return this.error(error, 403)
  }

  static notFound(error = "Not found"): NextResponse {
    return this.error(error, 404)
  }

  static conflict(error: string): NextResponse {
    return this.error(error, 409)
  }

  static internalServerError(error = "Internal server error"): NextResponse {
    return this.error(error, 500)
  }
}
