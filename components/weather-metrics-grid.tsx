"use client"

import { Sun } from "lucide-react"
import SunriseSunset from "./sunrise-sunset"
import TemperatureGauge from "./temperature-gauge"
import HumidityGauge from "./humidity-gauge"
import UVIndexGauge from "./uv-index-gauge"
import PressureGauge from "./pressure-gauge"
import VisibilityGauge from "./visibility-gauge"

interface WeatherMetricsGridProps {
  data: {
    temperature: number
    humidity: number
    windspeed: number
    winddirection: number
    pressure: number
    radiation: number
    cloudCover: number
    visibility: number
    tempMax: number
    tempMin: number
  }
  weatherData: {
    temperature: number[]
  }
  selectedHour: number
}

export default function WeatherMetricsGrid({ data, weatherData, selectedHour }: WeatherMetricsGridProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {/* Sunrise/Sunset */}
      <div className="bg-gradient-to-br from-slate-800/40 to-slate-900/40 backdrop-blur border border-slate-700/30 rounded-2xl p-6">
        <h3 className="text-sm font-semibold text-slate-400 mb-4 flex items-center gap-2">
          <Sun className="w-4 h-4" />
          Sun Position
        </h3>
        <SunriseSunset />
      </div>

      {/* Temperature Gauge */}
      <div className="bg-gradient-to-br from-slate-800/40 to-slate-900/40 backdrop-blur border border-slate-700/30 rounded-2xl p-6">
        <h3 className="text-sm font-semibold text-slate-400 mb-4">Temperature</h3>
        <TemperatureGauge current={data.temperature} max={data.tempMax} min={data.tempMin} />
      </div>

      {/* Humidity Gauge */}
      <div className="bg-gradient-to-br from-slate-800/40 to-slate-900/40 backdrop-blur border border-slate-700/30 rounded-2xl p-6">
        <h3 className="text-sm font-semibold text-slate-400 mb-4">Humidity</h3>
        <HumidityGauge humidity={data.humidity} />
      </div>

      {/* UV Index */}
      <div className="bg-gradient-to-br from-slate-800/40 to-slate-900/40 backdrop-blur border border-slate-700/30 rounded-2xl p-6">
        <h3 className="text-sm font-semibold text-slate-400 mb-4">UV Index</h3>
        <UVIndexGauge value={data.radiation / 100} />
      </div>

      {/* Pressure */}
      <div className="bg-gradient-to-br from-slate-800/40 to-slate-900/40 backdrop-blur border border-slate-700/30 rounded-2xl p-6">
        <h3 className="text-sm font-semibold text-slate-400 mb-4">Pressure</h3>
        <PressureGauge pressure={data.pressure} />
      </div>

      {/* Visibility */}
      <div className="bg-gradient-to-br from-slate-800/40 to-slate-900/40 backdrop-blur border border-slate-700/30 rounded-2xl p-6">
        <h3 className="text-sm font-semibold text-slate-400 mb-4">Visibility</h3>
        <VisibilityGauge visibility={data.visibility} />
      </div>
    </div>
  )
}
