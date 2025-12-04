"use client"

import { NavBar } from "@/components/nav-bar"
import { Footer } from "@/components/footer"
import { ServiceForm } from "@/components/service-form"
import { ProtectedRoute } from "@/components/protected-route"
import { useAuthStore } from "@/lib/store"
import { useEffect, useState } from "react"

export default function EditServicePage({ params }: { params: Promise<{ id: string }> }) {
  const { user } = useAuthStore()
  const [serviceData, setServiceData] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [serviceId, setServiceId] = useState<number | null>(null)

  useEffect(() => {
    params.then(({ id }) => {
      setServiceId(Number(id))
      fetchService(Number(id))
    })
  }, [params])

  const fetchService = async (id: number) => {
    try {
      const response = await fetch(`/api/services/${id}`)
      if (response.ok) {
        const data = await response.json()
        setServiceData(data)
      }
    } catch (error) {
      console.error("Failed to fetch service:", error)
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
          <h1 className="text-3xl font-bold text-foreground mb-8">Edit Service</h1>

          {isLoading ? (
            <div className="text-center py-12">Loading...</div>
          ) : (
            <div className="max-w-2xl bg-background border border-border rounded-lg p-8">
              {serviceId && <ServiceForm serviceId={serviceId} initialData={serviceData} />}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </ProtectedRoute>
  )
}
