import { create } from "zustand"
import { toast } from "@/hooks/use-toast"

export interface LoginCredentials {
  email: string
  password: string
}

export interface User {
  id: string
  name: string
  email: string
  role: string
  department: string
  status: string
  created_at: string
  updated_at: string
}

export interface Document {
  id: string
  title: string
  description?: string
  file_type: string
  classification: string
  owner_id: string
  owner_name?: string
  owner_email?: string
  current_version?: number
  file_path?: string
  file_size?: number
  created_at: string
  updated_at: string
}

export interface Draft {
  id: string
  document_id: string
  name: string
  description?: string
  creator_id: string
  creator_name?: string
  status: string
  file_path?: string
  base_version_id: string
  base_version?: number
  document_title?: string
  created_at: string
  updated_at: string
}

export interface MergeRequest {
  id: string
  draft_id: string
  draft_name?: string
  document_title?: string
  approver_id: string
  approver_name?: string
  creator_name?: string
  summary: string
  status: string
  approved_at?: string
  rejected_at?: string
  rejection_reason?: string
  created_at: string
  updated_at: string
}

export interface AuditLogEntry {
  id: string
  user_id: string
  user_name?: string
  user_email?: string
  action: string
  document_id?: string
  draft_id?: string
  merge_request_id?: string
  details?: any
  ip_address?: string
  user_agent?: string
  timestamp: string
}

export interface DashboardMetrics {
  documents: {
    total: number
    byClassification: {
      public: number
      internal: number
      confidential: number
    }
    recentlyCreated: number
  }
  drafts: {
    total: number
    active: number
    recentlyCreated: number
  }
  mergeRequests: {
    total: number
    pending: number
    approved: number
    rejected: number
    recent: number
    approvalRate: number
  }
  users?: {
    total: number
    byRole: {
      admin: number
      management: number
      production: number
      lab: number
    }
    activeUsers: number
    activityRate: number
  }
  activity: {
    totalAuditLogs: number
    recentActivities: number
    recentLogins: number
  }
}

interface AppState {
  // Auth state
  user: User | null
  token: string | null
  isAuthenticated: boolean

  // Document state
  documents: Document[]
  activeDocument: Document | null
  documentVersions: any[]
  documentComparison: any | null

  // Draft state
  drafts: Draft[]
  activeDraft: Draft | null

  // Merge request state
  mergeRequests: MergeRequest[]

  // User management state
  users: User[]

  // Audit log state
  auditLogs: AuditLogEntry[]

  // Dashboard metrics
  dashboardMetrics: DashboardMetrics | null

  // UI state
  isLoading: boolean
  error: string | null

  // Actions
  login: (credentials: LoginCredentials) => Promise<void>
  logout: () => void

  // Document actions
  fetchDocuments: (filters?: any) => Promise<void>
  selectDocument: (id: string) => Promise<void>
  fetchDocumentVersions: (documentId: string) => Promise<void>
  compareDocumentVersions: (documentId: string, fromVersion: number, toVersion: number) => Promise<void>
  searchDocuments: (query: string) => Promise<void>

  // Draft actions
  createDraft: (documentId: string, name: string, description?: string) => Promise<void>
  fetchDrafts: (filters?: any) => Promise<void>

  // Merge request actions
  fetchMergeRequests: (filters?: any) => Promise<void>
  submitMergeRequest: (draftId: string, approverId: string, summary: string) => Promise<void>
  approveMergeRequest: (id: string) => Promise<void>
  rejectMergeRequest: (id: string, reason: string) => Promise<void>

  // User management actions
  fetchUsers: () => Promise<void>
  createUser: (userData: any) => Promise<void>
  updateUser: (id: string, updates: any) => Promise<void>
  deleteUser: (id: string) => Promise<void>

  // Audit log actions
  fetchAuditLogs: (filters?: any) => Promise<void>

  // Dashboard actions
  fetchDashboardMetrics: () => Promise<void>

  // Utility actions
  clearError: () => void
  setLoading: (loading: boolean) => void
}

const apiCall = async (endpoint: string, options: RequestInit = {}) => {
  const token = useAppStore.getState().token

  const response = await fetch(endpoint, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
  })

  const result = await response.json()

  if (!response.ok) {
    throw new Error(result.error || `HTTP ${response.status}`)
  }

  return result
}

