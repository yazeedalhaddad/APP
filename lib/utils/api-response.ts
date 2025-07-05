export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  message?: string
  timestamp: string
}

export interface PaginatedApiResponse<T = any> extends ApiResponse<T[]> {
  pagination?: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

export class ApiResponseBuilder {
  static success<T>(data?: T, message?: string): ApiResponse<T> {
    return {
      success: true,
      data,
      message,
      timestamp: new Date().toISOString(),
    }
  }

  static error(error: string, statusCode?: number): ApiResponse {
    return {
      success: false,
      error,
      timestamp: new Date().toISOString(),
    }
  }

  static paginated<T>(
    data: T[],
    pagination: { page: number; limit: number; total: number },
    message?: string,
  ): PaginatedApiResponse<T> {
    return {
      success: true,
      data,
      message,
      pagination: {
        ...pagination,
        totalPages: Math.ceil(pagination.total / pagination.limit),
      },
      timestamp: new Date().toISOString(),
    }
  }
}
