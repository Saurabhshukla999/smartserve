import { Star, MapPin, Clock } from "lucide-react"
import Image from "next/image"
import Link from "next/link"

interface ServiceCardProps {
  id: string
  title: string
  provider: string
  rating: number
  reviews: number
  image?: string
  price: number
  location: string
  duration: string
  category: string
}

export function ServiceCard({
  id,
  title,
  provider,
  rating,
  reviews,
  image,
  price,
  location,
  duration,
  category,
}: ServiceCardProps) {
  return (
    <Link href={`/services/${id}`}>
      <div className="bg-background border border-border rounded-lg overflow-hidden hover:shadow-lg transition cursor-pointer">
        {/* Image */}
        <div className="relative w-full h-48 bg-muted">
          {image ? (
            <Image src={image || "/placeholder.svg"} alt={title} fill className="object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-muted-foreground">{category}</div>
          )}
        </div>

        {/* Content */}
        <div className="p-4">
          <h3 className="font-semibold text-foreground mb-1 line-clamp-2">{title}</h3>
          <p className="text-sm text-muted-foreground mb-3">{provider}</p>

          {/* Rating */}
          <div className="flex items-center gap-2 mb-3">
            <div className="flex items-center">
              <Star size={16} className="fill-warning text-warning" />
              <span className="ml-1 font-semibold text-foreground text-sm">{rating}</span>
              <span className="text-muted-foreground text-sm ml-1">({reviews})</span>
            </div>
          </div>

          {/* Details */}
          <div className="space-y-2 mb-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <MapPin size={14} />
              <span>{location}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock size={14} />
              <span>{duration}</span>
            </div>
          </div>

          {/* Price */}
          <div className="flex items-center justify-between">
            <span className="text-lg font-bold text-primary">${price}</span>
            <button className="px-3 py-1 bg-primary text-primary-foreground rounded-lg text-sm hover:opacity-90 transition">
              Book
            </button>
          </div>
        </div>
      </div>
    </Link>
  )
}
