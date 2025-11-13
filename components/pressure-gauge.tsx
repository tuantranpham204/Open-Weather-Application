"use client"

interface PressureGaugeProps {
  pressure: number
}

export default function PressureGauge({ pressure }: PressureGaugeProps) {
  const percentage = Math.min(100, Math.max(0, ((pressure - 950) / 70) * 100))

  return (
    <div className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-6">
      <p className="text-slate-400 text-sm mb-4">Pressure (hPa)</p>

      <div className="space-y-4">
        <div className="text-3xl font-bold text-slate-100">{pressure.toFixed(0)}</div>

        {/* Gauge bar */}
        <div className="w-full bg-slate-700/30 rounded-full h-2 overflow-hidden border border-slate-600/30">
          <div
            className="bg-gradient-to-r from-orange-400 to-orange-500 h-full rounded-full transition-all"
            style={{ width: `${percentage}%` }}
          />
        </div>

        {/* Labels */}
        <div className="flex justify-between text-xs text-slate-400">
          <span>Low</span>
          <span>Normal</span>
          <span>High</span>
        </div>
      </div>
    </div>
  )
}
