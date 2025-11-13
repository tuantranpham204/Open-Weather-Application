"use client"

import { Cloud, CloudRain } from "lucide-react"

export default function TenDayForecast() {
  const forecast = Array.from({ length: 10 }, (_, i) => {
    const date = new Date(Date.now() + i * 86400000)
    return {
      day: i === 0 ? "Today" : date.toLocaleDateString("en-US", { weekday: "short" }),
      icon: Math.random() > 0.5 ? "cloudy" : "rain",
      description: Math.random() > 0.5 ? "Mostly Cloudy" : "Light Rain",
      rain: Math.floor(Math.random() * 60) + 10,
      high: Math.floor(Math.random() * 8 + 22),
      low: Math.floor(Math.random() * 5 + 15),
      wind: Math.floor(Math.random() * 20 + 5),
    }
  })

  const getWeatherIcon = (type: string) => {
    return type === "rain" ? (
      <CloudRain className="w-5 h-5 text-blue-400" />
    ) : (
      <Cloud className="w-5 h-5 text-slate-400" />
    )
  }

  return (
    <div className="bg-gradient-to-br from-slate-800/40 to-slate-900/40 backdrop-blur border border-slate-700/30 rounded-2xl p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold">10-Day Forecast</h3>
        <div className="flex gap-2">
          <button className="px-3 py-1 text-xs bg-slate-700/30 hover:bg-slate-700/50 rounded transition-colors">
            Details
          </button>
          <button className="px-3 py-1 text-xs bg-slate-700/30 hover:bg-slate-700/50 rounded transition-colors">
            Chart
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <div className="flex gap-4 pb-2">
          {forecast.map((day, idx) => (
            <div
              key={idx}
              className="flex-shrink-0 w-32 bg-slate-700/20 rounded-lg p-4 border border-slate-600/20 hover:border-slate-600/50 transition-colors"
            >
              <p className="text-xs font-semibold text-slate-300 mb-2">{day.day}</p>
              <div className="flex justify-center mb-2">{getWeatherIcon(day.icon)}</div>
              <p className="text-xs text-slate-400 text-center mb-2">{day.description}</p>
              <div className="space-y-1 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-500">High</span>
                  <span className="text-slate-100">{day.high}°</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Low</span>
                  <span className="text-slate-100">{day.low}°</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Rain</span>
                  <span className="text-slate-100">{day.rain}%</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
