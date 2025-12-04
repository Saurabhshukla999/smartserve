"use client"

import { NavBar } from "@/components/nav-bar"
import { Footer } from "@/components/footer"
import { ProtectedRoute } from "@/components/protected-route"
import { useAuthStore } from "@/lib/store"
import { Calendar, DollarSign, Clock, CheckCircle, ArrowRight } from "lucide-react"
import Link from "next/link"
import { useEffect, useState } from "react"

interface DashboardStats {
  totalBookings: number
  upcomingBookingsCount: number
  completedBookingsCount: number
  totalSpent: number
}

interface Booking {
  id: number
  serviceTitle: string
  userName: string
  datetime: string
  status: "pending" | "confirmed" | "cancelled" | "completed"
  price: number
}

export default function CustomerDashboard() {
  const { user } = useAuthStore()
  const [stats, setStats] = useState<DashboardStats>({
    totalBookings: 0,
    upcomingBookingsCount: 0,
    completedBookingsCount: 0,
    totalSpent: 0,
  })
  const [upcomingBookings, setUpcomingBookings] = useState<Booking[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (user) {
      fetchDashboardData()
    }
  }, [user])

  const fetchDashboardData = async () => {
    try {
      const response = await fetch(`/api/bookings?userId=${user?.id}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        const bookings = data.data || []

        // Filter bookings
        const now = new Date()
        const upcoming = bookings.filter(
          (b: Booking) =>
            new Date(b.datetime) > now && (b.status === "confirmed" || b.status === "pending")
        )
        const completed = bookings.filter((b: Booking) => b.status === "completed")

        setUpcomingBookings(upcoming.slice(0, 5))

        // Calculate stats
        setStats({
          totalBookings: bookings.length,
          upcomingBookingsCount: upcoming.length,
          completedBookingsCount: completed.length,
          totalSpent: completed.reduce((sum: number, b: Booking) => sum + (b.price || 0), 0),
        })
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
      change: `${stats.completedBookingsCount} completed`,
    },
    {
      icon: Clock,
      label: "Upcoming",
      value: stats.upcomingBookingsCount,
      change: "Scheduled services",
    },
    {
      icon: DollarSign,
      label: "Total Spent",
      value: `$${stats.totalSpent.toFixed(2)}`,
      change: "On completed services",
    },
    {
      icon: CheckCircle,
      label: "Completed",
      value: stats.completedBookingsCount,
      change: "Finished bookings",
    },
  ]

  if (!user) return null

  return (
    <ProtectedRoute requiredRole="user">
      <NavBar isAuthenticated={true} userRole="user" />
      <main className="min-h-screen">
        <div className="container-max py-12">
          <h1 className="text-3xl font-bold text-foreground mb-2">Dashboard</h1>
          <p className="text-muted-foreground mb-8">Welcome back, {user.name}!</p>

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
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
                <Link
                  href="/services"
                  className="bg-primary text-primary-foreground rounded-lg p-6 hover:opacity-90 transition"
                >
                  <h3 className="text-lg font-bold mb-1">Browse Services</h3>
                  <p className="text-sm opacity-90">Find trusted providers</p>
                </Link>
                <Link
                  href="/bookings"
                  className="bg-background border border-border rounded-lg p-6 hover:border-primary transition"
                >
                  <h3 className="text-lg font-bold text-foreground mb-1">My Bookings</h3>
                  <p className="text-sm text-muted-foreground">View all bookings</p>
                </Link>
                <Link
                  href="/profile"
                  className="bg-background border border-border rounded-lg p-6 hover:border-primary transition"
                >
                  <h3 className="text-lg font-bold text-foreground mb-1">My Profile</h3>
                  <p className="text-sm text-muted-foreground">Update profile</p>
                </Link>
              </div>

              {/* Upcoming Bookings */}
              {upcomingBookings.length > 0 && (
                <div className="bg-background border border-border rounded-lg p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
                      <Clock size={20} className="text-primary" />
                      Upcoming Bookings
                    </h2>
                    <Link
                      href="/bookings"
                      className="text-primary text-sm font-medium hover:underline flex items-center gap-1"
                    >
                      View All
                      <ArrowRight size={16} />
                    </Link>
                  </div>
                  <div className="space-y-3">
                    {upcomingBookings.map((booking) => (
                      <Link
                        key={booking.id}
                        href={`/bookings/${booking.id}`}
                        className="block border border-border rounded-lg p-4 hover:bg-muted transition"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h4 className="font-semibold text-foreground">{booking.serviceTitle}</h4>
                            <p className="text-sm text-muted-foreground mt-1">
                              {new Date(booking.datetime).toLocaleDateString()} at{" "}
                              {new Date(booking.datetime).toLocaleTimeString([], {
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </p>
                            <p className="text-sm font-medium text-foreground mt-2">
                              ${Number(booking.price).toFixed(2)}
                            </p>
                          </div>
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-semibold ${
                              booking.status === "confirmed"
                                ? "bg-primary/10 text-primary"
                                : "bg-orange-500/10 text-orange-500"
                            }`}
                          >
                            {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                          </span>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {upcomingBookings.length === 0 && !isLoading && (
                <div className="bg-background border border-border rounded-lg p-12 text-center">
                  <Calendar size={48} className="mx-auto mb-4 text-muted-foreground opacity-50" />
                  <h3 className="text-xl font-bold text-foreground mb-2">No Upcoming Bookings</h3>
                  <p className="text-muted-foreground mb-6">
                    Start exploring services and book your first appointment!
                  </p>
                  <Link
                    href="/services"
                    className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg font-semibold hover:opacity-90 transition"
                  >
                    Browse Services
                    <ArrowRight size={18} />
                  </Link>
                </div>
              )}
            </>
          )}
        </div>
      </main>
      <Footer />
    </ProtectedRoute>
  )
}

