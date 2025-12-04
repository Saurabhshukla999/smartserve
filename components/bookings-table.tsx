import { Calendar, Clock, User, MapPin, Eye, Star } from "lucide-react"
import Link from "next/link"

interface Booking {
  id: string
  service: string
  provider: string
  date: string
  time: string
  location: string
  status: "upcoming" | "completed" | "cancelled"
  price: number
  canReview?: boolean
  providerName?: string
  serviceTitle?: string
}

interface BookingsTableProps {
  bookings: Booking[]
  onReviewClick?: (bookingId: string) => void
}

const statusStyles = {
  upcoming: "bg-primary/10 text-primary",
  completed: "bg-success/10 text-success",
  cancelled: "bg-danger/10 text-danger",
}

export function BookingsTable({ bookings, onReviewClick }: BookingsTableProps) {
  return (
    <div className="border border-border rounded-lg overflow-hidden">
      {/* Desktop Table */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full">
          <thead className="bg-muted border-b border-border">
            <tr>
              <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">Service</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">Provider</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">Date & Time</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">Location</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">Price</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">Status</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">Action</th>
            </tr>
          </thead>
          <tbody>
            {bookings.map((booking) => (
              <tr key={booking.id} className="border-b border-border hover:bg-muted transition">
                <td className="px-6 py-4 text-sm text-foreground font-medium">{booking.service}</td>
                <td className="px-6 py-4 text-sm text-muted-foreground flex items-center gap-2">
                  <User size={14} />
                  {booking.provider}
                </td>
                <td className="px-6 py-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <Calendar size={14} />
                    <span>{booking.date}</span>
                    <Clock size={14} className="ml-2" />
                    <span>{booking.time}</span>
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-muted-foreground flex items-center gap-2">
                  <MapPin size={14} />
                  {booking.location}
                </td>
                <td className="px-6 py-4 text-sm font-semibold text-foreground">${booking.price}</td>
                <td className="px-6 py-4">
                  <span
                    className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${statusStyles[booking.status]}`}
                  >
                    {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <Link
                      href={`/bookings/${booking.id}`}
                      className="flex items-center gap-2 text-primary hover:text-primary/80 transition"
                    >
                      <Eye size={16} />
                      View
                    </Link>
                    {booking.canReview && onReviewClick && (
                      <button
                        onClick={() => onReviewClick(booking.id)}
                        className="flex items-center gap-2 text-warning hover:text-warning/80 transition"
                      >
                        <Star size={16} />
                        Review
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Cards */}
      <div className="md:hidden space-y-4 p-4">
        {bookings.map((booking) => (
          <div key={booking.id} className="border border-border rounded-lg p-4 space-y-3">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-semibold text-foreground">{booking.service}</h3>
                <p className="text-sm text-muted-foreground flex items-center gap-2 mt-1">
                  <User size={14} />
                  {booking.provider}
                </p>
              </div>
              <span
                className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${statusStyles[booking.status]}`}
              >
                {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
              </span>
            </div>
            <div className="space-y-1 text-sm text-muted-foreground">
              <p className="flex items-center gap-2">
                <Calendar size={14} />
                {booking.date} at {booking.time}
              </p>
              <p className="flex items-center gap-2">
                <MapPin size={14} />
                {booking.location}
              </p>
            </div>
            <div className="flex justify-between items-center pt-3 border-t border-border">
              <span className="font-semibold text-foreground">${booking.price}</span>
              <div className="flex items-center gap-3">
                {booking.canReview && onReviewClick && (
                  <button
                    onClick={() => onReviewClick(booking.id)}
                    className="flex items-center gap-2 text-warning hover:text-warning/80 transition text-sm"
                  >
                    <Star size={16} />
                    Review
                  </button>
                )}
                <Link href={`/bookings/${booking.id}`} className="text-primary hover:text-primary/80 transition text-sm">
                  View Details
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
