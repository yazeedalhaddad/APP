"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Separator } from "@/components/ui/separator"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  X,
  Download,
  PrinterIcon as Print,
  CheckCircle,
  XCircle,
  Clock,
  FileText,
  Send,
  Edit,
  GitBranch,
  History,
  Eye,
  GitMerge,
  AlertCircle,
} from "lucide-react"

interface DocumentViewerProps {
  document: any
  user: any
  onClose: () => void
}

export function DocumentViewer({ document, user, onClose }: DocumentViewerProps) {
  const [comment, setComment] = useState("")
  const [showCommentBox, setShowCommentBox] = useState(false)
  const [isCreateDraftOpen, setIsCreateDraftOpen] = useState(false)
  const [isSubmitApprovalOpen, setIsSubmitApprovalOpen] = useState(false)
  const [draftName, setDraftName] = useState("")
  const [changesSummary, setChangesSummary] = useState("")
  const [selectedApprover, setSelectedApprover] = useState("")
  const [currentView, setCurrentView] = useState<"official" | "draft" | "compare">("official")

  // Mock version history data
  const versionHistory = [
    {
      id: "v3.0",
      type: "official",
      title: "Official Version v3.0",
      author: "Dr. Sarah Johnson",
      date: "2024-12-10 14:30",
      status: "Published",
      description: "Updated chemical handling procedures per new regulations",
      isCurrent: true,
    },
    {
      id: "draft-001",
      type: "draft",
      title: "SOP-005 Q3 Revisions",
      author: "Dr. Emily Rodriguez",
      date: "2024-12-10 09:15",
      status: "Merged",
      description: "Chemical handling updates",
      parentVersion: "v2.0",
    },
    {
      id: "v2.0",
      type: "official",
      title: "Official Version v2.0",
      author: "Mike Chen",
      date: "2024-06-15 11:20",
      status: "Archived",
      description: "Production efficiency improvements",
      isCurrent: false,
    },
    {
      id: "draft-002",
      type: "draft",
      title: "Equipment Update Draft",
      author: "Sarah Kim",
      date: "2024-12-08 16:45",
      status: "Pending Approval",
      description: "New equipment specifications",
      parentVersion: "v3.0",
    },
    {
      id: "draft-003",
      type: "draft",
      title: "Safety Protocol Update",
      author: "Dr. Michael Torres",
      date: "2024-12-05 13:22",
      status: "Rejected",
      description: "Safety protocol modifications",
      parentVersion: "v2.0",
      rejectionReason: "Incomplete safety analysis section",
    },
  ]

  const getCurrentVersionInfo = () => {
    if (currentView === "official") {
      return {
        title: "Official Version v3.0",
        subtitle: "Published Dec 10, 2024",
        status: "official",
      }
    } else if (currentView === "draft") {
      return {
        title: "Editing Draft: 'Equipment Update Draft'",
        subtitle: "Created by Sarah Kim",
        status: "draft",
      }
    } else {
      return {
        title: "Compare Changes: Equipment Update Draft",
        subtitle: "Comparing v3.0 → Draft",
        status: "compare",
      }
    }
  }

  const handleCreateDraft = () => {
    if (draftName.trim()) {
      console.log("Creating draft:", draftName)
      setDraftName("")
      setIsCreateDraftOpen(false)
      setCurrentView("draft")
    }
  }

  const handleSubmitForApproval = () => {
    if (changesSummary.trim() && selectedApprover) {
      console.log("Submitting for approval:", {
        summary: changesSummary,
        approver: selectedApprover,
      })
      setChangesSummary("")
      setSelectedApprover("")
      setIsSubmitApprovalOpen(false)
      onClose()
    }
  }

  const handleApproveAndPublish = () => {
    console.log("Approving and publishing document")
    onClose()
  }

  const handleReject = () => {
    if (comment.trim()) {
      console.log("Rejecting document with comment:", comment)
      setComment("")
      onClose()
    }
  }

  const versionInfo = getCurrentVersionInfo()

  return (
    <div className="flex h-[calc(100vh-8rem)] space-x-6">
      {/* Document List Sidebar */}
      <div className="w-80 flex-shrink-0">
        <Card className="h-full border-0 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Related Documents</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {[
              { id: "SOP-005", title: "Standard Operating Procedure #005", status: "current" },
              { id: "SOP-004", title: "Chemical Handling Protocol", status: "approved" },
              { id: "SOP-006", title: "Equipment Maintenance Guide", status: "pending" },
              { id: "SOP-003", title: "Quality Control Checklist", status: "draft" },
            ].map((doc, index) => (
              <div
                key={index}
                className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                  doc.status === "current" ? "bg-blue-50 border-blue-200" : "hover:bg-slate-50 border-slate-200"
                }`}
              >
                <p className="text-sm font-medium text-slate-800">{doc.title}</p>
                <p className="text-xs text-slate-500 mt-1">{doc.id}</p>
                <Badge variant={doc.status === "approved" ? "default" : "secondary"} className="text-xs mt-2">
                  {doc.status}
                </Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Main Document Viewer */}
      <div className="flex-1">
        <Card className="h-full border-0 shadow-sm">
          <CardHeader className="border-b">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center space-x-3 mb-2">
                  <CardTitle className="text-xl">{versionInfo.title}</CardTitle>
                  <Badge
                    variant={
                      versionInfo.status === "official"
                        ? "default"
                        : versionInfo.status === "draft"
                          ? "secondary"
                          : "outline"
                    }
                    className={
                      versionInfo.status === "official"
                        ? "bg-green-100 text-green-800"
                        : versionInfo.status === "draft"
                          ? "bg-blue-100 text-blue-800"
                          : "bg-orange-100 text-orange-800"
                    }
                  >
                    {versionInfo.status === "official"
                      ? "Official"
                      : versionInfo.status === "draft"
                        ? "Draft"
                        : "Compare"}
                  </Badge>
                </div>
                <p className="text-sm text-slate-600">{versionInfo.subtitle}</p>
              </div>
              <div className="flex items-center space-x-2">
                {currentView === "compare" && (
                  <Button variant="outline" size="sm" onClick={() => setCurrentView("official")}>
                    <Eye className="h-4 w-4 mr-2" />
                    View Official
                  </Button>
                )}
                <Button variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  Download
                </Button>
                <Button variant="outline" size="sm">
                  <Print className="h-4 w-4 mr-2" />
                  Print
                </Button>
                <Button variant="ghost" size="sm" onClick={onClose}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0 h-[calc(100%-5rem)]">
            {/* Document Content Area */}
            {currentView === "compare" ? (
              <div className="h-full flex">
                {/* Side-by-side comparison */}
                <div className="flex-1 border-r">
                  <div className="p-4 bg-red-50 border-b">
                    <h3 className="font-medium text-red-800">Official Version v3.0</h3>
                  </div>
                  <div className="p-4 h-[calc(100%-4rem)] overflow-auto">
                    <div className="space-y-4 text-sm">
                      <p>
                        <span className="bg-red-100 text-red-800 line-through">
                          Chemical handling procedures must follow the 2023 guidelines.
                        </span>
                      </p>
                      <p>Safety equipment requirements include gloves, goggles, and lab coats.</p>
                      <p>
                        <span className="bg-red-100 text-red-800 line-through">
                          Temperature monitoring should be conducted every 2 hours.
                        </span>
                      </p>
                      <p>All procedures must be documented in the laboratory log.</p>
                    </div>
                  </div>
                </div>
                <div className="flex-1">
                  <div className="p-4 bg-green-50 border-b">
                    <h3 className="font-medium text-green-800">Equipment Update Draft</h3>
                  </div>
                  <div className="p-4 h-[calc(100%-4rem)] overflow-auto">
                    <div className="space-y-4 text-sm">
                      <p>
                        <span className="bg-green-100 text-green-800 underline">
                          Chemical handling procedures must follow the updated 2024 guidelines with enhanced safety
                          protocols.
                        </span>
                      </p>
                      <p>Safety equipment requirements include gloves, goggles, and lab coats.</p>
                      <p>
                        <span className="bg-green-100 text-green-800 underline">
                          Temperature monitoring should be conducted every hour using the new digital monitoring system.
                        </span>
                      </p>
                      <p>All procedures must be documented in the laboratory log.</p>
                      <p>
                        <span className="bg-green-100 text-green-800 underline">
                          New equipment calibration procedures are required monthly.
                        </span>
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="h-full bg-slate-100 flex items-center justify-center">
                <div className="text-center">
                  <FileText className="h-16 w-16 text-slate-400 mx-auto mb-4" />
                  <p className="text-slate-600">
                    {currentView === "official" ? "Official Document Viewer" : "Draft Document Editor"}
                  </p>
                  <p className="text-sm text-slate-500 mt-2">{document.title}</p>
                  <p className="text-xs text-slate-400 mt-1">
                    {currentView === "official"
                      ? "Viewing the current published version"
                      : "Editing mode - changes are saved to draft"}
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Document History Panel */}
      <div className="w-96 flex-shrink-0">
        <Card className="h-full border-0 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center space-x-2">
              <History className="h-5 w-5 text-blue-600" />
              <span>Document History</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Primary Action Button */}
            <div className="space-y-2">
              {currentView === "official" && (
                <Dialog open={isCreateDraftOpen} onOpenChange={setIsCreateDraftOpen}>
                  <DialogTrigger asChild>
                    <Button className="w-full bg-blue-600 hover:bg-blue-700">
                      <GitBranch className="h-4 w-4 mr-2" />
                      Create Editing Draft
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Create Editing Draft</DialogTitle>
                      <DialogDescription>
                        Create a safe copy of the official version to make changes without affecting the original.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="draft-name">Draft Name</Label>
                        <Input
                          id="draft-name"
                          placeholder="e.g., Q4 Safety Updates"
                          value={draftName}
                          onChange={(e) => setDraftName(e.target.value)}
                        />
                      </div>
                      <div className="flex justify-end space-x-2">
                        <Button variant="outline" onClick={() => setIsCreateDraftOpen(false)}>
                          Cancel
                        </Button>
                        <Button onClick={handleCreateDraft} disabled={!draftName.trim()}>
                          Create Draft
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              )}

              {currentView === "draft" && (
                <Dialog open={isSubmitApprovalOpen} onOpenChange={setIsSubmitApprovalOpen}>
                  <DialogTrigger asChild>
                    <Button className="w-full bg-green-600 hover:bg-green-700">
                      <Send className="h-4 w-4 mr-2" />
                      Submit for Approval
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                      <DialogTitle>Submit for Approval</DialogTitle>
                      <DialogDescription>
                        Submit your draft to be reviewed and potentially merged into the official version.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="changes-summary">Summary of Changes</Label>
                        <Textarea
                          id="changes-summary"
                          placeholder="Explain what changes you made and why..."
                          value={changesSummary}
                          onChange={(e) => setChangesSummary(e.target.value)}
                          className="min-h-[80px]"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="approver">Assign Approver</Label>
                        <Select value={selectedApprover} onValueChange={setSelectedApprover}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select department or user" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="management">Management Department</SelectItem>
                            <SelectItem value="production">Production Department</SelectItem>
                            <SelectItem value="quality-control">Quality Control</SelectItem>
                            <SelectItem value="sarah.johnson">Dr. Sarah Johnson</SelectItem>
                            <SelectItem value="mike.chen">Mike Chen</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <Button
                        variant="outline"
                        className="w-full bg-transparent"
                        onClick={() => setCurrentView("compare")}
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        View Changes Before Submitting
                      </Button>
                      <div className="flex justify-end space-x-2">
                        <Button variant="outline" onClick={() => setIsSubmitApprovalOpen(false)}>
                          Cancel
                        </Button>
                        <Button
                          onClick={handleSubmitForApproval}
                          disabled={!changesSummary.trim() || !selectedApprover}
                        >
                          Submit for Approval
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              )}

              {currentView === "compare" && user.role === "management" && (
                <div className="space-y-2">
                  <Button onClick={handleApproveAndPublish} className="w-full bg-green-600 hover:bg-green-700">
                    <GitMerge className="h-4 w-4 mr-2" />
                    Approve & Publish
                  </Button>
                  <Button onClick={() => setShowCommentBox(!showCommentBox)} variant="destructive" className="w-full">
                    <XCircle className="h-4 w-4 mr-2" />
                    Reject Changes
                  </Button>
                  {showCommentBox && (
                    <div className="space-y-2">
                      <Textarea
                        placeholder="Explain why you're rejecting these changes..."
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        className="min-h-[80px]"
                      />
                      <Button onClick={handleReject} size="sm" disabled={!comment.trim()} className="w-full">
                        Submit Rejection
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </div>

            <Separator />

            {/* Version History Timeline */}
            <div className="space-y-3">
              <h3 className="font-medium text-slate-800">Version Timeline</h3>
              <div className="space-y-4">
                {versionHistory.map((version, index) => (
                  <div key={index} className="flex items-start space-x-3">
                    <div
                      className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                        version.type === "official"
                          ? version.isCurrent
                            ? "bg-green-100 text-green-700"
                            : "bg-slate-100 text-slate-500"
                          : version.status === "Pending Approval"
                            ? "bg-orange-100 text-orange-700"
                            : version.status === "Merged"
                              ? "bg-blue-100 text-blue-700"
                              : "bg-red-100 text-red-700"
                      }`}
                    >
                      {version.type === "official" ? (
                        <CheckCircle className="h-4 w-4" />
                      ) : version.status === "Pending Approval" ? (
                        <Clock className="h-4 w-4" />
                      ) : version.status === "Merged" ? (
                        <GitMerge className="h-4 w-4" />
                      ) : version.status === "Rejected" ? (
                        <XCircle className="h-4 w-4" />
                      ) : (
                        <Edit className="h-4 w-4" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium text-slate-800">{version.title}</p>
                        {version.type === "official" && version.isCurrent && (
                          <Badge className="bg-green-100 text-green-800 text-xs">Current</Badge>
                        )}
                      </div>
                      <p className="text-xs text-slate-600">{version.author}</p>
                      <p className="text-xs text-slate-500">{version.date}</p>
                      {version.description && <p className="text-xs text-slate-600 mt-1">{version.description}</p>}
                      {version.rejectionReason && (
                        <div className="flex items-start space-x-1 mt-1">
                          <AlertCircle className="h-3 w-3 text-red-500 mt-0.5 flex-shrink-0" />
                          <p className="text-xs text-red-600">{version.rejectionReason}</p>
                        </div>
                      )}
                      {version.status === "Pending Approval" && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="mt-2 text-xs h-6 bg-transparent"
                          onClick={() => setCurrentView("compare")}
                        >
                          Review Changes
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
