"use client"

import { useState } from "react"
import { LoginScreen } from "@/components/login-screen"
import { DashboardLayout } from "@/components/dashboard-layout"

export default function Home() {
  const [currentUser, setCurrentUser] = useState<{
    id: string
    name: string
    email: string
    role: "management" | "production" | "lab" | "admin"
    department: string
  } | null>(null)

  if (!currentUser) {
    return <LoginScreen onLogin={setCurrentUser} />
  }

  return <DashboardLayout user={currentUser} onLogout={() => setCurrentUser(null)} />
}
