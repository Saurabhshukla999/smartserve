import { MapPin } from "lucide-react"

interface MapContainerProps {
  location: string
  latitude?: number
  longitude?: number
}

export function MapContainer({ location, latitude, longitude }: MapContainerProps) {
  return (
    <div className="w-full rounded-lg overflow-hidden border border-border">
      <div className="w-full h-80 bg-muted flex items-center justify-center">
        <div className="text-center text-muted-foreground">
          <MapPin size={48} className="mx-auto mb-4 opacity-50" />
          <p className="font-medium mb-2">Map Placeholder</p>
          <p className="text-sm">{location}</p>
          {latitude && longitude && (
            <p className="text-xs mt-2 opacity-70">
              {latitude.toFixed(4)}, {longitude.toFixed(4)}
            </p>
          )}
          <p className="text-xs mt-4 opacity-50">
            <a
              href={`https://maps.google.com/maps?q=${latitude},${longitude}`}
              target="_blank"
              rel="noopener noreferrer"
              className="underline text-primary hover:no-underline"
            >
              Open in Google Maps
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}
