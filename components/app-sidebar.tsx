"use client"

import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { LayoutDashboard, Search, FileText, Users, Settings, Shield, Building2, Activity } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

interface User {
  id: string
  name: string
  email: string
  role: "management" | "production" | "lab" | "admin"
  department: string
}

interface AppSidebarProps {
  user: User
  currentView: string
  onViewChange: (view: string) => void
}

export function AppSidebar({ user, currentView, onViewChange }: AppSidebarProps) {
  const getMenuItems = () => {
    const baseItems = [
      { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
      { id: "search", label: "Search Documents", icon: Search },
      { id: "reports", label: "Reports", icon: FileText },
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

  return (
    <Sidebar className="border-r border-slate-200">
      <SidebarHeader className="border-b border-slate-200 p-4">
        <div className="flex items-center space-x-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-600">
            <Building2 className="h-6 w-6 text-white" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-slate-800">Titanium Workflow</h2>
            <p className="text-xs text-slate-600">Document Management</p>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent className="p-4">
        <SidebarGroup>
          <SidebarGroupLabel className="text-xs font-medium text-slate-500 uppercase tracking-wider">
            Navigation
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {getMenuItems().map((item) => (
                <SidebarMenuItem key={item.id}>
                  <SidebarMenuButton asChild isActive={currentView === item.id} className="w-full justify-start">
                    <button onClick={() => onViewChange(item.id)}>
                      <item.icon className="h-4 w-4" />
                      <span>{item.label}</span>
                    </button>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-slate-200 p-4">
        <div className="flex items-center space-x-3">
          <Avatar className="h-8 w-8">
            <AvatarImage src={`/placeholder.svg?height=32&width=32`} />
            <AvatarFallback className="bg-blue-100 text-blue-600 text-xs">
              {user.name
                .split(" ")
                .map((n) => n[0])
                .join("")}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-slate-800 truncate">{user.name}</p>
            <div className="flex items-center space-x-1">
              <Shield className="h-3 w-3 text-slate-400" />
              <p className="text-xs text-slate-600 capitalize">{user.role}</p>
            </div>
          </div>
        </div>
      </SidebarFooter>
    </Sidebar>
  )
}
