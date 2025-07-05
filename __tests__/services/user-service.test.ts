import { UserService } from "@/lib/services/user-service"
import { AppError } from "@/lib/utils/errors"
import jest from "jest"

// Mock the database
jest.mock("@neondatabase/serverless", () => ({
  neon: jest.fn(() => jest.fn()),
}))

// Mock bcrypt
jest.mock("bcrypt", () => ({
  compare: jest.fn(),
  hash: jest.fn(),
}))

// Mock jsonwebtoken
jest.mock("jsonwebtoken", () => ({
  sign: jest.fn(),
  verify: jest.fn(),
}))

describe("UserService", () => {
  let userService: UserService
  let mockSql: jest.Mock

  beforeEach(() => {
    const { neon } = require("@neondatabase/serverless")
    mockSql = jest.fn()
    neon.mockReturnValue(mockSql)
    userService = new UserService()
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  describe("login", () => {
    it("should successfully login with valid credentials", async () => {
      const mockUser = {
        id: "1",
        email: "test@example.com",
        password: "hashedpassword",
        name: "Test User",
        role: "admin",
        is_active: true,
      }

      mockSql.mockResolvedValueOnce([mockUser])

      const bcrypt = require("bcrypt")
      bcrypt.compare.mockResolvedValue(true)

      const jwt = require("jsonwebtoken")
      jwt.sign.mockReturnValue("mock-token")

      const result = await userService.login(
        { email: "test@example.com", password: "password" },
        "127.0.0.1",
        "test-agent",
      )

      expect(result).toHaveProperty("user")
      expect(result).toHaveProperty("token")
      expect(result.user.email).toBe("test@example.com")
      expect(result.token).toBe("mock-token")
    })

    it("should throw error for invalid credentials", async () => {
      mockSql.mockResolvedValueOnce([])

      await expect(
        userService.login({ email: "invalid@example.com", password: "password" }, "127.0.0.1", "test-agent"),
      ).rejects.toThrow(AppError)
    })

    it("should throw error for inactive user", async () => {
      const mockUser = {
        id: "1",
        email: "test@example.com",
        password: "hashedpassword",
        name: "Test User",
        role: "admin",
        is_active: false,
      }

      mockSql.mockResolvedValueOnce([mockUser])

      await expect(
        userService.login({ email: "test@example.com", password: "password" }, "127.0.0.1", "test-agent"),
      ).rejects.toThrow(AppError)
    })
  })

  describe("getUserById", () => {
    it("should return user when found", async () => {
      const mockUser = {
        id: "1",
        email: "test@example.com",
        name: "Test User",
        role: "admin",
        is_active: true,
        created_at: new Date(),
        updated_at: new Date(),
      }

      mockSql.mockResolvedValueOnce([mockUser])

      const result = await userService.getUserById("1")

      expect(result).toEqual(mockUser)
      expect(mockSql).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.stringContaining("SELECT"),
          expect.stringContaining("FROM users"),
          expect.stringContaining("WHERE id ="),
        ]),
      )
    })

    it("should throw error when user not found", async () => {
      mockSql.mockResolvedValueOnce([])

      await expect(userService.getUserById("nonexistent")).rejects.toThrow(AppError)
    })
  })
})
