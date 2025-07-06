"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { BarChart3, FileText, CalendarIcon, TrendingUp, Users, Clock } from "lucide-react"
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
  const [reportType, setReportType] = useState("department_performance")
  const [dateFrom, setDateFrom] = useState<Date>()
  const [dateTo, setDateTo] = useState<Date>()
  const [department, setDepartment] = useState("")
  const [isGenerating, setIsGenerating] = useState(false)

  const handleGenerateReport = async () => {
    if (!reportType) return

    setIsGenerating(true)
    try {
      // This would call the actual report generation API
      const response = await fetch("/api/reports/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
        },
        body: JSON.stringify({
          type: reportType,
          start_date: dateFrom?.toISOString(),
          end_date: dateTo?.toISOString(),
          department,
        }),
      })

      if (response.ok) {
        const result = await response.json()
        console.log("Report generation started:", result)
        // You could show a success message or redirect to a status page
      }
    } catch (error) {
      console.error("Failed to generate report:", error)
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Reports Header */}
      <div className="bg-gradient-to-r from-purple-600 to-purple-700 rounded-lg p-6 text-white">
        <h2 className="text-2xl font-bold mb-2">Reports & Analytics</h2>
        <p className="text-purple-100">Generate comprehensive reports and analytics</p>
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
                  <SelectItem value="department_performance">Department Performance</SelectItem>
                  <SelectItem value="approval_statistics">Document Approval Statistics</SelectItem>
                  <SelectItem value="user_activity">User Activity Report</SelectItem>
                  <SelectItem value="workflow_analysis">Workflow Analysis</SelectItem>
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
                  <SelectItem value="management">Management</SelectItem>
                  <SelectItem value="general">General</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button
              onClick={handleGenerateReport}
              className="w-full bg-purple-600 hover:bg-purple-700"
              disabled={!reportType || isGenerating}
            >
              <BarChart3 className="h-4 w-4 mr-2" />
              {isGenerating ? "Generating..." : "Generate Report"}
            </Button>

            {reportType && (
              <div className="p-3 bg-blue-50 rounded-lg">
                <p className="text-sm text-blue-800">
                  <strong>Note:</strong> This report will be generated and may take a few minutes to complete.
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
            <div className="p-3 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer">
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0">
                  <TrendingUp className="h-5 w-5 text-purple-600" />
                </div>
                <div className="flex-1">
                  <h4 className="font-medium text-slate-800">Department Performance Report</h4>
                  <p className="text-sm text-slate-600 mt-1">
                    Analyze document processing efficiency across departments
                  </p>
                </div>
              </div>
            </div>

            <div className="p-3 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer">
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0">
                  <BarChart3 className="h-5 w-5 text-purple-600" />
                </div>
                <div className="flex-1">
                  <h4 className="font-medium text-slate-800">Document Approval Statistics</h4>
                  <p className="text-sm text-slate-600 mt-1">Track approval rates, turnaround times, and bottlenecks</p>
                </div>
              </div>
            </div>

            <div className="p-3 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer">
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0">
                  <Users className="h-5 w-5 text-purple-600" />
                </div>
                <div className="flex-1">
                  <h4 className="font-medium text-slate-800">User Activity Report</h4>
                  <p className="text-sm text-slate-600 mt-1">Monitor user engagement and document interactions</p>
                </div>
              </div>
            </div>

            <div className="p-3 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer">
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0">
                  <Clock className="h-5 w-5 text-purple-600" />
                </div>
                <div className="flex-1">
                  <h4 className="font-medium text-slate-800">Workflow Analysis Report</h4>
                  <p className="text-sm text-slate-600 mt-1">Detailed analysis of document workflow patterns</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Reports - Empty State */}
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle>Recent Reports</CardTitle>
          <CardDescription>Previously generated reports</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12 text-slate-500">
            <FileText className="h-16 w-16 mx-auto mb-4 text-slate-300" />
            <h3 className="text-lg font-medium mb-2">No reports generated yet</h3>
            <p className="text-sm">Generate your first report to see it here</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
