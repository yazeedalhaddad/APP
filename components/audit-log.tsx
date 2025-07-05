"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import {
  Activity,
  Search,
  CalendarIcon,
  Eye,
  Upload,
  Download,
  Edit,
  CheckCircle,
  XCircle,
  Send,
  Filter,
} from "lucide-react"
import { format } from "date-fns"

interface User {
  id: string
  name: string
  email: string
  role: string
  department: string
}

interface AuditLogProps {
  user: User
}

export function AuditLog({ user }: AuditLogProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedUser, setSelectedUser] = useState("all")
  const [selectedAction, setSelectedAction] = useState("all")
  const [dateFrom, setDateFrom] = useState<Date>()
  const [dateTo, setDateTo] = useState<Date>()

  const auditEntries = [
    {
      id: "AUD-001",
      timestamp: "2024-12-10 09:15:23",
      user: "Dr. Sarah Johnson",
      userEmail: "sarah.johnson@medprep.com",
      action: "Document Approved",
      target: "DOC-2024-001 - Batch Analysis Report",
      ipAddress: "192.168.1.45",
      userAgent: "Chrome 120.0.0.0",
      details: "Approved batch analysis report for Lot #4815",
      severity: "Normal",
    },
    {
      id: "AUD-002",
      timestamp: "2024-12-10 08:45:12",
      user: "Mike Chen",
      userEmail: "mike.chen@medprep.com",
      action: "Document Uploaded",
      target: "DOC-2024-005 - Production Report",
      ipAddress: "192.168.1.67",
      userAgent: "Chrome 120.0.0.0",
      details: "Uploaded weekly production report for review",
      severity: "Normal",
    },
    {
      id: "AUD-003",
      timestamp: "2024-12-10 08:30:45",
      user: "Dr. Emily Rodriguez",
      userEmail: "emily.rodriguez@medprep.com",
      action: "Document Modified",
      target: "DOC-2024-003 - Lab Protocol",
      ipAddress: "192.168.1.89",
      userAgent: "Chrome 120.0.0.0",
      details: "Updated laboratory testing protocol with new parameters",
      severity: "Normal",
    },
    {
      id: "AUD-004",
      timestamp: "2024-12-10 07:22:18",
      user: "System Administrator",
      userEmail: "admin@medprep.com",
      action: "User Created",
      target: "USR-006 - Dr. Michael Torres",
      ipAddress: "192.168.1.10",
      userAgent: "Chrome 120.0.0.0",
      details: "Created new user account for Laboratory department",
      severity: "High",
    },
    {
      id: "AUD-005",
      timestamp: "2024-12-09 16:45:33",
      user: "Sarah Kim",
      userEmail: "sarah.kim@medprep.com",
      action: "Document Rejected",
      target: "DOC-2024-004 - QC Report",
      ipAddress: "192.168.1.78",
      userAgent: "Chrome 120.0.0.0",
      details: "Rejected QC report due to incomplete data sections",
      severity: "Normal",
    },
    {
      id: "AUD-006",
      timestamp: "2024-12-09 15:30:21",
      user: "Unknown User",
      userEmail: "j.smith@medprep.com",
      action: "Failed Login",
      target: "Login System",
      ipAddress: "203.45.67.89",
      userAgent: "Chrome 119.0.0.0",
      details: "Multiple failed login attempts detected",
      severity: "Critical",
    },
    {
      id: "AUD-007",
      timestamp: "2024-12-09 14:15:07",
      user: "Dr. Sarah Johnson",
      userEmail: "sarah.johnson@medprep.com",
      action: "Document Downloaded",
      target: "DOC-2024-002 - Compliance Report",
      ipAddress: "192.168.1.45",
      userAgent: "Chrome 120.0.0.0",
      details: "Downloaded compliance report for external audit",
      severity: "Normal",
    },
    {
      id: "AUD-008",
      timestamp: "2024-12-09 13:45:55",
      user: "Mike Chen",
      userEmail: "mike.chen@medprep.com",
      action: "Document Sent",
      target: "DOC-2024-006 - Production Schedule",
      ipAddress: "192.168.1.67",
      userAgent: "Chrome 120.0.0.0",
      details: "Sent production schedule to Management for approval",
      severity: "Normal",
    },
  ]

  const getActionIcon = (action: string) => {
    switch (action) {
      case "Document Uploaded":
        return Upload
      case "Document Downloaded":
        return Download
      case "Document Modified":
        return Edit
      case "Document Approved":
        return CheckCircle
      case "Document Rejected":
        return XCircle
      case "Document Sent":
        return Send
      case "Document Viewed":
        return Eye
      case "User Created":
        return CheckCircle
      case "Failed Login":
        return XCircle
      default:
        return Activity
    }
  }

  const getActionColor = (action: string) => {
    switch (action) {
      case "Document Approved":
        return "text-green-600"
      case "Document Rejected":
        return "text-red-600"
      case "Failed Login":
        return "text-red-600"
      case "User Created":
        return "text-blue-600"
      case "Document Uploaded":
        return "text-purple-600"
      default:
        return "text-slate-600"
    }
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "Critical":
        return "bg-red-100 text-red-800"
      case "High":
        return "bg-orange-100 text-orange-800"
      case "Normal":
        return "bg-green-100 text-green-800"
      default:
        return "bg-slate-100 text-slate-800"
    }
  }

  return (
    <div className="space-y-6">
      {/* Audit Log Header */}
      <div className="bg-gradient-to-r from-slate-800 to-slate-900 rounded-lg p-6 text-white">
        <h2 className="text-2xl font-bold mb-2">Audit Log</h2>
        <p className="text-slate-300">Comprehensive tracking of all system activities and user actions</p>
      </div>

      {/* Search and Filters */}
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Search className="h-5 w-5 text-blue-600" />
            <span>Search & Filter Audit Entries</span>
          </CardTitle>
          <CardDescription>Filter audit log entries by user, action, date range, and more</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex space-x-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Search by user, action, or document..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button>
              <Search className="h-4 w-4 mr-2" />
              Search
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">User</label>
              <Select value={selectedUser} onValueChange={setSelectedUser}>
                <SelectTrigger>
                  <SelectValue placeholder="All Users" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Users</SelectItem>
                  <SelectItem value="sarah.johnson">Dr. Sarah Johnson</SelectItem>
                  <SelectItem value="mike.chen">Mike Chen</SelectItem>
                  <SelectItem value="emily.rodriguez">Dr. Emily Rodriguez</SelectItem>
                  <SelectItem value="sarah.kim">Sarah Kim</SelectItem>
                  <SelectItem value="admin">System Administrator</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Action Type</label>
              <Select value={selectedAction} onValueChange={setSelectedAction}>
                <SelectTrigger>
                  <SelectValue placeholder="All Actions" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Actions</SelectItem>
                  <SelectItem value="upload">Document Upload</SelectItem>
                  <SelectItem value="download">Document Download</SelectItem>
                  <SelectItem value="approve">Document Approval</SelectItem>
                  <SelectItem value="reject">Document Rejection</SelectItem>
                  <SelectItem value="modify">Document Modification</SelectItem>
                  <SelectItem value="view">Document View</SelectItem>
                  <SelectItem value="login">Login Activity</SelectItem>
                </SelectContent>
              </Select>
            </div>

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

          <div className="flex justify-between items-center">
            <Button variant="outline" size="sm">
              <Filter className="h-4 w-4 mr-2" />
              Clear Filters
            </Button>
            <p className="text-sm text-slate-600">{auditEntries.length} entries found</p>
          </div>
        </CardContent>
      </Card>

      {/* Audit Entries */}
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Activity className="h-5 w-5 text-blue-600" />
            <span>Audit Entries</span>
          </CardTitle>
          <CardDescription>Detailed log of all system activities</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {auditEntries.map((entry, index) => {
            const ActionIcon = getActionIcon(entry.action)
            return (
              <div key={index} className="p-4 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0">
                    <div className={`p-2 rounded-lg bg-slate-100`}>
                      <ActionIcon className={`h-4 w-4 ${getActionColor(entry.action)}`} />
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <h4 className="font-medium text-slate-800">{entry.action}</h4>
                        <Badge className={getSeverityColor(entry.severity)}>{entry.severity}</Badge>
                      </div>
                      <p className="text-sm text-slate-500">{entry.timestamp}</p>
                    </div>
                    <p className="text-sm text-slate-600 mb-2">{entry.details}</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-xs text-slate-500">
                      <div>
                        <span className="font-medium">User:</span> {entry.user}
                      </div>
                      <div>
                        <span className="font-medium">Target:</span> {entry.target}
                      </div>
                      <div>
                        <span className="font-medium">IP Address:</span> {entry.ipAddress}
                      </div>
                      <div>
                        <span className="font-medium">User Agent:</span> {entry.userAgent}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </CardContent>
      </Card>
    </div>
  )
}
