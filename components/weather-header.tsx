"use client"

import { MapPin, Cloud } from "lucide-react"
import WeatherMap from "./weather-map"

interface WeatherHeaderProps {
  currentData: {
    temperature: number
    humidity: number
    windspeed: number
    feelsLike: number
    tempMax: number
    tempMin: number
  }
  // Accept either a string name or full location object { lat, lng, name }
  location?: string | { lat: number; lng: number; name?: string }
  onLocationSelect?: (lat: number, lng: number) => void
}

export default function WeatherHeader({ currentData, location = { lat: 10.7769, lng: 106.7009, name: 'Da Nang, Vietnam' }, onLocationSelect }: WeatherHeaderProps) {
  const weatherDescription = currentData.humidity > 70 ? "Humid" : currentData.temperature > 25 ? "Warm" : "Cool"
  const locName = typeof location === "string" ? location : location?.name || "Unknown location"
  const coords = typeof location === "string" ? undefined : location

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Left: Current Weather Info */}
      <div className="lg:col-span-1 bg-gradient-to-br from-slate-800/50 to-slate-900/50 rounded-2xl p-8 backdrop-blur border border-slate-700/50">
        <div className="flex items-start justify-between mb-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <MapPin className="w-4 h-4 text-orange-400" />
              <span className="text-sm text-slate-400">{locName}</span>
            </div>
            <p className="text-xs text-slate-500">
              {new Date().toLocaleDateString("en-US", { weekday: "long", hour: "2-digit", minute: "2-digit" })}
            </p>
          </div>
        </div>

        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <Cloud className="w-16 h-16 text-slate-300" />
            <div className="text-right">
              <div className="text-5xl font-bold text-white">{Math.round(currentData.temperature)}°</div>
              <p className="text-xs text-slate-400 mt-1">{weatherDescription}</p>
            </div>
          </div>
        </div>

        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-slate-400">Feels Like</span>
            <span className="text-slate-100">{Math.round(currentData.feelsLike)}°</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">High / Low</span>
            <span className="text-slate-100">
              {Math.round(currentData.tempMax)}° / {Math.round(currentData.tempMin)}°
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">Humidity</span>
            <span className="text-slate-100">{Math.round(currentData.humidity)}%</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">Wind Speed</span>
            <span className="text-slate-100">{Math.round(currentData.windspeed)} km/h</span>
          </div>
        </div>
      </div>

      {/* Right: Map Placeholder - 2 columns */}
      <div className="lg:col-span-2 bg-gradient-to-br from-slate-800/50 to-slate-900/50 rounded-2xl p-8 backdrop-blur border border-slate-700/50">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Weather Map</h3>
          <div className="flex gap-2">
            <button className="px-3 py-1 bg-slate-700/50 hover:bg-slate-600/50 rounded text-xs transition-colors">
              +
            </button>
            <button className="px-3 py-1 bg-slate-700/50 hover:bg-slate-600/50 rounded text-xs transition-colors">
              −
            </button>
            <button className="px-3 py-1 bg-orange-600/20 hover:bg-orange-500/30 rounded text-xs text-orange-300 transition-colors">
              Details
            </button>
          </div>
        </div>

        {/* Map Container */}
        <div className="w-full h-64 bg-gradient-to-br from-slate-700/30 to-slate-800/30 rounded-xl border border-slate-600/30 flex items-center justify-center">
          <div className="text-center">
            {coords ? (
              <WeatherMap lat={coords.lat} lng={coords.lng} onSelect={onLocationSelect} />
            ) : (
              <>
                <Cloud className="w-12 h-12 text-slate-500 mx-auto mb-2" />
                <p className="text-slate-400 text-sm">Weather Map Integration</p>
                <p className="text-slate-500 text-xs mt-1">Mapbox/Leaflet integration area</p>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
