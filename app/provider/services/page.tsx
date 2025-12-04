"use client"

import { NavBar } from "@/components/nav-bar"
import { Footer } from "@/components/footer"
import { ProtectedRoute } from "@/components/protected-route"
import { useAuthStore } from "@/lib/store"
import { useEffect, useState } from "react"
import Link from "next/link"
import { Trash2, Edit } from "lucide-react"

interface Service {
  id: number
  title: string
  category: string
  price: number
  city: string
  images: string[]
  createdAt: string
}

export default function ProviderServicesPage() {
  const { user } = useAuthStore()
  const [services, setServices] = useState<Service[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchServices()
  }, [user])

  const fetchServices = async () => {
    try {
      const response = await fetch("/api/services?providerId=" + user?.id)
      if (response.ok) {
        const data = await response.json()
        setServices(data.data || [])
      }
    } catch (error) {
      console.error("Failed to fetch services:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const deleteService = async (id: number) => {
    if (!confirm("Are you sure you want to delete this service?")) return

    try {
      const response = await fetch(`/api/services/${id}`, {
        method: "DELETE",
      })
      if (response.ok) {
        setServices((prev) => prev.filter((s) => s.id !== id))
      }
    } catch (error) {
      console.error("Failed to delete service:", error)
    }
  }

  if (!user) return null

  return (
    <ProtectedRoute requiredRole="provider">
      <NavBar isAuthenticated={true} userRole="provider" />
      <main className="min-h-screen">
        <div className="container-max py-12">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-foreground mb-2">My Services</h1>
              <p className="text-muted-foreground">Manage your service offerings</p>
            </div>
            <Link
              href="/provider/services/new"
              className="px-6 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:opacity-90 transition"
            >
              Add Service
            </Link>
          </div>

          {isLoading ? (
            <div className="text-center py-12">Loading...</div>
          ) : services.length === 0 ? (
            <div className="text-center py-12 bg-muted rounded-lg">
              <p className="text-muted-foreground mb-4">No services yet. Create your first one!</p>
              <Link href="/provider/services/new" className="text-primary hover:underline font-medium">
                Add Service
              </Link>
            </div>
          ) : (
            <div className="grid gap-6">
              {services.map((service) => (
                <div
                  key={service.id}
                  className="bg-background border border-border rounded-lg p-6 hover:shadow-md transition"
                >
                  <div className="flex gap-6">
                    {service.images?.[0] && (
                      <img
                        src={service.images[0] || "/placeholder.svg"}
                        alt={service.title}
                        className="w-32 h-32 object-cover rounded-lg"
                      />
                    )}
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h3 className="text-xl font-bold text-foreground">{service.title}</h3>
                          <p className="text-sm text-muted-foreground capitalize">{service.category}</p>
                        </div>
                        <p className="text-2xl font-bold text-primary">${service.price}</p>
                      </div>
                      <p className="text-muted-foreground mb-4">{service.city}</p>
                      <div className="flex gap-2">
                        <Link
                          href={`/provider/services/${service.id}/edit`}
                          className="flex items-center gap-2 px-4 py-2 border border-border text-foreground rounded-lg hover:bg-muted transition"
                        >
                          <Edit size={16} />
                          Edit
                        </Link>
                        <button
                          onClick={() => deleteService(service.id)}
                          className="flex items-center gap-2 px-4 py-2 border border-destructive text-destructive rounded-lg hover:bg-destructive/10 transition"
                        >
                          <Trash2 size={16} />
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </ProtectedRoute>
  )
}
