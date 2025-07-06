import { NextResponse } from "next/server"

/**
 * A small fluent helper to build _always-JSON_ API responses.
 */
export class ApiResponseBuilder {
  /**
   * 200 – OK (default “success” wrapper)
   */
  static success<T>(data: T, message = "Success") {
    return NextResponse.json({ success: true, message, data }, { status: 200 })
  }

  /**
   * 400 – Bad Request
   */
  static badRequest(message = "Bad request") {
    return NextResponse.json({ success: false, error: message }, { status: 400 })
  }

  /**
   * 401 – Unauthorized
   */
  static unauthorized(message = "Unauthorized") {
    return NextResponse.json({ success: false, error: message }, { status: 401 })
  }

  /**
   * 403 – Forbidden
   */
  static forbidden(message = "Forbidden") {
    return NextResponse.json({ success: false, error: message }, { status: 403 })
  }

  /**
   * 404 – Not Found
   */
  static notFound(message = "Not found") {
    return NextResponse.json({ success: false, error: message }, { status: 404 })
  }

  /**
   * 409 – Conflict
   */
  static conflict(message = "Conflict") {
    return NextResponse.json({ success: false, error: message }, { status: 409 })
  }

  /**
   * 500 – Internal Server Error
   */
  static internalServerError(message = "Internal server error") {
    return NextResponse.json({ success: false, error: message }, { status: 500 })
  }

  /**
   * Arbitrary status helper.
   * success = status < 400
   */
  static custom<T = unknown>(status: number, message: string, data?: T) {
    const isSuccess = status < 400
    return NextResponse.json(isSuccess ? { success: true, message, data } : { success: false, error: message, data }, {
      status,
    })
  }
}
