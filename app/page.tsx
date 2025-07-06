"use client"

import { useEffect, useState } from "react"
import { useAppStore } from "@/stores/app-store"
import { LoginScreen } from "@/components/login-screen"
import { SignupScreen } from "@/components/signup-screen"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Loader2 } from "lucide-react"

export default function HomePage() {
  const { user, isAuthenticated, token } = useAppStore()
  const [showSignup, setShowSignup] = useState(false)
  const [isInitializing, setIsInitializing] = useState(true)

  useEffect(() => {
    // Check if user is already authenticated on page load
    const checkAuth = async () => {
      if (token) {
        try {
          const response = await fetch("/api/auth/me", {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          })

          if (response.ok) {
            const result = await response.json()
            if (result.success) {
              useAppStore.setState({
                user: result.data,
                isAuthenticated: true,
              })
            } else {
              // Invalid token, clear it
              localStorage.removeItem("auth_token")
              useAppStore.setState({
                token: null,
                isAuthenticated: false,
              })
            }
          } else {
            // Invalid token, clear it
            localStorage.removeItem("auth_token")
            useAppStore.setState({
              token: null,
              isAuthenticated: false,
            })
          }
        } catch (error) {
          console.error("Auth check failed:", error)
          localStorage.removeItem("auth_token")
          useAppStore.setState({
            token: null,
            isAuthenticated: false,
          })
        }
      }
      setIsInitializing(false)
    }

    checkAuth()
  }, [token])

  if (isInitializing) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated || !user) {
    if (showSignup) {
      return <SignupScreen onBackToLogin={() => setShowSignup(false)} />
    }
    return <LoginScreen onShowSignup={() => setShowSignup(true)} />
  }

  return <DashboardLayout />
}
