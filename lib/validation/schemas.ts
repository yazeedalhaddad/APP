import { z } from "zod"

/* ----------------------------------------------------------------
   Pagination
---------------------------------------------------------------- */
export const paginationSchema = z.object({
  limit: z.coerce.number().min(1).max(100).default(50),
  offset: z.coerce.number().min(0).default(0),
})
export type PaginationParams = z.infer<typeof paginationSchema>

/* ----------------------------------------------------------------
   Auth
---------------------------------------------------------------- */
export const loginSchema = z.object({
  email: z.string().email("Invalid email format"),
  password: z.string().min(1, "Password is required"),
})
export type LoginData = z.infer<typeof loginSchema>

/* ----------------------------------------------------------------
   Users
---------------------------------------------------------------- */
export const createUserSchema = z.object({
  name: z.string().min(1, "Name is required").max(100, "Name too long"),
  email: z.string().email("Invalid email format"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  role: z.enum(["admin", "management", "production", "lab"]),
  department: z.string().min(1, "Department is required"),
})
export type CreateUserData = z.infer<typeof createUserSchema>

export const updateUserSchema = createUserSchema
  .omit({ password: true })
  .partial()
  .extend({
    status: z.enum(["active", "inactive"]).optional(),
  })
export type UpdateUserData = z.infer<typeof updateUserSchema>

/* ----------------------------------------------------------------
   Documents
---------------------------------------------------------------- */
export const createDocumentSchema = z.object({
  title: z.string().min(1, "Title is required").max(200),
  description: z.string().max(1000).optional(),
  file_type: z.string().min(1, "File type is required"),
  classification: z.enum(["public", "internal", "confidential", "restricted"]),
  file_path: z.string().min(1, "File path is required"),
  file_size: z.number().positive("File size must be positive"),
})
export type CreateDocumentData = z.infer<typeof createDocumentSchema>

export const updateDocumentSchema = createDocumentSchema
  .omit({
    file_type: true,
    file_path: true,
    file_size: true,
  })
  .partial()
export type UpdateDocumentData = z.infer<typeof updateDocumentSchema>

/* Document list filters (query params) */
export const documentFiltersSchema = z
  .object({
    classification: z.enum(["public", "internal", "confidential", "restricted"]).optional(),
    owner_id: z.string().uuid().optional(),
    search: z.string().max(200).optional(),
  })
  .merge(paginationSchema)
export type DocumentFilters = z.infer<typeof documentFiltersSchema>

/* ----------------------------------------------------------------
   Drafts
---------------------------------------------------------------- */
export const createDraftSchema = z.object({
  document_id: z.string().uuid("Invalid document ID"),
  name: z.string().min(1, "Name is required").max(200),
  description: z.string().max(1000).optional(),
  base_version_id: z.string().uuid("Invalid base version ID"),
})
export type CreateDraftData = z.infer<typeof createDraftSchema>

export const updateDraftSchema = z
  .object({
    name: z.string().min(1).max(200).optional(),
    description: z.string().max(1000).optional(),
    status: z.enum(["draft", "pending", "approved", "rejected"]).optional(),
  })
  .partial()
export type UpdateDraftData = z.infer<typeof updateDraftSchema>

/* Draft list filters */
export const draftFiltersSchema = z
  .object({
    status: z.enum(["draft", "pending", "approved", "rejected"]).optional(),
    creator_id: z.string().uuid().optional(),
    document_id: z.string().uuid().optional(),
  })
  .merge(paginationSchema)
export type DraftFilters = z.infer<typeof draftFiltersSchema>

/* ----------------------------------------------------------------
   Merge Requests
---------------------------------------------------------------- */
export const createMergeRequestSchema = z.object({
  draft_id: z.string().uuid("Invalid draft ID"),
  approver_id: z.string().uuid("Invalid approver ID"),
  summary: z.string().min(1, "Summary is required").max(1000),
})
export type CreateMergeRequestData = z.infer<typeof createMergeRequestSchema>

export const approveMergeRequestSchema = z.object({
  approved: z.boolean(),
  rejection_reason: z.string().max(1000).optional(),
})
export type ApproveMergeRequestData = z.infer<typeof approveMergeRequestSchema>

/* Merge-request list filters */
export const mergeRequestFiltersSchema = z
  .object({
    status: z.enum(["pending", "approved", "rejected"]).optional(),
    approver_id: z.string().uuid().optional(),
  })
  .merge(paginationSchema)
export type MergeRequestFilters = z.infer<typeof mergeRequestFiltersSchema>

/* ----------------------------------------------------------------
   Reports
---------------------------------------------------------------- */
export const generateReportSchema = z.object({
  title: z.string().min(1, "Title is required").max(200),
  type: z.enum(["document_activity", "user_activity", "compliance", "custom"]),
  parameters: z.record(z.any()).optional(),
})
export type GenerateReportData = z.infer<typeof generateReportSchema>

/* ----------------------------------------------------------------
   Audit Logs
---------------------------------------------------------------- */
export const auditLogFiltersSchema = z
  .object({
    user_id: z.string().uuid().optional(),
    action: z.string().max(100).optional(),
    document_id: z.string().uuid().optional(),
    start_date: z.string().datetime().optional(),
    end_date: z.string().datetime().optional(),
  })
  .merge(paginationSchema)
export type AuditLogFilters = z.infer<typeof auditLogFiltersSchema>
