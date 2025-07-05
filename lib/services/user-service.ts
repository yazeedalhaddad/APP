import bcrypt from "bcryptjs"
import {
  getUserById,
  getUserByEmail,
  getAllUsers,
  createUser as dbCreateUser,
  updateUser as dbUpdateUser,
  deleteUser as dbDeleteUser,
  createAuditLog,
} from "@/lib/database"
import { generateToken } from "@/lib/middleware/auth"
import { AuthenticationError, ConflictError, NotFoundError } from "@/lib/utils/errors"
import type { User } from "@/types/database"

export interface LoginCredentials {
  email: string
  password: string
}

export interface CreateUserData {
  name: string
  email: string
  password: string
  role: string
  department: string
}

export interface UpdateUserData {
  name?: string
  email?: string
  role?: string
  department?: string
  status?: string
}

export interface LoginResult {
  user: Omit<User, "password">
  token: string
}

export class UserService {
  async login(credentials: LoginCredentials, ipAddress?: string, userAgent?: string): Promise<LoginResult> {
    const user = await getUserByEmail(credentials.email)
    if (!user) {
      throw new AuthenticationError("Invalid credentials")
    }

    const isValidPassword = await bcrypt.compare(credentials.password, user.password)
    if (!isValidPassword) {
      throw new AuthenticationError("Invalid credentials")
    }

    const token = generateToken(user.id)

    // Create audit log
    await createAuditLog({
      user_id: user.id,
      action: "USER_LOGIN",
      details: { email: credentials.email },
      ip_address: ipAddress,
      user_agent: userAgent,
    })

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user

    return {
      user: userWithoutPassword,
      token,
    }
  }

  async getUserById(id: string): Promise<User> {
    const user = await getUserById(id)
    if (!user) {
      throw new NotFoundError("User not found")
    }
    return user
  }

  async getAllUsers(limit = 50, offset = 0): Promise<User[]> {
    return await getAllUsers(limit, offset)
  }

  async createUser(userData: CreateUserData, createdBy: string, ipAddress?: string, userAgent?: string): Promise<User> {
    // Check if user already exists
    const existingUser = await getUserByEmail(userData.email)
    if (existingUser) {
      throw new ConflictError("User with this email already exists")
    }

    const hashedPassword = await bcrypt.hash(userData.password, 12)

    const newUser = await dbCreateUser({
      ...userData,
      password: hashedPassword,
    })

    // Create audit log
    await createAuditLog({
      user_id: createdBy,
      action: "USER_CREATED",
      details: {
        created_user_id: newUser.id,
        email: userData.email,
        role: userData.role,
        department: userData.department,
      },
      ip_address: ipAddress,
      user_agent: userAgent,
    })

    return newUser
  }

  async updateUser(
    id: string,
    updates: UpdateUserData,
    updatedBy: string,
    ipAddress?: string,
    userAgent?: string,
  ): Promise<User> {
    const existingUser = await getUserById(id)
    if (!existingUser) {
      throw new NotFoundError("User not found")
    }

    // Check email uniqueness if email is being updated
    if (updates.email && updates.email !== existingUser.email) {
      const userWithEmail = await getUserByEmail(updates.email)
      if (userWithEmail) {
        throw new ConflictError("Email already in use")
      }
    }

    const updatedUser = await dbUpdateUser(id, updates)
    if (!updatedUser) {
      throw new NotFoundError("User not found")
    }

    // Create audit log
    await createAuditLog({
      user_id: updatedBy,
      action: "USER_UPDATED",
      details: { updated_user_id: id, updates },
      ip_address: ipAddress,
      user_agent: userAgent,
    })

    return updatedUser
  }

  async deleteUser(id: string, deletedBy: string, ipAddress?: string, userAgent?: string): Promise<void> {
    const existingUser = await getUserById(id)
    if (!existingUser) {
      throw new NotFoundError("User not found")
    }

    await dbDeleteUser(id)

    // Create audit log
    await createAuditLog({
      user_id: deletedBy,
      action: "USER_DELETED",
      details: { deleted_user_id: id, email: existingUser.email },
      ip_address: ipAddress,
      user_agent: userAgent,
    })
  }

  async logout(userId: string, email: string, ipAddress?: string, userAgent?: string): Promise<void> {
    await createAuditLog({
      user_id: userId,
      action: "USER_LOGOUT",
      details: { email },
      ip_address: ipAddress,
      user_agent: userAgent,
    })
  }
}

export const userService = new UserService()
