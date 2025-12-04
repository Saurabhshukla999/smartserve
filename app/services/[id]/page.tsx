"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { NavBar } from "@/components/nav-bar"
import { Footer } from "@/components/footer"
import { RatingStars } from "@/components/rating-stars"
import { BookingModal } from "@/components/booking-modal"
import { MapContainer } from "@/components/map-container"
import { MapPin, Clock, User, Share2 } from "lucide-react"
import Link from "next/link"
import { useAuthStore } from "@/lib/store"

interface Review {
  id: number
  rating: number
  comment: string
  userName: string
  createdAt: string
}

interface ServiceDetails {
  id: number
  title: string
  description: string
  category: string
  city: string
  price: number
  locationLat: number
  locationLng: number
  images?: string[]
  providerId: number
  providerName: string
  avgRating: number
  reviewCount: number
  reviews: Review[]
}

export default function ServiceDetailsPage() {
  const params = useParams()
  const [bookingOpen, setBookingOpen] = useState(false)
  const [service, setService] = useState<ServiceDetails | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { isAuthenticated } = useAuthStore()

  useEffect(() => {
    const fetchService = async () => {
      try {
        const response = await fetch(`/api/services/${params.id}`)
        if (!response.ok) {
          throw new Error("Service not found")
        }
        const data = await response.json()
        setService(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load service")
      } finally {
        setLoading(false)
      }
    }

    if (params.id) {
      fetchService()
    }
  }, [params.id])

  if (loading) {
    return (
      <>
        <NavBar isAuthenticated={isAuthenticated} />
        <main className="min-h-screen">
          <div className="container-max py-12">
            <div className="text-center">
              <p className="text-muted-foreground">Loading service details...</p>
            </div>
          </div>
        </main>
        <Footer />
      </>
    )
  }

  if (error || !service) {
    return (
      <>
        <NavBar isAuthenticated={isAuthenticated} />
        <main className="min-h-screen">
          <div className="container-max py-12">
            <div className="text-center">
              <p className="text-muted-foreground">{error || "Service not found"}</p>
            </div>
          </div>
        </main>
        <Footer />
      </>
    )
  }

  return (
    <>
      <NavBar isAuthenticated={isAuthenticated} />
      <main className="min-h-screen">
        <div className="container-max py-12">
          <div className="grid md:grid-cols-3 gap-12">
            {/* Main Content */}
            <div className="md:col-span-2 space-y-8">
              {/* Image */}
              <div className="bg-muted rounded-lg h-96 flex items-center justify-center text-muted-foreground">
                <div className="text-center">
                  <div className="text-lg font-medium">{service.category}</div>
                  <div className="text-sm mt-2">Service Image</div>
                </div>
              </div>

              {/* Header Info */}
              <div>
                <h1 className="text-4xl font-bold text-foreground mb-2">{service.title}</h1>
                <div className="flex items-center gap-4 mb-4">
                  <div className="flex items-center">
                    <RatingStars rating={Number(service.avgRating)} readonly />
                    <span className="ml-2 font-semibold text-foreground">{Number(service.avgRating).toFixed(1)}</span>
                    <span className="text-muted-foreground ml-2">({service.reviewCount} reviews)</span>
                  </div>
                </div>

                {/* Quick Info */}
                <div className="flex flex-wrap gap-6 py-4 border-y border-border">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Clock size={18} />
                    <span>Contact for details</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <MapPin size={18} />
                    <span>{service.city}</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <User size={18} />
                    <span>{service.providerName}</span>
                  </div>
                </div>
              </div>

              {/* Description */}
              <div>
                <h2 className="text-2xl font-bold text-foreground mb-4">About This Service</h2>
                <p className="text-muted-foreground text-lg leading-relaxed">{service.description}</p>
              </div>

              {/* Provider Info */}
              <div className="bg-muted p-6 rounded-lg border border-border">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <Link
                      href={`/providers/${service.providerId}`}
                      className="text-xl font-bold text-foreground hover:text-primary transition"
                    >
                      {service.providerName}
                    </Link>
                    <p className="text-muted-foreground">Trusted provider</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <Link
                    href={`/providers/${service.providerId}`}
                    className="flex-1 px-4 py-2 border border-primary text-primary rounded-lg hover:bg-primary hover:text-primary-foreground transition text-center"
                  >
                    View Profile
                  </Link>
                  <button className="flex-1 px-4 py-2 border border-border text-foreground rounded-lg hover:bg-muted transition">
                    <Share2 size={18} className="inline mr-2" />
                    Share
                  </button>
                </div>
              </div>

              {/* Map */}
              {service.locationLat && service.locationLng && (
                <div>
                  <h2 className="text-2xl font-bold text-foreground mb-4">Service Location</h2>
                  <MapContainer
                    location={service.city}
                    latitude={service.locationLat}
                    longitude={service.locationLng}
                  />
                </div>
              )}

              {/* Reviews */}
              <div>
                <h2 className="text-2xl font-bold text-foreground mb-4">Reviews</h2>
                <div className="space-y-4">
                  {service.reviews && service.reviews.length > 0 ? (
                    service.reviews.map((review) => (
                      <div key={review.id} className="border border-border rounded-lg p-4">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <h4 className="font-semibold text-foreground">{review.userName}</h4>
                            <p className="text-sm text-muted-foreground">
                              {new Date(review.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                          <RatingStars rating={review.rating} readonly size={14} />
                        </div>
                        <p className="text-muted-foreground">{review.comment}</p>
                      </div>
                    ))
                  ) : (
                    <p className="text-muted-foreground text-center py-4">No reviews yet. Be the first to review!</p>
                  )}
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div>
              <div className="border border-border rounded-lg p-6 sticky top-20">
                <div className="bg-muted p-6 rounded-lg mb-4">
                  <p className="text-sm text-muted-foreground mb-2">Price per session</p>
                  <p className="text-4xl font-bold text-primary mb-4">${Number(service.price).toFixed(2)}</p>
                </div>
                <button
                  onClick={() => setBookingOpen(true)}
                  className="w-full px-4 py-3 bg-primary text-primary-foreground rounded-lg font-semibold hover:opacity-90 transition mb-3"
                >
                  Book Now
                </button>
                <button className="w-full px-4 py-3 border border-border text-foreground rounded-lg font-medium hover:bg-muted transition">
                  Inquiry
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
      <BookingModal
        isOpen={bookingOpen}
        onClose={() => setBookingOpen(false)}
        serviceTitle={service.title}
        serviceId={service.id}
        price={Number(service.price)}
        provider={service.providerName}
      />
      <Footer />
    </>
  )
}
