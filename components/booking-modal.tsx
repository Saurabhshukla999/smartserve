"use client"

import { useState } from "react"
import { X, Calendar, Clock, Users, Loader } from "lucide-react"
import { DatePicker } from "./date-picker"
import { useToastStore } from "@/lib/store"
import { useAuthStore } from "@/lib/store"
import { useRouter } from "next/navigation"

interface BookingModalProps {
  isOpen: boolean
  onClose: () => void
  serviceTitle: string
  serviceId: number
  price: number
  provider: string
}

export function BookingModal({
  isOpen,
  onClose,
  serviceTitle,
  serviceId,
  price,
  provider,
}: BookingModalProps) {
  const [date, setDate] = useState<Date | undefined>()
  const [time, setTime] = useState<string>("")
  const [quantity, setQuantity] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState("")
  const { addToast } = useToastStore()
  const { isAuthenticated } = useAuthStore()
  const router = useRouter()

  if (!isOpen) return null

  const handleBooking = async () => {
    if (!date || !time) return

    setError("")
    setIsSubmitting(true)

    try {
      // Combine date and time into datetime string
      const selectedDate = new Date(date)
      const [hours, minutes] = time.split(":").map(Number)
      selectedDate.setHours(hours, minutes, 0, 0)

      // Check if date is in the past
      if (selectedDate < new Date()) {
        throw new Error("Cannot book a service in the past")
      }

      // Check authentication
      if (!isAuthenticated) {
        router.push("/login")
        addToast("Please login to book a service", "error")
        return
      }

      const token = localStorage.getItem("authToken") || localStorage.getItem("token")
      if (!token) {
        router.push("/login")
        return
      }

      const response = await fetch("/api/bookings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          serviceId,
          datetime: selectedDate.toISOString(),
          quantity,
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        
        if (response.status === 409) {
          // Slot unavailable
          throw new Error(data.error || "This time slot is not available. Please choose another time.")
        }
        
        if (response.status === 401) {
          router.push("/login")
          return
        }

        throw new Error(data.error || "Failed to create booking")
      }

      const booking = await response.json()
      
      addToast("Booking created successfully! Waiting for provider confirmation.", "success")
      
      // Reset form
      setDate(undefined)
      setTime("")
      setQuantity(1)
      setError("")
      
      // Close modal first
      onClose()
      
      // Redirect to bookings page after a short delay
      setTimeout(() => {
        router.push("/bookings")
      }, 1000)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to create booking"
      setError(errorMessage)
      addToast(errorMessage, "error")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-background rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border sticky top-0 bg-background">
          <h2 className="text-xl font-bold text-foreground">Book Service</h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition">
            <X size={24} />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6">
          {/* Service Summary */}
          <div>
            <h3 className="font-semibold text-foreground mb-2">{serviceTitle}</h3>
            <p className="text-sm text-muted-foreground mb-3">by {provider}</p>
            <div className="bg-muted p-4 rounded-lg">
              <p className="text-sm text-muted-foreground">Price per session</p>
              <p className="text-2xl font-bold text-primary">${price}</p>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-destructive/10 border border-destructive/30 text-destructive p-4 rounded-lg text-sm">
              {error}
            </div>
          )}

          {/* Date Picker */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-3">
              <Calendar size={16} className="inline mr-2" />
              Select Date
            </label>
            <DatePicker date={date} setDate={setDate} />
          </div>

          {/* Time */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-3">
              <Clock size={16} className="inline mr-2" />
              Select Time
            </label>
            <select
              value={time}
              onChange={(e) => setTime(e.target.value)}
              className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-background text-foreground"
            >
              <option value="">Choose a time</option>
              <option value="09:00">9:00 AM</option>
              <option value="10:00">10:00 AM</option>
              <option value="11:00">11:00 AM</option>
              <option value="14:00">2:00 PM</option>
              <option value="15:00">3:00 PM</option>
              <option value="16:00">4:00 PM</option>
            </select>
          </div>

          {/* Quantity */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-3">
              <Users size={16} className="inline mr-2" />
              Quantity
            </label>
            <div className="flex items-center gap-4">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="px-4 py-2 border border-border rounded-lg hover:bg-muted transition"
              >
                -
              </button>
              <span className="text-lg font-semibold text-foreground">{quantity}</span>
              <button
                onClick={() => setQuantity(quantity + 1)}
                className="px-4 py-2 border border-border rounded-lg hover:bg-muted transition"
              >
                +
              </button>
            </div>
          </div>

          {/* Total */}
          <div className="bg-muted p-4 rounded-lg">
            <div className="flex justify-between items-center mb-2">
              <span className="text-muted-foreground">
                Subtotal ({quantity} session{quantity !== 1 ? "s" : ""})
              </span>
              <span className="font-semibold text-foreground">${price * quantity}</span>
            </div>
            <div className="flex justify-between items-center pt-2 border-t border-border">
              <span className="font-semibold text-foreground">Total</span>
              <span className="text-xl font-bold text-primary">${price * quantity}</span>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-3 border border-border rounded-lg text-foreground hover:bg-muted transition font-medium"
            >
              Cancel
            </button>
            <button
              onClick={handleBooking}
              disabled={!date || !time || isSubmitting}
              className="flex-1 px-4 py-3 bg-primary text-primary-foreground rounded-lg hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition font-medium flex items-center justify-center gap-2"
            >
              {isSubmitting && <Loader size={18} className="animate-spin" />}
              {isSubmitting ? "Booking..." : "Confirm Booking"}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
