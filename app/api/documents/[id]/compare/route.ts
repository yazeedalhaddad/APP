import type { NextRequest } from "next/server"
import { requireAuth } from "@/lib/middleware/auth"
import { ApiResponseBuilder } from "@/lib/utils/api-response"
import { handleApiError } from "@/lib/middleware/error-handler"
import { neon } from "@neondatabase/serverless"
import { AppError } from "@/lib/utils/errors"

const sql = neon(process.env.DATABASE_URL!)

async function compareHandler(request: NextRequest, { params }: { params: { id: string } }) {
  const user = await requireAuth(request)
  const { searchParams } = new URL(request.url)

  const fromVersion = searchParams.get("from")
  const toVersion = searchParams.get("to")

  if (!fromVersion || !toVersion) {
    throw new AppError("Both 'from' and 'to' version parameters are required", 400)
  }

  const fromVersionNum = Number.parseInt(fromVersion)
  const toVersionNum = Number.parseInt(toVersion)

  if (isNaN(fromVersionNum) || isNaN(toVersionNum)) {
    throw new AppError("Version parameters must be valid numbers", 400)
  }

  // Fetch both versions
  const versions = await sql`
    SELECT version_number, file_path, created_at
    FROM document_versions
    WHERE document_id = ${params.id} 
    AND version_number IN (${fromVersionNum}, ${toVersionNum})
    ORDER BY version_number
  `

  if (versions.length !== 2) {
    throw new AppError("One or both versions not found", 404)
  }

  // Check if user has access to this document
  const document = await sql`
    SELECT id, classification, owner_id
    FROM documents
    WHERE id = ${params.id}
  `

  if (document.length === 0) {
    throw new AppError("Document not found", 404)
  }

  const doc = document[0]

  // Check access permissions
  if (doc.owner_id !== user.id && !["admin", "management"].includes(user.role)) {
    if (doc.classification === "confidential" && user.role !== "management") {
      throw new AppError("Access denied", 403)
    }
  }

  // Simulate diff generation (since we can't access real files)
  const mockDiff = generateMockDiff(fromVersionNum, toVersionNum)

  const comparison = {
    fromVersion: fromVersionNum,
    toVersion: toVersionNum,
    fromDate: versions.find((v) => v.version_number === fromVersionNum)?.created_at,
    toDate: versions.find((v) => v.version_number === toVersionNum)?.created_at,
    diff: mockDiff,
  }

  return ApiResponseBuilder.success(comparison, "Document comparison generated successfully")
}

function generateMockDiff(fromVersion: number, toVersion: number) {
  // Generate realistic mock diff data
  const changes = [
    {
      type: "unchanged",
      line: 1,
      content: "# Document Title",
    },
    {
      type: "unchanged",
      line: 2,
      content: "",
    },
    {
      type: "unchanged",
      line: 3,
      content: "## Safety Procedures",
    },
    {
      type: "deleted",
      line: 4,
      content: `Version ${fromVersion}: Old safety protocol requires manual inspection every 2 hours.`,
    },
    {
      type: "added",
      line: 4,
      content: `Version ${toVersion}: Updated safety protocol requires automated monitoring with manual inspection every 4 hours.`,
    },
    {
      type: "unchanged",
      line: 5,
      content: "",
    },
    {
      type: "unchanged",
      line: 6,
      content: "## Equipment Requirements",
    },
    {
      type: "unchanged",
      line: 7,
      content: "- Safety goggles",
    },
    {
      type: "unchanged",
      line: 8,
      content: "- Protective gloves",
    },
    {
      type: "added",
      line: 9,
      content: "- Emergency shutdown button access",
    },
    {
      type: "unchanged",
      line: 10,
      content: "",
    },
    {
      type: "modified",
      line: 11,
      oldContent: "Temperature range: 20-25°C",
      newContent: "Temperature range: 18-27°C (expanded for seasonal variation)",
    },
  ]

  return changes
}

export const GET = async (request: NextRequest, context: any) => {
  try {
    return await compareHandler(request, context)
  } catch (error) {
    return handleApiError(error)
  }
}
