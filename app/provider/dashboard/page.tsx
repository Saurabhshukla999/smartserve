"use client"

import { NavBar } from "@/components/nav-bar"
import { Footer } from "@/components/footer"
import { ProtectedRoute } from "@/components/protected-route"
import { useAuthStore } from "@/lib/store"
import { Calendar, DollarSign, Users, Star, Clock, CheckCircle } from "lucide-react"
import Link from "next/link"
import { useEffect, useState } from "react"

interface DashboardStats {
  totalBookings: number
  totalEarnings: number
  regularClients: number
  averageRating: number
  upcomingBookingsCount: number
  pendingRequests: number
}

interface Booking {
  id: number
  serviceTitle: string
  userName: string
  datetime: string
  status: string
  price: number
}

export default function ProviderDashboard() {
  const { user } = useAuthStore()
  const [stats, setStats] = useState<DashboardStats>({
    totalBookings: 0,
    totalEarnings: 0,
    regularClients: 0,
    averageRating: 0,
    upcomingBookingsCount: 0,
    pendingRequests: 0,
  })
  const [upcomingBookings, setUpcomingBookings] = useState<Booking[]>([])
  const [pendingBookings, setPendingBookings] = useState<Booking[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (user) {
      fetchDashboardData()
    }
  }, [user])

  const fetchDashboardData = async () => {
    try {
      const [bookingsRes, statsRes] = await Promise.all([
        fetch(`/api/bookings?providerId=${user?.id}`),
        fetch(`/api/provider/stats`),
      ])

      if (bookingsRes.ok) {
        const bookingsData = await bookingsRes.json()
        const bookings = bookingsData.data || []

        // Filter upcoming and pending
        const now = new Date()
        const upcoming = bookings.filter((b: Booking) => new Date(b.datetime) > now && b.status === "confirmed")
        const pending = bookings.filter((b: Booking) => b.status === "pending")

        setUpcomingBookings(upcoming.slice(0, 5))
        setPendingBookings(pending.slice(0, 5))

        // Calculate stats
        setStats((prev) => ({
          ...prev,
          totalBookings: bookings.length,
          upcomingBookingsCount: upcoming.length,
          pendingRequests: pending.length,
          totalEarnings: bookings.reduce((sum: number, b: Booking) => sum + (b.price || 0), 0),
        }))
      }

      if (statsRes.ok) {
        const statsData = await statsRes.json()
        setStats((prev) => ({
          ...prev,
          ...statsData,
        }))
      }
    } catch (error) {
      console.error("Failed to fetch dashboard data:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const statCards = [
    {
      icon: Calendar,
      label: "Total Bookings",
      value: stats.totalBookings,
      change: `${stats.upcomingBookingsCount} upcoming`,
    },
    {
      icon: DollarSign,
      label: "Total Earnings",
      value: `$${stats.totalEarnings.toFixed(2)}`,
      change: "+12% this month",
    },
    {
      icon: Users,
      label: "Regular Clients",
      value: stats.regularClients,
      change: "+1 new client",
    },
    {
      icon: Star,
      label: "Average Rating",
      value: stats.averageRating.toFixed(1),
      change: "Based on reviews",
    },
  ]

  if (!user) return null

  return (
    <ProtectedRoute requiredRole="provider">
      <NavBar isAuthenticated={true} userRole="provider" />
      <main className="min-h-screen">
        <div className="container-max py-12">
          <h1 className="text-3xl font-bold text-foreground mb-2">Provider Dashboard</h1>
          <p className="text-muted-foreground mb-8">Manage your services and bookings</p>

          {isLoading ? (
            <div className="text-center py-12">Loading...</div>
          ) : (
            <>
              {/* Stats Grid */}
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                {statCards.map((stat, index) => (
                  <div
                    key={index}
                    className="bg-background border border-border rounded-lg p-6 hover:shadow-md transition"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <stat.icon size={24} className="text-primary" />
                    </div>
                    <p className="text-muted-foreground text-sm mb-1">{stat.label}</p>
                    <p className="text-3xl font-bold text-foreground mb-2">{stat.value}</p>
                    <p className="text-xs text-muted-foreground">{stat.change}</p>
                  </div>
                ))}
              </div>

              {/* Quick Actions */}
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                <Link
                  href="/provider/services/new"
                  className="bg-primary text-primary-foreground rounded-lg p-6 hover:opacity-90 transition"
                >
                  <h3 className="text-lg font-bold mb-1">Add Service</h3>
                  <p className="text-sm opacity-90">Create new service</p>
                </Link>
                <Link
                  href="/provider/bookings"
                  className="bg-background border border-border rounded-lg p-6 hover:border-primary transition"
                >
                  <h3 className="text-lg font-bold text-foreground mb-1">Manage Bookings</h3>
                  <p className="text-sm text-muted-foreground">View all bookings</p>
                </Link>
                <Link
                  href="/provider/services"
                  className="bg-background border border-border rounded-lg p-6 hover:border-primary transition"
                >
                  <h3 className="text-lg font-bold text-foreground mb-1">My Services</h3>
                  <p className="text-sm text-muted-foreground">Edit services</p>
                </Link>
                <Link
                  href="/provider/profile"
                  className="bg-background border border-border rounded-lg p-6 hover:border-primary transition"
                >
                  <h3 className="text-lg font-bold text-foreground mb-1">My Profile</h3>
                  <p className="text-sm text-muted-foreground">Update profile</p>
                </Link>
              </div>

              {/* Pending Booking Requests */}
              {pendingBookings.length > 0 && (
                <div className="bg-background border border-border rounded-lg p-6 mb-12">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
                      <Clock size={20} className="text-orange-500" />
                      Pending Booking Requests
                    </h2>
                    <Link href="/provider/bookings" className="text-primary text-sm font-medium hover:underline">
                      View All
                    </Link>
                  </div>
                  <div className="space-y-3">
                    {pendingBookings.map((booking) => (
                      <div
                        key={booking.id}
                        className="border border-border rounded-lg p-4 flex items-center justify-between"
                      >
                        <div>
                          <h4 className="font-semibold text-foreground">{booking.serviceTitle}</h4>
                          <p className="text-sm text-muted-foreground">{booking.userName}</p>
                          <p className="text-xs text-muted-foreground">{new Date(booking.datetime).toLocaleString()}</p>
                        </div>
                        <Link
                          href={`/provider/bookings/${booking.id}`}
                          className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:opacity-90"
                        >
                          Review
                        </Link>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Upcoming Bookings */}
              <div className="bg-background border border-border rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
                    <CheckCircle size={20} className="text-green-500" />
                    Upcoming Bookings
                  </h2>
                  <Link href="/provider/bookings" className="text-primary text-sm font-medium hover:underline">
                    View All
                  </Link>
                </div>
                <div className="space-y-3">
                  {upcomingBookings.length === 0 ? (
                    <p className="text-muted-foreground">No upcoming bookings</p>
                  ) : (
                    upcomingBookings.map((booking) => (
                      <div
                        key={booking.id}
                        className="border border-border rounded-lg p-4 flex items-center justify-between"
                      >
                        <div>
                          <h4 className="font-semibold text-foreground">{booking.serviceTitle}</h4>
                          <p className="text-sm text-muted-foreground">{booking.userName}</p>
                          <p className="text-xs text-muted-foreground">{new Date(booking.datetime).toLocaleString()}</p>
                        </div>
                        <button className="px-4 py-2 border border-border rounded-lg text-foreground hover:bg-muted transition">
                          Details
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      </main>
      <Footer />
    </ProtectedRoute>
  )
}
