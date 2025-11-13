"use client"

import { Eye } from "lucide-react"

interface VisibilityGaugeProps {
  visibility: number
}

export default function VisibilityGauge({ visibility }: VisibilityGaugeProps) {
  const visibilityKm = visibility / 1000
  const percentage = Math.min(100, (visibilityKm / 10) * 100)

  const getVisibilityCondition = (km: number) => {
    if (km < 1) return "Very Poor"
    if (km < 5) return "Poor"
    if (km < 10) return "Moderate"
    return "Excellent"
  }

  return (
    <div className="space-y-4">
      <div className="text-center">
        <div className="flex items-center justify-center gap-2 mb-2">
          <Eye className="w-5 h-5 text-blue-400" />
          <div className="text-3xl font-bold">{visibilityKm.toFixed(1)}</div>
        </div>
        <p className="text-xs text-slate-500">km</p>
      </div>

      {/* Gauge */}
      <div className="space-y-2">
        <div className="w-full bg-slate-700/30 rounded-full h-3 overflow-hidden">
          <div
            className="bg-gradient-to-r from-orange-400 to-blue-400 h-full rounded-full transition-all"
            style={{ width: `${percentage}%` }}
          />
        </div>

        <p className="text-xs text-slate-400 text-center">{getVisibilityCondition(visibilityKm)}</p>
      </div>
    </div>
  )
}
