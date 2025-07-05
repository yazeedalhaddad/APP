import { neon } from "@neondatabase/serverless"
import { config, validateEnvironment } from "./config"

// Validate environment on module load
try {
  validateEnvironment()
} catch (error) {
  console.error("Environment validation failed:", error)
  throw error
}

export const sql = neon(config.database.url!)

// Database health check function
export async function checkDatabaseHealth() {
  try {
    const result = await sql`SELECT 1 as health_check`
    return { status: "healthy", timestamp: new Date().toISOString() }
  } catch (error) {
    console.error("Database health check failed:", error)
    return {
      status: "unhealthy",
      error: error instanceof Error ? error.message : "Unknown error",
      timestamp: new Date().toISOString(),
    }
  }
}

// User management functions
export async function getUserById(id: string) {
  try {
    const users = await sql`
      SELECT id, name, email, role, department, status, created_at, updated_at
      FROM users 
      WHERE id = ${id} AND status = 'active'
    `
    return users[0] || null
  } catch (error) {
    console.error("Error fetching user by ID:", error)
    throw new Error("Failed to fetch user")
  }
}

export async function getUserByEmail(email: string) {
  try {
    const users = await sql`
      SELECT id, name, email, password, role, department, status, created_at, updated_at
      FROM users 
      WHERE email = ${email} AND status = 'active'
    `
    return users[0] || null
  } catch (error) {
    console.error("Error fetching user by email:", error)
    throw new Error("Failed to fetch user")
  }
}

export async function getAllUsers(limit = 50, offset = 0) {
  try {
    return await sql`
      SELECT id, name, email, role, department, status, created_at, updated_at
      FROM users 
      ORDER BY created_at DESC
      LIMIT ${limit} OFFSET ${offset}
    `
  } catch (error) {
    console.error("Error fetching users:", error)
    throw new Error("Failed to fetch users")
  }
}

export async function createUser(userData: {
  name: string
  email: string
  password: string
  role: string
  department: string
}) {
  try {
    const result = await sql`
      INSERT INTO users (name, email, password, role, department)
      VALUES (${userData.name}, ${userData.email}, ${userData.password}, ${userData.role}, ${userData.department})
      RETURNING id, name, email, role, department, status, created_at, updated_at
    `
    return result[0]
  } catch (error) {
    console.error("Error creating user:", error)
    throw new Error("Failed to create user")
  }
}

export async function updateUser(id: string, updates: any) {
  try {
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
  } catch (error) {
    console.error("Error updating user:", error)
    throw new Error("Failed to update user")
  }
}

export async function deleteUser(id: string) {
  try {
    await sql`
      UPDATE users 
      SET status = 'inactive', updated_at = CURRENT_TIMESTAMP
      WHERE id = ${id}
    `
  } catch (error) {
    console.error("Error deleting user:", error)
    throw new Error("Failed to delete user")
  }
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
  try {
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
  } catch (error) {
    console.error("Error fetching documents:", error)
    throw new Error("Failed to fetch documents")
  }
}

export async function getDocumentById(id: string) {
  try {
    const documents = await sql`
      SELECT d.*, u.name as owner_name, u.email as owner_email
      FROM documents d
      LEFT JOIN users u ON d.owner_id = u.id
      WHERE d.id = ${id}
    `
    return documents[0] || null
  } catch (error) {
    console.error("Error fetching document by ID:", error)
    throw new Error("Failed to fetch document")
  }
}

export async function getDocumentVersions(documentId: string) {
  try {
    return await sql`
      SELECT dv.*, u.name as created_by_name
      FROM document_versions dv
      LEFT JOIN users u ON dv.created_by = u.id
      WHERE dv.document_id = ${documentId}
      ORDER BY dv.version_number DESC
    `
  } catch (error) {
    console.error("Error fetching document versions:", error)
    throw new Error("Failed to fetch document versions")
  }
}

