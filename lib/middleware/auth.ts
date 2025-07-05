import type { NextRequest } from "next/server"
import jwt from "jsonwebtoken"
import { getUserById } from "@/lib/database"
import { AuthenticationError, AuthorizationError } from "@/lib/utils/errors"

const JWT_SECRET = process.env.JWT_SECRET
if (!JWT_SECRET) {
  throw new Error("JWT_SECRET environment variable is not set")
}

export interface AuthenticatedUser {
  id: string
  email: string
  role: string
  name: string
}

export function generateToken(userId: string): string {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: "24h" })
}

export function verifyToken(token: string): { userId: string } {
  try {
    return jwt.verify(token, JWT_SECRET) as { userId: string }
  } catch (error) {
    throw new AuthenticationError("Invalid or expired token")
  }
}

export function getAuthToken(request: NextRequest): string {
  const authHeader = request.headers.get("authorization")
  if (!authHeader) {
    throw new AuthenticationError("Authorization header missing")
  }

  const [bearer, token] = authHeader.split(" ")
  if (bearer !== "Bearer" || !token) {
    throw new AuthenticationError("Invalid authorization header format")
  }

  return token
}

export async function requireAuth(request: NextRequest): Promise<AuthenticatedUser> {
  const token = getAuthToken(request)
  const { userId } = verifyToken(token)

  const user = await getUserById(userId)
  if (!user) {
    throw new AuthenticationError("User not found")
  }

  return {
    id: user.id,
    email: user.email,
    role: user.role,
    name: user.name,
  }
}

export async function requireRole(request: NextRequest, roles: string[]): Promise<AuthenticatedUser> {
  const user = await requireAuth(request)

  if (!roles.includes(user.role)) {
    throw new AuthorizationError(`Required role: ${roles.join(" or ")}`)
  }

  return user
}

export function getClientIP(request: NextRequest): string {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0] || request.headers.get("x-real-ip") || request.ip || "unknown"
  )
}

export function getUserAgent(request: NextRequest): string {
  return request.headers.get("user-agent") || "unknown"
}
