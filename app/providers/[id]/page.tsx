"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { NavBar } from "@/components/nav-bar"
import { Footer } from "@/components/footer"
import { RatingStars } from "@/components/rating-stars"
import { ServiceCard } from "@/components/service-card"
import { MapPin, Clock, User, Star, Briefcase } from "lucide-react"
import { useAuthStore } from "@/lib/store"
import Link from "next/link"

interface Service {
  id: number
  title: string
  description: string
  category: string
  city: string
  price: number
  avgRating: number
  reviewCount: number
  images?: string[]
}

interface Review {
  id: number
  rating: number
  comment: string
  userName: string
  serviceTitle: string
  createdAt: string
}

interface ProviderProfile {
  provider: {
    id: number
    name: string
    bio: string | null
    specialties: string | null
    yearsExperience: number | null
    phone: string | null
  }
  services: Service[]
  overallRating: number
  totalReviews: number
  recentReviews: Review[]
}

export default function ProviderPublicProfilePage() {
  const params = useParams()
  const [profile, setProfile] = useState<ProviderProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { isAuthenticated } = useAuthStore()

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await fetch(`/api/providers/${params.id}`)
        if (!response.ok) {
          throw new Error("Provider not found")
        }
        const data = await response.json()
        setProfile(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load provider profile")
      } finally {
        setLoading(false)
      }
    }

    if (params.id) {
      fetchProfile()
    }
  }, [params.id])

  if (loading) {
    return (
      <>
        <NavBar isAuthenticated={isAuthenticated} />
        <main className="min-h-screen">
          <div className="container-max py-12">
            <div className="text-center">
              <p className="text-muted-foreground">Loading provider profile...</p>
            </div>
          </div>
        </main>
        <Footer />
      </>
    )
  }

  if (error || !profile) {
    return (
      <>
        <NavBar isAuthenticated={isAuthenticated} />
        <main className="min-h-screen">
          <div className="container-max py-12">
            <div className="text-center">
              <p className="text-muted-foreground">{error || "Provider not found"}</p>
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
          {/* Provider Header */}
          <div className="bg-background border border-border rounded-lg p-8 mb-8">
            <div className="flex flex-col md:flex-row gap-8">
              {/* Avatar */}
              <div className="shrink-0">
                <div className="w-24 h-24 bg-primary rounded-full flex items-center justify-center text-primary-foreground text-3xl font-bold">
                  {profile.provider.name.charAt(0).toUpperCase()}
                </div>
              </div>

              {/* Info */}
              <div className="flex-1">
                <h1 className="text-4xl font-bold text-foreground mb-2">{profile.provider.name}</h1>
                
                <div className="flex items-center gap-6 mb-4">
                  <div className="flex items-center gap-2">
                    <RatingStars rating={profile.overallRating} readonly size={20} />
                    <span className="font-semibold text-foreground">
                      {profile.overallRating.toFixed(1)}
                    </span>
                    <span className="text-muted-foreground">
                      ({profile.totalReviews} {profile.totalReviews === 1 ? "review" : "reviews"})
                    </span>
                  </div>
                </div>

                {profile.provider.specialties && (
                  <div className="flex items-center gap-2 mb-2">
                    <Briefcase size={18} className="text-muted-foreground" />
                    <span className="text-muted-foreground">{profile.provider.specialties}</span>
                  </div>
                )}

                {profile.provider.yearsExperience && (
                  <div className="flex items-center gap-2 mb-4">
                    <Clock size={18} className="text-muted-foreground" />
                    <span className="text-muted-foreground">
                      {profile.provider.yearsExperience} years of experience
                    </span>
                  </div>
                )}

                {profile.provider.bio && (
                  <p className="text-muted-foreground leading-relaxed">{profile.provider.bio}</p>
                )}
              </div>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="md:col-span-2 space-y-8">
              {/* Services */}
              <div>
                <h2 className="text-2xl font-bold text-foreground mb-6">
                  Services ({profile.services.length})
                </h2>
                {profile.services.length > 0 ? (
                  <div className="grid md:grid-cols-2 gap-6">
                    {profile.services.map((service) => (
                      <ServiceCard
                        key={service.id}
                        id={service.id.toString()}
                        title={service.title}
                        provider={profile.provider.name}
                        rating={Number(service.avgRating) || 0}
                        reviews={Number(service.reviewCount) || 0}
                        price={Number(service.price)}
                        location={service.city}
                        category={service.category}
                        duration="Contact for details"
                      />
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground">No services available yet.</p>
                )}
              </div>

              {/* Recent Reviews */}
              {profile.recentReviews.length > 0 && (
                <div>
                  <h2 className="text-2xl font-bold text-foreground mb-6">Recent Reviews</h2>
                  <div className="space-y-4">
                    {profile.recentReviews.map((review) => (
                      <div key={review.id} className="border border-border rounded-lg p-4">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <h4 className="font-semibold text-foreground">{review.userName}</h4>
                            <p className="text-sm text-muted-foreground">{review.serviceTitle}</p>
                            <p className="text-xs text-muted-foreground">
                              {new Date(review.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                          <RatingStars rating={review.rating} readonly size={14} />
                        </div>
                        <p className="text-muted-foreground">{review.comment}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Stats */}
              <div className="bg-background border border-border rounded-lg p-6">
                <h3 className="text-lg font-bold text-foreground mb-4">Provider Stats</h3>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Services</p>
                    <p className="text-2xl font-bold text-foreground">{profile.services.length}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Overall Rating</p>
                    <div className="flex items-center gap-2">
                      <Star size={20} className="text-warning fill-warning" />
                      <p className="text-2xl font-bold text-foreground">
                        {profile.overallRating.toFixed(1)}
                      </p>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Total Reviews</p>
                    <p className="text-2xl font-bold text-foreground">{profile.totalReviews}</p>
                  </div>
                </div>
              </div>

              {/* Contact */}
              {profile.provider.phone && (
                <div className="bg-background border border-border rounded-lg p-6">
                  <h3 className="text-lg font-bold text-foreground mb-4">Contact</h3>
                  <p className="text-muted-foreground">{profile.provider.phone}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}

