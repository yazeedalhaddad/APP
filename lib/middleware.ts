import type { NextRequest } from "next/server"
import jwt from "jsonwebtoken"
import { getUserById, checkDocumentPermission } from "./database"

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key"

export interface AuthenticatedRequest extends NextRequest {
  user?: {
    id: string
    name: string
    email: string
    role: string
    department: string
  }
}

export async function authenticateToken(request: NextRequest) {
  const authHeader = request.headers.get("authorization")
  const token = authHeader && authHeader.split(" ")[1]

  if (!token) {
    return null
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any
    const user = await getUserById(decoded.userId)

    if (!user) {
      return null
    }

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      department: user.department,
    }
  } catch (error) {
    return null
  }
}

export function generateToken(userId: string) {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: "24h" })
}

export async function requireAuth(request: NextRequest) {
  const user = await authenticateToken(request)
  if (!user) {
    throw new Error("Authentication required")
  }
  return user
}

export async function requireRole(request: NextRequest, allowedRoles: string[]) {
  const user = await requireAuth(request)
  if (!allowedRoles.includes(user.role)) {
    throw new Error("Insufficient permissions")
  }
  return user
}

export async function requireDocumentPermission(
  request: NextRequest,
  documentId: string,
  permissionType: "read" | "write" | "approve",
) {
  const user = await requireAuth(request)

  // Admin has all permissions
  if (user.role === "admin") {
    return user
  }

  // Management can approve all documents
  if (user.role === "management" && permissionType === "approve") {
    return user
  }

  // Check specific document permissions
  const hasPermission = await checkDocumentPermission(documentId, user.id, permissionType)
  if (!hasPermission) {
    throw new Error("Insufficient document permissions")
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
