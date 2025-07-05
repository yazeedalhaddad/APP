"use client"

import { useState } from "react"

import { useEffect } from "react"
import { SidebarProvider } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import { useAppStore } from "@/stores/app-store"
import { ManagementDashboard } from "@/components/dashboards/management-dashboard"
import { LabDashboard } from "@/components/dashboards/lab-dashboard"
import { ProductionDashboard } from "@/components/dashboards/production-dashboard"
import { AdminDashboard } from "@/components/dashboards/admin-dashboard"
import { DocumentViewer } from "@/components/document-viewer"
import { SearchInterface } from "@/components/search-interface"
import { UserManagement } from "@/components/user-management"
import { AuditLog } from "@/components/audit-log"
import { ReportsInterface } from "@/components/reports-interface"

export function DashboardLayout() {
  const { user, activeDocument, fetchDocuments, fetchMergeRequests, fetchDashboardMetrics } = useAppStore()
  const [activeView, setActiveView] = useState("dashboard")

  useEffect(() => {
    if (user) {
      // Initialize data based on user role
      fetchDocuments()
      fetchMergeRequests()
      fetchDashboardMetrics()
    }
  }, [user])

  if (!user) {
    return null
  }

  const renderMainContent = () => {
    if (activeDocument) {
      return <DocumentViewer />
    }

    switch (activeView) {
      case "dashboard":
        switch (user.role) {
          case "management":
            return <ManagementDashboard />
          case "lab":
            return <LabDashboard />
          case "production":
            return <ProductionDashboard />
          case "admin":
            return <AdminDashboard />
          default:
            return <ManagementDashboard />
        }
      case "search":
        return <SearchInterface />
      case "users":
        return <UserManagement />
      case "audit":
        return <AuditLog />
      case "reports":
        return <ReportsInterface />
      default:
        return <ManagementDashboard />
    }
  }

  return (
    <SidebarProvider>
      <div className="flex h-screen w-full">
        <AppSidebar activeView={activeView} onViewChange={setActiveView} />
        <main className="flex-1 overflow-auto">{renderMainContent()}</main>
      </div>
    </SidebarProvider>
  )
}
