"use client"

import { NavBar } from "@/components/nav-bar"
import { Footer } from "@/components/footer"
import { ProtectedRoute } from "@/components/protected-route"
import { ProviderOnboardingForm } from "@/components/provider-onboarding-form"
import { useAuthStore } from "@/lib/store"
import { useEffect, useState } from "react"

export default function ProviderProfilePage() {
  const { user } = useAuthStore()
  const [profileData, setProfileData] = useState(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchProfile()
  }, [])

  const fetchProfile = async () => {
    try {
      const response = await fetch("/api/provider/profile")
      if (response.ok) {
        const data = await response.json()
        setProfileData(data.profile)
      }
    } catch (error) {
      console.error("Failed to fetch profile:", error)
    } finally {
      setIsLoading(false)
    }
  }

  if (!user) return null

  return (
    <ProtectedRoute requiredRole="provider">
      <NavBar isAuthenticated={true} userRole="provider" />
      <main className="min-h-screen">
        <div className="container-max py-12">
          <h1 className="text-3xl font-bold text-foreground mb-2">Provider Profile</h1>
          <p className="text-muted-foreground mb-8">
            Complete your profile to get verified and start accepting bookings
          </p>

          {isLoading ? (
            <div className="text-center py-12">Loading...</div>
          ) : (
            <div className="max-w-2xl bg-background border border-border rounded-lg p-8">
              <ProviderOnboardingForm
                initialData={profileData}
                onSuccess={() => {
                  setProfileData(null)
                  fetchProfile()
                }}
              />
            </div>
          )}
        </div>
      </main>
      <Footer />
    </ProtectedRoute>
  )
}
