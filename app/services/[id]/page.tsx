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
      setLoading(true)
      setError(null)
      
      try {
        if (!params?.id) {
          throw new Error("Service ID is missing")
        }

        const response = await fetch(`/api/services/${params.id}`)
        const data = await response.json()
        
        if (!response.ok) {
          throw new Error(data.error || "Failed to fetch service details")
        }

        // Ensure reviews array exists
        const serviceData = {
          ...data,
          reviews: data.reviews || []
        }
        
        setService(serviceData)
      } catch (err) {
        console.error('Error fetching service:', err)
        setError(err instanceof Error ? err.message : "An unexpected error occurred")
      } finally {
        setLoading(false)
      }
    }

    fetchService()
  }, [params?.id])

  if (loading) {
    return (
      <>
        <NavBar isAuthenticated={isAuthenticated} />
        <div className="min-h-screen">
          <div className="container-max py-16">
            <div className="animate-pulse space-y-6">
              <div className="h-10 bg-gray-200 rounded w-3/4 max-w-md"></div>
              <div className="h-6 bg-gray-200 rounded w-1/2 max-w-xs"></div>
              
              <div className="grid md:grid-cols-2 gap-8 mt-8">
                <div className="space-y-4">
                  <div className="h-64 bg-gray-200 rounded-lg"></div>
                  <div className="h-4 bg-gray-200 rounded w-full"></div>
                  <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                  <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                </div>
                <div className="space-y-4">
                  <div className="h-12 bg-gray-200 rounded w-1/2"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                  <div className="h-12 bg-gray-200 rounded-lg w-full max-w-xs"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <Footer />
      </>
    )
  }

  if (error || !service) {
    return (
      <>
        <NavBar isAuthenticated={isAuthenticated} />
        <div className="min-h-screen flex items-center justify-center">
          <div className="container-max py-16 text-center">
            <div className="max-w-md mx-auto">
              <div className="text-5xl mb-4">⚠️</div>
              <h1 className="text-2xl font-bold text-red-600 mb-4">
                {error?.includes('not found') ? 'Service Not Found' : 'Error Loading Service'}
              </h1>
              <p className="text-gray-600 mb-6">
                {error || 'The service you are looking for could not be found.'}
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  href="/services"
                  className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition"
                >
                  Browse All Services
                </Link>
                <button
                  onClick={() => window.location.reload()}
                  className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
                >
                  Try Again
                </button>
              </div>
            </div>
          </div>
        </div>
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
