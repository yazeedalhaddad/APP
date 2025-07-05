"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { FileText, Upload, Clock, Activity, FlaskConical, CheckCircle, AlertCircle, GitBranch } from "lucide-react"

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
  const formsToComplete = [
    {
      id: "FORM-001",
      title: "Create draft for Batch Analysis Report - Lot #4816",
      description: "Official version v2.0 needs updates for new testing procedures",
      priority: "High",
      dueDate: "Today",
      estimatedTime: "45 min",
      type: "Draft Creation",
      baseVersion: "v2.0",
    },
    {
      id: "FORM-002",
      title: "Update your draft 'Equipment Calibration Protocol'",
      description: "Address comments from Production department review",
      priority: "Medium",
      dueDate: "Tomorrow",
      estimatedTime: "20 min",
      type: "Draft Revision",
      baseVersion: "v1.5",
    },
    {
      id: "FORM-003",
      title: "Create draft for Raw Material Testing Protocol",
      description: "New official version needed for updated testing standards",
      priority: "Medium",
      dueDate: "Dec 16",
      estimatedTime: "30 min",
      type: "Draft Creation",
      baseVersion: "v3.2",
    },
  ]

  const submittedForReview = [
    {
      id: "SUB-001",
      title: "Merge Request: 'Batch Analysis Updates' → Official v3.0",
      submittedTo: "Production Department",
      currentReviewer: "Mike Chen",
      submittedDate: "2 hours ago",
      status: "Under Review",
      expectedResponse: "Within 24 hours",
      changesSummary: "Updated testing procedures and quality thresholds",
    },
    {
      id: "SUB-002",
      title: "Merge Request: 'Stability Study Protocol' → Official v2.1",
      submittedTo: "Management",
      currentReviewer: "Dr. Sarah Johnson",
      submittedDate: "1 day ago",
      status: "Pending Approval",
      expectedResponse: "Within 48 hours",
      changesSummary: "Enhanced stability testing methodology",
    },
    {
      id: "SUB-003",
      title: "Merge Request: 'Method Validation Updates' → Official v1.8",
      submittedTo: "Quality Control",
      currentReviewer: "QC Team",
      submittedDate: "3 days ago",
      status: "In Final Review",
      expectedResponse: "Today",
      changesSummary: "UV spectroscopy method improvements",
    },
  ]

  const recentActivity = [
    {
      id: "ACT-001",
      action: "Document Approved",
      description: "Batch Analysis Report #4814 approved by Production",
      timestamp: "1 hour ago",
      type: "approval",
      icon: CheckCircle,
      color: "text-green-600",
    },
    {
      id: "ACT-002",
      action: "New Assignment",
      description: "Equipment maintenance protocol assigned for review",
      timestamp: "3 hours ago",
      type: "assignment",
      icon: FileText,
      color: "text-blue-600",
    },
    {
      id: "ACT-003",
      action: "Document Uploaded",
      description: "Successfully uploaded calibration results for LC-MS-001",
      timestamp: "1 day ago",
      type: "upload",
      icon: Upload,
      color: "text-slate-600",
    },
    {
      id: "ACT-004",
      action: "Revision Requested",
      description: "Minor revisions requested for stability study report",
      timestamp: "2 days ago",
      type: "revision",
      icon: AlertCircle,
      color: "text-orange-600",
    },
  ]

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-purple-600 to-purple-700 rounded-lg p-6 text-white">
        <h2 className="text-2xl font-bold mb-2">Good morning, {user.name}</h2>
        <p className="text-purple-100">You have 3 forms to complete and 3 documents under review.</p>
        <Button className="mt-4 bg-white text-purple-700 hover:bg-purple-50">
          <Upload className="h-4 w-4 mr-2" />
          Upload New Document
        </Button>
      </div>

      {/* Forms to Complete */}
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <FlaskConical className="h-5 w-5 text-purple-600" />
            <span>Forms to Complete</span>
            <Badge className="bg-purple-100 text-purple-800">{formsToComplete.length}</Badge>
          </CardTitle>
          <CardDescription>Laboratory forms and reports requiring completion</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {formsToComplete.map((form, index) => (
            <div key={index} className="p-4 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <h4 className="font-medium text-slate-800">{form.title}</h4>
                    <Badge variant={form.priority === "High" ? "destructive" : "secondary"} className="text-xs">
                      {form.priority}
                    </Badge>
                    <Badge variant="outline" className="text-xs bg-purple-50 text-purple-700">
                      {form.type}
                    </Badge>
                  </div>
                  <p className="text-sm text-slate-600 mb-2">{form.description}</p>
                  <div className="flex items-center space-x-4 text-xs text-slate-500">
                    <span>Base Version: {form.baseVersion}</span>
                    <span>Due: {form.dueDate}</span>
                    <span>Est. Time: {form.estimatedTime}</span>
                  </div>
                </div>
                <Button
                  size="sm"
                  className="ml-4 bg-purple-600 hover:bg-purple-700"
                  onClick={() => onDocumentSelect(form)}
                >
                  <GitBranch className="h-4 w-4 mr-1" />
                  {form.type === "Draft Creation" ? "Create Draft" : "Edit Draft"}
                </Button>
              </div>
            </div>
          ))}
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
            {submittedForReview.map((doc, index) => (
              <div key={index} className="p-3 border border-slate-200 rounded-lg">
                <div className="flex items-start justify-between mb-2">
                  <h4 className="font-medium text-slate-800 text-sm">{doc.title}</h4>
                  <Badge variant={doc.status === "Under Review" ? "secondary" : "outline"} className="text-xs">
                    {doc.status}
                  </Badge>
                </div>
                <div className="text-xs text-slate-500 space-y-1">
                  <p>
                    Submitted to: {doc.submittedTo} • {doc.submittedDate}
                  </p>
                  <p>Current reviewer: {doc.currentReviewer}</p>
                  <p className="text-blue-600">Expected response: {doc.expectedResponse}</p>
                </div>
              </div>
            ))}
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
            {recentActivity.map((activity, index) => (
              <div key={index} className="flex items-start space-x-3 p-3 border border-slate-200 rounded-lg">
                <div className="flex-shrink-0">
                  <activity.icon className={`h-4 w-4 ${activity.color}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-800">{activity.action}</p>
                  <p className="text-xs text-slate-600 mt-1">{activity.description}</p>
                  <p className="text-xs text-slate-500 mt-1">{activity.timestamp}</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
