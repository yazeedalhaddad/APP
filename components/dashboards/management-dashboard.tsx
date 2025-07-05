"use client"

import { useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Skeleton } from "@/components/ui/skeleton"
import { FileText, Clock, CheckCircle, AlertTriangle, TrendingUp, Building, Eye } from "lucide-react"
import { useAppStore } from "@/stores/app-store"

interface ManagementDashboardProps {
  onDocumentSelect: (document: any) => void
}

export function ManagementDashboard({ onDocumentSelect }: ManagementDashboardProps) {
  const { user, mergeRequests, isLoading, fetchMergeRequests } = useAppStore()

  useEffect(() => {
    if (user) {
      fetchMergeRequests({ status: "pending" })
    }
  }, [user])

  const kpiData = [
    {
      label: "Total Pending Approvals",
      value: mergeRequests.filter((mr) => mr.status === "pending").length.toString(),
      icon: Clock,
      color: "text-orange-600",
      bg: "bg-orange-50",
    },
    { label: "Avg. Turnaround Time", value: "2.3 days", icon: TrendingUp, color: "text-blue-600", bg: "bg-blue-50" },
    { label: "Documents This Month", value: "847", icon: FileText, color: "text-green-600", bg: "bg-green-50" },
    { label: "Recently Archived", value: "156", icon: CheckCircle, color: "text-slate-600", bg: "bg-slate-50" },
  ]

  const departmentStatus = [
    { department: "Laboratory", active: 23, pending: 8, completed: 145 },
    { department: "Production", active: 15, pending: 4, completed: 98 },
    { department: "Quality Control", active: 7, pending: 2, completed: 67 },
  ]

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-32 w-full" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-24 w-full" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Skeleton className="h-64 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg p-6 text-white">
        <h2 className="text-2xl font-bold mb-2">Good morning, {user?.name}</h2>
        <p className="text-blue-100">
          You have {mergeRequests.filter((mr) => mr.status === "pending").length} documents awaiting your approval and{" "}
          {mergeRequests.filter((mr) => mr.status === "pending" && mr.priority === "high").length} high-priority items
          requiring immediate attention.
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {kpiData.map((kpi, index) => (
          <Card key={index} className="border-0 shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600">{kpi.label}</p>
                  <p className="text-2xl font-bold text-slate-800 mt-1">{kpi.value}</p>
                </div>
                <div className={`p-3 rounded-lg ${kpi.bg}`}>
                  <kpi.icon className={`h-6 w-6 ${kpi.color}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Departmental Workflow Status */}
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Building className="h-5 w-5 text-blue-600" />
              <span>Departmental Workflow Status</span>
            </CardTitle>
            <CardDescription>Current document activity across all departments</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {departmentStatus.map((dept, index) => (
              <div key={index} className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-slate-800">{dept.department}</span>
                  <div className="flex items-center space-x-4 text-sm">
                    <span className="text-orange-600">{dept.pending} pending</span>
                    <span className="text-blue-600">{dept.active} active</span>
                    <span className="text-green-600">{dept.completed} completed</span>
                  </div>
                </div>
                <Progress
                  value={(dept.completed / (dept.completed + dept.active + dept.pending)) * 100}
                  className="h-2"
                />
              </div>
            ))}
          </CardContent>
        </Card>

        {/* High-Priority Approvals */}
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <AlertTriangle className="h-5 w-5 text-orange-600" />
              <span>Pending Approvals</span>
            </CardTitle>
            <CardDescription>Merge requests requiring your attention</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {mergeRequests
              .filter((mr) => mr.status === "pending")
              .slice(0, 3)
              .map((doc, index) => (
                <div key={index} className="p-4 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <h4 className="font-medium text-slate-800">{doc.draft_name}</h4>
                        <Badge variant="secondary" className="text-xs">
                          Merge Request
                        </Badge>
                      </div>
                      <p className="text-sm text-slate-600 mb-2">{doc.summary}</p>
                      <div className="flex items-center space-x-4 text-xs text-slate-500">
                        <span>From: {doc.creator_name}</span>
                        <span>Document: {doc.document_title}</span>
                      </div>
                    </div>
                    <Button size="sm" variant="outline" onClick={() => onDocumentSelect(doc)} className="ml-4">
                      <Eye className="h-4 w-4 mr-1" />
                      Review Changes
                    </Button>
                  </div>
                </div>
              ))}
            {mergeRequests.filter((mr) => mr.status === "pending").length === 0 && (
              <p className="text-sm text-slate-500 text-center py-4">No pending approvals</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
