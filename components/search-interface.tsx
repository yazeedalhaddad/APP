"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Search, Filter, CalendarIcon, Eye, Download } from "lucide-react"
import { format } from "date-fns"

interface User {
  id: string
  name: string
  email: string
  role: string
  department: string
}

interface SearchInterfaceProps {
  user: User
  onDocumentSelect: (document: any) => void
}

export function SearchInterface({ user, onDocumentSelect }: SearchInterfaceProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [dateFrom, setDateFrom] = useState<Date>()
  const [dateTo, setDateTo] = useState<Date>()
  const [documentType, setDocumentType] = useState("all-types")
  const [department, setDepartment] = useState("all-departments")
  const [status, setStatus] = useState("all-statuses")

  const searchResults = [
    {
      id: "DOC-2024-001",
      title: "Batch Analysis Report - Lot #4815",
      type: "Lab Result",
      department: "Laboratory",
      author: "Dr. Emily Rodriguez",
      date: "2024-12-10",
      status: "Pending Approval",
      description: "Quality analysis results for pharmaceutical batch 4815 including purity and contamination tests.",
    },
    {
      id: "DOC-2024-002",
      title: "Production Protocol Update v2.1",
      type: "Protocol",
      department: "Production",
      author: "Mike Chen",
      date: "2024-12-09",
      status: "Under Review",
      description: "Updated manufacturing protocol incorporating new safety guidelines and efficiency improvements.",
    },
    {
      id: "DOC-2024-003",
      title: "Quality Assurance Checklist Revision",
      type: "QA Document",
      department: "Quality Control",
      author: "Sarah Kim",
      date: "2024-12-08",
      status: "Approved",
      description: "Revised quality assurance checklist with updated compliance requirements.",
    },
    {
      id: "DOC-2024-004",
      title: "Equipment Calibration Log - HPLC-001",
      type: "Calibration Log",
      department: "Laboratory",
      author: "Dr. Emily Rodriguez",
      date: "2024-12-07",
      status: "Completed",
      description: "Weekly calibration verification for HPLC equipment including accuracy and precision tests.",
    },
    {
      id: "DOC-2024-005",
      title: "Stability Study Results Q4-2024",
      type: "Study Report",
      department: "Laboratory",
      author: "Dr. Michael Torres",
      date: "2024-12-06",
      status: "Archived",
      description: "Quarterly stability study results for active pharmaceutical ingredients.",
    },
  ]

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Pending Approval":
        return "bg-orange-100 text-orange-800"
      case "Under Review":
        return "bg-blue-100 text-blue-800"
      case "Approved":
        return "bg-green-100 text-green-800"
      case "Completed":
        return "bg-green-100 text-green-800"
      case "Archived":
        return "bg-slate-100 text-slate-800"
      default:
        return "bg-slate-100 text-slate-800"
    }
  }

  return (
    <div className="space-y-6">
      {/* Search Header */}
      <div className="bg-gradient-to-r from-slate-600 to-slate-700 rounded-lg p-6 text-white">
        <h2 className="text-2xl font-bold mb-2">Document Search</h2>
        <p className="text-slate-200">Find documents across all departments and workflows</p>
      </div>

      {/* Search Controls */}
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Search className="h-5 w-5 text-blue-600" />
            <span>Search & Filter</span>
          </CardTitle>
          <CardDescription>Use keywords and filters to find specific documents</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Main Search Bar */}
          <div className="flex space-x-2">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Search documents by title, content, or ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 h-11"
              />
            </div>
            <Button className="h-11 px-6">
              <Search className="h-4 w-4 mr-2" />
              Search
            </Button>
          </div>

          {/* Advanced Filters */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Document Type</label>
              <Select value={documentType} onValueChange={setDocumentType}>
                <SelectTrigger>
                  <SelectValue placeholder="All Types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all-types">All Types</SelectItem>
                  <SelectItem value="lab-result">Lab Result</SelectItem>
                  <SelectItem value="protocol">Protocol</SelectItem>
                  <SelectItem value="qa-document">QA Document</SelectItem>
                  <SelectItem value="calibration-log">Calibration Log</SelectItem>
                  <SelectItem value="study-report">Study Report</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Department</label>
              <Select value={department} onValueChange={setDepartment}>
                <SelectTrigger>
                  <SelectValue placeholder="All Departments" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all-departments">All Departments</SelectItem>
                  <SelectItem value="laboratory">Laboratory</SelectItem>
                  <SelectItem value="production">Production</SelectItem>
                  <SelectItem value="quality-control">Quality Control</SelectItem>
                  <SelectItem value="management">Management</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Status</label>
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger>
                  <SelectValue placeholder="All Statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all-statuses">All Statuses</SelectItem>
                  <SelectItem value="pending">Pending Approval</SelectItem>
                  <SelectItem value="review">Under Review</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="archived">Archived</SelectItem>
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
            <p className="text-sm text-slate-600">{searchResults.length} documents found</p>
          </div>
        </CardContent>
      </Card>

      {/* Search Results */}
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle>Search Results</CardTitle>
          <CardDescription>Documents matching your search criteria</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {searchResults.map((doc, index) => (
            <div key={index} className="p-4 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <h4 className="font-medium text-slate-800">{doc.title}</h4>
                    <Badge className={getStatusColor(doc.status)}>{doc.status}</Badge>
                  </div>
                  <p className="text-sm text-slate-600 mb-2">{doc.description}</p>
                  <div className="flex items-center space-x-4 text-xs text-slate-500">
                    <span>ID: {doc.id}</span>
                    <span>Type: {doc.type}</span>
                    <span>Department: {doc.department}</span>
                    <span>Author: {doc.author}</span>
                    <span>Date: {doc.date}</span>
                  </div>
                </div>
                <div className="flex items-center space-x-2 ml-4">
                  <Button size="sm" variant="outline" onClick={() => onDocumentSelect(doc)}>
                    <Eye className="h-4 w-4 mr-1" />
                    View
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
