import { describe, it, expect, jest, beforeEach } from "@jest/globals"
import { UserService } from "@/lib/services/user-service"
import { AuthenticationError, ConflictError } from "@/lib/utils/errors"

// Mock the database functions
jest.mock("@/lib/database", () => ({
  getUserByEmail: jest.fn(),
  getUserById: jest.fn(),
  getAllUsers: jest.fn(),
  createUser: jest.fn(),
  updateUser: jest.fn(),
  deleteUser: jest.fn(),
  createAuditLog: jest.fn(),
}))

// Mock bcrypt
jest.mock("bcryptjs", () => ({
  compare: jest.fn(),
  hash: jest.fn(),
}))

// Mock auth middleware
jest.mock("@/lib/middleware/auth", () => ({
  generateToken: jest.fn(),
}))

describe("UserService", () => {
  let userService: UserService

  beforeEach(() => {
    userService = new UserService()
    jest.clearAllMocks()
  })

  describe("login", () => {
    it("should successfully login with valid credentials", async () => {
      const mockUser = {
        id: "user-1",
        email: "test@example.com",
        password: "hashedPassword",
        name: "Test User",
        role: "admin",
      }

      const { getUserByEmail, createAuditLog } = await import("@/lib/database")
      const bcrypt = await import("bcryptjs")
      const { generateToken } = await import("@/lib/middleware/auth")
      ;(getUserByEmail as jest.Mock).mockResolvedValue(mockUser)
      ;(bcrypt.compare as jest.Mock).mockResolvedValue(true)
      ;(generateToken as jest.Mock).mockReturnValue("mock-token")
      ;(createAuditLog as jest.Mock).mockResolvedValue({})

      const result = await userService.login({
        email: "test@example.com",
        password: "password123",
      })

      expect(result).toEqual({
        user: {
          id: "user-1",
          email: "test@example.com",
          name: "Test User",
          role: "admin",
        },
        token: "mock-token",
      })

      expect(createAuditLog).toHaveBeenCalledWith({
        user_id: "user-1",
        action: "USER_LOGIN",
        details: { email: "test@example.com" },
        ip_address: undefined,
        user_agent: undefined,
      })
    })

    it("should throw AuthenticationError for invalid email", async () => {
      const { getUserByEmail } = await import("@/lib/database")
      ;(getUserByEmail as jest.Mock).mockResolvedValue(null)

      await expect(
        userService.login({
          email: "invalid@example.com",
          password: "password123",
        }),
      ).rejects.toThrow(AuthenticationError)
    })

    it("should throw AuthenticationError for invalid password", async () => {
      const mockUser = {
        id: "user-1",
        email: "test@example.com",
        password: "hashedPassword",
      }

      const { getUserByEmail } = await import("@/lib/database")
      const bcrypt = await import("bcryptjs")
      ;(getUserByEmail as jest.Mock).mockResolvedValue(mockUser)
      ;(bcrypt.compare as jest.Mock).mockResolvedValue(false)

      await expect(
        userService.login({
          email: "test@example.com",
          password: "wrongpassword",
        }),
      ).rejects.toThrow(AuthenticationError)
    })
  })

  describe("createUser", () => {
    it("should successfully create a new user", async () => {
      const userData = {
        name: "New User",
        email: "new@example.com",
        password: "password123",
        role: "production",
        department: "Manufacturing",
      }

      const mockNewUser = {
        id: "user-2",
        ...userData,
        password: "hashedPassword",
      }

      const { getUserByEmail, createUser, createAuditLog } = await import("@/lib/database")
      const bcrypt = await import("bcryptjs")
      ;(getUserByEmail as jest.Mock).mockResolvedValue(null)
      ;(bcrypt.hash as jest.Mock).mockResolvedValue("hashedPassword")
      ;(createUser as jest.Mock).mockResolvedValue(mockNewUser)
      ;(createAuditLog as jest.Mock).mockResolvedValue({})

      const result = await userService.createUser(userData, "admin-1")

      expect(result).toEqual(mockNewUser)
      expect(bcrypt.hash).toHaveBeenCalledWith("password123", 12)
      expect(createUser).toHaveBeenCalledWith({
        ...userData,
        password: "hashedPassword",
      })
    })

    it("should throw ConflictError when email already exists", async () => {
      const userData = {
        name: "New User",
        email: "existing@example.com",
        password: "password123",
        role: "production",
        department: "Manufacturing",
      }

      const { getUserByEmail } = await import("@/lib/database")
      ;(getUserByEmail as jest.Mock).mockResolvedValue({ id: "existing-user" })

      await expect(userService.createUser(userData, "admin-1")).rejects.toThrow(ConflictError)
    })
  })
})
