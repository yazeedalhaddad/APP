"use client"

import { useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Skeleton } from "@/components/ui/skeleton"
import { Users, Shield, Activity, Database, CheckCircle, Settings } from "lucide-react"
import { useAppStore } from "@/stores/app-store"

interface User {
  id: string
  name: string
  email: string
  role: string
  department: string
}

interface AdminDashboardProps {
  user: User
}

export function AdminDashboard({ user }: AdminDashboardProps) {
  const { dashboardMetrics, users, auditLogs, isLoading, fetchDashboardMetrics, fetchUsers, fetchAuditLogs } =
    useAppStore()

  useEffect(() => {
    fetchDashboardMetrics()
    fetchUsers()
    fetchAuditLogs({ limit: 20 })
  }, [fetchDashboardMetrics, fetchUsers, fetchAuditLogs])

  const systemMetrics = dashboardMetrics
    ? [
        {
          label: "Total Users",
          value: dashboardMetrics.users?.total || users.length,
          icon: Users,
          color: "text-blue-600",
          bg: "bg-blue-50",
        },
        {
          label: "Total Documents",
          value: dashboardMetrics.documents.total,
          icon: Database,
          color: "text-green-600",
          bg: "bg-green-50",
        },
        {
          label: "Active Drafts",
          value: dashboardMetrics.drafts.active,
          icon: Activity,
          color: "text-purple-600",
          bg: "bg-purple-50",
        },
        {
          label: "Pending Approvals",
          value: dashboardMetrics.mergeRequests.pending,
          icon: Shield,
          color: "text-orange-600",
          bg: "bg-orange-50",
        },
      ]
    : []

  const usersByDepartment = users.reduce(
    (acc, user) => {
      acc[user.department] = (acc[user.department] || 0) + 1
      return acc
    },
    {} as Record<string, number>,
  )

  const recentAuditLogs = auditLogs.slice(0, 10)

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-slate-800 to-slate-900 rounded-lg p-6 text-white">
        <h2 className="text-2xl font-bold mb-2">System Administration</h2>
        <p className="text-slate-300">Monitor system health, manage users, and maintain security protocols.</p>
        <div className="flex space-x-3 mt-4">
          <Button className="bg-white text-slate-800 hover:bg-slate-100">
            <Users className="h-4 w-4 mr-2" />
            Manage Users
          </Button>
          <Button
            variant="outline"
            className="border-white text-white hover:bg-white hover:text-slate-800 bg-transparent"
          >
            <Settings className="h-4 w-4 mr-2" />
            System Settings
          </Button>
        </div>
      </div>

      {/* System Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {isLoading
          ? Array.from({ length: 4 }).map((_, index) => (
              <Card key={index} className="border-0 shadow-sm">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-20" />
                      <Skeleton className="h-8 w-16" />
                    </div>
                    <Skeleton className="h-12 w-12 rounded-lg" />
                  </div>
                </CardContent>
              </Card>
            ))
          : systemMetrics.map((metric, index) => (
              <Card key={index} className="border-0 shadow-sm">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-slate-600">{metric.label}</p>
                      <p className="text-2xl font-bold text-slate-800 mt-1">{metric.value}</p>
                    </div>
                    <div className={`p-3 rounded-lg ${metric.bg}`}>
                      <metric.icon className={`h-6 w-6 ${metric.color}`} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* User Activity by Department */}
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Activity className="h-5 w-5 text-blue-600" />
              <span>Users by Department</span>
            </CardTitle>
            <CardDescription>Distribution of users across departments</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {isLoading ? (
              Array.from({ length: 4 }).map((_, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-4 w-16" />
                  </div>
                  <Skeleton className="h-2 w-full" />
                </div>
              ))
            ) : Object.keys(usersByDepartment).length > 0 ? (
              Object.entries(usersByDepartment).map(([department, count]) => {
                const percentage = Math.round((count / users.length) * 100)
                return (
                  <div key={department} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-slate-800">{department}</span>
                      <div className="flex items-center space-x-4 text-sm">
                        <span className="text-blue-600">{count} users</span>
                        <span className="text-slate-600">{percentage}%</span>
                      </div>
                    </div>
                    <Progress value={percentage} className="h-2" />
                  </div>
                )
              })
            ) : (
              <div className="text-center py-6 text-slate-500">
                <Users className="h-8 w-8 mx-auto mb-2 text-slate-300" />
                <p className="text-sm">No user data available</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent System Activity */}
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Shield className="h-5 w-5 text-green-600" />
              <span>Recent System Activity</span>
            </CardTitle>
            <CardDescription>Latest system administration activities</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {isLoading ? (
              Array.from({ length: 5 }).map((_, index) => (
                <div key={index} className="flex items-start space-x-3 p-3 border border-slate-200 rounded-lg">
                  <Skeleton className="h-4 w-4 rounded-full" />
                  <div className="flex-1 space-y-1">
                    <Skeleton className="h-3 w-3/4" />
                    <Skeleton className="h-3 w-1/2" />
                  </div>
                </div>
              ))
            ) : recentAuditLogs.length > 0 ? (
              recentAuditLogs.map((log) => (
                <div key={log.id} className="flex items-start space-x-3 p-3 border border-slate-200 rounded-lg">
                  <div className="flex-shrink-0">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-slate-800">{log.action.replace(/_/g, " ")}</p>
                      <p className="text-xs text-slate-500">{new Date(log.timestamp).toLocaleDateString()}</p>
                    </div>
                    <p className="text-xs text-slate-600 mt-1">
                      {log.details?.title || log.details?.document_title || "System activity"}
                    </p>
                    <p className="text-xs text-slate-500 mt-1">By: {log.user_name || "System"}</p>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-6 text-slate-500">
                <Activity className="h-8 w-8 mx-auto mb-2 text-slate-300" />
                <p className="text-sm">No recent activity</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
