"use client"

import { useState, useEffect } from "react"
import { NavBar } from "@/components/nav-bar"
import { Footer } from "@/components/footer"
import { ProtectedRoute } from "@/components/protected-route"
import { useAuthStore } from "@/lib/store"
import { useToastStore } from "@/lib/store"
import { FormInput } from "@/components/form-input"
import { User, Mail, MapPin, Phone, Loader } from "lucide-react"

export default function ProfilePage() {
  const { user, setUser } = useAuthStore()
  const { addToast } = useToastStore()
  const [formData, setFormData] = useState({
    name: user?.name || "",
    email: user?.email || "",
    phone: user?.phone || "",
    bio: "",
  })
  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    if (user) {
      fetchProfile()
    }
  }, [user])

  const fetchProfile = async () => {
    setIsLoading(true)
    try {
      const token = localStorage.getItem("token")
      const response = await fetch("/api/user/profile", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        setFormData({
          name: data.profile.name || "",
          email: data.profile.email || "",
          phone: data.profile.phone || "",
          bio: data.profile.bio || "",
        })
      }
    } catch (err) {
      console.error("Failed to fetch profile:", err)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsSaving(true)

    try {
      const token = localStorage.getItem("token")
      const response = await fetch("/api/user/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: formData.name,
          phone: formData.phone,
          bio: formData.bio,
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || "Failed to update profile")
      }

      const data = await response.json()
      
      // Update auth store with new user data
      if (setUser && user) {
        setUser({
          ...user,
          name: data.profile.name,
          phone: data.profile.phone,
        })
      }

      addToast("Profile updated successfully!", "success")
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to update profile"
      setError(errorMessage)
      addToast(errorMessage, "error")
    } finally {
      setIsSaving(false)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  if (!user) return null

  if (isLoading) {
    return (
      <ProtectedRoute>
        <NavBar isAuthenticated={true} userRole={user.role} />
        <main className="min-h-screen">
          <div className="container-max py-12">
            <div className="text-center">
              <p className="text-muted-foreground">Loading profile...</p>
            </div>
          </div>
        </main>
        <Footer />
      </ProtectedRoute>
    )
  }

  return (
    <ProtectedRoute>
      <NavBar isAuthenticated={true} userRole={user.role} />
      <main className="min-h-screen">
        <div className="container-max py-12">
          <h1 className="text-3xl font-bold text-foreground mb-8">My Profile</h1>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Sidebar */}
            <div className="md:col-span-1">
              <div className="bg-background border border-border rounded-lg p-6 text-center">
                <div className="w-24 h-24 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                  <User size={48} className="text-muted-foreground" />
                </div>
                <h2 className="text-xl font-bold text-foreground">{formData.name || user.name}</h2>
                <p className="text-muted-foreground text-sm capitalize">{user.role}</p>
                <button className="mt-4 w-full px-4 py-2 border border-border rounded-lg text-foreground hover:bg-muted transition">
                  Change Photo
                </button>
              </div>
            </div>

            {/* Form */}
            <div className="md:col-span-2">
              <div className="bg-background border border-border rounded-lg p-8">
                <form onSubmit={handleSubmit} className="space-y-6">
                  {error && (
                    <div className="bg-destructive/10 border border-destructive/30 text-destructive p-4 rounded-lg text-sm">
                      {error}
                    </div>
                  )}

                  <div className="grid md:grid-cols-2 gap-6">
                    <FormInput
                      label="Full Name"
                      value={formData.name}
                      onChange={(e) => handleInputChange("name", e.target.value)}
                      icon={<User size={18} />}
                      required
                    />
                    <FormInput
                      label="Email Address"
                      type="email"
                      value={formData.email}
                      icon={<Mail size={18} />}
                      disabled
                      className="opacity-60 cursor-not-allowed"
                    />
                  </div>

                  <FormInput
                    label="Phone Number"
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => handleInputChange("phone", e.target.value)}
                    icon={<Phone size={18} />}
                  />

                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">About</label>
                    <textarea
                      value={formData.bio}
                      onChange={(e) => handleInputChange("bio", e.target.value)}
                      className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-background text-foreground placeholder-muted-foreground transition resize-none"
                      rows={4}
                      placeholder="Tell us about yourself..."
                      maxLength={500}
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      {formData.bio.length}/500 characters
                    </p>
                  </div>

                  <div className="flex gap-4">
                    <button
                      type="submit"
                      disabled={isSaving}
                      className="flex-1 px-4 py-3 bg-primary text-primary-foreground rounded-lg font-semibold hover:opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      {isSaving && <Loader size={18} className="animate-spin" />}
                      {isSaving ? "Saving..." : "Save Changes"}
                    </button>
                    <button
                      type="button"
                      onClick={() => fetchProfile()}
                      disabled={isSaving}
                      className="flex-1 px-4 py-3 border border-border text-foreground rounded-lg font-semibold hover:bg-muted transition disabled:opacity-50"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </ProtectedRoute>
  )
}
