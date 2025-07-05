import { z } from "zod"

// User schemas
export const loginSchema = z.object({
  email: z.string().email("Invalid email format"),
  password: z.string().min(1, "Password is required"),
})

export const createUserSchema = z.object({
  name: z.string().min(1, "Name is required").max(100, "Name too long"),
  email: z.string().email("Invalid email format"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  role: z.enum(["admin", "management", "production", "lab"]),
  department: z.string().min(1, "Department is required").max(50, "Department name too long"),
})

export const updateUserSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  email: z.string().email().optional(),
  role: z.enum(["admin", "management", "production", "lab"]).optional(),
  department: z.string().min(1).max(50).optional(),
  status: z.enum(["active", "inactive"]).optional(),
})

// Document schemas
export const createDocumentSchema = z.object({
  title: z.string().min(1, "Title is required").max(200, "Title too long"),
  description: z.string().max(1000, "Description too long").optional(),
  file_type: z.enum(["pdf", "word", "excel", "powerpoint", "text"]),
  classification: z.string().min(1, "Classification is required").max(50, "Classification too long"),
  file_path: z.string().min(1, "File path is required"),
  file_size: z.number().min(1, "File size must be positive"),
})

export const updateDocumentSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  description: z.string().max(1000).optional(),
  classification: z.string().min(1).max(50).optional(),
})

// Draft schemas
export const createDraftSchema = z.object({
  document_id: z.string().uuid("Invalid document ID"),
  name: z.string().min(1, "Name is required").max(100, "Name too long"),
  description: z.string().max(500, "Description too long").optional(),
  base_version_id: z.string().uuid("Invalid base version ID"),
  file_path: z.string().optional(),
})

export const updateDraftSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  description: z.string().max(500).optional(),
  status: z.enum(["in_progress", "pending_approval", "approved", "rejected"]).optional(),
  file_path: z.string().optional(),
})

// Merge request schemas
export const createMergeRequestSchema = z.object({
  draft_id: z.string().uuid("Invalid draft ID"),
  approver_id: z.string().uuid("Invalid approver ID"),
  summary: z.string().min(1, "Summary is required").max(1000, "Summary too long"),
})

export const approveMergeRequestSchema = z.object({
  reason: z.string().max(500, "Reason too long").optional(),
})

// Report schemas
export const generateReportSchema = z.object({
  title: z.string().min(1, "Title is required").max(200, "Title too long"),
  type: z.string().min(1, "Type is required").max(50, "Type too long"),
  parameters: z.record(z.any()).optional(),
})

// Query parameter schemas
export const paginationSchema = z.object({
  limit: z.coerce.number().min(1).max(100).default(50),
  offset: z.coerce.number().min(0).default(0),
})

export const documentFiltersSchema = paginationSchema.extend({
  classification: z.string().optional(),
  owner_id: z.string().uuid().optional(),
  search: z.string().optional(),
})

export const draftFiltersSchema = paginationSchema.extend({
  document_id: z.string().uuid().optional(),
  creator_id: z.string().uuid().optional(),
  status: z.enum(["in_progress", "pending_approval", "approved", "rejected"]).optional(),
})

export const mergeRequestFiltersSchema = paginationSchema.extend({
  status: z.enum(["pending", "approved", "rejected"]).optional(),
  approver_id: z.string().uuid().optional(),
})

export const auditLogFiltersSchema = paginationSchema.extend({
  user_id: z.string().uuid().optional(),
  action: z.string().optional(),
  document_id: z.string().uuid().optional(),
  start_date: z.string().datetime().optional(),
  end_date: z.string().datetime().optional(),
})
