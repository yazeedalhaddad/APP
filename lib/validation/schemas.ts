import { z } from "zod"

/* -------------------------------------------------------------------------- */
/*                                   Helpers                                  */
/* -------------------------------------------------------------------------- */

export const paginationSchema = z.object({
  limit: z.coerce.number().min(1).max(100).default(20),
  offset: z.coerce.number().min(0).default(0),
})

/* -------------------------------------------------------------------------- */
/*                                   Users                                    */
/* -------------------------------------------------------------------------- */

export const createUserSchema = z.object({
  name: z.string().min(2, "Name is required"),
  email: z.string().email("Invalid email"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  role: z.enum(["admin", "management", "production", "lab"]).default("lab"),
  department: z.string().min(1, "Department is required").default("General"),
})

export const updateUserSchema = z.object({
  name: z.string().min(2).optional(),
  email: z.string().email().optional(),
  password: z.string().min(8).optional(),
  role: z.enum(["admin", "management", "production", "lab"]).optional(),
  department: z.string().min(1).optional(),
  status: z.enum(["active", "inactive"]).optional(),
})

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
})

// ----------------------------  SIGN-UP  -----------------------------

export const signupSchema = z
  .object({
    name: z.string().min(2, "Name is required"),
    email: z.string().email("Invalid email"),
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string().min(1, "Please confirm your password"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  })
  // Strip confirmPassword so downstream DB logic doesn’t see it
  .transform(({ confirmPassword: _, ...rest }) => rest)

/* -------------------------------------------------------------------------- */
/*                                  Documents                                 */
/* -------------------------------------------------------------------------- */

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

/* -------------------------------------------------------------------------- */
/*                                   Drafts                                   */
/* -------------------------------------------------------------------------- */

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

/* -------------------------------------------------------------------------- */
/*                              Merge Requests                                */
/* -------------------------------------------------------------------------- */

export const createMergeRequestSchema = z.object({
  draft_id: z.string().uuid("Invalid draft ID"),
  approver_id: z.string().uuid("Invalid approver ID"),
  summary: z.string().min(1, "Summary is required"),
})

export const mergeRequestFiltersSchema = z
  .object({
    status: z.enum(["pending", "approved", "rejected"]).optional(),
    approver_id: z.string().uuid().optional(),
  })
  .merge(paginationSchema)

/**
 * Some parts of the code-base look for an `approveMergeRequestSchema`
 * (single-purpose validation).  Alias the definition above so the
 * import never fails.
 */
export const approveMergeRequestSchema = createMergeRequestSchema
  .pick({
    draft_id: true,
    approver_id: true,
  })
  .extend({
    summary: z.string().optional(),
  })

/* -------------------------------------------------------------------------- */
/*                                   Reports                                  */
/* -------------------------------------------------------------------------- */

export const generateReportSchema = z.object({
  title: z.string().min(1, "Report title is required"),
  type: z.enum(["compliance", "activity", "document_usage", "user_activity"]),
  parameters: z.record(z.any()).optional(),
})

/* -------------------------------------------------------------------------- */
/*                                Audit Logs                                  */
/* -------------------------------------------------------------------------- */

export const auditLogFiltersSchema = z
  .object({
    user_id: z.string().uuid().optional(),
    action: z.string().optional(),
    document_id: z.string().uuid().optional(),
    start_date: z.string().datetime().optional(),
    end_date: z.string().datetime().optional(),
  })
  .merge(paginationSchema)

/* -------------------------------------------------------------------------- */
/*                          Convenience Aggregate Export                      */
/* -------------------------------------------------------------------------- */

export const schemas = {
  /* helpers */
  pagination: paginationSchema,

  /* users */
  createUser: createUserSchema,
  updateUser: updateUserSchema,
  login: loginSchema,
  signup: signupSchema,

  /* documents */
  createDocument: createDocumentSchema,
  updateDocument: updateDocumentSchema,
  documentFilters: documentFiltersSchema,

  /* drafts */
  createDraft: createDraftSchema,
  updateDraft: updateDraftSchema,
  draftFilters: draftFiltersSchema,

  /* merge requests */
  createMergeRequest: createMergeRequestSchema,
  approveMergeRequest: approveMergeRequestSchema,
  mergeRequestFilters: mergeRequestFiltersSchema,

  /* reports */
  generateReport: generateReportSchema,

  /* audit logs */
  auditLogFilters: auditLogFiltersSchema,
}
