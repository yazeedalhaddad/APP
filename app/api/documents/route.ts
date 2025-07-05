import { type NextRequest, NextResponse } from "next/server"
import { getDocuments, searchDocuments } from "@/lib/database"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get("q")
    const limit = Number.parseInt(searchParams.get("limit") || "50")
    const offset = Number.parseInt(searchParams.get("offset") || "0")

    let documents
    if (query) {
      documents = await searchDocuments(query)
    } else {
      documents = await getDocuments(limit, offset)
    }

    return NextResponse.json(documents)
  } catch (error) {
    console.error("Error fetching documents:", error)
    return NextResponse.json({ error: "Failed to fetch documents" }, { status: 500 })
  }
}
