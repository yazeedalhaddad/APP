"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { BarChart3, FileText, CalendarIcon, Download, Eye, TrendingUp, Users, Clock } from "lucide-react"
import { format } from "date-fns"

interface User {
  id: string
  name: string
  email: string
  role: string
  department: string
}

interface ReportsInterfaceProps {
  user: User
}

export function ReportsInterface({ user }: ReportsInterfaceProps) {
  const [reportType, setReportType] = useState("")
  const [dateFrom, setDateFrom] = useState<Date>()
  const [dateTo, setDateTo] = useState<Date>()
  const [department, setDepartment] = useState("")

  const availableReports = [
    {
      id: "dept-performance",
      title: "Department Performance Report",
      description: "Analyze document processing efficiency across departments",
      icon: TrendingUp,
      estimatedTime: "2-3 minutes",
      lastGenerated: "2 days ago",
    },
    {
      id: "approval-statistics",
      title: "Document Approval Statistics",
      description: "Track approval rates, turnaround times, and bottlenecks",
      icon: BarChart3,
      estimatedTime: "1-2 minutes",
      lastGenerated: "1 week ago",
    },
    {
      id: "user-activity",
      title: "User Activity Report",
      description: "Monitor user engagement and document interactions",
      icon: Users,
      estimatedTime: "3-4 minutes",
      lastGenerated: "3 days ago",
    },
    {
      id: "workflow-analysis",
      title: "Workflow Analysis Report",
      description: "Detailed analysis of document workflow patterns",
      icon: Clock,
      estimatedTime: "4-5 minutes",
      lastGenerated: "1 day ago",
    },
  ]

  const recentReports = [
    {
      id: "RPT-2024-001",
      title: "Department Performance - November 2024",
      type: "Department Performance",
      generatedBy: "Dr. Sarah Johnson",
      generatedDate: "2024-12-08",
      fileSize: "2.3 MB",
      status: "Ready",
    },
    {
      id: "RPT-2024-002",
      title: "Approval Statistics - Q4 2024",
      type: "Approval Statistics",
      generatedBy: "System Administrator",
      generatedDate: "2024-12-05",
      fileSize: "1.8 MB",
      status: "Ready",
    },
    {
      id: "RPT-2024-003",
      title: "User Activity - Weekly Summary",
      type: "User Activity",
      generatedBy: "Mike Chen",
      generatedDate: "2024-12-03",
      fileSize: "956 KB",
      status: "Ready",
    },
  ]

  const handleGenerateReport = () => {
    console.log("Generating report:", {
      type: reportType,
      dateFrom,
      dateTo,
      department,
    })
  }

  return (
    <div className="space-y-6">
      {/* Reports Header */}
      <div className="bg-gradient-to-r from-purple-600 to-purple-700 rounded-lg p-6 text-white">
        <h2 className="text-2xl font-bold mb-2">Reports & Analytics</h2>
        <p className="text-purple-100">Generate comprehensive reports using SAP Crystal Reports integration</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Report Generation */}
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <FileText className="h-5 w-5 text-purple-600" />
              <span>Generate New Report</span>
            </CardTitle>
            <CardDescription>Create custom reports with specific parameters</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Report Type</label>
              <Select value={reportType} onValueChange={setReportType}>
                <SelectTrigger>
                  <SelectValue placeholder="Select report type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="dept-performance">Department Performance</SelectItem>
                  <SelectItem value="approval-statistics">Document Approval Statistics</SelectItem>
                  <SelectItem value="user-activity">User Activity Report</SelectItem>
                  <SelectItem value="workflow-analysis">Workflow Analysis</SelectItem>
                  <SelectItem value="compliance-audit">Compliance Audit</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Date From</label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start text-left font-normal bg-transparent">
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {dateFrom ? format(dateFrom, "PPP") : "Select date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar mode="single" selected={dateFrom} onSelect={setDateFrom} initialFocus />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Date To</label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start text-left font-normal bg-transparent">
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {dateTo ? format(dateTo, "PPP") : "Select date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar mode="single" selected={dateTo} onSelect={setDateTo} initialFocus />
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Department Filter</label>
              <Select value={department} onValueChange={setDepartment}>
                <SelectTrigger>
                  <SelectValue placeholder="All departments" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Departments</SelectItem>
                  <SelectItem value="laboratory">Laboratory</SelectItem>
                  <SelectItem value="production">Production</SelectItem>
                  <SelectItem value="quality-control">Quality Control</SelectItem>
                  <SelectItem value="management">Management</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button
              onClick={handleGenerateReport}
              className="w-full bg-purple-600 hover:bg-purple-700"
              disabled={!reportType}
            >
              <BarChart3 className="h-4 w-4 mr-2" />
              Generate Report
            </Button>

            {reportType && (
              <div className="p-3 bg-blue-50 rounded-lg">
                <p className="text-sm text-blue-800">
                  <strong>Note:</strong> This report will be generated using SAP Crystal Reports and may take 2-5
                  minutes to complete.
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Available Report Types */}
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle>Available Report Types</CardTitle>
            <CardDescription>Choose from pre-configured report templates</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {availableReports.map((report, index) => (
              <div
                key={index}
                className="p-3 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer"
              >
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0">
                    <report.icon className="h-5 w-5 text-purple-600" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium text-slate-800">{report.title}</h4>
                    <p className="text-sm text-slate-600 mt-1">{report.description}</p>
                    <div className="flex items-center space-x-4 text-xs text-slate-500 mt-2">
                      <span>Est. time: {report.estimatedTime}</span>
                      <span>Last generated: {report.lastGenerated}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Recent Reports */}
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle>Recent Reports</CardTitle>
          <CardDescription>Previously generated reports available for download</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {recentReports.map((report, index) => (
            <div key={index} className="p-4 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <h4 className="font-medium text-slate-800">{report.title}</h4>
                  <div className="flex items-center space-x-4 text-sm text-slate-600 mt-1">
                    <span>Type: {report.type}</span>
                    <span>Generated by: {report.generatedBy}</span>
                    <span>Date: {report.generatedDate}</span>
                    <span>Size: {report.fileSize}</span>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Button size="sm" variant="outline">
                    <Eye className="h-4 w-4 mr-1" />
                    Preview
                  </Button>
                  <Button size="sm" variant="outline">
                    <Download className="h-4 w-4 mr-1" />
                    Download
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}
