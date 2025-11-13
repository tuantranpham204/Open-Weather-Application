"use client"

import { Cloud, Droplets, Wind, Eye, Zap, Gauge } from "lucide-react"

interface CurrentWeatherInfoProps {
  data: {
    temperature: number
    humidity: number
    windspeed: number
    winddirection: number
    cloudCover: number
    visibility: number
    radiation: number
    precipitation: number
  }
}

export default function CurrentWeatherInfo({ data }: CurrentWeatherInfoProps) {
  const getWindDirection = (degrees: number) => {
    const directions = [
      "N",
      "NNE",
      "NE",
      "ENE",
      "E",
      "ESE",
      "SE",
      "SSE",
      "S",
      "SSW",
      "SW",
      "WSW",
      "W",
      "WNW",
      "NW",
      "NNW",
    ]
    return directions[Math.round((degrees % 360) / 22.5) % 16]
  }

  return (
    <div className="bg-gradient-to-br from-slate-800/40 to-slate-900/40 rounded-xl p-6 backdrop-blur border border-slate-700/30">
      <h3 className="text-sm font-semibold text-slate-300 mb-4">CURRENT CONDITIONS</h3>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <div className="flex items-center gap-3 bg-slate-800/30 rounded-lg p-3">
          <Droplets className="w-5 h-5 text-blue-400" />
          <div>
            <p className="text-xs text-slate-400">Precipitation</p>
            <p className="text-sm font-semibold">{data.precipitation.toFixed(1)} mm</p>
          </div>
        </div>

        <div className="flex items-center gap-3 bg-slate-800/30 rounded-lg p-3">
          <Cloud className="w-5 h-5 text-slate-400" />
          <div>
            <p className="text-xs text-slate-400">Cloud Cover</p>
            <p className="text-sm font-semibold">{data.cloudCover}%</p>
          </div>
        </div>

        <div className="flex items-center gap-3 bg-slate-800/30 rounded-lg p-3">
          <Wind className="w-5 h-5 text-cyan-400" />
          <div>
            <p className="text-xs text-slate-400">Wind</p>
            <p className="text-sm font-semibold">{getWindDirection(data.winddirection)}</p>
          </div>
        </div>

        <div className="flex items-center gap-3 bg-slate-800/30 rounded-lg p-3">
          <Eye className="w-5 h-5 text-yellow-400" />
          <div>
            <p className="text-xs text-slate-400">Visibility</p>
            <p className="text-sm font-semibold">{(data.visibility / 1000).toFixed(1)} km</p>
          </div>
        </div>

        <div className="flex items-center gap-3 bg-slate-800/30 rounded-lg p-3">
          <Zap className="w-5 h-5 text-orange-400" />
          <div>
            <p className="text-xs text-slate-400">Radiation</p>
            <p className="text-sm font-semibold">{data.radiation} W/m²</p>
          </div>
        </div>

        <div className="flex items-center gap-3 bg-slate-800/30 rounded-lg p-3">
          <Gauge className="w-5 h-5 text-green-400" />
          <div>
            <p className="text-xs text-slate-400">Humidity</p>
            <p className="text-sm font-semibold">{data.humidity}%</p>
          </div>
        </div>
      </div>
    </div>
  )
}
