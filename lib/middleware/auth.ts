import jwt from "jsonwebtoken"
import type { NextRequest } from "next/server"
import { getUserById } from "@/lib/database"

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key"

export interface AuthResult {
  success: boolean
  user?: any
  error?: string
}

export function generateToken(userId: string): string {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: "24h" })
}

export function verifyToken(token: string): { userId: string } | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string }
    return decoded
  } catch {
    return null
  }
}

export async function requireAuth(request: NextRequest): Promise<AuthResult> {
  try {
    const authHeader = request.headers.get("authorization")
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return { success: false, error: "No token provided" }
    }

    const token = authHeader.substring(7)
    const decoded = verifyToken(token)
    if (!decoded) {
      return { success: false, error: "Invalid token" }
    }

    const user = await getUserById(decoded.userId)
    if (!user) {
      return { success: false, error: "User not found" }
    }

    return { success: true, user }
  } catch (error) {
    return { success: false, error: "Authentication failed" }
  }
}

export async function requireRole(request: NextRequest, allowedRoles: string[]): Promise<AuthResult> {
  const authResult = await requireAuth(request)
  if (!authResult.success) {
    return authResult
  }

  if (!allowedRoles.includes(authResult.user.role)) {
    return { success: false, error: "Insufficient permissions" }
  }

  return authResult
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
