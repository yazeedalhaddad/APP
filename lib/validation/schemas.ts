import { z } from "zod"

// Auth schemas
export const loginSchema = z.object({
  email: z.string().email("Invalid email format"),
  password: z.string().min(1, "Password is required"),
})

export const createUserSchema = z.object({
  name: z.string().min(1, "Name is required").max(100, "Name too long"),
  email: z.string().email("Invalid email format"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  role: z.enum(["admin", "management", "production", "lab"], {
    errorMap: () => ({ message: "Invalid role" }),
  }),
  department: z.string().min(1, "Department is required"),
})

export const updateUserSchema = z.object({
  name: z.string().min(1, "Name is required").max(100, "Name too long").optional(),
  email: z.string().email("Invalid email format").optional(),
  role: z.enum(["admin", "management", "production", "lab"]).optional(),
  department: z.string().min(1, "Department is required").optional(),
  status: z.enum(["active", "inactive"]).optional(),
})

// Document schemas
export const createDocumentSchema = z.object({
  title: z.string().min(1, "Title is required").max(200, "Title too long"),
  description: z.string().max(1000, "Description too long").optional(),
  file_type: z.string().min(1, "File type is required"),
  classification: z.enum(["public", "internal", "confidential", "restricted"]),
  file_path: z.string().min(1, "File path is required"),
  file_size: z.number().positive("File size must be positive"),
})

export const updateDocumentSchema = z.object({
  title: z.string().min(1, "Title is required").max(200, "Title too long").optional(),
  description: z.string().max(1000, "Description too long").optional(),
  classification: z.enum(["public", "internal", "confidential", "restricted"]).optional(),
})

// Draft schemas
export const createDraftSchema = z.object({
  document_id: z.string().uuid("Invalid document ID"),
  name: z.string().min(1, "Name is required").max(200, "Name too long"),
  description: z.string().max(1000, "Description too long").optional(),
  base_version_id: z.string().uuid("Invalid base version ID"),
})

export const updateDraftSchema = z.object({
  name: z.string().min(1, "Name is required").max(200, "Name too long").optional(),
  description: z.string().max(1000, "Description too long").optional(),
  status: z.enum(["draft", "pending", "approved", "rejected"]).optional(),
})

// Merge request schemas
export const createMergeRequestSchema = z.object({
  draft_id: z.string().uuid("Invalid draft ID"),
  approver_id: z.string().uuid("Invalid approver ID"),
  summary: z.string().min(1, "Summary is required").max(1000, "Summary too long"),
})

export const approveMergeRequestSchema = z.object({
  approved: z.boolean(),
  rejection_reason: z.string().max(1000, "Rejection reason too long").optional(),
})

// Report schemas
export const generateReportSchema = z.object({
  title: z.string().min(1, "Title is required").max(200, "Title too long"),
  type: z.enum(["document_activity", "user_activity", "compliance", "custom"]),
  parameters: z.record(z.any()).optional(),
})

// Query parameter schemas
export const paginationSchema = z.object({
  limit: z.coerce.number().min(1).max(100).default(50),
  offset: z.coerce.number().min(0).default(0),
})

export const documentFiltersSchema = z.object({
  classification: z.enum(["public", "internal", "confidential", "restricted"]).optional(),
  owner_id: z.string().uuid().optional(),
  search: z.string().max(200).optional(),
})

export const auditLogFiltersSchema = z.object({
  user_id: z.string().uuid().optional(),
  action: z.string().max(100).optional(),
  document_id: z.string().uuid().optional(),
  start_date: z.string().datetime().optional(),
  end_date: z.string().datetime().optional(),
})

export type LoginData = z.infer<typeof loginSchema>
export type CreateUserData = z.infer<typeof createUserSchema>
export type UpdateUserData = z.infer<typeof updateUserSchema>
export type CreateDocumentData = z.infer<typeof createDocumentSchema>
export type UpdateDocumentData = z.infer<typeof updateDocumentSchema>
export type CreateDraftData = z.infer<typeof createDraftSchema>
export type UpdateDraftData = z.infer<typeof updateDraftSchema>
export type CreateMergeRequestData = z.infer<typeof createMergeRequestSchema>
export type ApproveMergeRequestData = z.infer<typeof approveMergeRequestSchema>
export type GenerateReportData = z.infer<typeof generateReportSchema>
export type PaginationParams = z.infer<typeof paginationSchema>
export type DocumentFilters = z.infer<typeof documentFiltersSchema>
export type AuditLogFilters = z.infer<typeof auditLogFiltersSchema>
