import { NextResponse } from "next/server"
import { checkDatabaseHealth } from "@/lib/init-db"

export async function GET() {
  try {
    const dbHealth = await checkDatabaseHealth()

    return NextResponse.json({
      status: "ok",
      timestamp: new Date().toISOString(),
      database: dbHealth,
      version: "1.0.0",
    })
  } catch (error) {
    return NextResponse.json(
      {
        status: "error",
        timestamp: new Date().toISOString(),
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
