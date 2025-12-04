"use client"

import { useState, useEffect } from "react"
import { NavBar } from "@/components/nav-bar"
import { Footer } from "@/components/footer"
import { ServiceCard } from "@/components/service-card"
import { FormInput } from "@/components/form-input"
import { Search, Filter } from "lucide-react"
import { useAuthStore } from "@/lib/store"

interface Service {
  id: number
  title: string
  description: string
  category: string
  city: string
  price: number
  avgRating: number
  reviewCount: number
  providerId: number
  images?: string[]
}

export default function ServicesPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [services, setServices] = useState<Service[]>([])
  const [filteredServices, setFilteredServices] = useState<Service[]>([])
  const [loading, setLoading] = useState(true)
  const { isAuthenticated } = useAuthStore()

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const response = await fetch("/api/services")
        const data = await response.json()
        setServices(data.data || [])
        setFilteredServices(data.data || [])
      } catch (error) {
        console.error("Error fetching services:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchServices()
  }, [])

  const handleSearch = (value: string) => {
    setSearchQuery(value)
    const filtered = services.filter(
      (service) =>
        service.title.toLowerCase().includes(value.toLowerCase()) ||
        service.city.toLowerCase().includes(value.toLowerCase()) ||
        service.category.toLowerCase().includes(value.toLowerCase()),
    )
    setFilteredServices(filtered)
  }

  if (loading) {
    return (
      <>
        <NavBar isAuthenticated={isAuthenticated} />
        <main className="min-h-screen">
          <div className="container-max py-12">
            <div className="text-center">
              <p className="text-muted-foreground">Loading services...</p>
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
          {/* Header */}
          <div className="mb-12">
            <h1 className="text-4xl font-bold text-foreground mb-2">Browse Services</h1>
            <p className="text-lg text-muted-foreground">Find services from trusted providers in your network</p>
          </div>

          {/* Search & Filter */}
          <div className="flex flex-col md:flex-row gap-4 mb-8">
            <div className="flex-1">
              <FormInput
                placeholder="Search services, providers..."
                icon={<Search size={18} />}
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
              />
            </div>
            <button className="px-4 py-2 border border-border rounded-lg flex items-center justify-center gap-2 hover:bg-muted transition">
              <Filter size={18} />
              <span>Filter</span>
            </button>
          </div>

          {/* Results Info */}
          <p className="text-sm text-muted-foreground mb-6">
            Showing {filteredServices.length} service{filteredServices.length !== 1 ? "s" : ""}
          </p>

          {/* Services Grid */}
          {filteredServices.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredServices.map((service) => (
                <ServiceCard 
                  key={service.id} 
                  id={service.id.toString()}
                  title={service.title}
                  provider="Service Provider"
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
            <div className="text-center py-12">
              <p className="text-muted-foreground text-lg">
                {services.length === 0 
                  ? "No services available yet. Be the first provider to create one!" 
                  : "No services found"}
              </p>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  )
}
