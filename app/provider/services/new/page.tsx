"use client"
import { NavBar } from "@/components/nav-bar"
import { Footer } from "@/components/footer"
import { ServiceForm } from "@/components/service-form"
import { ProtectedRoute } from "@/components/protected-route"
import { useAuthStore } from "@/lib/store"
import { useRouter } from "next/navigation"

export default function NewServicePage() {
  const router = useRouter()
  const { user } = useAuthStore()

  if (!user) return null

  return (
    <ProtectedRoute requiredRole="provider">
      <NavBar isAuthenticated={true} userRole="provider" />
      <main className="min-h-screen">
        <div className="container-max py-12">
          <h1 className="text-3xl font-bold text-foreground mb-8">Add New Service</h1>

          <div className="max-w-2xl bg-background border border-border rounded-lg p-8">
            <ServiceForm />
          </div>
        </div>
      </main>
      <Footer />
    </ProtectedRoute>
  )
}
