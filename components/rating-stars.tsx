"use client"

import { Star } from "lucide-react"

interface RatingStarsProps {
  rating: number
  onRate?: (rating: number) => void
  readonly?: boolean
  size?: number
}

export function RatingStars({ rating, onRate, readonly = true, size = 16 }: RatingStarsProps) {
  return (
    <div className="flex items-center gap-1">
      {Array.from({ length: 5 }).map((_, i) => {
        const fillPercentage = Math.min(Math.max(rating - i, 0), 1)
        return (
          <button
            key={i}
            onClick={() => !readonly && onRate?.(i + 1)}
            className={`transition ${readonly ? "cursor-default" : "cursor-pointer hover:scale-110"}`}
            disabled={readonly}
          >
            <Star
              size={size}
              className={`${
                fillPercentage === 1
                  ? "fill-warning text-warning"
                  : fillPercentage > 0
                    ? "fill-warning text-warning opacity-50"
                    : "text-muted-foreground"
              }`}
            />
          </button>
        )
      })}
    </div>
  )
}
