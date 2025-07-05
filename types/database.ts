export interface User {
  id: number
  email: string
  first_name: string
  last_name: string
  role: "admin" | "management" | "production" | "lab"
  department: string
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface Document {
  id: number
  title: string
  description: string
  file_path: string
  file_size: number
  mime_type: string
  category: string
  status: "draft" | "review" | "approved" | "archived"
  version_number: number
  is_current_version: boolean
  created_by: number
  approved_by: number
  created_at: string
  updated_at: string
  first_name?: string
  last_name?: string
}

export interface DocumentVersion {
  id: number
  document_id: number
  version_number: number
  title: string
  description: string
  file_path: string
  changes_summary: string
  created_by: number
  created_at: string
}

export interface AuditLog {
  id: number
  user_id: number
  action: string
  resource_type: string
  resource_id: number
  details: any
  ip_address: string
  user_agent: string
  created_at: string
  first_name?: string
  last_name?: string
}

export interface Report {
  id: number
  title: string
  type: string
  parameters: any
  generated_by: number
  file_path: string
  status: "pending" | "completed" | "failed"
  created_at: string
  completed_at: string
}

export interface DashboardMetric {
  id: number
  metric_name: string
  metric_value: number
  metric_type: string
  department: string
  recorded_at: string
}

export interface DocumentPermission {
  id: number
  document_id: number
  user_id: number
  permission_type: "read" | "write" | "admin"
  granted_by: number
  granted_at: string
}
