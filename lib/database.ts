import { neon } from "@neondatabase/serverless"

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL environment variable is not set")
}

export const sql = neon(process.env.DATABASE_URL)

// User management functions
export async function getUserById(id: string) {
  const users = await sql`
    SELECT id, name, email, role, department, status, created_at, updated_at
    FROM users 
    WHERE id = ${id} AND status = 'active'
  `
  return users[0] || null
}

export async function getUserByEmail(email: string) {
  const users = await sql`
    SELECT id, name, email, password, role, department, status, created_at, updated_at
    FROM users 
    WHERE email = ${email} AND status = 'active'
  `
  return users[0] || null
}

export async function getAllUsers(limit = 50, offset = 0) {
  return await sql`
    SELECT id, name, email, role, department, status, created_at, updated_at
    FROM users 
    ORDER BY created_at DESC
    LIMIT ${limit} OFFSET ${offset}
  `
}

export async function createUser(userData: {
  name: string
  email: string
  password: string
  role: string
  department: string
}) {
  const result = await sql`
    INSERT INTO users (name, email, password, role, department)
    VALUES (${userData.name}, ${userData.email}, ${userData.password}, ${userData.role}, ${userData.department})
    RETURNING id, name, email, role, department, status, created_at, updated_at
  `
  return result[0]
}

export async function updateUser(id: string, updates: any) {
  const setParts = []
  const values = []

  Object.keys(updates).forEach((key) => {
    if (updates[key] !== undefined) {
      setParts.push(`${key} = $${setParts.length + 1}`)
      values.push(updates[key])
    }
  })

  if (setParts.length === 0) return null

  const result = await sql`
    UPDATE users 
    SET ${sql.unsafe(setParts.join(", "))}, updated_at = CURRENT_TIMESTAMP
    WHERE id = ${id}
    RETURNING id, name, email, role, department, status, created_at, updated_at
  `
  return result[0] || null
}

export async function deleteUser(id: string) {
  await sql`
    UPDATE users 
    SET status = 'inactive', updated_at = CURRENT_TIMESTAMP
    WHERE id = ${id}
  `
}

// Document management functions
export async function getDocuments(
  filters: {
    limit?: number
    offset?: number
    classification?: string
    owner_id?: string
    search?: string
  } = {},
) {
  const { limit = 50, offset = 0, classification, owner_id, search } = filters

  let query = sql`
    SELECT d.*, u.name as owner_name, u.email as owner_email,
           dv.version_number as current_version, dv.file_path, dv.file_size
    FROM documents d
    LEFT JOIN users u ON d.owner_id = u.id
    LEFT JOIN document_versions dv ON d.id = dv.document_id AND dv.is_official = true
    WHERE 1=1
  `

  if (classification) {
    query = sql`${query} AND d.classification = ${classification}`
  }

  if (owner_id) {
    query = sql`${query} AND d.owner_id = ${owner_id}`
  }

  if (search) {
    query = sql`${query} AND to_tsvector('english', d.title || ' ' || COALESCE(d.description, '')) @@ plainto_tsquery('english', ${search})`
  }

  query = sql`${query} ORDER BY d.updated_at DESC LIMIT ${limit} OFFSET ${offset}`

  return await query
}

export async function getDocumentById(id: string) {
  const documents = await sql`
    SELECT d.*, u.name as owner_name, u.email as owner_email
    FROM documents d
    LEFT JOIN users u ON d.owner_id = u.id
    WHERE d.id = ${id}
  `
  return documents[0] || null
}

export async function getDocumentVersions(documentId: string) {
  return await sql`
    SELECT dv.*, u.name as created_by_name
    FROM document_versions dv
    LEFT JOIN users u ON dv.created_by = u.id
    WHERE dv.document_id = ${documentId}
    ORDER BY dv.version_number DESC
  `
}

export async function getDocumentVersion(documentId: string, versionNumber: number) {
  const versions = await sql`
    SELECT dv.*, u.name as created_by_name
    FROM document_versions dv
    LEFT JOIN users u ON dv.created_by = u.id
    WHERE dv.document_id = ${documentId} AND dv.version_number = ${versionNumber}
  `
  return versions[0] || null
}

