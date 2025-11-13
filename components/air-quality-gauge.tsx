"use client"

import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts"

export default function AirQualityGauge() {
  const aqi = 59
  const data = [{ value: aqi }, { value: 100 - aqi }]

  const getAQILevel = (index: number) => {
    if (index <= 50) return { label: "Good", color: "#10b981", bg: "bg-green-500" }
    if (index <= 100) return { label: "Moderate", color: "#f59e0b", bg: "bg-yellow-500" }
    if (index <= 150) return { label: "Unhealthy for Sensitive Groups", color: "#f97316", bg: "bg-orange-500" }
    if (index <= 200) return { label: "Unhealthy", color: "#ef4444", bg: "bg-red-500" }
    if (index <= 300) return { label: "Very Unhealthy", color: "#8b5cf6", bg: "bg-purple-500" }
    return { label: "Hazardous", color: "#991b1b", bg: "bg-red-900" }
  }

  const level = getAQILevel(aqi)

  return (
    <div className="bg-gradient-to-br from-slate-800/40 to-slate-900/40 backdrop-blur border border-slate-700/30 rounded-2xl p-6">
      <h3 className="text-lg font-semibold mb-6">Air Quality (AQI)</h3>

      <div className="flex flex-col items-center">
        <div className="w-40 h-40 mb-6">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                startAngle={180}
                endAngle={0}
                dataKey="value"
              >
                <Cell fill={level.color} />
                <Cell fill="rgba(100, 116, 139, 0.2)" />
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="text-center">
          <div className="text-4xl font-bold text-slate-100 mb-1">{aqi}</div>
          <p className={`text-sm font-semibold ${level.bg.replace("bg-", "text-")}`}>{level.label}</p>
          <p className="text-xs text-slate-400 mt-2">Air quality is acceptable</p>
        </div>
      </div>
    </div>
  )
}
