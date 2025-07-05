import { type NextRequest, NextResponse } from "next/server"
import { getDashboardMetrics } from "@/lib/database"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const department = searchParams.get("department")

    const metrics = await getDashboardMetrics(department || undefined)
    return NextResponse.json(metrics)
  } catch (error) {
    console.error("Error fetching dashboard metrics:", error)
    return NextResponse.json({ error: "Failed to fetch dashboard metrics" }, { status: 500 })
  }
}