export async function createDocument(documentData: {
  title: string
  description?: string
  file_type: string
  classification: string
  owner_id: string
  file_path: string
  file_size: number
}) {
  const result = await sql`
    INSERT INTO documents (title, description, file_type, classification, owner_id)
    VALUES (${documentData.title}, ${documentData.description || null}, ${documentData.file_type}, ${documentData.classification}, ${documentData.owner_id})
    RETURNING *
  `

  const document = result[0]

  // Create initial version
  await sql`
    INSERT INTO document_versions (document_id, version_number, is_official, file_path, file_size, created_by)
    VALUES (${document.id}, 1, true, ${documentData.file_path}, ${documentData.file_size}, ${documentData.owner_id})
  `

  return document
}

export async function updateDocument(id: string, updates: any) {
  const setParts = []
  Object.keys(updates).forEach((key) => {
    if (updates[key] !== undefined) {
      setParts.push(`${key} = $${setParts.length + 1}`)
    }
  })

  if (setParts.length === 0) return null

  const result = await sql`
    UPDATE documents 
    SET ${sql.unsafe(setParts.join(", "))}, updated_at = CURRENT_TIMESTAMP
    WHERE id = ${id}
    RETURNING *
  `
  return result[0] || null
}

export async function deleteDocument(id: string) {
  await sql`DELETE FROM documents WHERE id = ${id}`
}

export async function searchDocuments(query: string) {
  return await sql`
    SELECT d.*, u.name as owner_name, u.email as owner_email
    FROM documents d
    LEFT JOIN users u ON d.owner_id = u.id
    WHERE to_tsvector('english', d.title || ' ' || COALESCE(d.description, '')) @@ plainto_tsquery('english', ${query})
    ORDER BY d.updated_at DESC
  `
}

// Draft management functions
export async function getDrafts(
  filters: {
    limit?: number
    offset?: number
    document_id?: string
    creator_id?: string
    status?: string
  } = {},
) {
  const { limit = 50, offset = 0, document_id, creator_id, status } = filters

  let query = sql`
    SELECT dr.*, d.title as document_title, u.name as creator_name,
           dv.version_number as base_version
    FROM drafts dr
    LEFT JOIN documents d ON dr.document_id = d.id
    LEFT JOIN users u ON dr.creator_id = u.id
    LEFT JOIN document_versions dv ON dr.base_version_id = dv.id
    WHERE 1=1
  `

  if (document_id) {
    query = sql`${query} AND dr.document_id = ${document_id}`
  }

  if (creator_id) {
    query = sql`${query} AND dr.creator_id = ${creator_id}`
  }

  if (status) {
    query = sql`${query} AND dr.status = ${status}`
  }

  query = sql`${query} ORDER BY dr.updated_at DESC LIMIT ${limit} OFFSET ${offset}`

  return await query
}

export async function getDraftById(id: string) {
  const drafts = await sql`
    SELECT dr.*, d.title as document_title, u.name as creator_name,
           dv.version_number as base_version
    FROM drafts dr
    LEFT JOIN documents d ON dr.document_id = d.id
    LEFT JOIN users u ON dr.creator_id = u.id
    LEFT JOIN document_versions dv ON dr.base_version_id = dv.id
    WHERE dr.id = ${id}
  `
  return drafts[0] || null
}

export async function createDraft(draftData: {
  document_id: string
  name: string
  description?: string
  creator_id: string
  base_version_id: string
  file_path?: string
}) {
  const result = await sql`
    INSERT INTO drafts (document_id, name, description, creator_id, base_version_id, file_path)
    VALUES (${draftData.document_id}, ${draftData.name}, ${draftData.description || null}, ${draftData.creator_id}, ${draftData.base_version_id}, ${draftData.file_path || null})
    RETURNING *
  `
  return result[0]
}

export async function updateDraft(id: string, updates: any) {
  const setParts = []
  Object.keys(updates).forEach((key) => {
    if (updates[key] !== undefined) {
      setParts.push(`${key} = $${setParts.length + 1}`)
    }
  })

  if (setParts.length === 0) return null

  const result = await sql`
    UPDATE drafts 
    SET ${sql.unsafe(setParts.join(", "))}, updated_at = CURRENT_TIMESTAMP
    WHERE id = ${id}
    RETURNING *
  `
  return result[0] || null
}

export async function deleteDraft(id: string) {
  await sql`DELETE FROM drafts WHERE id = ${id}`
}

