import { neon } from "@neondatabase/serverless"

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL environment variable is not set")
}

export const sql = neon(process.env.DATABASE_URL)

// Database utility functions
export async function getUsers() {
  return await sql`
    SELECT id, email, first_name, last_name, role, department, is_active, created_at
    FROM users 
    WHERE is_active = true
    ORDER BY created_at DESC
  `
}

export async function getUserById(id: number) {
  const users = await sql`
    SELECT id, email, first_name, last_name, role, department, is_active, created_at
    FROM users 
    WHERE id = ${id} AND is_active = true
  `
  return users[0] || null
}

export async function getDocuments(limit = 50, offset = 0) {
  return await sql`
    SELECT d.*, u.first_name, u.last_name
    FROM documents d
    LEFT JOIN users u ON d.created_by = u.id
    WHERE d.is_current_version = true
    ORDER BY d.updated_at DESC
    LIMIT ${limit} OFFSET ${offset}
  `
}

export async function getDocumentById(id: number) {
  const documents = await sql`
    SELECT d.*, u.first_name, u.last_name
    FROM documents d
    LEFT JOIN users u ON d.created_by = u.id
    WHERE d.id = ${id}
  `
  return documents[0] || null
}

export async function getAuditLogs(limit = 100, offset = 0) {
  return await sql`
    SELECT a.*, u.first_name, u.last_name
    FROM audit_logs a
    LEFT JOIN users u ON a.user_id = u.id
    ORDER BY a.created_at DESC
    LIMIT ${limit} OFFSET ${offset}
  `
}

export async function getDashboardMetrics(department?: string) {
  if (department) {
    return await sql`
      SELECT * FROM dashboard_metrics 
      WHERE department = ${department}
      ORDER BY recorded_at DESC
    `
  }
  return await sql`
    SELECT * FROM dashboard_metrics 
    ORDER BY recorded_at DESC
  `
}

export async function searchDocuments(query: string) {
  return await sql`
    SELECT d.*, u.first_name, u.last_name
    FROM documents d
    LEFT JOIN users u ON d.created_by = u.id
    WHERE d.is_current_version = true
    AND (
      d.title ILIKE ${"%" + query + "%"} OR 
      d.description ILIKE ${"%" + query + "%"} OR
      d.category ILIKE ${"%" + query + "%"}
    )
    ORDER BY d.updated_at DESC
  `
}

export async function createAuditLog(
  userId: number,
  action: string,
  resourceType: string,
  resourceId?: number,
  details?: any,
  ipAddress?: string,
  userAgent?: string,
) {
  return await sql`
    INSERT INTO audit_logs (user_id, action, resource_type, resource_id, details, ip_address, user_agent)
    VALUES (${userId}, ${action}, ${resourceType}, ${resourceId || null}, ${JSON.stringify(details) || null}, ${ipAddress || null}, ${userAgent || null})
    RETURNING *
  `
}
