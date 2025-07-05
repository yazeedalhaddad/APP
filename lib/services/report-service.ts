import { v4 as uuidv4 } from "uuid"
import {
  createReport as dbCreateReport,
  getReportByTaskId as dbGetReportByTaskId,
  updateReportStatus as dbUpdateReportStatus,
  createAuditLog,
} from "@/lib/database"
import { NotFoundError } from "@/lib/utils/errors"
import type { Report } from "@/types/database"

export interface GenerateReportData {
  title: string
  type: string
  parameters?: any
}

export interface ReportTaskResult {
  task_id: string
  report_id: string
}

interface ReportTask {
  taskId: string
  reportData: GenerateReportData
  userId: string
  ipAddress?: string
  userAgent?: string
}

// In-memory queue for development environment
const reportQueue: ReportTask[] = []
let isProcessing = false

export class ReportService {
  async generateReport(
    reportData: GenerateReportData,
    userId: string,
    ipAddress?: string,
    userAgent?: string,
  ): Promise<ReportTaskResult> {
    const taskId = uuidv4()

    const report = await dbCreateReport({
      task_id: taskId,
      title: reportData.title,
      type: reportData.type,
      parameters: reportData.parameters,
      generated_by: userId,
    })

    // Create audit log
    await createAuditLog({
      user_id: userId,
      action: "REPORT_GENERATION_STARTED",
      details: {
        report_id: report.id,
        title: reportData.title,
        type: reportData.type,
        task_id: taskId,
      },
      ip_address: ipAddress,
      user_agent: userAgent,
    })

    // Add task to queue and trigger processing
    reportQueue.push({
      taskId,
      reportData,
      userId,
      ipAddress,
      userAgent,
    })

    this.triggerReportProcessing()

    return {
      task_id: taskId,
      report_id: report.id,
    }
  }

  private triggerReportProcessing(): void {
    if (isProcessing || reportQueue.length === 0) return

    isProcessing = true
    const task = reportQueue.shift()!
    this.processReport(task)
  }

  private async processReport(task: ReportTask): Promise<void> {
    try {
      // Simulate report generation work
      await new Promise((resolve) => setTimeout(resolve, 10000 + Math.random() * 5000)) // 10-15 seconds

      // Update report status to completed
      await dbUpdateReportStatus(task.taskId, "completed", `/reports/generated/${task.taskId}.pdf`, undefined)

      // Create audit log for completion
      await createAuditLog({
        user_id: task.userId,
        action: "REPORT_GENERATION_COMPLETED",
        details: {
          task_id: task.taskId,
          title: task.reportData.title,
          type: task.reportData.type,
        },
        ip_address: task.ipAddress,
        user_agent: task.userAgent,
      })
    } catch (error) {
      // Update report status to failed
      await dbUpdateReportStatus(
        task.taskId,
        "failed",
        undefined,
        error instanceof Error ? error.message : "Unknown error occurred",
      )

      // Create audit log for failure
      await createAuditLog({
        user_id: task.userId,
        action: "REPORT_GENERATION_FAILED",
        details: {
          task_id: task.taskId,
          title: task.reportData.title,
          type: task.reportData.type,
          error: error instanceof Error ? error.message : "Unknown error",
        },
        ip_address: task.ipAddress,
        user_agent: task.userAgent,
      })
    } finally {
      isProcessing = false
      // Process next item in queue if any
      this.triggerReportProcessing()
    }
  }

  async getReportStatus(taskId: string): Promise<Report> {
    const report = await dbGetReportByTaskId(taskId)
    if (!report) {
      throw new NotFoundError("Report not found")
    }
    return report
  }

  async downloadReport(
    reportId: string,
    userId: string,
    ipAddress?: string,
    userAgent?: string,
  ): Promise<{ download_url: string; filename: string }> {
    const report = await dbGetReportByTaskId(reportId)
    if (!report) {
      throw new NotFoundError("Report not found")
    }

    if (report.status !== "completed" || !report.file_path) {
      throw new NotFoundError("Report is not ready for download")
    }

    // Create audit log
    await createAuditLog({
      user_id: userId,
      action: "REPORT_DOWNLOADED",
      details: { report_id: report.id, title: report.title },
      ip_address: ipAddress,
      user_agent: userAgent,
    })

    return {
      download_url: report.file_path,
      filename: `${report.title}.pdf`,
    }
  }

  async updateReportStatus(taskId: string, status: string, filePath?: string, errorMessage?: string): Promise<Report> {
    const report = await dbUpdateReportStatus(taskId, status, filePath, errorMessage)
    if (!report) {
      throw new NotFoundError("Report not found")
    }
    return report
  }
}

export const reportService = new ReportService()