export async function getDocumentVersion(documentId: string, versionNumber: number) {
  try {
    const versions = await sql`
      SELECT dv.*, u.name as created_by_name
      FROM document_versions dv
      LEFT JOIN users u ON dv.created_by = u.id
      WHERE dv.document_id = ${documentId} AND dv.version_number = ${versionNumber}
    `
    return versions[0] || null
  } catch (error) {
    console.error("Error fetching document version:", error)
    throw new Error("Failed to fetch document version")
  }
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
  try {
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
  } catch (error) {
    console.error("Error creating document:", error)
    throw new Error("Failed to create document")
  }
}

export async function updateDocument(id: string, updates: any) {
  try {
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
  } catch (error) {
    console.error("Error updating document:", error)
    throw new Error("Failed to update document")
  }
}

export async function deleteDocument(id: string) {
  try {
    await sql`DELETE FROM documents WHERE id = ${id}`
  } catch (error) {
    console.error("Error deleting document:", error)
    throw new Error("Failed to delete document")
  }
}

export async function searchDocuments(query: string) {
  try {
    return await sql`
      SELECT d.*, u.name as owner_name, u.email as owner_email
      FROM documents d
      LEFT JOIN users u ON d.owner_id = u.id
      WHERE to_tsvector('english', d.title || ' ' || COALESCE(d.description, '')) @@ plainto_tsquery('english', ${query})
      ORDER BY d.updated_at DESC
    `
  } catch (error) {
    console.error("Error searching documents:", error)
    throw new Error("Failed to search documents")
  }
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
  try {
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
  } catch (error) {
    console.error("Error fetching drafts:", error)
    throw new Error("Failed to fetch drafts")
  }
}

export async function getDraftById(id: string) {
  try {
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
  } catch (error) {
    console.error("Error fetching draft by ID:", error)
    throw new Error("Failed to fetch draft")
  }
}

export async function createDraft(draftData: {
  document_id: string
  name: string
  description?: string
  creator_id: string
  base_version_id: string
  file_path?: string
}) {
  try {
    const result = await sql`
      INSERT INTO drafts (document_id, name, description, creator_id, base_version_id, file_path)
      VALUES (${draftData.document_id}, ${draftData.name}, ${draftData.description || null}, ${draftData.creator_id}, ${draftData.base_version_id}, ${draftData.file_path || null})
      RETURNING *
    `
    return result[0]
  } catch (error) {
    console.error("Error creating draft:", error)
    throw new Error("Failed to create draft")
  }
}

export async function updateDraft(id: string, updates: any) {
  try {
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
  } catch (error) {
    console.error("Error updating draft:", error)
    throw new Error("Failed to update draft")
  }
}

export async function deleteDraft(id: string) {
  try {
    await sql`DELETE FROM drafts WHERE id = ${id}`
  } catch (error) {
    console.error("Error deleting draft:", error)
    throw new Error("Failed to delete draft")
  }
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
  try {
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
  } catch (error) {
    console.error("Error fetching merge requests:", error)
    throw new Error("Failed to fetch merge requests")
  }
}

export async function getMergeRequestById(id: string) {
  try {
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
  } catch (error) {
    console.error("Error fetching merge request by ID:", error)
    throw new Error("Failed to fetch merge request")
  }
}

export async function createMergeRequest(mergeRequestData: {
  draft_id: string
  approver_id: string
  summary: string
}) {
  try {
    const result = await sql`
      INSERT INTO merge_requests (draft_id, approver_id, summary)
      VALUES (${mergeRequestData.draft_id}, ${mergeRequestData.approver_id}, ${mergeRequestData.summary})
      RETURNING *
    `
    return result[0]
  } catch (error) {
    console.error("Error creating merge request:", error)
    throw new Error("Failed to create merge request")
  }
}