export const useAppStore = create<AppState>((set, get) => ({
  // Initial state
  user: null,
  token: typeof window !== "undefined" ? localStorage.getItem("auth_token") : null,
  isAuthenticated: false,
  documents: [],
  activeDocument: null,
  documentVersions: [],
  documentComparison: null,
  drafts: [],
  activeDraft: null,
  mergeRequests: [],
  users: [],
  auditLogs: [],
  dashboardMetrics: null,
  isLoading: false,
  error: null,

  // Auth actions
  login: async (credentials: LoginCredentials) => {
    set({ isLoading: true, error: null })
    try {
      const result = await apiCall("/api/auth/login", {
        method: "POST",
        body: JSON.stringify(credentials),
      })

      const { user, token } = result.data

      // Store token in localStorage
      if (typeof window !== "undefined") {
        localStorage.setItem("auth_token", token)
      }

      set({
        user,
        token,
        isAuthenticated: true,
        isLoading: false,
      })

      toast({
        title: "Login successful",
        description: `Welcome back, ${user.name}!`,
      })
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Login failed"
      set({ error: errorMessage, isLoading: false })
      toast({
        title: "Login failed",
        description: errorMessage,
        variant: "destructive",
      })
      throw error
    }
  },

  logout: () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("auth_token")
    }

    set({
      user: null,
      token: null,
      isAuthenticated: false,
      documents: [],
      activeDocument: null,
      documentVersions: [],
      documentComparison: null,
      drafts: [],
      activeDraft: null,
      mergeRequests: [],
      users: [],
      auditLogs: [],
      dashboardMetrics: null,
    })

    toast({
      title: "Logged out",
      description: "You have been successfully logged out.",
    })
  },

  // Document actions
  fetchDocuments: async (filters = {}) => {
    set({ isLoading: true, error: null })
    try {
      const queryParams = new URLSearchParams()
      Object.entries(filters).forEach(([key, value]) => {
        if (value) queryParams.set(key, value.toString())
      })

      const result = await apiCall(`/api/documents?${queryParams}`)
      set({ documents: result.data, isLoading: false })
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to fetch documents"
      set({ error: errorMessage, isLoading: false })
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      })
    }
  },

  selectDocument: async (id: string) => {
    if (!id) {
      set({ activeDocument: null, documentVersions: [], documentComparison: null })
      return
    }

    const { documents } = get()
    const document = documents.find((doc) => doc.id === id)
    if (document) {
      set({ activeDocument: document })
      get().fetchDocumentVersions(id)
    }
  },

  fetchDocumentVersions: async (documentId: string) => {
    try {
      const result = await apiCall(`/api/documents/${documentId}/versions`)
      set({ documentVersions: result.data })
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to fetch document versions"
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      })
    }
  },

  compareDocumentVersions: async (documentId: string, fromVersion: number, toVersion: number) => {
    set({ isLoading: true })
    try {
      const result = await apiCall(`/api/documents/${documentId}/compare?from=${fromVersion}&to=${toVersion}`)
      set({ documentComparison: result.data, isLoading: false })
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to compare document versions"
      set({ error: errorMessage, isLoading: false })
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      })
    }
  },

  searchDocuments: async (query: string) => {
    set({ isLoading: true, error: null })
    try {
      const result = await apiCall(`/api/documents/search?q=${encodeURIComponent(query)}`)
      set({ documents: result.data, isLoading: false })
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to search documents"
      set({ error: errorMessage, isLoading: false })
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      })
    }
  },

  // Draft actions
  createDraft: async (documentId: string, name: string, description?: string) => {
    set({ isLoading: true })
    try {
      // Get the latest official version as base
      const versionsResult = await apiCall(`/api/documents/${documentId}/versions`)
      const officialVersion = versionsResult.data.find((v: any) => v.is_official)

      if (!officialVersion) {
        throw new Error("No official version found")
      }

      const result = await apiCall("/api/drafts", {
        method: "POST",
        body: JSON.stringify({
          document_id: documentId,
          name,
          description,
          base_version_id: officialVersion.id,
        }),
      })

      set({ isLoading: false })
      toast({
        title: "Draft created",
        description: `Draft "${name}" has been created successfully.`,
      })

      // Refresh drafts
      get().fetchDrafts()
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to create draft"
      set({ error: errorMessage, isLoading: false })
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      })
    }
  },

  fetchDrafts: async (filters = {}) => {
    try {
      const queryParams = new URLSearchParams()
      Object.entries(filters).forEach(([key, value]) => {
        if (value) queryParams.set(key, value.toString())
      })

      const result = await apiCall(`/api/drafts?${queryParams}`)
      set({ drafts: result.data })
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to fetch drafts"
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      })
    }
  },

  // Merge request actions
  fetchMergeRequests: async (filters = {}) => {
    try {
      const queryParams = new URLSearchParams()
      Object.entries(filters).forEach(([key, value]) => {
        if (value) queryParams.set(key, value.toString())
      })

      const result = await apiCall(`/api/merge-requests?${queryParams}`)
      set({ mergeRequests: result.data })
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to fetch merge requests"
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      })
    }
  },

  submitMergeRequest: async (draftId: string, approverId: string, summary: string) => {
    set({ isLoading: true })
    try {
      await apiCall("/api/merge-requests", {
        method: "POST",
        body: JSON.stringify({
          draft_id: draftId,
          approver_id: approverId,
          summary,
        }),
      })

      set({ isLoading: false })
      toast({
        title: "Merge request submitted",
        description: "Your merge request has been submitted for approval.",
      })

      // Refresh merge requests
      get().fetchMergeRequests()
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to submit merge request"
      set({ error: errorMessage, isLoading: false })
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      })
    }
  },

  approveMergeRequest: async (id: string) => {
    set({ isLoading: true })
    try {
      await apiCall(`/api/merge-requests/${id}/approve`, {
        method: "POST",
      })

      set({ isLoading: false })
      toast({
        title: "Merge request approved",
        description: "The merge request has been approved and merged.",
      })

      // Refresh data
      get().fetchMergeRequests()
      get().fetchDocuments()
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to approve merge request"
      set({ error: errorMessage, isLoading: false })
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      })
    }
  },

  rejectMergeRequest: async (id: string, reason: string) => {
    set({ isLoading: true })
    try {
      await apiCall(`/api/merge-requests/${id}/reject`, {
        method: "POST",
        body: JSON.stringify({
          approved: false,
          rejection_reason: reason,
        }),
      })

      set({ isLoading: false })
      toast({
        title: "Merge request rejected",
        description: "The merge request has been rejected.",
      })

      // Refresh merge requests
      get().fetchMergeRequests()
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to reject merge request"
      set({ error: errorMessage, isLoading: false })
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      })
    }
  },

  // User management actions
  fetchUsers: async () => {
    set({ isLoading: true, error: null })
    try {
      const result = await apiCall("/api/users")
      set({ users: result.data, isLoading: false })
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to fetch users"
      set({ error: errorMessage, isLoading: false })
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      })
    }
  },

  createUser: async (userData: any) => {
    set({ isLoading: true })
    try {
      await apiCall("/api/users", {
        method: "POST",
        body: JSON.stringify(userData),
      })

      set({ isLoading: false })
      toast({
        title: "User created",
        description: `User ${userData.name} has been created successfully.`,
      })

      // Refresh users
      get().fetchUsers()
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to create user"
      set({ error: errorMessage, isLoading: false })
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      })
    }
  },

  updateUser: async (id: string, updates: any) => {
    set({ isLoading: true })
    try {
      await apiCall(`/api/users/${id}`, {
        method: "PUT",
        body: JSON.stringify(updates),
      })

      set({ isLoading: false })
      toast({
        title: "User updated",
        description: "User has been updated successfully.",
      })

      // Refresh users
      get().fetchUsers()
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to update user"
      set({ error: errorMessage, isLoading: false })
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      })
    }
  },

  deleteUser: async (id: string) => {
    set({ isLoading: true })
    try {
      await apiCall(`/api/users/${id}`, {
        method: "DELETE",
      })

      set({ isLoading: false })
      toast({
        title: "User deleted",
        description: "User has been deleted successfully.",
      })

      // Refresh users
      get().fetchUsers()
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to delete user"
      set({ error: errorMessage, isLoading: false })
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      })
    }
  },

  // Audit log actions
  fetchAuditLogs: async (filters = {}) => {
    set({ isLoading: true, error: null })
    try {
      const queryParams = new URLSearchParams()
      Object.entries(filters).forEach(([key, value]) => {
        if (value) queryParams.set(key, value.toString())
      })

      const result = await apiCall(`/api/audit-logs?${queryParams}`)
      set({ auditLogs: result.data, isLoading: false })
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to fetch audit logs"
      set({ error: errorMessage, isLoading: false })
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      })
    }
  },

  // Dashboard actions
  fetchDashboardMetrics: async () => {
    set({ isLoading: true, error: null })
    try {
      const result = await apiCall("/api/dashboard/metrics")
      set({ dashboardMetrics: result.data, isLoading: false })
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to fetch dashboard metrics"
      set({ error: errorMessage, isLoading: false })
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      })
    }
  },

  clearError: () => set({ error: null }),
  setLoading: (loading: boolean) => set({ isLoading: loading }),
}))

// Initialize auth state on app load
if (typeof window !== "undefined") {
  const token = localStorage.getItem("auth_token")
  if (token) {
    // Verify token is still valid by fetching user info
    fetch("/api/auth/me", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((response) => response.json())
      .then((result) => {
        if (result.success) {
          useAppStore.setState({
            user: result.data,
            token,
            isAuthenticated: true,
          })
        } else {
          localStorage.removeItem("auth_token")
        }
      })
      .catch(() => {
        localStorage.removeItem("auth_token")
      })
  }
}
