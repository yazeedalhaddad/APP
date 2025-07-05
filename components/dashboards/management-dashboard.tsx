"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { FileText, Clock, CheckCircle, AlertTriangle, TrendingUp, Building, Eye } from "lucide-react"

interface User {
  id: string
  name: string
  email: string
  role: string
  department: string
}

interface ManagementDashboardProps {
  user: User
  onDocumentSelect: (document: any) => void
}

export function ManagementDashboard({ user, onDocumentSelect }: ManagementDashboardProps) {
  const kpiData = [
    { label: "Total Pending Approvals", value: "12", icon: Clock, color: "text-orange-600", bg: "bg-orange-50" },
    { label: "Avg. Turnaround Time", value: "2.3 days", icon: TrendingUp, color: "text-blue-600", bg: "bg-blue-50" },
    { label: "Documents This Month", value: "847", icon: FileText, color: "text-green-600", bg: "bg-green-50" },
    { label: "Recently Archived", value: "156", icon: CheckCircle, color: "text-slate-600", bg: "bg-slate-50" },
  ]

  const departmentStatus = [
    { department: "Laboratory", active: 23, pending: 8, completed: 145 },
    { department: "Production", active: 15, pending: 4, completed: 98 },
    { department: "Quality Control", active: 7, pending: 2, completed: 67 },
  ]

  const highPriorityApprovals = [
    {
      id: "DOC-2024-001",
      title: "Approval Request for 'SOP-005 Q3 Revisions' from Lab",
      department: "Laboratory",
      submittedBy: "Dr. Emily Rodriguez",
      daysWaiting: 3,
      priority: "High",
      type: "Merge Request",
      changesSummary: "Updated chemical handling procedures per new regulations",
      originalVersion: "v2.0",
    },
    {
      id: "DOC-2024-002",
      title: "Approval Request for 'Production Protocol Update' from Production",
      department: "Production",
      submittedBy: "Mike Chen",
      daysWaiting: 1,
      priority: "Medium",
      type: "Merge Request",
      changesSummary: "Enhanced efficiency protocols and safety measures",
      originalVersion: "v1.3",
    },
    {
      id: "DOC-2024-003",
      title: "Approval Request for 'QA Checklist Revision' from QC",
      department: "Quality Control",
      submittedBy: "Sarah Kim",
      daysWaiting: 5,
      priority: "High",
      type: "Merge Request",
      changesSummary: "Updated compliance requirements for 2024",
      originalVersion: "v3.1",
    },
  ]

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg p-6 text-white">
        <h2 className="text-2xl font-bold mb-2">Good morning, {user.name}</h2>
        <p className="text-blue-100">
          You have 12 documents awaiting your approval and 3 high-priority items requiring immediate attention.
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
              <span>High-Priority Approvals</span>
            </CardTitle>
            <CardDescription>Documents requiring your immediate attention</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {highPriorityApprovals.map((doc, index) => (
              <div key={index} className="p-4 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <h4 className="font-medium text-slate-800">{doc.title}</h4>
                      <Badge variant={doc.priority === "High" ? "destructive" : "secondary"} className="text-xs">
                        {doc.priority}
                      </Badge>
                      <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700">
                        {doc.type}
                      </Badge>
                    </div>
                    <p className="text-sm text-slate-600 mb-2">{doc.changesSummary}</p>
                    <div className="flex items-center space-x-4 text-xs text-slate-500">
                      <span>From: {doc.submittedBy}</span>
                      <span>Department: {doc.department}</span>
                      <span>Base Version: {doc.originalVersion}</span>
                      <span>Waiting: {doc.daysWaiting} days</span>
                    </div>
                  </div>
                  <Button size="sm" variant="outline" onClick={() => onDocumentSelect(doc)} className="ml-4">
                    <Eye className="h-4 w-4 mr-1" />
                    Review Changes
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
