"use client"

import { useEffect } from "react"
import { useAppStore } from "@/stores/app-store"
import { LoginScreen } from "@/components/login-screen"
import { DashboardLayout } from "@/components/dashboard-layout"

export default function HomePage() {
  const { isAuthenticated, user, token } = useAppStore()

  useEffect(() => {
    // Initialize the app by checking authentication status
    if (token && !user) {
      // Token exists but user data is not loaded, verify token
      fetch("/api/auth/me", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
        .then((response) => response.json())
        .then((result) => {
          if (result.success) {
            useAppStore.setState({
              user: result.data,
              isAuthenticated: true,
            })
          } else {
            // Invalid token, clear it
            useAppStore.getState().logout()
          }
        })
        .catch(() => {
          // Network error or invalid response, clear token
          useAppStore.getState().logout()
        })
    }
  }, [token, user])

  if (!isAuthenticated) {
    return <LoginScreen />
  }

  return <DashboardLayout />
}
