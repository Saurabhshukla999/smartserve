"use client"

import type React from "react"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuthStore } from "@/lib/store"

interface ProtectedRouteProps {
  children: React.ReactNode
  requiredRole?: "user" | "provider"
}

export function ProtectedRoute({ children, requiredRole }: ProtectedRouteProps) {
  const router = useRouter()
  const { isAuthenticated, user, isLoading, fetchUser } = useAuthStore()

  useEffect(() => {
    fetchUser()
  }, [])

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/login")
      return
    }

    if (!isLoading && isAuthenticated && requiredRole && user?.role !== requiredRole) {
      router.push("/login")
    }
  }, [isLoading, isAuthenticated, user, requiredRole, router])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 rounded-full border-4 border-primary border-t-transparent animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return null
  }

  if (requiredRole && user?.role !== requiredRole) {
    return null
  }

  return <>{children}</>
}
