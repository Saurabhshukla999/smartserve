import { MapPin } from "lucide-react"

interface MapContainerProps {
  location: string
  latitude?: number | string | null
  longitude?: number | string | null
}

export function MapContainer({ location, latitude, longitude }: MapContainerProps) {
  const latNum =
    typeof latitude === "number"
      ? latitude
      : typeof latitude === "string"
        ? Number.parseFloat(latitude)
        : undefined

  const lngNum =
    typeof longitude === "number"
      ? longitude
      : typeof longitude === "string"
        ? Number.parseFloat(longitude)
        : undefined

  const hasCoords = Number.isFinite(latNum) && Number.isFinite(lngNum)

  return (
    <div className="w-full rounded-lg overflow-hidden border border-border">
      <div className="w-full h-80 bg-muted flex items-center justify-center">
        <div className="text-center text-muted-foreground">
          <MapPin size={48} className="mx-auto mb-4 opacity-50" />
          <p className="font-medium mb-2">Map Placeholder</p>
          <p className="text-sm">{location}</p>
          {hasCoords && latNum !== undefined && lngNum !== undefined && (
            <p className="text-xs mt-2 opacity-70">
              {latNum.toFixed(4)}, {lngNum.toFixed(4)}
            </p>
          )}
          <p className="text-xs mt-4 opacity-50">
            {hasCoords && latNum !== undefined && lngNum !== undefined ? (
              <a
                href={`https://maps.google.com/maps?q=${latNum},${lngNum}`}
                target="_blank"
                rel="noopener noreferrer"
                className="underline text-primary hover:no-underline"
              >
                Open in Google Maps
              </a>
            ) : (
              <span>Location coordinates not available</span>
            )}
          </p>
        </div>
      </div>
    </div>
  )
}
