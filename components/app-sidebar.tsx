"use client"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  LayoutDashboard,
  Search,
  Users,
  FileText,
  Activity,
  BarChart3,
  Settings,
  LogOut,
  ChevronUp,
  Building2,
} from "lucide-react"
import { useAppStore } from "@/stores/app-store"

interface AppSidebarProps {
  activeView: string
  onViewChange: (view: string) => void
}

export function AppSidebar({ activeView, onViewChange }: AppSidebarProps) {
  const { user, logout, mergeRequests } = useAppStore()

  if (!user) return null

  const pendingApprovals = mergeRequests.filter((mr) => mr.status === "pending").length

  const navigationItems = [
    {
      title: "Dashboard",
      icon: LayoutDashboard,
      id: "dashboard",
      badge: null,
    },
    {
      title: "Search Documents",
      icon: Search,
      id: "search",
      badge: null,
    },
    {
      title: "Reports",
      icon: BarChart3,
      id: "reports",
      badge: null,
    },
  ]

  // Add admin/management specific items
  if (["admin", "management"].includes(user.role)) {
    navigationItems.push(
      {
        title: "User Management",
        icon: Users,
        id: "users",
        badge: null,
      },
      {
        title: "Audit Log",
        icon: Activity,
        id: "audit",
        badge: null,
      },
    )
  }

  const getUserInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
  }

  const getRoleColor = (role: string) => {
    switch (role) {
      case "admin":
        return "bg-red-100 text-red-800"
      case "management":
        return "bg-purple-100 text-purple-800"
      case "production":
        return "bg-green-100 text-green-800"
      case "lab":
        return "bg-blue-100 text-blue-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <Sidebar>
      <SidebarHeader>
        <div className="flex items-center space-x-2 px-2 py-4">
          <Building2 className="h-8 w-8 text-blue-600" />
          <div>
            <h1 className="text-lg font-semibold">MedPrep</h1>
            <p className="text-xs text-muted-foreground">Document Management</p>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navigationItems.map((item) => (
                <SidebarMenuItem key={item.id}>
                  <SidebarMenuButton isActive={activeView === item.id} onClick={() => onViewChange(item.id)}>
                    <item.icon className="h-4 w-4" />
                    <span>{item.title}</span>
                    {item.badge && (
                      <Badge variant="secondary" className="ml-auto">
                        {item.badge}
                      </Badge>
                    )}
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {pendingApprovals > 0 && ["management", "admin"].includes(user.role) && (
          <SidebarGroup>
            <SidebarGroupLabel>Pending Actions</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton onClick={() => onViewChange("dashboard")}>
                    <FileText className="h-4 w-4" />
                    <span>Pending Approvals</span>
                    <Badge variant="destructive" className="ml-auto">
                      {pendingApprovals}
                    </Badge>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton className="w-full">
                  <Avatar className="h-6 w-6">
                    <AvatarFallback className="text-xs">{getUserInitials(user.name)}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 text-left">
                    <p className="text-sm font-medium">{user.name}</p>
                    <Badge className={`text-xs ${getRoleColor(user.role)}`}>{user.role}</Badge>
                  </div>
                  <ChevronUp className="h-4 w-4" />
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent side="top" className="w-[--radix-popper-anchor-width]">
                <DropdownMenuItem>
                  <Settings className="h-4 w-4 mr-2" />
                  Settings
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={logout}>
                  <LogOut className="h-4 w-4 mr-2" />
                  Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  )
}
