"use client"

import { useState } from "react"
import { X, Star, Loader } from "lucide-react"
import { RatingStars } from "./rating-stars"
import { useToastStore } from "@/lib/store"

interface ReviewModalProps {
  isOpen: boolean
  onClose: () => void
  bookingId: number
  serviceTitle: string
  providerName: string
  onSuccess?: () => void
}

export function ReviewModal({
  isOpen,
  onClose,
  bookingId,
  serviceTitle,
  providerName,
  onSuccess,
}: ReviewModalProps) {
  const [rating, setRating] = useState(0)
  const [comment, setComment] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState("")
  const { addToast } = useToastStore()

  if (!isOpen) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (rating === 0) {
      setError("Please select a rating")
      return
    }

    if (comment.trim().length < 5) {
      setError("Please write at least 5 characters in your review")
      return
    }

    setIsSubmitting(true)

    try {
      const token = localStorage.getItem("token")
      const response = await fetch("/api/reviews", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          bookingId,
          rating,
          comment: comment.trim(),
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || "Failed to submit review")
      }

      addToast("Review submitted successfully!", "success")
      setRating(0)
      setComment("")
      onSuccess?.()
      onClose()
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to submit review"
      setError(errorMessage)
      addToast(errorMessage, "error")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleClose = () => {
    if (!isSubmitting) {
      setRating(0)
      setComment("")
      setError("")
      onClose()
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-background rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border sticky top-0 bg-background">
          <h2 className="text-xl font-bold text-foreground">Write a Review</h2>
          <button
            onClick={handleClose}
            disabled={isSubmitting}
            className="text-muted-foreground hover:text-foreground transition disabled:opacity-50"
          >
            <X size={24} />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Service Info */}
          <div>
            <h3 className="font-semibold text-foreground mb-1">{serviceTitle}</h3>
            <p className="text-sm text-muted-foreground">by {providerName}</p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-destructive/10 border border-destructive/30 text-destructive p-4 rounded-lg text-sm">
              {error}
            </div>
          )}

          {/* Rating */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-3">
              Your Rating *
            </label>
            <div className="flex items-center gap-2">
              <RatingStars rating={rating} onRate={setRating} readonly={false} size={32} />
              {rating > 0 && (
                <span className="text-sm text-muted-foreground">
                  {rating === 1 && "Poor"}
                  {rating === 2 && "Fair"}
                  {rating === 3 && "Good"}
                  {rating === 4 && "Very Good"}
                  {rating === 5 && "Excellent"}
                </span>
              )}
            </div>
          </div>

          {/* Comment */}
          <div>
            <label htmlFor="comment" className="block text-sm font-medium text-foreground mb-3">
              Your Review *
            </label>
            <textarea
              id="comment"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Share your experience with this service..."
              rows={6}
              className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-background text-foreground placeholder-muted-foreground transition resize-none"
              disabled={isSubmitting}
              maxLength={500}
            />
            <p className="text-xs text-muted-foreground mt-1">
              {comment.length}/500 characters (minimum 5 characters)
            </p>
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={handleClose}
              disabled={isSubmitting}
              className="flex-1 px-4 py-3 border border-border rounded-lg text-foreground hover:bg-muted transition font-medium disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || rating === 0 || comment.trim().length < 5}
              className="flex-1 px-4 py-3 bg-primary text-primary-foreground rounded-lg hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition font-medium flex items-center justify-center gap-2"
            >
              {isSubmitting && <Loader size={18} className="animate-spin" />}
              {isSubmitting ? "Submitting..." : "Submit Review"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

