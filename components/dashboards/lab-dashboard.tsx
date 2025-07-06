"use client"

import { useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { FileText, Upload, Clock, Activity, FlaskConical, CheckCircle, GitBranch } from "lucide-react"
import { useAppStore } from "@/stores/app-store"

interface User {
  id: string
  name: string
  email: string
  role: string
  department: string
}

interface LabDashboardProps {
  user: User
  onDocumentSelect: (document: any) => void
}

export function LabDashboard({ user, onDocumentSelect }: LabDashboardProps) {
  const { drafts, mergeRequests, auditLogs, isLoading, fetchDrafts, fetchMergeRequests, fetchAuditLogs } = useAppStore()

  useEffect(() => {
    // Fetch user's drafts
    fetchDrafts({ creator_id: user.id })

    // Fetch merge requests created by this user
    fetchMergeRequests({ creator_id: user.id })

    // Fetch recent audit logs for this user
    fetchAuditLogs({ user_id: user.id, limit: 10 })
  }, [user.id, fetchDrafts, fetchMergeRequests, fetchAuditLogs])

  const pendingDrafts = drafts.filter((draft) => draft.status === "in_progress")
  const submittedRequests = mergeRequests.filter((mr) => mr.status === "pending")
  const recentActivities = auditLogs.slice(0, 4)

  const getActionIcon = (action: string) => {
    switch (action) {
      case "DOCUMENT_APPROVED":
        return CheckCircle
      case "DOCUMENT_CREATED":
      case "DRAFT_CREATED":
        return FileText
      case "DOCUMENT_UPLOADED":
        return Upload
      case "MERGE_REQUEST_CREATED":
        return GitBranch
      default:
        return Activity
    }
  }

  const getActionColor = (action: string) => {
    switch (action) {
      case "DOCUMENT_APPROVED":
        return "text-green-600"
      case "DOCUMENT_REJECTED":
        return "text-red-600"
      case "DOCUMENT_CREATED":
      case "DRAFT_CREATED":
        return "text-blue-600"
      case "DOCUMENT_UPLOADED":
        return "text-purple-600"
      default:
        return "text-slate-600"
    }
  }

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-purple-600 to-purple-700 rounded-lg p-6 text-white">
        <h2 className="text-2xl font-bold mb-2">Good morning, {user.name}</h2>
        <p className="text-purple-100">
          You have {pendingDrafts.length} drafts in progress and {submittedRequests.length} documents under review.
        </p>
        <Button className="mt-4 bg-white text-purple-700 hover:bg-purple-50">
          <Upload className="h-4 w-4 mr-2" />
          Upload New Document
        </Button>
      </div>

      {/* Drafts to Complete */}
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <FlaskConical className="h-5 w-5 text-purple-600" />
            <span>Drafts in Progress</span>
            <Badge className="bg-purple-100 text-purple-800">{pendingDrafts.length}</Badge>
          </CardTitle>
          <CardDescription>Laboratory drafts requiring completion</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {isLoading ? (
            // Loading skeleton
            Array.from({ length: 3 }).map((_, index) => (
              <div key={index} className="p-4 border border-slate-200 rounded-lg">
                <div className="space-y-2">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                  <Skeleton className="h-3 w-1/4" />
                </div>
              </div>
            ))
          ) : pendingDrafts.length > 0 ? (
            pendingDrafts.map((draft) => (
              <div
                key={draft.id}
                className="p-4 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <h4 className="font-medium text-slate-800">{draft.name}</h4>
                      <Badge variant="secondary" className="text-xs">
                        {draft.status}
                      </Badge>
                    </div>
                    <p className="text-sm text-slate-600 mb-2">{draft.description || "No description"}</p>
                    <div className="flex items-center space-x-4 text-xs text-slate-500">
                      <span>Document: {draft.document_title || "Unknown"}</span>
                      <span>Created: {new Date(draft.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    className="ml-4 bg-purple-600 hover:bg-purple-700"
                    onClick={() => onDocumentSelect(draft)}
                  >
                    <GitBranch className="h-4 w-4 mr-1" />
                    Edit Draft
                  </Button>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8 text-slate-500">
              <FlaskConical className="h-12 w-12 mx-auto mb-4 text-slate-300" />
              <p>No drafts in progress</p>
              <p className="text-sm">Create a new draft to get started</p>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Submitted for Review */}
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Clock className="h-5 w-5 text-blue-600" />
              <span>Submitted for Review</span>
            </CardTitle>
            <CardDescription>Documents you've submitted awaiting approval</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {isLoading ? (
              // Loading skeleton
              Array.from({ length: 3 }).map((_, index) => (
                <div key={index} className="p-3 border border-slate-200 rounded-lg">
                  <Skeleton className="h-4 w-full mb-2" />
                  <Skeleton className="h-3 w-3/4" />
                </div>
              ))
            ) : submittedRequests.length > 0 ? (
              submittedRequests.map((request) => (
                <div key={request.id} className="p-3 border border-slate-200 rounded-lg">
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="font-medium text-slate-800 text-sm">{request.draft_name || "Unknown Draft"}</h4>
                    <Badge variant="secondary" className="text-xs">
                      {request.status}
                    </Badge>
                  </div>
                  <div className="text-xs text-slate-500 space-y-1">
                    <p>Document: {request.document_title || "Unknown"}</p>
                    <p>Submitted: {new Date(request.created_at).toLocaleDateString()}</p>
                    <p>Approver: {request.approver_name || "Unknown"}</p>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-6 text-slate-500">
                <Clock className="h-8 w-8 mx-auto mb-2 text-slate-300" />
                <p className="text-sm">No pending reviews</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Activity Feed */}
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Activity className="h-5 w-5 text-green-600" />
              <span>Recent Activity</span>
            </CardTitle>
            <CardDescription>Latest updates and notifications</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {isLoading ? (
              // Loading skeleton
              Array.from({ length: 4 }).map((_, index) => (
                <div key={index} className="flex items-start space-x-3 p-3 border border-slate-200 rounded-lg">
                  <Skeleton className="h-4 w-4 rounded-full" />
                  <div className="flex-1 space-y-1">
                    <Skeleton className="h-3 w-3/4" />
                    <Skeleton className="h-3 w-1/2" />
                  </div>
                </div>
              ))
            ) : recentActivities.length > 0 ? (
              recentActivities.map((activity) => {
                const ActionIcon = getActionIcon(activity.action)
                return (
                  <div key={activity.id} className="flex items-start space-x-3 p-3 border border-slate-200 rounded-lg">
                    <div className="flex-shrink-0">
                      <ActionIcon className={`h-4 w-4 ${getActionColor(activity.action)}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-800">{activity.action.replace(/_/g, " ")}</p>
                      <p className="text-xs text-slate-600 mt-1">
                        {activity.details?.title || activity.details?.document_title || "Document activity"}
                      </p>
                      <p className="text-xs text-slate-500 mt-1">{new Date(activity.timestamp).toLocaleString()}</p>
                    </div>
                  </div>
                )
              })
            ) : (
              <div className="text-center py-6 text-slate-500">
                <Activity className="h-8 w-8 mx-auto mb-2 text-slate-300" />
                <p className="text-sm">No recent activity</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
