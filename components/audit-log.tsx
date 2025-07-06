"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Skeleton } from "@/components/ui/skeleton"
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
import { useAppStore } from "@/stores/app-store"

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
  const { auditLogs, isLoading, fetchAuditLogs } = useAppStore()
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedUser, setSelectedUser] = useState("all")
  const [selectedAction, setSelectedAction] = useState("all")
  const [dateFrom, setDateFrom] = useState<Date>()
  const [dateTo, setDateTo] = useState<Date>()

  useEffect(() => {
    // Load initial audit logs
    fetchAuditLogs({ limit: 50 })
  }, [fetchAuditLogs])

  const handleSearch = () => {
    const filters: any = { limit: 50 }

    if (selectedUser !== "all") {
      filters.user_id = selectedUser
    }

    if (selectedAction !== "all") {
      filters.action = selectedAction
    }

    if (dateFrom) {
      filters.start_date = dateFrom.toISOString()
    }

    if (dateTo) {
      filters.end_date = dateTo.toISOString()
    }

    fetchAuditLogs(filters)
  }

  const handleClearFilters = () => {
    setSearchQuery("")
    setSelectedUser("all")
    setSelectedAction("all")
    setDateFrom(undefined)
    setDateTo(undefined)
    fetchAuditLogs({ limit: 50 })
  }

  const getActionIcon = (action: string) => {
    switch (action) {
      case "DOCUMENT_UPLOADED":
        return Upload
      case "DOCUMENT_DOWNLOADED":
        return Download
      case "DOCUMENT_MODIFIED":
      case "DOCUMENT_UPDATED":
        return Edit
      case "DOCUMENT_APPROVED":
        return CheckCircle
      case "DOCUMENT_REJECTED":
        return XCircle
      case "DOCUMENT_SENT":
      case "MERGE_REQUEST_CREATED":
        return Send
      case "DOCUMENT_VIEWED":
        return Eye
      case "USER_CREATED":
        return CheckCircle
      case "USER_LOGIN":
      case "USER_LOGOUT":
        return Activity
      default:
        return Activity
    }
  }

  const getActionColor = (action: string) => {
    switch (action) {
      case "DOCUMENT_APPROVED":
        return "text-green-600"
      case "DOCUMENT_REJECTED":
        return "text-red-600"
      case "USER_LOGIN":
      case "USER_LOGOUT":
        return "text-blue-600"
      case "USER_CREATED":
        return "text-blue-600"
      case "DOCUMENT_UPLOADED":
        return "text-purple-600"
      default:
        return "text-slate-600"
    }
  }

  const getSeverityColor = (action: string) => {
    switch (action) {
      case "USER_LOGIN_FAILED":
        return "bg-red-100 text-red-800"
      case "USER_CREATED":
      case "DOCUMENT_APPROVED":
        return "bg-green-100 text-green-800"
      case "DOCUMENT_REJECTED":
        return "bg-orange-100 text-orange-800"
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
            <Button onClick={handleSearch} disabled={isLoading}>
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
                  {/* Add dynamic user options based on available users */}
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
                  <SelectItem value="DOCUMENT_UPLOADED">Document Upload</SelectItem>
                  <SelectItem value="DOCUMENT_DOWNLOADED">Document Download</SelectItem>
                  <SelectItem value="DOCUMENT_APPROVED">Document Approval</SelectItem>
                  <SelectItem value="DOCUMENT_REJECTED">Document Rejection</SelectItem>
                  <SelectItem value="DOCUMENT_MODIFIED">Document Modification</SelectItem>
                  <SelectItem value="DOCUMENT_VIEWED">Document View</SelectItem>
                  <SelectItem value="USER_LOGIN">Login Activity</SelectItem>
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
            <Button variant="outline" size="sm" onClick={handleClearFilters}>
              <Filter className="h-4 w-4 mr-2" />
              Clear Filters
            </Button>
            <p className="text-sm text-slate-600">{auditLogs.length} entries found</p>
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
          {isLoading ? (
            // Loading skeleton
            Array.from({ length: 10 }).map((_, index) => (
              <div key={index} className="p-4 border border-slate-200 rounded-lg">
                <div className="flex items-start space-x-4">
                  <Skeleton className="h-8 w-8 rounded-lg" />
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center justify-between">
                      <Skeleton className="h-4 w-1/3" />
                      <Skeleton className="h-4 w-24" />
                    </div>
                    <Skeleton className="h-3 w-3/4" />
                    <div className="grid grid-cols-4 gap-4">
                      <Skeleton className="h-3 w-full" />
                      <Skeleton className="h-3 w-full" />
                      <Skeleton className="h-3 w-full" />
                      <Skeleton className="h-3 w-full" />
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : auditLogs.length > 0 ? (
            auditLogs.map((entry) => {
              const ActionIcon = getActionIcon(entry.action)
              return (
                <div
                  key={entry.id}
                  className="p-4 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
                >
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0">
                      <div className="p-2 rounded-lg bg-slate-100">
                        <ActionIcon className={`h-4 w-4 ${getActionColor(entry.action)}`} />
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          <h4 className="font-medium text-slate-800">{entry.action.replace(/_/g, " ")}</h4>
                          <Badge className={getSeverityColor(entry.action)}>Normal</Badge>
                        </div>
                        <p className="text-sm text-slate-500">{new Date(entry.timestamp).toLocaleString()}</p>
                      </div>
                      <p className="text-sm text-slate-600 mb-2">
                        {entry.details?.title || entry.details?.document_title || "System activity"}
                      </p>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-xs text-slate-500">
                        <div>
                          <span className="font-medium">User:</span> {entry.user_name || "System"}
                        </div>
                        <div>
                          <span className="font-medium">Email:</span> {entry.user_email || "N/A"}
                        </div>
                        <div>
                          <span className="font-medium">IP Address:</span> {entry.ip_address || "Unknown"}
                        </div>
                        <div>
                          <span className="font-medium">User Agent:</span>{" "}
                          {entry.user_agent ? entry.user_agent.substring(0, 30) + "..." : "Unknown"}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })
          ) : (
            <div className="text-center py-12 text-slate-500">
              <Activity className="h-16 w-16 mx-auto mb-4 text-slate-300" />
              <h3 className="text-lg font-medium mb-2">No audit entries found</h3>
              <p className="text-sm">No system activities match your current filters</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
