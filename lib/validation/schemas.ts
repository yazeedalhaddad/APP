import { z } from "zod"

// Base schemas
export const paginationSchema = z.object({
  limit: z.coerce.number().min(1).max(100).default(50),
  offset: z.coerce.number().min(0).default(0),
})

// User schemas
export const createUserSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email format"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  role: z.enum(["admin", "management", "production", "lab"]),
  department: z.string().min(1, "Department is required"),
})

export const updateUserSchema = z.object({
  name: z.string().min(1).optional(),
  email: z.string().email().optional(),
  role: z.enum(["admin", "management", "production", "lab"]).optional(),
  department: z.string().min(1).optional(),
  status: z.enum(["active", "inactive"]).optional(),
})

export const loginSchema = z.object({
  email: z.string().email("Invalid email format"),
  password: z.string().min(1, "Password is required"),
})

// Document schemas
export const createDocumentSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  file_type: z.enum(["pdf", "word", "excel", "powerpoint", "text"]),
  classification: z.string().min(1, "Classification is required"),
  file_path: z.string().min(1, "File path is required"),
  file_size: z.number().min(1, "File size must be greater than 0"),
})

export const updateDocumentSchema = z.object({
  title: z.string().min(1).optional(),
  description: z.string().optional(),
  classification: z.string().min(1).optional(),
})

export const documentFiltersSchema = z
  .object({
    classification: z.string().optional(),
    owner_id: z.string().uuid().optional(),
    search: z.string().optional(),
  })
  .merge(paginationSchema)

// Draft schemas
export const createDraftSchema = z.object({
  document_id: z.string().uuid("Invalid document ID"),
  name: z.string().min(1, "Draft name is required"),
  description: z.string().optional(),
  base_version_id: z.string().uuid("Invalid base version ID"),
  file_path: z.string().optional(),
})

export const updateDraftSchema = z.object({
  name: z.string().min(1).optional(),
  description: z.string().optional(),
  status: z.enum(["in_progress", "pending_approval", "approved", "rejected"]).optional(),
  file_path: z.string().optional(),
})

export const draftFiltersSchema = z
  .object({
    document_id: z.string().uuid().optional(),
    creator_id: z.string().uuid().optional(),
    status: z.enum(["in_progress", "pending_approval", "approved", "rejected"]).optional(),
  })
  .merge(paginationSchema)

// Merge request schemas
export const createMergeRequestSchema = z.object({
  draft_id: z.string().uuid("Invalid draft ID"),
  approver_id: z.string().uuid("Invalid approver ID"),
  summary: z.string().min(1, "Summary is required"),
})

export const updateMergeRequestStatusSchema = z.object({
  status: z.enum(["approved", "rejected"]),
  rejection_reason: z.string().optional(),
})

export const mergeRequestFiltersSchema = z
  .object({
    status: z.enum(["pending", "approved", "rejected"]).optional(),
    approver_id: z.string().uuid().optional(),
  })
  .merge(paginationSchema)

// Report schemas
export const generateReportSchema = z.object({
  title: z.string().min(1, "Report title is required"),
  type: z.enum(["compliance", "activity", "document_usage", "user_activity"]),
  parameters: z.record(z.any()).optional(),
})

// Audit log schemas
export const auditLogFiltersSchema = z
  .object({
    user_id: z.string().uuid().optional(),
    action: z.string().optional(),
    document_id: z.string().uuid().optional(),
    start_date: z.string().datetime().optional(),
    end_date: z.string().datetime().optional(),
  })
  .merge(paginationSchema)

// Search schemas
export const searchSchema = z
  .object({
    query: z.string().min(1, "Search query is required"),
    type: z.enum(["documents", "drafts", "all"]).default("all"),
  })
  .merge(paginationSchema)

// File upload schemas
export const fileUploadSchema = z.object({
  filename: z.string().min(1, "Filename is required"),
  content_type: z.string().min(1, "Content type is required"),
  file_size: z.number().min(1, "File size must be greater than 0"),
})

// Permission schemas
export const documentPermissionSchema = z.object({
  document_id: z.string().uuid("Invalid document ID"),
  user_id: z.string().uuid("Invalid user ID"),
  permission_type: z.enum(["read", "write", "approve"]),
})

// Dashboard schemas
export const dashboardFiltersSchema = z.object({
  date_range: z.enum(["7d", "30d", "90d", "1y"]).default("30d"),
  department: z.string().optional(),
})

// Version comparison schema
export const compareVersionsSchema = z.object({
  version1: z.coerce.number().min(1),
  version2: z.coerce.number().min(1),
})

// Bulk operations schemas
export const bulkUpdateDocumentsSchema = z.object({
  document_ids: z.array(z.string().uuid()).min(1, "At least one document ID is required"),
  updates: updateDocumentSchema,
})

export const bulkDeleteDocumentsSchema = z.object({
  document_ids: z.array(z.string().uuid()).min(1, "At least one document ID is required"),
})

// Export all schemas for easy importing
export const schemas = {
  // Base
  pagination: paginationSchema,

  // User
  createUser: createUserSchema,
  updateUser: updateUserSchema,
  login: loginSchema,

  // Document
  createDocument: createDocumentSchema,
  updateDocument: updateDocumentSchema,
  documentFilters: documentFiltersSchema,

  // Draft
  createDraft: createDraftSchema,
  updateDraft: updateDraftSchema,
  draftFilters: draftFiltersSchema,

  // Merge Request
  createMergeRequest: createMergeRequestSchema,
  updateMergeRequestStatus: updateMergeRequestStatusSchema,
  mergeRequestFilters: mergeRequestFiltersSchema,

  // Report
  generateReport: generateReportSchema,

  // Audit Log
  auditLogFilters: auditLogFiltersSchema,

  // Search
  search: searchSchema,

  // File Upload
  fileUpload: fileUploadSchema,

  // Permission
  documentPermission: documentPermissionSchema,

  // Dashboard
  dashboardFilters: dashboardFiltersSchema,

  // Version Comparison
  compareVersions: compareVersionsSchema,

  // Bulk Operations
  bulkUpdateDocuments: bulkUpdateDocumentsSchema,
  bulkDeleteDocuments: bulkDeleteDocumentsSchema,
}