// Merge request functions
export async function getMergeRequests(
  filters: {
    limit?: number
    offset?: number
    status?: string
    approver_id?: string
  } = {},
) {
  const { limit = 50, offset = 0, status, approver_id } = filters

  let query = sql`
    SELECT mr.*, dr.name as draft_name, d.title as document_title,
           u1.name as creator_name, u2.name as approver_name
    FROM merge_requests mr
    LEFT JOIN drafts dr ON mr.draft_id = dr.id
    LEFT JOIN documents d ON dr.document_id = d.id
    LEFT JOIN users u1 ON dr.creator_id = u1.id
    LEFT JOIN users u2 ON mr.approver_id = u2.id
    WHERE 1=1
  `

  if (status) {
    query = sql`${query} AND mr.status = ${status}`
  }

  if (approver_id) {
    query = sql`${query} AND mr.approver_id = ${approver_id}`
  }

  query = sql`${query} ORDER BY mr.created_at DESC LIMIT ${limit} OFFSET ${offset}`

  return await query
}

export async function getMergeRequestById(id: string) {
  const mergeRequests = await sql`
    SELECT mr.*, dr.name as draft_name, d.title as document_title,
           u1.name as creator_name, u2.name as approver_name
    FROM merge_requests mr
    LEFT JOIN drafts dr ON mr.draft_id = dr.id
    LEFT JOIN documents d ON dr.document_id = d.id
    LEFT JOIN users u1 ON dr.creator_id = u1.id
    LEFT JOIN users u2 ON mr.approver_id = u2.id
    WHERE mr.id = ${id}
  `
  return mergeRequests[0] || null
}

export async function createMergeRequest(mergeRequestData: {
  draft_id: string
  approver_id: string
  summary: string
}) {
  const result = await sql`
    INSERT INTO merge_requests (draft_id, approver_id, summary)
    VALUES (${mergeRequestData.draft_id}, ${mergeRequestData.approver_id}, ${mergeRequestData.summary})
    RETURNING *
  `
  return result[0]
}

export async function updateMergeRequestStatus(id: string, status: string, userId: string, rejectionReason?: string) {
  const timestamp = status === "approved" ? "approved_at" : "rejected_at"

  const result = await sql`
    UPDATE merge_requests 
    SET status = ${status}, 
        ${sql.unsafe(timestamp)} = CURRENT_TIMESTAMP
        ${status === "rejected" && rejectionReason ? sql`, rejection_reason = ${rejectionReason}` : sql``}
    WHERE id = ${id}
    RETURNING *
  `

  if (status === "approved" && result[0]) {
    // Get the draft and create new official version
    const draft = await getDraftById(result[0].draft_id)
    if (draft && draft.file_path) {
      // Get the next version number
      const versions = await getDocumentVersions(draft.document_id)
      const nextVersion = Math.max(...versions.map((v) => v.version_number)) + 1

      // Mark all previous versions as non-official
      await sql`
        UPDATE document_versions 
        SET is_official = false 
        WHERE document_id = ${draft.document_id}
      `

      // Create new official version from draft
      await sql`
        INSERT INTO document_versions (document_id, version_number, is_official, file_path, created_by)
        VALUES (${draft.document_id}, ${nextVersion}, true, ${draft.file_path}, ${userId})
      `

      // Update draft status
      await updateDraft(draft.id, { status: "approved" })
    }
  }

  return result[0] || null
}

// Audit log functions
export async function createAuditLog(auditData: {
  user_id: string
  action: string
  document_id?: string
  draft_id?: string
  merge_request_id?: string
  details?: any
  ip_address?: string
  user_agent?: string
}) {
  const result = await sql`
    INSERT INTO audit_log (user_id, action, document_id, draft_id, merge_request_id, details, ip_address, user_agent)
    VALUES (${auditData.user_id}, ${auditData.action}, ${auditData.document_id || null}, ${auditData.draft_id || null}, ${auditData.merge_request_id || null}, ${JSON.stringify(auditData.details) || null}, ${auditData.ip_address || null}, ${auditData.user_agent || null})
    RETURNING *
  `
  return result[0]
}

export async function getAuditLogs(
  filters: {
    limit?: number
    offset?: number
    user_id?: string
    action?: string
    document_id?: string
    start_date?: string
    end_date?: string
  } = {},
) {
  const { limit = 100, offset = 0, user_id, action, document_id, start_date, end_date } = filters

  let query = sql`
    SELECT al.*, u.name as user_name, u.email as user_email
    FROM audit_log al
    LEFT JOIN users u ON al.user_id = u.id
    WHERE 1=1
  `

  if (user_id) {
    query = sql`${query} AND al.user_id = ${user_id}`
  }

  if (action) {
    query = sql`${query} AND al.action = ${action}`
  }

  if (document_id) {
    query = sql`${query} AND al.document_id = ${document_id}`
  }

  if (start_date) {
    query = sql`${query} AND al.timestamp >= ${start_date}`
  }

  if (end_date) {
    query = sql`${query} AND al.timestamp <= ${end_date}`
  }

  query = sql`${query} ORDER BY al.timestamp DESC LIMIT ${limit} OFFSET ${offset}`

  return await query
}