export async function updateMergeRequestStatus(id: string, status: string, userId: string, rejectionReason?: string) {
  try {
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
  } catch (error) {
    console.error("Error updating merge request status:", error)
    throw new Error("Failed to update merge request status")
  }
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
  try {
    const result = await sql`
      INSERT INTO audit_log (user_id, action, document_id, draft_id, merge_request_id, details, ip_address, user_agent)
      VALUES (${auditData.user_id}, ${auditData.action}, ${auditData.document_id || null}, ${auditData.draft_id || null}, ${auditData.merge_request_id || null}, ${JSON.stringify(auditData.details) || null}, ${auditData.ip_address || null}, ${auditData.user_agent || null})
      RETURNING *
    `
    return result[0]
  } catch (error) {
    console.error("Error creating audit log:", error)
    throw new Error("Failed to create audit log")
  }
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
  try {
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
  } catch (error) {
    console.error("Error fetching audit logs:", error)
    throw new Error("Failed to fetch audit logs")
  }
}

// Report functions
export async function createReport(reportData: {
  task_id: string
  title: string
  type: string
  parameters?: any
  generated_by: string
}) {
  try {
    const result = await sql`
      INSERT INTO reports (task_id, title, type, parameters, generated_by)
      VALUES (${reportData.task_id}, ${reportData.title}, ${reportData.type}, ${JSON.stringify(reportData.parameters) || null}, ${reportData.generated_by})
      RETURNING *
    `
    return result[0]
  } catch (error) {
    console.error("Error creating report:", error)
    throw new Error("Failed to create report")
  }
}

export async function getReportByTaskId(taskId: string) {
  try {
    const reports = await sql`
      SELECT * FROM reports WHERE task_id = ${taskId}
    `
    return reports[0] || null
  } catch (error) {
    console.error("Error fetching report by task ID:", error)
    throw new Error("Failed to fetch report")
  }
}

export async function updateReportStatus(taskId: string, status: string, filePath?: string, errorMessage?: string) {
  try {
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
  } catch (error) {
    console.error("Error updating report status:", error)
    throw new Error("Failed to update report status")
  }
}

