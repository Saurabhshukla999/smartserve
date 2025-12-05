"use client"

import { NavBar } from "@/components/nav-bar"
import { Footer } from "@/components/footer"
import { ProtectedRoute } from "@/components/protected-route"
import { useAuthStore } from "@/lib/store"
import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"

interface Booking {
  id: number
  serviceTitle: string
  userName: string
  userEmail: string
  datetime: string
  status: "pending" | "confirmed" | "cancelled" | "completed"
  price: number
}

export default function ProviderBookingDetailPage() {
  const { user } = useAuthStore()
  const params = useParams()
  const router = useRouter()
  const [booking, setBooking] = useState<Booking | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (!user) return
    const idParam = params?.id
    if (!idParam) return

    const fetchBooking = async () => {
      try {
        const token = localStorage.getItem("authToken") || localStorage.getItem("token")
        if (!token) {
          console.error("No auth token found while fetching booking detail")
          setIsLoading(false)
          return
        }

        const response = await fetch(`/api/bookings/${idParam}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        if (response.ok) {
          const data = await response.json()
          setBooking(data || null)
        } else {
          console.error("Failed to fetch booking detail:", await response.text())
        }
      } catch (error) {
        console.error("Failed to fetch booking detail:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchBooking()
  }, [user, params])

  const updateBookingStatus = async (status: "confirmed" | "cancelled" | "completed") => {
    if (!booking) return

    try {
      const token = localStorage.getItem("authToken") || localStorage.getItem("token")
      if (!token) {
        console.error("No auth token found while updating booking")
        return
      }

      const response = await fetch(`/api/bookings/${booking.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status }),
      })

      if (response.ok) {
        const data = await response.json()
        setBooking(data || { ...booking, status })
      } else {
        console.error("Failed to update booking:", await response.text())
      }
    } catch (error) {
      console.error("Failed to update booking:", error)
    }
  }

  if (!user) return null

  return (
    <ProtectedRoute requiredRole="provider">
      <NavBar isAuthenticated={true} userRole="provider" />
      <main className="min-h-screen">
        <div className="container-max py-12">
          <button
            onClick={() => router.back()}
            className="mb-4 text-sm text-primary hover:underline"
          >
            Back
          </button>

          <h1 className="text-3xl font-bold text-foreground mb-2">Booking Details</h1>
          <p className="text-muted-foreground mb-8">Review this booking request</p>

          {isLoading ? (
            <div className="text-center py-12">Loading...</div>
          ) : !booking ? (
            <div className="text-center py-12 bg-muted rounded-lg">
              <p className="text-muted-foreground">Booking not found.</p>
            </div>
          ) : (
            <div className="bg-background border border-border rounded-lg p-6 max-w-xl">
              <h2 className="text-xl font-bold text-foreground mb-2">{booking.serviceTitle}</h2>
              <p className="text-sm text-muted-foreground mb-1">{booking.userName}</p>
              <p className="text-xs text-muted-foreground mb-2">{booking.userEmail}</p>
              <p className="text-sm text-foreground font-semibold mb-2">
                {new Date(booking.datetime).toLocaleString()}
              </p>
              <p className="text-lg font-bold text-primary mb-4">
                ${
                  (typeof booking.price === "number"
                    ? booking.price
                    : Number.parseFloat(String(booking.price)) || 0
                  ).toFixed(2)
                }
              </p>

              <p className="text-sm mb-1">
                <span className="font-semibold">Status:</span> {booking.status}
              </p>

              {booking.status === "pending" && (
                <div className="flex gap-2 mt-4">
                  <button
                    onClick={() => updateBookingStatus("confirmed")}
                    className="px-4 py-2 bg-green-500 text-white rounded-lg text-sm font-medium hover:opacity-90"
                  >
                    Approve
                  </button>
                  <button
                    onClick={() => updateBookingStatus("cancelled")}
                    className="px-4 py-2 bg-destructive text-white rounded-lg text-sm font-medium hover:opacity-90"
                  >
                    Reject
                  </button>
                </div>
              )}

              {booking.status === "confirmed" && (
                <div className="flex gap-2 mt-4">
                  <button
                    onClick={() => updateBookingStatus("completed")}
                    className="px-4 py-2 bg-blue-500 text-white rounded-lg text-sm font-medium hover:opacity-90"
                  >
                    Mark Complete
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </ProtectedRoute>
  )
}
