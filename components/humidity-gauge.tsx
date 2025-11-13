"use client"

interface HumidityGaugeProps {
  humidity: number
}

export default function HumidityGauge({ humidity }: HumidityGaugeProps) {
  return (
    <div className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-6">
      <p className="text-slate-400 text-sm mb-4">Humidity</p>

      <div className="space-y-4">
        <div className="text-3xl font-bold text-slate-100">{humidity}%</div>

        {/* Humidity bar */}
        <div className="w-full bg-slate-700/30 rounded-full h-2 overflow-hidden border border-slate-600/30">
          <div
            className="bg-gradient-to-r from-blue-400 to-blue-500 h-full rounded-full transition-all"
            style={{ width: `${humidity}%` }}
          />
        </div>

        {/* Comfort indicator */}
        <div className="text-xs text-slate-400">
          {humidity < 30 && <p>Dry conditions</p>}
          {humidity >= 30 && humidity < 60 && <p>Comfortable</p>}
          {humidity >= 60 && <p>Humid</p>}
        </div>
      </div>
    </div>
  )
}
