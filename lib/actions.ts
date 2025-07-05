"use server"

import { sql, createAuditLog } from "@/lib/database"
import { revalidatePath } from "next/cache"

export async function createUser(formData: FormData) {
  try {
    const email = formData.get("email") as string
    const firstName = formData.get("firstName") as string
    const lastName = formData.get("lastName") as string
    const role = formData.get("role") as string
    const department = formData.get("department") as string

    // In a real app, you'd hash the password properly
    const passwordHash = "$2b$10$example_hash_" + Math.random().toString(36)

    const result = await sql`
      INSERT INTO users (email, password_hash, first_name, last_name, role, department)
      VALUES (${email}, ${passwordHash}, ${firstName}, ${lastName}, ${role}, ${department})
      RETURNING id
    `

    // Create audit log
    await createAuditLog(1, "USER_CREATED", "USER", result[0].id, {
      email,
      role,
      department,
    })

    revalidatePath("/admin/users")
    return { success: true, message: "User created successfully" }
  } catch (error) {
    console.error("Error creating user:", error)
    return { success: false, message: "Failed to create user" }
  }
}

export async function updateDocumentStatus(documentId: number, status: string, userId: number) {
  try {
    await sql`
      UPDATE documents 
      SET status = ${status}, updated_at = CURRENT_TIMESTAMP
      WHERE id = ${documentId}
    `

    // Create audit log
    await createAuditLog(userId, "DOCUMENT_STATUS_UPDATED", "DOCUMENT", documentId, {
      new_status: status,
    })

    revalidatePath("/documents")
    return { success: true, message: "Document status updated successfully" }
  } catch (error) {
    console.error("Error updating document status:", error)
    return { success: false, message: "Failed to update document status" }
  }
}

export async function generateReport(formData: FormData) {
  try {
    const title = formData.get("title") as string
    const type = formData.get("type") as string
    const parameters = JSON.parse((formData.get("parameters") as string) || "{}")
    const userId = Number.parseInt(formData.get("userId") as string)

    const result = await sql`
      INSERT INTO reports (title, type, parameters, generated_by, status)
      VALUES (${title}, ${type}, ${JSON.stringify(parameters)}, ${userId}, 'pending')
      RETURNING id
    `

    // Create audit log
    await createAuditLog(userId, "REPORT_GENERATED", "REPORT", result[0].id, {
      report_type: type,
      title,
    })

    revalidatePath("/reports")
    return { success: true, message: "Report generation started" }
  } catch (error) {
    console.error("Error generating report:", error)
    return { success: false, message: "Failed to generate report" }
  }
}

export async function recordMetric(metricName: string, metricValue: number, metricType: string, department: string) {
  try {
    await sql`
      INSERT INTO dashboard_metrics (metric_name, metric_value, metric_type, department)
      VALUES (${metricName}, ${metricValue}, ${metricType}, ${department})
    `

    revalidatePath("/dashboard")
    return { success: true, message: "Metric recorded successfully" }
  } catch (error) {
    console.error("Error recording metric:", error)
    return { success: false, message: "Failed to record metric" }
  }
}
