import { type NextRequest, NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import { requireRole, getClientIP, getUserAgent } from "@/lib/middleware"
import { getAllUsers, createUser, createAuditLog } from "@/lib/database"

export async function GET(request: NextRequest) {
  try {
    await requireRole(request, ["admin"])

    const { searchParams } = new URL(request.url)
    const limit = Number.parseInt(searchParams.get("limit") || "50")
    const offset = Number.parseInt(searchParams.get("offset") || "0")

    const users = await getAllUsers(limit, offset)

    return NextResponse.json({
      success: true,
      data: users,
    })
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Failed to fetch users" },
      {
        status:
          error instanceof Error && error.message === "Authentication required"
            ? 401
            : error instanceof Error && error.message === "Insufficient permissions"
              ? 403
              : 500,
      },
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireRole(request, ["admin"])
    const { name, email, password, role, department } = await request.json()

    if (!name || !email || !password || !role) {
      return NextResponse.json(
        { success: false, error: "Name, email, password, and role are required" },
        { status: 400 },
      )
    }

    const hashedPassword = await bcrypt.hash(password, 10)

    const newUser = await createUser({
      name,
      email,
      password: hashedPassword,
      role,
      department: department || "",
    })

    // Create audit log
    await createAuditLog({
      user_id: user.id,
      action: "USER_CREATED",
      details: { created_user_id: newUser.id, email, role, department },
      ip_address: getClientIP(request),
      user_agent: getUserAgent(request),
    })

    return NextResponse.json({
      success: true,
      data: newUser,
      message: "User created successfully",
    })
  } catch (error) {
    console.error("Create user error:", error)
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Failed to create user" },
      {
        status:
          error instanceof Error && error.message === "Authentication required"
            ? 401
            : error instanceof Error && error.message === "Insufficient permissions"
              ? 403
              : 500,
      },
    )
  }
}