// Report functions
export async function createReport(reportData: {
  task_id: string
  title: string
  type: string
  parameters?: any
  generated_by: string
}) {
  const result = await sql`
    INSERT INTO reports (task_id, title, type, parameters, generated_by)
    VALUES (${reportData.task_id}, ${reportData.title}, ${reportData.type}, ${JSON.stringify(reportData.parameters) || null}, ${reportData.generated_by})
    RETURNING *
  `
  return result[0]
}

export async function getReportByTaskId(taskId: string) {
  const reports = await sql`
    SELECT * FROM reports WHERE task_id = ${taskId}
  `
  return reports[0] || null
}

export async function updateReportStatus(taskId: string, status: string, filePath?: string, errorMessage?: string) {
  const result = await sql`
    UPDATE reports 
    SET status = ${status}, 
        file_path = ${filePath || null},
        error_message = ${errorMessage || null},
        completed_at = ${status === "completed" || status === "failed" ? sql`CURRENT_TIMESTAMP` : sql`NULL`}
    WHERE task_id = ${taskId}
    RETURNING *
  `
  return result[0] || null
}

// Optimized dashboard metrics with SQL calculations
export async function getDashboardMetrics({
  department,
  limit = 100,
  offset = 0,
}: {
  department?: string
  limit?: number
  offset?: number
} = {}) {
  // Get real-time calculated metrics using SQL aggregations
  const metricsQuery = sql`
    WITH document_stats AS (
      SELECT 
        COUNT(*) as total_documents,
        COUNT(CASE WHEN d.created_at >= NOW() - INTERVAL '30 days' THEN 1 END) as recent_documents
      FROM documents d
      ${department ? sql`JOIN users u ON d.owner_id = u.id WHERE u.department = ${department}` : sql`WHERE 1=1`}
    ),
    draft_stats AS (
      SELECT 
        COUNT(*) as total_drafts,
        COUNT(CASE WHEN dr.status = 'pending' THEN 1 END) as pending_drafts
      FROM drafts dr
      ${department ? sql`JOIN users u ON dr.creator_id = u.id WHERE u.department = ${department}` : sql`WHERE 1=1`}
    ),
    merge_request_stats AS (
      SELECT 
        COUNT(CASE WHEN mr.status = 'pending' THEN 1 END) as pending_approvals
      FROM merge_requests mr
      JOIN drafts dr ON mr.draft_id = dr.id
      ${department ? sql`JOIN users u ON dr.creator_id = u.id WHERE u.department = ${department}` : sql`WHERE 1=1`}
    ),
    user_stats AS (
      SELECT 
        COUNT(CASE WHEN u.status = 'active' THEN 1 END) as active_users,
        COUNT(CASE WHEN u.updated_at >= NOW() - INTERVAL '24 hours' THEN 1 END) as recent_activity
      FROM users u
      ${department ? sql`WHERE u.department = ${department}` : sql`WHERE 1=1`}
    ),
    audit_stats AS (
      SELECT 
        COUNT(CASE WHEN al.timestamp >= NOW() - INTERVAL '24 hours' THEN 1 END) as recent_audit_events
      FROM audit_log al
      ${department ? sql`JOIN users u ON al.user_id = u.id WHERE u.department = ${department}` : sql`WHERE 1=1`}
    )
    SELECT 
      ${department || "ALL"} as department,
      ds.total_documents,
      ds.recent_documents,
      drs.total_drafts,
      drs.pending_drafts,
      mrs.pending_approvals,
      us.active_users,
      us.recent_activity,
      aus.recent_audit_events,
      NOW() as recorded_at
    FROM document_stats ds
    CROSS JOIN draft_stats drs
    CROSS JOIN merge_request_stats mrs
    CROSS JOIN user_stats us
    CROSS JOIN audit_stats aus
  `

  const metrics = await metricsQuery

  return metrics
}

// Permission functions
export async function checkDocumentPermission(documentId: string, userId: string, permissionType: string) {
  const permissions = await sql`
    SELECT * FROM document_permissions 
    WHERE document_id = ${documentId} AND user_id = ${userId} AND permission_type = ${permissionType}
  `
  return permissions.length > 0
}

export async function getUserRole(userId: string) {
  const users = await sql`
    SELECT role FROM users WHERE id = ${userId}
  `
  return users[0]?.role || null
}
