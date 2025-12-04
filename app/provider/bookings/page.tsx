"use client"

import { NavBar } from "@/components/nav-bar"
import { Footer } from "@/components/footer"
import { ProtectedRoute } from "@/components/protected-route"
import { useAuthStore } from "@/lib/store"
import { useEffect, useState } from "react"
import { CheckCircle, Clock, XCircle } from "lucide-react"

interface Booking {
  id: number
  serviceTitle: string
  userName: string
  userEmail: string
  datetime: string
  status: "pending" | "confirmed" | "cancelled" | "completed"
  price: number
}

export default function ProviderBookingsPage() {
  const { user } = useAuthStore()
  const [bookings, setBookings] = useState<Booking[]>([])
  const [filteredBookings, setFilteredBookings] = useState<Booking[]>([])
  const [filter, setFilter] = useState<"all" | "pending" | "confirmed" | "completed" | "cancelled">("all")
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (user) {
      fetchBookings()
    }
  }, [user])

  useEffect(() => {
    filterBookings(filter)
  }, [filter, bookings])

  const fetchBookings = async () => {
    try {
      const response = await fetch(`/api/bookings?providerId=${user?.id}`)
      if (response.ok) {
        const data = await response.json()
        setBookings(data.data || [])
      }
    } catch (error) {
      console.error("Failed to fetch bookings:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const filterBookings = (filterType: string) => {
    if (filterType === "all") {
      setFilteredBookings(bookings)
    } else {
      setFilteredBookings(bookings.filter((b) => b.status === filterType))
    }
  }

  const updateBookingStatus = async (bookingId: number, status: string) => {
    try {
      const response = await fetch(`/api/bookings/${bookingId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      })

      if (response.ok) {
        fetchBookings()
      }
    } catch (error) {
      console.error("Failed to update booking:", error)
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "confirmed":
        return <CheckCircle size={18} className="text-green-500" />
      case "pending":
        return <Clock size={18} className="text-orange-500" />
      case "cancelled":
        return <XCircle size={18} className="text-destructive" />
      default:
        return null
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "confirmed":
        return "bg-green-100 text-green-700"
      case "pending":
        return "bg-orange-100 text-orange-700"
      case "completed":
        return "bg-blue-100 text-blue-700"
      case "cancelled":
        return "bg-red-100 text-red-700"
      default:
        return "bg-gray-100 text-gray-700"
    }
  }

  if (!user) return null

  return (
    <ProtectedRoute requiredRole="provider">
      <NavBar isAuthenticated={true} userRole="provider" />
      <main className="min-h-screen">
        <div className="container-max py-12">
          <h1 className="text-3xl font-bold text-foreground mb-2">Manage Bookings</h1>
          <p className="text-muted-foreground mb-8">View and manage all your client bookings</p>

          <div className="flex gap-2 mb-8 flex-wrap">
            {(["all", "pending", "confirmed", "completed", "cancelled"] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                  filter === f
                    ? "bg-primary text-primary-foreground"
                    : "border border-border text-foreground hover:bg-muted"
                }`}
              >
                {f.charAt(0).toUpperCase() + f.slice(1)}
              </button>
            ))}
          </div>

          {isLoading ? (
            <div className="text-center py-12">Loading...</div>
          ) : filteredBookings.length === 0 ? (
            <div className="text-center py-12 bg-muted rounded-lg">
              <p className="text-muted-foreground">No {filter !== "all" ? filter : ""} bookings</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredBookings.map((booking) => (
                <div
                  key={booking.id}
                  className="bg-background border border-border rounded-lg p-6 hover:shadow-md transition"
                >
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="text-lg font-bold text-foreground">{booking.serviceTitle}</h3>
                        {getStatusIcon(booking.status)}
                        <span className={`text-xs font-medium px-2 py-1 rounded ${getStatusColor(booking.status)}`}>
                          {booking.status}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground mb-1">{booking.userName}</p>
                      <p className="text-xs text-muted-foreground mb-2">{booking.userEmail}</p>
                      <p className="text-sm text-foreground font-semibold">
                        {new Date(booking.datetime).toLocaleString()}
                      </p>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <p className="text-2xl font-bold text-primary">${booking.price.toFixed(2)}</p>
                      {booking.status === "pending" && (
                        <div className="flex gap-2">
                          <button
                            onClick={() => updateBookingStatus(booking.id, "confirmed")}
                            className="px-4 py-2 bg-green-500 text-white rounded-lg text-sm font-medium hover:opacity-90"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => updateBookingStatus(booking.id, "cancelled")}
                            className="px-4 py-2 bg-destructive text-white rounded-lg text-sm font-medium hover:opacity-90"
                          >
                            Reject
                          </button>
                        </div>
                      )}
                      {booking.status === "confirmed" && (
                        <button
                          onClick={() => updateBookingStatus(booking.id, "completed")}
                          className="px-4 py-2 bg-blue-500 text-white rounded-lg text-sm font-medium hover:opacity-90"
                        >
                          Mark Complete
                        </button>
                      )}
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
