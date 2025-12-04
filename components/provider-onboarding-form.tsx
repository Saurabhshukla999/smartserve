"use client"

import type React from "react"
import { useState } from "react"
import { FormInput } from "@/components/form-input"
import { useToastStore } from "@/lib/store"

interface ProviderOnboardingFormProps {
  onSuccess?: (data: any) => void
  initialData?: any
}

export function ProviderOnboardingForm({ onSuccess, initialData }: ProviderOnboardingFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    bio: initialData?.bio || "",
    specialties: initialData?.specialties || "",
    yearsExperience: initialData?.yearsExperience || "",
    idProofUrl: initialData?.idProofUrl || "",
    bankAccount: initialData?.bankAccount || "",
    bankRoutingNumber: initialData?.bankRoutingNumber || "",
  })
  const [idFile, setIdFile] = useState<File | null>(null)
  const { addToast } = useToastStore()

  const handleInputChange = (field: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setIdFile(file)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      // Create FormData for file upload
      const data = new FormData()
      data.append("bio", formData.bio)
      data.append("specialties", formData.specialties)
      data.append("yearsExperience", formData.yearsExperience)
      data.append("bankAccount", formData.bankAccount)
      data.append("bankRoutingNumber", formData.bankRoutingNumber)

      if (idFile) {
        data.append("idProof", idFile)
      }

      const response = await fetch("/api/provider/profile", {
        method: "PUT",
        body: data,
      })

      if (!response.ok) {
        throw new Error("Failed to save profile")
      }

      const result = await response.json()
      addToast("Profile updated successfully!", "success")
      onSuccess?.(result)
    } catch (error) {
      addToast(error instanceof Error ? error.message : "Failed to save profile", "error")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-foreground mb-2">Professional Bio</label>
        <textarea
          value={formData.bio}
          onChange={(e) => handleInputChange("bio", e.target.value)}
          className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-background text-foreground placeholder-muted-foreground transition"
          rows={4}
          placeholder="Tell clients about your experience and expertise..."
          required
        />
      </div>

      <FormInput
        label="Specialties"
        value={formData.specialties}
        onChange={(e) => handleInputChange("specialties", e.target.value)}
        placeholder="e.g., Emergency repairs, Drain cleaning, Pipe installation"
        required
      />

      <FormInput
        label="Years of Experience"
        type="number"
        value={formData.yearsExperience}
        onChange={(e) => handleInputChange("yearsExperience", e.target.value)}
        placeholder="0"
        required
      />

      <div>
        <label className="block text-sm font-medium text-foreground mb-2">Government ID Upload</label>
        <input
          type="file"
          onChange={handleFileChange}
          accept="image/*,.pdf"
          className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-background text-foreground transition"
          required={!initialData?.idProofUrl}
        />
        <p className="text-xs text-muted-foreground mt-1">Upload your government-issued ID for verification</p>
      </div>

      <div className="border-t border-border pt-6">
        <h3 className="text-lg font-semibold text-foreground mb-4">Banking Information</h3>

        <FormInput
          label="Bank Account Number"
          value={formData.bankAccount}
          onChange={(e) => handleInputChange("bankAccount", e.target.value)}
          placeholder="•••••••••••••••••"
          required
        />

        <FormInput
          label="Routing Number"
          value={formData.bankRoutingNumber}
          onChange={(e) => handleInputChange("bankRoutingNumber", e.target.value)}
          placeholder="000000000"
          required
        />
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="w-full px-4 py-3 bg-primary text-primary-foreground rounded-lg font-semibold hover:opacity-90 transition disabled:opacity-50"
      >
        {isLoading ? "Saving..." : "Save Profile"}
      </button>
    </form>
  )
}
