import jwt from "jsonwebtoken"
import type { NextRequest } from "next/server"
import { getUserById } from "@/lib/database"
import { config } from "@/lib/config"

export interface AuthResult {
  success: boolean
  user?: any
  error?: string
}

export function generateToken(userId: string): string {
  return jwt.sign({ userId }, config.auth.jwtSecret, { expiresIn: "24h" })
}

export function verifyToken(token: string): { userId: string } | null {
  try {
    const decoded = jwt.verify(token, config.auth.jwtSecret) as { userId: string }
    return decoded
  } catch {
    return null
  }
}

export async function requireAuth(request: NextRequest): Promise<any> {
  try {
    const authHeader = request.headers.get("authorization")
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      throw new Error("No token provided")
    }

    const token = authHeader.substring(7)
    const decoded = verifyToken(token)
    if (!decoded) {
      throw new Error("Invalid token")
    }

    const user = await getUserById(decoded.userId)
    if (!user) {
      throw new Error("User not found")
    }

    return user
  } catch (error) {
    throw new Error("Authentication failed")
  }
}

export async function requireRole(request: NextRequest, allowedRoles: string[]): Promise<any> {
  const user = await requireAuth(request)

  if (!allowedRoles.includes(user.role)) {
    throw new Error("Insufficient permissions")
  }

  return user
}

export function getClientIP(request: NextRequest): string {
  const forwarded = request.headers.get("x-forwarded-for")
  const realIP = request.headers.get("x-real-ip")

  if (forwarded) {
    return forwarded.split(",")[0].trim()
  }

  if (realIP) {
    return realIP
  }

  return "unknown"
}

export function getUserAgent(request: NextRequest): string {
  return request.headers.get("user-agent") || "unknown"
}
