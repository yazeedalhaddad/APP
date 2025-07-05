"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { FileText, Users, TrendingUp, Clock, CheckCircle, XCircle } from "lucide-react"
import { useAppStore } from "@/stores/app-store"
import { DocumentViewer } from "@/components/document-viewer"
import { ReportsInterface } from "@/components/reports-interface"

interface DashboardMetrics {
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
  users: {
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

export function ManagementDashboard() {
  const {
    user,
    documents,
    activeDocument,
    mergeRequests,
    isLoading,
    selectDocument,
    approveMergeRequest,
    rejectMergeRequest,
  } = useAppStore()

  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null)
  const [metricsLoading, setMetricsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("overview")

  useEffect(() => {
    fetchMetrics()
  }, [])

  const fetchMetrics = async () => {
    try {
      const token = useAppStore.getState().token
      if (!token) return

      const response = await fetch("/api/dashboard/metrics", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      const result = await response.json()
      if (result.success) {
        setMetrics(result.data)
      }
    } catch (error) {
      console.error("Failed to fetch metrics:", error)
    } finally {
      setMetricsLoading(false)
    }
  }

  const handleApproveRequest = async (id: string) => {
    await approveMergeRequest(id)
  }

  const handleRejectRequest = async (id: string) => {
    const reason = prompt("Please provide a reason for rejection:")
    if (reason) {
      await rejectMergeRequest(id, reason)
    }
  }

  if (activeDocument) {
    return <DocumentViewer />
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Management Dashboard</h1>
          <p className="text-muted-foreground">Welcome back, {user?.name}. Here's your system overview.</p>
        </div>
        <Button onClick={fetchMetrics} disabled={metricsLoading}>
          Refresh Data
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="approvals">Approvals</TabsTrigger>
          <TabsTrigger value="documents">Documents</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Key Metrics Cards */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Documents</CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                {metricsLoading ? (
                  <Skeleton className="h-8 w-16" />
                ) : (
                  <>
                    <div className="text-2xl font-bold">{metrics?.documents.total || 0}</div>
                    <p className="text-xs text-muted-foreground">
                      +{metrics?.documents.recentlyCreated || 0} this month
                    </p>
                  </>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Users</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                {metricsLoading ? (
                  <Skeleton className="h-8 w-16" />
                ) : (
                  <>
                    <div className="text-2xl font-bold">{metrics?.users.activeUsers || 0}</div>
                    <p className="text-xs text-muted-foreground">{metrics?.users.activityRate || 0}% activity rate</p>
                  </>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Pending Approvals</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                {metricsLoading ? (
                  <Skeleton className="h-8 w-16" />
                ) : (
                  <>
                    <div className="text-2xl font-bold">{metrics?.mergeRequests.pending || 0}</div>
                    <p className="text-xs text-muted-foreground">Require your attention</p>
                  </>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Approval Rate</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                {metricsLoading ? (
                  <Skeleton className="h-8 w-16" />
                ) : (
                  <>
                    <div className="text-2xl font-bold">{metrics?.mergeRequests.approvalRate || 0}%</div>
                    <p className="text-xs text-muted-foreground">Overall approval rate</p>
                  </>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Document Classification Breakdown */}
          <Card>
            <CardHeader>
              <CardTitle>Document Classification</CardTitle>
              <CardDescription>Breakdown of documents by security classification</CardDescription>
            </CardHeader>
            <CardContent>
              {metricsLoading ? (
                <div className="space-y-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Public</span>
                    <Badge variant="secondary">{metrics?.documents.byClassification.public || 0}</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Internal</span>
                    <Badge variant="outline">{metrics?.documents.byClassification.internal || 0}</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Confidential</span>
                    <Badge variant="destructive">{metrics?.documents.byClassification.confidential || 0}</Badge>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="approvals" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Pending Merge Requests</CardTitle>
              <CardDescription>Review and approve document changes</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-4">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="flex items-center space-x-4">
                      <Skeleton className="h-12 w-12 rounded-full" />
                      <div className="space-y-2">
                        <Skeleton className="h-4 w-[250px]" />
                        <Skeleton className="h-4 w-[200px]" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Document</TableHead>
                      <TableHead>Requester</TableHead>
                      <TableHead>Summary</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {mergeRequests
                      .filter((mr) => mr.status === "pending")
                      .map((request) => (
                        <TableRow key={request.id}>
                          <TableCell className="font-medium">
                            {request.draft?.document?.title || "Unknown Document"}
                          </TableCell>
                          <TableCell>{request.draft?.creator?.name || "Unknown"}</TableCell>
                          <TableCell className="max-w-xs truncate">{request.summary}</TableCell>
                          <TableCell>
                            <Badge variant="outline">
                              <Clock className="mr-1 h-3 w-3" />
                              Pending
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex space-x-2">
                              <Button size="sm" onClick={() => handleApproveRequest(request.id)} disabled={isLoading}>
                                <CheckCircle className="mr-1 h-3 w-3" />
                                Approve
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleRejectRequest(request.id)}
                                disabled={isLoading}
                              >
                                <XCircle className="mr-1 h-3 w-3" />
                                Reject
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="documents" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Recent Documents</CardTitle>
              <CardDescription>Recently created or modified documents</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-4">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="flex items-center space-x-4">
                      <Skeleton className="h-8 w-8" />
                      <div className="space-y-2">
                        <Skeleton className="h-4 w-[300px]" />
                        <Skeleton className="h-4 w-[200px]" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Title</TableHead>
                      <TableHead>Classification</TableHead>
                      <TableHead>Owner</TableHead>
                      <TableHead>Last Modified</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {documents.slice(0, 10).map((doc) => (
                      <TableRow key={doc.id}>
                        <TableCell className="font-medium">{doc.title}</TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              doc.classification === "confidential"
                                ? "destructive"
                                : doc.classification === "internal"
                                  ? "outline"
                                  : "secondary"
                            }
                          >
                            {doc.classification}
                          </Badge>
                        </TableCell>
                        <TableCell>{doc.owner?.name || "Unknown"}</TableCell>
                        <TableCell>{new Date(doc.updated_at).toLocaleDateString()}</TableCell>
                        <TableCell>
                          <Button size="sm" variant="outline" onClick={() => selectDocument(doc.id)}>
                            View
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reports">
          <ReportsInterface />
        </TabsContent>
      </Tabs>
    </div>
  )
}
