import { type NextRequest, NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import { getUserByEmail, createAuditLog } from "@/lib/database"
import { generateToken, getClientIP, getUserAgent } from "@/lib/middleware"

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json({ success: false, error: "Email and password are required" }, { status: 400 })
    }

    const user = await getUserByEmail(email)
    if (!user) {
      return NextResponse.json({ success: false, error: "Invalid credentials" }, { status: 401 })
    }

    const isValidPassword = await bcrypt.compare(password, user.password)
    if (!isValidPassword) {
      return NextResponse.json({ success: false, error: "Invalid credentials" }, { status: 401 })
    }

    const token = generateToken(user.id)

    // Create audit log
    await createAuditLog({
      user_id: user.id,
      action: "USER_LOGIN",
      details: { email },
      ip_address: getClientIP(request),
      user_agent: getUserAgent(request),
    })

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user

    return NextResponse.json({
      success: true,
      data: {
        user: userWithoutPassword,
        token,
      },
    })
  } catch (error) {
    console.error("Login error:", error)
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 })
  }
}
