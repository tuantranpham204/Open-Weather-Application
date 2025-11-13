"use client"

import { useEffect, useRef, useState } from "react"
import "leaflet/dist/leaflet.css"

interface WeatherMapProps {
  lat: number
  lng: number
  zoom?: number
  onSelect?: (lat: number, lng: number) => void
}

export default function WeatherMap({ lat, lng, zoom = 10, onSelect }: WeatherMapProps) {
  const mapRef = useRef<HTMLDivElement | null>(null)
  const leafletMapRef = useRef<any | null>(null)
  const markerRef = useRef<any | null>(null)
  const [L, setL] = useState<any>(null)

  useEffect(() => {
    // Dynamically import leaflet only on client side
    import("leaflet").then((module) => {
      setL(module.default)
    }).catch((err) => {
      console.error("Failed to load Leaflet:", err)
    })
  }, [])

  useEffect(() => {
    if (!mapRef.current || !L) return

    // Initialize map once
    if (!leafletMapRef.current) {
      const map = L.map(mapRef.current, { zoomControl: true })
      leafletMapRef.current = map

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      }).addTo(map)

      // click handler
      map.on("click", (e: any) => {
        const { lat: clickedLat, lng: clickedLng } = e.latlng
        if (markerRef.current) markerRef.current.setLatLng([clickedLat, clickedLng])
        else markerRef.current = L.marker([clickedLat, clickedLng]).addTo(map)
        onSelect?.(clickedLat, clickedLng)
      })
    }

    // center map and update marker when props change
    const map = leafletMapRef.current
    if (map) {
      map.setView([lat, lng], zoom)
      if (markerRef.current) markerRef.current.setLatLng([lat, lng])
      else markerRef.current = L.marker([lat, lng]).addTo(map)
    }

    return () => {
      // do not remove map on unmount to preserve state across re-renders
    }
  }, [lat, lng, zoom, onSelect, L])

  return <div ref={mapRef} className="w-full h-64 rounded-xl" />
}
