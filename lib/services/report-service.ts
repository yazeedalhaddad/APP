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

    // TODO: Add report to message queue for processing
    // This would typically involve adding the task to a queue like RabbitMQ or AWS SQS

    return {
      task_id: taskId,
      report_id: report.id,
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
