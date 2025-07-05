"use client"
import { LoginScreen } from "@/components/login-screen"
import { DashboardLayout } from "@/components/dashboard-layout"
import { useAppStore } from "@/stores/app-store"
import { Skeleton } from "@/components/ui/skeleton"

export default function Home() {
  const { user, isAuthenticated, isLoading } = useAppStore()

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="space-y-4 w-96">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-8 w-full" />
        </div>
      </div>
    )
  }

  if (!isAuthenticated || !user) {
    return <LoginScreen />
  }

  return <DashboardLayout />
}
