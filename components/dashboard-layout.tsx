"use client"

import { useState, useEffect } from "react"
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
import { Badge } from "@/components/ui/badge"
import { LogOut, Bell } from "lucide-react"
import { VersionControlStoryboard } from "@/components/version-control-storyboard"
import { useAppStore } from "@/stores/app-store"

export function DashboardLayout() {
  const [currentView, setCurrentView] = useState("dashboard")
  const { user, activeDocument, logout, selectDocument } = useAppStore()

  // Fetch initial data when component mounts
  useEffect(() => {
    if (user) {
      // Fetch documents and other initial data based on user role
      const { fetchDocuments, fetchDrafts, fetchMergeRequests } = useAppStore.getState()
      fetchDocuments()
      fetchDrafts()
      if (user.role === "management" || user.role === "admin") {
        fetchMergeRequests()
      }
    }
  }, [user])

  const handleLogout = () => {
    logout()
  }

  const handleDocumentSelect = (document: any) => {
    selectDocument(document.id)
  }

  const renderMainContent = () => {
    if (activeDocument) {
      return <DocumentViewer onClose={() => useAppStore.getState().selectDocument("")} />
    }

    switch (currentView) {
      case "dashboard":
        if (!user) return null
        switch (user.role) {
          case "management":
            return <ManagementDashboard onDocumentSelect={handleDocumentSelect} />
          case "production":
            return <ProductionDashboard onDocumentSelect={handleDocumentSelect} />
          case "lab":
            return <LabDashboard onDocumentSelect={handleDocumentSelect} />
          case "admin":
            return <AdminDashboard />
        }
        break
      case "search":
        return <SearchInterface onDocumentSelect={handleDocumentSelect} />
      case "reports":
        return <ReportsInterface />
      case "users":
        return <UserManagement />
      case "audit":
        return <AuditLog />
      case "version-control":
        return <VersionControlStoryboard />
      default:
        return <div>View not found</div>
    }
  }

  if (!user) return null

  return (
    <SidebarProvider defaultOpen={true}>
      <div className="flex min-h-screen w-full bg-slate-50">
        <AppSidebar currentView={currentView} onViewChange={setCurrentView} />
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
                <Button variant="ghost" size="sm" onClick={handleLogout}>
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