// Optimized dashboard metrics with SQL calculations
export async function getDashboardMetrics(userRole: string) {
  try {
    // Get comprehensive metrics with a single optimized query
    const metricsQuery = sql`
      WITH document_stats AS (
        SELECT 
          COUNT(*) as total_documents,
          COUNT(CASE WHEN classification = 'public' THEN 1 END) as public_docs,
          COUNT(CASE WHEN classification = 'internal' THEN 1 END) as internal_docs,
          COUNT(CASE WHEN classification = 'confidential' THEN 1 END) as confidential_docs,
          COUNT(CASE WHEN created_at >= NOW() - INTERVAL '30 days' THEN 1 END) as recent_documents
        FROM documents
      ),
      draft_stats AS (
        SELECT 
          COUNT(*) as total_drafts,
          COUNT(CASE WHEN status = 'in_progress' THEN 1 END) as active_drafts,
          COUNT(CASE WHEN created_at >= NOW() - INTERVAL '7 days' THEN 1 END) as recent_drafts
        FROM drafts
      ),
      merge_request_stats AS (
        SELECT 
          COUNT(*) as total_merge_requests,
          COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending_requests,
          COUNT(CASE WHEN status = 'approved' THEN 1 END) as approved_requests,
          COUNT(CASE WHEN status = 'rejected' THEN 1 END) as rejected_requests,
          COUNT(CASE WHEN created_at >= NOW() - INTERVAL '7 days' THEN 1 END) as recent_requests
        FROM merge_requests
      ),
      user_stats AS (
        SELECT 
          COUNT(*) as total_users,
          COUNT(CASE WHEN role = 'admin' THEN 1 END) as admin_users,
          COUNT(CASE WHEN role = 'management' THEN 1 END) as management_users,
          COUNT(CASE WHEN role = 'production' THEN 1 END) as production_users,
          COUNT(CASE WHEN role = 'lab' THEN 1 END) as lab_users,
          COUNT(CASE WHEN status = 'active' THEN 1 END) as active_users
        FROM users
      ),
      audit_stats AS (
        SELECT 
          COUNT(*) as total_audit_logs,
          COUNT(CASE WHEN timestamp >= NOW() - INTERVAL '24 hours' THEN 1 END) as recent_activities,
          COUNT(CASE WHEN action = 'LOGIN' AND timestamp >= NOW() - INTERVAL '24 hours' THEN 1 END) as recent_logins
        FROM audit_log
      )
      SELECT 
        -- Document metrics
        ds.total_documents,
        ds.public_docs,
        ds.internal_docs, 
        ds.confidential_docs,
        ds.recent_documents,
        
        -- Draft metrics
        drs.total_drafts,
        drs.active_drafts,
        drs.recent_drafts,
        
        -- Merge request metrics
        mrs.total_merge_requests,
        mrs.pending_requests,
        mrs.approved_requests,
        mrs.rejected_requests,
        mrs.recent_requests,
        
        -- User metrics
        us.total_users,
        us.admin_users,
        us.management_users,
        us.production_users,
        us.lab_users,
        us.active_users,
        
        -- Audit metrics
        aus.total_audit_logs,
        aus.recent_activities,
        aus.recent_logins
        
      FROM document_stats ds
      CROSS JOIN draft_stats drs
      CROSS JOIN merge_request_stats mrs
      CROSS JOIN user_stats us
      CROSS JOIN audit_stats aus
    `

    const result = await metricsQuery
    const metrics = result[0]

    // Calculate additional derived metrics
    const documentApprovalRate =
      metrics.total_merge_requests > 0
        ? ((metrics.approved_requests / metrics.total_merge_requests) * 100).toFixed(1)
        : "0"

    const userActivityRate =
      metrics.total_users > 0 ? ((metrics.active_users / metrics.total_users) * 100).toFixed(1) : "0"

    // Role-specific metrics filtering
    const baseMetrics = {
      documents: {
        total: Number.parseInt(metrics.total_documents),
        byClassification: {
          public: Number.parseInt(metrics.public_docs),
          internal: Number.parseInt(metrics.internal_docs),
          confidential: Number.parseInt(metrics.confidential_docs),
        },
        recentlyCreated: Number.parseInt(metrics.recent_documents),
      },
      drafts: {
        total: Number.parseInt(metrics.total_drafts),
        active: Number.parseInt(metrics.active_drafts),
        recentlyCreated: Number.parseInt(metrics.recent_drafts),
      },
      mergeRequests: {
        total: Number.parseInt(metrics.total_merge_requests),
        pending: Number.parseInt(metrics.pending_requests),
        approved: Number.parseInt(metrics.approved_requests),
        rejected: Number.parseInt(metrics.rejected_requests),
        recent: Number.parseInt(metrics.recent_requests),
        approvalRate: Number.parseFloat(documentApprovalRate),
      },
      activity: {
        totalAuditLogs: Number.parseInt(metrics.total_audit_logs),
        recentActivities: Number.parseInt(metrics.recent_activities),
        recentLogins: Number.parseInt(metrics.recent_logins),
      },
    }

    // Add user metrics for admin and management roles
    if (["admin", "management"].includes(userRole)) {
      return {
        ...baseMetrics,
        users: {
          total: Number.parseInt(metrics.total_users),
          byRole: {
            admin: Number.parseInt(metrics.admin_users),
            management: Number.parseInt(metrics.management_users),
            production: Number.parseInt(metrics.production_users),
            lab: Number.parseInt(metrics.lab_users),
          },
          activeUsers: Number.parseInt(metrics.active_users),
          activityRate: Number.parseFloat(userActivityRate),
        },
      }
    }

    return baseMetrics
  } catch (error) {
    console.error("Error fetching dashboard metrics:", error)
    throw new Error("Failed to fetch dashboard metrics")
  }
}

// Permission functions
export async function checkDocumentPermission(documentId: string, userId: string, permissionType: string) {
  try {
    const permissions = await sql`
      SELECT * FROM document_permissions 
      WHERE document_id = ${documentId} AND user_id = ${userId} AND permission_type = ${permissionType}
    `
    return permissions.length > 0
  } catch (error) {
    console.error("Error checking document permission:", error)
    return false
  }
}

export async function getUserRole(userId: string) {
  try {
    const users = await sql`
      SELECT role FROM users WHERE id = ${userId}
    `
    return users[0]?.role || null
  } catch (error) {
    console.error("Error getting user role:", error)
    return null
  }
}
