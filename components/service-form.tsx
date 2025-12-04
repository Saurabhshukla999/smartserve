"use client"

import type React from "react"
import { useState } from "react"
import { FormInput } from "@/components/form-input"
import { useToastStore } from "@/lib/store"
import { useAuthStore } from "@/lib/store"
import { useRouter } from "next/navigation"

interface ServiceFormProps {
  serviceId?: number
  initialData?: any
  onSuccess?: () => void
}

export function ServiceForm({ serviceId, initialData, onSuccess }: ServiceFormProps) {
  const router = useRouter()
  const { addToast } = useToastStore()
  const { isAuthenticated } = useAuthStore()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [images, setImages] = useState<File[]>([])
  const [previewUrls, setPreviewUrls] = useState<string[]>(initialData?.images || [])

  const [formData, setFormData] = useState({
    title: initialData?.title || "",
    category: initialData?.category || "plumbing",
    price: initialData?.price || "",
    description: initialData?.description || "",
    city: initialData?.city || "",
    locationLat: initialData?.locationLat || "",
    locationLng: initialData?.locationLng || "",
  })

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    setImages((prev) => [...prev, ...files])

    // Create preview URLs
    files.forEach((file) => {
      const reader = new FileReader()
      reader.onloadend = () => {
        setPreviewUrls((prev) => [...prev, reader.result as string])
      }
      reader.readAsDataURL(file)
    })
  }

  const removeImage = (index: number) => {
    setPreviewUrls((prev) => prev.filter((_, i) => i !== index))
    setImages((prev) => prev.filter((_, i) => i !== index))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    try {
      // Check authentication
      if (!isAuthenticated) {
        router.push("/login")
        addToast("Please login to create a service", "error")
        return
      }

      // Get token from localStorage
      const token = localStorage.getItem("authToken") || localStorage.getItem("token")
      if (!token) {
        router.push("/login")
        addToast("Authentication required. Please login again.", "error")
        return
      }

      const data = new FormData()
      Object.entries(formData).forEach(([key, value]) => {
        data.append(key, String(value))
      })

      // Add images
      images.forEach((image) => {
        data.append("images", image)
      })

      const url = serviceId ? `/api/services/${serviceId}` : "/api/services"
      const method = serviceId ? "PUT" : "POST"

      const response = await fetch(url, {
        method,
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: data,
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        const errorMessage = errorData.error || `Failed to save service (${response.status})`
        throw new Error(errorMessage)
      }

      addToast(serviceId ? "Service updated successfully!" : "Service created successfully!", "success")
      onSuccess?.()
      router.push("/provider/services")
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to save service"
      setError(errorMessage)
      addToast(errorMessage, "error")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="bg-destructive/10 border border-destructive/30 text-destructive p-4 rounded-lg text-sm">
          {error}
        </div>
      )}

      <FormInput
        label="Service Title"
        value={formData.title}
        onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
        placeholder="e.g., Professional Plumbing Repair"
        required
      />

      <div>
        <label className="block text-sm font-medium text-foreground mb-2">Category</label>
        <select
          value={formData.category}
          onChange={(e) => setFormData((prev) => ({ ...prev, category: e.target.value }))}
          className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-background text-foreground"
          required
        >
          <option value="plumbing">Plumbing</option>
          <option value="electrical">Electrical</option>
          <option value="cleaning">Cleaning</option>
          <option value="gardening">Gardening</option>
          <option value="tutoring">Tutoring</option>
          <option value="other">Other</option>
        </select>
      </div>

      <FormInput
        label="Price per Session"
        type="number"
        value={formData.price}
        onChange={(e) => setFormData((prev) => ({ ...prev, price: e.target.value }))}
        placeholder="0.00"
        step="0.01"
        required
      />

      <div>
        <label className="block text-sm font-medium text-foreground mb-2">Description</label>
        <textarea
          value={formData.description}
          onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
          className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-background text-foreground placeholder-muted-foreground transition"
          rows={6}
          placeholder="Describe your service in detail..."
          required
        />
      </div>

      <FormInput
        label="City/Location"
        value={formData.city}
        onChange={(e) => setFormData((prev) => ({ ...prev, city: e.target.value }))}
        placeholder="e.g., New York, NY"
        required
      />

      <div className="grid md:grid-cols-2 gap-6">
        <FormInput
          label="Latitude (Optional)"
          type="number"
          value={formData.locationLat}
          onChange={(e) => setFormData((prev) => ({ ...prev, locationLat: e.target.value }))}
          placeholder="40.7128"
          step="0.0001"
        />
        <FormInput
          label="Longitude (Optional)"
          type="number"
          value={formData.locationLng}
          onChange={(e) => setFormData((prev) => ({ ...prev, locationLng: e.target.value }))}
          placeholder="-74.0060"
          step="0.0001"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-foreground mb-2">Service Images</label>
        <input
          type="file"
          multiple
          onChange={handleImageChange}
          accept="image/*"
          className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-background text-foreground transition"
        />
        <p className="text-xs text-muted-foreground mt-1">Upload high-quality images of your work</p>
      </div>

      {previewUrls.length > 0 && (
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">Image Preview</label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {previewUrls.map((url, index) => (
              <div key={index} className="relative">
                <img
                  src={url || "/placeholder.svg"}
                  alt={`Preview ${index}`}
                  className="w-full h-24 object-cover rounded-lg"
                />
                <button
                  type="button"
                  onClick={() => removeImage(index)}
                  className="absolute top-1 right-1 bg-destructive text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:opacity-80"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="flex gap-4">
        <button
          type="submit"
          disabled={isLoading}
          className="flex-1 px-4 py-3 bg-primary text-primary-foreground rounded-lg font-semibold hover:opacity-90 transition disabled:opacity-50"
        >
          {isLoading ? "Saving..." : serviceId ? "Update Service" : "Create Service"}
        </button>
        <button
          type="button"
          onClick={() => router.back()}
          className="flex-1 px-4 py-3 border border-border text-foreground rounded-lg font-semibold hover:bg-muted transition"
        >
          Cancel
        </button>
      </div>
    </form>
  )
}
