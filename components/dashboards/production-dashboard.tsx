"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { CheckSquare, Send, Eye, Upload } from "lucide-react"

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
  const pendingTasks = [
    {
      id: "TASK-001",
      title: "Comment from Management on your draft 'Production Schedule Update'",
      description: "Management has requested clarification on the overtime scheduling section",
      submittedBy: "Dr. Sarah Johnson",
      department: "Management",
      priority: "High",
      dueDate: "Today",
      type: "Draft Comment",
      draftStatus: "Needs Revision",
    },
    {
      id: "TASK-002",
      title: "Your draft 'Equipment Maintenance Protocol' was Approved",
      description: "Draft has been merged into Official Version v2.1",
      submittedBy: "Management",
      department: "Management",
      priority: "Medium",
      dueDate: "Completed",
      type: "Merge Notification",
      draftStatus: "Merged",
    },
    {
      id: "TASK-003",
      title: "Create draft for 'Weekly Production Report' update",
      description: "Official version needs updates for new reporting requirements",
      submittedBy: "System",
      department: "Production",
      priority: "Medium",
      dueDate: "Dec 15",
      type: "Draft Creation",
      draftStatus: "Not Started",
    },
  ]

  const recentlyApproved = [
    {
      id: "DOC-2024-045",
      title: "Quality Control Report - Batch #4810",
      approvedBy: "Management",
      approvedDate: "2 hours ago",
      status: "Approved",
      nextStep: "Ready for Production",
    },
    {
      id: "DOC-2024-044",
      title: "Material Safety Data Sheet Update",
      approvedBy: "QC Department",
      approvedDate: "1 day ago",
      status: "Approved",
      nextStep: "Implementation Required",
    },
    {
      id: "DOC-2024-043",
      title: "Equipment Maintenance Protocol",
      approvedBy: "Management",
      approvedDate: "2 days ago",
      status: "Approved",
      nextStep: "Schedule Maintenance",
    },
  ]

  const outgoingDocuments = [
    {
      id: "OUT-001",
      title: "Production Report - Week 50",
      sentTo: "Management",
      currentStage: "Pending Management Review",
      sentDate: "1 day ago",
      status: "In Review",
    },
    {
      id: "OUT-002",
      title: "Batch Completion Certificate #4812",
      sentTo: "Quality Control",
      currentStage: "QC Verification",
      sentDate: "3 days ago",
      status: "Under Review",
    },
    {
      id: "OUT-003",
      title: "Equipment Calibration Results",
      sentTo: "Laboratory",
      currentStage: "Lab Verification Complete",
      sentDate: "1 week ago",
      status: "Completed",
    },
  ]

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-green-600 to-green-700 rounded-lg p-6 text-white">
        <h2 className="text-2xl font-bold mb-2">Welcome back, {user.name}</h2>
        <p className="text-green-100">You have 3 pending tasks and 2 high-priority items requiring your attention.</p>
        <Button className="mt-4 bg-white text-green-700 hover:bg-green-50">
          <Upload className="h-4 w-4 mr-2" />
          Upload New Document
        </Button>
      </div>

      {/* My Pending Tasks */}
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <CheckSquare className="h-5 w-5 text-orange-600" />
            <span>My Pending Tasks</span>
            <Badge className="bg-orange-100 text-orange-800">{pendingTasks.length}</Badge>
          </CardTitle>
          <CardDescription>Documents requiring your review and action</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {pendingTasks.map((task, index) => (
            <div key={index} className="p-4 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <h4 className="font-medium text-slate-800">{task.title}</h4>
                    <Badge variant={task.priority === "High" ? "destructive" : "secondary"} className="text-xs">
                      {task.priority}
                    </Badge>
                    <Badge
                      variant="outline"
                      className={`text-xs ${
                        task.draftStatus === "Merged"
                          ? "bg-green-50 text-green-700"
                          : task.draftStatus === "Needs Revision"
                            ? "bg-orange-50 text-orange-700"
                            : "bg-blue-50 text-blue-700"
                      }`}
                    >
                      {task.draftStatus}
                    </Badge>
                  </div>
                  <p className="text-sm text-slate-600 mb-2">{task.description}</p>
                  <div className="flex items-center space-x-4 text-xs text-slate-500">
                    <span>From: {task.submittedBy}</span>
                    <span>Type: {task.type}</span>
                    <span>Status: {task.dueDate}</span>
                  </div>
                </div>
                <Button size="sm" variant="outline" onClick={() => onDocumentSelect(task)} className="ml-4">
                  <Eye className="h-4 w-4 mr-1" />
                  {task.type === "Draft Comment"
                    ? "View Draft"
                    : task.type === "Merge Notification"
                      ? "View Document"
                      : "Create Draft"}
                </Button>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recently Approved Documents */}
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <CheckSquare className="h-5 w-5 text-green-600" />
              <span>Recently Approved Documents</span>
            </CardTitle>
            <CardDescription>Documents approved by Management or QC relevant to Production</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {recentlyApproved.map((doc, index) => (
              <div key={index} className="p-3 border border-slate-200 rounded-lg">
                <div className="flex items-start justify-between mb-2">
                  <h4 className="font-medium text-slate-800 text-sm">{doc.title}</h4>
                  <Badge className="bg-green-100 text-green-800 text-xs">{doc.status}</Badge>
                </div>
                <div className="text-xs text-slate-500 space-y-1">
                  <p>
                    Approved by: {doc.approvedBy} • {doc.approvedDate}
                  </p>
                  <p className="text-blue-600 font-medium">Next: {doc.nextStep}</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Outgoing Documents */}
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Send className="h-5 w-5 text-blue-600" />
              <span>Outgoing Documents</span>
            </CardTitle>
            <CardDescription>Documents you've sent to other departments</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {outgoingDocuments.map((doc, index) => (
              <div key={index} className="p-3 border border-slate-200 rounded-lg">
                <div className="flex items-start justify-between mb-2">
                  <h4 className="font-medium text-slate-800 text-sm">{doc.title}</h4>
                  <Badge variant={doc.status === "Completed" ? "default" : "secondary"} className="text-xs">
                    {doc.status}
                  </Badge>
                </div>
                <div className="text-xs text-slate-500 space-y-1">
                  <p>
                    Sent to: {doc.sentTo} • {doc.sentDate}
                  </p>
                  <p className="text-blue-600">Current stage: {doc.currentStage}</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
