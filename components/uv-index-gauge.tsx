"use client"

interface UVIndexGaugeProps {
  value: number
}

export default function UVIndexGauge({ value }: UVIndexGaugeProps) {
  const uvIndex = Math.min(11, Math.max(0, value))

  const getUVLevel = (index: number) => {
    if (index < 3) return { label: "Low", color: "bg-green-500" }
    if (index < 6) return { label: "Moderate", color: "bg-yellow-500" }
    if (index < 8) return { label: "High", color: "bg-orange-500" }
    if (index < 11) return { label: "Very High", color: "bg-red-500" }
    return { label: "Extreme", color: "bg-purple-600" }
  }

  const level = getUVLevel(uvIndex)

  return (
    <div className="space-y-4">
      <div className="text-center">
        <div className="text-4xl font-bold text-slate-100">{uvIndex.toFixed(1)}</div>
        <p className={`text-xs font-semibold mt-1 ${level.color.replace("bg-", "text-")}`}>{level.label}</p>
      </div>

      {/* UV Bar */}
      <div className="w-full bg-gradient-to-r from-green-500 via-yellow-500 via-orange-500 via-red-500 to-purple-600 rounded-full h-3">
        <div className="bg-white rounded-full w-1 h-3 mx-auto" style={{ marginLeft: `${(uvIndex / 11) * 100}%` }} />
      </div>

      <p className="text-xs text-slate-400 text-center">Wear protection if prolonged outdoor exposure</p>
    </div>
  )
}
