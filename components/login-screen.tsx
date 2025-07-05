"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Building2, Shield } from "lucide-react"

interface LoginScreenProps {
  onLogin: (user: {
    id: string
    name: string
    email: string
    role: "management" | "production" | "lab" | "admin"
    department: string
  }) => void
}

export function LoginScreen({ onLogin }: LoginScreenProps) {
  const [selectedRole, setSelectedRole] = useState<string>("")

  const handleLogin = () => {
    const roleMap = {
      management: { name: "Dr. Sarah Johnson", email: "sarah.johnson@medprep.com", department: "Management" },
      production: { name: "Mike Chen", email: "mike.chen@medprep.com", department: "Production" },
      lab: { name: "Dr. Emily Rodriguez", email: "emily.rodriguez@medprep.com", department: "Laboratory" },
      admin: { name: "System Administrator", email: "admin@medprep.com", department: "IT" },
    }

    if (selectedRole && roleMap[selectedRole as keyof typeof roleMap]) {
      const userData = roleMap[selectedRole as keyof typeof roleMap]
      onLogin({
        id: `user_${selectedRole}`,
        role: selectedRole as any,
        ...userData,
      })
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Company Header */}
        <div className="text-center space-y-2">
          <div className="flex items-center justify-center space-x-2">
            <Building2 className="h-8 w-8 text-blue-600" />
            <h1 className="text-2xl font-bold text-slate-800">MedPrep Systems</h1>
          </div>
          <p className="text-slate-600">National Company for Medical Preparations</p>
        </div>

        <Card className="shadow-lg border-0">
          <CardHeader className="space-y-1">
            <div className="flex items-center space-x-2">
              <Shield className="h-5 w-5 text-blue-600" />
              <CardTitle className="text-xl">Titanium Document Workflow</CardTitle>
            </div>
            <CardDescription>Secure document management system for pharmaceutical operations</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input id="email" type="email" placeholder="Enter your email" className="h-11" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" placeholder="Enter your password" className="h-11" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="role">Demo Role Selection</Label>
              <Select value={selectedRole} onValueChange={setSelectedRole}>
                <SelectTrigger className="h-11">
                  <SelectValue placeholder="Select a role to demo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="management">Management Director</SelectItem>
                  <SelectItem value="production">Production Manager</SelectItem>
                  <SelectItem value="lab">Lab Technician</SelectItem>
                  <SelectItem value="admin">System Administrator</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button
              onClick={handleLogin}
              className="w-full h-11 bg-blue-600 hover:bg-blue-700"
              disabled={!selectedRole}
            >
              Sign In
            </Button>

            <div className="text-xs text-slate-500 text-center">
              This is a demo system. Select a role above to explore different user experiences.
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
