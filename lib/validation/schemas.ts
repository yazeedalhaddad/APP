import { z } from "zod"

// Auth schemas
export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
})

export const signupSchema = z
  .object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    email: z.string().email("Invalid email address"),
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string().min(1, "Please confirm your password"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  })

// User schemas
export const createUserSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  role: z.enum(["admin", "management", "production", "lab"]),
  department: z.string().min(1, "Department is required"),
})

export const updateUserSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").optional(),
  email: z.string().email("Invalid email address").optional(),
  role: z.enum(["admin", "management", "production", "lab"]).optional(),
  department: z.string().min(1, "Department is required").optional(),
  status: z.enum(["active", "inactive"]).optional(),
})

// Document schemas
export const createDocumentSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  file_type: z.string().min(1, "File type is required"),
  classification: z.enum(["public", "internal", "confidential"]),
})

export const updateDocumentSchema = z.object({
  title: z.string().min(1, "Title is required").optional(),
  description: z.string().optional(),
  classification: z.enum(["public", "internal", "confidential"]).optional(),
})

export const documentFiltersSchema = z.object({
  classification: z.string().optional(),
  owner_id: z.string().uuid().optional(),
  search: z.string().optional(),
  limit: z.number().min(1).max(100).optional(),
  offset: z.number().min(0).optional(),
})

// Draft schemas
export const createDraftSchema = z.object({
  document_id: z.string().uuid("Invalid document ID"),
  name: z.string().min(1, "Draft name is required"),
  description: z.string().optional(),
  base_version_id: z.string().uuid("Invalid base version ID"),
})

export const updateDraftSchema = z.object({
  name: z.string().min(1, "Draft name is required").optional(),
  description: z.string().optional(),
  status: z.enum(["in_progress", "pending_approval", "approved", "rejected"]).optional(),
})

export const draftFiltersSchema = z.object({
  document_id: z.string().uuid().optional(),
  creator_id: z.string().uuid().optional(),
  status: z.enum(["in_progress", "pending_approval", "approved", "rejected"]).optional(),
  limit: z.number().min(1).max(100).optional(),
  offset: z.number().min(0).optional(),
})

// Merge request schemas
export const createMergeRequestSchema = z.object({
  draft_id: z.string().uuid("Invalid draft ID"),
  approver_id: z.string().uuid("Invalid approver ID"),
  summary: z.string().min(1, "Summary is required"),
})

export const updateMergeRequestSchema = z.object({
  approved: z.boolean(),
  rejection_reason: z.string().optional(),
})

export const mergeRequestFiltersSchema = z.object({
  status: z.enum(["pending", "approved", "rejected"]).optional(),
  approver_id: z.string().uuid().optional(),
  creator_id: z.string().uuid().optional(),
  limit: z.number().min(1).max(100).optional(),
  offset: z.number().min(0).optional(),
})

// Audit log schemas
export const auditLogFiltersSchema = z.object({
  user_id: z.string().uuid().optional(),
  action: z.string().optional(),
  document_id: z.string().uuid().optional(),
  start_date: z.string().datetime().optional(),
  end_date: z.string().datetime().optional(),
  limit: z.number().min(1).max(100).optional(),
  offset: z.number().min(0).optional(),
})

// Report schemas
export const generateReportSchema = z.object({
  type: z.enum(["department_performance", "approval_statistics", "user_activity", "workflow_analysis"]),
  start_date: z.string().datetime().optional(),
  end_date: z.string().datetime().optional(),
  department: z.string().optional(),
  format: z.enum(["pdf", "excel"]).default("pdf"),
})

// Pagination schema
export const paginationSchema = z.object({
  limit: z.number().min(1).max(100).default(20),
  offset: z.number().min(0).default(0),
})

// Search schema
export const searchSchema = z.object({
  query: z.string().min(1, "Search query is required"),
  type: z.enum(["documents", "users", "drafts"]).optional(),
  filters: z.record(z.any()).optional(),
})
