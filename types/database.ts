export interface User {
  id: string
  name: string
  email: string
  password?: string
  role: "management" | "production" | "lab" | "admin"
  department: string
  status: "active" | "inactive"
  created_at: string
  updated_at: string
}

export interface Document {
  id: string
  title: string
  description?: string
  file_type: "pdf" | "word" | "excel" | "powerpoint" | "text"
  classification: string
  owner_id: string
  created_at: string
  updated_at: string
  owner_name?: string
  owner_email?: string
  current_version?: number
  file_path?: string
  file_size?: number
}

export interface DocumentVersion {
  id: string
  document_id: string
  version_number: number
  is_official: boolean
  file_path: string
  file_size?: number
  checksum?: string
  created_by: string
  created_at: string
  updated_at: string
  created_by_name?: string
}

export interface Draft {
  id: string
  document_id: string
  name: string
  description?: string
  creator_id: string
  status: "in_progress" | "pending_approval" | "approved" | "rejected"
  file_path?: string
  base_version_id: string
  created_at: string
  updated_at: string
  document_title?: string
  creator_name?: string
  base_version?: number
}

export interface MergeRequest {
  id: string
  draft_id: string
  approver_id: string
  summary: string
  status: "pending" | "approved" | "rejected"
  approved_at?: string
  rejected_at?: string
  rejection_reason?: string
  created_at: string
  updated_at: string
  draft_name?: string
  document_title?: string
  creator_name?: string
  approver_name?: string
}

export interface AuditLog {
  id: number
  user_id: string
  action: string
  document_id?: string
  draft_id?: string
  merge_request_id?: string
  timestamp: string
  details?: any
  ip_address?: string
  user_agent?: string
  user_name?: string
  user_email?: string
}

export interface Report {
  id: string
  task_id: string
  title: string
  type: string
  parameters?: any
  status: "pending" | "processing" | "completed" | "failed"
  file_path?: string
  error_message?: string
  generated_by: string
  created_at: string
  completed_at?: string
}

export interface DocumentPermission {
  id: string
  document_id: string
  user_id: string
  permission_type: "read" | "write" | "approve"
  granted_by: string
  granted_at: string
}

export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

export interface PaginatedResponse<T = any> {
  data: T[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}
