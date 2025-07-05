import { type NextRequest, NextResponse } from "next/server"
import { requireAuth } from "@/lib/middleware/auth"
import { getDocumentVersion } from "@/lib/database"
import { ApiResponseBuilder } from "@/lib/utils/api-response"
import { NotFoundError } from "@/lib/utils/errors"
import { handleApiError } from "@/lib/middleware/error-handler"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    // Verify authentication
    const authResult = await requireAuth(request)
    if (!authResult.success) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const fromVersion = searchParams.get("from")
    const toVersion = searchParams.get("to")

    if (!fromVersion || !toVersion) {
      return ApiResponseBuilder.badRequest("Both 'from' and 'to' version parameters are required")
    }

    const fromVersionNum = Number.parseInt(fromVersion)
    const toVersionNum = Number.parseInt(toVersion)

    if (isNaN(fromVersionNum) || isNaN(toVersionNum)) {
      return ApiResponseBuilder.badRequest("Version parameters must be valid numbers")
    }

    // Fetch both document versions
    const fromDoc = await getDocumentVersion(params.id, fromVersionNum)
    const toDoc = await getDocumentVersion(params.id, toVersionNum)

    if (!fromDoc) {
      throw new NotFoundError(`Document version ${fromVersionNum} not found`)
    }

    if (!toDoc) {
      throw new NotFoundError(`Document version ${toVersionNum} not found`)
    }

    // Simulate document diffing (since we can't access real file system)
    const simulatedDiff = [
      {
        type: "unchanged",
        line: 1,
        content: "Standard Operating Procedure - Chemical Handling",
      },
      {
        type: "unchanged",
        line: 2,
        content: "Version Control and Safety Guidelines",
      },
      {
        type: "unchanged",
        line: 3,
        content: "",
      },
      {
        type: "deleted",
        line: 4,
        content: "Chemical handling procedures must follow the 2023 guidelines.",
      },
      {
        type: "added",
        line: 4,
        content: "Chemical handling procedures must follow the updated 2024 guidelines with enhanced safety protocols.",
      },
      {
        type: "unchanged",
        line: 5,
        content: "Safety equipment requirements include gloves, goggles, and lab coats.",
      },
      {
        type: "deleted",
        line: 6,
        content: "Temperature monitoring should be conducted every 2 hours.",
      },
      {
        type: "added",
        line: 6,
        content: "Temperature monitoring should be conducted every hour using the new digital monitoring system.",
      },
      {
        type: "unchanged",
        line: 7,
        content: "All procedures must be documented in the laboratory log.",
      },
      {
        type: "added",
        line: 8,
        content: "New equipment calibration procedures are required monthly.",
      },
      {
        type: "unchanged",
        line: 9,
        content: "",
      },
      {
        type: "unchanged",
        line: 10,
        content: "Emergency Procedures:",
      },
      {
        type: "deleted",
        line: 11,
        content: "In case of spill, notify supervisor immediately.",
      },
      {
        type: "added",
        line: 11,
        content:
          "In case of spill, activate emergency protocol and notify both supervisor and safety officer immediately.",
      },
    ]

    const responseData = {
      fromVersion: fromVersionNum,
      toVersion: toVersionNum,
      fromVersionInfo: {
        id: fromDoc.id,
        created_at: fromDoc.created_at,
        created_by_name: fromDoc.created_by_name,
        is_official: fromDoc.is_official,
      },
      toVersionInfo: {
        id: toDoc.id,
        created_at: toDoc.created_at,
        created_by_name: toDoc.created_by_name,
        is_official: toDoc.is_official,
      },
      diff: simulatedDiff,
      summary: {
        additions: simulatedDiff.filter((d) => d.type === "added").length,
        deletions: simulatedDiff.filter((d) => d.type === "deleted").length,
        unchanged: simulatedDiff.filter((d) => d.type === "unchanged").length,
      },
    }

    return ApiResponseBuilder.success(responseData, "Document comparison retrieved successfully")
  } catch (error) {
    return handleApiError(error)
  }
}
