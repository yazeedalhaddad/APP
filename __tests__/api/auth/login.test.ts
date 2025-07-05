import { POST } from "@/app/api/auth/login/route"
import { NextRequest } from "next/server"
import jest from "jest"

// Mock the user service
jest.mock("@/lib/services/user-service", () => ({
  userService: {
    login: jest.fn(),
  },
}))

// Mock the validation middleware
jest.mock("@/lib/middleware/validation", () => ({
  validateBody: jest.fn(),
}))

// Mock the auth middleware
jest.mock("@/lib/middleware/auth", () => ({
  getClientIP: jest.fn(() => "127.0.0.1"),
  getUserAgent: jest.fn(() => "test-agent"),
}))

describe("/api/auth/login", () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it("should successfully login with valid credentials", async () => {
    const { userService } = require("@/lib/services/user-service")
    const { validateBody } = require("@/lib/middleware/validation")

    const mockCredentials = {
      email: "test@example.com",
      password: "password",
    }

    const mockLoginResult = {
      user: {
        id: "1",
        email: "test@example.com",
        name: "Test User",
        role: "admin",
      },
      token: "mock-token",
    }

    validateBody.mockResolvedValue(mockCredentials)
    userService.login.mockResolvedValue(mockLoginResult)

    const request = new NextRequest("http://localhost:3000/api/auth/login", {
      method: "POST",
      body: JSON.stringify(mockCredentials),
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.success).toBe(true)
    expect(data.data).toEqual(mockLoginResult)
    expect(data.message).toBe("Login successful")
  })

  it("should return error for invalid credentials", async () => {
    const { userService } = require("@/lib/services/user-service")
    const { validateBody } = require("@/lib/middleware/validation")

    const mockCredentials = {
      email: "invalid@example.com",
      password: "wrongpassword",
    }

    validateBody.mockResolvedValue(mockCredentials)
    userService.login.mockRejectedValue(new Error("Invalid credentials"))

    const request = new NextRequest("http://localhost:3000/api/auth/login", {
      method: "POST",
      body: JSON.stringify(mockCredentials),
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(500)
    expect(data.success).toBe(false)
    expect(data.error).toBe("Internal server error")
  })

  it("should handle validation errors", async () => {
    const { validateBody } = require("@/lib/middleware/validation")

    validateBody.mockRejectedValue(new Error("Validation failed"))

    const request = new NextRequest("http://localhost:3000/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ email: "invalid-email" }),
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(500)
    expect(data.success).toBe(false)
  })
})
