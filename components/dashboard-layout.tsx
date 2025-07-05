"use client"

import { useState } from "react"
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import { ManagementDashboard } from "@/components/dashboards/management-dashboard"
import { ProductionDashboard } from "@/components/dashboards/production-dashboard"
import { LabDashboard } from "@/components/dashboards/lab-dashboard"
import { AdminDashboard } from "@/components/dashboards/admin-dashboard"
import { DocumentViewer } from "@/components/document-viewer"
import { SearchInterface } from "@/components/search-interface"
import { ReportsInterface } from "@/components/reports-interface"
import { UserManagement } from "@/components/user-management"
import { AuditLog } from "@/components/audit-log"
import { Button } from "@/components/ui/button"
import { LogOut, Bell } from "lucide-react"
import { Badge } from "@/components/ui/badge"
// Import the new component
import { VersionControlStoryboard } from "@/components/version-control-storyboard"

interface User {
  id: string
  name: string
  email: string
  role: "management" | "production" | "lab" | "admin"
  department: string
}

interface DashboardLayoutProps {
  user: User
  onLogout: () => void
}

export function DashboardLayout({ user, onLogout }: DashboardLayoutProps) {
  const [currentView, setCurrentView] = useState("dashboard")
  const [selectedDocument, setSelectedDocument] = useState<any>(null)

  const renderMainContent = () => {
    if (selectedDocument) {
      return <DocumentViewer document={selectedDocument} user={user} onClose={() => setSelectedDocument(null)} />
    }

    switch (currentView) {
      case "dashboard":
        switch (user.role) {
          case "management":
            return <ManagementDashboard user={user} onDocumentSelect={setSelectedDocument} />
          case "production":
            return <ProductionDashboard user={user} onDocumentSelect={setSelectedDocument} />
          case "lab":
            return <LabDashboard user={user} onDocumentSelect={setSelectedDocument} />
          case "admin":
            return <AdminDashboard user={user} />
        }
        break
      case "search":
        return <SearchInterface user={user} onDocumentSelect={setSelectedDocument} />
      case "reports":
        return <ReportsInterface user={user} />
      case "users":
        return <UserManagement user={user} />
      case "audit":
        return <AuditLog user={user} />
      // Add to the renderMainContent function
      case "version-control":
        return <VersionControlStoryboard />
      default:
        return <div>View not found</div>
    }
  }

  return (
    <SidebarProvider defaultOpen={true}>
      <div className="flex min-h-screen w-full bg-slate-50">
        <AppSidebar user={user} currentView={currentView} onViewChange={setCurrentView} />
        <SidebarInset className="flex-1">
          {/* Header */}
          <header className="sticky top-0 z-40 border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
            <div className="flex h-16 items-center justify-between px-6">
              <div className="flex items-center space-x-4">
                <SidebarTrigger />
                <div>
                  <h1 className="text-lg font-semibold text-slate-800">
                    {currentView === "dashboard"
                      ? `${user.department} Dashboard`
                      : currentView.charAt(0).toUpperCase() + currentView.slice(1)}
                  </h1>
                  <p className="text-sm text-slate-600">Welcome back, {user.name}</p>
                </div>
              </div>

              <div className="flex items-center space-x-4">
                <Button variant="ghost" size="sm" className="relative">
                  <Bell className="h-4 w-4" />
                  <Badge className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 text-xs bg-orange-500">3</Badge>
                </Button>
                <Button variant="ghost" size="sm" onClick={onLogout}>
                  <LogOut className="h-4 w-4 mr-2" />
                  Sign Out
                </Button>
              </div>
            </div>
          </header>

          {/* Main Content */}
          <main className="flex-1 p-6">{renderMainContent()}</main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  )
}

import { LayoutDashboard, Search, FileText, Users, Activity, Settings, GitBranch } from "lucide-react"

// Update the sidebar menu items to include the storyboard
const getMenuItems = (user: User) => {
  const baseItems = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "search", label: "Search Documents", icon: Search },
    { id: "reports", label: "Reports", icon: FileText },
    { id: "version-control", label: "Version Control Demo", icon: GitBranch },
  ]

  if (user.role === "admin") {
    return [
      ...baseItems,
      { id: "users", label: "User Management", icon: Users },
      { id: "audit", label: "Audit Log", icon: Activity },
      { id: "settings", label: "System Settings", icon: Settings },
    ]
  }

  return baseItems
}

export { getMenuItems }
