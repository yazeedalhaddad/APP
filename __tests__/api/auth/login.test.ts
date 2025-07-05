import { describe, it, expect, jest } from "@jest/globals"
import { NextRequest } from "next/server"
import { POST } from "@/app/api/auth/login/route"

// Mock the user service
jest.mock("@/lib/services/user-service", () => ({
  userService: {
    login: jest.fn(),
  },
}))

// Mock validation
jest.mock("@/lib/middleware/validation", () => ({
  validateBody: jest.fn(),
}))

// Mock auth middleware
jest.mock("@/lib/middleware/auth", () => ({
  getClientIP: jest.fn(),
  getUserAgent: jest.fn(),
}))

describe("POST /api/auth/login", () => {
  it("should successfully login and return user data with token", async () => {
    const mockLoginData = {
      email: "test@example.com",
      password: "password123",
    }

    const mockLoginResult = {
      user: {
        id: "user-1",
        email: "test@example.com",
        name: "Test User",
        role: "admin",
      },
      token: "mock-token",
    }

    const { userService } = await import("@/lib/services/user-service")
    const { validateBody } = await import("@/lib/middleware/validation")
    const { getClientIP, getUserAgent } = await import("@/lib/middleware/auth")
    ;(validateBody as jest.Mock).mockResolvedValue(mockLoginData)
    ;(getClientIP as jest.Mock).mockReturnValue("127.0.0.1")
    ;(getUserAgent as jest.Mock).mockReturnValue("test-user-agent")
    ;(userService.login as jest.Mock).mockResolvedValue(mockLoginResult)

    const request = new NextRequest("http://localhost:3000/api/auth/login", {
      method: "POST",
      body: JSON.stringify(mockLoginData),
    })

    const response = await POST(request)
    const responseData = await response.json()

    expect(response.status).toBe(200)
    expect(responseData.success).toBe(true)
    expect(responseData.data).toEqual(mockLoginResult)
    expect(responseData.message).toBe("Login successful")

    expect(userService.login).toHaveBeenCalledWith(mockLoginData, "127.0.0.1", "test-user-agent")
  })

  it("should return error response for invalid credentials", async () => {
    const mockLoginData = {
      email: "test@example.com",
      password: "wrongpassword",
    }

    const { userService } = await import("@/lib/services/user-service")
    const { validateBody } = await import("@/lib/middleware/validation")
    ;(validateBody as jest.Mock).mockResolvedValue(mockLoginData)
    ;(userService.login as jest.Mock).mockRejectedValue(new Error("Invalid credentials"))

    const request = new NextRequest("http://localhost:3000/api/auth/login", {
      method: "POST",
      body: JSON.stringify(mockLoginData),
    })

    const response = await POST(request)
    const responseData = await response.json()

    expect(response.status).toBe(500)
    expect(responseData.success).toBe(false)
    expect(responseData.error).toBe("Internal server error")
  })
})
