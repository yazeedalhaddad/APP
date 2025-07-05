import { NextResponse } from "next/server"

export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  message?: string
  pagination?: {
    limit: number
    offset: number
    total: number
  }
}

export class ApiResponseBuilder {
  static success<T>(data: T, message?: string): NextResponse<ApiResponse<T>> {
    return NextResponse.json({
      success: true,
      data,
      message,
    })
  }

  static created<T>(data: T, message?: string): NextResponse<ApiResponse<T>> {
    return NextResponse.json(
      {
        success: true,
        data,
        message,
      },
      { status: 201 },
    )
  }

  static badRequest(error: string): NextResponse<ApiResponse> {
    return NextResponse.json(
      {
        success: false,
        error,
      },
      { status: 400 },
    )
  }

  static unauthorized(error = "Unauthorized"): NextResponse<ApiResponse> {
    return NextResponse.json(
      {
        success: false,
        error,
      },
      { status: 401 },
    )
  }

  static forbidden(error = "Forbidden"): NextResponse<ApiResponse> {
    return NextResponse.json(
      {
        success: false,
        error,
      },
      { status: 403 },
    )
  }

  static notFound(error = "Not found"): NextResponse<ApiResponse> {
    return NextResponse.json(
      {
        success: false,
        error,
      },
      { status: 404 },
    )
  }

  static conflict(error: string): NextResponse<ApiResponse> {
    return NextResponse.json(
      {
        success: false,
        error,
      },
      { status: 409 },
    )
  }

  static internalServerError(error = "Internal server error"): NextResponse<ApiResponse> {
    return NextResponse.json(
      {
        success: false,
        error,
      },
      { status: 500 },
    )
  }

  static withPagination<T>(
    data: T,
    pagination: { limit: number; offset: number; total: number },
    message?: string,
  ): NextResponse<ApiResponse<T>> {
    return NextResponse.json({
      success: true,
      data,
      pagination,
      message,
    })
  }
}
