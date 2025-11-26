"use client"

import { MapPin, Navigation } from "lucide-react"
import { cn } from "@/lib/utils"

interface MapProps {
  location: string
  address?: string
  className?: string
  height?: string
  showMarker?: boolean
  interactive?: boolean
}

/**
 * Static map component with styled map-like appearance
 * For production, consider integrating:
 * - Google Maps Static API
 * - Mapbox Static API  
 * - OpenStreetMap with Leaflet
 */
export function Map({ 
  location, 
  address, 
  className, 
  height = "h-64", 
  showMarker = true,
  interactive = false 
}: MapProps) {
  // Generate a deterministic color based on location for visual variety
  const locationHash = location.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)
  const hue = locationHash % 360
  const bgGradient = `linear-gradient(135deg, hsl(${hue}, 45%, 92%) 0%, hsl(${hue + 30}, 50%, 88%) 50%, hsl(${hue + 60}, 45%, 85%) 100%)`

  return (
    <div className={cn("relative w-full overflow-hidden rounded-lg border border-border bg-muted shadow-sm", height, className)}>
      {/* Map-like background with grid pattern */}
      <div 
        className="absolute inset-0"
        style={{ background: bgGradient }}
      >
        {/* Grid pattern overlay */}
        <div 
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: `
              linear-gradient(rgba(0,0,0,0.05) 1px, transparent 1px),
              linear-gradient(90deg, rgba(0,0,0,0.05) 1px, transparent 1px)
            `,
            backgroundSize: '40px 40px'
          }}
        />
        
        {/* Road-like lines */}
        <svg className="absolute inset-0 w-full h-full opacity-10" viewBox="0 0 800 400" preserveAspectRatio="none">
          <path
            d="M 0 200 Q 200 150 400 200 T 800 200"
            stroke="currentColor"
            strokeWidth="3"
            fill="none"
            className="text-foreground"
          />
          <path
            d="M 0 250 Q 300 200 600 250 T 800 250"
            stroke="currentColor"
            strokeWidth="2"
            fill="none"
            className="text-foreground"
          />
          <path
            d="M 100 0 Q 200 100 300 50 T 500 100 T 700 50"
            stroke="currentColor"
            strokeWidth="2"
            fill="none"
            className="text-foreground"
          />
        </svg>

        {/* Building-like shapes */}
        <div className="absolute bottom-0 left-0 right-0 h-1/3 flex items-end justify-around px-8 pb-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div
              key={i}
              className="bg-foreground/10 rounded-t"
              style={{
                width: `${20 + (i % 3) * 15}%`,
                height: `${30 + (i % 4) * 20}%`,
                minHeight: '40px'
              }}
            />
          ))}
        </div>
      </div>

      {/* Location marker */}
      {showMarker && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="relative z-20">
            {/* Pulsing animation */}
            <div className="absolute inset-0 bg-[#3182CE] rounded-full animate-ping opacity-20" style={{ animationDuration: '2s' }}></div>
            <div className="absolute inset-0 bg-[#3182CE] rounded-full animate-ping opacity-10" style={{ animationDuration: '2s', animationDelay: '0.5s' }}></div>
            
            {/* Marker pin */}
            <div className="relative bg-[#3182CE] rounded-full p-3 shadow-xl border-2 border-white">
              <MapPin className="h-5 w-5 text-white" fill="currentColor" />
            </div>
            
            {/* Shadow */}
            <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-8 h-3 bg-black/20 rounded-full blur-sm"></div>
          </div>
        </div>
      )}

      {/* Location info card */}
      <div className="absolute bottom-4 left-4 right-4 pointer-events-none z-10">
        <div className="bg-white/95 backdrop-blur-sm rounded-lg px-4 py-3 shadow-lg border border-border/50 max-w-md">
          <div className="flex items-start gap-3">
            <div className="bg-[#3182CE]/10 rounded-lg p-2 flex-shrink-0">
              <MapPin className="h-4 w-4 text-[#3182CE]" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-foreground truncate">{location}</p>
              {address && (
                <p className="text-xs text-muted-foreground mt-0.5 truncate">{address}</p>
              )}
            </div>
            {interactive && (
              <button 
                className="flex-shrink-0 p-1.5 rounded-md hover:bg-muted transition-colors pointer-events-auto"
                aria-label="Get directions"
                title="Get directions"
              >
                <Navigation className="h-4 w-4 text-muted-foreground" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Map controls overlay (optional) */}
      {interactive && (
        <div className="absolute top-4 right-4 flex flex-col gap-2 pointer-events-auto z-10">
          <button 
            className="bg-white/95 backdrop-blur-sm rounded-lg p-2 shadow-md border border-border/50 hover:bg-white transition-colors"
            aria-label="Zoom in"
            title="Zoom in"
          >
            <span className="text-sm font-semibold text-foreground">+</span>
          </button>
          <button 
            className="bg-white/95 backdrop-blur-sm rounded-lg p-2 shadow-md border border-border/50 hover:bg-white transition-colors"
            aria-label="Zoom out"
            title="Zoom out"
          >
            <span className="text-sm font-semibold text-foreground">−</span>
          </button>
        </div>
      )}
    </div>
  )
}

