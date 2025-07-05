"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Users, Shield, Activity, Database, Server, AlertTriangle, CheckCircle, Settings } from "lucide-react"

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
  const systemMetrics = [
    { label: "Active Users", value: "47", icon: Users, color: "text-blue-600", bg: "bg-blue-50" },
    { label: "System Uptime", value: "99.8%", icon: Server, color: "text-green-600", bg: "bg-green-50" },
    { label: "Storage Used", value: "2.3 TB", icon: Database, color: "text-purple-600", bg: "bg-purple-50" },
    { label: "Security Alerts", value: "2", icon: Shield, color: "text-orange-600", bg: "bg-orange-50" },
  ]

  const userActivity = [
    { department: "Laboratory", activeUsers: 12, totalUsers: 15, activity: 85 },
    { department: "Production", activeUsers: 8, totalUsers: 12, activity: 67 },
    { department: "Management", activeUsers: 5, totalUsers: 6, activity: 83 },
    { department: "Quality Control", activeUsers: 7, totalUsers: 9, activity: 78 },
  ]

  const systemAlerts = [
    {
      id: "ALERT-001",
      type: "Security",
      message: "Multiple failed login attempts detected for user: j.smith@medprep.com",
      severity: "High",
      timestamp: "15 minutes ago",
      status: "Active",
    },
    {
      id: "ALERT-002",
      type: "Performance",
      message: "Database query response time above threshold (2.3s average)",
      severity: "Medium",
      timestamp: "1 hour ago",
      status: "Investigating",
    },
    {
      id: "ALERT-003",
      type: "Storage",
      message: "Document archive storage at 85% capacity",
      severity: "Low",
      timestamp: "3 hours ago",
      status: "Acknowledged",
    },
  ]

  const recentActions = [
    {
      action: "User Created",
      description: "New user account created for Dr. Michael Torres (Laboratory)",
      timestamp: "2 hours ago",
      user: "System Administrator",
    },
    {
      action: "Permission Updated",
      description: "Document approval permissions modified for Production team",
      timestamp: "1 day ago",
      user: "System Administrator",
    },
    {
      action: "System Backup",
      description: "Automated daily backup completed successfully",
      timestamp: "1 day ago",
      user: "System",
    },
    {
      action: "Security Scan",
      description: "Weekly security vulnerability scan completed",
      timestamp: "2 days ago",
      user: "System",
    },
  ]

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
        {systemMetrics.map((metric, index) => (
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
              <span>User Activity by Department</span>
            </CardTitle>
            <CardDescription>Current user engagement across departments</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {userActivity.map((dept, index) => (
              <div key={index} className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-slate-800">{dept.department}</span>
                  <div className="flex items-center space-x-4 text-sm">
                    <span className="text-green-600">
                      {dept.activeUsers}/{dept.totalUsers} active
                    </span>
                    <span className="text-slate-600">{dept.activity}% activity</span>
                  </div>
                </div>
                <Progress value={dept.activity} className="h-2" />
              </div>
            ))}
          </CardContent>
        </Card>

        {/* System Alerts */}
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <AlertTriangle className="h-5 w-5 text-orange-600" />
              <span>System Alerts</span>
              <Badge className="bg-orange-100 text-orange-800">{systemAlerts.length}</Badge>
            </CardTitle>
            <CardDescription>Security and performance notifications</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {systemAlerts.map((alert, index) => (
              <div key={index} className="p-4 border border-slate-200 rounded-lg">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <Badge
                      variant={
                        alert.severity === "High"
                          ? "destructive"
                          : alert.severity === "Medium"
                            ? "default"
                            : "secondary"
                      }
                      className="text-xs"
                    >
                      {alert.severity}
                    </Badge>
                    <span className="text-sm font-medium text-slate-800">{alert.type}</span>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {alert.status}
                  </Badge>
                </div>
                <p className="text-sm text-slate-600 mb-2">{alert.message}</p>
                <p className="text-xs text-slate-500">{alert.timestamp}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Recent Administrative Actions */}
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Shield className="h-5 w-5 text-green-600" />
            <span>Recent Administrative Actions</span>
          </CardTitle>
          <CardDescription>Latest system administration activities</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {recentActions.map((action, index) => (
            <div key={index} className="flex items-start space-x-3 p-3 border border-slate-200 rounded-lg">
              <div className="flex-shrink-0">
                <CheckCircle className="h-4 w-4 text-green-600" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-slate-800">{action.action}</p>
                  <p className="text-xs text-slate-500">{action.timestamp}</p>
                </div>
                <p className="text-xs text-slate-600 mt-1">{action.description}</p>
                <p className="text-xs text-slate-500 mt-1">By: {action.user}</p>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}
