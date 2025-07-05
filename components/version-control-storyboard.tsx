"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import {
  Search,
  GitBranch,
  Edit,
  Send,
  Eye,
  GitMerge,
  CheckCircle,
  Archive,
  ArrowRight,
  Clock,
  User,
  FileText,
} from "lucide-react"

export function VersionControlStoryboard() {
  const [currentStep, setCurrentStep] = useState(1)

  const storyboardSteps = [
    {
      step: 1,
      title: "Find the Document",
      user: "Lab Technician",
      description: "Lab Technician searches for 'SOP-005' and opens the Official Version",
      details:
        "The header clearly states 'Official Version v2.0 (Published 6 months ago)'. The history panel shows the complete version timeline.",
      action: "Search and Open",
      icon: Search,
      color: "bg-blue-50 text-blue-700",
    },
    {
      step: 2,
      title: "Create a Draft (Branch)",
      user: "Lab Technician",
      description: "Tech clicks 'Create Editing Draft' button and names it 'SOP-005 Q3 Revisions'",
      details:
        "A modal appears asking for draft name. The system creates a safe copy of the official version for editing.",
      action: "Create Draft",
      icon: GitBranch,
      color: "bg-purple-50 text-purple-700",
    },
    {
      step: 3,
      title: "Edit the Draft",
      user: "Lab Technician",
      description: "Screen reloads into editor view showing 'Editing Draft: SOP-005 Q3 Revisions'",
      details:
        "Tech modifies chemical handling procedures. All changes are saved to the draft. Official Version remains untouched.",
      action: "Edit Content",
      icon: Edit,
      color: "bg-green-50 text-green-700",
    },
    {
      step: 4,
      title: "Submit for Approval (Merge Request)",
      user: "Lab Technician",
      description: "Tech clicks 'Submit for Approval' and fills out the submission form",
      details:
        "Summary: 'Updated chemical handling procedures per new regulations'. Assigned to Management department.",
      action: "Submit Request",
      icon: Send,
      color: "bg-orange-50 text-orange-700",
    },
    {
      step: 5,
      title: "Review the Request",
      user: "Management Director",
      description: "Director gets notification: 'Approval Request for SOP-005 Q3 Revisions from Lab'",
      details: "The task appears prominently on the Management dashboard with high priority indicator.",
      action: "Receive Notification",
      icon: Eye,
      color: "bg-red-50 text-red-700",
    },
    {
      step: 6,
      title: "The 'Compare' View",
      user: "Management Director",
      description: "Director clicks the task and sees side-by-side comparison of changes",
      details:
        "Old text on left, new highlighted text on right. Changes are clearly marked with additions and deletions.",
      action: "Review Changes",
      icon: Eye,
      color: "bg-yellow-50 text-yellow-700",
    },
    {
      step: 7,
      title: "Approve & Publish (Merge)",
      user: "Management Director",
      description: "Director clicks 'Approve & Publish' after reviewing the changes",
      details: "System prompts for optional final comment before proceeding with the merge.",
      action: "Approve Merge",
      icon: GitMerge,
      color: "bg-green-50 text-green-700",
    },
    {
      step: 8,
      title: "System Finalization",
      user: "System",
      description: "Automated system actions complete the workflow",
      details: "Draft becomes Official v3.0, old v2.0 archived, complete audit trail logged, notifications sent.",
      action: "Auto-Complete",
      icon: Archive,
      color: "bg-slate-50 text-slate-700",
    },
  ]

  const currentStepData = storyboardSteps[currentStep - 1]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-600 to-indigo-700 rounded-lg p-6 text-white">
        <h2 className="text-2xl font-bold mb-2">Version Control User Flow</h2>
        <p className="text-indigo-100">
          Complete storyboard: Lab Technician updates SOP-005 through the version control workflow
        </p>
      </div>

      {/* Step Navigation */}
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle>Workflow Steps</CardTitle>
          <CardDescription>Click any step to view the detailed screen mockup</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {storyboardSteps.map((step, index) => (
              <Button
                key={index}
                variant={currentStep === step.step ? "default" : "outline"}
                size="sm"
                onClick={() => setCurrentStep(step.step)}
                className="flex items-center space-x-2"
              >
                <step.icon className="h-4 w-4" />
                <span>Step {step.step}</span>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Current Step Detail */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Step Information */}
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <div className="flex items-center space-x-3">
              <div className={`p-2 rounded-lg ${currentStepData.color}`}>
                <currentStepData.icon className="h-5 w-5" />
              </div>
              <div>
                <CardTitle className="flex items-center space-x-2">
                  <span>
                    Step {currentStepData.step}: {currentStepData.title}
                  </span>
                </CardTitle>
                <CardDescription className="flex items-center space-x-2 mt-1">
                  <User className="h-4 w-4" />
                  <span>{currentStepData.user}</span>
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-medium text-slate-800 mb-2">What Happens</h4>
              <p className="text-sm text-slate-600">{currentStepData.description}</p>
            </div>

            <Separator />

            <div>
              <h4 className="font-medium text-slate-800 mb-2">Screen Details</h4>
              <p className="text-sm text-slate-600">{currentStepData.details}</p>
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <Badge variant="outline" className={currentStepData.color}>
                {currentStepData.action}
              </Badge>
              <div className="flex space-x-2">
                {currentStep > 1 && (
                  <Button variant="outline" size="sm" onClick={() => setCurrentStep(currentStep - 1)}>
                    Previous
                  </Button>
                )}
                {currentStep < storyboardSteps.length && (
                  <Button size="sm" onClick={() => setCurrentStep(currentStep + 1)}>
                    Next Step
                    <ArrowRight className="h-4 w-4 ml-1" />
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Screen Mockup */}
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle>Screen Mockup</CardTitle>
            <CardDescription>Visual representation of the user interface at this step</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="bg-slate-100 rounded-lg p-6 min-h-[400px] flex items-center justify-center">
              <div className="text-center space-y-4">
                <div className={`p-4 rounded-lg ${currentStepData.color} inline-block`}>
                  <currentStepData.icon className="h-8 w-8" />
                </div>
                <div>
                  <h3 className="font-medium text-slate-800">{currentStepData.title}</h3>
                  <p className="text-sm text-slate-600 mt-1">{currentStepData.user} Interface</p>
                </div>
                <div className="bg-white rounded border p-4 text-left max-w-sm">
                  <div className="space-y-2">
                    {currentStep === 1 && (
                      <>
                        <div className="flex items-center space-x-2 text-sm">
                          <Search className="h-4 w-4 text-blue-600" />
                          <span>Search: "SOP-005"</span>
                        </div>
                        <div className="bg-blue-50 p-2 rounded text-xs">
                          <strong>Official Version v2.0</strong>
                          <br />
                          Published 6 months ago
                        </div>
                      </>
                    )}
                    {currentStep === 2 && (
                      <>
                        <Button size="sm" className="w-full">
                          <GitBranch className="h-4 w-4 mr-2" />
                          Create Editing Draft
                        </Button>
                        <div className="text-xs text-slate-600">Draft Name: "SOP-005 Q3 Revisions"</div>
                      </>
                    )}
                    {currentStep === 3 && (
                      <>
                        <div className="bg-green-50 p-2 rounded text-xs">
                          <strong>Editing Draft: SOP-005 Q3 Revisions</strong>
                          <br />
                          Changes saved automatically
                        </div>
                        <div className="text-xs text-slate-600">✏️ Chemical handling procedures updated</div>
                      </>
                    )}
                    {currentStep === 4 && (
                      <>
                        <Button size="sm" className="w-full bg-green-600">
                          <Send className="h-4 w-4 mr-2" />
                          Submit for Approval
                        </Button>
                        <div className="text-xs text-slate-600">
                          Assigned to: Management
                          <br />
                          Summary: Updated procedures per new regulations
                        </div>
                      </>
                    )}
                    {currentStep === 5 && (
                      <>
                        <div className="bg-orange-50 p-2 rounded text-xs">
                          <strong>🔔 New Approval Request</strong>
                          <br />
                          SOP-005 Q3 Revisions from Lab
                        </div>
                        <Badge className="bg-red-100 text-red-800 text-xs">High Priority</Badge>
                      </>
                    )}
                    {currentStep === 6 && (
                      <>
                        <div className="grid grid-cols-2 gap-1 text-xs">
                          <div className="bg-red-50 p-1 rounded">
                            <strong>Old v2.0</strong>
                            <br />
                            <span className="line-through text-red-600">2023 guidelines</span>
                          </div>
                          <div className="bg-green-50 p-1 rounded">
                            <strong>New Draft</strong>
                            <br />
                            <span className="underline text-green-600">2024 guidelines</span>
                          </div>
                        </div>
                      </>
                    )}
                    {currentStep === 7 && (
                      <>
                        <Button size="sm" className="w-full bg-green-600">
                          <GitMerge className="h-4 w-4 mr-2" />
                          Approve & Publish
                        </Button>
                        <div className="text-xs text-slate-600">Changes approved by Management</div>
                      </>
                    )}
                    {currentStep === 8 && (
                      <>
                        <div className="space-y-1 text-xs">
                          <div className="flex items-center space-x-1">
                            <CheckCircle className="h-3 w-3 text-green-600" />
                            <span>Draft → Official v3.0</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Archive className="h-3 w-3 text-slate-600" />
                            <span>v2.0 archived</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <FileText className="h-3 w-3 text-blue-600" />
                            <span>Audit trail logged</span>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Workflow Summary */}
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle>Complete Workflow Summary</CardTitle>
          <CardDescription>Key benefits of the version control system</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="text-center space-y-2">
              <div className="p-3 bg-blue-50 rounded-lg inline-block">
                <GitBranch className="h-6 w-6 text-blue-600" />
              </div>
              <h4 className="font-medium text-slate-800">Safe Editing</h4>
              <p className="text-sm text-slate-600">Create drafts without affecting official versions</p>
            </div>
            <div className="text-center space-y-2">
              <div className="p-3 bg-green-50 rounded-lg inline-block">
                <Eye className="h-6 w-6 text-green-600" />
              </div>
              <h4 className="font-medium text-slate-800">Clear Comparisons</h4>
              <p className="text-sm text-slate-600">Side-by-side change visualization for approvers</p>
            </div>
            <div className="text-center space-y-2">
              <div className="p-3 bg-purple-50 rounded-lg inline-block">
                <Clock className="h-6 w-6 text-purple-600" />
              </div>
              <h4 className="font-medium text-slate-800">Complete History</h4>
              <p className="text-sm text-slate-600">Full timeline of all versions and drafts</p>
            </div>
            <div className="text-center space-y-2">
              <div className="p-3 bg-orange-50 rounded-lg inline-block">
                <FileText className="h-6 w-6 text-orange-600" />
              </div>
              <h4 className="font-medium text-slate-800">Audit Trail</h4>
              <p className="text-sm text-slate-600">Complete tracking of all changes and approvals</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
