import { create } from "zustand"
import { toast } from "@/hooks/use-toast"
import type { User, Document, Draft, MergeRequest } from "@/types/database"

export interface LoginCredentials {
  email: string
  password: string
}

export interface DocumentFilters {
  classification?: string
  owner_id?: string
  search?: string
  limit?: number
  offset?: number
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

  // UI state
  isLoading: boolean
  error: string | null

  // Actions
  login: (credentials: LoginCredentials) => Promise<void>
  logout: () => void
  fetchDocuments: (filters?: DocumentFilters) => Promise<void>
  selectDocument: (id: string) => Promise<void>
  fetchDocumentVersions: (documentId: string) => Promise<void>
  compareDocumentVersions: (documentId: string, fromVersion: number, toVersion: number) => Promise<void>
  createDraft: (documentId: string, name: string, description?: string) => Promise<void>
  fetchDrafts: (filters?: any) => Promise<void>
  fetchMergeRequests: (filters?: any) => Promise<void>
  submitMergeRequest: (draftId: string, approverId: string, summary: string) => Promise<void>
  approveMergeRequest: (id: string) => Promise<void>
  rejectMergeRequest: (id: string, reason: string) => Promise<void>
  clearError: () => void
  setLoading: (loading: boolean) => void
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
  isLoading: false,
  error: null,

  // Actions
  login: async (credentials: LoginCredentials) => {
    set({ isLoading: true, error: null })
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(credentials),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || "Login failed")
      }

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
    })

    toast({
      title: "Logged out",
      description: "You have been successfully logged out.",
    })
  },

  fetchDocuments: async (filters?: DocumentFilters) => {
    const { token } = get()
    if (!token) return

    set({ isLoading: true, error: null })
    try {
      const queryParams = new URLSearchParams()
      if (filters?.classification) queryParams.set("classification", filters.classification)
      if (filters?.owner_id) queryParams.set("owner_id", filters.owner_id)
      if (filters?.search) queryParams.set("search", filters.search)
      if (filters?.limit) queryParams.set("limit", filters.limit.toString())
      if (filters?.offset) queryParams.set("offset", filters.offset.toString())

      const response = await fetch(`/api/documents?${queryParams}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || "Failed to fetch documents")
      }

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
    const { token, documents } = get()
    if (!token) return

    const document = documents.find((doc) => doc.id === id)
    if (document) {
      set({ activeDocument: document })
      // Fetch versions for the selected document
      get().fetchDocumentVersions(id)
    }
  },

  fetchDocumentVersions: async (documentId: string) => {
    const { token } = get()
    if (!token) return

    try {
      const response = await fetch(`/api/documents/${documentId}/versions`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || "Failed to fetch document versions")
      }

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
    const { token } = get()
    if (!token) return

    set({ isLoading: true })
    try {
      const response = await fetch(`/api/documents/${documentId}/compare?from=${fromVersion}&to=${toVersion}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || "Failed to compare document versions")
      }

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

  createDraft: async (documentId: string, name: string, description?: string) => {
    const { token, activeDocument } = get()
    if (!token || !activeDocument) return

    set({ isLoading: true })
    try {
      // Get the latest official version as base
      const versionsResponse = await fetch(`/api/documents/${documentId}/versions`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      const versionsResult = await versionsResponse.json()
      if (!versionsResponse.ok) {
        throw new Error("Failed to fetch document versions")
      }

      const officialVersion = versionsResult.data.find((v: any) => v.is_official)
      if (!officialVersion) {
        throw new Error("No official version found")
      }

      const response = await fetch("/api/drafts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          document_id: documentId,
          name,
          description,
          base_version_id: officialVersion.id,
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || "Failed to create draft")
      }

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

  fetchDrafts: async (filters?: any) => {
    const { token } = get()
    if (!token) return

    try {
      const queryParams = new URLSearchParams()
      if (filters?.document_id) queryParams.set("document_id", filters.document_id)
      if (filters?.creator_id) queryParams.set("creator_id", filters.creator_id)
      if (filters?.status) queryParams.set("status", filters.status)

      const response = await fetch(`/api/drafts?${queryParams}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || "Failed to fetch drafts")
      }

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

  fetchMergeRequests: async (filters?: any) => {
    const { token } = get()
    if (!token) return

    try {
      const queryParams = new URLSearchParams()
      if (filters?.status) queryParams.set("status", filters.status)
      if (filters?.approver_id) queryParams.set("approver_id", filters.approver_id)

      const response = await fetch(`/api/merge-requests?${queryParams}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || "Failed to fetch merge requests")
      }

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
    const { token } = get()
    if (!token) return

    set({ isLoading: true })
    try {
      const response = await fetch("/api/merge-requests", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          draft_id: draftId,
          approver_id: approverId,
          summary,
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || "Failed to submit merge request")
      }

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
    const { token } = get()
    if (!token) return

    set({ isLoading: true })
    try {
      const response = await fetch(`/api/merge-requests/${id}/approve`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || "Failed to approve merge request")
      }

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
    const { token } = get()
    if (!token) return

    set({ isLoading: true })
    try {
      const response = await fetch(`/api/merge-requests/${id}/reject`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          approved: false,
          rejection_reason: reason,
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || "Failed to reject merge request")
      }

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
