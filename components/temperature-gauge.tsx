"use client"

interface TemperatureGaugeProps {
  current: number
  max: number
  min: number
}

export default function TemperatureGauge({ current, max, min }: TemperatureGaugeProps) {
  const percentage = ((current - min) / (max - min)) * 100

  return (
    <div className="space-y-4">
      <div className="text-center">
        <div className="text-4xl font-bold text-orange-400">{current}°</div>
        <p className="text-xs text-slate-500 mt-1">Current</p>
      </div>

      {/* Gauge */}
      <div className="space-y-2">
        <div className="w-full bg-gradient-to-r from-blue-500 via-orange-400 to-red-500 rounded-full h-3 overflow-hidden">
          <div className="bg-white rounded-full w-1 h-3 mx-auto" style={{ marginLeft: `${percentage}%` }} />
        </div>

        <div className="flex justify-between text-xs text-slate-400">
          <span>{min}°</span>
          <span>{max}°</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 text-xs">
        <div className="bg-slate-700/20 rounded p-2">
          <p className="text-slate-500">High</p>
          <p className="font-semibold">{max}°</p>
        </div>
        <div className="bg-slate-700/20 rounded p-2">
          <p className="text-slate-500">Low</p>
          <p className="font-semibold">{min}°</p>
        </div>
      </div>
    </div>
  )
}
