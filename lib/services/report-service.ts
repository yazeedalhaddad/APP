import { neon } from "@neondatabase/serverless"
import type { ReportRequest, ReportStatus } from "@/types/database"
import { AppError } from "@/lib/utils/errors"

const sql = neon(process.env.DATABASE_URL!)

// In-memory queue for development environment
const reportQueue: Array<{
  taskId: string
  reportData: ReportRequest
  userId: string
}> = []

let isProcessing = false

export class ReportService {
  async generateReport(reportData: ReportRequest, userId: string): Promise<{ taskId: string }> {
    const taskId = `report_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

    // Create initial report record
    await sql`
      INSERT INTO reports (id, type, parameters, status, created_by, created_at)
      VALUES (${taskId}, ${reportData.type}, ${JSON.stringify(reportData.parameters)}, 'pending', ${userId}, NOW())
    `

    // Add to queue
    reportQueue.push({ taskId, reportData, userId })

    // Trigger processing
    this.triggerReportProcessing()

    return { taskId }
  }

  private triggerReportProcessing(): void {
    if (isProcessing || reportQueue.length === 0) return

    isProcessing = true
    const task = reportQueue.shift()!
    this.processReport(task)
  }

  private async processReport(task: { taskId: string; reportData: ReportRequest; userId: string }): Promise<void> {
    try {
      // Update status to processing
      await this.dbUpdateReportStatus(task.taskId, "processing")

      // Simulate report generation work (10-15 seconds)
      await new Promise((resolve) => setTimeout(resolve, Math.random() * 5000 + 10000))

      // Generate mock file path
      const filePath = `/reports/generated/${task.taskId}.pdf`

      // Update status to completed
      await this.dbUpdateReportStatus(task.taskId, "completed", filePath)
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error occurred"
      await this.dbUpdateReportStatus(task.taskId, "failed", undefined, errorMessage)
    } finally {
      isProcessing = false
      // Process next item in queue
      this.triggerReportProcessing()
    }
  }

  private async dbUpdateReportStatus(
    taskId: string,
    status: ReportStatus,
    filePath?: string,
    errorMessage?: string,
  ): Promise<void> {
    await sql`
      UPDATE reports 
      SET 
        status = ${status},
        file_path = ${filePath || null},
        error_message = ${errorMessage || null},
        completed_at = ${status === "completed" || status === "failed" ? new Date().toISOString() : null}
      WHERE id = ${taskId}
    `
  }

  async getReportStatus(taskId: string): Promise<any> {
    const result = await sql`
      SELECT id, type, status, file_path, error_message, created_at, completed_at
      FROM reports
      WHERE id = ${taskId}
    `

    if (result.length === 0) {
      throw new AppError("Report not found", 404)
    }

    return result[0]
  }

  async downloadReport(reportId: string, userId: string): Promise<{ filePath: string; fileName: string }> {
    const result = await sql`
      SELECT file_path, type, created_by
      FROM reports
      WHERE id = ${reportId} AND status = 'completed'
    `

    if (result.length === 0) {
      throw new AppError("Report not found or not completed", 404)
    }

    const report = result[0]

    // Check if user has access to this report
    if (report.created_by !== userId) {
      // Check if user has admin role
      const userResult = await sql`
        SELECT role FROM users WHERE id = ${userId}
      `

      if (userResult.length === 0 || !["admin", "management"].includes(userResult[0].role)) {
        throw new AppError("Access denied", 403)
      }
    }

    return {
      filePath: report.file_path,
      fileName: `${report.type}_report_${reportId}.pdf`,
    }
  }
}

export const reportService = new ReportService()
