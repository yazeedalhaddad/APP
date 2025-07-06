"use client"

import { useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { CheckSquare, Eye, Upload, FileText, Clock } from "lucide-react"
import { useAppStore } from "@/stores/app-store"

interface User {
  id: string
  name: string
  email: string
  role: string
  department: string
}

interface ProductionDashboardProps {
  user: User
  onDocumentSelect: (document: any) => void
}

export function ProductionDashboard({ user, onDocumentSelect }: ProductionDashboardProps) {
  const { mergeRequests, documents, auditLogs, isLoading, fetchMergeRequests, fetchDocuments, fetchAuditLogs } =
    useAppStore()

  useEffect(() => {
    // Fetch merge requests assigned to this user for approval
    fetchMergeRequests({ approver_id: user.id })

    // Fetch documents owned by this user
    fetchDocuments({ owner_id: user.id })

    // Fetch recent audit logs for this user
    fetchAuditLogs({ user_id: user.id, limit: 10 })
  }, [user.id, fetchMergeRequests, fetchDocuments, fetchAuditLogs])

  const pendingApprovals = mergeRequests.filter((mr) => mr.status === "pending")
  const recentDocuments = documents.slice(0, 5)
  const recentActivities = auditLogs.slice(0, 4)

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-green-600 to-green-700 rounded-lg p-6 text-white">
        <h2 className="text-2xl font-bold mb-2">Welcome back, {user.name}</h2>
        <p className="text-green-100">
          You have {pendingApprovals.length} pending approvals and {recentDocuments.length} documents to manage.
        </p>
        <Button className="mt-4 bg-white text-green-700 hover:bg-green-50">
          <Upload className="h-4 w-4 mr-2" />
          Upload New Document
        </Button>
      </div>

      {/* Pending Approvals */}
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <CheckSquare className="h-5 w-5 text-orange-600" />
            <span>Pending Approvals</span>
            <Badge className="bg-orange-100 text-orange-800">{pendingApprovals.length}</Badge>
          </CardTitle>
          <CardDescription>Documents requiring your review and approval</CardDescription>
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
          ) : pendingApprovals.length > 0 ? (
            pendingApprovals.map((request) => (
              <div
                key={request.id}
                className="p-4 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <h4 className="font-medium text-slate-800">{request.draft_name || "Unknown Draft"}</h4>
                      <Badge variant="outline" className="text-xs bg-orange-50 text-orange-700">
                        Pending Review
                      </Badge>
                    </div>
                    <p className="text-sm text-slate-600 mb-2">{request.summary}</p>
                    <div className="flex items-center space-x-4 text-xs text-slate-500">
                      <span>From: {request.creator_name || "Unknown"}</span>
                      <span>Document: {request.document_title || "Unknown"}</span>
                      <span>Submitted: {new Date(request.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <Button size="sm" variant="outline" onClick={() => onDocumentSelect(request)} className="ml-4">
                    <Eye className="h-4 w-4 mr-1" />
                    Review
                  </Button>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8 text-slate-500">
              <CheckSquare className="h-12 w-12 mx-auto mb-4 text-slate-300" />
              <p>No pending approvals</p>
              <p className="text-sm">All caught up!</p>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Documents */}
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <FileText className="h-5 w-5 text-blue-600" />
              <span>Your Documents</span>
            </CardTitle>
            <CardDescription>Documents you own or manage</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {isLoading ? (
              // Loading skeleton
              Array.from({ length: 5 }).map((_, index) => (
                <div key={index} className="p-3 border border-slate-200 rounded-lg">
                  <Skeleton className="h-4 w-full mb-2" />
                  <Skeleton className="h-3 w-3/4" />
                </div>
              ))
            ) : recentDocuments.length > 0 ? (
              recentDocuments.map((doc) => (
                <div key={doc.id} className="p-3 border border-slate-200 rounded-lg">
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="font-medium text-slate-800 text-sm">{doc.title}</h4>
                    <Badge
                      variant={doc.classification === "confidential" ? "destructive" : "secondary"}
                      className="text-xs"
                    >
                      {doc.classification}
                    </Badge>
                  </div>
                  <div className="text-xs text-slate-500 space-y-1">
                    <p>Type: {doc.file_type}</p>
                    <p>Updated: {new Date(doc.updated_at).toLocaleDateString()}</p>
                    <p>Version: {doc.current_version || 1}</p>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-6 text-slate-500">
                <FileText className="h-8 w-8 mx-auto mb-2 text-slate-300" />
                <p className="text-sm">No documents found</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Clock className="h-5 w-5 text-green-600" />
              <span>Recent Activity</span>
            </CardTitle>
            <CardDescription>Your latest actions and updates</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {isLoading ? (
              // Loading skeleton
              Array.from({ length: 4 }).map((_, index) => (
                <div key={index} className="p-3 border border-slate-200 rounded-lg">
                  <Skeleton className="h-3 w-3/4 mb-1" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
              ))
            ) : recentActivities.length > 0 ? (
              recentActivities.map((activity) => (
                <div key={activity.id} className="p-3 border border-slate-200 rounded-lg">
                  <p className="text-sm font-medium text-slate-800">{activity.action.replace(/_/g, " ")}</p>
                  <p className="text-xs text-slate-600 mt-1">
                    {activity.details?.title || activity.details?.document_title || "Document activity"}
                  </p>
                  <p className="text-xs text-slate-500 mt-1">{new Date(activity.timestamp).toLocaleString()}</p>
                </div>
              ))
            ) : (
              <div className="text-center py-6 text-slate-500">
                <Clock className="h-8 w-8 mx-auto mb-2 text-slate-300" />
                <p className="text-sm">No recent activity</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
