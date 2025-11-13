"use client"

import type React from "react"

import { useState } from "react"
import { Search, Settings2 } from "lucide-react"

interface SearchBannerProps {
  onLocationChange?: (location: { lat: number; lng: number }) => void
}

export default function SearchBanner({ onLocationChange }: SearchBannerProps) {
  const [searchInput, setSearchInput] = useState("")
  const [searching, setSearching] = useState(false)

  const handleSearch = async () => {
    if (!searchInput.trim()) return

    try {
      setSearching(true)
      const response = await fetch(
        `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(searchInput)}&count=1&language=en&format=json`,
      )

      if (!response.ok) throw new Error("Failed to search location")

      const data = await response.json()

      if (data.results && data.results.length > 0) {
        const { latitude, longitude } = data.results[0]
        console.log("[v0] Location found:", latitude, longitude)
        onLocationChange?.({ lat: latitude, lng: longitude })
        setSearchInput("")
      } else {
        alert("Location not found. Please try another search.")
      }
    } catch (error) {
      console.error("[v0] Search error:", error)
      alert("Failed to search location. Please try again.")
    } finally {
      setSearching(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch()
    }
  }

  return (
    <div className="bg-gradient-to-r from-slate-800/40 to-slate-900/40 backdrop-blur border border-slate-700/30 rounded-2xl p-6">
      <div className="flex items-center gap-4">
        <div className="flex-1">
          <div className="flex gap-2">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                type="text"
                placeholder="Search location..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                onKeyPress={handleKeyPress}
                className="w-full bg-slate-700/30 border border-slate-600/30 rounded-lg pl-10 pr-4 py-2 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-orange-500/50"
              />
            </div>
            <button
              onClick={handleSearch}
              disabled={searching}
              className="px-4 py-2 bg-orange-600 hover:bg-orange-700 disabled:bg-orange-600/50 rounded-lg text-sm font-medium transition-colors"
            >
              {searching ? "..." : "Search"}
            </button>
          </div>
        </div>

        {/* Filter Buttons */}
        <div className="flex gap-2">
          <button className="px-3 py-2 bg-slate-700/30 hover:bg-slate-700/50 rounded text-xs transition-colors">
            <Settings2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Ad Space */}
      <div className="mt-4 bg-gradient-to-r from-slate-700/20 to-slate-800/20 rounded-lg p-4 border border-slate-600/20">
        <p className="text-xs text-slate-500 text-center">Advertisement Space</p>
      </div>
    </div>
  )
}
